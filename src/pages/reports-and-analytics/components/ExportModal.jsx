import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ExportModal = ({ report, onClose, onExport }) => {
  const [exportData, setExportData] = useState({
    format: 'pdf',
    includeCharts: true,
    includeRawData: false,
    dateRange: 'current'
  });

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', description: 'Best for sharing and printing' },
    { value: 'excel', label: 'Excel Spreadsheet', description: 'Best for data analysis' },
    { value: 'csv', label: 'CSV File', description: 'Best for importing to other systems' }
  ];

  const dateRangeOptions = [
    { value: 'current', label: 'Current Period' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'thisYear', label: 'This Year' }
  ];

  const handleExport = () => {
    onExport({ ...exportData, reportId: report?.id });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-lg w-full">
        <div className="border-b border-border p-4 md:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-conversion/10 flex items-center justify-center">
              <Icon name="Download" size={20} color="var(--color-conversion)" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-foreground">
                Export Report
              </h2>
              <p className="text-sm text-muted-foreground">{report?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          <Select
            label="Export Format"
            options={formatOptions}
            value={exportData?.format}
            onChange={(value) => setExportData({ ...exportData, format: value })}
          />

          <Select
            label="Date Range"
            options={dateRangeOptions}
            value={exportData?.dateRange}
            onChange={(value) => setExportData({ ...exportData, dateRange: value })}
          />

          <div className="space-y-3">
            <Checkbox
              label="Include charts and visualizations"
              description="Embed visual elements in the export"
              checked={exportData?.includeCharts}
              onChange={(e) => setExportData({ ...exportData, includeCharts: e?.target?.checked })}
            />
            <Checkbox
              label="Include raw data tables"
              description="Add detailed data tables to the export"
              checked={exportData?.includeRawData}
              onChange={(e) => setExportData({ ...exportData, includeRawData: e?.target?.checked })}
            />
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={20} color="var(--color-primary)" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Export Information</p>
                <p>The report will be generated with current data and downloaded to your device. Large reports may take a few moments to process.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              fullWidth
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              fullWidth
              iconName="Download"
              iconPosition="left"
              onClick={handleExport}
            >
              Export Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;