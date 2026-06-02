import React, { useCallback, useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { milestone4Service } from '../../../services/milestone4Service';

const VENDOR_LABELS = {
  transunion_cibil: 'TransUnion CIBIL',
  experian: 'Experian',
  equifax: 'Equifax',
  crif_high_mark: 'CRIF High Mark',
};

const EVENT_LABELS = {
  customer_document_upload: 'Customer uploads document',
  employee_document_decision: 'Employee approves/rejects document',
  application_stage_after_bank: 'Stage change after bank submission',
};

const Milestone4AdminPanel = () => {
  const [vendors, setVendors] = useState([]);
  const [settings, setSettings] = useState(null);
  const [sandboxAppId, setSandboxAppId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [secrets, setSecrets] = useState({});

  const load = useCallback(async () => {
    try {
      const [v, s] = await Promise.all([
        milestone4Service.getCibilVendors(),
        milestone4Service.getFileNotificationSettings(),
      ]);
      setVendors(v);
      setSettings(s);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load Milestone 4 settings');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveVendor = async (vendorKey) => {
    setBusy(vendorKey);
    setError('');
    try {
      const payload = secrets[vendorKey] || {};
      const updated = await milestone4Service.updateCibilVendor(vendorKey, payload);
      setVendors(updated);
      setMessage(`${VENDOR_LABELS[vendorKey] || vendorKey} saved`);
    } catch (err) {
      setError(err?.response?.data?.error || 'Save failed');
    } finally {
      setBusy('');
    }
  };

  const runSandbox = async () => {
    if (!sandboxAppId.trim()) return;
    setBusy('sandbox');
    try {
      const res = await milestone4Service.sandboxCibilPull(sandboxAppId.trim());
      setMessage(`Sandbox CIBIL: score ${res.creditScore}, status ${res.status}`);
    } catch (err) {
      setError(err?.response?.data?.error || 'Sandbox pull failed');
    } finally {
      setBusy('');
    }
  };

  const saveNotifications = async () => {
    setBusy('notif');
    try {
      const saved = await milestone4Service.saveFileNotificationSettings(settings);
      setSettings(saved);
      setMessage('File notification settings saved');
    } catch (err) {
      setError(err?.response?.data?.error || 'Save failed');
    } finally {
      setBusy('');
    }
  };

  const toggleChannel = (key) => {
    setSettings((prev) => ({
      ...prev,
      channels: { ...prev.channels, [key]: !prev.channels[key] },
    }));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Milestone 4 — CIBIL & notifications</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Register bureau vendors, run sandbox pulls, and configure file-update notifications (SMS,
          email, WhatsApp).
        </p>
      </div>

      {message && (
        <p className="text-sm px-3 py-2 rounded-lg bg-green-50 text-green-800 border border-green-200">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm px-3 py-2 rounded-lg bg-red-50 text-red-800 border border-red-200">
          {error}
        </p>
      )}

      <section className="bg-card border border-border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold">CIBIL vendor registration</h3>
        {vendors.map((v) => (
          <div key={v.vendorKey} className="border border-border rounded-lg p-3 space-y-2">
            <p className="font-medium">{v.displayName}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                label="API key"
                value={secrets[v.vendorKey]?.apiKey || ''}
                onChange={(e) =>
                  setSecrets((p) => ({
                    ...p,
                    [v.vendorKey]: { ...p[v.vendorKey], apiKey: e.target.value },
                  }))
                }
              />
              <Input
                label="API secret"
                type="password"
                value={secrets[v.vendorKey]?.apiSecret || ''}
                onChange={(e) =>
                  setSecrets((p) => ({
                    ...p,
                    [v.vendorKey]: { ...p[v.vendorKey], apiSecret: e.target.value },
                  }))
                }
              />
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <label className="text-sm flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={secrets[v.vendorKey]?.sandboxMode ?? v.sandboxMode}
                  onChange={(e) =>
                    setSecrets((p) => ({
                      ...p,
                      [v.vendorKey]: { ...p[v.vendorKey], sandboxMode: e.target.checked },
                    }))
                  }
                />
                Sandbox mode
              </label>
              <label className="text-sm flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={secrets[v.vendorKey]?.isActive ?? v.isActive}
                  onChange={(e) =>
                    setSecrets((p) => ({
                      ...p,
                      [v.vendorKey]: { ...p[v.vendorKey], isActive: e.target.checked },
                    }))
                  }
                />
                Active vendor
              </label>
              <Button size="sm" loading={busy === v.vendorKey} onClick={() => saveVendor(v.vendorKey)}>
                Save
              </Button>
            </div>
          </div>
        ))}
        <div className="flex gap-2 items-end">
          <Input
            label="Application ID (sandbox test)"
            value={sandboxAppId}
            onChange={(e) => setSandboxAppId(e.target.value)}
            placeholder="UUID of loan application"
          />
          <Button loading={busy === 'sandbox'} onClick={runSandbox}>
            Run sandbox pull
          </Button>
        </div>
      </section>

      {settings && (
        <section className="bg-card border border-border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold">File update notifications</h3>
          <p className="text-sm text-muted-foreground">
            Choose channels (any combination of SMS, email, WhatsApp). Rules follow the notification
            matrix for customer, employee, and agent.
          </p>
          <div className="flex gap-4">
            {['sms', 'email', 'whatsapp'].map((ch) => (
              <label key={ch} className="text-sm flex items-center gap-2 capitalize">
                <input
                  type="checkbox"
                  checked={!!settings.channels?.[ch]}
                  onChange={() => toggleChannel(ch)}
                />
                {ch}
              </label>
            ))}
          </div>
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!settings.agentNotificationsEnabled}
              onChange={(e) =>
                setSettings((p) => ({ ...p, agentNotificationsEnabled: e.target.checked }))
              }
            />
            Enable optional agent notifications
          </label>
          <ul className="text-xs text-muted-foreground space-y-1">
            {Object.entries(EVENT_LABELS).map(([key, label]) => (
              <li key={key}>
                <strong>{label}:</strong>{' '}
                {JSON.stringify(settings.events?.[key] || {})}
              </li>
            ))}
          </ul>
          <Button loading={busy === 'notif'} onClick={saveNotifications}>
            Save notification settings
          </Button>
        </section>
      )}
    </div>
  );
};

export default Milestone4AdminPanel;
