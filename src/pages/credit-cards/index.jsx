import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { creditCardService } from '../../services/creditCardService';

function formatInr(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return 'Free';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

const MAX_COMPARE = 3;

const CreditCardsPage = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    creditCardService
      .listActive()
      .then((list) => setCards(Array.isArray(list) ? list : []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, []);

  const compareCards = useMemo(
    () => cards.filter((c) => selected.includes(c.id)),
    [cards, selected],
  );

  const toggleSelect = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading credit cards…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Credit Cards</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select up to {MAX_COMPARE} cards to compare features, charges, and benefits.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <span className="text-sm font-medium text-foreground">{selected.length} selected for compare</span>
            <Button size="sm" onClick={() => setShowCompare(true)} disabled={selected.length < 2}>
              Compare selected
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setSelected([]); setShowCompare(false); }}>
              Clear
            </Button>
          </div>
        )}

        {showCompare && compareCards.length >= 2 ? (
          <div className="overflow-x-auto border border-border rounded-xl bg-card">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left p-4 font-semibold">Compare</th>
                  {compareCards.map((card) => (
                    <th key={card.id} className="text-left p-4 font-semibold min-w-[200px]">
                      <div>{card.name}</div>
                      <div className="text-xs font-normal text-muted-foreground">{card.bankName}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Annual fee', render: (c) => formatInr(c.annualFee) },
                  { label: 'Joining fee', render: (c) => formatInr(c.joiningFee) },
                  { label: 'Interest rate', render: (c) => (c.interestRate != null ? `${c.interestRate}%` : '—') },
                  { label: 'Late payment fee', render: (c) => c.latePaymentFee || '—' },
                  { label: 'Other charges', render: (c) => c.otherCharges || '—' },
                  { label: 'Network', render: (c) => c.cardNetwork || '—' },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-border">
                    <td className="p-4 font-medium text-muted-foreground">{row.label}</td>
                    {compareCards.map((card) => (
                      <td key={card.id} className="p-4 align-top">{row.render(card)}</td>
                    ))}
                  </tr>
                ))}
                {['features', 'advantages', 'benefits'].map((field) => (
                  <tr key={field} className="border-b border-border">
                    <td className="p-4 font-medium text-muted-foreground capitalize">{field}</td>
                    {compareCards.map((card) => (
                      <td key={card.id} className="p-4 align-top">
                        <ul className="list-disc pl-4 space-y-1">
                          {(card[field] || []).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="p-4 font-medium text-muted-foreground">Apply</td>
                  {compareCards.map((card) => (
                    <td key={card.id} className="p-4">
                      {card.applyUrl ? (
                        <a
                          href={card.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90"
                        >
                          Apply on bank site
                          <Icon name="ExternalLink" size={14} />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => {
            const isSelected = selected.includes(card.id);
            return (
              <div
                key={card.id}
                className={`bg-card border rounded-xl p-5 flex flex-col gap-3 transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-foreground">{card.name}</p>
                    <p className="text-sm text-muted-foreground">{card.bankName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSelect(card.id)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}
                  >
                    {isSelected ? 'Selected' : 'Compare'}
                  </button>
                </div>
                {card.description ? <p className="text-sm text-muted-foreground line-clamp-2">{card.description}</p> : null}
                <p className="text-xs text-muted-foreground">
                  Annual fee: {formatInr(card.annualFee)} · Joining: {formatInr(card.joiningFee)}
                </p>
                {(card.features || []).slice(0, 2).map((f) => (
                  <p key={f} className="text-xs text-foreground">• {f}</p>
                ))}
                {card.applyUrl ? (
                  <a
                    href={card.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90"
                  >
                    Apply
                    <Icon name="ExternalLink" size={14} />
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>

        {cards.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No credit cards available yet.</p>
        ) : null}
      </div>
    </div>
  );
};

export default CreditCardsPage;
