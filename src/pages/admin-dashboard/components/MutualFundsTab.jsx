import React, { useEffect, useMemo, useState } from 'react';
import CardLogoFields from '../../../components/admin/CardLogoFields';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { bankService } from '../../../services/apiServices';
import { mutualFundService } from '../../../services/mutualFundService';
import { MUTUAL_FUND_CATEGORIES, RISK_LEVELS, getCategoryLabel } from '../../../constants/mutualFundMarketplace';
import { formatPercent, formatAum, formatRating } from '../../../utils/mutualFundFilters';

const EMPTY = {
  amcId: '', amcName: '', name: '', description: '', logoUrl: '', categories: [],
  returns1y: '', returns3y: '', returns5y: '', riskLevel: '', expenseRatio: '', fundManager: '',
  aumCrores: '', rating: '', minSipAmount: '500', minLumpsumAmount: '5000',
  supportsSip: true, supportsLumpsum: true, investUrl: '', featuresText: '', highlights: '',
  displayPriority: '0', status: 'active',
};

const MutualFundsTab = () => {
  const [funds, setFunds] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });

  const bankOptions = useMemo(() => [{ value: '', label: '— Select AMC —' }, ...banks.map((b) => ({ value: b.id, label: b.name }))], [banks]);

  const load = async () => {
    setLoading(true);
    try {
      const [list, bankList] = await Promise.all([mutualFundService.listAll(), bankService.getAllBanks().catch(() => [])]);
      setFunds(Array.isArray(list) ? list : []);
      setBanks(Array.isArray(bankList) ? bankList : []);
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
    amcId: form.amcId || null,
    amcName: form.amcName.trim(),
    name: form.name.trim(),
    description: form.description.trim() || null,
    logoUrl: form.logoUrl.trim() || null,
    categories: form.categories,
    returns1y: form.returns1y !== '' ? Number(form.returns1y) : null,
    returns3y: form.returns3y !== '' ? Number(form.returns3y) : null,
    returns5y: form.returns5y !== '' ? Number(form.returns5y) : null,
    riskLevel: form.riskLevel || null,
    expenseRatio: form.expenseRatio !== '' ? Number(form.expenseRatio) : null,
    fundManager: form.fundManager.trim() || null,
    aumCrores: form.aumCrores !== '' ? Number(form.aumCrores) : null,
    rating: form.rating !== '' ? Number(form.rating) : null,
    minSipAmount: form.minSipAmount !== '' ? Number(form.minSipAmount) : null,
    minLumpsumAmount: form.minLumpsumAmount !== '' ? Number(form.minLumpsumAmount) : null,
    supportsSip: form.supportsSip,
    supportsLumpsum: form.supportsLumpsum,
    investUrl: form.investUrl.trim() || null,
    features: mutualFundService.formatListField(form.featuresText),
    highlights: form.highlights.trim() || null,
    displayPriority: Number(form.displayPriority) || 0,
    status: form.status,
  });

  const handleSave = async () => {
    if (!form.amcName.trim() || !form.name.trim()) { setError('AMC name and fund name are required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = buildPayload();
      if (pendingLogoFile && !editingId) payload.logoUrl = null;
      let id = editingId;
      if (editingId) await mutualFundService.update(editingId, payload);
      else { const created = await mutualFundService.create(payload); id = created?.id; }
      if (id && pendingLogoFile) await mutualFundService.uploadLogo(id, pendingLogoFile);
      setEditingId(null);
      setPendingLogoFile(null);
      setForm({ ...EMPTY });
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Save failed');
    }
    setSaving(false);
  };

  const startEdit = (fund) => {
    setEditingId(fund.id);
    setForm({
      amcId: fund.amcId || '', amcName: fund.amcName || '', name: fund.name || '',
      description: fund.description || '', logoUrl: fund.logoUrl || '',
      categories: [...(fund.categories || [])],
      returns1y: fund.returns1y != null ? String(fund.returns1y) : '',
      returns3y: fund.returns3y != null ? String(fund.returns3y) : '',
      returns5y: fund.returns5y != null ? String(fund.returns5y) : '',
      riskLevel: fund.riskLevel || '', expenseRatio: fund.expenseRatio != null ? String(fund.expenseRatio) : '',
      fundManager: fund.fundManager || '', aumCrores: fund.aumCrores != null ? String(fund.aumCrores) : '',
      rating: fund.rating != null ? String(fund.rating) : '',
      minSipAmount: fund.minSipAmount != null ? String(fund.minSipAmount) : '500',
      minLumpsumAmount: fund.minLumpsumAmount != null ? String(fund.minLumpsumAmount) : '5000',
      supportsSip: fund.supportsSip !== false, supportsLumpsum: fund.supportsLumpsum !== false,
      investUrl: fund.investUrl || '', featuresText: (fund.features || []).join('\n'),
      highlights: fund.highlights || '', displayPriority: String(fund.displayPriority ?? 0), status: fund.status || 'active',
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">Mutual Funds</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage fund categories, returns, risk, expense ratio, AUM, rating & invest links.</p>
      </div>
      {error ? <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div> : null}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-card border rounded-xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          <h3 className="font-semibold">{editingId ? 'Edit fund' : 'Add fund'}</h3>
          <Select label="AMC" options={bankOptions} value={form.amcId} onChange={(id) => {
            const bank = banks.find((b) => b.id === id);
            setForm((f) => ({ ...f, amcId: id, amcName: bank?.name || f.amcName }));
          }} />
          <Input label="AMC name" value={form.amcName} onChange={(e) => setForm((f) => ({ ...f, amcName: e.target.value }))} required />
          <Input label="Fund name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <div>
            <p className="text-sm font-medium mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              {MUTUAL_FUND_CATEGORIES.map((cat) => (
                <button key={cat.slug} type="button" onClick={() => toggleCategory(cat.slug)} className={`text-xs px-3 py-1.5 rounded-full border font-medium ${(form.categories || []).includes(cat.slug) ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>{cat.label}</button>
              ))}
            </div>
          </div>
          <CardLogoFields logoUrl={form.logoUrl} cardId={editingId} cardName={form.name} onLogoUrlChange={(logoUrl) => setForm((f) => ({ ...f, logoUrl }))} onPendingFile={setPendingLogoFile} onError={setError} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="1Y returns %" type="number" value={form.returns1y} onChange={(e) => setForm((f) => ({ ...f, returns1y: e.target.value }))} />
            <Input label="3Y returns %" type="number" value={form.returns3y} onChange={(e) => setForm((f) => ({ ...f, returns3y: e.target.value }))} />
            <Input label="5Y returns %" type="number" value={form.returns5y} onChange={(e) => setForm((f) => ({ ...f, returns5y: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Risk" value={form.riskLevel} onChange={(v) => setForm((f) => ({ ...f, riskLevel: v }))} options={[{ value: '', label: '—' }, ...RISK_LEVELS.map((r) => ({ value: r.slug, label: r.label }))]} />
            <Input label="Expense ratio %" type="number" value={form.expenseRatio} onChange={(e) => setForm((f) => ({ ...f, expenseRatio: e.target.value }))} />
            <Input label="Fund manager" value={form.fundManager} onChange={(e) => setForm((f) => ({ ...f, fundManager: e.target.value }))} />
            <Input label="AUM (₹ Cr)" type="number" value={form.aumCrores} onChange={(e) => setForm((f) => ({ ...f, aumCrores: e.target.value }))} />
            <Input label="Rating (1-5)" type="number" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))} />
            <Input label="Invest URL" value={form.investUrl} onChange={(e) => setForm((f) => ({ ...f, investUrl: e.target.value }))} />
          </div>
          <div className="space-y-2 border rounded-lg p-3">
            <Checkbox label="SIP available" checked={form.supportsSip} onChange={(e) => setForm((f) => ({ ...f, supportsSip: e?.target?.checked }))} />
            <Checkbox label="Lumpsum available" checked={form.supportsLumpsum} onChange={(e) => setForm((f) => ({ ...f, supportsLumpsum: e?.target?.checked }))} />
          </div>
          <textarea className="w-full min-h-[80px] rounded-lg border px-3 py-2 text-sm" placeholder="Features (one per line)" value={form.featuresText} onChange={(e) => setForm((f) => ({ ...f, featuresText: e.target.value }))} />
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update' : 'Add fund'}</Button>
            {editingId ? <Button variant="outline" onClick={() => { setEditingId(null); setForm({ ...EMPTY }); }}>Cancel</Button> : null}
          </div>
        </div>
        <div className="space-y-3 max-h-[85vh] overflow-y-auto">
          <h3 className="font-semibold">Published funds ({funds.length})</h3>
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {funds.map((fund) => (
            <div key={fund.id} className="bg-card border rounded-xl p-4 space-y-2">
              <p className="font-semibold">{fund.name}</p>
              <p className="text-sm text-muted-foreground">{fund.amcName} · {fund.fundManager || '—'}</p>
              <p className="text-xs">3Y {formatPercent(fund.returns3y)} · TER {fund.expenseRatio != null ? `${fund.expenseRatio}%` : '—'} · AUM {formatAum(fund.aumCrores)} · {formatRating(fund.rating)}</p>
              <div className="flex flex-wrap gap-1">{(fund.categories || []).map((s) => <span key={s} className="text-[10px] px-1.5 py-0.5 bg-muted rounded">{getCategoryLabel(s)}</span>)}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(fund)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={async () => { if (window.confirm('Delete?')) { await mutualFundService.remove(fund.id); load(); } }}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MutualFundsTab;
