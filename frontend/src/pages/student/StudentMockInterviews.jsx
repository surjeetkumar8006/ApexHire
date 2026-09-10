import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  Award, 
  HelpCircle, 
  CheckCircle, 
  Play, 
  ArrowRight, 
  Sparkles, 
  MessageSquare, 
  RefreshCw, 
  Cpu,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  AlertCircle,
  Code,
  Database,
  Server,
  Cloud,
  Brain,
  Terminal,
  Trash2,
  Calendar,
  Clock,
  Building
} from 'lucide-react';

const PRESET_ROLES = [
  { name: 'Frontend Engineer', company: 'Google', tags: ['React', 'CSS Layout', 'HMR', 'Performance'], icon: <Code size={20} /> },
  { name: 'Backend Engineer', company: 'Amazon', tags: ['NodeJS', 'System Design', 'Databases', 'APIs'], icon: <Database size={20} /> },
  { name: 'Full Stack Developer', company: 'Microsoft', tags: ['MERN Stack', 'Deployment', 'SQL', 'State'], icon: <Server size={20} /> },
  { name: 'Software Engineer (SDE)', company: 'Meta', tags: ['Algorithms', 'Data Structures', 'LeetCode'], icon: <Terminal size={20} /> },
  { name: 'AI & Machine Learning Engineer', company: 'NVIDIA', tags: ['Python', 'LLMs', 'Neural Networks', 'PyTorch'], icon: <Brain size={20} /> },
  { name: 'DevOps & Cloud Engineer', company: 'Netflix', tags: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'], icon: <Cloud size={20} /> }
];

const EVALUATION_STEPS = [
  'Connecting to ApexHire AI Evaluation Engine...',
  'Analyzing verbal responses & transcribing audio...',
  'Measuring technical depth & concept coverage...',
  'Grading response quality against industry benchmarks...',
  'Generating specific improvement recommendations...',
  'Finalizing performance scorecard report...'
];

const StudentMockInterviews = () => {
  const { authHeader } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [stage, setStage] = useState('setup'); // 'setup', 'lobby', 'interview', 'evaluating', 'result'
  const [role, setRole] = useState('Full Stack Developer');
  const [company, setCompany] = useState('Google');
  const [type, setType] = useState('Technical');

  const changeStage = (newStage) => {
    setStage(newStage);
    switch (newStage) {
      case 'lobby':
        navigate('/student/mock-interviews/lobby');
        break;
      case 'interview':
        navigate('/student/mock-interviews/room');
        break;
      case 'evaluating':
        navigate('/student/mock-interviews/evaluating');
        break;
      case 'result':
        navigate('/student/mock-interviews/report');
        break;
      case 'setup':
      default:
        navigate('/student/mock-interviews');
        break;
    }
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/student/mock-interviews/lobby')) {
      setStage('lobby');
    } else if (path.includes('/student/mock-interviews/room')) {
      setStage('interview');
    } else if (path.includes('/student/mock-interviews/evaluating')) {
      setStage('evaluating');
    } else if (path.includes('/student/mock-interviews/report')) {
      setStage('result');
    } else if (path === '/student/mock-interviews' || path === '/student/mock-interviews/') {
      setStage('setup');
    }
  }, [location.pathname]);

  // Media Config States
  const [useCamera, setUseCamera] = useState(true);
  const [useVoiceMode, setUseVoiceMode] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interviewerSpeaking, setInterviewerSpeaking] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const [webcamError, setWebcamError] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const [evalResult, setEvalResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Score History & Grading States
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [evalStep, setEvalStep] = useState(0);

  const tempResultRef = useRef(null);
  const evalStepRef = useRef(0);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/mock-interviews`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch mock interview history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (stage === 'setup') {
      fetchHistory();
    }
  }, [stage]);

  useEffect(() => {
    let interval;
    if (stage === 'evaluating') {
      setEvalStep(0);
      evalStepRef.current = 0;
      interval = setInterval(() => {
        setEvalStep((prev) => {
          const nextStep = prev + 1;
          if (prev < EVALUATION_STEPS.length - 1) {
            evalStepRef.current = nextStep;
            return nextStep;
          } else {
            clearInterval(interval);
            if (tempResultRef.current) {
              setEvalResult(tempResultRef.current);
              changeStage('result');
            }
            return prev;
          }
        });
      }, 750); // 750ms per step
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stage]);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  // Clean up media and speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
      stopSpeechRecognition();
      window.speechSynthesis.cancel();
    };
  }, []);

  // Handle webcam stream startup
  useEffect(() => {
    if (stage === 'interview' && useCamera) {
      startWebcam();
    } else {
      stopWebcam();
    }
  }, [stage, useCamera]);

  // Trigger text-to-speech when question changes
  useEffect(() => {
    if (stage === 'interview' && questions.length > 0) {
      const qText = questions[currentIdx]?.question;
      if (qText) {
        stopSpeechRecognition();
        speakQuestion(qText);
      }
    }
  }, [currentIdx, stage, questions]);

  const startWebcam = () => {
    setWebcamError(null);
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        setWebcamStream(stream);
        // Wait for video element to mount
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 100);
      })
      .catch(err => {
        setWebcamError('Camera blocked or not found. Fallback avatar activated.');
        console.error(err);
      });
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
  };

  const [isPaused, setIsPaused] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const silenceTimerRef = useRef(null);

  // Inactivity / Silence Detection (Prompt user after 15s if quiet)
  useEffect(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    if (stage === 'interview' && !interviewerSpeaking && !isPaused && !currentAnswer.trim()) {
      silenceTimerRef.current = setTimeout(() => {
        if (!currentAnswer.trim() && stage === 'interview' && !isPaused) {
          const promptText = "Are you still there? Take your time to think, or click Repeat Question if you'd like me to read it again.";
          addToast("Ava: Are you still there? Take your time!", "info");
          speakQuestion(promptText);
        }
      }, 15000);
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [stage, currentIdx, interviewerSpeaking, isPaused, currentAnswer]);

  // Conversational Voice System - Text to Speech (TTS)
  const speakQuestion = (text) => {
    window.speechSynthesis.cancel(); // Stop any pending speech
    if (isMuted) {
      setTimeout(() => {
        if (useVoiceMode && stage === 'interview') {
          startSpeechRecognition();
        }
      }, 1500);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88; // Calm, clear, professional human pace ("aaram aaram se bole")
    utterance.pitch = 1.0;
    utterance.onstart = () => setInterviewerSpeaking(true);
    utterance.onend = () => {
      setInterviewerSpeaking(false);
      // Auto-start recording after AI finishes asking the question
      if (useVoiceMode && stage === 'interview') {
        startSpeechRecognition();
      }
    };
    utterance.onerror = () => setInterviewerSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Conversational Voice System - Speech to Text (STT)
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Speech recognition not supported in this browser.', 'warning');
      return;
    }

    // Stop current recognition if exists
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => setIsRecording(true);
    rec.onresult = (event) => {
      let speechResult = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          speechResult += event.results[i][0].transcript + ' ';
        }
      }
      if (speechResult) {
        setCurrentAnswer(prev => prev + speechResult);
      }
    };
    rec.onerror = (err) => {
      console.error('Speech recognition error:', err.error);
      if (err.error === 'not-allowed') {
        addToast('Microphone access blocked.', 'error');
        setIsRecording(false);
      }
    };
    rec.onend = () => setIsRecording(false);

    try {
      rec.start();
      recognitionRef.current = rec;
    } catch (e) {
      console.error(e);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const handleStartInterview = async (selectedRole = role, selectedCompany = company) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/generate-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ role: selectedRole, company: selectedCompany, type })
      });

      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        setAnswers(new Array(data.questions.length).fill(''));
        setCurrentIdx(0);
        setCurrentAnswer('');
        changeStage('lobby'); // Open pre-interview waiting lobby screen
      } else {
        addToast('Failed to generate interview questions. Try again.', 'error');
      }
    } catch (err) {
      addToast('Network error during interview setup.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const launchInterviewFromLobby = () => {
    changeStage('interview');
    if (useCamera) startWebcam();
    if (questions.length > 0) {
      const qObj = questions[0];
      const qText = typeof qObj === 'string' ? qObj : qObj.question;
      speakQuestion(`Welcome! Let's begin your ${type} interview for ${role} at ${company}. Here is your first question: ${qText}`);
    }
  };

  const handleNextQuestion = () => {
    window.speechSynthesis.cancel();
    stopSpeechRecognition();

    const updatedAnswers = [...answers];
    updatedAnswers[currentIdx] = currentAnswer;
    setAnswers(updatedAnswers);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setCurrentAnswer(answers[currentIdx + 1] || '');
    } else {
      stopWebcam();
      handleSubmitInterview(updatedAnswers);
    }
  };

  const handlePrevQuestion = () => {
    window.speechSynthesis.cancel();
    stopSpeechRecognition();

    const updatedAnswers = [...answers];
    updatedAnswers[currentIdx] = currentAnswer;
    setAnswers(updatedAnswers);

    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setCurrentAnswer(answers[currentIdx - 1] || '');
    }
  };

  const handleSubmitInterview = async (finalAnswers) => {
    changeStage('evaluating');
    tempResultRef.current = null;
    try {
      const questionTexts = questions.map(q => q.question);
      const res = await fetch(`${API_BASE}/ai/evaluate-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          role,
          company,
          type,
          questions: questionTexts,
          answers: finalAnswers
        })
      });

      if (res.ok) {
        const data = await res.json();
        tempResultRef.current = data;
        
        // If sequential grading steps are already completed, transition immediately
        if (evalStepRef.current >= EVALUATION_STEPS.length - 1) {
          setEvalResult(data);
          changeStage('result');
        }
      } else {
        addToast('Evaluation grading failed', 'error');
        changeStage('interview');
      }
    } catch (err) {
      addToast('Network error evaluating interview', 'error');
      changeStage('interview');
    }
  };

  const selectPreset = (preset) => {
    setRole(preset.name);
    setCompany(preset.company);
  };

  return (
    <div className="container-fluid py-4" style={{ color: 'var(--text-primary)' }}>
      {/* Setup screen */}
      {stage === 'setup' && (
        <div className="row">
          <div className="col-12">
            <div 
              className="glass-card p-3 p-md-4"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', width: '100%' }}>
                <div 
                  style={{ 
                    width: '42px', 
                    height: '42px', 
                    borderRadius: '12px', 
                    background: 'rgba(255, 255, 255, 0.08)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#ffffff', 
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <Cpu size={22} color="#ffffff" />
                </div>
                <div>
                  <h1 style={{ fontWeight: '800', fontSize: '1.35rem', letterSpacing: '-0.3px', margin: 0, color: 'var(--text-primary)' }}>
                    AI Mock Interview Room
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
                    Select a target role below to start a simulated interview with real-time feedback and grading.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <RefreshCw className="animate-spin text-primary mb-3 mx-auto" size={40} />
                  <h4 className="font-bold">Generating AI Questions...</h4>
                  <p className="text-muted text-xs">Ava is preparing technical questions for {role} at {company}.</p>
                </div>
              ) : (
                <>
                  <div className="preset-grid mt-2">
                    {PRESET_ROLES.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          selectPreset(preset);
                          handleStartInterview(preset.name, preset.company);
                        }}
                        className="preset-card"
                      >
                        <div>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="preset-icon-container">
                              {preset.icon}
                            </div>
                            <span className="text-xxs font-bold text-muted uppercase tracking-wider">TOP COMPANY</span>
                          </div>
                          <h4 className="preset-card-title">{preset.name}</h4>
                          <span className="preset-card-company">Simulated Target: {preset.company}</span>
                        </div>
                        
                        <div className="mt-3">
                          <div className="d-flex flex-wrap gap-1 mb-2">
                            {preset.tags.map((tag, tIdx) => (
                              <span key={tIdx} className="preset-tag">{tag}</span>
                            ))}
                          </div>
                          <span className="preset-launch-btn">
                            Launch Room <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* History Section */}
                  <div style={{ marginTop: '40px', paddingTop: '28px', borderTop: '1px solid var(--border-color)' }}>
                    <div className="d-flex align-items-center" style={{ gap: '8px', marginBottom: '18px' }}>
                      <Award size={20} className="text-secondary animate-pulse" style={{ flexShrink: 0 }} />
                      <h3 style={{ fontWeight: 600, fontSize: '1.15rem', letterSpacing: '-0.2px', margin: 0 }}>
                        Your Mock Interview History
                      </h3>
                    </div>

                    {historyLoading ? (
                      <div className="text-center py-4">
                        <RefreshCw className="animate-spin text-secondary mb-2 mx-auto" size={24} />
                        <p className="text-muted text-xs">Loading past sessions...</p>
                      </div>
                    ) : history.length === 0 ? (
                      <div className="text-center py-4 rounded" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)' }}>
                        <HelpCircle size={28} className="text-muted mb-2 mx-auto" />
                        <p className="text-muted text-sm mb-0">No past mock interviews recorded yet.</p>
                        <p className="text-xxs text-muted mt-1">Select a role above to launch your first session!</p>
                      </div>
                    ) : (
                      <div className="d-flex flex-column" style={{ gap: '14px', marginTop: '14px' }}>
                        {history.map((item, idx) => (
                          <div 
                            key={idx}
                            style={{
                              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                              cursor: 'pointer',
                              background: 'var(--bg-surface)',
                              borderWidth: '1px',
                              borderStyle: 'solid',
                              borderColor: 'var(--border-color)',
                              borderLeftWidth: '5px',
                              borderLeftColor: item.overallScore >= 80 ? 'var(--success)' : item.overallScore >= 60 ? 'var(--warning)' : 'var(--danger)',
                              boxShadow: 'var(--shadow-sm)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '20px',
                              marginBottom: '16px',
                              borderRadius: '12px',
                              padding: '1.25rem 1.75rem'
                            }}
                            onClick={() => {
                              setEvalResult(item);
                              changeStage('result');
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-3px)';
                              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                              e.currentTarget.style.borderColor = 'hsla(250, 84%, 58%, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                              e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}
                          >
                            <div className="d-flex align-items-center" style={{ gap: '20px' }}>
                              <div className="avatar-circle font-bold" style={{
                                width: 50,
                                height: 50,
                                border: `3px solid ${item.overallScore >= 80 ? 'var(--success)' : item.overallScore >= 60 ? 'var(--warning)' : 'var(--danger)'}`,
                                color: item.overallScore >= 80 ? 'var(--success)' : item.overallScore >= 60 ? 'var(--warning)' : 'var(--danger)',
                                background: item.overallScore >= 80 ? 'var(--success-glow)' : item.overallScore >= 60 ? 'var(--warning-glow)' : 'var(--danger-glow)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontSize: '0.98rem'
                              }}>
                                {item.overallScore}%
                              </div>
                              <div>
                                <div className="d-flex align-items-center" style={{ gap: '12px', flexWrap: 'wrap' }}>
                                  <span className="font-bold text-base" style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>{item.role}</span>
                                  <span className="badge text-xxs bg-primary-glow text-primary font-semibold" style={{ padding: '3px 10px', borderRadius: '4px', fontSize: '0.7rem' }}>{item.type}</span>
                                </div>
                                <div className="d-flex align-items-center mt-2 text-xs text-muted flex-wrap" style={{ gap: '16px', fontSize: '0.8rem' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <Building size={13} className="text-secondary" /> <span>{item.company}</span>
                                  </span>
                                  <span style={{ color: 'var(--border-color)' }}>•</span>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={13} /> <span>{new Date(item.createdAt).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}</span>
                                  </span>
                                  <span style={{ color: 'var(--border-color)' }}>•</span>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={13} /> <span>{new Date(item.createdAt).toLocaleTimeString(undefined, {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="d-flex align-items-center">
                              <button 
                                className="btn btn-sm btn-outline font-bold d-flex align-items-center"
                                style={{ padding: '0.55rem 1.25rem', fontSize: '0.78rem', gap: '8px' }}
                              >
                                View Report <ArrowRight size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pre-Interview Waiting Lobby */}
      {stage === 'lobby' && (
        <div className="row justify-content-center">
          <div className="col-xl-9 col-lg-10">
            <div className="glass-card p-4 text-center">
              <div style={{ padding: '0.4rem 1.2rem', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }}></span>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff' }}>Pre-Interview Preparation Lobby</span>
              </div>

              <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.4rem' }}>
                Ready for your {type} Interview for {role}?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
                Target Company: <strong style={{ color: '#ffffff' }}>{company}</strong> • 5 Industry-Level Questions • Calm Speech Rate (0.88x)
              </p>

              {/* Instructions Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', margin: '1.5rem 0', textAlign: 'left' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Camera size={18} color="#ffffff" /> Media & Audio Checklist
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={14} color="#34d399" /> <span>Microphone & Voice STT Engine Ready</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={14} color="#34d399" /> <span>AI Voice (Ava) set to Calm & Steady Pace (0.88x)</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={14} color="#34d399" /> <span>Webcam Video Preview Enabled</span>
                    </li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HelpCircle size={18} color="#ffffff" /> Real-Time Interview Rules
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    • Ava will speak each question at a slow, clear pace.<br />
                    • If you need time to think, click <strong>"Pause / Think"</strong>.<br />
                    • If you're quiet for 15s, Ava will prompt: <em>"Are you still there?"</em>.<br />
                    • Click <strong>"Start Interview"</strong> when you are ready.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  className="btn btn-outline" 
                  onClick={() => changeStage('setup')}
                  style={{ padding: '0.8rem 1.75rem', borderRadius: '10px' }}
                >
                  ← Back to Roles
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={launchInterviewFromLobby}
                  style={{ padding: '0.8rem 2.5rem', borderRadius: '10px', background: '#ffffff', color: '#0b0f19', fontWeight: '800', boxShadow: '0 4px 16px rgba(255, 255, 255, 0.3)' }}
                >
                  🚀 Start Technical Interview Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active simulation console */}
      {stage === 'interview' && questions.length > 0 && (
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-color flex-wrap gap-2">
                <div>
                  <span className="badge bg-primary-glow text-primary text-xs mb-1">{type} Round</span>
                  <span className="font-bold h6 d-block mb-0">{role} Interview Room</span>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span className="text-xs text-muted">
                    Question {currentIdx + 1} of {questions.length}
                  </span>
                  
                  {/* Control Toolbar: Pause, Repeat, Hint */}
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <button 
                      type="button"
                      onClick={() => setIsPaused(!isPaused)}
                      className={`btn btn-xs ${isPaused ? 'btn-warning' : 'btn-outline'}`}
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
                      title={isPaused ? "Resume Interview" : "Pause Interview Timer"}
                    >
                      {isPaused ? '▶ Resume' : '⏸ Pause / Think'}
                    </button>

                    <button 
                      type="button"
                      onClick={() => speakQuestion(questions[currentIdx]?.question || questions[currentIdx])}
                      className="btn btn-xs btn-outline"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
                      title="Re-speak question at calm pace"
                    >
                      🔄 Repeat Question
                    </button>

                    <button 
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className="btn btn-xs btn-outline"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
                      title="Show Technical Hint"
                    >
                      💡 Hint
                    </button>

                    <button 
                      onClick={() => {
                        setIsMuted(!isMuted);
                        window.speechSynthesis.cancel();
                      }}
                      className="p-2 rounded bg-surface-elevated text-muted hover:text-primary"
                      style={{ display: 'inline-flex' }}
                      title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Split Screen Video Grid */}
              <div className="interview-grid mb-4">
                {/* Left Side: AI Interviewer */}
                <div 
                  className="video-panel"
                  style={{
                    border: interviewerSpeaking ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    boxShadow: interviewerSpeaking ? '0 0 20px var(--primary-glow)' : 'var(--shadow-md)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <span className="position-absolute text-xxs text-muted font-bold px-2 py-1 bg-base rounded" style={{ top: 10, left: 10, border: '1px solid var(--border-color)', zIndex: 10 }}>
                    AI INTERVIEWER (AVA)
                  </span>
                  
                  <div className="talking-avatar">
                    <Cpu size={40} className={interviewerSpeaking ? "animate-pulse" : ""} />
                  </div>
                  
                  <div className={`wave-container ${interviewerSpeaking ? 'active' : ''}`}>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                  </div>

                  <span className="text-xs text-muted mt-3 font-semibold">
                    {interviewerSpeaking ? "Ava is speaking..." : isRecording ? "Ava is listening..." : "Ava is online"}
                  </span>
                </div>

                {/* Right Side: Candidate webcam */}
                <div 
                  className="video-panel"
                  style={{
                    border: isRecording ? '2px solid var(--danger)' : '1px solid var(--border-color)',
                    boxShadow: isRecording ? '0 0 20px var(--danger-glow)' : 'var(--shadow-md)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <span className="position-absolute text-xxs text-muted font-bold px-2 py-1 bg-base rounded" style={{ top: 10, left: 10, border: '1px solid var(--border-color)', zIndex: 10 }}>
                    CANDIDATE VIEW (YOU)
                  </span>
                  
                  {useCamera && !webcamError ? (
                    <video ref={videoRef} autoPlay playsInline muted className="video-feed" />
                  ) : (
                    <div className="text-center p-4 text-muted">
                      <Camera size={44} className="mb-2 mx-auto text-primary-glow" style={{ color: 'var(--primary)' }} />
                      <p className="text-xs mb-0">{webcamError || "Webcam is disabled"}</p>
                    </div>
                  )}

                  {isRecording && (
                    <div className="position-absolute d-flex align-items-center gap-2 px-2 py-1 bg-danger-glow rounded" style={{ bottom: 10, right: 10, zIndex: 10 }}>
                      <span className="pulse-record"></span>
                      <span className="text-danger text-xxs font-bold">MIC LIVE</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-base rounded-full h-1.5 mb-4" style={{ height: 6, backgroundColor: 'var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
                <div className="bg-primary h-1.5" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%`, height: '100%', transition: 'width 0.3s ease' }}></div>
              </div>

              {/* Question Text block */}
              <div className="p-4 rounded mb-4 bg-surface-elevated border border-color" style={{ minHeight: '100px' }}>
                <div className="d-flex gap-3 align-items-start">
                  <HelpCircle className="text-primary flex-shrink-0 mt-1" size={24} />
                  <div>
                    <span className="text-xxs text-primary font-bold d-block mb-1">CURRENT QUESTION</span>
                    <p className="font-semibold text-lg mb-0" style={{ lineHeight: 1.5 }}>
                      {questions[currentIdx]?.question}
                    </p>
                  </div>
                </div>
              </div>

              {/* Response controls */}
              <div className="form-group mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label font-semibold mb-0">Your Response</label>
                  {useVoiceMode && (
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isRecording) {
                            stopSpeechRecognition();
                          } else {
                            startSpeechRecognition();
                          }
                        }}
                        className={`btn btn-xs ${isRecording ? 'btn-danger' : 'btn-primary'} d-flex align-items-center gap-1`}
                      >
                        {isRecording ? <><MicOff size={12} /> Pause Mic</> : <><Mic size={12} /> Speak Now</>}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentAnswer('')}
                        className="btn btn-xs btn-outline d-flex align-items-center gap-1"
                        title="Clear response text"
                      >
                        <Trash2 size={12} /> Clear
                      </button>
                    </div>
                  )}
                </div>

                <textarea 
                  className="form-input" 
                  rows="6" 
                  placeholder={useVoiceMode ? "Click 'Speak Now' to record your voice answer or type your response here..." : "Explain your approach, design components, or code solutions..."}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  style={{ fontFamily: 'var(--font-primary)', fontSize: '0.95rem', lineHeight: 1.6 }}
                ></textarea>
              </div>

              {/* Navigation buttons */}
              <div className="d-flex justify-content-between align-items-center">
                <button 
                  onClick={handlePrevQuestion} 
                  className="btn btn-outline"
                  disabled={currentIdx === 0}
                >
                  Previous Question
                </button>
                <button 
                  onClick={handleNextQuestion} 
                  className="btn btn-primary d-flex align-items-center gap-1"
                >
                  {currentIdx === questions.length - 1 ? 'Submit & Grade' : 'Next Question'} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evaluating screen */}
      {stage === 'evaluating' && (
        <div className="row justify-content-center py-5">
          <div className="col-lg-6 col-md-8 col-sm-10">
            <div 
              className="glass-card p-4 text-center" 
              style={{ 
                background: 'var(--bg-surface)', 
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div className="position-relative d-inline-block mb-4">
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem', borderWidth: '0.25rem' }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div 
                  className="position-absolute top-50 start-50 translate-middle text-primary"
                  style={{ transform: 'translate(-50%, -50%)' }}
                >
                  <Brain size={20} className="animate-pulse" />
                </div>
              </div>

              <h3 className="font-bold mb-1 text-lg" style={{ color: 'var(--text-primary)' }}>
                ApexHire AI Evaluation Engine
              </h3>
              <p className="text-xs text-muted mb-4">
                Analyzing responses and building comprehensive grade report
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-base rounded-full h-1.5 mb-4" style={{ height: 6, backgroundColor: 'var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
                <div 
                  className="bg-primary h-1.5" 
                  style={{ 
                    width: `${((evalStep + 1) / EVALUATION_STEPS.length) * 100}%`, 
                    height: '100%', 
                    transition: 'width 0.4s ease' 
                  }}
                ></div>
              </div>

              {/* Sequential Checklist */}
              <div className="text-start d-flex flex-column gap-2.5 mt-4 p-3 rounded bg-base border border-color">
                {EVALUATION_STEPS.map((step, idx) => {
                  const isCompleted = evalStep > idx;
                  const isActive = evalStep === idx;
                  const isPending = evalStep < idx;

                  return (
                    <div 
                      key={idx} 
                      className="d-flex align-items-center gap-3" 
                      style={{ 
                        opacity: isPending ? 0.35 : 1, 
                        transition: 'opacity 0.3s ease',
                      }}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="rounded-circle d-flex align-items-center justify-content-center text-success" style={{ width: 18, height: 18, background: 'var(--success-glow)' }}>
                            <CheckCircle size={12} />
                          </div>
                        ) : isActive ? (
                          <div className="spinner-border text-primary" style={{ width: 14, height: 14, borderWidth: '2px' }} />
                        ) : (
                          <div className="rounded-circle" style={{ width: 10, height: 10, background: 'var(--text-muted)', borderRadius: '50%', margin: '0 4px' }} />
                        )}
                      </div>
                      <span 
                        className={`text-xs ${isActive ? 'font-bold text-primary animate-pulse' : 'text-muted'}`}
                        style={{ fontSize: '0.8rem' }}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results details screen */}
      {stage === 'result' && evalResult && (
        <div className="row justify-content-center">
          <div className="col-lg-9 col-md-11">
            <div className="glass-card p-5">
              <div className="text-center mb-5 pb-4 border-bottom border-color">
                <span className="badge bg-success-glow text-success text-sm mb-2">Simulated Grade Report</span>
                <h1 style={{ fontWeight: 800 }}>Mock Interview Results</h1>
                
                {/* Visual score bubble */}
                <div 
                  className="avatar-circle mx-auto my-4 font-bold" 
                  style={{ 
                    width: 100, 
                    height: 100, 
                    fontSize: '2rem',
                    border: '5px solid var(--success)',
                    color: 'var(--success)',
                    background: 'var(--success-glow)'
                  }}
                >
                  {evalResult.overallScore}%
                </div>

                <p className="text-muted text-sm mx-auto mb-0" style={{ maxWidth: '600px' }}>
                  {evalResult.summary}
                </p>
              </div>

              {/* Question Feedback List */}
              <div className="d-flex flex-column gap-4">
                {evalResult.feedback.map((fb, idx) => (
                  <div key={idx} className="p-4 rounded border border-color" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                      <span className="font-semibold text-base text-primary">Q{idx + 1}: {fb.question}</span>
                      <span className="badge bg-primary-glow text-primary font-bold">Grade: {fb.score} / 10</span>
                    </div>

                    <div className="mb-3 text-xs">
                      <strong>Your Answer:</strong>
                      <p className="text-muted mt-1 p-2 rounded bg-base mb-0">{fb.answer || '(No answer provided)'}</p>
                    </div>

                    <div className="mb-3 text-xs" style={{ borderLeft: '3px solid var(--warning)', paddingLeft: '0.75rem' }}>
                      <strong className="text-warning">Improvement Tip:</strong>
                      <p className="mt-1 mb-0">{fb.tips}</p>
                    </div>

                    {fb.modelAnswer && (
                      <div className="text-xs" style={{ borderLeft: '3px solid var(--success)', paddingLeft: '0.75rem' }}>
                        <strong className="text-success">Model Reference Answer:</strong>
                        <p className="mt-1 mb-0 text-muted">{fb.modelAnswer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="d-flex justify-content-center gap-3 mt-5 flex-wrap">
                <button 
                  onClick={() => {
                    changeStage('setup');
                    setEvalResult(null);
                  }} 
                  className="btn btn-outline d-flex align-items-center gap-2"
                >
                  <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Mock Interviews
                </button>
                <button 
                  onClick={() => {
                    handleStartInterview(evalResult.role, evalResult.company);
                  }} 
                  className="btn btn-primary d-flex align-items-center gap-2"
                >
                  <RefreshCw size={16} /> Retake Mock Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMockInterviews;
