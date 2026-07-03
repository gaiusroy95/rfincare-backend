import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../ui/Header';
import Footer from '../../pages/homepage/components/Footer';
import Icon from '../AppIcon';

/**
 * Reusable filter sidebar block for marketplace pages.
 */
export function MarketplaceFilterSidebar({
  title = 'Customize Your Search',
  children,
  resultCount,
  onShowResults,
  onClear,
}) {
  return (
    <div className="space-y-5">
      <h3 className="font-bold text-foreground">{title}</h3>
      {children}
      {onShowResults ? (
        <button type="button" onClick={onShowResults} className="w-full py-2.5 text-sm font-semibold text-white bg-[var(--color-brand-green)] rounded-lg hover:opacity-90">
          Show Results{resultCount != null ? ` (${resultCount})` : ''}
        </button>
      ) : null}
      {onClear ? (
        <button type="button" onClick={onClear} className="text-sm text-muted-foreground hover:text-foreground w-full text-center">
          Clear All Filters
        </button>
      ) : null}
    </div>
  );
}

export function MarketplaceSearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30"
      />
    </div>
  );
}

export function MarketplaceCategorySelect({ value, onChange, options, label }) {
  return (
    <div>
      {label ? <label className="text-sm font-medium text-foreground">{label}</label> : null}
      <select
        value={value}
        onChange={onChange}
        className="w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm bg-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function MarketplacePageFrame({ children, footer = true }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">{children}</div>
      {footer ? <Footer /> : null}
    </div>
  );
}
