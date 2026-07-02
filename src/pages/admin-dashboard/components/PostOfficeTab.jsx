import React, { useEffect, useState } from 'react';
import CardLogoFields from '../../../components/admin/CardLogoFields';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { postOfficeService } from '../../../services/postOfficeService';
import { POST_OFFICE_CATEGORIES, getCategoryLabel } from '../../../constants/postOfficeMarketplace';
import { formatInterestRate } from '../../../utils/postOfficeFilters';

const EMPTY = {
  name: '', description: '', logoUrl: '', categories: [],
  interestRate: '', tenureMinMonths: '', tenureMaxMonths: '',
  minDepositAmount: '', maxDepositAmount: '',
  eligibilityText: '', returnsSummary: '', taxBenefitsText: '',
  calculatorEnabled: true, calculatorType: '', compoundingFrequency: 'annual',
  applyUrl: '', featuresText: '', highlights: '',
  displayPriority: '0', status: 'active',
};

const PostOfficeTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });

  const load = async () => {
    setLoading(true);
    try {
      const list = await postOfficeService.listAll();
      setProducts(Array.isArray(list) ? list : []);
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
    name: form.name.trim(),
    description: form.description.trim() || null,
    logoUrl: form.logoUrl.trim() || null,
    categories: form.categories,
    interestRate: form.interestRate !== '' ? Number(form.interestRate) : null,
    tenureMinMonths: form.tenureMinMonths !== '' ? Number(form.tenureMinMonths) : null,
    tenureMaxMonths: form.tenureMaxMonths !== '' ? Number(form.tenureMaxMonths) : null,
    minDepositAmount: form.minDepositAmount !== '' ? Number(form.minDepositAmount) : null,
    maxDepositAmount: form.maxDepositAmount !== '' ? Number(form.maxDepositAmount) : null,
    eligibilityText: form.eligibilityText.trim() || null,
    returnsSummary: form.returnsSummary.trim() || null,
    taxBenefitsText: form.taxBenefitsText.trim() || null,
    calculatorEnabled: form.calculatorEnabled,
    calculatorType: form.calculatorType || null,
    compoundingFrequency: form.compoundingFrequency || 'annual',
    applyUrl: form.applyUrl.trim() || null,
    features: postOfficeService.formatListField(form.featuresText),
    highlights: form.highlights.trim() || null,
    displayPriority: Number(form.displayPriority) || 0,
    status: form.status,
  });

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Product name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = buildPayload();
      if (editingId) await postOfficeService.update(editingId, payload);
      else await postOfficeService.create(payload);
      setEditingId(null);
      setPendingLogoFile(null);
      setForm({ ...EMPTY });
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Save failed');
    }
    setSaving(false);
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || '', description: product.description || '', logoUrl: product.logoUrl || '',
      categories: [...(product.categories || [])],
      interestRate: product.interestRate != null ? String(product.interestRate) : '',
      tenureMinMonths: product.tenureMinMonths != null ? String(product.tenureMinMonths) : '',
      tenureMaxMonths: product.tenureMaxMonths != null ? String(product.tenureMaxMonths) : '',
      minDepositAmount: product.minDepositAmount != null ? String(product.minDepositAmount) : '',
      maxDepositAmount: product.maxDepositAmount != null ? String(product.maxDepositAmount) : '',
      eligibilityText: product.eligibilityText || '', returnsSummary: product.returnsSummary || '',
      taxBenefitsText: product.taxBenefitsText || '',
      calculatorEnabled: product.calculatorEnabled !== false,
      calculatorType: product.calculatorType || '', compoundingFrequency: product.compoundingFrequency || 'annual',
      applyUrl: product.applyUrl || '', featuresText: (product.features || []).join('\n'),
      highlights: product.highlights || '', displayPriority: String(product.displayPriority ?? 0),
      status: product.status || 'active',
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">Post Office Investments</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage PPF, NSC, KVP, SCSS, MIS, TD, RD and other India Post schemes.</p>
      </div>
      {error ? <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div> : null}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-card border rounded-xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          <h3 className="font-semibold">{editingId ? 'Edit product' : 'Add product'}</h3>
          <Input label="Product name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <div>
            <p className="text-sm font-medium mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              {POST_OFFICE_CATEGORIES.map((cat) => (
                <button key={cat.slug} type="button" onClick={() => toggleCategory(cat.slug)} className={`text-xs px-3 py-1.5 rounded-full border font-medium ${(form.categories || []).includes(cat.slug) ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>{cat.label}</button>
              ))}
            </div>
          </div>
          <CardLogoFields logoUrl={form.logoUrl} cardId={editingId} cardName={form.name} onLogoUrlChange={(logoUrl) => setForm((f) => ({ ...f, logoUrl }))} onPendingFile={setPendingLogoFile} onError={setError} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Interest rate %" type="number" value={form.interestRate} onChange={(e) => setForm((f) => ({ ...f, interestRate: e.target.value }))} />
            <Select label="Calculator type" value={form.calculatorType} onChange={(v) => setForm((f) => ({ ...f, calculatorType: v }))} options={[{ value: '', label: '—' }, ...POST_OFFICE_CATEGORIES.map((c) => ({ value: c.slug, label: c.label }))]} />
            <Input label="Min tenure (months)" type="number" value={form.tenureMinMonths} onChange={(e) => setForm((f) => ({ ...f, tenureMinMonths: e.target.value }))} />
            <Input label="Max tenure (months)" type="number" value={form.tenureMaxMonths} onChange={(e) => setForm((f) => ({ ...f, tenureMaxMonths: e.target.value }))} />
            <Input label="Min deposit (₹)" type="number" value={form.minDepositAmount} onChange={(e) => setForm((f) => ({ ...f, minDepositAmount: e.target.value }))} />
            <Input label="Max deposit (₹)" type="number" value={form.maxDepositAmount} onChange={(e) => setForm((f) => ({ ...f, maxDepositAmount: e.target.value }))} />
            <Input label="Apply URL" value={form.applyUrl} onChange={(e) => setForm((f) => ({ ...f, applyUrl: e.target.value }))} />
            <Select label="Status" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </div>
          <textarea className="w-full min-h-[60px] rounded-lg border px-3 py-2 text-sm" placeholder="Eligibility" value={form.eligibilityText} onChange={(e) => setForm((f) => ({ ...f, eligibilityText: e.target.value }))} />
          <textarea className="w-full min-h-[60px] rounded-lg border px-3 py-2 text-sm" placeholder="Returns summary" value={form.returnsSummary} onChange={(e) => setForm((f) => ({ ...f, returnsSummary: e.target.value }))} />
          <textarea className="w-full min-h-[60px] rounded-lg border px-3 py-2 text-sm" placeholder="Tax benefits" value={form.taxBenefitsText} onChange={(e) => setForm((f) => ({ ...f, taxBenefitsText: e.target.value }))} />
          <Checkbox label="Calculator enabled" checked={form.calculatorEnabled} onChange={(e) => setForm((f) => ({ ...f, calculatorEnabled: e?.target?.checked }))} />
          <textarea className="w-full min-h-[80px] rounded-lg border px-3 py-2 text-sm" placeholder="Features (one per line)" value={form.featuresText} onChange={(e) => setForm((f) => ({ ...f, featuresText: e.target.value }))} />
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update' : 'Add product'}</Button>
            {editingId ? <Button variant="outline" onClick={() => { setEditingId(null); setForm({ ...EMPTY }); }}>Cancel</Button> : null}
          </div>
        </div>
        <div className="space-y-3 max-h-[85vh] overflow-y-auto">
          <h3 className="font-semibold">Published products ({products.length})</h3>
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {products.map((product) => (
            <div key={product.id} className="bg-card border rounded-xl p-4 space-y-2">
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.providerName || 'India Post'} · {formatInterestRate(product.interestRate)}</p>
              <div className="flex flex-wrap gap-1">{(product.categories || []).map((s) => <span key={s} className="text-[10px] px-1.5 py-0.5 bg-muted rounded">{getCategoryLabel(s)}</span>)}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(product)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={async () => { if (window.confirm('Delete?')) { await postOfficeService.remove(product.id); load(); } }}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostOfficeTab;
