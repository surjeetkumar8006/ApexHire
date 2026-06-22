import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, LogOut, CheckSquare, Sun, Moon, Menu } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Navbar = ({ onMenuClick }) => {
  const { user, logout, authHeader } = useAuth();
  const { addToast } = useNotification();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    if (saved === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    return saved;
  });

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
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

    // Poll for notifications every 15 seconds for real-time feel
    const interval = setInterval(fetchNotifications, 15000);

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav style={styles.navbar}>
      <div style={styles.navLeft}>
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <div style={styles.brand}>
          <span style={styles.logoGradient}>ApexHire</span>
          <span style={styles.subBrand}>Portal</span>
        </div>
      </div>

      {user && (
        <div style={styles.navRight}>
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

          {/* Theme Selector Dual-Pill Switch */}
          <div className="nav-hide-mobile" style={styles.themeToggleContainer}>
            <button
              onClick={() => changeTheme('light')}
              style={{
                ...styles.themeToggleBtn,
                backgroundColor: theme === 'light' ? 'var(--primary)' : 'transparent',
                color: theme === 'light' ? '#fff' : 'var(--text-secondary)',
              }}
              title="Switch to Light Theme"
            >
              <Sun size={14} />
              <span>Light</span>
            </button>
            <button
              onClick={() => changeTheme('dark')}
              style={{
                ...styles.themeToggleBtn,
                backgroundColor: theme === 'dark' ? 'var(--primary)' : 'transparent',
                color: theme === 'dark' ? '#fff' : 'var(--text-secondary)',
              }}
              title="Switch to Dark Theme"
            >
              <Moon size={14} />
              <span>Dark</span>
            </button>
          </div>

          {/* User Profile Info */}
          <div style={styles.userCard}>
            <div style={styles.avatar}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }} />
              ) : (
                <User size={18} />
              )}
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
            <button onClick={logout} className="nav-logout-btn nav-hide-mobile" title="Logout">
              <LogOut size={18} />
            </button>
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
  themeToggleContainer: {
    display: 'flex',
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    padding: '2px',
    gap: '2px',
  },
  themeToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.8rem',
    borderRadius: '18px',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: '600',
    transition: 'all var(--transition-fast)',
    border: 'none',
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
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subBrand: {
    color: 'var(--accent)',
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
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '0.4rem 0.6rem 0.4rem 0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
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
    color: 'var(--accent)',
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
};

export default Navbar;
