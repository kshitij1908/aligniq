import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { GoalFormData, ThrustArea, UoMType, UOM_LABELS, THRUST_AREAS } from '../../types';
import { validateGoalForm, validateGoalCount } from '../../utils/validation';
import { ArrowLeft, Save, Send } from 'lucide-react';

const emptyForm: GoalFormData = { title: '', description: '', thrustArea: '' as ThrustArea, uomType: '' as UoMType, targetValue: 0, weightage: 10 };

export default function GoalForm() {
  const { currentUser } = useAuthStore();
  const store = useDataStore();
  const navigate = useNavigate();
  const [form, setForm] = useState<GoalFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!currentUser) return null;

  const allGoals = store.goals;
  const existingGoals = allGoals.filter(g => g.employeeId === currentUser.id);
  const currentTotal = existingGoals.reduce((s, g) => s + g.weightage, 0);
  const newTotal = currentTotal + form.weightage;
  const countCheck = validateGoalCount(existingGoals.length);

  const handleChange = (field: keyof GoalFormData, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSave = () => {
    const validationErrors = validateGoalForm(form);
    if (validationErrors.length > 0) {
      const errMap: Record<string, string> = {};
      validationErrors.forEach(e => errMap[e.field] = e.message);
      setErrors(errMap);
      return;
    }
    if (!countCheck.isValid) { alert(countCheck.message); return; }
    store.createGoal(currentUser.id, form);
    navigate('/goals');
  };

  const handleSubmit = () => {
    const validationErrors = validateGoalForm(form);
    if (validationErrors.length > 0) {
      const errMap: Record<string, string> = {};
      validationErrors.forEach(e => errMap[e.field] = e.message);
      setErrors(errMap);
      return;
    }
    if (!countCheck.isValid) { alert(countCheck.message); return; }
    const goal = store.createGoal(currentUser.id, form);
    store.submitGoal(goal.id, currentUser.id);
    navigate('/goals');
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <button className="btn btn-ghost" onClick={() => navigate('/goals')} style={{ marginBottom: 20 }}>
        <ArrowLeft size={18} /> Back to Goals
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Create New Goal</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
        Goals: {existingGoals.length}/8 · Weightage used: {currentTotal}%
      </p>

      {/* Weightage indicator */}
      <div className={`weightage-bar ${newTotal === 100 ? 'perfect' : newTotal > 100 ? 'invalid' : ''}`}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 140 }}>Projected Weightage</span>
        <div className="progress-bar" style={{ flex: 1 }}>
          <div className={`progress-fill ${newTotal === 100 ? 'green' : newTotal > 100 ? 'red' : 'blue'}`}
               style={{ width: `${Math.min(newTotal, 100)}%` }} />
        </div>
        <span className="total">{newTotal}%</span>
      </div>

      <div className="card">
        <div className="form-group">
          <label className="form-label">Goal Title *</label>
          <input className="form-input" maxLength={100} placeholder="e.g., Increase Q1 Sales Revenue"
                 value={form.title} onChange={e => handleChange('title', e.target.value)} />
          <div className="char-count">{form.title.length}/100</div>
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea className="form-textarea" maxLength={500} placeholder="Describe the goal, expected outcomes, and success criteria..."
                    value={form.description} onChange={e => handleChange('description', e.target.value)} />
          <div className="char-count">{form.description.length}/500</div>
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Thrust Area *</label>
            <select className="form-select" value={form.thrustArea} onChange={e => handleChange('thrustArea', e.target.value as ThrustArea)}>
              <option value="">Select area...</option>
              {THRUST_AREAS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.thrustArea && <div className="form-error">{errors.thrustArea}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Target Value *</label>
            <input className="form-input" type="number" min="0" step="any" placeholder="e.g., 150000"
                   value={form.targetValue || ''} onChange={e => handleChange('targetValue', parseFloat(e.target.value) || 0)} />
            {errors.targetValue && <div className="form-error">{errors.targetValue}</div>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Unit of Measurement *</label>
          <div className="radio-group">
            {(Object.keys(UOM_LABELS) as UoMType[]).map(type => (
              <label key={type} className={`radio-option ${form.uomType === type ? 'selected' : ''}`}
                     onClick={() => handleChange('uomType', type)}>
                <input type="radio" name="uomType" value={type} checked={form.uomType === type} onChange={() => {}} />
                <div>
                  <div className="radio-label">{UOM_LABELS[type].label}</div>
                  <div className="radio-desc">{UOM_LABELS[type].description}</div>
                  <div className="radio-example">Example: {UOM_LABELS[type].example}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.uomType && <div className="form-error">{errors.uomType}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Weightage (%) *</label>
          <input className="form-input" type="number" min="10" max="100" placeholder="10-100"
                 value={form.weightage || ''} onChange={e => handleChange('weightage', parseInt(e.target.value) || 0)} />
          <div className="form-hint">Minimum 10%. All goals must total 100%.</div>
          {errors.weightage && <div className="form-error">{errors.weightage}</div>}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/goals')}>Cancel</button>
          <button className="btn btn-secondary" onClick={handleSave}><Save size={16} /> Save as Draft</button>
          <button className="btn btn-primary" onClick={handleSubmit}><Send size={16} /> Submit for Approval</button>
        </div>
      </div>
    </div>
  );
}
