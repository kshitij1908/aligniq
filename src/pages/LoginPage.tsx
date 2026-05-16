import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { getInitials } from '../utils/formatters';
import { Rocket } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const users = useDataStore(s => s.users);

  const handleLogin = (userId: string) => {
    login(userId);
    navigate('/dashboard');
  };

  const roleBg: Record<string, string> = { ADMIN: '#6366f1', MANAGER: '#3b82f6', EMPLOYEE: '#22c55e' };
  const roleBgLight: Record<string, string> = { ADMIN: 'rgba(99,102,241,0.15)', MANAGER: 'rgba(59,130,246,0.15)', EMPLOYEE: 'rgba(34,197,94,0.15)' };

  return (
    <div className="login-page">
      <div className="login-card slide-up">
        <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
          <div style={{width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#6366f1,#a78bfa)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Rocket size={28} color="#fff" />
          </div>
        </div>
        <h1>AtomQuest</h1>
        <p>Goal Setting & Tracking Portal — Select a user to begin</p>

        <div className="login-users">
          {users.map(u => (
            <button key={u.id} className="login-user-btn" onClick={() => handleLogin(u.id)}>
              <div className={`avatar ${u.role === 'ADMIN' ? 'admin' : u.role === 'MANAGER' ? 'manager' : 'employee'}`}>
                {getInitials(u.firstName, u.lastName)}
              </div>
              <div className="info">
                <div className="name">{u.firstName} {u.lastName}</div>
                <div className="email">{u.email}</div>
              </div>
              <span className="role-badge" style={{background:roleBgLight[u.role], color:roleBg[u.role]}}>
                {u.role}
              </span>
            </button>
          ))}
        </div>

        <div style={{textAlign:'center',fontSize:12,color:'var(--text-muted)'}}>
          Demo mode — click any user to sign in
        </div>
      </div>
    </div>
  );
}
