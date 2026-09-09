import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE, BACKEND_URL } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  Briefcase, 
  Users, 
  UserCheck, 
  TrendingUp, 
  Plus, 
  Search, 
  MapPin, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
  Star,
  X
} from 'lucide-react';

const RecruiterDashboard = ({ view = 'overview' }) => {
  const { authHeader, user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(view === 'resumes' ? 'resumes' : 'overview');
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveTab(view === 'resumes' ? 'resumes' : 'overview');
  }, [view]);

  // Job form state
  const [showJobModal, setShowJobModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    type: 'Full-time',
    salary: ''
  });

  // Interview modal state
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    type: 'Technical Interview'
  });

  // Search resume state
  const [searchSkill, setSearchSkill] = useState('');

  // Applicant filter state
  const [statusFilter, setStatusFilter] = useState('All');
  const [matchScores, setMatchScores] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        // Fetch jobs, applicants, analytics
        const [jobsRes, appsRes, analyticsRes] = await Promise.all([
          fetch(`${API_BASE}/recruiter/jobs`, { headers: authHeader() }),
          fetch(`${API_BASE}/recruiter/applicants`, { headers: authHeader() }),
          fetch(`${API_BASE}/recruiter/analytics`, { headers: authHeader() })
        ]);

        if (jobsRes.ok) setJobs(await jobsRes.json());
        if (appsRes.ok) {
          const apps = await appsRes.json();
          setApplicants(apps);
          // Auto-trigger matching score for applicants if they have resume parsed text
          apps.forEach(app => {
            if (app.student) {
              fetchMatchScore(app.job._id, app.student._id, app._id);
            }
          });
        }
        if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      } else if (activeTab === 'resumes') {
        const res = await fetch(`${API_BASE}/recruiter/resumes?skill=${searchSkill}`, { headers: authHeader() });
        if (res.ok) setResumes(await res.json());
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load recruiter dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchScore = async (jobId, studentId, appId) => {
    try {
      const res = await fetch(`${API_BASE}/ai/match-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ jobId, studentId })
      });
      if (res.ok) {
        const data = await res.json();
        setMatchScores(prev => ({ ...prev, [appId]: data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.company || !newJob.description || !newJob.location) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      const jobPayload = {
        ...newJob,
        requirements: newJob.requirements.split(',').map(r => r.trim()).filter(Boolean)
      };

      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(jobPayload)
      });

      if (res.ok) {
        addToast('Job posted successfully!', 'success');
        setShowJobModal(false);
        setNewJob({
          title: '',
          company: '',
          description: '',
          requirements: '',
          location: '',
          type: 'Full-time',
          salary: ''
        });
        fetchDashboardData();
      } else {
        const data = await res.json();
        addToast(data.message || 'Failed to post job', 'error');
      }
    } catch (err) {
      addToast('Server error during posting job', 'error');
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/recruiter/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        addToast(`Application updated to ${newStatus}`, 'success');
        fetchDashboardData();
      } else {
        addToast('Failed to update application status', 'error');
      }
    } catch (err) {
      addToast('Network error updating status', 'error');
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!interviewForm.date || !interviewForm.time) {
      addToast('Please select date and time', 'warning');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/recruiter/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          studentId: selectedApp.student._id,
          jobTitle: selectedApp.job.title,
          company: selectedApp.job.company,
          date: interviewForm.date,
          time: interviewForm.time,
          type: interviewForm.type
        })
      });

      if (res.ok) {
        addToast('Interview scheduled, invitation sent to student!', 'success');
        setShowInterviewModal(false);
        // Automatically move application to Interview Scheduled
        handleUpdateStatus(selectedApp._id, 'Interview Scheduled');
      } else {
        addToast('Failed to schedule interview', 'error');
      }
    } catch (err) {
      addToast('Network error scheduling interview', 'error');
    }
  };

  const filteredApplicants = applicants.filter(app => {
    if (statusFilter === 'All') return true;
    return app.status === statusFilter;
  });

  return (
    <div className="container-fluid py-4" style={{ color: 'var(--text-primary)' }}>
      {/* Dashboard Sub Header */}
      <div className="recruiter-header-section">
        <div>
          <h1 className="recruiter-header-title">
            Recruiter Workspace
          </h1>
          <p className="recruiter-header-desc">
            Empower hiring with ATS pipelines, AI match ranking, and resume directory scanning.
          </p>
        </div>
        <div className="recruiter-tab-capsule">
          <button 
            className={`recruiter-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => navigate('/recruiter/dashboard')}
          >
            ATS Dashboard
          </button>
          <button 
            className={`recruiter-tab-btn ${activeTab === 'resumes' ? 'active' : ''}`}
            onClick={() => navigate('/recruiter/resumes')}
          >
            Search Resumes
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Analytics Cards */}
          <div className="analytics-grid mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="recruiter-stat-card jobs">
              <div>
                <span className="recruiter-stat-title">Active Jobs</span>
                <span className="recruiter-stat-value">{analytics?.totalJobs || 0}</span>
              </div>
              <div className="recruiter-stat-icon-wrap bg-primary-glow text-primary">
                <Briefcase size={22} />
              </div>
            </div>

            <div className="recruiter-stat-card applicants">
              <div>
                <span className="recruiter-stat-title">Total Applicants</span>
                <span className="recruiter-stat-value">{analytics?.totalApplicants || 0}</span>
              </div>
              <div className="recruiter-stat-icon-wrap bg-secondary-glow text-secondary">
                <Users size={22} />
              </div>
            </div>

            <div className="recruiter-stat-card candidates">
              <div>
                <span className="recruiter-stat-title">Selected Candidates</span>
                <span className="recruiter-stat-value">{analytics?.offerSent || 0}</span>
              </div>
              <div className="recruiter-stat-icon-wrap bg-success-glow text-success">
                <UserCheck size={22} />
              </div>
            </div>

            <div className="recruiter-stat-card interviewing">
              <div>
                <span className="recruiter-stat-title">Interviewing</span>
                <span className="recruiter-stat-value">{analytics?.interviewScheduled || 0}</span>
              </div>
              <div className="recruiter-stat-icon-wrap bg-warning-glow text-warning">
                <Calendar size={22} />
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Left Column: Job Board & Post Job */}
            <div className="col-lg-4 col-md-12">
              <div className="glass-card p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="h5 font-bold mb-0">Active Job Postings</h3>
                  <button 
                    onClick={() => setShowJobModal(true)}
                    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                  >
                    <Plus size={16} /> Post Job
                  </button>
                </div>

                <div className="d-flex flex-column gap-3">
                  {jobs.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <AlertCircle size={24} className="mb-2" />
                      <p className="mb-0">No jobs posted yet.</p>
                    </div>
                  ) : (
                    jobs.map(job => (
                      <div key={job._id} className="recruiter-job-card">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <span className="recruiter-job-title">{job.title}</span>
                            <span className="recruiter-job-meta">{job.company} • {job.location}</span>
                          </div>
                          <span className="recruiter-job-badge">{job.type}</span>
                        </div>
                        <div className="recruiter-job-footer text-xs text-muted">
                          <span>Salary: {job.salary}</span>
                          <span className={`dot-status ${job.status === 'active' ? 'bg-success' : 'bg-muted'}`} style={{ width: 8, height: 8, borderRadius: '50%' }}></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: ATS Applicant Pipeline */}
            <div className="col-lg-8 col-md-12">
              <div className="glass-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                  <h3 className="h5 font-bold mb-0">Applicant Tracking Pipeline</h3>
                  
                  {/* Pipeline Stage Filter Tab Slider */}
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)} 
                    className="recruiter-pipeline-select"
                  >
                    <option value="All">All Applications</option>
                    <option value="Applied">Applied</option>
                    <option value="Reviewing">Reviewing</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <span className="spinner"></span>
                  </div>
                ) : filteredApplicants.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <Users size={32} className="mb-2" />
                    <p className="mb-0">No applicants found in this pipeline stage.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {filteredApplicants.map(app => {
                      const matchData = matchScores[app._id];
                      return (
                        <div key={app._id} className="recruiter-applicant-card">
                          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                            <div className="d-flex gap-3 align-items-center">
                              <div className="recruiter-applicant-avatar">
                                {app.student.name.charAt(0)}
                              </div>
                              <div>
                                <span className="h6 font-bold d-block mb-1">{app.student.name}</span>
                                <span className="text-muted text-xs d-block">Applied for: <span className="text-primary font-semibold">{app.job.title}</span></span>
                              </div>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              {matchData && (
                                <div className="recruiter-ai-match-badge">
                                  <Star size={14} fill="var(--accent)" />
                                  <span>AI Match: {matchData.matchPercentage}%</span>
                                </div>
                              )}

                              <select 
                                value={app.status} 
                                onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                                className="recruiter-pipeline-select" 
                              >
                                <option value="Applied">Applied</option>
                                <option value="Reviewing">Reviewing</option>
                                <option value="Shortlisted">Shortlisted</option>
                                <option value="Interviewing">Interviewing</option>
                                <option value="Offered">Offered</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </div>
                          </div>

                          {matchData && matchData.missingSkills?.length > 0 && (
                            <div className="recruiter-missing-skills-box">
                              <strong>Missing Required Skills:</strong> {matchData.missingSkills.join(', ')}
                            </div>
                          )}

                          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 pt-3 border-top border-color">
                            <div className="d-flex gap-3 text-xs text-muted">
                              <span className="d-flex align-items-center gap-1"><Mail size={14} /> {app.student.email}</span>
                              {app.student.phone && <span className="d-flex align-items-center gap-1"><Phone size={14} /> {app.student.phone}</span>}
                            </div>
                            <div className="d-flex gap-2">
                              {app.resumeUrl && (
                                <a 
                                  href={`${BACKEND_URL}${app.resumeUrl}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="btn btn-xs btn-outline d-flex align-items-center gap-1"
                                >
                                  Resume <ExternalLink size={12} />
                                </a>
                              )}
                              <button 
                                onClick={() => { setSelectedApp(app); setShowInterviewModal(true); }}
                                className="btn btn-xs btn-primary d-flex align-items-center gap-1"
                              >
                                <Calendar size={12} /> Schedule Interview
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'resumes' && (
        <div className="glass-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <h3 className="h5 font-bold mb-0">Candidate Resume Database</h3>
            <div className="search-bar d-flex gap-2 align-items-center" style={{ maxWidth: '440px', width: '100%' }}>
              <div className="position-relative flex-grow-1">
                <Search className="position-absolute" size={16} style={{ left: 12, top: 13, color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search by skill (e.g. React, Node, Python)..." 
                  value={searchSkill} 
                  onChange={(e) => setSearchSkill(e.target.value)}
                  className="form-input text-sm"
                  style={{ paddingLeft: '2.5rem', height: '42px', borderRadius: '12px' }}
                />
              </div>
              <button 
                onClick={fetchDashboardData} 
                className="btn btn-primary"
                style={{ height: '42px', padding: '0 1.25rem', fontSize: '0.88rem', fontWeight: '700', borderRadius: '12px', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Search
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <span className="spinner"></span>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <AlertCircle size={32} className="mb-2" />
              <p className="mb-0">No matching student profiles found in the database.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Email</th>
                    <th>Current Skills</th>
                    <th>Resume Score</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {resumes.map(profile => (
                    <tr key={profile._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="recruiter-applicant-avatar" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>
                            {profile.user.name.charAt(0)}
                          </div>
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{profile.user.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{profile.user.email}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {profile.skills.slice(0, 5).map((sk, idx) => (
                            <span key={idx} className="badge bg-primary-glow text-primary text-xs" style={{ borderRadius: '12px', padding: '0.2rem 0.6rem' }}>{sk}</span>
                          ))}
                          {profile.skills.length > 5 && (
                            <span className="badge bg-secondary-glow text-secondary text-xs" style={{ borderRadius: '12px', padding: '0.2rem 0.6rem' }}>
                              +{profile.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {profile.aiFeedback?.score ? (
                          <span className={`badge ${profile.aiFeedback.score >= 80 ? 'bg-success-glow text-success' : profile.aiFeedback.score >= 60 ? 'bg-warning-glow text-warning' : 'bg-danger-glow text-danger'} font-bold`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem', borderRadius: '20px' }}>
                            {profile.aiFeedback.score}%
                          </span>
                        ) : (
                          <span className="text-muted text-xs">N/A</span>
                        )}
                      </td>
                      <td>
                        {profile.resumeUrl ? (
                          <a 
                            href={`${BACKEND_URL}${profile.resumeUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-primary d-flex align-items-center gap-1"
                            style={{ width: 'fit-content', borderRadius: '14px', padding: '0.3rem 0.75rem' }}
                          >
                            View Resume <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-muted text-xs d-flex align-items-center gap-1">
                            <AlertCircle size={12} /> Missing
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Post Job Modal */}
      {showJobModal && (
        <div className="modal-overlay-custom" onClick={() => setShowJobModal(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '92%' }}>
            <div className="modal-header-custom">
              <div className="d-flex align-items-center gap-2.5">
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase className="text-primary" size={18} />
                </div>
                <div>
                  <h3 className="h5 font-bold mb-0" style={{ color: '#ffffff', fontSize: '1.15rem' }}>Post New Career Opportunity</h3>
                  <p className="text-xs text-muted mb-0" style={{ marginTop: '1px' }}>Publish job or internship listing to candidate directory</p>
                </div>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setShowJobModal(false)}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePostJob} className="modal-body-custom">
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Job Title *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Software Engineer Trainee"
                    value={newJob.title}
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    required
                    style={{ background: 'rgba(8, 11, 20, 0.75)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '12px', padding: '0.75rem 1rem' }}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Google Inc."
                    value={newJob.company}
                    onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                    required
                    style={{ background: 'rgba(8, 11, 20, 0.75)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '12px', padding: '0.75rem 1rem' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Job Description *</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder="Describe the roles, key responsibilities, and expected candidate outcomes..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  required
                  style={{ background: 'rgba(8, 11, 20, 0.75)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '12px', padding: '0.75rem 1rem' }}
                ></textarea>
              </div>

              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requirements (Comma Separated Skills) *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="React, Node.js, REST APIs, Git"
                  value={newJob.requirements}
                  onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                  required
                  style={{ background: 'rgba(8, 11, 20, 0.75)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '12px', padding: '0.75rem 1rem' }}
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Bangalore (Remote)"
                    value={newJob.location}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    required
                    style={{ background: 'rgba(8, 11, 20, 0.75)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '12px', padding: '0.75rem 1rem' }}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Salary Bracket</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 12 LPA"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                    style={{ background: 'rgba(8, 11, 20, 0.75)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '12px', padding: '0.75rem 1rem' }}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employment Type</label>
                  <select 
                    value={newJob.type} 
                    onChange={(e) => setNewJob({...newJob, type: e.target.value})}
                    className="form-input"
                    style={{ background: 'rgba(8, 11, 20, 0.75)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '12px', padding: '0.75rem 1rem' }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2.5 pt-3 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <button 
                  type="button" 
                  onClick={() => setShowJobModal(false)} 
                  className="btn btn-outline"
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '12px', fontSize: '0.88rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.5rem', borderRadius: '12px', fontWeight: '800', fontSize: '0.88rem', boxShadow: '0 4px 16px rgba(255, 255, 255, 0.2)' }}
                >
                  Publish Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showInterviewModal && selectedApp && (
        <div className="modal-overlay-custom" onClick={() => setShowInterviewModal(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '92%' }}>
            <div className="modal-header-custom">
              <div className="d-flex align-items-center gap-2.5">
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar className="text-primary" size={18} />
                </div>
                <div>
                  <h3 className="h5 font-bold mb-0" style={{ color: '#ffffff', fontSize: '1.15rem' }}>Schedule Interview</h3>
                  <p className="text-xs text-muted mb-0" style={{ marginTop: '1px' }}>Candidate: {selectedApp.student?.name}</p>
                </div>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setShowInterviewModal(false)}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleScheduleInterview} className="modal-body-custom">
              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={interviewForm.date}
                  onChange={(e) => setInterviewForm({...interviewForm, date: e.target.value})}
                  required
                  style={{ background: 'rgba(8, 11, 20, 0.75)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '12px', padding: '0.75rem 1rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. 11:30 AM"
                  value={interviewForm.time}
                  onChange={(e) => setInterviewForm({...interviewForm, time: e.target.value})}
                  required
                  style={{ background: 'rgba(8, 11, 20, 0.75)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '12px', padding: '0.75rem 1rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Interview Type</label>
                <select 
                  value={interviewForm.type} 
                  onChange={(e) => setInterviewForm({...interviewForm, type: e.target.value})}
                  className="form-input"
                  style={{ background: 'rgba(8, 11, 20, 0.75)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '12px', padding: '0.75rem 1rem' }}
                >
                  <option value="Technical Round 1">Technical Round 1</option>
                  <option value="Technical Round 2">Technical Round 2</option>
                  <option value="System Design Round">System Design Round</option>
                  <option value="HR / Managerial Round">HR / Managerial Round</option>
                </select>
              </div>

              <div className="d-flex justify-content-end gap-2.5 pt-3 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <button 
                  type="button" 
                  onClick={() => setShowInterviewModal(false)} 
                  className="btn btn-outline"
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '12px', fontSize: '0.88rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.5rem', borderRadius: '12px', fontWeight: '800', fontSize: '0.88rem', boxShadow: '0 4px 16px rgba(255, 255, 255, 0.2)' }}
                >
                  Schedule & Send Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
