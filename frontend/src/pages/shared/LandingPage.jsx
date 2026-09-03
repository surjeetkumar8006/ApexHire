import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Compass, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle, 
  GraduationCap, 
  ChevronDown, 
  ChevronUp, 
  Briefcase, 
  FileText, 
  Award, 
  HelpCircle,
  Activity,
  Users,
  Cpu,
  Zap,
  Check
} from 'lucide-react';
import { API_BASE } from '../../context/AuthContext';

const LandingPage = ({ onGetStarted }) => {
  const [activeTab, setActiveTab] = useState('coach');
  const [openFaq, setOpenFaq] = useState(null);

  // Real-Time Skill Match Calculator Playground State
  const [calcRole, setCalcRole] = useState('Full Stack Engineer');
  const [userSkills, setUserSkills] = useState(['React', 'Node.js', 'System Design']);

  const roleSkillMap = {
    'Full Stack Engineer': ['React', 'Node.js', 'System Design', 'MongoDB', 'REST APIs'],
    'Frontend Specialist': ['React', 'TypeScript', 'CSS Layout', 'Performance', 'HTML5'],
    'Backend Engineer': ['Node.js', 'System Design', 'Databases', 'APIs', 'Docker'],
    'AI / ML Specialist': ['Python', 'LLMs', 'PyTorch', 'System Design', 'APIs']
  };

  const allAvailableSkills = ['React', 'Node.js', 'Python', 'System Design', 'MongoDB', 'TypeScript', 'Docker', 'REST APIs', 'PyTorch', 'CSS Layout', 'Performance'];

  const targetRequired = roleSkillMap[calcRole] || [];
  const matchedSkills = userSkills.filter(s => targetRequired.includes(s));
  const missingSkills = targetRequired.filter(s => !userSkills.includes(s));
  const calcScore = Math.round((matchedSkills.length / targetRequired.length) * 100);

  // Real-Time CTC Estimator State
  const [branch, setBranch] = useState('CSE / IT');
  const [prepTier, setPrepTier] = useState('ready');

  const ctcMatrix = {
    'CSE / IT': {
      foundation: { range: '₹6.5 - ₹10 LPA', highest: '₹18 LPA', recruiters: 42, companies: 'Amazon, Infosys, TCS, Wipro' },
      ready: { range: '₹12 - ₹18 LPA', highest: '₹32 LPA', recruiters: 85, companies: 'Google, Microsoft, Cred, Flipkart' },
      elite: { range: '₹22 - ₹45 LPA', highest: '₹65 LPA', recruiters: 120, companies: 'Meta, Uber, Atlassian, Goldman Sachs' }
    },
    'ECE / EEE': {
      foundation: { range: '₹5.5 - ₹8.5 LPA', highest: '₹14 LPA', recruiters: 28, companies: 'Qualcomm, Intel, L&T, Siemens' },
      ready: { range: '₹10 - ₹15 LPA', highest: '₹26 LPA', recruiters: 54, companies: 'Texas Instruments, Nvidia, AMD, Apple' },
      elite: { range: '₹18 - ₹36 LPA', highest: '₹52 LPA', recruiters: 75, companies: 'Nvidia, Samsung R&D, Qualcomm, Arm' }
    },
    'Mechanical': {
      foundation: { range: '₹4.8 - ₹7.5 LPA', highest: '₹12 LPA', recruiters: 20, companies: 'Tata Motors, Mahindra, L&T' },
      ready: { range: '₹8 - ₹12 LPA', highest: '₹20 LPA', recruiters: 38, companies: 'Tesla, Boeing, Airbus, Caterpillar' },
      elite: { range: '₹14 - ₹24 LPA', highest: '₹38 LPA', recruiters: 45, companies: 'Mercedes-Benz, BMW R&D, Rolls-Royce' }
    },
    'Civil / Other': {
      foundation: { range: '₹4.5 - ₹6.8 LPA', highest: '₹10 LPA', recruiters: 18, companies: 'L&T, DLF, Shapoorji Pallonji' },
      ready: { range: '₹7.5 - ₹11 LPA', highest: '₹16 LPA', recruiters: 30, companies: 'Bechtel, Jacobs, AECOM' },
      elite: { range: '₹12 - ₹20 LPA', highest: '₹28 LPA', recruiters: 36, companies: 'McKinsey, BCG, KPMG Advisory' }
    }
  };

  const estimatedCtc = ctcMatrix[branch]?.[prepTier] || ctcMatrix['CSE / IT']['ready'];

  const [stats, setStats] = useState({
    placementRate: 95,
    activeJobsCount: 1200,
    avgResumeScore: 88,
    recentPlacements: [
      { name: 'Rahul Sharma', role: 'Software Engineer (SDE-1)', company: 'Microsoft', salary: '$145,000/yr' },
      { name: 'Anjali Goel', role: 'Frontend Developer', company: 'Google', salary: '$130,000/yr' },
      { name: 'Saurabh Verma', role: 'Full Stack Engineer', company: 'Amazon', salary: '$140,000/yr' },
      { name: 'Priyanka Sen', role: 'Product Design Intern', company: 'Salesforce', salary: '$8,500/mo' }
    ]
  });

  useEffect(() => {
    const fetchLandingStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics/public`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch public stats:', err);
      }
    };
    fetchLandingStats();
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const featureTabs = [
    {
      id: 'coach',
      tabLabel: 'AI Resume Coach',
      title: 'AI Resume Coach',
      desc: 'Upload your resume to receive an instant analysis score, targeted improvement recommendations, and auto-identified roles.',
      icon: <Sparkles size={18} />,
      bullets: [
        'Instant scoring calibrated against active job requirements',
        'Auto-identifies missing technical and soft skill keywords',
        'Custom tips to bypass ATS filters and catch recruiter attention'
      ]
    },
    {
      id: 'tracker',
      tabLabel: 'Application Tracker',
      title: 'Unified Application Tracker',
      desc: 'Visualize your applications on a linear progression board, updating dynamically from application review through interviews to offers.',
      icon: <Compass size={18} />,
      bullets: [
        'Linear stage progression: Applied → Reviewing → Shortlisted → Offered',
        'Consolidated dashboard for tracking multiple application pipelines',
        'Instant status change notifications with admin review comments'
      ]
    },
    {
      id: 'admin',
      tabLabel: 'Admin Dashboard',
      title: 'Admin Intelligence',
      desc: 'Enable recruitment coordinators to post vacancies, track registration statistics, review resumes, and select top candidates.',
      icon: <Shield size={18} />,
      bullets: [
        'Global portal announcement broadcaster and instant delivery',
        'Unified applicant verification toggle with verification badges',
        'Interactive analytics dashboard displaying live registration metrics'
      ]
    }
  ];

  const faqItems = [
    {
      q: 'How does the AI Resume Coach work?',
      a: 'The AI Resume Coach extracts the text content of your uploaded PDF resume, analyzes it against typical industry keywords, and calculates a match percentage. It provides automated, targeted suggestions to improve your resume structure and highlight relevant skills.'
    },
    {
      q: 'Can administrators communicate directly with applicants?',
      a: 'Yes, placement coordinators can review each candidate profile, change application pipeline stages (e.g. from Reviewing to Shortlisted), and leave specific comments and interview details that appear instantly on the student\'s dashboard.'
    },
    {
      q: 'What are portal announcements?',
      a: 'Portal announcements are global notices published by administrators (e.g. regarding new hiring drives, schedule changes, or policy updates). These appear instantly in the student dashboard header notification feed.'
    },
    {
      q: 'Is student profile verification required?',
      a: 'Student profiles are marked as "Pending Verification" upon registration. Administrators can review academic and experience details and mark profiles as "Verified". A green verification checkmark shield then displays on the student\'s resume and application card.'
    }
  ];

  const companies = [
    { name: 'Google', icon: 'G' },
    { name: 'Microsoft', icon: 'M' },
    { name: 'Amazon', icon: 'A' },
    { name: 'Meta', icon: '∞' },
    { name: 'Netflix', icon: 'N' },
    { name: 'Adobe', icon: 'A' },
    { name: 'Salesforce', icon: 'S' }
  ];

  const recentPlacements = stats.recentPlacements;

  const activeFeatureData = featureTabs.find(tab => tab.id === activeTab);

  return (
    <div className="landing-container animate-fade-in">
      <div className="blob1"></div>
      <div className="blob2"></div>

      {/* 1. HERO SECTION */}
      <section className="landing-hero">
        <div className="landing-hero-left">
          <div className="hero-badge">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e', display: 'inline-block' }}></span>
            <span>Real-Time Placement & AI Career Engine</span>
          </div>
          <h1 className="hero-title">
            Elevate Your Career Path With <br />
            <span className="gradient-text">AI-Powered Precision</span>
          </h1>
          <p className="hero-subtitle">
            A unified career and placement ecosystem featuring dynamic resume parsing, matching score analytics, application pipelines, and real-time coordinator feedback channels.
          </p>
          <div className="hero-ctas">
            <button onClick={onGetStarted} className="btn btn-primary">
              <span>Get Started Now</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="landing-hero-right">
          <div className="hero-mockup-container">
            <div className="hero-mockup-window">
              <div className="mockup-header">
                <div className="mockup-dot red"></div>
                <div className="mockup-dot yellow"></div>
                <div className="mockup-dot green"></div>
                <div className="mockup-tab"></div>
              </div>
              <div className="mockup-body">
                {/* Profile Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textAlign: 'left' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#ffffff', color: '#0b0f19', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    AM
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Alex Mercer</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Candidate ID: #8820</p>
                  </div>
                </div>

                {/* Resume Score */}
                <div className="mockup-score-card">
                  <div className="score-circle-wrap">
                    <svg className="score-circle-svg" viewBox="0 0 36 36">
                      <path
                        className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="3.5"
                      />
                      <path
                        className="circle"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#ffffff"
                        strokeDasharray="88, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="score-number">88</span>
                  </div>
                  <div className="score-info">
                    <h4 style={{ color: '#ffffff' }}>AI Match Score: Excellent</h4>
                    <p>Matches: Frontend Dev & React Developer roles</p>
                  </div>
                </div>

                {/* Pipeline */}
                <div className="mockup-pipeline">
                  <div className="pipeline-line">
                    <div className="pipeline-line-progress"></div>
                  </div>
                  <div className="pipeline-step">
                    <div className="step-dot completed">✓</div>
                    <span className="step-label">Applied</span>
                  </div>
                  <div className="pipeline-step">
                    <div className="step-dot completed">✓</div>
                    <span className="step-label">Reviewing</span>
                  </div>
                  <div className="pipeline-step">
                    <div className="step-dot active">●</div>
                    <span className="step-label">Interview</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1.5 REAL-TIME INTERACTIVE AI SKILL MATCH PLAYGROUND */}
      <section style={{ width: '100%', maxWidth: '1200px', margin: '0 auto 5rem auto', padding: '0 1rem' }}>
        <div 
          className="glass-card" 
          style={{ 
            background: 'var(--bg-surface-elevated)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '24px', 
            padding: '2.5rem',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-primary-glow text-primary font-semibold text-xs px-2.5 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                  <Zap size={12} className="animate-pulse" /> Interactive Real-Time Playground
                </span>
                <span className="text-xxs text-muted">• Gemini AI Match Calibrator</span>
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Simulate AI Match Score in Real-Time
              </h3>
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <span className="text-xs text-muted">Target Role:</span>
              <select 
                value={calcRole} 
                onChange={(e) => setCalcRole(e.target.value)}
                className="form-select text-xs font-semibold"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', padding: '0.4rem 0.8rem' }}
              >
                {Object.keys(roleSkillMap).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              <p className="text-xs text-muted mb-3">
                Click skills below to simulate real-time AI parser score calculations for <strong>{calcRole}</strong> target vacancies:
              </p>
              
              <div className="d-flex flex-wrap gap-2 mb-4">
                {allAvailableSkills.map(skill => {
                  const isSelected = userSkills.includes(skill);
                  const isRequired = targetRequired.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setUserSkills(prev => prev.filter(s => s !== skill));
                        } else {
                          setUserSkills(prev => [...prev, skill]);
                        }
                      }}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '30px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: isSelected ? '#ffffff' : 'var(--bg-base)',
                        color: isSelected ? '#0b0f19' : 'var(--text-secondary)',
                        border: isSelected ? '1px solid #ffffff' : '1px solid var(--border-color)',
                        boxShadow: isSelected ? '0 4px 12px rgba(255, 255, 255, 0.2)' : 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {isSelected && <Check size={12} />}
                      {skill}
                      {isRequired && !isSelected && <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>(Req)</span>}
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-3" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)' }}>
                <div className="d-flex justify-content-between align-items-center text-xs mb-2">
                  <span className="font-semibold text-secondary">Matching Status Breakdown</span>
                  <span className="font-bold" style={{ color: calcScore >= 75 ? 'var(--success)' : calcScore >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                    {calcScore}% Industry Match
                  </span>
                </div>
                <div className="progress" style={{ height: '8px', background: 'var(--bg-surface)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${calcScore}%`, 
                      background: calcScore >= 75 ? 'var(--success)' : calcScore >= 50 ? 'var(--warning)' : 'var(--danger)',
                      transition: 'width 0.4s ease' 
                    }}
                  ></div>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mt-3 text-xxs text-muted flex-wrap gap-2">
                  <span>Matched ({matchedSkills.length}): <strong className="text-primary">{matchedSkills.join(', ') || 'None'}</strong></span>
                  {missingSkills.length > 0 && (
                    <span>Missing Target Skills: <strong style={{ color: 'var(--warning)' }}>{missingSkills.join(', ')}</strong></span>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="text-center p-4 rounded-4 position-relative" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)' }}>
                <div className="mb-2">
                  <div className="avatar-circle mx-auto font-extrabold" style={{
                    width: 72,
                    height: 72,
                    border: `4px solid ${calcScore >= 75 ? 'var(--success)' : calcScore >= 50 ? 'var(--warning)' : 'var(--danger)'}`,
                    color: calcScore >= 75 ? 'var(--success)' : calcScore >= 50 ? 'var(--warning)' : 'var(--danger)',
                    background: 'var(--bg-surface)',
                    fontSize: '1.5rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {calcScore}%
                  </div>
                </div>
                
                <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                  {calcScore >= 75 ? '🔥 High Candidate Match' : calcScore >= 50 ? '⚡ Good Baseline Fit' : '⚠️ Skills Gap Identified'}
                </h4>
                <p className="text-xxs text-muted mb-3">
                  {calcScore >= 75 ? `You satisfy ${matchedSkills.length} out of ${targetRequired.length} key requirements for ${calcRole}!` : `Add ${missingSkills[0] || 'more skills'} to boost match score.`}
                </p>

                <button 
                  onClick={onGetStarted} 
                  className="btn btn-sm btn-primary w-100 py-2.5 font-bold text-xs"
                >
                  Parse Full Resume Now <ArrowRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMPANY MARQUEE */}
      <section className="logo-marquee-section">
        <h4>Trusted By Recruiting Teams Worldwide</h4>
        <div className="logo-marquee-container">
          <div className="logo-marquee-track">
            {companies.concat(companies).map((c, i) => (
              <div key={i} className="logo-chip">
                <span style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 'bold' }}>{c.icon}</span>
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE FEATURES SHOWCASE */}
      <section className="showcase-section">
        <h2>Engineered For Career Acceleration</h2>
        <div className="showcase-tabs">
          {featureTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`showcase-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              <span>{tab.tabLabel}</span>
            </button>
          ))}
        </div>

        <div className="showcase-display">
          <div className="showcase-text-side">
            <h3>{activeFeatureData.title}</h3>
            <p>{activeFeatureData.desc}</p>
            <div className="showcase-features-list">
              {activeFeatureData.bullets.map((bullet, idx) => (
                <div key={idx} className="showcase-feature-item">
                  <CheckCircle size={16} color="var(--success)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="showcase-visual-side">
            {activeTab === 'coach' && (
              <div className="feature-mockup-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>AI Parsing Report</span>
                  <span style={{ color: 'var(--success)', fontWeight: '700', fontSize: '0.85rem' }}>Active</span>
                </div>
                <div style={{ textAlign: 'left', fontSize: '0.82rem' }}>
                  <strong>Extracted Tech Skills:</strong>
                  <div className="mockup-skills-grid">
                    <span className="mockup-skill-chip">React.js</span>
                    <span className="mockup-skill-chip">Node.js</span>
                    <span className="mockup-skill-chip">JavaScript</span>
                    <span className="mockup-skill-chip">MongoDB</span>
                  </div>
                  <div className="mockup-alert-box">
                    <Sparkles size={16} style={{ flexShrink: 0 }} />
                    <span><strong>Recommendation:</strong> Add <strong>Docker</strong> or <strong>Kubernetes</strong> to your skills list to increase match score by 12% for Enterprise roles.</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tracker' && (
              <div className="feature-mockup-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Active Applications</span>
                  <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.85rem' }}>Updated</span>
                </div>
                <div className="mockup-job-row">
                  <div className="mockup-job-info">
                    <span className="mockup-job-title">Google | Frontend Engineer</span>
                    <span className="mockup-job-meta">Applied 2 days ago</span>
                  </div>
                  <span className="badge badge-interviewing" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>Interview</span>
                </div>
                <div className="mockup-job-row">
                  <div className="mockup-job-info">
                    <span className="mockup-job-title">Microsoft | Software Intern</span>
                    <span className="mockup-job-meta">Applied 1 week ago</span>
                  </div>
                  <span className="badge badge-offered" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>Offered</span>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="feature-mockup-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Placement Metrics</span>
                  <span style={{ color: 'var(--secondary)', fontWeight: '700', fontSize: '0.85rem' }}>Live</span>
                </div>
                <div className="mockup-chart-container">
                  <div className="mockup-chart-row">
                    <div className="mockup-chart-label">
                      <span>2024 Placement Rate</span>
                      <span>78%</span>
                    </div>
                    <div className="mockup-chart-bar-bg">
                      <div className="mockup-chart-bar-fill" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  <div className="mockup-chart-row">
                    <div className="mockup-chart-label">
                      <span>2025 Placement Rate</span>
                      <span>86%</span>
                    </div>
                    <div className="mockup-chart-bar-bg">
                      <div className="mockup-chart-bar-fill" style={{ width: '86%' }}></div>
                    </div>
                  </div>
                  <div className="mockup-chart-row">
                    <div className="mockup-chart-label">
                      <span>2026 Placement Rate (Current)</span>
                      <span>95%</span>
                    </div>
                    <div className="mockup-chart-bar-bg">
                      <div className="mockup-chart-bar-fill" style={{ width: '95%', background: 'linear-gradient(90deg, var(--accent) 60%, var(--primary) 100%)' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3.5 REAL-TIME SALARY & PLACEMENT CTC ESTIMATOR */}
      <section style={{ width: '100%', maxWidth: '1200px', margin: '0 auto 5rem auto', padding: '0 1rem' }}>
        <div 
          className="glass-card" 
          style={{ 
            background: 'var(--bg-surface-elevated)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '24px', 
            padding: '2.5rem',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div className="text-center mb-4">
            <span className="badge bg-primary-glow text-primary font-semibold text-xs px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1 mb-2">
              <TrendingUp size={14} /> Live Placement CTC Estimator 2026
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#ffffff' }}>
              Estimate Your Placement Offer Package
            </h2>
            <p className="text-xs text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Select your academic branch and skill readiness tier to calculate predicted placement CTC and top hiring recruiters:
            </p>
          </div>

          <div className="row g-4 align-items-center">
            <div className="col-md-6">
              <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)' }}>
                <label className="text-xs text-muted font-semibold mb-2 d-block">Select Branch:</label>
                <div className="d-flex flex-wrap gap-2">
                  {['CSE / IT', 'ECE / EEE', 'Mechanical', 'Civil / Other'].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBranch(b)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: branch === b ? '#ffffff' : 'transparent',
                        color: branch === b ? '#0b0f19' : 'var(--text-secondary)',
                        border: branch === b ? '1px solid #ffffff' : '1px solid var(--border-color)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-3" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)' }}>
                <label className="text-xs text-muted font-semibold mb-2 d-block">Skill Preparation Tier:</label>
                <div className="d-flex flex-wrap gap-2">
                  {[
                    { key: 'foundation', label: '🌱 Foundation' },
                    { key: 'ready', label: '⚡ Interview Ready' },
                    { key: 'elite', label: '🔥 Top 1% Elite' }
                  ].map(t => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setPrepTier(t.key)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: prepTier === t.key ? '#ffffff' : 'transparent',
                        color: prepTier === t.key ? '#0b0f19' : 'var(--text-secondary)',
                        border: prepTier === t.key ? '1px solid #ffffff' : '1px solid var(--border-color)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-4 rounded-4 text-center" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)' }}>
                <span className="text-xxs text-muted text-uppercase tracking-wider font-semibold">Estimated CTC Range</span>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', margin: '0.5rem 0' }}>
                  {estimatedCtc.range}
                </h3>
                <div className="d-flex justify-content-center gap-2 align-items-center mb-3 flex-wrap">
                  <span className="badge bg-success-subtle text-success border border-success-subtle text-xs px-2.5 py-1 rounded-pill font-semibold">
                    Highest Offer: {estimatedCtc.highest}
                  </span>
                  <span className="badge bg-primary-glow text-primary text-xs px-2.5 py-1 rounded-pill font-semibold">
                    {estimatedCtc.recruiters} Hiring Companies
                  </span>
                </div>
                <p className="text-xxs text-muted mb-0">
                  Key Recruiter Network: <strong className="text-primary">{estimatedCtc.companies}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATISTICS & LIVE PLACEMENTS TICKER */}
      <section className="metrics-section">
        <div className="metrics-title">
          <h2>Proven Placement Results</h2>
          <p>Real-time metrics tracking coordinator success and campus recruitment rate.</p>
        </div>
        <div className="metrics-grid">
          <div className="metrics-card">
            <span className="metrics-num">{stats.placementRate}%</span>
            <span className="metrics-label">Placement Rate</span>
            <span className="metrics-desc">Of registered students placed in 2026</span>
          </div>
          <div className="metrics-card">
            <span className="metrics-num">{stats.activeJobsCount}</span>
            <span className="metrics-label">Active Job Openings</span>
            <span className="metrics-desc">Across top enterprise partners</span>
          </div>
          <div className="metrics-card">
            <span className="metrics-num">{stats.avgResumeScore}/100</span>
            <span className="metrics-label">Avg Resume Match Score</span>
            <span className="metrics-desc">Calculated by our parsing engine</span>
          </div>
        </div>

        {/* Live Placements scrolling ticker */}
        <div className="placement-ticker-card">
          <div className="placement-ticker-header">
            <Award size={18} color="var(--accent)" />
            <span>Live Portal Placements Feed</span>
          </div>
          <div className="placement-ticker-wrap">
            <div className="placement-ticker-list">
              {recentPlacements.concat(recentPlacements).map((p, i) => (
                <div key={i} className="ticker-item-content">
                  <div>
                    🎉 <strong>{p.name}</strong> was placed as a <strong>{p.role}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="ticker-company-badge">{p.company}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--success)' }}>{p.salary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ ACCORDION SECTION */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-accordion-container">
          {faqItems.map((item, idx) => (
            <div key={idx} className={`faq-item-card ${openFaq === idx ? 'open' : ''}`}>
              <button className="faq-header-btn" onClick={() => toggleFaq(idx)}>
                <span>{item.q}</span>
                {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <div 
                className="faq-answer-pane" 
                style={{ maxHeight: openFaq === idx ? '200px' : '0px' }}
              >
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Info */}
      <footer style={{ marginTop: 'auto', padding: '2rem 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', width: '100%', maxWidth: '1000px', textAlign: 'center' }}>
        <p>© 2026 ApexHire Career & Placement Portal. Handcrafted with MERN & AI.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
