import React, { useMemo, useState } from 'react';
import Icon from '../../AppIcon';
import Button from '../../ui/Button';
import { COMPARE_SORT_OPTIONS, getMarketplaceCompareConfig, sortCompareProducts } from '../../../constants/marketplaceCompareConfig';

function FeatureList({ items, included = true }) {
  if (!items?.length) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-xs text-foreground">
          <Icon
            name={included ? 'CheckCircle2' : 'XCircle'}
            size={14}
            className={included ? 'text-emerald-600 shrink-0 mt-0.5' : 'text-rose-500 shrink-0 mt-0.5'}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const MarketplaceSideBySideCompare = ({
  type,
  products = [],
  onRemove,
  onClear,
  onApply,
  context = {},
  title,
}) => {
  const config = getMarketplaceCompareConfig(type);
  const [sortBy, setSortBy] = useState('recommended');
  const sorted = useMemo(() => sortCompareProducts(products, sortBy, type), [products, sortBy, type]);

  if (sorted.length < 2) return null;

  const featureRowLabel = 'Key features';

  return (
    <section className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 md:p-5 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-border">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon name="GitCompare" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {title || `Compare ${sorted.length} ${config.label} products`}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Side-by-side comparison — rates, fees, and features in one view
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium"
          >
            {COMPARE_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {onClear ? (
            <Button variant="ghost" size="sm" onClick={onClear}>Clear all</Button>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="sticky left-0 z-20 bg-card w-36 min-w-[9rem] p-4 text-left text-xs font-semibold text-muted-foreground align-bottom">
                Product
              </th>
              {sorted.map((product) => {
                const id = config.getId(product);
                const badge = config.getBadge(product);
                return (
                  <th key={id} className="min-w-[220px] p-4 align-top bg-card border-l border-border/60">
                    <div className="flex flex-col items-center text-center gap-2">
                      {onRemove ? (
                        <button
                          type="button"
                          onClick={() => onRemove(id)}
                          className="self-end p-1 rounded-md hover:bg-muted text-muted-foreground"
                          aria-label="Remove from comparison"
                        >
                          <Icon name="X" size={14} />
                        </button>
                      ) : null}
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                        {config.getLogo(product) ? (
                          <img src={config.getLogo(product)} alt="" className="w-11 h-11 object-contain" />
                        ) : (
                          <Icon name="Building2" size={24} className="text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-primary">{config.getProvider(product)}</p>
                        <p className="text-sm font-bold text-foreground leading-snug">{config.getName(product)}</p>
                      </div>
                      {badge ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {badge}
                        </span>
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
            <tr className="border-b border-border bg-muted/30">
              <td className="sticky left-0 z-20 bg-muted/30 p-3 text-xs font-semibold text-muted-foreground">Quick snapshot</td>
              {sorted.map((product) => {
                const metrics = config.getHighlightMetrics(product);
                return (
                  <td key={config.getId(product)} className="p-3 border-l border-border/60 align-top">
                    <div className="grid grid-cols-1 gap-2">
                      {metrics.map((m) => (
                        <div key={m.label} className="rounded-lg bg-background border border-border px-2.5 py-2 text-center">
                          <p className="text-[10px] text-muted-foreground font-medium">{m.label}</p>
                          <p className="text-sm font-bold text-foreground">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {config.tableRows.map((row, rowIndex) => (
              <tr key={row.key} className={rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                <td className="sticky left-0 z-10 bg-inherit p-4 text-sm font-semibold text-muted-foreground border-r border-border/40">
                  {row.label}
                </td>
                {sorted.map((product) => (
                  <td key={config.getId(product)} className="p-4 text-sm text-center border-l border-border/40 align-middle">
                    <span className="font-medium text-foreground">{config.formatCell(product, row)}</span>
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-background border-t border-border">
              <td className="sticky left-0 z-10 bg-background p-4 text-sm font-semibold text-muted-foreground border-r border-border/40">
                {featureRowLabel}
              </td>
              {sorted.map((product) => (
                <td key={config.getId(product)} className="p-4 border-l border-border/40 align-top text-left">
                  <FeatureList items={config.getFeatures(product)} />
                </td>
              ))}
            </tr>
            <tr className="bg-gradient-to-r from-orange-50/80 to-amber-50/50 border-t-2 border-orange-200">
              <td className="sticky left-0 z-10 bg-orange-50/80 p-4 text-sm font-bold text-foreground">Best offer</td>
              {sorted.map((product) => {
                const ctaUrl = config.getCtaUrl(product, context);
                const savings = config.getSavingsText(product);
                const original = config.getOriginalPrice?.(product);
                return (
                  <td key={config.getId(product)} className="p-4 border-l border-border/40 align-top text-center">
                    <div className="space-y-2">
                      {savings ? (
                        <p className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5 inline-block">
                          {savings}
                        </p>
                      ) : null}
                      <div>
                        <p className="text-2xl font-extrabold text-foreground">{config.getPrice(product)}</p>
                        <p className="text-xs text-muted-foreground">{config.getPriceLabel(product)}</p>
                        {original ? (
                          <p className="text-xs text-muted-foreground line-through">{original}</p>
                        ) : null}
                      </div>
                      {ctaUrl ? (
                        <a
                          href={ctaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
                        >
                          {config.getCtaLabel(product)}
                          <Icon name="ExternalLink" size={14} />
                        </a>
                      ) : onApply ? (
                        <Button
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
                          onClick={() => onApply(product)}
                        >
                          {config.getCtaLabel(product)}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Link unavailable</span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default MarketplaceSideBySideCompare;
