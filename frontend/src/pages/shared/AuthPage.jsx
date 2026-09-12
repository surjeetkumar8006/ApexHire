import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Lock, Mail, User, ArrowLeft, GraduationCap, Shield, Sparkles, CheckCircle, Briefcase, Key, RefreshCw } from 'lucide-react';

const companies = [
  { name: 'Google', icon: 'G' },
  { name: 'Microsoft', icon: 'ms' },
  { name: 'Amazon', icon: 'a' },
  { name: 'Meta', icon: '∞' },
  { name: 'Netflix', icon: 'N' },
  { name: 'Adobe', icon: 'A' },
  { name: 'Salesforce', icon: 'S' }
];

const AuthPage = ({ onBack }) => {
  const navigate = useNavigate();
  const { login, register, requestForgotPassword, submitResetPassword } = useAuth();
  const { addToast } = useNotification();

  const handleReturnHome = () => {
    if (onBack) onBack();
    navigate('/');
  };

  const [viewMode, setViewMode] = useState('auth'); // 'auth', 'forgot_email', 'forgot_reset'
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student'); // 'student' or 'admin'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otpMessage, setOtpMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setFormError('');

    const cleanEmail = email ? email.trim() : '';

    if (!cleanEmail || !password) {
      const msg = 'Please fill in all required fields';
      setFormError(msg);
      addToast(msg, 'warning');
      return;
    }

    if (!isLogin) {
      if (!name || !name.trim()) {
        const msg = 'Please enter your full name';
        setFormError(msg);
        addToast(msg, 'warning');
        return;
      }
      if (password !== confirmPassword) {
        const msg = 'Passwords do not match';
        setFormError(msg);
        addToast(msg, 'error');
        return;
      }
      if (password.length < 6) {
        const msg = 'Password must be at least 6 characters long';
        setFormError(msg);
        addToast(msg, 'warning');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(cleanEmail, password);
        addToast('Logged in successfully!', 'success');
      } else {
        await register(name.trim(), cleanEmail, password, role);
        addToast('Account created successfully! Welcome to ApexHire.', 'success');
      }
    } catch (err) {
      const errMsg = err.message || 'Authentication failed. Please check your credentials.';
      setFormError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    setFormError('');

    const clean = forgotEmail ? forgotEmail.trim() : '';

    if (!clean) {
      const msg = 'Please enter your registered email address';
      setFormError(msg);
      addToast(msg, 'warning');
      return;
    }

    setLoading(true);

    try {
      const res = await requestForgotPassword(clean);
      setOtpMessage(res.message || 'OTP code sent!');
      if (res.otp && !res.emailSent) {
        setOtpCode(res.otp);
      } else {
        setOtpCode('');
      }
      setViewMode('forgot_reset');
      addToast(
        res.emailSent
          ? `📩 OTP code sent to ${clean}! Please check your Gmail inbox.`
          : 'Verification OTP generated!',
        'success'
      );
    } catch (err) {
      const errMsg = err.message || 'Failed to request OTP code.';
      setFormError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (loading) return;
    setFormError('');

    const cleanEmail = forgotEmail ? forgotEmail.trim() : '';
    const cleanOtp = otpCode ? otpCode.trim() : '';

    if (!cleanOtp || !newPassword) {
      const msg = 'Please enter the OTP code and new password';
      setFormError(msg);
      addToast(msg, 'warning');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      const msg = 'New passwords do not match';
      setFormError(msg);
      addToast(msg, 'error');
      return;
    }

    if (newPassword.length < 6) {
      const msg = 'New password must be at least 6 characters long';
      setFormError(msg);
      addToast(msg, 'warning');
      return;
    }

    setLoading(true);

    try {
      const res = await submitResetPassword(cleanEmail, cleanOtp, newPassword);
      addToast(res.message || 'Password reset successfully! Please sign in.', 'success');
      setEmail(cleanEmail);
      setPassword(newPassword);
      setViewMode('auth');
      setIsLogin(true);
      setForgotEmail('');
      setOtpCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setOtpMessage('');
    } catch (err) {
      const errMsg = err.message || 'Failed to reset password.';
      setFormError(errMsg);
      addToast(errMsg, 'error');
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


          <div className="auth-live-stat-pill" style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(245, 158, 11, 0.45)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50px',
            padding: '0.35rem 0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            width: 'fit-content',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#84cc16', boxShadow: '0 0 8px #84cc16' }}></span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff', letterSpacing: '0.1px' }}>Gemini AI Resume & Voice Mock Pipeline Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h2 style={{ fontSize: '2.15rem', fontWeight: '800', lineHeight: '1.25', letterSpacing: '-0.5px', color: '#ffffff', margin: 0, textShadow: '0 2px 12px rgba(0, 0, 0, 0.9)' }}>
              Accelerate Your Placement Career With <br />
              AI-Powered Intelligence
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.55', margin: 0, textShadow: '0 1px 8px rgba(0, 0, 0, 0.8)' }}>
              Experience the next generation of campus recruitment: Gemini AI resume feedback, realistic voice mock interviews with calm speech rate, 5-stage live application tracking, and direct recruiter connections.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '0.1rem', marginBottom: '0.1rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 28, 48, 0.85) 0%, rgba(9, 17, 32, 0.92) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <svg style={{ position: 'absolute', right: '-10px', top: '-10px', height: '110%', width: '110px', opacity: 0.45, pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 80 Q 40 10, 100 50 T 200 20" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                <path d="M0 60 Q 50 90, 100 30 T 200 70" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                <path d="M0 40 Q 30 70, 100 20 T 200 90" fill="none" stroke="#f59e0b" strokeWidth="1.2" />
              </svg>
              <h4 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>₹65 LPA</h4>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)', margin: '3px 0 0 0', fontWeight: '500' }}>Highest Placement Offer</p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 28, 48, 0.85) 0%, rgba(9, 17, 32, 0.92) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <svg style={{ position: 'absolute', right: '-10px', top: '-10px', height: '110%', width: '110px', opacity: 0.45, pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 80 Q 40 10, 100 50 T 200 20" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                <path d="M0 60 Q 50 90, 100 30 T 200 70" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                <path d="M0 40 Q 30 70, 100 20 T 200 90" fill="none" stroke="#f59e0b" strokeWidth="1.2" />
              </svg>
              <h4 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>95%</h4>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)', margin: '3px 0 0 0', fontWeight: '500' }}>Verified Student Success</p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.95)', fontWeight: '500', textShadow: '0 1px 6px rgba(0, 0, 0, 0.8)' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(34, 197, 94, 0.2)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <span><strong style={{ color: '#ffffff', fontWeight: '700' }}>Gemini AI Resume Parser:</strong> <span style={{ color: 'rgba(255, 255, 255, 0.88)' }}>Instant ATS match score & gap analysis</span></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.95)', fontWeight: '500', textShadow: '0 1px 6px rgba(0, 0, 0, 0.8)' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(34, 197, 94, 0.2)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <span><strong style={{ color: '#ffffff', fontWeight: '700' }}>Voice AI Mock Room:</strong> <span style={{ color: 'rgba(255, 255, 255, 0.88)' }}>Calm 0.88x speed tech & HR interview practice</span></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.95)', fontWeight: '500', textShadow: '0 1px 6px rgba(0, 0, 0, 0.8)' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(34, 197, 94, 0.2)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <span><strong style={{ color: '#ffffff', fontWeight: '700' }}>5-Stage Live Pipeline:</strong> <span style={{ color: 'rgba(255, 255, 255, 0.88)' }}>Track applications from Reviewing to Offer</span></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.95)', fontWeight: '500', textShadow: '0 1px 6px rgba(0, 0, 0, 0.8)' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(34, 197, 94, 0.2)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <span><strong style={{ color: '#ffffff', fontWeight: '700' }}>Instant Coordinator Pings:</strong> <span style={{ color: 'rgba(255, 255, 255, 0.88)' }}>Real-time session status & announcements</span></span>
            </div>
          </div>

          <div className="auth-companies-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255, 255, 255, 0.45)' }}>TRUSTED BY TOP GLOBAL HIRING PARTNERS</span>
            <div className="auth-companies-ticker-wrap">
              <div className="auth-companies-ticker-track">
                {[...companies, ...companies].map((c, i) => (
                  <div key={i} className="auth-company-chip">
                    {c.icon === 'ms' ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#0f172a" style={{ flexShrink: 0 }}>
                        <rect x="1" y="1" width="10" height="10"/>
                        <rect x="13" y="1" width="10" height="10"/>
                        <rect x="1" y="13" width="10" height="10"/>
                        <rect x="13" y="13" width="10" height="10"/>
                      </svg>
                    ) : (
                      <span className="auth-company-icon">{c.icon}</span>
                    )}
                    <span className="auth-company-name">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
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
            {viewMode === 'auth' && (
              <>
                {/* Capsule Switcher */}
                <div className="auth-capsule-switcher">
                  <button
                    type="button"
                    onClick={() => { setIsLogin(true); setFormError(''); }}
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
                    onClick={() => { setIsLogin(false); setFormError(''); }}
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

                {formError && (
                  <div style={styles.errorBanner}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                      <span style={{ fontSize: '1rem' }}>⚠️</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{formError}</span>
                    </div>
                    {formError.includes('already exists') && !isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(true);
                          setFormError('');
                        }}
                        style={{
                          background: '#ffffff',
                          color: '#0b0f19',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          marginLeft: '0.5rem'
                        }}
                      >
                        Sign In Now →
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form-fields" style={styles.form}>
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
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
                        <span
                          onClick={() => {
                            setForgotEmail(email || '');
                            setFormError('');
                            setViewMode('forgot_email');
                          }}
                          style={{ fontSize: '0.78rem', color: '#38bdf8', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Forgot Password?
                        </span>
                      </div>
                    </div>
                  )}

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

                  <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner" style={styles.spinner}></span>
                        <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                      </>
                    ) : (
                      isLogin ? 'Sign In' : 'Sign Up'
                    )}
                  </button>
                </form>
              </>
            )}

            {/* FORGOT PASSWORD - STEP 1: ENTER EMAIL */}
            {viewMode === 'forgot_email' && (
              <>
                <div style={styles.formHeader}>
                  <h2 style={styles.formTitle}>Forgot Password?</h2>
                  <p style={styles.formDesc}>
                    Enter your registered email address below to generate a 6-digit OTP verification code.
                  </p>
                </div>

                {formError && (
                  <div style={styles.errorBanner}>
                    <span style={{ fontSize: '1rem' }}>⚠️</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleRequestOtp} className="auth-form-fields" style={styles.form}>
                  <div className="form-group">
                    <label className="form-label">Registered Email Address</label>
                    <div style={styles.inputWrapper}>
                      <Mail size={18} style={styles.inputIcon} />
                      <input
                        type="email"
                        placeholder="student@example.com"
                        className="form-input"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        style={styles.inputWithIcon}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner" style={styles.spinner}></span>
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      'Send Verification OTP'
                    )}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <span
                    onClick={() => { setViewMode('auth'); setFormError(''); }}
                    style={{ fontSize: '0.82rem', color: '#38bdf8', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ← Back to Sign In
                  </span>
                </div>
              </>
            )}

            {/* FORGOT PASSWORD - STEP 2: ENTER OTP & NEW PASSWORD */}
            {viewMode === 'forgot_reset' && (
              <>
                <div style={styles.formHeader}>
                  <h2 style={styles.formTitle}>Reset Password</h2>
                  <p style={styles.formDesc}>
                    Enter the 6-digit OTP code and set your new password.
                  </p>
                </div>

                {otpMessage && (
                  <div style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(34, 197, 94, 0.12)',
                    border: '1px solid rgba(34, 197, 94, 0.35)',
                    color: '#4ade80',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    marginBottom: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    lineHeight: '1.45'
                  }}>
                    <Mail size={20} color="#4ade80" style={{ flexShrink: 0 }} />
                    <div>
                      <div>{otpMessage}</div>
                      <div style={{ fontSize: '0.75rem', color: '#a7f3d0', fontWeight: '400', marginTop: '2px' }}>
                        Please open your Gmail inbox or Spam folder to copy the 6-digit code.
                      </div>
                    </div>
                  </div>
                )}

                {formError && (
                  <div style={styles.errorBanner}>
                    <span style={{ fontSize: '1rem' }}>⚠️</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="auth-form-fields" style={styles.form}>
                  <div className="form-group">
                    <label className="form-label">6-Digit Verification OTP Code</label>
                    <div style={styles.inputWrapper}>
                      <Key size={18} style={styles.inputIcon} />
                      <input
                        type="text"
                        placeholder="123456"
                        className="form-input"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        style={styles.inputWithIcon}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <div style={styles.inputWrapper}>
                        <Lock size={18} style={styles.inputIcon} />
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="form-input"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          style={styles.inputWithIcon}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <div style={styles.inputWrapper}>
                        <Lock size={18} style={styles.inputIcon} />
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="form-input"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          style={styles.inputWithIcon}
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner" style={styles.spinner}></span>
                        <span>Resetting Password...</span>
                      </>
                    ) : (
                      'Reset Password Now'
                    )}
                  </button>
                </form>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.82rem' }}>
                  <span
                    onClick={() => { setViewMode('forgot_email'); setFormError(''); }}
                    style={{ color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <RefreshCw size={13} /> Resend OTP
                  </span>
                  <span
                    onClick={() => { setViewMode('auth'); setFormError(''); }}
                    style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ← Back to Sign In
                  </span>
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  </div>
  );
};

const styles = {
  errorBanner: {
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    color: '#f87171',
    fontSize: '0.88rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
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
    gap: '0.85rem',
  },
  brandQuote: {
    fontSize: '2rem',
    fontWeight: '800',
    lineHeight: '1.25',
    letterSpacing: '-0.5px',
    color: '#ffffff',
  },
  brandSub: {
    fontSize: '0.95rem',
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: '1.6',
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.88rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  brandFooter: {
    marginTop: '0.85rem',
    fontSize: '0.8rem',
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
