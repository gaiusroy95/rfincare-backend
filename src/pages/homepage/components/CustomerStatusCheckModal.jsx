import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { homepageService } from '../../../services/homepageService';

const CustomerStatusCheckModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('status');
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({
    applicationNumber: '',
    email: '',
    phone: '',
    channel: 'email',
  });
  const [otp, setOtp] = useState('');
  const [result, setResult] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetFlow = () => {
    setStep('form');
    setOtp('');
    setResult(null);
    setResumeUrl('');
    setError('');
  };

  const switchMode = (next) => {
    setMode(next);
    resetFlow();
  };

  const requestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'status') {
        await homepageService.requestStatusOtp({
          email: formData.email,
          phone: formData.phone,
          channel: formData.channel,
        });
      } else {
        await homepageService.requestDraftRecoveryOtp({
          email: formData.email,
          phone: formData.phone,
          channel: formData.channel,
        });
      }
      setStep('otp');
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'status') {
        const data = await homepageService.verifyStatusCheck({
          email: formData.email,
          otp,
          applicationNumber: formData.applicationNumber,
        });
        setResult(data.application);
        setStep('result');
      } else {
        const data = await homepageService.verifyDraftRecovery({
          email: formData.email,
          phone: formData.phone,
          otp,
          frontendOrigin: window.location.origin,
        });
        setResumeUrl(data.resumeUrl);
        setStep('resume');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="button"
      tabIndex={-1}
      aria-label="Close application status modal"
    >
      <div
        className="bg-card rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {mode === 'status' ? 'Check Application Status' : 'Continue Saved Application'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            className={`flex-1 text-sm py-2 rounded-lg border ${
              mode === 'status' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'
            }`}
            onClick={() => switchMode('status')}
          >
            Track status
          </button>
          <button
            type="button"
            className={`flex-1 text-sm py-2 rounded-lg border ${
              mode === 'resume' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'
            }`}
            onClick={() => switchMode('resume')}
          >
            Continue application
          </button>
        </div>

        {error && <p className="text-sm text-destructive mb-3">{error}</p>}

        {step === 'form' && (
          <form onSubmit={requestOtp} className="space-y-4">
            {mode === 'status' && (
              <Input
                label="Application Number"
                value={formData.applicationNumber}
                onChange={(e) => setFormData({ ...formData, applicationNumber: e.target.value })}
                required
              />
            )}
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Mobile number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Select
              label="OTP via"
              value={formData.channel}
              onChange={(v) => setFormData({ ...formData, channel: v })}
              options={[
                { value: 'email', label: 'Email' },
                { value: 'sms', label: 'SMS' },
                { value: 'whatsapp', label: 'WhatsApp' },
              ]}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Sending…' : 'Send OTP'}
            </Button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={verify} className="space-y-4">
            <Input
              label="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Verifying…' : mode === 'status' ? 'Verify & View Status' : 'Verify & Continue'}
            </Button>
            <button
              type="button"
              className="text-sm text-muted-foreground underline w-full text-center"
              onClick={() => setStep('form')}
            >
              Change details
            </button>
          </form>
        )}

        {step === 'result' && result && (
          <div className="space-y-3">
            <p>
              <strong>Application:</strong> {result.applicationNumber}
            </p>
            <p>
              <strong>Status:</strong> {result.status}
            </p>
            {result.eligibilityStatus && (
              <p>
                <strong>Eligibility:</strong> {result.eligibilityStatus}
              </p>
            )}
            {result.statusNotes && (
              <p className="text-sm text-muted-foreground">{result.statusNotes}</p>
            )}
            <Button onClick={() => navigate('/customer-login')} className="w-full">
              Sign in for full dashboard
            </Button>
          </div>
        )}

        {step === 'resume' && resumeUrl && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your saved application is ready. This link is valid for a limited time and can be used once.
            </p>
            <Button
              className="w-full"
              onClick={() => {
                const path = resumeUrl.startsWith('http')
                  ? new URL(resumeUrl).pathname
                  : resumeUrl;
                navigate(path);
                onClose();
              }}
            >
              Open my application
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                navigator.clipboard?.writeText(resumeUrl);
                setError('');
              }}
            >
              Copy continue link
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerStatusCheckModal;
