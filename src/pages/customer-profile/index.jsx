import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketingPageShell from '../../components/layout/MarketingPageShell';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { user, userProfile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    avatarUrl: ''
  });

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    phone: '',
    avatarUrl: ''
  });

  // Field touched state
  const [touched, setTouched] = useState({
    fullName: false,
    phone: false,
    avatarUrl: false
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile?.fullName || userProfile?.full_name || '',
        phone: userProfile?.phone || '',
        avatarUrl: userProfile?.avatarUrl || userProfile?.avatar_url || ''
      });
    }
  }, [userProfile]);

  // Real-time validation functions
  const validateFullName = (value) => {
    if (!value?.trim()) {
      return 'Full name is required';
    }
    if (value?.trim()?.length < 2) {
      return 'Full name must be at least 2 characters';
    }
    if (!/^[a-zA-Z\s]+$/?.test(value)) {
      return 'Full name can only contain letters and spaces';
    }
    return '';
  };

  const validatePhone = (value) => {
    if (!value?.trim()) {
      return ''; // Phone is optional
    }
    const digitsOnly = value?.replace(/[^0-9]/g, '');
    if (digitsOnly?.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    if (!/^[6-9]/?.test(digitsOnly)) {
      return 'Indian phone numbers must start with 6, 7, 8, or 9';
    }
    return '';
  };

  const validateAvatarUrl = (value) => {
    if (!value?.trim()) {
      return ''; // Avatar URL is optional
    }
    try {
      new URL(value);
      if (!/^https?:\/\//i?.test(value)) {
        return 'URL must start with http:// or https://';
      }
      return '';
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    let error = '';
    if (name === 'fullName') {
      error = validateFullName(value);
    } else if (name === 'phone') {
      error = validatePhone(value);
    } else if (name === 'avatarUrl') {
      error = validateAvatarUrl(value);
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));

    setError('');
    setSuccess('');
  };

  const handleBlur = (e) => {
    const { name } = e?.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const isFieldValid = (fieldName) => {
    return touched?.[fieldName] && formData?.[fieldName]?.trim() && !fieldErrors?.[fieldName];
  };

  const isFieldInvalid = (fieldName) => {
    return touched?.[fieldName] && fieldErrors?.[fieldName];
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');

    // Mark all fields as touched
    setTouched({
      fullName: true,
      phone: true,
      avatarUrl: true
    });

    // Validate all fields
    const fullNameError = validateFullName(formData?.fullName);
    const phoneError = validatePhone(formData?.phone);
    const avatarUrlError = validateAvatarUrl(formData?.avatarUrl);

    setFieldErrors({
      fullName: fullNameError,
      phone: phoneError,
      avatarUrl: avatarUrlError
    });

    // Check if there are any errors
    if (fullNameError || phoneError || avatarUrlError) {
      setError('Please fix the errors before submitting');
      return;
    }

    setSaving(true);

    try {
      // Use AuthContext's updateProfile method which automatically updates the context state
      const { error: updateError } = await updateProfile({
        full_name: formData?.fullName?.trim(),
        phone: formData?.phone?.trim(),
        avatar_url: formData?.avatarUrl?.trim()
      });

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      
      // Redirect back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/customer-dashboard');
      }, 2000);
    } catch (err) {
      setError(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/customer-dashboard');
  };

  if (loading) {
    return (
      <MarketingPageShell title="My Profile" subtitle="Loading your profile…">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Icon name="Loader" size={48} className="animate-spin mx-auto mb-4 text-[var(--color-brand-green)]" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </MarketingPageShell>
    );
  }

  return (
    <MarketingPageShell title="My Profile" subtitle="Update your personal information and contact details">
      <section className="py-10">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ArrowLeft" size={20} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Profile Form */}
        <div className="rf-filter-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Preview */}
            {formData?.avatarUrl && !fieldErrors?.avatarUrl && (
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={formData?.avatarUrl}
                    alt="Profile avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                    onError={(e) => {
                      e.target.src = 'https://img.rocket.new/generatedImages/rocket_gen_img_186600153-1763296403185.png';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                Full Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData?.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  className={`pr-10 ${
                    isFieldValid('fullName') 
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : isFieldInvalid('fullName') 
                      ? 'border-destructive focus:border-destructive focus:ring-destructive' :''
                  }`}
                  required
                />
                {isFieldValid('fullName') && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icon name="CheckCircle" size={20} className="text-green-500" />
                  </div>
                )}
                {isFieldInvalid('fullName') && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icon name="XCircle" size={20} className="text-destructive" />
                  </div>
                )}
              </div>
              {isFieldInvalid('fullName') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {fieldErrors?.fullName}
                </p>
              )}
              {isFieldValid('fullName') && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Icon name="Check" size={14} />
                  Looks good!
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData?.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your 10-digit phone number"
                  className={`pr-10 ${
                    isFieldValid('phone') 
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : isFieldInvalid('phone') 
                      ? 'border-destructive focus:border-destructive focus:ring-destructive' :''
                  }`}
                />
                {isFieldValid('phone') && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icon name="CheckCircle" size={20} className="text-green-500" />
                  </div>
                )}
                {isFieldInvalid('phone') && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icon name="XCircle" size={20} className="text-destructive" />
                  </div>
                )}
              </div>
              {isFieldInvalid('phone') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {fieldErrors?.phone}
                </p>
              )}
              {isFieldValid('phone') && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Icon name="Check" size={14} />
                  Valid Indian phone number
                </p>
              )}
              {!touched?.phone && (
                <p className="text-xs text-muted-foreground mt-1">
                  Format: 10 digits starting with 6, 7, 8, or 9 (e.g., 9876543210)
                </p>
              )}
            </div>

            {/* Avatar URL */}
            <div>
              <label htmlFor="avatarUrl" className="block text-sm font-medium text-foreground mb-2">
                Avatar URL
              </label>
              <div className="relative">
                <Input
                  id="avatarUrl"
                  name="avatarUrl"
                  type="url"
                  value={formData?.avatarUrl}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter image URL for your avatar"
                  className={`pr-10 ${
                    isFieldValid('avatarUrl') 
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : isFieldInvalid('avatarUrl') 
                      ? 'border-destructive focus:border-destructive focus:ring-destructive' :''
                  }`}
                />
                {isFieldValid('avatarUrl') && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icon name="CheckCircle" size={20} className="text-green-500" />
                  </div>
                )}
                {isFieldInvalid('avatarUrl') && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icon name="XCircle" size={20} className="text-destructive" />
                  </div>
                )}
              </div>
              {isFieldInvalid('avatarUrl') && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {fieldErrors?.avatarUrl}
                </p>
              )}
              {isFieldValid('avatarUrl') && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Icon name="Check" size={14} />
                  Valid URL
                </p>
              )}
              {!touched?.avatarUrl && (
                <p className="text-xs text-muted-foreground mt-1">
                  Provide a direct link to your profile picture (HTTPS recommended)
                </p>
              )}
            </div>

            {/* Email (Read-only) */}
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
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                <Icon name="AlertCircle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <Icon name="CheckCircle" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                variant="default"
                className="flex-1 rf-btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Icon name="Loader" size={18} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={18} className="mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-[var(--color-brand-green)] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-900">
              <p className="font-medium mb-1">Profile Information</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Your email address is linked to your account and cannot be changed</li>
                <li>Phone number is used for OTP verification and important notifications</li>
                <li>Avatar URL should be a direct link to an image (HTTPS recommended)</li>
                <li>Fields marked with <span className="text-destructive font-bold">*</span> are required</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      </section>
    </MarketingPageShell>
  );
};

export default CustomerProfile;