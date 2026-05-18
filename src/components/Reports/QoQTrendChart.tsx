import React, { useState } from 'react';
import { useDataStore } from '../../stores/dataStore';
import { QoQDataPoint, Quarter } from '../../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function QoQTrendChart() {
  const store = useDataStore();
  const employees = store.users.filter(u => u.role === 'EMPLOYEE');
  const [selectedEmp, setSelectedEmp] = useState<string>(employees[0]?.id || '');

  const avgScore = (goalIds: string[], q: Quarter) => {
    const cis = store.checkIns.filter(ci => goalIds.includes(ci.goalId) && ci.quarter === q);
    if (!cis.length) return 0;
    return Math.round(cis.reduce((s, c) => s + c.progressScore, 0) / cis.length);
  };

  const data: QoQDataPoint[] = QUARTERS.map(q => {
    // Individual
    const empGoals = store.goals.filter(g => g.employeeId === selectedEmp).map(g => g.id);
    const individual = avgScore(empGoals, q);

    // Team (same manager)
    const emp = store.getUser(selectedEmp);
    const teamIds = emp?.managerId
      ? store.users.filter(u => u.managerId === emp.managerId).map(u => u.id)
      : [selectedEmp];
    const teamGoalIds = store.goals.filter(g => teamIds.includes(g.employeeId)).map(g => g.id);
    const team = avgScore(teamGoalIds, q);

    // Org-wide
    const allGoalIds = store.goals.map(g => g.id);
    const organization = avgScore(allGoalIds, q);

    return { quarter: q, individual, team, organization };
  });

  const tooltipStyle = {
    contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Quarter-on-Quarter Achievement Trends</h3>
        <select className="form-select" style={{ width: 200 }} value={selectedEmp}
          onChange={e => setSelectedEmp(e.target.value)}>
          {employees.map(e => (
            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {data.map(d => (
          <div key={d.quarter} className="stat-card" style={{ flex: 1, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{d.quarter}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: d.individual >= 80 ? '#22c55e' : d.individual >= 50 ? '#f59e0b' : '#ef4444' }}>
              {d.individual > 0 ? `${d.individual}%` : '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Individual</div>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="quarter" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis domain={[0, 130]} tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
          <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v}%`]} />
          <Legend />
          <Line type="monotone" dataKey="individual" stroke="#6366f1" strokeWidth={2.5}
            dot={{ fill: '#6366f1', r: 5 }} name="Individual" />
          <Line type="monotone" dataKey="team" stroke="#3b82f6" strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }} strokeDasharray="5 3" name="Team Avg" />
          <Line type="monotone" dataKey="organization" stroke="#a78bfa" strokeWidth={1.5}
            dot={{ fill: '#a78bfa', r: 3 }} strokeDasharray="3 3" name="Org Avg" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
