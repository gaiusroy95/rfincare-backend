import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const ScheduleReportModal = ({ report, onClose, onSchedule }) => {
  const [scheduleData, setScheduleData] = useState({
    frequency: 'weekly',
    dayOfWeek: 'monday',
    time: '09:00',
    recipients: '',
    format: 'csv',
    includeCharts: true,
    autoSend: true
  });

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const formatOptions = [
    { value: 'csv', label: 'CSV (emailed attachment)' },
    { value: 'xlsx', label: 'Excel-compatible CSV' },
    { value: 'pdf', label: 'PDF (sent as CSV for now)' }
  ];

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSchedule({ ...scheduleData, reportId: report?.id });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Calendar" size={20} color="var(--color-primary)" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-foreground">
                Schedule Report
              </h2>
              <p className="text-sm text-muted-foreground">{report?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Frequency"
              options={frequencyOptions}
              value={scheduleData?.frequency}
              onChange={(value) => setScheduleData({ ...scheduleData, frequency: value })}
              required
            />

            {(scheduleData?.frequency === 'weekly' || scheduleData?.frequency === 'quarterly') && (
              <Select
                label="Day of Week"
                options={dayOptions}
                value={scheduleData?.dayOfWeek}
                onChange={(value) => setScheduleData({ ...scheduleData, dayOfWeek: value })}
                required
              />
            )}

            <Input
              label="Time"
              type="time"
              value={scheduleData?.time}
              onChange={(e) => setScheduleData({ ...scheduleData, time: e?.target?.value })}
              required
            />

            <Select
              label="Export Format"
              options={formatOptions}
              value={scheduleData?.format}
              onChange={(value) => setScheduleData({ ...scheduleData, format: value })}
              required
            />
          </div>

          <Input
            label="Email Recipients"
            type="text"
            placeholder="email1@example.com, email2@example.com"
            description="Separate multiple emails with commas. First email is sent immediately when Auto-send is on."
            value={scheduleData?.recipients}
            onChange={(e) => setScheduleData({ ...scheduleData, recipients: e?.target?.value })}
            required
          />

          <div className="space-y-3">
            <Checkbox
              label="Include charts and visualizations"
              checked={scheduleData?.includeCharts}
              onChange={(e) => setScheduleData({ ...scheduleData, includeCharts: e?.target?.checked })}
            />
            <Checkbox
              label="Automatically send report"
              description="Report will be generated and sent without manual approval"
              checked={scheduleData?.autoSend}
              onChange={(e) => setScheduleData({ ...scheduleData, autoSend: e?.target?.checked })}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              fullWidth
              iconName="Calendar"
              iconPosition="left"
            >
              Schedule Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleReportModal;