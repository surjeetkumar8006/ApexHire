import React, { useState, useEffect } from 'react';
import { Cpu, Sparkles, Send, Award, Compass, BookOpen } from 'lucide-react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const AICoach = () => {
  const { authHeader } = useAuth();
  const { addToast } = useNotification();

  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);

  // Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Interview Mode States
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [interviewQuestionIndex, setInterviewQuestionIndex] = useState(0);
  const [interviewQuestions, setInterviewQuestions] = useState([]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch advice
      const adviceRes = await fetch(`${API_BASE}/ai/career-advice`, {
        headers: authHeader(),
      });
      if (adviceRes.ok) {
        const data = await adviceRes.json();
        setAdvice(data.advice);
      }

      // Fetch profile for skills
      const profileRes = await fetch(`${API_BASE}/users/profile`, {
        headers: authHeader(),
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setStudentProfile(profileData);
        
        setChatHistory([
          {
            sender: 'ai',
            text: `Hello ${profileData.user?.name}! I am your AI Career Coach. I see you have skills in ${profileData.skills.slice(0,3).join(', ')}. You can ask me career questions, or we can start a Mock Technical Interview based on your resume.`,
          },
        ]);
      } else {
        setChatHistory([{ sender: 'ai', text: "Hello! I am your AI Career Coach. Ask me anything!" }]);
      }

    } catch (err) {
      addToast('Failed to load coach data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const startMockInterview = () => {
    if (!studentProfile || studentProfile.skills.length === 0) {
      addToast('Please add skills to your profile first to generate questions.', 'warning');
      return;
    }

    setIsInterviewMode(true);
    setInterviewQuestionIndex(0);
    setChatInput('');

    // Generate simulated questions based on skills
    const questions = studentProfile.skills.slice(0, 3).map(skill => {
      if (skill.toLowerCase() === 'react' || skill.toLowerCase() === 'react.js') return `Can you explain the difference between functional and class components in ${skill}?`;
      if (skill.toLowerCase() === 'node.js' || skill.toLowerCase() === 'node') return `What is the event loop in ${skill} and how does it handle asynchronous operations?`;
      if (skill.toLowerCase() === 'mongodb' || skill.toLowerCase() === 'sql') return `How do you optimize slow database queries in ${skill}?`;
      return `Can you describe a complex problem you solved using ${skill}?`;
    });

    setInterviewQuestions(questions);

    setChatHistory((prev) => [
      ...prev,
      { sender: 'ai', text: `Great! Let's start a mock interview based on your skills. I will ask you ${questions.length} questions. Let's begin.` },
      { sender: 'ai', text: `**Question 1:** ${questions[0]}` }
    ]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      let responseText = '';

      if (isInterviewMode) {
        // Handle interview flow
        const feedbackPool = [
          "Good attempt. Next time, try to include specific examples from your projects.",
          "That's a solid theoretical answer. Mentioning trade-offs would make it even stronger.",
          "Excellent answer! You covered the core concepts clearly.",
        ];
        const randomFeedback = feedbackPool[Math.floor(Math.random() * feedbackPool.length)];
        
        if (interviewQuestionIndex < interviewQuestions.length - 1) {
          const nextIndex = interviewQuestionIndex + 1;
          setInterviewQuestionIndex(nextIndex);
          responseText = `${randomFeedback}\n\n**Question ${nextIndex + 1}:** ${interviewQuestions[nextIndex]}`;
        } else {
          setIsInterviewMode(false);
          responseText = `${randomFeedback}\n\n**Mock Interview Complete!** You did great. Review the feedback above to improve your delivery. What would you like to discuss next?`;
        }
      } else {
        // Normal chat mode
        const lowercaseMsg = userMessage.toLowerCase();
        if (lowercaseMsg.includes('interview') || lowercaseMsg.includes('prepare')) {
          responseText = "For interviews, focus on three pillars: \n1. **Data Structures & Algorithms** (solve 1-2 problems daily).\n2. **Core CS Fundamentals** (Database Systems, OS, Computer Networks).\n3. **Behavioral Questions** (use the STAR method: Situation, Task, Action, Result) to explain your project experiences.";
        } else if (lowercaseMsg.includes('resume') || lowercaseMsg.includes('score')) {
          responseText = "To boost your resume score, ensure all project bullet points follow the formula: **Accomplished X, measured by Y, by doing Z**. Include hyperlinks to your GitHub repository and live project deployments directly on the layout.";
        } else if (lowercaseMsg.includes('project') || lowercaseMsg.includes('stack')) {
          responseText = "Recruiters love full-stack capstone projects. Try building a CRUD application using React, Node.js/Express, and MongoDB. Add features like JWT auth, state indicators, and file uploading, then host it on Vercel or Render.";
        } else if (lowercaseMsg.includes('salary') || lowercaseMsg.includes('negotiate')) {
          responseText = "When discussing salary, let the recruiter make the first offer if possible. Research average roles on Glassdoor or AmbitionBox. Focus on highlighting your technical capabilities, projects, and readiness to deliver value from day one.";
        } else {
          responseText = "That is an excellent career goal. I suggest building 2-3 solid portfolio projects, earning certifications in Cloud (like AWS Practitioner) or Agile, and practicing mock interviews with peers to build confidence.";
        }
      }

      setChatHistory((prev) => [...prev, { sender: 'ai', text: responseText }]);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <header>
        <h1 style={styles.title}>AI Placement Advisor</h1>
        <p style={styles.subtitle}>Get custom strategy breakdowns, resume coaching, and mock interview guidelines.</p>
      </header>

      <div style={styles.layout}>
        {/* Left Col: Career Assessment Report */}
        <div className="glass-card" style={styles.reportCard}>
          <div style={styles.reportHeader}>
            <Sparkles size={20} color="var(--accent)" />
            <h3 style={styles.cardTitle}>Career Alignment Report</h3>
          </div>

          {loading ? (
            <div style={styles.reportLoading}>
              <div style={styles.spinner}></div>
              <p>Analyzing profile parameters...</p>
            </div>
          ) : (
            <div style={styles.reportContent}>
              {/* Parse basic markdown items manually */}
              {advice && advice.split('\n').map((line, idx) => {
                if (line.startsWith('###')) {
                  return <h3 key={idx} style={styles.h3}>{line.replace('###', '')}</h3>;
                }
                if (line.startsWith('####')) {
                  return <h4 key={idx} style={styles.h4}>{line.replace('####', '')}</h4>;
                }
                if (line.startsWith('-')) {
                  // Bold text processing
                  const text = line.replace('-', '').trim();
                  return (
                    <div key={idx} style={styles.bulletRow}>
                      <div style={styles.bulletDot}></div>
                      <p style={styles.bulletText}>{text}</p>
                    </div>
                  );
                }
                return line.trim() ? <p key={idx} style={styles.para}>{line}</p> : null;
              })}

              <button onClick={fetchInitialData} className="btn btn-secondary" style={styles.refreshBtn}>
                Re-Generate Alignment Report
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Interactive AI Coach Chat */}
        <div className="glass-card" style={styles.chatCard}>
          <div style={styles.chatHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              <div style={styles.avatar}>
                <Cpu size={18} />
              </div>
              <div>
                <h3 style={styles.chatTitle}>{isInterviewMode ? 'Mock Interview in Progress' : 'Interactive Coach'}</h3>
                <p style={styles.chatStatus}>Online • Powered by AccioAI</p>
              </div>
            </div>
            {!isInterviewMode && (
              <button onClick={startMockInterview} className="btn" style={styles.mockInterviewBtn}>
                <Award size={14} /> Start Mock Interview
              </button>
            )}
            {isInterviewMode && (
              <button onClick={() => setIsInterviewMode(false)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                End Interview
              </button>
            )}
          </div>

          <div style={styles.chatBody}>
            {chatHistory.map((chat, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.chatBubbleContainer,
                  justifyContent: chat.sender === 'ai' ? 'flex-start' : 'flex-end',
                }}
              >
                <div
                  style={{
                    ...styles.chatBubble,
                    ...(chat.sender === 'ai' ? styles.aiBubble : styles.userBubble),
                  }}
                >
                  <p style={{ whiteSpace: 'pre-wrap' }}>{chat.text}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={styles.chatBubbleContainer}>
                <div style={{ ...styles.chatBubble, ...styles.aiBubble, display: 'flex', gap: '4px' }}>
                  <span className="dot" style={styles.dot1}>.</span>
                  <span className="dot" style={styles.dot2}>.</span>
                  <span className="dot" style={styles.dot3}>.</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="chat-footer">
            <input
              type="text"
              placeholder="Ask about resume tips, salary, coding preparation..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="chat-input-field"
            />
            <button type="submit" className="btn btn-primary" style={styles.sendBtn} disabled={chatLoading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
  },
  layout: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'stretch',
    minHeight: '520px',
  },
  reportCard: {
    flex: 1.2,
    display: 'flex',
    flexDirection: 'column',
  },
  reportHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  reportLoading: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(99, 102, 241, 0.2)',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  reportContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  h3: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginTop: '0.5rem',
  },
  h4: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--primary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.25rem',
    marginTop: '0.75rem',
  },
  bulletRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: '6px',
    height: '6px',
    backgroundColor: 'var(--accent)',
    borderRadius: '50%',
    marginTop: '7px',
  },
  bulletText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  para: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  refreshBtn: {
    marginTop: '1.5rem',
    alignSelf: 'flex-start',
  },
  chatCard: {
    flex: 0.8,
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--border-color)',
    padding: 0,
    overflow: 'hidden',
  },
  chatHeader: {
    padding: '1.25rem',
    background: 'rgba(255,255,255,0.01)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  chatTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  chatStatus: {
    fontSize: '0.75rem',
    color: 'var(--accent)',
  },
  chatBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxHeight: '380px',
  },
  chatBubbleContainer: {
    display: 'flex',
    width: '100%',
  },
  chatBubble: {
    padding: '0.8rem 1rem',
    borderRadius: '16px',
    maxWidth: '85%',
    fontSize: '0.88rem',
    lineHeight: '1.45',
  },
  aiBubble: {
    background: 'var(--bg-surface-elevated)',
    color: 'var(--text-secondary)',
    borderBottomLeftRadius: '4px',
    border: '1px solid var(--border-color)',
  },
  userBubble: {
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  chatFooter: {
    padding: '1rem',
    background: 'rgba(15,23,42,0.3)',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    gap: '0.75rem',
  },
  chatInput: {
    flex: 1,
    background: 'rgba(15,23,42,0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '0.65rem 1rem',
    fontSize: '0.88rem',
    color: 'var(--text-primary)',
  },
  sendBtn: {
    padding: '0.65rem 1rem',
    borderRadius: 'var(--border-radius-md)',
  },
  mockInterviewBtn: {
    background: 'var(--primary-glow)',
    color: 'var(--primary)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    fontSize: '0.75rem',
    padding: '0.4rem 0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  dot1: { animation: 'pulse 1.4s infinite' },
  dot2: { animation: 'pulse 1.4s infinite 0.2s' },
  dot3: { animation: 'pulse 1.4s infinite 0.4s' },
};

export default AICoach;
