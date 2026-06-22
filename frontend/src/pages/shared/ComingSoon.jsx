import React from 'react';
import { Settings } from 'lucide-react';

const ComingSoon = ({ title, subtitle }) => {
  return (
    <div style={styles.container} className="animate-fade-in">
      <header>
        <h1 style={styles.title}>{title || 'Coming Soon'}</h1>
        <p style={styles.subtitle}>{subtitle || 'We are working hard to bring this feature to you.'}</p>
      </header>

      <div className="glass-card" style={styles.content}>
        <div style={styles.iconWrap}>
          <Settings size={40} color="var(--primary)" />
        </div>
        <h2 style={styles.heading}>Under Construction</h2>
        <p style={styles.description}>
          This module is part of the upcoming industry-standard expansion package. Check back soon!
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5rem 2rem',
    textAlign: 'center',
    gap: '1rem',
  },
  iconWrap: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(99, 102, 241, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
    animation: 'spin 4s linear infinite',
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  description: {
    color: 'var(--text-secondary)',
    maxWidth: '400px',
    lineHeight: '1.5',
  },
};

export default ComingSoon;
