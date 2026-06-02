import React, { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { cmsService } from '../../../services/cmsService';

const SMS_OPTIONS = [
  { value: 'console', label: 'Console (development — logs OTP)' },
  { value: 'twilio', label: 'Twilio' },
  { value: 'msg91', label: 'MSG91' },
];

const EMAIL_OPTIONS = [
  { value: 'console', label: 'Console (development — logs OTP)' },
  { value: 'smtp', label: 'SMTP (uses SMTP_* in server .env)' },
];

const WHATSAPP_OPTIONS = [
  { value: 'console', label: 'Console (development — logs OTP)' },
  { value: 'twilio', label: 'Twilio WhatsApp' },
  { value: 'msg91', label: 'MSG91' },
];

const OtpProviderSettingsForm = () => {
  const [form, setForm] = useState({
    smsProvider: 'console',
    whatsappProvider: 'console',
    emailProvider: 'console',
    requireMobileOtp: true,
    requireEmailOtp: true,
    requireWhatsappOtp: false,
    providerConfig: {
      msg91SenderId: '',
      msg91TemplateId: '',
      otpMessageTemplate: 'Your Rfincare verification code is {{otp}}. Valid for 10 minutes.',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await cmsService.otpSettings.get();
      setForm({
        smsProvider: data?.smsProvider || 'console',
        whatsappProvider: data?.whatsappProvider || 'console',
        emailProvider: data?.emailProvider || 'console',
        requireMobileOtp: data?.requireMobileOtp !== false,
        requireEmailOtp: data?.requireEmailOtp !== false,
        requireWhatsappOtp: data?.requireWhatsappOtp === true,
        providerConfig: {
          msg91SenderId: data?.providerConfig?.msg91SenderId || '',
          msg91TemplateId: data?.providerConfig?.msg91TemplateId || '',
          otpMessageTemplate:
            data?.providerConfig?.otpMessageTemplate ||
            'Your Rfincare verification code is {{otp}}. Valid for 10 minutes.',
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
      await cmsService.otpSettings.update(form);
      setMessage('OTP provider settings saved.');
      await load();
    } catch (err) {
      setMessage(err?.response?.data?.error || err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading OTP settings…</p>;
  }

  return (
    <div className="space-y-6 border border-border rounded-xl p-6 bg-card">
      <div>
        <h3 className="text-lg font-semibold text-foreground">OTP verification operators</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Choose SMS and email delivery providers for eligibility Step 1 and other OTP flows. API keys
          stay on the server (<code className="text-xs">TWILIO_*</code>, <code className="text-xs">MSG91_AUTH_KEY</code>,{' '}
          <code className="text-xs">SMTP_*</code>).
        </p>
      </div>

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

      {form.smsProvider === 'msg91' && (
        <div className="grid md:grid-cols-2 gap-4 border rounded-lg p-4">
          <Input
            label="MSG91 sender ID"
            value={form.providerConfig.msg91SenderId}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                providerConfig: { ...p.providerConfig, msg91SenderId: e.target.value },
              }))
            }
          />
          <Input
            label="MSG91 template ID (optional)"
            value={form.providerConfig.msg91TemplateId}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                providerConfig: { ...p.providerConfig, msg91TemplateId: e.target.value },
              }))
            }
          />
        </div>
      )}

      <Input
        label="OTP message template (use {{otp}} placeholder)"
        value={form.providerConfig.otpMessageTemplate}
        onChange={(e) =>
          setForm((p) => ({
            ...p,
            providerConfig: { ...p.providerConfig, otpMessageTemplate: e.target.value },
          }))
        }
      />

      {message && (
        <p className={`text-sm ${message.includes('saved') ? 'text-success' : 'text-destructive'}`}>
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
