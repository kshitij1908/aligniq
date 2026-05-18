import React, { useState } from 'react';
import { useDataStore } from '../../stores/dataStore';
import { HeatmapCell, ThrustArea, Quarter } from '../../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import HeatmapChart from './HeatmapChart';
import QoQTrendChart from './QoQTrendChart';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a78bfa'];
const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
const DEPTS: ThrustArea[] = ['Sales', 'Operations', 'HR', 'Marketing', 'IT', 'Other'];
const TS = { contentStyle: { background:'#1e293b', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#f1f5f9' } };

type AnalyticsTab = 'overview' | 'qoq' | 'heatmap' | 'managers';

export default function Analytics() {
  const store = useDataStore();
  const [tab, setTab] = useState<AnalyticsTab>('overview');
  const goals = store.goals;
  const checkIns = store.checkIns;

  // Overview charts
  const uomData = ['MIN','MAX','TIMELINE','ZERO'].map(type => ({
    name: type, value: goals.filter(g => g.uomType === type).length,
  })).filter(d => d.value > 0);

  const thrustData = Array.from(new Set(goals.map(g => g.thrustArea))).map(area => ({
    name: area,
    total: goals.filter(g => g.thrustArea === area).length,
    approved: goals.filter(g => g.thrustArea === area && g.status === 'LOCKED').length,
  }));

  const statusData = ['DRAFT','SUBMITTED','LOCKED','REJECTED'].map(s => ({
    name: s, value: goals.filter(g => g.status === s).length,
  })).filter(d => d.value > 0);

  // Manager effectiveness: check-in completion rates
  const managers = store.users.filter(u => u.role === 'MANAGER');
  const managerData = managers.map(m => {
    const team = store.users.filter(u => u.managerId === m.id);
    const teamGoals = goals.filter(g => team.some(u => u.id === g.employeeId) && g.status === 'LOCKED');
    const teamCheckIns = checkIns.filter(ci => teamGoals.some(g => g.id === ci.goalId));
    const maxPossible = teamGoals.length * QUARTERS.length;
    const ciRate = maxPossible > 0 ? Math.round(teamCheckIns.length / maxPossible * 100) : 0;
    const approvalRate = goals.filter(g => team.some(u => u.id === g.employeeId)).length > 0
      ? Math.round(goals.filter(g => team.some(u => u.id === g.employeeId) && g.status === 'LOCKED').length /
          goals.filter(g => team.some(u => u.id === g.employeeId)).length * 100) : 0;
    return { name: m.firstName, team: team.length, checkInRate: ciRate, approvalRate };
  });

  // Heatmap data
  const heatmapData: HeatmapCell[] = [];
  for (const dept of DEPTS) {
    for (const q of QUARTERS) {
      const deptGoals = goals.filter(g => g.thrustArea === dept && g.status === 'LOCKED');
      const cis = checkIns.filter(ci => deptGoals.some(g => g.id === ci.goalId) && ci.quarter === q);
      heatmapData.push({
        department: dept, quarter: q,
        completionRate: deptGoals.length > 0 ? Math.min(100, Math.round(cis.length / deptGoals.length * 100)) : 0,
        goalCount: deptGoals.length,
      });
    }
  }

  const TABS: { key: AnalyticsTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'qoq', label: 'QoQ Trends' },
    { key: 'heatmap', label: 'Heatmap' },
    { key: 'managers', label: 'Manager Effectiveness' },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Analytics &amp; Insights</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t.key} className={`btn ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <>
          <div className="stats-grid" style={{ marginBottom: 32 }}>
            <div className="stat-card"><div className="stat-value">{goals.length}</div><div className="stat-label">Total Goals</div></div>
            <div className="stat-card success">
              <div className="stat-value">{checkIns.length > 0 ? Math.round(checkIns.reduce((s,c)=>s+c.progressScore,0)/checkIns.length) : 0}%</div>
              <div className="stat-label">Avg Progress</div>
            </div>
            <div className="stat-card info">
              <div className="stat-value">{new Set(goals.map(g=>g.thrustArea)).size}</div>
              <div className="stat-label">Thrust Areas</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-value">{checkIns.filter(c=>c.progressScore>=90).length}</div>
              <div className="stat-label">Goals On Track (≥90%)</div>
            </div>
          </div>
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Goals by UoM Type</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={uomData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value"
                  label={({name,value})=>`${name}: ${value}`}>
                  {uomData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie><Tooltip {...TS}/></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3>Goal Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={statusData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value"
                  label={({name,value})=>`${name}: ${value}`}>
                  {statusData.map((d,i)=>(
                    <Cell key={i} fill={d.name==='LOCKED'?'#22c55e':d.name==='SUBMITTED'?'#f59e0b':d.name==='REJECTED'?'#ef4444':'#64748b'}/>
                  ))}
                </Pie><Tooltip {...TS}/></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
              <h3>Goals by Thrust Area</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={thrustData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                  <XAxis dataKey="name" tick={{fill:'#94a3b8',fontSize:12}}/>
                  <YAxis tick={{fill:'#94a3b8',fontSize:12}}/>
                  <Tooltip {...TS}/>
                  <Bar dataKey="total" fill="#6366f1" radius={[4,4,0,0]} name="Total"/>
                  <Bar dataKey="approved" fill="#22c55e" radius={[4,4,0,0]} name="Approved"/>
                  <Legend/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* ── QoQ Trends ── */}
      {tab === 'qoq' && (
        <div className="chart-card"><QoQTrendChart /></div>
      )}

      {/* ── Heatmap ── */}
      {tab === 'heatmap' && (
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Completion Heatmap — Department × Quarter</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
            Shows check-in completion rates across departments and quarters. Hover for details.
          </p>
          <HeatmapChart data={heatmapData} />
        </div>
      )}

      {/* ── Manager Effectiveness ── */}
      {tab === 'managers' && (
        <>
          <div className="chart-card" style={{ marginBottom: 24 }}>
            <h3>Check-in Completion Rate by Manager</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={managerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                <XAxis dataKey="name" tick={{fill:'#94a3b8',fontSize:12}}/>
                <YAxis tick={{fill:'#94a3b8',fontSize:12}} domain={[0,100]} unit="%"/>
                <Tooltip {...TS} formatter={(v:any)=>[`${v}%`]}/>
                <Bar dataKey="checkInRate" fill="#6366f1" radius={[4,4,0,0]} name="Check-in Rate %"/>
                <Bar dataKey="approvalRate" fill="#22c55e" radius={[4,4,0,0]} name="Approval Rate %"/>
                <Legend/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="table-container">
              <table>
                <thead><tr>
                  <th>Manager</th><th>Team Size</th>
                  <th>Approval Rate</th><th>Check-in Rate</th><th>Effectiveness</th>
                </tr></thead>
                <tbody>
                  {managerData.map(m => {
                    const score = Math.round((m.checkInRate + m.approvalRate) / 2);
                    return (
                      <tr key={m.name}>
                        <td style={{ fontWeight: 600 }}>{m.name}</td>
                        <td>{m.team}</td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div className="progress-bar" style={{ width:80 }}>
                              <div className={`progress-fill ${m.approvalRate>=80?'green':m.approvalRate>=50?'yellow':'red'}`}
                                style={{ width:`${m.approvalRate}%` }}/>
                            </div>
                            <span>{m.approvalRate}%</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div className="progress-bar" style={{ width:80 }}>
                              <div className={`progress-fill ${m.checkInRate>=80?'green':m.checkInRate>=50?'yellow':'red'}`}
                                style={{ width:`${m.checkInRate}%` }}/>
                            </div>
                            <span>{m.checkInRate}%</span>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            fontWeight:700, fontSize:16,
                            color: score>=80?'#22c55e':score>=50?'#f59e0b':'#ef4444',
                          }}>{score}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
