import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const EmployeeCard = ({
  employee,
  onApprove,
  onEditDetails,
  onResetPassword,
  onEditRole,
  onViewActivity,
}) => {
  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { bg: 'bg-admin-primary/10', text: 'text-admin-primary', icon: 'Shield' },
      'super-admin': { bg: 'bg-purple-500/10', text: 'text-purple-600', icon: 'Crown' },
      employee: { bg: 'bg-employee-primary/10', text: 'text-employee-primary', icon: 'Briefcase' },
      manager: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', icon: 'Users' }
    };

    const config = roleConfig?.[role] || roleConfig?.employee;
    return (
      <span className={`inline-flex items-center space-x-1 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${config?.bg} ${config?.text}`}>
        <Icon name={config?.icon} size={14} />
        <span className="capitalize">{role?.replace('-', ' ')}</span>
      </span>
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-start space-x-4">
        <Image
          src={employee?.profileImage}
          alt={employee?.profileImageAlt}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
            <h3 className="text-base md:text-lg font-bold text-foreground mb-1 md:mb-0">{employee?.name}</h3>
            {getRoleBadge(employee?.role)}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{employee?.email}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Department</p>
              <p className="font-semibold text-foreground">{employee?.department}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Tasks</p>
              <p className="font-semibold text-foreground">{employee?.tasksCompleted}/{employee?.tasksTotal}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Last Active</p>
              <p className="font-semibold text-foreground">{employee?.lastActive}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Status</p>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${employee?.isOnline ? 'bg-success' : 'bg-muted-foreground'}`}></div>
                <span className="font-semibold text-foreground">{employee?.isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {employee?.accessConfigured ? (
              employee?.permissions?.length > 0 ? (
                employee.permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-primary/10 text-primary border border-primary/20"
                  >
                    {permission}
                  </span>
                ))
              ) : (
                <span className="text-xs text-amber-700">Access configured — no modules enabled</span>
              )
            ) : (
              <span className="text-xs text-muted-foreground">Full employee access (not restricted)</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-border flex-wrap">
        {employee?.status === 'pending' && onApprove && (
          <Button
            variant="default"
            size="sm"
            iconName="Check"
            onClick={() => onApprove(employee.id)}
          >
            Activate
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          iconName="UserCog"
          iconPosition="left"
          onClick={() => onEditDetails?.(employee)}
        >
          Edit details
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="Key"
          iconPosition="left"
          onClick={() => onResetPassword?.(employee)}
        >
          Reset password
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="Shield"
          iconPosition="left"
          onClick={() => onEditRole?.(employee)}
        >
          Access type
        </Button>
        <Button
          variant="ghost"
          size="sm"
          iconName="Activity"
          iconPosition="left"
          onClick={() => onViewActivity?.(employee)}
        >
          View Activity
        </Button>
      </div>
    </div>
  );
};

export default EmployeeCard;