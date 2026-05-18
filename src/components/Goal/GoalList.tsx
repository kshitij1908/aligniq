import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { Plus, Send, Trash2, Edit2 } from 'lucide-react';

export default function GoalList() {
  const { currentUser } = useAuthStore();
  const store = useDataStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');

  if (!currentUser) return null;

  const allGoals = store.goals;
  const goals = allGoals.filter(g => g.employeeId === currentUser.id);
  const filtered = filter === 'ALL' ? goals : goals.filter(g => g.status === filter);
  const totalW = goals.reduce((s, g) => s + g.weightage, 0);
  const canSubmitAll = totalW === 100 && goals.some(g => g.status === 'DRAFT' || g.status === 'REJECTED');
  const draftsAndRejected = goals.filter(g => g.status === 'DRAFT' || g.status === 'REJECTED');

  const handleSubmitAll = () => {
    if (totalW !== 100) { alert(`Total weightage must be 100%. Currently: ${totalW}%`); return; }
    store.submitAllGoals(currentUser.id, currentUser.id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this goal?')) store.deleteGoal(id);
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700}}>My Goals</h2>
          <p style={{color:'var(--text-secondary)',fontSize:14}}>Weightage: {totalW}% / 100% · {goals.length}/8 goals</p>
        </div>
        <div style={{display:'flex',gap:12}}>
          {canSubmitAll && (
            <button className="btn btn-success" onClick={handleSubmitAll}>
              <Send size={16} /> Submit All ({draftsAndRejected.length})
            </button>
          )}
          {goals.length < 8 && (
            <button className="btn btn-primary" onClick={() => navigate('/goals/new')}>
              <Plus size={16} /> New Goal
            </button>
          )}
        </div>
      </div>

      <div className={`weightage-bar ${totalW === 100 ? 'perfect' : totalW > 100 ? 'invalid' : ''}`}>
        <span style={{fontSize:13,color:'var(--text-secondary)',minWidth:100}}>Weightage</span>
        <div className="progress-bar" style={{flex:1}}>
          <div className={`progress-fill ${totalW === 100 ? 'green' : totalW > 100 ? 'red' : 'blue'}`}
               style={{width:`${Math.min(totalW,100)}%`}} />
        </div>
        <span className="total">{totalW}%</span>
        {totalW === 100 && <span style={{color:'var(--color-success)',fontSize:18}}>✓</span>}
      </div>

      <div className="tabs">
        {['ALL','DRAFT','SUBMITTED','LOCKED','REJECTED'].map(s => (
          <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            {s !== 'ALL' && <span style={{marginLeft:6,fontSize:11,opacity:0.7}}>({goals.filter(g => g.status === s).length})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎯</div>
          <h3>No goals found</h3>
          <p>{filter !== 'ALL' ? 'No goals with this status.' : 'Create your first goal to get started!'}</p>
          {filter === 'ALL' && <button className="btn btn-primary" onClick={() => navigate('/goals/new')}><Plus size={16}/> Create Goal</button>}
        </div>
      ) : (
        <div style={{display:'grid',gap:16}}>
          {filtered.map(goal => (
            <div key={goal.id} className="goal-card">
              <div className="goal-card-top">
                <div className="goal-card-title">{goal.title}</div>
                <span className={`badge badge-${goal.status.toLowerCase()}`}>{goal.status}</span>
              </div>
              <div className="goal-card-desc">{goal.description}</div>
              <div className="goal-card-meta">
                <span>🏷️ {goal.thrustArea}</span>
                <span>📊 {goal.uomType}</span>
                <span>🎯 Target: {goal.targetValue}</span>
                <span>⚖️ Weight: {goal.weightage}%</span>
              </div>
              {(goal.status === 'DRAFT' || goal.status === 'REJECTED') && (
                <div className="goal-card-footer">
                  <div className="goal-card-actions">
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(goal.id)}><Trash2 size={14}/> Delete</button>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => {
                    store.submitGoal(goal.id, currentUser.id);
                  }}><Send size={14}/> Submit</button>
                </div>
              )}
              {goal.rejectionReason && (
                <div style={{marginTop:12,padding:10,background:'rgba(239,68,68,0.08)',borderRadius:8,fontSize:13,color:'var(--color-danger)'}}>
                  <strong>Rejection Reason:</strong> {goal.rejectionReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
