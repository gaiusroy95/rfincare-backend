import React, { useRef } from 'react';
import Icon from '../AppIcon';
import { CREDIT_CARD_CATEGORIES } from '../../constants/creditCardMarketplace';

const CreditCardCategoryBar = ({ activeCategory, onCategoryChange, counts = {} }) => {
  const scrollRef = useRef(null);

  const categories = [
    { slug: 'all', label: 'All Cards', icon: 'LayoutGrid' },
    ...CREDIT_CARD_CATEGORIES,
  ];

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          const count = cat.slug === 'all' ? counts.all : counts[cat.slug];
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onCategoryChange(cat.slug)}
              className={`flex items-center gap-2 flex-shrink-0 px-4 py-2.5 rounded-full border text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-foreground border-border hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <Icon name={cat.icon} size={16} />
              <span>{cat.label}</span>
              {count != null ? (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CreditCardCategoryBar;
