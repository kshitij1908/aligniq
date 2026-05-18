import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { calculateProgressScore } from '../../utils/calculations';
import { CheckInStatus, Quarter } from '../../types';
import { Send, Save } from 'lucide-react';

export default function CheckInForm() {
  const { currentUser } = useAuthStore();
  const store = useDataStore();
  const [quarter, setQuarter] = useState<Quarter>('Q1');
  const [achievements, setAchievements] = useState<Record<string, { value: number; status: CheckInStatus }>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!currentUser) return null;

  const allGoals = store.goals;
  const allCheckIns = store.checkIns;
  const goals = allGoals.filter(g => g.employeeId === currentUser.id && g.status === 'LOCKED');
  const existingCheckIns = allCheckIns.filter(c => c.quarter === quarter && goals.some(g => g.id === c.goalId));
  const goalIdsWithCheckIn = new Set(existingCheckIns.map(c => c.goalId));
  const goalsNeedingCheckIn = goals.filter(g => !goalIdsWithCheckIn.has(g.id));

  const handleAchievementChange = (goalId: string, value: number) => {
    setAchievements(prev => ({
      ...prev,
      [goalId]: { ...prev[goalId], value, status: prev[goalId]?.status || 'ON_TRACK' }
    }));
  };

  const handleStatusChange = (goalId: string, status: CheckInStatus) => {
    setAchievements(prev => ({
      ...prev,
      [goalId]: { ...prev[goalId], value: prev[goalId]?.value || 0, status }
    }));
  };

  const handleSubmitAll = () => {
    const missing = goalsNeedingCheckIn.filter(g => !achievements[g.id]?.value && achievements[g.id]?.value !== 0);
    if (missing.length > 0 && goalsNeedingCheckIn.length > 0) {
      const proceed = confirm(`${missing.length} goal(s) have no achievement data. Submit anyway?`);
      if (!proceed) return;
    }
    goalsNeedingCheckIn.forEach(goal => {
      const ach = achievements[goal.id];
      if (ach) {
        store.createCheckIn({
          goalId: goal.id,
          quarter,
          achievement: ach.value,
          status: ach.status,
        }, currentUser.id);
      }
    });
    setSubmitted(true);
  };

  if (goals.length === 0) {
    return (
      <div>
        <h2 style={{fontSize:20,fontWeight:700,marginBottom:24}}>Quarterly Check-in</h2>
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>No locked goals</h3>
          <p>Your goals must be approved and locked before you can submit check-ins.</p>
        </div>
      </div>
    );
  }

  if (submitted || goalsNeedingCheckIn.length === 0) {
    return (
      <div>
        <h2 style={{fontSize:20,fontWeight:700,marginBottom:24}}>Quarterly Check-in — {quarter}</h2>
        <div className="empty-state">
          <div className="icon">✅</div>
          <h3>Check-in Complete!</h3>
          <p>You've submitted your {quarter} check-in for all locked goals.</p>
        </div>
        {existingCheckIns.length > 0 && (
          <div className="table-container" style={{marginTop:24}}>
            <table>
              <thead><tr><th>Goal</th><th>Achievement</th><th>Score</th><th>Status</th></tr></thead>
              <tbody>
                {existingCheckIns.map(ci => {
                  const goal = store.getGoal(ci.goalId);
                  return (
                    <tr key={ci.id}>
                      <td style={{fontWeight:500}}>{goal?.title}</td>
                      <td>{ci.achievement}</td>
                      <td><span style={{fontWeight:700,color:ci.progressScore>=90?'var(--color-success)':ci.progressScore>=50?'var(--color-warning)':'var(--color-danger)'}}>{ci.progressScore}%</span></td>
                      <td><span className={`badge ${ci.status==='COMPLETED'?'badge-success':ci.status==='ON_TRACK'?'badge-warning':'badge-draft'}`}>{ci.status.replace('_',' ')}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700}}>Quarterly Check-in</h2>
          <p style={{color:'var(--text-secondary)',fontSize:14}}>Log your progress for {quarter}</p>
        </div>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <select className="form-select" value={quarter} onChange={e => setQuarter(e.target.value as Quarter)}
                  style={{width:100}}>
            <option value="Q1">Q1</option><option value="Q2">Q2</option>
            <option value="Q3">Q3</option><option value="Q4">Q4</option>
          </select>
          <button className="btn btn-primary" onClick={handleSubmitAll}>
            <Send size={16} /> Submit Check-in
          </button>
        </div>
      </div>

      <div style={{display:'grid',gap:16}}>
        {goalsNeedingCheckIn.map(goal => {
          const ach = achievements[goal.id];
          const score = ach ? calculateProgressScore(goal.uomType, goal.targetValue, ach.value) : null;
          return (
            <div key={goal.id} className="checkin-card">
              <div className="checkin-goal-title">{goal.title}</div>
              <div className="checkin-meta">
                <span>🏷️ {goal.thrustArea}</span>
                <span>📊 {goal.uomType}</span>
                <span>🎯 Target: {goal.targetValue}</span>
                <span>⚖️ {goal.weightage}%</span>
              </div>
              <div className="checkin-input-row">
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Actual Achievement</label>
                  <input className="form-input" type="number" min="0" step="any"
                         placeholder={`Target: ${goal.targetValue}`}
                         value={ach?.value ?? ''}
                         onChange={e => handleAchievementChange(goal.id, parseFloat(e.target.value) || 0)} />
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Status</label>
                  <select className="form-select" value={ach?.status || 'ON_TRACK'}
                          onChange={e => handleStatusChange(goal.id, e.target.value as CheckInStatus)}>
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="ON_TRACK">On Track</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              {score !== null && (
                <div style={{marginTop:12}}>
                  <div style={{fontSize:13,color:'var(--text-secondary)',marginBottom:4}}>Progress Score</div>
                  <div className="score-display" style={{color:score>=90?'var(--color-success)':score>=50?'var(--color-warning)':'var(--color-danger)'}}>
                    {score}%
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
