import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { BarChart2, PieChart, Briefcase, FileCheck, XCircle, CheckCircle, Clock } from 'lucide-react';

const StudentAppAnalytics = () => {
  const { authHeader } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [authHeader]);

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Loading Analytics...</div>;
  }

  // Calculate Stats
  const total = applications.length;
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const applied = statusCounts['Applied'] || 0;
  const reviewing = statusCounts['Reviewing'] || 0;
  const shortlisted = statusCounts['Shortlisted'] || 0;
  const interviewing = statusCounts['Interviewing'] || 0;
  const offered = statusCounts['Offered'] || 0;
  const rejected = statusCounts['Rejected'] || 0;

  const inProgress = applied + reviewing + shortlisted + interviewing;

  // Chart Percentages
  const getPercent = (count) => total === 0 ? 0 : Math.round((count / total) * 100);
  
  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div style={styles.titleRow}>
          <div style={styles.headerIconGlow}>
            <BarChart2 size={28} color="var(--primary)" />
          </div>
          <h1 style={styles.title}>Application Analytics</h1>
        </div>
        <p style={styles.subtitle}>Track your job hunt progress and application conversion funnel.</p>
      </header>

      {/* Summary Cards */}
      <div className="analytics-grid">
        <div className="premium-card stagger-1" style={styles.summaryCard}>
          <div style={{ ...styles.iconWrap, background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
            <Briefcase size={28} color="var(--primary)" />
          </div>
          <div>
            <h3 className="summary-val">{total}</h3>
            <p style={styles.summaryLabel}>Total Applied</p>
          </div>
        </div>
        <div className="premium-card stagger-2" style={styles.summaryCard}>
          <div style={{ ...styles.iconWrap, background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
            <Clock size={28} color="var(--warning)" />
          </div>
          <div>
            <h3 className="summary-val">{inProgress}</h3>
            <p style={styles.summaryLabel}>In Progress</p>
          </div>
        </div>
        <div className="premium-card stagger-3" style={styles.summaryCard}>
          <div style={{ ...styles.iconWrap, background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <CheckCircle size={28} color="var(--success)" />
          </div>
          <div>
            <h3 className="summary-val">{offered}</h3>
            <p style={styles.summaryLabel}>Offers Received</p>
          </div>
        </div>
        <div className="premium-card stagger-4" style={styles.summaryCard}>
          <div style={{ ...styles.iconWrap, background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <XCircle size={28} color="var(--danger)" />
          </div>
          <div>
            <h3 className="summary-val">{rejected}</h3>
            <p style={styles.summaryLabel}>Rejected</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        
        {/* Funnel Chart */}
        <div className="premium-card stagger-5" style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
              <PieChart size={20} color="var(--primary)" />
            </div>
            <h3 style={styles.chartTitle}>Conversion Funnel</h3>
          </div>
          {total === 0 ? (
            <p style={styles.emptyText}>Apply to jobs to generate your funnel!</p>
          ) : (
            <div style={styles.funnelContainer}>
              <div className="funnel-row-hover" style={styles.funnelRow}>
                <span style={styles.funnelLabel}>Applied</span>
                <div style={styles.funnelTrack}>
                  <div className="glow-bar" style={{ width: '100%', background: 'linear-gradient(90deg, var(--primary), #818cf8)' }}></div>
                </div>
                <span style={styles.funnelValue}>{total} <span style={styles.pct}>({getPercent(total)}%)</span></span>
              </div>
              
              <div className="funnel-row-hover" style={styles.funnelRow}>
                <span style={styles.funnelLabel}>Interviewing</span>
                <div style={styles.funnelTrack}>
                  <div className="glow-bar" style={{ width: `${getPercent(interviewing + offered)}%`, background: 'linear-gradient(90deg, var(--warning), #fbbf24)' }}></div>
                </div>
                <span style={styles.funnelValue}>{interviewing + offered} <span style={styles.pct}>({getPercent(interviewing + offered)}%)</span></span>
              </div>
              
              <div className="funnel-row-hover" style={styles.funnelRow}>
                <span style={styles.funnelLabel}>Offers</span>
                <div style={styles.funnelTrack}>
                  <div className="glow-bar" style={{ width: `${getPercent(offered)}%`, background: 'linear-gradient(90deg, var(--success), #34d399)' }}></div>
                </div>
                <span style={styles.funnelValue}>{offered} <span style={styles.pct}>({getPercent(offered)}%)</span></span>
              </div>
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="premium-card stagger-6" style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div style={{ padding: '0.4rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
              <BarChart2 size={18} color="var(--primary)" />
            </div>
            <h3 style={styles.chartTitle}>Detailed Breakdown</h3>
          </div>
          {total === 0 ? (
            <p style={styles.emptyText}>No data available yet.</p>
          ) : (
            <div className="breakdown-grid">
              <div className="breakdown-box">
                <div style={{...styles.dot, background: 'var(--primary)' }}></div>
                <div style={styles.bdCol}>
                  <span style={styles.breakdownLabel}>Applied</span>
                  <span style={styles.breakdownValue}>{applied}</span>
                </div>
              </div>
              <div className="breakdown-box">
                <div style={{...styles.dot, background: 'var(--info)' }}></div>
                <div style={styles.bdCol}>
                  <span style={styles.breakdownLabel}>Reviewing</span>
                  <span style={styles.breakdownValue}>{reviewing}</span>
                </div>
              </div>
              <div className="breakdown-box">
                <div style={{...styles.dot, background: '#a855f7' }}></div>
                <div style={styles.bdCol}>
                  <span style={styles.breakdownLabel}>Shortlisted</span>
                  <span style={styles.breakdownValue}>{shortlisted}</span>
                </div>
              </div>
              <div className="breakdown-box">
                <div style={{...styles.dot, background: 'var(--warning)' }}></div>
                <div style={styles.bdCol}>
                  <span style={styles.breakdownLabel}>Interviewing</span>
                  <span style={styles.breakdownValue}>{interviewing}</span>
                </div>
              </div>
              <div className="breakdown-box">
                <div style={{...styles.dot, background: 'var(--success)' }}></div>
                <div style={styles.bdCol}>
                  <span style={styles.breakdownLabel}>Offered</span>
                  <span style={styles.breakdownValue}>{offered}</span>
                </div>
              </div>
              <div className="breakdown-box">
                <div style={{...styles.dot, background: 'var(--danger)' }}></div>
                <div style={styles.bdCol}>
                  <span style={styles.breakdownLabel}>Rejected</span>
                  <span style={styles.breakdownValue}>{rejected}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1rem;
        }
        .breakdown-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 0.75rem;
          padding: 0.5rem 0;
        }
        
        /* Premium Card styling */
        .premium-card {
          padding: 1.5rem;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: none;
          transition: border-color 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .premium-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--primary), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .premium-card:hover {
          border-color: rgba(99, 102, 241, 0.4);
        }
        
        .premium-card:hover::before {
          opacity: 1;
        }

        /* Staggered Animations */
        .stagger-1 { animation: slideUpFade 0.5s ease forwards 0.1s; opacity: 0; }
        .stagger-2 { animation: slideUpFade 0.5s ease forwards 0.2s; opacity: 0; }
        .stagger-3 { animation: slideUpFade 0.5s ease forwards 0.3s; opacity: 0; }
        .stagger-4 { animation: slideUpFade 0.5s ease forwards 0.4s; opacity: 0; }
        .stagger-5 { animation: slideUpFade 0.5s ease forwards 0.5s; opacity: 0; }
        .stagger-6 { animation: slideUpFade 0.5s ease forwards 0.6s; opacity: 0; }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .summary-val {
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.1;
          letter-spacing: -0.5px;
        }
        
        .glow-bar {
          height: 100%;
          border-radius: 8px;
          transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .glow-bar::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2.5s infinite linear;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .funnel-row-hover {
          transition: transform 0.2s ease, background 0.2s ease;
          padding: 0.5rem;
          border-radius: 10px;
        }
        .funnel-row-hover:hover {
          background: #f8fafc;
          transform: scale(1.01);
        }

        .breakdown-box {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: none;
          transition: all 0.3s ease;
          cursor: default;
        }
        .breakdown-box:hover {
          background: #ffffff;
          border-color: var(--primary);
        }
        
        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
          .breakdown-grid {
            grid-template-columns: 1fr 1fr;
          }
          .premium-card {
            padding: 1.25rem;
          }
        }
        @media (max-width: 480px) {
          .breakdown-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '2rem',
    background: '#ffffff',
    padding: '2.5rem',
    borderRadius: '24px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
    border: '1px solid var(--border-color)'
  },
  header: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
  headerIconGlow: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '48px', 
    height: '48px', 
    borderRadius: '14px', 
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))',
    border: '1px solid rgba(99, 102, 241, 0.2)'
  },
  title: { fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: '1.5' },
  
  summaryCard: { display: 'flex', alignItems: 'center', gap: '1.2rem' },
  iconWrap: { 
    width: '52px', 
    height: '52px', 
    borderRadius: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    border: '1px solid',
    flexShrink: 0
  },
  summaryLabel: { fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', margin: 0, marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' },
  
  chartCard: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  chartHeader: { display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' },
  chartTitle: { fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 },
  emptyText: { color: 'var(--text-muted)', fontStyle: 'italic', padding: '1.5rem 0', textAlign: 'center' },
  
  funnelContainer: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  funnelRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
  funnelLabel: { width: '100px', fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-secondary)' },
  funnelTrack: { flex: 1, height: '20px', background: 'var(--bg-base)', borderRadius: '10px', overflow: 'hidden' },
  funnelValue: { width: '85px', textAlign: 'right', fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' },
  pct: { fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '4px' },

  bdCol: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  dot: { width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0 },
  breakdownLabel: { fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  breakdownValue: { fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }
};

export default StudentAppAnalytics;
