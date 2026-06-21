import fs from 'fs';
import pdf from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Profile from '../models/Profile.js';
import Job from '../models/Job.js';
import MockInterview from '../models/MockInterview.js';

// Helper: Rule-based local resume analyzer (fallback/offline)
const localAnalyzeResume = (text) => {
  const lowercaseText = text.toLowerCase();
  let score = 50;
  const suggestions = [];
  const matchedRoles = [];

  // 1. Check sections
  const sections = {
    education: ['education', 'degree', 'university', 'college', 'school', 'cgpa'],
    experience: ['experience', 'work history', 'internship', 'intern', 'employment'],
    projects: ['projects', 'academic projects', 'personal projects'],
    skills: ['skills', 'technical skills', 'programming languages', 'expertise'],
  };

  let sectionCount = 0;
  for (const [key, keywords] of Object.entries(sections)) {
    const hasSection = keywords.some((kw) => lowercaseText.includes(kw));
    if (hasSection) {
      sectionCount += 1;
      score += 5;
    } else {
      suggestions.push(`Add a distinct '${key.toUpperCase()}' section to format your resume professionally.`);
    }
  }

  // 2. Check tech stack keywords
  const techKeywords = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    react: 'React.js',
    node: 'Node.js',
    express: 'Express',
    mongodb: 'MongoDB',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    docker: 'Docker',
    kubernetes: 'Kubernetes',
    aws: 'AWS (Amazon Web Services)',
    git: 'Git/GitHub',
    sql: 'SQL/Databases',
    html: 'HTML5',
    css: 'CSS3/Sass',
  };

  const foundTech = [];
  for (const [key, name] of Object.entries(techKeywords)) {
    if (lowercaseText.includes(key)) {
      foundTech.push(name);
    }
  }

  score += Math.min(foundTech.length * 3, 25); // max 25 points from skills

  if (foundTech.length < 4) {
    suggestions.push('Add more technical skills to make your profile search-friendly (aim for at least 6+ core skills).');
  }

  // 3. Length checks
  if (text.length < 500) {
    score -= 10;
    suggestions.push('Your resume content seems very short. Expand on your project details and responsibilities.');
  } else if (text.length > 4000) {
    suggestions.push('Your resume is quite long. Try to condense it to 1-2 pages of clear, impactful points.');
  }

  // 4. Check for metrics/actions
  const actionVerbs = ['designed', 'implemented', 'developed', 'achieved', 'optimized', 'managed', 'led', 'increased', 'reduced'];
  const hasActionVerbs = actionVerbs.some((verb) => lowercaseText.includes(verb));
  if (!hasActionVerbs) {
    suggestions.push("Use action verbs (e.g., 'Optimized', 'Developed', 'Spearheaded') to start your bullet points.");
  } else {
    score += 5;
  }

  // 5. Check for metrics (numbers/percentages)
  const hasMetrics = /[\d]+%|[\d]+\+/.test(text);
  if (!hasMetrics) {
    suggestions.push('Quantify your achievements (e.g., "Improved performance by 25%", "Managed a team of 4") where possible.');
  } else {
    score += 5;
  }

  // Cap score
  score = Math.min(Math.max(score, 20), 98);

  // 6. Map to roles
  const backendSkills = ['node', 'express', 'mongodb', 'sql', 'python', 'java', 'cpp'];
  const frontendSkills = ['react', 'html', 'css', 'javascript', 'typescript'];
  const devopsSkills = ['docker', 'kubernetes', 'aws', 'git'];

  const hasBackend = backendSkills.filter((sk) => lowercaseText.includes(sk)).length >= 2;
  const hasFrontend = frontendSkills.filter((sk) => lowercaseText.includes(sk)).length >= 2;
  const hasDevops = devopsSkills.filter((sk) => lowercaseText.includes(sk)).length >= 2;

  if (hasFrontend && hasBackend) {
    matchedRoles.push('Full-Stack Developer');
  }
  if (hasFrontend) {
    matchedRoles.push('Frontend Engineer');
  }
  if (hasBackend) {
    matchedRoles.push('Backend Engineer');
  }
  if (hasDevops) {
    matchedRoles.push('DevOps Engineer');
  }
  if (lowercaseText.includes('python') && (lowercaseText.includes('data') || lowercaseText.includes('machine learning') || lowercaseText.includes('ai'))) {
    matchedRoles.push('Data Scientist / AI Engineer');
  }

  if (matchedRoles.length === 0) {
    matchedRoles.push('Software Engineer Trainee', 'Associate IT Consultant');
  }

  return {
    score,
    suggestions: suggestions.slice(0, 5),
    matchedRoles,
  };
};

