import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import InsuranceSegmentBar, { InsuranceCategoryBar } from '../../components/insurance/InsuranceSegmentBar';
import InsuranceFilterPanel from '../../components/insurance/InsuranceFilterPanel';
import { insuranceService } from '../../services/insuranceService';
import { resolveBankLogoUrl } from '../../utils/bankBranding';
import {
  COMPARE_TABLE_ROWS,
  DEFAULT_INSURANCE_FILTERS,
  INSURANCE_SERVICES,
  getCategoryLabel,
  getSegmentLabel,
} from '../../constants/insuranceMarketplace';
import {
  countActiveFilters,
  formatCompareCell,
  formatPremiumRange,
  formatSumInsuredRange,
  getServiceUrl,
  resetInsuranceFilters,
} from '../../utils/insuranceFilters';

const MAX_COMPARE = 3;

function resolveLogo(product) {
  return resolveBankLogoUrl(product?.logoUrl) || null;
}

const InsuranceMarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_INSURANCE_FILTERS,
    segment: searchParams.get('segment') || 'all',
    category: searchParams.get('category') || 'all',
    service: searchParams.get('service') || 'all',
  }));

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await insuranceService.listActive(filters);
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
    const params = {};
    if (filters.segment !== 'all') params.segment = filters.segment;
    if (filters.category !== 'all') params.category = filters.category;
    if (filters.service !== 'all') params.service = filters.service;
    setSearchParams(params, { replace: true });
  }, [filters.segment, filters.category, filters.service, setSearchParams]);

  const compareProducts = useMemo(
    () => products.filter((p) => selected.includes(p.id)),
    [products, selected],
  );

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
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const activeService = filters.service !== 'all' ? filters.service : 'new_policy';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Insurance Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compare life, health, and motor insurance — new policy, renewal, and claim assistance.
          </p>
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
            {selected.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <span className="text-sm font-medium">{selected.length} selected</span>
                <Button size="sm" onClick={() => setShowCompare(true)} disabled={selected.length < 2}>Compare</Button>
                <Button size="sm" variant="ghost" onClick={() => { setSelected([]); setShowCompare(false); }}>Clear</Button>
              </div>
            )}

            {showCompare && compareProducts.length >= 2 ? (
              <div className="overflow-x-auto border border-border rounded-xl bg-card">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left p-4 sticky left-0 bg-muted/40">Compare</th>
                      {compareProducts.map((p) => (
                        <th key={p.id} className="text-left p-4 min-w-[200px]">
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.insurerName}</div>
                          <div className="text-[10px] mt-1 text-primary">{getSegmentLabel(p.segment)}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_TABLE_ROWS.map((row) => (
                      <tr key={row.key} className="border-b">
                        <td className="p-4 text-muted-foreground sticky left-0 bg-card">{row.label}</td>
                        {compareProducts.map((p) => (
                          <td key={p.id} className="p-4">{formatCompareCell(p, row)}</td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="p-4 sticky left-0 bg-card">Services</td>
                      {compareProducts.map((p) => (
                        <td key={p.id} className="p-4 space-y-2">
                          {p.supportsNewPolicy && p.newPolicyUrl ? (
                            <a href={p.newPolicyUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-primary font-semibold">New Policy ↗</a>
                          ) : null}
                          {p.supportsRenewal && p.renewalUrl ? (
                            <a href={p.renewalUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-primary font-semibold">Renewal ↗</a>
                          ) : null}
                          {p.supportsClaimAssistance && p.claimAssistanceUrl ? (
                            <a href={p.claimAssistanceUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-primary font-semibold">Claim Help ↗</a>
                          ) : null}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : null}

            {loading ? (
              <div className="text-center py-16 text-muted-foreground">Loading insurance plans…</div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <Icon name="Search" size={40} className="mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">No plans match your filters.</p>
                <Button variant="outline" onClick={() => setFilters(resetInsuranceFilters())}>Reset filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => {
                  const isSelected = selected.includes(product.id);
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
                            <p className="text-[10px] font-semibold text-primary mt-0.5">{getSegmentLabel(product.segment)}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => toggleSelect(product.id)} className={`text-xs font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>
                          {isSelected ? 'Selected' : 'Compare'}
                        </button>
                      </div>

                      {(product.categories || []).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.categories.map((slug) => (
                            <span key={slug} className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium">{getCategoryLabel(slug)}</span>
                          ))}
                        </div>
                      ) : null}

                      {product.highlights ? <p className="text-sm text-muted-foreground">{product.highlights}</p> : null}

                      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                        <span>Premium: {formatPremiumRange(product)}</span>
                        <span>Cover: {formatSumInsuredRange(product)}</span>
                        {product.claimSettlementRatio != null ? <span>CSR: {product.claimSettlementRatio}%</span> : null}
                        {product.cashlessHospitals ? <span>{product.cashlessHospitals.toLocaleString('en-IN')}+ hospitals</span> : null}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {product.supportsNewPolicy ? <span className="text-[10px] px-2 py-0.5 rounded bg-success/10 text-success font-semibold">New Policy</span> : null}
                        {product.supportsRenewal ? <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">Renewal</span> : null}
                        {product.supportsClaimAssistance ? <span className="text-[10px] px-2 py-0.5 rounded bg-accent/10 text-accent-foreground font-semibold">Claim Help</span> : null}
                      </div>

                      {(product.features || []).slice(0, 2).map((f) => (
                        <p key={f} className="text-xs">• {f}</p>
                      ))}

                      {actionUrl ? (
                        <a href={actionUrl} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90">
                          {INSURANCE_SERVICES.find((s) => s.slug === activeService)?.label || 'Get Started'}
                          <Icon name="ExternalLink" size={14} />
                        </a>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceMarketplacePage;
