import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient, setAccessToken } from '../../lib/apiClient';
import { OAUTH_RETURN_PATH_KEY } from '../../services/authService';

const OAUTH_ERROR_MESSAGES = {
  invalid_state: 'Sign-in was interrupted. Please try again.',
  not_configured: 'This sign-in provider is not configured. Ask admin to enable it under System → OAuth.',
  no_user_id: 'Could not read your account from the provider. Try another sign-in method.',
  not_registered:
    'No application found for this email. Please complete an eligibility/application on Rfincare first, then sign in with Google.',
  staff_account: 'This email is registered as staff. Use the staff login page instead.',
  account_inactive: 'Your account is inactive. Please contact support.',
  no_email: 'We could not get your email from the provider. Allow email permission and try again.',
  token_exchange_failed:
    'OAuth failed — check that redirect URI in admin matches Google/Microsoft console exactly.',
};

const OAuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Signing you in...');

  useEffect(() => {
    const finish = async () => {
      const error = params.get('error');
      let returnPath = '/customer-dashboard';
      try {
        returnPath = sessionStorage.getItem(OAUTH_RETURN_PATH_KEY) || returnPath;
        sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY);
      } catch {
        /* ignore */
      }

      if (error) {
        const decoded = decodeURIComponent(error);
        navigate('/customer-login', {
          replace: true,
          state: {
            error: OAUTH_ERROR_MESSAGES[decoded] || OAUTH_ERROR_MESSAGES[error] || `Sign-in failed (${decoded})`,
          },
        });
        return;
      }

      const token = params.get('accessToken');
      if (!token) {
        navigate('/customer-login', { replace: true, state: { error: 'Sign-in did not complete.' } });
        return;
      }

      setAccessToken(token);
      try {
        const meRes = await apiClient.get('/auth/me');
        const role = meRes?.data?.profile?.role || meRes?.data?.user?.role;
        if (role && role !== 'customer') {
          setMessage('Redirecting to your dashboard...');
          const roleRoutes = {
            admin: '/admin-dashboard',
            super_admin: '/admin-dashboard',
            employee: '/employee-portal',
            agent: '/agent-dashboard',
          };
          navigate(roleRoutes[role] || returnPath, { replace: true });
          return;
        }
        navigate(returnPath, { replace: true });
      } catch {
        navigate(returnPath, { replace: true });
      }
    };

    finish();
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

export default OAuthCallback;
