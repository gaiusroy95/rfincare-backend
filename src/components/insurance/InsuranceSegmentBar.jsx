import React from 'react';
import Icon from '../AppIcon';
import {
  INSURANCE_SEGMENTS,
  getCategoriesForSegment,
} from '../../constants/insuranceMarketplace';

const InsuranceSegmentBar = ({ activeSegment, onSegmentChange }) => (
  <div className="flex flex-wrap gap-2">
    <button
      type="button"
      onClick={() => onSegmentChange('all')}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
        activeSegment === 'all'
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card border-border hover:border-primary/40'
      }`}
    >
      <Icon name="LayoutGrid" size={16} />
      All Insurance
    </button>
    {INSURANCE_SEGMENTS.map((seg) => (
      <button
        key={seg.slug}
        type="button"
        onClick={() => onSegmentChange(seg.slug)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
          activeSegment === seg.slug
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-card border-border hover:border-primary/40'
        }`}
      >
        <Icon name={seg.icon} size={16} />
        {seg.label}
      </button>
    ))}
  </div>
);

export default InsuranceSegmentBar;

export function InsuranceCategoryBar({ activeSegment, activeCategory, onCategoryChange }) {
  const categories = getCategoriesForSegment(activeSegment === 'all' ? null : activeSegment);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        type="button"
        onClick={() => onCategoryChange('all')}
        className={`flex-shrink-0 px-3 py-2 rounded-full border text-xs font-semibold ${
          activeCategory === 'all' ? 'bg-secondary text-secondary-foreground border-secondary' : 'border-border'
        }`}
      >
        All types
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          type="button"
          onClick={() => onCategoryChange(cat.slug)}
          className={`flex-shrink-0 px-3 py-2 rounded-full border text-xs font-semibold whitespace-nowrap ${
            activeCategory === cat.slug ? 'bg-secondary text-secondary-foreground border-secondary' : 'border-border'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
