import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const AccessControlModal = ({ employee, isOpen, onClose, onSave }) => {
  const [accessControls, setAccessControls] = useState({
    moduleName: 'applications',
    permissions: ['read'],
    isActive: true,
    expiresAt: '',
  });

  useEffect(() => {
    if (!isOpen || !employee?.id) return;
    (async () => {
      const { data } = await adminService.getEmployeeAccessControls(employee.id);
      const row = data?.find((r) => r.moduleName === 'applications') || data?.[0];
      if (row) {
        setAccessControls({
          moduleName: row.moduleName || 'applications',
          permissions: row.permissions || ['read'],
          isActive: row.isActive !== false,
          expiresAt: row.expiresAt ? String(row.expiresAt).slice(0, 10) : '',
        });
      }
    })();
  }, [isOpen, employee?.id]);

  const moduleOptions = [
    { value: 'applications', label: 'Loan Applications' },
    { value: 'customers', label: 'Customer Management' },
    { value: 'agents', label: 'Agent Management' },
    { value: 'banks', label: 'Bank Management' },
    { value: 'reports', label: 'Reports & Analytics' },
    { value: 'documents', label: 'Document Management' },
    { value: 'approval_matrix', label: 'Approval Matrix' },
    { value: 'system_config', label: 'System Configuration' }
  ];

  const permissionOptions = [
    { value: 'read', label: 'Read/View' },
    { value: 'write', label: 'Create/Edit' },
    { value: 'delete', label: 'Delete' },
    { value: 'approve', label: 'Approve/Reject' }
  ];

  const togglePermission = (permission) => {
    setAccessControls(prev => ({
      ...prev,
      permissions: prev?.permissions?.includes(permission)
        ? prev?.permissions?.filter(p => p !== permission)
        : [...prev?.permissions, permission]
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSave(accessControls);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-lg w-full">
        <div className="border-b border-border p-4 md:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Access type</h2>
            <p className="text-sm text-muted-foreground">Employee: {employee?.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          <Select
            label="Module"
            options={moduleOptions}
            value={accessControls?.moduleName}
            onChange={(value) => setAccessControls({ ...accessControls, moduleName: value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Permissions</label>
            <div className="space-y-2">
              {permissionOptions?.map((option) => (
                <Checkbox
                  key={option?.value}
                  label={option?.label}
                  checked={accessControls?.permissions?.includes(option?.value)}
                  onChange={() => togglePermission(option?.value)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Expiration Date (Optional)</label>
            <input
              type="date"
              value={accessControls?.expiresAt}
              onChange={(e) => setAccessControls({ ...accessControls, expiresAt: e?.target?.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-muted-foreground mt-1">Leave empty for permanent access</p>
          </div>

          <Checkbox
            label="Active"
            description="Enable or disable this access control"
            checked={accessControls?.isActive}
            onChange={(e) => setAccessControls({ ...accessControls, isActive: e?.target?.checked })}
          />

          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-border">
            <Button variant="outline" fullWidth onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="default" fullWidth type="submit">
              Save Access Control
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccessControlModal;
