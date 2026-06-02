import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const ApplicationTable = ({
  applications,
  onViewDetails,
  onApprove,
  onReject,
  onBulkApprove,
  onBulkReject,
  onBulkDelete,
  selectionResetKey = 0,
}) => {
  const [selectedApps, setSelectedApps] = useState([]);

  useEffect(() => {
    setSelectedApps([]);
  }, [selectionResetKey]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Draft' },
      pending: { bg: 'bg-warning/10', text: 'text-warning', label: 'Pending Review' },
      submitted: { bg: 'bg-warning/10', text: 'text-warning', label: 'Submitted' },
      'under-review': { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Under Review' },
      under_review: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Under Review' },
      approved: { bg: 'bg-success/10', text: 'text-success', label: 'Approved' },
      rejected: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Rejected' },
      'documents-pending': { bg: 'bg-orange-500/10', text: 'text-orange-600', label: 'Docs Pending' },
      documents_pending: { bg: 'bg-orange-500/10', text: 'text-orange-600', label: 'Docs Pending' },
    };

    const config = statusConfig?.[status] || statusConfig?.pending;
    return (
      <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${config?.bg} ${config?.text}`}>
        {config?.label}
      </span>
    );
  };

  const prettifyStage = (value) =>
    String(value || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { bg: 'bg-destructive/10', text: 'text-destructive', icon: 'AlertCircle' },
      medium: { bg: 'bg-warning/10', text: 'text-warning', icon: 'AlertTriangle' },
      low: { bg: 'bg-muted', text: 'text-muted-foreground', icon: 'Info' }
    };

    const config = priorityConfig?.[priority] || priorityConfig?.low;
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${config?.bg} ${config?.text}`}>
        <Icon name={config?.icon} size={12} />
        <span className="capitalize">{priority}</span>
      </span>
    );
  };

  const toggleSelectAll = () => {
    if (selectedApps?.length === applications?.length) {
      setSelectedApps([]);
    } else {
      setSelectedApps(applications?.map(app => app?.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedApps(prev =>
      prev?.includes(id) ? prev?.filter(appId => appId !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedApps?.length === applications?.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-border"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-foreground">Customer</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-foreground">Loan Type</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-foreground">Amount</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-foreground">Bank</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-foreground">Document Stage</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-foreground">Bank Stage</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-foreground">Agent Code</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-foreground">Priority</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-foreground">Date</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {applications?.map((app) => (
              <tr key={app?.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedApps?.includes(app?.id)}
                    onChange={() => toggleSelect(app?.id)}
                    className="w-4 h-4 rounded border-border"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    {app?.customerImage ? (
                      <Image
                        src={app.customerImage}
                        alt={app?.customerImageAlt}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon name="User" size={18} className="text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-primary truncate mb-0.5">
                        {app?.applicationNumber}
                      </p>
                      <p className="text-sm md:text-base font-semibold text-foreground truncate">{app?.customerName}</p>
                      <p className="text-xs text-muted-foreground truncate">{app?.customerEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm md:text-base text-foreground">{app?.loanType}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm md:text-base font-semibold text-foreground whitespace-nowrap">
                    {app?.amount > 0
                      ? `₹${app.amount.toLocaleString('en-IN')}`
                      : '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={app?.bankLogo}
                      alt={app?.bankLogoAlt}
                      className="w-6 h-6 rounded object-contain"
                    />
                    <span className="text-sm text-foreground">{app?.bankName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(app?.status)}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs md:text-sm text-foreground">{prettifyStage(app?.documentStageStatus)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs md:text-sm text-foreground">{prettifyStage(app?.bankApprovalStatus)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs md:text-sm font-medium text-foreground">{app?.agentCode || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  {getPriorityBadge(app?.priority)}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{app?.date}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(app)}
                      className="hover:bg-primary/10"
                    >
                      <Icon name="Eye" size={16} />
                    </Button>
                    {app?.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onApprove(app?.id)}
                          className="hover:bg-success/10 text-success"
                        >
                          <Icon name="Check" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onReject(app?.id)}
                          className="hover:bg-destructive/10 text-destructive"
                        >
                          <Icon name="X" size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedApps?.length > 0 && (
        <div className="px-4 py-3 bg-muted/30 border-t border-border flex items-center justify-between">
          <span className="text-sm text-foreground">{selectedApps?.length} selected</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Check"
              onClick={() => onBulkApprove?.(selectedApps)}
            >
              Bulk Approve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              iconName="X"
              onClick={() => onBulkReject?.(selectedApps)}
            >
              Bulk Reject
            </Button>
            <Button
              variant="destructive"
              size="sm"
              iconName="Trash2"
              onClick={() => onBulkDelete?.(selectedApps)}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTable;