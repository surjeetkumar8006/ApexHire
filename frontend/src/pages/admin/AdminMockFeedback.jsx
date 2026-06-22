import React, { useState, useEffect } from 'react';
import { Cpu, Users, Search, Award, MessageSquare, Star, Clock, X, Sparkles, Check, ChevronRight } from 'lucide-react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const AdminMockFeedback = () => {
  const { authHeader } = useAuth();
  const { addToast } = useNotification();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Reviewed' | 'Pending'

  // Grading form states
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAttempts = async () => {
    try {
      const res = await fetch(`${API_BASE}/ai/mock-interviews/all`, {
        headers: authHeader()
      });
      if (res.ok) {
        const data = await res.json();
        setAttempts(data);
      }
    } catch (err) {
      console.error('Failed to load mock interview attempts', err);
      addToast('Failed to load mock interview submissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!comments) {
      addToast('Please enter grading comments', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/ai/mock-interviews/${selectedAttempt._id}/expert-feedback`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({ rating, comments })
      });

      if (res.ok) {
        addToast('Expert evaluation comments submitted successfully!', 'success');
        
        // Update local state
        setAttempts(prev => prev.map(att => {
          if (att._id === selectedAttempt._id) {
            return {
              ...att,
              expertFeedback: { rating, comments, reviewedAt: new Date() }
            };
          }
          return att;
        }));
        
        setSelectedAttempt(null);
        setComments('');
        setRating(5);
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Submission failed');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReview = (attempt) => {
    setSelectedAttempt(attempt);
    if (attempt.expertFeedback) {
      setRating(attempt.expertFeedback.rating || 5);
      setComments(attempt.expertFeedback.comments || '');
    } else {
      setRating(5);
      setComments('');
    }
  };

  // Aggregated Stats
  const totalAttempts = attempts.length;
  const reviewedCount = attempts.filter(att => att.expertFeedback?.reviewedAt).length;
  const pendingCount = totalAttempts - reviewedCount;
  const avgScore = totalAttempts > 0 
    ? Math.round(attempts.reduce((sum, att) => sum + att.overallScore, 0) / totalAttempts)
    : 0;

  // Filter logic
  const filteredAttempts = attempts.filter(att => {
    const studentName = att.user?.name || 'Student';
    const role = att.role || '';
    const company = att.company || '';

    const matchesSearch = 
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.toLowerCase().includes(searchTerm.toLowerCase());

    const isReviewed = !!att.expertFeedback?.reviewedAt;
    const matchesStatus = 
      statusFilter === 'All' ||
      (statusFilter === 'Reviewed' && isReviewed) ||
      (statusFilter === 'Pending' && !isReviewed);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <Cpu size={40} className="animate-spin text-primary" />
        <p style={{ color: 'var(--text-secondary)' }}>Gathering voice transcript files...</p>
      </div>
    );
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Mock Interview Grading Desk</h1>
          <p style={styles.subtitle}>Review transcript dialogue trees, technical keyword weights, and leave Expert evaluations.</p>
        </div>
      </header>

      {/* KPI Stats Panel */}
      <div style={styles.statsGrid}>
        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, color: 'var(--primary)', background: 'var(--primary-glow)' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <p style={styles.statLabel}>Total Mock Sessions</p>
            <h3 style={styles.statValue}>{totalAttempts}</h3>
          </div>
        </div>
        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, color: 'var(--success)', background: 'var(--success-glow)' }}>
            <Award size={24} />
          </div>
          <div>
            <p style={styles.statLabel}>Average AI Rating</p>
            <h3 style={styles.statValue}>{avgScore}%</h3>
          </div>
        </div>
        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, color: 'var(--warning)', background: 'var(--warning-glow)' }}>
            <Star size={24} />
          </div>
          <div>
            <p style={styles.statLabel}>Pending Reviews</p>
            <h3 style={styles.statValue}>{pendingCount}</h3>
          </div>
        </div>
      </div>

      {/* Submissions Section */}
      <div className="glass-card p-4" style={{ background: 'var(--bg-surface)' }}>
        <div style={styles.directoryHeader}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', width: '100%' }}>
            <div style={{ ...styles.searchContainer, flex: 2 }}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search candidate name, target role, or company..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="form-input form-input-compact"
                style={{ paddingLeft: '2.5rem', width: '100%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-select form-select-compact"
              style={{ flex: 1, minWidth: '150px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px' }}
            >
              <option value="All">All Evaluations</option>
              <option value="Reviewed">Graded by Expert</option>
              <option value="Pending">Pending Grading</option>
            </select>
          </div>
        </div>

        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="premium-table" style={{ width: '100%', minWidth: '700px', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)' }}>
                <th style={{ textAlign: 'left' }}>Candidate Student</th>
                <th style={{ textAlign: 'left' }}>Role & Target Company</th>
                <th style={{ textAlign: 'center' }}>Interview Type</th>
                <th style={{ textAlign: 'center' }}>AI Score</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center', width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Cpu size={36} className="mb-2" />
                    <p className="mb-0">No mock interview sessions recorded.</p>
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((att) => {
                  const isReviewed = !!att.expertFeedback?.reviewedAt;
                  return (
                    <tr key={att._id} style={{ background: 'var(--bg-surface-elevated)' }}>
                      <td>
                        <div>
                          <strong className="text-primary" style={{ display: 'block' }}>{att.user?.name || 'Aravind Sharma'}</strong>
                          <span className="text-muted" style={{ fontSize: '0.68rem' }}>{att.user?.email}</span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span className="font-semibold text-primary">{att.role}</span>
                          <span className="text-muted d-block text-xs" style={{ fontSize: '0.68rem' }}>at {att.company}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {att.type}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span 
                          className="badge font-bold"
                          style={{
                            fontSize: '0.72rem',
                            backgroundColor: att.overallScore >= 80 ? 'rgba(16,185,129,0.1)' : att.overallScore >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                            border: `1px solid ${att.overallScore >= 80 ? 'var(--success)' : att.overallScore >= 50 ? 'var(--warning)' : 'var(--danger)'}`,
                            color: att.overallScore >= 80 ? 'var(--success)' : att.overallScore >= 50 ? 'var(--warning)' : 'var(--danger)',
                            padding: '2px 8px'
                          }}
                        >
                          {att.overallScore}%
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isReviewed ? (
                          <span className="badge bg-success-glow text-success text-xs" style={{ padding: '2px 6px' }}>Reviewed</span>
                        ) : (
                          <span className="badge bg-warning-glow text-warning text-xs" style={{ padding: '2px 6px' }}>Pending</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => handleOpenReview(att)}
                          className="btn btn-xs btn-outline"
                          style={{ fontSize: '0.72rem', padding: '3px 8px', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        >
                          Grade Attempt
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

      {/* GRADING MODAL DRAWER */}
      {selectedAttempt && (
        <div style={styles.modalOverlay} onClick={() => setSelectedAttempt(null)}>
          <div className="animate-fade-in" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeaderBlock}>
              <div>
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontWeight: '700', fontSize: '1.05rem' }}>AI Interview Script Auditor</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selectedAttempt.user?.name} - {selectedAttempt.role} at {selectedAttempt.company}</span>
              </div>
              <button onClick={() => setSelectedAttempt(null)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Score breakdown bar */}
              <div className="p-3 rounded border border-color d-flex justify-content-between align-items-center" style={{ background: 'var(--bg-surface-elevated)' }}>
                <div>
                  <span className="text-xs text-muted d-block font-semibold uppercase">Overall Quality score</span>
                  <strong className="text-lg text-primary">{selectedAttempt.overallScore}% AI Rating</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="text-xs text-muted d-block font-semibold uppercase">Target Company Scope</span>
                  <strong className="text-md text-secondary">{selectedAttempt.company} Benchmark</strong>
                </div>
              </div>

              {/* Transcript dialogue timeline */}
              <div className="d-flex flex-column gap-3.5">
                <h4 style={{ color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', margin: 0 }}>Dialogue Logs & Technical Weights</h4>
                {selectedAttempt.feedback?.map((item, idx) => (
                  <div key={item._id || idx} style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: '600', margin: 0 }}>
                      <span className="text-primary font-bold">Q{idx + 1}: </span>{item.question}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--bg-base)', padding: '0.5rem', borderRadius: '6px', margin: 0 }}>
                      <span className="text-secondary font-bold">Answer: </span>{item.answer || 'No verbal response parsed.'}
                    </p>
                    <div className="d-flex flex-wrap gap-3 mt-1 text-xs">
                      <span style={{ color: item.score >= 80 ? 'var(--success)' : item.score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                        ★ Score: {item.score}%
                      </span>
                      {item.tips && (
                        <span className="text-muted">
                          💡 Tip: {item.tips}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Expert evaluation submission form */}
              <form onSubmit={handleSubmitFeedback} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: '700', margin: 0 }}>Expert Coordinator Evaluation</h4>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-xs font-semibold">Expert Rating (1 to 5 Stars)</label>
                    <select
                      value={rating}
                      onChange={e => setRating(parseInt(e.target.value))}
                      className="form-select form-select-compact mt-1"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (Excellent)</option>
                      <option value={4}>⭐⭐⭐⭐ (Very Good)</option>
                      <option value={3}>⭐⭐⭐ (Average)</option>
                      <option value={2}>⭐⭐ (Needs Work)</option>
                      <option value={1}>⭐ (Poor)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs font-semibold">Expert Review Comments</label>
                  <textarea
                    required
                    placeholder="Enter manual feedback comments, technical pointers, and placement recommendations..."
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    className="form-input mt-1"
                    style={{ minHeight: '80px', fontSize: '0.82rem', resize: 'none' }}
                  />
                </div>

                <div className="d-flex gap-2 justify-content-end mt-2">
                  <button type="button" onClick={() => setSelectedAttempt(null)} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Save Evaluation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 },
  subtitle: { fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem', margin: 0 },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '8rem 0' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', width: '100%' },
  statCard: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'var(--bg-surface)' },
  statIcon: { width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statLabel: { fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.2rem', margin: 0 },
  statValue: { fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 },
  directoryHeader: { paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' },
  searchContainer: { position: 'relative' },
  searchIcon: { position: 'absolute', left: '0.9rem', top: '12px', color: 'var(--text-muted)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5, 8, 18, 0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' },
  modalContent: { width: '100%', maxWidth: '750px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' },
  modalHeaderBlock: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--primary-glow) 0%, var(--secondary-glow) 100%)', borderBottom: '1px solid var(--border-color)', padding: '1.25rem 1.5rem', position: 'relative' },
  modalCloseBtn: { background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: '30px', height: '30px' }
};

export default AdminMockFeedback;
