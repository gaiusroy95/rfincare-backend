import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MarketplacePageShell from '../../components/layout/MarketplacePageShell';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MutualFundCategoryBar from '../../components/mutual-funds/MutualFundCategoryBar';
import MutualFundFilterPanel from '../../components/mutual-funds/MutualFundFilterPanel';
import MutualFundSipModal from '../../components/mutual-funds/MutualFundSipModal';
import MarketplaceHero from '../../components/marketplace/MarketplaceHero';
import MarketplaceProductGrid from '../../components/marketplace/MarketplaceProductGrid';
import MarketplaceLeadWizard from '../../components/marketplace/MarketplaceLeadWizard';
import MarketplaceCompareBoard from '../../components/marketplace/compare/MarketplaceCompareBoard';
import MutualFundCalculatorPanel from '../../components/mutual-funds/MutualFundCalculatorPanel';
import { mutualFundService } from '../../services/mutualFundService';
import { resolveBankLogoUrl } from '../../utils/bankBranding';
import { MUTUAL_FUND_PRODUCT_GRID } from '../../constants/marketplaceLeadFlow';
import {
  DEFAULT_MUTUAL_FUND_FILTERS,
  getRiskLabel,
} from '../../constants/mutualFundMarketplace';
import {
  formatPercent,
  resetMutualFundFilters,
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
  const [resumeSessions, setResumeSessions] = useState(() => listMarketplaceResumeSessions('mutual_funds'));
  const refreshResumeSessions = () => setResumeSessions(listMarketplaceResumeSessions('mutual_funds'));
  const [filters, setFilters] = useState(() => {
    const saved = loadMarketplaceProfile('mutual_funds');
    return {
      ...DEFAULT_MUTUAL_FUND_FILTERS,
      category: saved?.productCategory || searchParams.get('category') || 'all',
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
    if (!showCatalog) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (filters.category !== 'all') next.set('category', filters.category);
      else next.delete('category');
      return next;
    }, { replace: true });
  }, [filters.category, setSearchParams, showCatalog]);

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
      setFilters((prev) => ({ ...prev, category: item.slug }));
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
    setFilters((prev) => ({ ...prev, category: saved.productCategory || prev.category }));
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
            resultCount={`${funds.length} Mutual Funds`}
            sortControl={(
              <select className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white">
                <option>3Y Returns (High to Low)</option>
                <option>Expense Ratio (Low to High)</option>
              </select>
            )}
            filterSidebar={(
              <MutualFundFilterPanel
                filters={filters}
                onFilterChange={(key, value) => setFilters((p) => ({ ...p, [key]: value }))}
                onReset={() => setFilters(resetMutualFundFilters())}
                isOpen={isFilterOpen}
                onToggle={() => setIsFilterOpen(!isFilterOpen)}
                resultCount={funds.length}
              />
            )}
            footer={false}
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

            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={() => setShowCatalog(false)}>
                <Icon name="LayoutGrid" size={16} className="mr-1" /> Browse categories
              </Button>
            </div>

            <div id="mf-calculator" className="mb-6">
              <MutualFundCalculatorPanel />
            </div>

            <MutualFundCategoryBar activeCategory={filters.category} onCategoryChange={(slug) => setFilters((p) => ({ ...p, category: slug }))} />

            {loading ? (
              <div className="text-center py-16 text-muted-foreground">Loading mutual funds…</div>
            ) : (
              <MarketplaceCompareBoard
                    type="mutual_fund"
                    products={funds}
                    selectedIds={selected}
                    onToggleSelect={toggleSelect}
                    onClearSelection={() => { setSelected([]); setShowCompare(false); }}
                    onApply={(fund) => handleStartSip(fund)}
                    showCompare={showCompare}
                    title="Mutual fund comparison"
                    emptyMessage="No funds match your filters."
                    renderGridCard={(fund, isSelected) => (
                      <div key={fund.id} className={`bg-card border rounded-xl p-5 flex flex-col gap-3 ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold">{fund.name}</p>
                            <p className="text-sm text-muted-foreground">{fund.amcName}</p>
                          </div>
                          <button type="button" onClick={() => toggleSelect(fund.id)} className={`text-xs font-semibold px-2 py-1 rounded-full border ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>
                            {isSelected ? 'Selected' : 'Compare'}
                          </button>
                        </div>
                        {fund.returns3y != null ? <span className="text-xs">3Y: <strong className="text-success">{formatPercent(fund.returns3y)}</strong></span> : null}
                        <Button
                          className="mt-auto w-full rf-btn-primary"
                          onClick={() => handleStartSip(fund)}
                        >
                          Start SIP
                          <Icon name="TrendingUp" size={14} className="ml-1.5" />
                        </Button>
                        {fund.investUrl ? (
                          <a href={fund.investUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 w-full py-2 text-sm text-muted-foreground hover:text-primary">
                            Or invest on AMC site <Icon name="ExternalLink" size={14} />
                          </a>
                        ) : null}
                      </div>
                    )}
                  />
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