// @desc    Upload resume, parse text and generate recommendations (Gemini / Local Fallback)
// @route   POST /api/ai/analyze-resume
// @access  Private (Student)
export const uploadResumeAndAnalyze = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded. Please upload a PDF resume.' });
  }

  const filePath = req.file.path;

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from PDF. Ensure it is not scanned/an image.' });
    }

    let aiFeedback;

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
          You are an expert technical recruiter and resume coach.
          Analyze the following resume text and provide feedback in JSON format.
          
          Provide:
          1. A score from 0 to 100 based on layout, details, impact, and content.
          2. A list of 4-6 specific actionable suggestions to improve the resume.
          3. A list of matching job roles (e.g., "Frontend Engineer", "Backend Engineer", etc.).
          
          Respond ONLY with a valid JSON block containing "score" (number), "suggestions" (array of strings), and "matchedRoles" (array of strings). Do not write anything outside the JSON structure.

          Resume Text:
          ${resumeText}
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiFeedback = JSON.parse(jsonMatch[0]);
        } else {
          aiFeedback = JSON.parse(responseText);
        }
      } catch (geminiError) {
        console.error('Gemini API Error, falling back to local analysis:', geminiError.message);
        aiFeedback = localAnalyzeResume(resumeText);
      }
    } else {
      aiFeedback = localAnalyzeResume(resumeText);
    }

    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    profile.resumeUrl = `/uploads/${req.file.filename}`;
    profile.resumeParsedText = resumeText;
    profile.aiFeedback = aiFeedback;

    if (profile.skills.length === 0) {
      const techKeywords = ['javascript', 'typescript', 'react', 'node', 'express', 'mongodb', 'python', 'java', 'cpp', 'docker', 'kubernetes', 'aws', 'git', 'sql', 'html', 'css'];
      const lowercaseText = resumeText.toLowerCase();
      const detectedSkills = [];
      techKeywords.forEach((kw) => {
        if (lowercaseText.includes(kw)) {
          let capitalized = kw.charAt(0).toUpperCase() + kw.slice(1);
          if (kw === 'javascript') capitalized = 'JavaScript';
          if (kw === 'typescript') capitalized = 'TypeScript';
          if (kw === 'cpp') capitalized = 'C++';
          if (kw === 'sql') capitalized = 'SQL';
          if (kw === 'html') capitalized = 'HTML';
          if (kw === 'css') capitalized = 'CSS';
          if (kw === 'aws') capitalized = 'AWS';
          detectedSkills.push(capitalized);
        }
      });
      profile.skills = detectedSkills;
    }

    await profile.save();

    res.json({
      message: 'Resume analyzed successfully!',
      resumeUrl: profile.resumeUrl,
      skills: profile.skills,
      aiFeedback: profile.aiFeedback,
    });
  } catch (error) {
    console.error('Resume upload/analysis failed:', error);
    res.status(500).json({ message: 'Resume analysis failed. Please try again.' });
  }
};

