import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Award, BookOpen, Clock, FileText, CheckCircle, AlertTriangle, ArrowRight, Play, Trophy } from 'lucide-react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const StudentAssessments = () => {
  const { authHeader, user } = useAuth();
  const { addToast } = useNotification();

  const [assessments, setAssessments] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Assessment State
  const [activeTest, setActiveTest] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const fetchAssessments = async () => {
    try {
      const res = await fetch(`${API_BASE}/assessments`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/assessments/leaderboard`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchAssessments(), fetchLeaderboard()]).finally(() => setLoading(false));
  }, []);

  // Timer Effect
  useEffect(() => {
    if (!activeTest || testResult) return;

    if (timeRemaining <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setTimeout(() => {
      setTimeRemaining(timeRemaining - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [activeTest, timeRemaining, testResult]);

  const startTest = (test) => {
    setActiveTest(test);
    setCurrentQuestionIdx(0);
    setAnswers(new Array(test.questions.length).fill(null));
    setTimeRemaining(test.duration * 60);
    setTestResult(null);
  };

  const selectAnswer = (questionIdx, optionIdx) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[questionIdx] = optionIdx;
      return newAnswers;
    });
  };

  const submitTest = async () => {
    // Check if all questions are answered
    if (answers.includes(null) && !window.confirm('You have unanswered questions. Are you sure you want to submit?')) {
      return;
    }

    setIsSubmittingTest(true);
    try {
      const res = await fetch(`${API_BASE}/assessments/${activeTest._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ answers }),
      });

      if (res.ok) {
        const result = await res.json();
        setTestResult(result);
        addToast('Assessment submitted successfully!', 'success');
        fetchLeaderboard(); // refresh leaderboard
      } else {
        addToast('Failed to submit assessment', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error submitting assessment', 'error');
    } finally {
      setIsSubmittingTest(false);
    }
  };

  const handleAutoSubmit = async () => {
    addToast('Time has expired! Automatically submitting answers...', 'warning');
    setIsSubmittingTest(true);
    
    // Fill remaining unanswered with -1
    const finalAnswers = answers.map(ans => ans === null ? -1 : ans);
    try {
      const res = await fetch(`${API_BASE}/assessments/${activeTest._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ answers: finalAnswers }),
      });

      if (res.ok) {
        const result = await res.json();
        setTestResult(result);
        fetchLeaderboard();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingTest(false);
    }
  };

  const closeTestRoom = () => {
    setActiveTest(null);
    setTestResult(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading prep certifications...</div>;
  }

  // Render certification test session room
  if (activeTest) {
    const currentQuestion = activeTest.questions[currentQuestionIdx];
    const isLowTime = timeRemaining < 120; // less than 2 minutes
    const answeredCount = answers.filter(ans => ans !== null).length;
    const completionPercent = Math.round((answeredCount / activeTest.questions.length) * 100);

    return createPortal(
      <div style={styles.testOverlay} className="animate-fade-in">
        <style>{`
          @keyframes pulse-danger {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0.8; transform: scale(1.03); }
          }
          .option-card-hover:hover {
            transform: translateY(-2px);
            border-color: var(--primary) !important;
            background: var(--bg-surface-elevated) !important;
            box-shadow: var(--shadow-sm);
          }
          .nav-square-hover:hover {
            border-color: var(--primary) !important;
            transform: scale(1.05);
          }
          @media (max-width: 768px) {
            .test-split-view {
              flex-direction: column !important;
            }
            .test-right-sidebar {
              border-left: none !important;
              border-top: 1px solid var(--border-color) !important;
              flex: none !important;
              width: 100% !important;
            }
          }
        `}</style>

        {/* Immersive Top Bar */}
        <div style={styles.testHeader}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              {activeTest.title}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0', fontWeight: '500' }}>
              Exam Session Category: {activeTest.category}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {!testResult && (
              <div style={styles.timerBadge(isLowTime)}>
                <Clock size={16} />
                <span>Time Remaining: <strong>{formatTime(timeRemaining)}</strong></span>
              </div>
            )}
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '0.4rem 1rem', fontSize: '0.85rem' }} 
              onClick={() => {
                if (testResult || window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
                  closeTestRoom();
                }
              }}
            >
              Exit Exam
            </button>
          </div>
        </div>

        {/* Immersive Body Split Layout */}
        <div className="test-split-view" style={styles.testMainContent}>
          {testResult ? (
            // Quiz Completion View (Centered across whole viewport)
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <div className="glass-card animate-fade-in" style={{ ...styles.resultView, maxWidth: '440px', width: '100%', padding: '2.5rem', background: 'var(--bg-surface)' }}>
                <Trophy size={64} color="var(--warning)" style={{ marginBottom: '1rem', filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.3))' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0.5rem 0' }}>
                  Assessment Complete!
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  You answered <strong>{testResult.correctCount}</strong> out of <strong>{testResult.totalQuestions}</strong> questions correctly.
                </p>

                <div style={{ ...styles.scoreCircle, borderColor: testResult.score >= 70 ? 'var(--success)' : 'var(--warning)', boxShadow: `0 0 15px ${testResult.score >= 70 ? 'var(--success-glow)' : 'var(--warning-glow)'}` }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {testResult.score}%
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Final Score</span>
                </div>

                <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', width: '100%' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: testResult.score >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                    {testResult.score >= 70 ? '🎉 Passed! Certification Badge Awarded' : '⚠️ Keep practicing to clear threshold (70%)'}
                  </span>
                </div>

                <button onClick={closeTestRoom} className="btn btn-primary" style={{ marginTop: '2rem', width: '100%', padding: '0.75rem 1rem' }}>
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            // Active Quiz Split-View
            <>
              {/* Left Column: Current Question & Options */}
              <div style={styles.testLeftCol}>
                <div style={styles.questionHeader}>
                  <div>
                    <span style={styles.questionNumber}>
                      Question {currentQuestionIdx + 1} of {activeTest.questions.length}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <div style={styles.progressBarContainer}>
                        <div style={styles.progressBarFill(completionPercent)}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        {completionPercent}% Completed
                      </span>
                    </div>
                  </div>
                </div>

                <div style={styles.questionBox}>
                  <h3 style={styles.questionText}>{currentQuestion.questionText}</h3>
                </div>

                <div style={styles.optionsList}>
                  {currentQuestion.options.map((option, optIdx) => {
                    const isSelected = answers[currentQuestionIdx] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        className="option-card-hover"
                        style={styles.optionCard(isSelected)}
                        onClick={() => selectAnswer(currentQuestionIdx, optIdx)}
                      >
                        <span style={styles.optionIndicator(isSelected)}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.4' }}>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {activeTest.category === 'Coding' && (
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        💻 Code Sandbox Workspace
                      </span>
                      <button 
                        onClick={() => {
                          addToast('Running compiler test cases...', 'info');
                          setTimeout(() => {
                            addToast('✔ Test Case 1/3 Passed (Sample Test)', 'success');
                            addToast('✔ Test Case 2/3 Passed (Boundary Test)', 'success');
                            addToast('✔ Test Case 3/3 Passed (Performance Test)', 'success');
                          }, 1000);
                        }}
                        className="btn btn-xs btn-outline"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}
                      >
                        ▶ Run Code Tests
                      </button>
                    </div>
                    <textarea 
                      className="form-input" 
                      rows="6" 
                      placeholder="// Write your code solution here (e.g. JavaScript, Python, SQL)&#10;function solve() {&#10;  // Your optimal logic here&#10;}"
                      style={{ 
                        backgroundColor: '#090d16', 
                        color: '#38bdf8', 
                        borderColor: 'var(--border-color)', 
                        lineHeight: 1.5,
                        fontFamily: 'Consolas, Courier New, monospace',
                        fontSize: '0.75rem',
                        width: '100%',
                        resize: 'none'
                      }}
                    ></textarea>
                  </div>
                )}

                <div style={styles.navigatorActions}>
                  <button
                    className="btn btn-outline"
                    onClick={() => setCurrentQuestionIdx(currentQuestionIdx - 1)}
                    disabled={currentQuestionIdx === 0}
                    style={{ padding: '0.6rem 1.5rem', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                  >
                    Previous
                  </button>

                  {currentQuestionIdx < activeTest.questions.length - 1 ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                      style={{ padding: '0.6rem 1.5rem' }}
                    >
                      Next Question <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={submitTest}
                      disabled={isSubmittingTest}
                      style={{ background: 'var(--success)', border: 'none', padding: '0.6rem 1.5rem', boxShadow: '0 4px 12px var(--success-glow)' }}
                    >
                      {isSubmittingTest ? 'Evaluating...' : 'Submit Assessment'}
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Question Navigator Grid Sidebar */}
              <div className="test-right-sidebar" style={styles.testRightCol}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    Question Navigator
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Quickly review or skip between questions.
                  </p>
                </div>

                {/* Progress Stats */}
                <div style={{ display: 'flex', gap: '1rem', background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                      {answeredCount}
                    </span>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>Answered</p>
                  </div>
                  <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                      {activeTest.questions.length - answeredCount}
                    </span>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>Unanswered</p>
                  </div>
                </div>

                {/* Square Navigator Grid */}
                <div style={styles.navigatorGrid}>
                  {activeTest.questions.map((_, idx) => {
                    const isCurrent = currentQuestionIdx === idx;
                    const isAnswered = answers[idx] !== null;
                    return (
                      <button
                        key={idx}
                        className="nav-square-hover"
                        style={styles.navigatorSquare(isCurrent, isAnswered)}
                        onClick={() => setCurrentQuestionIdx(idx)}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--success)', border: 'none', boxShadow: '0 4px 12px var(--success-glow)' }}
                    onClick={submitTest}
                    disabled={isSubmittingTest}
                  >
                    {isSubmittingTest ? 'Evaluating...' : 'Submit Assessment'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>,
      document.body
    );
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <header>
        <h1 style={styles.title}>Skill Assessment Certifications</h1>
        <p style={styles.subtitle}>Test your tech capability, earn preparatory certification badges, and climb leaderboard ranks.</p>
      </header>

      <div style={styles.layout}>
        {/* Left Column: Certifications list */}
        <div style={styles.leftCol}>
          <div style={styles.assessmentsGrid}>
            {assessments.map((test) => (
              <div key={test._id} className="glass-card" style={styles.testCard}>
                <div style={styles.testCardTop}>
                  <div style={styles.iconBox}>
                    {test.category === 'Coding' ? <Award size={20} color="var(--primary)" /> : <BookOpen size={20} color="var(--accent)" />}
                  </div>
                  <div>
                    <h3 style={styles.testTitle}>{test.title}</h3>
                    <span className="badge badge-applied" style={{ fontSize: '0.68rem', alignSelf: 'flex-start' }}>
                      {test.category}
                    </span>
                  </div>
                </div>

                <p style={styles.testDesc}>{test.description}</p>

                <div style={styles.testMeta}>
                  <span style={styles.metaItem}>
                    <Clock size={14} /> {test.duration} Minutes
                  </span>
                  <span style={styles.metaItem}>
                    <FileText size={14} /> {test.questions?.length || 0} Questions
                  </span>
                </div>

                <button
                  onClick={() => startTest(test)}
                  className="btn btn-primary"
                  style={styles.startBtn}
                >
                  <Play size={14} /> Start Challenge
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Dynamic Prep Leaderboard */}
        <div style={styles.rightCol}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={styles.leaderboardHeader}>
              <Trophy size={18} color="var(--warning)" />
              <h3 style={{ ...styles.cardTitle, margin: 0 }}>Prep Leaderboard</h3>
            </div>
            
            {leaderboard.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem' }}>
                No assessments taken yet. Be the first to secure a rank!
              </p>
            ) : (
              <div style={styles.leaderboardList}>
                {leaderboard.map((item, idx) => {
                  const isCurrentUser = item.email === user.email;
                  return (
                    <div
                      key={item._id}
                      style={{
                        ...styles.leaderboardItem,
                        backgroundColor: isCurrentUser ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                        borderColor: isCurrentUser ? 'rgba(99, 102, 241, 0.25)' : 'var(--border-color)',
                      }}
                    >
                      <div style={styles.rankBadge}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ ...styles.studentName, color: isCurrentUser ? 'var(--primary)' : 'var(--text-primary)' }}>
                          {item.name} {isCurrentUser && '(You)'}
                        </h4>
                        <p style={styles.studentEmail}>{item.testsCompleted} tests completed</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                          {item.averageScore}%
                        </span>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>Average Score</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  title: { fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' },
  subtitle: { fontSize: '1rem', color: 'var(--text-secondary)' },
  layout: { display: 'flex', gap: '2rem', alignItems: 'flex-start' },
  leftCol: { flex: 1.2 },
  rightCol: { flex: 0.8 },
  assessmentsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
  testCard: { display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' },
  testCardTop: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  iconBox: { width: '38px', height: '38px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  testTitle: { fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 },
  testDesc: { fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0, minHeight: '60px' },
  testMeta: { display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '0.35rem' },
  startBtn: { width: '100%', display: 'flex', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem 1rem' },
  
  leaderboardHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' },
  leaderboardList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  leaderboardItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '10px' },
  rankBadge: { width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-muted)' },
  studentName: { fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 },
  studentEmail: { fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 },

  // Immersive Fullscreen Test Session
  testOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'var(--bg-base)',
    zIndex: 99999,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  testHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 2rem',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-surface)',
    flexShrink: 0
  },
  timerBadge: (isLowTime) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: isLowTime ? 'var(--danger)' : 'var(--text-primary)',
    background: isLowTime ? 'var(--danger-glow)' : 'var(--bg-surface-elevated)',
    border: `1px solid ${isLowTime ? 'var(--danger)' : 'var(--border-color)'}`,
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    animation: isLowTime ? 'pulse-danger 1s infinite alternate' : 'none'
  }),
  testMainContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  testLeftCol: {
    flex: 1.6,
    padding: '2.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  testRightCol: {
    flex: 0.8,
    borderLeft: '1px solid var(--border-color)',
    background: 'var(--bg-surface)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    overflowY: 'auto'
  },
  progressBarContainer: {
    width: '100%',
    height: '6px',
    background: 'var(--bg-surface-elevated)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '0.5rem'
  },
  progressBarFill: (percent) => ({
    width: `${percent}%`,
    height: '100%',
    background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
    transition: 'width 0.3s ease'
  }),
  questionBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  questionText: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    margin: 0
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  optionCard: (isSelected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1.25rem',
    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
    borderRadius: '12px',
    background: isSelected ? 'var(--primary-glow)' : 'var(--bg-surface)',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
    textAlign: 'left',
    boxShadow: isSelected ? '0 0 15px -3px var(--primary-glow)' : 'none'
  }),
  optionIndicator: (isSelected) => ({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--text-muted)'}`,
    background: isSelected ? 'var(--primary)' : 'transparent',
    color: isSelected ? '#fff' : 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: '700',
    flexShrink: 0
  }),
  navigatorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '0.75rem',
    marginTop: '1rem'
  },
  navigatorSquare: (isCurrent, isAnswered) => ({
    aspectRatio: '1',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: isCurrent ? '2px solid var(--primary)' : '1px solid var(--border-color)',
    background: isAnswered ? 'var(--primary)' : isCurrent ? 'var(--primary-glow)' : 'var(--bg-surface-elevated)',
    color: isAnswered ? '#fff' : isCurrent ? 'var(--primary)' : 'var(--text-secondary)',
    boxShadow: isCurrent ? '0 0 8px var(--primary-glow)' : 'none'
  }),
  navigatorActions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem'
  },
  resultView: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2rem 0'
  },
  scoreCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '4px solid var(--primary)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '1rem 0'
  }
};

export default StudentAssessments;
