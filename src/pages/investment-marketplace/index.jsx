import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MarketplacePageShell from '../../components/layout/MarketplacePageShell';
import { MarketplaceFilterSidebar, MarketplaceSearchInput } from '../../components/marketplace/MarketplacePageHelpers';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import GuestResumeBanner from '../../components/GuestResumeBanner';
import MarketplaceProductGrid from '../../components/marketplace/MarketplaceProductGrid';
import MarketplaceCompareBoard from '../../components/marketplace/compare/MarketplaceCompareBoard';
import MarketplaceLeadWizard from '../../components/marketplace/MarketplaceLeadWizard';
import InvestmentCalculatorModal from '../../components/investment/InvestmentCalculatorModal';
import { investmentProductService } from '../../services/investmentProductService';
import { INVESTMENT_PRODUCT_GRID } from '../../constants/investmentLeadFlow';
import { DEFAULT_INVESTMENT_FILTERS, getCategoryLabel } from '../../constants/investmentMarketplace';
import { formatPercent, resetInvestmentFilters } from '../../utils/investmentMarketplaceFilters';
import { completeInvestmentApply } from '../../utils/investmentApplyFlow';
import { loadMarketplaceProfile, saveMarketplaceProfile } from '../../utils/marketplaceLeadSession';
import { listMarketplaceResumeSessions, loadCompareBasket } from '../../utils/guestSessionResume';

const MAX_COMPARE = 3;

const InvestmentMarketplacePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [profile, setProfile] = useState(() => loadMarketplaceProfile('investment'));
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [resumeSessions, setResumeSessions] = useState(() => listMarketplaceResumeSessions('investment', { includeCalculators: false }));
  const refreshResumeSessions = () => setResumeSessions(listMarketplaceResumeSessions('investment', { includeCalculators: false }));
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_INVESTMENT_FILTERS,
    category: searchParams.get('category') || 'all',
  }));
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calculatorProduct, setCalculatorProduct] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await investmentProductService.listActive(filters);
      setProducts(Array.isArray(list) ? list : []);
    } catch {
      setProducts([]);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (products.length === 0) return;
    const saved = loadCompareBasket('investment');
    if (!saved?.selectedIds?.length) return;
    const validIds = saved.selectedIds.filter((id) => products.some((p) => p.id === id));
    if (validIds.length >= 2) {
      setSelected(validIds);
      setShowCompare(true);
    }
  }, [products]);

  useEffect(() => {
    const cat = filters.category;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (cat && cat !== 'all') next.set('category', cat);
      else next.delete('category');
      return next;
    }, { replace: true });
  }, [filters.category, setSearchParams]);

  useEffect(() => {
    if (searchParams.get('calculator') === '1') {
      setCalculatorOpen(true);
    }
  }, [searchParams]);

  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    for (const p of products) {
      for (const slug of p.categories || []) counts[slug] = (counts[slug] || 0) + 1;
    }
    return counts;
  }, [products]);

  const handleCategorySelect = (item) => {
    setFilters((prev) => ({ ...prev, category: item.slug }));
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

  const selectedProducts = useMemo(
    () => selected.map((id) => products.find((p) => p.id === id)).filter(Boolean),
    [products, selected],
  );

  const filteredProducts = useMemo(() => {
    const search = filters.search?.trim().toLowerCase();
    const cat = filters.category;
    return products.filter((p) => {
      if (cat && cat !== 'all' && !(p.categories || []).includes(cat)) return false;
      if (search) {
        const hay = `${p.name || ''} ${p.providerName || ''} ${p.description || ''} ${p.highlights || ''}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }, [products, filters.category, filters.search]);

  const onClearSelection = () => {
    setSelected([]);
    setShowCompare(false);
  };

  const openCalculator = (product = null) => {
    setCalculatorProduct(product);
    setCalculatorOpen(true);
  };

  const handleInvestmentApply = useCallback(async (product, calculatorContext = {}) => {
    const activeProfile = profile || loadMarketplaceProfile('investment');
    if (!activeProfile?.verifiedAt) {
      setPendingProduct(product);
      setWizardOpen(true);
      return;
    }
    await completeInvestmentApply(product, activeProfile, calculatorContext);
  }, [profile]);

  const handleWizardComplete = useCallback(async (completedProfile) => {
    const saved = saveMarketplaceProfile('investment', {
      ...completedProfile,
      productLabel: pendingProduct?.name || completedProfile.productLabel,
      productCategory: pendingProduct?.categories?.[0] || completedProfile.productCategory,
    });
    setProfile(saved);
    setWizardOpen(false);
    const product = pendingProduct;
    setPendingProduct(null);
    if (product) {
      await completeInvestmentApply(product, saved);
    }
  }, [pendingProduct]);

  const filterSidebar = (
    <MarketplaceFilterSidebar
      resultCount={filteredProducts.length}
      onShowResults={loadProducts}
      onClear={() => setFilters(resetInvestmentFilters())}
    >
      <MarketplaceSearchInput
        value={filters.search}
        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        placeholder="Search product or provider…"
      />
    </MarketplaceFilterSidebar>
  );

  return (
    <>
    <MarketplacePageShell
      breadcrumbs={[
        { label: 'Home', path: '/homepage' },
        { label: 'Investments', path: '/investment-marketplace' },
        { label: 'Investment Products' },
      ]}
      title="Investment Products"
      subtitle="Compare sovereign gold bonds, ETFs, bonds, REITs, and InvITs from trusted providers."
      benefits={[
        { icon: 'Gem', label: 'Diverse Assets', sub: 'Gold, bonds & more' },
        { icon: 'TrendingUp', label: 'Wealth Growth', sub: 'Long-term returns' },
        { icon: 'ShieldCheck', label: 'Regulated Products', sub: 'SEBI & RBI approved' },
        { icon: 'Calculator', label: 'Built-in Calculators', sub: 'Plan before you invest' },
      ]}
      resultCount={`${filteredProducts.length} Investment Products`}
      sortControl={(
        <select className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white">
          <option>Highest Returns</option>
          <option>Lowest Risk</option>
        </select>
      )}
      filterSidebar={filterSidebar}
      ctaTitle="Need help choosing the right investment?"
      ctaButtonLabel="Get Free Recommendation"
    >
        {resumeSessions.length > 0 ? (
          <GuestResumeBanner sessions={resumeSessions} onDismiss={refreshResumeSessions} />
        ) : null}
        {profile?.fullName ? (
          <p className="text-xs text-emerald-700 mb-4 inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
            <Icon name="CheckCircle2" size={14} />
            Verified: {profile.phone} · {profile.email}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={() => openCalculator()}>
            <Icon name="Calculator" size={16} className="mr-1" /> Open calculator
          </Button>
        </div>

        <MarketplaceProductGrid
          items={[
            { slug: 'all', label: 'All', icon: 'LayoutGrid' },
            ...INVESTMENT_PRODUCT_GRID,
          ].map((x) => (x.slug === 'all' ? x : { ...x, badge: categoryCounts[x.slug] ? String(categoryCounts[x.slug]) : null }))}
          onSelect={(item) => {
            if (item.slug === 'all') setFilters((prev) => ({ ...prev, category: 'all' }));
            else handleCategorySelect(item);
          }}
          title="Choose an investment type"
          subtitle="Gold, bonds, government securities, REITs and infrastructure trusts"
        />

        <MarketplaceCompareBoard
          type="investment"
          products={filteredProducts}
          loading={loading}
          selectedIds={selected}
          selectedProducts={selectedProducts}
          showCompare={showCompare}
          onToggleCompare={() => setShowCompare((v) => !v)}
          onToggleSelect={toggleSelect}
          onClearSelection={onClearSelection}
          onApply={(product) => handleInvestmentApply(product)}
          context={{}}
        />
    </MarketplacePageShell>

      <InvestmentCalculatorModal
        open={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        product={calculatorProduct}
        onApply={(product, context) => {
          setCalculatorOpen(false);
          handleInvestmentApply(product, context);
        }}
      />

      <MarketplaceLeadWizard
        open={wizardOpen}
        onClose={() => { setWizardOpen(false); setPendingProduct(null); }}
        onComplete={handleWizardComplete}
        marketplaceType="investment"
        productLabel={pendingProduct?.name}
        productCategory={pendingProduct?.categories?.[0]}
      />
    </>
  );
};

export default InvestmentMarketplacePage;
