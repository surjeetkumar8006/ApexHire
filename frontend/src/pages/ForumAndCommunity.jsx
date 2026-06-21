import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  MessagesSquare, 
  Users, 
  Briefcase, 
  Plus, 
  ThumbsUp, 
  MessageSquare, 
  Linkedin, 
  Check, 
  X as CloseIcon, 
  Send,
  AlertCircle,
  FileText,
  CalendarCheck,
  Cpu,
  FolderOpen,
  Shield
} from 'lucide-react';

const ForumAndCommunity = () => {
  const { authHeader, user } = useAuth();
  const { addToast } = useNotification();

  const getCategoryIcon = (cat) => {
    if (cat === 'All') return <MessagesSquare size={16} />;
    if (cat === 'Placement') return <Briefcase size={16} />;
    if (cat === 'Interviews') return <CalendarCheck size={16} />;
    if (cat === 'Tech Prep') return <Cpu size={16} />;
    return <MessageSquare size={16} />;
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') return <span className="badge bg-secondary-glow text-secondary text-xxs font-semibold ml-2">Admin</span>;
    if (role === 'recruiter') return <span className="badge bg-accent-glow text-accent text-xxs font-semibold ml-2">Recruiter</span>;
    return <span className="badge bg-primary-glow text-primary text-xxs font-semibold ml-2">Student</span>;
  };

  const [activeSubTab, setActiveSubTab] = useState('forum'); // 'forum', 'alumni', 'referrals'
  
  // Discussion Forum state
  const [posts, setPosts] = useState([]);
  const [postCategory, setPostCategory] = useState('All');
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
  const [commentInputs, setCommentInputs] = useState({}); // postId -> comment text

  // Alumni state
  const [alumni, setAlumni] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Referral state
  const [referrals, setReferrals] = useState([]);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [referralJobs, setReferralJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [referralNote, setReferralNote] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTabData();
  }, [activeSubTab]);

  const fetchTabData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'forum') {
        const res = await fetch(`${API_BASE}/community/forum`, { headers: authHeader() });
        if (res.ok) setPosts(await res.json());
      } else if (activeSubTab === 'alumni') {
        const res = await fetch(`${API_BASE}/community/alumni`, { headers: authHeader() });
        if (res.ok) setAlumni(await res.json());
      } else if (activeSubTab === 'referrals') {
        const res = await fetch(`${API_BASE}/community/referrals`, { headers: authHeader() });
        if (res.ok) setReferrals(await res.json());
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading community data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Forum actions
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) {
      addToast('Please enter title and content', 'warning');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/community/forum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(newPost)
      });

      if (res.ok) {
        addToast('Discussion post created!', 'success');
        setShowPostModal(false);
        setNewPost({ title: '', content: '', category: 'General' });
        fetchTabData();
      } else {
        addToast('Failed to create post', 'error');
      }
    } catch (err) {
      addToast('Server error posting discussion', 'error');
    }
  };

  const handleUpvote = async (postId) => {
    try {
      const res = await fetch(`${API_BASE}/community/forum/${postId}/upvote`, {
        method: 'POST',
        headers: authHeader()
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, upvotes: data.upvotes } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/community/forum/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(prev => prev.map(p => p._id === postId ? updatedPost : p));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Referral actions
  const openReferralRequest = async (al) => {
    setSelectedAlumni(al);
    // Fetch active jobs for student to request referral
    try {
      const res = await fetch(`${API_BASE}/jobs`, { headers: authHeader() });
      if (res.ok) {
        const jobsData = await res.json();
        setReferralJobs(jobsData);
        if (jobsData.length > 0) setSelectedJobId(jobsData[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
    setShowReferralModal(true);
  };

  const handleRequestReferral = async (e) => {
    e.preventDefault();
    if (!selectedJobId) {
      addToast('Please select a job target', 'warning');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/community/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          jobId: selectedJobId,
          alumniName: selectedAlumni.name,
          alumniCompany: selectedAlumni.company,
          note: referralNote
        })
      });

      if (res.ok) {
        addToast('Referral request sent successfully!', 'success');
        setShowReferralModal(false);
        setReferralNote('');
      } else {
        addToast('Failed to send referral request', 'error');
      }
    } catch (err) {
      addToast('Server error requesting referral', 'error');
    }
  };

  const handleUpdateReferralStatus = async (refId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/community/referrals/${refId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        addToast(`Referral request status: ${newStatus}`, 'success');
        fetchTabData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filters
  const filteredPosts = posts.filter(p => {
    if (postCategory === 'All') return true;
    return p.category === postCategory;
  });

  const filteredAlumni = alumni.filter(al => {
    const q = searchQuery.toLowerCase();
    return al.name.toLowerCase().includes(q) || 
           al.company.toLowerCase().includes(q) || 
           al.role.toLowerCase().includes(q);
  });

  return (
    <div className="container-fluid py-4" style={{ color: 'var(--text-primary)' }}>
      {/* Sub Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.5px' }} className="d-flex align-items-center gap-2">
            Campus Ecosystem & Community
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Discussion boards, verified alumni networks, and referral marketplaces.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button 
            className={`btn ${activeSubTab === 'forum' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveSubTab('forum')}
          >
            Discussion Board
          </button>
          <button 
            className={`btn ${activeSubTab === 'alumni' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveSubTab('alumni')}
          >
            Alumni Directory
          </button>
          <button 
            className={`btn ${activeSubTab === 'referrals' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveSubTab('referrals')}
          >
            Referral Marketplace
          </button>
        </div>
      </div>

      {/* Forums Tab */}
      {activeSubTab === 'forum' && (
        <div className="forum-grid-container animate-fade-in">
          {/* Left Column: Categories List */}
          <div>
            <div className="glass-card p-4">
              <h3 className="h6 font-bold mb-3 d-flex align-items-center gap-2">
                <FolderOpen size={16} className="text-primary" /> Categories
              </h3>
              <div className="forum-categories-list">
                {['All', 'Placement', 'Interviews', 'Tech Prep', 'General'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setPostCategory(cat)}
                    className={`category-sidebar-item ${postCategory === cat ? 'active' : ''}`}
                  >
                    {getCategoryIcon(cat)}
                    <span>{cat} Discussions</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Posts List */}
          <div>
            <div className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="h5 font-bold mb-0">Community Discussions</h3>
                <button 
                  onClick={() => setShowPostModal(true)}
                  className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                >
                  <Plus size={16} /> New Discussion
                </button>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <span className="spinner"></span>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-5 text-muted d-flex flex-column align-items-center justify-content-center">
                  <div className="mb-3 p-4 rounded-circle bg-primary-glow text-primary" style={{ display: 'inline-flex' }}>
                    <MessagesSquare size={36} />
                  </div>
                  <h4 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>No discussions here yet</h4>
                  <p className="text-xs text-muted mb-4" style={{ maxWidth: '300px' }}>
                    Be the first to start a conversation! Ask a question or share insights with your campus community.
                  </p>
                  <button 
                    onClick={() => setShowPostModal(true)}
                    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                  >
                    <Plus size={16} /> Start a Discussion
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {filteredPosts.map(post => (
                    <div key={post._id} className="forum-post-card mb-4">
                      <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                        <div className="d-flex gap-3 align-items-center">
                          <div className="avatar-circle bg-primary-glow font-bold text-primary" style={{ width: 38, height: 38, marginRight: '0.75rem' }}>
                            {post.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-sm d-flex align-items-center gap-2">
                              {post.user?.name || 'Anonymous'} 
                              {post.user?.role && getRoleBadge(post.user.role)}
                            </span>
                            <span className="text-muted text-xs d-block">Posted in {post.category} • {new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className="badge bg-secondary-glow text-secondary text-xs">{post.category}</span>
                      </div>

                      <h4 className="font-bold h6 mb-2">{post.title}</h4>
                      <p className="text-muted text-sm mb-4" style={{ lineHeight: 1.6 }}>{post.content}</p>

                      {/* Upvotes / Comments count footer */}
                      <div className="d-flex justify-content-between align-items-center border-top border-color pt-3 flex-wrap gap-2">
                        <div className="d-flex gap-2">
                          <button 
                            onClick={() => handleUpvote(post._id)}
                            className={`btn btn-xs d-flex align-items-center gap-1 ${post.upvotes.includes(user?._id) ? 'btn-primary' : 'btn-outline'}`}
                          >
                            <ThumbsUp size={12} /> Upvote ({post.upvotes.length})
                          </button>
                        </div>
                        <div className="text-xs text-muted">
                          {post.comments.length} Comments
                        </div>
                      </div>

                      {/* Comments section */}
                      <div className="comments-section mt-4 pt-3 border-top border-color">
                        {post.comments.map((comment, cIdx) => (
                          <div key={cIdx} className="d-flex gap-3 align-items-start mb-3">
                            <div className="avatar-circle bg-base text-xs font-semibold text-secondary" style={{ width: 28, height: 28, minWidth: 28 }}>
                              {comment.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-grow-1 p-2 rounded bg-base text-xs">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="font-semibold text-primary">
                                  {comment.user?.name || 'Anonymous'}
                                  {comment.user?.role && getRoleBadge(comment.user.role)}
                                </span>
                                <span className="text-muted text-xxs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="mb-0 text-muted">{comment.text}</p>
                            </div>
                          </div>
                        ))}

                        {/* Comment Input */}
                        <div className="mt-3">
                          <div className="forum-comment-wrapper">
                            <input 
                              type="text"
                              placeholder="Write a comment..."
                              className="forum-comment-input"
                              value={commentInputs[post._id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                            />
                            <button 
                              onClick={() => handleAddComment(post._id)}
                              className="forum-comment-send-btn"
                            >
                              <Send size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alumni Tab */}
      {activeSubTab === 'alumni' && (
        <div className="glass-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <h3 className="h5 font-bold mb-0">Verified Alumni Registry</h3>
            <div className="search-bar d-flex gap-2" style={{ maxWidth: '400px', width: '100%' }}>
              <input 
                type="text" 
                placeholder="Search alumni by company or role..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <span className="spinner"></span>
            </div>
          ) : filteredAlumni.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Users size={32} className="mb-2" />
              <p className="mb-0">No matching alumni profiles found.</p>
            </div>
          ) : (
            <div className="alumni-grid">
              {filteredAlumni.map((al, idx) => (
                <div key={idx} className="alumni-card">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-circle bg-primary-glow font-bold text-primary" style={{ width: 44, height: 44, fontSize: '1rem', marginRight: '0.75rem' }}>
                          {al.name.charAt(0)}
                        </div>
                        <div>
                          <span className="alumni-name">{al.name}</span>
                          <span className="alumni-batch">Class of {al.batch}</span>
                        </div>
                      </div>
                      {al.linkedin && (
                        <a href={al.linkedin} target="_blank" rel="noopener noreferrer" className="p-1 rounded bg-base text-muted hover:text-primary" style={{ transition: 'color 0.2s', display: 'inline-flex' }}>
                          <Linkedin size={16} />
                        </a>
                      )}
                    </div>
                    <div className="mb-3">
                      <span className="badge bg-primary-glow text-primary text-xs font-semibold" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                        {al.role} at {al.company}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => openReferralRequest(al)}
                    className="btn btn-xs btn-primary d-flex align-items-center justify-content-center gap-1 w-full"
                    style={{ marginTop: '1rem' }}
                  >
                    <Briefcase size={12} /> Request Referral
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Referral Marketplace Tab */}
      {activeSubTab === 'referrals' && (
        <div className="glass-card p-4">
          <h3 className="h5 font-bold mb-4">Referral Requests Marketplace</h3>
          
          {loading ? (
            <div className="text-center py-5">
              <span className="spinner"></span>
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FileText size={32} className="mb-2" />
              <p className="mb-0">No referral requests found in database.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="premium-table" style={{ minWidth: '700px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <th>Student</th>
                    <th>Target Job</th>
                    <th>Target Company</th>
                    <th>Requested Alumni</th>
                    <th>Status</th>
                    {user?.role !== 'student' && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {referrals.map(ref => (
                    <tr key={ref._id}>
                      <td className="font-semibold">{ref.student.name}</td>
                      <td>{ref.job?.title || 'Software Engineer'}</td>
                      <td>{ref.alumniCompany}</td>
                      <td>{ref.alumniName}</td>
                      <td>
                        <span className={`badge text-xs font-semibold ${
                          ref.status === 'Approved' ? 'bg-success-glow text-success' : 
                          ref.status === 'Rejected' ? 'bg-danger-glow text-danger' : 
                          'bg-warning-glow text-warning'
                        }`}>
                          {ref.status}
                        </span>
                      </td>
                      {user?.role !== 'student' && (
                        <td>
                          <div className="d-flex gap-1">
                            <button 
                              onClick={() => handleUpdateReferralStatus(ref._id, 'Approved')}
                              className="btn btn-xxs btn-approve"
                              disabled={ref.status !== 'Pending'}
                            >
                              <Check size={12} /> Approve
                            </button>
                            <button 
                              onClick={() => handleUpdateReferralStatus(ref._id, 'Rejected')}
                              className="btn btn-xxs btn-reject"
                              disabled={ref.status !== 'Pending'}
                            >
                              <CloseIcon size={12} /> Reject
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Discussion Create Modal */}
      {showPostModal && (
        <div className="modal-overlay-custom" onClick={() => setShowPostModal(false)}>
          <div className="glass-card modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header-custom p-4 border-bottom border-color">
              <h3 className="h5 font-bold mb-0">Create Discussion Thread</h3>
            </div>
            <form onSubmit={handleCreatePost} className="modal-body-custom p-4 d-flex flex-column gap-3">
              <div className="form-group">
                <label className="form-label">Discussion Title *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Google interview format updates"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-input"
                  value={newPost.category}
                  onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                >
                  <option value="General">General</option>
                  <option value="Placement">Placement Drives</option>
                  <option value="Interviews">Interviews Experiences</option>
                  <option value="Tech Prep">Technical Prep</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Content Description *</label>
                <textarea 
                  className="form-input" 
                  rows="5" 
                  placeholder="Ask questions or share details with fellow campus students..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top border-color">
                <button type="button" onClick={() => setShowPostModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Post Thread</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Referral Request Modal */}
      {showReferralModal && selectedAlumni && (
        <div className="modal-overlay-custom" onClick={() => setShowReferralModal(false)}>
          <div className="glass-card modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header-custom p-4 border-bottom border-color">
              <h3 className="h5 font-bold mb-0">Request Referral</h3>
              <p className="text-muted text-xs mb-0">Alumni: {selectedAlumni.name} at {selectedAlumni.company}</p>
            </div>
            <form onSubmit={handleRequestReferral} className="modal-body-custom p-4 d-flex flex-column gap-3">
              <div className="form-group">
                <label className="form-label">Select Target Job Opportunity *</label>
                {referralJobs.length === 0 ? (
                  <div className="text-xs text-warning p-2 rounded bg-warning-glow d-flex align-items-center gap-1">
                    <AlertCircle size={14} /> No active jobs available.
                  </div>
                ) : (
                  <select 
                    value={selectedJobId} 
                    onChange={(e) => setSelectedJobId(e.target.value)} 
                    className="form-input"
                  >
                    {referralJobs.map(job => (
                      <option key={job._id} value={job._id}>{job.title} - {job.company}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Personal Note *</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  placeholder="Hello, I am a final year student matching the SDE job qualifications. Please review my profile and support a referral request..."
                  value={referralNote}
                  onChange={(e) => setReferralNote(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top border-color">
                <button type="button" onClick={() => setShowReferralModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={referralJobs.length === 0}>Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumAndCommunity;
