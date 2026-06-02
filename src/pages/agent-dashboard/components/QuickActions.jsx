import React from 'react';
import Icon from '../../../components/AppIcon';


const QuickActions = ({ onActionClick }) => {
  const actions = [
    {
      id: 'add-client',
      label: 'Add Client',
      icon: 'UserPlus',
      color: 'from-blue-500 to-blue-600',
      description: 'Full loan application for customer'
    },
    {
      id: 'upload-document',
      label: 'Upload Document',
      icon: 'Upload',
      color: 'from-purple-500 to-purple-600',
      description: 'Submit client documents'
    },
    {
      id: 'schedule-meeting',
      label: 'Schedule Meeting',
      icon: 'Calendar',
      color: 'from-green-500 to-green-600',
      description: 'Book appointment'
    },
    {
      id: 'view-commission',
      label: 'Commission Report',
      icon: 'IndianRupee',
      color: 'from-amber-500 to-amber-600',
      description: 'View earnings'
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex items-center space-x-2 mb-4 md:mb-6">
        <Icon name="Zap" size={20} color="var(--color-primary)" />
        <h2 className="text-lg md:text-xl font-bold text-foreground">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {actions?.map((action) => (
          <button
            key={action?.id}
            onClick={() => onActionClick(action?.id)}
            className="group p-4 bg-muted rounded-lg hover:bg-muted/80 transition-all duration-200 text-left"
          >
            <div className="flex items-start space-x-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action?.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon name={action?.icon} size={24} color="white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground mb-1">{action?.label}</h3>
                <p className="text-xs text-muted-foreground">{action?.description}</p>
              </div>
              <Icon name="ChevronRight" size={16} color="var(--color-muted-foreground)" className="flex-shrink-0 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;