import React, { useEffect, useMemo, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { getRuntimeEnv } from '../../lib/runtimeConfig';
import { insuranceService } from '../../services/insuranceService';
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

let razorpayScriptPromise = null;

function ensureRazorpayScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Browser unavailable'));
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (razorpayScriptPromise) return razorpayScriptPromise;
  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Could not load Razorpay checkout'));
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
}

export default function InsurancePurchaseModal({
  open,
  onClose,
  product,
  profile,
  onPurchaseComplete,
}) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);

  const defaultPremium = useMemo(
    () => String(product?.premiumFrom || product?.premiumTo || ''),
    [product],
  );

  useEffect(() => {
    if (!open) return;
    setError('');
    setStatus(null);
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
  }, [open, profile, defaultPremium]);

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
        return next;
      }
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
    return null;
  };

  const handleCheckout = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const razorpayKeyId = getRuntimeEnv('VITE_RAZORPAY_KEY_ID') || import.meta.env?.VITE_RAZORPAY_KEY_ID || '';
    if (!razorpayKeyId) {
      setError('Razorpay key is not configured yet.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await ensureRazorpayScript();
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
      });

      const instance = new window.Razorpay({
        key: razorpayKeyId,
        amount: checkout.razorpay.amount,
        currency: checkout.razorpay.currency,
        name: 'Rfincare',
        description: `${product.name} - ${product.insurerName}`,
        order_id: checkout.razorpay.id,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        notes: {
          purchaseOrderId: checkout.orderId,
        },
        theme: { color: '#f97316' },
        handler: async () => {
          setStatus({
            id: checkout.orderId,
            paymentStatus: 'processing',
            insurerPushStatus: 'processing',
            productName: product.name,
            insurerName: product.insurerName,
          });
          await pollStatus(checkout.orderId, checkout.publicToken);
        },
        modal: {
          ondismiss: async () => {
            const latest = await insuranceService.getPurchaseStatus(checkout.orderId, checkout.publicToken).catch(() => null);
            if (latest) {
              setStatus(latest);
              onPurchaseComplete?.(latest);
            }
          },
        },
      });
      instance.open();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not start insurance checkout');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
      <div className="w-full max-w-3xl bg-card rounded-2xl border border-border shadow-xl mt-8">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="text-xl font-bold">Buy on Rfincare</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {product.name} · {product.insurerName} · {formatPremiumRange(product)}
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="p-5 space-y-5">
          {error ? <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div> : null}
          {status ? (
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

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleCheckout} loading={busy}>
              Pay with Razorpay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
