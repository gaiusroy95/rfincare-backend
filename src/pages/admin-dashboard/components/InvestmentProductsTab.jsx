import React, { useEffect, useState } from 'react';
import CardLogoFields from '../../../components/admin/CardLogoFields';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { investmentProductService } from '../../../services/investmentProductService';
import { INVESTMENT_CATEGORIES, RISK_LEVELS, getCategoryLabel } from '../../../constants/investmentMarketplace';
import { formatPercent, formatExpenseRatio } from '../../../utils/investmentMarketplaceFilters';

const EMPTY = {
  providerName: '', name: '', description: '', logoUrl: '', categories: [],
  returns1y: '', returns3y: '', riskLevel: '', expenseRatio: '',
  minInvestmentAmount: '', taxBenefitsText: '', maturityTenureText: '',
  applyUrl: '', featuresText: '', highlights: '', displayPriority: '0', status: 'active',
};

const InvestmentProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });

  const load = async () => {
    setLoading(true);
    try {
      const list = await investmentProductService.listAll();
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
    providerName: form.providerName.trim(),
    name: form.name.trim(),
    description: form.description.trim() || null,
    logoUrl: form.logoUrl.trim() || null,
    categories: form.categories,
    returns1y: form.returns1y !== '' ? Number(form.returns1y) : null,
    returns3y: form.returns3y !== '' ? Number(form.returns3y) : null,
    riskLevel: form.riskLevel || null,
    expenseRatio: form.expenseRatio !== '' ? Number(form.expenseRatio) : null,
    minInvestmentAmount: form.minInvestmentAmount !== '' ? Number(form.minInvestmentAmount) : null,
    taxBenefitsText: form.taxBenefitsText.trim() || null,
    maturityTenureText: form.maturityTenureText.trim() || null,
    applyUrl: form.applyUrl.trim() || null,
    features: investmentProductService.formatListField(form.featuresText),
    highlights: form.highlights.trim() || null,
    displayPriority: Number(form.displayPriority) || 0,
    status: form.status,
  });

  const handleSave = async () => {
    if (!form.providerName.trim() || !form.name.trim()) { setError('Provider and product name are required.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editingId) await investmentProductService.update(editingId, buildPayload());
      else await investmentProductService.create(buildPayload());
      setEditingId(null);
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
      providerName: product.providerName || '', name: product.name || '',
      description: product.description || '', logoUrl: product.logoUrl || '',
      categories: [...(product.categories || [])],
      returns1y: product.returns1y != null ? String(product.returns1y) : '',
      returns3y: product.returns3y != null ? String(product.returns3y) : '',
      riskLevel: product.riskLevel || '', expenseRatio: product.expenseRatio != null ? String(product.expenseRatio) : '',
      minInvestmentAmount: product.minInvestmentAmount != null ? String(product.minInvestmentAmount) : '',
      taxBenefitsText: product.taxBenefitsText || '', maturityTenureText: product.maturityTenureText || '',
      applyUrl: product.applyUrl || '', featuresText: (product.features || []).join('\n'),
      highlights: product.highlights || '', displayPriority: String(product.displayPriority ?? 0),
      status: product.status || 'active',
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">Investment Products</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage SGB, ETFs, bonds, REITs, InvITs and other investment products.</p>
      </div>
      {error ? <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div> : null}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-card border rounded-xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          <h3 className="font-semibold">{editingId ? 'Edit product' : 'Add product'}</h3>
          <Input label="Provider name" value={form.providerName} onChange={(e) => setForm((f) => ({ ...f, providerName: e.target.value }))} required />
          <Input label="Product name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <div>
            <p className="text-sm font-medium mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              {INVESTMENT_CATEGORIES.map((cat) => (
                <button key={cat.slug} type="button" onClick={() => toggleCategory(cat.slug)} className={`text-xs px-3 py-1.5 rounded-full border font-medium ${(form.categories || []).includes(cat.slug) ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>{cat.label}</button>
              ))}
            </div>
          </div>
          <CardLogoFields logoUrl={form.logoUrl} cardId={editingId} cardName={form.name} onLogoUrlChange={(logoUrl) => setForm((f) => ({ ...f, logoUrl }))} onError={setError} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="1Y returns %" type="number" value={form.returns1y} onChange={(e) => setForm((f) => ({ ...f, returns1y: e.target.value }))} />
            <Input label="3Y returns %" type="number" value={form.returns3y} onChange={(e) => setForm((f) => ({ ...f, returns3y: e.target.value }))} />
            <Select label="Risk" value={form.riskLevel} onChange={(v) => setForm((f) => ({ ...f, riskLevel: v }))} options={[{ value: '', label: '—' }, ...RISK_LEVELS.map((r) => ({ value: r.slug, label: r.label }))]} />
            <Input label="Expense ratio %" type="number" value={form.expenseRatio} onChange={(e) => setForm((f) => ({ ...f, expenseRatio: e.target.value }))} />
            <Input label="Min investment (₹)" type="number" value={form.minInvestmentAmount} onChange={(e) => setForm((f) => ({ ...f, minInvestmentAmount: e.target.value }))} />
            <Input label="Apply URL" value={form.applyUrl} onChange={(e) => setForm((f) => ({ ...f, applyUrl: e.target.value }))} />
            <Select label="Status" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </div>
          <textarea className="w-full min-h-[60px] rounded-lg border px-3 py-2 text-sm" placeholder="Tax benefits" value={form.taxBenefitsText} onChange={(e) => setForm((f) => ({ ...f, taxBenefitsText: e.target.value }))} />
          <Input label="Maturity / tenure" value={form.maturityTenureText} onChange={(e) => setForm((f) => ({ ...f, maturityTenureText: e.target.value }))} />
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
              <p className="text-sm text-muted-foreground">{product.providerName} · 3Y {formatPercent(product.returns3y)} · TER {formatExpenseRatio(product.expenseRatio)}</p>
              <div className="flex flex-wrap gap-1">{(product.categories || []).map((s) => <span key={s} className="text-[10px] px-1.5 py-0.5 bg-muted rounded">{getCategoryLabel(s)}</span>)}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(product)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={async () => { if (window.confirm('Delete?')) { await investmentProductService.remove(product.id); load(); } }}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvestmentProductsTab;
