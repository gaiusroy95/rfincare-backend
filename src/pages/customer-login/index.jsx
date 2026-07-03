import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getWrongPortalMessage, resolveLoginRole } from '../../lib/portalLoginUtils';
import { usePortalLoginRedirect } from '../../hooks/usePortalLoginRedirect';
import { openAssessmentOrEligibilityFirst } from '../../utils/eligibilityGate';
import PortalLoginLayout from '../../components/layout/PortalLoginLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import OAuthProviderButtons from '../customer-registration-portal/components/OAuthProviderButtons';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signOut, loading: authLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
  }, [location.state]);

  usePortalLoginRedirect('customer');

  const handleSignIn = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError?.message || 'Login failed');
        setLoading(false);
        return;
      }

      const role = resolveLoginRole(data);
      if (role !== 'customer') {
        await signOut();
        setError(getWrongPortalMessage(role, 'customer'));
        setLoading(false);
        return;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleSignUp = (e) => {
    e?.preventDefault();
    const leadMeta = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.replace(/\D/g, '').slice(-10),
    };
    try {
      sessionStorage.setItem('rfincare_registration_prefill', JSON.stringify(leadMeta));
    } catch {
      /* sessionStorage optional */
    }
    openAssessmentOrEligibilityFirst(navigate, {
      state: { leadMeta },
    });
  };

  if (authLoading) {
    return (
      <PortalLoginLayout title="Loading…" subtitle="" accent="customer">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-brand-green)]" />
        </div>
      </PortalLoginLayout>
    );
  }

  return (
    <PortalLoginLayout
      title={isSignUp ? 'Create Account' : 'Customer Login'}
      subtitle={isSignUp ? 'Complete assessment to register' : 'Apply for loans and track your applications'}
      accent="customer"
      footer={(
        <p>
          Not a customer?{' '}
          <button type="button" onClick={() => navigate('/agent-login')} className="text-[var(--color-brand-green)] font-semibold hover:underline">Agent login</button>
          {' · '}
          <button type="button" onClick={() => navigate('/homepage')} className="text-[var(--color-brand-green)] font-semibold hover:underline">Back to home</button>
        </p>
      )}
    >

        {/* Assessment Notice (only for sign up) */}
        {isSignUp && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
            <Icon name="Info" size={20} color="#2563eb" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Assessment Required</p>
              <p className="text-xs text-blue-700 mt-1">
                New customers must complete a mandatory assessment questionnaire before registration.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <Icon name="AlertCircle" size={20} color="#dc2626" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!isSignUp && (
          <OAuthProviderButtons oauthReturnPath="/customer-dashboard" />
        )}

        {/* Login/Signup Form */}
        <form className="mt-8 space-y-6" onSubmit={isSignUp ? handleSignUp : handleSignIn}>
          <div className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e?.target?.value)}
                    placeholder="Enter your full name"
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e?.target?.value)}
                    placeholder="Enter your phone number"
                    className="w-full"
                  />
                </div>
              </>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e?.target?.value)}
                placeholder="customer@example.com"
                className="w-full"
              />
            </div>
            {!isSignUp && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e?.target?.value)}
                    placeholder="Enter your password"
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} color="#6b7280" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            className="w-full rf-btn-primary"
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignUp ? 'Continue to Assessment' : 'Sign In'}
          </Button>
        </form>

        {/* Toggle Sign In/Sign Up */}
        <div className="text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-sm text-[var(--color-brand-green)] hover:underline font-medium"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'New customer? Create Account'}
          </button>
        </div>
    </PortalLoginLayout>
  );
};

export default CustomerLogin;