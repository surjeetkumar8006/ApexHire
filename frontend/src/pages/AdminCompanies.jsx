import React, { useState, useEffect } from 'react';
import { Building, MapPin, Globe, Plus, Search, Mail, Trash2, X, Loader, ExternalLink, Briefcase, Edit } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const AdminCompanies = () => {
  const { authHeader } = useAuth();
  const { addToast } = useNotification();
  
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Partner Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    location: '',
    website: '',
    contact: ''
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState({
    _id: '',
    name: '',
    industry: '',
    location: '',
    website: '',
    contact: ''
  });

  // Job Modal State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [postingJob, setPostingJob] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    type: 'Full-time',
    location: '',
    salary: '',
    requirements: '',
    description: ''
  });

  // Fetch companies from backend
  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${API_BASE}/companies`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      } else {
        const data = await res.json();
        addToast(data.message || 'Failed to fetch companies', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading employer partners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.industry || !newCompany.location || !newCompany.contact) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify(newCompany)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        addToast('Partner added successfully!', 'success');
        setIsModalOpen(false);
        setNewCompany({
          name: '',
          industry: '',
          location: '',
          website: '',
          contact: ''
        });
        fetchCompanies(); // Reload list
      } else {
        throw new Error(data.message || 'Failed to add partner');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditModal = (company) => {
    setEditingCompany({
      _id: company._id,
      name: company.name,
      industry: company.industry,
      location: company.location,
      website: company.website || '',
      contact: company.contact
    });
    setIsEditModalOpen(true);
  };

  const handleEditPartner = async (e) => {
    e.preventDefault();
    if (!editingCompany.name || !editingCompany.industry || !editingCompany.location || !editingCompany.contact) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/companies/${editingCompany._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify(editingCompany)
      });

      const data = await res.json();

      if (res.ok) {
        addToast('Partner updated successfully!', 'success');
        setIsEditModalOpen(false);
        fetchCompanies(); // Reload list
      } else {
        throw new Error(data.message || 'Failed to update partner');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm('Are you sure you want to remove this employer partner?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/companies/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });

      if (res.ok) {
        addToast('Partner removed successfully', 'success');
        setCompanies((prev) => prev.filter((c) => c._id !== id));
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to remove partner');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleOpenJobModal = (company) => {
    setSelectedCompany(company);
    setNewJob({
      title: '',
      type: 'Full-time',
      location: company.location,
      salary: '',
      requirements: '',
      description: ''
    });
    setIsJobModalOpen(true);
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.location || !newJob.description || !newJob.requirements) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    setPostingJob(true);
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          ...newJob,
          company: selectedCompany.name
        })
      });

      const data = await res.json();

      if (res.ok) {
        addToast(`Job posted successfully for ${selectedCompany.name}!`, 'success');
        setIsJobModalOpen(false);
        fetchCompanies(); // Refresh company listing to update activeJobs count!
      } else {
        throw new Error(data.message || 'Failed to post job');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setPostingJob(false);
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container} className="animate-fade-in">
      <style>{`
        .modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        @media (max-width: 600px) {
          .modal-form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
        .modal-overlay-custom {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(5, 8, 18, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          padding: 1rem;
          box-sizing: border-box;
          animation: modalFadeIn 0.25s ease-out;
        }
        .modal-content-custom {
          background: var(--bg-surface);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          width: 100%;
          max-width: 480px;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          position: relative;
          box-sizing: border-box;
          overflow: hidden;
          animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .modal-header-custom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding: 1.25rem 1.5rem;
          flex-shrink: 0;
          background: linear-gradient(135deg, var(--primary-glow), transparent);
        }
        .modal-body-custom {
          padding: 1.5rem;
          overflow-y: auto;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .modal-footer-custom {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-top: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        .close-btn {
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .close-btn:hover {
          color: var(--text-primary);
          background: var(--bg-surface-elevated);
        }
        
        /* Custom Input & Select Styling inside Modal */
        .modal-content-custom .form-input,
        .modal-content-custom .form-select {
          background: var(--input-bg) !important;
          border: 1px solid var(--border-color) !important;
          color: var(--text-primary) !important;
          border-radius: var(--border-radius-sm) !important;
          padding: 0.75rem 1rem !important;
          width: 100% !important;
          box-sizing: border-box !important;
          transition: all 0.2s ease !important;
        }
        .modal-content-custom .form-input:focus,
        .modal-content-custom .form-select:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px var(--primary-glow) !important;
          outline: none !important;
        }
        
        /* High Contrast Labels for Dark and Light Themes */
        .modal-content-custom label {
          font-size: 0.85rem !important;
          font-weight: 600 !important;
          color: #9ca3af !important; /* Default light gray for Dark theme */
          margin-bottom: 0.25rem !important;
          display: block !important;
        }
        body.light-theme .modal-content-custom label {
          color: #4b5563 !important; /* Dark slate for Light theme */
        }

        .delete-btn-custom {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .delete-btn-custom:hover {
          color: var(--danger);
          background-color: var(--danger-glow);
          transform: scale(1.08);
        }
        .edit-btn-custom {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .edit-btn-custom:hover {
          color: var(--primary);
          background-color: var(--primary-glow);
          transform: scale(1.08);
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Employer Partners</h1>
          <p style={styles.subtitle}>Manage recruiting companies, track active postings, and monitor hiring history.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Add Partner
        </button>
      </header>

      <div style={styles.controls}>
        <div style={styles.searchWrap}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search companies by name or industry..." 
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={styles.loaderWrap}>
          <Loader size={36} className="animate-spin" color="var(--primary)" />
          <p style={{ color: 'var(--text-secondary)' }}>Loading partners...</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="glass-card" style={styles.emptyWrap}>
          <Building size={48} color="var(--text-muted)" />
          <h3 style={{ margin: '1rem 0 0.5rem 0', color: 'var(--text-primary)' }}>No Employer Partners Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {searchTerm ? 'Try adjusting your search criteria.' : 'Click "Add Partner" to register your first partner.'}
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredCompanies.map(company => (
            <div key={company._id} className="glass-card" style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={{...styles.logoPlaceholder, background: `linear-gradient(135deg, ${company.logoColor || '#4285F4'}, var(--primary))`}}>
                  {company.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.titleRow}>
                    <h3 style={styles.companyName}>{company.name}</h3>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button 
                        className="edit-btn-custom"
                        onClick={() => handleOpenEditModal(company)}
                        title="Edit Partner"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="delete-btn-custom"
                        onClick={() => handleDeleteCompany(company._id)}
                        title="Remove Partner"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <span style={styles.industryBadge}>{company.industry}</span>
                </div>
              </div>

              <div style={styles.details}>
                <div style={styles.detailRow}>
                  <MapPin size={14} color="var(--text-muted)" />
                  <span>{company.location}</span>
                </div>
                {company.website && (
                  <div style={styles.detailRow}>
                    <Globe size={14} color="var(--text-muted)" />
                    <a 
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={styles.link}
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                <div style={styles.detailRow}>
                  <Mail size={14} color="var(--text-muted)" />
                  <span>{company.contact}</span>
                </div>
              </div>

              <div style={styles.statsRow}>
                <div style={styles.statBox}>
                  <span style={styles.statLabel}>Active Jobs</span>
                  <span style={styles.statValue}>{company.activeJobs}</span>
                </div>
                <div style={styles.statBox}>
                  <span style={styles.statLabel}>Total Hired</span>
                  <span style={styles.statValue}>{company.totalHires}</span>
                </div>
              </div>
              
              <div style={styles.cardActions}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => handleOpenJobModal(company)}
                >
                  <Plus size={14} /> Post Job
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    if (company.website) {
                      window.open(company.website.startsWith('http') ? company.website : `https://${company.website}`, '_blank');
                    } else {
                      addToast('No website registered for this partner', 'info');
                    }
                  }}
                >
                  Website <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Responsive Glassmorphic Add Partner Modal */}
      {isModalOpen && (
        <div className="modal-overlay-custom" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleAddPartner} style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '80vh' }}>
              <div className="modal-header-custom">
                <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>Add Employer Partner</h2>
                <button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>
                  <X size={15} />
                </button>
              </div>
              
              <div className="modal-body-custom">
                <div style={styles.formGroup}>
                  <label>Company Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Google" 
                    required 
                    value={newCompany.name} 
                    onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="modal-form-grid">
                  <div style={styles.formGroup}>
                    <label>Industry *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Technology" 
                      required 
                      value={newCompany.industry} 
                      onChange={(e) => setNewCompany({...newCompany, industry: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label>Location *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Bangalore, India" 
                      required 
                      value={newCompany.location} 
                      onChange={(e) => setNewCompany({...newCompany, location: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="modal-form-grid">
                  <div style={styles.formGroup}>
                    <label>Website URL</label>
                    <input 
                      type="text" 
                      placeholder="e.g. careers.google.com" 
                      value={newCompany.website} 
                      onChange={(e) => setNewCompany({...newCompany, website: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label>Contact Email *</label>
                    <input 
                      type="email" 
                      placeholder="e.g. recruiting@google.com" 
                      required 
                      value={newCompany.contact} 
                      onChange={(e) => setNewCompany({...newCompany, contact: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Adding...' : 'Add Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Responsive Glassmorphic Edit Partner Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay-custom" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleEditPartner} style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '80vh' }}>
              <div className="modal-header-custom">
                <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>Edit Employer Partner</h2>
                <button type="button" className="close-btn" onClick={() => setIsEditModalOpen(false)}>
                  <X size={15} />
                </button>
              </div>
              
              <div className="modal-body-custom">
                <div style={styles.formGroup}>
                  <label>Company Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Google" 
                    required 
                    value={editingCompany.name} 
                    onChange={(e) => setEditingCompany({...editingCompany, name: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="modal-form-grid">
                  <div style={styles.formGroup}>
                    <label>Industry *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Technology" 
                      required 
                      value={editingCompany.industry} 
                      onChange={(e) => setEditingCompany({...editingCompany, industry: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label>Location *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Bangalore, India" 
                      required 
                      value={editingCompany.location} 
                      onChange={(e) => setEditingCompany({...editingCompany, location: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="modal-form-grid">
                  <div style={styles.formGroup}>
                    <label>Website URL</label>
                    <input 
                      type="text" 
                      placeholder="e.g. careers.google.com" 
                      value={editingCompany.website} 
                      onChange={(e) => setEditingCompany({...editingCompany, website: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label>Contact Email *</label>
                    <input 
                      type="email" 
                      placeholder="e.g. recruiting@google.com" 
                      required 
                      value={editingCompany.contact} 
                      onChange={(e) => setEditingCompany({...editingCompany, contact: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Responsive Glassmorphic Post Job Modal */}
      {isJobModalOpen && selectedCompany && (
        <div className="modal-overlay-custom" onClick={() => setIsJobModalOpen(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '80vh' }}>
              <div className="modal-header-custom">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Briefcase size={18} color="var(--primary)" />
                  <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                    Post Job for {selectedCompany.name}
                  </h2>
                </div>
                <button type="button" className="close-btn" onClick={() => setIsJobModalOpen(false)}>
                  <X size={15} />
                </button>
              </div>

              <div className="modal-body-custom">
                <div className="modal-form-grid">
                  <div style={styles.formGroup}>
                    <label>Employer Partner (Read-only)</label>
                    <input 
                      type="text" 
                      readOnly
                      value={selectedCompany.name}
                      className="form-input"
                      style={{ background: 'var(--bg-base)', opacity: 0.7, cursor: 'not-allowed' }}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>Industry (Read-only)</label>
                    <input 
                      type="text" 
                      readOnly
                      value={selectedCompany.industry}
                      className="form-input"
                      style={{ background: 'var(--bg-base)', opacity: 0.7, cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label>Job Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior Frontend Engineer" 
                    required 
                    value={newJob.title} 
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="modal-form-grid">
                  <div style={styles.formGroup}>
                    <label>Job Type *</label>
                    <select 
                      value={newJob.type} 
                      onChange={(e) => setNewJob({...newJob, type: e.target.value})}
                      className="form-select"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label>Job Location *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Bangalore, India (Hybrid)" 
                      required 
                      value={newJob.location} 
                      onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="modal-form-grid">
                  <div style={styles.formGroup}>
                    <label>Salary Range</label>
                    <input 
                      type="text" 
                      placeholder="e.g. ₹12L - ₹15L PA or ₹50k/Mo" 
                      value={newJob.salary} 
                      onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label>Key Requirements *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. React.js, Node.js, Express (comma-separated)" 
                      required 
                      value={newJob.requirements} 
                      onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label>Job Description *</label>
                  <textarea 
                    placeholder="Describe the job role, responsibilities, and benefits..." 
                    required 
                    rows={4}
                    value={newJob.description} 
                    onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                    className="form-input"
                    style={{ resize: 'vertical', minHeight: '100px' }}
                  />
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn btn-outline" onClick={() => setIsJobModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={postingJob}>
                  {postingJob ? 'Posting...' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
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
  searchWrap: { position: 'relative', flex: 1, maxWidth: '400px' },
  searchIcon: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' },
  searchInput: { width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
  card: { display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '1rem' },
  logoPlaceholder: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', flexShrink: 0 },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flex: 1 },
  companyName: { fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 },
  industryBadge: { display: 'inline-block', marginTop: '0.3rem', fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-secondary)' },
  details: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  detailRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' },
  link: { color: 'var(--primary)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  statsRow: { display: 'flex', gap: '1rem', background: 'var(--bg-base)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px' },
  statBox: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  statLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' },
  statValue: { fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' },
  cardActions: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  viewBtn: { width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '4px' },
  loaderWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '4rem 0' },
  emptyWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '4rem 2rem', textAlign: 'center' },
  
  // Modal styles
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '0.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    alignItems: 'flex-start',
  },
};

export default AdminCompanies;
