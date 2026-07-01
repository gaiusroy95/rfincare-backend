import React from 'react';
import Icon from '../../../components/AppIcon';

const PerformanceMetrics = ({ metrics }) => {
  const metricCards = [
    {
      label: 'Tasks Completed Today',
      value: metrics?.tasksCompletedToday,
      icon: 'CheckCircle',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+12%',
      changeType: 'positive'
    },
    {
      label: 'Pending Tasks',
      value: metrics?.pendingTasks,
      icon: 'Clock',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '-5%',
      changeType: 'positive'
    },
    {
      label: 'Average Processing Time',
      value: metrics?.avgProcessingTime,
      icon: 'Timer',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '-8 min',
      changeType: 'positive'
    },
    {
      label: 'Quality Score',
      value: `${metrics?.qualityScore}%`,
      icon: 'Award',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+3%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {metricCards?.map((metric, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${metric?.bgColor} flex items-center justify-center`}>
              <Icon name={metric?.icon} size={20} className={metric?.color} />
            </div>
            <span className={`text-xs font-medium ${metric?.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {metric?.change}
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{metric?.value}</h3>
          <p className="text-xs md:text-sm text-muted-foreground">{metric?.label}</p>
        </div>
      ))}
    </div>
  );
};

export default PerformanceMetrics;