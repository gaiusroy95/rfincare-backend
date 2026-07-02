import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../AppIcon';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { leadService } from '../../services/leadService';
import { getApiErrorMessage } from '../../lib/apiErrors';
import {
  EDUCATION_OPTIONS,
  GENDER_OPTIONS,
  HABIT_FREQUENCY_OPTIONS,
  INCOME_RANGE_OPTIONS,
  MARKETPLACE_WIZARD_STEPS,
  OCCUPATION_OPTIONS,
  YES_NO_OPTIONS,
} from '../../constants/marketplaceLeadFlow';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const MONTHS = [
  { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' }, { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' }, { value: '05', label: 'May' }, { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' }, { value: '08', label: 'Aug' }, { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' },
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => String(CURRENT_YEAR - 18 - i));

function buildDob(day, month, year) {
  if (!day || !month || !year) return '';
  return `${year}-${month}-${day}`;
}

const MarketplaceLeadWizard = ({
  open,
  onClose,
  onComplete,
  marketplaceType = 'insurance',
  productLabel = '',
  productCategory = '',
  productSegment = null,
}) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSettings, setOtpSettings] = useState({ requireMobileOtp: true, requireEmailOtp: true });
  const submittingRef = useRef(false);

  const [gender, setGender] = useState('male');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [consent, setConsent] = useState(false);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [mobileOtp, setMobileOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [leadId, setLeadId] = useState(null);

  const [occupation, setOccupation] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [education, setEducation] = useState('');
  const [tobaccoUse, setTobaccoUse] = useState('');
  const [tobaccoFrequency, setTobaccoFrequency] = useState('');
  const [alcoholUse, setAlcoholUse] = useState('');
  const [alcoholFrequency, setAlcoholFrequency] = useState('');

  const loanType = marketplaceType === 'mutual_funds' ? 'mutual_funds' : 'insurance';
  const dateOfBirth = buildDob(dobDay, dobMonth, dobYear);
  const normalizedPhone = () => phone.replace(/\D/g, '').slice(-10);

  const headline = useMemo(() => {
    if (marketplaceType === 'mutual_funds') {
      return 'Start investing with personalised fund recommendations';
    }
    return (
      <>
        <span className="text-primary">₹1 Crore</span> life cover starting from{' '}
        <span className="text-primary">₹400/month⁺</span>
      </>
    );
  }, [marketplaceType]);

  useEffect(() => {
    if (!open) return;
    leadService.getOtpSettings().then(setOtpSettings).catch(() => {});
    setStep(0);
    setError('');
    setWarning('');
    setOtpSent(false);
    setOtpVerified(false);
    setLoading(false);
  }, [open]);

  if (!open) return null;

  const stepsRemaining = MARKETPLACE_WIZARD_STEPS.length - step;
  const stepHint =
    step === 0
      ? 'Enter your contact details. We will verify your mobile and email with OTP.'
      : `Just answer ${stepsRemaining} simple question${stepsRemaining === 1 ? '' : 's'} to get more accurate quotes`;

  const validateContact = () => {
    if (!fullName.trim()) return 'Your name is required.';
    if (!email.trim() || !EMAIL_RE.test(email.trim())) return 'Enter a valid email address.';
    if (!normalizedPhone() || !/^[6-9]\d{9}$/.test(normalizedPhone())) {
      return 'Enter a valid 10-digit Indian mobile number.';
    }
    if (!dateOfBirth) return 'Please select your complete date of birth.';
    if (!consent) return 'Please accept the consent to continue.';
    return null;
  };

  const handleSendOtp = async () => {
    setError('');
    setWarning('');
    const validationError = validateContact();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      const res = await leadService.startVerification({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: normalizedPhone(),
        loanType,
        source: `${marketplaceType}_marketplace`,
        consentAccepted: true,
      });
      setLeadId(res?.lead?.id || res?.id || null);
      if (res?.requireMobileOtp !== undefined || res?.requireEmailOtp !== undefined) {
        setOtpSettings({
          requireMobileOtp: res.requireMobileOtp !== false,
          requireEmailOtp: res.requireEmailOtp !== false,
        });
      }
      if (Array.isArray(res?.warnings) && res.warnings.length) setWarning(res.warnings.join(' '));
      setOtpSent(true);
      setMobileOtp('');
      setEmailOtp('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send OTP'));
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (otpSettings.requireMobileOtp && mobileOtp.length !== 6) {
      setError('Enter the 6-digit OTP sent to your mobile.');
      return;
    }
    if (otpSettings.requireEmailOtp && emailOtp.length !== 6) {
      setError('Enter the 6-digit OTP sent to your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await leadService.verifyOtp({
        phone: normalizedPhone(),
        email: email.trim(),
        mobileOtp: otpSettings.requireMobileOtp ? mobileOtp : undefined,
        emailOtp: otpSettings.requireEmailOtp ? emailOtp : undefined,
        leadId,
      });
      setLeadId(res?.lead?.id || leadId);
      setOtpVerified(true);
      setStep(1);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid or expired OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const saveProfileAndComplete = async (profile) => {
    if (leadId) {
      try {
        await leadService.updateLead(leadId, {
          eligibilityData: {
            marketplaceType,
            productCategory,
            productSegment,
            productLabel,
            ...profile,
          },
          status: 'profile_complete',
        });
      } catch {
        // Session still works if API fails
      }
    }
    onComplete?.({
      leadId,
      ...profile,
      productCategory,
      productSegment,
      productLabel,
      marketplaceType,
      verifiedAt: Date.now(),
    });
  };

  const handleNext = async () => {
    setError('');
    if (step === 1 && !occupation) {
      setError('Please choose your occupation type.');
      return;
    }
    if (step === 2 && !annualIncome) {
      setError('Please select your annual income range.');
      return;
    }
    if (step === 3 && !education) {
      setError('Please select your educational qualification.');
      return;
    }
    if (step === 4) {
      if (!tobaccoUse || !alcoholUse) {
        setError('Please answer both health habit questions.');
        return;
      }
      if (tobaccoUse === 'yes' && !tobaccoFrequency) {
        setError('Please select how often you use tobacco.');
        return;
      }
      if (alcoholUse === 'yes' && !alcoholFrequency) {
        setError('Please select how often you consume alcohol.');
        return;
      }
      const profile = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: normalizedPhone(),
        gender,
        dateOfBirth,
        occupation,
        annualIncome,
        education,
        tobaccoUse,
        tobaccoFrequency: tobaccoUse === 'yes' ? tobaccoFrequency : null,
        alcoholUse,
        alcoholFrequency: alcoholUse === 'yes' ? alcoholFrequency : null,
        whatsappUpdates,
      };
      setLoading(true);
      await saveProfileAndComplete(profile);
      setLoading(false);
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError('');
    if (step === 1) return;
    setStep((s) => Math.max(0, s - 1));
  };

  const renderChoiceButtons = (options, value, onChange, columns = 3) => (
    <div className={`grid grid-cols-1 ${columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`py-4 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
            value === opt.value
              ? 'border-primary bg-primary/5 text-primary shadow-sm'
              : 'border-border hover:border-primary/40 text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  const renderRadioList = (options, value, onChange) => (
    <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-muted/40 transition-colors ${
            value === opt.value ? 'bg-primary/5' : ''
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              value === opt.value ? 'border-primary' : 'border-muted-foreground/40'
            }`}
          >
            {value === opt.value ? <span className="w-2.5 h-2.5 rounded-full bg-primary" /> : null}
          </span>
          <span className="text-sm font-medium">{opt.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-card rounded-2xl shadow-2xl border border-border">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b bg-card/95 backdrop-blur">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">
              {productLabel ? `Selected: ${productLabel}` : 'Personalise your quotes'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-muted" aria-label="Close">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-5 md:p-8 space-y-6">
          {step > 0 && (
            <p className="text-center text-xs text-muted-foreground border-b border-dashed pb-4">{stepHint}</p>
          )}

          {step === 0 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">{headline}</h2>
                <div className="flex flex-wrap justify-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Icon name="BadgePercent" size={14} /> Online discount up to 15%
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    <Icon name="Handshake" size={14} /> Lowest price guarantee
                  </span>
                </div>
              </div>

              <div className="flex rounded-xl border border-border p-1 bg-muted/30">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGender(g.value)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      gender === g.value ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <Input label="Your Name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter Your Name" disabled={otpSent && !otpVerified} />
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth</label>
                <div className="grid grid-cols-3 gap-2">
                  <select value={dobDay} onChange={(e) => setDobDay(e.target.value)} disabled={otpSent && !otpVerified} className="h-11 rounded-lg border border-border px-3 text-sm bg-background">
                    <option value="">DD</option>
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={dobMonth} onChange={(e) => setDobMonth(e.target.value)} disabled={otpSent && !otpVerified} className="h-11 rounded-lg border border-border px-3 text-sm bg-background">
                    <option value="">MM</option>
                    {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <select value={dobYear} onChange={(e) => setDobYear(e.target.value)} disabled={otpSent && !otpVerified} className="h-11 rounded-lg border border-border px-3 text-sm bg-background">
                    <option value="">YYYY</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mobile Number</label>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <span className="inline-flex items-center gap-1 px-3 bg-muted text-sm text-muted-foreground border-r border-border shrink-0">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter Mobile Number"
                    disabled={otpSent && !otpVerified}
                    className="flex-1 h-11 px-3 text-sm bg-background outline-none"
                    maxLength={10}
                  />
                </div>
              </div>

              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email Address" disabled={otpSent && !otpVerified} />

              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" disabled={otpSent && !otpVerified} />
                <span className="text-muted-foreground">
                  By continuing, you agree to our Privacy Policy, Terms of Use &amp; Disclaimers.
                </span>
              </label>

              {otpSent && !otpVerified && (
                <div className="space-y-3 p-4 bg-muted/40 rounded-xl border border-border">
                  {otpSettings.requireMobileOtp && (
                    <Input label="OTP sent to mobile" value={mobileOtp} onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" maxLength={6} />
                  )}
                  {otpSettings.requireEmailOtp && (
                    <Input label="OTP sent to email" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" maxLength={6} />
                  )}
                </div>
              )}

              <label className="flex items-center justify-between gap-3 text-sm p-3 rounded-xl border border-border">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="MessageCircle" size={18} className="text-emerald-600" />
                  Get updates on WhatsApp
                </span>
                <input type="checkbox" checked={whatsappUpdates} onChange={(e) => setWhatsappUpdates(e.target.checked)} />
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 text-center">
              <h2 className="text-xl md:text-2xl font-bold">Please choose your occupation type</h2>
              {renderChoiceButtons(OCCUPATION_OPTIONS, occupation, setOccupation)}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl md:text-2xl font-bold text-center">Select your annual income</h2>
              {renderRadioList(INCOME_RANGE_OPTIONS, annualIncome, setAnnualIncome)}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl md:text-2xl font-bold text-center">Select Educational Qualification</h2>
              {renderRadioList(EDUCATION_OPTIONS, education, setEducation)}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-bold text-center">Do you smoke or chew tobacco?</h2>
                <p className="text-sm text-center text-muted-foreground bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                  Select &apos;No&apos; if you haven&apos;t smoked or chewed tobacco in the last 12 months.
                </p>
                {renderChoiceButtons(YES_NO_OPTIONS, tobaccoUse, setTobaccoUse, 2)}
                {tobaccoUse === 'yes' && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-center">How often?</p>
                    {renderChoiceButtons(HABIT_FREQUENCY_OPTIONS, tobaccoFrequency, setTobaccoFrequency)}
                  </div>
                )}
              </div>
              <div className="space-y-3 pt-2 border-t border-dashed">
                <h2 className="text-xl md:text-2xl font-bold text-center">Do you consume alcohol?</h2>
                {renderChoiceButtons(YES_NO_OPTIONS, alcoholUse, setAlcoholUse, 2)}
                {alcoholUse === 'yes' && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-center">How often?</p>
                    {renderChoiceButtons(HABIT_FREQUENCY_OPTIONS, alcoholFrequency, setAlcoholFrequency)}
                  </div>
                )}
              </div>
            </div>
          )}

          {warning && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{warning}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between gap-3 pt-2">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={handleBack} disabled={loading || step === 1}>
                <Icon name="ArrowLeft" size={16} className="mr-1" /> Previous
              </Button>
            ) : (
              <span />
            )}

            {step > 0 && (
              <div className="flex gap-1.5">
                {MARKETPLACE_WIZARD_STEPS.map((s, i) => (
                  <span key={s.key} className={`w-2 h-2 rounded-full ${i === step ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                ))}
              </div>
            )}

            {step === 0 ? (
              !otpSent ? (
                <Button type="button" onClick={handleSendOtp} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white">
                  {loading ? 'Sending…' : 'View Plans'}
                </Button>
              ) : !otpVerified ? (
                <Button type="button" onClick={handleVerifyOtp} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white">
                  {loading ? 'Verifying…' : 'Verify OTP'}
                </Button>
              ) : null
            ) : (
              <Button type="button" onClick={handleNext} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white">
                {loading ? 'Saving…' : step === 4 ? 'Show Plans' : 'Continue'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceLeadWizard;
