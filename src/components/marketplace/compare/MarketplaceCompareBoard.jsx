import React, { useMemo, useState, useRef, useEffect } from 'react';
import Icon from '../../AppIcon';
import {
  COMPARE_SORT_OPTIONS,
  getMarketplaceCompareConfig,
  sortCompareProducts,
} from '../../../constants/marketplaceCompareConfig';
import MarketplaceProductRowCard from './MarketplaceProductRowCard';
import MarketplaceSideBySideCompare from './MarketplaceSideBySideCompare';

const MarketplaceCompareBoard = ({
  type,
  products = [],
  selectedIds = [],
  onToggleSelect,
  onClearSelection,
  showCompare = false,
  onApply,
  context = {},
  title,
  emptyMessage = 'No products match your filters.',
  renderGridCard,
}) => {
  const config = getMarketplaceCompareConfig(type);
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState('rows');
  const compareRef = useRef(null);

  const sorted = useMemo(() => sortCompareProducts(products, sortBy, type), [products, sortBy, type]);
  const compareProducts = useMemo(
    () => sorted.filter((p) => selectedIds.includes(config.getId(p))),
    [sorted, selectedIds, config],
  );

  useEffect(() => {
    if (showCompare && compareProducts.length >= 2 && compareRef.current) {
      compareRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showCompare, compareProducts.length]);

  if (!products.length) {
    return (
      <div className="text-center py-16 space-y-3">
        <Icon name="Search" size={40} className="mx-auto text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{products.length} products</span>
          {selectedIds.length > 0 ? (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {selectedIds.length} selected
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium"
          >
            {COMPARE_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('rows')}
              className={`px-3 py-1.5 text-xs font-semibold ${viewMode === 'rows' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}`}
            >
              Compare list
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-semibold ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}`}
            >
              Grid
            </button>
          </div>
          {selectedIds.length > 0 && onClearSelection ? (
            <button type="button" onClick={onClearSelection} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              Clear selection
            </button>
          ) : null}
        </div>
      </div>

      {showCompare && compareProducts.length >= 2 ? (
        <div ref={compareRef}>
          <MarketplaceSideBySideCompare
            type={type}
            products={compareProducts}
            onRemove={(id) => onToggleSelect?.(id)}
            onClear={onClearSelection}
            onApply={onApply}
            context={context}
            title={title}
          />
        </div>
      ) : selectedIds.length > 0 && selectedIds.length < 2 ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Select at least 2 products to see side-by-side comparison in one line.
        </p>
      ) : null}

      {viewMode === 'rows' ? (
        <div className="space-y-3">
          {sorted.map((product, index) => (
            <MarketplaceProductRowCard
              key={config.getId(product)}
              type={type}
              product={product}
              selected={selectedIds.includes(config.getId(product))}
              onToggleSelect={onToggleSelect}
              onApply={onApply}
              context={context}
              rank={index + 1}
            />
          ))}
        </div>
      ) : renderGridCard ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sorted.map((product) => renderGridCard(product, selectedIds.includes(config.getId(product))))}
        </div>
      ) : null}

      {selectedIds.length > 0 ? (
        <div className="fixed bottom-0 inset-x-0 z-40 px-4 pb-4 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto flex items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 backdrop-blur shadow-xl px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">
                {selectedIds.length >= 2
                  ? `${selectedIds.length} products ready to compare`
                  : `${selectedIds.length} selected — pick ${2 - selectedIds.length} more`}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Side-by-side rates, fees & features in one view
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onClearSelection ? (
                <button
                  type="button"
                  onClick={onClearSelection}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1"
                >
                  Clear
                </button>
              ) : null}
              {selectedIds.length >= 2 ? (
                <button
                  type="button"
                  onClick={() => compareRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-md"
                >
                  <Icon name="GitCompare" size={16} />
                  View comparison
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MarketplaceCompareBoard;
