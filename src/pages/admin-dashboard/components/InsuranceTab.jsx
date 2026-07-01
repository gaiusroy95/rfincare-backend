import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import CardLogoFields from '../../../components/admin/CardLogoFields';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { bankService } from '../../../services/apiServices';
import { insuranceService } from '../../../services/insuranceService';
import { resolveBankLogoUrl } from '../../../utils/bankBranding';
import {
  INSURANCE_SEGMENTS,
  getCategoriesForSegment,
  getCategoryLabel,
  getSegmentLabel,
} from '../../../constants/insuranceMarketplace';
import { formatPremiumRange, formatSumInsuredRange } from '../../../utils/insuranceFilters';

const EMPTY = {
  insurerId: '', insurerName: '', name: '', description: '', logoUrl: '',
  segment: 'life', categories: [],
  premiumFrom: '', premiumTo: '', sumInsuredFrom: '', sumInsuredTo: '',
  coverageTermYears: '', waitingPeriodDays: '', claimSettlementRatio: '', cashlessHospitals: '',
  taxBenefit80c: false, taxBenefit80d: false,
  supportsNewPolicy: true, supportsRenewal: false, supportsClaimAssistance: false,
  newPolicyUrl: '', renewalUrl: '', claimAssistanceUrl: '',
  featuresText: '', benefitsText: '', highlights: '', displayPriority: '0', status: 'active',
};

