import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getWrongPortalMessage, resolveLoginRole } from '../../lib/portalLoginUtils';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const AgentLogin = () => {
  const navigate = useNavigate();
  const { signIn, signOut, user, userProfile, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Redirect if already logged in as agent
    if (user && userProfile?.role === 'agent') {
      navigate('/agent-dashboard');
    }
  }, [user, userProfile, navigate]);

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
        return;
      }

      // Successful agent login
      navigate('/agent-dashboard');
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gray-500 rounded-full flex items-center justify-center mb-4">
            <Icon name="Briefcase" size={32} color="white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Agent Portal</h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage clients and track commissions
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <Icon name="AlertCircle" size={20} color="#dc2626" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                placeholder="agent@rfincare.com"
                className="w-full"
              />
            </div>
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
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In as Agent'}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <button
            onClick={() => navigate('/login-page')}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Back to Login Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentLogin;