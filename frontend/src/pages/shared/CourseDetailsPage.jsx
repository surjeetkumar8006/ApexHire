import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Clock, 
  Users, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft, 
  Download, 
  Sparkles, 
  BookOpen, 
  Award, 
  Building2, 
  Zap, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  ShieldCheck, 
  PhoneCall, 
  Check, 
  ArrowRight,
  Code,
  Layers,
  Cpu,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Master Course Details Dataset
const coursesDatabase = {
  'ai-engineering': {
    id: 'ai-engineering',
    title: 'AI Engineering & GenAI Agents',
    subtitle: 'Master Autonomous AI Agents, RAG Pipelines, Fine-tuning & LLM Infrastructure with Industry Experts',
    duration: '7 Months',
    mode: 'Online Live Interactive',
    rating: '4.9/5 (1,420+ Reviews)',
    enrolled: '1,850+ Graduates Placed',
    nextBatch: '8th October 2026',
    price: '₹48,000',
    emi: '₹4,000/mo No-Cost EMI',
    scholarship: 'Up to 50% Merit Scholarship Available',
    icon: <Cpu size={24} />,
    heroTags: ['Java', 'Spring Boot', 'Python', 'LLM API', 'RAG', 'AI Agents', 'MCP', 'LangChain', 'Vector DBs'],
    overview: 'This comprehensive 7-month master program is designed for engineers seeking to build next-generation AI applications. Learn to construct Production-Ready Autonomous AI Agents, Retrieval-Augmented Generation (RAG) pipelines, fine-tune open-source models, and build scalable microservices with Java Spring Boot and Python.',
    highlights: [
      '15+ Real-world Capstone AI Projects (Multi-agent Systems, Auto-code Generators)',
      '1-on-1 Mentorship from Senior AI Engineers at Google, NVIDIA & Meta',
      'Dedicated Campus Placement Drive with 120+ Hiring Enterprise Partners',
      'Complete ATS Resume Building & Mock Interview Prep with Ava AI',
      'Free Access to Cloud GPU Workspaces & Vector Database Credits'
    ],
    curriculum: [
      {
        title: 'Module 1: Advanced Java, Python & Data Engineering',
        desc: 'Master Core Java, Multithreading, Python Async, SQL & NoSQL Vector Stores.',
        topics: ['Java 21 Syntax & Concurrency', 'Spring Boot Microservices', 'Python Async IO & FastAPI', 'PostgreSQL & pgvector Integration']
      },
      {
        title: 'Module 2: LLMs, Embeddings & RAG Architectures',
        desc: 'Build enterprise search systems using Gemini, OpenAI APIs & Vector DBs.',
        topics: ['Semantic Embeddings & Chunking', 'Pinecone & Qdrant Vector DBs', 'RAG Pipeline Optimization & Re-ranking', 'LangChain & LlamaIndex Frameworks']
      },
      {
        title: 'Module 3: Autonomous AI Agents & Model Context Protocol (MCP)',
        desc: 'Construct multi-agent workflows, tool execution, and stateful agent memory.',
        topics: ['Agentic Workflows & LangGraph', 'Model Context Protocol (MCP)', 'Tool Calling & Function Execution', 'Human-in-the-loop Safeguards']
      },
      {
        title: 'Module 4: System Design & Production Cloud Deployment',
        desc: 'Deploy scalable AI microservices on AWS, Docker & Kubernetes.',
        topics: ['Dockerizing AI Services', 'Kubernetes Orchestration', 'API Rate Limiting & Caching', 'CI/CD Pipelines & Monitoring']
      },
      {
        title: 'Module 5: Capstone Projects & Placement Acceleration',
        desc: 'Build 3 production-grade capstone apps and enter guaranteed hiring drives.',
        topics: ['AI Autonomous Code Reviewer Agent', 'Enterprise Multi-Document RAG Search', 'Mock Technical & HR Rounds', 'Direct Coordinator Interviews']
      }
    ],
    projects: [
      { title: 'Autonomous AI Coding Assistant', desc: 'Multi-agent pipeline that reads GitHub pull requests, runs unit tests, and generates detailed code fixes.' },
      { title: 'Enterprise RAG Knowledge Base', desc: 'High-throughput document search engine powered by pgvector, hybrid search, and LLM re-ranking.' },
      { title: 'Financial Risk Analyzer Agent', desc: 'Real-time agent inspecting stock market filings, news sentiment, and generating automated risk reports.' }
    ]
  },

  'data-analytics': {
    id: 'data-analytics',
    title: 'Data Analytics & Business Intelligence',
    subtitle: 'Transform Raw Business Data into Executive Insights with SQL, Power BI, Python & Predictive Analytics',
    duration: '6 Months',
    mode: 'Online Live Interactive',
    rating: '4.8/5 (980+ Reviews)',
    enrolled: '1,200+ Placed',
    nextBatch: '23rd October 2026',
    price: '₹38,000',
    emi: '₹3,200/mo No-Cost EMI',
    scholarship: '100% Placement Assistance Guarantee',
    icon: <Database size={24} />,
    heroTags: ['Microsoft Excel', 'Power BI', 'SQL', 'Python', 'Tableau', 'Pandas', 'NumPy', 'Statistics'],
    overview: 'Master data analysis, interactive dashboard creation, and business intelligence techniques. Learn how top companies like Amazon, Cred, and Flipkart use data visualization and SQL queries to drive multi-million dollar business decisions.',
    highlights: [
      '12+ Industry Projects with real dataset scenarios (E-commerce sales, Fraud detection)',
      'Master SQL from basic joins to complex CTEs & Window functions',
      'Power BI & Tableau Certification Prep included',
      'Personalized Resume Scorecard & Live Mock Interviews'
    ],
    curriculum: [
      {
        title: 'Module 1: Advanced Excel & Business Math',
        desc: 'Pivot tables, Power Query, VLOOKUP/XLOOKUP, and financial modeling.',
        topics: ['Data Wrangling in Excel', 'Power Query Transformations', 'Statistical Analysis & Hypothesis Testing']
      },
      {
        title: 'Module 2: Master SQL Querying & Database Design',
        desc: 'Construct complex queries, joins, aggregations, and window functions.',
        topics: ['PostgreSQL & MySQL Syntax', 'Subqueries, CTEs & Window Functions', 'Database Indexing & Query Optimization']
      },
      {
        title: 'Module 3: Power BI & Executive Visualizations',
        desc: 'Design interactive corporate dashboards with DAX and live data models.',
        topics: ['DAX Calculations & Measures', 'Data Modeling & Relationships', 'Interactive Storytelling & KPI Cards']
      },
      {
        title: 'Module 4: Python for Data Analysis',
        desc: 'Automate reports and extract insights using Pandas, NumPy & Matplotlib.',
        topics: ['Pandas Data Cleaning', 'Exploratory Data Analysis (EDA)', 'Seaborn & Plotly Visualizations']
      }
    ],
    projects: [
      { title: 'E-Commerce Churn Analysis Dashboard', desc: 'Interactive Power BI dashboard tracking customer retention, CAC, and lifetime value.' },
      { title: 'SQL Financial Audit Suite', desc: 'Complex SQL queries identifying transaction anomalies and high-value customer segments.' }
    ]
  },

  'full-stack-genai': {
    id: 'full-stack-genai',
    title: 'Full Stack Development With GenAI',
    subtitle: 'Build Enterprise Web Apps with React, Node.js, Spring Boot & Integrated GenAI Features',
    duration: '8 Months',
    mode: 'Online Live Interactive',
    rating: '4.95/5 (2,100+ Reviews)',
    enrolled: '2,500+ Placed',
    nextBatch: '8th October 2026',
    price: '₹54,000',
    emi: '₹4,500/mo No-Cost EMI',
    scholarship: 'Up to 50% Merit Scholarship Available',
    icon: <Code size={24} />,
    heroTags: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Java Spring Boot', 'MySQL', 'GenAI', 'System Design'],
    overview: 'Become a complete Full Stack Engineer capable of building high-concurrency web applications powered by React, Node.js, Java Spring Boot, and GenAI features.',
    highlights: [
      '20+ Web & Mobile Capstone Projects',
      'Microservices Architecture & System Design for High Availability',
      'Direct Hiring Referral Drives at Google, Microsoft, Meta & Atlassian',
      'Daily Live Coding Labs & Bug Debugging Support'
    ],
    curriculum: [
      {
        title: 'Module 1: Modern Frontend with React & TypeScript',
        desc: 'Build dynamic single page applications with state management and sleek CSS.',
        topics: ['React Hooks & Context API', 'Redux Toolkit & TanStack Query', 'TypeScript & Tailwind CSS']
      },
      {
        title: 'Module 2: Backend Engineering with Node.js & Spring Boot',
        desc: 'Develop RESTful APIs, JWT Auth, Microservices and Database Schemas.',
        topics: ['Node.js & Express.js APIs', 'Java Spring Boot & Hibernate', 'MongoDB & MySQL Relational Schemas']
      },
      {
        title: 'Module 3: GenAI Feature Integration',
        desc: 'Integrate LLMs, AI chatbots, speech-to-text, and image generation into web apps.',
        topics: ['Gemini & OpenAI API Integration', 'WebSockets for Live AI Streaming', 'Voice AI Integration']
      }
    ],
    projects: [
      { title: 'ApexHire Placement Portal (MERN)', desc: 'Complete placement portal with AI resume coach and real-time voice interview room.' },
      { title: 'SaaS Multi-tenant Collaboration Tool', desc: 'Real-time document editor with live cursor sync, WebSockets, and AI text summarization.' }
    ]
  }
};

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeCurriculumIndex, setActiveCurriculumIndex] = useState(0);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicantName, setApplicantName] = useState(user?.name || '');
  const [applicantEmail, setApplicantEmail] = useState(user?.email || '');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Retrieve course from database or default to AI Engineering
  const course = coursesDatabase[courseId] || coursesDatabase['ai-engineering'];

  const handleEnrollSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmittedSuccess(true);
    }, 1000);
  };

  return (
    <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* 1. TOP FLOATING STICKY BAR */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(7, 10, 20, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0.85rem 1.5rem'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '0.45rem 0.9rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={16} /> Back to Portal
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 800 }} className="d-none d-sm-inline">
              ⚡ Next Batch: {course.nextBatch}
            </span>
            <button
              onClick={() => setShowApplyModal(true)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '10px',
                background: '#ffffff',
                color: '#0b0f19',
                fontWeight: 900,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255, 255, 255, 0.25)'
              }}
            >
              Enroll Now →
            </button>
          </div>
        </div>
      </div>

      {/* 2. HERO HEADER SECTION */}
      <section style={{ background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.08) 0%, rgba(7, 10, 20, 0) 100%)', paddingTop: '3rem', paddingBottom: '3.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="row g-4 align-items-center">
            <div className="col-lg-8">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span className="badge bg-primary-glow text-primary font-bold text-xs px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1">
                  <GraduationCap size={14} /> {course.mode}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" /> {course.rating}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>• {course.enrolled}</span>
              </div>

              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.5px' }}>
                {course.title}
              </h1>

              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '750px', marginBottom: '1.5rem' }}>
                {course.subtitle}
              </p>

              {/* Tech Stack Chips */}
              <div style={{ marginBottom: '1.75rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '0.5rem' }}>
                  Technologies & Frameworks Covered:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {course.heroTags.map((tag, idx) => (
                    <span key={idx} style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowApplyModal(true)}
                  style={{ padding: '0.85rem 2rem', borderRadius: '12px', background: '#ffffff', color: '#0b0f19', fontWeight: 900, fontSize: '0.95rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(255, 255, 255, 0.25)' }}
                >
                  Apply For Scholarship & Enroll →
                </button>

                <button
                  onClick={() => alert(`Full Brochure PDF for ${course.title} generated & downloaded!`)}
                  style={{ padding: '0.85rem 1.75rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#ffffff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={18} /> Download Syllabus PDF
                </button>
              </div>
            </div>

            {/* Right Card Summary */}
            <div className="col-lg-4">
              <div className="glass-card" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '1.75rem', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Program Fee</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>{course.price}</h2>
                    <span style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 700 }}>{course.emi}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>* No cost EMI available on major bank cards</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Clock size={16} color="#38bdf8" />
                    <span>Duration: <strong>{course.duration}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Calendar size={16} color="#34d399" />
                    <span>Next Batch Starts: <strong>{course.nextBatch}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Award size={16} color="#f59e0b" />
                    <span>Guaranteed Placement Drives</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ShieldCheck size={16} color="#a855f7" />
                    <span>Certified Placement Letter</span>
                  </div>
                </div>

                <div style={{ background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)', padding: '0.6rem 0.85rem', borderRadius: '10px', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '1.25rem' }}>
                  🎁 {course.scholarship}
                </div>

                <button
                  onClick={() => setShowApplyModal(true)}
                  style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: '#ffffff', color: '#0b0f19', fontWeight: 900, fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}
                >
                  Reserve Seat Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROGRAM OVERVIEW & HIGHLIGHTS */}
      <section style={{ maxWidth: '1240px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div className="row g-4">
          <div className="col-lg-8">
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', marginBottom: '1rem' }}>
              Program Overview
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
              {course.overview}
            </p>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>
              Key Learning Benefits & Career Guarantee:
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '3rem' }}>
              {course.highlights.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', padding: '1rem 1.25rem', borderRadius: '14px' }}>
                  <CheckCircle2 size={20} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* CURRICULUM ACCORDION ROADMAP */}
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', marginBottom: '1.25rem' }}>
              Curriculum Roadmap ({course.curriculum.length} Modules)
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
              {course.curriculum.map((mod, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={() => setActiveCurriculumIndex(activeCurriculumIndex === idx ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.5rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>{mod.title}</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{mod.desc}</p>
                    </div>
                    {activeCurriculumIndex === idx ? <ChevronUp size={20} color="#38bdf8" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                  </button>

                  {activeCurriculumIndex === idx && (
                    <div style={{ padding: '0 1.5rem 1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Key Topics Covered:</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                        {mod.topics.map((t, tIdx) => (
                          <div key={tIdx} style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#38bdf8' }}>•</span> {t}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* REAL-WORLD PROJECTS SHOWCASE */}
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', marginBottom: '1.25rem' }}>
              Real-World Capstone Projects
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {course.projects.map((proj, idx) => (
                <div key={idx} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                    0{idx + 1}
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>{proj.title}</h4>
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{proj.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE COUNSELLING & HIRING NETWORK */}
          <div className="col-lg-4">
            <div className="glass-card" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '1.75rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
                Need Career Counselling?
              </h3>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Talk to our senior placement advisors to check your eligibility, batch schedule, and scholarship waiver.
              </p>

              <button
                onClick={() => setShowApplyModal(true)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#ffffff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <PhoneCall size={16} /> Request Free Callback
              </button>
            </div>

            {/* Hiring Partners */}
            <div className="glass-card" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '1.75rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
                Top Hiring Recruiters
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Google', 'Microsoft', 'Amazon', 'Meta', 'NVIDIA', 'Cred', 'Flipkart', 'Uber', 'Atlassian'].map((company, idx) => (
                  <span key={idx} style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.35rem 0.75rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    {company}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ENROLLMENT & SCHOLARSHIP MODAL */}
      {showApplyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 8, 18, 0.88)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }} onClick={() => setShowApplyModal(false)}>
          <div className="animate-fade-in" style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', color: '#ffffff', position: 'relative' }} onClick={e => e.stopPropagation()}>
            {submittedSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.2)', border: '2px solid #34d399', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <Check size={32} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>Application Submitted! 🎉</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Thank you, <strong>{applicantName}</strong>! Our senior placement counselor will call you shortly to confirm your scholarship waiver and batch seat.
                </p>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setSubmittedSuccess(false);
                  }}
                  style={{ padding: '0.65rem 1.75rem', borderRadius: '10px', background: '#ffffff', color: '#0b0f19', fontWeight: 800, fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnrollSubmit}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Apply For Program</h3>
                    <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>{course.title}</span>
                  </div>
                  <button type="button" onClick={() => setShowApplyModal(false)} style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#ffffff', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={e => setApplicantName(e.target.value)}
                      placeholder="e.g. Surjeet Kumar"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: '#ffffff', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Email Address *</label>
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={e => setApplicantEmail(e.target.value)}
                      placeholder="e.g. surjeet@example.com"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: '#ffffff', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={e => setApplicantPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: '#ffffff', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: '#ffffff', color: '#0b0f19', fontWeight: 900, fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application & Reserve Scholarship →'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsPage;
