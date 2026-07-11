import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { customerFinancialService } from '../../../services/customerFinancialService';

const GOAL_TEMPLATES = [
  { label: 'Buy a Home', target: 5000000, current: 0 },
  { label: 'Child Education', target: 2500000, current: 0 },
  { label: 'Retirement Fund', target: 10000000, current: 0 },
  { label: 'Emergency Fund', target: 500000, current: 0 },
  { label: 'Wedding', target: 1500000, current: 0 },
  { label: 'Dream Vacation', target: 300000, current: 0 },
];

function formatInr(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

const emptyForm = {
  label: '',
  target: '',
  current: '0',
  targetDate: '',
  notes: '',
};

const FinancialGoalsPlanner = ({
  goals: initialGoals = [],
  onChanged,
}) => {
  const [goals, setGoals] = useState(initialGoals);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setGoals(Array.isArray(initialGoals) ? initialGoals : []);
  }, [initialGoals]);

  const progressPreview = useMemo(() => {
    const target = Number(form.target) || 0;
    const current = Number(form.current) || 0;
    if (target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  }, [form.target, form.current]);

  const openCreate = (template = null) => {
    setEditing(null);
    setError('');
    setForm(
      template
        ? {
            label: template.label,
            target: String(template.target),
            current: String(template.current ?? 0),
            targetDate: '',
            notes: '',
          }
        : emptyForm,
    );
    setOpen(true);
  };

  const openEdit = (goal) => {
    setEditing(goal);
    setError('');
    setForm({
      label: goal.label || '',
      target: String(goal.target ?? ''),
      current: String(goal.current ?? 0),
      targetDate: goal.targetDate ? String(goal.targetDate).slice(0, 10) : '',
      notes: goal.notes || '',
    });
    setOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
    setEditing(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      label: form.label.trim(),
      target: Number(form.target),
      current: Number(form.current) || 0,
      targetDate: form.targetDate || null,
      notes: form.notes.trim(),
    };
    try {
      if (editing?.id) {
        const data = await customerFinancialService.updateFinancialGoal(editing.id, payload);
        setGoals((prev) => prev.map((g) => (g.id === editing.id ? data.goal : g)));
      } else {
        const data = await customerFinancialService.createFinancialGoal(payload);
        setGoals((prev) => [...prev, data.goal]);
      }
      setOpen(false);
      setEditing(null);
      onChanged?.();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not save goal');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editing?.id || saving) return;
    if (!window.confirm('Delete this financial goal?')) return;
    setSaving(true);
    setError('');
    try {
      await customerFinancialService.deleteFinancialGoal(editing.id);
      setGoals((prev) => prev.filter((g) => g.id !== editing.id));
      setOpen(false);
      setEditing(null);
      onChanged?.();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not delete goal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-3 -mt-1">
        <p className="text-xs text-muted-foreground">Track and plan milestones that matter to you.</p>
        <button
          type="button"
          onClick={() => openCreate()}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0"
        >
          <Icon name="Plus" size={14} />
          Set goal
        </button>
      </div>

      {goals.length === 0 ? (
        <button
          type="button"
          onClick={() => openCreate()}
          className="w-full rounded-xl border border-dashed border-border hover:border-emerald-500 hover:bg-emerald-50/40 transition-colors px-4 py-8 text-center"
        >
          <div className="mx-auto w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
            <Icon name="Target" size={22} className="text-emerald-700" />
          </div>
          <p className="text-sm font-semibold text-foreground">Create your first financial goal</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click here to set a home, education, retirement or custom goal.
          </p>
        </button>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <button
              key={goal.id || goal.label}
              type="button"
              onClick={() => openEdit(goal)}
              className="w-full text-left rounded-lg hover:bg-muted/40 p-1 -mx-1 transition-colors"
            >
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium text-foreground">{goal.label}</span>
                <span className="text-xs text-muted-foreground">{goal.progress ?? 0}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-[var(--color-brand-green-dark,#0f3d32)] rounded-full transition-all"
                  style={{ width: `${goal.progress ?? 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatInr(goal.current)}</span>
                <span>{formatInr(goal.target)}</span>
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => openCreate()}
            className="w-full text-sm font-medium text-primary hover:underline flex items-center justify-center gap-1 pt-1"
          >
            <Icon name="Plus" size={14} />
            Add another goal
          </button>
        </div>
      )}

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close goal planner"
            onClick={closeModal}
          />
          <div className="relative w-full sm:max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="font-bold text-foreground">
                  {editing ? 'Update goal' : 'Set a financial goal'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Plan the corpus you need and track progress.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-muted"
                aria-label="Close"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            {!editing ? (
              <div className="px-5 pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Quick templates</p>
                <div className="flex flex-wrap gap-2">
                  {GOAL_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      onClick={() =>
                        setForm({
                          label: tpl.label,
                          target: String(tpl.target),
                          current: String(tpl.current ?? 0),
                          targetDate: '',
                          notes: '',
                        })
                      }
                      className="text-xs px-2.5 py-1.5 rounded-full border border-border hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <Input
                label="Goal name"
                value={form.label}
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                placeholder="e.g. Buy a Home"
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Target amount (₹)"
                  type="number"
                  min="0"
                  step="1000"
                  value={form.target}
                  onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))}
                  placeholder="5000000"
                  required
                />
                <Input
                  label="Saved so far (₹)"
                  type="number"
                  min="0"
                  step="1000"
                  value={form.current}
                  onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <Input
                label="Target date (optional)"
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm((p) => ({ ...p, targetDate: e.target.value }))}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  placeholder="SIP plan, loan offset, etc."
                />
              </div>

              <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
                <span>Progress preview</span>
                <span className="font-semibold text-foreground">{progressPreview}%</span>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button type="submit" className="rf-btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Create goal'}
                </Button>
                <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>
                  Cancel
                </Button>
                {editing ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="ml-auto text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    Delete
                  </Button>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default FinancialGoalsPlanner;
