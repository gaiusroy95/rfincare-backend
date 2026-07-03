import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getWrongPortalMessage, resolveLoginRole } from '../../lib/portalLoginUtils';
import { usePortalLoginRedirect } from '../../hooks/usePortalLoginRedirect';
import PortalLoginLayout from '../../components/layout/PortalLoginLayout';
import PortalLoginForm from '../../components/auth/PortalLoginForm';
import Icon from '../../components/AppIcon';

const AgentLogin = () => {
  const navigate = useNavigate();
  const { signIn, signOut, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  usePortalLoginRedirect('agent');

  const handleSubmit = async (e) => {
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
      if (role !== 'agent') {
        await signOut();
        setError(getWrongPortalMessage(role, 'agent'));
        setLoading(false);
      }
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <PortalLoginLayout title="Loading…" accent="agent">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-brand-green)]" />
        </div>
      </PortalLoginLayout>
    );
  }

  return (
    <PortalLoginLayout
      title="Agent Login"
      subtitle="Manage clients, leads, and track your commissions"
      accent="agent"
      footer={(
        <p>
          <button type="button" onClick={() => navigate('/login-page')} className="text-[var(--color-brand-green)] font-semibold hover:underline">All portal logins</button>
          {' · '}
          <button type="button" onClick={() => navigate('/customer-login')} className="text-[var(--color-brand-green)] font-semibold hover:underline">Customer login</button>
        </p>
      )}
    >
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-4">
          <Icon name="AlertCircle" size={20} color="#dc2626" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      ) : null}

      <PortalLoginForm
        email={email}
        password={password}
        showPassword={showPassword}
        loading={loading}
        onEmailChange={(e) => setEmail(e.target.value)}
        onPasswordChange={(e) => setPassword(e.target.value)}
        onTogglePassword={() => setShowPassword((v) => !v)}
        onSubmit={handleSubmit}
        submitLabel="Sign In as Agent"
        emailPlaceholder="agent@rfincare.com"
      />
    </PortalLoginLayout>
  );
};

export default AgentLogin;
