import React from 'react';
import { useDataStore } from '../../stores/dataStore';
import { Users, Target, CheckCircle, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const store = useDataStore();
  const allGoals = store.goals;
  const allUsers = store.users;
  const employees = allUsers.filter(u => u.role === 'EMPLOYEE');
  const locked = allGoals.filter(g => g.status === 'LOCKED');
  const submitted = allGoals.filter(g => g.status === 'SUBMITTED');
  const checkIns = store.checkIns;
  const activeCycle = store.getActiveCycle();

  const deptBreakdown: Record<string, {total:number,approved:number,pending:number}> = {};
  allGoals.forEach(g => {
    if (!deptBreakdown[g.thrustArea]) deptBreakdown[g.thrustArea] = {total:0,approved:0,pending:0};
    deptBreakdown[g.thrustArea].total++;
    if (g.status === 'LOCKED') deptBreakdown[g.thrustArea].approved++;
    if (g.status === 'SUBMITTED') deptBreakdown[g.thrustArea].pending++;
  });

  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:4}}>Organization Dashboard</h2>
      <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:24}}>
        {activeCycle ? `Active cycle: ${activeCycle.phase} (${activeCycle.cycleYear})` : 'No active cycle'}
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{employees.length}</div>
          <div className="stat-label">Employees</div>
          <Users size={40} className="stat-icon" style={{position:'absolute',top:16,right:16}} />
        </div>
        <div className="stat-card info">
          <div className="stat-value">{allGoals.length}</div>
          <div className="stat-label">Total Goals</div>
          <Target size={40} className="stat-icon" style={{position:'absolute',top:16,right:16}} />
        </div>
        <div className="stat-card success">
          <div className="stat-value">{locked.length}</div>
          <div className="stat-label">Approved Goals</div>
          <CheckCircle size={40} className="stat-icon" style={{position:'absolute',top:16,right:16}} />
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{checkIns.length}</div>
          <div className="stat-label">Check-ins</div>
          <TrendingUp size={40} className="stat-icon" style={{position:'absolute',top:16,right:16}} />
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        <div className="card">
          <h3 className="card-title" style={{marginBottom:16}}>Goals by Department</h3>
          <div className="table-container">
            <table>
              <thead><tr><th>Department</th><th>Total</th><th>Approved</th><th>Pending</th></tr></thead>
              <tbody>
                {Object.entries(deptBreakdown).map(([dept, d]) => (
                  <tr key={dept}>
                    <td style={{fontWeight:500}}>{dept}</td>
                    <td>{d.total}</td>
                    <td><span className="badge badge-success">{d.approved}</span></td>
                    <td><span className="badge badge-warning">{d.pending}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{marginBottom:16}}>Goal Status Distribution</h3>
          {['DRAFT','SUBMITTED','LOCKED','REJECTED'].map(s => {
            const count = allGoals.filter(g => g.status === s).length;
            const pct = allGoals.length > 0 ? Math.round(count/allGoals.length*100) : 0;
            return (
              <div key={s} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span className={`badge badge-${s.toLowerCase()}`}>{s}</span>
                  <span style={{fontSize:13,color:'var(--text-secondary)'}}>{count} ({pct}%)</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${s==='LOCKED'?'green':s==='SUBMITTED'?'yellow':s==='REJECTED'?'red':'blue'}`}
                       style={{width:`${pct}%`}} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{marginTop:24}}>
        <h3 className="card-title" style={{marginBottom:16}}>Recent Activity</h3>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {store.auditLogs.slice(-8).reverse().map(log => {
            const user = store.getUser(log.changedBy);
            return (
              <div key={log.id} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:log.changeType.includes('approved') || log.changeType.includes('LOCKED') ? 'var(--color-success)' : 'var(--accent)',flexShrink:0}} />
                <div style={{flex:1}}>
                  <span style={{fontSize:13}}><strong>{user?.firstName} {user?.lastName}</strong> — {log.changeType.replace(/_/g,' ')}</span>
                </div>
                <span style={{fontSize:12,color:'var(--text-muted)'}}>{new Date(log.timestamp).toLocaleDateString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
