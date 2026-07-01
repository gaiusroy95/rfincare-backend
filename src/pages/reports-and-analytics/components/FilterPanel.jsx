import React from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { rangeFromPreset, formatReportRangeLabel } from '../../../utils/reportDateRange';

const FilterPanel = ({ filters, onFilterChange, onApply, onReset }) => {
  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisQuarter', label: 'This Quarter' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'custom', label: 'Custom range' },
  ];

  const reportTypeOptions = [
    { value: 'all', label: 'All Reports' },
    { value: 'application', label: 'Application Reports' },
    { value: 'agent', label: 'Agent Performance' },
    { value: 'financial', label: 'Financial Reports' },
    { value: 'compliance', label: 'Compliance Reports' },
    { value: 'customer', label: 'Customer Analytics' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'processing', label: 'Processing' },
  ];

  const handlePresetChange = (value) => {
    if (value === 'custom') {
      onFilterChange('batch', { dateRange: 'custom' });
      return;
    }
    onFilterChange('batch', { dateRange: value, ...rangeFromPreset(value) });
  };

  const handleDateFieldChange = (field, value) => {
    onFilterChange('batch', { dateRange: 'custom', [field]: value });
  };

  const rangeSummary = formatReportRangeLabel(filters?.startDate, filters?.endDate);

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-foreground">Filters</h3>
          {rangeSummary && (
            <p className="text-xs text-muted-foreground mt-1">
              Reporting period: <span className="font-medium text-foreground">{rangeSummary}</span>
            </p>
          )}
        </div>
        <Button variant="ghost" size="sm" iconName="RotateCcw" onClick={onReset}>
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Select
          label="Date range"
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={handlePresetChange}
        />

        <Input
          label="From"
          type="date"
          value={filters?.startDate || ''}
          max={filters?.endDate || undefined}
          onChange={(e) => handleDateFieldChange('startDate', e?.target?.value)}
          required
        />

        <Input
          label="To"
          type="date"
          value={filters?.endDate || ''}
          min={filters?.startDate || undefined}
          max={toDateInputMax()}
          onChange={(e) => handleDateFieldChange('endDate', e?.target?.value)}
          required
        />

        <Select
          label="Report type"
          options={reportTypeOptions}
          value={filters?.reportType}
          onChange={(value) => onFilterChange('reportType', value)}
        />

        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
        />

        <div className="flex items-end sm:col-span-2 lg:col-span-1 xl:col-span-1">
          <Button variant="default" fullWidth iconName="Filter" iconPosition="left" onClick={onApply}>
            Apply filters
          </Button>
        </div>
      </div>
    </div>
  );
};

function toDateInputMax() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default FilterPanel;
