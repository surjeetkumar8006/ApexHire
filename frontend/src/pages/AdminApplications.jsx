import React, { useState, useEffect } from 'react';
import { FileText, Eye, CheckCircle2, User, Sparkles, AlertTriangle, Send, Search, Filter } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const AdminApplications = () => {
  const { authHeader } = useAuth();
  const { addToast } = useNotification();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  
  // Update Application Status States
  const [status, setStatus] = useState('Applied');
  const [feedback, setFeedback] = useState('');
  const [updating, setUpdating] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_BASE}/applications/all`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load applications pool', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProfile = async (studentId) => {
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_BASE}/profile/${studentId}`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setStudentProfile(data);
      } else {
        setStudentProfile(null);
      }
    } catch (err) {
      console.error(err);
      setStudentProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleSelectApp = (app) => {
    setSelectedApp(app);
    setStatus(app.status);
    setFeedback(app.feedback || '');
    fetchStudentProfile(app.student._id);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdating(true);

    try {
      const res = await fetch(`${API_BASE}/applications/${selectedApp._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ status, feedback }),
      });

      const data = await res.json();

      if (res.ok) {
        addToast('Application status and feedback updated successfully!', 'success');
        setApplications((prev) =>
          prev.map((app) => (app._id === selectedApp._id ? { ...app, status, feedback } : app))
        );
        // Sync selected app state
        setSelectedApp((prev) => ({ ...prev, status, feedback }));
      } else {
        throw new Error(data.message || 'Status update failed');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Retrieving candidates list...</div>;
  }

  const getScoreColor = (score) => {
    if (score >= 75) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  // Get unique job titles
  const uniqueJobTitles = Array.from(
    new Set(applications.map((app) => app.job?.title || '').filter(Boolean))
  );

  // Apply filters
  const filteredApplications = applications.filter((app) => {
    const name = app.student?.name?.toLowerCase() || '';
    const email = app.student?.email?.toLowerCase() || '';
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesJob = jobFilter === 'All' || app.job?.title === jobFilter;
    return matchesSearch && matchesStatus && matchesJob;
  });

  return (
    <div style={styles.container} className="animate-fade-in">
      <header>
        <h1 style={styles.title}>Candidate Applications</h1>
        <p style={styles.subtitle}>Review resumes, inspect automated match ratings, and update selection phases.</p>
      </header>

      {/* Filter Toolbar */}
      <div className="glass-card" style={styles.filterBar}>
        <div className="filter-input-group">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search candidate name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-select-group">
          <Filter size={18} color="var(--text-muted)" />
          <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
            <option value="All">All Jobs Vacancies</option>
            {uniqueJobTitles.map((title, i) => (
              <option key={i} value={title}>{title}</option>
            ))}
          </select>
        </div>

        <div className="filter-select-group">
          <Filter size={18} color="var(--text-muted)" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Stages</option>
            <option value="Applied">Applied</option>
            <option value="Reviewing">Reviewing</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offered">Offered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Left Col: Applications Grid */}
        <div style={selectedApp ? styles.listColSplit : styles.listColFull}>
          {filteredApplications.length === 0 ? (
            <div className="glass-card" style={styles.emptyCard}>
              <FileText size={40} color="var(--text-muted)" />
              <p>No matching candidate applications found.</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredApplications.map((app) => (
                <div
                  key={app._id}
                  className="glass-card"
                  style={{
                    ...styles.appCard,
                    ...(selectedApp?._id === app._id ? styles.activeCard : {}),
                  }}
                  onClick={() => handleSelectApp(app)}
                >
                  <div style={styles.appHeader}>
                    <div>
                      <h4 style={styles.studentName}>{app.student?.name}</h4>
                      <p style={styles.studentEmail}>{app.student?.email}</p>
                    </div>
                    <span className={`badge badge-${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </div>

                  <div style={styles.jobBox}>
                    <span style={styles.jobHeading}>Role Applied</span>
                    <h5 style={styles.jobTitle}>{app.job?.title}</h5>
                    <p style={styles.jobCompany}>{app.job?.company}</p>
                  </div>

                  <div style={styles.cardFooter}>
                    <span style={styles.viewLabel}>
                      Review Candidate <Eye size={14} style={{ marginLeft: '4px' }} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Candidate Review Drawer */}
        {selectedApp && (
          <div className="glass-card animate-fade-in" style={styles.reviewDrawer}>
            <div style={styles.drawerHeader}>
              <div>
                <h3 style={styles.drawerTitle}>Review Candidate</h3>
                <p style={styles.drawerSubtitle}>{selectedApp.student?.name}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} style={styles.closeBtn}>
                ✕
              </button>
            </div>

            <div style={styles.drawerBody}>
              {/* Profile details & resume score */}
              {profileLoading ? (
                <div style={styles.miniLoading}>Fetching talent credentials...</div>
              ) : (
                studentProfile && (
                  <div style={styles.profileSection}>
                    <div style={styles.scoreRow}>
                      <span style={styles.sectionLabel}>AI Match Rating</span>
                      {studentProfile.aiFeedback?.score > 0 ? (
                        <div
                          style={{
                            ...styles.scoreBadge,
                            backgroundColor: `${getScoreColor(studentProfile.aiFeedback.score)}10`,
                            border: `1px solid ${getScoreColor(studentProfile.aiFeedback.score)}`,
                            color: getScoreColor(studentProfile.aiFeedback.score),
                          }}
                        >
                          <Sparkles size={14} />
                          <strong>{studentProfile.aiFeedback.score}/100</strong>
                        </div>
                      ) : (
                        <span style={styles.noScoreText}>No AI Score</span>
                      )}
                    </div>

                    {/* Resume download link */}
                    {studentProfile.resumeUrl && (
                      <a
                        href={`http://localhost:5000${studentProfile.resumeUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={styles.resumeBtn}
                      >
                        <FileText size={16} />
                        <span>Open Resume PDF</span>
                      </a>
                    )}

                    {/* Skills tags */}
                    <div style={styles.metaBlock}>
                      <h5>Parsed Skills</h5>
                      <div style={styles.tagsContainer}>
                        {studentProfile.skills.length === 0 ? (
                          <span style={styles.mutedText}>None listed</span>
                        ) : (
                          studentProfile.skills.map((sk, idx) => (
                            <span key={idx} style={styles.tag}>
                              {sk}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Education list */}
                    {studentProfile.education.length > 0 && (
                      <div style={styles.metaBlock}>
                        <h5>Education History</h5>
                        {studentProfile.education.map((edu, idx) => (
                          <p key={idx} style={styles.subtext}>
                            • <strong>{edu.degree}</strong> from {edu.school} (CGPA: {edu.cgpa || 'N/A'})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} style={styles.statusForm}>
                <div className="form-group">
                  <label className="form-label">Update Application Stage</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Reviewing">Reviewing</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Review Feedback</label>
                  <textarea
                    placeholder="Provide notes or interview schedules. Students will receive this instantly..."
                    className="form-input"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    style={styles.textArea}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={updating}>
                  <Send size={16} />
                  <span>{updating ? 'Updating...' : 'Publish Update'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
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
  loading: {
    padding: '4rem',
    textAlign: 'center',
    fontSize: '1.2rem',
    color: 'var(--text-secondary)',
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
    alignItems: 'flex-start',
  },
  listColFull: {
    flex: 1,
    transition: 'all 0.3s ease',
  },
  listColSplit: {
    flex: 1.1,
    transition: 'all 0.3s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  emptyCard: {
    textAlign: 'center',
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
  },
  appCard: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  activeCard: {
    borderColor: 'var(--primary)',
    boxShadow: '0 0 15px var(--primary-glow)',
  },
  appHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  studentName: {
    fontSize: '1.05rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  studentEmail: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  jobBox: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '0.75rem 1rem',
  },
  jobHeading: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  jobTitle: {
    fontSize: '0.92rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginTop: '0.2rem',
  },
  jobCompany: {
    fontSize: '0.8rem',
    color: 'var(--accent)',
  },
  cardFooter: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '0.75rem',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  viewLabel: {
    fontSize: '0.85rem',
    color: 'var(--primary)',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
  },
  reviewDrawer: {
    flex: 0.9,
    position: 'sticky',
    top: '90px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 120px)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  drawerTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  drawerSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--accent)',
    fontWeight: '500',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '1.2rem',
    transition: 'color var(--transition-fast)',
    '&:hover': {
      color: 'var(--text-primary)',
    },
  },
  drawerBody: {
    overflowY: 'auto',
    flex: 1,
    padding: '1.5rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  miniLoading: {
    padding: '2rem 0',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
  profileSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1.5rem',
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  scoreBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
  },
  noScoreText: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
  },
  resumeBtn: {
    width: '100%',
    height: '42px',
  },
  metaBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    h5: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: 'var(--text-secondary)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  tag: {
    fontSize: '0.78rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
  },
  subtext: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  mutedText: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
  },
  statusForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  selectField: {
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '0.8rem 1rem',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    cursor: 'pointer',
    width: '100%',
    option: {
      background: 'var(--bg-surface)',
    },
  },
  textArea: {
    minHeight: '100px',
    resize: 'none',
    lineHeight: '1.5',
  },
  filterBar: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1rem 1.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
  },
};

export default AdminApplications;
