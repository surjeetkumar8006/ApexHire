import React from 'react';
import { BookOpen, Video, Code, FileText, ExternalLink, ArrowRight } from 'lucide-react';

const StudentResources = () => {
  const categories = [
    {
      id: 1,
      title: 'Data Structures & Algorithms',
      icon: <Code size={24} color="#3b82f6" />,
      color: 'rgba(59,130,246,0.1)',
      resources: [
        { name: 'NeetCode 150 - Blind 75 Extension', link: '#', type: 'Practice' },
        { name: 'Striver SDE Sheet', link: '#', type: 'Practice' },
        { name: 'Grokking the Coding Interview', link: '#', type: 'Course' }
      ]
    },
    {
      id: 2,
      title: 'System Design',
      icon: <BookOpen size={24} color="#10b981" />,
      color: 'rgba(16,185,129,0.1)',
      resources: [
        { name: 'System Design Primer (GitHub)', link: '#', type: 'Read' },
        { name: 'Grokking the System Design', link: '#', type: 'Course' },
        { name: 'Alex Xu - System Design Interview', link: '#', type: 'Book' }
      ]
    },
    {
      id: 3,
      title: 'Behavioral & HR Rounds',
      icon: <FileText size={24} color="#f59e0b" />,
      color: 'rgba(245,158,11,0.1)',
      resources: [
        { name: 'STAR Method Cheatsheet', link: '#', type: 'Guide' },
        { name: 'Amazon Leadership Principles', link: '#', type: 'Read' },
        { name: 'Top 50 HR Questions', link: '#', type: 'Practice' }
      ]
    },
    {
      id: 4,
      title: 'Mock Interviews',
      icon: <Video size={24} color="#a855f7" />,
      color: 'rgba(168,85,247,0.1)',
      resources: [
        { name: 'Pramp - Peer Mock Interviews', link: '#', type: 'Platform' },
        { name: 'Interviewing.io', link: '#', type: 'Platform' },
        { name: 'ApexHire AI Mock Coach', link: '/student/ai-coach', type: 'Internal' }
      ]
    }
  ];

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Preparation Resources</h1>
          <p style={styles.subtitle}>Curated materials to help you ace your next technical or HR interview.</p>
        </div>
      </header>

      <div style={styles.grid}>
        {categories.map((cat) => (
          <div key={cat.id} className="glass-card" style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{...styles.iconWrap, background: cat.color}}>
                {cat.icon}
              </div>
              <h2 style={styles.cardTitle}>{cat.title}</h2>
            </div>

            <div style={styles.resourceList}>
              {cat.resources.map((res, index) => (
                <a key={index} href={res.link} style={styles.resourceItem} className="resource-hover">
                  <div>
                    <span style={styles.resourceName}>{res.name}</span>
                    <span style={styles.resourceType}>{res.type}</span>
                  </div>
                  <ExternalLink size={14} color="var(--text-muted)" />
                </a>
              ))}
            </div>

            <button className="btn btn-outline" style={{width: '100%', marginTop: 'auto'}}>
              View All <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' },
  subtitle: { fontSize: '1rem', color: 'var(--text-secondary)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' },
  card: { display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '1rem' },
  iconWrap: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' },
  resourceList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  resourceItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', textDecoration: 'none', transition: 'border-color 0.2s' },
  resourceName: { display: 'block', fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '0.1rem' },
  resourceType: { display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }
};

export default StudentResources;
