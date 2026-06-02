import React from 'react';
import Icon from '../../../components/AppIcon';


const QuickActionsPanel = ({ onActionClick }) => {
  const quickActions = [
    {
      id: 'approve-applications',
      label: 'Approve Applications',
      icon: 'CheckCircle',
      color: 'bg-success/10 text-success hover:bg-success/20',
      count: 12
    },
    {
      id: 'review-agents',
      label: 'Review Agents',
      icon: 'Users',
      color: 'bg-primary/10 text-primary hover:bg-primary/20',
      count: 5
    },
    {
      id: 'manage-employees',
      label: 'Manage Employees',
      icon: 'Briefcase',
      color: 'bg-employee-primary/10 text-employee-primary hover:bg-employee-primary/20',
      count: 8
    },
    {
      id: 'update-matrix',
      label: 'Update Interest Matrix',
      icon: 'TrendingUp',
      color: 'bg-warning/10 text-warning hover:bg-warning/20',
      count: 3
    },
    {
      id: 'view-reports',
      label: 'View Reports',
      icon: 'BarChart3',
      color: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20',
      count: null
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      icon: 'Settings',
      color: 'bg-muted text-muted-foreground hover:bg-muted/80',
      count: null
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <h3 className="text-lg md:text-xl font-bold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickActions?.map((action) => (
          <button
            key={action?.id}
            onClick={() => onActionClick(action?.id)}
            className={`relative p-4 rounded-lg border border-border transition-all duration-300 ${action?.color} text-left group`}
          >
            <div className="flex items-start justify-between mb-2">
              <Icon name={action?.icon} size={24} />
              {action?.count !== null && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-background text-foreground text-xs font-bold">
                  {action?.count}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold">{action?.label}</p>
            <Icon
              name="ArrowRight"
              size={16}
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsPanel;