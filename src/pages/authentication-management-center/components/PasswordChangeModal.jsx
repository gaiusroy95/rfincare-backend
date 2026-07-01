import React from 'react';
import { X } from 'lucide-react';
import PasswordChangeWithOtpForm from '../../../components/security/PasswordChangeWithOtpForm';
import { authService } from '../../../services/authService';
import { adminProfileService } from '../../../services/adminProfileService';
import { agentProfileService } from '../../../services/agentProfileService';
import { employeeProfileService } from '../../../services/employeeProfileService';

function getPasswordChangeHandlers(role) {
  switch (role) {
    case 'admin':
    case 'super_admin':
      return {
        otpLabel: 'Email OTP',
        onRequestOtp: () => adminProfileService.requestPasswordResetOtp(),
        onConfirm: ({ currentPassword, newPassword, otp }) =>
          adminProfileService.confirmPasswordReset(otp, newPassword, currentPassword),
      };
    case 'agent':
      return {
        otpLabel: 'Email OTP',
        onRequestOtp: () => agentProfileService.requestPasswordResetOtp(),
        onConfirm: ({ currentPassword, newPassword, otp }) =>
          agentProfileService.confirmPasswordReset(otp, newPassword, currentPassword),
      };
    case 'employee':
      return {
        otpLabel: 'Mobile OTP',
        onRequestOtp: () => employeeProfileService.requestPasswordResetOtp(),
        onConfirm: ({ currentPassword, newPassword, otp }) =>
          employeeProfileService.confirmPasswordReset(otp, newPassword, currentPassword),
      };
    case 'customer':
    default:
      return {
        otpLabel: 'Email OTP',
        onRequestOtp: () => authService.requestPasswordResetOtp('email'),
        onConfirm: ({ currentPassword, newPassword, otp }) =>
          authService.confirmPasswordResetOtp(otp, newPassword, currentPassword),
      };
  }
}

export default function PasswordChangeModal({ role = 'customer', onSuccess, onCancel }) {
  const handlers = getPasswordChangeHandlers(role);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Change Password Required</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Enter your current and new password, then click Change password. You will receive an OTP
          to verify before the change is applied.
        </p>

        <PasswordChangeWithOtpForm
          otpLabel={handlers.otpLabel}
          submitButtonLabel="Change password"
          confirmButtonLabel="Verify OTP & change password"
          onRequestOtp={handlers.onRequestOtp}
          onConfirm={handlers.onConfirm}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
