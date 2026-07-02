import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import MutualFundCategoryBar from '../../components/mutual-funds/MutualFundCategoryBar';
import MutualFundFilterPanel from '../../components/mutual-funds/MutualFundFilterPanel';
import MarketplaceHero from '../../components/marketplace/MarketplaceHero';
import MarketplaceProductGrid from '../../components/marketplace/MarketplaceProductGrid';
import MarketplaceLeadWizard from '../../components/marketplace/MarketplaceLeadWizard';
import MarketplaceCompareBoard from '../../components/marketplace/compare/MarketplaceCompareBoard';
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
  const [filters, setFilters] = useState(() => {
    const saved = loadMarketplaceProfile('mutual_funds');
    return {
      ...DEFAULT_MUTUAL_FUND_FILTERS,
      category: saved?.productCategory || searchParams.get('category') || 'all',
    };
  });

  const loadFunds = useCallback(async () => {
    if (!showCatalog) return;
    setLoading(true);
    try {
      const list = await mutualFundService.listActive(filters);
      setFunds(Array.isArray(list) ? list : []);
    } catch {
      setFunds([]);
    }
    setLoading(false);
  }, [filters, showCatalog]);

  useEffect(() => { loadFunds(); }, [loadFunds]);

  useEffect(() => {
    if (!showCatalog) return;
    if (filters.category !== 'all') setSearchParams({ category: filters.category }, { replace: true });
    else setSearchParams({}, { replace: true });
  }, [filters.category, setSearchParams, showCatalog]);

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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">
        {!showCatalog ? (
          <>
            <MarketplaceHero type="mutual_funds" onCtaClick={() => handleProductSelect(MUTUAL_FUND_PRODUCT_GRID[0])} />
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
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Mutual Fund Marketplace</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {profile?.productLabel
                    ? `Showing funds for ${profile.productLabel}`
                    : 'Compare SIP, ELSS, debt, equity, index, ETF & international funds.'}
                </p>
                {profile?.fullName ? (
                  <p className="text-xs text-emerald-700 mt-2 inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                    <Icon name="CheckCircle2" size={14} />
                    Verified: {profile.phone} · {profile.email}
                  </p>
                ) : null}
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowCatalog(false)}>
                <Icon name="LayoutGrid" size={16} className="mr-1" /> Browse categories
              </Button>
            </div>

            <MutualFundCategoryBar activeCategory={filters.category} onCategoryChange={(slug) => setFilters((p) => ({ ...p, category: slug }))} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="lg:col-span-1">
                <MutualFundFilterPanel
                  filters={filters}
                  onFilterChange={(key, value) => setFilters((p) => ({ ...p, [key]: value }))}
                  onReset={() => setFilters(resetMutualFundFilters())}
                  isOpen={isFilterOpen}
                  onToggle={() => setIsFilterOpen(!isFilterOpen)}
                  resultCount={funds.length}
                />
              </div>

              <div className="lg:col-span-3 space-y-6">
                {loading ? (
                  <div className="text-center py-16 text-muted-foreground">Loading mutual funds…</div>
                ) : (
                  <MarketplaceCompareBoard
                    type="mutual_fund"
                    products={funds}
                    selectedIds={selected}
                    onToggleSelect={toggleSelect}
                    onClearSelection={() => { setSelected([]); setShowCompare(false); }}
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
                        {fund.investUrl ? (
                          <a href={fund.investUrl} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold">
                            Invest Now <Icon name="ExternalLink" size={14} />
                          </a>
                        ) : null}
                      </div>
                    )}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <MarketplaceLeadWizard
        open={wizardOpen}
        onClose={() => { setWizardOpen(false); setPendingProduct(null); }}
        onComplete={handleWizardComplete}
        marketplaceType="mutual_funds"
        productLabel={pendingProduct?.label}
        productCategory={pendingProduct?.slug}
      />
    </div>
  );
};

export default MutualFundMarketplacePage;
