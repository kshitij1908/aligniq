import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { getInitials } from '../../utils/formatters';
import { Bell, ChevronDown, X } from 'lucide-react';

export default function Header({ title }: { title: string }) {
  const { currentUser, switchRole } = useAuthStore();
  const store = useDataStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);

  if (!currentUser) return null;

  const allNotifications = store.notifications;
  const notifications = currentUser ? allNotifications.filter(n => n.userId === currentUser.id) : [];
  const unread = notifications.filter(n => !n.read).length;
  const users = store.users;

  const roleBg = currentUser.role === 'ADMIN' ? 'admin' : currentUser.role === 'MANAGER' ? 'manager' : 'employee';

  return (
    <header className="header">
      <div className="header-left">
        <h2>{title}</h2>
      </div>
      <div className="header-right">
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button className="btn btn-ghost btn-icon notif-btn" onClick={() => { setShowNotifs(!showNotifs); setShowSwitcher(false); }}>
            <Bell size={20} />
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </button>
          {showNotifs && (
            <div style={{
              position:'absolute', top:'100%', right:0, width:360, background:'var(--bg-secondary)',
              border:'1px solid var(--border)', borderRadius:12, padding:8, zIndex:50,
              maxHeight:400, overflowY:'auto', boxShadow:'var(--shadow)'
            }} className="fade-in">
              <div style={{padding:'12px 16px',fontWeight:600,fontSize:14,borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                Notifications
                <button className="btn btn-ghost btn-sm" onClick={() => setShowNotifs(false)}><X size={16}/></button>
              </div>
              {notifications.length === 0 ? (
                <div style={{padding:24,textAlign:'center',color:'var(--text-muted)',fontSize:13}}>No notifications</div>
              ) : (
                notifications.slice(0, 10).map(n => (
                  <div key={n.id} onClick={() => store.markNotificationRead(n.id)}
                    style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',cursor:'pointer',
                      background: n.read ? 'transparent' : 'rgba(99,102,241,0.05)'
                    }}>
                    <div style={{fontSize:13,fontWeight:n.read?400:600}}>{n.title}</div>
                    <div style={{fontSize:12,color:'var(--text-secondary)',marginTop:2}}>{n.message}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User / Role Switcher */}
        <div style={{ position: 'relative' }}>
          <button className="user-pill" onClick={() => { setShowSwitcher(!showSwitcher); setShowNotifs(false); }}>
            <div className={`avatar avatar-sm ${roleBg}`}>
              {getInitials(currentUser.firstName, currentUser.lastName)}
            </div>
            <div>
              <div className="name">{currentUser.firstName} {currentUser.lastName}</div>
              <div className="role">{currentUser.role}</div>
            </div>
            <ChevronDown size={14} style={{color:'var(--text-muted)'}} />
          </button>
          {showSwitcher && (
            <div style={{
              position:'absolute', top:'100%', right:0, width:280, background:'var(--bg-secondary)',
              border:'1px solid var(--border)', borderRadius:12, padding:8, zIndex:50, boxShadow:'var(--shadow)'
            }} className="fade-in">
              <div style={{padding:'8px 12px',fontSize:11,textTransform:'uppercase',letterSpacing:1,color:'var(--text-muted)'}}>
                Switch User (Demo)
              </div>
              {users.map(u => (
                <button key={u.id} onClick={() => { switchRole(u.id); setShowSwitcher(false); }}
                  style={{
                    display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:8,
                    width:'100%',border:'none',background: u.id===currentUser.id ? 'var(--accent-glow)' : 'transparent',
                    color:'var(--text-primary)',cursor:'pointer',fontFamily:'inherit',textAlign:'left',
                    transition:'background 0.15s'
                  }}
                  onMouseEnter={e=>(e.currentTarget.style.background = u.id===currentUser.id ? 'var(--accent-glow)' : 'var(--bg-glass)')}
                  onMouseLeave={e=>(e.currentTarget.style.background = u.id===currentUser.id ? 'var(--accent-glow)' : 'transparent')}
                >
                  <div className={`avatar avatar-sm ${u.role === 'ADMIN' ? 'admin' : u.role === 'MANAGER' ? 'manager' : 'employee'}`}>
                    {getInitials(u.firstName, u.lastName)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:500}}>{u.firstName} {u.lastName}</div>
                    <div style={{fontSize:11,color:'var(--text-muted)'}}>{u.role} · {u.department}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
