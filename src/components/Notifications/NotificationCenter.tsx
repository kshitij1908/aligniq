import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { useNavigate } from 'react-router-dom';
import { Notification, NotificationChannel } from '../../types';
import TeamsCard from './TeamsCard';
import { Bell, Mail, MessageSquare, Layers, CheckCheck, ExternalLink } from 'lucide-react';

const TAB_ICONS: Record<string, React.ReactNode> = {
  all: <Layers size={15} />, 'in-app': <Bell size={15} />,
  email: <Mail size={15} />, teams: <MessageSquare size={15} />,
};

export default function NotificationCenter() {
  const { currentUser } = useAuthStore();
  const store = useDataStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'all' | NotificationChannel>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!currentUser) return null;

  const all = store.getNotifications(currentUser.id);
  const filtered = tab === 'all' ? all : all.filter(n => n.channel === tab);

  const markAll = () => all.filter(n => !n.read).forEach(n => store.markNotificationRead(n.id));

  const typeColor: Record<string, string> = {
    info: '#3b82f6', success: '#22c55e', warning: '#f59e0b', error: '#ef4444',
  };

  const handleDeepLink = (n: Notification) => {
    store.markNotificationRead(n.id);
    if (n.deepLink) navigate(n.deepLink);
    else if (n.link) navigate(n.link);
  };

  const tabs: Array<'all' | NotificationChannel> = ['all', 'in-app', 'email', 'teams'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Notification Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {all.filter(n => !n.read).length} unread · {all.length} total
          </p>
        </div>
        <button className="btn btn-secondary" onClick={markAll}>
          <CheckCheck size={16} /> Mark all read
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, textTransform: 'capitalize' }}>
            {TAB_ICONS[t]} {t === 'in-app' ? 'In-App' : t}
            <span style={{
              background: tab === t ? 'rgba(255,255,255,0.2)' : 'var(--bg-glass)',
              borderRadius: 10, padding: '1px 7px', fontSize: 11,
            }}>
              {t === 'all' ? all.length : all.filter(n => n.channel === t).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          <Bell size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div>No notifications in this category</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(n => (
            <div key={n.id} className="card"
              style={{ borderLeft: `3px solid ${typeColor[n.type]}`, opacity: n.read ? 0.65 : 1, cursor: 'pointer' }}
              onClick={() => setExpanded(expanded === n.id ? null : n.id)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: typeColor[n.type] + '22', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {n.channel === 'teams' ? <MessageSquare size={16} color={typeColor[n.type]} /> :
                   n.channel === 'email' ? <Mail size={16} color={typeColor[n.type]} /> :
                   <Bell size={16} color={typeColor[n.type]} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontWeight: n.read ? 400 : 600, fontSize: 14, color: 'var(--text-primary)' }}>
                      {n.title}
                      {!n.read && <span style={{ marginLeft: 8, width: 7, height: 7, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: 0.5,
                        background: n.channel === 'teams' ? '#6264A722' : n.channel === 'email' ? '#3b82f622' : '#6366f122',
                        color: n.channel === 'teams' ? '#6264A7' : n.channel === 'email' ? '#3b82f6' : '#6366f1',
                      }}>{n.channel}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{n.message}</div>
                </div>
              </div>

              {expanded === n.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}
                  onClick={e => e.stopPropagation()}>
                  {n.channel === 'teams' && n.teamsCardPayload && (
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Teams Adaptive Card Preview</div>
                      <TeamsCard payload={n.teamsCardPayload}
                        onAction={url => { store.markNotificationRead(n.id); navigate(url); }} />
                    </div>
                  )}
                  {n.channel === 'email' && (
                    <div style={{ background: 'var(--bg-glass)', borderRadius: 8, padding: 16, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Email Preview</div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                        Subject: {n.emailSubject || n.title}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                        {n.emailBody || n.message}
                      </div>
                    </div>
                  )}
                  {(n.deepLink || n.link) && (
                    <button className="btn btn-primary" style={{ marginTop: 12 }}
                      onClick={() => handleDeepLink(n)}>
                      <ExternalLink size={14} /> Go to {n.deepLink?.split('/').pop() || 'destination'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
