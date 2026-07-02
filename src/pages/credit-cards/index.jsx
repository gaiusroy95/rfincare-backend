import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import CreditCardCategoryBar from '../../components/credit-cards/CreditCardCategoryBar';
import CreditCardFilterPanel from '../../components/credit-cards/CreditCardFilterPanel';
import MarketplaceCompareBoard from '../../components/marketplace/compare/MarketplaceCompareBoard';
import { creditCardService } from '../../services/creditCardService';
import { resolveCreditCardLogo } from '../../utils/creditCardMarketplace';
import {
  DEFAULT_CREDIT_CARD_FILTERS,
  getCategoryLabel,
} from '../../constants/creditCardMarketplace';
import {
  countActiveFilters,
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
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        if (next.length < 2) setShowCompare(false);
        return next;
      }
      if (prev.length >= MAX_COMPARE) return prev;
      const next = [...prev, id];
      if (next.length >= 2) setShowCompare(true);
      return next;
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
            {loading ? (
              <div className="text-center py-16 text-muted-foreground">Loading credit cards…</div>
            ) : (
              <MarketplaceCompareBoard
                type="credit_card"
                products={cards}
                selectedIds={selected}
                onToggleSelect={toggleSelect}
                onClearSelection={() => { setSelected([]); setShowCompare(false); }}
                showCompare={showCompare}
                title="Credit card comparison"
                emptyMessage="No credit cards match your filters."
                renderGridCard={(card, isSelected) => {
                  const lifetimeFree = Number(card.annualFee) === 0;
                  return (
                    <div
                      key={card.id}
                      className={`bg-card border rounded-xl p-5 flex flex-col gap-3 ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
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
                            <p className="font-bold">{card.name}</p>
                            <p className="text-sm text-muted-foreground">{card.bankName}</p>
                            {lifetimeFree ? <span className="text-[10px] font-bold text-success">LIFETIME FREE</span> : null}
                          </div>
                        </div>
                        <button type="button" onClick={() => toggleSelect(card.id)} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>
                          {isSelected ? 'Selected' : 'Compare'}
                        </button>
                      </div>
                      <div className="text-xs text-muted-foreground">Annual: {formatCardFee(card.annualFee)} · Joining: {formatCardFee(card.joiningFee)}</div>
                      {card.applyUrl ? (
                        <a href={card.applyUrl} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold">
                          Apply <Icon name="ExternalLink" size={14} />
                        </a>
                      ) : null}
                    </div>
                  );
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardsPage;
