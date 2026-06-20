import fs from 'fs';
import pdf from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Profile from '../models/Profile.js';

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

  // Score adjustments
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
    suggestions: suggestions.slice(0, 5), // Return top 5 recommendations
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
    // Read PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from PDF. Ensure it is not scanned/an image.' });
    }

    let aiFeedback;

    // Try Gemini API if key is present
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
        
        // Clean JSON formatting if Gemini adds markdown blocks
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
      // Fallback
      aiFeedback = localAnalyzeResume(resumeText);
    }

    // Update Student Profile
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    // Save resume info and feedback
    profile.resumeUrl = `/uploads/${req.file.filename}`;
    profile.resumeParsedText = resumeText;
    profile.aiFeedback = aiFeedback;

    // Parse and auto-extract skills if empty
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

    // If Gemini key is set, get dynamic interactive advice
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

    // Default Fallback advice
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
