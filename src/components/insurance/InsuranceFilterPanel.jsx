import React from 'react';
import Icon from '../AppIcon';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import Button from '../ui/Button';
import {
  INSURANCE_SERVICES,
  PREMIUM_FILTER_OPTIONS,
  SUM_INSURED_FILTER_OPTIONS,
} from '../../constants/insuranceMarketplace';
import { countActiveFilters } from '../../utils/insuranceFilters';

const InsuranceFilterPanel = ({
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
        <Button variant="outline" fullWidth onClick={onToggle} iconName={isOpen ? 'X' : 'Filter'} iconPosition="left">
          {isOpen ? 'Close Filters' : `Filters${activeCount ? ` (${activeCount})` : ''}`}
        </Button>
      </div>
      <div className={`bg-card rounded-lg border border-border p-4 md:p-6 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <Icon name="Filter" size={18} />
            Filters
          </h3>
          <Button variant="ghost" size="sm" onClick={onReset} iconName="RotateCcw">Reset</Button>
        </div>
        {resultCount != null ? (
          <p className="text-xs text-muted-foreground mb-4">{resultCount} plan{resultCount === 1 ? '' : 's'} match</p>
        ) : null}
        <div className="space-y-4">
          <Input label="Search" placeholder="Insurer or plan name..." value={filters.search} onChange={(e) => onFilterChange('search', e.target.value)} />
          <Select label="Service" value={filters.service} onChange={(v) => onFilterChange('service', v)} options={[{ value: 'all', label: 'All services' }, ...INSURANCE_SERVICES.map((s) => ({ value: s.slug, label: s.label }))]} />
          <Select label="Premium" value={filters.premium} onChange={(v) => onFilterChange('premium', v)} options={PREMIUM_FILTER_OPTIONS} />
          <Select label="Sum insured" value={filters.sumInsured} onChange={(v) => onFilterChange('sumInsured', v)} options={SUM_INSURED_FILTER_OPTIONS} />
          <Input label="Min claim settlement %" type="number" value={filters.claimSettlementMin} onChange={(e) => onFilterChange('claimSettlementMin', e.target.value)} placeholder="e.g. 95" />
          <div className="space-y-2">
            <Checkbox label="Tax benefit under 80C" checked={filters.taxBenefit80c} onChange={(e) => onFilterChange('taxBenefit80c', e?.target?.checked)} />
            <Checkbox label="Tax benefit under 80D" checked={filters.taxBenefit80d} onChange={(e) => onFilterChange('taxBenefit80d', e?.target?.checked)} />
          </div>
        </div>
      </div>
    </>
  );
};

export default InsuranceFilterPanel;
