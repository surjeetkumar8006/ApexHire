import React, { useState, useEffect } from 'react';
import { FileText, Eye, CheckCircle2, User, Sparkles, AlertTriangle, Send, Search, Filter, Kanban, Table } from 'lucide-react';
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
  const [offerLetterUrl, setOfferLetterUrl] = useState('');
  const [updating, setUpdating] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'

  const stages = ['Applied', 'Reviewing', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected'];

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
    setOfferLetterUrl(app.offerLetterUrl || '');
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
        body: JSON.stringify({ status, feedback, offerLetterUrl }),
      });

      const data = await res.json();

      if (res.ok) {
        addToast('Application status updated successfully!', 'success');
        setApplications((prev) =>
          prev.map((app) => (app._id === selectedApp._id ? { ...app, status, feedback, offerLetterUrl } : app))
        );
        // Sync selected app state
        setSelectedApp((prev) => ({ ...prev, status, feedback, offerLetterUrl }));
      } else {
        throw new Error(data.message || 'Status update failed');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData('text/plain', appId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain');
    if (!appId) return;

    const app = applications.find((a) => a._id === appId);
    if (!app || app.status === targetStatus) return;

    try {
      let offerUrlInput = '';
      if (targetStatus === 'Offered') {
        const url = prompt('Enter Offer Letter URL / File Link (optional):', app.offerLetterUrl || '');
        if (url === null) return; // User cancelled
        offerUrlInput = url;
      }

      const res = await fetch(`${API_BASE}/applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ status: targetStatus, offerLetterUrl: offerUrlInput }),
      });

      if (res.ok) {
        addToast(`Candidate moved to ${targetStatus}`, 'success');
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: targetStatus, offerLetterUrl: offerUrlInput } : a))
        );
        if (selectedApp && selectedApp._id === appId) {
          setSelectedApp((prev) => ({ ...prev, status: targetStatus, offerLetterUrl: offerUrlInput }));
          setStatus(targetStatus);
          setOfferLetterUrl(offerUrlInput);
        }
      } else {
        const errData = await res.json();
        addToast(errData.message || 'Failed to update stage', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error performing drag action', 'error');
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

  const renderKanbanBoard = () => {
    return (
      <div className="kanban-board-container">
        {stages.map((stage) => {
          const stageApps = filteredApplications.filter((app) => app.status === stage);
          return (
            <div
              key={stage}
              className="kanban-stage-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="kanban-col-header">
                <div className="kanban-col-title">
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background:
                        stage === 'Offered'
                          ? 'var(--success)'
                          : stage === 'Rejected'
                          ? 'var(--danger)'
                          : stage === 'Interviewing'
                          ? 'var(--accent)'
                          : 'var(--primary)',
                      boxShadow: `0 0 8px ${
                        stage === 'Offered'
                          ? 'var(--success)'
                          : stage === 'Rejected'
                          ? 'var(--danger)'
                          : 'var(--primary)'
                      }`,
                    }}
                  ></span>
                  {stage}
                </div>
                <span className="kanban-col-badge">{stageApps.length}</span>
              </div>

              <div className="kanban-cards-list">
                {stageApps.length === 0 ? (
                  <div className="kanban-empty-dropzone">Drop here</div>
                ) : (
                  stageApps.map((app) => (
                    <div
                      key={app._id}
                      className={`kanban-candidate-card stage-${stage.toLowerCase()} animate-fade-in ${
                        selectedApp?._id === app._id ? 'active' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app._id)}
                      onClick={() => handleSelectApp(app)}
                    >
                      <h4 className="kanban-card-student-name">{app.student?.name}</h4>
                      <div className="kanban-job-box">
                        <h5 className="kanban-card-job-title">{app.job?.title}</h5>
                        <p className="kanban-card-job-company">{app.job?.company}</p>
                      </div>
                      {app.offerStatus && app.status === 'Offered' && (
                        <span className={`badge badge-${app.offerStatus.toLowerCase()}`} style={{ alignSelf: 'flex-start', fontSize: '0.68rem', marginTop: '0.2rem' }}>
                          Offer: {app.offerStatus}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTableView = () => {
    return (
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', width: '100%' }}>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)' }}>
                <th style={styles.th}>Candidate</th>
                <th style={styles.th}>Applied Position</th>
                <th style={styles.th}>Date Applied</th>
                <th style={styles.th}>Stage</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr
                  key={app._id}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    background: selectedApp?._id === app._id ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleSelectApp(app)}
                  className="table-row-hover"
                >
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{app.student?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{app.student?.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}>
                    <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{app.job?.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>{app.job?.company}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`badge badge-${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <button
                      className="btn"
                      style={{
                        padding: '0.35rem 0.8rem',
                        fontSize: '0.75rem',
                        background: 'var(--primary-glow)',
                        color: 'var(--primary)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectApp(app);
                      }}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <style>{`
        .kanban-board-container {
          display: flex;
          gap: 1.25rem;
          overflow-x: auto;
          padding-bottom: 1.5rem;
          align-items: flex-start;
          width: 100%;
        }
        .kanban-board-container::-webkit-scrollbar {
          height: 10px;
        }
        .kanban-board-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.03);
          border-radius: 6px;
        }
        .kanban-board-container::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.25);
          border-radius: 6px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .kanban-board-container::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .kanban-stage-col {
          flex: 1;
          min-width: 260px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          min-height: 600px;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        body.dark-theme .kanban-stage-col {
          background: rgba(30, 41, 59, 0.4);
          border-color: rgba(255, 255, 255, 0.05);
        }
        .kanban-stage-col:hover {
          border-color: rgba(99, 102, 241, 0.2);
          box-shadow: var(--shadow-md);
        }
        .kanban-col-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }
        .kanban-col-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .kanban-col-badge {
          background: var(--primary-glow);
          border: 1px solid hsla(250, 84%, 58%, 0.15);
          font-size: 0.75rem;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          color: var(--primary);
          font-weight: 700;
        }
        .kanban-cards-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          flex: 1;
          min-height: 480px;
        }
        .kanban-candidate-card {
          padding: 1.25rem;
          cursor: grab;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background-color: var(--bg-surface-elevated);
          box-shadow: var(--shadow-sm);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          border-left: 4px solid var(--primary);
        }
        .kanban-candidate-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: rgba(99, 102, 241, 0.3);
        }
        .kanban-candidate-card.active {
          border-color: var(--primary);
          box-shadow: 0 0 15px var(--primary-glow);
          background: var(--bg-surface-elevated);
        }
        .kanban-candidate-card.stage-applied { border-left-color: var(--primary); }
        .kanban-candidate-card.stage-reviewing { border-left-color: var(--warning); }
        .kanban-candidate-card.stage-shortlisted { border-left-color: var(--accent); }
        .kanban-candidate-card.stage-interviewing { border-left-color: #06b6d4; }
        .kanban-candidate-card.stage-offered { border-left-color: var(--success); }
        .kanban-candidate-card.stage-rejected { border-left-color: var(--danger); }
        .kanban-job-box {
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .kanban-card-student-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .kanban-card-job-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        .kanban-card-job-company {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }
        .kanban-empty-dropzone {
          padding: 3rem 1rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.8rem;
          border: 2px dashed var(--border-color);
          border-radius: 12px;
          background: rgba(255,255,255,0.005);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          height: 100%;
        }
        .kanban-empty-dropzone:hover {
          background: rgba(99, 102, 241, 0.03);
          border-color: var(--primary);
        }
      `}</style>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Candidate Applications</h1>
          <p style={styles.subtitle}>Review resumes, inspect automated match ratings, and update selection phases.</p>
        </div>

        {/* View Mode Toggle Switch */}
        <div style={styles.viewToggleContainer}>
          <button
            onClick={() => setViewMode('kanban')}
            style={{
              ...styles.viewToggleBtn,
              backgroundColor: viewMode === 'kanban' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'kanban' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <Kanban size={14} style={{ marginRight: '4px' }} />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              ...styles.viewToggleBtn,
              backgroundColor: viewMode === 'table' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'table' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <Table size={14} style={{ marginRight: '4px' }} />
            <span>Table List</span>
          </button>
        </div>
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
            {stages.map((stg) => (
              <option key={stg} value={stg}>{stg}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Left Col: Board/Table */}
        <div style={selectedApp ? styles.listColSplit : styles.listColFull}>
          {filteredApplications.length === 0 ? (
            <div className="glass-card" style={styles.emptyCard}>
              <FileText size={40} color="var(--text-muted)" />
              <p>No matching candidate applications found.</p>
            </div>
          ) : viewMode === 'kanban' ? (
            renderKanbanBoard()
          ) : (
            renderTableView()
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
                    {stages.map((stg) => (
                      <option key={stg} value={stg}>{stg}</option>
                    ))}
                  </select>
                </div>

                {status === 'Offered' && (
                  <div className="form-group">
                    <label className="form-label">Offer Letter URL / File Link</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. /uploads/offer-letter.pdf"
                      value={offerLetterUrl}
                      onChange={(e) => setOfferLetterUrl(e.target.value)}
                    />
                  </div>
                )}

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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
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
  viewToggleContainer: {
    display: 'flex',
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    padding: '2px',
    gap: '2px',
  },
  viewToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    padding: '0.4rem 1rem',
    borderRadius: '18px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    transition: 'all var(--transition-fast)',
    background: 'transparent',
    color: 'var(--text-secondary)',
  },
  layout: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start',
    width: '100%',
    minWidth: 0,
  },
  listColFull: {
    flex: 1,
    width: '100%',
    transition: 'all 0.3s ease',
    minWidth: 0,
  },
  listColSplit: {
    flex: 1.1,
    transition: 'all 0.3s ease',
    minWidth: 0,
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
  activeCard: {
    borderColor: 'var(--primary)',
    boxShadow: '0 0 15px var(--primary-glow)',
  },
  studentName: {
    fontSize: '0.92rem',
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
    borderRadius: '8px',
    padding: '0.5rem',
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
  th: {
    padding: '1rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-surface-elevated)',
  },
  // Kanban board styles
  kanbanBoard: {
    display: 'flex',
    gap: '1.25rem',
    overflowX: 'auto',
    paddingBottom: '1.5rem',
    alignItems: 'flex-start',
    width: '100%',
  },
  kanbanColumn: {
    flex: '1',
    minWidth: '240px',
    background: 'rgba(15, 23, 42, 0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    minHeight: '520px',
  },
  kanbanColumnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem',
    marginBottom: '0.2rem',
  },
  kanbanColumnTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  kanbanCount: {
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '10px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  kanbanCardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    flex: '1',
    minHeight: '400px',
  },
  kanbanCard: {
    padding: '1rem',
    cursor: 'grab',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-surface)',
    transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
    '&:hover': {
      transform: 'translateY(-2px)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
    },
  },
  kanbanEmptyText: {
    padding: '2rem 0',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.78rem',
    border: '1px dashed var(--border-color)',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.01)',
  },
};

export default AdminApplications;
