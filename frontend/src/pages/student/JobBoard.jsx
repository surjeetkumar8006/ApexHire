import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Search, Sparkles, Filter, ChevronRight, X, FileText } from 'lucide-react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const JobBoard = () => {
  const { user, authHeader } = useAuth();
  const { addToast } = useNotification();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('All');

  // Applications list to check already applied jobs
  const [myApplications, setMyApplications] = useState([]);

  const fetchJobs = async () => {
    try {
      const url = new URL(`${API_BASE}/jobs`);
      if (search) url.searchParams.append('keyword', search);
      if (location) url.searchParams.append('location', location);
      if (type && type !== 'All') url.searchParams.append('type', type);

      const res = await fetch(url, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await fetch(`${API_BASE}/applications/my`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setMyApplications(data.map((app) => app.job._id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setStudentProfile(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecommendedJobs = async () => {
    if (user && user.role === 'student') {
      try {
        const res = await fetch(`${API_BASE}/jobs/recommendations`, {
          headers: authHeader(),
        });
        if (res.ok) {
          const data = await res.json();
          setRecommendedJobs(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getMatchingSkills = (requirements, userSkills) => {
    if (!userSkills) return [];
    return requirements.filter((req) =>
      userSkills.some(
        (sk) => sk.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(sk.toLowerCase())
      )
    );
  };

  const getMissingSkills = (requirements, userSkills) => {
    if (!userSkills) return requirements;
    return requirements.filter(
      (req) =>
        !userSkills.some(
          (sk) => sk.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(sk.toLowerCase())
        )
    );
  };

  const getMatchPercentage = (requirements, userSkills) => {
    if (requirements.length === 0) return 0;
    const matching = getMatchingSkills(requirements, userSkills);
    return Math.round((matching.length / requirements.length) * 100);
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 75) return 'var(--success)';
    if (percentage >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getMatchFeedback = (percentage) => {
    if (percentage >= 75) return 'Excellent Profile Fit';
    if (percentage >= 50) return 'Moderate Profile Fit';
    return 'Skills Gap Detected';
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchJobs(), fetchMyApplications(), fetchStudentProfile(), fetchRecommendedJobs()]).finally(() => setLoading(false));
  }, [search, location, type]);

  const handleApply = async (jobId) => {
    if (!studentProfile || !studentProfile.resumeUrl) {
      addToast('Please upload a resume in the Dashboard before applying!', 'warning');
      return;
    }

    if (!studentProfile.isVerified) {
      addToast('Your profile is pending administrator verification. Please contact the placement cell.', 'warning');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();

      if (res.ok) {
        addToast('Application submitted successfully!', 'success');
        setMyApplications((prev) => [...prev, jobId]);
        setSelectedJob(null);
      } else {
        throw new Error(data.message || 'Failed to apply');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading && jobs.length === 0) {
    return <div style={styles.loading}>Searching matching positions...</div>;
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <header>
        <h1 style={styles.title}>Available Opportunities</h1>
        <p style={styles.subtitle}>Explore and apply to positions matching your qualifications and tech profile.</p>
      </header>

      {/* Filters Toolbar */}
      <div className="glass-card" style={styles.filterBar}>
        <div className="filter-input-group">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search roles or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-input-group">
          <MapPin size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="filter-select-group">
          <Filter size={18} color="var(--text-muted)" />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="Part-time">Part-time</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      <div style={styles.mainLayout}>
        <div style={selectedJob ? styles.jobsColSplit : styles.jobsColFull}>
          {/* AI Recommended Jobs Section */}
          {user && user.role === 'student' && recommendedJobs.filter(job => !myApplications.includes(job._id)).length > 0 && (
            <div style={styles.recSection} className="animate-fade-in">
              <div style={styles.recHeader}>
                <Sparkles size={18} color="#ffffff" />
                <h3 style={styles.recTitle}>AI Suggested Opportunities</h3>
              </div>
              <div style={styles.recGrid}>
                {recommendedJobs
                  .filter(job => !myApplications.includes(job._id))
                  .slice(0, 3)
                  .map((job) => (
                    <div
                      key={job._id}
                      className="glass-card"
                      style={{
                        ...styles.jobCard,
                        ...styles.recCard,
                        ...(selectedJob?._id === job._id ? styles.activeJobCard : {}),
                      }}
                      onClick={() => setSelectedJob(job)}
                    >
                      <div style={styles.jobHeader}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <h4 style={{ ...styles.jobTitle, fontSize: '0.98rem', margin: 0 }}>{job.title}</h4>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                background: `${getMatchColor(job.matchPercentage)}10`,
                                border: `1px solid ${getMatchColor(job.matchPercentage)}`,
                                color: getMatchColor(job.matchPercentage),
                                fontWeight: '700',
                              }}
                            >
                              {job.matchPercentage}% Match
                            </span>
                          </div>
                          <p style={{ ...styles.jobCompany, margin: '2px 0 0 0' }}>{job.company}</p>
                        </div>
                      </div>
                      <div style={{ ...styles.jobMeta, margin: '0.25rem 0 0 0', display: 'flex', gap: '1rem', fontSize: '0.78rem' }}>
                        <span style={styles.metaItem}><MapPin size={12} /> {job.location}</span>
                        <span style={styles.metaItem}><DollarSign size={12} /> {job.salary}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {jobs.length === 0 ? (
            <div className="glass-card" style={styles.emptyCard}>
              <Briefcase size={40} color="var(--text-muted)" />
              <p>No job postings match your filters. Try adjusting your search query.</p>
            </div>
          ) : (
            <div style={styles.jobsList}>
              {jobs.map((job) => {
                const applied = myApplications.includes(job._id);
                return (
                  <div
                    key={job._id}
                    className="glass-card"
                    style={{
                      ...styles.jobCard,
                      ...(selectedJob?._id === job._id ? styles.activeJobCard : {}),
                    }}
                    onClick={() => setSelectedJob(job)}
                  >
                    <div style={styles.jobHeader}>
                      <div>
                        <h3 style={styles.jobTitle}>{job.title}</h3>
                        <p style={styles.jobCompany}>{job.company}</p>
                      </div>
                      <span className="badge badge-applied" style={styles.jobTypeBadge}>
                        {job.type}
                      </span>
                    </div>

                    <div style={styles.jobMeta}>
                      <span style={styles.metaItem}>
                        <MapPin size={14} />
                        {job.location}
                      </span>
                      <span style={styles.metaItem}>
                        <DollarSign size={14} />
                        {job.salary}
                      </span>
                    </div>

                    {/* Requirements Tags */}
                    <div style={styles.reqsGrid}>
                      {job.requirements.slice(0, 4).map((req, idx) => (
                        <span key={idx} style={styles.reqTag}>
                          {req}
                        </span>
                      ))}
                    </div>

                    <div style={styles.jobFooter}>
                      <span style={styles.viewDetailsText}>
                        View Details <ChevronRight size={16} />
                      </span>
                      {applied && <span style={styles.appliedLabel}>Applied</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Job Drawer Panel */}
        {selectedJob && (
          <div className="glass-card animate-fade-in" style={styles.detailDrawer}>
            <div style={styles.drawerHeader}>
              <div style={styles.drawerTitleBox}>
                <h2 style={styles.drawerTitle}>{selectedJob.title}</h2>
                <p style={styles.drawerSubtitle}>{selectedJob.company}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.drawerBody}>
              <div style={styles.drawerMetaGrid}>
                <div style={styles.drawerMetaBox}>
                  <MapPin size={16} color="var(--primary)" />
                  <div>
                    <h5>Location</h5>
                    <p>{selectedJob.location}</p>
                  </div>
                </div>
                <div style={styles.drawerMetaBox}>
                  <DollarSign size={16} color="var(--accent)" />
                  <div>
                    <h5>Est. Compensation</h5>
                    <p>{selectedJob.salary}</p>
                  </div>
                </div>
                <div style={styles.drawerMetaBox}>
                  <Briefcase size={16} color="var(--secondary)" />
                  <div>
                    <h5>Type</h5>
                    <p>{selectedJob.type}</p>
                  </div>
                </div>
              </div>

              {/* AI Skill Match Checker Card */}
              {studentProfile && (
                <div style={styles.matchCard}>
                  <div style={styles.matchCardHeader}>
                    <Sparkles size={16} color="var(--accent)" />
                    <h4 style={styles.matchCardTitle}>AI Skill Match Checker</h4>
                  </div>
                  
                  <div style={styles.matchCardBody}>
                    <div style={styles.matchCircleContainer}>
                      <svg width="50" height="50" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="3.5"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={getMatchColor(getMatchPercentage(selectedJob.requirements, studentProfile.skills))}
                          strokeWidth="3.5"
                          strokeDasharray={`${getMatchPercentage(selectedJob.requirements, studentProfile.skills)}, 100`}
                        />
                        <text x="18" y="21.5" style={{ fontSize: '7.5px', fontWeight: '700', fill: 'var(--text-primary)', textAnchor: 'middle' }}>
                          {getMatchPercentage(selectedJob.requirements, studentProfile.skills)}%
                        </text>
                      </svg>
                    </div>
                    
                    <div style={styles.matchStats}>
                      <h5 style={styles.matchStatsTitle}>
                        {getMatchFeedback(getMatchPercentage(selectedJob.requirements, studentProfile.skills))}
                      </h5>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Matched {getMatchingSkills(selectedJob.requirements, studentProfile.skills).length} of {selectedJob.requirements.length} requirements
                      </p>
                    </div>
                  </div>
                  
                  {/* Detailed list of matching vs missing skills */}
                  <div style={styles.skillsComparison}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={styles.skillsComparisonLabel}>Matching Skills</span>
                      <div style={styles.skillsTagList}>
                        {getMatchingSkills(selectedJob.requirements, studentProfile.skills).length === 0 ? (
                          <span style={styles.noSkillsText}>None matched</span>
                        ) : (
                          getMatchingSkills(selectedJob.requirements, studentProfile.skills).map((sk, idx) => (
                            <span key={idx} style={styles.matchingTag}>
                              ✓ {sk}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                      <span style={styles.skillsComparisonLabel}>Missing Skills</span>
                      <div style={styles.skillsTagList}>
                        {getMissingSkills(selectedJob.requirements, studentProfile.skills).length === 0 ? (
                          <span style={styles.allSkillsMatchedText}>All requirements met! 🎉</span>
                        ) : (
                          getMissingSkills(selectedJob.requirements, studentProfile.skills).map((sk, idx) => (
                            <span key={idx} style={styles.missingTag}>
                              + {sk}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Requirements */}
              <div style={styles.sectionBlock}>
                <h4 style={styles.drawerSectionTitle}>Skills & Requirements</h4>
                <div style={styles.drawerTagsGrid}>
                  {selectedJob.requirements.map((req, idx) => (
                    <span key={idx} style={styles.drawerTag}>
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div style={styles.sectionBlock}>
                <h4 style={styles.drawerSectionTitle}>Job Description</h4>
                <p style={styles.drawerDescText}>{selectedJob.description}</p>
              </div>
            </div>

            <div style={styles.drawerFooter}>
              {myApplications.includes(selectedJob._id) ? (
                <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                  Already Applied
                </button>
              ) : (
                <button
                  onClick={() => handleApply(selectedJob._id)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <Sparkles size={16} />
                  <span>Apply with AI Profile</span>
                </button>
              )}
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
  filterBar: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1rem 1.5rem',
    alignItems: 'center',
  },
  filterInputGroup: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '0.6rem 1rem',
  },
  searchField: {
    width: '100%',
    fontSize: '0.92rem',
  },
  selectGroup: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '0.6rem 1.25rem',
  },
  selectField: {
    width: '100%',
    fontSize: '0.92rem',
    cursor: 'pointer',
    option: {
      background: 'var(--bg-surface)',
    },
  },
  mainLayout: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start',
  },
  jobsColFull: {
    flex: 1,
    transition: 'all 0.3s ease',
  },
  jobsColSplit: {
    flex: 1.1,
    transition: 'all 0.3s ease',
  },
  jobsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
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
  jobCard: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  activeJobCard: {
    borderColor: 'var(--primary)',
    boxShadow: '0 0 15px var(--primary-glow)',
  },
  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  jobCompany: {
    fontSize: '0.85rem',
    color: 'var(--accent)',
    fontWeight: '500',
  },
  jobTypeBadge: {
    fontSize: '0.72rem',
  },
  jobMeta: {
    display: 'flex',
    gap: '1.25rem',
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  reqsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  reqTag: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
  },
  jobFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '0.75rem',
    marginTop: '0.5rem',
  },
  viewDetailsText: {
    fontSize: '0.85rem',
    color: 'var(--primary)',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
  },
  appliedLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--success)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailDrawer: {
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
  drawerTitleBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  drawerTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.25',
  },
  drawerSubtitle: {
    fontSize: '0.95rem',
    color: 'var(--accent)',
    fontWeight: '600',
  },
  closeBtn: {
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: '4px',
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
  drawerMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  drawerMetaBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: 'var(--border-radius-md)',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--border-color)',
    h5: {
      fontSize: '0.72rem',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
    },
    p: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
    },
  },
  sectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  drawerSectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    borderLeft: '3px solid var(--primary)',
    paddingLeft: '0.5rem',
  },
  drawerTagsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  drawerTag: {
    fontSize: '0.8rem',
    padding: '0.35rem 0.8rem',
    borderRadius: '20px',
    background: 'var(--primary-glow)',
    border: '1px solid rgba(99,102,241,0.2)',
    color: 'var(--text-primary)',
    fontWeight: '500',
  },
  drawerDescText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  drawerFooter: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
  },
  matchCard: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  matchCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem',
  },
  matchCardTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  matchCardBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  matchCircleContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  matchStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  matchStatsTitle: {
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
  },
  skillsComparison: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  skillsComparisonLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  skillsTagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
  },
  matchingTag: {
    fontSize: '0.72rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: 'var(--success)',
    fontWeight: '600',
  },
  missingTag: {
    fontSize: '0.72rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    color: 'var(--warning)',
    fontWeight: '600',
  },
  noSkillsText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  allSkillsMatchedText: {
    fontSize: '0.78rem',
    color: 'var(--success)',
    fontWeight: '600',
  },
  recSection: {
    marginBottom: '2rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1.5rem',
  },
  recHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  recTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  recGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  recCard: {
    background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.05) 0%, rgba(15, 23, 42, 0.1) 100%)',
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
};

export default JobBoard;
