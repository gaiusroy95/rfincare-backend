import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { bankService } from '../../../services/apiServices';
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

const ADD_CATEGORY_VALUE = '__add_category__';

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
  bankId: '',
  categoryId: '',
};

const LoanProductsTab = () => {
  const { refresh: refreshPublic } = useLoanProducts();
  const [products, setProducts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const bankOptions = useMemo(
    () => [
      { value: '', label: '— No bank (category landing only) —' },
      ...banks.map((b) => ({ value: b.id, label: b.name })),
    ],
    [banks],
  );

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Select product category' },
      ...categories.map((c) => ({ value: c.id, label: c.label })),
      { value: ADD_CATEGORY_VALUE, label: '+ Add new category…' },
    ],
    [categories],
  );

  const load = async () => {
    setLoading(true);
    setError('');
    const [prodRes, catRes, bankList] = await Promise.all([
      loanProductCatalogService.listAll(),
      loanProductCatalogService.listCategories(),
      bankService.getAllBanks().catch(() => []),
    ]);
    if (prodRes.error) setError(prodRes.error.message);
    setProducts(prodRes.data || []);
    setCategories(catRes.data || []);
    setBanks(Array.isArray(bankList) ? bankList : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleCategoryChange = (value) => {
    if (value === ADD_CATEGORY_VALUE) {
      setShowAddCategory(true);
      return;
    }
    setShowAddCategory(false);
    setField('categoryId', value);
  };

  const handleAddCategory = async () => {
    const label = newCategoryLabel.trim();
    if (!label) {
      setError('Enter a category name');
      return;
    }
    setAddingCategory(true);
    setError('');
    const { data, error: err } = await loanProductCatalogService.createCategory({ label });
    setAddingCategory(false);
    if (err) {
      setError(err.message);
      return;
    }
    setCategories((prev) => [...prev, data].sort((a, b) => a.label.localeCompare(b.label)));
    setField('categoryId', data.id);
    setNewCategoryLabel('');
    setShowAddCategory(false);
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setShowAddCategory(false);
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
      bankId: product.bankId || '',
      categoryId: product.categoryId || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowAddCategory(false);
    setNewCategoryLabel('');
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
    bank_id: form.bankId || null,
    category_id: form.categoryId || null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label.trim()) {
      setError('Product name is required');
      return;
    }
    if (!form.categoryId) {
      setError('Product category is required');
      return;
    }
    if (!form.bankId) {
      setError('Bank name is required — select the lender for this product');
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
            Map each product to a bank and category. Only banks with a product under a category
            appear on that category&apos;s marketplace page.
          </p>
        </div>
        <Button variant="outline" iconName="RefreshCw" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border border-border rounded-xl p-4 md:p-6 bg-muted/20 space-y-4"
      >
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Icon name={editingId ? 'Pencil' : 'Plus'} size={18} />
          {editingId ? 'Edit product' : 'Add new product'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Bank name"
            description="Lender offering this product (from Banks tab)"
            options={bankOptions}
            value={form.bankId}
            onChange={(v) => setField('bankId', v)}
            required
          />
          <Select
            label="Product category"
            description="Category shown in dropdown and marketplace filter"
            options={categoryOptions}
            value={showAddCategory ? ADD_CATEGORY_VALUE : form.categoryId}
            onChange={handleCategoryChange}
            required
          />
        </div>

        {showAddCategory && (
          <div className="flex flex-col sm:flex-row gap-3 items-end p-3 rounded-lg border border-border bg-card">
            <Input
              label="New category name"
              value={newCategoryLabel}
              onChange={(e) => setNewCategoryLabel(e.target.value)}
              placeholder="e.g. Gold Loan"
              className="flex-1"
            />
            <Button type="button" onClick={handleAddCategory} disabled={addingCategory}>
              {addingCategory ? 'Adding…' : 'Add category'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddCategory(false);
                setNewCategoryLabel('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Product name"
            value={form.label}
            onChange={(e) => setField('label', e.target.value)}
            placeholder="e.g. HDFC School Business Loan"
            required
          />
          <Input
            label="URL slug"
            description="Optional short name — combined with bank and category to form a unique URL"
            value={form.slug}
            onChange={(e) => setField('slug', e.target.value)}
            placeholder="hdfc_school_loan"
          />
          <Input
            label="Short label"
            value={form.shortLabel}
            onChange={(e) => setField('shortLabel', e.target.value)}
            placeholder="School"
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
            placeholder={'Up to ₹2 Cr.\nAt least 5 years old school'}
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
                    {product.bankName ? `${product.bankName} · ` : ''}
                    {product.categoryLabel || 'No category'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    /products/{product.categorySlug || product.slug}
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
              No catalog products yet. Add one above with bank and category mapping.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LoanProductsTab;
