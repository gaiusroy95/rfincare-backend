import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import InsuranceSegmentBar, { InsuranceCategoryBar } from '../../components/insurance/InsuranceSegmentBar';
import InsuranceFilterPanel from '../../components/insurance/InsuranceFilterPanel';
import InsurancePurchaseModal from '../../components/insurance/InsurancePurchaseModal';
import MarketplaceHero from '../../components/marketplace/MarketplaceHero';
import MarketplaceProductGrid from '../../components/marketplace/MarketplaceProductGrid';
import MarketplaceLeadWizard from '../../components/marketplace/MarketplaceLeadWizard';
import MarketplaceCompareBoard from '../../components/marketplace/compare/MarketplaceCompareBoard';
import { insuranceService } from '../../services/insuranceService';
import { resolveBankLogoUrl } from '../../utils/bankBranding';
import { INSURANCE_PRODUCT_GRID } from '../../constants/marketplaceLeadFlow';
import {
  DEFAULT_INSURANCE_FILTERS,
  INSURANCE_SERVICES,
} from '../../constants/insuranceMarketplace';
import {
  formatPremiumRange,
  formatSumInsuredRange,
  getServiceUrl,
  resetInsuranceFilters,
} from '../../utils/insuranceFilters';
import { loadMarketplaceProfile, saveMarketplaceProfile } from '../../utils/marketplaceLeadSession';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const MAX_COMPARE = 3;

function resolveLogo(product) {
  return resolveBankLogoUrl(product?.logoUrl) || null;
}

const InsuranceMarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState(() => loadMarketplaceProfile('insurance'));
  const [showCatalog, setShowCatalog] = useState(() => Boolean(loadMarketplaceProfile('insurance')));
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [purchaseProduct, setPurchaseProduct] = useState(null);
  const [latestPurchase, setLatestPurchase] = useState(null);
  const [filters, setFilters] = useState(() => {
    const saved = loadMarketplaceProfile('insurance');
    return {
      ...DEFAULT_INSURANCE_FILTERS,
      segment: saved?.productSegment || searchParams.get('segment') || 'all',
      category: saved?.productCategory || searchParams.get('category') || 'all',
      service: searchParams.get('service') || 'all',
    };
  });

  const debouncedFilters = useDebouncedValue(filters, 350);

  const loadProducts = useCallback(async () => {
    if (!showCatalog) return;
    setLoading(true);
    try {
      const list = await insuranceService.listActive(debouncedFilters);
      setProducts(Array.isArray(list) ? list : []);
    } catch {
      setProducts([]);
    }
    setLoading(false);
  }, [debouncedFilters, showCatalog]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!showCatalog) return;
    const params = {};
    if (filters.segment !== 'all') params.segment = filters.segment;
    if (filters.category !== 'all') params.category = filters.category;
    if (filters.service !== 'all') params.service = filters.service;
    setSearchParams(params, { replace: true });
  }, [filters.segment, filters.category, filters.service, setSearchParams, showCatalog]);

  const handleProductSelect = (item) => {
    if (profile?.verifiedAt) {
      setFilters((prev) => ({
        ...prev,
        segment: item.segment || prev.segment,
        category: item.slug,
      }));
      setShowCatalog(true);
      return;
    }
    setPendingProduct(item);
    setWizardOpen(true);
  };

  const handleWizardComplete = (completedProfile) => {
    const saved = saveMarketplaceProfile('insurance', {
      ...completedProfile,
      productCategory: pendingProduct?.slug || completedProfile.productCategory,
      productSegment: pendingProduct?.segment || completedProfile.productSegment,
      productLabel: pendingProduct?.label || completedProfile.productLabel,
    });
    setProfile(saved);
    setFilters((prev) => ({
      ...prev,
      segment: saved.productSegment && saved.productSegment !== 'all' ? saved.productSegment : prev.segment,
      category: saved.productCategory && saved.productCategory !== 'all' ? saved.productCategory : 'all',
    }));
    setWizardOpen(false);
    setPendingProduct(null);
    setShowCatalog(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'segment') next.category = 'all';
      return next;
    });
  };

  const handleSegmentChange = (slug) => {
    setFilters((prev) => ({ ...prev, segment: slug, category: 'all' }));
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

  const activeService = filters.service !== 'all' ? filters.service : 'new_policy';
  const canUseInternalCheckout = (product) =>
    activeService === 'new_policy' && product?.purchaseEnabled;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">
        {!showCatalog ? (
          <>
            <MarketplaceHero type="insurance" onCtaClick={() => handleProductSelect(INSURANCE_PRODUCT_GRID[1])} />
            <MarketplaceProductGrid
              items={INSURANCE_PRODUCT_GRID}
              onSelect={handleProductSelect}
              title="Choose your insurance product"
              subtitle="Select a category to get personalised quotes from top insurers"
            />
            <div className="text-center">
              <Button variant="outline" onClick={() => {
                if (profile?.verifiedAt) setShowCatalog(true);
                else {
                  setPendingProduct({ slug: 'all', label: 'All Insurance Products', segment: 'all' });
                  setWizardOpen(true);
                }
              }}>
                View all products
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Insurance Marketplace</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {profile?.productLabel
                    ? `Showing plans for ${profile.productLabel}`
                    : 'Compare life, health, and motor insurance — new policy, renewal, and claim assistance.'}
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

            <InsuranceSegmentBar activeSegment={filters.segment} onSegmentChange={handleSegmentChange} />
            <InsuranceCategoryBar
              activeSegment={filters.segment}
              activeCategory={filters.category}
              onCategoryChange={(slug) => handleFilterChange('category', slug)}
            />

            <div className="flex flex-wrap gap-2">
              {INSURANCE_SERVICES.map((svc) => (
                <button
                  key={svc.slug}
                  type="button"
                  onClick={() => handleFilterChange('service', filters.service === svc.slug ? 'all' : svc.slug)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    filters.service === svc.slug
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'border-border text-muted-foreground hover:border-accent/50'
                  }`}
                >
                  <Icon name={svc.icon} size={14} />
                  {svc.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="lg:col-span-1">
                <InsuranceFilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={() => setFilters(resetInsuranceFilters())}
                  isOpen={isFilterOpen}
                  onToggle={() => setIsFilterOpen(!isFilterOpen)}
                  resultCount={products.length}
                />
              </div>

              <div className="lg:col-span-3 space-y-6">
                {loading ? (
                  <div className="text-center py-16 text-muted-foreground">Loading insurance plans…</div>
                ) : (
                  <MarketplaceCompareBoard
                    type="insurance"
                    products={products}
                    selectedIds={selected}
                    onToggleSelect={toggleSelect}
                    onClearSelection={() => { setSelected([]); setShowCompare(false); }}
                    showCompare={showCompare}
                    onApply={(product) => {
                      if (canUseInternalCheckout(product)) {
                        setPurchaseProduct(product);
                        return;
                      }
                      const actionUrl = getServiceUrl(product, activeService);
                      if (actionUrl) window.open(actionUrl, '_blank', 'noopener,noreferrer');
                    }}
                    context={{ service: activeService }}
                    title="Insurance plan comparison"
                    emptyMessage="No plans match your filters."
                    renderGridCard={(product, isSelected) => {
                      const actionUrl = getServiceUrl(product, activeService);
                      return (
                        <div
                          key={product.id}
                          className={`bg-card border rounded-xl p-5 flex flex-col gap-3 ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                {resolveLogo(product) ? (
                                  <img src={resolveLogo(product)} alt="" className="w-10 h-10 object-contain" />
                                ) : (
                                  <Icon name="Shield" size={22} className="text-primary" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold">{product.name}</p>
                                <p className="text-sm text-muted-foreground">{product.insurerName}</p>
                              </div>
                            </div>
                            <button type="button" onClick={() => toggleSelect(product.id)} className={`text-xs font-semibold px-2 py-1 rounded-full border ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>
                              {isSelected ? 'Selected' : 'Compare'}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                            <span>Premium: {formatPremiumRange(product)}</span>
                            <span>Cover: {formatSumInsuredRange(product)}</span>
                          </div>
                          {canUseInternalCheckout(product) ? (
                            <button
                              type="button"
                              onClick={() => setPurchaseProduct(product)}
                              className="mt-auto inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold"
                            >
                              Buy on Rfincare <Icon name="ChevronRight" size={14} />
                            </button>
                          ) : actionUrl ? (
                            <a href={actionUrl} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold">
                              View Plan <Icon name="ExternalLink" size={14} />
                            </a>
                          ) : null}
                        </div>
                      );
                    }}
                  />
                )}
                {latestPurchase ? (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="font-semibold">Latest purchase update</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {latestPurchase.productName || purchaseProduct?.name || 'Insurance plan'} · Payment {latestPurchase.paymentStatus}
                      {' '}· Insurer {latestPurchase.insurerPushStatus}
                    </p>
                    {latestPurchase.insurerPolicyNumber ? (
                      <p className="text-sm text-emerald-700 mt-2">Policy number: {latestPurchase.insurerPolicyNumber}</p>
                    ) : null}
                    {latestPurchase.failureReason ? (
                      <p className="text-sm text-destructive mt-2">{latestPurchase.failureReason}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>

      <MarketplaceLeadWizard
        open={wizardOpen}
        onClose={() => { setWizardOpen(false); setPendingProduct(null); }}
        onComplete={handleWizardComplete}
        marketplaceType="insurance"
        productLabel={pendingProduct?.label}
        productCategory={pendingProduct?.slug}
        productSegment={pendingProduct?.segment}
      />
      <InsurancePurchaseModal
        open={Boolean(purchaseProduct)}
        product={purchaseProduct}
        profile={profile}
        onClose={() => setPurchaseProduct(null)}
        onPurchaseComplete={(purchase) => setLatestPurchase(purchase)}
      />
    </div>
  );
};

export default InsuranceMarketplacePage;
