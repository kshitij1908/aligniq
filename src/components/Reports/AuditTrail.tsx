import React, { useState } from 'react';
import { useDataStore } from '../../stores/dataStore';
import { getFullName, formatDateTime, exportToCSV } from '../../utils/formatters';
import { Download, Search } from 'lucide-react';

export default function AuditTrail() {
  const store = useDataStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const logs = store.auditLogs;
  const changeTypes = [...new Set(logs.map(l => l.changeType))];

  const filtered = logs
    .filter(l => typeFilter === 'ALL' || l.changeType === typeFilter)
    .filter(l => {
      if (!search) return true;
      const user = store.getUser(l.changedBy);
      const goal = store.getGoal(l.goalId);
      const s = search.toLowerCase();
      return (user && getFullName(user.firstName, user.lastName).toLowerCase().includes(s)) ||
             (goal && goal.title.toLowerCase().includes(s)) ||
             l.changeType.toLowerCase().includes(s);
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleExport = () => {
    exportToCSV(filtered.map(l => {
      const user = store.getUser(l.changedBy);
      const goal = store.getGoal(l.goalId);
      return {
        timestamp: l.timestamp,
        changedBy: user ? getFullName(user.firstName, user.lastName) : l.changedBy,
        goal: goal?.title || l.goalId,
        changeType: l.changeType,
        oldValue: l.oldValue,
        newValue: l.newValue,
        reason: l.reason || '',
      };
    }) as Record<string, unknown>[], 'audit_trail');
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700}}>Audit Trail</h2>
          <p style={{color:'var(--text-secondary)',fontSize:14}}>{filtered.length} records</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExport}><Download size={16}/> Export</button>
      </div>

      <div className="filter-bar">
        <div style={{position:'relative',flex:1,maxWidth:300}}>
          <Search size={16} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}} />
          <input className="form-input" placeholder="Search by user, goal..." value={search}
                 onChange={e => setSearch(e.target.value)} style={{paddingLeft:36}} />
        </div>
        <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="ALL">All Changes</option>
          {changeTypes.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead><tr><th>Timestamp</th><th>Changed By</th><th>Goal</th><th>Change</th><th>Old → New</th><th>Reason</th></tr></thead>
          <tbody>
            {filtered.map(log => {
              const user = store.getUser(log.changedBy);
              const goal = store.getGoal(log.goalId);
              return (
                <tr key={log.id}>
                  <td style={{fontSize:13,whiteSpace:'nowrap'}}>{formatDateTime(log.timestamp)}</td>
                  <td style={{fontWeight:500}}>{user ? getFullName(user.firstName, user.lastName) : log.changedBy}</td>
                  <td>{goal?.title || log.goalId.slice(0,8)}</td>
                  <td><span className="badge badge-info">{log.changeType.replace(/_/g,' ')}</span></td>
                  <td style={{fontSize:13}}>
                    <span style={{color:'var(--color-danger)'}}>{log.oldValue.length > 30 ? log.oldValue.slice(0,30)+'...' : log.oldValue}</span>
                    <span style={{margin:'0 6px',color:'var(--text-muted)'}}>→</span>
                    <span style={{color:'var(--color-success)'}}>{log.newValue.length > 30 ? log.newValue.slice(0,30)+'...' : log.newValue}</span>
                  </td>
                  <td style={{fontSize:13,color:'var(--text-secondary)'}}>{log.reason || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <div className="empty-state"><div className="icon">📜</div><h3>No audit records</h3><p>No changes match your filter.</p></div>
      )}
    </div>
  );
}
