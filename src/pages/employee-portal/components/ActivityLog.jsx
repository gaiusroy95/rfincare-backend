import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityLog = ({ activities }) => {
  const getActivityIcon = (type) => {
    const icons = {
      approved: 'CheckCircle',
      rejected: 'XCircle',
      reviewed: 'Eye',
      assigned: 'UserPlus',
      updated: 'Edit'
    };
    return icons?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      approved: 'text-green-600 bg-green-50',
      rejected: 'text-red-600 bg-red-50',
      reviewed: 'text-blue-600 bg-blue-50',
      assigned: 'text-purple-600 bg-purple-50',
      updated: 'text-yellow-600 bg-yellow-50'
    };
    return colors?.[type] || 'text-gray-600 bg-gray-50';
  };

  const formatTime = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return activityDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 flex items-center">
        <Icon name="Activity" size={20} className="mr-2" />
        Recent Activity
      </h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities?.map((activity) => (
          <div
            key={activity?.id}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
              <Icon name={getActivityIcon(activity?.type)} size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base text-foreground font-medium">{activity?.description}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{activity?.applicationId}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{formatTime(activity?.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;