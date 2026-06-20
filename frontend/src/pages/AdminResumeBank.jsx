import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, User, Award, FileText, Loader, Check, RefreshCw, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const AdminResumeBank = () => {
  const { authHeader } = useAuth();
  const { addToast } = useNotification();
  
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState('score-desc');

  // Fetch all student profiles
  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/profile/all`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        // Filter profiles that have uploaded a resume
        const profilesWithResumes = data.filter(p => p.resumeUrl && p.resumeUrl.trim() !== '');
        setProfiles(profilesWithResumes);
      } else {
        const data = await res.json();
        addToast(data.message || 'Failed to fetch resumes', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading global resume bank', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleToggleVerification = async (profileId) => {
    try {
      const res = await fetch(`${API_BASE}/profile/verify/${profileId}`, {
        method: 'PUT',
        headers: authHeader(),
      });
      if (res.ok) {
        const updatedProfile = await res.json();
        addToast(`Verification status updated!`, 'success');
        setProfiles(prev => 
          prev.map(p => p._id === profileId ? { ...p, isVerified: updatedProfile.isVerified } : p)
        );
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update verification status');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleViewResume = (resumeUrl) => {
    if (!resumeUrl) {
      addToast('Resume file path not found', 'warning');
      return;
    }
    const baseUrl = API_BASE.replace('/api', '');
    const fullUrl = resumeUrl.startsWith('http') ? resumeUrl : `${baseUrl}${resumeUrl}`;
    window.open(fullUrl, '_blank');
  };

  const handleExportZip = () => {
    if (filteredProfiles.length === 0) {
      addToast('No resumes available to export', 'warning');
      return;
    }
    addToast(`Exporting ${filteredProfiles.length} resume(s) as ZIP...`, 'info');
  };

  const filteredProfiles = profiles
    .filter(p => {
      const candidateName = p.user?.name || '';
      const candidateEmail = p.user?.email || '';
      const skillsList = p.skills || [];
      const score = (p.aiFeedback && p.aiFeedback.score) || 0;

      const matchesSearch = 
        candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skillsList.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = 
        statusFilter === 'All' || 
        (statusFilter === 'Verified' && p.isVerified) || 
        (statusFilter === 'Pending' && !p.isVerified);

      const matchesScore = score >= minScore;

      return matchesSearch && matchesStatus && matchesScore;
    })
    .sort((a, b) => {
      const scoreA = (a.aiFeedback && a.aiFeedback.score) || 0;
      const scoreB = (b.aiFeedback && b.aiFeedback.score) || 0;
      const nameA = a.user?.name || '';
      const nameB = b.user?.name || '';

      if (sortBy === 'score-desc') return scoreB - scoreA;
      if (sortBy === 'score-asc') return scoreA - scoreB;
      if (sortBy === 'name-asc') return nameA.localeCompare(nameB);
      if (sortBy === 'name-desc') return nameB.localeCompare(nameA);
      return 0;
    });

  const totalResumes = profiles.length;
  const verifiedCount = profiles.filter(p => p.isVerified).length;
  const avgScore = profiles.length > 0 
    ? Math.round(profiles.reduce((sum, p) => sum + ((p.aiFeedback && p.aiFeedback.score) || 0), 0) / profiles.length)
    : 0;

  return (
    <div style={styles.container} className="animate-fade-in">
      <style>{`
        .resume-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 0.5rem;
        }
        @media (max-width: 768px) {
          .resume-stats-row {
            grid-template-columns: 1fr;
          }
        }
        .resume-stat-card {
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 14px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
          transition: all 0.25s ease;
        }
        .resume-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: rgba(99, 102, 241, 0.2);
        }
        .stat-details h4 {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 0.25rem 0;
        }
        .stat-details span {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.5px;
        }
        .stat-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-icon-wrap.resumes { background: var(--primary-glow); color: var(--primary); }
        .stat-icon-wrap.verified { background: var(--success-glow); color: var(--success); }
        .stat-icon-wrap.score { background: var(--warning-glow); color: var(--warning); }
        
        .resume-bank-filters {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 1rem;
          margin-bottom: 0.5rem;
          align-items: center;
        }
        @media (max-width: 992px) {
          .resume-bank-filters {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 576px) {
          .resume-bank-filters {
            grid-template-columns: 1fr;
          }
        }
        .filter-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
          display: block;
        }
      `}</style>

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Global Resume Bank</h1>
          <p style={styles.subtitle}>Search, verify, and filter through the entire institution's resume pool.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleExportZip}
          disabled={filteredProfiles.length === 0}
        >
          <Download size={16} /> Export ZIP
        </button>
      </header>

      {/* Stats Cards Section */}
      <div className="resume-stats-row">
        <div className="resume-stat-card">
          <div className="stat-details">
            <h4>Total Resumes</h4>
            <span>{totalResumes}</span>
          </div>
          <div className="stat-icon-wrap resumes">
            <Users size={20} />
          </div>
        </div>
        <div className="resume-stat-card">
          <div className="stat-details">
            <h4>Verified Talents</h4>
            <span>{verifiedCount}</span>
          </div>
          <div className="stat-icon-wrap verified">
            <ShieldCheck size={20} />
          </div>
        </div>
        <div className="resume-stat-card">
          <div className="stat-details">
            <h4>Avg AI Match Score</h4>
            <span>{avgScore}/100</span>
          </div>
          <div className="stat-icon-wrap score">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="resume-bank-filters">
          <div>
            <label className="filter-label">Search Candidate or Skill</label>
            <div style={styles.searchWrap}>
              <Search size={18} style={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="e.g. React, Java, Surjeet..." 
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="filter-label">Min AI Match Score: {minScore}+</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="5"
              style={{ width: '100%', height: '36px', accentColor: 'var(--primary)' }}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="filter-label">Verification Status</label>
            <select 
              className="form-select"
              style={{ height: '38px', padding: '0 1rem' }}
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Verified">Verified Only</option>
              <option value="Pending">Pending Only</option>
            </select>
          </div>

          <div>
            <label className="filter-label">Sort Candidates By</label>
            <select 
              className="form-select"
              style={{ height: '38px', padding: '0 1rem' }}
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="score-desc">AI Score (High to Low)</option>
              <option value="score-asc">AI Score (Low to High)</option>
              <option value="name-asc">Name (A to Z)</option>
              <option value="name-desc">Name (Z to A)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={styles.loaderWrap}>
          <Loader size={36} className="animate-spin" color="var(--primary)" />
          <p style={{ color: 'var(--text-secondary)' }}>Loading resume bank...</p>
        </div>
      ) : (
        <div className="glass-card" style={styles.tableCard}>
          <div className="table-responsive">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Candidate</th>
                  <th style={styles.th}>Top Skills</th>
                  <th style={styles.th}>AI Resume Score</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map(p => (
                  <tr key={p._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.candidateCell}>
                        <div style={styles.avatar}>
                          {p.user?.name ? p.user.name.charAt(0) : <User size={16} />}
                        </div>
                        <div>
                          <div style={styles.name}>{p.user?.name || 'Unknown Student'}</div>
                          <div style={styles.email}>{p.user?.email || 'No Email'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.skillsWrap}>
                        {p.skills && p.skills.length > 0 ? (
                          p.skills.map((skill, i) => (
                            <span key={i} style={styles.skillTag}>{skill}</span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None added</span>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.scoreWrap}>
                        <Award size={16} color="var(--primary)" />
                        <span style={styles.scoreText}>{(p.aiFeedback && p.aiFeedback.score) || 'N/A'}/100</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <button 
                        onClick={() => handleToggleVerification(p._id)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                        title="Click to toggle verification status"
                      >
                        {p.isVerified ? (
                          <span style={styles.badgeSuccess}>Verified</span>
                        ) : (
                          <span style={styles.badgeWarning}>Pending</span>
                        )}
                      </button>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionsCell}>
                        <button 
                          className="btn btn-outline" 
                          style={styles.actionBtn}
                          onClick={() => handleViewResume(p.resumeUrl)}
                        >
                          <FileText size={14} /> View
                        </button>
                        <button 
                          className="btn btn-primary" 
                          style={styles.actionBtn}
                          onClick={() => handleViewResume(p.resumeUrl)}
                        >
                          <Download size={14} /> DL
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProfiles.length === 0 && (
            <div style={styles.emptyState}>
              {searchTerm || statusFilter !== 'All' || minScore > 0
                ? 'No resumes match your active search or filter criteria.' 
                : 'No candidates have uploaded a resume yet.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' },
  subtitle: { fontSize: '1rem', color: 'var(--text-secondary)' },
  controls: { display: 'flex', gap: '1rem' },
  searchWrap: { position: 'relative', flex: 1 },
  searchIcon: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' },
  searchInput: { width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none' },
  tableCard: { padding: 0, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)' },
  td: { padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle' },
  tr: { transition: 'background 0.2s', '&:hover': { background: 'rgba(99,102,241,0.03)' } },
  candidateCell: { display: 'flex', alignItems: 'center', gap: '1rem' },
  avatar: { width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  name: { fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' },
  email: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  skillsWrap: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  skillTag: { background: 'var(--bg-base)', border: '1px solid var(--border-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' },
  scoreWrap: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-base)', padding: '0.3rem 0.6rem', borderRadius: '50px', display: 'inline-flex', border: '1px solid var(--border-color)' },
  scoreText: { fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' },
  badgeSuccess: { background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '600', display: 'inline-block' },
  badgeWarning: { background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '600', display: 'inline-block' },
  actionsCell: { display: 'flex', gap: '0.5rem' },
  actionBtn: { padding: '0.4rem 0.6rem', fontSize: '0.8rem' },
  emptyState: { padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' },
  loaderWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '6rem 0' }
};

export default AdminResumeBank;
