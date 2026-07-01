import React, { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { adminService } from '../../../services/adminService';

const StatusCheckAdminTab = () => {
  const [email, setEmail] = useState('');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [applications, setApplications] = useState([]);
  const [otpLog, setOtpLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportChannel, setSupportChannel] = useState('email');
  const [supportOtp, setSupportOtp] = useState('');
  const [supportAppNum, setSupportAppNum] = useState('');
  const [supportResult, setSupportResult] = useState(null);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');

  const loadOtpLog = async () => {
    try {
      const rows = await adminService.getStatusCheckOtpLog();
      setOtpLog(Array.isArray(rows) ? rows : []);
    } catch {
      setOtpLog([]);
    }
  };

  useEffect(() => {
    loadOtpLog();
  }, []);

  const handleLookup = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setApplications([]);
    try {
      const data = await adminService.lookupApplications({
        email: email.trim() || undefined,
        applicationNumber: applicationNumber.trim() || undefined,
      });
      setApplications(data?.applications || []);
      if (!data?.applications?.length) {
        setError('No applications found for this search.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setSupportLoading(true);
    setSupportMessage('');
    setSupportResult(null);
    try {
      const res = await adminService.sendStatusCheckOtp({
        email: supportEmail.trim(),
        phone: supportPhone.trim() || undefined,
        channel: supportChannel,
      });
      setSupportMessage(res?.message || 'OTP sent to customer.');
      if (res?.devOtp) {
        setSupportMessage(`OTP sent (dev code: ${res.devOtp})`);
      }
      loadOtpLog();
    } catch (err) {
      setSupportMessage(err?.response?.data?.error || 'Could not send OTP');
    } finally {
      setSupportLoading(false);
    }
  };

  const handleVerifyForCustomer = async (e) => {
    e?.preventDefault();
    setSupportLoading(true);
    setSupportMessage('');
    try {
      const data = await adminService.verifyStatusCheck({
        email: supportEmail.trim(),
        otp: supportOtp,
        applicationNumber: supportAppNum.trim(),
      });
      setSupportResult(data?.application);
      setSupportMessage('Verified — status loaded below.');
      loadOtpLog();
    } catch (err) {
      setSupportMessage(err?.response?.data?.error || 'Verification failed');
    } finally {
      setSupportLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Application status check</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Look up applications and assist customers with the same OTP status flow used on the homepage.
        </p>
      </div>

      <form onSubmit={handleLookup} className="grid md:grid-cols-3 gap-4 items-end border border-border rounded-lg p-4">
        <Input
          label="Customer email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@example.com"
        />
        <Input
          label="Application number"
          value={applicationNumber}
          onChange={(e) => setApplicationNumber(e.target.value)}
          placeholder="RFC..."
        />
        <Button type="submit" loading={loading}>
          Search applications
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {applications.length > 0 && (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">Application #</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{app.applicationNumber}</td>
                  <td className="p-3">
                    <div>{app.customerName || '—'}</div>
                    <div className="text-muted-foreground text-xs">{app.customerEmail}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                      {app.status}
                    </span>
                    {app.eligibilityStatus && (
                      <div className="text-xs text-muted-foreground mt-1">{app.eligibilityStatus}</div>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {app.updatedAt ? new Date(app.updatedAt).toLocaleString('en-IN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="border border-border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold">Assist customer (send / verify OTP)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Customer email"
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            required
          />
          <Input
            label="Phone (optional)"
            value={supportPhone}
            onChange={(e) => setSupportPhone(e.target.value)}
          />
          <Select
            label="OTP channel"
            value={supportChannel}
            onChange={setSupportChannel}
            options={[
              { value: 'email', label: 'Email' },
              { value: 'sms', label: 'SMS' },
              { value: 'whatsapp', label: 'WhatsApp' },
            ]}
          />
          <div className="flex items-end">
            <Button type="button" onClick={handleSendOtp} loading={supportLoading} variant="outline">
              Send OTP to customer
            </Button>
          </div>
        </div>
        <form onSubmit={handleVerifyForCustomer} className="grid md:grid-cols-3 gap-4 items-end">
          <Input
            label="Application number"
            value={supportAppNum}
            onChange={(e) => setSupportAppNum(e.target.value)}
            required
          />
          <Input
            label="OTP from customer"
            value={supportOtp}
            onChange={(e) => setSupportOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            required
          />
          <Button type="submit" loading={supportLoading}>
            Verify & view status
          </Button>
        </form>
        {supportMessage && <p className="text-sm text-muted-foreground">{supportMessage}</p>}
        {supportResult && (
          <div className="p-4 bg-muted rounded-lg text-sm space-y-1">
            <p>
              <strong>Application:</strong> {supportResult.applicationNumber}
            </p>
            <p>
              <strong>Status:</strong> {supportResult.status}
            </p>
            {supportResult.statusNotes && (
              <p>
                <strong>Notes:</strong> {supportResult.statusNotes}
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Recent status-check OTP activity</h3>
          <Button type="button" variant="ghost" size="sm" onClick={loadOtpLog}>
            Refresh
          </Button>
        </div>
        <div className="overflow-x-auto border border-border rounded-lg max-h-64">
          <table className="w-full text-xs">
            <thead className="bg-muted sticky top-0">
              <tr>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Channel</th>
                <th className="text-left p-2">Verified</th>
                <th className="text-left p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {otpLog.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">
                    No OTP requests yet
                  </td>
                </tr>
              ) : (
                otpLog.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="p-2">{row.email}</td>
                    <td className="p-2">{row.channel}</td>
                    <td className="p-2">{row.verified_at ? 'Yes' : 'No'}</td>
                    <td className="p-2">
                      {row.created_at ? new Date(row.created_at).toLocaleString('en-IN') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatusCheckAdminTab;
