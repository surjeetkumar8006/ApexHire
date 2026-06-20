import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileCheck, 
  Cpu, 
  PlusCircle, 
  Users, 
  Settings,
  LogOut,
  Calendar,
  Building,
  BarChart,
  FileText,
  CalendarCheck,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const studentLinks = [
    { path: '/student/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/student/jobs', name: 'Job Board', icon: <Briefcase size={20} /> },
    { path: '/student/applications', name: 'My Applications', icon: <FileCheck size={20} /> },
    { path: '/student/ai-coach', name: 'AI Career Coach', icon: <Cpu size={20} /> },
    { path: '/student/interviews', name: 'My Interviews', icon: <CalendarCheck size={20} /> },
    { path: '/student/resources', name: 'Prep Resources', icon: <FolderOpen size={20} /> },
    { path: '/student/events', name: 'Career Events', icon: <CalendarCheck size={20} /> },
    { path: '/student/app-analytics', name: 'App Analytics', icon: <BarChart size={20} /> },
    { path: '/student/settings', name: 'Profile Settings', icon: <Settings size={20} /> },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', name: 'Overview', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/jobs', name: 'Manage Jobs', icon: <PlusCircle size={20} /> },
    { path: '/admin/applications', name: 'Applications', icon: <FileCheck size={20} /> },
    { path: '/admin/students', name: 'Student Directory', icon: <Users size={20} /> },
    { path: '/admin/interviews', name: 'Interview Scheduler', icon: <Calendar size={20} /> },
    { path: '/admin/companies', name: 'Employer Partners', icon: <Building size={20} /> },
    { path: '/admin/analytics', name: 'Advanced Analytics', icon: <BarChart size={20} /> },
    { path: '/admin/resume-bank', name: 'Resume Bank', icon: <FileText size={20} /> },
    { path: '/admin/events', name: 'Career Events', icon: <CalendarCheck size={20} /> },
    { path: '/admin/settings', name: 'Platform Settings', icon: <Settings size={20} /> },
  ];

  const links = user.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`} style={styles.sidebar}>
      <div style={styles.mobileHeader}>
        <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Menu</span>
        <button className="sidebar-close-btn" onClick={onClose}><X size={20} /></button>
      </div>
      <div style={styles.menuList}>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
            >
              <span style={isActive ? styles.activeIcon : styles.icon}>
                {link.icon}
              </span>
              <span>{link.name}</span>
            </button>
          );
        })}
      </div>

      <div style={styles.footer}>
        <button onClick={logout} className="sidebar-logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  mobileHeader: {
    display: 'none', // Shown via CSS on mobile
  },
  menuList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    overflowY: 'auto',
    paddingRight: '0.5rem',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.85rem 1.25rem',
    borderRadius: 'var(--border-radius-md)',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    transition: 'all var(--transition-fast)',
    background: 'transparent',
    '&:hover': {
      color: 'var(--text-primary)',
      background: 'rgba(255, 255, 255, 0.02)',
    },
  },
  activeMenuItem: {
    color: 'var(--text-primary)',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
    border: '1px solid rgba(99, 102, 241, 0.25)',
  },
  icon: {
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  activeIcon: {
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
  },
  linkText: {
    fontSize: '0.95rem',
  },
  footer: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.5rem',
  },
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.85rem 1.25rem',
    borderRadius: 'var(--border-radius-md)',
    color: 'var(--danger)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background var(--transition-fast)',
    background: 'transparent',
    '&:hover': {
      background: 'rgba(239, 68, 68, 0.08)',
    },
  },
};

export default Sidebar;
