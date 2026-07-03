import React, { useEffect, useMemo, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../AppIcon';
import { mutualFundService } from '../../services/mutualFundService';
import { getAgentAttributionPayload } from '../../utils/agentAttribution';
import { formatPercent } from '../../utils/mutualFundFilters';

const DEFAULT_FORM = {
  fullName: '',
  email: '',
  phone: '',
  sipAmount: '',
  sipDay: '1',
  tenureYears: '10',
};

export default function MutualFundSipModal({
  open,
  onClose,
  fund,
  profile,
  initialSipAmount,
  onComplete,
}) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const minSip = useMemo(
    () => Number(fund?.minSipAmount || fund?.min_sip_amount || 500),
    [fund],
  );

  useEffect(() => {
    if (!open || !fund) return;
    setError('');
    setResult(null);
    setForm({
      fullName: profile?.fullName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      sipAmount: String(initialSipAmount || minSip),
      sipDay: '1',
      tenureYears: '10',
    });
  }, [open, fund, profile, initialSipAmount, minSip]);

  if (!open || !fund) return null;

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!form.fullName.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!form.phone.trim()) return 'Phone is required.';
    const amount = Number(form.sipAmount);
    if (!Number.isFinite(amount) || amount < minSip) {
      return `Minimum SIP amount is ₹${minSip.toLocaleString('en-IN')}.`;
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const checkout = await mutualFundService.startSipCheckout({
        fundId: fund.id,
        sipAmount: Number(form.sipAmount),
        sipDay: Number(form.sipDay) || 1,
        tenureYears: Number(form.tenureYears) || null,
        customer: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        },
        demographicData: {
          productCategory: profile?.productCategory || null,
          productLabel: profile?.productLabel || null,
        },
        sourceProfile: profile || {},
        ...getAgentAttributionPayload(),
      });
      setResult(checkout);
      onComplete?.(checkout);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not start SIP checkout');
    } finally {
      setBusy(false);
    }
  };

  const handleContinueInvest = () => {
    const url = result?.investUrl || fund.investUrl;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">Start SIP</p>
            <h2 className="text-xl font-bold mt-1">{fund.name}</h2>
            <p className="text-sm text-muted-foreground">{fund.amcName}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <Icon name="X" size={20} />
          </button>
        </div>

        {result ? (
          <div className="p-6 space-y-4">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
              <Icon name="CheckCircle2" size={40} className="mx-auto text-emerald-600 mb-2" />
              <p className="font-semibold text-emerald-900">SIP mandate created</p>
              <p className="text-sm text-emerald-800 mt-1">
                ₹{Number(result.sipAmount).toLocaleString('en-IN')}/month on day {result.sipDay || form.sipDay}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete your investment on the AMC portal to activate the SIP mandate.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {(result.investUrl || fund.investUrl) && (
                <Button className="flex-1" onClick={handleContinueInvest}>
                  Continue on AMC site
                  <Icon name="ExternalLink" size={16} className="ml-2" />
                </Button>
              )}
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-3 text-xs">
              {fund.returns3y != null && (
                <span className="px-2 py-1 rounded-full bg-muted">
                  3Y returns: <strong>{formatPercent(fund.returns3y)}</strong>
                </span>
              )}
              <span className="px-2 py-1 rounded-full bg-muted">
                Min SIP: <strong>₹{minSip.toLocaleString('en-IN')}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full name" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
              <Input label="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="sm:col-span-2" />
              <Input
                label="Monthly SIP (₹)"
                type="number"
                min={minSip}
                value={form.sipAmount}
                onChange={(e) => update('sipAmount', e.target.value)}
              />
              <Input
                label="Debit day (1–28)"
                type="number"
                min={1}
                max={28}
                value={form.sipDay}
                onChange={(e) => update('sipDay', e.target.value)}
              />
              <Input
                label="Tenure (years)"
                type="number"
                min={1}
                max={40}
                value={form.tenureYears}
                onChange={(e) => update('tenureYears', e.target.value)}
                className="sm:col-span-2"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={onClose} disabled={busy}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={busy}>
                {busy ? 'Creating mandate…' : 'Start SIP'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
