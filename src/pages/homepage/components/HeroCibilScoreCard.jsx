import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { homepageService } from '../../../services/homepageService';
import { getApiErrorMessage } from '../../../lib/apiErrors';

const BAND_STYLES = {
  excellent: 'text-emerald-600 bg-emerald-50',
  good: 'text-sky-600 bg-sky-50',
  fair: 'text-amber-600 bg-amber-50',
  needs_improvement: 'text-orange-600 bg-orange-50',
};

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  panNumber: '',
  city: '',
  pincode: '',
  gender: '',
  consentAccepted: false,
};

function scoreArc(score) {
  return Math.min(100, Math.max(0, ((score - 300) / 600) * 100));
}

const HeroCibilScoreCard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('check');
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (formError) setFormError('');
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Valid email required';
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, '').slice(-10))) {
      next.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!form.dateOfBirth) next.dateOfBirth = 'Date of birth is required';
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(form.panNumber.trim())) {
      next.panNumber = 'Enter a valid PAN (e.g. ABCDE1234F)';
    }
    if (!form.city.trim()) next.city = 'City is required';
    if (!/^\d{6}$/.test(form.pincode.trim())) next.pincode = 'Enter a valid 6-digit pincode';
    if (!form.consentAccepted) next.consentAccepted = 'Consent is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFormError('');
    try {
      const data = await homepageService.checkCibilScore({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\D/g, '').slice(-10),
        dateOfBirth: form.dateOfBirth,
        panNumber: form.panNumber.trim().toUpperCase(),
        city: form.city.trim(),
        pincode: form.pincode.trim(),
        gender: form.gender || undefined,
        consentAccepted: true,
      });
      setResult(data);
      setActiveTab('result');
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Could not fetch CIBIL score. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setActiveTab('check');
    setForm(EMPTY_FORM);
    setErrors({});
    setFormError('');
  };

  return (
    <div className="rf-hero-cibil-card">
      <div className="rf-hero-cibil-tabs">
        <button
          type="button"
          className={`rf-hero-cibil-tab ${activeTab === 'check' ? 'rf-hero-cibil-tab--active' : ''}`}
          onClick={() => setActiveTab('check')}
        >
          <Icon name="Gauge" size={14} />
          Check free CIBIL score
        </button>
        {result && (
          <button
            type="button"
            className={`rf-hero-cibil-tab ${activeTab === 'result' ? 'rf-hero-cibil-tab--active' : ''}`}
            onClick={() => setActiveTab('result')}
          >
            Your score
          </button>
        )}
      </div>

      {activeTab === 'result' && result ? (
        <div className="rf-hero-cibil-result">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="3"
                  strokeDasharray={`${(scoreArc(result.creditScore) / 100) * 97.4} 97.4`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                {result.creditScore}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CIBIL Score</p>
              <p className="text-lg font-bold text-foreground">
                {result.creditScore}
                <span className="text-sm font-normal text-muted-foreground">/900</span>
              </p>
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${BAND_STYLES[result.band] || BAND_STYLES.good}`}>
                {result.bandLabel}
              </span>
            </div>
          </div>
          {result.sandboxMode && (
            <p className="text-[10px] text-muted-foreground mt-2">Sandbox preview — bureau credentials not live.</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              onClick={() => navigate('/eligibility-assessment')}
              className="text-xs font-semibold text-[var(--color-brand-green)] hover:underline"
            >
              Check loan eligibility →
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-muted-foreground hover:underline"
            >
              Check again
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rf-hero-cibil-form">
          <p className="text-xs text-muted-foreground mb-3">
            Enter your details to fetch your free CIBIL score securely.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              name="fullName"
              label="Full name"
              value={form.fullName}
              onChange={handleChange}
              error={errors.fullName}
              required
              className="text-xs"
            />
            <Input
              name="email"
              type="email"
              label="Email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <Input
              name="phone"
              type="tel"
              label="Mobile"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="10-digit number"
              required
            />
            <Input
              name="dateOfBirth"
              type="date"
              label="Date of birth"
              value={form.dateOfBirth}
              onChange={handleChange}
              error={errors.dateOfBirth}
              required
            />
            <Input
              name="panNumber"
              label="PAN"
              value={form.panNumber}
              onChange={handleChange}
              error={errors.panNumber}
              placeholder="ABCDE1234F"
              required
            />
            <Select
              label="Gender"
              value={form.gender}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, gender: value }));
                if (errors.gender) setErrors((prev) => ({ ...prev, gender: '' }));
              }}
              options={GENDER_OPTIONS}
              placeholder="Select"
            />
            <Input
              name="city"
              label="City"
              value={form.city}
              onChange={handleChange}
              error={errors.city}
              required
            />
            <Input
              name="pincode"
              label="Pincode"
              value={form.pincode}
              onChange={handleChange}
              error={errors.pincode}
              placeholder="6 digits"
              required
            />
          </div>

          <label className="flex items-start gap-2 mt-3 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              name="consentAccepted"
              checked={form.consentAccepted}
              onChange={handleChange}
              className="mt-0.5"
            />
            <span>
              I consent to Rfincare fetching my credit score from bureau partners and storing my details for eligibility matching.
            </span>
          </label>
          {errors.consentAccepted && (
            <p className="text-xs text-destructive mt-1">{errors.consentAccepted}</p>
          )}
          {formError && <p className="text-xs text-destructive mt-2">{formError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rf-hero-cibil-submit mt-3 w-full"
          >
            {loading ? 'Fetching score…' : 'Get my free CIBIL score'}
          </button>

          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
            <Icon name="Lock" size={12} />
            <span>256-bit encrypted · No impact on score</span>
          </div>
        </form>
      )}
    </div>
  );
};

export default HeroCibilScoreCard;
