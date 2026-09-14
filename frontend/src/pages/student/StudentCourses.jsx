import React, { useState, useEffect } from 'react';
import { GraduationCap, CheckCircle2, Clock, Sparkles, ArrowRight, FileText, Zap, BookOpen, Shield, ChevronRight } from 'lucide-react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import LiveTicker from '../../components/LiveTicker';

const StudentCourses = () => {
  const { user, authHeader } = useAuth();
  const { addToast } = useNotification();

  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmiPlanMap, setSelectedEmiPlanMap] = useState({});
  const [enrollingId, setEnrollingId] = useState(null);
  const [selectedTab, setSelectedTab] = useState('online');

  const courseData = {
    online: [
      {
        id: 'ai-engineering',
        title: 'AI Engineering & GenAI Agents',
        subtitle: 'Live Mentor-Led Interactive Master Program',
        duration: '7 Months',
        icon: '🤖',
        category: 'Online Live',
        tags: ['LLM API', 'RAG', 'AI Agents', 'Spring Boot', 'Python', 'MCP'],
        projects: '15+ Capstone Projects',
        enrolledCount: '120+ Students',
        nextBatch: '8th Oct 2026',
        scholarship: 'SCHOLARSHIP UP TO 50% AVAILABLE',
        emiPlans: [
          { title: 'No-Cost EMI (6 Months)', emi: '₹4,999/mo', totalFee: '₹29,994', scholarship: false },
          { title: 'Flexible EMI (12 Months)', emi: '₹2,799/mo', totalFee: '₹33,588', scholarship: false },
          { title: 'One-Time Full Fee (50% Scholarship Applied)', emi: 'Full Fee', totalFee: '₹24,999', scholarship: true, discount: '50%' }
        ]
      },
      {
        id: 'full-stack-genai',
        title: 'Full Stack Development With GenAI',
        subtitle: 'MERN Stack, System Design & Artificial Intelligence',
        duration: '8 Months',
        icon: '</>',
        category: 'Online Live',
        tags: ['React', 'Node.js', 'Express', 'MongoDB', 'System Design', 'OpenAI API'],
        projects: '60+ Projects',
        enrolledCount: '180+ Students',
        nextBatch: '15th Oct 2026',
        scholarship: 'FLAT ₹5,000 OFF THIS WEEK',
        emiPlans: [
          { title: 'No-Cost EMI (6 Months)', emi: '₹3,999/mo', totalFee: '₹23,994', scholarship: false },
          { title: 'Flexible EMI (12 Months)', emi: '₹2,299/mo', totalFee: '₹27,588', scholarship: false },
          { title: 'One-Time Full Fee (Flat ₹5,000 Off)', emi: 'Full Fee', totalFee: '₹19,999', scholarship: true, discount: '20%' }
        ]
      },
      {
        id: 'data-analytics',
        title: 'Data Analytics & Business Intelligence',
        subtitle: 'Hands-on Data Science & Visualizations',
        duration: '6 Months',
        icon: '📈',
        category: 'Online Live',
        tags: ['Excel', 'Power BI', 'SQL', 'Python', 'Tableau', 'Pandas'],
        projects: '7+ Real Data Labs',
        enrolledCount: '95+ Students',
        nextBatch: '23rd Oct 2026',
        scholarship: '100% PLACEMENT ASSISTANCE',
        emiPlans: [
          { title: 'No-Cost EMI (6 Months)', emi: '₹3,499/mo', totalFee: '₹20,994', scholarship: false },
          { title: 'Flexible EMI (12 Months)', emi: '₹1,999/mo', totalFee: '₹23,988', scholarship: false },
          { title: 'One-Time Full Fee (100% Placement Assistance)', emi: 'Full Fee', totalFee: '₹17,999', scholarship: false }
        ]
      }
    ],
    offline: [
      {
        id: 'full-stack-genai',
        title: 'Full Stack Web Development (Classroom)',
        subtitle: 'Bangalore & Noida Physical Training Centers',
        duration: '6 Months',
        icon: '🏢',
        category: 'Offline Hybrid',
        tags: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'DSA', 'System Design'],
        projects: '10+ Offline Labs',
        enrolledCount: '120 Students',
        nextBatch: '1st Nov 2026',
        scholarship: 'OFFLINE CENTER SCHOLARSHIP AVAILABLE',
        emiPlans: [
          { title: 'No-Cost EMI (6 Months)', emi: '₹5,499/mo', totalFee: '₹32,994', scholarship: false },
          { title: 'One-Time Full Fee', emi: 'Full Fee', totalFee: '₹29,999', scholarship: true, discount: '15%' }
        ]
      }
    ],
    selfPaced: [
      {
        id: 'ai-engineering',
        title: 'System Design & Microservices Mastery',
        subtitle: 'Comprehensive Self-Paced Video Track',
        duration: 'Self Paced',
        icon: '⚡',
        category: 'Self Paced',
        tags: ['System Design', 'Kafka', 'Redis', 'Docker', 'Kubernetes', 'REST APIs'],
        projects: '8+ Capstones',
        enrolledCount: '200+ Learners',
        nextBatch: 'Instant Access',
        scholarship: 'FLAT 40% OFF THIS WEEK',
        emiPlans: [
          { title: 'One-Time Access Fee', emi: 'Full Fee', totalFee: '₹9,999', scholarship: true, discount: '40%' }
        ]
      }
    ]
  };

  const fetchMyEnrollments = async () => {
    try {
      const res = await fetch(`${API_BASE}/courses/my`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setMyEnrollments(data);
      }
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEnrollments();
    const interval = setInterval(fetchMyEnrollments, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleEnrollCourse = async (course) => {
    setEnrollingId(course.id);
    const selectedPlanIdx = selectedEmiPlanMap[course.id] || 0;
    const selectedPlanObj = course.emiPlans[selectedPlanIdx];

    try {
      const res = await fetch(`${API_BASE}/courses/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({
          courseId: course.id,
          courseTitle: course.title,
          category: course.category || 'Online Live',
          duration: course.duration,
          selectedPlan: selectedPlanObj.title,
          monthlyEmi: selectedPlanObj.emi,
          totalFee: selectedPlanObj.totalFee,
          scholarshipApplied: selectedPlanObj.scholarship,
          scholarshipDiscount: selectedPlanObj.discount || '0%',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        addToast(data.message || `Successfully enrolled in ${course.title}! 🎉`, 'success');
        fetchMyEnrollments();
      } else {
        addToast(data.message || 'Enrollment failed', 'error');
      }
    } catch (err) {
      addToast('Error enrolling in course', 'error');
    } finally {
      setEnrollingId(null);
    }
  };

  const activeCourses = courseData[selectedTab] || courseData.online;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1240px', margin: '0 auto' }} className="animate-fade-in">
      {/* Top Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <GraduationCap size={22} />
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>
              Job-Guaranteed Tech Courses
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Mentor-led placement bootcamps with 15+ capstone projects, flexible EMI rates, & scholarship discounts.
          </p>
        </div>

        {myEnrollments.length > 0 && (
          <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="#34d399" />
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#34d399' }}>
              {myEnrollments.length} Active Course Enrollment{myEnrollments.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <LiveTicker />

      {/* SECTION 1: MY ACTIVE ENROLLMENTS */}
      {myEnrollments.length > 0 && (
        <div className="glass-card mb-4" style={{ border: '1px solid rgba(56, 189, 248, 0.3)', background: 'rgba(7, 10, 20, 0.95)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#38bdf8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} /> My Enrolled Courses & EMI Subscriptions
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {myEnrollments.map((en) => (
              <div
                key={en._id}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  padding: '1.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>
                      {en.category} • {en.duration}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '0.2rem 0.65rem', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                      {en.status}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                    {en.courseTitle}
                  </h4>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.65rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                      Plan: <span style={{ color: '#ffffff' }}>{en.selectedPlan}</span>
                    </div>
                    {en.monthlyEmi && (
                      <div style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 800, marginTop: '2px' }}>
                        💳 Monthly Rate: {en.monthlyEmi} (Total Fee: {en.totalFee})
                      </div>
                    )}
                    {en.scholarshipApplied && (
                      <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 800, marginTop: '2px' }}>
                        🎁 Scholarship Discount Applied ({en.scholarshipDiscount})
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Enrolled: {new Date(en.enrolledAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => window.location.href = `/courses/${en.courseId}`}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      background: '#ffffff',
                      color: '#0b0f19',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    View Details & Syllabus →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: BROWSE ALL TECH COURSES */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
              Available Placement Bootcamps
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Select category and view course curriculum, project labs & EMI options:
            </p>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-base)', padding: '0.35rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'online', label: '💻 Online Courses' },
              { id: 'offline', label: '🏢 Offline Hybrid' },
              { id: 'selfPaced', label: '⚡ Self Paced' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedTab === tab.id ? '#ffffff' : 'transparent',
                  color: selectedTab === tab.id ? '#0b0f19' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {activeCourses.map((course) => {
            const isEnrolled = myEnrollments.some(e => e.courseId === course.id);
            const selectedPlanIdx = selectedEmiPlanMap[course.id] || 0;
            const currentPlan = course.emiPlans[selectedPlanIdx];

            return (
              <div
                key={course.id}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: isEnrolled ? '1px solid #34d399' : '1px solid var(--border-color)',
                  borderRadius: '20px',
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: 'var(--shadow-md)',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.4rem' }}>{course.icon}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '0.25rem 0.65rem', borderRadius: '8px' }}>
                        ⏱️ {course.duration}
                      </span>
                    </div>

                    {isEnrolled ? (
                      <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '0.25rem 0.7rem', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                        ✓ ENROLLED
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                        {course.enrolledCount}
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                    {course.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 0.85rem 0', fontWeight: 500 }}>
                    {course.subtitle}
                  </p>

                  {/* Tech stack covered */}
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
                      Tech Stack & Tools Covered:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {course.tags.map((tag, tIdx) => (
                        <span key={tIdx} style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* EMI Plan Selector Box */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', padding: '0.85rem', marginBottom: '0.85rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: '0.4rem' }}>
                      💳 Select Fee / EMI Subscriptions Plan:
                    </label>
                    <select
                      value={selectedPlanIdx}
                      onChange={(e) => setSelectedEmiPlanMap({ ...selectedEmiPlanMap, [course.id]: parseInt(e.target.value) })}
                      style={{
                        width: '100%',
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border-color)',
                        color: '#ffffff',
                        borderRadius: '10px',
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {course.emiPlans.map((plan, pIdx) => (
                        <option key={pIdx} value={pIdx}>
                          {plan.title} ({plan.emi})
                        </option>
                      ))}
                    </select>

                    <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Selected Total: <strong style={{ color: '#ffffff' }}>{currentPlan.totalFee}</strong></span>
                      {currentPlan.scholarship && (
                        <span style={{ color: '#c084fc', fontWeight: 800 }}>🎁 {currentPlan.discount} Scholarship</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => window.location.href = `/courses/${course.id}`}
                    style={{
                      flex: 1,
                      padding: '0.7rem',
                      borderRadius: '12px',
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Syllabus
                  </button>
                  <button
                    onClick={() => handleEnrollCourse(course)}
                    disabled={enrollingId === course.id}
                    style={{
                      flex: 1.4,
                      padding: '0.7rem',
                      borderRadius: '12px',
                      background: isEnrolled ? 'rgba(52, 211, 153, 0.2)' : '#ffffff',
                      border: isEnrolled ? '1px solid #34d399' : 'none',
                      color: isEnrolled ? '#34d399' : '#0b0f19',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {enrollingId === course.id ? 'Enrolling...' : isEnrolled ? 'Update EMI Plan' : 'Enroll Now →'}
                  </button>
                </div>

                {/* Bottom scholarship banner */}
                <div style={{ background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)', color: '#ffffff', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center', padding: '0.35rem', borderRadius: '0 0 16px 16px', margin: '-1.35rem -1.35rem -1.35rem -1.35rem', marginTop: '0.5rem' }}>
                  🎁 {course.scholarship}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentCourses;
