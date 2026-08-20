import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { leadService } from '../../../services/leadService';
import { LOAN_PRODUCTS } from '../../../constants/loanProducts';
import { getApiErrorMessage } from '../../../lib/apiErrors';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';
import LeadsTable from '../../../components/leads/LeadsTable';

const LOAN_OPTIONS = LOAN_PRODUCTS.filter((p) => p.apiKey !== 'credit_card').map((p) => ({
  value: p.apiKey,
  label: p.label,
}));

const EMPTY_CUSTOMER = {
  fullName: '',
  email: '',
  phone: '',
  loanType: 'personal_loan',
  notes: '',
  consentAccepted: false,
};

const EMPTY_AGENT = {
  ...EMPTY_CUSTOMER,
  agentUserId: '',
};

/**
 * Employee lead capture — Customer leads + Agent leads.
 * Both sync into Admin → Marketing leads (and agent leads into the agent pipeline).
 */
const EmployeeLeadsTab = ({ embed = false } = {}) => {
  const [mode, setMode] = useState('customer'); // customer | agent
  const [customerForm, setCustomerForm] = useState(EMPTY_CUSTOMER);
  const [agentForm, setAgentForm] = useState(EMPTY_AGENT);
  const [agentOptions, setAgentOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [leadsLoading, setLeadsLoading] = useState(!embed);
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const agentSelectOptions = useMemo(
    () => agentOptions.map((a) => ({ value: a.id, label: a.label || `${a.code} — ${a.name}` })),
    [agentOptions],
  );

  const loadLeads = useCallback(async () => {
    if (embed) return;
    setLeadsLoading(true);
    setError('');
    try {
      const data = await leadService.listLeads({ assignedTo: 'me' });
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load leads');
      setLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  }, [embed]);

  const loadAgents = useCallback(async () => {
    try {
      const list = await leadService.listAgentOptions();
      setAgentOptions(Array.isArray(list) ? list : []);
    } catch {
      setAgentOptions([]);
    }
  }, []);

  useEffect(() => {
    loadLeads();
    loadAgents();
  }, [loadLeads, loadAgents]);

  const activeForm = mode === 'agent' ? agentForm : customerForm;
  const setActiveForm = mode === 'agent' ? setAgentForm : setCustomerForm;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setActiveForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) setError('');
    if (message) setMessage('');
  };

  const handleSelectChange = (name, value) => {
    setActiveForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const form = activeForm;
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Customer name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Valid email is required';
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, '').slice(-10))) {
      next.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!form.loanType) next.loanType = 'Select a loan type';
    if (!form.consentAccepted) next.consentAccepted = 'Customer consent is required';
    if (mode === 'agent' && !form.agentUserId) next.agentUserId = 'Select an agent';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!validate()) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const form = activeForm;
      const selectedAgent = agentOptions.find((a) => a.id === form.agentUserId);
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\D/g, '').slice(-10),
        loanType: form.loanType,
        consentAccepted: true,
        leadKind: mode === 'agent' ? 'agent' : 'customer',
        source: mode === 'agent' ? 'employee_agent_lead' : 'employee_portal',
        ...(mode === 'agent'
          ? {
              agentUserId: form.agentUserId,
              sourcedAgentCode: selectedAgent?.code && selectedAgent.code !== '—'
                ? selectedAgent.code
                : undefined,
              agentCode: selectedAgent?.code && selectedAgent.code !== '—'
                ? selectedAgent.code
                : undefined,
            }
          : {}),
      };
      const res = await leadService.createLead(payload);
      const leadId = res?.id || res?.lead?.id;
      if (form.notes?.trim() && leadId) {
        await leadService
          .updateLead(leadId, { eligibilityData: { employeeNotes: form.notes.trim() } })
          .catch(() => {});
      }
      setMessage(
        mode === 'agent'
          ? 'Agent lead created — visible in Admin Marketing leads and the agent pipeline.'
          : 'Customer lead created — assigned to you and visible in Admin Marketing leads.',
      );
      if (mode === 'agent') setAgentForm(EMPTY_AGENT);
      else setCustomerForm(EMPTY_CUSTOMER);
      await loadLeads();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create lead. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId, status) => {
    setMessage('');
    try {
      await leadService.updateLeadStatus(leadId, status);
      setMessage('Lead status updated.');
      loadLeads();
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Icon name="UserPlus" size={20} className="text-[var(--color-brand-green)]" />
              Create lead
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Capture customer or agent-attributed leads. They sync to Admin → Marketing leads.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <Button
              type="button"
              size="sm"
              variant={mode === 'customer' ? 'default' : 'outline'}
              onClick={() => {
                setMode('customer');
                setErrors({});
                setError('');
                setMessage('');
              }}
            >
              Customer lead
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === 'agent' ? 'default' : 'outline'}
              onClick={() => {
                setMode('agent');
                setErrors({});
                setError('');
                setMessage('');
              }}
            >
              Agent lead
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'agent' && (
            <Select
              label="Assign to agent"
              required
              options={agentSelectOptions}
              value={agentForm.agentUserId}
              onChange={(value) => handleSelectChange('agentUserId', value)}
              error={errors.agentUserId}
              placeholder={agentSelectOptions.length ? 'Select agent' : 'No agents available'}
              searchable
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              name="fullName"
              label="Customer full name"
              value={activeForm.fullName}
              onChange={handleChange}
              error={errors.fullName}
              required
            />
            <Input
              name="email"
              type="email"
              label="Email"
              value={activeForm.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <Input
              name="phone"
              label="Mobile"
              value={activeForm.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="10-digit number"
              required
            />
            <Select
              label="Loan / product type"
              required
              options={LOAN_OPTIONS}
              value={activeForm.loanType}
              onChange={(value) => handleSelectChange('loanType', value)}
              error={errors.loanType}
            />
            <div className="md:col-span-2">
              <Input
                name="notes"
                label="Notes (optional)"
                value={activeForm.notes}
                onChange={handleChange}
                placeholder="Follow-up context for admin / agent"
              />
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              name="consentAccepted"
              checked={activeForm.consentAccepted}
              onChange={handleChange}
              className="mt-1 shrink-0"
            />
            <span className="space-y-1">
              <span className="block">
                Customer consents to Rfincare contacting them about this enquiry and eligibility matching.
              </span>
              <span className="block text-muted-foreground">
                I here by authorized to send notifications via SMS, Email, RCS and other as per terms of
                service &amp; privacy policy.
              </span>
            </span>
          </label>
          {errors.consentAccepted && (
            <p className="text-xs text-destructive">{errors.consentAccepted}</p>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>
          )}
          {message && (
            <div className="p-3 bg-primary/10 text-primary rounded-lg text-sm">{message}</div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={loading} iconName="Save" className="rf-btn-primary">
              {mode === 'agent' ? 'Create agent lead' : 'Create customer lead'}
            </Button>
            {!embed && (
              <Button type="button" variant="outline" onClick={loadLeads}>
                Refresh list
              </Button>
            )}
          </div>
        </form>
      </div>

      {!embed && (
        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-bold">My assigned leads</h2>
            <p className="text-sm text-muted-foreground">
              Leads assigned to you — including customer leads you just created
            </p>
          </div>
          <LeadsTable
            leads={leads}
            loading={leadsLoading}
            showStatusUpdate
            onStatusChange={handleStatusChange}
          />
        </div>
      )}
    </div>
  );
};

export default EmployeeLeadsTab;
