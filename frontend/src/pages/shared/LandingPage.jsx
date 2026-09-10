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
  Check,
  Star,
  Search,
  Building,
  DollarSign,
  Play,
  Video,
  Terminal,
  Target,
  BarChart2,
  MessageSquare,
  Clock,
  MapPin
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
      { name: 'Rahul Sharma', role: 'Software Engineer (SDE-1)', company: 'Microsoft', salary: '₹45 LPA' },
      { name: 'Priya Verma', role: 'Product Manager', company: 'Meta', salary: '₹52 LPA' },
      { name: 'Saurabh Yadav', role: 'Full Stack Engineer', company: 'Google', salary: '₹38 LPA' },
      { name: 'Anjali Goel', role: 'AI / ML Specialist', company: 'NVIDIA', salary: '₹36 LPA' }
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
      title: 'AI Resume Parser & Coach',
      desc: 'Upload your resume to receive instant match scoring, targeted keyword recommendations, and auto-identified target job roles.',
      icon: <Sparkles size={18} />,
      bullets: [
        'Instant AI score calibrated against live top tier job vacancies',
        'Auto-detects missing technical and system design keywords',
        'ATS filter optimization to guarantee interview shortlisting'
      ]
    },
    {
      id: 'mock',
      tabLabel: 'AI Mock Interview',
      title: 'Real-Time Voice Mock Interviews',
      desc: 'Simulate full technical and HR rounds with Ava, our AI interviewer. Experience human-like calm speech pace (0.88x) and instant grading.',
      icon: <Cpu size={18} />,
      bullets: [
        'Voice STT recognition with calm 0.88x TTS speech delivery',
        'Inactivity & silence detection with prompt reminders ("Are you there?")',
        'Detailed evaluation scorecard with model reference answers'
      ]
    },
    {
      id: 'tracker',
      tabLabel: 'Application Tracker',
      title: 'Unified Application Pipeline',
      desc: 'Visualize your applications on a linear progression board, updating dynamically from application review through interviews to offers.',
      icon: <Compass size={18} />,
      bullets: [
        '5-stage progression: Applied → Reviewing → Shortlisted → Interviewing → Offered',
        'Consolidated dashboard for tracking multiple campus drives',
        'Instant status change notifications with admin review comments'
      ]
    },
    {
      id: 'admin',
      tabLabel: 'Admin Portal',
      title: 'Recruitment Coordination Engine',
      desc: 'Enable placement coordinators to post vacancies, track real-time active users, review candidate profiles, and schedule interviews.',
      icon: <Shield size={18} />,
      bullets: [
        'Real-time active user session heartbeat tracking counter',
        'Unified applicant verification toggle with verified badges',
        'Interactive analytics dashboard displaying live placement metrics'
      ]
    }
  ];

  const featuredJobs = [
    { title: 'Software Development Engineer (SDE-1)', company: 'Google', ctc: '₹32 - ₹45 LPA', location: 'Bangalore / Remote', tags: ['React', 'Node.js', 'DSA', 'System Design'] },
    { title: 'Frontend Engineering Specialist', company: 'Microsoft', ctc: '₹28 - ₹38 LPA', location: 'Hyderabad', tags: ['React', 'TypeScript', 'CSS', 'Performance'] },
    { title: 'Cloud & Infrastructure Engineer', company: 'Amazon', ctc: '₹26 - ₹36 LPA', location: 'Gurugram / Hybrid', tags: ['AWS', 'NodeJS', 'Docker', 'Kubernetes'] },
    { title: 'AI & ML Research Specialist', company: 'NVIDIA', ctc: '₹35 - ₹52 LPA', location: 'Pune / Remote', tags: ['Python', 'PyTorch', 'LLMs', 'Neural Nets'] },
    { title: 'Full Stack Product Engineer', company: 'Meta', ctc: '₹38 - ₹55 LPA', location: 'Bangalore', tags: ['MERN', 'GraphQL', 'Next.js', 'System Design'] },
    { title: 'DevOps & Systems Engineer', company: 'Netflix', ctc: '₹30 - ₹48 LPA', location: 'Remote', tags: ['Docker', 'K8s', 'CI/CD', 'Linux'] }
  ];

  const studentTestimonials = [
    {
      name: 'Rahul Sharma',
      role: 'Software Engineer (SDE-1)',
      company: 'Microsoft',
      pkg: '₹45 LPA',
      avatar: 'RS',
      comment: 'ApexHire\'s AI Resume Coach helped me identify missing system design keywords. The AI Voice Mock Interview prepared me for tough technical questions!',
      rating: 5
    },
    {
      name: 'Priya Verma',
      role: 'Product Engineer',
      company: 'Meta',
      pkg: '₹52 LPA',
      avatar: 'PV',
      comment: 'The 0.88x calm pace AI interviewer simulated real HR & tech rounds seamlessly. I knew exact points to improve before my final Meta interviews.',
      rating: 5
    },
    {
      name: 'Saurabh Yadav',
      role: 'Full Stack Engineer',
      company: 'Google',
      pkg: '₹38 LPA',
      avatar: 'SY',
      comment: 'Real-time application status tracking kept me updated every step without waiting for emails. The CTC estimator was 100% accurate for my profile!',
      rating: 5
    }
  ];

  const faqItems = [
    {
      q: 'How does the AI Resume Coach and Match Engine work?',
      a: 'The AI Resume Coach parses your PDF resume text using Gemini AI models, extracts technical skills, compares them against live job descriptions, and outputs a 0-100% match score with actionable keyword improvement tips.'
    },
    {
      q: 'What is the AI Voice Mock Interview Room?',
      a: 'It is a simulated interview console with Ava (AI interviewer). Ava asks company-specific technical questions at a calm pace (0.88x speed), listens via Speech-to-Text, prompts you if you stay silent for 15 seconds, and evaluates your answers against industry benchmarks.'
    },
    {
      q: 'Can administrators and recruiters schedule interviews directly?',
      a: 'Yes! Administrators can schedule interviews, select candidates from active drives, assign dates, times, round types, and Zoom/Meeting links which instantly appear on the candidate dashboard.'
    },
    {
      q: 'How does real-time online active tracking work?',
      a: 'ApexHire uses a session heartbeat system pinging every 3 seconds to accurately display the exact number of active users online across the platform in real time.'
    }
  ];

  const companies = [
    { name: 'Google', icon: 'G' },
    { name: 'Microsoft', icon: 'M' },
    { name: 'Amazon', icon: 'A' },
    { name: 'Meta', icon: '∞' },
    { name: 'Netflix', icon: 'N' },
    { name: 'NVIDIA', icon: 'N' },
    { name: 'Adobe', icon: 'A' },
    { name: 'Salesforce', icon: 'S' }
  ];

  const activeFeatureData = featureTabs.find(tab => tab.id === activeTab) || featureTabs[0];

  return (
    <div className="landing-container animate-fade-in" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      <div className="blob1"></div>
      <div className="blob2"></div>

      {/* 1. HERO SECTION */}
      <section className="landing-hero" style={{ paddingTop: '2.5rem', marginBottom: '4rem' }}>
        <div className="landing-hero-left">
          <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 1.1rem', borderRadius: '50px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.16)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff' }}>Real-Time Placement & AI Career Engine 2026</span>
          </div>

          <h1 className="hero-title" style={{ fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.15 }}>
            Elevate Your Career Path With <br />
            <span className="gradient-text" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI-Powered Precision
            </span>
          </h1>

          <p className="hero-subtitle" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '620px' }}>
            A unified placement portal featuring Gemini AI resume parsing, voice mock interviews with calm speech rate, live 5-stage application pipelines, and real-time active user session pings.
          </p>

          <div className="hero-ctas" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <button onClick={onGetStarted} className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '0.95rem', fontWeight: 800, background: '#ffffff', color: '#0b0f19', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(255, 255, 255, 0.3)' }}>
              <span>Launch Career Portal</span>
              <ArrowRight size={18} style={{ marginLeft: '6px' }} />
            </button>
            <button onClick={onGetStarted} className="btn btn-outline" style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem', fontWeight: 700, borderRadius: '12px' }}>
              <Cpu size={18} style={{ marginRight: '6px' }} />
              <span>Try AI Mock Interview</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>₹65 LPA</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Highest Package 2026</p>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div>
              <h4 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>1,200+</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Active Drive Vacancies</p>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div>
              <h4 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>95%</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Verified Placement Rate</p>
            </div>
          </div>
        </div>

        <div className="landing-hero-right">
          <div className="hero-mockup-container">
            <div className="hero-mockup-window">
              <div className="mockup-header">
                <div className="mockup-dot red"></div>
                <div className="mockup-dot yellow"></div>
                <div className="mockup-dot green"></div>
                <div className="mockup-tab">
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>ApexHire Console</span>
                </div>
              </div>

              <div className="mockup-body" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                {/* Candidate Info */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.25)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.15rem' }}>
                      SK
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>Surjeet Kumar</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Full Stack SDE • Candidate #9042</p>
                    </div>
                  </div>
                  <span className="badge bg-success-glow text-success font-bold" style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem' }}>Verified ✓</span>
                </div>

                {/* Score Widget */}
                <div className="mockup-score-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div className="score-circle-wrap" style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                    <svg className="score-circle-svg" viewBox="0 0 36 36">
                      <path
                        className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="3.5"
                      />
                      <path
                        className="circle"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#ffffff"
                        strokeDasharray="92, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="score-number" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: '800', fontSize: '0.98rem', color: '#ffffff' }}>92%</span>
                  </div>
                  <div className="score-info" style={{ textAlign: 'left' }}>
                    <h4 style={{ color: '#ffffff', fontSize: '0.98rem', fontWeight: '700', margin: 0 }}>Gemini AI Match: Elite Tier</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Aligned for Google, Meta & Microsoft Drives</p>
                  </div>
                </div>

                {/* Pipeline */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem 1.15rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff' }}>Google | SDE-1 Selection Phase</span>
                    <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>Stage 4/5</span>
                  </div>
                  <div className="mockup-pipeline" style={{ margin: 0 }}>
                    <div className="pipeline-line">
                      <div className="pipeline-line-progress" style={{ width: '75%' }}></div>
                    </div>
                    <div className="pipeline-step">
                      <div className="step-dot completed">✓</div>
                      <span className="step-label">Applied</span>
                    </div>
                    <div className="pipeline-step">
                      <div className="step-dot completed">✓</div>
                      <span className="step-label">Reviewed</span>
                    </div>
                    <div className="pipeline-step">
                      <div className="step-dot active">●</div>
                      <span className="step-label">Interview</span>
                    </div>
                    <div className="pipeline-step">
                      <div className="step-dot">○</div>
                      <span className="step-label">Offer</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1.5 REAL-TIME INTERACTIVE AI SKILL MATCH PLAYGROUND */}
      <section style={{ width: '100%', maxWidth: '1200px', margin: '0 auto 4.5rem auto', padding: '0 1rem' }}>
        <div 
          className="glass-card" 
          style={{ 
            background: 'var(--bg-surface-elevated)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '24px', 
            padding: '2.25rem',
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
              <span className="text-xs text-muted font-semibold">Target Vacancy Role:</span>
              <select 
                value={calcRole} 
                onChange={(e) => setCalcRole(e.target.value)}
                className="form-select text-xs font-semibold"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '10px', padding: '0.45rem 0.85rem' }}
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
                Click technical skills below to simulate real-time AI parser score calculations for <strong>{calcRole}</strong> target vacancies:
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
                        padding: '0.45rem 0.9rem',
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
                      {isRequired && !isSelected && <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>(Required)</span>}
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-3" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)' }}>
                <div className="d-flex justify-content-between align-items-center text-xs mb-2">
                  <span className="font-semibold text-secondary">Matching Breakdown Status</span>
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
                    <span>Missing Skills: <strong style={{ color: 'var(--warning)' }}>{missingSkills.join(', ')}</strong></span>
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
                  style={{ background: '#ffffff', color: '#0b0f19', borderRadius: '10px' }}
                >
                  Parse Full Resume Now <ArrowRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STEP-BY-STEP CAREER ACCELERATION JOURNEY (NEW SECTION) */}
      <section style={{ width: '100%', maxWidth: '1200px', margin: '0 auto 4.5rem auto', padding: '0 1rem' }}>
        <div className="text-center mb-5">
          <span className="badge bg-primary-glow text-primary font-semibold text-xs px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1 mb-2">
            <Compass size={14} /> End-to-End Placement Workflow
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
            How ApexHire Accelerates Your Placement
          </h2>
          <p className="text-xs text-muted mt-2" style={{ maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
            From initial resume parsing to final offer letter confirmation, experience a structured 4-step AI pipeline:
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              step: '01',
              title: 'Resume Parsing & Scorecard',
              desc: 'Upload your PDF resume to extract key tech skills, calculate ATS score, and receive AI feedback.',
              icon: <FileText size={22} color="#ffffff" />
            },
            {
              step: '02',
              title: 'Skill Gap Alignment',
              desc: 'Compare your profile against top vacancies and auto-fill targeted requirements for Google, Microsoft & Meta drives.',
              icon: <Target size={22} color="#ffffff" />
            },
            {
              step: '03',
              title: 'AI Voice Mock Interview',
              desc: 'Practice technical questions with Ava in our live mock room at a calm speech pace with real-time grading.',
              icon: <Cpu size={22} color="#ffffff" />
            },
            {
              step: '04',
              title: 'Direct Recruiter Pipeline',
              desc: 'Track live application status from Reviewing to Interviewing and receive instant offer confirmations.',
              icon: <Award size={22} color="#ffffff" />
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="glass-card"
              style={{
                padding: '1.75rem',
                borderRadius: '18px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'rgba(255, 255, 255, 0.15)' }}>{item.step}</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2.5 COMPANY MARQUEE */}
      <section className="logo-marquee-section" style={{ marginBottom: '4.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>
          Trusted By Recruiting Teams Worldwide
        </h4>
        <div className="logo-marquee-container">
          <div className="logo-marquee-track">
            {companies.concat(companies).map((c, i) => (
              <div key={i} className="logo-chip" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '0.6rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: '900' }}>{c.icon}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE FEATURES SHOWCASE */}
      <section className="showcase-section" style={{ marginBottom: '4.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>Engineered For Career Acceleration</h2>
        <div className="showcase-tabs">
          {featureTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`showcase-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              style={{ whiteSpace: 'nowrap' }}
            >
              {tab.icon}
              <span style={{ whiteSpace: 'nowrap' }}>{tab.tabLabel}</span>
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
                  <CheckCircle size={16} color="#34d399" style={{ marginTop: '2px', flexShrink: 0 }} />
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
                  <span style={{ color: '#34d399', fontWeight: '700', fontSize: '0.85rem' }}>Active</span>
                </div>
                <div style={{ textAlign: 'left', fontSize: '0.82rem' }}>
                  <strong>Extracted Tech Skills:</strong>
                  <div className="mockup-skills-grid">
                    <span className="mockup-skill-chip">React.js</span>
                    <span className="mockup-skill-chip">Node.js</span>
                    <span className="mockup-skill-chip">System Design</span>
                    <span className="mockup-skill-chip">MongoDB</span>
                  </div>
                  <div className="mockup-alert-box">
                    <Sparkles size={16} style={{ flexShrink: 0 }} />
                    <span><strong>Recommendation:</strong> Add <strong>Docker</strong> or <strong>TypeScript</strong> to your skills list to increase match score by 14% for Enterprise roles.</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mock' && (
              <div className="feature-mockup-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>AI Voice Room (Ava)</span>
                  <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.85rem' }}>Pace: 0.88x Calm</span>
                </div>
                <div style={{ textAlign: 'left', fontSize: '0.82rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.75rem', borderRadius: '10px', marginBottom: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#ffffff', fontWeight: 700 }}>CURRENT QUESTION:</span>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>"How do you handle asynchronous state updates and memory leak prevention in React?"</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="badge bg-primary-glow text-primary text-xxs font-bold" style={{ padding: '4px 8px' }}>Pause / Think</span>
                    <span className="badge bg-primary-glow text-primary text-xxs font-bold" style={{ padding: '4px 8px' }}>Repeat Question</span>
                    <span className="badge bg-primary-glow text-primary text-xxs font-bold" style={{ padding: '4px 8px' }}>Hint</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tracker' && (
              <div className="feature-mockup-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Active Applications</span>
                  <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.85rem' }}>Updated</span>
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
                  <span style={{ color: '#34d399', fontWeight: '700', fontSize: '0.85rem' }}>Live</span>
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
                      <div className="mockup-chart-bar-fill" style={{ width: '95%', background: '#ffffff' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3.5 REAL-TIME SALARY & PLACEMENT CTC ESTIMATOR */}
      <section style={{ width: '100%', maxWidth: '1200px', margin: '0 auto 4.5rem auto', padding: '0 1rem' }}>
        <div 
          className="glass-card" 
          style={{ 
            background: 'var(--bg-surface-elevated)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '24px', 
            padding: '2.25rem',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div className="text-center mb-4">
            <span className="badge bg-primary-glow text-primary font-semibold text-xs px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1 mb-2">
              <TrendingUp size={14} /> Live Placement CTC Estimator 2026
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#ffffff' }}>
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
                        padding: '0.45rem 0.9rem',
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
                        padding: '0.45rem 0.9rem',
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

      {/* 3.8 FEATURED LIVE PLACEMENT DRIVES (NEW SECTION) */}
      <section style={{ width: '100%', maxWidth: '1200px', margin: '0 auto 4.5rem auto', padding: '0 1rem' }}>
        <div className="text-center mb-5">
          <span className="badge bg-primary-glow text-primary font-semibold text-xs px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1 mb-2">
            <Briefcase size={14} /> Active Campus Hiring Drives 2026
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
            Featured Placement Openings
          </h2>
          <p className="text-xs text-muted mt-2" style={{ maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
            Top tech companies hiring active candidates with real-time match scoring:
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {featuredJobs.map((job, idx) => (
            <div 
              key={idx}
              className="glass-card"
              style={{
                padding: '1.5rem',
                borderRadius: '16px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                transition: 'all 0.25s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ padding: '0.35rem 0.85rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                    {job.company}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '20px' }}>
                    {job.ctc}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>{job.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  <MapPin size={13} /> {job.location}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {job.tags.map((tag, tIdx) => (
                    <span key={tIdx} style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={onGetStarted}
                className="btn btn-outline"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, marginTop: '0.5rem' }}
              >
                Apply & Calculate Match Score →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3.9 VERIFIED STUDENT SUCCESS TESTIMONIALS (NEW SECTION) */}
      <section style={{ width: '100%', maxWidth: '1200px', margin: '0 auto 4.5rem auto', padding: '0 1rem' }}>
        <div className="text-center mb-5">
          <span className="badge bg-primary-glow text-primary font-semibold text-xs px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1 mb-2">
            <Star size={14} fill="#ffffff" color="#ffffff" /> Alumni Placement Success Stories
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
            Hear From Our Placed Graduates
          </h2>
          <p className="text-xs text-muted mt-2" style={{ maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
            Real candidates placed at leading global technology companies:
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {studentTestimonials.map((item, idx) => (
            <div 
              key={idx}
              className="glass-card"
              style={{
                padding: '1.75rem',
                borderRadius: '18px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.85rem' }}>
                  {[...Array(item.rating)].map((_, rIdx) => (
                    <Star key={rIdx} size={14} fill="#ffffff" color="#ffffff" />
                  ))}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '1.25rem' }}>
                  "{item.comment}"
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffffff', color: '#0b0f19', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                  {item.avatar}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>{item.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{item.role} @ <strong>{item.company}</strong> ({item.pkg})</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. STATISTICS & LIVE PLACEMENTS TICKER */}
      <section className="metrics-section" style={{ marginBottom: '4.5rem' }}>
        <div className="metrics-title">
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>Proven Placement Results</h2>
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
        <div className="placement-ticker-card" style={{ marginTop: '2rem' }}>
          <div className="placement-ticker-header">
            <Award size={18} color="#ffffff" />
            <span>Live Portal Placements Feed</span>
          </div>
          <div className="placement-ticker-wrap">
            <div className="placement-ticker-list">
              {stats.recentPlacements.concat(stats.recentPlacements).map((p, i) => (
                <div key={i} className="ticker-item-content">
                  <div>
                    🎉 <strong>{p.name}</strong> was placed as a <strong>{p.role}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="ticker-company-badge">{p.company}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#34d399' }}>{p.salary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ ACCORDION SECTION */}
      <section className="faq-section" style={{ marginBottom: '4.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>Frequently Asked Questions</h2>
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

      {/* 6. BOTTOM CTA BANNER */}
      <section style={{ width: '100%', maxWidth: '1200px', margin: '0 auto 4rem auto', padding: '0 1rem' }}>
        <div 
          className="glass-card text-center p-5 position-relative overflow-hidden" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)', 
            border: '1px solid rgba(255, 255, 255, 0.18)', 
            borderRadius: '24px',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.75rem' }}>
              Ready to Land Your Dream Offer?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 1.75rem auto' }}>
              Join thousands of students using ApexHire for AI resume parsing, voice mock interview practice, and direct campus placements.
            </p>
            <button 
              onClick={onGetStarted} 
              className="btn btn-primary"
              style={{ padding: '0.9rem 2.5rem', fontSize: '1rem', fontWeight: 800, background: '#ffffff', color: '#0b0f19', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(255, 255, 255, 0.3)' }}
            >
              Get Started Free Now <ArrowRight size={18} style={{ marginLeft: '6px' }} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer style={{ marginTop: 'auto', padding: '2rem 0 1.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', width: '100%', maxWidth: '1200px', textAlign: 'center' }}>
        <p>© 2026 ApexHire Career & Placement Portal. Handcrafted with MERN & Gemini AI.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
