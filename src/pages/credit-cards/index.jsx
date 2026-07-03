import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MarketplacePageShell from '../../components/layout/MarketplacePageShell';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import CreditCardCategoryBar from '../../components/credit-cards/CreditCardCategoryBar';
import CreditCardFilterPanel from '../../components/credit-cards/CreditCardFilterPanel';
import MarketplaceCompareBoard from '../../components/marketplace/compare/MarketplaceCompareBoard';
import MarketplaceLeadWizard from '../../components/marketplace/MarketplaceLeadWizard';
import { creditCardService } from '../../services/creditCardService';
import { resolveCreditCardLogo } from '../../utils/creditCardMarketplace';
import { completeCreditCardApply } from '../../utils/creditCardApplyFlow';
import { loadMarketplaceProfile, saveMarketplaceProfile } from '../../utils/marketplaceLeadSession';
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
  const [profile, setProfile] = useState(() => loadMarketplaceProfile('credit_card'));
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pendingCard, setPendingCard] = useState(null);

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

  const handleCreditCardApply = useCallback(async (card) => {
    if (!card?.applyUrl) return;

    const activeProfile = profile || loadMarketplaceProfile('credit_card');
    if (!activeProfile?.verifiedAt) {
      setPendingCard(card);
      setWizardOpen(true);
      return;
    }

    await completeCreditCardApply(card, activeProfile);
  }, [profile]);

  const handleWizardComplete = useCallback(async (completedProfile) => {
    const saved = saveMarketplaceProfile('credit_card', {
      ...completedProfile,
      productLabel: pendingCard?.name || completedProfile.productLabel,
    });
    setProfile(saved);
    setWizardOpen(false);
    const card = pendingCard;
    setPendingCard(null);
    if (card) {
      await completeCreditCardApply(card, saved);
    }
  }, [pendingCard]);

  return (
    <>
    <MarketplacePageShell
      breadcrumbs={[
        { label: 'Home', path: '/homepage' },
        { label: 'Credit Cards' },
      ]}
      title="Credit Cards"
      subtitle="Compare and apply for the best credit cards from leading banks"
      benefits={[
        { icon: 'Gift', label: 'Exclusive Rewards', sub: 'Earn on every spend' },
        { icon: 'BadgeIndianRupee', label: 'Zero Joining Fees', sub: 'On select cards' },
        { icon: 'Zap', label: 'Instant Approval', sub: 'Digital KYC' },
        { icon: 'ShieldCheck', label: 'Secure Payments', sub: 'Bank-grade security' },
      ]}
      resultCount={`${cards.length} Credit Cards`}
      sortControl={(
        <select className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white">
          <option>Recommended</option>
          <option>Lowest Annual Fee</option>
          <option>Highest Rewards</option>
        </select>
      )}
      ctaTitle="Not sure which card is right for you?"
      ctaDescription="Answer a few questions and we'll recommend the best credit card for your spending habits."
      ctaButtonLabel="Find My Best Card"
      onCtaClick={() => navigate('/contact-us')}
      filterSidebar={(
        <CreditCardFilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
          resultCount={cards.length}
        />
      )}
    >
        {profile?.fullName ? (
          <p className="text-xs text-emerald-700 mb-4 inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
            <Icon name="CheckCircle2" size={14} />
            Verified: {profile.phone} · {profile.email}
          </p>
        ) : null}

        <CreditCardCategoryBar
          activeCategory={filters.category}
          onCategoryChange={handleCategoryChange}
          counts={categoryCounts}
        />

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
                onApply={handleCreditCardApply}
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
                        <button
                          type="button"
                          onClick={() => handleCreditCardApply(card)}
                          className="mt-auto inline-flex items-center justify-center gap-1.5 w-full py-2.5 rf-btn-primary text-sm font-semibold rounded-lg"
                        >
                          Apply Now <Icon name="ChevronRight" size={14} />
                        </button>
                      ) : null}
                    </div>
                  );
                }}
              />
        )}
    </MarketplacePageShell>

      <MarketplaceLeadWizard
        open={wizardOpen}
        onClose={() => { setWizardOpen(false); setPendingCard(null); }}
        onComplete={handleWizardComplete}
        marketplaceType="credit_card"
        productLabel={pendingCard?.name}
        productCategory={pendingCard?.categories?.[0]}
      />
    </>
  );
};

export default CreditCardsPage;
