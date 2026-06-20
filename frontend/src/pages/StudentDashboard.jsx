import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, BookOpen, GraduationCap, CheckCircle2, AlertCircle, Plus, Trash, Briefcase, Eye, Target, Activity, Clock } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const StudentDashboard = () => {
  const { user, authHeader } = useAuth();
  const { addToast } = useNotification();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [applications, setApplications] = useState([]);
  
  // Edit Profile States
  const [skills, setSkills] = useState('');
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [expDescription, setExpDescription] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setSkills(data.skills.join(', '));
      }
    } catch (err) {
      console.error(err);
    }
  };

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
    }
  };

  useEffect(() => {
    Promise.all([fetchProfile(), fetchApplications()]).finally(() => setLoading(false));
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      addToast('Only PDF files are supported', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);

    try {
      const res = await fetch(`${API_BASE}/ai/analyze-resume`, {
        method: 'POST',
        headers: authHeader(),
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Analysis failed');

      addToast('Resume uploaded and AI analyzed successfully!', 'success');
      fetchProfile(); // reload profile with AI scores
    } catch (err) {
      addToast(err.message || 'Resume upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const skillsArray = skills.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

    const educationObj = school && degree ? { school, degree, cgpa } : null;
    const experienceObj = company && position ? { company, position, description: expDescription } : null;

    try {
      const body = {
        skills: skillsArray,
      };

      if (educationObj && profile) {
        body.education = [...profile.education, educationObj];
      }
      if (experienceObj && profile) {
        body.experience = [...profile.experience, experienceObj];
      }

      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        addToast('Profile updated successfully!', 'success');
        // Reset inputs
        setSchool('');
        setDegree('');
        setCgpa('');
        setCompany('');
        setPosition('');
        setExpDescription('');
        fetchProfile();
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Profile update failed');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const removeEducation = async (index) => {
    if (!profile) return;
    const updatedEdu = profile.education.filter((_, i) => i !== index);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ education: updatedEdu }),
      });
      if (res.ok) {
        addToast('Education item removed', 'success');
        fetchProfile();
      }
    } catch (err) {
      addToast('Failed to remove education', 'error');
    }
  };

  const removeExperience = async (index) => {
    if (!profile) return;
    const updatedExp = profile.experience.filter((_, i) => i !== index);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ experience: updatedExp }),
      });
      if (res.ok) {
        addToast('Experience item removed', 'success');
        fetchProfile();
      }
    } catch (err) {
      addToast('Failed to remove experience', 'error');
    }
  };

  // Compute profile completeness score (0-100)
  const computeCompleteness = () => {
    if (!profile) return 0;
    let score = 25; // Base signup
    if (profile.skills && profile.skills.length > 0) score += 25;
    if (profile.education && profile.education.length > 0) score += 25;
    if (profile.resumeUrl) score += 25;
    return score;
  };

  const completeness = computeCompleteness();

  if (loading) {
    return <div style={styles.loading}>Analyzing profile details...</div>;
  }

  const aiScore = profile?.aiFeedback?.score || 0;
  const getScoreColor = (score) => {
    if (score >= 75) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  const stats = [
    { label: 'Active Applications', value: applications.filter(a => a.status !== 'Rejected').length, icon: <Briefcase />, colorClass: 'primary' },
    { label: 'Profile Views', value: Math.floor(Math.random() * 50) + 12, icon: <Eye />, colorClass: 'accent' },
    { label: 'AI Match Score', value: aiScore > 0 ? `${aiScore}%` : 'N/A', icon: <Target />, colorClass: 'success' },
    { label: 'Completeness', value: `${completeness}%`, icon: <Activity />, colorClass: 'warning' },
  ];

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Welcome banner */}
      <header style={styles.header}>
        <h1 style={styles.title}>Hello, {user.name} 👋</h1>
        <p style={styles.subtitle}>Unlock opportunities, optimize your resume, and monitor job matching progress.</p>
      </header>

      {/* Verification status banner */}
      {profile && (
        <div
          className="glass-card animate-fade-in"
          style={{
            ...styles.verificationBanner,
            backgroundColor: profile.isVerified ? 'rgba(16, 185, 129, 0.03)' : 'rgba(245, 158, 11, 0.03)',
            borderColor: profile.isVerified ? 'var(--success)' : 'var(--warning)',
            boxShadow: profile.isVerified ? '0 0 10px rgba(16, 185, 129, 0.05)' : '0 0 10px rgba(245, 158, 11, 0.05)',
            marginBottom: '1rem'
          }}
        >
          <div style={styles.verificationBannerContent}>
            {profile.isVerified ? (
              <>
                <CheckCircle2 size={20} color="var(--success)" />
                <div>
                  <h4 style={{ color: 'var(--success)', fontWeight: '700', fontSize: '0.92rem' }}>✓ Verified Candidate Credentials</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Your academic and professional details have been approved by the placement cell. You are eligible to apply for active vacancies.</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle size={20} color="var(--warning)" />
                <div>
                  <h4 style={{ color: 'var(--warning)', fontWeight: '700', fontSize: '0.92rem' }}>⚠ Profile Verification Pending</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Your credentials must be reviewed and verified by a placement officer before you can apply for job postings.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Top Metrics Grid */}
      <div className="dashboard-metrics-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-card-icon ${s.colorClass}`}>{s.icon}</div>
            <div className="stat-card-content">
              <span className="stat-card-label">{s.label}</span>
              <span className="stat-card-value">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-main-layout">
        {/* Left Column: Activity & Overview */}
        <div style={styles.leftCol}>
          
          {/* Applications Pipeline Activity Feed */}
          <div className="glass-card">
            <h3 style={styles.cardTitle}>Recent Applications</h3>
            <div className="activity-feed">
              {applications.length === 0 ? (
                <p style={styles.emptyText}>No applications submitted yet. Browse jobs to get started.</p>
              ) : (
                applications.slice(0, 5).map((app) => (
                  <div key={app._id} className="activity-item">
                    <div className="activity-icon" style={{ color: app.status === 'Rejected' ? 'var(--danger)' : 'var(--primary)' }}>
                      {app.status === 'Offered' ? <CheckCircle2 /> : app.status === 'Rejected' ? <AlertCircle /> : <Clock />}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{app.job.title} at {app.job.company}</div>
                      <div className="activity-desc">Status: <strong style={{color: 'var(--text-primary)'}}>{app.status}</strong></div>
                      
                      {/* Mini Pipeline Indicator */}
                      <div style={{...styles.pipeline, marginTop: '0.5rem', marginBottom: '0.5rem'}}>
                        <div style={{ ...styles.pipelineProgress, width: getPipelineWidth(app.status) }}></div>
                        <span style={{ ...styles.pipelineNode, ...(app.status !== 'Rejected' ? styles.nodeActive : styles.nodeRejected) }} title="Applied"></span>
                        <span style={{ ...styles.pipelineNode, ...(['Reviewing', 'Shortlisted', 'Interviewing', 'Offered'].includes(app.status) ? styles.nodeActive : {}) }} title="Reviewing"></span>
                        <span style={{ ...styles.pipelineNode, ...(['Shortlisted', 'Interviewing', 'Offered'].includes(app.status) ? styles.nodeActive : {}) }} title="Shortlisted"></span>
                        <span style={{ ...styles.pipelineNode, ...(['Offered'].includes(app.status) ? styles.nodeActive : {}) }} title="Offered"></span>
                      </div>
                      
                      <div className="activity-meta">
                        <span>{app.job.location} • {app.job.jobType}</span>
                        <span className="activity-time">{new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upload Resume Card */}
          <div className="glass-card" style={styles.uploadCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div>
                  <h3 style={styles.cardTitle}>AI Resume Parser</h3>
                  <p style={styles.cardDesc}>Upload your resume in PDF format to receive instant AI ratings and keywords matching.</p>
               </div>
               {profile?.resumeUrl && (
                  <div style={styles.resumeUrlBox}>
                     <CheckCircle2 size={16} color="var(--success)" />
                     <a href={`http://localhost:5000${profile.resumeUrl}`} target="_blank" rel="noreferrer" style={styles.resumeLink}>
                     View Resume
                     </a>
                  </div>
               )}
            </div>
            
            <div style={styles.dropzone}>
              {uploading ? (
                <div style={styles.uploadSpinnerContainer}>
                  <div style={styles.uploadSpinner}></div>
                  <p>Running AI analysis engine...</p>
                </div>
              ) : (
                <label style={styles.fileLabel}>
                  <Upload size={32} color="var(--primary)" />
                  <span style={styles.uploadTitle}>Choose Resume (PDF)</span>
                  <span style={styles.uploadSub}>Max size 5MB</span>
                  <input type="file" accept=".pdf" onChange={handleResumeUpload} style={styles.fileInput} />
                </label>
              )}
            </div>
          </div>

          {/* Current credentials display */}
          {profile && (profile.education.length > 0 || profile.experience.length > 0) && (
            <div className="glass-card">
              <h3 style={styles.cardTitle}>Profile Summary</h3>
              
              {profile.education.length > 0 && (
                <div style={styles.summarySection}>
                  <h4 style={styles.summaryHeading}><GraduationCap size={16} /> Education</h4>
                  {profile.education.map((edu, idx) => (
                    <div key={idx} style={styles.summaryItem}>
                      <div>
                        <h5>{edu.degree} - {edu.school}</h5>
                        {edu.cgpa && <p>Grade / CGPA: {edu.cgpa}</p>}
                      </div>
                      <button onClick={() => removeEducation(idx)} style={styles.deleteBtn}>
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {profile.experience.length > 0 && (
                <div style={{ ...styles.summarySection, borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
                  <h4 style={styles.summaryHeading}><BookOpen size={16} /> Experience / Projects</h4>
                  {profile.experience.map((exp, idx) => (
                    <div key={idx} style={styles.summaryItem}>
                      <div>
                        <h5>{exp.position} at {exp.company}</h5>
                        <p>{exp.description}</p>
                      </div>
                      <button onClick={() => removeExperience(idx)} style={styles.deleteBtn}>
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: AI & Profile Manager */}
        <div style={styles.rightCol}>
          
          {/* AI Score panel */}
          {profile?.aiFeedback?.score > 0 ? (
            <div className="glass-card" style={styles.aiCard}>
              <div style={styles.aiHeader}>
                <div style={styles.aiHeading}>
                  <Sparkles size={20} color="var(--accent)" />
                  <h3 style={styles.cardTitle}>AI Coach Insights</h3>
                </div>
                <div style={{ ...styles.aiBadge, border: `1px solid ${getScoreColor(aiScore)}`, backgroundColor: `${getScoreColor(aiScore)}10` }}>
                  <span style={{ color: getScoreColor(aiScore), fontWeight: '800', fontSize: '1.4rem' }}>{aiScore}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/100</span>
                </div>
              </div>

              <div style={styles.feedbackSection}>
                <h4 style={styles.feedbackSub}>Top Suggestions</h4>
                <div style={styles.suggestionsList}>
                  {profile.aiFeedback.suggestions.slice(0, 3).map((s, idx) => (
                    <div key={idx} style={styles.suggestionItem}>
                      <div style={styles.bulletDot}></div>
                      <p style={styles.suggestionText}>{s}</p>
                    </div>
                  ))}
                </div>

                <h4 style={styles.feedbackSub} style={{ marginTop: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Career Matches</h4>
                <div style={styles.rolesGrid} style={{ marginTop: '0.5rem' }}>
                  {profile.aiFeedback.matchedRoles.map((role, idx) => (
                    <span key={idx} style={styles.roleTag}>
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={styles.aiPlaceholder}>
              <Sparkles size={36} color="var(--text-muted)" />
              <h3>AI Feedback Unavailable</h3>
              <p>Upload your resume PDF to unlock AI-powered career matching.</p>
            </div>
          )}

          {/* Profile Details Form */}
          <div className="glass-card" style={{ borderTop: '4px solid var(--primary)' }}>
            <h3 style={styles.cardTitle}>Update Credentials</h3>
            <form onSubmit={handleUpdateProfile} style={styles.form}>
              <div className="form-group">
                <label className="form-label">Key Technical Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Python, MongoDB"
                  className="form-input"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              {/* Add Education */}
              <div style={styles.formSection}>
                <h4 style={styles.sectionHeading}>Add Education History</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="University/School"
                    className="form-input"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                  />
                  <div style={styles.row}>
                    <input
                      type="text"
                      placeholder="Degree"
                      className="form-input"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      style={{ flex: 1.5 }}
                    />
                    <input
                      type="text"
                      placeholder="CGPA/Grade"
                      className="form-input"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>

              {/* Add Experience */}
              <div style={styles.formSection}>
                <h4 style={styles.sectionHeading}>Add Experience</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Company / Project Title"
                    className="form-input"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Position (e.g. Developer Intern)"
                    className="form-input"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                  <textarea
                    placeholder="Describe your role or contributions..."
                    className="form-input"
                    value={expDescription}
                    onChange={(e) => setExpDescription(e.target.value)}
                    style={{ minHeight: '60px', width: '100%', resize: 'none' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <Plus size={16} />
                <span>Save Credentials</span>
              </button>
            </form>
          </div>
        </div>
      </div>
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
    gap: '0',
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
    gap: '0.25rem',
    marginBottom: '2rem'
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
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  verificationBanner: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderRadius: '12px'
  },
  verificationBannerContent: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
  },
  cardDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '0.95rem'
  },
  uploadCard: {
    display: 'flex',
    flexDirection: 'column',
  },
  dropzone: {
    border: '2px dashed var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color var(--transition-fast)',
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    marginTop: '1rem',
  },
  fileInput: {
    display: 'none',
  },
  fileLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  uploadTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  uploadSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  uploadSpinnerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  uploadSpinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(99, 102, 241, 0.2)',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  resumeUrlBox: {
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  resumeLink: {
    fontSize: '0.8rem',
    color: 'var(--success)',
    fontWeight: '600',
    textDecoration: 'none'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formSection: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  sectionHeading: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  row: {
    display: 'flex',
    gap: '0.75rem',
  },
  aiCard: {
    border: '1px solid rgba(168, 85, 247, 0.25)',
    background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.05) 0%, rgba(15, 23, 42, 0) 100%)'
  },
  aiHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  aiHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  aiBadge: {
    display: 'flex',
    alignItems: 'baseline',
    padding: '0.4rem 0.8rem',
    borderRadius: '12px',
  },
  feedbackSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  feedbackSub: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  suggestionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  suggestionItem: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: '6px',
    height: '6px',
    backgroundColor: 'var(--primary)',
    borderRadius: '50%',
    marginTop: '6px',
    flexShrink: 0
  },
  suggestionText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  rolesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  roleTag: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '50px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
  },
  aiPlaceholder: {
    textAlign: 'center',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'var(--text-muted)',
    h3: {
      fontSize: '1rem',
      fontWeight: '600',
      color: 'var(--text-secondary)',
    },
    p: {
      fontSize: '0.8rem',
      lineHeight: '1.5',
    },
  },
  summarySection: {
    marginBottom: '1rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  summaryHeading: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
    h5: { fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' },
    p: { fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0' }
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    transition: 'color 0.2s',
    '&:hover': { color: 'var(--danger)' }
  },
  pipeline: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    width: '100%',
  },
  pipelineProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    background: 'var(--primary)',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },
  pipelineNode: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'var(--bg-surface-elevated)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
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
  }
};

export default StudentDashboard;
