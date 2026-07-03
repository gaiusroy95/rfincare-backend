import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Key, Shield, History } from 'lucide-react';
import MarketingPageShell from '../../components/layout/MarketingPageShell';
import PasswordChangeWithOtpForm from '../../components/security/PasswordChangeWithOtpForm';
import { authService } from '../../services/authService';
import PasswordHistoryList from './components/PasswordHistoryList';
import SessionManagement from './components/SessionManagement';

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
      admin: 'bg-[var(--color-brand-green-dark)] text-white',
      super_admin: 'bg-[var(--color-brand-green-dark)] text-white',
      agent: 'bg-[var(--color-brand-green)] text-white',
      employee: 'bg-emerald-600 text-white',
      customer: 'bg-[var(--color-brand-green)] text-white',
    };
    return colors?.[role] || 'bg-gray-600 text-white';
  };

  const tabClass = (tab) =>
    `px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? 'border-[var(--color-brand-green)] text-[var(--color-brand-green-dark)]'
        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
    }`;

  return (
    <MarketingPageShell
      title="Password Management"
      subtitle="Change your password with OTP verification and manage active sessions"
    >
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rf-filter-card mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-[var(--color-brand-green)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <p className="font-semibold text-foreground">{userProfile?.full_name || user?.email}</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${getRoleColor(userProfile?.role)}`}>
              {userProfile?.role?.replace('_', ' ')?.toUpperCase()}
            </div>
          </div>

          <div className="rf-filter-card mb-6 p-0 overflow-hidden">
            <nav className="flex -mb-px border-b border-border">
              <button type="button" onClick={() => setActiveTab('change-password')} className={tabClass('change-password')}>
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Change Password
                </div>
              </button>
              <button type="button" onClick={() => setActiveTab('history')} className={tabClass('history')}>
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Password History
                </div>
              </button>
              <button type="button" onClick={() => setActiveTab('sessions')} className={tabClass('sessions')}>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Active Sessions
                </div>
              </button>
            </nav>
          </div>

          {activeTab === 'change-password' && (
            <div className="rf-filter-card">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold mb-2">Change Your Password</h2>
                <p className="text-sm text-muted-foreground mb-6">
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
      </section>
    </MarketingPageShell>
  );
};

export default PasswordManagementSystem;
