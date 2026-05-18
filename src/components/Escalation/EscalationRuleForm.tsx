import React, { useState } from 'react';
import { EscalationRuleFormData, EscalationTrigger, ESCALATION_TRIGGER_LABELS } from '../../types';

interface Props {
  initial?: Partial<EscalationRuleFormData>;
  onSave: (data: EscalationRuleFormData) => void;
  onCancel: () => void;
}

const TRIGGERS: EscalationTrigger[] = ['goal-not-submitted', 'goal-not-approved', 'checkin-not-completed'];

export default function EscalationRuleForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<EscalationRuleFormData>({
    name: initial?.name || '',
    triggerType: initial?.triggerType || 'goal-not-submitted',
    thresholdDays: initial?.thresholdDays ?? 7,
    escalationDays: initial?.escalationDays ?? 3,
    targetRoles: initial?.targetRoles || ['employee', 'manager'],
    isActive: initial?.isActive ?? true,
  });

  const toggleRole = (role: string) => {
    setForm(f => ({
      ...f,
      targetRoles: f.targetRoles.includes(role)
        ? f.targetRoles.filter(r => r !== role)
        : [...f.targetRoles, role],
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return alert('Rule name is required');
    if (form.thresholdDays < 1) return alert('Threshold must be at least 1 day');
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{initial?.name ? 'Edit' : 'New'} Escalation Rule</div>
          <button className="btn btn-ghost btn-icon" onClick={onCancel}>✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">Rule Name</label>
          <input className="form-input" value={form.name} placeholder="e.g. Goals Not Submitted Alert"
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>

        <div className="form-group">
          <label className="form-label">Trigger Condition</label>
          <select className="form-select" value={form.triggerType}
            onChange={e => setForm(f => ({ ...f, triggerType: e.target.value as EscalationTrigger }))}>
            {TRIGGERS.map(t => (
              <option key={t} value={t}>{ESCALATION_TRIGGER_LABELS[t]}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Initial Alert After (days)</label>
            <input className="form-input" type="number" min={1} max={90} value={form.thresholdDays}
              onChange={e => setForm(f => ({ ...f, thresholdDays: Number(e.target.value) }))} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Notifies employee & manager</span>
          </div>
          <div className="form-group">
            <label className="form-label">Escalate to HR After (more days)</label>
            <input className="form-input" type="number" min={1} max={90} value={form.escalationDays}
              onChange={e => setForm(f => ({ ...f, escalationDays: Number(e.target.value) }))} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>After initial alert</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Escalation Chain</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['employee', 'manager', 'hr'].map(role => (
              <label key={role} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form.targetRoles.includes(role)}
                  onChange={() => toggleRole(role)} style={{ accentColor: '#6366f1' }} />
                <span style={{ textTransform: 'capitalize' }}>{role === 'hr' ? 'HR / Skip-Level' : role}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              style={{ accentColor: '#6366f1', width: 16, height: 16 }} />
            <span style={{ fontSize: 14 }}>Rule is active</span>
          </label>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {initial?.name ? 'Save Changes' : 'Create Rule'}
          </button>
        </div>
      </div>
    </div>
  );
}
