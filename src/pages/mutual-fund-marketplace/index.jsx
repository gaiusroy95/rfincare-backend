import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MarketplacePageShell from '../../components/layout/MarketplacePageShell';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MutualFundFilterPanel from '../../components/mutual-funds/MutualFundFilterPanel';
import MutualFundProductCard from '../../components/mutual-funds/MutualFundProductCard';
import MutualFundSipModal from '../../components/mutual-funds/MutualFundSipModal';
import MarketplaceHero from '../../components/marketplace/MarketplaceHero';
import MarketplaceProductGrid from '../../components/marketplace/MarketplaceProductGrid';
import MarketplaceLeadWizard from '../../components/marketplace/MarketplaceLeadWizard';
import MarketplaceSideBySideCompare from '../../components/marketplace/compare/MarketplaceSideBySideCompare';
import MutualFundCalculatorPanel from '../../components/mutual-funds/MutualFundCalculatorPanel';
import { mutualFundService } from '../../services/mutualFundService';
import { MUTUAL_FUND_PRODUCT_GRID } from '../../constants/marketplaceLeadFlow';
import {
  DEFAULT_MUTUAL_FUND_FILTERS,
  MF_SORT_OPTIONS,
} from '../../constants/mutualFundMarketplace';
import {
  resetMutualFundFilters,
  sortMutualFunds,
  filterByMinInvestment,
} from '../../utils/mutualFundFilters';
import { loadMarketplaceProfile, saveMarketplaceProfile } from '../../utils/marketplaceLeadSession';
import GuestResumeBanner from '../../components/GuestResumeBanner';
import {
  listMarketplaceResumeSessions,
  loadCompareBasket,
  loadCalculatorSession,
} from '../../utils/guestSessionResume';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const MAX_COMPARE = 3;
const PAGE_SIZE = 8;

const MutualFundMarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState(() => loadMarketplaceProfile('mutual_funds'));
  const [showCatalog, setShowCatalog] = useState(() => Boolean(loadMarketplaceProfile('mutual_funds')));
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sipFund, setSipFund] = useState(null);
  const [initialSipAmount, setInitialSipAmount] = useState(null);
  const [latestSipOrder, setLatestSipOrder] = useState(null);
  const [sortBy, setSortBy] = useState('returns3y-desc');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [resumeSessions, setResumeSessions] = useState(() => listMarketplaceResumeSessions('mutual_funds'));
  const refreshResumeSessions = () => setResumeSessions(listMarketplaceResumeSessions('mutual_funds'));
  const [filters, setFilters] = useState(() => {
    const saved = loadMarketplaceProfile('mutual_funds');
    return {
      ...DEFAULT_MUTUAL_FUND_FILTERS,
      categoryGroup: saved?.productCategory || searchParams.get('category') || 'all',
    };
  });

  const debouncedFilters = useDebouncedValue(filters, 350);

  const loadFunds = useCallback(async () => {
    if (!showCatalog) return;
    setLoading(true);
    try {
      const list = await mutualFundService.listActive(debouncedFilters);
      setFunds(Array.isArray(list) ? list : []);
    } catch {
      setFunds([]);
    }
    setLoading(false);
  }, [debouncedFilters, showCatalog]);

  useEffect(() => { loadFunds(); }, [loadFunds]);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [debouncedFilters, sortBy]);

  const displayedFunds = useMemo(() => {
    const filtered = filterByMinInvestment(funds, filters.minInvestment);
    return sortMutualFunds(filtered, sortBy);
  }, [funds, filters.minInvestment, sortBy]);

  const visibleFunds = displayedFunds.slice(0, visibleCount);
  const compareFunds = displayedFunds.filter((f) => selected.includes(f.id));

  useEffect(() => {
    const sipParam = searchParams.get('sip');
    if (sipParam) {
      const amount = Number(sipParam);
      if (Number.isFinite(amount) && amount > 0) setInitialSipAmount(amount);
    }
    const calcSession = loadCalculatorSession('sip');
    if (calcSession?.form?.monthlyInvestment) {
      const amount = Number(calcSession.form.monthlyInvestment);
      if (Number.isFinite(amount) && amount > 0) setInitialSipAmount(amount);
    }
  }, [searchParams]);

  useEffect(() => {
    const sipId = searchParams.get('sipId');
    const sipToken = searchParams.get('sipToken');
    if (!sipId || !sipToken) return;
    let cancelled = false;
    (async () => {
      try {
        let order = await mutualFundService.getSipOrder(sipId, sipToken);
        if (order?.status === 'created') {
          try {
            order = await mutualFundService.confirmSipMandate(sipId, sipToken);
          } catch {
            /* best-effort */
          }
        }
        if (!cancelled) {
          setLatestSipOrder(order);
          setShowCatalog(true);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => { cancelled = true; };
  }, [searchParams]);

  useEffect(() => {
    if (!showCatalog || funds.length === 0) return;
    const saved = loadCompareBasket('mutual_funds');
    if (!saved?.selectedIds?.length) return;
    const validIds = saved.selectedIds.filter((id) => funds.some((f) => f.id === id));
    if (validIds.length >= 2) {
      setSelected(validIds);
      setShowCompare(true);
    }
  }, [showCatalog, funds]);

  useEffect(() => {
    if (searchParams.get('calculator') !== '1') return;
    const timer = setTimeout(() => {
      document.getElementById(showCatalog ? 'mf-calculator' : 'mf-calculator-landing')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
    return () => clearTimeout(timer);
  }, [searchParams, showCatalog]);

  const handleProductSelect = (item) => {
    if (profile?.verifiedAt) {
      setFilters((prev) => ({ ...prev, categoryGroup: item.slug }));
      setShowCatalog(true);
      return;
    }
    setPendingProduct(item);
    setWizardOpen(true);
  };

  const handleWizardComplete = (completedProfile) => {
    const saved = saveMarketplaceProfile('mutual_funds', {
      ...completedProfile,
      productCategory: pendingProduct?.slug || completedProfile.productCategory,
      productLabel: pendingProduct?.label || completedProfile.productLabel,
    });
    setProfile(saved);
    setFilters((prev) => ({ ...prev, categoryGroup: saved.productCategory || prev.categoryGroup }));
    setWizardOpen(false);
    setPendingProduct(null);
    setShowCatalog(true);
  };

  const handleStartSip = (fund) => {
    if (!profile?.verifiedAt) {
      setPendingProduct({ slug: fund.category || 'all', label: fund.name });
      setWizardOpen(true);
      return;
    }
    setSipFund(fund);
  };

  const handleViewDetails = (fund) => {
    if (fund?.investUrl) {
      window.open(fund.investUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    handleStartSip(fund);
  };

  const handleSipComplete = (order) => {
    setLatestSipOrder(order);
    const next = new URLSearchParams(searchParams);
    next.set('sipId', order.orderId);
    next.set('sipToken', order.publicToken);
    setSearchParams(next, { replace: true });
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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {!showCatalog ? (
        <div className="min-h-screen bg-[#f8faf9]">
          <Header />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">
            {resumeSessions.length > 0 ? (
              <GuestResumeBanner sessions={resumeSessions} onDismiss={refreshResumeSessions} />
            ) : null}
            <MarketplaceHero type="mutual_funds" onCtaClick={() => handleProductSelect(MUTUAL_FUND_PRODUCT_GRID[0])} />
            <div id="mf-calculator-landing">
              <MutualFundCalculatorPanel />
            </div>
            <MarketplaceProductGrid
              items={MUTUAL_FUND_PRODUCT_GRID}
              onSelect={handleProductSelect}
              title="Choose your investment category"
              subtitle="Select a fund type to get personalised recommendations"
            />
            <div className="text-center">
              <Button variant="outline" onClick={() => {
                if (profile?.verifiedAt) setShowCatalog(true);
                else {
                  setPendingProduct({ slug: 'all', label: 'All Mutual Funds' });
                  setWizardOpen(true);
                }
              }}>
                View all funds
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <MarketplacePageShell
          breadcrumbs={[
            { label: 'Home', path: '/homepage' },
            { label: 'Investments', path: '/investment-marketplace' },
            { label: 'Mutual Funds' },
          ]}
          title="Mutual Funds"
          subtitle="Invest in the right mutual funds and grow your wealth"
          benefits={[
            { icon: 'Star', label: 'Expert Curated Funds', sub: 'Top-rated picks' },
            { icon: 'GitCompare', label: 'Compare & Invest', sub: 'Side-by-side analysis' },
            { icon: 'TrendingUp', label: 'High Returns Potential', sub: 'Equity & hybrid funds' },
            { icon: 'ShieldCheck', label: 'Safe & Secure', sub: 'SEBI registered AMCs' },
          ]}
          ctaTitle="Not sure which fund to choose?"
          ctaDescription="Get free expert advice and find the best mutual funds for your goals."
          resultCount={null}
          footer
          filterSidebar={(
            <MutualFundFilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={() => setFilters(resetMutualFundFilters())}
              onApply={() => setIsFilterOpen(false)}
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)}
              resultCount={displayedFunds.length}
            />
          )}
        >
          {latestSipOrder && (
            <p className={`text-xs mb-4 inline-flex items-center gap-1 rounded-full px-3 py-1 border ${
              latestSipOrder.status === 'mandate_pending'
                ? 'text-amber-700 bg-amber-50 border-amber-200'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}>
              <Icon name={latestSipOrder.status === 'mandate_pending' ? 'Clock' : 'CheckCircle2'} size={14} />
              SIP: ₹{Number(latestSipOrder.sipAmount).toLocaleString('en-IN')}/mo · {latestSipOrder.fundName}
            </p>
          )}

          <div className="rf-mf-results-bar">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{displayedFunds.length}</span> Mutual Funds
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rf-mf-sort-select"
              >
                {MF_SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {selected.length > 0 && (
            <div className="rf-mf-compare-banner">
              <span>
                <strong>{selected.length}</strong> fund{selected.length === 1 ? '' : 's'} selected for comparison
              </span>
              <div className="flex gap-2">
                {selected.length >= 2 ? (
                  <Button size="sm" className="rf-btn-primary" onClick={() => setShowCompare(true)}>
                    Compare Now
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={() => { setSelected([]); setShowCompare(false); }}>
                  Clear
                </Button>
              </div>
            </div>
          )}

          {showCompare && compareFunds.length >= 2 ? (
            <div className="mb-6">
              <MarketplaceSideBySideCompare
                type="mutual_fund"
                products={compareFunds}
                onRemove={(id) => toggleSelect(id)}
                onClear={() => { setSelected([]); setShowCompare(false); }}
                onApply={handleStartSip}
                title="Mutual fund comparison"
              />
            </div>
          ) : null}

          {loading ? (
            <div className="text-center py-16 text-muted-foreground">Loading mutual funds…</div>
          ) : displayedFunds.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Icon name="Search" size={40} className="mx-auto text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No funds match your filters.</p>
              <Button variant="outline" size="sm" onClick={() => setFilters(resetMutualFundFilters())}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleFunds.map((fund) => (
                <MutualFundProductCard
                  key={fund.id}
                  fund={fund}
                  selected={selected.includes(fund.id)}
                  onToggleCompare={toggleSelect}
                  onInvest={handleStartSip}
                  onViewDetails={handleViewDetails}
                />
              ))}

              {visibleCount < displayedFunds.length ? (
                <button
                  type="button"
                  className="rf-mf-view-more"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                >
                  View More Funds
                  <Icon name="ChevronDown" size={18} />
                </button>
              ) : null}
            </div>
          )}
        </MarketplacePageShell>
      )}

      <MarketplaceLeadWizard
        open={wizardOpen}
        onClose={() => { setWizardOpen(false); setPendingProduct(null); }}
        onComplete={handleWizardComplete}
        marketplaceType="mutual_funds"
        productLabel={pendingProduct?.label}
        productCategory={pendingProduct?.slug}
      />

      <MutualFundSipModal
        open={Boolean(sipFund)}
        onClose={() => setSipFund(null)}
        fund={sipFund}
        profile={profile}
        initialSipAmount={initialSipAmount}
        onComplete={handleSipComplete}
      />
    </>
  );
};

export default MutualFundMarketplacePage;
