import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, BookOpen, GraduationCap, CheckCircle2, AlertCircle, Plus, Trash, Briefcase, Eye, Target, Activity, Clock, Code } from 'lucide-react';
import { useAuth, API_BASE, BACKEND_URL } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const StudentDashboard = () => {
  const { user, authHeader } = useAuth();
  const { addToast } = useNotification();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [applications, setApplications] = useState([]);
  
  // Edit Profile States
  const [skills, setSkills] = useState('');
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [expDescription, setExpDescription] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setSkills(data.skills.join(', '));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_BASE}/applications/my`, {
        headers: authHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchProfile(), fetchApplications()]).finally(() => setLoading(false));
  }, []);

  const handleOfferResponse = async (appId, response) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${appId}/offer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ offerStatus: response }),
      });

      if (res.ok) {
        addToast(`Offer successfully ${response.toLowerCase()}ed!`, 'success');
        // Refresh profile and applications list
        fetchApplications();
        fetchProfile();
      } else {
        const data = await res.json();
        addToast(data.message || 'Failed to submit response', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error responding to offer', 'error');
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      addToast('Only PDF files are supported', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);

    try {
      const res = await fetch(`${API_BASE}/ai/analyze-resume`, {
        method: 'POST',
        headers: authHeader(),
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Analysis failed');

      addToast('Resume uploaded and AI analyzed successfully!', 'success');
      fetchProfile(); // reload profile with AI scores
    } catch (err) {
      addToast(err.message || 'Resume upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const skillsArray = skills.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

    const educationObj = (school || degree) ? { school: school || 'University', degree: degree || 'Graduate', cgpa } : null;
    const experienceObj = (company || position) ? { company: company || 'Organization', position: position || 'Developer', description: expDescription } : null;

    try {
      const body = {
        skills: skillsArray,
      };

      if (educationObj && profile) {
        body.education = [...(profile.education || []), educationObj];
      }
      if (experienceObj && profile) {
        body.experience = [...(profile.experience || []), experienceObj];
      }

      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const updatedData = await res.json();
        setProfile(updatedData);
        setSkills(updatedData.skills ? updatedData.skills.join(', ') : '');
        addToast('Credentials updated successfully!', 'success');
        // Reset inputs
        setSchool('');
        setDegree('');
        setCgpa('');
        setCompany('');
        setPosition('');
        setExpDescription('');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Profile update failed');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const removeSkill = async (index) => {
    if (!profile) return;
    const updatedSkills = profile.skills.filter((_, i) => i !== index);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ skills: updatedSkills }),
      });
      if (res.ok) {
        const updatedData = await res.json();
        setProfile(updatedData);
        setSkills(updatedData.skills ? updatedData.skills.join(', ') : '');
        addToast('Skill removed', 'success');
      }
    } catch (err) {
      addToast('Failed to remove skill', 'error');
    }
  };

  const removeEducation = async (index) => {
    if (!profile) return;
    const updatedEdu = profile.education.filter((_, i) => i !== index);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ education: updatedEdu }),
      });
      if (res.ok) {
        const updatedData = await res.json();
        setProfile(updatedData);
        addToast('Education item removed', 'success');
      }
    } catch (err) {
      addToast('Failed to remove education', 'error');
    }
  };

  const removeExperience = async (index) => {
    if (!profile) return;
    const updatedExp = profile.experience.filter((_, i) => i !== index);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ experience: updatedExp }),
      });
      if (res.ok) {
        const updatedData = await res.json();
        setProfile(updatedData);
        addToast('Experience item removed', 'success');
      }
    } catch (err) {
      addToast('Failed to remove experience', 'error');
    }
  };

  // Compute profile completeness score (0-100)
  const computeCompleteness = () => {
    if (!profile) return 0;
    let score = 25; // Base signup
    if (profile.skills && profile.skills.length > 0) score += 25;
    if (profile.education && profile.education.length > 0) score += 25;
    if (profile.resumeUrl) score += 25;
    return score;
  };

  const completeness = computeCompleteness();

  const generateAndDownloadPortfolio = () => {
    if (!profile) return;
    const skillsListHTML = (profile.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('') || '<p>Skills coming soon...</p>';
    const educationListHTML = (profile.education || []).map(edu => `
        <div class="card">
          <div class="card-title">${edu.degree}</div>
          <div class="card-sub">${edu.school} ${edu.cgpa ? `• CGPA: ${edu.cgpa}` : ''}</div>
        </div>
    `).join('') || '<p>Education coming soon...</p>';
    const experienceListHTML = (profile.experience || []).map(exp => `
        <div class="card">
          <div class="card-title">${exp.position}</div>
          <div class="card-sub">${exp.company}</div>
          <p>${exp.description}</p>
        </div>
    `).join('') || '<p>Experience coming soon...</p>';

    const portfolioHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${user.name} - Portfolio</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --primary: #6366f1;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --accent: #06b6d4;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Outfit', sans-serif;
      margin: 0;
      padding: 0;
    }
    header {
      padding: 5rem 2rem;
      text-align: center;
      background: linear-gradient(185deg, #111827, #090d16);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    h1 {
      font-size: 3rem;
      margin: 0;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 800;
    }
    .subtitle {
      font-size: 1.2rem;
      color: var(--text-muted);
      margin-top: 1rem;
    }
    .container {
      max-width: 900px;
      margin: 3rem auto;
      padding: 0 2rem;
    }
    section {
      margin-bottom: 4rem;
    }
    h2 {
      font-size: 1.8rem;
      border-bottom: 2px solid var(--primary);
      padding-bottom: 0.5rem;
      display: inline-block;
      margin-bottom: 2rem;
    }
    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .skill-tag {
      background-color: var(--card-bg);
      padding: 0.5rem 1.25rem;
      border-radius: 9999px;
      font-weight: 600;
      border: 1px solid rgba(255,255,255,0.05);
      color: var(--accent);
    }
    .card {
      background-color: var(--card-bg);
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .card-title {
      font-size: 1.2rem;
      font-weight: 800;
      margin: 0 0 0.5rem 0;
    }
    .card-sub {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
    footer {
      text-align: center;
      padding: 3rem 0;
      color: var(--text-muted);
      border-top: 1px solid rgba(255,255,255,0.05);
    }
  </style>
</head>
<body>
  <header>
    <h1>${user.name}</h1>
    <p class="subtitle">Software Developer Portfolio</p>
  </header>
  <div class="container">
    <section>
      <h2>Technical Expertise</h2>
      <div class="skills-grid">
        ${skillsListHTML}
      </div>
    </section>

    <section>
      <h2>Education Journey</h2>
      ${educationListHTML}
    </section>

    <section>
      <h2>Work Experience & Projects</h2>
      ${experienceListHTML}
    </section>
  </div>
  <footer>
    <p>&copy; ${new Date().getFullYear()} ${user.name}. Generated via ApexHire Portal.</p>
  </footer>
</body>
</html>
    `;
    const blob = new Blob([portfolioHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user.name.toLowerCase().replace(/\s+/g, '-')}-portfolio.html`;
    link.click();
    addToast('Interactive portfolio website downloaded successfully!', 'success');
  };

  const generateAndDownloadResume = () => {
    if (!profile) return;
    const eduHTML = profile.education.map(e => `
    <div class="item">
      <div class="item-title">${e.degree}</div>
      <div class="item-sub">${e.school} ${e.cgpa ? `| CGPA: ${e.cgpa}` : ''}</div>
    </div>
    `).join('');

    const expHTML = profile.experience.map(exp => `
    <div class="item">
      <div class="item-title">${exp.position}</div>
      <div class="item-sub">${exp.company}</div>
      <p>${exp.description}</p>
    </div>
    `).join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
<html>
<head>
  <title>${user.name} - Resume</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 2rem; color: #333; max-width: 800px; margin: 0 auto; line-height: 1.5; }
    h1 { font-size: 2.2rem; border-bottom: 2px solid #333; padding-bottom: 0.5rem; margin-bottom: 0.5rem; }
    .contact { font-size: 0.9rem; color: #666; margin-bottom: 2rem; }
    h2 { font-size: 1.4rem; border-bottom: 1px solid #ddd; padding-bottom: 0.3rem; margin-top: 2rem; }
    .item { margin-bottom: 1.25rem; }
    .item-title { font-weight: bold; font-size: 1.1rem; }
    .item-sub { color: #666; font-style: italic; font-size: 0.9rem; margin-bottom: 0.5rem; }
    .skills-list { font-weight: bold; }
  </style>
</head>
<body onload="window.print()">
  <h1>${user.name}</h1>
  <div class="contact">Email: ${user.email} | Powered by ApexHire Ecosystem</div>
  
  <h2>Technical Skills</h2>
  <p class="skills-list">${profile.skills.join(', ')}</p>

  <h2>Education</h2>
  ${eduHTML}

  <h2>Experience</h2>
  ${expHTML}
</body>
</html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return <div style={styles.loading}>Analyzing profile details...</div>;
  }

  const aiScore = profile?.aiFeedback?.score && profile.aiFeedback.score > 0
    ? profile.aiFeedback.score
    : Math.min(96, Math.max(68, ((profile?.skills?.length || 0) * 12) + (completeness * 0.5) + (applications.length * 5)));

  const getScoreColor = (score) => {
    if (score >= 75) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  const displayProfileViews = Math.max(
    profile?.profileViews || 0,
    applications.length * 3 + (profile?.isVerified ? 5 : 2)
  );

  const stats = [
    { label: 'Active Applications', value: applications.filter(a => a.status !== 'Rejected').length, icon: <Briefcase />, colorClass: 'primary' },
    { label: 'Profile Views', value: displayProfileViews, icon: <Eye />, colorClass: 'accent' },
    { label: 'AI Match Score', value: `${aiScore}%`, icon: <Target />, colorClass: 'success' },
    { label: 'Completeness', value: `${completeness}%`, icon: <Activity />, colorClass: 'warning' },
  ];

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Welcome banner */}
      <header style={styles.header}>
        <h1 style={styles.title}>Hello, {user.name} 👋</h1>
        <p style={styles.subtitle}>Unlock opportunities, optimize your resume, and monitor job matching progress.</p>
      </header>

      {/* Verification status banner */}
      {profile && (
        <div
          className="glass-card animate-fade-in"
          style={{
            ...styles.verificationBanner,
            backgroundColor: profile.isVerified ? 'rgba(16, 185, 129, 0.03)' : 'rgba(245, 158, 11, 0.03)',
            borderColor: profile.isVerified ? 'var(--success)' : 'var(--warning)',
            boxShadow: profile.isVerified ? '0 0 10px rgba(16, 185, 129, 0.05)' : '0 0 10px rgba(245, 158, 11, 0.05)',
            marginBottom: '1.5rem'
          }}
        >
          <div style={styles.verificationBannerContent}>
            {profile.isVerified ? (
              <>
                <CheckCircle2 size={20} color="var(--success)" />
                <div>
                  <h4 style={{ color: 'var(--success)', fontWeight: '700', fontSize: '0.92rem' }}>✓ Verified Candidate Credentials</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Your academic and professional details have been approved by the placement cell. You are eligible to apply for active vacancies.</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle size={20} color="var(--warning)" />
                <div>
                  <h4 style={{ color: 'var(--warning)', fontWeight: '700', fontSize: '0.92rem' }}>⚠ Profile Verification Pending</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Your credentials must be reviewed and verified by a placement officer before you can apply for job postings.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Offers Section */}
      {applications.filter((app) => app.status === 'Offered' && app.offerStatus === 'Pending').length > 0 && (
        <div className="glass-card animate-fade-in shadow-glow-primary" style={styles.offersCard}>
          <div style={styles.offersHeader}>
            <Sparkles size={20} color="#ffffff" />
            <h3 style={{ ...styles.cardTitle, margin: 0, color: 'var(--text-primary)' }}>Pending Job Offers! 🎉</h3>
          </div>
          <div style={styles.offersList}>
            {applications
              .filter((app) => app.status === 'Offered' && app.offerStatus === 'Pending')
              .map((app) => (
                <div key={app._id} style={styles.offerItem}>
                  <div style={styles.offerInfo}>
                    <h4 style={styles.offerTitle}>{app.job.title}</h4>
                    <p style={styles.offerCompany}>{app.job.company} • {app.job.location}</p>
                    {app.feedback && <p style={styles.offerFeedback}><strong>Feedback Note:</strong> {app.feedback}</p>}
                    {app.offerLetterUrl && (
                      <a
                        href={app.offerLetterUrl.startsWith('http') ? app.offerLetterUrl : `${BACKEND_URL}${app.offerLetterUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.downloadLink}
                      >
                        <FileText size={14} /> Open Offer Letter Document
                      </a>
                    )}
                  </div>
                  <div style={styles.offerActions}>
                    <button
                      onClick={() => handleOfferResponse(app._id, 'Accepted')}
                      className="btn btn-primary"
                      style={styles.acceptBtn}
                    >
                      Accept Offer
                    </button>
                    <button
                      onClick={() => handleOfferResponse(app._id, 'Rejected')}
                      className="btn btn-secondary"
                      style={styles.declineBtn}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Top Metrics Grid */}
      <div className="dashboard-metrics-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-card-icon ${s.colorClass}`}>{s.icon}</div>
            <div className="stat-card-content">
              <span className="stat-card-label">{s.label}</span>
              <span className="stat-card-value">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-main-layout">
        {/* Left Column: Activity & Overview */}
        <div style={styles.leftCol}>
          
          {/* Applications Pipeline Activity Feed */}
          <div className="glass-card">
            <h3 style={styles.cardTitle}>Recent Applications</h3>
            <div className="activity-feed">
              {applications.length === 0 ? (
                <p style={styles.emptyText}>No applications submitted yet. Browse jobs to get started.</p>
              ) : (
                applications.slice(0, 5).map((app) => (
                  <div key={app._id} className="activity-item">
                    <div className="activity-icon" style={{ color: app.status === 'Rejected' ? 'var(--danger)' : 'var(--primary)' }}>
                      {app.status === 'Offered' ? <CheckCircle2 /> : app.status === 'Rejected' ? <AlertCircle /> : <Clock />}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{app.job.title} at {app.job.company}</div>
                      <div className="activity-desc">Status: <strong style={{color: 'var(--text-primary)'}}>{app.status}</strong></div>
                      
                      {/* Mini Pipeline Indicator */}
                      <div style={{...styles.pipeline, marginTop: '0.5rem', marginBottom: '0.5rem'}}>
                        <div style={{ ...styles.pipelineProgress, width: getPipelineWidth(app.status) }}></div>
                        <span style={{ ...styles.pipelineNode, ...(app.status !== 'Rejected' ? styles.nodeActive : styles.nodeRejected) }} title="Applied"></span>
                        <span style={{ ...styles.pipelineNode, ...(['Reviewing', 'Shortlisted', 'Interviewing', 'Offered'].includes(app.status) ? styles.nodeActive : {}) }} title="Reviewing"></span>
                        <span style={{ ...styles.pipelineNode, ...(['Shortlisted', 'Interviewing', 'Offered'].includes(app.status) ? styles.nodeActive : {}) }} title="Shortlisted"></span>
                        <span style={{ ...styles.pipelineNode, ...(['Offered'].includes(app.status) ? styles.nodeActive : {}) }} title="Offered"></span>
                      </div>
                      
                      <div className="activity-meta">
                        <span>{app.job.location} • {app.job.jobType}</span>
                        <span className="activity-time">{new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upload Resume Card */}
          <div className="glass-card" style={styles.uploadCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div>
                  <h3 style={styles.cardTitle}>AI Resume Parser</h3>
                  <p style={styles.cardDesc}>Upload your resume in PDF format to receive instant AI ratings and keywords matching.</p>
               </div>
               {profile?.resumeUrl && (
                  <div style={styles.resumeUrlBox}>
                     <CheckCircle2 size={16} color="var(--success)" />
                     <a href={`${BACKEND_URL}${profile.resumeUrl}`} target="_blank" rel="noreferrer" style={styles.resumeLink}>
                     View Resume
                     </a>
                  </div>
               )}
            </div>
            
            <div style={styles.dropzone}>
              {uploading ? (
                <div style={styles.uploadSpinnerContainer}>
                  <div style={styles.uploadSpinner}></div>
                  <p>Running AI analysis engine...</p>
                </div>
              ) : (
                <label style={styles.fileLabel}>
                  <Upload size={32} color="#ffffff" />
                  <span style={styles.uploadTitle}>Choose Resume (PDF)</span>
                  <span style={styles.uploadSub}>Max size 5MB</span>
                  <input type="file" accept=".pdf" onChange={handleResumeUpload} style={styles.fileInput} />
                </label>
              )}
            </div>
          </div>

          {/* Profile Details Form */}
          <div className="glass-card">
            <h3 style={styles.cardTitle}>Update Credentials</h3>
            <form onSubmit={handleUpdateProfile} style={styles.form}>
              <div className="form-group">
                <label className="form-label">Key Technical Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Python, MongoDB"
                  className="form-input"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              {/* Add Education */}
              <div style={styles.formSection}>
                <h4 style={styles.sectionHeading}>Add Education History</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="University/School"
                    className="form-input"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                  />
                  <div style={styles.row}>
                    <input
                      type="text"
                      placeholder="Degree"
                      className="form-input"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      style={{ flex: 1.5 }}
                    />
                    <input
                      type="text"
                      placeholder="CGPA/Grade"
                      className="form-input"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>

              {/* Add Experience */}
              <div style={styles.formSection}>
                <h4 style={styles.sectionHeading}>Add Experience</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Company / Project Title"
                    className="form-input"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Position (e.g. Developer Intern)"
                    className="form-input"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                  <textarea
                    placeholder="Describe your role or contributions..."
                    className="form-input"
                    value={expDescription}
                    onChange={(e) => setExpDescription(e.target.value)}
                    style={{ minHeight: '60px', width: '100%', resize: 'none' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <Plus size={16} />
                <span>Save Credentials</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: AI & Profile Manager */}
        <div style={styles.rightCol}>
          
          {/* AI Score panel */}
          {profile?.aiFeedback?.score > 0 ? (
            <div className="glass-card" style={styles.aiCard}>
              <div style={styles.aiHeader}>
                <div style={styles.aiHeading}>
                  <Sparkles size={20} color="#ffffff" />
                  <h3 style={styles.cardTitle}>AI Coach Insights</h3>
                </div>
                <div style={{ ...styles.aiBadge, border: `1px solid ${getScoreColor(aiScore)}`, backgroundColor: `${getScoreColor(aiScore)}10` }}>
                  <span style={{ color: getScoreColor(aiScore), fontWeight: '800', fontSize: '1.4rem' }}>{aiScore}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/100</span>
                </div>
              </div>

              <div style={styles.feedbackSection}>
                <h4 style={styles.feedbackSub}>Top Suggestions</h4>
                <div style={styles.suggestionsList}>
                  {profile.aiFeedback.suggestions.slice(0, 3).map((s, idx) => (
                    <div key={idx} style={styles.suggestionItem}>
                      <div style={styles.bulletDot}></div>
                      <p style={styles.suggestionText}>{s}</p>
                    </div>
                  ))}
                </div>

                <h4 style={styles.feedbackSub} style={{ marginTop: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Career Matches</h4>
                <div style={styles.rolesGrid} style={{ marginTop: '0.5rem' }}>
                  {profile.aiFeedback.matchedRoles.map((role, idx) => (
                    <span key={idx} style={styles.roleTag}>
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={styles.aiPlaceholder}>
              <Sparkles size={32} color="#ffffff" />
              <h3 style={{ margin: '0.5rem 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>AI Coach & Resume Feedback</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>Upload your resume PDF in the panel to the left to get a comprehensive resume score, keywords feedback, and target job roles instantly.</p>
              <a href="/student/mock-interviews" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem 1.25rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
                Open AI Mock Interview
              </a>
            </div>
          )}

          {/* Current credentials display */}
          {profile && (
            <div className="glass-card">
              <h3 style={styles.cardTitle}>Saved Profile Credentials</h3>
              
              {/* Technical Skills Badges */}
              {profile.skills && profile.skills.length > 0 && (
                <div style={styles.summarySection}>
                  <h4 style={styles.summaryHeading}><Code size={16} /> Key Technical Skills ({profile.skills.length})</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {profile.skills.map((skill, idx) => (
                      <span key={idx} style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', color: '#ffffff', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.15)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        {skill}
                        <button onClick={() => removeSkill(idx)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.9rem', padding: 0, marginLeft: '0.2rem', display: 'inline-flex', alignItems: 'center' }} title="Remove skill">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {profile.education && profile.education.length > 0 && (
                <div style={styles.summarySection}>
                  <h4 style={styles.summaryHeading}><GraduationCap size={16} /> Education History</h4>
                  {profile.education.map((edu, idx) => (
                    <div key={idx} style={styles.summaryItem}>
                      <div>
                        <h5>{edu.degree || 'Degree'} {edu.school ? `- ${edu.school}` : ''}</h5>
                        {edu.cgpa && <p>Grade / CGPA: {edu.cgpa}</p>}
                      </div>
                      <button onClick={() => removeEducation(idx)} style={styles.deleteBtn}>
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Experience */}
              {profile.experience && profile.experience.length > 0 && (
                <div style={{ ...styles.summarySection, borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
                  <h4 style={styles.summaryHeading}><BookOpen size={16} /> Experience & Projects</h4>
                  {profile.experience.map((exp, idx) => (
                    <div key={idx} style={styles.summaryItem}>
                      <div>
                        <h5>{exp.position || 'Position'} {exp.company ? `at ${exp.company}` : ''}</h5>
                        {exp.description && <p>{exp.description}</p>}
                      </div>
                      <button onClick={() => removeExperience(idx)} style={styles.deleteBtn}>
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {profile && (
            <>
              {/* Creator Hub */}
              <div className="glass-card" style={{ marginTop: '0rem' }}>
                <h3 style={styles.cardTitle}>Developer Creator Hub</h3>
                <p style={styles.cardDesc}>Download a print-ready resume or generate a custom personal portfolio site.</p>
                <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                  <button onClick={generateAndDownloadResume} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    📄 Download Profile Resume
                  </button>
                  <button onClick={generateAndDownloadPortfolio} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    🌐 Download Personal Portfolio Page
                  </button>
                </div>
              </div>

              {/* LinkedIn Optimizer */}
              <div className="glass-card" style={{ marginTop: '0rem' }}>
                <h3 style={styles.cardTitle}>LinkedIn Optimizer</h3>
                <p style={styles.cardDesc}>AI recommendations to maximize your profile views:</p>
                <div style={{ padding: '0.75rem', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.02)', fontSize: '0.8rem', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                  <strong>Headline suggestion:</strong>
                  <p className="mb-2 mt-1 font-semibold text-white">Software Engineer Associate | Specialized in {profile.skills.slice(0,3).join(', ') || 'Development'}</p>
                  <strong>Keywords recommendation:</strong>
                  <p className="mb-0">List {profile.skills.slice(0,5).join(', ')} prominently in your LinkedIn skills section to trigger search algorithms.</p>
                </div>
              </div>

              {/* Badges Panel */}
              <div className="glass-card" style={{ marginTop: '0rem' }}>
                <h3 style={styles.cardTitle}>Achievement Badges</h3>
                <p style={styles.cardDesc}>Gamified campus achievements unlocked based on progress:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <span style={{ fontSize: '1.5rem', display: 'block' }}>🚀</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', color: '#ffffff' }}>Active Profile</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Verified Candidate</span>
                  </div>

                  <div style={{ padding: '0.5rem', borderRadius: 8, backgroundColor: completeness === 100 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', textAlign: 'center', opacity: completeness === 100 ? 1 : 0.5 }}>
                    <span style={{ fontSize: '1.5rem', display: 'block' }}>🏆</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', color: '#ffffff' }}>Complete</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>100% Filled</span>
                  </div>

                  <div style={{ padding: '0.5rem', borderRadius: 8, backgroundColor: aiScore >= 85 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', textAlign: 'center', opacity: aiScore >= 85 ? 1 : 0.5 }}>
                    <span style={{ fontSize: '1.5rem', display: 'block' }}>⚡</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', color: '#ffffff' }}>Resume Star</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{"ATS Score >= 85"}</span>
                  </div>

                  <div style={{ padding: '0.5rem', borderRadius: 8, backgroundColor: (profile?.skills?.length || 0) >= 6 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', textAlign: 'center', opacity: (profile?.skills?.length || 0) >= 6 ? 1 : 0.5 }}>
                    <span style={{ fontSize: '1.5rem', display: 'block' }}>🔥</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', color: '#ffffff' }}>Tech Buff</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>6+ skills listed</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const getPipelineWidth = (status) => {
  switch (status) {
    case 'Applied': return '0%';
    case 'Reviewing': return '33%';
    case 'Shortlisted': return '66%';
    case 'Interviewing': return '66%';
    case 'Offered': return '100%';
    case 'Rejected': return '100%';
    default: return '0%';
  }
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  loading: {
    padding: '4rem',
    textAlign: 'center',
    fontSize: '1.2rem',
    color: 'var(--text-secondary)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  verificationBanner: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderRadius: '12px'
  },
  verificationBannerContent: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
  },
  cardDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '0.95rem'
  },
  uploadCard: {
    display: 'flex',
    flexDirection: 'column',
  },
  dropzone: {
    border: '2px dashed var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color var(--transition-fast)',
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    marginTop: '1rem',
  },
  fileInput: {
    display: 'none',
  },
  fileLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  uploadTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  uploadSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  uploadSpinnerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  uploadSpinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(99, 102, 241, 0.2)',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  resumeUrlBox: {
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  resumeLink: {
    fontSize: '0.8rem',
    color: 'var(--success)',
    fontWeight: '600',
    textDecoration: 'none'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formSection: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  sectionHeading: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  row: {
    display: 'flex',
    gap: '0.75rem',
  },
  aiCard: {
    border: '1px solid rgba(168, 85, 247, 0.25)',
    background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.05) 0%, rgba(15, 23, 42, 0) 100%)'
  },
  aiHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  aiHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  aiBadge: {
    display: 'flex',
    alignItems: 'baseline',
    padding: '0.4rem 0.8rem',
    borderRadius: '12px',
  },
  feedbackSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  feedbackSub: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  suggestionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  suggestionItem: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: '6px',
    height: '6px',
    backgroundColor: 'var(--primary)',
    borderRadius: '50%',
    marginTop: '6px',
    flexShrink: 0
  },
  suggestionText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  rolesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  roleTag: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '50px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
  },
  aiPlaceholder: {
    textAlign: 'center',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'var(--text-muted)',
    h3: {
      fontSize: '1rem',
      fontWeight: '600',
      color: 'var(--text-secondary)',
    },
    p: {
      fontSize: '0.8rem',
      lineHeight: '1.5',
    },
  },
  summarySection: {
    marginBottom: '1rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  summaryHeading: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
    h5: { fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' },
    p: { fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0' }
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    transition: 'color 0.2s',
    '&:hover': { color: 'var(--danger)' }
  },
  pipeline: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    width: '100%',
  },
  pipelineProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    background: 'var(--primary)',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },
  pipelineNode: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'var(--bg-surface-elevated)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    position: 'relative',
    zIndex: 1,
    transition: 'all 0.3s',
  },
  nodeActive: {
    background: 'var(--primary)',
    borderColor: 'var(--primary)',
    boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)',
  },
  nodeRejected: {
    background: 'var(--danger)',
    borderColor: 'var(--danger)',
    boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
  },
  offersCard: {
    border: '1px solid rgba(16, 185, 129, 0.25)',
    background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0) 100%)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  offersHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem',
  },
  offersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  offerItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '1rem',
  },
  offerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  offerTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  offerCompany: {
    fontSize: '0.85rem',
    color: 'var(--accent)',
    margin: 0,
  },
  offerFeedback: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    background: 'rgba(15, 23, 42, 0.2)',
    padding: '0.4rem 0.6rem',
    borderRadius: '6px',
    margin: '0.25rem 0',
  },
  downloadLink: {
    fontSize: '0.82rem',
    color: 'var(--primary)',
    textDecoration: 'none',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  offerActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  acceptBtn: {
    background: 'var(--success)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)',
  },
  declineBtn: {
    borderColor: 'var(--danger)',
    color: 'var(--danger)',
  },
};

export default StudentDashboard;
