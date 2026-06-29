import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { bankService } from '../../../services/apiServices';
import { creditCardService } from '../../../services/creditCardService';

const EMPTY_FORM = {
  bankId: '',
  bankName: '',
  name: '',
  description: '',
  logoUrl: '',
  cardNetwork: '',
  annualFee: '',
  joiningFee: '',
  interestRate: '',
  latePaymentFee: '',
  otherCharges: '',
  featuresText: '',
  advantagesText: '',
  benefitsText: '',
  applyUrl: '',
  displayPriority: '0',
  status: 'active',
};

function listToText(list) {
  if (!Array.isArray(list)) return '';
  return list.join('\n');
}

function formatInr(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return 'Free';
  return `₹${n.toLocaleString('en-IN')}`;
}

const CreditCardsTab = () => {
  const [cards, setCards] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const bankOptions = useMemo(
    () => [
      { value: '', label: '— Select bank —' },
      ...banks.map((b) => ({ value: b.id, label: b.name })),
    ],
    [banks],
  );

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [cardList, bankList] = await Promise.all([
        creditCardService.listAll(),
        bankService.getAllBanks().catch(() => []),
      ]);
      setCards(Array.isArray(cardList) ? cardList : []);
      setBanks(Array.isArray(bankList) ? bankList : []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load credit cards');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  const startEdit = (card) => {
    setEditingId(card.id);
    setForm({
      bankId: card.bankId || '',
      bankName: card.bankName || '',
      name: card.name || '',
      description: card.description || '',
      logoUrl: card.logoUrl || '',
      cardNetwork: card.cardNetwork || '',
      annualFee: card.annualFee != null ? String(card.annualFee) : '',
      joiningFee: card.joiningFee != null ? String(card.joiningFee) : '',
      interestRate: card.interestRate != null ? String(card.interestRate) : '',
      latePaymentFee: card.latePaymentFee || '',
      otherCharges: card.otherCharges || '',
      featuresText: listToText(card.features),
      advantagesText: listToText(card.advantages),
      benefitsText: listToText(card.benefits),
      applyUrl: card.applyUrl || '',
      displayPriority: String(card.displayPriority ?? 0),
      status: card.status || 'active',
    });
  };

  const handleBankChange = (bankId) => {
    const bank = banks.find((b) => b.id === bankId);
    setForm((prev) => ({
      ...prev,
      bankId,
      bankName: bank?.name || prev.bankName,
    }));
  };

  const buildPayload = () => ({
    bankId: form.bankId || null,
    bankName: form.bankName.trim(),
    name: form.name.trim(),
    description: form.description.trim() || null,
    logoUrl: form.logoUrl.trim() || null,
    cardNetwork: form.cardNetwork.trim() || null,
    annualFee: form.annualFee !== '' ? Number(form.annualFee) : null,
    joiningFee: form.joiningFee !== '' ? Number(form.joiningFee) : null,
    interestRate: form.interestRate !== '' ? Number(form.interestRate) : null,
    latePaymentFee: form.latePaymentFee.trim() || null,
    otherCharges: form.otherCharges.trim() || null,
    features: creditCardService.formatListField(form.featuresText),
    advantages: creditCardService.formatListField(form.advantagesText),
    benefits: creditCardService.formatListField(form.benefitsText),
    applyUrl: form.applyUrl.trim() || null,
    displayPriority: Number(form.displayPriority) || 0,
    status: form.status,
  });

  const handleSave = async () => {
    if (!form.bankName.trim() || !form.name.trim()) {
      setError('Bank name and card name are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = buildPayload();
      if (editingId) await creditCardService.update(editingId, payload);
      else await creditCardService.create(payload);
      resetForm();
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this credit card?')) return;
    setError('');
    try {
      await creditCardService.remove(id);
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Credit Cards</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add credit cards with features, charges, and bank apply links for customer and agent dashboards.
        </p>
      </div>

      {error ? (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-foreground">{editingId ? 'Edit credit card' : 'Add credit card'}</h3>

          <Select label="Bank" options={bankOptions} value={form.bankId} onChange={handleBankChange} />
          <Input label="Bank name" value={form.bankName} onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))} required />
          <Input label="Card name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Input label="Logo URL" value={form.logoUrl} onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))} placeholder="https://..." />
          <Input label="Card network" value={form.cardNetwork} onChange={(e) => setForm((f) => ({ ...f, cardNetwork: e.target.value }))} placeholder="Visa / Mastercard / RuPay" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Annual fee (₹)" type="number" value={form.annualFee} onChange={(e) => setForm((f) => ({ ...f, annualFee: e.target.value }))} />
            <Input label="Joining fee (₹)" type="number" value={form.joiningFee} onChange={(e) => setForm((f) => ({ ...f, joiningFee: e.target.value }))} />
            <Input label="Interest rate (%)" type="number" value={form.interestRate} onChange={(e) => setForm((f) => ({ ...f, interestRate: e.target.value }))} />
          </div>

          <Input label="Late payment fee" value={form.latePaymentFee} onChange={(e) => setForm((f) => ({ ...f, latePaymentFee: e.target.value }))} />
          <Input label="Other charges" value={form.otherCharges} onChange={(e) => setForm((f) => ({ ...f, otherCharges: e.target.value }))} />

          <label className="block text-sm font-medium text-foreground">Features (one per line)</label>
          <textarea
            className="w-full min-h-[96px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={form.featuresText}
            onChange={(e) => setForm((f) => ({ ...f, featuresText: e.target.value }))}
            placeholder="5% cashback on dining&#10;Airport lounge access"
          />
          <label className="block text-sm font-medium text-foreground">Advantages (one per line)</label>
          <textarea
            className="w-full min-h-[96px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={form.advantagesText}
            onChange={(e) => setForm((f) => ({ ...f, advantagesText: e.target.value }))}
          />
          <label className="block text-sm font-medium text-foreground">Benefits (one per line)</label>
          <textarea
            className="w-full min-h-[96px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={form.benefitsText}
            onChange={(e) => setForm((f) => ({ ...f, benefitsText: e.target.value }))}
          />

          <Input
            label="Bank apply link"
            value={form.applyUrl}
            onChange={(e) => setForm((f) => ({ ...f, applyUrl: e.target.value }))}
            placeholder="https://bank.com/apply-credit-card"
            description="Customers click Apply to open this URL on the bank website"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Display priority" type="number" value={form.displayPriority} onChange={(e) => setForm((f) => ({ ...f, displayPriority: e.target.value }))} />
            <Select
              label="Status"
              value={form.status}
              onChange={(v) => setForm((f) => ({ ...f, status: v }))}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update card' : 'Add card'}</Button>
            {editingId ? <Button variant="outline" onClick={resetForm}>Cancel</Button> : null}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Published cards ({cards.length})</h3>
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {!loading && cards.length === 0 ? <p className="text-sm text-muted-foreground">No credit cards yet.</p> : null}
          {cards.map((card) => (
            <div key={card.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{card.name}</p>
                  <p className="text-sm text-muted-foreground">{card.bankName}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${card.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {card.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Annual fee: {formatInr(card.annualFee)} · Joining: {formatInr(card.joiningFee)}
              </p>
              {card.applyUrl ? (
                <a href={card.applyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary inline-flex items-center gap-1">
                  Apply link <Icon name="ExternalLink" size={12} />
                </a>
              ) : null}
              <div className="flex gap-2 mt-1">
                <Button size="sm" variant="outline" onClick={() => startEdit(card)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(card.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreditCardsTab;
