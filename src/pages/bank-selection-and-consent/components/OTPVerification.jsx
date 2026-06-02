import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const OTPVerification = ({ phoneNumber, email, onVerify, onResend, isVerifying }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/?.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value?.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs?.current?.[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e?.key === 'Backspace' && !otp?.[index] && index > 0) {
      inputRefs?.current?.[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e?.preventDefault();
    const pastedData = e?.clipboardData?.getData('text')?.slice(0, 6);
    if (!/^\d+$/?.test(pastedData)) return;

    const newOtp = pastedData?.split('')?.concat(Array(6)?.fill(''))?.slice(0, 6);
    setOtp(newOtp);
    inputRefs?.current?.[Math.min(pastedData?.length, 5)]?.focus();
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    setTimer(120);
    setCanResend(false);
    onResend();
    inputRefs?.current?.[0]?.focus();
  };

  const handleVerify = () => {
    const otpValue = otp?.join('');
    if (otpValue?.length === 6) {
      onVerify(otpValue);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const isComplete = otp?.every((digit) => digit !== '');

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon name="Smartphone" size={32} className="text-primary" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
          Verify Your Identity
        </h3>
        <p className="text-sm md:text-base text-muted-foreground">
          We've sent a 6-digit verification code to
        </p>
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-center gap-2 text-sm md:text-base font-medium text-foreground">
            <Icon name="Phone" size={16} className="text-primary" />
            <span>{phoneNumber}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm md:text-base font-medium text-foreground">
            <Icon name="Mail" size={16} className="text-primary" />
            <span>{email}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-2 md:gap-3">
        {otp?.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e?.target?.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-10 h-12 md:w-12 md:h-14 text-center text-lg md:text-xl font-semibold border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-card text-foreground"
            autoFocus={index === 0}
          />
        ))}
      </div>
      <div className="text-center space-y-3">
        {!canResend ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Icon name="Clock" size={16} />
            <span>Resend code in {formatTime(timer)}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <Icon name="RefreshCw" size={16} />
            Resend OTP
          </button>
        )}

        <p className="text-xs text-muted-foreground">
          Didn't receive the code? Check your spam folder or try resending.
        </p>
      </div>
      <Button
        variant="default"
        size="lg"
        fullWidth
        onClick={handleVerify}
        disabled={!isComplete || isVerifying}
        loading={isVerifying}
        iconName="ShieldCheck"
        iconPosition="left"
      >
        Verify & Continue
      </Button>
      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
        <Icon name="Info" size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          For security purposes, this OTP is valid for 10 minutes. Enter the code to confirm your identity and proceed with your loan application.
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;