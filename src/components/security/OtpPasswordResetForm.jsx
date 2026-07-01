import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { OTP_LEN, validatePassword } from '../../utils/passwordValidation';

/**
 * OTP-first password reset form. OTP and password fields are always visible;
 * user must request an OTP before submitting.
 */
export default function OtpPasswordResetForm({
  description,
  otpLabel = 'OTP code',
  sendButtonLabel = 'Send OTP',
  submitButtonLabel = 'Reset password with OTP',
  onRequestOtp,
  onConfirm,
  onSuccess,
  className = '',
}) {
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpHint, setOtpHint] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestOtp = async () => {
    setError('');
    setMessage('');
    setBusy('otp');
    try {
      const res = await onRequestOtp();
      setOtpSent(true);
      setOtp('');
      const hint =
        res?.message ||
        (Array.isArray(res?.maskedRecipients) && res.maskedRecipients.length
          ? `OTP sent to: ${res.maskedRecipients.join(', ')}`
          : 'OTP sent. Check your email or mobile.');
      setOtpHint(hint);
      setMessage(hint);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not send OTP');
    } finally {
      setBusy('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otpSent) {
      setError('Click "Send OTP" first to receive your verification code.');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (otp.length !== OTP_LEN) {
      setError('Enter the 6-digit OTP');
      return;
    }

    setBusy('submit');
    try {
      await onConfirm(otp, newPassword);
      setMessage('Password reset complete.');
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Password reset failed');
    } finally {
      setBusy('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      <Button
        type="button"
        variant="outline"
        loading={busy === 'otp'}
        onClick={handleRequestOtp}
      >
        {sendButtonLabel}
      </Button>

      {otpHint && otpSent && (
        <p className="text-xs text-muted-foreground">{otpHint}</p>
      )}

      <Input
        label={otpLabel}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LEN))}
        placeholder="6-digit code"
        maxLength={OTP_LEN}
        required
        description={otpSent ? 'Enter the code you received' : 'Request an OTP above, then enter the code here'}
      />

      <Input
        label="New password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <Input
        label="Confirm new password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

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

      <Button type="submit" loading={busy === 'submit'} iconName="Key">
        {submitButtonLabel}
      </Button>
    </form>
  );
}
