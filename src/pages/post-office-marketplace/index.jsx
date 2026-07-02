import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import MarketplaceProductGrid from '../../components/marketplace/MarketplaceProductGrid';
import MarketplaceCompareBoard from '../../components/marketplace/compare/MarketplaceCompareBoard';
import PostOfficeCalculatorModal from '../../components/post-office/PostOfficeCalculatorModal';
import { postOfficeService } from '../../services/postOfficeService';
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
    const cat = filters.category;
    if (cat && cat !== 'all') setSearchParams({ category: cat }, { replace: true });
    else setSearchParams({}, { replace: true });
  }, [filters.category, setSearchParams]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Post Office Marketplace</h1>
            <p className="text-sm text-muted-foreground">
              Compare PPF, NSC, KVP, SCSS, MIS and other India Post savings schemes. Select up to {MAX_COMPARE} to compare side by side.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => openCalculator()}>
              <Icon name="Calculator" size={16} />
              Open calculator
            </Button>
            <Button variant="outline" onClick={() => navigate('/product-comparison')}>
              <Icon name="GitCompare" size={16} />
              Compare other products
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 md:p-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-[360px]">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Search scheme or product…"
                className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <Button variant="ghost" onClick={() => setFilters(resetPostOfficeFilters())}>
              Reset
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            {filters.category !== 'all' ? (
              <>Showing <span className="font-semibold text-foreground">{getCategoryLabel(filters.category)}</span> · {filteredProducts.length} options</>
            ) : (
              <>{filteredProducts.length} options</>
            )}
          </div>
        </div>

        <div className="space-y-4">
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
        </div>

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
          onApply={(product) => {
            if (product?.calculatorEnabled !== false && !product?.applyUrl) openCalculator(product);
          }}
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
      </div>

      <PostOfficeCalculatorModal
        open={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        product={calculatorProduct}
      />
    </div>
  );
};

export default PostOfficeMarketplacePage;
