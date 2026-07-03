import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const NotificationCard = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();

  const getNotificationIcon = (type) => {
    const icons = {
      'status_update': 'Bell',
      'document_request': 'FileText',
      'document_update': 'FileText',
      'message': 'MessageSquare',
      'approval': 'CheckCircle2',
      'alert': 'AlertCircle',
      'abandoned_checkout': 'ShoppingCart',
      'abandoned_sip': 'TrendingUp',
      'renewal_reminder': 'Shield',
      'info': 'Info'
    };
    return icons?.[type] || 'Bell';
  };

  const getNotificationColor = (type) => {
    const colors = {
      'status_update': 'bg-blue-50 border-blue-200',
      'document_request': 'bg-orange-50 border-orange-200',
      'document_update': 'bg-orange-50 border-orange-200',
      'message': 'bg-purple-50 border-purple-200',
      'approval': 'bg-green-50 border-green-200',
      'alert': 'bg-red-50 border-red-200',
      'abandoned_checkout': 'bg-amber-50 border-amber-200',
      'abandoned_sip': 'bg-orange-50 border-orange-200',
      'renewal_reminder': 'bg-emerald-50 border-emerald-200',
      'info': 'bg-gray-50 border-gray-200'
    };
    return colors?.[type] || 'bg-gray-50 border-gray-200';
  };

  const getIconColor = (type) => {
    const colors = {
      'status_update': '#3B82F6',
      'document_request': '#F97316',
      'document_update': '#F97316',
      'message': '#A855F7',
      'approval': '#10B981',
      'alert': '#EF4444',
      'abandoned_checkout': '#D97706',
      'abandoned_sip': '#EA580C',
      'renewal_reminder': '#059669',
      'info': '#6B7280'
    };
    return colors?.[type] || '#6B7280';
  };

  const handleClick = () => {
    if (!notification?.isRead) onMarkAsRead?.(notification?.id);
    const path = notification?.data?.path || notification?.path;
    if (path) navigate(path);
  };

  return (
    <div 
      role={(notification?.data?.path || notification?.path) ? 'button' : undefined}
      tabIndex={(notification?.data?.path || notification?.path) ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={`border rounded-lg p-4 transition-all duration-300 ${
        notification?.isRead ? 'bg-card' : getNotificationColor(notification?.type)
      } ${!notification?.isRead ? 'border-l-4' : 'border'} ${
        (notification?.data?.path || notification?.path) ? 'cursor-pointer hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          notification?.isRead ? 'bg-muted' : 'bg-white'
        }`}>
          <Icon 
            name={getNotificationIcon(notification?.type)} 
            size={18} 
            color={notification?.isRead ? 'var(--color-muted-foreground)' : getIconColor(notification?.type)} 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`text-sm md:text-base font-semibold ${
              notification?.isRead ? 'text-muted-foreground' : 'text-foreground'
            }`}>
              {notification?.title}
            </h4>
            {!notification?.isRead && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification?.id);
                }}
                className="text-xs text-primary hover:text-primary/80 font-medium whitespace-nowrap flex-shrink-0"
              >
                Mark as read
              </button>
            )}
          </div>
          
          <p className={`text-xs md:text-sm mb-2 ${
            notification?.isRead ? 'text-muted-foreground' : 'text-foreground/80'
          }`}>
            {notification?.message}
          </p>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Icon name="Clock" size={12} />
              {notification?.timestamp}
            </span>
            {notification?.source && (
              <span className="flex items-center gap-1">
                <Icon name="User" size={12} />
                {notification?.source}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;