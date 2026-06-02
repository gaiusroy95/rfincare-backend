import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ActivityLog = ({ activities }) => {
  const getActivityIcon = (type) => {
    const iconMap = {
      approval: 'CheckCircle',
      rejection: 'XCircle',
      assignment: 'UserPlus',
      update: 'Edit',
      login: 'LogIn',
      logout: 'LogOut',
      document: 'FileText',
      system: 'Settings'
    };
    return iconMap?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colorMap = {
      approval: 'text-success',
      rejection: 'text-destructive',
      assignment: 'text-primary',
      update: 'text-warning',
      login: 'text-blue-600',
      logout: 'text-muted-foreground',
      document: 'text-purple-600',
      system: 'text-orange-600'
    };
    return colorMap?.[type] || 'text-foreground';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-bold text-foreground">Recent Activity</h3>
        <Icon name="Activity" size={20} className="text-muted-foreground" />
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start space-x-3 pb-4 border-b border-border last:border-0 last:pb-0">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-muted flex-shrink-0 ${getActivityColor(activity?.type)}`}>
              <Icon name={getActivityIcon(activity?.type)} size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <Image
                    src={activity?.userImage}
                    alt={activity?.userImageAlt}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                  <p className="text-sm font-semibold text-foreground truncate">{activity?.userName}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{activity?.timestamp}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{activity?.actionType || activity?.action}</p>
              {activity?.details && (
                <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded inline-block">
                  {activity?.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;