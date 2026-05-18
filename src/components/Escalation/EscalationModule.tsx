import React, { useState } from 'react';
import { useDataStore } from '../../stores/dataStore';
import { useAuthStore } from '../../stores/authStore';
import { EscalationRule, EscalationRuleFormData, ESCALATION_TRIGGER_LABELS } from '../../types';
import EscalationRuleForm from './EscalationRuleForm';
import { Plus, Play, CheckCircle, AlertTriangle, Clock, Edit2, Trash2 } from 'lucide-react';

export default function EscalationModule() {
  const store = useDataStore();
  const { currentUser } = useAuthStore();
  const [tab, setTab] = useState<'rules' | 'log'>('rules');
  const [showForm, setShowForm] = useState(false);
  const [editRule, setEditRule] = useState<EscalationRule | null>(null);
  const [running, setRunning] = useState(false);

  if (!currentUser || currentUser.role !== 'ADMIN') return <div>Access denied</div>;

  const rules = store.escalationRules;
  const events = store.escalationEvents;

  const handleSave = (data: EscalationRuleFormData) => {
    if (editRule) {
      store.updateEscalationRule(editRule.id, data);
    } else {
      store.createEscalationRule(data, currentUser.id);
    }
    setShowForm(false);
    setEditRule(null);
  };

  const handleRunEngine = async () => {
    setRunning(true);
    await new Promise(r => setTimeout(r, 1200));
    store.runEscalationEngine(currentUser.id);
    setRunning(false);
    setTab('log');
  };

  const statusColor: Record<string, string> = {
    pending: '#f59e0b', escalated: '#ef4444', resolved: '#22c55e',
  };
  const statusIcon = { pending: <Clock size={14}/>, escalated: <AlertTriangle size={14}/>, resolved: <CheckCircle size={14}/> };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Escalation Module</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Rule-based automated escalations</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handleRunEngine} disabled={running}>
            <Play size={15} /> {running ? 'Running…' : 'Run Engine'}
          </button>
          {tab === 'rules' && (
            <button className="btn btn-primary" onClick={() => { setEditRule(null); setShowForm(true); }}>
              <Plus size={15} /> New Rule
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['rules', 'log'] as const).map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
            {t === 'rules' ? `Rules (${rules.length})` : `Escalation Log (${events.length})`}
          </button>
        ))}
      </div>

      {tab === 'rules' && (
        <div className="card">
          {rules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              No escalation rules yet. Create one to get started.
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr>
                  <th>Rule Name</th><th>Trigger Condition</th>
                  <th>Alert After</th><th>Escalate After</th>
                  <th>Status</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {rules.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td style={{ fontSize: 13, maxWidth: 260 }}>{ESCALATION_TRIGGER_LABELS[r.triggerType]}</td>
                      <td>{r.thresholdDays}d</td>
                      <td>+{r.escalationDays}d</td>
                      <td>
                        <span className={`badge ${r.isActive ? 'badge-success' : 'badge-draft'}`}>
                          {r.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-sm btn-secondary"
                            onClick={() => { setEditRule(r); setShowForm(true); }}>
                            <Edit2 size={13} />
                          </button>
                          <button className="btn btn-sm btn-secondary"
                            onClick={() => store.deleteEscalationRule(r.id)}
                            style={{ color: '#ef4444' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'log' && (
        <div className="card">
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              No escalation events yet. Run the engine to evaluate rules.
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr>
                  <th>Employee</th><th>Rule Triggered</th>
                  <th>Days Past Due</th><th>Status</th>
                  <th>Date</th><th>Action</th>
                </tr></thead>
                <tbody>
                  {[...events].reverse().map(ev => {
                    const user = store.getUser(ev.userId);
                    return (
                      <tr key={ev.id}>
                        <td style={{ fontWeight: 500 }}>
                          {user ? `${user.firstName} ${user.lastName}` : ev.userId}
                        </td>
                        <td style={{ fontSize: 13 }}>{ev.ruleName}</td>
                        <td>
                          <span style={{ color: ev.daysPastDue > 14 ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>
                            {ev.daysPastDue}d
                          </span>
                        </td>
                        <td>
                          <span style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            color: statusColor[ev.status], fontWeight: 600, fontSize: 13,
                          }}>
                            {statusIcon[ev.status]} {ev.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {new Date(ev.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          {ev.status !== 'resolved' && (
                            <button className="btn btn-sm btn-success"
                              onClick={() => store.resolveEscalation(ev.id, currentUser.id, 'Resolved by admin')}>
                              Resolve
                            </button>
                          )}
                          {ev.status === 'resolved' && (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {ev.resolutionNote}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <EscalationRuleForm
          initial={editRule ? {
            name: editRule.name, triggerType: editRule.triggerType,
            thresholdDays: editRule.thresholdDays, escalationDays: editRule.escalationDays,
            targetRoles: editRule.targetRoles, isActive: editRule.isActive,
          } : undefined}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditRule(null); }}
        />
      )}
    </div>
  );
}
