import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import CreditCardCategoryBar from '../../components/credit-cards/CreditCardCategoryBar';
import CreditCardFilterPanel from '../../components/credit-cards/CreditCardFilterPanel';
import { creditCardService } from '../../services/creditCardService';
import { resolveCreditCardLogo } from '../../utils/creditCardMarketplace';
import {
  COMPARE_TABLE_ROWS,
  DEFAULT_CREDIT_CARD_FILTERS,
  getCategoryLabel,
} from '../../constants/creditCardMarketplace';
import {
  countActiveFilters,
  formatCompareCell,
  formatCardFee,
  resetCreditCardFilters,
} from '../../utils/creditCardFilters';

const MAX_COMPARE = 3;

const CreditCardsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_CREDIT_CARD_FILTERS,
    category: searchParams.get('category') || 'all',
  }));

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const list = await creditCardService.listActive(filters);
      setCards(Array.isArray(list) ? list : []);
    } catch {
      setCards([]);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  useEffect(() => {
    const cat = filters.category;
    if (cat && cat !== 'all') {
      setSearchParams({ category: cat }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [filters.category, setSearchParams]);

  const categoryCounts = useMemo(() => {
    const counts = { all: cards.length };
    for (const card of cards) {
      for (const slug of card.categories || []) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    }
    return counts;
  }, [cards]);

  const compareCards = useMemo(
    () => cards.filter((c) => selected.includes(c.id)),
    [cards, selected],
  );

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCategoryChange = (slug) => {
    setFilters((prev) => ({ ...prev, category: slug }));
  };

  const handleResetFilters = () => {
    setFilters(resetCreditCardFilters());
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const activeFilterCount = countActiveFilters(filters);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Credit Card Marketplace</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Compare cards by category — fees, rewards, lounge access, and more. Select up to {MAX_COMPARE} to compare side by side.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/bank-marketplace?loanType=credit_card')}>
            Bank marketplace view
          </Button>
        </div>

        <CreditCardCategoryBar
          activeCategory={filters.category}
          onCategoryChange={handleCategoryChange}
          counts={categoryCounts}
        />

        {filters.category !== 'all' ? (
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{getCategoryLabel(filters.category)}</span>
            {activeFilterCount > 0 ? ` · ${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'} active` : ''}
          </p>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="lg:col-span-1">
            <CreditCardFilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)}
              resultCount={cards.length}
            />
          </div>

          <div className="lg:col-span-3 space-y-6">
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
                      <th className="text-left p-4 font-semibold sticky left-0 bg-muted/40 z-10">Compare</th>
                      {compareCards.map((card) => (
                        <th key={card.id} className="text-left p-4 font-semibold min-w-[200px]">
                          <div>{card.name}</div>
                          <div className="text-xs font-normal text-muted-foreground">{card.bankName}</div>
                          {(card.categories || []).length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {card.categories.map((slug) => (
                                <span key={slug} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                  {getCategoryLabel(slug)}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_TABLE_ROWS.map((row) => (
                      <tr key={row.key} className="border-b border-border">
                        <td className="p-4 font-medium text-muted-foreground sticky left-0 bg-card z-10">{row.label}</td>
                        {compareCards.map((card) => (
                          <td key={card.id} className="p-4 align-top">{formatCompareCell(card, row)}</td>
                        ))}
                      </tr>
                    ))}
                    {['features', 'advantages', 'benefits'].map((field) => (
                      <tr key={field} className="border-b border-border">
                        <td className="p-4 font-medium text-muted-foreground capitalize sticky left-0 bg-card z-10">{field}</td>
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
                      <td className="p-4 font-medium text-muted-foreground sticky left-0 bg-card z-10">Apply</td>
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

            {loading ? (
              <div className="text-center py-16 text-muted-foreground">Loading credit cards…</div>
            ) : cards.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <Icon name="Search" size={40} className="mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">No credit cards match your filters.</p>
                <Button variant="outline" onClick={handleResetFilters}>Reset filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cards.map((card) => {
                  const isSelected = selected.includes(card.id);
                  const lifetimeFree = Number(card.annualFee) === 0;
                  return (
                    <div
                      key={card.id}
                      className={`bg-card border rounded-xl p-5 flex flex-col gap-3 transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                            {resolveCreditCardLogo(card) ? (
                              <img src={resolveCreditCardLogo(card)} alt={card.name} className="w-12 h-12 object-contain" />
                            ) : (
                              <Icon name="CreditCard" size={24} className="text-violet-700" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-foreground">{card.name}</p>
                              {lifetimeFree ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-success/10 text-success">LIFETIME FREE</span>
                              ) : null}
                            </div>
                            <p className="text-sm text-muted-foreground">{card.bankName}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSelect(card.id)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}
                        >
                          {isSelected ? 'Selected' : 'Compare'}
                        </button>
                      </div>

                      {(card.categories || []).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {card.categories.map((slug) => (
                            <span key={slug} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                              {getCategoryLabel(slug)}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {card.description ? <p className="text-sm text-muted-foreground line-clamp-2">{card.description}</p> : null}

                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>Annual: {formatCardFee(card.annualFee)}</span>
                        <span>Joining: {formatCardFee(card.joiningFee)}</span>
                        {card.rewardPoints ? <span className="col-span-2">Rewards: {card.rewardPoints}</span> : null}
                        {card.loungeAccess ? <span>Lounge access</span> : null}
                        {card.fuelSurchargeWaiver ? <span>Fuel waiver</span> : null}
                        {card.emiConversion ? <span>EMI conversion</span> : null}
                      </div>

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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardsPage;
