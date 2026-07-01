import React, { useCallback, useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { adminService } from '../../../services/adminService';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

const StaffManageModal = ({ staffType, staff, isOpen, onClose, onSuccess, initialTab = 'details' }) => {
  const isAgent = staffType === 'agent';
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    code: '',
    username: '',
    email: '',
    mobileNumber: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    accountStatus: 'active',
    onboardingStatus: 'active',
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);

  const load = useCallback(async () => {
    if (!staff?.id) return;
    setLoading(true);
    setError('');
    try {
      const { data, error: loadErr } = isAgent
        ? await adminService.getAgentDetail(staff.id)
        : await adminService.getEmployeeDetail(staff.id);
      if (loadErr) throw new Error(loadErr.message);
      setForm({
        name: data?.agentName || data?.employeeName || data?.fullName || '',
        code: data?.agentCode || data?.employeeCode || '',
        username: data?.username || '',
        email: data?.email || '',
        mobileNumber: data?.mobileNumber || data?.phone || '',
        accountNumber: data?.accountNumber || '',
        bankName: data?.bankName || '',
        ifscCode: data?.ifscCode || '',
        accountStatus: data?.accountStatus || 'active',
        onboardingStatus: data?.onboardingStatus || data?.accountStatus || 'active',
      });
    } catch (err) {
      setError(err?.message || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  }, [staff?.id, isAgent]);

  useEffect(() => {
    if (isOpen && staff?.id) {
      setTab(initialTab);
      setMessage('');
      setError('');
      setNewPassword('');
      setConfirmPassword('');
      load();
    }
  }, [isOpen, staff?.id, initialTab, load]);

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    const payload = isAgent
      ? {
          agentName: form.name,
          username: form.username,
          email: form.email,
          mobileNumber: form.mobileNumber,
          accountNumber: form.accountNumber,
          bankName: form.bankName,
          ifscCode: form.ifscCode,
          accountStatus: form.accountStatus,
          onboardingStatus: form.onboardingStatus,
        }
      : {
          employeeName: form.name,
          employeeCode: form.code,
          username: form.username,
          email: form.email,
          mobileNumber: form.mobileNumber,
          accountNumber: form.accountNumber,
          bankName: form.bankName,
          ifscCode: form.ifscCode,
          accountStatus: form.accountStatus,
          onboardingStatus: form.onboardingStatus,
        };

    const { error: saveErr } = isAgent
      ? await adminService.updateAgent(staff.id, payload)
      : await adminService.updateEmployee(staff.id, payload);

    setSaving(false);
    if (saveErr) {
      setError(saveErr.message);
      return;
    }
    setMessage('Details saved successfully');
    onSuccess?.();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSaving(true);
    const { error: resetErr } = isAgent
      ? await adminService.resetAgentPassword(staff.id, newPassword, notifyEmail)
      : await adminService.resetEmployeePassword(staff.id, newPassword, notifyEmail);
    setSaving(false);
    if (resetErr) {
      setError(resetErr.message);
      return;
    }
    setMessage(notifyEmail ? 'Password reset and email sent' : 'Password reset successfully');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!isOpen || !staff) return null;

  const title = isAgent ? 'Agent' : 'Employee';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
        <div className="border-b border-border p-4 md:p-6 flex items-center justify-between sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Manage {title}: {staff?.name || form.name}
            </h2>
            <p className="text-sm text-muted-foreground">{form.code || staff?.agentId || staff?.employeeCode}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="flex border-b border-border px-4">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === 'details' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            }`}
            onClick={() => setTab('details')}
          >
            Edit details
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === 'password' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            }`}
            onClick={() => setTab('password')}
          >
            Reset password
          </button>
        </div>

        <div className="p-4 md:p-6">
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
              {message}
            </p>
          )}

          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading…</p>
          ) : tab === 'details' ? (
            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={isAgent ? 'Agent name' : 'Employee name'}
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
                <Input
                  label={isAgent ? 'Agent code (RFA)' : 'Employee code'}
                  value={form.code}
                  onChange={(e) => !isAgent && handleChange('code', e.target.value)}
                  readOnly={isAgent}
                  disabled={isAgent}
                  required={!isAgent}
                  description={
                    isAgent
                      ? 'Assigned automatically in the RFA series (e.g. RFA-000001).'
                      : undefined
                  }
                />
                <Input
                  label="Username"
                  value={form.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
                <Input
                  label="Mobile number"
                  value={form.mobileNumber}
                  onChange={(e) => handleChange('mobileNumber', e.target.value)}
                />
                <Select
                  label="Account status"
                  options={STATUS_OPTIONS}
                  value={form.accountStatus}
                  onChange={(v) => handleChange('accountStatus', v)}
                />
                <Select
                  label="Onboarding status"
                  options={STATUS_OPTIONS}
                  value={form.onboardingStatus}
                  onChange={(v) => handleChange('onboardingStatus', v)}
                />
              </div>
              <p className="text-sm font-semibold text-foreground pt-2">Bank / commission payout</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Account number"
                  value={form.accountNumber}
                  onChange={(e) => handleChange('accountNumber', e.target.value)}
                />
                <Input
                  label="Bank name"
                  value={form.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                />
                <Input
                  label="IFSC code"
                  value={form.ifscCode}
                  onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving} iconName="Save">
                  Save details
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Set a new login password for this {title.toLowerCase()}. Optionally email the new password
                to {form.email}.
              </p>
              <Input
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                />
                Email new password to {form.email || 'staff email'}
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" loading={saving} iconName="Key">
                  Reset password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffManageModal;
