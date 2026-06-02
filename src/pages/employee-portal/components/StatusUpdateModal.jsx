import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import {
  BANK_APPROVAL_STAGE_SELECT_OPTIONS,
  DOCUMENT_STAGE_SELECT_OPTIONS,
} from '../../../constants/applicationStageOptions';

const StatusUpdateModal = ({ application, isOpen, onClose, onUpdate }) => {
  const [status, setStatus] = useState(application?.status || 'under_review');
  const [statusNotes, setStatusNotes] = useState('');
  const [documentStageStatus, setDocumentStageStatus] = useState(
    application?.documentStageStatus || 'documents_pending',
  );
  const [bankApprovalStatus, setBankApprovalStatus] = useState(
    application?.bankApprovalStatus || 'submitted_to_bank',
  );
  const [sendNotification, setSendNotification] = useState(true);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'documents_pending', label: 'Documents Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'disbursed', label: 'Disbursed' }
  ];
  const getStatusColor = (statusValue) => {
    const colors = {
      submitted: 'text-blue-600 bg-blue-50',
      under_review: 'text-yellow-600 bg-yellow-50',
      documents_pending: 'text-orange-600 bg-orange-50',
      approved: 'text-green-600 bg-green-50',
      rejected: 'text-red-600 bg-red-50',
      disbursed: 'text-purple-600 bg-purple-50'
    };
    return colors?.[statusValue] || 'text-gray-600 bg-gray-50';
  };

  const handleSubmit = async () => {
    if (!statusNotes?.trim()) {
      alert('Please provide status update notes');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(application?.id, {
        status,
        notes: statusNotes,
        documentStageStatus,
        bankApprovalStatus,
        sendNotification
      });
      onClose();
    } catch (error) {
      console.error('Status update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">Update Application Status</h2>
            <p className="text-sm text-muted-foreground mt-1">{application?.applicationNumber}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={24} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Current Status */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Current Status</h3>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application?.status)}`}>
                {application?.status?.replace('_', ' ')?.toUpperCase()}
              </span>
              <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                {status?.replace('_', ' ')?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Application Details */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Application Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Customer:</span>
                <p className="font-medium text-foreground">{application?.customer?.fullName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Loan Type:</span>
                <p className="font-medium text-foreground">{application?.loanPurpose}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <p className="font-medium text-foreground">₹{application?.requestedLoanAmount?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Submitted:</span>
                <p className="font-medium text-foreground">{new Date(application?.submittedAt)?.toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* New Status Selection */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">New Status</h3>
            <Select
              label="Select Status"
              options={statusOptions}
              value={status}
              onChange={setStatus}
            />
          </div>

          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">QC and Bank Stages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Document stage"
                options={DOCUMENT_STAGE_SELECT_OPTIONS}
                value={documentStageStatus}
                onChange={setDocumentStageStatus}
              />
              <Select
                label="Bank approval stage"
                options={BANK_APPROVAL_STAGE_SELECT_OPTIONS}
                value={bankApprovalStatus}
                onChange={setBankApprovalStatus}
              />
            </div>
          </div>

          {/* Status Notes */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Status Update Notes *</h3>
            <textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              rows={4}
              placeholder="Provide details about this status update..."
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              These notes will be visible in the application timeline
            </p>
          </div>

          {/* Notification Option */}
          <div className="bg-muted rounded-lg p-4">
            <Checkbox
              label="Send notification to customer"
              checked={sendNotification}
              onChange={() => setSendNotification(!sendNotification)}
              size="sm"
            />
            <p className="text-xs text-muted-foreground mt-2 ml-6">
              Customer will receive an email and in-app notification about this status update
            </p>
          </div>

          {/* Status Change Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">Status Update Guidelines:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Under Review:</strong> Application is being processed</li>
                  <li><strong>Documents Pending:</strong> Additional documents required</li>
                  <li><strong>Approved:</strong> Application has been approved</li>
                  <li><strong>Rejected:</strong> Application does not meet criteria</li>
                  <li><strong>Disbursed:</strong> Loan amount has been disbursed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 md:p-6 border-t border-border">
          <div className="text-xs md:text-sm text-muted-foreground">
            {statusNotes?.trim() ? (
              <span className="text-success flex items-center">
                <Icon name="CheckCircle" size={16} className="mr-1" />
                Ready to update status
              </span>
            ) : (
              <span className="flex items-center">
                <Icon name="AlertCircle" size={16} className="mr-1" />
                Status notes required
              </span>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-initial"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={!statusNotes?.trim() || loading}
              className="flex-1 sm:flex-initial"
              loading={loading}
            >
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Update Status
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;
