import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import PasswordChangeWithOtpForm from '../../../components/security/PasswordChangeWithOtpForm';
import { agentProfileService, resolveAvatarUrl } from '../../../services/agentProfileService';
import { useAuth } from '../../../contexts/AuthContext';

const OTP_LEN = 6;

const Section = ({ title, description, icon, children }) => (
  <section className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
        <Icon name={icon} size={20} className="text-[var(--color-brand-green)]" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
    {children}
  </section>
);

const AgentSettingsPanel = () => {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const photoRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);

  const [bankForm, setBankForm] = useState({ accountNumber: '', bankName: '', ifscCode: '' });
  const [bankOtp, setBankOtp] = useState('');
  const [bankOtpSent, setBankOtpSent] = useState(false);

  const [deactivateOtp, setDeactivateOtp] = useState('');
  const [deactivateConfirm, setDeactivateConfirm] = useState('');
  const [deactivateOtpSent, setDeactivateOtpSent] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profile = await agentProfileService.getProfile();
      setData(profile);
      setNewEmail(profile?.registeredEmail || profile?.profile?.email || '');
      if (profile?.bank) {
        setBankForm({
          accountNumber: profile.bank.accountNumber || '',
          bankName: profile.bank.bankName || '',
          ifscCode: profile.bank.ifscCode || '',
        });
      }
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
      const res = await agentProfileService.uploadPhoto(file);
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

  const handleRequestEmailOtp = async () => {
    if (!newEmail.trim()) {
      setError('Enter a new email address');
      return;
    }
    setBusy('email-otp');
    setMessage('');
    setError('');
    try {
      await agentProfileService.requestEmailOtp(newEmail.trim());
      setEmailOtpSent(true);
      setMessage(`OTP sent to ${data?.maskedMobile || 'your registered mobile'}`);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not send OTP');
    } finally {
      setBusy('');
    }
  };

  const handleConfirmEmail = async (e) => {
    e.preventDefault();
    setBusy('email');
    setMessage('');
    setError('');
    try {
      await agentProfileService.confirmEmail(newEmail.trim(), emailOtp);
      setMessage('Email updated successfully');
      setEmailOtp('');
      setEmailOtpSent(false);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Email update failed');
    } finally {
      setBusy('');
    }
  };

  const handleRequestBankOtp = async () => {
    setBusy('bank-otp');
    setMessage('');
    setError('');
    try {
      await agentProfileService.requestBankOtp({
        accountNumber: bankForm.accountNumber.trim(),
        bankName: bankForm.bankName.trim(),
        ifscCode: bankForm.ifscCode.trim(),
      });
      setBankOtpSent(true);
      setMessage(`OTP sent to ${data?.maskedMobile || 'your registered mobile'}`);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not send OTP');
    } finally {
      setBusy('');
    }
  };

  const handleConfirmBank = async (e) => {
    e.preventDefault();
    setBusy('bank');
    setMessage('');
    setError('');
    try {
      await agentProfileService.confirmBank({
        otp: bankOtp,
        accountNumber: bankForm.accountNumber.trim(),
        bankName: bankForm.bankName.trim(),
        ifscCode: bankForm.ifscCode.trim(),
      });
      setMessage('Commission bank details updated');
      setBankOtp('');
      setBankOtpSent(false);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Bank update failed');
    } finally {
      setBusy('');
    }
  };

  const handleRequestDeactivateOtp = async () => {
    setBusy('deact-otp');
    setMessage('');
    setError('');
    try {
      await agentProfileService.requestDeactivateOtp();
      setDeactivateOtpSent(true);
      setMessage('OTP sent to confirm deactivation');
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not send OTP');
    } finally {
      setBusy('');
    }
  };

  const handleDeactivate = async (e) => {
    e.preventDefault();
    if (deactivateConfirm !== 'DEACTIVATE') {
      setError('Type DEACTIVATE to confirm');
      return;
    }
    setBusy('deactivate');
    setMessage('');
    setError('');
    try {
      await agentProfileService.confirmDeactivate(deactivateOtp, 'DEACTIVATE');
      await signOut();
      navigate('/agent-login', {
        replace: true,
        state: { message: 'Your agent account has been deactivated.' },
      });
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Deactivation failed');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
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

      {loading ? (
        <p className="text-center text-muted-foreground py-12">Loading profile…</p>
      ) : (
        <>
          <Section title="Profile photo" description="This photo appears on your agent dashboard." icon="User">
            <div className="flex items-center gap-4">
              <img
                src={avatarSrc}
                alt={data?.profile?.fullName || userProfile?.full_name || 'Agent'}
                className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
              />
              <div>
                <p className="font-semibold text-foreground">
                  {data?.profile?.fullName || userProfile?.full_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Agent code: {data?.profile?.agentCode || '—'}
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
            title="Email address"
            description={`OTP will be sent to your registered mobile (${data?.maskedMobile || '—'}).`}
            icon="Mail"
          >
            <form onSubmit={handleConfirmEmail} className="space-y-3">
              <Input
                label="Email ID"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={busy === 'email-otp'}
                  onClick={handleRequestEmailOtp}
                >
                  Send OTP to mobile
                </Button>
              </div>
              {emailOtpSent && (
                <>
                  <Input
                    label="Mobile OTP"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LEN))}
                    placeholder="6-digit code"
                    maxLength={OTP_LEN}
                  />
                  <Button type="submit" loading={busy === 'email'} iconName="Check">
                    Verify &amp; update email
                  </Button>
                </>
              )}
            </form>
          </Section>

          <Section
            title="Commission bank account"
            description="Payout account for commissions. OTP verification required on your registered mobile."
            icon="Landmark"
          >
            {data?.bank?.accountNumberMasked && (
              <p className="text-sm text-muted-foreground">
                Current account: {data.bank.accountNumberMasked} · {data.bank.bankName} ·{' '}
                {data.bank.ifscCode}
              </p>
            )}
            <form onSubmit={handleConfirmBank} className="space-y-3">
              <Input
                label="Account number"
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm((p) => ({ ...p, accountNumber: e.target.value }))}
                required
              />
              <Input
                label="Bank name"
                value={bankForm.bankName}
                onChange={(e) => setBankForm((p) => ({ ...p, bankName: e.target.value }))}
                required
              />
              <Input
                label="IFSC code"
                value={bankForm.ifscCode}
                onChange={(e) =>
                  setBankForm((p) => ({ ...p, ifscCode: e.target.value.toUpperCase() }))
                }
                required
              />
              <Button
                type="button"
                variant="outline"
                loading={busy === 'bank-otp'}
                onClick={handleRequestBankOtp}
              >
                Send OTP to mobile
              </Button>
              {bankOtpSent && (
                <>
                  <Input
                    label="Mobile OTP"
                    value={bankOtp}
                    onChange={(e) => setBankOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LEN))}
                    placeholder="6-digit code"
                    maxLength={OTP_LEN}
                  />
                  <Button type="submit" loading={busy === 'bank'} iconName="Shield">
                    Verify &amp; save bank details
                  </Button>
                </>
              )}
            </form>
          </Section>

          <Section
            title="Change password"
            description={`Enter your passwords, then verify with an OTP sent to ${data?.registeredEmail || 'your registered email'}.`}
            icon="Lock"
          >
            <PasswordChangeWithOtpForm
              otpLabel="Email OTP"
              onRequestOtp={() => agentProfileService.requestPasswordResetOtp()}
              onConfirm={({ currentPassword, newPassword, otp }) =>
                agentProfileService.confirmPasswordReset(otp, newPassword, currentPassword)
              }
              onSuccess={() => {
                setMessage('Password changed. Signing you out…');
                setTimeout(async () => {
                  await signOut();
                  navigate('/agent-login', { replace: true });
                }, 1500);
              }}
            />
          </Section>

          <section className="bg-card border-2 border-destructive/40 rounded-lg p-4 md:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                <Icon name="AlertTriangle" size={20} className="text-destructive" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-destructive">Deactivate agent account</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  This disables your agent code ({data?.profile?.agentCode}) and ID. You will not be
                  able to log in until an admin reactivates your account.
                </p>
              </div>
            </div>
            <form onSubmit={handleDeactivate} className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="border-destructive text-destructive"
                loading={busy === 'deact-otp'}
                onClick={handleRequestDeactivateOtp}
              >
                Send OTP to mobile
              </Button>
              {deactivateOtpSent && (
                <>
                  <Input
                    label="Mobile OTP"
                    value={deactivateOtp}
                    onChange={(e) =>
                      setDeactivateOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LEN))
                    }
                    placeholder="6-digit code"
                    maxLength={OTP_LEN}
                  />
                  <Input
                    label='Type "DEACTIVATE" to confirm'
                    value={deactivateConfirm}
                    onChange={(e) => setDeactivateConfirm(e.target.value)}
                    placeholder="DEACTIVATE"
                  />
                  <Button
                    type="submit"
                    variant="destructive"
                    loading={busy === 'deactivate'}
                    iconName="UserX"
                  >
                    Deactivate my agent code &amp; ID
                  </Button>
                </>
              )}
            </form>
          </section>
        </>
      )}
    </div>
  );
};

export default AgentSettingsPanel;
