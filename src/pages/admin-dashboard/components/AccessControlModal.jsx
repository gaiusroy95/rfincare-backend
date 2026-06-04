import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../../services/adminService';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const MODULES = [
  { value: 'applications', label: 'Loan Applications' },
  { value: 'customers', label: 'Customer Management' },
  { value: 'agents', label: 'Agent Management' },
  { value: 'banks', label: 'Bank Management' },
  { value: 'reports', label: 'Reports & Analytics' },
  { value: 'documents', label: 'Document Management' },
  { value: 'approval_matrix', label: 'Approval Matrix' },
  { value: 'system_config', label: 'System Configuration' },
];

const PERMISSION_COLUMNS = [
  { key: 'read', label: 'Read / View' },
  { key: 'write', label: 'Create / Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'approve', label: 'Approve' },
  { key: 'reject', label: 'Reject' },
];

function buildEmptyGrid() {
  return Object.fromEntries(MODULES.map((m) => [m.value, []]));
}

function normalizePermissions(list = []) {
  const perms = [...list];
  if (perms.includes('approve') && !perms.includes('reject')) {
    perms.push('reject');
  }
  return perms;
}

const AccessControlModal = ({ employee, isOpen, onClose, onSave }) => {
  const [modulePermissions, setModulePermissions] = useState(buildEmptyGrid);
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !employee?.id) return;
    (async () => {
      setLoading(true);
      const grid = buildEmptyGrid();
      const { data } = await adminService.getEmployeeAccessControls(employee.id);
      let active = true;
      let expiry = '';
      for (const row of data || []) {
        if (row.moduleName && grid[row.moduleName] != null) {
          grid[row.moduleName] = normalizePermissions(row.permissions || []);
        }
        if (row.isActive === false) active = false;
        if (row.expiresAt && !expiry) {
          expiry = String(row.expiresAt).slice(0, 10);
        }
      }
      setModulePermissions(grid);
      setIsActive(active);
      setExpiresAt(expiry);
      setLoading(false);
    })();
  }, [isOpen, employee?.id]);

  const togglePermission = (moduleName, permissionKey) => {
    setModulePermissions((prev) => {
      const current = prev[moduleName] || [];
      const next = current.includes(permissionKey)
        ? current.filter((p) => p !== permissionKey)
        : [...current, permissionKey];
      return { ...prev, [moduleName]: next };
    });
  };

  const toggleColumn = (permissionKey, checked) => {
    setModulePermissions((prev) => {
      const next = { ...prev };
      for (const mod of MODULES) {
        const current = next[mod.value] || [];
        if (checked) {
          if (!current.includes(permissionKey)) {
            next[mod.value] = [...current, permissionKey];
          }
        } else {
          next[mod.value] = current.filter((p) => p !== permissionKey);
        }
      }
      return next;
    });
  };

  const columnStates = useMemo(() => {
    return PERMISSION_COLUMNS.reduce((acc, col) => {
      const allOn = MODULES.every((m) => (modulePermissions[m.value] || []).includes(col.key));
      const someOn = MODULES.some((m) => (modulePermissions[m.value] || []).includes(col.key));
      acc[col.key] = { allOn, someOn };
      return acc;
    }, {});
  }, [modulePermissions]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSave({
      isActive,
      expiresAt,
      modules: MODULES.map((mod) => ({
        moduleName: mod.value,
        permissions: modulePermissions[mod.value] || [],
      })),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="border-b border-border p-4 md:p-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-foreground">Access type</h2>
            <p className="text-sm text-muted-foreground">Employee: {employee?.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} type="button">
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-4 md:p-6 overflow-auto flex-1">
            {loading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Loading access settings…</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left font-semibold text-foreground px-3 py-3 min-w-[160px]">
                        Module
                      </th>
                      {PERMISSION_COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          className="text-center font-semibold text-foreground px-2 py-3 whitespace-nowrap"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs">{col.label}</span>
                            <input
                              type="checkbox"
                              title={`Select all: ${col.label}`}
                              checked={columnStates[col.key]?.allOn}
                              ref={(el) => {
                                if (el) {
                                  el.indeterminate =
                                    columnStates[col.key]?.someOn && !columnStates[col.key]?.allOn;
                                }
                              }}
                              onChange={(e) => toggleColumn(col.key, e.target.checked)}
                              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map((mod) => (
                      <tr key={mod.value} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="px-3 py-2.5 font-medium text-foreground">{mod.label}</td>
                        {PERMISSION_COLUMNS.map((col) => (
                          <td key={col.key} className="text-center px-2 py-2.5">
                            <input
                              type="checkbox"
                              checked={(modulePermissions[mod.value] || []).includes(col.key)}
                              onChange={() => togglePermission(mod.value, col.key)}
                              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                              aria-label={`${mod.label} — ${col.label}`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Expiration date (optional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground mt-1">Applies to all modules. Leave empty for permanent access.</p>
              </div>
              <div className="flex items-end">
                <Checkbox
                  label="Active"
                  description="Enable or disable employee access"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 p-4 md:p-6 pt-0 border-t border-border shrink-0">
            <Button variant="outline" fullWidth onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="default" fullWidth type="submit" disabled={loading}>
              Save access control
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccessControlModal;
