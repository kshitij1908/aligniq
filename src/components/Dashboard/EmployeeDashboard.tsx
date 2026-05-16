import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { Target, TrendingUp, Clock, CheckCircle, Plus } from 'lucide-react';

export default function EmployeeDashboard() {
  const { currentUser } = useAuthStore();
  const store = useDataStore();
  const navigate = useNavigate();
  if (!currentUser) return null;

  const allGoals = store.goals;
  const allCheckIns = store.checkIns;
  const goals = allGoals.filter(g => g.employeeId === currentUser.id);
  const checkIns = allCheckIns.filter(c => goals.some(g => g.id === c.goalId));
  const totalW = goals.reduce((s, g) => s + g.weightage, 0);
  const locked = goals.filter(g => g.status === 'LOCKED');
  const drafts = goals.filter(g => g.status === 'DRAFT');
  const submitted = goals.filter(g => g.status === 'SUBMITTED');
  const rejected = goals.filter(g => g.status === 'REJECTED');

  const avgScore = checkIns.length > 0
    ? Math.round(checkIns.reduce((s, c) => s + c.progressScore, 0) / checkIns.length)
    : 0;

  const activeCycle = store.getActiveCycle();

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h2 style={{fontSize:22,fontWeight:700}}>Welcome, {currentUser.firstName}! 👋</h2>
          <p style={{color:'var(--text-secondary)',fontSize:14,marginTop:4}}>
            {activeCycle ? `Active: ${activeCycle.phase} Check-in Window` : 'Goal Setting Phase'}
          </p>
        </div>
        {goals.length < 8 && (
          <button className="btn btn-primary" onClick={() => navigate('/goals/new')}>
            <Plus size={18} /> Create Goal
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card" style={{border:'none',padding:0}}>
            <div className="stat-value">{goals.length}</div>
            <div className="stat-label">Total Goals</div>
          </div>
          <Target size={40} className="stat-icon" style={{position:'absolute',top:16,right:16}} />
        </div>
        <div className="stat-card success">
          <div className="stat-value">{locked.length}</div>
          <div className="stat-label">Locked / Approved</div>
          <CheckCircle size={40} className="stat-icon" style={{position:'absolute',top:16,right:16}} />
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{submitted.length + drafts.length}</div>
          <div className="stat-label">Pending</div>
          <Clock size={40} className="stat-icon" style={{position:'absolute',top:16,right:16}} />
        </div>
        <div className="stat-card info">
          <div className="stat-value">{avgScore}%</div>
          <div className="stat-label">Avg. Progress</div>
          <TrendingUp size={40} className="stat-icon" style={{position:'absolute',top:16,right:16}} />
        </div>
      </div>

      {/* Weightage Bar */}
      <div className={`weightage-bar ${totalW === 100 ? 'perfect' : totalW > 100 ? 'invalid' : ''}`}>
        <span style={{fontSize:13,color:'var(--text-secondary)',minWidth:120}}>Total Weightage</span>
        <div className="progress-bar" style={{flex:1}}>
          <div className={`progress-fill ${totalW === 100 ? 'green' : totalW > 100 ? 'red' : 'blue'}`}
               style={{width:`${Math.min(totalW, 100)}%`}} />
        </div>
        <span className="total">{totalW}%</span>
        {totalW === 100 && <span style={{color:'var(--color-success)',fontSize:18}}>✓</span>}
      </div>

      {/* Goals List */}
      <h3 style={{fontSize:16,fontWeight:600,marginBottom:16}}>Your Goals</h3>
      {goals.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎯</div>
          <h3>No goals yet</h3>
          <p>Create your first goal to get started!</p>
          <button className="btn btn-primary" onClick={() => navigate('/goals/new')}>
            <Plus size={18} /> Create Goal
          </button>
        </div>
      ) : (
        <div style={{display:'grid',gap:16}}>
          {goals.map(goal => {
            const ci = checkIns.find(c => c.goalId === goal.id);
            const statusClass = goal.status.toLowerCase();
            return (
              <div key={goal.id} className="goal-card" onClick={() => navigate(`/goals`)}>
                <div className="goal-card-top">
                  <div className="goal-card-title">{goal.title}</div>
                  <span className={`badge badge-${statusClass}`}>{goal.status}</span>
                </div>
                <div className="goal-card-desc">{goal.description}</div>
                <div className="goal-card-meta">
                  <span>🏷️ {goal.thrustArea}</span>
                  <span>📊 {goal.uomType}</span>
                  <span>🎯 Target: {goal.targetValue}</span>
                  <span>⚖️ Weight: {goal.weightage}%</span>
                </div>
                {ci && (
                  <div className="goal-card-footer">
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:13,color:'var(--text-secondary)'}}>Progress:</span>
                      <div className="progress-bar" style={{width:120}}>
                        <div className={`progress-fill ${ci.progressScore >= 90 ? 'green' : ci.progressScore >= 50 ? 'yellow' : 'red'}`}
                             style={{width:`${Math.min(ci.progressScore, 100)}%`}} />
                      </div>
                      <span style={{fontSize:13,fontWeight:600}}>{ci.progressScore}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {rejected.length > 0 && (
        <div style={{marginTop:24,padding:16,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:12}}>
          <h4 style={{color:'var(--color-danger)',marginBottom:8}}>⚠️ Goals Needing Revision</h4>
          {rejected.map(g => (
            <div key={g.id} style={{fontSize:13,color:'var(--text-secondary)',marginBottom:4}}>
              <strong>{g.title}</strong> — {g.rejectionReason || 'No reason provided'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
