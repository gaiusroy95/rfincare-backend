import React from 'react';
import Icon from '../AppIcon';
import { MUTUAL_FUND_CATEGORIES } from '../../constants/mutualFundMarketplace';

const MutualFundCategoryBar = ({ activeCategory, onCategoryChange }) => {
  const categories = [{ slug: 'all', label: 'All Funds', icon: 'LayoutGrid' }, ...MUTUAL_FUND_CATEGORIES];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((cat) => (
        <button
          key={cat.slug}
          type="button"
          onClick={() => onCategoryChange(cat.slug)}
          className={`flex items-center gap-2 flex-shrink-0 px-3 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-all ${
            activeCategory === cat.slug
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border hover:border-primary/40'
          }`}
        >
          <Icon name={cat.icon} size={14} />
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default MutualFundCategoryBar;
