import React from 'react';

import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const AgentManagementCard = ({
  agent,
  onApprove,
  onReject,
  onViewProfile,
  onEditDetails,
  onResetPassword,
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-warning/10', text: 'text-warning', label: 'Pending Approval' },
      active: { bg: 'bg-success/10', text: 'text-success', label: 'Active' },
      suspended: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Suspended' },
      inactive: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Inactive' }
    };

    const config = statusConfig?.[status] || statusConfig?.pending;
    return (
      <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${config?.bg} ${config?.text}`}>
        {config?.label}
      </span>
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-start space-x-4">
          <Image
            src={agent?.profileImage}
            alt={agent?.profileImageAlt}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold text-foreground mb-1">{agent?.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{agent?.email}</p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {getStatusBadge(agent?.status)}
              <span className="text-xs text-muted-foreground">ID: {agent?.agentId}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Clients</p>
                <p className="font-semibold text-foreground">{agent?.totalClients}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Commission</p>
                <p className="font-semibold text-success">${agent?.totalCommission?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Success Rate</p>
                <p className="font-semibold text-foreground">{agent?.successRate}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Joined</p>
                <p className="font-semibold text-foreground">{agent?.joinedDate}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2 md:ml-4 min-w-[160px]">
          <Button
            variant="outline"
            size="sm"
            iconName="UserCog"
            iconPosition="left"
            onClick={() => onEditDetails?.(agent)}
            fullWidth
          >
            Edit details
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Key"
            iconPosition="left"
            onClick={() => onResetPassword?.(agent)}
            fullWidth
          >
            Reset password
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="IndianRupee"
            iconPosition="left"
            onClick={() => onViewProfile?.(agent)}
            fullWidth
          >
            Commission
          </Button>
          {agent?.status === 'pending' && (
            <>
              <Button
                variant="success"
                size="sm"
                iconName="Check"
                iconPosition="left"
                onClick={() => onApprove(agent?.id)}
                fullWidth
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                iconName="X"
                iconPosition="left"
                onClick={() => onReject(agent?.id)}
                fullWidth
              >
                Reject
              </Button>
            </>
          )}
          {agent?.status === 'active' && (
            <Button
              variant="warning"
              size="sm"
              iconName="Ban"
              iconPosition="left"
              fullWidth
            >
              Suspend
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentManagementCard;