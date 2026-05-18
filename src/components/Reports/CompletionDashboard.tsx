import React from 'react';
import { useDataStore } from '../../stores/dataStore';
import { getFullName } from '../../utils/formatters';
import { Users, Target, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CompletionDashboard() {
  const store = useDataStore();
  const employees = store.users.filter(u => u.role === 'EMPLOYEE');
  const allGoals = store.goals;
  const checkIns = store.checkIns;

  const goalsCreated = allGoals.length;
  const goalsApproved = allGoals.filter(g => g.status === 'LOCKED').length;
  const goalsSubmitted = allGoals.filter(g => g.status === 'SUBMITTED').length;
  const drafts = allGoals.filter(g => g.status === 'DRAFT').length;
  const rejected = allGoals.filter(g => g.status === 'REJECTED').length;

  // By Manager
  const managers = store.users.filter(u => u.role === 'MANAGER');
  const byManager = managers.map(m => {
    const team = store.users.filter(u => u.managerId === m.id);
    const teamGoals = allGoals.filter(g => team.some(u => u.id === g.employeeId));
    const approved = teamGoals.filter(g => g.status === 'LOCKED').length;
    return { name: getFullName(m.firstName, m.lastName), teamSize: team.length, approved, total: teamGoals.length, completion: teamGoals.length > 0 ? Math.round(approved/teamGoals.length*100) : 0 };
  });

  // By Department
  const depts = new Set(allGoals.map(g => g.thrustArea));
  const byDept = Array.from(depts).map(d => {
    const dg = allGoals.filter(g => g.thrustArea === d);
    return { department: d, total: dg.length, approved: dg.filter(g=>g.status==='LOCKED').length, pending: dg.filter(g=>g.status==='SUBMITTED').length, completion: dg.length > 0 ? Math.round(dg.filter(g=>g.status==='LOCKED').length/dg.length*100) : 0 };
  });

  // Employees without goals
  const empWithoutGoals = employees.filter(e => !allGoals.some(g => g.employeeId === e.id));

  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:700,marginBottom:24}}>Completion Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{employees.length}</div><div className="stat-label">Total Employees</div></div>
        <div className="stat-card info"><div className="stat-value">{goalsCreated}</div><div className="stat-label">Goals Created</div></div>
        <div className="stat-card success"><div className="stat-value">{goalsApproved}</div><div className="stat-label">Goals Approved ({goalsCreated>0?Math.round(goalsApproved/goalsCreated*100):0}%)</div></div>
        <div className="stat-card warning"><div className="stat-value">{checkIns.length}</div><div className="stat-label">Check-ins Submitted</div></div>
      </div>

      {/* Status Breakdown */}
      <div className="card" style={{marginBottom:24}}>
        <h3 className="card-title" style={{marginBottom:16}}>Goal Status Breakdown</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
          {[
            {label:'Draft',count:drafts,color:'var(--status-draft)'},
            {label:'Submitted',count:goalsSubmitted,color:'var(--status-submitted)'},
            {label:'Approved',count:goalsApproved,color:'var(--status-approved)'},
            {label:'Rejected',count:rejected,color:'var(--status-rejected)'},
          ].map(s => (
            <div key={s.label} style={{textAlign:'center',padding:16,background:'var(--bg-glass)',borderRadius:8}}>
              <div style={{fontSize:28,fontWeight:700,color:s.color}}>{s.count}</div>
              <div style={{fontSize:13,color:'var(--text-secondary)'}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        <div className="card">
          <h3 className="card-title" style={{marginBottom:16}}>By Manager</h3>
          <div className="table-container">
            <table>
              <thead><tr><th>Manager</th><th>Team</th><th>Approved</th><th>Completion</th></tr></thead>
              <tbody>
                {byManager.map(m => (
                  <tr key={m.name}>
                    <td style={{fontWeight:500}}>{m.name}</td>
                    <td>{m.teamSize}</td>
                    <td>{m.approved}/{m.total}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div className="progress-bar" style={{width:80}}>
                          <div className={`progress-fill ${m.completion>=80?'green':m.completion>=50?'yellow':'red'}`} style={{width:`${m.completion}%`}}/>
                        </div>
                        <span style={{fontSize:13}}>{m.completion}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{marginBottom:16}}>By Department</h3>
          <div className="table-container">
            <table>
              <thead><tr><th>Department</th><th>Total</th><th>Approved</th><th>Completion</th></tr></thead>
              <tbody>
                {byDept.map(d => (
                  <tr key={d.department}>
                    <td style={{fontWeight:500}}>{d.department}</td>
                    <td>{d.total}</td>
                    <td>{d.approved}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div className="progress-bar" style={{width:80}}>
                          <div className={`progress-fill ${d.completion>=80?'green':d.completion>=50?'yellow':'red'}`} style={{width:`${d.completion}%`}}/>
                        </div>
                        <span style={{fontSize:13}}>{d.completion}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {empWithoutGoals.length > 0 && (
        <div className="card" style={{marginTop:24,borderColor:'rgba(239,68,68,0.3)'}}>
          <h3 className="card-title" style={{color:'var(--color-danger)',marginBottom:12}}>⚠️ Employees Without Goals ({empWithoutGoals.length})</h3>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {empWithoutGoals.map(e => (
              <span key={e.id} className="badge badge-draft">{getFullName(e.firstName,e.lastName)}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
