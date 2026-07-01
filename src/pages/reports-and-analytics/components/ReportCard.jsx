import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReportCard = ({ report, onGenerate, onSchedule, onExport }) => {
  const getIconColor = () => {
    const colors = {
      application: 'var(--color-customer-primary)',
      agent: 'var(--color-agent-primary)',
      financial: 'var(--color-conversion)',
      compliance: 'var(--color-admin-primary)',
      customer: 'var(--color-secondary)'
    };
    return colors?.[report?.category] || 'var(--color-primary)';
  };

  const getCategoryBadgeClass = () => {
    const classes = {
      application: 'bg-customer-primary text-customer-foreground',
      agent: 'bg-agent-primary text-agent-foreground',
      financial: 'bg-conversion text-conversion-foreground',
      compliance: 'bg-admin-primary text-admin-foreground',
      customer: 'bg-secondary text-secondary-foreground'
    };
    return classes?.[report?.category] || 'bg-primary text-primary-foreground';
  };

  return (
    <div className="feature-card group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${getIconColor()}20` }}
          >
            <Icon name={report?.icon} size={24} color={getIconColor()} />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-foreground">
              {report?.name}
            </h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${getCategoryBadgeClass()}`}>
              {report?.category?.charAt(0)?.toUpperCase() + report?.category?.slice(1)}
            </span>
          </div>
        </div>
        {report?.isScheduled && (
          <div className="flex items-center space-x-1 text-xs text-success">
            <Icon name="Clock" size={14} />
            <span>Scheduled</span>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {report?.description}
      </p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Frequency</div>
          <div className="text-sm font-semibold text-foreground">{report?.frequency}</div>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Last Generated</div>
          <div className="text-sm font-semibold text-foreground">{report?.lastGenerated}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="default"
          size="sm"
          iconName="Play"
          iconPosition="left"
          onClick={() => onGenerate(report)}
          className="flex-1"
        >
          Generate
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="Calendar"
          onClick={() => onSchedule(report)}
        >
          Schedule
        </Button>
        <Button
          variant="ghost"
          size="sm"
          iconName="Download"
          onClick={() => onExport(report)}
        >
          Export
        </Button>
      </div>
    </div>
  );
};

export default ReportCard;