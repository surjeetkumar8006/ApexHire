import React from 'react';
import { Calendar, Clock, Video, FileText, CheckCircle, ExternalLink } from 'lucide-react';

const StudentInterviews = () => {
  const upcomingInterviews = [
    {
      id: 1,
      company: 'Google',
      role: 'Frontend Engineer',
      date: '2026-06-20',
      time: '10:00 AM',
      type: 'Technical Round 1',
      link: 'https://zoom.us/j/123456789',
      status: 'upcoming'
    },
    {
      id: 2,
      company: 'Amazon',
      role: 'Backend SDE',
      date: '2026-06-25',
      time: '02:30 PM',
      type: 'System Design Round',
      link: 'https://zoom.us/j/987654321',
      status: 'upcoming'
    }
  ];

  const pastInterviews = [
    {
      id: 3,
      company: 'Microsoft',
      role: 'Full Stack Developer',
      date: '2026-05-15',
      time: '11:00 AM',
      type: 'HR Round',
      status: 'completed',
      result: 'Offered'
    }
  ];

  return (
    <div style={styles.container} className="animate-fade-in">
      <header>
        <h1 style={styles.title}>My Interviews</h1>
        <p style={styles.subtitle}>Track your upcoming technical rounds and access meeting links instantly.</p>
      </header>

      <div style={styles.content}>
        <div style={styles.upcomingSection}>
          <h2 style={styles.sectionTitle}>
            <span style={{ color: 'var(--primary)' }}>•</span> Upcoming Schedule
          </h2>
          {upcomingInterviews.length === 0 ? (
            <div style={styles.emptyState}>No upcoming interviews scheduled.</div>
          ) : (
            <div style={styles.cardsGrid}>
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="glass-card" style={styles.interviewCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.companyBadge}>
                      {interview.company.charAt(0)}
                    </div>
                    <div>
                      <h3 style={styles.roleTitle}>{interview.role}</h3>
                      <p style={styles.companyName}>{interview.company}</p>
                    </div>
                  </div>
                  
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <Calendar size={15} color="var(--primary)" />
                      <span>{interview.date}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <Clock size={15} color="var(--warning)" />
                      <span>{interview.time}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <FileText size={15} color="var(--accent)" />
                      <span>{interview.type}</span>
                    </div>
                  </div>

                  <a 
                    href={interview.link} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-primary" 
                    style={styles.joinBtn}
                  >
                    <Video size={16} /> Join Interview Room
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.pastSection}>
          <h2 style={styles.sectionTitle}>Past Interviews</h2>
          <div className="glass-card" style={styles.tableCard}>
            <div className="table-responsive">
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Company</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {pastInterviews.map((item) => (
                    <tr key={item.id} style={styles.tr}>
                      <td style={styles.td}><strong>{item.company}</strong></td>
                      <td style={styles.td}>{item.role}</td>
                      <td style={styles.td}>{item.date}</td>
                      <td style={styles.td}>{item.type}</td>
                      <td style={styles.td}>
                        <span style={styles.resultBadge}>
                          <CheckCircle size={14} /> {item.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  title: { fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' },
  subtitle: { fontSize: '1rem', color: 'var(--text-secondary)' },
  content: { display: 'flex', flexDirection: 'column', gap: '2.5rem' },
  sectionTitle: { fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  interviewCard: { display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' },
  cardHeader: { display: 'flex', gap: '1rem', alignItems: 'center' },
  companyBadge: { width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700', color: '#fff' },
  roleTitle: { fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' },
  companyName: { fontSize: '0.9rem', color: 'var(--accent)', fontWeight: '500' },
  infoBox: { background: 'var(--bg-base)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' },
  joinBtn: { width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' },
  tableCard: { padding: 0, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)' },
  td: { padding: '1rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' },
  tr: { transition: 'background 0.2s', '&:hover': { background: 'rgba(255,255,255,0.01)' } },
  resultBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.6rem', background: 'rgba(16,185,129,0.15)', color: 'var(--success)', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '600' },
  emptyState: { padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface-elevated)', borderRadius: '16px', border: '1px dashed var(--border-color)' }
};

export default StudentInterviews;
