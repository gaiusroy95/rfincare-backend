import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import RoleSelector from './components/RoleSelector';
import PasswordChangeModal from './components/PasswordChangeModal';
import OAuthProviderButtons from '../customer-registration-portal/components/OAuthProviderButtons';

import Header from '../../components/ui/Header';

export default function AuthenticationManagementCenter() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [selectedRole, setSelectedRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (user && userProfile?.role) {
      const roleRoutes = {
        admin: '/admin-dashboard',
        super_admin: '/admin-dashboard',
        agent: '/agent-dashboard',
        employee: '/employee-portal',
        customer: '/customer-dashboard'
      };
      navigate(roleRoutes?.[userProfile?.role] || '/customer-dashboard');
    }
  }, [user, userProfile, navigate]);

  const handleSignIn = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authService?.signIn(email, password);
      
      if (result?.error) {
        setError(result?.error?.message || 'Sign in failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Verify role matches selection
      if (result?.data?.profile?.role !== selectedRole) {
        await authService?.signOut();
        setError(`Invalid credentials for ${selectedRole} role. Please select the correct role.`);
        setLoading(false);
        return;
      }

      // Check if password change is required
      if (result?.data?.profile?.passwordChangeRequired) {
        setShowPasswordChange(true);
        setLoading(false);
        return;
      }

      // Navigate based on role - CUSTOMER gets priority
      const roleRoutes = {
        customer: '/customer-dashboard',
        admin: '/admin-dashboard',
        super_admin: '/admin-dashboard',
        agent: '/agent-dashboard',
        employee: '/employee-portal'
      };

      const targetRoute = roleRoutes?.[result?.data?.profile?.role] || '/customer-dashboard';
      navigate(targetRoute, { replace: true });
    } catch (err) {
      setError(err?.message || 'Sign in failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate customer signup only
      if (selectedRole !== 'customer') {
        setError('Only customers can sign up through this portal. Other roles require admin approval.');
        setLoading(false);
        return;
      }

      const signupData = {
        email,
        fullName,
        phone,
        password,
        oauthProvider: 'email'
      };

      const result = await authService?.signUpCustomer(signupData);
      
      if (result?.error) {
        setError(result?.error?.message || 'Sign up failed. Please try again.');
        setLoading(false);
        return;
      }

      // Show success message and redirect to login
      setError('');
      setMode('login');
      setPassword('');
      alert('Sign up successful! Please log in with your credentials.');
      setLoading(false);
    } catch (err) {
      setError(err?.message || 'Sign up failed. Please try again.');
      setLoading(false);
    }
  };

  const handleOAuthSignup = (provider, providerData) => {
    // Redirect to full registration portal for OAuth signup
    navigate('/customer-registration-portal');
  };

  const handlePasswordChangeSuccess = () => {
    setShowPasswordChange(false);
    // Navigate after successful password change
    const roleRoutes = {
      customer: '/customer-dashboard',
      admin: '/admin-dashboard',
      super_admin: '/admin-dashboard',
      agent: '/agent-dashboard',
      employee: '/employee-portal'
    };
    navigate(roleRoutes?.[selectedRole] || '/customer-dashboard', { replace: true });
  };

  const demoCredentials = {
    admin: { email: 'redfin26@loanplatform.com', password: 'Pass@2026', username: 'Redfin26' },
    agent: { email: 'agent@loanplatform.com', password: 'Agent@123' },
    employee: { email: 'employee@loanplatform.com', password: 'Employee@123' },
    customer: { email: 'customer@example.com', note: 'Pending admin approval' }
  };

  const currentDemo = demoCredentials?.[selectedRole];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {mode === 'login' ? 'Authentication Management Center' : 'Customer Sign Up'}
          </h1>
          <p className="text-blue-200">
            {mode === 'login' ? 'Secure multi-level access control' : 'Create your customer account'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Mode Toggle for Customer */}
          {selectedRole === 'customer' && (
            <div className="mb-6 flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  mode === 'login' ?'bg-white text-blue-600 shadow-sm' :'text-gray-600 hover:text-gray-900'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  mode === 'signup' ?'bg-white text-blue-600 shadow-sm' :'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Role Selector - Only show in login mode */}
          {mode === 'login' && (
            <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedRole === 'customer' ? 'User ID / Email' : 'Username or Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e?.target?.value)}
                    placeholder={
                      selectedRole === 'customer' ?'Enter your user ID or email' :'Enter username or email'
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e?.target?.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Sign In as {selectedRole?.charAt(0)?.toUpperCase() + selectedRole?.slice(1)}
                  </>
                )}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && selectedRole === 'customer' && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Sign Up Method</h3>
                <p className="text-sm text-gray-600">Sign up with email provider or basic details</p>
              </div>

              {/* OAuth Provider Buttons */}
              <OAuthProviderButtons
                onProviderSelect={handleOAuthSignup}
                onEmailSignup={() => {}} // Keep in same form
              />

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or fill basic details</span>
                </div>
              </div>

              {/* Basic Details Form */}
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e?.target?.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e?.target?.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email ID</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e?.target?.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e?.target?.value)}
                      placeholder="Create a strong password"
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Account...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          )}

          {/* Demo Credentials - Only show in login mode */}
          {mode === 'login' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials for {selectedRole?.charAt(0)?.toUpperCase() + selectedRole?.slice(1)}:</p>
              {currentDemo?.username && (
                <p className="text-sm text-blue-800 mb-1">
                  <strong>Username:</strong> {currentDemo?.username}
                </p>
              )}
              {currentDemo?.email && (
                <p className="text-sm text-blue-800 mb-1">
                  <strong>Email:</strong> {currentDemo?.email}
                </p>
              )}
              {currentDemo?.password && (
                <p className="text-sm text-blue-800">
                  <strong>Password:</strong> {currentDemo?.password}
                </p>
              )}
              {currentDemo?.note && (
                <p className="text-sm text-yellow-700 mt-2">
                  <strong>Note:</strong> {currentDemo?.note}
                </p>
              )}
              {(selectedRole === 'admin' || selectedRole === 'agent' || selectedRole === 'employee') && (
                <p className="text-xs text-blue-600 mt-2">
                  You can sign in using either username or email
                </p>
              )}
            </div>
          )}

          {/* Footer Links */}
          {mode === 'login' && selectedRole === 'customer' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need more options?{' '}
                <button
                  onClick={() => navigate('/customer-registration-portal')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Full Registration Portal
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-blue-200">
            <Lock className="w-4 h-4 inline mr-1" />
            Secured with enterprise-grade encryption
          </p>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <PasswordChangeModal
          role={selectedRole}
          onCancel={() => setShowPasswordChange(false)}
          onSuccess={handlePasswordChangeSuccess}
        />
      )}
    </div>
  );
}