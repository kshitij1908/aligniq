import React from 'react';
import { useDataStore } from '../../stores/dataStore';
import { User } from '../../types';

function UserNode({ user, allUsers, depth }: { user: User; allUsers: User[]; depth: number }) {
  const reports = allUsers.filter(u => u.managerId === user.id);
  const roleColor = user.role === 'ADMIN' ? '#6366f1' : user.role === 'MANAGER' ? '#3b82f6' : '#22c55e';

  return (
    <div style={{ marginLeft: depth * 24 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        background: 'var(--bg-glass)', borderRadius: 8, marginBottom: 6,
        border: `1px solid ${roleColor}33`, position: 'relative',
      }}>
        {depth > 0 && (
          <div style={{
            position: 'absolute', left: -20, top: '50%', width: 14, height: 1,
            background: 'var(--border)',
          }} />
        )}
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: roleColor + '33',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: roleColor, flexShrink: 0,
        }}>
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{user.firstName} {user.lastName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {user.jobTitle || user.role} · {user.department}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 8, textTransform: 'uppercase',
            background: roleColor + '22', color: roleColor, letterSpacing: 0.5,
          }}>{user.role}</span>
          {user.azureAdId && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              🔵 AD: {user.azureAdId.slice(0, 8)}…
            </span>
          )}
        </div>
      </div>
      {reports.length > 0 && (
        <div style={{ borderLeft: '1px solid var(--border)', marginLeft: 15, paddingLeft: 8 }}>
          {reports.map(r => (
            <UserNode key={r.id} user={r} allUsers={allUsers} depth={1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgHierarchyTree() {
  const users = useDataStore(s => s.users);
  const roots = users.filter(u => u.managerId === null);

  return (
    <div>
      <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
        Reporting hierarchy synced from Microsoft Entra ID · {users.length} users
      </div>
      {roots.map(root => (
        <UserNode key={root.id} user={root} allUsers={users} depth={0} />
      ))}
    </div>
  );
}
