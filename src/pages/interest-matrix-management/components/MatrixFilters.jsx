import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const MatrixFilters = ({ 
  filters, 
  onFilterChange, 
  onApplyFilters, 
  onResetFilters,
  productTypes,
  loanTypes,
  bankOptions,
}) => {
  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 mb-4 md:mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Filter" size={20} color="var(--color-primary)" />
          Filter Matrix
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          iconName="RotateCcw"
          iconPosition="left"
        >
          Reset
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Bank Name"
          placeholder="All Banks"
          options={bankOptions || []}
          value={filters?.bankId}
          onChange={(value) => onFilterChange('bankId', value)}
          clearable
        />

        <Select
          label="Product Type"
          placeholder="All Products"
          options={productTypes}
          value={filters?.productType}
          onChange={(value) => onFilterChange('productType', value)}
          clearable
        />

        <Select
          label="Loan Type"
          placeholder="All Loan Types"
          options={loanTypes}
          value={filters?.loanType}
          onChange={(value) => onFilterChange('loanType', value)}
          clearable
        />

        <Input
          label="Min Credit Score"
          type="number"
          placeholder="e.g., 600"
          value={filters?.minCreditScore}
          onChange={(e) => onFilterChange('minCreditScore', e?.target?.value)}
          min="300"
          max="900"
        />

        <Input
          label="Max Credit Score"
          type="number"
          placeholder="e.g., 900"
          value={filters?.maxCreditScore}
          onChange={(e) => onFilterChange('maxCreditScore', e?.target?.value)}
          min="300"
          max="900"
        />

        <Input
          label="Min Loan Amount"
          type="number"
          placeholder="e.g., 10000"
          value={filters?.minLoanAmount}
          onChange={(e) => onFilterChange('minLoanAmount', e?.target?.value)}
          min="0"
        />

        <Input
          label="Max Loan Amount"
          type="number"
          placeholder="e.g., 500000"
          value={filters?.maxLoanAmount}
          onChange={(e) => onFilterChange('maxLoanAmount', e?.target?.value)}
          min="0"
        />

        <Input
          label="Min Term (months)"
          type="number"
          placeholder="e.g., 12"
          value={filters?.minTerm}
          onChange={(e) => onFilterChange('minTerm', e?.target?.value)}
          min="1"
        />

        <Input
          label="Max Term (months)"
          type="number"
          placeholder="e.g., 360"
          value={filters?.maxTerm}
          onChange={(e) => onFilterChange('maxTerm', e?.target?.value)}
          min="1"
        />
      </div>
      <div className="flex justify-end mt-4">
        <Button
          variant="default"
          onClick={onApplyFilters}
          iconName="Search"
          iconPosition="left"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default MatrixFilters;