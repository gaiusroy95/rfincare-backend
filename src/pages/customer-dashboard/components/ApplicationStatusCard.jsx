import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { formatInr } from '../../../utils/currency';

const ApplicationStatusCard = ({ application, onViewDetails }) => {
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 border-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      submitted: 'bg-sky-100 text-sky-800 border-sky-300',
      under_review: 'bg-blue-100 text-blue-800 border-blue-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      documents_required: 'bg-orange-100 text-orange-800 border-orange-300',
      documents_pending: 'bg-orange-100 text-orange-800 border-orange-300',
      processing: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors?.[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: 'FileEdit',
      pending: 'Clock',
      submitted: 'Send',
      under_review: 'FileSearch',
      approved: 'CheckCircle2',
      rejected: 'XCircle',
      documents_required: 'AlertCircle',
      documents_pending: 'AlertCircle',
      processing: 'RefreshCw',
    };
    return icons?.[status] || 'FileText';
  };

  const formatStatus = (status) => {
    return status?.split('_')?.map(word => 
      word?.charAt(0)?.toUpperCase() + word?.slice(1)
    )?.join(' ');
  };

  const getProgressPercentage = (status) => {
    const progress = {
      draft: 10,
      pending: 20,
      submitted: 35,
      documents_required: 45,
      documents_pending: 45,
      under_review: 60,
      processing: 80,
      approved: 100,
      rejected: 100,
    };
    return progress?.[status] || 0;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name="Building2" size={20} color="var(--color-primary)" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base md:text-lg font-semibold text-foreground truncate">
                {application?.bankName}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                {application?.loanType}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application?.status)}`}>
              <Icon name={getStatusIcon(application?.status)} size={14} />
              {formatStatus(application?.status)}
            </span>
            <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
              Applied: {application?.appliedDate}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-2">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Loan Amount</p>
            <p className="text-lg md:text-xl font-bold text-foreground whitespace-nowrap">
              {formatInr(application?.loanAmount)}
            </p>
          </div>
          {application?.interestRate != null && application?.interestRate !== '' && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Interest Rate</p>
            <p className="text-sm md:text-base font-semibold text-primary whitespace-nowrap">
              {application.interestRate}% APR
            </p>
          </div>
          )}
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm font-medium text-foreground">
            Application Progress
          </span>
          <span className="text-xs md:text-sm font-semibold text-primary">
            {getProgressPercentage(application?.status)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage(application?.status)}%` }}
          />
        </div>
      </div>
      {application?.nextStep && (
        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground mb-1">Next Step</p>
              <p className="text-xs md:text-sm text-muted-foreground">{application?.nextStep}</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="default" 
          className="flex-1"
          iconName="Eye"
          iconPosition="left"
          onClick={() => onViewDetails(application)}
        >
          View Details
        </Button>
        {application?.status === 'documents_required' && (
          <Button 
            variant="outline" 
            className="flex-1"
            iconName="Upload"
            iconPosition="left"
          >
            Upload Documents
          </Button>
        )}
      </div>
    </div>
  );
};

export default ApplicationStatusCard;