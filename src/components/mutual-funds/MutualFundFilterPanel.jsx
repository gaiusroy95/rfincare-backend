import React from 'react';
import Icon from '../AppIcon';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import Button from '../ui/Button';
import {
  RISK_LEVELS,
  RETURNS_FILTER_OPTIONS,
  EXPENSE_RATIO_OPTIONS,
  RATING_FILTER_OPTIONS,
} from '../../constants/mutualFundMarketplace';
import { countActiveFilters } from '../../utils/mutualFundFilters';

const MutualFundFilterPanel = ({ filters, onFilterChange, onReset, isOpen, onToggle, resultCount }) => {
  const activeCount = countActiveFilters(filters);

  return (
    <>
      <div className="lg:hidden mb-4">
        <Button variant="outline" fullWidth onClick={onToggle} iconName={isOpen ? 'X' : 'Filter'} iconPosition="left">
          {isOpen ? 'Close Filters' : `Filters${activeCount ? ` (${activeCount})` : ''}`}
        </Button>
      </div>
      <div className={`bg-card rounded-lg border border-border p-4 md:p-6 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2"><Icon name="Filter" size={18} /> Compare filters</h3>
          <Button variant="ghost" size="sm" onClick={onReset} iconName="RotateCcw">Reset</Button>
        </div>
        {resultCount != null ? <p className="text-xs text-muted-foreground mb-4">{resultCount} fund{resultCount === 1 ? '' : 's'}</p> : null}
        <div className="space-y-4">
          <Input label="Search" placeholder="Fund or AMC name..." value={filters.search} onChange={(e) => onFilterChange('search', e.target.value)} />
          <Select label="Risk" value={filters.riskLevel} onChange={(v) => onFilterChange('riskLevel', v)} options={[{ value: 'all', label: 'Any risk' }, ...RISK_LEVELS.map((r) => ({ value: r.slug, label: r.label }))]} />
          <Select label="Returns" value={filters.returns} onChange={(v) => onFilterChange('returns', v)} options={RETURNS_FILTER_OPTIONS} />
          <Select label="Expense ratio" value={filters.expenseRatio} onChange={(v) => onFilterChange('expenseRatio', v)} options={EXPENSE_RATIO_OPTIONS} />
          <Select label="Rating" value={filters.rating} onChange={(v) => onFilterChange('rating', v)} options={RATING_FILTER_OPTIONS} />
          <div className="space-y-2">
            <Checkbox label="SIP available" checked={filters.supportsSip} onChange={(e) => onFilterChange('supportsSip', e?.target?.checked)} />
            <Checkbox label="Lumpsum available" checked={filters.supportsLumpsum} onChange={(e) => onFilterChange('supportsLumpsum', e?.target?.checked)} />
          </div>
        </div>
      </div>
    </>
  );
};

export default MutualFundFilterPanel;
