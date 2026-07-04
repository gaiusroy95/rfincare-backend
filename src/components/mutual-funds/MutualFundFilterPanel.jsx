import React from 'react';
import Icon from '../AppIcon';
import Select from '../ui/Select';
import Button from '../ui/Button';
import {
  FILTER_FUND_CATEGORIES,
  RISK_LEVELS,
  RETURNS_FILTER_OPTIONS,
  MIN_INVESTMENT_OPTIONS,
} from '../../constants/mutualFundMarketplace';

const MutualFundFilterPanel = ({
  filters,
  onFilterChange,
  onReset,
  onApply,
  isOpen,
  onToggle,
  resultCount,
}) => (
  <>
    <div className="lg:hidden mb-4">
      <Button
        variant="outline"
        fullWidth
        onClick={onToggle}
        iconName={isOpen ? 'X' : 'Filter'}
        iconPosition="left"
      >
        {isOpen ? 'Close Filters' : 'Filter Your Search'}
      </Button>
    </div>

    <div className={`rf-mf-filter ${isOpen ? 'block' : 'hidden lg:block'}`}>
      <div className="rf-mf-filter-header">
        <h3 className="rf-mf-filter-title">Filter Your Search</h3>
        <button type="button" className="rf-mf-filter-clear" onClick={onReset}>
          Clear All
        </button>
      </div>

      <div className="rf-mf-filter-search">
        <Icon name="Search" size={18} className="text-muted-foreground shrink-0" />
        <input
          type="search"
          placeholder="Search by fund name or AMC..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="rf-mf-filter-search-input"
        />
      </div>

      <fieldset className="rf-mf-filter-section">
        <legend className="rf-mf-filter-label">Fund Category</legend>
        <div className="space-y-2.5">
          {FILTER_FUND_CATEGORIES.map((cat) => {
            const checked = (filters.categoryGroup || 'all') === cat.id;
            return (
              <label key={cat.id} className="rf-mf-filter-check">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onFilterChange('categoryGroup', cat.id)}
                  className="rf-mf-filter-checkbox"
                />
                <span>{cat.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-4">
        <Select
          label="Risk Level"
          value={filters.riskLevel}
          onChange={(v) => onFilterChange('riskLevel', v)}
          options={[{ value: 'all', label: 'Any' }, ...RISK_LEVELS.map((r) => ({ value: r.slug, label: r.label }))]}
        />
        <Select
          label="Return Rate (3Y)"
          value={filters.returns}
          onChange={(v) => onFilterChange('returns', v)}
          options={RETURNS_FILTER_OPTIONS.map((o) =>
            o.value === 'all' ? { value: 'all', label: 'Any' } : o,
          )}
        />
        <Select
          label="Minimum Investment"
          value={filters.minInvestment || 'all'}
          onChange={(v) => onFilterChange('minInvestment', v)}
          options={MIN_INVESTMENT_OPTIONS}
        />
      </div>

      <Button
        className="rf-btn-primary w-full mt-6"
        onClick={() => {
          onApply?.();
          onToggle?.(false);
        }}
      >
        Show Results ({resultCount ?? 0})
      </Button>
    </div>
  </>
);

export default MutualFundFilterPanel;
