import React, { useState } from 'react';
import { Calendar, Clock, Video, User, CheckCircle, Plus, MoreVertical, X, ExternalLink } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const AdminInterviews = () => {
  const { addToast } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interviews, setInterviews] = useState([
    {
      id: 1,
      studentName: 'Aravind Sharma',
      company: 'Google',
      role: 'Frontend Engineer',
      date: '2026-06-20',
      time: '10:00 AM',
      type: 'Technical Round 1',
      status: 'Scheduled',
      link: 'https://zoom.us/j/123456789',
    },
    {
      id: 2,
      studentName: 'Surjeet Kumar',
      company: 'Amazon',
      role: 'Backend SDE',
      date: '2026-06-21',
      time: '02:30 PM',
      type: 'HR Round',
      status: 'Requested',
      link: '',
    },
    {
      id: 3,
      studentName: 'Priya Singh',
      company: 'Microsoft',
      role: 'Full Stack Developer',
      date: '2026-06-18',
      time: '11:00 AM',
      type: 'System Design',
      status: 'Completed',
      link: 'https://zoom.us/j/987654321',
    }
  ]);

  const handleSchedule = (e) => {
    e.preventDefault();
    addToast('Interview successfully scheduled and invite sent!', 'success');
    setIsModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Scheduled': return 'var(--primary)';
      case 'Requested': return 'var(--warning)';
      case 'Completed': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  };

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
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .more-btn:hover {
          background: var(--bg-surface-elevated);
          color: var(--text-primary);
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
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(5, 8, 18, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .modal-content {
          width: 100%;
          max-width: 480px;
          background: var(--bg-surface);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          animation: modalFadeIn 0.3s ease;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-banner {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, var(--primary-glow), transparent);
        }
        .modal-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .close-btn {
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .close-btn:hover {
          color: var(--text-primary);
          background: var(--bg-surface-elevated);
        }
        .modal-form {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
      `}</style>

      <header className="interviews-header">
        <div>
          <h1 className="interviews-title">Interview Scheduler</h1>
          <p className="interviews-subtitle">Organize and manage interview pipelines between students and employers.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
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
                <div key={interview.id} className={`interview-card ${statusGroup.toLowerCase()}`}>
                  <div className="card-top">
                    <div className="avatar-wrap">
                      <User size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 className="card-name">{interview.studentName}</h4>
                      <p className="card-role">{interview.role} @ {interview.company}</p>
                    </div>
                    <button className="more-btn"><MoreVertical size={16} /></button>
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
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-banner">
              <h2 className="modal-title">Schedule Interview</h2>
              <button onClick={() => setIsModalOpen(false)} className="close-btn"><X size={15} /></button>
            </div>
            <form onSubmit={handleSchedule} className="modal-form">
              <div className="form-group">
                <label className="form-label">Select Student</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <select className="form-select" style={{ paddingLeft: '2.5rem' }}>
                    <option>Surjeet Kumar</option>
                    <option>Aravind Sharma</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Company & Role</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>@</div>
                  <input type="text" className="form-input" placeholder="e.g. Google - Frontend Engineer" style={{ paddingLeft: '2.5rem' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Date</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="date" className="form-input" style={{ paddingLeft: '2.5rem' }} />
                  </div>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Time</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="time" className="form-input" style={{ paddingLeft: '2.5rem' }} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Meeting Link (Zoom/Meet)</label>
                <div style={{ position: 'relative' }}>
                  <Video size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="url" className="form-input" placeholder="https://zoom.us/j/..." style={{ paddingLeft: '2.5rem' }} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem 1rem', fontSize: '0.95rem', boxShadow: 'var(--shadow-md)' }}>
                Confirm Schedule & Send Invite
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInterviews;
