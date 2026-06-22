import React, { useState, useEffect } from 'react';
import { Award, Plus, Trash2, Calendar, Clock, BookOpen, Search, X, CheckCircle, AlertCircle, FileText, ChevronRight, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const AdminAssessments = () => {
  const { authHeader } = useAuth();
  const { addToast } = useNotification();

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active-tests'); // 'active-tests' | 'submissions' | 'analytics'

  // Submissions list states
  const [submissions, setSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [subFilterCategory, setSubFilterCategory] = useState('All');

  // Creator Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctOption: 0 }
  ]);
  const [saving, setSaving] = useState(false);

  const fetchAssessments = async () => {
    try {
      const res = await fetch(`${API_BASE}/assessments`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
        
        // Extract submissions from all assessments
        const allSubmissions = [];
        data.forEach(asmt => {
          asmt.submissions.forEach(sub => {
            allSubmissions.push({
              ...sub,
              assessmentId: asmt._id,
              assessmentTitle: asmt.title,
              assessmentCategory: asmt.category,
              questionsCount: asmt.questions.length,
              questionsList: asmt.questions
            });
          });
        });
        
        // Fetch student users info for submissions
        // In the database model, the submission.student is populated or just an ID
        // Let's populate student user names/emails in state using user details if needed, 
        // or check if they are already populated. If they are objects, we use student.name.
        setSubmissions(allSubmissions.sort((a,b) => new Date(b.completedAt) - new Date(a.completedAt)));
      }
    } catch (err) {
      console.error('Failed to load assessments', err);
      addToast('Failed to load assessments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctOption: 0 }]);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (questionIdx, field, val) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i === questionIdx) {
        return { ...q, [field]: val };
      }
      return q;
    }));
  };

  const handleOptionChange = (questionIdx, optionIdx, val) => {
    setQuestions(prev => prev.map((q, qIdx) => {
      if (qIdx === questionIdx) {
        const newOpts = [...q.options];
        newOpts[optionIdx] = val;
        return { ...q, options: newOpts };
      }
      return q;
    }));
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();

    if (!title || !description || questions.some(q => !q.questionText || q.options.some(o => !o))) {
      addToast('Please complete all questions, description, and options.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({
          title,
          category,
          description,
          duration: Number(duration),
          questions
        })
      });

      if (res.ok) {
        addToast('New Assessment successfully created!', 'success');
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        setDuration(30);
        setQuestions([{ questionText: '', options: ['', '', '', ''], correctOption: 0 }]);
        fetchAssessments();
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Creation failed');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssessment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment? All student score history will be lost.')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/assessments/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });

      if (res.ok) {
        addToast('Assessment removed successfully', 'success');
        setAssessments(prev => prev.filter(a => a._id !== id));
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Deletion failed');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Filter Submissions
  const filteredSubmissions = submissions.filter(sub => {
    const studentName = sub.student?.name || 'Student';
    const studentEmail = sub.student?.email || '';
    const testTitle = sub.assessmentTitle || '';
    
    const matchesSearch = 
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = subFilterCategory === 'All' || sub.assessmentCategory === subFilterCategory;

    return matchesSearch && matchesCategory;
  });

  // Analytics Aggregation
  const getAnalyticsData = () => {
    const categories = ['Aptitude', 'Coding', 'General'];
    return categories.map(cat => {
      const catTests = assessments.filter(a => a.category === cat);
      let totalSubmissions = 0;
      let totalScore = 0;
      
      catTests.forEach(test => {
        totalSubmissions += test.submissions.length;
        test.submissions.forEach(sub => {
          totalScore += sub.score;
        });
      });

      const avgScore = totalSubmissions > 0 ? Math.round(totalScore / totalSubmissions) : 0;
      return {
        name: cat,
        tests: catTests.length,
        submissions: totalSubmissions,
        averageScore: avgScore
      };
    });
  };

  const chartData = getAnalyticsData();

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <Clock size={40} className="animate-spin text-primary" />
        <p style={{ color: 'var(--text-secondary)' }}>Gathering assessment rosters...</p>
      </div>
    );
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Assessment Manager</h1>
          <p style={styles.subtitle}>Create curriculum tests, schedule timers, and review candidate coding score summaries.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={styles.addBtn}>
          <Plus size={16} />
          <span>Add New Assessment</span>
        </button>
      </header>

      {/* Tabs */}
      <div style={styles.tabNav}>
        <button 
          onClick={() => setActiveTab('active-tests')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'active-tests' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'active-tests' ? 'var(--text-primary)' : 'var(--text-muted)'
          }}
        >
          <BookOpen size={16} />
          <span>Active Test Bank ({assessments.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('submissions')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'submissions' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'submissions' ? 'var(--text-primary)' : 'var(--text-muted)'
          }}
        >
          <FileText size={16} />
          <span>Submissions Desk ({submissions.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'analytics' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'analytics' ? 'var(--text-primary)' : 'var(--text-muted)'
          }}
        >
          <BarChartIcon size={16} />
          <span>Cohort Analytics</span>
        </button>
      </div>

      {/* ACTIVE TESTS TAB */}
      {activeTab === 'active-tests' && (
        <div style={styles.grid}>
          {assessments.length === 0 ? (
            <div style={styles.emptyState}>
              <Award size={48} className="text-muted mb-2" />
              <h4>No Active Assessments</h4>
              <p>Add technical quizzes or coding problem sheets for student evaluation.</p>
            </div>
          ) : (
            assessments.map(asmt => (
              <div key={asmt._id} className="glass-card" style={styles.testCard}>
                <div style={styles.cardHeader}>
                  <span className={`badge bg-${asmt.category === 'Coding' ? 'accent' : asmt.category === 'Aptitude' ? 'primary' : 'secondary'}-glow`}>
                    {asmt.category}
                  </span>
                  <button onClick={() => handleDeleteAssessment(asmt._id)} style={styles.deleteBtn} title="Delete test">
                    <Trash2 size={15} />
                  </button>
                </div>
                <h3 style={styles.cardTitle}>{asmt.title}</h3>
                <p style={styles.cardDesc}>{asmt.description}</p>
                <div style={styles.cardFooter}>
                  <div style={styles.footerItem}>
                    <Clock size={14} className="text-muted" />
                    <span>{asmt.duration} mins</span>
                  </div>
                  <div style={styles.footerItem}>
                    <FileText size={14} className="text-muted" />
                    <span>{asmt.questions.length} Questions</span>
                  </div>
                  <div style={styles.footerItem}>
                    <Award size={14} className="text-muted" />
                    <span>{asmt.submissions.length} completed</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUBMISSIONS DESK TAB */}
      {activeTab === 'submissions' && (
        <div className="glass-card p-4" style={{ background: 'var(--bg-surface)' }}>
          <div style={styles.directoryHeader}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', width: '100%' }}>
              <div style={{ ...styles.searchContainer, flex: 2 }}>
                <Search size={16} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search candidate name, email, or test title..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="form-input form-input-compact"
                  style={{ paddingLeft: '2.5rem', width: '100%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
              <select
                value={subFilterCategory}
                onChange={e => setSubFilterCategory(e.target.value)}
                className="form-select form-select-compact"
                style={{ flex: 1, minWidth: '150px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px' }}
              >
                <option value="All">All Categories</option>
                <option value="Aptitude">Aptitude</option>
                <option value="Coding">Coding</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="premium-table" style={{ width: '100%', minWidth: '700px', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)' }}>
                  <th style={{ textAlign: 'left' }}>Candidate</th>
                  <th style={{ textAlign: 'left' }}>Assessment</th>
                  <th style={{ textAlign: 'center' }}>Category</th>
                  <th style={{ textAlign: 'center' }}>Completed At</th>
                  <th style={{ textAlign: 'center' }}>Score</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <Award size={36} className="mb-2" />
                      <p className="mb-0">No submissions matched your search query.</p>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub, idx) => {
                    const pct = Math.round((sub.score / sub.questionsCount) * 100) || 0;
                    return (
                      <tr key={idx} style={{ background: 'var(--bg-surface-elevated)' }}>
                        <td>
                          <div>
                            <strong className="text-primary" style={{ display: 'block' }}>{sub.student?.name || 'Aravind Sharma'}</strong>
                            <span className="text-muted" style={{ fontSize: '0.68rem' }}>{sub.student?.email || 'aravind@gmail.com'}</span>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span className="font-semibold text-primary">{sub.assessmentTitle}</span>
                            <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>{sub.questionsCount} Questions</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge bg-${sub.assessmentCategory === 'Coding' ? 'accent' : sub.assessmentCategory === 'Aptitude' ? 'primary' : 'secondary'}-glow`}>
                            {sub.assessmentCategory}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {new Date(sub.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span 
                            className="badge font-bold" 
                            style={{ 
                              fontSize: '0.75rem',
                              backgroundColor: pct >= 80 ? 'rgba(16,185,129,0.1)' : pct >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                              border: `1px solid ${pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)'}`,
                              color: pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}
                          >
                            {sub.score} / {sub.questionsCount} ({pct}%)
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            onClick={() => setSelectedSubmission(sub)}
                            className="btn btn-xs btn-outline"
                            style={{ fontSize: '0.72rem', padding: '3px 8px', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                          >
                            Review Paper
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COHORT ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div style={styles.analyticsLayout}>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="glass-card p-4" style={{ background: 'var(--bg-surface)', height: '100%' }}>
                <h4 style={{ ...styles.cardTitle, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem', marginBottom: '1rem' }}>Test Summary</h4>
                <div style={styles.metricItem}>
                  <span className="text-muted text-xs uppercase font-semibold">Total Submissions</span>
                  <h3>{submissions.length}</h3>
                </div>
                <div style={styles.metricItem}>
                  <span className="text-muted text-xs uppercase font-semibold">Overall Passing Rate (&gt;= 50%)</span>
                  <h3>
                    {submissions.length > 0
                      ? `${Math.round((submissions.filter(s => (s.score / s.questionsCount) >= 0.5).length / submissions.length) * 100)}%`
                      : '0%'
                    }
                  </h3>
                </div>
                <div style={styles.metricItem}>
                  <span className="text-muted text-xs uppercase font-semibold">Highest Score Registered</span>
                  <h3>
                    {submissions.length > 0
                      ? `${Math.max(...submissions.map(s => Math.round((s.score / s.questionsCount) * 100)))}%`
                      : '0%'
                    }
                  </h3>
                </div>
              </div>
            </div>

            <div className="col-md-8">
              <div className="glass-card p-4" style={{ background: 'var(--bg-surface)' }}>
                <h4 style={{ ...styles.cardTitle, marginBottom: '1.25rem' }}>Average Scores by Domain Category</h4>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                      <Bar dataKey="averageScore" name="Average % Score" radius={[4, 4, 0, 0]} barSize={40} fill="var(--primary)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ASSESSMENT MODAL */}
      {showCreateModal && (
        <div className="assessment-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="assessment-modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="assessment-modal-header">
              <h3>
                <Award size={20} style={{ color: 'var(--primary)' }} />
                Create Placement Assessment
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="assessment-modal-close-btn">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateAssessment} className="assessment-modal-form">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="assessment-form-label">
                    <FileText size={14} style={{ color: 'var(--primary)' }} />
                    Test Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JavaScript Core Concepts"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="form-input mt-1"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>
                <div className="col-md-3">
                  <label className="assessment-form-label">
                    <Award size={14} style={{ color: 'var(--secondary)' }} />
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="form-select form-select-compact mt-1"
                  >
                    <option value="Aptitude">Aptitude</option>
                    <option value="Coding">Coding</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="assessment-form-label">
                    <Clock size={14} style={{ color: 'var(--accent)' }} />
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="180"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="form-input mt-1"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="assessment-form-label">Test Description</label>
                <textarea
                  required
                  placeholder="Outline syllabus, topics evaluated, and grading rules..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="form-input mt-1"
                  style={{ minHeight: '60px', fontSize: '0.85rem', resize: 'none' }}
                />
              </div>

              {/* Questions Area */}
              <div className="assessment-section-divider">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="assessment-section-title">
                    <BookOpen size={16} style={{ color: 'var(--primary)' }} />
                    Questions List ({questions.length})
                  </h4>
                </div>

                <div className="d-flex flex-column gap-3">
                  {questions.map((q, qIdx) => (
                    <div key={qIdx} className="assessment-question-card animate-fade-in">
                      <div className="assessment-question-header">
                        <span className="assessment-question-badge">
                          Question #{qIdx + 1}
                        </span>
                        {questions.length > 1 && (
                          <button type="button" onClick={() => handleRemoveQuestion(qIdx)} className="assessment-question-delete" title="Remove question">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      
                      <div className="form-group mb-3">
                        <input
                          type="text"
                          required
                          placeholder="Question text..."
                          value={q.questionText}
                          onChange={e => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                          className="form-input"
                          style={{ height: '38px', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div className="row g-2">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="col-md-6">
                            <div className="assessment-option-wrapper">
                              <span className="assessment-option-badge">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <input
                                type="text"
                                required
                                placeholder={`Option ${oIdx + 1}...`}
                                value={opt}
                                onChange={e => handleOptionChange(qIdx, oIdx, e.target.value)}
                                className="assessment-option-input"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="assessment-correct-option-container">
                        <div style={{ minWidth: '110px' }}>
                          <label className="assessment-form-label mb-0" style={{ fontSize: '0.78rem' }}>Correct Option</label>
                        </div>
                        <select
                          value={q.correctOption}
                          onChange={e => handleQuestionChange(qIdx, 'correctOption', parseInt(e.target.value))}
                          className="form-select"
                          style={{ height: '34px', fontSize: '0.8rem', padding: '0 1.5rem 0 0.5rem', background: 'var(--bg-surface)', maxWidth: '150px' }}
                        >
                          <option value={0}>Option A</option>
                          <option value={1}>Option B</option>
                          <option value={2}>Option C</option>
                          <option value={3}>Option D</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  
                  <button type="button" onClick={handleAddQuestion} className="assessment-add-question-dashed">
                    <Plus size={16} />
                    Add Question
                  </button>
                </div>
              </div>

              <div className="assessment-modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="assessment-btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="assessment-btn-save" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED SUBMISSION REVIEW DRAWER */}
      {selectedSubmission && (
        <div className="assessment-modal-overlay" onClick={() => setSelectedSubmission(null)}>
          <div className="assessment-modal-content sheet-width animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="assessment-modal-header">
              <div>
                <h3>
                  <FileText size={18} style={{ color: 'var(--primary)' }} />
                  Response Review Sheet
                </h3>
                <span className="assessment-modal-header-desc">{selectedSubmission.student?.name} &bull; {selectedSubmission.assessmentTitle}</span>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="assessment-modal-close-btn">
                <X size={18} />
              </button>
            </div>
            
            <div className="assessment-modal-form">
              <div className="assessment-score-card">
                <div>
                  <span className="text-xs text-muted d-block font-semibold uppercase">Total Grade</span>
                  <strong className="text-lg text-primary">{Math.round((selectedSubmission.score / selectedSubmission.questionsCount) * 100)}% Match Score</strong>
                </div>
                <div className="assessment-score-card-badge">
                  {selectedSubmission.score} / {selectedSubmission.questionsCount} Correct
                </div>
              </div>

              {/* Render Simulated Questions & Answers */}
              <div className="d-flex flex-column gap-3 mt-2">
                <h4 className="assessment-section-title mb-2">
                  <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                  Answer Key Breakdown
                </h4>
                {selectedSubmission.questionsList?.map((q, idx) => (
                  <div key={q._id || idx} className="assessment-review-question-item">
                    <p className="assessment-review-question-text">
                      <span style={{ color: 'var(--primary)' }}>{idx + 1}.</span> {q.questionText}
                    </p>
                    <div className="assessment-review-options-grid">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === q.correctOption;
                        return (
                          <div key={oIdx} className={`assessment-review-option-pill ${isCorrect ? 'correct' : ''}`}>
                            <span className="assessment-review-option-bullet"></span>
                            <span>
                              {String.fromCharCode(65 + oIdx)}. {opt}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="assessment-modal-footer">
                <button onClick={() => setSelectedSubmission(null)} className="assessment-btn-cancel" style={{ padding: '0.55rem 1.5rem' }}>
                  Close Sheet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '100%', boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 },
  subtitle: { fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem', margin: 0 },
  addBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', padding: '0.6rem 1rem', height: 'fit-content' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '8rem 0' },
  tabNav: { display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '1rem', width: '100%', overflowX: 'auto', scrollbarWidth: 'none' },
  tabBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0.5rem', fontSize: '0.85rem', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', transition: 'all var(--transition-fast)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', width: '100%' },
  emptyState: { gridColumn: '1 / -1', padding: '4rem 1.5rem', textAlign: 'center', background: 'var(--bg-surface)', border: '1px dashed var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' },
  testCard: { padding: '1.25rem', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  deleteBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s', '&:hover': { color: 'var(--danger)' } },
  cardTitle: { fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 },
  cardDesc: { fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', margin: 0 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem' },
  footerItem: { display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-muted)' },
  directoryHeader: { paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' },
  searchContainer: { position: 'relative' },
  searchIcon: { position: 'absolute', left: '0.9rem', top: '12px', color: 'var(--text-muted)' },
  analyticsLayout: { width: '100%' },
  metricItem: { marginBottom: '1.25rem' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5, 8, 18, 0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' },
  modalContent: { width: '100%', maxWidth: '800px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' },
  modalHeaderBlock: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--primary-glow) 0%, var(--secondary-glow) 100%)', borderBottom: '1px solid var(--border-color)', padding: '1.25rem 1.5rem', position: 'relative' },
  modalCloseBtn: { background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', transition: 'all 0.2s', width: '30px', height: '30px' }
};

export default AdminAssessments;
