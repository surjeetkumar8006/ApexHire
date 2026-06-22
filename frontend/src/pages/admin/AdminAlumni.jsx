import React, { useState, useEffect } from 'react';
import { Building, Users, Search, Plus, Trash2, ShieldCheck, ShieldAlert, CheckCircle, X, ExternalLink, Link2, Mail, Briefcase, Award } from 'lucide-react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const AdminAlumni = () => {
  const { authHeader } = useAuth();
  const { addToast } = useNotification();

  const [alumni, setAlumni] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'referrals'

  // Alumni Directory Search/Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');
  
  // Referral Board Filter States
  const [refSearchTerm, setRefSearchTerm] = useState('');
  const [refStatusFilter, setRefStatusFilter] = useState('All');

  // Alumni Creation Form Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [batch, setBatch] = useState('Class of 2024');
  const [linkedin, setLinkedin] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  // Referral review notes modal
  const [selectedReferral, setSelectedReferral] = useState(null);

  const fetchData = async () => {
    try {
      const [alumniRes, referralsRes] = await Promise.all([
        fetch(`${API_BASE}/community/alumni`, { headers: authHeader() }),
        fetch(`${API_BASE}/community/referrals`, { headers: authHeader() })
      ]);

      if (alumniRes.ok && referralsRes.ok) {
        const alumniData = await alumniRes.json();
        const referralsData = await referralsRes.json();
        setAlumni(alumniData);
        setReferrals(referralsData);
      }
    } catch (err) {
      console.error('Failed to load alumni ecosystem data', err);
      addToast('Failed to fetch alumni directory details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAlumni = async (e) => {
    e.preventDefault();

    if (!name || !company || !role || !batch) {
      addToast('Please complete all required fields', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/community/alumni`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({ name, company, role, batch, linkedin, email })
      });

      if (res.ok) {
        addToast('Alumni profile added successfully!', 'success');
        setShowAddModal(false);
        setName('');
        setCompany('');
        setRole('');
        setLinkedin('');
        setEmail('');
        fetchData(); // Refresh directory
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Action failed');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlumni = async (id) => {
    if (!window.confirm('Are you sure you want to remove this alumni profile from the database?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/community/alumni/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });

      if (res.ok) {
        addToast('Alumni profile deleted successfully', 'success');
        setAlumni(prev => prev.filter(al => al._id !== id));
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Deletion failed');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdateReferralStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/community/referrals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        addToast(`Referral request status updated to ${newStatus}!`, 'success');
        setReferrals(prev => prev.map(ref => ref._id === id ? { ...ref, status: newStatus } : ref));
        setSelectedReferral(null);
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Update failed');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Filter Alumni list
  const filteredAlumni = alumni.filter(al => {
    const matchesSearch = 
      al.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      al.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      al.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      al.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBatch = batchFilter === 'All' || al.batch === batchFilter;
    return matchesSearch && matchesBatch;
  });

  // Filter Referrals
  const filteredReferrals = referrals.filter(ref => {
    const candidateName = ref.student?.name || '';
    const jobTitle = ref.job?.title || '';
    const jobCompany = ref.job?.company || '';
    const alumniName = ref.alumniName || '';
    const alumniCompany = ref.alumniCompany || '';

    const matchesSearch = 
      candidateName.toLowerCase().includes(refSearchTerm.toLowerCase()) ||
      jobTitle.toLowerCase().includes(refSearchTerm.toLowerCase()) ||
      jobCompany.toLowerCase().includes(refSearchTerm.toLowerCase()) ||
      alumniName.toLowerCase().includes(refSearchTerm.toLowerCase()) ||
      alumniCompany.toLowerCase().includes(refSearchTerm.toLowerCase());

    const matchesStatus = refStatusFilter === 'All' || ref.status === refStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Extract unique batches for filtering dropdown
  const batches = Array.from(new Set(alumni.map(al => al.batch))).sort();

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <Building size={40} className="animate-spin text-primary" />
        <p style={{ color: 'var(--text-secondary)' }}>Synchronizing alumni network logs...</p>
      </div>
    );
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Alumni & Referrals Board</h1>
          <p style={styles.subtitle}>Audit graduation batches, coordinate corporate alumni, and approve referral requests.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={styles.addBtn}>
          <Plus size={16} />
          <span>Add Alumni Member</span>
        </button>
      </header>

      {/* Navigation tabs */}
      <div style={styles.tabNav}>
        <button 
          onClick={() => setActiveTab('directory')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'directory' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'directory' ? 'var(--text-primary)' : 'var(--text-muted)'
          }}
        >
          <Users size={16} />
          <span>Alumni Directory ({alumni.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('referrals')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'referrals' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'referrals' ? 'var(--text-primary)' : 'var(--text-muted)'
          }}
        >
          <Award size={16} />
          <span>Referral Requests Board ({referrals.length})</span>
        </button>
      </div>

      {/* TAB DIRECTORY CONTENT */}
      {activeTab === 'directory' && (
        <div className="glass-card p-4" style={{ background: 'var(--bg-surface)' }}>
          {/* Filters */}
          <div style={styles.directoryHeader}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', width: '100%' }}>
              <div style={{ ...styles.searchContainer, flex: 2 }}>
                <Search size={16} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search alumni name, company, role..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="form-input form-input-compact"
                  style={{ paddingLeft: '2.5rem', width: '100%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
              <select
                value={batchFilter}
                onChange={e => setBatchFilter(e.target.value)}
                className="form-select form-select-compact"
                style={{ flex: 1, minWidth: '150px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px' }}
              >
                <option value="All">All Graduation Batches</option>
                {batches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="premium-table" style={{ width: '100%', minWidth: '700px', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)' }}>
                  <th style={{ textAlign: 'left' }}>Alumni Name</th>
                  <th style={{ textAlign: 'left' }}>Current Position</th>
                  <th style={{ textAlign: 'center' }}>Graduation Batch</th>
                  <th style={{ textAlign: 'left' }}>Social / Contact</th>
                  <th style={{ textAlign: 'center', width: '80px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlumni.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <Users size={36} className="mb-2" />
                      <p className="mb-0">No alumni records match your filter parameters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredAlumni.map((al) => (
                    <tr key={al._id} style={{ background: 'var(--bg-surface-elevated)' }}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--secondary-glow)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.75rem', flexShrink: 0 }}>
                            {al.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong className="text-primary">{al.name}</strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span className="font-semibold text-primary">{al.role}</span>
                          <span className="text-muted d-block text-xs" style={{ fontSize: '0.68rem' }}>at {al.company}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        {al.batch}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {al.email && (
                            <a href={`mailto:${al.email}`} style={styles.iconLink} title={al.email}>
                              <Mail size={14} />
                            </a>
                          )}
                          {al.linkedin && (
                            <a href={al.linkedin} target="_blank" rel="noopener noreferrer" style={styles.iconLink} title="LinkedIn Profile">
                              <Link2 size={14} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button onClick={() => handleDeleteAlumni(al._id)} style={styles.deleteBtn} title="Remove alumni">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB REFERRALS BOARD CONTENT */}
      {activeTab === 'referrals' && (
        <div className="glass-card p-4" style={{ background: 'var(--bg-surface)' }}>
          <div style={styles.directoryHeader}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', width: '100%' }}>
              <div style={{ ...styles.searchContainer, flex: 2 }}>
                <Search size={16} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search candidate name, target company, or alumni referrer..."
                  value={refSearchTerm}
                  onChange={e => setRefSearchTerm(e.target.value)}
                  className="form-input form-input-compact"
                  style={{ paddingLeft: '2.5rem', width: '100%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
              <select
                value={refStatusFilter}
                onChange={e => setRefStatusFilter(e.target.value)}
                className="form-select form-select-compact"
                style={{ flex: 1, minWidth: '150px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px' }}
              >
                <option value="All">All Request Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="premium-table" style={{ width: '100%', minWidth: '700px', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)' }}>
                  <th style={{ textAlign: 'left' }}>Candidate student</th>
                  <th style={{ textAlign: 'left' }}>Target Placement Job</th>
                  <th style={{ textAlign: 'left' }}>Target Alumni Referrer</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Status</th>
                  <th style={{ textAlign: 'center', width: '130px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReferrals.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <Award size={36} className="mb-2" />
                      <p className="mb-0">No active student referral requests logged.</p>
                    </td>
                  </tr>
                ) : (
                  filteredReferrals.map((ref) => (
                    <tr key={ref._id} style={{ background: 'var(--bg-surface-elevated)' }}>
                      <td>
                        <div>
                          <strong className="text-primary" style={{ display: 'block' }}>{ref.student?.name || 'Surjeet Kumar'}</strong>
                          <span className="text-muted" style={{ fontSize: '0.68rem' }}>{ref.student?.email || 'student@gmail.com'}</span>
                        </div>
                      </td>
                      <td>
                        {ref.job ? (
                          <div>
                            <span className="font-semibold text-primary">{ref.job.title}</span>
                            <span className="text-muted d-block text-xs" style={{ fontSize: '0.68rem' }}>at {ref.job.company}</span>
                          </div>
                        ) : (
                          <span className="text-muted italic">General Position</span>
                        )}
                      </td>
                      <td>
                        <div>
                          <strong className="text-secondary" style={{ display: 'block' }}>{ref.alumniName}</strong>
                          <span className="text-muted text-xs" style={{ fontSize: '0.68rem' }}>{ref.alumniCompany}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span 
                          className="badge" 
                          style={{
                            fontSize: '0.72rem',
                            backgroundColor: ref.status === 'Approved' ? 'rgba(16,185,129,0.1)' : ref.status === 'Rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                            border: `1px solid ${ref.status === 'Approved' ? 'var(--success)' : ref.status === 'Rejected' ? 'var(--danger)' : 'var(--warning)'}`,
                            color: ref.status === 'Approved' ? 'var(--success)' : ref.status === 'Rejected' ? 'var(--danger)' : 'var(--warning)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          {ref.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div className="d-flex gap-1 justify-content-center">
                          {ref.status === 'Pending' ? (
                            <>
                              <button 
                                onClick={() => handleUpdateReferralStatus(ref._id, 'Approved')}
                                className="btn btn-xs btn-primary"
                                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleUpdateReferralStatus(ref._id, 'Rejected')}
                                className="btn btn-xs btn-outline"
                                style={{ fontSize: '0.72rem', padding: '3px 8px', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => setSelectedReferral(ref)}
                              className="btn btn-xs btn-outline"
                              style={{ fontSize: '0.72rem', padding: '3px 8px', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                            >
                              View Notes
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD ALUMNI MEMBER MODAL */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className="animate-fade-in" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeaderBlock}>
              <h3 style={{ color: 'var(--text-primary)', margin: 0, fontWeight: '700', fontSize: '1.1rem' }}>Add Corporate Alumni Member</h3>
              <button onClick={() => setShowAddModal(false)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddAlumni} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label font-semibold">Alumni Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="form-input mt-1"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label font-semibold">Graduation Batch *</label>
                  <select
                    value={batch}
                    onChange={e => setBatch(e.target.value)}
                    className="form-select form-select-compact mt-1"
                  >
                    <option value="Class of 2021">Class of 2021</option>
                    <option value="Class of 2022">Class of 2022</option>
                    <option value="Class of 2023">Class of 2023</option>
                    <option value="Class of 2024">Class of 2024</option>
                    <option value="Class of 2025">Class of 2025</option>
                    <option value="Class of 2026">Class of 2026</option>
                  </select>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label font-semibold">Current Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Microsoft"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="form-input mt-1"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label font-semibold">Corporate Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior SDE"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="form-input mt-1"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label font-semibold">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@microsoft.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="form-input mt-1"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label font-semibold">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={linkedin}
                    onChange={e => setLinkedin(e.target.value)}
                    className="form-input mt-1"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div className="d-flex gap-2 justify-content-end mt-4 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }} disabled={saving}>
                  {saving ? 'Adding...' : 'Add Alumni'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REFERRAL DETAILS VIEW MODAL */}
      {selectedReferral && (
        <div style={styles.modalOverlay} onClick={() => setSelectedReferral(null)}>
          <div className="animate-fade-in" style={{ ...styles.modalContent, maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeaderBlock}>
              <h3 style={{ color: 'var(--text-primary)', margin: 0, fontWeight: '700', fontSize: '1.05rem' }}>Referral Request Notes</h3>
              <button onClick={() => setSelectedReferral(null)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="p-3 rounded border border-color" style={{ background: 'var(--bg-surface-elevated)' }}>
                <span className="text-xs text-muted font-bold d-block uppercase mb-1">Student Note</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.45', margin: 0 }}>
                  {selectedReferral.note || 'No notes provided by candidate.'}
                </p>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-2">
                <span className="text-xs text-muted">
                  Referral status is currently: <strong>{selectedReferral.status}</strong>
                </span>
                <button onClick={() => setSelectedReferral(null)} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1.25rem' }}>
                  Close Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 },
  subtitle: { fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem', margin: 0 },
  addBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', padding: '0.6rem 1rem', height: 'fit-content' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '8rem 0' },
  tabNav: { display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '1rem', width: '100%', overflowX: 'auto', scrollbarWidth: 'none' },
  tabBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0.5rem', fontSize: '0.85rem', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', transition: 'all var(--transition-fast)' },
  directoryHeader: { paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' },
  searchContainer: { position: 'relative' },
  searchIcon: { position: 'absolute', left: '0.9rem', top: '12px', color: 'var(--text-muted)' },
  deleteBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s', '&:hover': { color: 'var(--danger)' } },
  iconLink: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', transition: 'all 0.2s', textDecoration: 'none', '&:hover': { color: 'var(--primary)', borderColor: 'var(--primary-glow)', background: 'var(--bg-surface-elevated)' } },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5, 8, 18, 0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' },
  modalContent: { width: '100%', maxWidth: '600px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' },
  modalHeaderBlock: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--primary-glow) 0%, var(--secondary-glow) 100%)', borderBottom: '1px solid var(--border-color)', padding: '1.25rem 1.5rem', position: 'relative' },
  modalCloseBtn: { background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: '30px', height: '30px' }
};

export default AdminAlumni;
