import React, { useEffect, useState, useRef } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { leadService } from '../../../services/leadService';
import { getApiErrorMessage } from '../../../lib/apiErrors';
import { trackEvent } from '../../../lib/marketingAnalytics';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EligibilityLeadGate = ({ onVerified, loanType }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [leadId, setLeadId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [otpSettings, setOtpSettings] = useState({
    requireMobileOtp: true,
    requireEmailOtp: true,
  });
  const submittingRef = useRef(false);

  const normalizedPhone = () => phone.replace(/\D/g, '').slice(-10);

  useEffect(() => {
    leadService.getOtpSettings().then(setOtpSettings).catch(() => {});
  }, []);

  const validateContact = () => {
    if (!fullName.trim()) return 'Full name is required.';
    if (!email.trim() || !EMAIL_RE.test(email.trim())) return 'Enter a valid email address.';
    if (!normalizedPhone() || !/^[6-9]\d{9}$/.test(normalizedPhone())) {
      return 'Enter a valid 10-digit Indian mobile number.';
    }
    if (!consent) return 'Please accept the consent to continue.';
    return null;
  };

  const handleCreateAndSendOtp = async () => {
    setError('');
    setWarning('');
    const validationError = validateContact();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (submittingRef.current) return;

    submittingRef.current = true;
    setLoading(true);
    try {
      const res = await leadService.startVerification({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: normalizedPhone(),
        loanType,
        source: 'eligibility',
        consentAccepted: true,
      });
      setLeadId(res?.lead?.id || res?.id || null);
      if (res?.requireMobileOtp !== undefined || res?.requireEmailOtp !== undefined) {
        setOtpSettings({
          requireMobileOtp: res.requireMobileOtp !== false,
          requireEmailOtp: res.requireEmailOtp !== false,
        });
      }
      if (Array.isArray(res?.warnings) && res.warnings.length) {
        setWarning(res.warnings.join(' '));
      } else if (res?.emailDelivered === false && res?.requireEmailOtp === false) {
        setWarning('Email OTP could not be sent. Enter the code sent to your mobile to continue.');
      }
      setOtpSent(true);
      setMobileOtp('');
      setEmailOtp('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send OTP'));
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');

    if (otpSettings.requireMobileOtp && mobileOtp.length !== 6) {
      setError('Enter the 6-digit OTP sent to your mobile.');
      return;
    }
    if (otpSettings.requireEmailOtp && emailOtp.length !== 6) {
      setError('Enter the 6-digit OTP sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await leadService.verifyOtp({
        phone: normalizedPhone(),
        email: email.trim(),
        mobileOtp: otpSettings.requireMobileOtp ? mobileOtp : undefined,
        emailOtp: otpSettings.requireEmailOtp ? emailOtp : undefined,
        leadId,
      });
      setVerified(true);
      trackEvent('lead', { event_label: 'eligibility_gate_verified', loan_type: loanType });
      onVerified?.({
        leadId: res?.lead?.id || leadId,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: normalizedPhone(),
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid or expired OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const canVerify =
    (!otpSettings.requireMobileOtp || mobileOtp.length === 6) &&
    (!otpSettings.requireEmailOtp || emailOtp.length === 6);

  if (verified) {
    return (
      <div className="p-4 bg-success/10 border border-success/30 rounded-lg flex items-start gap-2 text-sm text-success">
        <Icon name="CheckCircle2" size={18} className="shrink-0 mt-0.5" />
        <span>
          <strong>Verified.</strong> Mobile ({normalizedPhone()}) and email ({email.trim()}) confirmed.
          Continue with the loan details below.
        </span>
      </div>
    );
  }

  return (
    <div className="p-5 bg-muted/50 border border-border rounded-xl space-y-4">
      <div>
        <h3 className="font-semibold text-foreground">Verify your contact details</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Enter your name, email, and mobile. We will send separate OTP codes to your mobile
          {otpSettings.requireEmailOtp ? ' and email' : ''} to verify before showing the eligibility form.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={otpSent && loading}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={otpSent && loading}
        />
        <Input
          label="Mobile (10 digits)"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          required
          maxLength={10}
          disabled={otpSent && loading}
        />
      </div>
      <label className="flex items-start gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1"
          disabled={otpSent && loading}
        />
        <span className="text-muted-foreground">
          I consent to Rfincare contacting me about loan products and storing my details per the Privacy Policy.
        </span>
      </label>
      {otpSent && (
        <div className="space-y-4">
          {otpSettings.requireMobileOtp && (
            <div className="space-y-2">
              <Input
                label="OTP sent to your mobile"
                value={mobileOtp}
                onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit code"
                maxLength={6}
              />
            </div>
          )}
          {otpSettings.requireEmailOtp && (
            <div className="space-y-2">
              <Input
                label="OTP sent to your email"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit code"
                maxLength={6}
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {otpSettings.requireMobileOtp && <>Mobile OTP sent to {normalizedPhone()}</>}
            {otpSettings.requireMobileOtp && otpSettings.requireEmailOtp && ' · '}
            {otpSettings.requireEmailOtp && <>Email OTP sent to {email.trim()}</>}
            {otpSettings.requireMobileOtp && !otpSettings.requireEmailOtp && (
              <> · Email delivery is unavailable — mobile OTP only.</>
            )}
          </p>
          {import.meta.env?.DEV && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              Development: use the OTP shown in the API response or server logs when LOG_OTP is enabled.
            </p>
          )}
        </div>
      )}
      {warning && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          {warning}
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-3">
        {!otpSent ? (
          <Button type="button" onClick={handleCreateAndSendOtp} disabled={loading}>
            {loading ? 'Sending…' : 'Send OTP to mobile & email'}
          </Button>
        ) : (
          <>
            <Button type="button" onClick={handleVerify} disabled={loading || !canVerify}>
              {loading ? 'Verifying…' : 'Verify & continue'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={async () => {
                setError('');
                setWarning('');
                setLoading(true);
                try {
                  const otpRes = await leadService.requestOtp({
                    phone: normalizedPhone(),
                    email: email.trim(),
                    leadId,
                  });
                  if (Array.isArray(otpRes?.warnings) && otpRes.warnings.length) {
                    setWarning(otpRes.warnings.join(' '));
                  }
                  setMobileOtp('');
                  setEmailOtp('');
                } catch (err) {
                  setError(getApiErrorMessage(err, 'Could not resend OTP'));
                } finally {
                  setLoading(false);
                }
              }}
            >
              Resend OTPs
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => {
                setOtpSent(false);
                setMobileOtp('');
                setEmailOtp('');
                setError('');
              }}
            >
              Change details
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default EligibilityLeadGate;
