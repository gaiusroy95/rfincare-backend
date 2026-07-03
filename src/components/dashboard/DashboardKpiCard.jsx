import React from 'react';
import Icon from '../AppIcon';

const trendColors = {
  positive: 'text-emerald-600',
  negative: 'text-red-600',
  neutral: 'text-muted-foreground',
};

const DashboardKpiCard = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon = 'TrendingUp',
  iconBg = 'bg-emerald-50',
  iconColor = 'text-[var(--color-brand-green)]',
  subtitle,
  className = '',
}) => (
  <div className={`rf-kpi-card ${className}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
        <p className="text-xl md:text-2xl font-bold text-foreground mt-1 truncate">{value}</p>
        {change ? (
          <p className={`text-xs font-semibold mt-1 ${trendColors[changeType] || trendColors.positive}`}>
            {change}
          </p>
        ) : null}
        {subtitle ? <p className="text-xs text-muted-foreground mt-1">{subtitle}</p> : null}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon name={icon} size={20} className={iconColor} />
      </div>
    </div>
  </div>
);

export default DashboardKpiCard;
