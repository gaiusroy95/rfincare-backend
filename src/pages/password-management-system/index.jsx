import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Key, Shield, History } from 'lucide-react';
import PasswordChangeWithOtpForm from '../../components/security/PasswordChangeWithOtpForm';
import { authService } from '../../services/authService';
import PasswordHistoryList from './components/PasswordHistoryList';
import SessionManagement from './components/SessionManagement';

import Header from '../../components/ui/Header';

const PasswordManagementSystem = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('change-password');

  useEffect(() => {
    if (activeTab === 'history') {
      loadPasswordHistory();
    }
  }, [activeTab]);

  const loadPasswordHistory = async () => {
    const { data, error } = await authService?.getPasswordHistory();
    if (!error && data) {
      setPasswordHistory(data);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-admin-primary text-white',
      super_admin: 'bg-purple-600 text-white',
      agent: 'bg-agent-primary text-white',
      employee: 'bg-employee-primary text-white',
      customer: 'bg-primary text-white',
    };
    return colors?.[role] || 'bg-gray-600 text-white';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Header />
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Password Management</h1>
                <p className="text-gray-600 mt-1">Change your password with OTP verification</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${getRoleColor(userProfile?.role)}`}>
              {userProfile?.role?.replace('_', ' ')?.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('change-password')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'change-password'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Change Password
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Password History
                </div>
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'sessions'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Active Sessions
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'change-password' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Change Your Password</h2>
              <p className="text-sm text-gray-600 mb-6">
                Enter your current and new password, then click Change password. An OTP will be sent
                to your registered email — enter it to complete the change.
              </p>
              <PasswordChangeWithOtpForm
                otpLabel="Email OTP"
                onRequestOtp={() => authService.requestPasswordResetOtp('email')}
                onConfirm={({ currentPassword, newPassword, otp }) =>
                  authService.confirmPasswordResetOtp(otp, newPassword, currentPassword)
                }
                onSuccess={async () => {
                  await signOut();
                  navigate('/customer-login', {
                    state: { message: 'Password updated. Please sign in with your new password.' },
                  });
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'history' && <PasswordHistoryList history={passwordHistory} />}

        {activeTab === 'sessions' && <SessionManagement userId={user?.id} />}
      </div>
    </div>
  );
};

export default PasswordManagementSystem;
