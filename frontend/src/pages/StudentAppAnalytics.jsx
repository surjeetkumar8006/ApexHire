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
          <BarChart2 size={28} color="var(--primary)" />
          <h1 style={styles.title}>Application Analytics</h1>
        </div>
        <p style={styles.subtitle}>Track your job hunt progress and application conversion funnel.</p>
      </header>

      {/* Summary Cards */}
      <div className="analytics-grid">
        <div className="premium-card" style={styles.summaryCard}>
          <div style={styles.iconWrap}><Briefcase size={28} color="var(--primary)" /></div>
          <div>
            <h3 className="summary-val">{total}</h3>
            <p style={styles.summaryLabel}>Total Applied</p>
          </div>
        </div>
        <div className="premium-card" style={styles.summaryCard}>
          <div style={styles.iconWrap}><Clock size={28} color="var(--warning)" /></div>
          <div>
            <h3 className="summary-val">{inProgress}</h3>
            <p style={styles.summaryLabel}>In Progress</p>
          </div>
        </div>
        <div className="premium-card" style={styles.summaryCard}>
          <div style={styles.iconWrap}><CheckCircle size={28} color="var(--success)" /></div>
          <div>
            <h3 className="summary-val">{offered}</h3>
            <p style={styles.summaryLabel}>Offers Received</p>
          </div>
        </div>
        <div className="premium-card" style={styles.summaryCard}>
          <div style={styles.iconWrap}><XCircle size={28} color="var(--danger)" /></div>
          <div>
            <h3 className="summary-val">{rejected}</h3>
            <p style={styles.summaryLabel}>Rejected</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        
        {/* Funnel Chart */}
        <div className="premium-card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}><PieChart size={20} color="var(--primary)" /> Conversion Funnel</h3>
          {total === 0 ? (
            <p style={styles.emptyText}>Apply to jobs to generate your funnel!</p>
          ) : (
            <div style={styles.funnelContainer}>
              <div style={styles.funnelRow}>
                <span style={styles.funnelLabel}>Applied</span>
                <div style={styles.funnelTrack}>
                  <div className="glow-bar" style={{ width: '100%', background: 'var(--primary)', boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)' }}></div>
                </div>
                <span style={styles.funnelValue}>{total} <span style={styles.pct}>({getPercent(total)}%)</span></span>
              </div>
              
              <div style={styles.funnelRow}>
                <span style={styles.funnelLabel}>Interviewing</span>
                <div style={styles.funnelTrack}>
                  <div className="glow-bar" style={{ width: `${getPercent(interviewing + offered)}%`, background: 'var(--warning)', boxShadow: '0 0 10px rgba(245, 158, 11, 0.4)' }}></div>
                </div>
                <span style={styles.funnelValue}>{interviewing + offered} <span style={styles.pct}>({getPercent(interviewing + offered)}%)</span></span>
              </div>
              
              <div style={styles.funnelRow}>
                <span style={styles.funnelLabel}>Offers</span>
                <div style={styles.funnelTrack}>
                  <div className="glow-bar" style={{ width: `${getPercent(offered)}%`, background: 'var(--success)', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}></div>
                </div>
                <span style={styles.funnelValue}>{offered} <span style={styles.pct}>({getPercent(offered)}%)</span></span>
              </div>
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="premium-card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}><BarChart2 size={20} color="var(--primary)" /> Detailed Breakdown</h3>
          {total === 0 ? (
            <p style={styles.emptyText}>No data available yet.</p>
          ) : (
            <div className="breakdown-grid">
              <div className="breakdown-box">
                <div style={{...styles.dot, background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)'}}></div>
                <div style={styles.bdCol}>
                  <span style={styles.breakdownLabel}>Applied</span>
                  <span style={styles.breakdownValue}>{applied}</span>
                </div>
              </div>
              <div className="breakdown-box">
                <div style={{...styles.dot, background: 'var(--info)', boxShadow: '0 0 8px var(--info)'}}></div>
                <div style={styles.bdCol}>
                  <span style={styles.breakdownLabel}>Reviewing</span>
                  <span style={styles.breakdownValue}>{reviewing}</span>
                </div>
              </div>
              <div className="breakdown-box">
                <div style={{...styles.dot, background: '#a855f7', boxShadow: '0 0 8px #a855f7'}}></div>
                <div style={styles.bdCol}>
                  <span style={styles.breakdownLabel}>Shortlisted</span>
                  <span style={styles.breakdownValue}>{shortlisted}</span>
                </div>
              </div>
              <div className="breakdown-box">
                <div style={{...styles.dot, background: 'var(--warning)', boxShadow: '0 0 8px var(--warning)'}}></div>
                <div style={styles.bdCol}>
                  <span style={styles.breakdownLabel}>Interviewing</span>
                  <span style={styles.breakdownValue}>{interviewing}</span>
                </div>
              </div>
              <div className="breakdown-box">
                <div style={{...styles.dot, background: 'var(--success)', boxShadow: '0 0 8px var(--success)'}}></div>
                <div style={styles.bdCol}>
                  <span style={styles.breakdownLabel}>Offered</span>
                  <span style={styles.breakdownValue}>{offered}</span>
                </div>
              </div>
              <div className="breakdown-box">
                <div style={{...styles.dot, background: 'var(--danger)', boxShadow: '0 0 8px var(--danger)'}}></div>
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
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        .breakdown-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
          padding: 1rem 0;
        }
        .premium-card {
          padding: 1.5rem;
          border-radius: 16px;
          background: var(--bg-surface);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .premium-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .summary-val {
          font-size: 2.2rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--text-primary), var(--text-muted));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          line-height: 1.2;
        }
        .glow-bar {
          height: 100%;
          border-radius: 12px;
          transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .glow-bar::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .breakdown-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.2rem;
          background: var(--bg-base);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }
        .breakdown-box:hover {
          background: var(--bg-surface-elevated);
          border-color: var(--primary);
        }
        
        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
          .breakdown-grid {
            grid-template-columns: 1fr 1fr;
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
  container: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  header: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  title: { fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' },
  subtitle: { fontSize: '1.05rem', color: 'var(--text-secondary)' },
  
  summaryCard: { display: 'flex', alignItems: 'center', gap: '1.2rem' },
  iconWrap: { padding: '1rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' },
  summaryLabel: { fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)', margin: 0, marginTop: '0.2rem' },
  
  chartCard: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  chartTitle: { fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.7rem' },
  emptyText: { color: 'var(--text-muted)', fontStyle: 'italic', padding: '2rem 0', textAlign: 'center' },
  
  funnelContainer: { display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' },
  funnelRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
  funnelLabel: { width: '100px', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)' },
  funnelTrack: { flex: 1, height: '24px', background: 'var(--bg-base)', borderRadius: '12px', border: '1px solid var(--border-color)' },
  funnelValue: { width: '80px', textAlign: 'right', fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' },
  pct: { fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' },

  bdCol: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  dot: { width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0 },
  breakdownLabel: { fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  breakdownValue: { fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }
};

export default StudentAppAnalytics;
