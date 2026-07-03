import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MarketplacePageShell from '../../components/layout/MarketplacePageShell';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MarketplaceProductGrid from '../../components/marketplace/MarketplaceProductGrid';
import MarketplaceCompareBoard from '../../components/marketplace/compare/MarketplaceCompareBoard';
import { fixedIncomeService } from '../../services/fixedIncomeService';
import { FIXED_INCOME_PRODUCT_GRID } from '../../constants/fixedIncomeLeadFlow';
import { DEFAULT_FIXED_INCOME_FILTERS, getCategoryLabel } from '../../constants/fixedIncomeMarketplace';
import { resetFixedIncomeFilters } from '../../utils/fixedIncomeFilters';

const MAX_COMPARE = 3;

const FixedIncomeMarketplacePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FIXED_INCOME_FILTERS,
    category: searchParams.get('category') || 'all',
  }));

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fixedIncomeService.listActive(filters);
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

  const filterSidebar = (
    <div className="space-y-5">
      <h3 className="font-bold text-foreground">Customize Your Search</h3>
      <div>
        <label className="text-sm font-medium text-foreground">Deposit Amount</label>
        <p className="text-lg font-bold text-[var(--color-brand-green)] mt-1">₹5,00,000</p>
        <input type="range" min={10000} max={10000000} defaultValue={500000} className="w-full mt-2 accent-[var(--color-brand-green)]" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Tenure</label>
        <select className="w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm bg-white">
          <option>Any</option>
          <option>1 Year</option>
          <option>3 Years</option>
          <option>5 Years</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Interest Payout</label>
        <select className="w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm bg-white">
          <option>Any</option>
          <option>Monthly</option>
          <option>Quarterly</option>
          <option>At Maturity</option>
        </select>
      </div>
      <div className="relative">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          placeholder="Search provider…"
          className="w-full rounded-lg border border-border pl-9 pr-3 py-2 text-sm"
        />
      </div>
      <Button className="rf-btn-primary w-full" onClick={loadProducts}>
        Show Results ({filteredProducts.length})
      </Button>
    </div>
  );

  return (
    <MarketplacePageShell
      breadcrumbs={[
        { label: 'Home', path: '/homepage' },
        { label: 'Investments', path: '/investment-marketplace' },
        { label: 'Fixed Deposit' },
      ]}
      title="Fixed Deposit"
      subtitle="Compare fixed deposit rates from top banks and NBFCs. Guaranteed returns with flexible tenure options."
      benefits={[
        { icon: 'ShieldCheck', label: 'Guaranteed Returns', sub: 'Principal protected' },
        { icon: 'TrendingUp', label: 'Higher Interest Rates', sub: 'Up to 9% p.a.' },
        { icon: 'Calendar', label: 'Flexible Tenure', sub: '7 days to 10 years' },
        { icon: 'IndianRupee', label: 'Regular Payouts', sub: 'Monthly or quarterly' },
      ]}
      resultCount={`${filteredProducts.length} Fixed Deposit Offers`}
      sortControl={(
        <select className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white">
          <option>Highest Interest</option>
          <option>Lowest Min. Investment</option>
        </select>
      )}
      filterSidebar={filterSidebar}
      ctaTitle="Not sure which FD is right for you?"
      ctaButtonLabel="Get Free Recommendation"
    >
      <MarketplaceProductGrid
        items={[
          { slug: 'all', label: 'All', icon: 'LayoutGrid' },
          ...FIXED_INCOME_PRODUCT_GRID,
        ].map((x) => (x.slug === 'all' ? x : { ...x, badge: categoryCounts[x.slug] ? String(categoryCounts[x.slug]) : null }))}
        onSelect={(item) => {
          if (item.slug === 'all') setFilters((prev) => ({ ...prev, category: 'all' }));
          else handleCategorySelect(item);
        }}
        title=""
        subtitle=""
      />

      <MarketplaceCompareBoard
          type="fixed_income"
          products={filteredProducts}
          loading={loading}
          selectedIds={selected}
          selectedProducts={selectedProducts}
          showCompare={showCompare}
          onToggleCompare={() => setShowCompare((v) => !v)}
          onToggleSelect={toggleSelect}
          onClearSelection={onClearSelection}
          context={{}}
        />
    </MarketplacePageShell>
  );
};

export default FixedIncomeMarketplacePage;

