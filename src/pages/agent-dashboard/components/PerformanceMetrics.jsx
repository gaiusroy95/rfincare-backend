import React from 'react';
import Icon from '../../../components/AppIcon';

const PerformanceMetrics = ({ metrics }) => {
  const getMetricIcon = (type) => {
    const icons = {
      customers: 'Users',
      conversions: 'TrendingUp',
      earnings: 'IndianRupee',
      satisfaction: 'Star'
    };
    return icons?.[type] || 'Activity';
  };

  const getMetricColor = (type) => {
    const colors = {
      customers: 'from-emerald-600 to-[var(--color-brand-green-dark)]',
      conversions: 'from-green-500 to-green-600',
      earnings: 'from-purple-500 to-purple-600',
      satisfaction: 'from-amber-500 to-amber-600'
    };
    return colors?.[type] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {metrics?.map((metric) => (
        <div
          key={metric?.id}
          className="bg-card rounded-lg p-4 md:p-6 border border-border hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br ${getMetricColor(metric?.type)} flex items-center justify-center`}>
              <Icon name={getMetricIcon(metric?.type)} size={20} color="white" />
            </div>
            {metric?.change != null && (
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  metric?.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                <Icon name={metric?.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={12} />
                <span>{metric.change}</span>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs md:text-sm text-muted-foreground">{metric?.label}</p>
            <p className="text-2xl md:text-3xl font-bold text-foreground">{metric?.value}</p>
            <p className="text-xs text-muted-foreground">{metric?.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PerformanceMetrics;