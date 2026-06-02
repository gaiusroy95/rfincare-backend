import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const AgentVerificationModal = ({ agent, isOpen, onClose, onApprove, onReject }) => {
  const [verificationChecks, setVerificationChecks] = useState({
    identityVerified: false,
    bankDetailsVerified: false,
    documentsComplete: false,
    backgroundCheck: false
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [credentials, setCredentials] = useState({
    username: agent?.username || '',
    password: ''
  });
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckChange = (key) => {
    setVerificationChecks(prev => ({
      ...prev,
      [key]: !prev?.[key]
    }));
  };

  const allChecksComplete = Object.values(verificationChecks)?.every(check => check);

  const handleApprove = async () => {
    if (!allChecksComplete) {
      alert('Please complete all verification checks');
      return;
    }
    
    setLoading(true);
    try {
      await onApprove(agent?.userId || agent?.id, credentials?.notes || credentials);
      onClose();
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason?.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    setLoading(true);
    try {
      await onReject(agent?.userId || agent?.id, rejectionReason);
      onClose();
    } catch (error) {
      console.error('Rejection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !agent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">Agent Onboarding Verification</h2>
            <p className="text-sm text-muted-foreground mt-1">{agent?.agentName} - {agent?.agentCode}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={24} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Details */}
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="User" size={16} className="mr-2" />
                  Agent Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium text-foreground">{agent?.agentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Code:</span>
                    <span className="font-medium text-foreground">{agent?.agentCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-foreground">{agent?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mobile:</span>
                    <span className="font-medium text-foreground">{agent?.mobileNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Username:</span>
                    <span className="font-medium text-foreground">{agent?.username}</span>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="Building2" size={16} className="mr-2" />
                  Bank Account Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank Name:</span>
                    <span className="font-medium text-foreground">{agent?.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Number:</span>
                    <span className="font-medium text-foreground">{agent?.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IFSC Code:</span>
                    <span className="font-medium text-foreground">{agent?.ifscCode}</span>
                  </div>
                </div>
              </div>

              {/* Credentials Section */}
              {!showRejectForm && (
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                    <Icon name="Key" size={16} className="mr-2" />
                    Login Credentials
                  </h3>
                  <div className="space-y-3">
                    <Input
                      label="Username"
                      value={credentials?.username}
                      onChange={(e) => setCredentials(prev => ({ ...prev, username: e?.target?.value }))}
                      disabled
                    />
                    <Input
                      label="Temporary Password"
                      type="password"
                      placeholder="Generate password for agent"
                      value={credentials?.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e?.target?.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      This password will be sent to the agent's email upon approval
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Verification Section */}
            <div className="space-y-4">
              {!showRejectForm ? (
                <>
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                      <Icon name="CheckSquare" size={16} className="mr-2" />
                      Verification Checklist
                    </h3>
                    <div className="space-y-3">
                      <Checkbox
                        label="Identity Documents Verified (Aadhaar/PAN)"
                        checked={verificationChecks?.identityVerified}
                        onChange={() => handleCheckChange('identityVerified')}
                        size="sm"
                      />
                      <Checkbox
                        label="Bank Account Details Verified"
                        checked={verificationChecks?.bankDetailsVerified}
                        onChange={() => handleCheckChange('bankDetailsVerified')}
                        size="sm"
                      />
                      <Checkbox
                        label="All Required Documents Complete"
                        checked={verificationChecks?.documentsComplete}
                        onChange={() => handleCheckChange('documentsComplete')}
                        size="sm"
                      />
                      <Checkbox
                        label="Background Check Completed"
                        checked={verificationChecks?.backgroundCheck}
                        onChange={() => handleCheckChange('backgroundCheck')}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                      <div className="text-xs text-blue-800">
                        <p className="font-semibold mb-1">Verification Guidelines:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Verify identity documents match provided information</li>
                          <li>Confirm bank account is active and belongs to agent</li>
                          <li>Ensure all mandatory documents are uploaded</li>
                          <li>Complete background verification check</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Rejection Reason *</h3>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    rows={6}
                    placeholder="Provide detailed reason for rejection..."
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    This reason will be communicated to the agent
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 md:p-6 border-t border-border">
          <div className="text-xs md:text-sm text-muted-foreground">
            {!showRejectForm ? (
              allChecksComplete ? (
                <span className="text-success flex items-center">
                  <Icon name="CheckCircle" size={16} className="mr-1" />
                  All verification checks completed
                </span>
              ) : (
                <span className="flex items-center">
                  <Icon name="AlertCircle" size={16} className="mr-1" />
                  Complete all checks to approve
                </span>
              )
            ) : (
              <span className="flex items-center text-destructive">
                <Icon name="AlertTriangle" size={16} className="mr-1" />
                Rejection requires detailed reason
              </span>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {!showRejectForm ? (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 sm:flex-initial"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectForm(true)}
                  className="flex-1 sm:flex-initial"
                  disabled={loading}
                >
                  <Icon name="XCircle" size={16} className="mr-2" />
                  Reject
                </Button>
                <Button
                  variant="success"
                  onClick={handleApprove}
                  disabled={!allChecksComplete || !credentials?.password || loading}
                  className="flex-1 sm:flex-initial"
                  loading={loading}
                >
                  <Icon name="CheckCircle" size={16} className="mr-2" />
                  Approve & Send Credentials
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 sm:flex-initial"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectionReason?.trim() || loading}
                  className="flex-1 sm:flex-initial"
                  loading={loading}
                >
                  <Icon name="XCircle" size={16} className="mr-2" />
                  Confirm Rejection
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentVerificationModal;
