import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { BookOpen, Video, Code, FileText, ExternalLink, ArrowRight, X, Search, Bookmark } from 'lucide-react';

const StudentResources = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  const categories = [
    {
      id: 1,
      title: 'Data Structures & Algorithms',
      description: 'Master core computer science fundamentals, algorithmic paradigms, and problem-solving strategies for coding rounds.',
      icon: <Code size={24} color="#3b82f6" />,
      color: 'rgba(59,130,246,0.1)',
      borderColor: '#3b82f6',
      resources: [
        { name: 'NeetCode 150 - Blind 75 Extension', link: 'https://neetcode.io/practice', type: 'Practice', platform: 'NeetCode' },
        { name: 'Striver SDE Sheet', link: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/', type: 'Practice', platform: 'takeUforward' },
        { name: 'Grokking the Coding Interview', link: 'https://www.designgurus.io/course/grokking-the-coding-interview', type: 'Course', platform: 'DesignGurus' }
      ],
      allResources: [
        { name: 'NeetCode 150 - Blind 75 Extension', link: 'https://neetcode.io/practice', type: 'Practice', desc: 'Structured roadmap covering 150 high-frequency LeetCode questions.' },
        { name: 'Striver SDE Sheet', link: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/', type: 'Practice', desc: 'Highly acclaimed set of 180+ problems sorted by interview relevance.' },
        { name: 'Grokking the Coding Interview', link: 'https://www.designgurus.io/course/grokking-the-coding-interview', type: 'Course', desc: 'Pattern-based learning approach to solve unseen coding problems easily.' },
        { name: 'Love Babbar DSA Sheet', link: 'https://www.geeksforgeeks.org/dsa-sheet-by-love-babbar/', type: 'Practice', desc: '450 comprehensive questions spanning all data structures and algorithms.' },
        { name: 'LeetCode Discuss Section', link: 'https://leetcode.com/discuss/', type: 'Community', desc: 'Community solutions, interview experiences, and optimal code templates.' },
        { name: 'Introduction to Algorithms (CLRS)', link: 'https://mitpress.mit.edu/9780262046304/introduction-to-algorithms/', type: 'Book', desc: 'The gold standard textbook on algorithms analysis and implementation.' },
        { name: 'Grokking Algorithms', link: 'https://www.manning.com/books/grokking-algorithms', type: 'Book', desc: 'An illustrated, friendly guide to algorithm basics with visual walkthroughs.' },
        { name: 'takeUforward YouTube Channel', link: 'https://www.youtube.com/@takeuforward', type: 'Video', desc: 'Detailed video explanations of algorithms and tree/graph search problems.' },
        { name: 'NeetCode IO YouTube Channel', link: 'https://www.youtube.com/@NeetCode', type: 'Video', desc: 'Clean, step-by-step whiteboard walkthroughs of popular coding interview questions.' },
        { name: 'CS Dojo Algorithms Series', link: 'https://www.youtube.com/playlist?list=PLBZBJbE_rGRV8VpCliSGbMIP5VqpReGoY', type: 'Video', desc: 'Beginner-friendly video introductions to fundamental algorithm concepts.' }
      ]
    },
    {
      id: 2,
      title: 'System Design',
      description: 'Learn how to architect scalable, high-performance, fault-tolerant, and reliable distributed software architectures.',
      icon: <BookOpen size={24} color="#10b981" />,
      color: 'rgba(16,185,129,0.1)',
      borderColor: '#10b981',
      resources: [
        { name: 'System Design Primer (GitHub)', link: 'https://github.com/donnemartin/system-design-primer', type: 'Read', platform: 'GitHub' },
        { name: 'Grokking the System Design', link: 'https://www.designgurus.io/course/grokking-the-system-design-interview', type: 'Course', platform: 'DesignGurus' },
        { name: 'Alex Xu - System Design Interview', link: 'https://bytebytego.com/', type: 'Book', platform: 'ByteByteGo' }
      ],
      allResources: [
        { name: 'System Design Primer (GitHub)', link: 'https://github.com/donnemartin/system-design-primer', type: 'Read', desc: 'Comprehensive open-source guide to master distributed system design.' },
        { name: 'Grokking the System Design', link: 'https://www.designgurus.io/course/grokking-the-system-design-interview', type: 'Course', desc: 'Learn case studies of top tech systems: Netflix, Uber, Facebook, etc.' },
        { name: 'Alex Xu - System Design Interview (ByteByteGo)', link: 'https://bytebytego.com/', type: 'Book', desc: 'Visual breakdowns of distributed scaling concepts and API designs.' },
        { name: 'Designing Data-Intensive Applications (DDIA)', link: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/', type: 'Book', desc: 'The definitive deep-dive book into databases, replication, and concurrency.' },
        { name: 'Netflix Tech Blog', link: 'https://netflixtechblog.com/', type: 'Read', desc: 'Real-world insights on scale, chaos engineering, microservices, and CDN.' },
        { name: 'Uber Engineering Blog', link: 'https://www.uber.com/blog/engineering/', type: 'Read', desc: 'Deep dives on geofencing, high-throughput microservices, and databases.' },
        { name: 'ByteByteGo YouTube Channel', link: 'https://www.youtube.com/@ByteByteGo', type: 'Video', desc: 'High-quality animated explainers of everyday internet architectures.' },
        { name: 'Gaurav Sen System Design Playlist', link: 'https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-QE1tfVzyj', type: 'Video', desc: 'Excellently structured whiteboard sessions on system design basics.' },
        { name: 'Hussein Nasser Backend Engineering', link: 'https://www.youtube.com/@hnasser', type: 'Video', desc: 'Deep discussions on networking, databases, protocols, proxies, and web architecture.' }
      ]
    },
    {
      id: 3,
      title: 'Behavioral & HR Rounds',
      description: 'Prepare for leadership, cultural fit, conflict resolution, and soft skill evaluations using structured communication templates.',
      icon: <FileText size={24} color="#f59e0b" />,
      color: 'rgba(245,158,11,0.1)',
      borderColor: '#f59e0b',
      resources: [
        { name: 'STAR Method Cheatsheet', link: 'https://www.themuse.com/advice/star-interview-method', type: 'Guide', platform: 'The Muse' },
        { name: 'Amazon Leadership Principles', link: 'https://www.levels.fyi/blog/amazon-behavioral-interview-questions.html', type: 'Read', platform: 'Levels.fyi' },
        { name: 'Top 50 HR Questions', link: 'https://career.guru99.com/top-50-hr-interview-questions/', type: 'Practice', platform: 'Guru99' }
      ],
      allResources: [
        { name: 'STAR Method Cheatsheet', link: 'https://www.themuse.com/advice/star-interview-method', type: 'Guide', desc: 'Learn to articulate professional achievements sequentially under pressure.' },
        { name: 'Amazon Leadership Principles Guide', link: 'https://www.levels.fyi/blog/amazon-behavioral-interview-questions.html', type: 'Read', desc: 'Comprehensive template list to prep stories matching top leadership pillars.' },
        { name: 'Top 50 HR Questions', link: 'https://career.guru99.com/top-50-hr-interview-questions/', type: 'Practice', desc: 'Collection of basic questions: strength, weakness, conflict, salary, etc.' },
        { name: 'Tech Interview Handbook - Behavioral', link: 'https://www.techinterviewhandbook.org/behavioral-interview/', type: 'Guide', desc: 'Curated behavioral questions, guidelines, and templates for software engineers.' },
        { name: 'Dan Croitor Behavioral Prep Videos', link: 'https://www.youtube.com/@DanCroitor', type: 'Video', desc: 'Expert video templates on how to answer behavioral interview questions.' },
        { name: 'Negotiating Your Tech Salary Guide', link: 'https://www.levels.fyi/blog/negotiating-your-compensation.html', type: 'Read', desc: 'Proven negotiation strategies, email templates, and compensation variables.' }
      ]
    },
    {
      id: 4,
      title: 'Mock Interviews',
      description: 'Practice mock sessions, receive constructive feedback, and build confidence under real-time simulated pressure.',
      icon: <Video size={24} color="#a855f7" />,
      color: 'rgba(168,85,247,0.1)',
      borderColor: '#a855f7',
      resources: [
        { name: 'Pramp - Peer Mock Interviews', link: 'https://www.pramp.com/', type: 'Platform', platform: 'Pramp' },
        { name: 'Interviewing.io', link: 'https://interviewing.io/', type: 'Platform', platform: 'Interviewing.io' },
        { name: 'ApexHire AI Mock Coach', link: '/student/mock-interviews', type: 'Internal', platform: 'ApexHire' }
      ],
      allResources: [
        { name: 'Pramp - Peer Mock Interviews', link: 'https://www.pramp.com/', type: 'Platform', desc: 'Free peer-to-peer mock assessments where you take turns interviewing.' },
        { name: 'Interviewing.io (FAANG Experts)', link: 'https://interviewing.io/', type: 'Platform', desc: 'Practice anonymously with real staff/principal engineers from Meta, Google, etc.' },
        { name: 'ApexHire AI Mock Coach', link: '/student/mock-interviews', type: 'Internal', desc: 'Leverage AI to practice conversational and coding assessment questions directly in-portal.' },
        { name: 'Google Interview Warmup', link: 'https://grow.google/certificates/interview-warmup/', type: 'Platform', desc: 'Google tool that listens and uses machine learning to analyze your responses.' },
        { name: 'Exponent Mock Interview Videos', link: 'https://www.youtube.com/@tryexponent', type: 'Video', desc: 'Recordings of real software engineer, PM, and system design mock rounds.' }
      ]
    }
  ];

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    setFilterType('All');
  };

  const filteredResources = selectedCategory
    ? selectedCategory.allResources.filter((res) => {
        const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              res.desc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'All' || res.type === filterType;
        return matchesSearch && matchesFilter;
      })
    : [];

  const availableTypes = selectedCategory
    ? ['All', ...new Set(selectedCategory.allResources.map((res) => res.type))]
    : [];

  const renderResourceItem = (res, index, isModal = false) => {
    const isInternal = res.link.startsWith('/');
    const itemStyle = isModal ? styles.modalResourceItem : styles.resourceItem;
    const itemClass = isModal ? "resource-item-hover" : "resource-link-hover";

    const content = (
      <>
        <div style={isModal ? { flex: 1 } : { display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={isModal ? { display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' } : {}}>
            <span style={isModal ? styles.modalResourceName : styles.resourceName}>{res.name}</span>
            {isModal && <span style={styles.modalBadge(res.type)}>{res.type}</span>}
          </div>
          {isModal ? (
            <p style={styles.modalResourceDesc}>{res.desc}</p>
          ) : (
            <span style={styles.resourceType}>{res.type} • {res.platform || 'Resource'}</span>
          )}
        </div>
        <div style={isModal ? styles.modalResourceAction : {}}>
          {isModal && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', marginRight: '4px' }}>Access</span>}
          <ExternalLink size={14} color={isModal ? "var(--primary)" : "var(--text-muted)"} />
        </div>
      </>
    );

    if (isInternal) {
      return (
        <Link key={index} to={res.link} style={itemStyle} className={itemClass}>
          {content}
        </Link>
      );
    }

    return (
      <a 
        key={index} 
        href={res.link} 
        target="_blank" 
        rel="noopener noreferrer" 
        style={itemStyle} 
        className={itemClass}
      >
        {content}
      </a>
    );
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <style>{`
        .resource-modal-overlay {
          animation: fadeIn 0.2s ease-out;
        }
        .resource-modal-content {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .resource-item-hover {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .resource-item-hover:hover {
          transform: translateY(-2px);
          border-color: var(--primary) !important;
          background: var(--bg-surface-elevated) !important;
          box-shadow: var(--shadow-sm);
        }
        .tab-btn {
          border: 1px solid var(--border-color);
          background: transparent;
          color: var(--text-secondary);
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab-btn.active {
          border-color: var(--primary);
          background: var(--primary);
          color: #fff;
        }
        .tab-btn:hover:not(.active) {
          background: var(--bg-surface-elevated);
          border-color: var(--text-muted);
        }
        .search-input:focus {
          border-color: var(--primary) !important;
          outline: none;
          box-shadow: 0 0 0 3px var(--primary-glow);
        }
        .card-hover-effect {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover-effect:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }
        .resource-link-hover {
          transition: all 0.2s;
        }
        .resource-link-hover:hover {
          border-color: var(--primary) !important;
          background: var(--bg-surface-elevated) !important;
        }
      `}</style>

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Preparation Resources</h1>
          <p style={styles.subtitle}>Curated materials to help you ace your next technical or HR interview.</p>
        </div>
      </header>

      <div style={styles.grid}>
        {categories.map((cat) => (
          <div key={cat.id} className="glass-card card-hover-effect" style={{...styles.card, borderTop: `4px solid ${cat.borderColor}`}}>
            <div style={styles.cardHeader}>
              <div style={{...styles.iconWrap, background: cat.color}}>
                {cat.icon}
              </div>
              <h2 style={styles.cardTitle}>{cat.title}</h2>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, minHeight: '40px', lineHeight: '1.4' }}>
              {cat.description}
            </p>

            <div style={styles.resourceList}>
              {cat.resources.map((res, idx) => renderResourceItem(res, idx, false))}
            </div>

            <button 
              className="btn btn-outline" 
              style={{width: '100%', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}
              onClick={() => handleSelectCategory(cat)}
            >
              View All <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* View All Portal Modal */}
      {selectedCategory && createPortal(
        <div className="resource-modal-overlay" style={styles.modalOverlay} onClick={() => setSelectedCategory(null)}>
          <div className="resource-modal-content glass-card" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ ...styles.iconWrap, background: selectedCategory.color, width: '40px', height: '40px' }}>
                  {selectedCategory.icon}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '850', color: 'var(--text-primary)', margin: 0 }}>
                    {selectedCategory.title}
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {filteredResources.length} Resources Available
                  </span>
                </div>
              </div>
              <button 
                style={styles.closeBtn} 
                onClick={() => setSelectedCategory(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                {selectedCategory.description}
              </p>

              {/* Search and Filters Bar */}
              <div style={styles.searchFilterContainer}>
                <div style={styles.searchBox}>
                  <Search size={16} color="var(--text-muted)" style={styles.searchIcon} />
                  <input 
                    type="text" 
                    placeholder="Search resources..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    style={styles.searchInput}
                  />
                </div>
                
                <div style={styles.filterTabs}>
                  {availableTypes.map((type) => (
                    <button
                      key={type}
                      className={`tab-btn ${filterType === type ? 'active' : ''}`}
                      onClick={() => setFilterType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resources Grid/List */}
              <div style={styles.modalList}>
                {filteredResources.length === 0 ? (
                  <div style={styles.emptyState}>
                    <Bookmark size={32} color="var(--text-muted)" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>No resources match your filters.</p>
                  </div>
                ) : (
                  filteredResources.map((res, idx) => renderResourceItem(res, idx, true))
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' },
  subtitle: { fontSize: '1rem', color: 'var(--text-secondary)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  card: { display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.75rem', height: '100%' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '1rem' },
  iconWrap: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' },
  resourceList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  resourceItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', borderRadius: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', textDecoration: 'none', transition: 'all 0.2s' },
  resourceName: { display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.1rem' },
  resourceType: { display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 },

  // Portal Modal Style Definitions
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(8px)',
    zIndex: 100000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem'
  },
  modalContent: {
    width: '100%',
    maxWidth: '650px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: 0,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-lg)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-surface)',
    flexShrink: 0
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  searchFilterContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%'
  },
  searchBox: {
    position: 'relative',
    width: '100%'
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    padding: '0.6rem 1rem 0.6rem 2.5rem',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-surface-elevated)',
    color: 'var(--text-primary)',
    fontSize: '0.88rem',
    transition: 'all 0.2s'
  },
  filterTabs: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  modalList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    overflowY: 'auto',
    maxHeight: '40vh',
    paddingRight: '4px'
  },
  modalResourceItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderRadius: '12px',
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    textDecoration: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    gap: '1rem'
  },
  modalResourceName: {
    fontSize: '0.92rem',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  modalResourceDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    margin: '4px 0 0 0',
    lineHeight: '1.4'
  },
  modalResourceAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    flexShrink: 0
  },
  modalBadge: (type) => {
    let bg = 'rgba(99, 102, 241, 0.1)';
    let color = 'var(--primary)';
    if (type === 'Video') {
      bg = 'rgba(239, 68, 68, 0.1)';
      color = '#ef4444';
    } else if (type === 'Read' || type === 'Guide') {
      bg = 'rgba(16, 185, 129, 0.1)';
      color = '#10b981';
    } else if (type === 'Book') {
      bg = 'rgba(245, 158, 11, 0.1)';
      color = '#f59e0b';
    } else if (type === 'Course') {
      bg = 'rgba(168, 85, 247, 0.1)';
      color = '#a855f7';
    } else if (type === 'Internal') {
      bg = 'rgba(99, 102, 241, 0.15)';
      color = 'var(--primary)';
    }
    return {
      fontSize: '0.65rem',
      fontWeight: '750',
      textTransform: 'uppercase',
      padding: '0.2rem 0.5rem',
      borderRadius: '4px',
      background: bg,
      color: color
    };
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    textAlign: 'center'
  }
};

export default StudentResources;