const InsuranceTab = () => {
  const [products, setProducts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });

  const bankOptions = useMemo(() => [
    { value: '', label: '— Select insurer —' },
    ...banks.map((b) => ({ value: b.id, label: b.name })),
  ], [banks]);

  const categoryOptions = getCategoriesForSegment(form.segment);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [list, bankList] = await Promise.all([
        insuranceService.listAll(),
        bankService.getAllBanks().catch(() => []),
      ]);
      setProducts(Array.isArray(list) ? list : []);
      setBanks(Array.isArray(bankList) ? bankList : []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setEditingId(null); setPendingLogoFile(null); setForm({ ...EMPTY }); };

  const startEdit = (p) => {
    setEditingId(p.id);
    setPendingLogoFile(null);
    setForm({
      insurerId: p.insurerId || '', insurerName: p.insurerName || '', name: p.name || '',
      description: p.description || '', logoUrl: p.logoUrl || '', segment: p.segment || 'life',
      categories: [...(p.categories || [])],
      premiumFrom: p.premiumFrom != null ? String(p.premiumFrom) : '',
      premiumTo: p.premiumTo != null ? String(p.premiumTo) : '',
      sumInsuredFrom: p.sumInsuredFrom != null ? String(p.sumInsuredFrom) : '',
      sumInsuredTo: p.sumInsuredTo != null ? String(p.sumInsuredTo) : '',
      coverageTermYears: p.coverageTermYears != null ? String(p.coverageTermYears) : '',
      waitingPeriodDays: p.waitingPeriodDays != null ? String(p.waitingPeriodDays) : '',
      claimSettlementRatio: p.claimSettlementRatio != null ? String(p.claimSettlementRatio) : '',
      cashlessHospitals: p.cashlessHospitals != null ? String(p.cashlessHospitals) : '',
      taxBenefit80c: Boolean(p.taxBenefit80c), taxBenefit80d: Boolean(p.taxBenefit80d),
      supportsNewPolicy: p.supportsNewPolicy !== false,
      supportsRenewal: Boolean(p.supportsRenewal),
      supportsClaimAssistance: Boolean(p.supportsClaimAssistance),
      newPolicyUrl: p.newPolicyUrl || '', renewalUrl: p.renewalUrl || '',
      claimAssistanceUrl: p.claimAssistanceUrl || '',
      featuresText: (p.features || []).join('\n'),
      benefitsText: (p.benefits || []).join('\n'),
      highlights: p.highlights || '',
      displayPriority: String(p.displayPriority ?? 0),
      status: p.status || 'active',
    });
  };

  const toggleCategory = (slug) => {
    setForm((prev) => {
      const set = new Set(prev.categories || []);
      if (set.has(slug)) set.delete(slug); else set.add(slug);
      return { ...prev, categories: [...set] };
    });
  };

  const buildPayload = () => ({
    insurerId: form.insurerId || null,
    insurerName: form.insurerName.trim(),
    name: form.name.trim(),
    description: form.description.trim() || null,
    logoUrl: form.logoUrl.trim() || null,
    segment: form.segment,
    categories: form.categories,
    premiumFrom: form.premiumFrom !== '' ? Number(form.premiumFrom) : null,
    premiumTo: form.premiumTo !== '' ? Number(form.premiumTo) : null,
    sumInsuredFrom: form.sumInsuredFrom !== '' ? Number(form.sumInsuredFrom) : null,
    sumInsuredTo: form.sumInsuredTo !== '' ? Number(form.sumInsuredTo) : null,
    coverageTermYears: form.coverageTermYears !== '' ? Number(form.coverageTermYears) : null,
    waitingPeriodDays: form.waitingPeriodDays !== '' ? Number(form.waitingPeriodDays) : null,
    claimSettlementRatio: form.claimSettlementRatio !== '' ? Number(form.claimSettlementRatio) : null,
    cashlessHospitals: form.cashlessHospitals !== '' ? Number(form.cashlessHospitals) : null,
    taxBenefit80c: form.taxBenefit80c,
    taxBenefit80d: form.taxBenefit80d,
    supportsNewPolicy: form.supportsNewPolicy,
    supportsRenewal: form.supportsRenewal,
    supportsClaimAssistance: form.supportsClaimAssistance,
    newPolicyUrl: form.newPolicyUrl.trim() || null,
    renewalUrl: form.renewalUrl.trim() || null,
    claimAssistanceUrl: form.claimAssistanceUrl.trim() || null,
    features: insuranceService.formatListField(form.featuresText),
    benefits: insuranceService.formatListField(form.benefitsText),
    highlights: form.highlights.trim() || null,
    displayPriority: Number(form.displayPriority) || 0,
    status: form.status,
  });

  const handleSave = async () => {
    if (!form.insurerName.trim() || !form.name.trim()) {
      setError('Insurer name and plan name are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = buildPayload();
      if (pendingLogoFile && !editingId) payload.logoUrl = null;
      let id = editingId;
      if (editingId) await insuranceService.update(editingId, payload);
      else { const created = await insuranceService.create(payload); id = created?.id; }
      if (id && pendingLogoFile) await insuranceService.uploadLogo(id, pendingLogoFile);
      resetForm();
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this insurance product?')) return;
    try {
      await insuranceService.remove(id);
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">Insurance Marketplace</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage life, health, and motor insurance plans with services and comparison attributes.</p>
      </div>
      {error ? <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div> : null}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-card border rounded-xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          <h3 className="font-semibold">{editingId ? 'Edit plan' : 'Add plan'}</h3>
          <Select label="Insurer" options={bankOptions} value={form.insurerId} onChange={(id) => {
            const bank = banks.find((b) => b.id === id);
            setForm((f) => ({ ...f, insurerId: id, insurerName: bank?.name || f.insurerName }));
          }} />
          <Input label="Insurer name" value={form.insurerName} onChange={(e) => setForm((f) => ({ ...f, insurerName: e.target.value }))} required />
          <Input label="Plan name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <Select label="Segment" value={form.segment} onChange={(v) => setForm((f) => ({ ...f, segment: v, categories: [] }))} options={INSURANCE_SEGMENTS.map((s) => ({ value: s.slug, label: s.label }))} />
          <div>
            <p className="text-sm font-medium mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => (
                <button key={cat.slug} type="button" onClick={() => toggleCategory(cat.slug)} className={`text-xs px-3 py-1.5 rounded-full border font-medium ${(form.categories || []).includes(cat.slug) ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>{cat.label}</button>
              ))}
            </div>
          </div>
          <CardLogoFields logoUrl={form.logoUrl} cardId={editingId} cardName={form.name} onLogoUrlChange={(logoUrl) => setForm((f) => ({ ...f, logoUrl }))} onPendingFile={setPendingLogoFile} onError={setError} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Premium from (₹)" type="number" value={form.premiumFrom} onChange={(e) => setForm((f) => ({ ...f, premiumFrom: e.target.value }))} />
            <Input label="Premium to (₹)" type="number" value={form.premiumTo} onChange={(e) => setForm((f) => ({ ...f, premiumTo: e.target.value }))} />
            <Input label="Sum insured from" type="number" value={form.sumInsuredFrom} onChange={(e) => setForm((f) => ({ ...f, sumInsuredFrom: e.target.value }))} />
            <Input label="Sum insured to" type="number" value={form.sumInsuredTo} onChange={(e) => setForm((f) => ({ ...f, sumInsuredTo: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Coverage term (years)" type="number" value={form.coverageTermYears} onChange={(e) => setForm((f) => ({ ...f, coverageTermYears: e.target.value }))} />
            <Input label="Waiting period (days)" type="number" value={form.waitingPeriodDays} onChange={(e) => setForm((f) => ({ ...f, waitingPeriodDays: e.target.value }))} />
            <Input label="Claim settlement %" type="number" value={form.claimSettlementRatio} onChange={(e) => setForm((f) => ({ ...f, claimSettlementRatio: e.target.value }))} />
            <Input label="Cashless hospitals" type="number" value={form.cashlessHospitals} onChange={(e) => setForm((f) => ({ ...f, cashlessHospitals: e.target.value }))} />
          </div>
          <div className="space-y-2 border rounded-lg p-3">
            <Checkbox label="Tax benefit 80C" checked={form.taxBenefit80c} onChange={(e) => setForm((f) => ({ ...f, taxBenefit80c: e?.target?.checked }))} />
            <Checkbox label="Tax benefit 80D" checked={form.taxBenefit80d} onChange={(e) => setForm((f) => ({ ...f, taxBenefit80d: e?.target?.checked }))} />
            <Checkbox label="New Policy service" checked={form.supportsNewPolicy} onChange={(e) => setForm((f) => ({ ...f, supportsNewPolicy: e?.target?.checked }))} />
            <Checkbox label="Renewal service" checked={form.supportsRenewal} onChange={(e) => setForm((f) => ({ ...f, supportsRenewal: e?.target?.checked }))} />
            <Checkbox label="Claim Assistance service" checked={form.supportsClaimAssistance} onChange={(e) => setForm((f) => ({ ...f, supportsClaimAssistance: e?.target?.checked }))} />
          </div>
          <Input label="New policy URL" value={form.newPolicyUrl} onChange={(e) => setForm((f) => ({ ...f, newPolicyUrl: e.target.value }))} />
          <Input label="Renewal URL" value={form.renewalUrl} onChange={(e) => setForm((f) => ({ ...f, renewalUrl: e.target.value }))} />
          <Input label="Claim assistance URL" value={form.claimAssistanceUrl} onChange={(e) => setForm((f) => ({ ...f, claimAssistanceUrl: e.target.value }))} />
          <Input label="Highlights" value={form.highlights} onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value }))} />
          <textarea className="w-full min-h-[80px] rounded-lg border px-3 py-2 text-sm" placeholder="Features (one per line)" value={form.featuresText} onChange={(e) => setForm((f) => ({ ...f, featuresText: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Display priority" type="number" value={form.displayPriority} onChange={(e) => setForm((f) => ({ ...f, displayPriority: e.target.value }))} />
            <Select label="Status" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update' : 'Add plan'}</Button>
            {editingId ? <Button variant="outline" onClick={resetForm}>Cancel</Button> : null}
          </div>
        </div>
        <div className="space-y-3 max-h-[85vh] overflow-y-auto">
          <h3 className="font-semibold">Published plans ({products.length})</h3>
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {products.map((p) => (
            <div key={p.id} className="bg-card border rounded-xl p-4 space-y-2">
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.insurerName} · {getSegmentLabel(p.segment)}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-muted">{p.status}</span>
              </div>
              <p className="text-xs text-muted-foreground">{formatPremiumRange(p)} · {formatSumInsuredRange(p)}</p>
              <div className="flex flex-wrap gap-1">
                {(p.categories || []).map((slug) => <span key={slug} className="text-[10px] px-1.5 py-0.5 bg-muted rounded">{getCategoryLabel(slug)}</span>)}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(p)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsuranceTab;
