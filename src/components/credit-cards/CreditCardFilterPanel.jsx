import React from 'react';
import Icon from '../AppIcon';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import Button from '../ui/Button';
import {
  ANNUAL_FEE_FILTER_OPTIONS,
  JOINING_FEE_FILTER_OPTIONS,
  FOREX_CHARGES_FILTER_OPTIONS,
  BENEFIT_FILTER_OPTIONS,
} from '../../constants/creditCardMarketplace';
import { countActiveFilters } from '../../utils/creditCardFilters';

const CreditCardFilterPanel = ({
  filters,
  onFilterChange,
  onReset,
  isOpen,
  onToggle,
  resultCount,
}) => {
  const activeCount = countActiveFilters(filters);

  return (
    <>
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          fullWidth
          onClick={onToggle}
          iconName={isOpen ? 'X' : 'Filter'}
          iconPosition="left"
        >
          {isOpen ? 'Close Filters' : `Filters${activeCount ? ` (${activeCount})` : ''}`}
        </Button>
      </div>

      <div className={`bg-card rounded-lg border border-border p-4 md:p-6 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-bold text-foreground flex items-center space-x-2">
            <Icon name="Filter" size={20} />
            <span>Compare filters</span>
          </h3>
          <Button variant="ghost" size="sm" onClick={onReset} iconName="RotateCcw">
            Reset
          </Button>
        </div>

        {resultCount != null ? (
          <p className="text-xs text-muted-foreground mb-4">{resultCount} card{resultCount === 1 ? '' : 's'} match</p>
        ) : null}

        <div className="space-y-4 md:space-y-6">
          <Input
            label="Search cards"
            placeholder="Bank or card name..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />

          <Select
            label="Annual fee"
            value={filters.annualFee}
            onChange={(v) => onFilterChange('annualFee', v)}
            options={ANNUAL_FEE_FILTER_OPTIONS}
          />

          <Select
            label="Joining fee"
            value={filters.joiningFee}
            onChange={(v) => onFilterChange('joiningFee', v)}
            options={JOINING_FEE_FILTER_OPTIONS}
          />

          <Select
            label="Forex charges"
            value={filters.forexCharges}
            onChange={(v) => onFilterChange('forexCharges', v)}
            options={FOREX_CHARGES_FILTER_OPTIONS}
          />

          <div>
            <p className="text-sm font-medium text-foreground mb-3">Benefits & features</p>
            <div className="space-y-2">
              {BENEFIT_FILTER_OPTIONS.map((opt) => (
                <Checkbox
                  key={opt.key}
                  label={opt.label}
                  checked={Boolean(filters[opt.key])}
                  onChange={(e) => onFilterChange(opt.key, e?.target?.checked)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreditCardFilterPanel;
