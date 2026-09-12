import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Shield, Smartphone, Globe, CheckCircle, Users, Trash, Pencil, Plus, X, Loader, Camera } from 'lucide-react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { compressImage } from '../../utils/imageCompressor';

const SettingsPage = () => {
  const { user, updateUser, authHeader } = useAuth();
  const { addToast } = useNotification();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: user?.twoFactorEnabled || false,
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    profileVisibility: 'verified'
  });

  // Coordinator CRUD states
  const [coordinators, setCoordinators] = useState([]);
  const [coordLoading, setCoordLoading] = useState(false);
  const [showCoordModal, setShowCoordModal] = useState(false);

  // Mobile 2FA OTP States
  const [mobilePhone, setMobilePhone] = useState(user?.phone || '');
  const [mobileOtpInput, setMobileOtpInput] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSentMsg, setOtpSentMsg] = useState('');

  const handleSendMobile2FAOtp = async () => {
    if (!mobilePhone || mobilePhone.trim().length < 8) {
      return addToast('Please enter a valid mobile phone number', 'warning');
    }

    setSendingOtp(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-mobile-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({ phone: mobilePhone.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send Mobile OTP');

      setOtpSentMsg(data.message);
      if (data.otp) setMobileOtpInput(data.otp);
      addToast(data.message, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyMobile2FAOtp = async (enable = true) => {
    if (enable && !mobileOtpInput) {
      return addToast('Please enter the 6-digit Mobile OTP code', 'warning');
    }

    setVerifyingOtp(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-mobile-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({ otp: mobileOtpInput.trim(), enable })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to verify Mobile OTP');

      updateUser(data.user);
      setFormData(prev => ({ ...prev, twoFactorEnabled: data.twoFactorEnabled }));
      setOtpSentMsg('');
      setMobileOtpInput('');
      addToast(data.message, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };
  const [coordFormData, setCoordFormData] = useState({ name: '', email: '', password: '' });
  const [coordEditId, setCoordEditId] = useState(null);

  // Platform Config states
  const [platformConfig, setPlatformConfig] = useState({
    driveName: 'ApexHire Drive 2026',
    academicYear: '2026-27',
    minCgpa: '6.5',
    allowedBranches: 'CSE, ECE, EEE, ME',
    coordinatorEmail: 'coordinator@accio.com',
    autoVerify: false
  });
  const [platformLoading, setPlatformLoading] = useState(false);

  // Fetch initial profile settings
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        twoFactorEnabled: user.twoFactorEnabled || false
      }));
    }
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/profile`, { headers: authHeader() });
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({
            ...prev,
            emailNotifications: data.notificationPreferences?.email ?? true,
            pushNotifications: data.notificationPreferences?.push ?? false,
            weeklyDigest: data.notificationPreferences?.weeklyDigest ?? true,
            profileVisibility: data.privacy?.profileVisibility || 'verified'
          }));
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };
    fetchSettings();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (activeTab === 'security' && formData.newPassword !== formData.confirmPassword) {
      return addToast('New passwords do not match', 'error');
    }

    setLoading(true);
    try {
      const payload = {};
      if (activeTab === 'profile') {
        payload.name = formData.name;
        payload.email = formData.email;
        payload.phone = formData.phone;
        payload.avatar = formData.avatar;
      } else if (activeTab === 'security') {
        if (formData.newPassword) payload.password = formData.newPassword;
        payload.twoFactorEnabled = formData.twoFactorEnabled;
      } else if (activeTab === 'notifications') {
        payload.notificationPreferences = {
          email: formData.emailNotifications,
          push: formData.pushNotifications,
          weeklyDigest: formData.weeklyDigest
        };
      } else if (activeTab === 'privacy') {
        payload.privacy = { profileVisibility: formData.profileVisibility };
      }

      const res = await fetch(`${API_BASE}/profile/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update settings');

      updateUser(data.user);
      addToast('Settings saved successfully', 'success');
      
      // Clear password fields
      if (activeTab === 'security') {
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      }
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoordinators = async () => {
    setCoordLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/coordinators`, {
        headers: authHeader()
      });
      if (res.ok) {
        const data = await res.json();
        setCoordinators(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCoordLoading(false);
    }
  };

  const fetchPlatformConfig = async () => {
    setPlatformLoading(true);
    try {
      const res = await fetch(`${API_BASE}/platform-config`, {
        headers: authHeader()
      });
      if (res.ok) {
        const data = await res.json();
        setPlatformConfig({
          driveName: data.driveName || 'ApexHire Drive 2026',
          academicYear: data.academicYear || '2026-27',
          minCgpa: String(data.minCgpa) || '6.5',
          allowedBranches: data.allowedBranches || 'CSE, ECE, EEE, ME',
          coordinatorEmail: data.coordinatorEmail || 'coordinator@accio.com',
          autoVerify: data.autoVerify || false
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPlatformLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      if (activeTab === 'coordinators') {
        fetchCoordinators();
      } else if (activeTab === 'platform') {
        fetchPlatformConfig();
      }
    }
  }, [user, activeTab]);

  const handleCoordSubmit = async (e) => {
    e.preventDefault();
    if (!coordFormData.name || !coordFormData.email || (!coordEditId && !coordFormData.password)) {
      addToast('Please fill all required fields', 'warning');
      return;
    }

    try {
      const url = coordEditId 
        ? `${API_BASE}/auth/coordinators/${coordEditId}` 
        : `${API_BASE}/auth/coordinators`;
      const method = coordEditId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify(coordFormData)
      });

      const data = await res.json();
      if (res.ok) {
        addToast(coordEditId ? 'Coordinator updated successfully!' : 'Coordinator created successfully!', 'success');
        setShowCoordModal(false);
        setCoordFormData({ name: '', email: '', password: '' });
        setCoordEditId(null);
        fetchCoordinators();
      } else {
        addToast(data.message || 'Action failed', 'error');
      }
    } catch (err) {
      addToast('Error saving coordinator details', 'error');
    }
  };

  const handleCoordDelete = async (id) => {
    if (id === user._id) {
      addToast('You cannot delete your own admin account!', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to remove this placement coordinator?')) return;

    try {
      const res = await fetch(`${API_BASE}/auth/coordinators/${id}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Coordinator deleted successfully', 'success');
        fetchCoordinators();
      } else {
        addToast(data.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      addToast('Error deleting coordinator', 'error');
    }
  };

  const handleOpenAddCoord = () => {
    setCoordEditId(null);
    setCoordFormData({ name: '', email: '', password: '' });
    setShowCoordModal(true);
  };

  const handleOpenEditCoord = (coord) => {
    setCoordEditId(coord._id);
    setCoordFormData({ name: coord.name, email: coord.email, password: '' });
    setShowCoordModal(true);
  };

  const handlePlatformSave = async (e) => {
    e.preventDefault();
    setPlatformLoading(true);
    try {
      const res = await fetch(`${API_BASE}/platform-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          ...platformConfig,
          minCgpa: Number(platformConfig.minCgpa)
        })
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Platform configurations updated successfully!', 'success');
      } else {
        addToast(data.message || 'Failed to update configurations', 'error');
      }
    } catch (err) {
      addToast('Error saving platform configurations', 'error');
    } finally {
      setPlatformLoading(false);
    }
  };

  const baseTabs = [
    { id: 'profile', label: 'Profile Information', icon: <User size={18} /> },
    { id: 'security', label: 'Password & Security', icon: <Lock size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'privacy', label: 'Privacy & Data', icon: <Shield size={18} /> }
  ];

  const tabs = user?.role === 'admin'
    ? [
        ...baseTabs,
        { id: 'coordinators', label: 'Placement Coordinators', icon: <Users size={18} /> },
        { id: 'platform', label: 'Platform Config', icon: <Globe size={18} /> }
      ]
    : baseTabs;

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Platform Settings</h1>
          <p style={styles.subtitle}>Manage your account preferences, security, and notification settings.</p>
        </div>
      </header>

      <div style={styles.layout}>
        {/* Settings Sidebar */}
        <div style={styles.sidebar}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`settings-tab-btn ${isActive ? 'active' : ''}`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="glass-card" style={styles.contentArea}>
          
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <h2 style={styles.sectionTitle}>Profile Information</h2>
              <form onSubmit={handleSave} style={styles.form}>
                <div style={styles.avatarSection}>
                  <div 
                    style={styles.avatarPreview} 
                    onClick={() => document.getElementById('avatar-upload').click()}
                    title="Click to upload profile picture"
                  >
                    {formData.avatar ? (
                      <img 
                        src={formData.avatar} 
                        alt="Avatar" 
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.parentNode.querySelector('.avatar-fallback');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span 
                      className="avatar-fallback"
                      style={{ 
                        display: formData.avatar ? 'none' : 'flex', 
                        width: '100%', 
                        height: '100%', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '2.4rem', 
                        fontWeight: '800', 
                        color: '#ffffff',
                        letterSpacing: '1px',
                        textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)'
                      }}
                    >
                      {(formData.name || user?.name || 'U').charAt(0).toUpperCase()}
                    </span>

                    {/* Camera Upload Badge Overlay */}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('avatar-upload').click();
                      }}
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        border: '2px solid #080c16',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
                        zIndex: 5
                      }}
                      title="Upload Profile Picture"
                    >
                      <Camera size={14} color="#0b0f19" />
                    </button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '600' }}>Profile Picture</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>PNG, JPG or GIF up to 2MB.</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="avatar-upload" 
                      style={{ display: 'none' }} 
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const compressed = await compressImage(file, 400, 400, 0.85);
                            setFormData(prev => ({ ...prev, avatar: compressed }));
                            addToast('Profile picture loaded! Click "Save Profile" to apply.', 'info');
                          } catch (err) {
                            addToast('Failed to process image file', 'error');
                          }
                        }
                      }} 
                    />
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: '600' }}
                        onClick={() => document.getElementById('avatar-upload').click()}
                      >
                        Upload New
                      </button>
                      {formData.avatar && (
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, avatar: '' }));
                            addToast('Avatar removed', 'info');
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" required />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Updating your email will modify your login credentials.</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="+1 (555) 000-0000" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Specify your active contact number for employer reachout.</span>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={styles.saveBtn}>
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-fade-in">
              <h2 style={styles.sectionTitle}>Password & Security</h2>
              <form onSubmit={handleSave} style={styles.form}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="form-input" placeholder="••••••••" />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">New Password</label>
                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="form-input" placeholder="••••••••" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-input" placeholder="••••••••" />
                  </div>
                </div>
                
                {/* Mobile 2FA Authentication Setup Box */}
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Smartphone size={22} />
                      </div>
                      <div>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '700', margin: 0 }}>
                          Mobile SMS Two-Factor Authentication (2FA)
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: 0, marginTop: '0.2rem' }}>
                          Generates a 6-digit OTP code to your registered mobile phone number for secure sign-in.
                        </p>
                      </div>
                    </div>

                    {user?.twoFactorEnabled ? (
                      <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', color: 'var(--success)', padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={14} /> Mobile 2FA Active & Secured
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid var(--warning)', color: 'var(--warning)', padding: '6px 14px', borderRadius: '20px', fontWeight: '600', fontSize: '0.8rem' }}>
                        2FA Disabled
                      </span>
                    )}
                  </div>

                  {user?.twoFactorEnabled ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', fontWeight: '600', display: 'block' }}>
                          Registered 2FA Mobile Number: <strong>{user?.phone || mobilePhone || '+91 Registered Mobile'}</strong>
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Every sign-in attempt will require entering a 6-digit OTP sent to your phone.
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--danger)', fontSize: '0.82rem' }}
                        onClick={() => handleVerifyMobile2FAOtp(false)}
                        disabled={verifyingOtp}
                      >
                        {verifyingOtp ? 'Disabling...' : 'Disable Mobile 2FA'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label font-semibold" style={{ fontSize: '0.82rem' }}>Mobile Phone Number *</label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              type="text"
                              placeholder="+91 9876543210"
                              value={mobilePhone}
                              onChange={e => setMobilePhone(e.target.value)}
                              className="form-input"
                              style={{ height: '40px', fontSize: '0.85rem' }}
                            />
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', padding: '0 1rem' }}
                              onClick={handleSendMobile2FAOtp}
                              disabled={sendingOtp}
                            >
                              {sendingOtp ? 'Sending...' : 'Send Mobile OTP'}
                            </button>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label font-semibold" style={{ fontSize: '0.82rem' }}>Enter 6-Digit Mobile OTP Code *</label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              type="text"
                              maxLength="6"
                              placeholder="e.g. 482910"
                              value={mobileOtpInput}
                              onChange={e => setMobileOtpInput(e.target.value)}
                              className="form-input"
                              style={{ height: '40px', fontSize: '0.85rem', letterSpacing: '2px', fontWeight: '700' }}
                            />
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', padding: '0 1rem', background: 'var(--success)', color: '#ffffff', border: 'none' }}
                              onClick={() => handleVerifyMobile2FAOtp(true)}
                              disabled={verifyingOtp || !mobileOtpInput}
                            >
                              {verifyingOtp ? 'Verifying...' : 'Verify & Enable 2FA'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {otpSentMsg && (
                        <p style={{ color: 'var(--primary)', fontSize: '0.8rem', margin: 0, fontWeight: '500' }}>
                          {otpSentMsg}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={styles.saveBtn}>
                  {loading ? 'Updating...' : 'Update Security'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-fade-in">
              <h2 style={styles.sectionTitle}>Notification Preferences</h2>
              <form onSubmit={handleSave} style={styles.form}>
                <div style={styles.toggleRow}>
                  <div>
                    <h4 style={styles.toggleTitle}>Email Notifications</h4>
                    <p style={styles.toggleDesc}>Receive updates about new job postings and interview schedules.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" name="emailNotifications" checked={formData.emailNotifications} onChange={handleChange} />
                    <span className="slider round"></span>
                  </label>
                </div>
                
                <div style={styles.toggleRow}>
                  <div>
                    <h4 style={styles.toggleTitle}>Browser Push Notifications</h4>
                    <p style={styles.toggleDesc}>Get instant alerts when someone messages you.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" name="pushNotifications" checked={formData.pushNotifications} onChange={handleChange} />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div style={styles.toggleRow}>
                  <div>
                    <h4 style={styles.toggleTitle}>Weekly Digest</h4>
                    <p style={styles.toggleDesc}>A weekly summary of placement statistics and new resources.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" name="weeklyDigest" checked={formData.weeklyDigest} onChange={handleChange} />
                    <span className="slider round"></span>
                  </label>
                </div>
                
                <button type="submit" disabled={loading} className="btn btn-primary" style={styles.saveBtn}>
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="animate-fade-in">
              <h2 style={styles.sectionTitle}>Privacy & Data</h2>
              <form onSubmit={handleSave} style={styles.form}>
                
                <div style={styles.securityBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Globe size={24} color="var(--success)" />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>Profile Visibility</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Control who can see your portfolio.</p>
                    </div>
                  </div>
                  <select name="profileVisibility" value={formData.profileVisibility} onChange={handleChange} className="form-select" style={{ width: 'auto', minWidth: '150px' }}>
                    <option value="public">Public</option>
                    <option value="verified">Verified Employers</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={styles.saveBtn}>
                  {loading ? 'Saving...' : 'Save Privacy'}
                </button>

                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                  <h4 style={{ color: 'var(--danger)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Danger Zone</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Once you delete your account, there is no going back. Please be certain.</p>
                  <button type="button" className="btn btn-danger">Delete Account</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'coordinators' && user?.role === 'admin' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Placement Coordinators</h2>
                <button type="button" className="btn btn-primary" onClick={handleOpenAddCoord}>
                  <Plus size={16} style={{ marginRight: '4px' }} /> Add Coordinator
                </button>
              </div>

              {coordLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Loader size={28} className="animate-spin" color="var(--primary)" />
                  <p style={{ marginTop: '0.5rem' }}>Fetching coordinators...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface-elevated)' }}>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>Name</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>Email</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>Role</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coordinators.map(coord => (
                        <tr key={coord._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500' }}>{coord.name}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{coord.email}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '600' }}>
                              {coord.role}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                className="btn btn-outline" 
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                onClick={() => handleOpenEditCoord(coord)}
                              >
                                <Pencil size={12} /> Edit
                              </button>
                              <button 
                                className="btn btn-outline" 
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                onClick={() => handleCoordDelete(coord._id)}
                                disabled={coord._id === user._id}
                              >
                                <Trash size={12} /> Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {coordinators.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No coordinators found.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'platform' && user?.role === 'admin' && (
            <div className="animate-fade-in">
              <h2 style={styles.sectionTitle}>Platform Configuration</h2>
              {platformLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Loader size={28} className="animate-spin" color="var(--primary)" />
                  <p style={{ marginTop: '0.5rem' }}>Loading platform configuration...</p>
                </div>
              ) : (
                <form onSubmit={handlePlatformSave} style={styles.form}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Placement Drive Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={platformConfig.driveName}
                      onChange={e => setPlatformConfig(prev => ({ ...prev, driveName: e.target.value }))}
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Academic Year</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 2026-27"
                      value={platformConfig.academicYear}
                      onChange={e => setPlatformConfig(prev => ({ ...prev, academicYear: e.target.value }))}
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Minimum CGPA Threshold</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="10" 
                      className="form-input" 
                      value={platformConfig.minCgpa}
                      onChange={e => setPlatformConfig(prev => ({ ...prev, minCgpa: e.target.value }))}
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Default Coordinator Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={platformConfig.coordinatorEmail}
                      onChange={e => setPlatformConfig(prev => ({ ...prev, coordinatorEmail: e.target.value }))}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Eligible Campus Branches (Comma Separated)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={platformConfig.allowedBranches}
                    onChange={e => setPlatformConfig(prev => ({ ...prev, allowedBranches: e.target.value }))}
                    placeholder="e.g. CSE, ECE, EEE, ME"
                    required 
                  />
                </div>

                <div style={styles.toggleRow}>
                  <div>
                    <h4 style={styles.toggleTitle}>Auto-Verify Student Profiles</h4>
                    <p style={styles.toggleDesc}>Skip the verification queue and approve all registrations instantly.</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={platformConfig.autoVerify} 
                      onChange={e => setPlatformConfig(prev => ({ ...prev, autoVerify: e.target.checked }))} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" style={styles.saveBtn}>
                  Save Platform Configuration
                </button>
              </form>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Coordinator Create/Edit Modal */}
      {showCoordModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 8, 18, 0.65)', backdropFilter: 'blur(8px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowCoordModal(false)}>
          <div className="modal-content" style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--primary-glow), transparent)', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {coordEditId ? 'Edit Coordinator Details' : 'Add Placement Coordinator'}
              </h3>
              <button onClick={() => setShowCoordModal(false)} style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer', justifyContent: 'center' }}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleCoordSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flexGrow: 1 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={coordFormData.name}
                  onChange={e => setCoordFormData(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={coordFormData.email}
                  onChange={e => setCoordFormData(prev => ({ ...prev, email: e.target.value }))}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password {coordEditId && '(Leave blank to keep same)'}</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={coordFormData.password}
                  placeholder={coordEditId ? "••••••••" : "Min 6 characters"}
                  onChange={e => setCoordFormData(prev => ({ ...prev, password: e.target.value }))}
                  required={!coordEditId} 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem 1rem', fontSize: '0.95rem' }}>
                {coordEditId ? 'Update Coordinator' : 'Add Coordinator'}
              </button>
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
  title: { fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '600px' },
  layout: { display: 'flex', gap: '2rem', alignItems: 'flex-start' },
  sidebar: { width: '270px', display: 'flex', flexDirection: 'column', padding: '0.75rem', flexShrink: 0, background: 'rgba(8, 12, 22, 0.96)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.09)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' },
  contentArea: { flex: 1, padding: '2.5rem', minHeight: '520px', background: 'rgba(8, 12, 22, 0.96)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.09)', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' },
  sectionTitle: { fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', letterSpacing: '-0.3px' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '640px' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '1.75rem', marginBottom: '1.25rem', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' },
  avatarPreview: { width: '92px', height: '92px', borderRadius: '50%', background: 'linear-gradient(145deg, #111827 0%, #030712 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', fontWeight: '800', color: '#ffffff', border: '2.5px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.7), inset 0 0 15px rgba(255, 255, 255, 0.05), 0 0 20px rgba(255, 255, 255, 0.2)', position: 'relative', cursor: 'pointer' },
  saveBtn: { alignSelf: 'flex-start', marginTop: '1rem', padding: '0.8rem 2.25rem', background: '#ffffff', border: 'none', borderRadius: '10px', color: '#0b0f19', fontWeight: '800', boxShadow: '0 4px 16px rgba(255, 255, 255, 0.25)', cursor: 'pointer', transition: 'all 0.2s ease' },
  securityBox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '14px', marginTop: '0.5rem' },
  toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' },
  toggleTitle: { fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' },
  toggleDesc: { fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }
};

export default SettingsPage;
