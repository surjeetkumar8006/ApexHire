import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Briefcase, Award, Loader } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const AdminAnalytics = () => {
  const { authHeader } = useAuth();
  const { addToast } = useNotification();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: {
      avgPackage: 0,
      highestPackage: 0,
      totalPlaced: 0,
      activePartners: 0
    },
    placementTrends: [],
    packageDistribution: [],
    industryData: []
  });

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/admin`, {
        headers: authHeader()
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        const errorData = await res.json();
        addToast(errorData.message || 'Failed to fetch analytics', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading advanced analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4', '#84cc16', '#64748b'];

  if (loading) {
    return (
      <div style={styles.loaderWrap}>
        <Loader size={48} className="animate-spin" color="var(--primary)" />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Loading analytics data...</p>
      </div>
    );
  }

  const { summary, placementTrends, packageDistribution, industryData } = data;

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Advanced Analytics</h1>
          <p style={styles.subtitle}>Deep-dive metrics into placement trends, salaries, and hiring industries.</p>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={{...styles.kpiIconWrap, background: 'var(--primary-glow)', color: 'var(--primary)'}}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={styles.kpiLabel}>Avg Package (LPA)</p>
            <h3 style={styles.kpiValue}>{summary.avgPackage > 0 ? `${summary.avgPackage} LPA` : 'N/A'}</h3>
          </div>
        </div>
        
        <div className="glass-card" style={styles.kpiCard}>
          <div style={{...styles.kpiIconWrap, background: 'var(--success-glow)', color: 'var(--success)'}}>
            <Award size={24} />
          </div>
          <div>
            <p style={styles.kpiLabel}>Highest Package (LPA)</p>
            <h3 style={styles.kpiValue}>{summary.highestPackage > 0 ? `${summary.highestPackage} LPA` : 'N/A'}</h3>
          </div>
        </div>

        <div className="glass-card" style={styles.kpiCard}>
          <div style={{...styles.kpiIconWrap, background: 'var(--warning-glow)', color: 'var(--warning)'}}>
            <Users size={24} />
          </div>
          <div>
            <p style={styles.kpiLabel}>Total Placed</p>
            <h3 style={styles.kpiValue}>{summary.totalPlaced}</h3>
          </div>
        </div>

        <div className="glass-card" style={styles.kpiCard}>
          <div style={{...styles.kpiIconWrap, background: 'var(--secondary-glow)', color: 'var(--secondary)'}}>
            <Briefcase size={24} />
          </div>
          <div>
            <p style={styles.kpiLabel}>Active Partners</p>
            <h3 style={styles.kpiValue}>{summary.activePartners}</h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={styles.chartsGrid}>
        {/* Placement Trends Line Chart */}
        <div className="glass-card" style={styles.chartCardFull}>
          <h3 style={styles.chartTitle}>Placement Trends (Last 6 Months)</h3>
          {placementTrends.length === 0 ? (
            <div style={styles.emptyChart}>No placement data available for this period.</div>
          ) : (
            <div style={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={placementTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                  <Line type="monotone" dataKey="offers" name="Placements" stroke="var(--primary)" strokeWidth={3} dot={{ r: 6, fill: 'var(--primary)' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Package Distribution Bar Chart */}
        <div className="glass-card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Salary Package Distribution</h3>
          {packageDistribution.every(item => item.count === 0) ? (
            <div style={styles.emptyChart}>No package distribution data available.</div>
          ) : (
            <div style={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={packageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="range" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                  <Bar dataKey="count" name="Placements" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Industry Pie Chart */}
        <div className="glass-card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Hiring by Industry</h3>
          {industryData.length === 0 ? (
            <div style={styles.emptyChart}>No industry-wise placement data available.</div>
          ) : (
            <>
              <div style={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={industryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {industryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.legend}>
                {industryData.map((entry, index) => (
                  <div key={entry.name} style={styles.legendItem}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[index % COLORS.length] }}></span>
                    <span>{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' },
  subtitle: { fontSize: '1rem', color: 'var(--text-secondary)' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' },
  kpiCard: { display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' },
  kpiIconWrap: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  kpiLabel: { fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 600 },
  kpiValue: { fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  chartCardFull: { gridColumn: '1 / -1', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  chartCard: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  chartTitle: { fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 },
  chartWrapper: { height: '300px', width: '100%' },
  legend: { display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' },
  loaderWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '8rem 0' },
  emptyChart: { height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px dashed var(--border-color)', fontSize: '0.95rem' }
};

export default AdminAnalytics;
