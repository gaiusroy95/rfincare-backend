import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../contexts/AuthContext';

const CustomerProfilePanel = ({ onSaved }) => {
  const { user, userProfile, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    avatarUrl: '',
  });

  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    phone: '',
    avatarUrl: '',
  });

  const [touched, setTouched] = useState({
    fullName: false,
    phone: false,
    avatarUrl: false,
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile?.fullName || userProfile?.full_name || '',
        phone: userProfile?.phone || '',
        avatarUrl: userProfile?.avatarUrl || userProfile?.avatar_url || '',
      });
    }
  }, [userProfile]);

  const validateFullName = (value) => {
    if (!value?.trim()) return 'Full name is required';
    if (value?.trim()?.length < 2) return 'Full name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(value)) return 'Full name can only contain letters and spaces';
    return '';
  };

  const validatePhone = (value) => {
    if (!value?.trim()) return '';
    const digitsOnly = value?.replace(/[^0-9]/g, '');
    if (digitsOnly?.length !== 10) return 'Phone number must be exactly 10 digits';
    if (!/^[6-9]/.test(digitsOnly)) return 'Indian phone numbers must start with 6, 7, 8, or 9';
    return '';
  };

  const validateAvatarUrl = (value) => {
    if (!value?.trim()) return '';
    try {
      new URL(value);
      if (!/^https?:\/\//i.test(value)) return 'URL must start with http:// or https://';
      return '';
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let fieldError = '';
    if (name === 'fullName') fieldError = validateFullName(value);
    else if (name === 'phone') fieldError = validatePhone(value);
    else if (name === 'avatarUrl') fieldError = validateAvatarUrl(value);

    setFieldErrors((prev) => ({ ...prev, [name]: fieldError }));
    setError('');
    setSuccess('');
  };

  const handleBlur = (e) => {
    const { name } = e?.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const isFieldValid = (fieldName) =>
    touched?.[fieldName] && formData?.[fieldName]?.trim() && !fieldErrors?.[fieldName];

  const isFieldInvalid = (fieldName) => touched?.[fieldName] && fieldErrors?.[fieldName];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');
    setTouched({ fullName: true, phone: true, avatarUrl: true });

    const fullNameError = validateFullName(formData?.fullName);
    const phoneError = validatePhone(formData?.phone);
    const avatarUrlError = validateAvatarUrl(formData?.avatarUrl);

    setFieldErrors({
      fullName: fullNameError,
      phone: phoneError,
      avatarUrl: avatarUrlError,
    });

    if (fullNameError || phoneError || avatarUrlError) {
      setError('Please fix the errors before submitting');
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await updateProfile({
        full_name: formData?.fullName?.trim(),
        phone: formData?.phone?.trim(),
        avatar_url: formData?.avatarUrl?.trim(),
      });
      if (updateError) throw updateError;
      setSuccess('Profile updated successfully!');
      onSaved?.();
    } catch (err) {
      setError(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="rf-filter-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formData?.avatarUrl && !fieldErrors?.avatarUrl ? (
            <div className="flex justify-center">
              <img
                src={formData.avatarUrl}
                alt="Profile avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-[var(--color-brand-green)]"
                onError={(e) => {
                  e.target.src = 'https://img.rocket.new/generatedImages/rocket_gen_img_186600153-1763296403185.png';
                }}
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
              Full Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your full name"
              className={
                isFieldInvalid('fullName')
                  ? 'border-destructive'
                  : isFieldValid('fullName')
                    ? 'border-green-500'
                    : ''
              }
              required
            />
            {isFieldInvalid('fullName') ? (
              <p className="text-xs text-destructive mt-1">{fieldErrors.fullName}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
              Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="10-digit mobile number"
              className={isFieldInvalid('phone') ? 'border-destructive' : ''}
            />
            {isFieldInvalid('phone') ? (
              <p className="text-xs text-destructive mt-1">{fieldErrors.phone}</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Used for OTP and important notifications</p>
            )}
          </div>

          <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-foreground mb-2">
              Avatar URL
            </label>
            <Input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              value={formData.avatarUrl}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="https://example.com/photo.jpg"
              className={isFieldInvalid('avatarUrl') ? 'border-destructive' : ''}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={userProfile?.email || user?.email}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>

          {error ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700 flex items-center gap-2">
              <Icon name="CheckCircle" size={18} />
              {success}
            </div>
          ) : null}

          <Button type="submit" className="rf-btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CustomerProfilePanel;
