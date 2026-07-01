import React, { useRef, useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { applicationAuthService } from '../../../services/applicationAuthService';
import EligibilityResultSummary from './EligibilityResultSummary';

const AUTH_METHODS = [
  { id: 'otp', label: 'OTP verification', icon: 'Smartphone', description: 'Verify with a code sent to your mobile' },
  { id: 'signature', label: 'Signature', icon: 'PenLine', description: 'Draw or upload your signature' },
];

const ConsentSignatureForm = ({
  formData,
  errors,
  onChange,
  onSignatureChange,
  onOtpVerified,
  eligibilityResult,
}) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const authMethod = formData?.submitAuthMethod || 'signature';
  const signatureMode = formData?.signatureMode || 'draw';
  const phone = (formData?.phone || '').replace(/\D/g, '').slice(-10);
  const fullName = [formData?.firstName, formData?.middleName, formData?.lastName].filter(Boolean).join(' ');

  useEffect(() => {
    if (authMethod !== 'signature' || signatureMode !== 'draw') return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    return undefined;
  }, [authMethod, signatureMode]);

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!isDrawing || !canvasRef.current) return;
    setIsDrawing(false);
    onSignatureChange(canvasRef.current.toDataURL('image/png'));
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    onSignatureChange('');
  };

  const handleAuthMethodChange = (method) => {
    onChange('submitAuthMethod', method);
    onChange('otpVerified', false);
    setOtp('');
    setOtpSent(false);
    setOtpError('');
    if (method === 'otp') {
      onSignatureChange('');
    }
  };

  const handleSendOtp = async () => {
    setOtpError('');
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      setOtpError('Enter a valid mobile number in Personal details (step 1).');
      return;
    }
    if (!formData?.email) {
      setOtpError('Enter your email in Personal details (step 1).');
      return;
    }
    setOtpLoading(true);
    try {
      await applicationAuthService.requestOtp({ phone, email: formData.email });
      setOtpSent(true);
      onChange('otpVerified', false);
    } catch (err) {
      setOtpError(err?.response?.data?.error || err?.message || 'Could not send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    if (otp.length !== 6) {
      setOtpError('Enter the 6-digit OTP.');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await applicationAuthService.verifyOtp({
        phone,
        otp,
        email: formData.email,
        fullName,
      });
      onChange('otpVerified', true);
      onOtpVerified?.(res);
    } catch (err) {
      setOtpError(err?.response?.data?.error || 'Invalid or expired OTP');
      onChange('otpVerified', false);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setOtpError('Please upload an image file (PNG, JPG).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setOtpError('Signature image must be under 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onSignatureChange(reader.result);
      setOtpError('');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <EligibilityResultSummary result={eligibilityResult} compact />
      <div className="p-4 md:p-6 bg-muted rounded-lg border border-border">
        <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Icon name="ShieldCheck" size={20} className="text-primary" />
          Final consent &amp; verification
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose how you want to confirm and submit your application.
        </p>

        <Checkbox
          label="I confirm all information is accurate and authorize Rfincare to process my application"
          checked={formData?.consentSignatureAgreed}
          onChange={(e) => onChange('consentSignatureAgreed', e?.target?.checked)}
          error={errors?.consentSignatureAgreed}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AUTH_METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => handleAuthMethodChange(m.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              authMethod === m.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon name={m.icon} size={18} className={authMethod === m.id ? 'text-primary' : 'text-muted-foreground'} />
              <span className="font-semibold text-sm text-foreground">{m.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{m.description}</p>
          </button>
        ))}
      </div>

      {authMethod === 'otp' && (
        <div className="p-5 border border-border rounded-lg space-y-4 bg-card">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <Icon name="Smartphone" size={18} className="text-primary" />
            OTP authentication
          </h4>
          <p className="text-sm text-muted-foreground">
            We will send a 6-digit code to <strong>{phone ? `+91 ${phone}` : 'your mobile'}</strong>
            {formData?.email ? ` and link it to ${formData.email}` : ''}.
          </p>

          {formData?.otpVerified ? (
            <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg text-sm text-success">
              <Icon name="CheckCircle2" size={18} />
              Mobile verified. You can submit your application.
            </div>
          ) : (
            <>
              {otpSent && (
                <Input
                  label="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  maxLength={6}
                  error={errors?.otpVerified}
                />
              )}
              {otpError && <p className="text-sm text-destructive">{otpError}</p>}
              <div className="flex flex-wrap gap-3">
                {!otpSent ? (
                  <Button type="button" onClick={handleSendOtp} loading={otpLoading}>
                    Send OTP
                  </Button>
                ) : (
                  <>
                    <Button type="button" onClick={handleVerifyOtp} loading={otpLoading} disabled={otp.length !== 6}>
                      Verify OTP
                    </Button>
                    <Button type="button" variant="ghost" onClick={handleSendOtp} disabled={otpLoading}>
                      Resend OTP
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {authMethod === 'signature' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onChange('signatureMode', 'draw');
                onSignatureChange('');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                signatureMode === 'draw' ? 'border-primary bg-primary/10 text-primary' : 'border-border'
              }`}
            >
              Draw signature
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('signatureMode', 'upload');
                onSignatureChange('');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                signatureMode === 'upload' ? 'border-primary bg-primary/10 text-primary' : 'border-border'
              }`}
            >
              Upload signature
            </button>
          </div>

          {signatureMode === 'draw' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Draw your signature <span className="text-destructive">*</span>
                </label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Icon name="Eraser" size={14} />
                  Clear
                </button>
              </div>
              <div
                className={`relative rounded-lg border-2 bg-white overflow-hidden ${
                  errors?.customerSignature ? 'border-destructive' : 'border-border'
                }`}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-40 md:h-48 touch-none cursor-crosshair"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={endDraw}
                />
                {!formData?.customerSignature && (
                  <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground pointer-events-none">
                    Sign here with mouse or finger
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Upload signature image <span className="text-destructive">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  errors?.customerSignature ? 'border-destructive' : 'border-border'
                }`}
              >
                {formData?.customerSignature ? (
                  <div className="space-y-3">
                    <img
                      src={formData.customerSignature}
                      alt="Uploaded signature"
                      className="max-h-32 mx-auto object-contain"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Change image
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-primary hover:underline flex flex-col items-center gap-2 w-full"
                  >
                    <Icon name="Upload" size={24} />
                    Click to upload PNG or JPG (max 2 MB)
                  </button>
                )}
              </div>
            </div>
          )}

          {errors?.customerSignature && (
            <p className="text-xs text-destructive">{errors.customerSignature}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Signed by: <strong>{fullName || 'Applicant'}</strong> — Date:{' '}
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}

      <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="Shield" size={20} className="text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-muted-foreground">
            Clicking &quot;Submit Application&quot; will finalize your pre-qualification assessment. You can track
            status and upload additional documents from your customer dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsentSignatureForm;
