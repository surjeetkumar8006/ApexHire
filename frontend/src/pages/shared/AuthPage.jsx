import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Lock, Mail, User, ArrowLeft, GraduationCap, Shield, Sparkles, CheckCircle, Briefcase } from 'lucide-react';

const companies = [
  { name: 'Google', icon: 'G' },
  { name: 'Microsoft', icon: 'M' },
  { name: 'Amazon', icon: 'A' },
  { name: 'Meta', icon: '∞' },
  { name: 'Netflix', icon: 'N' },
  { name: 'Adobe', icon: 'A' },
  { name: 'Salesforce', icon: 'S' }
];

const AuthPage = ({ onBack }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { addToast } = useNotification();

  const handleReturnHome = () => {
    if (onBack) onBack();
    navigate('/');
  };

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student'); // 'student' or 'admin'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    if (!isLogin) {
      if (!name) {
        addToast('Please enter your name', 'warning');
        return;
      }
      if (password !== confirmPassword) {
        addToast('Passwords do not match', 'error');
        return;
      }
      if (password.length < 6) {
        addToast('Password must be at least 6 characters', 'warning');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        addToast('Logged in successfully!', 'success');
      } else {
        await register(name, email, password, role);
        addToast('Account created successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper animate-fade-in">
      {/* Left Column: Premium Brand Side */}
      <div className="auth-brand-side">
        <div className="auth-brand-overlay"></div>
        <div className="auth-brand-content">
          <div style={styles.logoBox}>
            <Sparkles size={24} color="#ffffff" />
            <span style={styles.logoText}>ApexHire Portal</span>
          </div>

          <div className="auth-live-stat-pill">
            <span className="auth-live-stat-dot"></span>
            <span>Real-Time AI Resume & ATS Pipeline Active</span>
          </div>

          <div style={styles.heroText}>
            <h2 style={styles.brandQuote}>Connecting Talent with Enterprise Opportunities</h2>
            <p style={styles.brandSub}>
              A comprehensive campus placement ecosystem powered by AI analysis, dynamic application mapping, and real-time coordinator review channels.
            </p>
          </div>

          <div style={styles.featuresList}>
            <div style={styles.featureItem}>
              <CheckCircle size={18} color="#ffffff" />
              <span>AI Resume Parser & Assessment</span>
            </div>
            <div style={styles.featureItem}>
              <CheckCircle size={18} color="#ffffff" />
              <span>Unified Placement Application Pipeline</span>
            </div>
            <div style={styles.featureItem}>
              <CheckCircle size={18} color="#ffffff" />
              <span>Real-Time Notifications & Announcements</span>
            </div>
          </div>

          <div className="auth-companies-section">
            <span className="auth-companies-title">Trusted By Recruiting Teams At</span>
            <div className="auth-companies-grid">
              {companies.map((c, i) => (
                <div key={i} className="auth-company-chip">
                  <span className="auth-company-icon">{c.icon}</span>
                  <span className="auth-company-name">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.brandFooter}>
            <span>ApexHire Platform 2026</span>
          </div>
        </div>
      </div>

      {/* Right Column: Centered Form Column */}
      <div className="auth-form-side">
        <div className="auth-bg-glow"></div>
        <div className="auth-form-container">
          {/* Floating Return Button */}
          <button onClick={handleReturnHome} className="auth-floating-back-btn">
            <ArrowLeft size={16} />
            <span>Return Home</span>
          </button>

          <div className="glass-card auth-card">
          {/* Capsule Switcher */}
          <div className="auth-capsule-switcher">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              style={{
                ...styles.switcherBtn,
                color: isLogin ? '#0b0f19' : 'var(--text-secondary)',
                backgroundColor: isLogin ? '#ffffff' : 'transparent',
                boxShadow: isLogin ? '0 4px 12px rgba(255, 255, 255, 0.2)' : 'none',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              style={{
                ...styles.switcherBtn,
                color: !isLogin ? '#0b0f19' : 'var(--text-secondary)',
                backgroundColor: !isLogin ? '#ffffff' : 'transparent',
                boxShadow: !isLogin ? '0 4px 12px rgba(255, 255, 255, 0.2)' : 'none',
              }}
            >
              Register
            </button>
          </div>

          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p style={styles.formDesc}>
              {isLogin
                ? 'Enter your credentials to access your dashboard'
                : 'Fill in your details to join the placement portal'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-fields" style={styles.form}>
            {/* Name & Email Field - Row styling for register, single column for login */}
            {!isLogin ? (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={styles.inputWrapper}>
                    <User size={18} style={styles.inputIcon} />
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={styles.inputWithIcon}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={styles.inputWrapper}>
                    <Mail size={18} style={styles.inputIcon} />
                    <input
                      type="email"
                      placeholder="student@example.com"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={styles.inputWithIcon}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={styles.inputWrapper}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    type="email"
                    placeholder="student@example.com"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.inputWithIcon}
                  />
                </div>
              </div>
            )}

            {/* Password & Confirm Password Field - Row styling for register, single column for login */}
            {!isLogin ? (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={styles.inputWrapper}>
                    <Lock size={18} style={styles.inputIcon} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={styles.inputWithIcon}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div style={styles.inputWrapper}>
                    <Lock size={18} style={styles.inputIcon} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={styles.inputWithIcon}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.inputWithIcon}
                  />
                </div>
              </div>
            )}

            {/* Role Cards Grid (Register only) */}
            {!isLogin && (
              <div className="form-group">
                <label className="form-label font-semibold">Register As</label>
                <div className="auth-role-grid">
                  <div
                    onClick={() => setRole('student')}
                    className={`auth-role-card ${role === 'student' ? 'active-student' : ''}`}
                    style={{
                      borderColor: role === 'student' ? 'var(--primary)' : 'var(--border-color)',
                      backgroundColor: role === 'student' ? 'var(--primary-glow)' : 'var(--input-bg)',
                    }}
                  >
                    <GraduationCap size={20} color={role === 'student' ? 'var(--primary)' : 'var(--text-muted)'} />
                    <div style={styles.roleCardText}>
                      <span style={{ ...styles.roleCardName, color: role === 'student' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Student</span>
                      <span style={styles.roleCardDesc}>Search & apply</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setRole('recruiter')}
                    className={`auth-role-card ${role === 'recruiter' ? 'active-recruiter' : ''}`}
                    style={{
                      borderColor: role === 'recruiter' ? 'var(--accent)' : 'var(--border-color)',
                      backgroundColor: role === 'recruiter' ? 'var(--accent-glow)' : 'var(--input-bg)',
                    }}
                  >
                    <Briefcase size={20} color={role === 'recruiter' ? 'var(--accent)' : 'var(--text-muted)'} />
                    <div style={styles.roleCardText}>
                      <span style={{ ...styles.roleCardName, color: role === 'recruiter' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Recruiter</span>
                      <span style={styles.roleCardDesc}>Post jobs & hire</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setRole('admin')}
                    className={`auth-role-card ${role === 'admin' ? 'active-admin' : ''}`}
                    style={{
                      borderColor: role === 'admin' ? 'var(--secondary)' : 'var(--border-color)',
                      backgroundColor: role === 'admin' ? 'var(--secondary-glow)' : 'var(--input-bg)',
                    }}
                  >
                    <Shield size={20} color={role === 'admin' ? 'var(--secondary)' : 'var(--text-muted)'} />
                    <div style={styles.roleCardText}>
                      <span style={{ ...styles.roleCardName, color: role === 'admin' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Admin</span>
                      <span style={styles.roleCardDesc}>Manage board</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={loading}>
              {loading ? <span className="spinner" style={styles.spinner}></span> : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
  );
};

const styles = {
  logoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoText: {
    fontSize: '1.45rem',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    color: '#ffffff',
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  brandQuote: {
    fontSize: '2.25rem',
    fontWeight: '800',
    lineHeight: '1.25',
    letterSpacing: '-0.75px',
    color: '#ffffff',
  },
  brandSub: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.65',
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.92rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  brandFooter: {
    marginTop: '2rem',
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '500',
  },
  switcherBtn: {
    flex: 1,
    padding: '0.65rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    border: 'none',
  },
  formHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  formTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
  },
  formDesc: {
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  inputWithIcon: {
    paddingLeft: '2.6rem',
    width: '100%',
  },
  roleCardText: {
    display: 'flex',
    flexDirection: 'column',
  },
  roleCardName: {
    fontSize: '0.88rem',
    fontWeight: '700',
  },
  roleCardDesc: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '1px',
  },
  submitBtn: {
    width: '100%',
    marginTop: '0.85rem',
    height: '46px',
    backgroundColor: '#ffffff',
    color: '#0b0f19',
    fontWeight: '800',
    fontSize: '0.95rem',
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 6px 20px rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

export default AuthPage;
