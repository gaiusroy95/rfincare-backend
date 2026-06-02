import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { loanProductCatalogService } from '../../../services/loanProductCatalogService';
import { useLoanProducts } from '../../../contexts/LoanProductsContext';

const ICON_OPTIONS = [
  { value: 'Wallet', label: 'Wallet' },
  { value: 'Home', label: 'Home' },
  { value: 'Briefcase', label: 'Briefcase' },
  { value: 'Car', label: 'Car' },
  { value: 'GraduationCap', label: 'Graduation cap' },
  { value: 'Landmark', label: 'Bank / Landmark' },
  { value: 'Heart', label: 'Heart' },
  { value: 'Shield', label: 'Shield' },
  { value: 'PiggyBank', label: 'Savings' },
  { value: 'TrendingUp', label: 'Investment' },
];

const EMPTY_FORM = {
  label: '',
  slug: '',
  shortLabel: '',
  icon: 'Wallet',
  description: '',
  interestRateMin: '',
  interestRateMax: '',
  featuresText: '',
  color: 'var(--color-primary)',
  sortOrder: '0',
  isActive: true,
};

const LoanProductsTab = () => {
  const { refresh: refreshPublic } = useLoanProducts();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const load = async () => {
    setLoading(true);
    setError('');
    const { data, error: err } = await loanProductCatalogService.listAll();
    if (err) setError(err.message);
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      label: product.label || '',
      slug: product.slug || '',
      shortLabel: product.shortLabel || '',
      icon: product.icon || 'Wallet',
      description: product.description || '',
      interestRateMin: product.interestRateMin ?? '',
      interestRateMax: product.interestRateMax ?? '',
      featuresText: (product.features || []).join('\n'),
      color: product.color || 'var(--color-primary)',
      sortOrder: String(product.sortOrder ?? 0),
      isActive: product.isActive !== false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  const buildPayload = () => ({
    label: form.label.trim(),
    slug: form.slug.trim() || undefined,
    short_label: form.shortLabel.trim() || undefined,
    icon: form.icon,
    description: form.description.trim(),
    interest_rate_min: form.interestRateMin !== '' ? Number(form.interestRateMin) : null,
    interest_rate_max: form.interestRateMax !== '' ? Number(form.interestRateMax) : null,
    features: form.featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    color: form.color,
    sort_order: Number(form.sortOrder) || 0,
    is_active: form.isActive,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label.trim()) {
      setError('Product name is required');
      return;
    }
    setSaving(true);
    setError('');
    const payload = buildPayload();
    const result = editingId
      ? await loanProductCatalogService.update(editingId, payload)
      : await loanProductCatalogService.create(payload);
    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    resetForm();
    await load();
    await refreshPublic();
  };

  const handleDelete = async (id, label) => {
    if (!confirm(`Delete product "${label}"? This cannot be undone.`)) return;
    const { error: err } = await loanProductCatalogService.remove(id);
    if (err) {
      setError(err.message);
      return;
    }
    if (editingId === id) resetForm();
    await load();
    await refreshPublic();
  };

  const toggleActive = async (product) => {
    const { error: err } = await loanProductCatalogService.update(product.id, {
      is_active: !product.isActive,
    });
    if (err) setError(err.message);
    else {
      await load();
      await refreshPublic();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Loan product catalog</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add or update loan types shown on the homepage, product pages, and application forms.
          </p>
        </div>
        <Button variant="outline" iconName="RefreshCw" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="border border-border rounded-xl p-4 md:p-6 bg-muted/20 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Icon name={editingId ? 'Pencil' : 'Plus'} size={18} />
          {editingId ? 'Edit product' : 'Add new product'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Product name"
            value={form.label}
            onChange={(e) => setField('label', e.target.value)}
            placeholder="e.g. Gold Loan"
            required
          />
          <Input
            label="URL slug"
            description="Used in /products/your-slug (auto-generated from name if empty)"
            value={form.slug}
            onChange={(e) => setField('slug', e.target.value)}
            placeholder="gold"
          />
          <Input
            label="Short label"
            value={form.shortLabel}
            onChange={(e) => setField('shortLabel', e.target.value)}
            placeholder="Gold"
          />
          <Select
            label="Icon"
            options={ICON_OPTIONS}
            value={form.icon}
            onChange={(v) => setField('icon', v)}
          />
          <Input
            label="Interest rate min (%)"
            type="number"
            step="0.1"
            value={form.interestRateMin}
            onChange={(e) => setField('interestRateMin', e.target.value)}
            placeholder="8.5"
          />
          <Input
            label="Interest rate max (%)"
            type="number"
            step="0.1"
            value={form.interestRateMax}
            onChange={(e) => setField('interestRateMax', e.target.value)}
            placeholder="15.9"
          />
          <Input
            label="Accent color"
            value={form.color}
            onChange={(e) => setField('color', e.target.value)}
            placeholder="var(--color-primary) or #0ea5e9"
          />
          <Input
            label="Sort order"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setField('sortOrder', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description</label>
          <textarea
            className="w-full min-h-[80px] px-3 py-2 border border-border rounded-lg text-sm"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Short description for the product card"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Features (one per line)
          </label>
          <textarea
            className="w-full min-h-[100px] px-3 py-2 border border-border rounded-lg text-sm font-mono"
            value={form.featuresText}
            onChange={(e) => setField('featuresText', e.target.value)}
            placeholder={'Up to ₹40 Lakhs\nQuick approval'}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setField('isActive', e.target.checked)}
            className="rounded border-border"
          />
          Active (visible on website)
        </label>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={saving} iconName={editingId ? 'Save' : 'Plus'}>
            {editingId ? 'Save changes' : 'Add product'}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel edit
            </Button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading products…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className={`border rounded-xl p-4 ${product.isActive ? 'border-border bg-card' : 'border-dashed border-muted-foreground/40 opacity-75'}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: product.color }}
                >
                  <Icon name={product.icon} size={22} color="white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-foreground">{product.label}</h4>
                  <p className="text-xs text-muted-foreground">
                    /products/{product.slug} · API: {product.apiKey}
                  </p>
                  <p className="text-sm text-primary font-semibold mt-1">{product.interestRange}</p>
                </div>
                {!product.isActive && (
                  <span className="text-xs px-2 py-0.5 rounded bg-muted">Hidden</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(product)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleActive(product)}>
                  {product.isActive ? 'Hide' : 'Show'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => handleDelete(product.id, product.label)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-8">
              No catalog products yet. Add one above or run{' '}
              <code className="text-xs bg-muted px-1 rounded">npm run seed:loan-products</code> on the backend.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LoanProductsTab;
