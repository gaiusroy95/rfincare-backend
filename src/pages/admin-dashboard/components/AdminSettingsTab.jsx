import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import { authService } from '../../../services/authService';
import { adminProfileService, resolveAvatarUrl } from '../../../services/adminProfileService';
import { useAuth } from '../../../contexts/AuthContext';

const OTP_LEN = 6;

const validatePassword = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Include at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Include at least one number';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Include at least one special character';
  return null;
};

const Section = ({ title, description, icon, children }) => (
  <section className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon name={icon} size={20} className="text-primary" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
    {children}
  </section>
);

const AdminSettingsTab = () => {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const photoRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [resetOtp, setResetOtp] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [otpRecipients, setOtpRecipients] = useState([]);

  const [verifierEmails, setVerifierEmails] = useState(['', '', '']);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profile = await adminProfileService.getProfile();
      setData(profile);
      const existing = profile?.verificationEmails?.map((v) => v.email) || [];
      setVerifierEmails([existing[0] || '', existing[1] || '', existing[2] || '']);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const avatarSrc =
    resolveAvatarUrl(data?.profile?.avatarUrl) ||
    'https://img.rocket.new/generatedImages/rocket_gen_img_14da91c34-1763294780479.png';

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy('photo');
    setMessage('');
    setError('');
    try {
      const res = await adminProfileService.uploadPhoto(file);
      setMessage('Profile photo updated');
      setData((prev) =>
        prev ? { ...prev, profile: { ...prev.profile, avatarUrl: res.avatarUrl } } : prev,
      );
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Photo upload failed');
    } finally {
      setBusy('');
      if (photoRef.current) photoRef.current.value = '';
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const v = validatePassword(newPassword);
    if (v) {
      setError(v);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setBusy('password');
    try {
      const { error: changeError } = await authService.changePassword(currentPassword, newPassword);
      if (changeError) throw new Error(changeError.message);
      setMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err?.message || 'Password change failed');
    } finally {
      setBusy('');
    }
  };

  const handleRequestResetOtp = async () => {
    setBusy('reset-otp');
    setMessage('');
    setError('');
    try {
      const res = await adminProfileService.requestPasswordResetOtp();
      setResetOtpSent(true);
      setOtpRecipients(res.maskedRecipients || []);
      setMessage(res.message || 'OTP sent to registered verifier emails');
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not send OTP');
    } finally {
      setBusy('');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const v = validatePassword(resetPassword);
    if (v) {
      setError(v);
      return;
    }
    if (resetPassword !== resetConfirm) {
      setError('Passwords do not match');
      return;
    }
    if (resetOtp.length !== OTP_LEN) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setBusy('reset');
    try {
      await adminProfileService.confirmPasswordReset(resetOtp, resetPassword);
      setMessage('Password reset complete. Signing you out…');
      setTimeout(async () => {
        await signOut();
        navigate('/admin-login');
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Password reset failed');
    } finally {
      setBusy('');
    }
  };

  const handleSaveVerifierEmails = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const emails = verifierEmails.map((v) => v.trim()).filter(Boolean);
    if (emails.length !== 3) {
      setError('Enter all three verifier email addresses');
      return;
    }
    setBusy('verifiers');
    try {
      const res = await adminProfileService.updateVerificationEmails(emails);
      setMessage('Verifier emails saved');
      setData((prev) =>
        prev ? { ...prev, verificationEmails: res.verificationEmails || prev.verificationEmails } : prev,
      );
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not save verifier emails');
    } finally {
      setBusy('');
    }
  };

  if (loading) {
    return <p className="text-center text-muted-foreground py-12">Loading admin settings…</p>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Admin account settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile photo and password. Sensitive actions use OTP sent to your registered
          email and three configured verifier addresses.
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

      <Section title="Profile photo" description="Shown in the admin portal." icon="User">
        <div className="flex items-center gap-4">
          <img
            src={avatarSrc}
            alt={data?.profile?.fullName || userProfile?.full_name || 'Admin'}
            className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
          />
          <div>
            <p className="font-semibold text-foreground">
              {data?.profile?.fullName || userProfile?.full_name}
            </p>
            <p className="text-sm text-muted-foreground capitalize">
              {data?.profile?.role?.replace('_', ' ') || 'Admin'}
            </p>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <Button
              className="mt-2"
              variant="outline"
              size="sm"
              iconName="Camera"
              loading={busy === 'photo'}
              onClick={() => photoRef.current?.click()}
            >
              Change photo
            </Button>
          </div>
        </div>
      </Section>

      <Section
        title="Registered email"
        description="Your login email on file for this admin account."
        icon="Mail"
      >
        <p className="text-sm font-medium text-foreground">{data?.maskedEmail || '—'}</p>
        <p className="text-xs text-muted-foreground">
          OTP for password reset is also delivered to the three verifier emails below.
        </p>
      </Section>

      <Section
        title="OTP verifier emails (3 persons)"
        description={
          data?.canManageVerificationEmails
            ? 'Super admin: configure exactly three people who receive security OTPs.'
            : 'These three addresses receive OTP codes for admin password reset.'
        }
        icon="Users"
      >
        {data?.canManageVerificationEmails ? (
          <form onSubmit={handleSaveVerifierEmails} className="space-y-3">
            {[0, 1, 2].map((idx) => (
              <Input
                key={idx}
                label={`Verifier ${idx + 1} email`}
                type="email"
                value={verifierEmails[idx]}
                onChange={(e) => {
                  const next = [...verifierEmails];
                  next[idx] = e.target.value;
                  setVerifierEmails(next);
                }}
                required
              />
            ))}
            <Button type="submit" loading={busy === 'verifiers'} iconName="Save">
              Save verifier emails
            </Button>
          </form>
        ) : (
          <ul className="text-sm space-y-1">
            {(data?.verificationEmails || []).length === 0 ? (
              <li className="text-muted-foreground">Not configured yet — ask super admin.</li>
            ) : (
              data.verificationEmails.map((v, i) => (
                <li key={v.email || i} className="text-foreground">
                  Person {i + 1}: {v.masked}
                </li>
              ))
            )}
          </ul>
        )}
      </Section>

      <Section
        title="Change password"
        description="Use your current password to set a new one."
        icon="Lock"
      >
        <form onSubmit={handleChangePassword} className="space-y-3">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
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
          <Button type="submit" loading={busy === 'password'} iconName="Key">
            Update password
          </Button>
        </form>
      </Section>

      <Section
        title="Reset password (OTP)"
        description="OTP is sent to your registered email and all three verifier addresses."
        icon="Shield"
      >
        <form onSubmit={handleResetPassword} className="space-y-3">
          <Button
            type="button"
            variant="outline"
            loading={busy === 'reset-otp'}
            onClick={handleRequestResetOtp}
          >
            Send OTP to registered emails
          </Button>
          {resetOtpSent && otpRecipients.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Sent to: {otpRecipients.join(', ')}
            </p>
          )}
          {resetOtpSent && (
            <>
              <Input
                label="Email OTP"
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LEN))}
                placeholder="6-digit code"
                maxLength={OTP_LEN}
              />
              <Input
                label="New password"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm new password"
                type="password"
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
                required
              />
              <Button type="submit" loading={busy === 'reset'} iconName="Key">
                Reset password with OTP
              </Button>
            </>
          )}
        </form>
      </Section>
    </div>
  );
};

export default AdminSettingsTab;
