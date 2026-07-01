import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import MutualFundCategoryBar from '../../components/mutual-funds/MutualFundCategoryBar';
import MutualFundFilterPanel from '../../components/mutual-funds/MutualFundFilterPanel';
import { mutualFundService } from '../../services/mutualFundService';
import { resolveBankLogoUrl } from '../../utils/bankBranding';
import {
  COMPARE_TABLE_ROWS,
  DEFAULT_MUTUAL_FUND_FILTERS,
  getCategoryLabel,
  getRiskLabel,
} from '../../constants/mutualFundMarketplace';
import {
  countActiveFilters,
  formatCompareCell,
  formatPercent,
  formatExpenseRatio,
  formatAum,
  formatRating,
  resetMutualFundFilters,
} from '../../utils/mutualFundFilters';

const MAX_COMPARE = 3;

const MutualFundMarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_MUTUAL_FUND_FILTERS,
    category: searchParams.get('category') || 'all',
  }));

  const loadFunds = useCallback(async () => {
    setLoading(true);
    try {
      const list = await mutualFundService.listActive(filters);
      setFunds(Array.isArray(list) ? list : []);
    } catch {
      setFunds([]);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => { loadFunds(); }, [loadFunds]);

  useEffect(() => {
    if (filters.category !== 'all') setSearchParams({ category: filters.category }, { replace: true });
    else setSearchParams({}, { replace: true });
  }, [filters.category, setSearchParams]);

  const compareFunds = useMemo(() => funds.filter((f) => selected.includes(f.id)), [funds, selected]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mutual Fund Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compare SIP, ELSS, debt, equity, index, ETF & international funds — returns, risk, expense ratio, AUM & rating.
          </p>
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
            {selected.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <span className="text-sm font-medium">{selected.length} selected</span>
                <Button size="sm" onClick={() => setShowCompare(true)} disabled={selected.length < 2}>Compare</Button>
                <Button size="sm" variant="ghost" onClick={() => { setSelected([]); setShowCompare(false); }}>Clear</Button>
              </div>
            )}

            {showCompare && compareFunds.length >= 2 ? (
              <div className="overflow-x-auto border border-border rounded-xl bg-card">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left p-4 sticky left-0 bg-muted/40">Compare</th>
                      {compareFunds.map((fund) => (
                        <th key={fund.id} className="text-left p-4 min-w-[180px]">
                          <div className="font-semibold">{fund.name}</div>
                          <div className="text-xs text-muted-foreground">{fund.amcName}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_TABLE_ROWS.map((row) => (
                      <tr key={row.key} className="border-b">
                        <td className="p-4 text-muted-foreground sticky left-0 bg-card font-medium">{row.label}</td>
                        {compareFunds.map((fund) => (
                          <td key={fund.id} className="p-4">{formatCompareCell(fund, row)}</td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="p-4 sticky left-0 bg-card">Invest</td>
                      {compareFunds.map((fund) => (
                        <td key={fund.id} className="p-4">
                          {fund.investUrl ? (
                            <a href={fund.investUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary font-semibold text-sm">
                              Start investing <Icon name="ExternalLink" size={14} />
                            </a>
                          ) : '—'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : null}

            {loading ? (
              <div className="text-center py-16 text-muted-foreground">Loading mutual funds…</div>
            ) : funds.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <Icon name="Search" size={40} className="mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">No funds match your filters.</p>
                <Button variant="outline" onClick={() => setFilters(resetMutualFundFilters())}>Reset filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {funds.map((fund) => {
                  const isSelected = selected.includes(fund.id);
                  return (
                    <div key={fund.id} className={`bg-card border rounded-xl p-5 flex flex-col gap-3 ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                            {resolveBankLogoUrl(fund.logoUrl) ? (
                              <img src={resolveBankLogoUrl(fund.logoUrl)} alt="" className="w-10 h-10 object-contain" />
                            ) : (
                              <Icon name="TrendingUp" size={22} className="text-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold">{fund.name}</p>
                            <p className="text-sm text-muted-foreground">{fund.amcName}</p>
                            {fund.rating != null ? <p className="text-xs font-semibold text-amber-600 mt-0.5">{formatRating(fund.rating)}</p> : null}
                          </div>
                        </div>
                        <button type="button" onClick={() => toggleSelect(fund.id)} className={`text-xs font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>
                          {isSelected ? 'Selected' : 'Compare'}
                        </button>
                      </div>

                      {(fund.categories || []).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {fund.categories.map((slug) => (
                            <span key={slug} className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium">{getCategoryLabel(slug)}</span>
                          ))}
                        </div>
                      ) : null}

                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        {fund.returns3y != null ? <span>3Y: <strong className="text-success">{formatPercent(fund.returns3y)}</strong></span> : null}
                        {fund.returns5y != null ? <span>5Y: <strong>{formatPercent(fund.returns5y)}</strong></span> : null}
                        {fund.riskLevel ? <span>Risk: {getRiskLabel(fund.riskLevel)}</span> : null}
                        {fund.expenseRatio != null ? <span>TER: {formatExpenseRatio(fund.expenseRatio)}</span> : null}
                        {fund.aumCrores != null ? <span className="col-span-2">AUM: {formatAum(fund.aumCrores)}</span> : null}
                        {fund.fundManager ? <span className="col-span-2">Manager: {fund.fundManager}</span> : null}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {fund.supportsSip ? <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">SIP</span> : null}
                        {fund.supportsLumpsum ? <span className="text-[10px] px-2 py-0.5 rounded bg-muted font-semibold">Lumpsum</span> : null}
                      </div>

                      {fund.investUrl ? (
                        <a href={fund.investUrl} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90">
                          Invest Now <Icon name="ExternalLink" size={14} />
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

export default MutualFundMarketplacePage;
