import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, CheckSquare, Menu, Camera, Settings, X, Upload, Sparkles } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { compressImage } from '../utils/imageCompressor';

const Navbar = ({ onMenuClick }) => {
  const { user, updateUser, logout, authHeader } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const dropdownRef = useRef(null);

  // Avatar Edit Modal State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [tempAvatar, setTempAvatar] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);

  // Generate or retrieve persistent browser session ID for accurate online counting
  const getSessionId = () => {
    try {
      let sid = sessionStorage.getItem('apex_session_id');
      if (!sid) {
        sid = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
        sessionStorage.setItem('apex_session_id', sid);
      }
      return sid;
    } catch (e) {
      return 'sess_fallback_' + Date.now();
    }
  };

  useEffect(() => {
    // Enforce dark mode permanently
    document.body.classList.remove('light-theme');
    localStorage.setItem('theme', 'dark');
  }, []);

  const sendHeartbeatAndFetchCount = async () => {
    try {
      const sessionId = getSessionId();
      // 1. Send active heartbeat ping
      fetch(`${API_BASE}/analytics/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      }).catch(() => {});

      // 2. Fetch real-time online count
      const res = await fetch(`${API_BASE}/analytics/online-count`);
      if (res.ok) {
        const data = await res.json();
        setOnlineCount(data.onlineCount || 1);
      }
    } catch (err) {
      console.error('Failed to update online count', err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    sendHeartbeatAndFetchCount();

    // Poll for notifications and active online count every 3 seconds for 100% real-time accuracy
    const interval = setInterval(() => {
      fetchNotifications();
      sendHeartbeatAndFetchCount();
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
        headers: authHeader(),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        addToast('All notifications marked as read', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markSingleRead = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'PUT',
        headers: authHeader(),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAvatarModal = () => {
    setTempAvatar(user.avatar || '');
    setShowAvatarModal(true);
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 400, 0.85);
        setTempAvatar(compressed);
        addToast('Profile picture preview loaded!', 'info');
      } catch (err) {
        addToast('Failed to process image file', 'error');
      }
    }
  };

  const handleSaveAvatar = async () => {
    setSavingAvatar(true);
    try {
      const res = await fetch(`${API_BASE}/profile/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({ avatar: tempAvatar })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile picture');

      updateUser(data.user);
      addToast('Profile picture updated in real time! ✨', 'success');
      setShowAvatarModal(false);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setSavingAvatar(true);
    try {
      const res = await fetch(`${API_BASE}/profile/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({ avatar: '' })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to remove avatar');

      updateUser(data.user);
      setTempAvatar('');
      addToast('Profile picture removed', 'info');
      setShowAvatarModal(false);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSavingAvatar(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav style={styles.navbar}>
      <div style={styles.navLeft}>
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <div style={styles.brand} onClick={() => navigate('/')} style={{ ...styles.brand, cursor: 'pointer' }}>
          <span style={styles.logoGradient}>ApexHire</span>
          <span style={styles.subBrand}>Portal</span>
        </div>
      </div>

      {user && (
        <div style={styles.navRight}>
          {/* Real-time Live Online Badge */}
          <div className="nav-hide-mobile" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.35rem 0.8rem',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: '600',
            color: 'var(--text-secondary)'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399', display: 'inline-block' }}></span>
            <span>{onlineCount} {onlineCount === 1 ? 'User' : 'Users'} Online</span>
          </div>
          {/* Notification Icon */}
          <div style={styles.navIconContainer} ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={styles.iconBtn}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
            </button>

            {showDropdown && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={styles.markReadBtn}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={styles.dropdownBody}>
                  {notifications.length === 0 ? (
                    <p style={styles.emptyText}>No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => markSingleRead(n._id)}
                        className="notification-item"
                        style={{
                          backgroundColor: n.read
                            ? 'transparent'
                            : 'rgba(99, 102, 241, 0.08)',
                        }}
                      >
                        <div style={styles.notifHeader}>
                          <span style={styles.notifTitle}>{n.title}</span>
                          {!n.read && <span style={styles.unreadDot}></span>}
                        </div>
                        <p style={styles.notifMsg}>{n.message}</p>
                        <span style={styles.notifTime}>
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive User Profile Info & Avatar Upload Trigger */}
          <div style={styles.userCard} onClick={handleOpenAvatarModal} title="Click to update Profile Picture or settings">
            <div style={styles.avatarWrap}>
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.parentNode.querySelector('.nav-avatar-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <span 
                className="nav-avatar-fallback" 
                style={{ 
                  display: user.avatar ? 'none' : 'flex', 
                  width: '100%', 
                  height: '100%', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  borderRadius: '50%'
                }}
              >
                {(user.name || 'U').charAt(0).toUpperCase()}
              </span>

              {/* Camera icon overlay */}
              <div style={styles.cameraOverlay} title="Change Photo">
                <Camera size={10} color="#ffffff" />
              </div>
            </div>
            <div className="nav-hide-mobile" style={styles.userInfo}>
              <span style={styles.userName}>{user.name}</span>
              <span style={styles.userRole}>
                {user.role === 'admin' 
                  ? 'Placement Admin' 
                  : user.role === 'recruiter' 
                    ? 'Recruiter' 
                    : 'Student'}
              </span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); logout(); }} className="nav-logout-btn nav-hide-mobile" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}

      {/* REAL-TIME AVATAR EDIT MODAL */}
      {showAvatarModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAvatarModal(false)}>
          <div className="animate-fade-in" style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeaderBlock}>
              <div>
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontWeight: '700', fontSize: '1.1rem' }}>
                  Update Profile Picture
                </h3>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.78rem', marginTop: '0.2rem' }}>
                  Upload a photo to personalize your ApexHire candidate & recruiter avatar.
                </p>
              </div>
              <button onClick={() => setShowAvatarModal(false)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              {/* Avatar Preview Ring */}
              <div 
                style={styles.largeAvatarPreview}
                onClick={() => document.getElementById('navbar-avatar-upload').click()}
                title="Click to choose image file"
              >
                {tempAvatar ? (
                  <img 
                    src={tempAvatar} 
                    alt="Preview" 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff' }}>
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}

                <div style={styles.previewCameraBadge}>
                  <Camera size={16} color="#0b0f19" />
                </div>
              </div>

              <input 
                type="file" 
                accept="image/*" 
                id="navbar-avatar-upload" 
                style={{ display: 'none' }} 
                onChange={handleAvatarFileChange} 
              />

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.05rem' }}>
                  {user?.name}
                </h4>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {user?.email} • <span style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'capitalize' }}>{user?.role}</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                  onClick={() => document.getElementById('navbar-avatar-upload').click()}
                >
                  <Upload size={14} />
                  <span>Select New Photo</span>
                </button>

                {tempAvatar && (
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--danger)' }}
                    onClick={handleRemoveAvatar}
                    disabled={savingAvatar}
                  >
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>

              {/* Bottom Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', width: '100%', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline"
                  style={{ fontSize: '0.82rem' }}
                  onClick={() => {
                    setShowAvatarModal(false);
                    const settingsPath = user?.role === 'admin' ? '/admin/settings' : user?.role === 'recruiter' ? '/recruiter/settings' : '/student/settings';
                    navigate(settingsPath);
                  }}
                >
                  <Settings size={14} />
                  <span>Full Profile Settings</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-primary"
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1.25rem' }}
                  onClick={handleSaveAvatar}
                  disabled={savingAvatar}
                >
                  <span>{savingAvatar ? 'Saving...' : 'Save Profile Picture'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const styles = {
  navbar: {
    height: '70px',
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    borderBottom: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  logoGradient: {
    color: '#ffffff',
    WebkitTextFillColor: '#ffffff',
  },
  subBrand: {
    color: '#ffffff',
    fontSize: '1.2rem',
    fontWeight: '600',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  navIconContainer: {
    position: 'relative',
  },
  iconBtn: {
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: 'var(--text-secondary)',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all var(--transition-fast)',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: 'var(--danger)',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: '700',
    borderRadius: '50px',
    minWidth: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    border: '2px solid var(--bg-base)',
  },
  dropdown: {
    position: 'absolute',
    top: '50px',
    right: 0,
    width: '320px',
    maxHeight: '400px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'fadeIn 0.25s ease',
  },
  dropdownHeader: {
    padding: '1rem',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    h4: {
      fontSize: '0.95rem',
      fontWeight: '600',
    },
  },
  markReadBtn: {
    fontSize: '0.75rem',
    color: 'var(--primary)',
    fontWeight: '600',
    cursor: 'pointer',
  },
  dropdownBody: {
    overflowY: 'auto',
    flex: 1,
    maxHeight: '340px',
  },
  notificationItem: {
    padding: '1rem',
    borderBottom: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'background-color var(--transition-fast)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
  },
  notifHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  unreadDot: {
    width: '6px',
    height: '6px',
    backgroundColor: 'var(--primary)',
    borderRadius: '50%',
    boxShadow: '0 0 6px var(--primary)',
  },
  notifMsg: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  notifTime: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    alignSelf: 'flex-end',
  },
  emptyText: {
    padding: '2rem',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  userCard: {
    height: '42px',
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '0 0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  avatarWrap: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px solid var(--bg-surface)',
    zIndex: 2,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1.2',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  userRole: {
    fontSize: '0.7rem',
    color: '#ffffff',
    opacity: 0.8,
    fontWeight: '500',
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color var(--transition-fast)',
    '&:hover': {
      color: 'var(--danger)',
    },
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 8, 18, 0.85)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
  modalContent: {
    width: '100%',
    maxWidth: '460px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-lg)',
  },
  modalHeaderBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, var(--primary-glow) 0%, var(--secondary-glow) 100%)',
    borderBottom: '1px solid var(--border-color)',
    padding: '1.25rem 1.5rem',
    position: 'relative',
  },
  modalCloseBtn: {
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    width: '30px',
    height: '30px',
  },
  largeAvatarPreview: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    cursor: 'pointer',
    border: '3px solid var(--border-color)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  },
  previewCameraBadge: {
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#ffffff',
    border: '2px solid var(--bg-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
  },
};

export default Navbar;
