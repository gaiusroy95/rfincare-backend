import React, { useEffect, useState } from 'react';
import CardLogoFields from '../../../components/admin/CardLogoFields';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { governmentSchemeService } from '../../../services/governmentSchemeService';
import { GOVERNMENT_SCHEME_CATEGORIES, getCategoryLabel } from '../../../constants/governmentSchemeMarketplace';
import { formatInterestRate, formatLoanAmount } from '../../../utils/governmentSchemeFilters';

const EMPTY = {
  ministryName: '', name: '', description: '', logoUrl: '', categories: [],
  loanAmountMin: '', loanAmountMax: '', subsidyPercent: '', interestRate: '',
  eligibilityText: '', benefitsText: '', applicationUrl: '',
  featuresText: '', highlights: '', displayPriority: '0', status: 'active',
};

const GovernmentSchemesTab = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });

  const load = async () => {
    setLoading(true);
    try {
      const list = await governmentSchemeService.listAll();
      setSchemes(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleCategory = (slug) => {
    setForm((prev) => {
      const set = new Set(prev.categories || []);
      if (set.has(slug)) set.delete(slug); else set.add(slug);
      return { ...prev, categories: [...set] };
    });
  };

  const buildPayload = () => ({
    ministryName: form.ministryName.trim(),
    name: form.name.trim(),
    description: form.description.trim() || null,
    logoUrl: form.logoUrl.trim() || null,
    categories: form.categories,
    loanAmountMin: form.loanAmountMin !== '' ? Number(form.loanAmountMin) : null,
    loanAmountMax: form.loanAmountMax !== '' ? Number(form.loanAmountMax) : null,
    subsidyPercent: form.subsidyPercent !== '' ? Number(form.subsidyPercent) : null,
    interestRate: form.interestRate !== '' ? Number(form.interestRate) : null,
    eligibilityText: form.eligibilityText.trim() || null,
    benefitsText: form.benefitsText.trim() || null,
    applicationUrl: form.applicationUrl.trim() || null,
    features: governmentSchemeService.formatListField(form.featuresText),
    highlights: form.highlights.trim() || null,
    displayPriority: Number(form.displayPriority) || 0,
    status: form.status,
  });

  const handleSave = async () => {
    if (!form.ministryName.trim() || !form.name.trim()) { setError('Ministry and scheme name are required.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editingId) await governmentSchemeService.update(editingId, buildPayload());
      else await governmentSchemeService.create(buildPayload());
      setEditingId(null);
      setForm({ ...EMPTY });
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Save failed');
    }
    setSaving(false);
  };

  const startEdit = (scheme) => {
    setEditingId(scheme.id);
    setForm({
      ministryName: scheme.ministryName || '', name: scheme.name || '',
      description: scheme.description || '', logoUrl: scheme.logoUrl || '',
      categories: [...(scheme.categories || [])],
      loanAmountMin: scheme.loanAmountMin != null ? String(scheme.loanAmountMin) : '',
      loanAmountMax: scheme.loanAmountMax != null ? String(scheme.loanAmountMax) : '',
      subsidyPercent: scheme.subsidyPercent != null ? String(scheme.subsidyPercent) : '',
      interestRate: scheme.interestRate != null ? String(scheme.interestRate) : '',
      eligibilityText: scheme.eligibilityText || '', benefitsText: scheme.benefitsText || '',
      applicationUrl: scheme.applicationUrl || '', featuresText: (scheme.features || []).join('\n'),
      highlights: scheme.highlights || '', displayPriority: String(scheme.displayPriority ?? 0),
      status: scheme.status || 'active',
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">Government Schemes</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage loans, subsidies, pensions, and social security schemes.</p>
      </div>
      {error ? <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div> : null}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-card border rounded-xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          <h3 className="font-semibold">{editingId ? 'Edit scheme' : 'Add scheme'}</h3>
          <Input label="Ministry name" value={form.ministryName} onChange={(e) => setForm((f) => ({ ...f, ministryName: e.target.value }))} required />
          <Input label="Scheme name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <div>
            <p className="text-sm font-medium mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              {GOVERNMENT_SCHEME_CATEGORIES.map((cat) => (
                <button key={cat.slug} type="button" onClick={() => toggleCategory(cat.slug)} className={`text-xs px-3 py-1.5 rounded-full border font-medium ${(form.categories || []).includes(cat.slug) ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>{cat.label}</button>
              ))}
            </div>
          </div>
          <CardLogoFields logoUrl={form.logoUrl} cardId={editingId} cardName={form.name} onLogoUrlChange={(logoUrl) => setForm((f) => ({ ...f, logoUrl }))} onError={setError} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Loan min (₹)" type="number" value={form.loanAmountMin} onChange={(e) => setForm((f) => ({ ...f, loanAmountMin: e.target.value }))} />
            <Input label="Loan max (₹)" type="number" value={form.loanAmountMax} onChange={(e) => setForm((f) => ({ ...f, loanAmountMax: e.target.value }))} />
            <Input label="Subsidy %" type="number" value={form.subsidyPercent} onChange={(e) => setForm((f) => ({ ...f, subsidyPercent: e.target.value }))} />
            <Input label="Interest rate %" type="number" value={form.interestRate} onChange={(e) => setForm((f) => ({ ...f, interestRate: e.target.value }))} />
            <Input label="Application URL" value={form.applicationUrl} onChange={(e) => setForm((f) => ({ ...f, applicationUrl: e.target.value }))} />
            <Select label="Status" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </div>
          <textarea className="w-full min-h-[60px] rounded-lg border px-3 py-2 text-sm" placeholder="Eligibility" value={form.eligibilityText} onChange={(e) => setForm((f) => ({ ...f, eligibilityText: e.target.value }))} />
          <textarea className="w-full min-h-[60px] rounded-lg border px-3 py-2 text-sm" placeholder="Benefits" value={form.benefitsText} onChange={(e) => setForm((f) => ({ ...f, benefitsText: e.target.value }))} />
          <textarea className="w-full min-h-[80px] rounded-lg border px-3 py-2 text-sm" placeholder="Features (one per line)" value={form.featuresText} onChange={(e) => setForm((f) => ({ ...f, featuresText: e.target.value }))} />
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update' : 'Add scheme'}</Button>
            {editingId ? <Button variant="outline" onClick={() => { setEditingId(null); setForm({ ...EMPTY }); }}>Cancel</Button> : null}
          </div>
        </div>
        <div className="space-y-3 max-h-[85vh] overflow-y-auto">
          <h3 className="font-semibold">Published schemes ({schemes.length})</h3>
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {schemes.map((scheme) => (
            <div key={scheme.id} className="bg-card border rounded-xl p-4 space-y-2">
              <p className="font-semibold">{scheme.name}</p>
              <p className="text-sm text-muted-foreground">{scheme.ministryName} · {formatLoanAmount(scheme)} · {formatInterestRate(scheme.interestRate)}</p>
              <div className="flex flex-wrap gap-1">{(scheme.categories || []).map((s) => <span key={s} className="text-[10px] px-1.5 py-0.5 bg-muted rounded">{getCategoryLabel(s)}</span>)}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(scheme)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={async () => { if (window.confirm('Delete?')) { await governmentSchemeService.remove(scheme.id); load(); } }}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GovernmentSchemesTab;
