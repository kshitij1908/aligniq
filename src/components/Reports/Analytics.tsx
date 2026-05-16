import React from 'react';
import { useDataStore } from '../../stores/dataStore';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getFullName } from '../../utils/formatters';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a78bfa'];

export default function Analytics() {
  const store = useDataStore();
  const goals = store.goals;
  const checkIns = store.checkIns;

  // UoM Distribution
  const uomData = ['MIN', 'MAX', 'TIMELINE', 'ZERO'].map(type => ({
    name: type, value: goals.filter(g => g.uomType === type).length
  })).filter(d => d.value > 0);

  // Goals by Thrust Area
  const thrustData = Array.from(new Set(goals.map(g => g.thrustArea))).map(area => ({
    name: area,
    total: goals.filter(g => g.thrustArea === area).length,
    approved: goals.filter(g => g.thrustArea === area && g.status === 'LOCKED').length,
  }));

  // Manager Completion
  const managers = store.users.filter(u => u.role === 'MANAGER');
  const managerData = managers.map(m => {
    const team = store.users.filter(u => u.managerId === m.id);
    const teamGoals = goals.filter(g => team.some(u => u.id === g.employeeId));
    const approved = teamGoals.filter(g => g.status === 'LOCKED').length;
    return {
      name: m.firstName,
      total: teamGoals.length,
      approved,
      rate: teamGoals.length > 0 ? Math.round(approved / teamGoals.length * 100) : 0,
    };
  });

  // Avg Score by Quarter
  const quarterData = (['Q1', 'Q2', 'Q3', 'Q4'] as const).map(q => {
    const qCheckIns = checkIns.filter(c => c.quarter === q);
    const avg = qCheckIns.length > 0
      ? Math.round(qCheckIns.reduce((s, c) => s + c.progressScore, 0) / qCheckIns.length)
      : 0;
    return { quarter: q, avgScore: avg, count: qCheckIns.length };
  });

  // Status distribution
  const statusData = ['DRAFT', 'SUBMITTED', 'LOCKED', 'REJECTED'].map(s => ({
    name: s, value: goals.filter(g => g.status === s).length
  })).filter(d => d.value > 0);

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Analytics & Insights</h2>

      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-value">{goals.length}</div>
          <div className="stat-label">Total Goals</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{checkIns.length > 0 ? Math.round(checkIns.reduce((s, c) => s + c.progressScore, 0) / checkIns.length) : 0}%</div>
          <div className="stat-label">Avg Progress</div>
        </div>
        <div className="stat-card info">
          <div className="stat-value">{new Set(goals.map(g => g.thrustArea)).size}</div>
          <div className="stat-label">Thrust Areas</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{checkIns.filter(c => c.progressScore >= 90).length}</div>
          <div className="stat-label">Goals On Track (≥90%)</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Goals by UoM Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={uomData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({name,value})=>`${name}: ${value}`}>
                {uomData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f1f5f9'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Goal Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({name,value})=>`${name}: ${value}`}>
                {statusData.map((d, i) => (
                  <Cell key={i} fill={d.name==='LOCKED'?'#22c55e':d.name==='SUBMITTED'?'#f59e0b':d.name==='REJECTED'?'#ef4444':'#64748b'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f1f5f9'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Goals by Thrust Area</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={thrustData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{fill:'#94a3b8',fontSize:12}} />
              <YAxis tick={{fill:'#94a3b8',fontSize:12}} />
              <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f1f5f9'}} />
              <Bar dataKey="total" fill="#6366f1" radius={[4,4,0,0]} name="Total" />
              <Bar dataKey="approved" fill="#22c55e" radius={[4,4,0,0]} name="Approved" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Manager Completion Rates</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={managerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{fill:'#94a3b8',fontSize:12}} />
              <YAxis tick={{fill:'#94a3b8',fontSize:12}} domain={[0,100]} />
              <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f1f5f9'}} />
              <Bar dataKey="rate" fill="#3b82f6" radius={[4,4,0,0]} name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card" style={{marginTop:24}}>
        <h3>Average Score by Quarter</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={quarterData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="quarter" tick={{fill:'#94a3b8',fontSize:12}} />
            <YAxis tick={{fill:'#94a3b8',fontSize:12}} domain={[0,120]} />
            <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f1f5f9'}} />
            <Bar dataKey="avgScore" fill="#a78bfa" radius={[4,4,0,0]} name="Avg Score %" />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
