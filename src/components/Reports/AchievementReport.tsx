import React, { useState } from 'react';
import { useDataStore } from '../../stores/dataStore';
import { getFullName } from '../../utils/formatters';
import { exportToCSV } from '../../utils/formatters';
import { Download, Filter } from 'lucide-react';
import { Quarter, ThrustArea, THRUST_AREAS } from '../../types';

export default function AchievementReport() {
  const store = useDataStore();
  const [quarter, setQuarter] = useState<Quarter>('Q1');
  const [dept, setDept] = useState('ALL');

  const allGoals = store.goals.filter(g => g.status === 'LOCKED');
  const filtered = dept === 'ALL' ? allGoals : allGoals.filter(g => g.thrustArea === dept);

  const rows = filtered.map(goal => {
    const emp = store.getUser(goal.employeeId);
    const manager = emp?.managerId ? store.getUser(emp.managerId) : null;
    const ci = store.checkIns.find(c => c.goalId === goal.id && c.quarter === quarter);
    return {
      employeeName: emp ? getFullName(emp.firstName, emp.lastName) : 'Unknown',
      department: goal.thrustArea,
      managerName: manager ? getFullName(manager.firstName, manager.lastName) : 'N/A',
      goalTitle: goal.title,
      uomType: goal.uomType,
      target: goal.targetValue,
      achievement: ci?.achievement ?? 'N/A',
      progressScore: ci?.progressScore ?? 'N/A',
      status: ci?.status ?? 'No Check-in',
      quarter,
      lastUpdated: ci?.updatedAt ?? goal.updatedAt,
    };
  });

  const handleExport = () => {
    exportToCSV(rows as Record<string, unknown>[], `achievement_report_${quarter}`);
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700}}>Achievement Report</h2>
          <p style={{color:'var(--text-secondary)',fontSize:14}}>{rows.length} goals</p>
        </div>
        <button className="btn btn-primary" onClick={handleExport}><Download size={16}/> Export CSV</button>
      </div>

      <div className="filter-bar">
        <select className="form-select" value={quarter} onChange={e => setQuarter(e.target.value as Quarter)}>
          <option value="Q1">Q1</option><option value="Q2">Q2</option>
          <option value="Q3">Q3</option><option value="Q4">Q4</option>
        </select>
        <select className="form-select" value={dept} onChange={e => setDept(e.target.value)}>
          <option value="ALL">All Departments</option>
          {THRUST_AREAS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>Employee</th><th>Dept</th><th>Manager</th><th>Goal</th><th>UoM</th><th>Target</th><th>Actual</th><th>Score</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={{fontWeight:500}}>{r.employeeName}</td>
                <td><span className="badge badge-info">{r.department}</span></td>
                <td>{r.managerName}</td>
                <td>{r.goalTitle}</td>
                <td>{r.uomType}</td>
                <td>{r.target}</td>
                <td>{r.achievement}</td>
                <td>
                  {typeof r.progressScore === 'number' ? (
                    <span style={{fontWeight:700,color:r.progressScore>=90?'var(--color-success)':r.progressScore>=50?'var(--color-warning)':'var(--color-danger)'}}>
                      {r.progressScore}%
                    </span>
                  ) : 'N/A'}
                </td>
                <td>
                  <span className={`badge ${r.status==='COMPLETED'?'badge-success':r.status==='ON_TRACK'?'badge-warning':'badge-draft'}`}>
                    {String(r.status).replace('_',' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="empty-state"><div className="icon">📊</div><h3>No data</h3><p>No approved goals found for this filter.</p></div>
      )}
    </div>
  );
}
