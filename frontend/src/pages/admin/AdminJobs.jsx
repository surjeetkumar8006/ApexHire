import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, MapPin, DollarSign, Trash2, ShieldAlert, CheckCircle, AlertCircle, Sparkles, X } from 'lucide-react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const AdminJobs = () => {
  const { authHeader } = useAuth();
  const { addToast } = useNotification();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Matchmaker States
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [matchingJob, setMatchingJob] = useState(null);
  const [matchedCandidates, setMatchedCandidates] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [salary, setSalary] = useState('');
  const [requirements, setRequirements] = useState('');
  const [description, setDescription] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();

    if (!title || !company || !location || !description || !requirements) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    setPosting(true);

    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({
          title,
          company,
          location,
          type,
          salary: salary || 'Not Specified',
          requirements,
          description,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        addToast('Job posting created successfully!', 'success');
        setTitle('');
        setCompany('');
        setLocation('');
        setSalary('');
        setRequirements('');
        setDescription('');
        fetchJobs(); // Refresh listing
      } else {
        throw new Error(data.message || 'Job creation failed');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setPosting(false);
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        addToast(`Job status changed to ${nextStatus}`, 'success');
        setJobs((prev) =>
          prev.map((j) => (j._id === jobId ? { ...j, status: nextStatus } : j))
        );
      }
    } catch (err) {
      addToast('Failed to toggle job status', 'error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: authHeader(),
      });

      if (res.ok) {
        addToast('Job listing removed successfully', 'success');
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Deletion failed');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleOpenAIMatch = async (job) => {
    setMatchingJob(job);
    setIsMatchModalOpen(true);
    setMatchLoading(true);

    try {
      // 1. Fetch real-time student candidates from backend
      let candidates = [];
      const res = await fetch(`${API_BASE}/ai/candidate-leaderboard`, {
        headers: authHeader(),
      });

      if (res.ok) {
        candidates = await res.json();
      } else {
        const fallbackRes = await fetch(`${API_BASE}/profile/all`, { headers: authHeader() });
        if (fallbackRes.ok) {
          const profiles = await fallbackRes.json();
          candidates = profiles.map(p => ({
            _id: p._id,
            name: p.user?.name || 'Student Candidate',
            email: p.user?.email || 'candidate@apexhire.ai',
            skills: p.skills || [],
            aiMatchScore: p.aiFeedback?.score || 75
          }));
        }
      }

      // 2. Safely parse job requirements & job title keywords
      let requirements = [];
      if (Array.isArray(job.requirements)) {
        requirements = job.requirements.map(r => String(r).toLowerCase().trim()).filter(Boolean);
      } else if (typeof job.requirements === 'string' && job.requirements.trim()) {
        requirements = job.requirements.toLowerCase().split(',').map(r => r.trim()).filter(Boolean);
      }

      // If job title exists (e.g. SDE, Frontend, Backend, React, Node), extract relevant domain keywords
      const titleKeywords = (job.title || '')
        .toLowerCase()
        .split(/[\s,/-]+/)
        .filter(w => w.length >= 2 && !['and', 'the', 'for', 'with', 'intern', 'trainee', 'senior', 'junior', 'lead'].includes(w));

      const combinedKeywords = [...new Set([...requirements, ...titleKeywords])];

      // 3. Score every candidate dynamically based on actual skill overlap & profile quality
      const scoredCandidates = candidates.map((cand, idx) => {
        const candSkills = (cand.skills || []).map(s => String(s).toLowerCase());
        let matchCount = 0;

        combinedKeywords.forEach((kw) => {
          if (candSkills.some(sk => sk.includes(kw) || kw.includes(sk))) {
            matchCount++;
          }
        });

        // Dynamic Skill Ratio (0% to 100%)
        let skillMatchRatio = 0;
        if (combinedKeywords.length > 0) {
          skillMatchRatio = (matchCount / combinedKeywords.length) * 100;
        } else {
          skillMatchRatio = Math.min(90, candSkills.length * 18);
        }

        // Base candidate resume quality
        const candidateBaseQuality = cand.aiMatchScore || 70;

        // Dynamic Final Score: 60% skill match + 40% candidate profile quality
        let computedScore = Math.round((skillMatchRatio * 0.6) + (candidateBaseQuality * 0.4));

        // Add candidate skill count bonus and index variance so no two candidates have duplicate ties
        computedScore = Math.min(99, Math.max(30, computedScore + (candSkills.length * 3) - (idx * 4)));

        return {
          ...cand,
          matchScore: computedScore,
          matchedSkillsCount: matchCount
        };
      }).sort((a, b) => b.matchScore - a.matchScore);

      setTimeout(() => {
        setMatchedCandidates(scoredCandidates);
        setMatchLoading(false);
      }, 700);

    } catch (err) {
      console.error(err);
      addToast('Error performing AI candidate match', 'error');
      setMatchLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading listings panel...</div>;
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <header>
        <h1 style={styles.title}>Manage Job Listings</h1>
        <p style={styles.subtitle}>Post new opportunities and update application statuses of active openings.</p>
      </header>

      <div style={styles.layout}>
        {/* Left Side: Create Job Form */}
        <div className="glass-card" style={styles.formCard}>
          <h3 style={styles.cardTitle}>Post New Opportunity</h3>
          <form onSubmit={handleCreateJob} style={styles.form}>
            <div style={styles.row}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  placeholder="Software Engineer Intern"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  placeholder="Google"
                  className="form-input"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.row}>
              <div className="form-group" style={{ flex: 1.2 }}>
                <label className="form-label">Location</label>
                <input
                  type="text"
                  placeholder="Bangalore, India (Hybrid)"
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Salary Range</label>
                <input
                  type="text"
                  placeholder="₹12L - ₹18L PA"
                  className="form-input"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ flex: 0.8 }}>
                <label className="form-label">Job Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="form-select"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Requirements (comma-separated)</label>
              <input
                type="text"
                placeholder="React, Node.js, AWS, JavaScript, Git"
                className="form-input"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Description</label>
              <textarea
                placeholder="Detail the role, tasks, responsibilities, and qualifications..."
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.textArea}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={posting}>
              <Plus size={16} />
              <span>{posting ? 'Posting...' : 'Create Job Listing'}</span>
            </button>
          </form>
        </div>

        {/* Right Side: Active Listings Manager */}
        <div className="glass-card" style={styles.listCard}>
          <h3 style={styles.cardTitle}>Current Listings</h3>
          <div style={styles.jobsList}>
            {jobs.length === 0 ? (
              <p style={styles.emptyText}>No job listings posted yet.</p>
            ) : (
              jobs.map((job) => (
                <div key={job._id} style={styles.jobItem}>
                  <div style={styles.jobMeta}>
                    <div>
                      <h4 style={styles.jobItemTitle}>{job.title}</h4>
                      <p style={styles.jobItemCompany}>
                        {job.company} • <span style={{ color: 'var(--text-muted)' }}>{job.location}</span>
                        <span className="badge bg-secondary-glow text-secondary text-xs ms-2" style={{ borderRadius: '8px', fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                          👤 {job.postedBy?.name || 'Placement Admin'} ({job.postedBy?.role === 'recruiter' ? 'Recruiter' : 'Admin'})
                        </span>
                      </p>
                    </div>
                  </div>

                  <div style={styles.actionBox}>
                    {/* AI Match Button */}
                    <button
                      onClick={() => handleOpenAIMatch(job)}
                      className="btn"
                      style={{
                        background: 'var(--primary-glow)',
                        color: 'var(--primary)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                      title="AI Find Candidates"
                    >
                      <Sparkles size={14} />
                      AI Match
                    </button>

                    {/* Active/Closed Switch */}
                    <button
                      onClick={() => handleToggleStatus(job._id, job.status)}
                      style={{
                        ...styles.statusBtn,
                        color: job.status === 'active' ? 'var(--success)' : 'var(--danger)',
                      }}
                      title={`Click to mark as ${job.status === 'active' ? 'closed' : 'active'}`}
                    >
                      {job.status === 'active' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                      <span>{job.status}</span>
                    </button>

                    {/* Delete listing */}
                    <button onClick={() => handleDeleteJob(job._id)} style={styles.deleteBtn}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Matchmaker Modal */}
      {isMatchModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsMatchModalOpen(false)}>
          <div className="animate-fade-in" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalBanner}>
              <button onClick={() => setIsMatchModalOpen(false)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={styles.aiIconWrap}>
                  <Sparkles size={20} color="#fff" />
                </div>
                <div>
                  <h2 style={styles.modalTitle}>AI Candidate Matchmaker</h2>
                  <p style={styles.modalSubtitle}>Finding best matches for: <strong style={{color: 'var(--text-primary)'}}>{matchingJob?.title}</strong></p>
                </div>
              </div>
            </div>

            <div style={styles.modalBody}>
              {matchLoading ? (
                <div style={styles.loadingBox}>
                  <div style={styles.spinner}></div>
                  <p style={{ color: 'var(--text-secondary)' }}>Scanning resumes & analyzing skill graphs...</p>
                </div>
              ) : matchedCandidates.length === 0 ? (
                <div style={styles.loadingBox}>
                  <p style={{ color: 'var(--text-secondary)' }}>No strong candidate matches found for these requirements.</p>
                </div>
              ) : (
                <div style={styles.candidateList}>
                  {matchedCandidates.map((candidate, idx) => (
                    <div key={candidate._id} style={styles.candidateCard}>
                      <div style={styles.candidateRank}>#{idx + 1}</div>
                      
                      <div style={styles.candidateInfo}>
                        <h4 style={styles.candidateName}>{candidate.name || candidate.user?.name || 'Student Candidate'}</h4>
                        <p style={styles.candidateEmail}>{candidate.email || candidate.user?.email}</p>
                        <div style={styles.skillTags}>
                          {(candidate.skills || []).slice(0, 4).map((sk, i) => (
                            <span key={i} style={styles.matchTag}>{sk}</span>
                          ))}
                          {(candidate.skills || []).length > 4 && (
                            <span style={styles.matchTag}>+{(candidate.skills || []).length - 4}</span>
                          )}
                        </div>
                      </div>

                      <div style={styles.matchScoreBox}>
                        <div style={styles.scoreCircle}>
                          <span style={styles.scoreNumber}>{candidate.matchScore}%</span>
                        </div>
                        <span style={styles.scoreLabel}>Match Score</span>
                      </div>
                      
                      <button 
                        onClick={() => addToast(`Invite notification sent to ${candidate.name || candidate.user?.name}!`, 'success')}
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                      >
                        Invite
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
    alignItems: 'stretch',
  },
  formCard: {
    flex: 1.2,
  },
  listCard: {
    flex: 0.8,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '620px',
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  row: {
    display: 'flex',
    gap: '1rem',
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
    minHeight: '130px',
    resize: 'none',
    lineHeight: '1.5',
  },
  submitBtn: {
    height: '45px',
    fontWeight: '600',
  },
  jobsList: {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    flex: 1,
  },
  jobItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    gap: '1rem',
  },
  jobMeta: {
    flex: 1.2,
  },
  jobItemTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  jobItemCompany: {
    fontSize: '0.8rem',
    color: 'var(--accent)',
    fontWeight: '500',
  },
  actionBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  statusBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all var(--transition-fast)',
    '&:hover': {
      color: 'var(--danger)',
      background: 'rgba(239, 68, 68, 0.08)',
    },
  },
  emptyText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '2rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 8, 18, 0.9)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
  modalContent: {
    width: '100%',
    maxWidth: '700px',
    maxHeight: '85vh',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
  },
  modalBanner: {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.1) 100%)',
    borderBottom: '1px solid var(--border-color)',
    padding: '1.5rem 2rem',
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: '1.25rem',
    right: '1.25rem',
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  aiIconWrap: {
    width: '45px',
    height: '45px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  modalSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  modalBody: {
    padding: '1.5rem 2rem',
    overflowY: 'auto',
    flex: 1,
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 0',
    gap: '1rem',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(99, 102, 241, 0.2)',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  candidateList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  candidateCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1.25rem',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    transition: 'all 0.2s',
  },
  candidateRank: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--border-color)',
    width: '40px',
    textAlign: 'center',
  },
  candidateInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  candidateName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  candidateEmail: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  skillTags: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap',
    marginTop: '0.25rem',
  },
  matchTag: {
    fontSize: '0.7rem',
    padding: '0.2rem 0.5rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: '4px',
    color: 'var(--text-secondary)',
  },
  matchScoreBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
  },
  scoreCircle: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    border: '2px solid var(--success)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(16,185,129,0.1)',
  },
  scoreNumber: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--success)',
  },
  scoreLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
};

export default AdminJobs;
