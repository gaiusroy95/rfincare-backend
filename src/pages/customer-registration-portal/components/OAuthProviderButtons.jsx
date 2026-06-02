import React, { useEffect, useState } from 'react';
import { authService } from '../../../services/authService';
import { apiClient } from '../../../lib/apiClient';
import { Mail } from 'lucide-react';

const ALL_PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    icon: 'https://www.google.com/favicon.ico',
    iconAlt: 'Google',
    color: 'bg-white hover:bg-gray-50 text-gray-900 border-gray-300',
  },
  {
    id: 'microsoft',
    name: 'Microsoft / Outlook',
    icon: 'https://www.microsoft.com/favicon.ico',
    iconAlt: 'Microsoft',
    color: 'bg-white hover:bg-gray-50 text-gray-900 border-gray-300',
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: 'https://www.apple.com/favicon.ico',
    iconAlt: 'Apple',
    color: 'bg-black hover:bg-gray-900 text-white border-black',
  },
];

const OAuthProviderButtons = ({ onProviderSelect, onEmailSignup, oauthReturnPath = '/customer-dashboard' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enabledProviders, setEnabledProviders] = useState([]);

  useEffect(() => {
    apiClient
      .get('/public/oauth-config')
      .then((res) => {
        if (Array.isArray(res.data?.providers)) setEnabledProviders(res.data.providers);
      })
      .catch(() => {});
  }, []);

  const visibleProviders = ALL_PROVIDERS.filter((p) => enabledProviders.includes(p.id));

  const handleOAuthClick = async (provider) => {
    setLoading(true);
    setError('');

    try {
      const { data, error: oauthError } = await authService?.signInWithOAuth(provider?.id, oauthReturnPath);

      if (oauthError) {
        setError(oauthError?.message);
        setLoading(false);
        return;
      }

      if (data?.redirecting) {
        return;
      }

      if (data?.user) {
        onProviderSelect?.(provider?.id, {
          id: data?.user?.id,
          email: data?.user?.email,
          name: data?.user?.user_metadata?.full_name || data?.user?.email?.split('@')?.[0],
        });
      }
    } catch (err) {
      setError(err?.message || 'OAuth sign in failed');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in with email provider</h3>
        <p className="text-sm text-gray-600">
          Use the same email you used when applying with Rfincare
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}

      {visibleProviders.length === 0 ? (
        <p className="text-sm text-gray-500 text-center">
          Social sign-in is not enabled yet. Use email and password, or contact support.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visibleProviders.map((provider) => (
            <button
              key={provider?.id}
              type="button"
              onClick={() => handleOAuthClick(provider)}
              disabled={loading}
              className={`flex items-center justify-center gap-3 px-4 py-3 border rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${provider?.color}`}
            >
              <img src={provider?.icon} alt={provider?.iconAlt} className="w-5 h-5" />
              <span>{provider?.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onEmailSignup}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Mail className="w-5 h-5" />
        <span>Sign up with Email</span>
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};

export default OAuthProviderButtons;
