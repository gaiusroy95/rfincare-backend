import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ metric }) => {
  const getTrendColor = () => {
    if (metric?.trend === 'up') return 'text-success';
    if (metric?.trend === 'down') return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (metric?.trend === 'up') return 'TrendingUp';
    if (metric?.trend === 'down') return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div 
          className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${metric?.color}20` }}
        >
          <Icon name={metric?.icon} size={20} color={metric?.color} />
        </div>
        <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
          <Icon name={getTrendIcon()} size={16} />
          <span className="text-sm font-semibold">{metric?.change}</span>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground">
          {metric?.value}
        </h3>
        <p className="text-sm text-muted-foreground">{metric?.label}</p>
      </div>
      {metric?.subtitle && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">{metric?.subtitle}</p>
        </div>
      )}
    </div>
  );
};

export default MetricCard;