import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { FileCheck, Clock, CheckCircle2, AlertCircle, Building, MapPin, Briefcase } from 'lucide-react';

const ApplicationStepper = ({ status }) => {
  const steps = [
    { label: 'Applied', key: 'Applied' },
    { label: 'Reviewing', key: 'Reviewing' },
    { label: 'Shortlisted', key: 'Shortlisted' },
    { label: 'Interview', key: 'Interviewing' },
    { label: 'Offered', key: 'Offered' }
  ];

  const getStepState = (stepKey, index) => {
    if (status === 'Rejected') {
      return index === 0 ? 'completed' : 'rejected';
    }
    const order = ['Applied', 'Reviewing', 'Shortlisted', 'Interviewing', 'Offered'];
    const currentIdx = order.indexOf(status);
    if (index < currentIdx) return 'completed';
    if (index === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '5%', right: '5%', height: '2px', background: 'rgba(255, 255, 255, 0.12)', zIndex: 1, transform: 'translateY(-12px)' }}></div>
        
        {steps.map((step, idx) => {
          const state = getStepState(step.key, idx);
          const isDone = state === 'completed';
          const isActive = state === 'active';
          const isRejected = state === 'rejected';

          return (
            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '800',
                background: isActive 
                  ? '#ffffff' 
                  : isDone 
                  ? 'rgba(16, 185, 129, 0.2)' 
                  : isRejected 
                  ? 'rgba(239, 68, 68, 0.1)' 
                  : 'rgba(255, 255, 255, 0.06)',
                color: isActive 
                  ? '#0b0f19' 
                  : isDone 
                  ? '#34d399' 
                  : isRejected 
                  ? '#f87171' 
                  : 'var(--text-muted)',
                border: isActive 
                  ? '2px solid #ffffff' 
                  : isDone 
                  ? '1.5px solid #34d399' 
                  : '1.5px solid rgba(255, 255, 255, 0.15)',
                boxShadow: isActive ? '0 0 14px rgba(255, 255, 255, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isDone ? '✓' : idx + 1}
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#ffffff' : isDone ? '#34d399' : 'var(--text-muted)',
                marginTop: '0.4rem'
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StudentApplications = () => {
  const { authHeader } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`${API_BASE}/applications/my`, {
          headers: authHeader(),
        });
        if (res.ok) {
          const data = await res.json();
          setApplications(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [authHeader]);

  if (loading) {
    return <div style={styles.loading}>Loading your applications...</div>;
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div style={styles.titleRow}>
          <FileCheck size={28} color="#ffffff" />
          <h1 style={styles.title}>My Applications</h1>
        </div>
        <p style={styles.subtitle}>Track your application status and recruiter feedback.</p>
      </header>

      {applications.length === 0 ? (
        <div className="glass-card" style={styles.emptyState}>
          <FileCheck size={48} color="var(--text-muted)" />
          <h2>No Applications Found</h2>
          <p>You haven't applied to any jobs yet. Visit the Job Board to get started.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {applications.map((app) => (
            <div key={app._id} className="glass-card" style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.jobTitle}>{app.job.title}</h3>
                  <div style={styles.companyRow}>
                    <Building size={14} />
                    <span>{app.job.company}</span>
                  </div>
                </div>
                <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
              </div>

              <div style={styles.detailsRow}>
                <div style={styles.detailItem}>
                  <MapPin size={14} />
                  <span>{app.job.location}</span>
                </div>
                <div style={styles.detailItem}>
                  <Briefcase size={14} />
                  <span>{app.job.jobType}</span>
                </div>
                <div style={styles.detailItem}>
                  <Clock size={14} />
                  <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Interactive 5-Stage Live Application Pipeline Stepper */}
              <ApplicationStepper status={app.status} />

              {app.feedback && (
                <div style={styles.feedbackBox}>
                  <AlertCircle size={16} color="#ffffff" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={styles.feedbackTitle}>Recruiter Feedback</h4>
                    <p style={styles.feedbackText}>{app.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getPipelineWidth = (status) => {
  switch (status) {
    case 'Applied': return '0%';
    case 'Reviewing': return '33%';
    case 'Shortlisted': return '66%';
    case 'Interviewing': return '66%';
    case 'Offered': return '100%';
    case 'Rejected': return '100%';
    default: return '0%';
  }
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  loading: {
    padding: '4rem',
    textAlign: 'center',
    fontSize: '1.2rem',
    color: 'var(--text-secondary)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '1.05rem',
    color: 'var(--text-secondary)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    color: 'var(--text-muted)',
    h2: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
    },
    p: {
      fontSize: '1rem',
    },
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    padding: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },
  companyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--primary)',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  detailsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid var(--border-color)',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  pipeline: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    width: '100%',
    marginTop: '0.5rem',
  },
  pipelineProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    background: 'var(--primary)',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },
  pipelineNode: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: 'var(--bg-surface-elevated)',
    border: '3px solid rgba(255, 255, 255, 0.2)',
    position: 'relative',
    zIndex: 1,
    transition: 'all 0.3s',
  },
  nodeActive: {
    background: 'var(--primary)',
    borderColor: 'var(--primary)',
    boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)',
  },
  nodeRejected: {
    background: 'var(--danger)',
    borderColor: 'var(--danger)',
    boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
  },
  pipelineLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    marginTop: '0.25rem',
  },
  feedbackBox: {
    display: 'flex',
    gap: '0.75rem',
    padding: '1rem',
    background: 'rgba(99, 102, 241, 0.05)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: 'var(--border-radius-md)',
    marginTop: '0.5rem',
  },
  feedbackTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--primary)',
    marginBottom: '0.25rem',
  },
  feedbackText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
};

export default StudentApplications;
