import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MarketplacePageShell from '../../components/layout/MarketplacePageShell';
import { MarketplaceFilterSidebar, MarketplaceSearchInput } from '../../components/marketplace/MarketplacePageHelpers';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MarketplaceProductGrid from '../../components/marketplace/MarketplaceProductGrid';
import MarketplaceCompareBoard from '../../components/marketplace/compare/MarketplaceCompareBoard';
import MarketplaceLeadWizard from '../../components/marketplace/MarketplaceLeadWizard';
import PostOfficeCalculatorModal from '../../components/post-office/PostOfficeCalculatorModal';
import { postOfficeService } from '../../services/postOfficeService';
import { completePostOfficeApply } from '../../utils/postOfficeApplyFlow';
import { loadMarketplaceProfile, saveMarketplaceProfile } from '../../utils/marketplaceLeadSession';
import GuestResumeBanner from '../../components/GuestResumeBanner';
import { listMarketplaceResumeSessions, loadCompareBasket } from '../../utils/guestSessionResume';
import { POST_OFFICE_PRODUCT_GRID } from '../../constants/postOfficeLeadFlow';
import { DEFAULT_POST_OFFICE_FILTERS, getCategoryLabel } from '../../constants/postOfficeMarketplace';
import { formatInterestRate, resetPostOfficeFilters } from '../../utils/postOfficeFilters';

const MAX_COMPARE = 3;

const PostOfficeMarketplacePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calculatorProduct, setCalculatorProduct] = useState(null);
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_POST_OFFICE_FILTERS,
    category: searchParams.get('category') || 'all',
  }));
  const [profile, setProfile] = useState(() => loadMarketplaceProfile('post_office'));
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [resumeSessions, setResumeSessions] = useState(() => listMarketplaceResumeSessions('post_office', { includeCalculators: false }));
  const refreshResumeSessions = () => setResumeSessions(listMarketplaceResumeSessions('post_office', { includeCalculators: false }));

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await postOfficeService.listActive(filters);
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
    const saved = loadCompareBasket('post_office');
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

  const handlePostOfficeApply = useCallback(async (product) => {
    if (product?.applyUrl) {
      const activeProfile = profile || loadMarketplaceProfile('post_office');
      if (!activeProfile?.verifiedAt) {
        setPendingProduct(product);
        setWizardOpen(true);
        return;
      }
      await completePostOfficeApply(product, activeProfile);
      return;
    }

    if (product?.calculatorEnabled !== false) {
      openCalculator(product);
    }
  }, [profile]);

  const handleWizardComplete = useCallback(async (completedProfile) => {
    const saved = saveMarketplaceProfile('post_office', {
      ...completedProfile,
      productLabel: pendingProduct?.name || completedProfile.productLabel,
      productCategory: pendingProduct?.categories?.[0] || completedProfile.productCategory,
    });
    setProfile(saved);
    setWizardOpen(false);
    const product = pendingProduct;
    setPendingProduct(null);
    if (product?.applyUrl) {
      await completePostOfficeApply(product, saved);
    }
  }, [pendingProduct]);

  const filterSidebar = (
    <MarketplaceFilterSidebar resultCount={filteredProducts.length} onClear={() => setFilters(resetPostOfficeFilters())}>
      <MarketplaceSearchInput
        value={filters.search}
        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        placeholder="Search scheme or product…"
      />
    </MarketplaceFilterSidebar>
  );

  return (
    <>
    <MarketplacePageShell
      breadcrumbs={[{ label: 'Home', path: '/homepage' }, { label: 'Investments', path: '/investment-marketplace' }, { label: 'Post Office Schemes' }]}
      title="Post Office Schemes"
      subtitle="Compare PPF, NSC, KVP, SCSS, MIS and other India Post savings schemes."
      benefits={[
        { icon: 'ShieldCheck', label: 'Government Backed', sub: 'Sovereign guarantee' },
        { icon: 'Percent', label: 'Attractive Rates', sub: 'Competitive interest' },
        { icon: 'Calendar', label: 'Flexible Tenure', sub: 'Short to long term' },
        { icon: 'Calculator', label: 'Maturity Calculator', sub: 'Plan your returns' },
      ]}
      resultCount={`${filteredProducts.length} Post Office Schemes`}
      filterSidebar={filterSidebar}
      ctaTitle="Not sure which post office scheme suits you?"
      ctaButtonLabel="Get Free Recommendation"
    >
        {resumeSessions.length > 0 ? <GuestResumeBanner sessions={resumeSessions} onDismiss={refreshResumeSessions} /> : null}
        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={() => openCalculator()}><Icon name="Calculator" size={16} className="mr-1" /> Calculator</Button>
        </div>
        <MarketplaceProductGrid
            items={[
              { slug: 'all', label: 'All', icon: 'LayoutGrid' },
              ...POST_OFFICE_PRODUCT_GRID,
            ].map((x) => (x.slug === 'all' ? x : { ...x, badge: categoryCounts[x.slug] ? String(categoryCounts[x.slug]) : null }))}
            onSelect={(item) => {
              if (item.slug === 'all') setFilters((prev) => ({ ...prev, category: 'all' }));
              else handleCategorySelect(item);
            }}
            title="Choose a scheme"
            subtitle="Government-backed post office savings and deposit products"
          />

        <MarketplaceCompareBoard
          type="post_office"
          products={filteredProducts}
          loading={loading}
          selectedIds={selected}
          selectedProducts={selectedProducts}
          showCompare={showCompare}
          onToggleCompare={() => setShowCompare((v) => !v)}
          onToggleSelect={toggleSelect}
          onClearSelection={onClearSelection}
          onApply={handlePostOfficeApply}
          context={{}}
          renderGridCard={(product, isSelected) => (
            <div
              key={product.id}
              className={`rounded-xl border bg-card p-4 space-y-3 ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
            >
              <div>
                <p className="text-xs font-bold text-primary uppercase">{product.providerName || 'India Post'}</p>
                <h3 className="font-bold">{product.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{formatInterestRate(product.interestRate)} p.a.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => openCalculator(product)}>
                  Calculator
                </Button>
                {product.applyUrl ? (
                  <Button size="sm" variant="default" onClick={() => handlePostOfficeApply(product)}>
                    Apply Now
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => toggleSelect(product.id)}
                >
                  {isSelected ? 'Selected' : 'Compare'}
                </Button>
              </div>
            </div>
          )}
        />

        {filteredProducts.some((p) => p.calculatorEnabled !== false) ? (
          <div className="fixed bottom-20 right-4 z-30">
            <Button onClick={() => openCalculator()} className="shadow-lg">
              <Icon name="Calculator" size={16} />
              Open calculator
            </Button>
          </div>
        ) : null}
    </MarketplacePageShell>

      <PostOfficeCalculatorModal
        open={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        product={calculatorProduct}
      />

      <MarketplaceLeadWizard
        open={wizardOpen}
        onClose={() => { setWizardOpen(false); setPendingProduct(null); }}
        onComplete={handleWizardComplete}
        marketplaceType="post_office"
        productLabel={pendingProduct?.name}
        productCategory={pendingProduct?.categories?.[0]}
      />
    </>
  );
};

export default PostOfficeMarketplacePage;