// @desc    Get AI career insights and suggestions manually based on current profile details
// @route   GET /api/ai/career-advice
// @access  Private (Student)
export const getCareerAdvice = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate('user', 'name');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
          The student named ${profile.user.name} has the following profile details:
          Skills: ${profile.skills.join(', ') || 'None listed'}
          Education: ${JSON.stringify(profile.education)}
          Experience: ${JSON.stringify(profile.experience)}
          Current Resume Score: ${profile.aiFeedback?.score || 0}
          
          Based on this data, provide short, encouraging career advice. Tell them:
          1. What roles they should target.
          2. 3 actionable skills to learn next to increase their employability.
          3. How to improve their project description.
          Keep the response clean and format it with clear bullet points.
        `;

        const result = await model.generateContent(prompt);
        return res.json({ advice: result.response.text() });
      } catch (geminiError) {
        console.error('Gemini Advice error:', geminiError.message);
      }
    }

    const recommendedSkillMap = {
      'React': ['TypeScript', 'Next.js', 'Redux'],
      'Node.js': ['Express', 'Docker', 'Redis'],
      'JavaScript': ['React', 'Node.js', 'TypeScript'],
      'Python': ['Machine Learning', 'Django', 'FastAPI'],
      'Java': ['Spring Boot', 'SQL', 'Docker'],
      'SQL': ['PostgreSQL', 'MongoDB', 'Node.js'],
    };

    let nextSkills = ['TypeScript', 'System Design', 'Cloud Computing (AWS/GCP)'];
    for (const skill of profile.skills) {
      if (recommendedSkillMap[skill]) {
        nextSkills = recommendedSkillMap[skill];
        break;
      }
    }

    const adviceText = `
### Career Advice for ${profile.user.name}

Based on your profile, here are some strategic insights to accelerate your job search:

#### 1. Target Roles
- ${profile.aiFeedback?.matchedRoles?.join(', ') || 'Software Engineer Associate'}

#### 2. Skills to Learn Next
${nextSkills.map((sk) => `- **${sk}**: Highly sought after for developer roles matching your stack.`).join('\n')}

