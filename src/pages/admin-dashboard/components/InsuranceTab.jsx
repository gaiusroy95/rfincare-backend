import React, { useEffect, useMemo, useState } from 'react';
import CardLogoFields from '../../../components/admin/CardLogoFields';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { bankService } from '../../../services/apiServices';
import { insuranceService } from '../../../services/insuranceService';
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
  purchaseEnabled: false, purchaseMode: 'redirect', insurerProviderCode: '', insurerProductCode: '',
  insurerPlanCode: '', paymentAccountCode: '', demographicMappingText: '{\n  "source": "marketplaceLeadProfile"\n}',
  featuresText: '', benefitsText: '', highlights: '', displayPriority: '0', status: 'active',
};

const EMPTY_PROVIDER = {
  providerCode: '',
  providerName: '',
  integrationMode: 'generic_api',
  baseUrl: '',
  authType: 'bearer',
  apiKey: '',
  apiSecret: '',
  webhookSecret: '',
  paymentAccountCode: '',
  requestConfigText: '{\n  "purchasePath": "/purchase"\n}',
  status: 'active',
};

function safeParseJson(text, fallback) {
  try {
    return text?.trim() ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

const InsuranceTab = () => {
  const [products, setProducts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingProvider, setSavingProvider] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingProviderId, setEditingProviderId] = useState(null);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [providerForm, setProviderForm] = useState({ ...EMPTY_PROVIDER });

  const bankOptions = useMemo(
    () => [{ value: '', label: '— Select insurer —' }, ...banks.map((b) => ({ value: b.id, label: b.name }))],
    [banks],
  );

  const providerOptions = useMemo(
    () => [{ value: '', label: '— Select provider —' }, ...providers.map((p) => ({ value: p.providerCode, label: `${p.providerName} (${p.providerCode})` }))],
    [providers],
  );

  const categoryOptions = getCategoriesForSegment(form.segment);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [list, bankList, providerList] = await Promise.all([
        insuranceService.listAll(),
        bankService.getAllBanks().catch(() => []),
        insuranceService.listProviderConfigs().catch(() => []),
      ]);
      setProducts(Array.isArray(list) ? list : []);
      setBanks(Array.isArray(bankList) ? bankList : []);
      setProviders(Array.isArray(providerList) ? providerList : []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setPendingLogoFile(null);
    setForm({ ...EMPTY });
  };

  const resetProviderForm = () => {
    setEditingProviderId(null);
    setProviderForm({ ...EMPTY_PROVIDER });
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setPendingLogoFile(null);
    setForm({
      insurerId: p.insurerId || '',
      insurerName: p.insurerName || '',
      name: p.name || '',
      description: p.description || '',
      logoUrl: p.logoUrl || '',
      segment: p.segment || 'life',
      categories: [...(p.categories || [])],
      premiumFrom: p.premiumFrom != null ? String(p.premiumFrom) : '',
      premiumTo: p.premiumTo != null ? String(p.premiumTo) : '',
      sumInsuredFrom: p.sumInsuredFrom != null ? String(p.sumInsuredFrom) : '',
      sumInsuredTo: p.sumInsuredTo != null ? String(p.sumInsuredTo) : '',
      coverageTermYears: p.coverageTermYears != null ? String(p.coverageTermYears) : '',
      waitingPeriodDays: p.waitingPeriodDays != null ? String(p.waitingPeriodDays) : '',
      claimSettlementRatio: p.claimSettlementRatio != null ? String(p.claimSettlementRatio) : '',
      cashlessHospitals: p.cashlessHospitals != null ? String(p.cashlessHospitals) : '',
      taxBenefit80c: Boolean(p.taxBenefit80c),
      taxBenefit80d: Boolean(p.taxBenefit80d),
      supportsNewPolicy: p.supportsNewPolicy !== false,
      supportsRenewal: Boolean(p.supportsRenewal),
      supportsClaimAssistance: Boolean(p.supportsClaimAssistance),
      newPolicyUrl: p.newPolicyUrl || '',
      renewalUrl: p.renewalUrl || '',
      claimAssistanceUrl: p.claimAssistanceUrl || '',
      purchaseEnabled: Boolean(p.purchaseEnabled),
      purchaseMode: p.purchaseMode || 'redirect',
      insurerProviderCode: p.insurerProviderCode || '',
      insurerProductCode: p.insurerProductCode || '',
      insurerPlanCode: p.insurerPlanCode || '',
      paymentAccountCode: p.paymentAccountCode || '',
      demographicMappingText: JSON.stringify(p.demographicMapping || { source: 'marketplaceLeadProfile' }, null, 2),
      featuresText: (p.features || []).join('\n'),
      benefitsText: (p.benefits || []).join('\n'),
      highlights: p.highlights || '',
      displayPriority: String(p.displayPriority ?? 0),
      status: p.status || 'active',
    });
  };

  const startProviderEdit = (provider) => {
    setEditingProviderId(provider.id);
    setProviderForm({
      providerCode: provider.providerCode || '',
      providerName: provider.providerName || '',
      integrationMode: provider.integrationMode || 'generic_api',
      baseUrl: provider.baseUrl || '',
      authType: provider.authType || 'bearer',
      apiKey: provider.apiKey || '',
      apiSecret: provider.apiSecret || '',
      webhookSecret: provider.webhookSecret || '',
      paymentAccountCode: provider.paymentAccountCode || '',
      requestConfigText: JSON.stringify(provider.requestConfig || { purchasePath: '/purchase' }, null, 2),
      status: provider.status || 'active',
    });
  };

  const toggleCategory = (slug) => {
    setForm((prev) => {
      const set = new Set(prev.categories || []);
      if (set.has(slug)) set.delete(slug);
      else set.add(slug);
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
    purchaseEnabled: form.purchaseEnabled,
    purchaseMode: form.purchaseMode,
    insurerProviderCode: form.insurerProviderCode || null,
    insurerProductCode: form.insurerProductCode.trim() || null,
    insurerPlanCode: form.insurerPlanCode.trim() || null,
    paymentAccountCode: form.paymentAccountCode.trim() || null,
    demographicMapping: safeParseJson(form.demographicMappingText, { source: 'marketplaceLeadProfile' }),
    features: insuranceService.formatListField(form.featuresText),
    benefits: insuranceService.formatListField(form.benefitsText),
    highlights: form.highlights.trim() || null,
    displayPriority: Number(form.displayPriority) || 0,
    status: form.status,
  });

  const buildProviderPayload = () => ({
    providerCode: providerForm.providerCode.trim(),
    providerName: providerForm.providerName.trim(),
    integrationMode: providerForm.integrationMode,
    baseUrl: providerForm.baseUrl.trim() || null,
    authType: providerForm.authType,
    apiKey: providerForm.apiKey.trim(),
    apiSecret: providerForm.apiSecret.trim(),
    webhookSecret: providerForm.webhookSecret.trim(),
    paymentAccountCode: providerForm.paymentAccountCode.trim(),
    requestConfig: safeParseJson(providerForm.requestConfigText, { purchasePath: '/purchase' }),
    status: providerForm.status,
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
      else {
        const created = await insuranceService.create(payload);
        id = created?.id;
      }
      if (id && pendingLogoFile) await insuranceService.uploadLogo(id, pendingLogoFile);
      resetForm();
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Save failed');
    }
    setSaving(false);
  };

  const handleProviderSave = async () => {
    if (!providerForm.providerCode.trim() || !providerForm.providerName.trim()) {
      setError('Provider code and provider name are required.');
      return;
    }
    setSavingProvider(true);
    setError('');
    try {
      const payload = buildProviderPayload();
      if (editingProviderId) await insuranceService.updateProviderConfig(editingProviderId, payload);
      else await insuranceService.createProviderConfig(payload);
      resetProviderForm();
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Provider save failed');
    }
    setSavingProvider(false);
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
        <p className="text-sm text-muted-foreground mt-1">
          Manage life, health, and motor insurance plans with comparison attributes, insurer provider mapping, and purchase orchestration.
        </p>
      </div>

      {error ? <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold">{editingProviderId ? 'Edit insurer provider config' : 'Insurer provider config'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Provider code" value={providerForm.providerCode} onChange={(e) => setProviderForm((f) => ({ ...f, providerCode: e.target.value }))} required />
            <Input label="Provider name" value={providerForm.providerName} onChange={(e) => setProviderForm((f) => ({ ...f, providerName: e.target.value }))} required />
            <Select label="Integration mode" value={providerForm.integrationMode} onChange={(v) => setProviderForm((f) => ({ ...f, integrationMode: v }))} options={[{ value: 'generic_api', label: 'Generic API' }, { value: 'demo', label: 'Demo adapter' }]} />
            <Select label="Auth type" value={providerForm.authType} onChange={(v) => setProviderForm((f) => ({ ...f, authType: v }))} options={[{ value: 'bearer', label: 'Bearer' }, { value: 'basic', label: 'Basic' }, { value: 'x_api_key', label: 'X-API-Key' }]} />
            <Input label="Base URL" value={providerForm.baseUrl} onChange={(e) => setProviderForm((f) => ({ ...f, baseUrl: e.target.value }))} />
            <Input label="Payment account code" value={providerForm.paymentAccountCode} onChange={(e) => setProviderForm((f) => ({ ...f, paymentAccountCode: e.target.value }))} />
            <Input label="API key" value={providerForm.apiKey} onChange={(e) => setProviderForm((f) => ({ ...f, apiKey: e.target.value }))} />
            <Input label="API secret" value={providerForm.apiSecret} onChange={(e) => setProviderForm((f) => ({ ...f, apiSecret: e.target.value }))} />
            <Input label="Webhook secret" value={providerForm.webhookSecret} onChange={(e) => setProviderForm((f) => ({ ...f, webhookSecret: e.target.value }))} />
            <Select label="Status" value={providerForm.status} onChange={(v) => setProviderForm((f) => ({ ...f, status: v }))} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Request config JSON</label>
            <textarea className="w-full min-h-[110px] rounded-lg border px-3 py-2 text-sm font-mono" value={providerForm.requestConfigText} onChange={(e) => setProviderForm((f) => ({ ...f, requestConfigText: e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleProviderSave} disabled={savingProvider}>{savingProvider ? 'Saving…' : editingProviderId ? 'Update provider' : 'Add provider'}</Button>
            {editingProviderId ? <Button variant="outline" onClick={resetProviderForm}>Cancel</Button> : null}
          </div>
          <div className="space-y-2 border-t pt-4">
            <p className="text-sm font-medium">Configured providers ({providers.length})</p>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {providers.map((provider) => (
                <div key={provider.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{provider.providerName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {provider.providerCode} · {provider.integrationMode} · {provider.authType}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => startProviderEdit(provider)}>Edit</Button>
                </div>
              ))}
            </div>
          </div>
        </div>

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
            <Checkbox label="Enable on-site purchase journey" checked={form.purchaseEnabled} onChange={(e) => setForm((f) => ({ ...f, purchaseEnabled: e?.target?.checked }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Purchase mode" value={form.purchaseMode} onChange={(v) => setForm((f) => ({ ...f, purchaseMode: v }))} options={[{ value: 'api', label: 'API purchase' }, { value: 'redirect', label: 'Redirect URL' }, { value: 'manual', label: 'Manual fulfilment' }]} />
            <Select label="Insurer provider" value={form.insurerProviderCode} onChange={(v) => setForm((f) => ({ ...f, insurerProviderCode: v }))} options={providerOptions} />
            <Input label="Insurer product code" value={form.insurerProductCode} onChange={(e) => setForm((f) => ({ ...f, insurerProductCode: e.target.value }))} />
            <Input label="Insurer plan code" value={form.insurerPlanCode} onChange={(e) => setForm((f) => ({ ...f, insurerPlanCode: e.target.value }))} />
            <Input label="Payment account code" value={form.paymentAccountCode} onChange={(e) => setForm((f) => ({ ...f, paymentAccountCode: e.target.value }))} />
          </div>
          <Input label="New policy URL" value={form.newPolicyUrl} onChange={(e) => setForm((f) => ({ ...f, newPolicyUrl: e.target.value }))} />
          <Input label="Renewal URL" value={form.renewalUrl} onChange={(e) => setForm((f) => ({ ...f, renewalUrl: e.target.value }))} />
          <Input label="Claim assistance URL" value={form.claimAssistanceUrl} onChange={(e) => setForm((f) => ({ ...f, claimAssistanceUrl: e.target.value }))} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Demographic mapping JSON</label>
            <textarea className="w-full min-h-[110px] rounded-lg border px-3 py-2 text-sm font-mono" value={form.demographicMappingText} onChange={(e) => setForm((f) => ({ ...f, demographicMappingText: e.target.value }))} />
          </div>
          <Input label="Highlights" value={form.highlights} onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value }))} />
          <textarea className="w-full min-h-[80px] rounded-lg border px-3 py-2 text-sm" placeholder="Features (one per line)" value={form.featuresText} onChange={(e) => setForm((f) => ({ ...f, featuresText: e.target.value }))} />
          <textarea className="w-full min-h-[80px] rounded-lg border px-3 py-2 text-sm" placeholder="Benefits (one per line)" value={form.benefitsText} onChange={(e) => setForm((f) => ({ ...f, benefitsText: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Display priority" type="number" value={form.displayPriority} onChange={(e) => setForm((f) => ({ ...f, displayPriority: e.target.value }))} />
            <Select label="Status" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update plan' : 'Add plan'}</Button>
            {editingId ? <Button variant="outline" onClick={resetForm}>Cancel</Button> : null}
          </div>
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
            <div className="text-xs text-muted-foreground">
              Purchase: {p.purchaseEnabled ? `${p.purchaseMode || 'redirect'}${p.insurerProviderCode ? ` · ${p.insurerProviderCode}` : ''}` : 'disabled'}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(p)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsuranceTab;
