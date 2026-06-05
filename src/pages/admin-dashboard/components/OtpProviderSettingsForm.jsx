import React, { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { cmsService } from '../../../services/cmsService';

const SMS_OPTIONS = [
  { value: 'console', label: 'Console (development — logs OTP)' },
  { value: 'twilio', label: 'Twilio SMS' },
  { value: 'msg91', label: 'MSG91 SMS / OTP' },
];

const EMAIL_OPTIONS = [
  { value: 'console', label: 'Console (development — logs OTP)' },
  { value: 'smtp', label: 'SMTP email' },
];

const WHATSAPP_OPTIONS = [
  { value: 'console', label: 'Console (development — logs OTP)' },
  { value: 'twilio', label: 'Twilio WhatsApp' },
  { value: 'msg91', label: 'MSG91 WhatsApp' },
];

const defaultProviderConfig = () => ({
  msg91SenderId: '',
  msg91TemplateId: '',
  msg91OtpTemplateId: '',
  msg91FlowTemplateId: '',
  msg91WhatsappTemplateId: '',
  otpMessageTemplate: 'Your Rfincare verification code is {{otp}}. Valid for 10 minutes.',
});

const OtpProviderSettingsForm = () => {
  const [form, setForm] = useState({
    smsProvider: 'console',
    whatsappProvider: 'console',
    emailProvider: 'console',
    requireMobileOtp: true,
    requireEmailOtp: true,
    requireWhatsappOtp: false,
    providerConfig: defaultProviderConfig(),
  });
  const [infrastructure, setInfrastructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await cmsService.otpSettings.get();
      setInfrastructure(data?.infrastructure || null);
      setForm({
        smsProvider: data?.smsProvider || 'console',
        whatsappProvider: data?.whatsappProvider || 'console',
        emailProvider: data?.emailProvider || 'console',
        requireMobileOtp: data?.requireMobileOtp !== false,
        requireEmailOtp: data?.requireEmailOtp !== false,
        requireWhatsappOtp: data?.requireWhatsappOtp === true,
        providerConfig: {
          ...defaultProviderConfig(),
          ...(data?.providerConfig || {}),
          msg91OtpTemplateId:
            data?.providerConfig?.msg91OtpTemplateId ||
            data?.providerConfig?.msg91TemplateId ||
            '',
        },
      });
    } catch {
      setMessage('Could not load OTP settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        ...form,
        providerConfig: {
          ...form.providerConfig,
          msg91TemplateId:
            form.providerConfig.msg91OtpTemplateId ||
            form.providerConfig.msg91TemplateId,
        },
      };
      const data = await cmsService.otpSettings.update(payload);
      setInfrastructure(data?.infrastructure || null);
      setMessage('OTP provider settings saved.');
    } catch (err) {
      setMessage(err?.response?.data?.error || err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSms = async () => {
    if (!testPhone?.trim()) {
      setMessage('Enter a 10-digit mobile number to send a test OTP.');
      return;
    }
    setTesting(true);
    setMessage('');
    try {
      const data = await cmsService.otpSettings.testSms(testPhone.trim());
      setMessage(
        data?.devOtp
          ? `Test SMS sent. Dev OTP: ${data.devOtp}`
          : 'Test SMS sent successfully via configured operator.',
      );
    } catch (err) {
      setMessage(err?.response?.data?.error || err?.message || 'Test send failed');
    } finally {
      setTesting(false);
    }
  };

  const msg91Ready = infrastructure?.msg91?.configured;
  const usesMsg91 =
    form.smsProvider === 'msg91' || form.whatsappProvider === 'msg91';

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading OTP settings…</p>;
  }

  return (
    <div className="space-y-6 border border-border rounded-xl p-6 bg-card">
      <div>
        <h3 className="text-lg font-semibold text-foreground">OTP verification operators</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Controls eligibility Step 1, lead verification, status check, and staff OTP flows.
          API keys live on the server only.
        </p>
      </div>

      {infrastructure && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm space-y-2">
          <p className="font-semibold text-foreground">Server configuration status</p>
          <ul className="grid sm:grid-cols-2 gap-1 text-muted-foreground">
            <li>
              MSG91:{' '}
              <span className={msg91Ready ? 'text-success font-medium' : 'text-destructive font-medium'}>
                {msg91Ready ? 'Auth key set' : 'MSG91_AUTH_KEY missing'}
              </span>
            </li>
            <li>
              SMTP:{' '}
              <span className={infrastructure.smtp?.configured ? 'text-success' : 'text-warning'}>
                {infrastructure.smtp?.configured ? 'Configured' : 'Not set (console fallback)'}
              </span>
            </li>
            <li>
              Twilio:{' '}
              <span className={infrastructure.twilio?.configured ? 'text-success' : 'text-muted-foreground'}>
                {infrastructure.twilio?.configured ? 'Configured' : 'Not set'}
              </span>
            </li>
            <li>
              LOG_OTP:{' '}
              <span>{infrastructure.logOtp ? 'true (dev only)' : 'false'}</span>
            </li>
          </ul>
          {usesMsg91 && !msg91Ready && (
            <p className="text-destructive text-xs pt-1">
              Add <code className="text-xs">MSG91_AUTH_KEY</code> on Render/hosting and redeploy the API,
              or switch SMS/WhatsApp to Console for testing.
            </p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Select
          label="SMS operator"
          value={form.smsProvider}
          onChange={(value) => setForm((p) => ({ ...p, smsProvider: value }))}
          options={SMS_OPTIONS}
        />
        <Select
          label="WhatsApp operator"
          value={form.whatsappProvider}
          onChange={(value) => setForm((p) => ({ ...p, whatsappProvider: value }))}
          options={WHATSAPP_OPTIONS}
        />
        <Select
          label="Email operator"
          value={form.emailProvider}
          onChange={(value) => setForm((p) => ({ ...p, emailProvider: value }))}
          options={EMAIL_OPTIONS}
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.requireMobileOtp}
            onChange={(e) => setForm((p) => ({ ...p, requireMobileOtp: e.target.checked }))}
          />
          Require mobile OTP
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.requireEmailOtp}
            onChange={(e) => setForm((p) => ({ ...p, requireEmailOtp: e.target.checked }))}
          />
          Require email OTP
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.requireWhatsappOtp}
            onChange={(e) => setForm((p) => ({ ...p, requireWhatsappOtp: e.target.checked }))}
          />
          Require WhatsApp OTP
        </label>
      </div>

      {(form.smsProvider === 'msg91' || form.whatsappProvider === 'msg91') && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
          <p className="text-sm font-semibold text-foreground">MSG91 settings (admin panel)</p>
          <p className="text-xs text-muted-foreground">
            Env vars on server: <code>MSG91_AUTH_KEY</code>, <code>MSG91_SENDER_ID</code>,{' '}
            <code>MSG91_OTP_TEMPLATE_ID</code>. Panel values below override sender/template IDs.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="MSG91 sender ID (6 chars)"
              value={form.providerConfig.msg91SenderId}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  providerConfig: { ...p.providerConfig, msg91SenderId: e.target.value },
                }))
              }
              placeholder="RFINCR"
            />
            <Input
              label="MSG91 OTP template ID (recommended)"
              value={form.providerConfig.msg91OtpTemplateId}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  providerConfig: {
                    ...p.providerConfig,
                    msg91OtpTemplateId: e.target.value,
                    msg91TemplateId: e.target.value,
                  },
                }))
              }
              placeholder="From MSG91 OTP section"
            />
            <Input
              label="MSG91 Flow template ID (optional)"
              value={form.providerConfig.msg91FlowTemplateId}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  providerConfig: { ...p.providerConfig, msg91FlowTemplateId: e.target.value },
                }))
              }
            />
            <Input
              label="MSG91 WhatsApp template name (optional)"
              value={form.providerConfig.msg91WhatsappTemplateId}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  providerConfig: { ...p.providerConfig, msg91WhatsappTemplateId: e.target.value },
                }))
              }
            />
          </div>
        </div>
      )}

      <Input
        label="OTP message template (plain SMS fallback — use {{otp}})"
        value={form.providerConfig.otpMessageTemplate}
        onChange={(e) =>
          setForm((p) => ({
            ...p,
            providerConfig: { ...p.providerConfig, otpMessageTemplate: e.target.value },
          }))
        }
      />

      <div className="border rounded-lg p-4 flex flex-col sm:flex-row gap-3 items-end">
        <Input
          label="Test mobile OTP"
          value={testPhone}
          onChange={(e) => setTestPhone(e.target.value)}
          placeholder="10-digit mobile"
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={handleTestSms} disabled={testing}>
          {testing ? 'Sending…' : 'Send test SMS'}
        </Button>
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.includes('saved') || message.includes('sent')
              ? 'text-success'
              : 'text-destructive'
          }`}
        >
          {message}
        </p>
      )}

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save OTP settings'}
      </Button>
    </div>
  );
};

export default OtpProviderSettingsForm;
