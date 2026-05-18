import React, { useState } from 'react';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { formatDate } from '../utils/formatters';
import { CyclePhase } from '../types';
import { Plus, Edit2, RotateCcw } from 'lucide-react';

export default function CycleManagement() {
  const store = useDataStore();
  const { currentUser } = useAuthStore();
  const cycles = store.cycles;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ phase: 'PHASE1' as CyclePhase, startDate: '', endDate: '', cycleYear: 2024 });

  if (!currentUser || currentUser.role !== 'ADMIN') return <div>Access denied</div>;

  const handleCreate = () => {
    if (!form.startDate || !form.endDate) { alert('Please set dates'); return; }
    store.createCycle({
      cycleYear: form.cycleYear,
      phase: form.phase,
      startDate: form.startDate,
      endDate: form.endDate,
      isActive: false,
      createdBy: currentUser.id,
    });
    setShowForm(false);
    setForm({ phase: 'PHASE1', startDate: '', endDate: '', cycleYear: 2024 });
  };

  const toggleActive = (id: string, current: boolean) => {
    store.updateCycle(id, { isActive: !current });
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700}}>Cycle Management</h2>
          <p style={{color:'var(--text-secondary)',fontSize:14}}>Configure goal setting and check-in windows</p>
        </div>
        <div style={{display:'flex',gap:12}}>
          <button className="btn btn-secondary" onClick={() => { store.resetData(); }}><RotateCcw size={16}/> Reset Data</button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16}/> New Cycle</button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead><tr><th>Year</th><th>Phase</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {cycles.map(c => (
              <tr key={c.id}>
                <td style={{fontWeight:500}}>{c.cycleYear}</td>
                <td><span className="badge badge-info">{c.phase}</span></td>
                <td>{formatDate(c.startDate)}</td>
                <td>{formatDate(c.endDate)}</td>
                <td>
                  {c.isActive
                    ? <span className="badge badge-success">Active</span>
                    : <span className="badge badge-draft">Inactive</span>}
                </td>
                <td>
                  <button className={`btn btn-sm ${c.isActive ? 'btn-secondary' : 'btn-success'}`}
                          onClick={() => toggleActive(c.id, c.isActive)}>
                    {c.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create Cycle</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Year</label>
                <input className="form-input" type="number" value={form.cycleYear}
                       onChange={e => setForm(f => ({...f, cycleYear: parseInt(e.target.value)}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phase</label>
                <select className="form-select" value={form.phase} onChange={e => setForm(f => ({...f, phase: e.target.value as CyclePhase}))}>
                  <option value="PHASE1">Phase 1 (Goal Setting)</option>
                  <option value="Q1">Q1 Check-in</option>
                  <option value="Q2">Q2 Check-in</option>
                  <option value="Q3">Q3 Check-in</option>
                  <option value="Q4">Q4 / Annual</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-input" type="date" value={form.startDate}
                       onChange={e => setForm(f => ({...f, startDate: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="form-input" type="date" value={form.endDate}
                       onChange={e => setForm(f => ({...f, endDate: e.target.value}))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
