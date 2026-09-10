import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, User, CheckCircle, Plus, MoreVertical, X, ExternalLink, Trash, Pencil } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth, API_BASE } from '../../context/AuthContext';

const AdminInterviews = () => {
  const { authHeader } = useAuth();
  const { addToast } = useNotification();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [loading, setLoading] = useState(true);

  // Form States
  const [studentId, setStudentId] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('Technical Round 1');
  const [link, setLink] = useState('');
  const [status, setStatus] = useState('Scheduled');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchInterviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/interviews`, {
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

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/profile/all`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
        if (data.length > 0) {
          setStudentId(data[0].user?._id || '');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

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
    }
  };

  useEffect(() => {
    fetchInterviews();
    fetchStudents();
    fetchApplications();
  }, []);

  // Auto-fill form values when selected student or applications list changes
  useEffect(() => {
    if (studentId && applications.length > 0) {
      const studentApps = applications.filter(app => app.student?._id === studentId);
      if (studentApps.length > 0) {
        setCompany(studentApps[0].job?.company || '');
        setRole(studentApps[0].job?.title || '');
        setSelectedAppId(studentApps[0]._id);
      } else {
        setCompany('');
        setRole('');
        setSelectedAppId('');
      }
    }
  }, [studentId, applications]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!studentId) {
      addToast('Please select a student', 'warning');
      return;
    }

    try {
      const url = isEditing ? `${API_BASE}/interviews/${editId}` : `${API_BASE}/interviews`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({
          studentId,
          company,
          role,
          date,
          time,
          type,
          link,
          status,
        }),
      });

      if (res.ok) {
        addToast(isEditing ? 'Interview details updated successfully!' : 'Interview successfully scheduled and invite sent!', 'success');
        setIsModalOpen(false);
        setIsEditing(false);
        setEditId(null);
        setCompany('');
        setRole('');
        setDate('');
        setTime('');
        setLink('');
        setStatus('Scheduled');
        fetchInterviews();
      } else {
        const errData = await res.json();
        addToast(errData.message || 'Action failed', 'error');
      }
    } catch (err) {
      addToast(isEditing ? 'Failed to update interview details' : 'Failed to schedule interview', 'error');
    }
  };

  const handleEditClick = (interview) => {
    setIsEditing(true);
    setEditId(interview._id);
    setStudentId(interview.student?._id || '');
    setCompany(interview.company || '');
    setRole(interview.role || '');
    setDate(interview.date || '');
    setTime(interview.time || '');
    setType(interview.type || 'Technical Round 1');
    setLink(interview.link || '');
    setStatus(interview.status || 'Scheduled');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) return;
    try {
      const res = await fetch(`${API_BASE}/interviews/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (res.ok) {
        addToast('Interview cancelled successfully', 'success');
        fetchInterviews();
      } else {
        addToast('Failed to cancel interview', 'error');
      }
    } catch (err) {
      addToast('Error canceling interview', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Scheduled': return 'var(--primary)';
      case 'Requested': return 'var(--warning)';
      case 'Completed': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading interview schedules...</div>;
  }

  const studentApps = applications.filter(app => app.student?._id === studentId);

  return (
    <div className="interviews-container animate-fade-in">
      <style>{`
        .interviews-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          height: 100%;
        }
        .interviews-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        .interviews-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          letter-spacing: -0.5px;
        }
        .interviews-subtitle {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }
        @media (max-width: 576px) {
          .interviews-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
        .interviews-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 992px) {
          .interviews-grid {
            grid-template-columns: 1fr;
          }
        }
        .column-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          min-height: 550px;
          position: relative;
          border-top: 4px solid transparent;
        }
        .column-card.requested { border-top-color: var(--warning); }
        .column-card.scheduled { border-top-color: var(--primary); }
        .column-card.completed { border-top-color: var(--success); }

        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }
        .column-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .count-badge {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-color);
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 600;
        }
        .cards-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .interview-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 1.25rem;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
          overflow: hidden;
        }
        .interview-card:hover {
          transform: translateY(-4px);
          border-color: hsla(250, 84%, 58%, 0.3);
          box-shadow: var(--shadow-md);
        }
        .interview-card::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 3px;
        }
        .interview-card.requested::before { background-color: var(--warning); }
        .interview-card.scheduled::before { background-color: var(--primary); }
        .interview-card.completed::before { background-color: var(--success); }

        .card-top {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }
        .avatar-wrap {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .interview-card.requested .avatar-wrap { background: var(--warning-glow); color: var(--warning); }
        .interview-card.scheduled .avatar-wrap { background: var(--primary-glow); color: var(--primary); }
        .interview-card.completed .avatar-wrap { background: var(--success-glow); color: var(--success); }

        .card-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .card-role {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 2px 0 0 0;
        }
        .more-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .more-btn:hover {
          background: var(--bg-surface-elevated);
          color: var(--danger);
        }
        .card-details {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          padding: 0.75rem;
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          border-radius: 8px;
        }
        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .detail-row svg {
          color: var(--text-muted);
        }
        .meeting-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          transition: color 0.2s;
        }
        .meeting-link:hover {
          color: var(--primary-hover);
          text-decoration: underline;
        }
        .pending-link-tag {
          color: var(--text-muted);
          font-size: 0.8rem;
        }
        .card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .type-tag {
          font-size: 0.75rem;
          padding: 0.25rem 0.6rem;
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-secondary);
          font-weight: 600;
        }
        .empty-column {
          text-align: center;
          padding: 2.5rem 1rem;
          color: var(--text-muted);
          font-size: 0.85rem;
          border: 1px dashed var(--border-color);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.01);
        }
      `}</style>

      <header className="interviews-header">
        <div>
          <h1 className="interviews-title">Interview Scheduler</h1>
          <p className="interviews-subtitle">Organize and manage interview pipelines between students and employers.</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setIsEditing(false);
          setEditId(null);
          setStudentId(students.length > 0 ? (students[0].user?._id || '') : '');
          setCompany('');
          setRole('');
          setDate('');
          setTime('');
          setType('Technical Round 1');
          setLink('');
          setStatus('Scheduled');
          setIsModalOpen(true);
        }}>
          <Plus size={16} /> Schedule New
        </button>
      </header>

      <div className="interviews-grid">
        {['Requested', 'Scheduled', 'Completed'].map(statusGroup => (
          <div key={statusGroup} className={`glass-card column-card ${statusGroup.toLowerCase()}`}>
            <div className="column-header">
              <h3 className="column-title">
                <span className="status-dot" style={{ background: getStatusColor(statusGroup), boxShadow: `0 0 8px ${getStatusColor(statusGroup)}` }}></span>
                {statusGroup}
              </h3>
              <span className="count-badge">
                {interviews.filter(i => i.status === statusGroup).length}
              </span>
            </div>

            <div className="cards-list">
              {interviews.filter(i => i.status === statusGroup).map(interview => (
                <div key={interview._id} className={`interview-card ${statusGroup.toLowerCase()}`}>
                  <div className="card-top">
                    <div className="avatar-wrap">
                      <User size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 className="card-name">{interview.student?.name || 'Unknown Student'}</h4>
                      <p className="card-role">{interview.role} @ {interview.company}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button onClick={() => handleEditClick(interview)} className="more-btn" title="Edit Interview" style={{ color: 'var(--text-muted)' }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(interview._id)} className="more-btn" title="Cancel Interview">
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-details">
                    <div className="detail-row">
                      <Calendar size={13} /> <span>{interview.date}</span>
                    </div>
                    <div className="detail-row">
                      <Clock size={13} /> <span>{interview.time}</span>
                    </div>
                    <div className="detail-row">
                      <Video size={13} /> 
                      {interview.link ? (
                        <a href={interview.link} target="_blank" rel="noreferrer" className="meeting-link">
                          Join Meeting <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="pending-link-tag">Pending Link</span>
                      )}
                    </div>
                  </div>

                  <div className="card-bottom">
                    <span className="type-tag">{interview.type}</span>
                  </div>
                </div>
              ))}
              
              {interviews.filter(i => i.status === statusGroup).length === 0 && (
                <div className="empty-column">No {statusGroup.toLowerCase()} interviews</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div 
          className="modal-overlay-custom" 
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 8, 18, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '85px',
            paddingBottom: '2rem',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            overflowY: 'auto'
          }}
        >
          <div 
            className="modal-content-custom" 
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: 'calc(100vh - 110px)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            {/* Top accent bar */}
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0.2) 100%)', width: '100%' }} />

            {/* Header */}
            <div 
              style={{
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.02)',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div 
                  style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '12px', 
                    background: 'rgba(255, 255, 255, 0.08)', 
                    border: '1px solid rgba(255, 255, 255, 0.18)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#ffffff',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <Calendar size={22} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.3px', lineHeight: 1.25 }}>
                    {isEditing ? 'Edit Interview Details' : 'Schedule Interview'}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
                    {isEditing ? 'Update student interview pipeline round details' : 'Organize and schedule a new interview for a student'}
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
                title="Close Modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form 
              onSubmit={handleSchedule} 
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.35rem',
                overflowY: 'auto',
                flexGrow: 1
              }}
            >
              {/* Select Student */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label font-bold" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.45rem', display: 'block' }}>
                  Select Student *
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '0 0.85rem',
                  height: '46px',
                  width: '100%'
                }}>
                  <User size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, marginRight: '0.65rem' }} />
                  <select
                    style={{ 
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer'
                    }}
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    required
                  >
                    {students.map(std => (
                      <option key={std.user?._id} value={std.user?._id} style={{ background: '#0d111c', color: '#ffffff' }}>
                        {std.user?.name} ({std.user?.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Job Applications Dropdown */}
              {studentApps.length > 0 && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label font-bold" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.45rem', display: 'block' }}>
                    Select Applied Position (Auto-fills Details)
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '0 0.85rem',
                    height: '46px',
                    width: '100%'
                  }}>
                    <select
                      style={{ 
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer'
                      }}
                      value={selectedAppId}
                      onChange={e => {
                        const appId = e.target.value;
                        setSelectedAppId(appId);
                        const selectedApp = applications.find(app => app._id === appId);
                        if (selectedApp) {
                          setCompany(selectedApp.job?.company || '');
                          setRole(selectedApp.job?.title || '');
                        }
                      }}
                    >
                      {studentApps.map(app => (
                        <option key={app._id} value={app._id} style={{ background: '#0d111c', color: '#ffffff' }}>
                          {app.job?.title} at {app.job?.company} ({app.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Company & Role */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label font-bold" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.45rem', display: 'block' }}>
                    Company Name *
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '0 0.85rem',
                    height: '46px',
                    width: '100%'
                  }}>
                    <input
                      type="text"
                      placeholder="e.g. Google"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      required
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label font-bold" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.45rem', display: 'block' }}>
                    Role Title *
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '0 0.85rem',
                    height: '46px',
                    width: '100%'
                  }}>
                    <input
                      type="text"
                      placeholder="e.g. Frontend Engineer"
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      required
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label font-bold" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.45rem', display: 'block' }}>
                    Date *
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '0 0.85rem',
                    height: '46px',
                    width: '100%'
                  }}>
                    <Calendar size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, marginRight: '0.65rem' }} />
                    <input 
                      type="date" 
                      value={date} 
                      onChange={e => setDate(e.target.value)} 
                      required 
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'var(--text-primary)', 
                        fontSize: '0.9rem', 
                        outline: 'none', 
                        width: '100%', 
                        height: '100%',
                        colorScheme: 'dark'
                      }} 
                    />
                  </div>

                  {/* Quick Date Select Presets */}
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      onClick={() => setDate(new Date().toISOString().split('T')[0])}
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      Today
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setDate(new Date(Date.now() + 86400000).toISOString().split('T')[0])}
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      Tomorrow
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0])}
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      +7 Days
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label font-bold" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.45rem', display: 'block' }}>
                    Time *
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '0 0.85rem',
                    height: '46px',
                    width: '100%'
                  }}>
                    <Clock size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, marginRight: '0.65rem' }} />
                    <input 
                      type="text" 
                      placeholder="e.g. 10:00 AM" 
                      value={time} 
                      onChange={e => setTime(e.target.value)} 
                      required 
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'var(--text-primary)', 
                        fontSize: '0.9rem', 
                        outline: 'none', 
                        width: '100%', 
                        height: '100%'
                      }} 
                    />
                  </div>

                  {/* Quick Time Select Presets */}
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      onClick={() => setTime('10:00 AM')}
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      10:00 AM
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setTime('02:00 PM')}
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      02:00 PM
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setTime('04:00 PM')}
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      04:00 PM
                    </button>
                  </div>
                </div>
              </div>

              {/* Round Type & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label font-bold" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.45rem', display: 'block' }}>
                    Round Type
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '0 0.85rem',
                    height: '46px',
                    width: '100%'
                  }}>
                    <input
                      type="text"
                      placeholder="e.g. Technical Round 1"
                      value={type}
                      onChange={e => setType(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label font-bold" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.45rem', display: 'block' }}>
                    Status
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '0 0.85rem',
                    height: '46px',
                    width: '100%'
                  }}>
                    <select
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer'
                      }}
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                    >
                      <option value="Scheduled" style={{ background: '#0d111c', color: '#ffffff' }}>Scheduled</option>
                      <option value="Requested" style={{ background: '#0d111c', color: '#ffffff' }}>Requested</option>
                      <option value="Completed" style={{ background: '#0d111c', color: '#ffffff' }}>Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Meeting URL */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label font-bold" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.45rem', display: 'block' }}>
                  Meeting URL
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '0 0.85rem',
                  height: '46px',
                  width: '100%'
                }}>
                  <Video size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, marginRight: '0.65rem' }} />
                  <input 
                    type="url" 
                    placeholder="https://zoom.us/j/123456789" 
                    value={link} 
                    onChange={e => setLink(e.target.value)} 
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: 'var(--text-primary)', 
                      fontSize: '0.9rem', 
                      outline: 'none', 
                      width: '100%', 
                      height: '100%'
                    }} 
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn" 
                style={{ 
                  width: '100%', 
                  marginTop: '0.75rem', 
                  padding: '0.85rem 1rem', 
                  fontSize: '0.95rem', 
                  fontWeight: '800',
                  background: '#ffffff',
                  color: '#0b0f19',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(255, 255, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.3)';
                }}
              >
                {isEditing ? 'Save Changes' : 'Confirm Schedule & Send Invite'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInterviews;
