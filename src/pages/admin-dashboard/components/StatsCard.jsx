import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsCard = ({ title, value, change, changeType, icon, iconBg, trend }) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return 'TrendingUp';
    if (trend === 'down') return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm md:text-base text-muted-foreground mb-2">{title}</p>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">{value}</h3>
          {change && (
            <div className={`flex items-center space-x-1 text-xs md:text-sm ${getChangeColor()}`}>
              <Icon name={getTrendIcon()} size={16} />
              <span className="font-semibold">{change}</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon name={icon} size={24} color="white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;