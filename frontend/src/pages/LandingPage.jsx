import React, { useState } from 'react';
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
  Users
} from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  const [activeTab, setActiveTab] = useState('coach');
  const [openFaq, setOpenFaq] = useState(null);

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

  const recentPlacements = [
    { name: 'Rahul Sharma', role: 'Software Engineer (SDE-1)', company: 'Microsoft', salary: '$145,000/yr' },
    { name: 'Anjali Goel', role: 'Frontend Developer', company: 'Google', salary: '$130,000/yr' },
    { name: 'Saurabh Verma', role: 'Full Stack Engineer', company: 'Amazon', salary: '$140,000/yr' },
    { name: 'Priyanka Sen', role: 'Product Design Intern', company: 'Salesforce', salary: '$8,500/mo' }
  ];

  const activeFeatureData = featureTabs.find(tab => tab.id === activeTab);

  return (
    <div className="landing-container animate-fade-in">
      <div className="blob1"></div>
      <div className="blob2"></div>

      {/* 1. HERO SECTION */}
      <section className="landing-hero">
        <div className="landing-hero-left">
          <div className="hero-badge">
            <TrendingUp size={14} color="var(--accent)" />
            <span>ApexHire Showcase 2026</span>
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
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
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
                        stroke="rgba(255,255,255,0.04)"
                        strokeWidth="3.5"
                      />
                      <path
                        className="circle"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--accent)"
                        strokeDasharray="88, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="score-number">88</span>
                  </div>
                  <div className="score-info">
                    <h4>AI Match Score: Excellent</h4>
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

      {/* 4. STATISTICS & LIVE PLACEMENTS TICKER */}
      <section className="metrics-section">
        <div className="metrics-title">
          <h2>Proven Placement Results</h2>
          <p>Real-time metrics tracking coordinator success and campus recruitment rate.</p>
        </div>
        <div className="metrics-grid">
          <div className="metrics-card">
            <span className="metrics-num">95%</span>
            <span className="metrics-label">Placement Rate</span>
            <span className="metrics-desc">Of registered students placed in 2026</span>
          </div>
          <div className="metrics-card">
            <span className="metrics-num">1200+</span>
            <span className="metrics-label">Active Job Openings</span>
            <span className="metrics-desc">Across top enterprise partners</span>
          </div>
          <div className="metrics-card">
            <span className="metrics-num">88/100</span>
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
