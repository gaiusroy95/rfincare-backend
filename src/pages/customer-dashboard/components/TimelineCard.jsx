import React from 'react';
import Icon from '../../../components/AppIcon';

const TimelineCard = ({ events }) => {
  const getEventIcon = (type) => {
    const icons = {
      'application': 'FileText',
      'document': 'Upload',
      'review': 'FileSearch',
      'approval': 'CheckCircle2',
      'rejection': 'XCircle',
      'message': 'MessageSquare',
      'update': 'RefreshCw'
    };
    return icons?.[type] || 'Circle';
  };

  const getEventColor = (type) => {
    const colors = {
      'application': 'bg-blue-500',
      'document': 'bg-orange-500',
      'review': 'bg-purple-500',
      'approval': 'bg-green-500',
      'rejection': 'bg-red-500',
      'message': 'bg-pink-500',
      'update': 'bg-indigo-500'
    };
    return colors?.[type] || 'bg-gray-500';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6 flex items-center gap-2">
        <Icon name="Clock" size={24} color="var(--color-primary)" />
        Recent Activity Timeline
      </h3>
      <div className="space-y-4 md:space-y-6">
        {events?.map((event, index) => (
          <div key={event?.id} className="relative">
            {index !== events?.length - 1 && (
              <div className="absolute left-4 md:left-5 top-10 bottom-0 w-0.5 bg-border" />
            )}
            
            <div className="flex gap-3 md:gap-4">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${getEventColor(event?.type)} flex items-center justify-center flex-shrink-0 relative z-10`}>
                <Icon name={getEventIcon(event?.type)} size={16} color="white" />
              </div>
              
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
                  <h4 className="text-sm md:text-base font-semibold text-foreground">
                    {event?.title}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {event?.timestamp}
                  </span>
                </div>
                
                <p className="text-xs md:text-sm text-muted-foreground mb-2">
                  {event?.description}
                </p>
                
                {event?.details && (
                  <div className="bg-muted/50 rounded-lg p-3 text-xs md:text-sm">
                    {event?.details}
                  </div>
                )}
                
                {event?.actionRequired && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-orange-600">
                    <Icon name="AlertCircle" size={14} />
                    <span className="font-medium">Action Required</span>
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

export default TimelineCard;