import React, { useState } from 'react';
import { useDataStore } from '../../stores/dataStore';
import { useAuthStore } from '../../stores/authStore';
import OrgHierarchyTree from './OrgHierarchyTree';
import { RefreshCw, Shield, Users, CheckCircle } from 'lucide-react';

const AD_GROUPS: Record<string, string[]> = {
  'user-admin-1': ['AlignIQ-Admins', 'HR-Department', 'All-Staff'],
  'user-mgr-1':   ['AlignIQ-Managers', 'Sales-Department', 'All-Staff'],
  'user-mgr-2':   ['AlignIQ-Managers', 'IT-Department', 'All-Staff'],
  'user-emp-1':   ['AlignIQ-Employees', 'Sales-Department', 'All-Staff'],
  'user-emp-2':   ['AlignIQ-Employees', 'Sales-Department', 'All-Staff'],
  'user-emp-3':   ['AlignIQ-Employees', 'IT-Department', 'All-Staff'],
  'user-emp-4':   ['AlignIQ-Employees', 'IT-Department', 'All-Staff'],
};

const JOB_TITLES: Record<string, string> = {
  'user-admin-1': 'HR Director', 'user-mgr-1': 'Sales Manager',
  'user-mgr-2': 'IT Manager', 'user-emp-1': 'Sales Executive',
  'user-emp-2': 'Business Development Rep', 'user-emp-3': 'DevOps Engineer',
  'user-emp-4': 'Software Engineer',
};

export default function AzureADSyncPanel() {
  const store = useDataStore();
  const { currentUser } = useAuthStore();
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [tab, setTab] = useState<'overview' | 'hierarchy' | 'groups'>('overview');

  if (!currentUser || currentUser.role !== 'ADMIN') return <div>Access denied</div>;

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1600));
    store.syncAzureADProfiles(AD_GROUPS, JOB_TITLES);
    setSyncing(false);
    setSynced(true);
    setTimeout(() => setSynced(false), 3000);
  };

  const users = store.users;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Microsoft Entra ID (Azure AD)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            SSO Integration · Org Hierarchy · Role Mapping
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleSync} disabled={syncing}>
          <RefreshCw size={15} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
          {syncing ? 'Syncing…' : synced ? '✓ Synced' : 'Re-sync from Azure AD'}
        </button>
      </div>

      {/* Connection status */}
      <div className="card" style={{ marginBottom: 20, borderColor: '#22c55e33' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e',
            boxShadow: '0 0 8px #22c55e' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Connected to Microsoft Entra ID</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Tenant: aligniq.onmicrosoft.com · Last sync: {new Date().toLocaleString()}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 24 }}>
            {[
              { label: 'Users synced', value: users.length, icon: <Users size={16}/> },
              { label: 'SSO enabled', value: 'Active', icon: <Shield size={16}/> },
              { label: 'Groups mapped', value: 3, icon: <CheckCircle size={16}/> },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ color: '#6366f1', marginBottom: 2 }}>{s.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['overview', 'hierarchy', 'groups'] as const).map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr>
                <th>User</th><th>Email</th><th>Job Title</th>
                <th>Azure AD ID</th><th>AD Groups</th><th>Role Mapped</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</td>
                    <td style={{ fontSize: 12 }}>{u.email}</td>
                    <td>{u.jobTitle || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {u.azureAdId ? `${u.azureAdId.slice(0, 12)}…` : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(u.azureGroups || []).map(g => (
                          <span key={g} className="badge badge-info" style={{ fontSize: 10 }}>{g}</span>
                        ))}
                        {!u.azureGroups?.length && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-warning' : u.role === 'MANAGER' ? 'badge-info' : 'badge-success'}`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'hierarchy' && (
        <div className="card"><OrgHierarchyTree /></div>
      )}

      {tab === 'groups' && (
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { group: 'AlignIQ-Admins', role: 'ADMIN', color: '#6366f1',
                members: users.filter(u => u.role === 'ADMIN') },
              { group: 'AlignIQ-Managers', role: 'MANAGER', color: '#3b82f6',
                members: users.filter(u => u.role === 'MANAGER') },
              { group: 'AlignIQ-Employees', role: 'EMPLOYEE', color: '#22c55e',
                members: users.filter(u => u.role === 'EMPLOYEE') },
            ].map(g => (
              <div key={g.group} style={{ background: 'var(--bg-glass)', borderRadius: 10,
                padding: 16, border: `1px solid ${g.color}33` }}>
                <div style={{ fontWeight: 700, color: g.color, marginBottom: 4, fontSize: 13 }}>{g.group}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Maps to role: <strong style={{ color: 'var(--text-primary)' }}>{g.role}</strong>
                </div>
                {g.members.map(u => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: g.color + '33',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: g.color }}>
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <span style={{ fontSize: 13 }}>{u.firstName} {u.lastName}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
