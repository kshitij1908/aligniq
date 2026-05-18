import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { getInitials, getFullName } from '../../utils/formatters';
import { Check, X, MessageSquare } from 'lucide-react';
import { Goal } from '../../types';

export default function GoalApproval() {
  const { currentUser } = useAuthStore();
  const store = useDataStore();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [comment, setComment] = useState('');

  if (!currentUser) return null;

  const allUsers = store.users;
  const allGoals = store.goals;
  const team = allUsers.filter(u => u.managerId === currentUser.id);
  const teamGoals = allGoals.filter(g => team.some(u => u.id === g.employeeId));

  // Group by employee
  const byEmployee = new Map<string, Goal[]>();
  teamGoals.filter(g => g.status === 'SUBMITTED').forEach(g => {
    if (!byEmployee.has(g.employeeId)) byEmployee.set(g.employeeId, []);
    byEmployee.get(g.employeeId)!.push(g);
  });

  const handleApproveAll = (employeeId: string) => {
    const empGoals = byEmployee.get(employeeId) || [];
    const totalW = empGoals.reduce((s, g) => s + g.weightage, 0);
    if (totalW !== 100) {
      alert(`Cannot approve: Total weightage is ${totalW}%, must be 100%.`);
      return;
    }
    store.approveGoals(employeeId, currentUser.id, comment || undefined);
    setComment('');
  };

  const handleReject = () => {
    if (!rejectId || !rejectReason.trim()) { alert('Please provide a rejection reason.'); return; }
    store.rejectGoal(rejectId, currentUser.id, rejectReason);
    setRejectId(null);
    setRejectReason('');
  };

  if (byEmployee.size === 0) {
    return (
      <div>
        <h2 style={{fontSize:20,fontWeight:700,marginBottom:24}}>Goal Approvals</h2>
        <div className="empty-state">
          <div className="icon">✅</div>
          <h3>All caught up!</h3>
          <p>No goals pending your approval.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>Goal Approvals</h2>
      <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:24}}>
        {byEmployee.size} employee(s) awaiting review
      </p>

      {Array.from(byEmployee.entries()).map(([empId, goals]) => {
        const emp = store.getUser(empId);
        if (!emp) return null;
        const totalW = goals.reduce((s, g) => s + g.weightage, 0);

        return (
          <div key={empId} className="card" style={{marginBottom:24}}>
            <div className="approval-card-header">
              <div className="approval-employee">
                <div className="avatar employee">{getInitials(emp.firstName, emp.lastName)}</div>
                <div>
                  <div className="name">{getFullName(emp.firstName, emp.lastName)}</div>
                  <div className="dept">{emp.department} · {goals.length} goals · Weightage: {totalW}%</div>
                </div>
              </div>
              <button className="btn btn-success" onClick={() => handleApproveAll(empId)}
                      disabled={totalW !== 100}>
                <Check size={16} /> Approve All
              </button>
            </div>

            {totalW !== 100 && (
              <div style={{padding:10,background:'rgba(245,158,11,0.1)',borderRadius:8,marginBottom:16,fontSize:13,color:'var(--color-warning)'}}>
                ⚠️ Total weightage is {totalW}%. Must equal 100% to approve.
              </div>
            )}

            <div className="table-container">
              <table>
                <thead><tr><th>Goal</th><th>Area</th><th>UoM</th><th>Target</th><th>Weight</th><th>Actions</th></tr></thead>
                <tbody>
                  {goals.map(g => (
                    <tr key={g.id}>
                      <td>
                        <div style={{fontWeight:500,marginBottom:2}}>{g.title}</div>
                        <div style={{fontSize:12,color:'var(--text-muted)'}}>{g.description.slice(0,80)}...</div>
                      </td>
                      <td><span className="badge badge-info">{g.thrustArea}</span></td>
                      <td>{g.uomType}</td>
                      <td>{g.targetValue}</td>
                      <td>{g.weightage}%</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => setRejectId(g.id)}>
                          <X size={14} /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="form-group" style={{marginTop:16}}>
              <label className="form-label">Approval Comment (optional)</label>
              <textarea className="form-textarea" rows={2} placeholder="Add a comment..."
                        value={comment} onChange={e => setComment(e.target.value)} style={{minHeight:60}} />
            </div>
          </div>
        );
      })}

      {/* Reject Modal */}
      {rejectId && (
        <div className="modal-overlay" onClick={() => setRejectId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Reject Goal</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setRejectId(null)}><X size={18}/></button>
            </div>
            <div className="form-group">
              <label className="form-label">Rejection Reason *</label>
              <textarea className="form-textarea" placeholder="Explain why this goal needs revision..."
                        value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRejectId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReject}>Reject Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
