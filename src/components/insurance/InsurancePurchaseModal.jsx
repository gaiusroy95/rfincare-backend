import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../AppIcon';
import { insuranceService } from '../../services/insuranceService';
import { getAgentAttributionPayload } from '../../utils/agentAttribution';
import { formatPremiumRange } from '../../utils/insuranceFilters';

const DEFAULT_FORM = {
  fullName: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  pan: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  nomineeName: '',
  nomineeRelation: '',
  selectedPremium: '',
};

const STEPS = ['Quote', 'Details', 'Payment'];

export default function InsurancePurchaseModal({
  open,
  onClose,
  product,
  profile,
  onPurchaseComplete,
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);
  const [quote, setQuote] = useState(null);
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [proposalBusy, setProposalBusy] = useState(false);
  const [proposal, setProposal] = useState(null);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const defaultPremium = useMemo(
    () => String(product?.premiumFrom || product?.premiumTo || ''),
    [product],
  );

  useEffect(() => {
    if (!open || !product) return;
    setError('');
    setStatus(null);
    setQuote(null);
    setProposal(null);
    setStep(0);
    setCompleted(false);
    setForm({
      fullName: profile?.fullName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      dob: profile?.dateOfBirth || '',
      gender: profile?.gender || '',
      pan: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      nomineeName: '',
      nomineeRelation: '',
      selectedPremium: defaultPremium,
    });
  }, [open, product, profile, defaultPremium]);

  if (!open || !product) return null;

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!form.fullName.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!form.phone.trim()) return 'Phone is required.';
    if (!form.addressLine1.trim()) return 'Address line 1 is required.';
    if (!form.city.trim() || !form.state.trim() || !form.pincode.trim()) return 'Complete address is required.';
    if (!Number(form.selectedPremium)) return 'Selected premium is required.';
    return null;
  };

  const pollStatus = async (orderId, token) => {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const next = await insuranceService.getPurchaseStatus(orderId, token);
      setStatus(next);
      onPurchaseComplete?.(next);
      if (next?.paymentStatus === 'paid' && ['pushed', 'push_failed'].includes(next?.insurerPushStatus)) {
        setCompleted(true);
        setStep(2);
        return next;
      }
      if (next?.paymentStatus === 'paid') {
        setCompleted(true);
        setStep(2);
        return next;
      }
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
    return null;
  };

  const handleFetchQuote = async () => {
    setQuoteBusy(true);
    setError('');
    try {
      const res = await insuranceService.fetchQuote({
        productId: product.id,
        customer: {
          email: form.email.trim(),
          phone: form.phone.trim(),
          dob: form.dob || null,
          gender: form.gender || null,
        },
        demographics: {
          occupation: profile?.occupation || null,
          annualIncome: profile?.annualIncome || null,
          education: profile?.education || null,
          tobaccoUse: profile?.tobaccoUse || null,
          alcoholUse: profile?.alcoholUse || null,
        },
        coverage: {
          sumInsured: product?.sumInsuredFrom || product?.sumInsuredTo || null,
          segment: product?.segment || null,
          category: profile?.productCategory || null,
        },
      });
      setQuote(res);
      if (res?.plans?.length) {
        update('selectedPremium', String(res.plans[0].premium));
      }
      setStep(1);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not fetch quotes');
    } finally {
      setQuoteBusy(false);
    }
  };

  const handleCheckout = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setBusy(true);
    setError('');
    setProposal(null);
    try {
      const checkout = await insuranceService.startPurchaseCheckout({
        productId: product.id,
        selectedPremium: Number(form.selectedPremium),
        customer: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          dob: form.dob || null,
          gender: form.gender || null,
          pan: form.pan.trim() || null,
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim() || null,
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          nomineeName: form.nomineeName.trim() || null,
          nomineeRelation: form.nomineeRelation.trim() || null,
        },
        demographicData: {
          occupation: profile?.occupation || null,
          annualIncome: profile?.annualIncome || null,
          education: profile?.education || null,
          tobaccoUse: profile?.tobaccoUse || null,
          tobaccoFrequency: profile?.tobaccoFrequency || null,
          alcoholUse: profile?.alcoholUse || null,
          alcoholFrequency: profile?.alcoholFrequency || null,
        },
        sourceProfile: profile || {},
        ...getAgentAttributionPayload(),
      });

      const returnUrl = `${window.location.origin}/insurance-marketplace?purchaseId=${checkout.orderId}&purchaseToken=${checkout.publicToken}`;
      setStatus({
        id: checkout.orderId,
        paymentStatus: 'created',
        insurerPushStatus: 'not_started',
        productName: product.name,
        insurerName: product.insurerName,
        publicToken: checkout.publicToken,
      });

      setProposalBusy(true);
      const prop = await insuranceService.createProposal({
        purchaseOrderId: checkout.orderId,
        token: checkout.publicToken,
        quoteId: quote?.quoteId || quote?.quote_id || null,
        returnUrl,
        customer: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          dob: form.dob || null,
          gender: form.gender || null,
          pan: form.pan.trim() || null,
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim() || null,
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          nomineeName: form.nomineeName.trim() || null,
          nomineeRelation: form.nomineeRelation.trim() || null,
        },
        demographics: {
          ...(profile || {}),
          selectedPremium: Number(form.selectedPremium),
        },
      });
      setProposal(prop);
      setStep(2);

      if (prop?.paymentUrl) {
        window.open(prop.paymentUrl, '_blank', 'noopener,noreferrer');
        await pollStatus(checkout.orderId, checkout.publicToken);
      } else {
        setError('Proposal created but no payment URL was returned. Contact support with your order reference.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not start insurance checkout');
    } finally {
      setBusy(false);
      setProposalBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
      <div className="w-full max-w-3xl bg-card rounded-2xl border border-border shadow-xl mt-8 mb-8">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="text-xl font-bold">Buy on Rfincare</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {product.name} · {product.insurerName} · {formatPremiumRange(product)}
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="px-5 pt-4">
          <div className="flex items-center gap-2">
            {STEPS.map((label, idx) => (
              <React.Fragment key={label}>
                <div className={`flex items-center gap-2 text-sm ${idx <= step ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border ${idx <= step ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>
                    {idx + 1}
                  </span>
                  {label}
                </div>
                {idx < STEPS.length - 1 && <div className="flex-1 h-px bg-border min-w-[24px]" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {error ? <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div> : null}

          {completed ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <Icon name="CheckCircle2" size={36} className="text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-foreground">Payment received!</h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {status?.insurerPolicyNumber
                  ? `Your policy number is ${status.insurerPolicyNumber}.`
                  : 'Your insurance purchase is being processed. You will receive confirmation by email.'}
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Button onClick={() => navigate('/customer-dashboard?tab=portfolio')}>
                  View in dashboard
                </Button>
                <Button variant="outline" onClick={onClose}>Close</Button>
              </div>
            </div>
          ) : (
            <>
              {status && step >= 2 ? (
                <div className="p-4 rounded-xl border border-border bg-muted/30">
                  <p className="font-semibold">Purchase status</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Payment: {status.paymentStatus || 'created'} · Insurer: {status.insurerPushStatus || 'not_started'}
                  </p>
                  {status.insurerPolicyNumber ? (
                    <p className="text-sm text-emerald-700 mt-2">Policy number: {status.insurerPolicyNumber}</p>
                  ) : null}
                  {status.failureReason ? (
                    <p className="text-sm text-destructive mt-2">{status.failureReason}</p>
                  ) : null}
                </div>
              ) : null}

              {step === 0 && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-4">
                  <div>
                    <p className="font-semibold">Step 1: Fetch live quotes</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get premium options from {product.insurerName} before you fill details.
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleFetchQuote} loading={quoteBusy}>
                    Fetch quotes
                  </Button>
                </div>
              )}

              {quote?.plans?.length ? (
                <div className="rounded-xl border border-border p-4">
                  <p className="font-semibold">Available premiums</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {quote.plans.map((p) => (
                      <button
                        key={`${p.premium}-${p.label || ''}`}
                        type="button"
                        onClick={() => update('selectedPremium', String(p.premium))}
                        className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                          String(form.selectedPremium) === String(p.premium)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        ₹{Number(p.premium).toLocaleString('en-IN')} / {p.term || 'year'}
                        {p.label ? ` · ${p.label}` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {step >= 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full name" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} required />
                  <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
                  <Input label="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
                  <Input label="Date of birth" type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} />
                  <Input label="Gender" value={form.gender} onChange={(e) => update('gender', e.target.value)} />
                  <Input label="PAN" value={form.pan} onChange={(e) => update('pan', e.target.value.toUpperCase())} />
                  <Input label="Address line 1" value={form.addressLine1} onChange={(e) => update('addressLine1', e.target.value)} required />
                  <Input label="Address line 2" value={form.addressLine2} onChange={(e) => update('addressLine2', e.target.value)} />
                  <Input label="City" value={form.city} onChange={(e) => update('city', e.target.value)} required />
                  <Input label="State" value={form.state} onChange={(e) => update('state', e.target.value)} required />
                  <Input label="Pincode" value={form.pincode} onChange={(e) => update('pincode', e.target.value)} required />
                  <Input label="Selected premium (INR)" type="number" value={form.selectedPremium} onChange={(e) => update('selectedPremium', e.target.value)} required />
                  <Input label="Nominee name" value={form.nomineeName} onChange={(e) => update('nomineeName', e.target.value)} />
                  <Input label="Nominee relation" value={form.nomineeRelation} onChange={(e) => update('nomineeRelation', e.target.value)} />
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                {step === 0 && quote?.plans?.length ? (
                  <Button onClick={() => setStep(1)}>Continue to details</Button>
                ) : null}
                {step >= 1 ? (
                  <Button onClick={handleCheckout} loading={busy || proposalBusy}>
                    Generate proposal & pay
                  </Button>
                ) : null}
              </div>

              {proposal?.paymentUrl && proposal?.paymentMode === 'iframe' ? (
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
                    <p className="font-semibold text-sm">Insurer payment</p>
                    <a className="text-sm font-semibold text-primary" href={proposal.paymentUrl} target="_blank" rel="noreferrer">
                      Open in new tab
                    </a>
                  </div>
                  <iframe title="Insurer payment" src={proposal.paymentUrl} className="w-full h-[520px]" />
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
