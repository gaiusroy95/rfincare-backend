import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import PasswordChangeWithOtpForm from '../../../components/security/PasswordChangeWithOtpForm';
import { employeeProfileService, resolveAvatarUrl } from '../../../services/employeeProfileService';
import { useAuth } from '../../../contexts/AuthContext';

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

const EmployeeSettingsPanel = () => {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const photoRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profile = await employeeProfileService.getProfile();
      setData(profile);
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
    'https://img.rocket.new/generatedImages/rocket_gen_img_1b80e6770-1763297889591.png';

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy('photo');
    setMessage('');
    setError('');
    try {
      const res = await employeeProfileService.uploadPhoto(file);
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

  return (
    <div className="max-w-2xl space-y-6">
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
          <Section title="Profile photo" description="Shown on your employee portal." icon="User">
            <div className="flex items-center gap-4">
              <img
                src={avatarSrc}
                alt={data?.profile?.fullName || userProfile?.full_name || 'Employee'}
                className="w-20 h-20 rounded-full object-cover border-4 border-employee-primary/20"
              />
              <div>
                <p className="font-semibold text-foreground">
                  {data?.profile?.fullName || userProfile?.full_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data?.profile?.employeeCode || 'Employee'}
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
            title="Change password"
            description={`Enter your passwords, then verify with an OTP sent to ${data?.maskedMobile || 'your registered mobile'}.`}
            icon="Smartphone"
          >
            <PasswordChangeWithOtpForm
              otpLabel="Mobile OTP"
              onRequestOtp={() => employeeProfileService.requestPasswordResetOtp()}
              onConfirm={({ currentPassword, newPassword, otp }) =>
                employeeProfileService.confirmPasswordReset(otp, newPassword, currentPassword)
              }
              onSuccess={() => {
                setMessage('Password changed. Signing you out…');
                setTimeout(async () => {
                  await signOut();
                  localStorage.removeItem('authToken');
                  navigate('/employee-login');
                }, 1500);
              }}
            />
          </Section>
        </>
      )}
    </div>
  );
};

export default EmployeeSettingsPanel;
