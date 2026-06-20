import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Shield, Smartphone, Globe, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const SettingsPage = () => {
  const { user, updateUser, authHeader } = useAuth();
  const { addToast } = useNotification();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: user?.twoFactorEnabled || false,
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    profileVisibility: 'verified'
  });

  // Fetch initial profile settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/profile', { headers: authHeader() });
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
        payload.phone = formData.phone;
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

      const res = await fetch('http://localhost:5000/api/profile/settings', {
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

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: <User size={18} /> },
    { id: 'security', label: 'Password & Security', icon: <Lock size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'privacy', label: 'Privacy & Data', icon: <Shield size={18} /> }
  ];

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
        <div className="glass-card" style={styles.sidebar}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tabBtn,
                background: activeTab === tab.id ? 'var(--primary-glow)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                borderRight: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="glass-card" style={styles.contentArea}>
          
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <h2 style={styles.sectionTitle}>Profile Information</h2>
              <form onSubmit={handleSave} style={styles.form}>
                <div style={styles.avatarSection}>
                  <div style={styles.avatarPreview}>{user?.name?.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Profile Picture</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>PNG, JPG or GIF up to 2MB.</p>
                    <button type="button" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Upload New</button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" defaultValue={user?.email} disabled />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email cannot be changed directly. Contact support.</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="+1 (555) 000-0000" disabled />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone number cannot be changed directly. Contact support.</span>
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
                
                <div style={styles.securityBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Smartphone size={24} color="var(--primary)" />
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>Two-Factor Authentication</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Add an extra layer of security to your account.</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className={formData.twoFactorEnabled ? "btn btn-danger" : "btn btn-outline"}
                    onClick={() => setFormData(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                  >
                    {formData.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
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
  layout: { display: 'flex', gap: '2rem', alignItems: 'flex-start' },
  sidebar: { width: '250px', display: 'flex', flexDirection: 'column', padding: '1rem 0', flexShrink: 0 },
  tabBtn: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500', transition: 'all 0.2s' },
  contentArea: { flex: 1, padding: '2.5rem', minHeight: '500px' },
  sectionTitle: { fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' },
  avatarPreview: { width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#fff' },
  saveBtn: { alignSelf: 'flex-start', marginTop: '1rem', padding: '0.75rem 2rem' },
  securityBox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '12px', marginTop: '0.5rem' },
  toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid hsla(217, 20%, 60%, 0.1)' },
  toggleTitle: { fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)' },
  toggleDesc: { fontSize: '0.85rem', color: 'var(--text-secondary)' }
};

export default SettingsPage;