#### 3. Resume & Project Enhancement
- **Quantify Impact**: Instead of just saying "built a web application", say "Developed a web application that reduced page load times by 30% and was used by 150+ students."
- **Host Your Projects**: Provide live links (Vercel, Netlify, GitHub Pages) and repository links for all projects listed in your resume.
- **Explain Your Role**: If you worked in a group project, clearly specify the component you owned and built.
    `;

    res.json({ advice: adviceText });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Match student resume vs job details for similarity percentages
// @route   POST /api/ai/match-job
// @access  Private
export const matchJobAndResume = async (req, res) => {
  const { jobId, studentId } = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const studentToQuery = studentId || req.user._id;
    const profile = await Profile.findOne({ user: studentToQuery });
    if (!profile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const resumeText = profile.resumeParsedText || '';
    const studentSkills = profile.skills || [];

    let matchPercentage = 50;
    let matchedSkills = [];
    let missingSkills = [];
    let suggestions = [];

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
          You are an expert ATS screening system.
          Compare this student's skills: [${studentSkills.join(', ')}] and Resume Text:
          "${resumeText.slice(0, 3000)}"
          
          Against this Job Title: "${job.title}", Company: "${job.company}", Description: "${job.description}", and Requirements: [${job.requirements.join(', ')}].

          Provide feedback in JSON format:
          1. A matchPercentage (integer from 0 to 100).
          2. A list of matchedSkills (array of strings) that are present in both the job requirements and student profile/resume.
          3. A list of missingSkills (array of strings) required for the job but not explicitly shown in the student's profile/resume.
          4. 2-3 specific suggestions (array of strings) on how this candidate can improve their chances for this job.

          Respond ONLY with a valid JSON block. Do not write anything outside the JSON structure.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const matchData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

        matchPercentage = matchData.matchPercentage || 50;
        matchedSkills = matchData.matchedSkills || [];
        missingSkills = matchData.missingSkills || [];
        suggestions = matchData.suggestions || [];
      } catch (geminiError) {
        console.error('Gemini job matching failed, falling back to local:', geminiError.message);
      }
    }

    // Fallback rule if Gemini didn't run or failed
    if (matchedSkills.length === 0 && missingSkills.length === 0) {
      const jobReqs = job.requirements.map(r => r.toLowerCase());
      const lowerSkills = studentSkills.map(s => s.toLowerCase());
      
      jobReqs.forEach(req => {
        const matched = lowerSkills.some(s => req.includes(s)) || resumeText.toLowerCase().includes(req);
        if (matched) {
          matchedSkills.push(req);
        } else {
          missingSkills.push(req);
        }
      });

      const total = matchedSkills.length + missingSkills.length;
      matchPercentage = total > 0 ? Math.round((matchedSkills.length / total) * 100) : 50;
      
      if (missingSkills.length > 0) {
        suggestions.push(`Acquire skills in: ${missingSkills.slice(0, 3).join(', ')} to bridge the gap.`);
      }
      suggestions.push("Tailor your project descriptions to match the requirements of this role.");
    }

    res.json({
      matchPercentage,
      matchedSkills,
      missingSkills,
      suggestions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Interactive Coach chatbot message
// @route   POST /api/ai/coach-chat
// @access  Private (Student)
export const coachChat = async (req, res) => {
  const { message, chatHistory } = req.body;

  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate('user', 'name');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const profileSummary = `
          Student Name: ${profile.user.name}
          Skills: ${profile.skills.join(', ')}
          Education: ${JSON.stringify(profile.education)}
          Experience: ${JSON.stringify(profile.experience)}
          Resume Scored ATS: ${profile.aiFeedback?.score || 'Not Scored'}
        `;

        const historyString = chatHistory
          ? chatHistory.map(ch => `${ch.sender === 'user' ? 'Student' : 'Coach'}: ${ch.text}`).join('\n')
          : '';

        const prompt = `
          You are "ApexHire AI Career Coach", an empathetic, elite corporate tech recruiter and career counselor.
          You are speaking with ${profile.user.name}. Here is their profile summary:
          ${profileSummary}

          Conversation history:
          ${historyString}

          Student's current message: "${message}"

          Provide a professional, friendly, structured response. Keep it under 250 words, use clear markdown list items for steps if any, and maintain context.
        `;

        const result = await model.generateContent(prompt);
        return res.json({ reply: result.response.text() });
      } catch (geminiError) {
        console.error('Gemini Coach Chatbot failed:', geminiError.message);
      }
    }

    // Offline fallback responder
    let reply = `Hi ${profile.user.name}, I am your offline career coach. How can I help you today?`;
    const lowercaseMsg = message.toLowerCase();

    if (lowercaseMsg.includes('resume') || lowercaseMsg.includes('ats')) {
      reply = `To optimize your resume score (currently at ${profile.aiFeedback?.score || 0}/100), ensure you list your technical skills at the top, format your education and project milestones with dates, and quantify your project achievements (e.g. "reduced response time by 20%"). You can upload your PDF resume in your Dashboard to analyze it!`;
    } else if (lowercaseMsg.includes('skills') || lowercaseMsg.includes('learn')) {
      reply = `Looking at your current skills (${profile.skills.join(', ') || 'No skills added yet'}), I recommend learning Docker, Kubernetes, AWS, and system architecture to stand out in Full-Stack and Backend developer hiring pipelines.`;
    } else if (lowercaseMsg.includes('interview') || lowercaseMsg.includes('mock')) {
      reply = `Preparing for interviews is key. Go to the "AI Mock Interview" section on your sidebar, select your target role/company, and practice mock questions! I can also advise on HR behavioral tips like utilizing the STAR method (Situation, Task, Action, Result).`;
    } else if (lowercaseMsg.includes('jobs') || lowercaseMsg.includes('recommend')) {
      reply = `Based on your skills, you should target roles like Full Stack Developer or Frontend Engineer. Go to "Search Jobs" in your dashboard, click on any active listing, and click "AI Match Score" to see how well your profile matches the role!`;
    } else {
      reply = `That is an interesting question! To make your profile competitive, make sure you maintain a clean projects portfolio, solve DSA problems under our "Assessments" challenge room, and stay active in campus Hackathons. Let me know if you need specific tips on resume building or roadmaps!`;
    }

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate Learning Roadmap
// @route   POST /api/ai/generate-roadmap
// @access  Private (Student)
export const generateRoadmap = async (req, res) => {
  const { goal, experienceLevel = 'Intermediate', commitment = '10 hours/week' } = req.body;

  if (!goal) {
    return res.status(400).json({ message: 'Please provide a career goal role' });
  }

  try {
    let roadmapData = [];

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
          Generate a detailed 6-month learning curriculum / roadmap for a student whose goal is to become a "${goal}".
          The student currently has a "${experienceLevel}" level of experience, and can dedicate "${commitment}" to studying every week.
          Customize the pace, topic difficulty, and project scopes specifically to match their experience level and study commitment.
          
          For each of the 6 months, provide:
          - The month number
          - A high-level title
          - A list of 4 key topics/skills to master
          - A practical project to build that month
          
          Respond ONLY with a valid JSON array of objects, structured exactly like:
          [
            {
              "month": 1,
              "title": "...",
              "topics": ["...", "...", "...", "..."],
              "project": "..."
            }
          ]
          Do not include markdown backticks or commentary, just the JSON block.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        roadmapData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
      } catch (geminiError) {
        console.error('Gemini Roadmap generator failed, using fallback:', geminiError.message);
      }
    }

    if (roadmapData.length === 0) {
      // Fallback 6 month roadmap
      roadmapData = [
        {
          month: 1,
          title: `Foundations of ${goal}`,
          topics: ['Core syntax and variables', 'Data structures basics', 'Command line & Git fundamentals', 'Logical problem solving'],
          project: 'Local CLI automation script and Github repository setup'
        },
        {
          month: 2,
          title: 'Intermediate Concepts & APIs',
          topics: ['Object Oriented Programming', 'HTTP protocol & REST conventions', 'Asynchronous processing', 'Database query styling'],
          project: 'Fully functioning RESTful API backend with local data file persistence'
        },
        {
          month: 3,
          title: 'Database Architectures & Storage',
          topics: ['SQL database structures', 'NoSQL documents (MongoDB)', 'Schema modeling & constraints', 'Indexes and performance'],
          project: 'Full-featured database-backed application schema with migrations'
        },
        {
          month: 4,
          title: 'Frontend Linkage & UI Design',
          topics: ['Modern components framework (React)', 'State state management', 'Component lifecycles', 'CSS Flexbox / Responsive grids'],
          project: 'Responsive web portal that queries the month 2 API server'
        },
        {
          month: 5,
          title: 'Authentication & Security Protocols',
          topics: ['JSON Web Token configurations', 'Hashing passwords securely', 'CORS & security headers', 'Validation middlewares'],
          project: 'Secure user registration system with email confirmation mocks'
        },
        {
          month: 6,
          title: 'DevOps, Projects Portfolio & Interview Prep',
          topics: ['Dockerizing containers', 'Cloud hosting (Vercel/Render)', 'DSA coding challenges', 'System design concepts'],
          project: 'Deployed full-stack application on the cloud + optimized portfolio website'
        }
      ];
    }

    res.json({ goal, roadmap: roadmapData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate Interview Questions
// @route   POST /api/ai/generate-interview
// @access  Private (Student)
export const generateInterview = async (req, res) => {
  const { role, company, type } = req.body;

  if (!role || !company) {
    return res.status(400).json({ message: 'Please provide role and company fields' });
  }

  try {
    let questions = [];

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
          Generate exactly 5 realistic interview questions for a candidate applying for the role: "${role}" at company: "${company}".
          The interview type is: "${type || 'Technical'}".
          Make the questions sound professional, technical, and targeted (include specific concepts like React hooks, Express routing, DSA, SQL queries, or HR situational questions depending on the role/type).
          
          Respond ONLY with a valid JSON array of objects structured exactly like:
          [
            { "id": 1, "question": "..." },
            { "id": 2, "question": "..." }
          ]
          Do not include formatting wrapper, just JSON.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        questions = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
      } catch (geminiError) {
        console.error('Gemini interview generator failed, using offline bank:', geminiError.message);
      }
    }

    if (questions.length === 0) {
      // Fallback
      if (type?.toLowerCase() === 'hr') {
        questions = [
          { id: 1, question: `Why do you want to join ${company} as a ${role}?` },
          { id: 2, question: 'Tell me about a time you faced a conflict in a group project and how you resolved it.' },
          { id: 3, question: 'Where do you see yourself in 5 years? How does this role align with your goals?' },
          { id: 4, question: 'Describe a situation where you had to work under a tight deadline. How did you manage?' },
          { id: 5, question: 'What is your greatest technical strength, and what is one area you are trying to improve?' }
        ];
      } else {
        questions = [
          { id: 1, question: `How would you explain the core architecture of a web application built for the ${role} stack?` },
          { id: 2, question: `What are the typical scaling challenges faced in production systems at a company like ${company}?` },
          { id: 3, question: 'Describe the differences between SQL relational schemas and NoSQL document structures. When is each preferred?' },
          { id: 4, question: 'Explain how asynchronous executions are handled in JavaScript (Event loop, microtasks, callback queues).' },
          { id: 5, question: 'How do you secure your APIs from unauthorized access or cross-site requests?' }
        ];
      }
    }

    res.json({ role, company, type: type || 'Technical', questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Evaluate Mock Interview Answers
// @route   POST /api/ai/evaluate-interview
// @access  Private (Student)
export const evaluateInterview = async (req, res) => {
  const { role, company, type, questions, answers } = req.body;

  if (!questions || !answers || questions.length !== answers.length) {
    return res.status(400).json({ message: 'Questions and Answers arrays must be provided and have matching lengths.' });
  }

  try {
    let evaluationResult;

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const QnABlocks = questions.map((q, i) => `Q${i+1}: ${q}\nUser Answer: ${answers[i] || 'No answer provided'}`).join('\n\n');

        const prompt = `
          You are an elite corporate technical interviewer.
          Grade the candidate's answers for a "${role}" role interview at "${company}". Type: "${type || 'Technical'}".
          
          Questions and Candidate Answers:
          ${QnABlocks}

          Evaluate each answer and generate a JSON review containing:
          1. overallScore (integer from 0 to 100).
          2. feedback (array of objects):
             - question (string)
             - answer (string)
             - score (integer from 0 to 10 for this question)
             - tips (specific suggestions for improvement)
             - modelAnswer (a model answer in 2 sentences)
          3. summary (string summarizing strengths and key areas to study).

          Respond ONLY with a valid JSON block. No outside text.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        evaluationResult = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
      } catch (geminiError) {
        console.error('Gemini evaluation failed, falling back to local grading:', geminiError.message);
      }
    }

    if (!evaluationResult) {
      // Local fallback builder
      let totalPoints = 0;
      const feedback = questions.map((q, i) => {
        const ans = answers[i] || '';
        let score = 2; // base
        let tips = 'Expand on technical concepts and details. Give examples.';
        
        if (ans.trim().length > 30) {
          score += 3;
          tips = 'Good length. Add actual code references or design keywords to make it impact-oriented.';
        }
        if (ans.toLowerCase().includes('database') || ans.toLowerCase().includes('api') || ans.toLowerCase().includes('react') || ans.toLowerCase().includes('promise')) {
          score += 3;
          tips = 'Excellent. You are using the correct technical terms. Structure the response using bullet points.';
        }
        score = Math.min(score, 10);
        totalPoints += score;

        return {
          question: q,
          answer: ans,
          score,
          tips,
          modelAnswer: `For: "${q}", a strong answer focuses on system reliability, scaling metrics, and concrete examples from projects.`
        };
      });

      const overallScore = Math.round((totalPoints / (questions.length * 10)) * 100);

      evaluationResult = {
        overallScore,
        feedback,
        summary: `Offline evaluation complete. You achieved ${overallScore}%. Improve on listing concrete metrics, architecture diagrams, and explaining exact technical ownership in your code.`
      };
    }

    // Save mock interview attempt to DB
    await MockInterview.create({
      user: req.user._id,
      role,
      company,
      type: type || 'Technical',
      overallScore: evaluationResult.overallScore,
      summary: evaluationResult.summary,
      feedback: evaluationResult.feedback
    });

    res.json(evaluationResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user mock interviews history
// @route   GET /api/ai/mock-interviews
// @access  Private (Student)
export const getMockInterviews = async (req, res) => {
  try {
    const history = await MockInterview.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user mock interviews history (for admin)
// @route   GET /api/ai/mock-interviews/all
// @access  Private (Admin)
export const getAllMockInterviews = async (req, res) => {
  try {
    const history = await MockInterview.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add expert feedback/review to mock interview
// @route   PUT /api/ai/mock-interviews/:id/expert-feedback
// @access  Private (Admin)
export const addExpertFeedback = async (req, res) => {
  const { rating, comments } = req.body;
  try {
    const interview = await MockInterview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Mock interview session not found' });
    }
    
    interview.expertFeedback = {
      rating: Number(rating),
      comments,
      reviewedBy: req.user._id,
      reviewedAt: new Date()
    };
    
    await interview.save();
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
