import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { getInitials } from '../../utils/formatters';
import {
  LayoutDashboard, Target, CheckCircle, BarChart3, Shield,
  LogOut, Bell, ClipboardCheck, Users, Settings, FileText
} from 'lucide-react';

export default function Sidebar() {
  const { currentUser, logout } = useAuthStore();
  const allNotifications = useDataStore(s => s.notifications);
  const notifications = currentUser ? allNotifications.filter(n => n.userId === currentUser.id) : [];
  const unread = notifications.filter(n => !n.read).length;

  if (!currentUser) return null;

  const role = currentUser.role;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo">AQ</div>
        <h1>AtomQuest</h1>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">Main</div>
        <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>
          <LayoutDashboard className="nav-icon" /> Dashboard
        </NavLink>

        {(role === 'EMPLOYEE' || role === 'MANAGER') && (
          <>
            <NavLink to="/goals" className={({isActive}) => isActive ? 'active' : ''}>
              <Target className="nav-icon" /> My Goals
            </NavLink>
            <NavLink to="/check-ins" className={({isActive}) => isActive ? 'active' : ''}>
              <CheckCircle className="nav-icon" /> Check-ins
            </NavLink>
          </>
        )}

        {(role === 'MANAGER' || role === 'ADMIN') && (
          <>
            <div className="sidebar-section">Management</div>
            {role === 'MANAGER' && (
              <NavLink to="/approval" className={({isActive}) => isActive ? 'active' : ''}>
                <ClipboardCheck className="nav-icon" /> Approvals
              </NavLink>
            )}
            {role === 'MANAGER' && (
              <NavLink to="/team-checkins" className={({isActive}) => isActive ? 'active' : ''}>
                <Users className="nav-icon" /> Team Check-ins
              </NavLink>
            )}
          </>
        )}

        <div className="sidebar-section">Reports</div>
        <NavLink to="/reports/achievement" className={({isActive}) => isActive ? 'active' : ''}>
          <FileText className="nav-icon" /> Achievement
        </NavLink>
        <NavLink to="/reports/completion" className={({isActive}) => isActive ? 'active' : ''}>
          <BarChart3 className="nav-icon" /> Completion
        </NavLink>
        <NavLink to="/reports/analytics" className={({isActive}) => isActive ? 'active' : ''}>
          <BarChart3 className="nav-icon" /> Analytics
        </NavLink>
        <NavLink to="/reports/audit" className={({isActive}) => isActive ? 'active' : ''}>
          <Shield className="nav-icon" /> Audit Trail
        </NavLink>

        {role === 'ADMIN' && (
          <>
            <div className="sidebar-section">Admin</div>
            <NavLink to="/admin/cycles" className={({isActive}) => isActive ? 'active' : ''}>
              <Settings className="nav-icon" /> Cycles
            </NavLink>
            <NavLink to="/admin/users" className={({isActive}) => isActive ? 'active' : ''}>
              <Users className="nav-icon" /> Users
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-nav" onClick={logout} style={{padding:0}}>
          <span style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',borderRadius:8,color:'var(--text-secondary)',fontSize:14,fontWeight:500,width:'100%'}}>
            <LogOut size={20} /> Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
