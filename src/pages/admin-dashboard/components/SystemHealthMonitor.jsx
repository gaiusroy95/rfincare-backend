import React from 'react';
import Icon from '../../../components/AppIcon';

const SystemHealthMonitor = ({ metrics }) => {
  const getHealthStatus = (value, thresholds) => {
    if (value >= thresholds?.good) return { color: 'text-success', bg: 'bg-success/10', label: 'Healthy' };
    if (value >= thresholds?.warning) return { color: 'text-warning', bg: 'bg-warning/10', label: 'Warning' };
    return { color: 'text-destructive', bg: 'bg-destructive/10', label: 'Critical' };
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg md:text-xl font-bold text-foreground">System Health</h3>
        <Icon name="Activity" size={20} className="text-success" />
      </div>
      <div className="space-y-6">
        {metrics?.map((metric) => {
          const status = getHealthStatus(metric?.value, metric?.thresholds);
          return (
            <div key={metric?.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon name={metric?.icon} size={18} className="text-muted-foreground" />
                  <span className="text-sm md:text-base font-semibold text-foreground">{metric?.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm md:text-base font-bold text-foreground">{metric?.value}%</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${status?.bg} ${status?.color} font-semibold`}>
                    {status?.label}
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    metric?.value >= metric?.thresholds?.good
                      ? 'bg-success'
                      : metric?.value >= metric?.thresholds?.warning
                      ? 'bg-warning' :'bg-destructive'
                  }`}
                  style={{ width: `${metric?.value}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{metric?.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemHealthMonitor;