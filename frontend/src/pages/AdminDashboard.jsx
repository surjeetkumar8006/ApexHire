import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Users, Briefcase, FileCheck, CheckCircle2, TrendingUp, Sparkles, FileText, Search, Download, X, Award, GraduationCap, BookOpen, ShieldAlert, ShieldCheck, Megaphone, Github, Linkedin, Globe, ExternalLink, Code2, Cpu, Trophy } from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard = ({ view = 'overview' }) => {
  const { authHeader } = useAuth();
  const { addToast } = useNotification();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalJobs: 0,
    totalApplications: 0,
    offeredApplications: 0,
    pendingReviews: 0,
    avgScore: 0,
    placementRate: 0,
  });
  const [profiles, setProfiles] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Directory UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [analyticsTab, setAnalyticsTab] = useState('pipeline'); // 'pipeline' | 'skills'
  const [matchJobId, setMatchJobId] = useState(''); // '' means All Candidates

  // Eligibility & Batch Manager States
  const [minCgpa, setMinCgpa] = useState(0);
  const [minScore, setMinScore] = useState(0);
  const [placedStatus, setPlacedStatus] = useState('All');
  const [verifiedStatus, setVerifiedStatus] = useState('All');
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  const [showBulkBroadcastModal, setShowBulkBroadcastModal] = useState(false);
  const [bulkBroadcastTitle, setBulkBroadcastTitle] = useState('');
  const [bulkBroadcastMessage, setBulkBroadcastMessage] = useState('');
  const [bulkBroadcasting, setBulkBroadcasting] = useState(false);

  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Announcement States
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  const fetchData = async () => {
    try {
      const [profilesRes, jobsRes, appsRes] = await Promise.all([
        fetch(`${API_BASE}/profile/all`, { headers: authHeader() }),
        fetch(`${API_BASE}/jobs`, { headers: authHeader() }),
        fetch(`${API_BASE}/applications/all`, { headers: authHeader() }),
      ]);

      if (profilesRes.ok && jobsRes.ok && appsRes.ok) {
        const profilesData = await profilesRes.json();
        const jobsData = await jobsRes.json();
        const appsData = await appsRes.json();

        setProfiles(profilesData);
        setApplications(appsData);
        setJobs(jobsData);

        // Calculate dynamic metrics
        const uniquePlacedStudentIds = new Set(
          appsData.filter((app) => app.status === 'Offered').map((app) => app.student?._id)
        );
        const offeredCount = appsData.filter((app) => app.status === 'Offered').length;
        const pendingCount = appsData.filter((app) => app.status === 'Applied' || app.status === 'Reviewing').length;
        
        const scoredProfiles = profilesData.filter((p) => p.aiFeedback?.score > 0);
        const avgResumeScore = scoredProfiles.length > 0
          ? Math.round(scoredProfiles.reduce((sum, p) => sum + p.aiFeedback.score, 0) / scoredProfiles.length)
          : 0;
          
        const placementRate = profilesData.length > 0
          ? Math.round((uniquePlacedStudentIds.size / profilesData.length) * 100)
          : 0;

        setStats({
          totalStudents: profilesData.length,
          totalJobs: jobsData.length,
          totalApplications: appsData.length,
          offeredApplications: offeredCount,
          pendingReviews: pendingCount,
          avgScore: avgResumeScore,
          placementRate,
        });
      }
    } catch (err) {
      console.error('Failed to load admin stats data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toggle Verification
  const handleToggleVerification = async (profileId) => {
    try {
      const res = await fetch(`${API_BASE}/profile/verify/${profileId}`, {
        method: 'PUT',
        headers: authHeader(),
      });
      
      if (res.ok) {
        const updatedProfile = await res.json();
        addToast(
          `Student verification status updated: ${updatedProfile.isVerified ? 'VERIFIED' : 'UNVERIFIED'}`,
          'success'
        );
        
        // Update states
        setProfiles((prev) =>
          prev.map((p) => (p._id === profileId ? { ...p, isVerified: updatedProfile.isVerified } : p))
        );
        setSelectedStudent((prev) => ({ ...prev, isVerified: updatedProfile.isVerified }));
      } else {
        throw new Error('Failed to update verification status');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Broadcast Placement Announcement
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) {
      addToast('Please enter both announcement title and message body', 'warning');
      return;
    }

    setBroadcasting(true);
    try {
      const res = await fetch(`${API_BASE}/notifications/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({ title: broadcastTitle, message: broadcastMessage }),
      });

      if (res.ok) {
        addToast('Announcement broadcasted successfully to all students!', 'success');
        setBroadcastTitle('');
        setBroadcastMessage('');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Announcement broadcast failed');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setBroadcasting(false);
    }
  };

  // Export Placement Report to CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Student Name,Email,Skills,AI Score,Degree,School,CGPA,Experience Count,Status,Verified\n';

    profiles.forEach((p) => {
      const name = p.user?.name || 'N/A';
      const email = p.user?.email || 'N/A';
      const skillsStr = p.skills.join('; ');
      const score = p.aiFeedback?.score || '0';
      const degree = p.education[0]?.degree || 'N/A';
      const school = p.education[0]?.school || 'N/A';
      const cgpa = p.education[0]?.cgpa || 'N/A';
      const expCount = p.experience?.length || 0;
      const verified = p.isVerified ? 'Yes' : 'No';

      // Check placement status
      const isPlaced = applications.some((app) => app.student?._id === p.user?._id && app.status === 'Offered');
      const status = isPlaced ? 'Placed' : 'Seeking Opportunities';

      const row = `"${name}","${email}","${skillsStr}","${score}","${degree}","${school}","${cgpa}",${expCount},"${status}","${verified}"`;
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AccioPlacement_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div style={styles.loading}>Aggregating placement portal analytics...</div>;
  }

  // Prep data for Recharts status bar graph
  const statusCounts = {
    Applied: 0,
    Reviewing: 0,
    Shortlisted: 0,
    Offered: 0,
    Rejected: 0,
  };

  applications.forEach((app) => {
    if (statusCounts[app.status] !== undefined) {
      statusCounts[app.status] += 1;
    }
  });

  const chartData = Object.keys(statusCounts).map((key) => ({
    name: key,
    value: statusCounts[key],
  }));

  const COLORS = ['#3b82f6', '#f59e0b', '#a855f7', '#10b981', '#ef4444'];

  // Top Skills Distribution Aggregation
  const getSkillsDistribution = () => {
    const skillsFreq = {};
    profiles.forEach((p) => {
      p.skills.forEach((sk) => {
        const cleanSk = sk.trim();
        if (cleanSk) {
          const displaySk = cleanSk.charAt(0).toUpperCase() + cleanSk.slice(1).toLowerCase();
          skillsFreq[displaySk] = (skillsFreq[displaySk] || 0) + 1;
        }
      });
    });

    return Object.keys(skillsFreq)
      .map((name) => ({ name, count: skillsFreq[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const topSkills = getSkillsDistribution();

  const getStudentMatchScore = (studentProfile, job) => {
    if (!job) return { score: studentProfile.aiFeedback?.score || 0, matched: [], missing: [] };
    
    const requirements = job.requirements && job.requirements.length > 0
      ? job.requirements
      : [job.title];

    const studentSkills = (studentProfile.skills || []).map(s => s.toLowerCase().trim());
    const jobReqs = requirements.map(r => r.toLowerCase().trim());

    const matched = [];
    const missing = [];

    requirements.forEach(req => {
      const cleanReq = req.toLowerCase().trim();
      const isMatched = studentSkills.some(skill => skill.includes(cleanReq) || cleanReq.includes(skill));
      if (isMatched) {
        matched.push(req);
      } else {
        missing.push(req);
      }
    });

    const skillScore = jobReqs.length > 0 ? (matched.length / jobReqs.length) * 100 : 100;
    const resumeScore = studentProfile.aiFeedback?.score || 0;
    const finalScore = Math.round((skillScore * 0.6) + (resumeScore * 0.4));
    return { score: finalScore, matched, missing };
  };

  // Dynamic Activity Feed aggregation from database arrays
  const getRecentActivities = () => {
    const activities = [];

    // 1. Extract applications
    applications.forEach(app => {
      if (app.student && app.job) {
        activities.push({
          type: 'application',
          title: 'New Job Application',
          description: `${app.student.name || 'Student'} applied to ${app.job.title} at ${app.job.company}.`,
          timestamp: new Date(app.createdAt),
          status: app.status
        });
      }
    });

    // 2. Extract AI resume scores & profile updates
    profiles.forEach(p => {
      if (p.user) {
        if (p.aiFeedback?.score > 0) {
          activities.push({
            type: 'resume',
            title: 'Resume Analyzed',
            description: `${p.user.name} uploaded a resume. AI Score: ${p.aiFeedback.score}/100.`,
            timestamp: new Date(p.updatedAt || p.createdAt)
          });
        }
        if (p.isVerified) {
          activities.push({
            type: 'verification',
            title: 'Student Verified',
            description: `${p.user.name} has been verified by the placement administration.`,
            timestamp: new Date(p.updatedAt || p.createdAt)
          });
        }
      }
    });

    // Sort by timestamp descending
    activities.sort((a, b) => b.timestamp - a.timestamp);
    return activities.slice(0, 15); // Get top 15 recent activities
  };

  // Bulk Verification Handler
  const handleBulkVerify = async () => {
    if (selectedStudents.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedStudents.map(profileId =>
          fetch(`${API_BASE}/profile/verify/${profileId}`, {
            method: 'PUT',
            headers: authHeader(),
          })
        )
      );
      addToast(`Successfully verified ${selectedStudents.length} student profiles in bulk!`, 'success');
      setProfiles(prev =>
        prev.map(p => selectedStudents.includes(p._id) ? { ...p, isVerified: true } : p)
      );
      setSelectedStudents([]);
    } catch (err) {
      addToast('Bulk verification failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Bulk Targeted Broadcast Handler
  const handleBulkBroadcast = async (e) => {
    e.preventDefault();
    if (!bulkBroadcastTitle || !bulkBroadcastMessage || selectedStudents.length === 0) {
      addToast('Please enter both announcement title and message body', 'warning');
      return;
    }
    setBulkBroadcasting(true);
    try {
      const res = await fetch(`${API_BASE}/notifications/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ 
          title: `[Targeted] ${bulkBroadcastTitle}`, 
          message: bulkBroadcastMessage 
        })
      });
      if (res.ok) {
        addToast(`Targeted broadcast notification sent successfully to selected candidates!`, 'success');
        setBulkBroadcastTitle('');
        setBulkBroadcastMessage('');
        setShowBulkBroadcastModal(false);
        setSelectedStudents([]);
      } else {
        throw new Error('Broadcast failed');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setBulkBroadcasting(false);
    }
  };

  // Export current filtered eligibility list to CSV
  const handleExportEligibilityCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Student Name,Email,Skills,AI Score,CGPA,Placement Status,Verification\n';

    eligibilityProfiles.forEach((p) => {
      const name = p.user?.name || 'N/A';
      const email = p.user?.email || 'N/A';
      const skillsStr = p.skills.join('; ');
      const score = p.resumeScore || '0';
      const cgpa = p.cgpa || '0';
      const status = p.isPlaced ? 'Placed' : 'Seeking Opportunities';
      const verified = p.isVerified ? 'Verified' : 'Pending';

      const row = `"${name}","${email}","${skillsStr}","${score}","${cgpa}","${status}","${verified}"`;
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AccioPlacement_EligibilityReport_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort for the Batch Eligibility Grid Table
  const eligibilityProfiles = (() => {
    let list = profiles.map(p => {
      const isPlaced = applications.some((app) => app.student?._id === p.user?._id && app.status === 'Offered');
      const cgpa = p.education && p.education[0] ? parseFloat(p.education[0].cgpa || 0) : 0;
      const dsaCount = p.problemSolving?.total || 0;
      return { 
        ...p, 
        isPlaced, 
        cgpa, 
        dsaCount,
        resumeScore: p.aiFeedback?.score || 0 
      };
    });

    list = list.filter(p => {
      if (minCgpa > 0 && p.cgpa < minCgpa) return false;
      if (minScore > 0 && p.resumeScore < minScore) return false;
      if (placedStatus === 'Placed' && !p.isPlaced) return false;
      if (placedStatus === 'Unplaced' && p.isPlaced) return false;
      if (verifiedStatus === 'Verified' && !p.isVerified) return false;
      if (verifiedStatus === 'Pending' && p.isVerified) return false;

      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const name = p.user?.name?.toLowerCase() || '';
        const email = p.user?.email?.toLowerCase() || '';
        const skillMatch = p.skills.some((s) => s.toLowerCase().includes(query));
        if (!name.includes(query) && !email.includes(query) && !skillMatch) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let valA, valB;
      if (sortField === 'name') {
        valA = a.user?.name || '';
        valB = b.user?.name || '';
      } else if (sortField === 'cgpa') {
        valA = a.cgpa;
        valB = b.cgpa;
      } else if (sortField === 'score') {
        valA = a.resumeScore;
        valB = b.resumeScore;
      } else if (sortField === 'dsa') {
        valA = a.dsaCount;
        valB = b.dsaCount;
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
    });

    return list;
  })();

  // Filter & Rank Profiles dynamically
  const filteredProfiles = (() => {
    let list = profiles.map(p => {
      if (matchJobId) {
        const job = jobs.find(j => j._id === matchJobId);
        const matchData = getStudentMatchScore(p, job);
        return { 
          ...p, 
          matchScore: matchData.score, 
          matchedSkills: matchData.matched, 
          missingSkills: matchData.missing 
        };
      }
      return { ...p, matchScore: p.aiFeedback?.score || 0 };
    });

    // Apply search filter
    list = list.filter((p) => {
      const name = p.user?.name?.toLowerCase() || '';
      const email = p.user?.email?.toLowerCase() || '';
      const skillMatch = p.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
      return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase()) || skillMatch;
    });

    if (matchJobId) {
      list.sort((a, b) => b.matchScore - a.matchScore);
    }
    
    return list;
  })();

  // Render Student Modal in Portal
  const renderStudentModal = () => {
    if (!selectedStudent) return null;

    // Safety checks for fields
    const skills = selectedStudent.skills || [];
    const education = selectedStudent.education || [];
    const experience = selectedStudent.experience || [];
    const projects = selectedStudent.projects || [];
    const portfolioLinks = selectedStudent.portfolioLinks || [];
    const achievements = selectedStudent.achievements || [];
    const problemSolving = selectedStudent.problemSolving || { total: 0, easy: 0, medium: 0, hard: 0 };
    
    // Check if the student has any filled sections (to customize premium empty state messages)
    const hasProjects = projects.length > 0;
    const hasPortfolio = portfolioLinks.length > 0;
    const hasAchievements = achievements.length > 0;
    const hasProblemSolving = problemSolving.total > 0 || problemSolving.easy > 0 || problemSolving.medium > 0 || problemSolving.hard > 0;

    return createPortal(
      <div style={styles.modalOverlay} onClick={() => setSelectedStudent(null)}>
        <div className="animate-fade-in" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          
          {/* Header Banner */}
          <div style={styles.modalBanner}>
            <button onClick={() => setSelectedStudent(null)} style={styles.modalCloseBtn}>
              <X size={18} />
            </button>
            <div style={styles.modalAvatarWrap}>
              <div style={styles.modalAvatar}>
                {selectedStudent.user?.name ? selectedStudent.user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <h2 style={styles.modalName}>{selectedStudent.user?.name || 'Student Profile'}</h2>
                  {selectedStudent.isVerified ? (
                    <span style={styles.verifiedBadge}><ShieldCheck size={13} /> Verified</span>
                  ) : (
                    <span style={styles.unverifiedBadge}><ShieldAlert size={13} /> Unverified</span>
                  )}
                </div>
                <p style={styles.modalEmail}>{selectedStudent.user?.email}</p>
              </div>
            </div>
            
            <div style={styles.modalActions}>
              <button
                onClick={() => handleToggleVerification(selectedStudent._id)}
                className="btn"
                style={{
                  background: selectedStudent.isVerified ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                  color: selectedStudent.isVerified ? '#f87171' : '#34d399',
                  border: `1px solid ${selectedStudent.isVerified ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.35)'}`,
                  fontSize: '0.82rem',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
              >
                {selectedStudent.isVerified ? 'Revoke Verification' : 'Verify Student'}
              </button>
              {selectedStudent.resumeUrl && (
                <a
                  href={`https://apexhire.onrender.com${selectedStudent.resumeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.5rem 1rem', textDecoration: 'none' }}
                >
                  <FileText size={14} />
                  <span>Open Resume</span>
                </a>
              )}
            </div>
          </div>

          {/* Modal Body */}
          <div style={styles.modalBody}>
            {/* Grid Container for Layout */}
            <div style={styles.modalBodyGrid}>
              
              {/* Left Column - Main Details */}
              <div style={styles.modalMainCol}>
                
                {/* AI Score Section */}
                {selectedStudent.aiFeedback?.score > 0 ? (
                  <div style={styles.aiAssessmentBox}>
                    <div style={styles.aiAssessmentHeading}>
                      <Sparkles size={16} color="var(--accent)" />
                      <h4 style={{ color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>AI Resume Quality Assessment</h4>
                    </div>
                    <div style={styles.aiBreakdown}>
                      <div style={{ ...styles.largeScoreBadge, border: `2px solid ${COLORS[3]}`, backgroundColor: `${COLORS[3]}10` }}>
                        <span style={{ color: COLORS[3] }}>{selectedStudent.aiFeedback.score}</span>
                        <span style={styles.scoreScale}>/100</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h5 style={styles.metaSubLabel}>Matched Placements:</h5>
                        <div style={styles.modalTags}>
                          {selectedStudent.aiFeedback.matchedRoles?.map((role, i) => (
                            <span key={i} style={styles.modalTagAccent}>{role}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={styles.aiSuggestionsBlock}>
                      <h5 style={styles.metaSubLabel}>Optimization Suggestions:</h5>
                      <ul style={styles.bulletList}>
                        {selectedStudent.aiFeedback.suggestions?.map((suggestion, i) => (
                          <li key={i} style={styles.bulletItem}>
                            <div style={styles.bulletDot}></div>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div style={styles.premiumEmptyCard}>
                    <div style={styles.emptyIconContainer}>
                      <Sparkles size={24} color="var(--text-muted)" />
                    </div>
                    <h5 style={styles.emptyTitle}>AI Feedback Pending</h5>
                    <p style={styles.emptyTextSub}>No resume parsed. Ask this student to upload their PDF CV in the student portal dashboard.</p>
                  </div>
                )}

                {/* Skills Inventory */}
                <div style={styles.modalSection}>
                  <h4 style={styles.sectionHeading}>
                    <Award size={15} color="var(--primary)" />
                    <span>Skills Inventory</span>
                  </h4>
                  <div style={styles.modalTags}>
                    {skills.length === 0 ? (
                      <div style={styles.premiumEmptyCardInline}>
                        <Award size={16} color="var(--text-muted)" />
                        <span style={styles.emptyTextSubInline}>No key skills entered.</span>
                      </div>
                    ) : (
                      skills.map((sk, idx) => (
                        <span key={idx} style={styles.modalTag}>{sk}</span>
                      ))
                    )}
                  </div>
                </div>

                {/* Projects */}
                <div style={styles.modalSection}>
                  <h4 style={styles.sectionHeading}>
                    <Cpu size={15} color="var(--secondary)" />
                    <span>Academic & Independent Projects</span>
                  </h4>
                  {projects.length === 0 ? (
                    <div style={styles.premiumEmptyCardInline}>
                      <Cpu size={16} color="var(--text-muted)" />
                      <span style={styles.emptyTextSubInline}>No project listings recorded.</span>
                    </div>
                  ) : (
                    <div style={styles.projectList}>
                      {projects.map((proj, idx) => (
                        <div key={idx} style={styles.projectCard}>
                          <div style={styles.projectHeader}>
                            <div style={styles.projectTitleContainer}>
                              <strong style={styles.projectTitle}>{proj.title}</strong>
                              {proj.link && (
                                <a href={proj.link} target="_blank" rel="noreferrer" style={styles.projectLink}>
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          </div>
                          {proj.description && <p style={styles.projectDesc}>{proj.description}</p>}
                          {proj.technologies && proj.technologies.length > 0 && (
                            <div style={styles.projectTechBox}>
                              {proj.technologies.map((tech, i) => (
                                <span key={i} style={styles.projectTechTag}>{tech}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Education Background */}
                <div style={styles.modalSection}>
                  <h4 style={styles.sectionHeading}>
                    <GraduationCap size={15} color="var(--secondary)" />
                    <span>Education Background</span>
                  </h4>
                  {education.length === 0 ? (
                    <div style={styles.premiumEmptyCardInline}>
                      <GraduationCap size={16} color="var(--text-muted)" />
                      <span style={styles.emptyTextSubInline}>No education listings recorded.</span>
                    </div>
                  ) : (
                    <div style={styles.historyList}>
                      {education.map((edu, idx) => (
                        <div key={idx} style={styles.historyCard}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{edu.degree}</strong>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8.rem' }}>
                              {edu.school} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}
                            </span>
                            {(edu.startYear || edu.endYear) && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                {edu.startYear || 'N/A'} - {edu.endYear || 'Present'}
                              </span>
                            )}
                          </div>
                          {edu.cgpa && <span style={styles.cgpaBadge}>CGPA: {edu.cgpa}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Work Experience */}
                <div style={styles.modalSection}>
                  <h4 style={styles.sectionHeading}>
                    <BookOpen size={15} color="var(--accent)" />
                    <span>Work Experience</span>
                  </h4>
                  {experience.length === 0 ? (
                    <div style={styles.premiumEmptyCardInline}>
                      <BookOpen size={16} color="var(--text-muted)" />
                      <span style={styles.emptyTextSubInline}>No professional work experience recorded.</span>
                    </div>
                  ) : (
                    <div style={styles.historyList}>
                      {experience.map((exp, idx) => (
                        <div key={idx} style={styles.experienceCard}>
                          <div style={styles.expHeader}>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{exp.position}</strong>
                            <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}> @ {exp.company}</span>
                            {exp.duration && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 'auto' }}>{exp.duration}</span>}
                          </div>
                          {exp.description && <p style={styles.expDesc}>{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column - Side Panels / Stats */}
              <div style={styles.modalSidebarCol}>
                
                {/* Professional Links */}
                <div style={styles.modalSection}>
                  <h5 style={styles.sidebarSectionHeading}>Professional Links</h5>
                  {portfolioLinks.length === 0 ? (
                    <div style={styles.premiumEmptyCardInline}>
                      <Globe size={14} color="var(--text-muted)" />
                      <span style={styles.emptyTextSubInline}>No links recorded.</span>
                    </div>
                  ) : (
                    <div style={styles.portfolioBox}>
                      {portfolioLinks.map((link, idx) => {
                        const isGithub = link.platform?.toLowerCase() === 'github';
                        const isLinkedin = link.platform?.toLowerCase() === 'linkedin';
                        return (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.portfolioLinkBtn}
                          >
                            {isGithub ? <Github size={14} /> : isLinkedin ? <Linkedin size={14} /> : <Globe size={14} />}
                            <span style={{ textTransform: 'capitalize' }}>{link.platform || 'Portfolio'}</span>
                            <ExternalLink size={10} style={{ marginLeft: 'auto', opacity: 0.7 }} />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Problem Solving Profile */}
                <div style={styles.modalSection}>
                  <h5 style={styles.sidebarSectionHeading}>Problem Solving</h5>
                  <div style={styles.problemSolvingBox}>
                    <div style={styles.problemSolvingHeader}>
                      <Code2 size={16} color="var(--accent)" />
                      <span style={styles.problemSolvingTotalCount}>{problemSolving.total || 0}</span>
                      <span style={styles.problemSolvingTotalLabel}>Solved</span>
                    </div>
                    <div style={styles.problemSolvingDetails}>
                      <div style={styles.problemSolvingRow}>
                        <span style={{ ...styles.difficultyDot, backgroundColor: '#10b981' }}></span>
                        <span style={styles.difficultyLabel}>Easy</span>
                        <span style={styles.difficultyCount}>{problemSolving.easy || 0}</span>
                      </div>
                      <div style={styles.problemSolvingRow}>
                        <span style={{ ...styles.difficultyDot, backgroundColor: '#f59e0b' }}></span>
                        <span style={styles.difficultyLabel}>Medium</span>
                        <span style={styles.difficultyCount}>{problemSolving.medium || 0}</span>
                      </div>
                      <div style={{ ...styles.problemSolvingRow, marginBottom: 0 }}>
                        <span style={{ ...styles.difficultyDot, backgroundColor: '#ef4444' }}></span>
                        <span style={styles.difficultyLabel}>Hard</span>
                        <span style={styles.difficultyCount}>{problemSolving.hard || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div style={styles.modalSection}>
                  <h5 style={styles.sidebarSectionHeading}>Achievements</h5>
                  {achievements.length === 0 ? (
                    <div style={styles.premiumEmptyCardInline}>
                      <Trophy size={14} color="var(--text-muted)" />
                      <span style={styles.emptyTextSubInline}>No achievements.</span>
                    </div>
                  ) : (
                    <ul style={styles.achievementList}>
                      {achievements.map((ach, idx) => (
                        <li key={idx} style={styles.achievementItem}>
                          <Trophy size={12} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Application Timeline Status */}
                <div style={styles.modalSection}>
                  <h5 style={styles.sidebarSectionHeading}>Applications ({applications.filter((app) => app.student?._id === selectedStudent.user?._id).length})</h5>
                  {applications.filter((app) => app.student?._id === selectedStudent.user?._id).length === 0 ? (
                    <div style={styles.premiumEmptyCardInline}>
                      <Briefcase size={14} color="var(--text-muted)" />
                      <span style={styles.emptyTextSubInline}>No applications.</span>
                    </div>
                  ) : (
                    <div style={styles.sidebarAppList}>
                      {applications
                        .filter((app) => app.student?._id === selectedStudent.user?._id)
                        .map((app) => (
                          <div key={app._id} style={styles.sidebarAppCard}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', maxWidth: '70%' }}>
                              <strong style={{ color: 'var(--text-primary)', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.job?.title}</strong>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.job?.company}</span>
                            </div>
                            <span
                              className={`badge badge-${app.status.toLowerCase()}`}
                              style={{ fontSize: '0.68rem', padding: '0.15rem 0.35rem' }}
                            >
                              {app.status}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>,
      document.body
    );
  };

  if (view === 'students') {
    return (
      <div style={styles.container} className="animate-fade-in">
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Student Talent Directory</h1>
            <p style={styles.subtitle}>Browse and verify student profiles, academic CGPAs, and parsed resume parameters.</p>
          </div>
          <button onClick={handleExportCSV} className="btn btn-primary" style={styles.exportBtn}>
            <Download size={16} />
            <span>Export Student Directory</span>
          </button>
        </header>

        <div className="glass-card" style={{ ...styles.studentBlock, maxHeight: 'none' }}>
          <div style={styles.directoryHeader}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 w-100">
              <div className="d-flex align-items-center gap-2">
                <div 
                  className="d-flex align-items-center justify-content-center text-primary" 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    background: 'var(--primary-glow)', 
                    flexShrink: 0 
                  }}
                >
                  <Users size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.2px' }}>
                    Registered Candidates ({filteredProfiles.length})
                  </h3>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Browse and match student profiles</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={matchJobId}
                  onChange={(e) => setMatchJobId(e.target.value)}
                  className="form-select form-select-compact"
                  style={{ 
                    width: '180px', 
                    cursor: 'pointer'
                  }}
                >
                  <option value="">🔍 View All Candidates</option>
                  {jobs.map(job => (
                    <option key={job._id} value={job._id}>
                      🎯 {job.company} - {job.title}
                    </option>
                  ))}
                </select>

                <div style={{ ...styles.searchContainer, width: '220px' }}>
                  <Search size={16} style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search name, email, skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', fontSize: '0.85rem', height: '38px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...styles.studentList, maxHeight: 'none' }}>
            {filteredProfiles.length === 0 ? (
              <p style={styles.emptyText}>No matching students found.</p>
            ) : (
              filteredProfiles.map((p) => (
                <div
                  key={p._id}
                  style={styles.studentItem}
                  onClick={() => setSelectedStudent(p)}
                  title="Click to view detailed profile"
                >
                  <div style={styles.studentMeta}>
                    <div style={styles.studentAvatar}>
                      <span>{p.user?.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <h4 style={styles.studentName}>{p.user?.name}</h4>
                        {p.isVerified ? (
                          <ShieldCheck size={14} color="var(--success)" title="Verified Profile" />
                        ) : (
                          <ShieldAlert size={14} color="var(--warning)" title="Pending Verification" />
                        )}
                      </div>
                      <p style={styles.studentEmail}>{p.user?.email}</p>
                      {matchJobId && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.4rem' }}>
                          {p.matchedSkills.slice(0, 3).map((s, i) => (
                            <span key={i} className="badge bg-success-glow text-success" style={{ padding: '1px 6px', fontSize: '0.62rem', border: '1px solid rgba(16,185,129,0.2)' }}>✓ {s}</span>
                          ))}
                          {p.missingSkills.slice(0, 3).map((s, i) => (
                            <span key={i} className="badge bg-danger-glow text-danger" style={{ padding: '1px 6px', fontSize: '0.62rem', border: '1px solid rgba(239,68,68,0.2)' }}>✗ {s}</span>
                          ))}
                          {(p.matchedSkills.length > 3 || p.missingSkills.length > 3) && (
                            <span className="text-muted" style={{ fontSize: '0.6rem', alignSelf: 'center' }}>+more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills preview tags */}
                  <div style={styles.skillsBox}>
                    {p.skills.slice(0, 4).map((sk, idx) => (
                      <span key={idx} style={styles.miniTag}>
                        {sk}
                      </span>
                    ))}
                    {p.skills.length > 4 && (
                      <span style={styles.moreTag}>+{p.skills.length - 4} more</span>
                    )}
                  </div>

                  {/* Match score or AI rating score badge */}
                  {matchJobId ? (
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: p.matchScore >= 80 ? 'rgba(16,185,129,0.1)' : p.matchScore >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${p.matchScore >= 80 ? 'var(--success)' : p.matchScore >= 50 ? 'var(--warning)' : 'var(--danger)'}`,
                        color: p.matchScore >= 80 ? 'var(--success)' : p.matchScore >= 50 ? 'var(--warning)' : 'var(--danger)',
                        height: 'fit-content'
                      }}
                    >
                      <Sparkles size={11} />
                      <span>{p.matchScore}% Match</span>
                    </div>
                  ) : p.aiFeedback?.score > 0 ? (
                    <div style={{ ...styles.scoreBadge, backgroundColor: `${COLORS[3]}10`, border: `1px solid ${COLORS[3]}` }}>
                      <Sparkles size={11} color={COLORS[3]} />
                      <span style={{ color: COLORS[3], fontWeight: '700' }}>{p.aiFeedback.score}</span>
                    </div>
                  ) : (
                    <span style={styles.noScoreBadge}>No Resume</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {renderStudentModal()}
      </div>
    );
  }

  if (view === 'eligibility') {
    // Pagination calculation
    const totalEligible = eligibilityProfiles.length;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedProfiles = eligibilityProfiles.slice(startIndex, startIndex + pageSize);
    const totalPages = Math.ceil(totalEligible / pageSize) || 1;

    const handleSelectAll = (checked) => {
      if (checked) {
        setSelectedStudents(paginatedProfiles.map(p => p._id));
      } else {
        setSelectedStudents([]);
      }
    };

    const handleSelectOne = (checked, profileId) => {
      if (checked) {
        setSelectedStudents(prev => [...prev, profileId]);
      } else {
        setSelectedStudents(prev => prev.filter(id => id !== profileId));
      }
    };

    const toggleSort = (field) => {
      if (sortField === field) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    };

    const activities = getRecentActivities();

    return (
      <div style={styles.container} className="animate-fade-in">
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Talent & Batch Manager</h1>
            <p style={styles.subtitle}>Filter the cohort by CGPA and resume score, manage verifications, and monitor platform audit logs.</p>
          </div>
          <button onClick={handleExportEligibilityCSV} className="btn btn-primary" style={styles.exportBtn}>
            <Download size={16} />
            <span>Export Eligible CSV</span>
          </button>
        </header>

        {/* Filters Panel */}
        <div className="glass-card p-4 d-flex flex-column gap-3 mb-4">
          <h4 style={{ fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem', marginBottom: '0.25rem' }}>
            <Sparkles size={16} className="text-primary" />
            <span>Cohort Eligibility Filters</span>
          </h4>
          <div className="row g-3">
            <div className="col-md-3 col-sm-6">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Min CGPA Threshold ({minCgpa > 0 ? minCgpa : 'Any'})</label>
              <input 
                type="range" 
                min="0" 
                max="10" 
                step="0.5" 
                value={minCgpa} 
                onChange={(e) => { setMinCgpa(parseFloat(e.target.value)); setCurrentPage(1); }} 
                className="premium-range-slider w-100"
              />
            </div>
            <div className="col-md-3 col-sm-6">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Min AI Resume Score ({minScore > 0 ? minScore : 'Any'})</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5" 
                value={minScore} 
                onChange={(e) => { setMinScore(parseInt(e.target.value)); setCurrentPage(1); }} 
                className="premium-range-slider w-100"
              />
            </div>
            <div className="col-md-3 col-sm-6">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Placement Status</label>
              <select 
                value={placedStatus} 
                onChange={(e) => { setPlacedStatus(e.target.value); setCurrentPage(1); }}
                className="form-select form-select-compact mt-1"
              >
                <option value="All">All Statuses</option>
                <option value="Placed">Only Placed (Offered)</option>
                <option value="Unplaced">Only Unplaced (Seeking)</option>
              </select>
            </div>
            <div className="col-md-3 col-sm-6">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Verification State</label>
              <select 
                value={verifiedStatus} 
                onChange={(e) => { setVerifiedStatus(e.target.value); setCurrentPage(1); }}
                className="form-select form-select-compact mt-1"
              >
                <option value="All">All States</option>
                <option value="Verified">Verified Only</option>
                <option value="Pending">Pending Verification</option>
              </select>
            </div>
          </div>
          <div style={{ position: 'relative', width: '100%', marginTop: '0.25rem' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.9rem', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search eligible candidates by name, email, or skill keywords..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="form-input form-input-compact text-sm"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
          </div>
        </div>

        {/* Bulk Action Alert Panel */}
        {selectedStudents.length > 0 && (
          <div className="p-3 mb-4 rounded border d-flex justify-content-between align-items-center flex-wrap gap-2 animate-fade-in" style={{ backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(59,130,246,0.3)' }}>
            <div className="d-flex align-items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {selectedStudents.length} candidate(s) selected for bulk action
              </span>
            </div>
            <div className="d-flex gap-2">
              <button 
                onClick={handleBulkVerify} 
                className="btn btn-sm btn-primary" 
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
              >
                Verify Profiles
              </button>
              <button 
                onClick={() => setShowBulkBroadcastModal(true)} 
                className="btn btn-sm btn-secondary" 
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
              >
                Broadcast to Selected
              </button>
              <button 
                onClick={() => setSelectedStudents([])} 
                className="btn btn-sm btn-outline-secondary" 
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        <div className="row g-4">
          {/* Left Column: Eligible Students Table */}
          <div className="col-lg-8 col-md-12">
            <div className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h3 style={{ ...styles.cardTitle, margin: 0 }}>Eligible Talent Pool ({totalEligible})</h3>
                <div className="d-flex align-items-center gap-2 text-xs text-muted">
                  <span>Show</span>
                  <select 
                    value={pageSize} 
                    onChange={e => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                    className="form-select form-select-compact"
                    style={{ width: '65px', height: '30px', padding: '0 0.4rem', borderRadius: '6px' }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <span>per page</span>
                </div>
              </div>

              {/* Responsive Eligibility Table */}
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="premium-table" style={{ width: '100%', minWidth: '700px', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-secondary)' }}>
                      <th style={{ textAlign: 'center', width: '40px' }}>
                        <input 
                          type="checkbox"
                          checked={paginatedProfiles.length > 0 && selectedStudents.length === paginatedProfiles.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                      </th>
                      <th onClick={() => toggleSort('name')} style={{ textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}>
                        Candidate Name {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                      </th>
                      <th onClick={() => toggleSort('cgpa')} style={{ textAlign: 'center', cursor: 'pointer', userSelect: 'none', width: '90px' }}>
                        CGPA {sortField === 'cgpa' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                      </th>
                      <th onClick={() => toggleSort('score')} style={{ textAlign: 'center', cursor: 'pointer', userSelect: 'none', width: '110px' }}>
                        AI Resume {sortField === 'score' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                      </th>
                      <th onClick={() => toggleSort('dsa')} style={{ textAlign: 'center', cursor: 'pointer', userSelect: 'none', width: '100px' }}>
                        DSA Solved {sortField === 'dsa' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                      </th>
                      <th style={{ textAlign: 'center', width: '90px' }}>Verification</th>
                      <th style={{ textAlign: 'center', width: '80px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProfiles.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          <GraduationCap size={36} className="mb-2" />
                          <p className="mb-0">No eligible candidates match your filter thresholds.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedProfiles.map((p) => (
                        <tr 
                          key={p._id} 
                          className={selectedStudents.includes(p._id) ? 'selected' : ''}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedStudent(p)}
                        >
                          <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                            <input 
                              type="checkbox"
                              checked={selectedStudents.includes(p._id)}
                              onChange={(e) => handleSelectOne(e.target.checked, p._id)}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: '700', fontSize: '0.75rem', flexShrink: 0, justifyContent: 'center' }}>
                                {p.user?.name ? p.user.name.charAt(0).toUpperCase() : 'S'}
                              </div>
                              <div>
                                <span className="font-semibold text-sm d-block text-primary">{p.user?.name}</span>
                                <span className="text-muted d-block text-xs" style={{ fontSize: '0.68rem' }}>{p.user?.email}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: '600' }}>
                            {p.cgpa > 10 ? `${p.cgpa}%` : (p.cgpa > 0 ? p.cgpa.toFixed(2) : 'N/A')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {p.resumeScore > 0 ? (
                              <span className="badge bg-success-glow text-success font-bold" style={{ fontSize: '0.72rem' }}>
                                ★ {p.resumeScore}
                              </span>
                            ) : (
                              <span className="text-muted text-xs">No resume</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>
                            {p.dsaCount} Qs
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {p.isVerified ? (
                              <span className="badge bg-success-glow text-success text-xs" style={{ padding: '2px 6px' }}>Verified</span>
                            ) : (
                              <span className="badge bg-warning-glow text-warning text-xs" style={{ padding: '2px 6px' }}>Pending</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {p.isPlaced ? (
                              <span className="badge bg-primary-glow text-primary text-xs" style={{ padding: '2px 6px' }}>Placed</span>
                            ) : (
                              <span className="badge bg-secondary-glow text-secondary text-xs" style={{ padding: '2px 6px' }}>Seeking</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination controls */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <span className="text-xs text-muted">
                    Page {currentPage} of {totalPages} ({totalEligible} candidates)
                  </span>
                  <div className="d-flex gap-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                      disabled={currentPage === 1}
                      className="btn btn-xs btn-outline" 
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                    >
                      Prev
                    </button>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                      disabled={currentPage === totalPages}
                      className="btn btn-xs btn-outline" 
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Placement Audit Feed */}
          <div className="col-lg-4 col-md-12">
            <div className="glass-card p-4">
              <h3 style={{ ...styles.cardTitle, marginBottom: '0.4rem' }}>Placement Activity Log</h3>
              <p className="text-xs text-muted mb-4">Live audit log of registered candidates actions on the platform.</p>

              <div className="d-flex flex-column gap-3 overflow-y-auto" style={{ maxHeight: '520px', paddingRight: '2px' }}>
                {activities.length === 0 ? (
                  <p className="text-center py-5 text-muted text-xs">No recent platform activities recorded.</p>
                ) : (
                  activities.map((act, index) => (
                    <div key={index} className="d-flex gap-3 align-items-start p-2.5 rounded border bg-surface-elevated shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
                      <div 
                        className="d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: act.type === 'application' ? 'rgba(59,130,246,0.1)' : act.type === 'resume' ? 'rgba(168,85,247,0.1)' : 'rgba(16,185,129,0.1)',
                          color: act.type === 'application' ? 'var(--primary)' : act.type === 'resume' ? 'var(--accent)' : 'var(--success)'
                        }}
                      >
                        {act.type === 'application' ? <Briefcase size={14} /> : act.type === 'resume' ? <Sparkles size={14} /> : <ShieldCheck size={14} />}
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex justify-content-between align-items-baseline gap-2 mb-0.5">
                          <strong className="text-xs text-primary truncate" style={{ fontWeight: '600' }}>{act.title}</strong>
                          <span className="text-muted flex-shrink-0" style={{ fontSize: '0.62rem' }}>
                            {Math.round((new Date() - act.timestamp) / 60000) < 60 
                              ? `${Math.max(Math.round((new Date() - act.timestamp) / 60000), 1)}m ago`
                              : act.timestamp.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                            }
                          </span>
                        </div>
                        <p className="text-muted m-0 text-xs" style={{ fontSize: '0.72rem', lineHeight: 1.35 }}>
                          {act.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Portals */}
        {renderStudentModal()}
        
        {/* Bulk Targeted Broadcast Modal Portal */}
        {showBulkBroadcastModal && createPortal(
          <div style={styles.modalOverlay} onClick={() => setShowBulkBroadcastModal(false)}>
            <div className="animate-fade-in" style={{ ...styles.modalContent, maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
              <div style={{ ...styles.modalBanner, padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <button onClick={() => setShowBulkBroadcastModal(false)} style={styles.modalCloseBtn}>
                  <X size={18} />
                </button>
                <h3 style={{ color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: '700' }}>
                  <Megaphone size={18} color="var(--primary)" />
                  <span>Send Targeted Announcement</span>
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem', marginBottom: 0 }}>
                  Sending targeted portal notification to {selectedStudents.length} selected candidate(s).
                </p>
              </div>
              <form onSubmit={handleBulkBroadcast} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Announcement Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Special Interview Pool Drive"
                    value={bulkBroadcastTitle}
                    onChange={e => setBulkBroadcastTitle(e.target.value)}
                    className="form-input mt-1"
                    required
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Message Content</label>
                  <textarea
                    placeholder="Write details for selected students..."
                    value={bulkBroadcastMessage}
                    onChange={e => setBulkBroadcastMessage(e.target.value)}
                    className="form-input mt-1"
                    required
                    style={{ minHeight: '100px', fontSize: '0.85rem', resize: 'none' }}
                  />
                </div>
                <div className="d-flex gap-2 justify-content-end mt-2">
                  <button type="button" onClick={() => setShowBulkBroadcastModal(false)} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }} disabled={bulkBroadcasting}>
                    {bulkBroadcasting ? 'Broadcasting...' : 'Send Broadcast'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Overview Analytics</h1>
          <p style={styles.subtitle}>Placement trends, student enrollment counts, and review matrices.</p>
        </div>
        <button onClick={handleExportCSV} className="btn btn-primary" style={styles.exportBtn}>
          <Download size={16} />
          <span>Export Placement Report</span>
        </button>
      </header>

      {/* Stats Board Grid */}
      <div style={styles.statsGrid}>
        <div className="glass-card stat-card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div style={styles.statDetails}>
            <h3>Total Registered</h3>
            <p>{stats.totalStudents}</p>
          </div>
        </div>

        <div className="glass-card stat-card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, color: 'var(--accent)' }}>
            <TrendingUp size={24} />
          </div>
          <div style={styles.statDetails}>
            <h3>Placement Rate</h3>
            <p>{stats.placementRate}%</p>
          </div>
        </div>

        <div className="glass-card stat-card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, color: 'var(--warning)' }}>
            <FileCheck size={24} />
          </div>
          <div style={styles.statDetails}>
            <h3>Pending Reviews</h3>
            <p>{stats.pendingReviews}</p>
          </div>
        </div>

        <div className="glass-card stat-card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, color: 'var(--success)' }}>
            <Sparkles size={24} />
          </div>
          <div style={styles.statDetails}>
            <h3>Avg Resume Score</h3>
            <p>{stats.avgScore}</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Lists Grid */}
      <div style={styles.mainGrid}>
        {/* Left Side: Pipeline Charts & Broadcast Box */}
        <div style={styles.leftGridCol}>
          {/* Pipeline & Skills Tabs */}
          <div className="glass-card" style={styles.chartBlock}>
            <div style={styles.tabHeader}>
              <button
                onClick={() => setAnalyticsTab('pipeline')}
                style={{
                  ...styles.tabBtn,
                  borderBottom: analyticsTab === 'pipeline' ? '2px solid var(--primary)' : '2px solid transparent',
                  color: analyticsTab === 'pipeline' ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                Application Stage Pipeline
              </button>
              <button
                onClick={() => setAnalyticsTab('skills')}
                style={{
                  ...styles.tabBtn,
                  borderBottom: analyticsTab === 'skills' ? '2px solid var(--primary)' : '2px solid transparent',
                  color: analyticsTab === 'skills' ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                Top Skills Distribution
              </button>
            </div>

            <div style={styles.tabBody}>
              {analyticsTab === 'pipeline' ? (
                <div style={{ width: '100%', height: '240px', marginTop: '1rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-surface)',
                          borderColor: 'var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={35}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={styles.skillsContainer}>
                  <h4 style={styles.skillsHeading}>Most Prominent Cohort Skills</h4>
                  <div style={styles.skillsList}>
                    {topSkills.length === 0 ? (
                      <p style={styles.emptyText}>No technical skills parsed yet.</p>
                    ) : (
                      topSkills.map((sk, index) => {
                        const percentage = Math.round((sk.count / stats.totalStudents) * 100);
                        return (
                          <div key={index} style={styles.skillBarRow}>
                            <div style={styles.skillBarLabel}>
                              <span style={styles.skillBarName}>{sk.name}</span>
                              <span style={styles.skillBarPct}>{sk.count} Students ({percentage}%)</span>
                            </div>
                            <div style={styles.skillBarBg}>
                              <div
                                style={{
                                  ...styles.skillBarFill,
                                  width: `${percentage}%`,
                                  backgroundColor: COLORS[index % COLORS.length],
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Placement Announcement Broadcaster */}
          <div className="glass-card" style={styles.broadcastBlock}>
            <div style={styles.broadcastHeader}>
              <Megaphone size={18} color="var(--primary)" />
              <h3 style={styles.cardTitle}>Send Portal Announcement</h3>
            </div>
            <p style={styles.broadcastDesc}>Send a notification to all registered student dashboards immediately.</p>
            <form onSubmit={handleSendBroadcast} style={styles.broadcastForm}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Announcement Title (e.g. Google Drive Openings)"
                  className="form-input"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  style={{ height: '38px', fontSize: '0.85rem' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <textarea
                  placeholder="Write the notification message details here..."
                  className="form-input"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  style={{ minHeight: '65px', fontSize: '0.85rem', resize: 'none' }}
                />
              </div>
              <button type="submit" className="btn btn-secondary" style={styles.broadcastBtn} disabled={broadcasting}>
                <span>{broadcasting ? 'Broadcasting...' : 'Broadcast Announcement'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Student Directory */}
        <div className="glass-card" style={styles.studentBlock}>
          <div style={styles.directoryHeader}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <div 
                className="d-flex align-items-center justify-content-center text-primary" 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  background: 'var(--primary-glow)', 
                  flexShrink: 0 
                }}
              >
                <Users size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.2px' }}>
                  Student Talent Directory
                </h3>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Filter and match candidates</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
              <select
                value={matchJobId}
                onChange={(e) => setMatchJobId(e.target.value)}
                className="form-select form-select-compact"
                style={{ 
                  width: '100%', 
                  cursor: 'pointer'
                }}
              >
                <option value="">🔍 View All Candidates</option>
                {jobs.map(job => (
                  <option key={job._id} value={job._id}>
                    🎯 {job.company} - {job.title}
                  </option>
                ))}
              </select>

              <div style={{ ...styles.searchContainer, width: '100%' }}>
                <Search size={14} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search name, email, skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.8rem', height: '36px', width: '100%' }}
                />
              </div>
            </div>
          </div>

          <div style={styles.studentList}>
            {filteredProfiles.length === 0 ? (
              <p style={styles.emptyText}>No matching students found.</p>
            ) : (
              filteredProfiles.map((p) => (
                <div
                  key={p._id}
                  style={styles.studentItem}
                  onClick={() => setSelectedStudent(p)}
                  title="Click to view detailed profile"
                >
                  <div style={styles.studentMeta}>
                    <div style={styles.studentAvatar}>
                      <span>{p.user?.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <h4 style={styles.studentName}>{p.user?.name}</h4>
                        {p.isVerified ? (
                          <ShieldCheck size={14} color="var(--success)" title="Verified Profile" />
                        ) : (
                          <ShieldAlert size={14} color="var(--warning)" title="Pending Verification" />
                        )}
                      </div>
                      <p style={styles.studentEmail}>{p.user?.email}</p>
                      {matchJobId && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.4rem' }}>
                          {p.matchedSkills.slice(0, 2).map((s, i) => (
                            <span key={i} className="badge bg-success-glow text-success" style={{ padding: '1px 5px', fontSize: '0.6rem', border: '1px solid rgba(16,185,129,0.15)' }}>✓ {s}</span>
                          ))}
                          {p.missingSkills.slice(0, 2).map((s, i) => (
                            <span key={i} className="badge bg-danger-glow text-danger" style={{ padding: '1px 5px', fontSize: '0.6rem', border: '1px solid rgba(239,68,68,0.15)' }}>✗ {s}</span>
                          ))}
                          {(p.matchedSkills.length > 2 || p.missingSkills.length > 2) && (
                            <span className="text-muted" style={{ fontSize: '0.55rem', alignSelf: 'center' }}>+more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills preview tags */}
                  <div style={styles.skillsBox}>
                    {p.skills.slice(0, 2).map((sk, idx) => (
                      <span key={idx} style={styles.miniTag}>
                        {sk}
                      </span>
                    ))}
                    {p.skills.length > 2 && (
                      <span style={styles.moreTag}>+{p.skills.length - 2}</span>
                    )}
                  </div>

                  {/* Match score or AI rating score badge */}
                  {matchJobId ? (
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        backgroundColor: p.matchScore >= 80 ? 'rgba(16,185,129,0.1)' : p.matchScore >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${p.matchScore >= 80 ? 'var(--success)' : p.matchScore >= 50 ? 'var(--warning)' : 'var(--danger)'}`,
                        color: p.matchScore >= 80 ? 'var(--success)' : p.matchScore >= 50 ? 'var(--warning)' : 'var(--danger)',
                        height: 'fit-content'
                      }}
                    >
                      <Sparkles size={11} />
                      <span>{p.matchScore}% Match</span>
                    </div>
                  ) : p.aiFeedback?.score > 0 ? (
                    <div style={{ ...styles.scoreBadge, backgroundColor: `${COLORS[3]}10`, border: `1px solid ${COLORS[3]}` }}>
                      <Sparkles size={11} color={COLORS[3]} />
                      <span style={{ color: COLORS[3], fontWeight: '700' }}>{p.aiFeedback.score}</span>
                    </div>
                  ) : (
                    <span style={styles.noScoreBadge}>No Resume</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {renderStudentModal()}
  </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  exportBtn: {
    padding: '0.65rem 1.25rem',
    fontSize: '0.9rem',
    height: '42px',
  },
  loading: {
    padding: '4rem',
    textAlign: 'center',
    fontSize: '1.2rem',
    color: 'var(--text-secondary)',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
  },
  statCard: {
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  statIcon: {
    width: '45px',
    height: '45px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    h3: {
      fontSize: '0.75rem',
      fontWeight: '500',
      color: 'var(--text-secondary)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    p: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: 'var(--text-primary)',
    },
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.18fr 0.82fr',
    gap: '2rem',
    alignItems: 'stretch',
  },
  leftGridCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  chartBlock: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '340px',
  },
  broadcastBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  broadcastHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  broadcastDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  broadcastForm: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '0.25rem',
  },
  broadcastBtn: {
    alignSelf: 'flex-start',
    padding: '0.55rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  tabHeader: {
    display: 'flex',
    gap: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem',
    marginBottom: '1rem',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    paddingBottom: '0.75rem',
    fontSize: '0.98rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  tabBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  skillsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  skillsHeading: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  skillsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  skillBarRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  skillBarLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.82rem',
  },
  skillBarName: {
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  skillBarPct: {
    color: 'var(--text-secondary)',
  },
  skillBarBg: {
    width: '100%',
    height: '8px',
    backgroundColor: 'var(--border-color)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  skillBarFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.5s ease-out',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  studentBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  directoryHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  searchContainer: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.9rem',
    color: 'var(--text-muted)',
  },
  studentList: {
    overflowY: 'auto',
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxHeight: '440px',
    paddingRight: '4px',
  },
  studentItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    '&:hover': {
      backgroundColor: 'var(--bg-surface-elevated)',
      borderColor: 'var(--primary)',
      transform: 'translateY(-1px)',
    },
  },
  studentMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1.25,
  },
  studentAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#fff',
  },
  studentName: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  studentEmail: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  skillsBox: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.3rem',
    flex: 1,
  },
  miniTag: {
    fontSize: '0.7rem',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
  },
  moreTag: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  scoreBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.78rem',
  },
  noScoreBadge: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  emptyText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '1.5rem',
  },
  emptyTextSub: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 8, 18, 0.95)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '2rem 1rem',
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  modalContent: {
    width: '100%',
    maxWidth: '850px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxShadow: 'var(--shadow-lg)',
    overflowX: 'hidden',
    overflowY: 'hidden',
    margin: '0 auto',
  },
  modalBodyGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  modalMainCol: {
    flex: '1 1 450px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  modalSidebarCol: {
    flex: '1 1 260px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  premiumEmptyCard: {
    padding: '1.5rem',
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px dashed var(--border-color)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  emptyIconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  premiumEmptyCardInline: {
    padding: '0.75rem 1rem',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    width: '100%',
    boxSizing: 'border-box',
  },
  emptyTextSubInline: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  projectList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  projectCard: {
    padding: '1rem',
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  projectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  projectTitle: {
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    fontWeight: '600',
    margin: 0,
  },
  projectLink: {
    color: 'var(--primary)',
    display: 'inline-flex',
    alignItems: 'center',
    opacity: 0.8,
    transition: 'all 0.2s',
  },
  projectDesc: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
    margin: 0,
  },
  projectTechBox: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
    marginTop: '0.25rem',
  },
  projectTechTag: {
    fontSize: '0.7rem',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    background: 'var(--accent-bg)',
    color: 'var(--accent)',
    border: '1px solid var(--accent-border)',
    fontWeight: '600',
  },
  portfolioBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  portfolioLinkBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.6rem 0.85rem',
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontSize: '0.82rem',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  sidebarSectionHeading: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.25rem',
  },
  problemSolvingBox: {
    padding: '1rem',
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  problemSolvingHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  problemSolvingTotalCount: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  problemSolvingTotalLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  problemSolvingDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  problemSolvingRow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.8rem',
  },
  difficultyDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    marginRight: '0.5rem',
  },
  difficultyLabel: {
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  difficultyCount: {
    marginLeft: 'auto',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  achievementList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  achievementItem: {
    display: 'flex',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  sidebarAppList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  sidebarAppCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '0.8rem',
  },
  modalBanner: {
    background: 'linear-gradient(135deg, var(--primary-glow) 0%, var(--secondary-glow) 100%)',
    borderBottom: '1px solid var(--border-color)',
    padding: '1.75rem 2rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
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
    width: '32px',
    height: '32px',
  },
  modalAvatarWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  modalActions: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  modalBody: {
    padding: '1.75rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1.25rem',
  },
  modalAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#fff',
  },
  modalName: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.2',
  },
  modalEmail: {
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
  },
  verifiedBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--success)',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  unverifiedBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--warning)',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.15)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  aiAssessmentBox: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  aiAssessmentHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem',
    h4: {
      fontSize: '0.92rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
    },
  },
  aiBreakdown: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  largeScoreBadge: {
    display: 'flex',
    alignItems: 'baseline',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    fontSize: '1.6rem',
    fontWeight: '800',
  },
  scoreScale: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginLeft: '1px',
  },
  metaSubLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.5px',
    marginBottom: '0.35rem',
  },
  modalTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  modalTag: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  modalTagAccent: {
    fontSize: '0.72rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    background: 'var(--primary-glow)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    color: 'var(--text-primary)',
    fontWeight: '600',
  },
  aiSuggestionsBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  bulletList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  bulletItem: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'flex-start',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  bulletDot: {
    width: '5px',
    height: '5px',
    backgroundColor: 'var(--accent)',
    borderRadius: '50%',
    marginTop: '6px',
    flexShrink: 0,
  },
  noAiBox: {
    textAlign: 'center',
    padding: '1.5rem',
    border: '1px dashed var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    color: 'var(--text-muted)',
    fontSize: '0.88rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  modalSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.92rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    borderLeft: '3px solid var(--primary)',
    paddingLeft: '0.5rem',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  historyCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.65rem 0.85rem',
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  cgpaBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--success)',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
  },
  experienceCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    padding: '0.75rem 0.85rem',
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '0.85rem',
  },
  expHeader: {
    display: 'flex',
    gap: '0.35rem',
    color: 'var(--text-secondary)',
  },
  expDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.45',
  },
  appTimeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  appTimelineItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.65rem 0.85rem',
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '0.85rem',
  },
  timelineComp: {
    color: 'var(--text-muted)',
  },
};

export default AdminDashboard;
