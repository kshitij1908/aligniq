import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { getInitials, getFullName } from '../../utils/formatters';
import { Users, ClipboardCheck, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ManagerDashboard() {
  const { currentUser } = useAuthStore();
  const store = useDataStore();
  const navigate = useNavigate();
  if (!currentUser) return null;

  const allUsers = store.users;
  const allGoals = store.goals;
  const team = allUsers.filter(u => u.managerId === currentUser.id);
  const teamGoals = allGoals.filter(g => team.some(u => u.id === g.employeeId));
  const pending = teamGoals.filter(g => g.status === 'SUBMITTED');
  const locked = teamGoals.filter(g => g.status === 'LOCKED');
  const pendingByEmployee = new Map<string, number>();
  pending.forEach(g => pendingByEmployee.set(g.employeeId, (pendingByEmployee.get(g.employeeId) || 0) + 1));

  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:4}}>Team Dashboard</h2>
      <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:24}}>
        Manage goals and check-ins for your {team.length} direct reports
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{team.length}</div>
          <div className="stat-label">Team Members</div>
          <Users size={40} className="stat-icon" style={{position:'absolute',top:16,right:16}} />
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{pendingByEmployee.size}</div>
          <div className="stat-label">Pending Approvals</div>
          <ClipboardCheck size={40} className="stat-icon" style={{position:'absolute',top:16,right:16}} />
        </div>
        <div className="stat-card success">
          <div className="stat-value">{locked.length}</div>
          <div className="stat-label">Goals Approved</div>
          <CheckCircle size={40} className="stat-icon" style={{position:'absolute',top:16,right:16}} />
        </div>
        <div className="stat-card danger">
          <div className="stat-value">{teamGoals.filter(g => g.status === 'REJECTED').length}</div>
          <div className="stat-label">Rejected</div>
          <AlertTriangle size={40} className="stat-icon" style={{position:'absolute',top:16,right:16}} />
        </div>
      </div>

      {pendingByEmployee.size > 0 && (
        <div style={{marginBottom:32}}>
          <h3 style={{fontSize:16,fontWeight:600,marginBottom:16}}>⏳ Pending Approvals</h3>
          <div style={{display:'grid',gap:12}}>
            {Array.from(pendingByEmployee.entries()).map(([empId, count]) => {
              const emp = store.getUser(empId);
              if (!emp) return null;
              return (
                <div key={empId} className="approval-card" style={{cursor:'pointer'}} onClick={() => navigate('/approval')}>
                  <div className="approval-employee">
                    <div className="avatar employee">{getInitials(emp.firstName, emp.lastName)}</div>
                    <div>
                      <div className="name">{getFullName(emp.firstName, emp.lastName)}</div>
                      <div className="dept">{emp.department} · {count} goals pending</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <h3 style={{fontSize:16,fontWeight:600,marginBottom:16}}>Team Members</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Member</th><th>Department</th><th>Goals</th><th>Approved</th><th>Status</th></tr>
          </thead>
          <tbody>
            {team.map(member => {
              const mg = teamGoals.filter(g => g.employeeId === member.id);
              const approved = mg.filter(g => g.status === 'LOCKED').length;
              const total = mg.length;
              const hasPending = mg.some(g => g.status === 'SUBMITTED');
              return (
                <tr key={member.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div className="avatar avatar-sm employee">{getInitials(member.firstName, member.lastName)}</div>
                      <div>
                        <div style={{fontWeight:500}}>{getFullName(member.firstName, member.lastName)}</div>
                        <div style={{fontSize:12,color:'var(--text-muted)'}}>{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{member.department}</td>
                  <td>{total}</td>
                  <td>{approved}</td>
                  <td>
                    {hasPending ? <span className="badge badge-warning">Needs Review</span>
                     : total === 0 ? <span className="badge badge-draft">No Goals</span>
                     : approved === total ? <span className="badge badge-success">Complete</span>
                     : <span className="badge badge-info">In Progress</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
