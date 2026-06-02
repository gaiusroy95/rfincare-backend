import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    const icons = {
      'client-added': 'UserPlus',
      'document-uploaded': 'Upload',
      'status-changed': 'RefreshCw',
      'commission-earned': 'IndianRupee',
      'meeting-scheduled': 'Calendar',
      'message-sent': 'MessageSquare',
      'application-submitted': 'Send'
    };
    return icons?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      'client-added': 'bg-blue-100 text-blue-700',
      'document-uploaded': 'bg-purple-100 text-purple-700',
      'status-changed': 'bg-amber-100 text-amber-700',
      'commission-earned': 'bg-green-100 text-green-700',
      'meeting-scheduled': 'bg-indigo-100 text-indigo-700',
      'message-sent': 'bg-pink-100 text-pink-700',
      'application-submitted': 'bg-teal-100 text-teal-700'
    };
    return colors?.[type] || 'bg-gray-100 text-gray-700';
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Activity" size={20} color="var(--color-primary)" />
          <h2 className="text-lg md:text-xl font-bold text-foreground">Recent Activity</h2>
        </div>
        <button className="text-xs text-primary hover:underline">View All</button>
      </div>
      <div className="space-y-4">
        {activities?.map((activity, index) => (
          <div key={activity?.id} className="relative">
            {index !== activities?.length - 1 && (
              <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
            )}
            
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-full ${getActivityColor(activity?.type)} flex items-center justify-center flex-shrink-0 relative z-10`}>
                <Icon name={getActivityIcon(activity?.type)} size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{activity?.title}</span>
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {getTimeAgo(activity?.timestamp)}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {activity?.description}
                </p>

                {activity?.clientName && (
                  <div className="flex items-center space-x-2">
                    {activity?.clientAvatar && (
                      <Image
                        src={activity?.clientAvatar}
                        alt={activity?.clientAvatarAlt}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <span className="text-xs font-medium text-foreground">{activity?.clientName}</span>
                  </div>
                )}

                {activity?.metadata && (
                  <div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground">
                    {activity?.metadata?.amount && (
                      <span className="font-semibold text-green-600">{activity?.metadata?.amount}</span>
                    )}
                    {activity?.metadata?.status && (
                      <span className="px-2 py-0.5 bg-muted rounded-full">{activity?.metadata?.status}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;