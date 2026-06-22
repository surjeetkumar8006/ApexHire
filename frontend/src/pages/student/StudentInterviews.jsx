import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, FileText, CheckCircle, ExternalLink } from 'lucide-react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const StudentInterviews = () => {
  const { authHeader } = useAuth();
  const { addToast } = useNotification();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    notes: '',
    felt: 'Good'
  });

  const isPastDate = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const interviewDate = new Date(dateStr);
    return interviewDate < today;
  };

  const openFeedbackModal = (interviewId) => {
    setSelectedInterviewId(interviewId);
    setFeedbackForm({ rating: 5, notes: '', felt: 'Good' });
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/interviews/${selectedInterviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({ 
          status: 'Completed',
          studentFeedback: {
            rating: Number(feedbackForm.rating),
            notes: feedbackForm.notes,
            felt: feedbackForm.felt
          }
        })
      });

      if (res.ok) {
        addToast('Feedback saved! Interview marked as completed.', 'success');
        setShowFeedbackModal(false);
        fetchMyInterviews();
      } else {
        const data = await res.json();
        addToast(data.message || 'Failed to submit feedback', 'error');
      }
    } catch (err) {
      addToast('Network error submitting feedback', 'error');
    }
  };

  const fetchMyInterviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/interviews/my`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setInterviews(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyInterviews();
  }, []);

  const upcomingInterviews = interviews.filter(i => i.status !== 'Completed');
  const pastInterviews = interviews.filter(i => i.status === 'Completed');

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Retrieving scheduled interviews...</div>;
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <header>
        <h1 style={styles.title}>My Interviews</h1>
        <p style={styles.subtitle}>Track your upcoming technical rounds and access meeting links instantly.</p>
      </header>

      <div style={styles.content}>
        <div style={styles.upcomingSection}>
          <h2 style={styles.sectionTitle}>
            <span style={{ color: 'var(--primary)' }}>•</span> Upcoming Schedule
          </h2>
          {upcomingInterviews.length === 0 ? (
            <div style={styles.emptyState}>No upcoming interviews scheduled.</div>
          ) : (
            <div style={styles.cardsGrid}>
              {upcomingInterviews.map((interview) => (
                <div key={interview._id} className="glass-card" style={styles.interviewCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.companyBadge}>
                      {interview.company.charAt(0)}
                    </div>
                    <div>
                      <h3 style={styles.roleTitle}>{interview.role}</h3>
                      <p style={styles.companyName}>{interview.company}</p>
                    </div>
                  </div>
                  
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <Calendar size={15} color="var(--primary)" />
                      <span>{interview.date}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <Clock size={15} color="var(--warning)" />
                      <span>{interview.time}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <FileText size={15} color="var(--accent)" />
                      <span>{interview.type}</span>
                    </div>
                  </div>

                  {isPastDate(interview.date) ? (
                    <button 
                      onClick={() => openFeedbackModal(interview._id)}
                      className="btn btn-success" 
                      style={{ ...styles.joinBtn, backgroundColor: 'var(--success)', border: 'none', color: '#fff' }}
                    >
                      <CheckCircle size={16} /> Mark as Completed
                    </button>
                  ) : interview.link ? (
                    <a 
                      href={interview.link} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-primary" 
                      style={styles.joinBtn}
                    >
                      <Video size={16} /> Join Interview Room
                    </a>
                  ) : (
                    <button className="btn btn-secondary" style={styles.joinBtn} disabled>
                      Link Not Available
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.pastSection}>
          <h2 style={styles.sectionTitle}>Past Interviews</h2>
          {pastInterviews.length === 0 ? (
            <div style={styles.emptyState}>No completed interviews found.</div>
          ) : (
            <div className="glass-card" style={styles.tableCard}>
              <div className="table-responsive">
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Company</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Candidate Experience</th>
                      <th style={styles.th}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastInterviews.map((item) => (
                      <tr key={item._id} style={styles.tr}>
                        <td style={styles.td}><strong>{item.company}</strong></td>
                        <td style={styles.td}>{item.role}</td>
                        <td style={styles.td}>{item.date}</td>
                        <td style={styles.td}>{item.type}</td>
                        <td style={styles.td}>
                          {item.studentFeedback ? (
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                                {'★'.repeat(item.studentFeedback.rating || 0)}
                                {'☆'.repeat(5 - (item.studentFeedback.rating || 0))}
                              </span>{' '}
                              <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', marginLeft: '0.25rem' }}>
                                {item.studentFeedback.felt}
                              </span>
                              {item.studentFeedback.notes && (
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                  "{item.studentFeedback.notes}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <span style={styles.resultBadge}>
                            <CheckCircle size={14} /> Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay-custom" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', width: '90%' }}>
            <div className="modal-header-custom p-4 border-bottom border-color d-flex align-items-center gap-2">
              <CheckCircle className="text-success" size={20} />
              <h3 className="h5 font-bold mb-0" style={{ color: 'var(--text-primary)' }}>How did it go?</h3>
            </div>
            <form onSubmit={handleFeedbackSubmit} className="modal-body-custom p-4 d-flex flex-column gap-3">
              <div className="form-group">
                <label className="form-label">How do you feel about the interview? *</label>
                <select 
                  value={feedbackForm.felt} 
                  onChange={(e) => setFeedbackForm({...feedbackForm, felt: e.target.value})}
                  className="form-input"
                  required
                >
                  <option value="Excellent">Excellent (Felt very confident)</option>
                  <option value="Good">Good (Felt fine, mostly answered)</option>
                  <option value="Average">Average (Mixed feelings)</option>
                  <option value="Poor">Poor (Did not go well)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Self-Rating (1 to 5 Stars) *</label>
                <select 
                  value={feedbackForm.rating} 
                  onChange={(e) => setFeedbackForm({...feedbackForm, rating: Number(e.target.value)})}
                  className="form-input"
                  required
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                  <option value={3}>⭐⭐⭐ (3/5)</option>
                  <option value={2}>⭐⭐ (2/5)</option>
                  <option value={1}>⭐ (1/5)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quick Notes / Key Questions Asked</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder="e.g. Asked about React Hooks, closure, and custom promises. Felt good about the design round."
                  value={feedbackForm.notes}
                  onChange={(e) => setFeedbackForm({...feedbackForm, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top border-color">
                <button type="button" onClick={() => setShowFeedbackModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}>Complete & Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  title: { fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' },
  subtitle: { fontSize: '1rem', color: 'var(--text-secondary)' },
  content: { display: 'flex', flexDirection: 'column', gap: '2.5rem' },
  sectionTitle: { fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  interviewCard: { display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' },
  cardHeader: { display: 'flex', gap: '1rem', alignItems: 'center' },
  companyBadge: { width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700', color: '#fff' },
  roleTitle: { fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' },
  companyName: { fontSize: '0.9rem', color: 'var(--accent)', fontWeight: '500' },
  infoBox: { background: 'var(--bg-base)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' },
  joinBtn: { width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' },
  tableCard: { padding: 0, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)' },
  td: { padding: '1rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' },
  tr: { transition: 'background 0.2s', '&:hover': { background: 'rgba(255,255,255,0.01)' } },
  resultBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.6rem', background: 'rgba(16,185,129,0.15)', color: 'var(--success)', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '600' },
  emptyState: { padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface-elevated)', borderRadius: '16px', border: '1px dashed var(--border-color)' }
};

export default StudentInterviews;
