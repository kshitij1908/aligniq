import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { getInitials, getFullName } from '../../utils/formatters';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { Quarter } from '../../types';

export default function ManagerCheckIn() {
  const { currentUser } = useAuthStore();
  const store = useDataStore();
  const [quarter, setQuarter] = useState<Quarter>('Q1');
  const [commentFor, setCommentFor] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  if (!currentUser) return null;

  const allUsers = store.users;
  const allGoals = store.goals;
  const allCheckIns = store.checkIns;
  const team = allUsers.filter(u => u.managerId === currentUser.id);

  const handleAddComment = () => {
    if (!commentFor || !commentText.trim()) return;
    store.addCheckInComment(commentFor, currentUser.id, commentText);
    setCommentFor(null);
    setCommentText('');
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700}}>Team Check-in Review</h2>
          <p style={{color:'var(--text-secondary)',fontSize:14}}>Review your team's quarterly progress</p>
        </div>
        <select className="form-select" value={quarter} onChange={e => setQuarter(e.target.value as Quarter)} style={{width:100}}>
          <option value="Q1">Q1</option><option value="Q2">Q2</option>
          <option value="Q3">Q3</option><option value="Q4">Q4</option>
        </select>
      </div>

      {team.map(member => {
        const memberGoals = allGoals.filter(g => g.employeeId === member.id && g.status === 'LOCKED');
        const checkIns = allCheckIns.filter(c => c.quarter === quarter && memberGoals.some(g => g.id === c.goalId));

        return (
          <div key={member.id} className="card" style={{marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
              <div className="avatar employee">{getInitials(member.firstName, member.lastName)}</div>
              <div>
                <div style={{fontWeight:600}}>{getFullName(member.firstName, member.lastName)}</div>
                <div style={{fontSize:13,color:'var(--text-secondary)'}}>{member.department} · {checkIns.length}/{memberGoals.length} check-ins</div>
              </div>
            </div>

            {checkIns.length === 0 ? (
              <div style={{padding:16,background:'var(--bg-glass)',borderRadius:8,textAlign:'center',color:'var(--text-muted)',fontSize:13}}>
                No check-ins submitted for {quarter}
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Goal</th><th>Target</th><th>Achievement</th><th>Score</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {checkIns.map(ci => {
                      const goal = store.getGoal(ci.goalId);
                      const comments = store.getCheckInComments(ci.id);
                      return (
                        <tr key={ci.id}>
                          <td style={{fontWeight:500}}>{goal?.title}</td>
                          <td>{goal?.targetValue}</td>
                          <td>{ci.achievement}</td>
                          <td>
                            <span style={{fontWeight:700,color:ci.progressScore>=90?'var(--color-success)':ci.progressScore>=50?'var(--color-warning)':'var(--color-danger)'}}>
                              {ci.progressScore}%
                            </span>
                          </td>
                          <td><span className={`badge ${ci.status==='COMPLETED'?'badge-success':ci.status==='ON_TRACK'?'badge-warning':'badge-draft'}`}>{ci.status.replace('_',' ')}</span></td>
                          <td>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setCommentFor(ci.id); setCommentText(''); }}>
                              <MessageSquare size={14}/> {comments.length > 0 ? `(${comments.length})` : 'Comment'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {commentFor && (
        <div className="modal-overlay" onClick={() => setCommentFor(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add Review Comment</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setCommentFor(null)}>✕</button>
            </div>
            <div className="form-group">
              <textarea className="form-textarea" rows={4} value={commentText} onChange={e => setCommentText(e.target.value)}
                        placeholder="What went well? What could improve? Blockers? Action items?" />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCommentFor(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddComment}>Save Comment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
