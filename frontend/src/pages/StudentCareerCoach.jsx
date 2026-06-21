import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Send, 
  Cpu, 
  MapPin, 
  Clock, 
  BookOpen, 
  Activity, 
  Terminal, 
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Folder,
  Mic,
  MicOff,
  Trash2,
  Download,
  CheckCircle,
  Circle,
  HelpCircle
} from 'lucide-react';

const StudentCareerCoach = () => {
  const { authHeader, user } = useAuth();
  const { addToast } = useNotification();

  const [activeView, setActiveView] = useState('chat'); // 'chat' or 'roadmap'
  
  // Chat state
  const [message, setMessage] = useState('');
  const [chatList, setChatList] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper functions for saving to localStorage
  const saveChatList = (newChats) => {
    setChatList(newChats);
    const userId = user?._id || 'guest';
    localStorage.setItem(`coach_chat_${userId}`, JSON.stringify(newChats));
  };

  // Roadmap state
  const [roadmapGoal, setRoadmapGoal] = useState('Backend Developer');
  const [roadmap, setRoadmap] = useState([]);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [commitment, setCommitment] = useState('10 hours/week');

  // Voice Input Speech state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const saveRoadmap = (newRoadmap, goal = roadmapGoal) => {
    setRoadmap(newRoadmap);
    const userId = user?._id || 'guest';
    localStorage.setItem(`roadmap_${userId}`, JSON.stringify(newRoadmap));
    localStorage.setItem(`roadmap_goal_${userId}`, goal);
  };

  const saveRoadmapGoal = (goal) => {
    setRoadmapGoal(goal);
    const userId = user?._id || 'guest';
    localStorage.setItem(`roadmap_goal_${userId}`, goal);
  };

  const saveRoadmapParams = (level, hours) => {
    setExperienceLevel(level);
    setCommitment(hours);
    const userId = user?._id || 'guest';
    localStorage.setItem(`roadmap_level_${userId}`, level);
    localStorage.setItem(`roadmap_commitment_${userId}`, hours);
  };

  // Synchronously load values when user ID changes
  useEffect(() => {
    const userId = user?._id || 'guest';

    const savedChat = localStorage.getItem(`coach_chat_${userId}`);
    if (savedChat) {
      setChatList(JSON.parse(savedChat));
    } else {
      setChatList([
        { sender: 'coach', text: `Hello ${user?.name || 'there'}! I am your AI Career Coach. Ask me anything about skill progression, resume tweaks, or interview preparation tips!`, timestamp: new Date() }
      ]);
    }

    const savedGoal = localStorage.getItem(`roadmap_goal_${userId}`);
    if (savedGoal) {
      setRoadmapGoal(savedGoal);
    } else {
      setRoadmapGoal('Backend Developer');
    }

    const savedRoadmap = localStorage.getItem(`roadmap_${userId}`);
    if (savedRoadmap) {
      setRoadmap(JSON.parse(savedRoadmap));
    } else {
      setRoadmap([]);
    }

    const savedLevel = localStorage.getItem(`roadmap_level_${userId}`);
    if (savedLevel) {
      setExperienceLevel(savedLevel);
    } else {
      setExperienceLevel('Intermediate');
    }

    const savedCommitment = localStorage.getItem(`roadmap_commitment_${userId}`);
    if (savedCommitment) {
      setCommitment(savedCommitment);
    } else {
      setCommitment('10 hours/week');
    }
  }, [user?._id]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Scroll to bottom whenever chat changes
  useEffect(() => {
    scrollToBottom();
  }, [chatList]);

  // Voice recognition triggers
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Speech recognition is not supported in this browser. Try Chrome/Edge.', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      addToast('Listening... Speak now.', 'info');
    };

    recognition.onerror = (e) => {
      console.error(e);
      addToast('Voice input error. Try again.', 'error');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(prev => (prev ? prev + ' ' + transcript : transcript));
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const toggleMonthCompleted = (monthNumber) => {
    const updatedRoadmap = roadmap.map(m => {
      if (m.month === monthNumber) {
        return { ...m, completed: !m.completed };
      }
      return m;
    });
    saveRoadmap(updatedRoadmap, roadmapGoal);
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      saveChatList([
        { sender: 'coach', text: `Hello ${user?.name || 'there'}! I am your AI Career Coach. Ask me anything about skill progression, resume tweaks, or interview preparation tips!`, timestamp: new Date() }
      ]);
      addToast('Chat history cleared!', 'info');
    }
  };

  const handleExportRoadmap = () => {
    if (roadmap.length === 0) return;
    
    let textContent = `AI CUSTOM 6-MONTH ROADMAP\n`;
    textContent += `Target Goal: ${roadmapGoal}\n`;
    textContent += `Experience Level: ${experienceLevel}\n`;
    textContent += `Weekly Study Commitment: ${commitment}\n`;
    textContent += `========================================\n\n`;

    roadmap.forEach(m => {
      textContent += `MONTH ${m.month}: ${m.title}\n`;
      textContent += `Status: ${m.completed ? 'COMPLETED' : 'IN PROGRESS'}\n`;
      textContent += `Key Topics to Master:\n`;
      m.topics.forEach(t => {
        textContent += `  - ${t}\n`;
      });
      if (m.project) {
        textContent += `Practical Milestone Project:\n  ${m.project}\n`;
      }
      textContent += `----------------------------------------\n\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${roadmapGoal.toLowerCase().replace(/\s+/g, '_')}_6month_roadmap.txt`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Roadmap exported successfully!', 'success');
  };

  const renderMessageContent = (text) => {
    if (!text) return null;

    // Detect triple backtick code blocks
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeLines = part.slice(3, -3).trim().split('\n');
        let language = 'code';
        let codeBody = part.slice(3, -3).trim();
        if (codeLines[0] && codeLines[0].length < 15 && !codeLines[0].includes(' ') && !codeLines[0].includes('(')) {
          language = codeLines[0];
          codeBody = codeLines.slice(1).join('\n');
        }

        const handleCopy = () => {
          navigator.clipboard.writeText(codeBody);
          addToast('Code copied to clipboard!', 'success');
        };

        return (
          <div key={idx} className="my-3 rounded overflow-hidden border border-color shadow-sm" style={{ background: '#1e1e2e', border: '1px solid var(--border-color)' }}>
            <div className="d-flex justify-content-between align-items-center px-3 py-1.5 text-xs text-muted" style={{ background: '#181825', borderBottom: '1px solid #313244', padding: '6px 12px' }}>
              <span style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}>{language}</span>
              <button 
                onClick={handleCopy}
                className="btn btn-xs btn-outline" 
                style={{ padding: '2px 8px', fontSize: '0.65rem', border: '1px solid #45475a', color: '#cdd6f4' }}
              >
                Copy
              </button>
            </div>
            <pre className="p-3 m-0 text-white" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem', overflowX: 'auto', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
              <code>{codeBody}</code>
            </pre>
          </div>
        );
      }

      const lines = part.split('\n');
      return lines.map((line, lIdx) => {
        const isBullet = line.trim().startsWith('-') || line.trim().startsWith('*');
        const isNumbered = /^\d+\.\s/.test(line.trim());
        
        let content = line;
        if (isBullet) content = line.trim().substring(1).trim();
        if (isNumbered) content = line.trim().substring(line.trim().indexOf('.') + 1).trim();

        const formattedParts = [];
        const boldRegex = /\*\*(.*?)\*\*/g;
        let lastIndex = 0;
        let match;
        
        while ((match = boldRegex.exec(content)) !== null) {
          if (match.index > lastIndex) {
            formattedParts.push(content.substring(lastIndex, match.index));
          }
          formattedParts.push(<strong key={match.index} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{match[1]}</strong>);
          lastIndex = boldRegex.lastIndex;
        }
        if (lastIndex < content.length) {
          formattedParts.push(content.substring(lastIndex));
        }

        const renderLine = formattedParts.length > 0 ? formattedParts : content;

        if (isBullet) {
          return (
            <div key={`${lIdx}`} className="d-flex align-items-start gap-2 mb-1.5" style={{ paddingLeft: '0.5rem' }}>
              <span className="text-primary" style={{ fontSize: '0.8rem', marginTop: '2px' }}>•</span>
              <span className="flex-grow-1" style={{ fontSize: '0.88rem' }}>{renderLine}</span>
            </div>
          );
        }

        if (isNumbered) {
          const numMatch = line.trim().match(/^(\d+)\./);
          const num = numMatch ? numMatch[1] : '1';
          return (
            <div key={`${lIdx}`} className="d-flex align-items-start gap-2 mb-1.5" style={{ paddingLeft: '0.5rem' }}>
              <span className="text-primary font-semibold" style={{ fontSize: '0.8rem', marginTop: '2px' }}>{num}.</span>
              <span className="flex-grow-1" style={{ fontSize: '0.88rem' }}>{renderLine}</span>
            </div>
          );
        }

        return (
          <p key={lIdx} className="mb-2" style={{ fontSize: '0.88rem', minHeight: line.trim() === '' ? '0.5rem' : 'auto' }}>
            {renderLine}
          </p>
        );
      });
    });
  };

  const handleSendChat = async (e, customMsg = null) => {
    if (e) e.preventDefault();
    
    const msgText = customMsg || message;
    if (!msgText.trim()) return;

    // Append user message
    const newChatList = [...chatList, { sender: 'user', text: msgText, timestamp: new Date() }];
    saveChatList(newChatList);
    setMessage('');
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/ai/coach-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          message: msgText,
          chatHistory: newChatList.slice(-6) // Send last few messages for context
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updated = [...newChatList, { sender: 'coach', text: data.reply, timestamp: new Date() }];
        saveChatList(updated);
      } else {
        addToast('Coach is currently busy. Try again.', 'warning');
      }
    } catch (err) {
      addToast('Coach connection failed.', 'error');
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    if (!roadmapGoal.trim()) return;

    setRoadmapLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/generate-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ 
          goal: roadmapGoal,
          experienceLevel,
          commitment
        })
      });

      if (res.ok) {
        const data = await res.json();
        const formattedRoadmap = (data.roadmap || []).map(m => ({ ...m, completed: false }));
        saveRoadmap(formattedRoadmap, roadmapGoal);
        addToast('6-Month AI Roadmap generated successfully!', 'success');
      } else {
        addToast('Roadmap generation failed', 'error');
      }
    } catch (err) {
      addToast('Network error generating roadmap', 'error');
    } finally {
      setRoadmapLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ color: 'var(--text-primary)' }}>
      {/* Page Header */}
      <div 
        className="d-flex justify-content-between align-items-start mb-4 pb-3 flex-wrap gap-3 w-100"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="d-flex align-items-start" style={{ gap: '14px' }}>
          <div 
            className="d-flex align-items-center justify-content-center text-primary animate-pulse" 
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '50%', 
              background: 'var(--primary-glow)', 
              flexShrink: 0,
              marginTop: '2px'
            }}
          >
            <Cpu size={20} />
          </div>
          <div>
            <h1 style={{ fontWeight: 600, fontSize: '1.35rem', letterSpacing: '-0.3px', margin: 0, color: 'var(--text-primary)' }}>
              AI Career & Learning Suite
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              Dynamic chatbot counseling and custom role roadmaps powered by Gemini.
            </p>
          </div>
        </div>

        <div className="d-flex gap-2 bg-base p-1 rounded border border-color" style={{ marginTop: '4px' }}>
          <button 
            className={`btn btn-sm ${activeView === 'chat' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', padding: '0.45rem 1.15rem', fontSize: '0.75rem', borderRadius: '6px' }}
            onClick={() => setActiveView('chat')}
          >
            Chat Coach
          </button>
          <button 
            className={`btn btn-sm ${activeView === 'roadmap' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', padding: '0.45rem 1.15rem', fontSize: '0.75rem', borderRadius: '6px' }}
            onClick={() => setActiveView('roadmap')}
          >
            AI Roadmap Generator
          </button>
        </div>
      </div>

      {activeView === 'chat' && (
        <div className="row g-4">
          {/* Left Column: Interactive Chat Console */}
          <div className="col-lg-8 col-md-12">
            <div 
              className="glass-card d-flex flex-column" 
              style={{ 
                height: '70vh', 
                padding: 0, 
                overflow: 'hidden',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div className="p-3 border-bottom border-color d-flex justify-content-between align-items-center bg-surface-elevated">
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar-circle bg-primary-glow text-primary" style={{ width: 36, height: 36 }}>
                    <Cpu size={18} />
                  </div>
                  <div>
                    <span className="font-bold d-block text-sm">Career Coach Bot</span>
                    <span className="text-success text-xs d-block">● Online AI Recruiter</span>
                  </div>
                </div>
                <button 
                  onClick={handleClearChat}
                  className="btn btn-xs btn-outline text-danger border-0 d-flex align-items-center gap-1.5"
                  title="Clear Chat History"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem' }}
                >
                  <Trash2 size={13} /> Clear Chat
                </button>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-grow-1 p-4 overflow-y-auto d-flex flex-column gap-3">
                {chatList.map((chat, idx) => (
                  <div 
                    key={idx} 
                    className={`d-flex ${chat.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    <div 
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: chat.sender === 'user' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                        color: chat.sender === 'user' ? '#fff' : 'var(--text-primary)',
                        borderRadius: chat.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        border: chat.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                        maxWidth: '75%'
                      }}
                    >
                      {chat.sender === 'user' ? (
                        chat.text.split('\n').map((line, lIdx) => (
                          <p key={lIdx} className="mb-1">{line}</p>
                        ))
                      ) : (
                        renderMessageContent(chat.text)
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="d-flex justify-content-start">
                    <div className="p-3 rounded-lg bg-surface-elevated border border-color d-flex align-items-center gap-2">
                      <span className="spinner-dots text-xs">Coach is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions Bar */}
              <div className="px-4 py-2 border-top border-color d-flex gap-2 overflow-x-auto bg-base" style={{ whiteSpace: 'nowrap' }}>
                <button 
                  onClick={() => handleSendChat(null, 'Suggest core skills to learn next')}
                  className="btn btn-xs btn-outline rounded-full text-xs"
                >
                  💡 Suggest Skills
                </button>
                <button 
                  onClick={() => handleSendChat(null, 'How can I optimize my projects section?')}
                  className="btn btn-xs btn-outline rounded-full text-xs"
                >
                  📂 Optimize Projects
                </button>
                <button 
                  onClick={() => handleSendChat(null, 'Explain the STAR method for behavioral rounds')}
                  className="btn btn-xs btn-outline rounded-full text-xs"
                >
                  ⭐ STAR Interview Method
                </button>
                <button 
                  onClick={() => handleSendChat(null, 'What is system design interview preparation strategy?')}
                  className="btn btn-xs btn-outline rounded-full text-xs"
                >
                  🏗 System Design
                </button>
              </div>

              {/* Chat Input Area */}
              <form onSubmit={handleSendChat} className="p-3 border-top border-color d-flex gap-2 bg-surface-elevated">
                <button 
                  type="button" 
                  onClick={startVoiceInput}
                  className={`btn ${isListening ? 'btn-danger animate-pulse' : 'btn-outline'}`}
                  style={{ padding: '0.6rem 0.9rem' }}
                  title={isListening ? 'Stop Listening' : 'Speak Message (Voice Input)'}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <input 
                  type="text" 
                  className="form-input flex-grow-1 text-sm"
                  placeholder={isListening ? "Listening... Speak your query clearly." : "Ask about resume updates, interview prep, career transitions..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={chatLoading}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }} disabled={chatLoading}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Dynamic Advice Panel */}
          <div className="col-lg-4 col-md-12">
            <div className="glass-card p-4">
              <h3 className="h5 font-bold mb-3 d-flex align-items-center gap-2">
                <Sparkles className="text-warning" size={20} /> Smart Action Items
              </h3>
              <p className="text-muted text-xs mb-4">
                Follow these recommendations to optimize your hiring matches.
              </p>

              <div className="d-flex flex-column gap-3">
                <div className="p-3 rounded border border-color bg-surface-elevated">
                  <span className="badge bg-primary-glow text-primary text-xs mb-2">Resume</span>
                  <span className="font-semibold text-sm d-block mb-1">ATS Scanner check</span>
                  <span className="text-xs text-muted d-block">Ensure you have uploaded a PDF. AI analyzes section layout and detects missing keywords.</span>
                </div>

                <div className="p-3 rounded border border-color bg-surface-elevated">
                  <span className="badge bg-secondary-glow text-secondary text-xs mb-2">DSA Code</span>
                  <span className="font-semibold text-sm d-block mb-1">Weekly Assessments</span>
                  <span className="text-xs text-muted d-block">Take standard MCQs and code challenges under Assessments tab to win platform badges.</span>
                </div>

                <div className="p-3 rounded border border-color bg-surface-elevated">
                  <span className="badge bg-success-glow text-success text-xs mb-2">Community</span>
                  <span className="font-semibold text-sm d-block mb-1">Request Referrals</span>
                  <span className="text-xs text-muted d-block">Connect with verified campus alumni working at Google, Meta, and Amazon via Forums.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'roadmap' && (
        <div className="row g-4">
          {/* Left Column: Roadmap Goal Selector */}
          <div className="col-lg-4 col-md-12">
            <div className="glass-card p-4">
              <h3 className="h5 font-bold mb-3">AI Path Builder</h3>
              <p className="text-muted text-xs mb-4">
                Input your target career role, and Gemini will generate a custom 6-month masterplan.
              </p>

              <form onSubmit={handleGenerateRoadmap} className="d-flex flex-column gap-3">
                <div className="form-group">
                  <label className="form-label">Target Role Goal</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Backend Developer"
                    value={roadmapGoal}
                    onChange={(e) => saveRoadmapGoal(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Experience Level</label>
                  <select 
                    className="form-input text-sm" 
                    value={experienceLevel}
                    onChange={(e) => saveRoadmapParams(e.target.value, commitment)}
                    style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  >
                    <option value="Beginner">Beginner (No background)</option>
                    <option value="Intermediate">Intermediate (Basic syntax/concepts)</option>
                    <option value="Advanced">Advanced (Experienced Developer)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Weekly Study Time</label>
                  <select 
                    className="form-input text-sm" 
                    value={commitment}
                    onChange={(e) => saveRoadmapParams(experienceLevel, e.target.value)}
                    style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  >
                    <option value="5-10 hours/week">5-10 hours / week</option>
                    <option value="10-20 hours/week">10-20 hours / week</option>
                    <option value="20+ hours/week">20+ hours / week</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary d-flex align-items-center justify-content-center gap-2" disabled={roadmapLoading}>
                  {roadmapLoading ? <span className="spinner"></span> : <>Generate Curriculum <ArrowRight size={16} /></>}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Month Timeline view */}
          <div className="col-lg-8 col-md-12">
            <div className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h3 className="h5 font-bold mb-0">
                  6-Month Timeline: {roadmapGoal || 'Software Engineer'}
                </h3>
                {roadmap.length > 0 && (
                  <button 
                    onClick={handleExportRoadmap}
                    className="btn btn-xs btn-outline d-flex align-items-center gap-1.5"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}
                  >
                    <Download size={13} /> Export Plan
                  </button>
                )}
              </div>

              {roadmapLoading ? (
                <div className="text-center py-5">
                  <span className="spinner"></span>
                </div>
              ) : roadmap.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <BookOpen size={36} className="mb-2" />
                  <p className="mb-0">Enter your target role and generate your custom path.</p>
                </div>
              ) : (
                <>
                  {/* Progress Tracker Card */}
                  <div className="p-3 mb-4 rounded border border-color bg-surface-elevated shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-xs text-muted font-semibold">Your Roadmap Completion Progress</span>
                      <span className="badge bg-primary-glow text-primary font-bold">{Math.round((roadmap.filter(m => m.completed).length / roadmap.length) * 100)}%</span>
                    </div>
                    <div className="progress" style={{ height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        className="progress-bar bg-primary" 
                        role="progressbar" 
                        style={{ 
                          width: `${(roadmap.filter(m => m.completed).length / roadmap.length) * 100}%`, 
                          height: '100%', 
                          transition: 'width 0.4s ease',
                          boxShadow: '0 0 10px var(--primary)'
                        }}
                      />
                    </div>
                    <div className="d-flex justify-content-between text-muted mt-1.5" style={{ fontSize: '0.65rem' }}>
                      <span>{roadmap.filter(m => m.completed).length} of {roadmap.length} months completed</span>
                      {roadmap.filter(m => m.completed).length === roadmap.length && (
                        <span className="text-success font-semibold">🎉 Goal Achieved! Ready for interviews!</span>
                      )}
                    </div>
                  </div>

                  <div className="roadmap-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {roadmap.map((month) => (
                      <div key={month.month} className="timeline-node d-flex gap-4">
                        {/* Month Circle */}
                        <div className="d-flex flex-column align-items-center">
                          <button 
                            onClick={() => toggleMonthCompleted(month.month)}
                            className={`avatar-circle font-bold border-0 cursor-pointer transition-all ${month.completed ? 'bg-success text-white' : 'bg-primary text-white'}`}
                            style={{ 
                              width: 44, 
                              height: 44, 
                              minWidth: 44, 
                              boxShadow: month.completed ? '0 0 15px rgba(40, 167, 69, 0.4)' : 'none',
                              transform: month.completed ? 'scale(1.05)' : 'none'
                            }}
                            title={month.completed ? "Mark month as in progress" : "Mark month as completed"}
                          >
                            {month.completed ? <CheckCircle size={20} /> : `M${month.month}`}
                          </button>
                          <div className="timeline-connector flex-grow-1" style={{ width: 2, backgroundColor: month.completed ? 'var(--success)' : 'var(--border-color)', marginTop: '0.5rem', minHeight: 40 }}></div>
                        </div>

                        {/* Month Details */}
                        <div 
                          className="flex-grow-1 p-4 rounded border transition-all bg-surface-elevated"
                          style={{
                            borderLeftWidth: month.completed ? '4px' : '1px',
                            borderLeftStyle: 'solid',
                            borderLeftColor: month.completed ? 'var(--success)' : 'var(--border-color)',
                            opacity: month.completed ? 0.85 : 1,
                            transform: month.completed ? 'translateY(1px)' : 'none'
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className={`font-bold h6 mb-0 ${month.completed ? 'text-success' : 'text-primary'}`}>{month.title}</span>
                            <button 
                              type="button"
                              onClick={() => toggleMonthCompleted(month.month)}
                              className={`btn btn-xs ${month.completed ? 'btn-success' : 'btn-outline-secondary'} text-xs`}
                              style={{ padding: '0.2rem 0.5rem' }}
                            >
                              {month.completed ? 'Completed' : 'Mark Done'}
                            </button>
                          </div>
                          
                          <div className="mb-3">
                            <span className="text-muted text-xs font-semibold d-block mb-1">Key Topics:</span>
                            <div className="d-flex flex-wrap gap-1">
                              {month.topics.map((t, idx) => (
                                <span key={idx} className="badge bg-secondary-glow text-secondary text-xs">{t}</span>
                              ))}
                            </div>
                          </div>

                          {month.project && (
                            <div className="p-3 rounded bg-base text-xs text-muted d-flex align-items-start gap-2 border-top border-color">
                              <Folder size={16} className="text-accent mt-0.5" />
                              <div>
                                <strong>Practical Milestone Project:</strong>
                                <p className="mb-0 mt-1 text-xs">{month.project}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCareerCoach;
