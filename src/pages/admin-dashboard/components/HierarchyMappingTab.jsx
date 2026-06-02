import React, { useCallback, useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { hierarchyService } from '../../../services/staffMessagingService';
import { adminService } from '../../../services/adminService';

const emptyForm = {
  agentUserId: '',
  employeeUserId: '',
  communicationEmail: '',
  hierarchyLevel: '1',
  isPrimary: true,
  notes: '',
};

const HierarchyMappingTab = () => {
  const [mappings, setMappings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, assignees] = await Promise.all([
        hierarchyService.listMappings(),
        adminService.getStaffAssignees(),
      ]);
      setMappings(Array.isArray(list) ? list : []);
      const ag = assignees?.data?.agents || assignees?.agents || [];
      const em = assignees?.data?.employees || assignees?.employees || [];
      setAgents(ag.map((a) => ({ value: a.id, label: a.label || `${a.code} — ${a.name}` })));
      setEmployees(em.map((e) => ({ value: e.id, label: e.label || `${e.code} — ${e.name}` })));
    } catch (err) {
      setMessage(err?.response?.data?.error || err?.message || 'Failed to load hierarchy');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEmployeeChange = async (employeeUserId) => {
    setForm((prev) => ({ ...prev, employeeUserId }));
    const { data } = await adminService.getStaffAssignees();
    const row = (data?.employees || []).find((e) => e.id === employeeUserId);
    if (row?.email) {
      setForm((prev) => ({
        ...prev,
        employeeUserId,
        communicationEmail: prev.communicationEmail || row.email,
      }));
    }
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({
      agentUserId: row.agentUserId,
      employeeUserId: row.employeeUserId,
      communicationEmail: row.communicationEmail,
      hierarchyLevel: String(row.hierarchyLevel ?? 1),
      isPrimary: Boolean(row.isPrimary),
      notes: row.notes || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        agentUserId: form.agentUserId,
        employeeUserId: form.employeeUserId,
        communicationEmail: form.communicationEmail.trim(),
        hierarchyLevel: Number.parseInt(form.hierarchyLevel, 10) || 1,
        isPrimary: form.isPrimary,
        notes: form.notes || undefined,
      };
      if (editingId) {
        await hierarchyService.updateMapping(editingId, payload);
        setMessage('Mapping updated.');
      } else {
        await hierarchyService.createMapping(payload);
        setMessage('Mapping created.');
      }
      resetForm();
      await load();
    } catch (err) {
      setMessage(err?.response?.data?.error || err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this agent–employee mapping?')) return;
    try {
      await hierarchyService.deleteMapping(id);
      setMessage('Mapping removed.');
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      setMessage(err?.response?.data?.error || err?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Icon name="GitBranch" size={22} className="text-primary" />
            Agent–employee hierarchy
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Map each agent to a processing employee. Messages and emails from the agent dashboard use
            the communication email below (typically the employee&apos;s inbox or a shared alias).
          </p>
        </div>
      </div>

      {message && (
        <p className="text-sm px-3 py-2 rounded-lg bg-muted border border-border">{message}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4"
      >
        <h3 className="font-semibold text-foreground">
          {editingId ? 'Edit mapping' : 'Add mapping'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Agent"
            options={[{ value: '', label: 'Select agent' }, ...agents]}
            value={form.agentUserId}
            onChange={(v) => setForm((p) => ({ ...p, agentUserId: v }))}
            required
            disabled={Boolean(editingId)}
          />
          <Select
            label="Employee (supervisor / processor)"
            options={[{ value: '', label: 'Select employee' }, ...employees]}
            value={form.employeeUserId}
            onChange={handleEmployeeChange}
            required
            disabled={Boolean(editingId)}
          />
          <Input
            label="Communication email (routing)"
            type="email"
            value={form.communicationEmail}
            onChange={(e) => setForm((p) => ({ ...p, communicationEmail: e.target.value }))}
            description="Emails from agent dashboard are sent to this address"
            required
          />
          <Input
            label="Hierarchy level"
            type="number"
            min={1}
            max={10}
            value={form.hierarchyLevel}
            onChange={(e) => setForm((p) => ({ ...p, hierarchyLevel: e.target.value }))}
          />
        </div>
        <Input
          label="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPrimary}
            onChange={(e) => setForm((p) => ({ ...p, isPrimary: e.target.checked }))}
          />
          Primary contact for this agent
        </label>
        <div className="flex gap-2">
          <Button type="submit" loading={saving}>
            {editingId ? 'Update' : 'Add mapping'}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border font-semibold text-foreground">
          Current mappings ({mappings.length})
        </div>
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading…</p>
        ) : mappings.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No mappings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-2">Agent</th>
                  <th className="px-4 py-2">Employee</th>
                  <th className="px-4 py-2">Communication email</th>
                  <th className="px-4 py-2">Level</th>
                  <th className="px-4 py-2">Primary</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {mappings.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium">{row.agentName}</div>
                      <div className="text-xs text-muted-foreground">{row.agentCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{row.employeeName}</div>
                      <div className="text-xs text-muted-foreground">{row.employeeCode}</div>
                    </td>
                    <td className="px-4 py-3">{row.communicationEmail}</td>
                    <td className="px-4 py-3">{row.hierarchyLevel}</td>
                    <td className="px-4 py-3">{row.isPrimary ? 'Yes' : '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Button type="button" variant="ghost" size="xs" onClick={() => handleEdit(row)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDelete(row.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HierarchyMappingTab;
