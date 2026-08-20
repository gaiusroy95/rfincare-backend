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
  { value: 'msg91', label: 'MSG91 Email (mail.rfincare.com)' },
  { value: 'smtp', label: 'SMTP email (Gmail / custom)' },
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
  msg91WhatsappNamespace: '',
  msg91WhatsappIntegratedNumber: '',
  msg91WhatsappLanguage: 'en',
  msg91WhatsappIncludeButton: false,
  msg91EmailDomain: '',
  msg91EmailFromEmail: '',
  msg91EmailFromName: 'Rfincare',
  msg91EmailOtpTemplateId: '',
  msg91EmailOtpVariable: 'OTP_CODE',
  otpMessageTemplate: 'Your Rfincare verification code is {{otp}}. Valid for 10 minutes.',
});

function setConfigField(setter, key, value) {
  setter((p) => ({
    ...p,
    providerConfig: { ...p.providerConfig, [key]: value },
  }));
}

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
  const [testEmail, setTestEmail] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await cmsService.otpSettings.get();
      setInfrastructure(data?.infrastructure || null);
      const cfg = { ...defaultProviderConfig(), ...(data?.providerConfig || {}) };
      // Prefer values already resolved by server (env + DB merge) when panel fields are empty.
      const infra = data?.infrastructure?.msg91 || {};
      if (!cfg.msg91SenderId && infra.senderId) cfg.msg91SenderId = infra.senderId;
      if (!cfg.msg91OtpTemplateId && infra.otpTemplateId) cfg.msg91OtpTemplateId = infra.otpTemplateId;
      if (!cfg.msg91WhatsappTemplateId && infra.whatsappTemplateId) {
        cfg.msg91WhatsappTemplateId = infra.whatsappTemplateId;
      }
      if (!cfg.msg91WhatsappNamespace && infra.whatsappNamespace) {
        cfg.msg91WhatsappNamespace = infra.whatsappNamespace;
      }
      if (!cfg.msg91WhatsappIntegratedNumber && infra.whatsappIntegratedNumber) {
        cfg.msg91WhatsappIntegratedNumber = infra.whatsappIntegratedNumber;
      }
      if (!cfg.msg91EmailDomain && infra.emailDomain) cfg.msg91EmailDomain = infra.emailDomain;
      if (!cfg.msg91EmailFromEmail && infra.emailFrom) cfg.msg91EmailFromEmail = infra.emailFrom;
      if (!cfg.msg91EmailOtpTemplateId && infra.emailOtpTemplateId) {
        cfg.msg91EmailOtpTemplateId = infra.emailOtpTemplateId;
      }
      setForm({
        smsProvider: data?.smsProvider || 'console',
        whatsappProvider: data?.whatsappProvider || 'console',
        emailProvider: data?.emailProvider || 'console',
        requireMobileOtp: data?.requireMobileOtp !== false,
        requireEmailOtp: data?.requireEmailOtp !== false,
        requireWhatsappOtp: data?.requireWhatsappOtp === true,
        providerConfig: {
          ...cfg,
          msg91OtpTemplateId: cfg.msg91OtpTemplateId || cfg.msg91TemplateId || '',
          msg91TemplateId: cfg.msg91OtpTemplateId || cfg.msg91TemplateId || '',
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
      const sender = String(form.providerConfig.msg91SenderId || '').trim();
      if ((form.smsProvider === 'msg91' || form.whatsappProvider === 'msg91') && sender && sender.length !== 6) {
        setMessage('MSG91 sender ID must be exactly 6 characters (A–Z / 0–9), e.g. RFINCR.');
        setSaving(false);
        return;
      }
      const payload = {
        ...form,
        providerConfig: {
          ...form.providerConfig,
          msg91TemplateId:
            form.providerConfig.msg91OtpTemplateId ||
            form.providerConfig.msg91TemplateId,
          msg91WhatsappIncludeButton: Boolean(form.providerConfig.msg91WhatsappIncludeButton),
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
      const bits = [
        data?.delivered === false ? 'SMS operator responded but delivery may have failed.' : 'Test SMS accepted by operator.',
        data?.provider ? `Provider: ${data.provider}` : null,
        data?.warning || null,
        data?.devOtp ? `Dev OTP: ${data.devOtp}` : null,
      ].filter(Boolean);
      setMessage(bits.join(' '));
    } catch (err) {
      setMessage(err?.response?.data?.error || err?.message || 'Test send failed');
    } finally {
      setTesting(false);
    }
  };

  const handleTestWhatsapp = async () => {
    if (!testPhone?.trim()) {
      setMessage('Enter a 10-digit mobile number to send a WhatsApp test OTP.');
      return;
    }
    setTesting(true);
    setMessage('');
    try {
      const data = await cmsService.otpSettings.testWhatsapp(testPhone.trim());
      const bits = [
        data?.delivered === false ? 'WhatsApp send may have failed.' : 'Test WhatsApp OTP accepted by operator.',
        data?.provider ? `Provider: ${data.provider}` : null,
        data?.warning || null,
        data?.devOtp ? `Dev OTP: ${data.devOtp}` : null,
      ].filter(Boolean);
      setMessage(bits.join(' '));
    } catch (err) {
      setMessage(err?.response?.data?.error || err?.message || 'WhatsApp test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail?.trim()) {
      setMessage('Enter an email address to send a test OTP.');
      return;
    }
    setTesting(true);
    setMessage('');
    try {
      const data = await cmsService.otpSettings.testEmail(testEmail.trim());
      const bits = [
        data?.delivered === false ? 'Email operator responded but delivery may have failed.' : 'Test email accepted by operator.',
        data?.provider ? `Provider: ${data.provider}` : null,
        data?.warning || null,
        data?.devOtp ? `Dev OTP: ${data.devOtp}` : null,
      ].filter(Boolean);
      setMessage(bits.join(' '));
    } catch (err) {
      setMessage(err?.response?.data?.error || err?.message || 'Test email failed');
    } finally {
      setTesting(false);
    }
  };

  const msg91Ready = infrastructure?.msg91?.configured;
  const msg91EmailReady = infrastructure?.msg91?.emailConfigured;
  const msg91WhatsappReady = infrastructure?.msg91?.whatsappConfigured;
  const usesMsg91 =
    form.smsProvider === 'msg91' || form.whatsappProvider === 'msg91';
  const usesMsg91Email = form.emailProvider === 'msg91';
  const senderLen = String(form.providerConfig.msg91SenderId || '').trim().length;

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading OTP settings…</p>;
  }

  return (
    <div className="space-y-6 border border-border rounded-xl p-6 bg-card">
      <div>
        <h3 className="text-lg font-semibold text-foreground">OTP verification operators</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Controls eligibility Step 1, lead verification, status check, and staff OTP flows.
          API keys live on the server only (<code>MSG91_AUTH_KEY</code>).
        </p>
      </div>

      {infrastructure && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm space-y-2">
          <p className="font-semibold text-foreground">Server configuration status</p>
          <ul className="grid sm:grid-cols-2 gap-1 text-muted-foreground">
            <li>
              MSG91 Auth:{' '}
              <span className={msg91Ready ? 'text-success font-medium' : 'text-destructive font-medium'}>
                {msg91Ready ? 'Auth key set' : 'MSG91_AUTH_KEY missing'}
              </span>
            </li>
            <li>
              MSG91 Email:{' '}
              <span className={msg91EmailReady ? 'text-success font-medium' : 'text-warning'}>
                {msg91EmailReady ? 'Ready' : 'Incomplete (domain / from / template)'}
              </span>
            </li>
            <li>
              MSG91 WhatsApp:{' '}
              <span className={msg91WhatsappReady ? 'text-success font-medium' : 'text-warning'}>
                {msg91WhatsappReady ? 'Ready' : 'Incomplete (template / namespace / number)'}
              </span>
            </li>
            <li>
              SMTP:{' '}
              <span className={infrastructure.smtp?.configured ? 'text-success' : 'text-warning'}>
                {infrastructure.smtp?.configured ? 'Configured' : 'Not set'}
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
              <span>{infrastructure.logOtp ? 'true (shows Dev OTP)' : 'false'}</span>
            </li>
          </ul>
          {infrastructure.msg91?.senderIdWarning ? (
            <p className="text-amber-700 text-xs pt-1">{infrastructure.msg91.senderIdWarning}</p>
          ) : null}
          {usesMsg91 && !msg91Ready && (
            <p className="text-destructive text-xs pt-1">
              Add <code className="text-xs">MSG91_AUTH_KEY</code> on Cloud Run / hosting and redeploy the API.
            </p>
          )}
          {usesMsg91Email && !msg91EmailReady && (
            <p className="text-destructive text-xs pt-1">
              Fill MSG91 email domain, from-email, and email OTP template below (or set MSG91_EMAIL_* env vars), then Save.
            </p>
          )}
          {form.whatsappProvider === 'msg91' && !msg91WhatsappReady && (
            <p className="text-destructive text-xs pt-1">
              Complete WhatsApp template name, namespace, and integrated number below, then Save — or disable Require WhatsApp OTP.
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

      {form.emailProvider === 'msg91' && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
          <p className="text-sm font-semibold text-foreground">MSG91 email (Rfincare domain)</p>
          <p className="text-xs text-muted-foreground">
            Uses verified domain via MSG91 Email API. Template variable default: <code>OTP_CODE</code>.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Email domain"
              value={form.providerConfig.msg91EmailDomain}
              onChange={(e) => setConfigField(setForm, 'msg91EmailDomain', e.target.value)}
              placeholder="mail.rfincare.com"
            />
            <Input
              label="From email"
              value={form.providerConfig.msg91EmailFromEmail}
              onChange={(e) => setConfigField(setForm, 'msg91EmailFromEmail', e.target.value)}
              placeholder="no-reply@mail.rfincare.com"
            />
            <Input
              label="From name"
              value={form.providerConfig.msg91EmailFromName}
              onChange={(e) => setConfigField(setForm, 'msg91EmailFromName', e.target.value)}
              placeholder="Rfincare"
            />
            <Input
              label="Email OTP template ID"
              value={form.providerConfig.msg91EmailOtpTemplateId}
              onChange={(e) => setConfigField(setForm, 'msg91EmailOtpTemplateId', e.target.value)}
              placeholder="otp_vari"
            />
            <Input
              label="Template variable name"
              value={form.providerConfig.msg91EmailOtpVariable}
              onChange={(e) => setConfigField(setForm, 'msg91EmailOtpVariable', e.target.value)}
              placeholder="OTP_CODE"
            />
          </div>
        </div>
      )}

      {(form.smsProvider === 'msg91' || form.whatsappProvider === 'msg91') && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
          <p className="text-sm font-semibold text-foreground">MSG91 SMS settings</p>
          <p className="text-xs text-muted-foreground">
            Server needs <code>MSG91_AUTH_KEY</code>. Panel values override sender / OTP template IDs.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Input
                label="MSG91 sender ID (exactly 6 chars)"
                value={form.providerConfig.msg91SenderId}
                onChange={(e) => setConfigField(setForm, 'msg91SenderId', e.target.value.toUpperCase())}
                placeholder="RFINCR"
                maxLength={6}
              />
              {senderLen > 0 && senderLen !== 6 ? (
                <p className="text-xs text-destructive mt-1">
                  Current value is {senderLen} characters. DLT sender IDs must be exactly 6 (e.g. RFINCR).
                </p>
              ) : null}
            </div>
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
              onChange={(e) => setConfigField(setForm, 'msg91FlowTemplateId', e.target.value)}
            />
          </div>
        </div>
      )}

      {form.whatsappProvider === 'msg91' && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
          <p className="text-sm font-semibold text-foreground">MSG91 WhatsApp OTP &amp; messaging</p>
          <p className="text-xs text-muted-foreground">
            From MSG91 → WhatsApp → your onboarded number and approved template. All three fields are required for WhatsApp OTP.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="WhatsApp template name"
              value={form.providerConfig.msg91WhatsappTemplateId}
              onChange={(e) => setConfigField(setForm, 'msg91WhatsappTemplateId', e.target.value)}
              placeholder="e.g. school_team or otp_template"
            />
            <Input
              label="WhatsApp template namespace (UUID)"
              value={form.providerConfig.msg91WhatsappNamespace}
              onChange={(e) => setConfigField(setForm, 'msg91WhatsappNamespace', e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
            <Input
              label="WhatsApp integrated number"
              value={form.providerConfig.msg91WhatsappIntegratedNumber}
              onChange={(e) =>
                setConfigField(setForm, 'msg91WhatsappIntegratedNumber', e.target.value.replace(/\D/g, ''))
              }
              placeholder="91XXXXXXXXXX"
            />
            <Input
              label="WhatsApp language code"
              value={form.providerConfig.msg91WhatsappLanguage}
              onChange={(e) => setConfigField(setForm, 'msg91WhatsappLanguage', e.target.value)}
              placeholder="en"
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(form.providerConfig.msg91WhatsappIncludeButton)}
              onChange={(e) => setConfigField(setForm, 'msg91WhatsappIncludeButton', e.target.checked)}
            />
            Include OTP URL button component (only if your WhatsApp template has a button)
          </label>
        </div>
      )}

      <Input
        label="OTP message template (plain SMS fallback — use {{otp}})"
        value={form.providerConfig.otpMessageTemplate}
        onChange={(e) => setConfigField(setForm, 'otpMessageTemplate', e.target.value)}
      />

      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <Input
            label="Test mobile number"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="10-digit mobile"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={handleTestSms} disabled={testing}>
            {testing ? 'Sending…' : 'Send test SMS'}
          </Button>
          {form.whatsappProvider === 'msg91' || form.requireWhatsappOtp ? (
            <Button type="button" variant="outline" onClick={handleTestWhatsapp} disabled={testing}>
              {testing ? 'Sending…' : 'Send test WhatsApp'}
            </Button>
          ) : null}
        </div>

        {(form.emailProvider === 'msg91' || form.emailProvider === 'smtp') && (
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <Input
              label={`Test email OTP (${form.emailProvider === 'msg91' ? 'MSG91' : 'SMTP'})`}
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={handleTestEmail} disabled={testing}>
              {testing ? 'Sending…' : 'Send test email'}
            </Button>
          </div>
        )}
      </div>

      {message && (
        <p
          className={`text-sm ${
            /saved|accepted|sent/i.test(message) && !/fail|error|missing|invalid/i.test(message)
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
