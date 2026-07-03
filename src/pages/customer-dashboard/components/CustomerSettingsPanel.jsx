import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Key, History } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import PasswordChangeWithOtpForm from '../../../components/security/PasswordChangeWithOtpForm';
import { authService } from '../../../services/authService';
import PasswordHistoryList from '../../password-management-system/components/PasswordHistoryList';
import SessionManagement from '../../password-management-system/components/SessionManagement';

const CustomerSettingsPanel = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('change-password');
  const [passwordHistory, setPasswordHistory] = useState([]);

  useEffect(() => {
    if (activeTab === 'history') {
      authService?.getPasswordHistory().then(({ data, error }) => {
        if (!error && data) setPasswordHistory(data);
      });
    }
  }, [activeTab]);

  const tabClass = (tab) =>
    `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? 'border-[var(--color-brand-green)] text-[var(--color-brand-green-dark)]'
        : 'border-transparent text-muted-foreground hover:text-foreground'
    }`;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rf-filter-card p-0 overflow-hidden">
        <nav className="flex border-b border-border">
          <button type="button" onClick={() => setActiveTab('change-password')} className={tabClass('change-password')}>
            <span className="inline-flex items-center gap-2">
              <Key className="w-4 h-4" />
              Change Password
            </span>
          </button>
          <button type="button" onClick={() => setActiveTab('history')} className={tabClass('history')}>
            <span className="inline-flex items-center gap-2">
              <History className="w-4 h-4" />
              Password History
            </span>
          </button>
          <button type="button" onClick={() => setActiveTab('sessions')} className={tabClass('sessions')}>
            <span className="inline-flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Active Sessions
            </span>
          </button>
        </nav>

        <div className="p-6">
          {activeTab === 'change-password' && (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your current and new password. An OTP will be sent to your registered email to confirm the change.
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
            </>
          )}
          {activeTab === 'history' && <PasswordHistoryList history={passwordHistory} />}
          {activeTab === 'sessions' && <SessionManagement userId={user?.id} />}
        </div>
      </div>
    </div>
  );
};

export default CustomerSettingsPanel;
