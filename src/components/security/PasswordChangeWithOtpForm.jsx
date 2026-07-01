import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { OTP_LEN, validatePassword } from '../../utils/passwordValidation';

/**
 * Password change with OTP verification step.
 * 1. User enters current + new passwords and clicks Change password.
 * 2. OTP is sent and the OTP field appears.
 * 3. User enters OTP and clicks Verify & change password to complete.
 */
export default function PasswordChangeWithOtpForm({
  description,
  otpLabel = 'OTP code',
  submitButtonLabel = 'Change password',
  confirmButtonLabel = 'Verify OTP & change password',
  requireCurrentPassword = true,
  onRequestOtp,
  onConfirm,
  onSuccess,
  className = '',
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpHint, setOtpHint] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const validatePasswordFields = () => {
    if (requireCurrentPassword && !currentPassword) {
      return 'Enter your current password';
    }
    if (!newPassword || !confirmPassword) {
      return 'Enter and confirm your new password';
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) return passwordError;
    if (newPassword !== confirmPassword) {
      return 'New passwords do not match';
    }
    if (requireCurrentPassword && currentPassword === newPassword) {
      return 'New password must be different from your current password';
    }
    return null;
  };

  const handleStartChange = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const fieldError = validatePasswordFields();
    if (fieldError) {
      setError(fieldError);
      return;
    }

    setBusy('otp');
    try {
      const res = await onRequestOtp();
      setOtpStep(true);
      setOtp('');
      const hint =
        res?.message ||
        (Array.isArray(res?.maskedRecipients) && res.maskedRecipients.length
          ? `OTP sent to: ${res.maskedRecipients.join(', ')}`
          : 'OTP sent. Enter the code below to complete your password change.');
      setOtpHint(hint);
      setMessage(hint);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not send OTP');
    } finally {
      setBusy('');
    }
  };

  const handleConfirmChange = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const fieldError = validatePasswordFields();
    if (fieldError) {
      setError(fieldError);
      return;
    }
    if (otp.length !== OTP_LEN) {
      setError('Enter the 6-digit OTP sent to your registered contact');
      return;
    }

    setBusy('submit');
    try {
      await onConfirm({
        currentPassword: requireCurrentPassword ? currentPassword : undefined,
        newPassword,
        otp,
      });
      setMessage('Password changed successfully.');
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Password change failed');
    } finally {
      setBusy('');
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setMessage('');
    setBusy('otp');
    try {
      const res = await onRequestOtp();
      setOtp('');
      const hint = res?.message || 'A new OTP has been sent.';
      setOtpHint(hint);
      setMessage(hint);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not resend OTP');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      <form onSubmit={otpStep ? handleConfirmChange : handleStartChange} className="space-y-3">
        {requireCurrentPassword && (
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            disabled={busy === 'submit'}
          />
        )}

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

        {otpStep && (
          <>
            {otpHint && <p className="text-xs text-muted-foreground">{otpHint}</p>}
            <Input
              label={otpLabel}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LEN))}
              placeholder="6-digit code"
              maxLength={OTP_LEN}
              required
              description="Enter the OTP sent after you clicked Change password"
            />
            <Button type="button" variant="outline" size="sm" loading={busy === 'otp'} onClick={handleResendOtp}>
              Resend OTP
            </Button>
          </>
        )}

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

        <Button type="submit" loading={busy === 'submit' || busy === 'otp'} iconName="Key">
          {otpStep ? confirmButtonLabel : submitButtonLabel}
        </Button>
      </form>
    </div>
  );
}
