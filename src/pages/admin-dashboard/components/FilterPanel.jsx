import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'under-review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'documents-pending', label: 'Documents Pending' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const loanTypeOptions = [
    { value: 'all', label: 'All Loan Types' },
    { value: 'personal', label: 'Personal Loan' },
    { value: 'home', label: 'Home Loan' },
    { value: 'business', label: 'Business Loan' },
    { value: 'auto', label: 'Auto Loan' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center space-x-2">
          <Icon name="Filter" size={20} />
          <span>Filters</span>
        </h3>
        <Button
          variant="ghost"
          size="sm"
          iconName="RotateCcw"
          iconPosition="left"
          onClick={onReset}
        >
          Reset
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          type="search"
          placeholder="Search by name, email..."
          value={filters?.search}
          onChange={(e) => onFilterChange('search', e?.target?.value)}
        />
        <Select
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
          placeholder="Select status"
        />
        <Select
          options={priorityOptions}
          value={filters?.priority}
          onChange={(value) => onFilterChange('priority', value)}
          placeholder="Select priority"
        />
        <Select
          options={loanTypeOptions}
          value={filters?.loanType}
          onChange={(value) => onFilterChange('loanType', value)}
          placeholder="Select loan type"
        />
      </div>
    </div>
  );
};

export default FilterPanel;