import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { LOAN_PRODUCTS } from '../../../constants/loanProducts';
import { leadService } from '../../../services/leadService';
import { getApiErrorMessage } from '../../../lib/apiErrors';

const LOAN_OPTIONS = LOAN_PRODUCTS.filter((p) => p.apiKey !== 'credit_card').map((p) => ({
  value: p.apiKey,
  label: p.label,
}));

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  loanType: 'personal_loan',
  notes: '',
  consentAccepted: false,
};

const AgentLeadSubmissionPanel = ({ agentCode, onLeadCreated }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) setError('');
    if (message) setMessage('');
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Customer name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Valid email is required';
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, '').slice(-10))) {
      next.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!form.loanType) next.loanType = 'Select a loan type';
    if (!form.consentAccepted) next.consentAccepted = 'Customer consent is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => ({
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.replace(/\D/g, '').slice(-10),
    loanType: form.loanType,
    source: 'agent_portal',
    consentAccepted: true,
    sourcedAgentCode: agentCode || undefined,
    agentCode: agentCode || undefined,
  });

  const startApplication = (leadMeta) => {
    const slug = form.loanType.replace(/_loan$/, '').replace(/_/g, '-');
    navigate(`/agent/customer-application?loanType=${encodeURIComponent(slug)}`, {
      state: {
        leadMeta: {
          ...leadMeta,
          leadId: leadMeta.leadId,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.replace(/\D/g, '').slice(-10),
          loanType: form.loanType,
          notes: form.notes.trim(),
        },
      },
    });
  };

  const handleCreateLead = async (startApp = false) => {
    if (!validate()) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await leadService.createLead(buildPayload());
      const leadId = res?.lead?.id || res?.id;
      if (form.notes.trim() && leadId) {
        await leadService.updateLead(leadId, {
          eligibilityData: { agentNotes: form.notes.trim() },
        }).catch(() => {});
      }
      setMessage(startApp ? 'Lead saved. Opening application…' : 'Lead created successfully.');
      setForm(EMPTY_FORM);
      onLeadCreated?.();
      if (startApp) {
        startApplication({ leadId });
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create lead. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Icon name="UserPlus" size={20} className="text-[var(--color-brand-green)]" />
            Create Lead &amp; Submit Application
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Capture prospect details, save to your pipeline, and start a loan application on their behalf.
          </p>
        </div>
        {agentCode && (
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start">
            Agent {agentCode}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          name="fullName"
          label="Customer full name"
          value={form.fullName}
          onChange={handleChange}
          error={errors.fullName}
          required
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
          label="Mobile number"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="10-digit number"
          required
        />
        <Select
          label="Loan type"
          value={form.loanType}
          onChange={(value) => {
            setForm((prev) => ({ ...prev, loanType: value }));
            if (errors.loanType) setErrors((prev) => ({ ...prev, loanType: '' }));
          }}
          options={LOAN_OPTIONS}
          error={errors.loanType}
          required
        />
        <div className="md:col-span-2">
          <Input
            name="notes"
            label="Notes (optional)"
            value={form.notes}
            onChange={handleChange}
            placeholder="Purpose, income hint, follow-up notes…"
          />
        </div>
      </div>

      <label className="flex items-start gap-2 mt-4 text-sm text-muted-foreground cursor-pointer">
        <input
          type="checkbox"
          name="consentAccepted"
          checked={form.consentAccepted}
          onChange={handleChange}
          className="mt-1"
        />
        <span>
          Customer has consented to share their details and be contacted for loan products via RFINCARE.
        </span>
      </label>
      {errors.consentAccepted && (
        <p className="text-xs text-destructive mt-1">{errors.consentAccepted}</p>
      )}

      {error && <p className="text-sm text-destructive mt-3">{error}</p>}
      {message && <p className="text-sm text-emerald-700 mt-3">{message}</p>}

      <div className="flex flex-wrap gap-3 mt-5">
        <Button
          className="rf-btn-primary"
          iconName="Save"
          disabled={loading}
          onClick={() => handleCreateLead(false)}
        >
          {loading ? 'Saving…' : 'Create Lead'}
        </Button>
        <Button
          variant="outline"
          iconName="FileText"
          disabled={loading}
          onClick={() => handleCreateLead(true)}
        >
          Create Lead &amp; Submit Application
        </Button>
        <Button
          variant="ghost"
          iconName="ArrowRight"
          onClick={() => navigate('/agent/customer-application')}
        >
          Open application form
        </Button>
      </div>
    </div>
  );
};

export default AgentLeadSubmissionPanel;
