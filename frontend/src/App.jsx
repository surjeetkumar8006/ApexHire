import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
// Shared Pages
import LandingPage from './pages/shared/LandingPage';
import AuthPage from './pages/shared/AuthPage';
import SettingsPage from './pages/shared/SettingsPage';
import ComingSoon from './pages/shared/ComingSoon';
import ChatPortal from './pages/shared/ChatPortal';
import ForumAndCommunity from './pages/shared/ForumAndCommunity';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import JobBoard from './pages/student/JobBoard';
import AICoach from './pages/student/AICoach';
import StudentCareerCoach from './pages/student/StudentCareerCoach';
import StudentMockInterviews from './pages/student/StudentMockInterviews';
import StudentApplications from './pages/student/StudentApplications';
import StudentInterviews from './pages/student/StudentInterviews';
import StudentAssessments from './pages/student/StudentAssessments';
import StudentResources from './pages/student/StudentResources';
import StudentAppAnalytics from './pages/student/StudentAppAnalytics';
import StudentEvents from './pages/student/StudentEvents';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminJobs from './pages/admin/AdminJobs';
import AdminApplications from './pages/admin/AdminApplications';
import AdminInterviews from './pages/admin/AdminInterviews';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminEvents from './pages/admin/AdminEvents';
import AdminResumeBank from './pages/admin/AdminResumeBank';
import AdminAssessments from './pages/admin/AdminAssessments';
import AdminAlumni from './pages/admin/AdminAlumni';
import AdminMockFeedback from './pages/admin/AdminMockFeedback';

import './styles/main.css';
import './styles/responsive.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }
  
  return children;
};

function App() {
  const { user } = useAuth();
  const [screen, setScreen] = useState('landing'); // 'landing' or 'auth'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    // When not logged in, we are not fully using router, just showing landing/auth
    // However, to keep it simple, we will just handle it in state or use simple routing
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage onBack={() => setScreen('landing')} />} />
          <Route path="*" element={<LandingPage onGetStarted={() => window.location.href = '/login'} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main className={`main-content ${isMobileMenuOpen ? 'sidebar-open' : ''}`}>
          <div style={{ marginTop: '70px', minWidth: 0, width: '100%' }} className="animate-fade-in">
            <Routes>
              {/* Redirect root based on role */}
              <Route path="/" element={<Navigate to={user.role === 'admin' ? '/admin/dashboard' : (user.role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard')} replace />} />
              <Route path="/login" element={<Navigate to="/" replace />} />

              {/* ----- Student Routes ----- */}
              <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/jobs" element={<ProtectedRoute allowedRoles={['student']}><JobBoard /></ProtectedRoute>} />
              <Route path="/student/applications" element={<ProtectedRoute allowedRoles={['student']}><StudentApplications /></ProtectedRoute>} />
              <Route path="/student/ai-coach" element={<Navigate to="/student/dashboard" replace />} />
              <Route path="/student/mock-interviews" element={<ProtectedRoute allowedRoles={['student']}><StudentMockInterviews /></ProtectedRoute>} />
              <Route path="/student/assessments" element={<ProtectedRoute allowedRoles={['student']}><StudentAssessments /></ProtectedRoute>} />
              
              <Route path="/student/interviews" element={<ProtectedRoute allowedRoles={['student']}><StudentInterviews /></ProtectedRoute>} />
              <Route path="/student/resources" element={<ProtectedRoute allowedRoles={['student']}><StudentResources /></ProtectedRoute>} />
              <Route path="/student/app-analytics" element={<ProtectedRoute allowedRoles={['student']}><StudentAppAnalytics /></ProtectedRoute>} />
              <Route path="/student/events" element={<ProtectedRoute allowedRoles={['student']}><StudentEvents /></ProtectedRoute>} />
              <Route path="/student/forum" element={<ProtectedRoute allowedRoles={['student']}><ForumAndCommunity /></ProtectedRoute>} />
              <Route path="/student/chat" element={<ProtectedRoute allowedRoles={['student']}><ChatPortal /></ProtectedRoute>} />
              <Route path="/student/settings" element={<ProtectedRoute allowedRoles={['student']}><SettingsPage /></ProtectedRoute>} />

              {/* ----- Recruiter Routes ----- */}
              <Route path="/recruiter/dashboard" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterDashboard view="overview" /></ProtectedRoute>} />
              <Route path="/recruiter/resumes" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterDashboard view="resumes" /></ProtectedRoute>} />
              <Route path="/recruiter/forum" element={<ProtectedRoute allowedRoles={['recruiter']}><ForumAndCommunity /></ProtectedRoute>} />
              <Route path="/recruiter/chat" element={<ProtectedRoute allowedRoles={['recruiter']}><ChatPortal /></ProtectedRoute>} />
              <Route path="/recruiter/settings" element={<ProtectedRoute allowedRoles={['recruiter']}><SettingsPage /></ProtectedRoute>} />

              {/* ----- Admin Routes ----- */}
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard view="overview" /></ProtectedRoute>} />
              <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['admin']}><AdminJobs /></ProtectedRoute>} />
              <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={['admin']}><AdminApplications /></ProtectedRoute>} />
              <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard view="students" /></ProtectedRoute>} />
              <Route path="/admin/eligibility" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard view="eligibility" /></ProtectedRoute>} />
              <Route path="/admin/assessments" element={<ProtectedRoute allowedRoles={['admin']}><AdminAssessments /></ProtectedRoute>} />
              <Route path="/admin/alumni" element={<ProtectedRoute allowedRoles={['admin']}><AdminAlumni /></ProtectedRoute>} />
              <Route path="/admin/mock-feedback" element={<ProtectedRoute allowedRoles={['admin']}><AdminMockFeedback /></ProtectedRoute>} />
              
              <Route path="/admin/interviews" element={<ProtectedRoute allowedRoles={['admin']}><AdminInterviews /></ProtectedRoute>} />
              <Route path="/admin/companies" element={<ProtectedRoute allowedRoles={['admin']}><AdminCompanies /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/admin/resume-bank" element={<ProtectedRoute allowedRoles={['admin']}><AdminResumeBank /></ProtectedRoute>} />
              <Route path="/admin/events" element={<ProtectedRoute allowedRoles={['admin']}><AdminEvents /></ProtectedRoute>} />
              <Route path="/admin/forum" element={<ProtectedRoute allowedRoles={['admin']}><ForumAndCommunity /></ProtectedRoute>} />
              <Route path="/admin/chat" element={<ProtectedRoute allowedRoles={['admin']}><ChatPortal /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><SettingsPage /></ProtectedRoute>} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        {isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
