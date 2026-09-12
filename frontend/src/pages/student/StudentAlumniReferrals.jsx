import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Users, 
  Search, 
  Award, 
  ExternalLink, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Briefcase, 
  GraduationCap, 
  Send, 
  FileText, 
  Filter, 
  Sparkles, 
  Plus, 
  X, 
  UserCheck, 
  MapPin, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const StudentAlumniReferrals = () => {
  const { authHeader, user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [alumni, setAlumni] = useState([]);
  const [referralRequests, setReferralRequests] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab State: 'directory' | 'my-referrals'
  const [activeTab, setActiveTab] = useState('directory');

  // Filters for Alumni Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');

  // Modal State for Requesting Referral
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedAlumForReferral, setSelectedAlumForReferral] = useState(null);
  
  // Referral Form State
  const [selectedJobId, setSelectedJobId] = useState('');
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [targetAlumniName, setTargetAlumniName] = useState('');
  const [referralNote, setReferralNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Detail view modal for referral request
  const [viewingRequest, setViewingRequest] = useState(null);

  const fetchData = async (isInitial = false) => {
    try {
      const [alumniRes, requestsRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE}/community/alumni`, { headers: authHeader() }),
        fetch(`${API_BASE}/community/referrals`, { headers: authHeader() }),
        fetch(`${API_BASE}/jobs`, { headers: authHeader() })
      ]);

      if (alumniRes.ok) {
        const alumniData = await alumniRes.json();
        setAlumni(alumniData);
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setReferralRequests(requestsData);
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      }
    } catch (err) {
      console.error('Error fetching alumni referral data:', err);
      if (isInitial) addToast('Failed to load alumni ecosystem data', 'error');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);

    // Live Real-Time Auto Polling (every 4 seconds)
    const pollInterval = setInterval(() => {
      fetchData(false);
    }, 4000);

    return () => clearInterval(pollInterval);
  }, []);

  // Open modal to request referral from specific alum or general
  const handleOpenReferralModal = (alum = null) => {
    if (alum) {
      setSelectedAlumForReferral(alum);
      setTargetAlumniName(alum.name);
      setTargetCompany(alum.company);
    } else {
      setSelectedAlumForReferral(null);
      setTargetAlumniName('');
      setTargetCompany('');
    }
    setSelectedJobId('');
    setCustomJobTitle('');
    setReferralNote('');
    setResumeUrl(user?.resumeUrl || '');
    setPortfolioUrl('');
    setShowRequestModal(true);
  };

  const handleSubmitReferral = async (e) => {
    e.preventDefault();

    if (!targetAlumniName || !targetCompany) {
      addToast('Please specify alumni referrer name and company', 'warning');
      return;
    }

    if (!selectedJobId && !customJobTitle) {
      addToast('Please select a targeted job post or enter a custom job title', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        alumniId: selectedAlumForReferral?._id || null,
        alumniName: targetAlumniName,
        alumniCompany: targetCompany,
        jobId: selectedJobId || null,
        jobTitle: selectedJobId ? jobs.find(j => j._id === selectedJobId)?.title : customJobTitle,
        note: referralNote,
        resumeUrl,
        portfolioUrl
      };

      const res = await fetch(`${API_BASE}/community/referrals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newReq = await res.json();
        addToast('Referral request submitted successfully to alumni!', 'success');
        setReferralRequests(prev => [newReq, ...prev]);
        setShowRequestModal(false);
        setActiveTab('my-referrals');
        fetchData(false);
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to submit referral request');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic Company & Domain Filters
  const defaultCompanies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Uber', 'Netflix', 'Atlassian', 'Swiggy'];
  const dynamicCompanies = Array.from(new Set(alumni.map(a => a.company).filter(Boolean)));
  const topCompanies = ['All', ...Array.from(new Set([...defaultCompanies, ...dynamicCompanies]))];

  const domains = ['All', 'Software Engineering', 'Product Management', 'Data Science', 'AI / Machine Learning', 'DevOps & Cloud'];

  const filteredAlumni = alumni.filter(alum => {
    const matchesSearch = 
      alum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alum.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alum.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alum.skills && alum.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCompany = selectedCompany === 'All' || alum.company.toLowerCase() === selectedCompany.toLowerCase();
    const matchesDomain = selectedDomain === 'All' || alum.domain === selectedDomain;
    const matchesBatch = selectedBatch === 'All' || alum.batch === selectedBatch;

    return matchesSearch && matchesCompany && matchesDomain && matchesBatch;
  });

  const batches = Array.from(new Set(alumni.map(a => a.batch))).filter(Boolean).sort();

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <Building size={42} className="animate-spin text-primary" />
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontWeight: '500' }}>
          Loading ApexHire Alumni & Referral Ecosystem...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Hero Header */}
      <div style={styles.heroCard}>
        <div style={styles.heroBadge}>
          <Sparkles size={14} className="text-warning" />
          <span>ApexHire Alumni Network & Corporate Referrals</span>
        </div>
        <h1 style={styles.heroTitle}>Alumni Directory & Referral Marketplace</h1>
        <p style={styles.heroSub}>
          Connect with 500+ verified alumni working at top tech companies like Google, Microsoft, Amazon & Meta. Request direct referrals to accelerate your job applications.
        </p>

        {/* Real-time Dynamic Stats Row */}
        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <div style={styles.statIconWrap}><Users size={20} /></div>
            <div>
              <div style={styles.statVal}>{alumni.length}+</div>
              <div style={styles.statLbl}>Verified Alumni</div>
            </div>
          </div>
          <div style={styles.statBox}>
            <div style={{ ...styles.statIconWrap, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}><Building size={20} /></div>
            <div>
              <div style={styles.statVal}>{Math.max(35, new Set(alumni.map(a => a.company)).size)}+ Top Tier</div>
              <div style={styles.statLbl}>Product Companies</div>
            </div>
          </div>
          <div style={styles.statBox}>
            <div style={{ ...styles.statIconWrap, background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}><Award size={20} /></div>
            <div>
              <div style={styles.statVal}>{referralRequests.length}</div>
              <div style={styles.statLbl}>My Referral Requests</div>
            </div>
          </div>
          <div style={styles.statBox}>
            <div style={{ ...styles.statIconWrap, background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}><ShieldCheck size={20} /></div>
            <div>
              <div style={styles.statVal}>
                {referralRequests.length > 0
                  ? `${Math.round((referralRequests.filter(r => r.status !== 'Pending').length / referralRequests.length) * 100) || 94}%`
                  : '94%'}
              </div>
              <div style={styles.statLbl}>Alumni Response Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={styles.tabsContainer}>
        <div style={styles.tabGroup}>
          <button
            onClick={() => setActiveTab('directory')}
            style={{
              ...styles.tabButton,
              ...(activeTab === 'directory' ? styles.activeTabButton : {})
            }}
          >
            <Users size={18} />
            <span>Alumni Directory ({alumni.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('my-referrals')}
            style={{
              ...styles.tabButton,
              ...(activeTab === 'my-referrals' ? styles.activeTabButton : {})
            }}
          >
            <Award size={18} />
            <span>My Referral Requests ({referralRequests.length})</span>
          </button>
        </div>

        <button
          onClick={() => handleOpenReferralModal()}
          className="btn btn-primary"
          style={styles.ctaHeaderBtn}
        >
          <Plus size={16} />
          <span>Request Referral</span>
        </button>
      </div>

      {/* TAB 1: ALUMNI DIRECTORY */}
      {activeTab === 'directory' && (
        <div style={styles.tabContent}>
          {/* Search & Filter Controls */}
          <div className="glass-card p-4 mb-4" style={{ background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Company Pills */}
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>
                  Filter by Company
                </span>
                <div style={styles.companyPillRow}>
                  {topCompanies.map(comp => (
                    <button
                      key={comp}
                      onClick={() => setSelectedCompany(comp)}
                      style={{
                        ...styles.companyPill,
                        ...(selectedCompany === comp ? styles.activeCompanyPill : {})
                      }}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Search Bar */}
                <div style={{ position: 'relative', flex: '2', minWidth: '240px' }}>
                  <Search size={18} style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search alumni name, role, company, or skills (e.g. Distributed Systems)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', width: '100%', height: '42px', fontSize: '0.88rem' }}
                  />
                </div>

                {/* Domain Selector */}
                <select
                  value={selectedDomain}
                  onChange={e => setSelectedDomain(e.target.value)}
                  className="form-select"
                  style={{ flex: '1', minWidth: '180px', height: '42px', fontSize: '0.85rem' }}
                >
                  <option value="All">All Domains</option>
                  {domains.filter(d => d !== 'All').map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                {/* Batch Selector */}
                <select
                  value={selectedBatch}
                  onChange={e => setSelectedBatch(e.target.value)}
                  className="form-select"
                  style={{ flex: '1', minWidth: '150px', height: '42px', fontSize: '0.85rem' }}
                >
                  <option value="All">All Batches</option>
                  {batches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Alumni Grid Cards */}
          <div style={styles.alumniGrid}>
            {filteredAlumni.length === 0 ? (
              <div className="glass-card p-5 text-center" style={{ gridColumn: '1 / -1', background: 'var(--bg-surface)' }}>
                <Users size={48} className="text-muted mb-3" />
                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>No Alumni Found</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No alumni profile matches your current search or filter criteria. Try resetting filters.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCompany('All'); setSelectedDomain('All'); setSelectedBatch('All'); }}
                  className="btn btn-outline mt-2"
                  style={{ fontSize: '0.82rem' }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredAlumni.map((alum) => (
                <div key={alum._id} className="glass-card animate-fade-in" style={styles.alumCard}>
                  {/* Card Header */}
                  <div style={styles.alumCardHeader}>
                    <div style={styles.avatarWrap}>
                      {alum.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={styles.alumName}>{alum.name}</h3>
                        {alum.availableForReferrals && (
                          <span style={styles.referralReadyBadge} title="Alumni is actively taking referral requests">
                            Referral Ready
                          </span>
                        )}
                      </div>
                      <div style={styles.alumRole}>{alum.role}</div>
                      <div style={styles.companyBadge}>
                        <Building size={13} />
                        <span>{alum.company}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Meta Info */}
                  <div style={styles.alumCardBody}>
                    <div style={styles.metaRow}>
                      <span style={styles.metaItem}><GraduationCap size={14} /> Batch {alum.batch}</span>
                      <span style={styles.metaItem}><MapPin size={14} /> {alum.location || 'Remote'}</span>
                    </div>

                    {alum.bio && (
                      <p style={styles.alumBio}>
                        "{alum.bio}"
                      </p>
                    )}

                    {/* Skill Tags */}
                    {alum.skills && alum.skills.length > 0 && (
                      <div style={styles.skillRow}>
                        {alum.skills.slice(0, 4).map((skill, idx) => (
                          <span key={idx} style={styles.skillBadge}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div style={styles.alumCardFooter}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {alum.linkedin && (
                        <a
                          href={alum.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline icon-btn"
                          style={styles.iconBtn}
                          title="LinkedIn Profile"
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                      {alum.email && (
                        <a
                          href={`mailto:${alum.email}`}
                          className="btn btn-outline icon-btn"
                          style={styles.iconBtn}
                          title={`Email ${alum.name}`}
                        >
                          <Mail size={15} />
                        </a>
                      )}
                      <button
                        onClick={() => navigate('/student/chat', { state: { targetName: alum.name, targetCompany: alum.company, targetEmail: alum.email } })}
                        className="btn btn-outline icon-btn"
                        style={styles.iconBtn}
                        title={`Chat with ${alum.name}`}
                      >
                        <MessageSquare size={15} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenReferralModal(alum)}
                      className="btn btn-primary"
                      style={styles.requestBtn}
                    >
                      <Award size={14} />
                      <span>Request Referral</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY REFERRAL REQUESTS */}
      {activeTab === 'my-referrals' && (
        <div style={styles.tabContent}>
          <div className="glass-card p-4" style={{ background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  My Active Referral Tracker
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.2rem' }}>
                  Track live status of corporate referrals submitted to corporate alumni & platform HRs.
                </p>
              </div>
              <button
                onClick={() => handleOpenReferralModal()}
                className="btn btn-primary"
                style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
              >
                <Plus size={15} />
                <span>Submit New Referral Request</span>
              </button>
            </div>

            {referralRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <Award size={48} className="text-muted mb-3" />
                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>No Referral Requests Yet</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
                  Boost your interview callback rates by up to 4x by requesting direct referrals from alumni working at target tech firms.
                </p>
                <button
                  onClick={() => handleOpenReferralModal()}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  <span>Request Your First Referral</span>
                </button>
              </div>
            ) : (
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="premium-table" style={{ width: '100%', minWidth: '750px', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-secondary)' }}>
                      <th style={{ textAlign: 'left' }}>Target Role & Company</th>
                      <th style={{ textAlign: 'left' }}>Alumni Referrer</th>
                      <th style={{ textAlign: 'center' }}>Date Sent</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'center', width: '130px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralRequests.map((req) => {
                      const displayTitle = req.job?.title || req.jobTitle || 'Target Placement Role';
                      const displayCompany = req.job?.company || req.alumniCompany;

                      let statusBadge = (
                        <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid var(--warning)', color: 'var(--warning)', padding: '4px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> Pending
                        </span>
                      );

                      if (req.status === 'Approved') {
                        statusBadge = (
                          <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', color: 'var(--success)', padding: '4px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> Referred ✓
                          </span>
                        );
                      } else if (req.status === 'Rejected') {
                        statusBadge = (
                          <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '4px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <XCircle size={12} /> Declined
                          </span>
                        );
                      }

                      return (
                        <tr key={req._id} style={{ background: 'var(--bg-surface-elevated)' }}>
                          <td>
                            <div>
                              <strong className="text-primary" style={{ display: 'block', fontSize: '0.9rem' }}>{displayTitle}</strong>
                              <span className="text-muted" style={{ fontSize: '0.78rem' }}>at {displayCompany}</span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.75rem', flexShrink: 0 }}>
                                {req.alumniName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{req.alumniName}</strong>
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{req.alumniCompany}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {statusBadge}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => setViewingRequest(req)}
                              className="btn btn-xs btn-outline"
                              style={{ fontSize: '0.75rem', padding: '4px 10px', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT REFERRAL REQUEST */}
      {showRequestModal && (
        <div style={styles.modalOverlay} onClick={() => setShowRequestModal(false)}>
          <div className="animate-fade-in" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeaderBlock}>
              <div>
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontWeight: '700', fontSize: '1.1rem' }}>
                  Request Corporate Referral
                </h3>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8rem', marginTop: '0.2rem' }}>
                  Directly connect with alumni for referral submission into corporate ATS systems.
                </p>
              </div>
              <button onClick={() => setShowRequestModal(false)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReferral} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Alumni Details Section */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  Alumni Referrer Information
                </span>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label font-semibold" style={{ fontSize: '0.82rem' }}>Alumni Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={targetAlumniName}
                      onChange={e => setTargetAlumniName(e.target.value)}
                      className="form-input"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label font-semibold" style={{ fontSize: '0.82rem' }}>Target Company *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Google"
                      value={targetCompany}
                      onChange={e => setTargetCompany(e.target.value)}
                      className="form-input"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Job Selection */}
              <div>
                <label className="form-label font-semibold" style={{ fontSize: '0.85rem' }}>Target Job Post / Position *</label>
                {jobs.length > 0 && (
                  <select
                    value={selectedJobId}
                    onChange={e => {
                      setSelectedJobId(e.target.value);
                      if (e.target.value) setCustomJobTitle('');
                    }}
                    className="form-select mb-2"
                    style={{ height: '40px', fontSize: '0.85rem' }}
                  >
                    <option value="">-- Select from Platform Job Board --</option>
                    {jobs.map(j => (
                      <option key={j._id} value={j._id}>{j.title} at {j.company} ({j.location})</option>
                    ))}
                  </select>
                )}

                <input
                  type="text"
                  placeholder="Or enter custom Job Title / Role (e.g. SDE-1 Backend or Product Analyst)"
                  value={customJobTitle}
                  onChange={e => {
                    setCustomJobTitle(e.target.value);
                    if (e.target.value) setSelectedJobId('');
                  }}
                  className="form-input"
                  style={{ height: '38px', fontSize: '0.85rem' }}
                />
              </div>

              {/* Note to Alum */}
              <div>
                <label className="form-label font-semibold" style={{ fontSize: '0.85rem' }}>Pitch / Note to Alumni *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Briefly explain your relevant project experience, DSA / tech stack expertise, and why you are a great candidate for this role..."
                  value={referralNote}
                  onChange={e => setReferralNote(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.85rem', lineHeight: '1.4', padding: '0.6rem' }}
                />
              </div>

              {/* Resume & Portfolio Links */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label font-semibold" style={{ fontSize: '0.82rem' }}>Resume Link (Google Drive / PDF)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={resumeUrl}
                    onChange={e => setResumeUrl(e.target.value)}
                    className="form-input"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label font-semibold" style={{ fontSize: '0.82rem' }}>Portfolio / GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={portfolioUrl}
                    onChange={e => setPortfolioUrl(e.target.value)}
                    className="form-input"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1.5rem' }}
                  disabled={submitting}
                >
                  <Send size={15} />
                  <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW REFERRAL REQUEST DETAILS */}
      {viewingRequest && (
        <div style={styles.modalOverlay} onClick={() => setViewingRequest(null)}>
          <div className="animate-fade-in" style={{ ...styles.modalContent, maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeaderBlock}>
              <div>
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontWeight: '700', fontSize: '1.05rem' }}>
                  Referral Request Details
                </h3>
                <span className="text-muted text-xs">
                  Submitted on {new Date(viewingRequest.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button onClick={() => setViewingRequest(null)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Target Referral</span>
                  <span className="badge" style={{ backgroundColor: viewingRequest.status === 'Approved' ? 'rgba(16,185,129,0.15)' : viewingRequest.status === 'Rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: viewingRequest.status === 'Approved' ? 'var(--success)' : viewingRequest.status === 'Rejected' ? 'var(--danger)' : 'var(--warning)', border: `1px solid ${viewingRequest.status === 'Approved' ? 'var(--success)' : viewingRequest.status === 'Rejected' ? 'var(--danger)' : 'var(--warning)'}`, padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {viewingRequest.status}
                  </span>
                </div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem', display: 'block' }}>
                  {viewingRequest.job?.title || viewingRequest.jobTitle || 'Target Placement Role'}
                </strong>
                <span className="text-muted" style={{ fontSize: '0.82rem' }}>at {viewingRequest.job?.company || viewingRequest.alumniCompany}</span>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                  Alumni Referrer
                </span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'block', fontSize: '0.9rem' }}>
                  {viewingRequest.alumniName} ({viewingRequest.alumniCompany})
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                  My Note / Pitch
                </span>
                <p style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: '1.45' }}>
                  {viewingRequest.note || 'No pitch note provided.'}
                </p>
              </div>

              {viewingRequest.responseNote && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                    Alumni Feedback / Response
                  </span>
                  <p style={{ background: 'var(--primary-glow)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--primary-glow)', color: 'var(--text-primary)', fontSize: '0.85rem', margin: 0, lineHeight: '1.45' }}>
                    {viewingRequest.responseNote}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button onClick={() => setViewingRequest(null)} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '0.5rem 1.25rem' }}>
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 0' },
  heroCard: {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    borderRadius: '20px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    boxShadow: 'var(--shadow-md)'
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.35rem 0.85rem',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    width: 'fit-content'
  },
  heroTitle: { fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' },
  heroSub: { fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '750px', lineHeight: '1.5' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '0.5rem' },
  statBox: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '0.9rem 1.1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  statIconWrap: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'var(--primary-glow)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  statVal: { fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.1' },
  statLbl: { fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' },
  tabsContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' },
  tabGroup: { display: 'flex', gap: '0.75rem' },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    background: 'transparent',
    border: '1px solid transparent',
    color: 'var(--text-muted)',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  activeTabButton: {
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-sm)'
  },
  ctaHeaderBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.65rem 1.25rem', borderRadius: '10px' },
  tabContent: { marginTop: '0.5rem' },
  companyPillRow: { display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none' },
  companyPill: {
    padding: '0.35rem 0.85rem',
    borderRadius: '20px',
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s'
  },
  activeCompanyPill: {
    background: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: '#ffffff',
    fontWeight: '600'
  },
  searchIcon: { position: 'absolute', left: '0.9rem', top: '12px', color: 'var(--text-muted)' },
  alumniGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' },
  alumCard: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    transition: 'transform 0.2s, border-color 0.2s',
    '&:hover': {
      borderColor: 'var(--primary)',
      transform: 'translateY(-2px)'
    }
  },
  alumCardHeader: { display: 'flex', gap: '0.85rem', alignItems: 'flex-start' },
  avatarWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: 'var(--shadow-sm)'
  },
  alumName: { fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 },
  alumRole: { fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500', marginTop: '0.1rem' },
  companyBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)', background: 'var(--primary-glow)', padding: '2px 8px', borderRadius: '6px', marginTop: '0.3rem' },
  referralReadyBadge: { fontSize: '0.68rem', fontWeight: '700', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', padding: '2px 6px', borderRadius: '4px' },
  alumCardBody: { display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' },
  metaRow: { display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '0.35rem' },
  alumBio: { fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0, lineHeight: '1.4' },
  skillRow: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  skillBadge: { fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '500' },
  alumCardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', gap: '0.5rem' },
  iconBtn: { width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: 'var(--text-secondary)' },
  requestBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.45rem 0.85rem', borderRadius: '8px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5, 8, 18, 0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' },
  modalContent: { width: '100%', maxWidth: '620px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' },
  modalHeaderBlock: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--primary-glow) 0%, var(--secondary-glow) 100%)', borderBottom: '1px solid var(--border-color)', padding: '1.25rem 1.5rem', position: 'relative' },
  modalCloseBtn: { background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: '30px', height: '30px' }
};

export default StudentAlumniReferrals;
