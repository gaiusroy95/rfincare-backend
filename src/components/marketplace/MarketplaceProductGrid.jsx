import React from 'react';
import Icon from '../AppIcon';

const BADGE_TONES = {
  default: 'bg-emerald-500 text-white',
  warning: 'bg-rose-500 text-white',
};

const MarketplaceProductGrid = ({ items, onSelect, title, subtitle }) => (
  <section className="space-y-6">
    {(title || subtitle) && (
      <div className="text-center max-w-2xl mx-auto space-y-2">
        {title ? <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2> : null}
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
    )}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
      {items.map((item, index) => {
        const badgeTone = BADGE_TONES[item.badgeTone] || BADGE_TONES.default;
        return (
          <button
            key={`${item.slug}-${item.label}-${index}`}
            type="button"
            onClick={() => onSelect(item)}
            className="group relative flex flex-col items-center rounded-2xl border border-border bg-card p-3 md:p-4 shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all text-center min-h-[140px] md:min-h-[160px]"
          >
            {item.badge ? (
              <span className={`absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeTone}`}>
                {item.badge}
              </span>
            ) : null}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Icon name={item.icon} size={28} className="text-primary" />
            </div>
            <span className="text-xs md:text-sm font-semibold text-foreground leading-snug">{item.label}</span>
          </button>
        );
      })}
    </div>
  </section>
);

export default MarketplaceProductGrid;
