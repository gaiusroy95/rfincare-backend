import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import { BANK_TYPE_OPTIONS } from '../../../constants/bankTypes';

import { BANK_MARKETPLACE_PRODUCT_CATEGORIES } from '../../../constants/bankMarketplaceProductCategories';

const FilterPanel = ({ filters, onFilterChange, onReset, isOpen, onToggle }) => {
  const productTypeOptions = [
    { value: 'all', label: 'All product types' },
    ...BANK_MARKETPLACE_PRODUCT_CATEGORIES.map((cat) => ({
      value: cat.slug,
      label: cat.label,
    })),
  ];

  const interestRateOptions = [
    { value: 'all', label: 'All Rates' },
    { value: '0-8', label: 'Below 8%' },
    { value: '8-10', label: '8% - 10%' },
    { value: '10-12', label: '10% - 12%' },
    { value: '12+', label: 'Above 12%' }
  ];

  const probabilityOptions = [
    { value: 'all', label: 'All Probabilities' },
    { value: '80+', label: 'High (80%+)' },
    { value: '60-80', label: 'Medium (60-80%)' },
    { value: '0-60', label: 'Low (Below 60%)' }
  ];

  const loanAmountOptions = [
    { value: 'all', label: 'All Amounts' },
    { value: '0-500000', label: 'Up to ₹500K' },
    { value: '500000-1000000', label: '₹500K - ₹1M' },
    { value: '1000000-2000000', label: '₹1M - ₹2M' },
    { value: '2000000+', label: 'Above ₹2M' }
  ];

  const tenureOptions = [
    { value: 'all', label: 'All Tenures' },
    { value: '0-5', label: 'Up to 5 years' },
    { value: '5-10', label: '5 - 10 years' },
    { value: '10-15', label: '10 - 15 years' },
    { value: '15+', label: 'Above 15 years' }
  ];

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          fullWidth
          onClick={onToggle}
          iconName={isOpen ? 'X' : 'Filter'}
          iconPosition="left"
        >
          {isOpen ? 'Close Filters' : 'Show Filters'}
        </Button>
      </div>
      {/* Filter Panel */}
      <div className={`bg-card rounded-lg border border-border p-4 md:p-6 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-bold text-foreground flex items-center space-x-2">
            <Icon name="Filter" size={20} />
            <span>Filters</span>
          </h3>
          <Button variant="ghost" size="sm" onClick={onReset} iconName="RotateCcw">
            Reset
          </Button>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Search */}
          <div>
            <Input
              type="search"
              label="Search Banks"
              placeholder="Search by bank name..."
              value={filters?.search}
              onChange={(e) => onFilterChange('search', e?.target?.value)}
              className="w-full"
            />
          </div>

          {/* Loan product type */}
          <div>
            <Select
              label="Loan product type"
              options={productTypeOptions}
              value={filters?.productType || 'all'}
              onChange={(value) => onFilterChange('productType', value)}
            />
          </div>

          {/* Interest Rate */}
          <div>
            <Select
              label="Interest Rate"
              options={interestRateOptions}
              value={filters?.interestRate}
              onChange={(value) => onFilterChange('interestRate', value)}
            />
          </div>

          {/* Approval Probability */}
          <div>
            <Select
              label="Approval Probability"
              options={probabilityOptions}
              value={filters?.probability}
              onChange={(value) => onFilterChange('probability', value)}
            />
          </div>

          {/* Loan Amount */}
          <div>
            <Select
              label="Loan Amount"
              options={loanAmountOptions}
              value={filters?.loanAmount}
              onChange={(value) => onFilterChange('loanAmount', value)}
            />
          </div>

          {/* Tenure */}
          <div>
            <Select
              label="Loan Tenure"
              options={tenureOptions}
              value={filters?.tenure}
              onChange={(value) => onFilterChange('tenure', value)}
            />
          </div>

          {/* Bank Type */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-3 block">Bank Type</label>
            <div className="space-y-2">
              {BANK_TYPE_OPTIONS.map((option) => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  checked={filters?.bankTypes?.includes(option.value)}
                  onChange={(e) => {
                    const newTypes = e?.target?.checked
                      ? [...(filters?.bankTypes || []), option.value]
                      : (filters?.bankTypes || []).filter((t) => t !== option.value);
                    onFilterChange('bankTypes', newTypes);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Special Features */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-3 block">Special Features</label>
            <div className="space-y-2">
              <Checkbox
                label="Zero Processing Fee"
                checked={filters?.features?.includes('zeroFee')}
                onChange={(e) => {
                  const newFeatures = e?.target?.checked
                    ? [...filters?.features, 'zeroFee']
                    : filters?.features?.filter(f => f !== 'zeroFee');
                  onFilterChange('features', newFeatures);
                }}
              />
              <Checkbox
                label="Quick Approval"
                checked={filters?.features?.includes('quickApproval')}
                onChange={(e) => {
                  const newFeatures = e?.target?.checked
                    ? [...filters?.features, 'quickApproval']
                    : filters?.features?.filter(f => f !== 'quickApproval');
                  onFilterChange('features', newFeatures);
                }}
              />
              <Checkbox
                label="Flexible Repayment"
                checked={filters?.features?.includes('flexible')}
                onChange={(e) => {
                  const newFeatures = e?.target?.checked
                    ? [...filters?.features, 'flexible']
                    : filters?.features?.filter(f => f !== 'flexible');
                  onFilterChange('features', newFeatures);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;