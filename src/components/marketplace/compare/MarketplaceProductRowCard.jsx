import React from 'react';
import Icon from '../../AppIcon';
import { getMarketplaceCompareConfig } from '../../../constants/marketplaceCompareConfig';

const MarketplaceProductRowCard = ({
  type,
  product,
  selected = false,
  onToggleSelect,
  onApply,
  context = {},
  rank,
}) => {
  const config = getMarketplaceCompareConfig(type);
  const id = config.getId(product);
  const metrics = config.getHighlightMetrics(product);
  const features = config.getFeatures(product);
  const badge = config.getBadge(product);
  const ctaUrl = config.getCtaUrl(product, context);
  const savings = config.getSavingsText(product);

  return (
    <article
      className={`relative rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden ${
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
      }`}
    >
      {rank === 1 ? (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
      ) : null}

      <div className="p-4 md:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Provider + name */}
          <div className="flex items-start gap-3 lg:w-[28%] min-w-0">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
              {config.getLogo(product) ? (
                <img src={config.getLogo(product)} alt="" className="w-11 h-11 object-contain" />
              ) : (
                <Icon name="Shield" size={24} className="text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-primary">{config.getProvider(product)}</p>
              <h3 className="text-base font-bold text-foreground leading-snug">{config.getName(product)}</h3>
              {config.getSubtitle(product) ? (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{config.getSubtitle(product)}</p>
              ) : null}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {badge ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {badge}
                  </span>
                ) : null}
                {savings ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {savings}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Key metrics in one line */}
          <div className="flex flex-1 flex-wrap lg:flex-nowrap gap-2 md:gap-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="flex-1 min-w-[100px] rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-center"
              >
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{m.label}</p>
                <p className="text-sm md:text-base font-bold text-foreground mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Price + CTA */}
          <div className="lg:w-[180px] shrink-0 flex flex-col items-center lg:items-end gap-2">
            <div className="text-center lg:text-right">
              <p className="text-2xl font-extrabold text-foreground">{config.getPrice(product)}</p>
              <p className="text-xs text-muted-foreground">{config.getPriceLabel(product)}</p>
            </div>
            {ctaUrl ? (
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full lg:w-auto min-w-[140px] py-3 px-5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
              >
                {config.getCtaLabel(product)}
                <Icon name="ChevronRight" size={16} />
              </a>
            ) : onApply ? (
              <button
                type="button"
                onClick={() => onApply(product)}
                className="inline-flex items-center justify-center gap-1.5 w-full lg:w-auto min-w-[140px] py-3 px-5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-md"
              >
                {config.getCtaLabel(product)}
                <Icon name="ChevronRight" size={16} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Features row */}
        {features.length > 0 ? (
          <div className="mt-4 pt-4 border-t border-dashed border-border flex flex-wrap items-center gap-x-4 gap-y-2">
            {features.map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5 text-xs text-foreground">
                <Icon name="CheckCircle2" size={14} className="text-emerald-600 shrink-0" />
                {f}
              </span>
            ))}
          </div>
        ) : null}

        {/* Footer actions */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onToggleSelect?.(id)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
              selected
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            {selected ? '✓ Added to compare' : '+ Add to compare'}
          </button>
          <span className="text-[10px] text-muted-foreground">Compare up to {config.maxCompare} products</span>
        </div>
      </div>
    </article>
  );
};

export default MarketplaceProductRowCard;
