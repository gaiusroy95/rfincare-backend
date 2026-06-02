import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { adminService } from '../../../services/adminService';

const ApplicationDeleteModal = ({
  isOpen,
  onClose,
  applicationIds = [],
  applications = [],
  adminEmail = '',
  onDeleted,
}) => {
  const [step, setStep] = useState('confirm');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSentTo, setOtpSentTo] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setStep('confirm');
      setOtp('');
      setError('');
      setOtpSentTo('');
    }
  }, [isOpen]);

  if (!isOpen || applicationIds.length === 0) return null;

  const selectedApps = applications.filter((a) => applicationIds.includes(a.id));

  const handleSendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await adminService.requestDeleteApplicationsOtp();
      setOtpSentTo(res.email || adminEmail);
      setStep('otp');
      setOtp('');
    } catch (err) {
      setError(err?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP from your email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await adminService.confirmDeleteApplications(applicationIds, otp);
      onDeleted?.();
      onClose();
    } catch (err) {
      setError(err?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-lg w-full border border-border shadow-xl">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Trash2" size={22} className="text-destructive" />
            <h2 className="text-lg font-bold text-foreground">Delete applications</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" disabled={loading}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            This permanently removes {applicationIds.length} application
            {applicationIds.length > 1 ? 's' : ''} and related documents. This cannot be undone.
          </p>

          <ul className="max-h-40 overflow-y-auto rounded-lg border border-border bg-muted/30 divide-y divide-border text-sm">
            {selectedApps.slice(0, 8).map((app) => (
              <li key={app.id} className="px-3 py-2 flex justify-between gap-2">
                <span className="font-medium text-foreground truncate">{app.customerName}</span>
                <span className="text-muted-foreground shrink-0">{app.loanType}</span>
              </li>
            ))}
            {selectedApps.length > 8 && (
              <li className="px-3 py-2 text-muted-foreground">
                +{selectedApps.length - 8} more…
              </li>
            )}
          </ul>

          {step === 'confirm' && (
            <p className="text-sm text-foreground">
              Email OTP will be sent to your admin account
              {adminEmail ? (
                <>
                  {' '}
                  (<strong>{adminEmail}</strong>)
                </>
              ) : (
                ''
              )}{' '}
              before deletion proceeds.
            </p>
          )}

          {step === 'otp' && (
            <div className="space-y-2">
              <p className="text-sm text-success">
                OTP sent to {otpSentTo || adminEmail || 'your registered email'}.
              </p>
              <Input
                label="Email OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit code"
                maxLength={6}
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              {error}
            </p>
          )}
        </div>

        <div className="border-t border-border p-4 flex flex-wrap gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {step === 'confirm' ? (
            <Button variant="destructive" onClick={handleSendOtp} disabled={loading} iconName="Mail">
              {loading ? 'Sending OTP…' : 'Send OTP to email'}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep('confirm')} disabled={loading}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={loading || otp.length !== 6}
                iconName="Trash2"
              >
                {loading ? 'Deleting…' : 'Confirm delete'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDeleteModal;
