import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { getInitials } from '../utils/formatters';
import { Rocket, X } from 'lucide-react';

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithMicrosoft, ssoLoading } = useAuthStore();
  const users = useDataStore(s => s.users);
  const [showSSO, setShowSSO] = useState(false);
  const [ssoEmail, setSsoEmail] = useState('');
  const [ssoStep, setSsoStep] = useState<'email' | 'password' | 'mfa'>('email');
  const [ssoPassword, setSsoPassword] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const roleBg: Record<string, string> = { ADMIN:'#6366f1', MANAGER:'#3b82f6', EMPLOYEE:'#22c55e' };
  const roleBgLight: Record<string, string> = {
    ADMIN:'rgba(99,102,241,0.15)', MANAGER:'rgba(59,130,246,0.15)', EMPLOYEE:'rgba(34,197,94,0.15)',
  };

  const handleDemoLogin = (userId: string) => { login(userId); navigate('/dashboard'); };

  const handleSSONext = () => {
    if (ssoStep === 'email') { setSsoStep('password'); return; }
    if (ssoStep === 'password') { setSsoStep('mfa'); return; }
    // MFA step — match user by email
    const matched = users.find(u => u.email.toLowerCase() === ssoEmail.toLowerCase());
    const userId = matched?.id || users[0].id;
    loginWithMicrosoft(userId).then(() => navigate('/dashboard'));
  };

  const ssoValid = ssoStep === 'email' ? ssoEmail.includes('@')
    : ssoStep === 'password' ? ssoPassword.length >= 4 : true;

  return (
    <div className="login-page">
      <div className="login-card slide-up">
        <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
          <div style={{ width:56, height:56, borderRadius:16,
            background:'linear-gradient(135deg,#6366f1,#a78bfa)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Rocket size={28} color="#fff" />
          </div>
        </div>
        <h1>AlignIQ</h1>
        <p>Goal Setting &amp; Tracking Portal</p>

        {/* Primary: Sign in with Microsoft */}
        <button onClick={() => { setShowSSO(true); setSsoStep('email'); setSsoEmail(''); setSsoPassword(''); }}
          style={{
            width:'100%', padding:'12px 16px', borderRadius:8, border:'1px solid #8c8c8c',
            background:'#fff', color:'#1a1a1a', display:'flex', alignItems:'center',
            justifyContent:'center', gap:10, fontSize:15, fontWeight:600,
            cursor:'pointer', marginBottom:16, fontFamily:'Segoe UI, sans-serif',
            transition:'background 0.15s',
          }}
          onMouseEnter={e=>(e.currentTarget.style.background='#f3f3f3')}
          onMouseLeave={e=>(e.currentTarget.style.background='#fff')}>
          <MicrosoftIcon /> Sign in with Microsoft
        </button>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div style={{ flex:1, height:1, background:'var(--border)' }} />
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>or use demo account</span>
          <div style={{ flex:1, height:1, background:'var(--border)' }} />
        </div>

        <button className="btn btn-secondary" style={{ width:'100%', marginBottom:16 }}
          onClick={() => setShowDemo(!showDemo)}>
          {showDemo ? 'Hide Demo Users' : 'Browse Demo Users'}
        </button>

        {showDemo && (
          <div className="login-users">
            {users.map(u => (
              <button key={u.id} className="login-user-btn" onClick={() => handleDemoLogin(u.id)}>
                <div className={`avatar ${u.role==='ADMIN'?'admin':u.role==='MANAGER'?'manager':'employee'}`}>
                  {getInitials(u.firstName, u.lastName)}
                </div>
                <div className="info">
                  <div className="name">{u.firstName} {u.lastName}</div>
                  <div className="email">{u.email}</div>
                </div>
                <span className="role-badge" style={{ background:roleBgLight[u.role], color:roleBg[u.role] }}>
                  {u.role}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Microsoft SSO Modal */}
      {showSSO && (
        <div className="modal-overlay" onClick={() => setShowSSO(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{
              background:'#fff', borderRadius:4, width:440, padding:44,
              boxShadow:'0 8px 40px rgba(0,0,0,0.4)', position:'relative',
            }}>
            <button onClick={() => setShowSSO(false)}
              style={{ position:'absolute', top:12, right:12, background:'none', border:'none',
                cursor:'pointer', color:'#666' }}><X size={18}/></button>

            <div style={{ marginBottom:20 }}>
              <MicrosoftIcon />
            </div>
            <div style={{ fontSize:18, fontWeight:300, color:'#1a1a1a', marginBottom:4, fontFamily:'Segoe UI' }}>
              {ssoStep === 'email' ? 'Sign in' : ssoStep === 'password' ? 'Enter password' : 'Verify it\'s you'}
            </div>
            {ssoStep !== 'email' && (
              <div style={{ fontSize:14, color:'#666', marginBottom:16 }}>{ssoEmail}</div>
            )}

            {ssoStep === 'email' && (
              <input value={ssoEmail} onChange={e=>setSsoEmail(e.target.value)}
                placeholder="Email, phone, or Skype"
                style={{
                  width:'100%', padding:'8px 0', border:'none',
                  borderBottom:'2px solid #0067b8', outline:'none',
                  fontSize:15, color:'#1a1a1a', background:'transparent',
                  fontFamily:'Segoe UI', boxSizing:'border-box', marginBottom:24,
                }}
              />
            )}
            {ssoStep === 'password' && (
              <input type="password" value={ssoPassword} onChange={e=>setSsoPassword(e.target.value)}
                placeholder="Password"
                style={{
                  width:'100%', padding:'8px 0', border:'none',
                  borderBottom:'2px solid #0067b8', outline:'none',
                  fontSize:15, color:'#1a1a1a', background:'transparent',
                  fontFamily:'Segoe UI', boxSizing:'border-box', marginBottom:24,
                }}
              />
            )}
            {ssoStep === 'mfa' && (
              <div style={{ padding:'16px 0', fontSize:14, color:'#444', marginBottom:24 }}>
                📱 We sent a verification code to your Authenticator app. Please approve the sign-in request.
                <div style={{ marginTop:12, padding:10, background:'#f0f6ff', borderRadius:4,
                  fontSize:13, color:'#0067b8', fontWeight:600 }}>
                  Approval request sent — click Next to continue.
                </div>
              </div>
            )}

            <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
              {ssoStep !== 'email' && (
                <button onClick={() => setSsoStep(ssoStep==='mfa'?'password':'email')}
                  style={{ padding:'8px 20px', border:'1px solid #8c8c8c', borderRadius:0,
                    background:'#fff', cursor:'pointer', fontSize:14, fontFamily:'Segoe UI' }}>
                  Back
                </button>
              )}
              <button onClick={handleSSONext} disabled={!ssoValid || ssoLoading}
                style={{
                  padding:'8px 20px', background: ssoValid ? '#0067b8' : '#ccc',
                  color:'#fff', border:'none', borderRadius:0, cursor: ssoValid ? 'pointer' : 'default',
                  fontSize:14, fontFamily:'Segoe UI', fontWeight:600, minWidth:80,
                }}>
                {ssoLoading ? 'Signing in…' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
