import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ApplicationReviewModal = ({ application, isOpen, onClose, onReview }) => {
  const [reviewChecks, setReviewChecks] = useState({
    personalInfoVerified: false,
    employmentVerified: false,
    incomeVerified: false,
    documentsComplete: false,
    eligibilityMet: false
  });
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [eligibilityStatus, setEligibilityStatus] = useState('eligible');
  const [loading, setLoading] = useState(false);

  const handleCheckChange = (key) => {
    setReviewChecks(prev => ({
      ...prev,
      [key]: !prev?.[key]
    }));
  };

  const allChecksComplete = Object.values(reviewChecks)?.every(check => check);

  const statusOptions = [
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'documents_pending', label: 'Documents Pending' },
    { value: 'under_review', label: 'Under Review' }
  ];

  const eligibilityOptions = [
    { value: 'eligible', label: 'Eligible' },
    { value: 'partially_eligible', label: 'Partially Eligible' },
    { value: 'not_eligible', label: 'Not Eligible' }
  ];

  const handleSubmitReview = async () => {
    if (reviewStatus === 'rejected' && !rejectionReason?.trim()) {
      alert('Please provide rejection reason');
      return;
    }

    setLoading(true);
    try {
      await onReview(application?.id, {
        status: reviewStatus,
        notes: reviewNotes,
        eligibilityStatus,
        rejectionReason: reviewStatus === 'rejected' ? rejectionReason : null
      });
      onClose();
    } catch (error) {
      console.error('Review submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center space-x-4">
            <Image
              src={application?.customer?.avatar || 'https://img.rocket.new/generatedImages/rocket_gen_img_186600153-1763296403185.png'}
              alt={`${application?.customer?.fullName} profile picture`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground">{application?.customer?.fullName}</h2>
              <p className="text-sm text-muted-foreground">{application?.applicationNumber}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={24} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Application Details */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="FileText" size={16} className="mr-2" />
                  Application Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Loan Type:</span>
                    <p className="font-medium text-foreground">{application?.loanPurpose}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Requested Amount:</span>
                    <p className="font-medium text-foreground">₹{application?.requestedLoanAmount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Employment Type:</span>
                    <p className="font-medium text-foreground">{application?.employmentType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Annual Income:</span>
                    <p className="font-medium text-foreground">₹{application?.annualIncome?.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Credit Score:</span>
                    <p className="font-medium text-foreground">{application?.creditScoreRange || 'Not Available'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Submitted:</span>
                    <p className="font-medium text-foreground">{new Date(application?.submittedAt)?.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="User" size={16} className="mr-2" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium text-foreground">{application?.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium text-foreground">{application?.phone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">PAN:</span>
                    <p className="font-medium text-foreground">{application?.panNumber || 'Not Provided'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Aadhaar:</span>
                    <p className="font-medium text-foreground">{application?.aadhaarNumber || 'Not Provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-medium text-foreground">{application?.city}, {application?.state} - {application?.pinCode}</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="CheckSquare" size={16} className="mr-2" />
                  Review Checklist
                </h3>
                <div className="space-y-3">
                  <Checkbox
                    label="Personal Information Verified"
                    checked={reviewChecks?.personalInfoVerified}
                    onChange={() => handleCheckChange('personalInfoVerified')}
                    size="sm"
                  />
                  <Checkbox
                    label="Employment Details Verified"
                    checked={reviewChecks?.employmentVerified}
                    onChange={() => handleCheckChange('employmentVerified')}
                    size="sm"
                  />
                  <Checkbox
                    label="Income Verification Complete"
                    checked={reviewChecks?.incomeVerified}
                    onChange={() => handleCheckChange('incomeVerified')}
                    size="sm"
                  />
                  <Checkbox
                    label="All Required Documents Submitted"
                    checked={reviewChecks?.documentsComplete}
                    onChange={() => handleCheckChange('documentsComplete')}
                    size="sm"
                  />
                  <Checkbox
                    label="Eligibility Criteria Met"
                    checked={reviewChecks?.eligibilityMet}
                    onChange={() => handleCheckChange('eligibilityMet')}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* Review Section */}
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Review Decision</h3>
                <div className="space-y-3">
                  <Select
                    label="Status"
                    options={statusOptions}
                    value={reviewStatus}
                    onChange={setReviewStatus}
                  />
                  
                  <Select
                    label="Eligibility Status"
                    options={eligibilityOptions}
                    value={eligibilityStatus}
                    onChange={setEligibilityStatus}
                  />
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Review Notes</h3>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  rows={4}
                  placeholder="Add review notes..."
                />
              </div>

              {reviewStatus === 'rejected' && (
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Rejection Reason *</h3>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    rows={4}
                    placeholder="Provide detailed rejection reason..."
                    required
                  />
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Icon name="Info" size={14} className="text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-semibold mb-1">Review Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Verify all information accuracy</li>
                      <li>Check document authenticity</li>
                      <li>Assess eligibility criteria</li>
                      <li>Provide clear rejection reasons</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 md:p-6 border-t border-border">
          <div className="text-xs md:text-sm text-muted-foreground">
            {allChecksComplete ? (
              <span className="text-success flex items-center">
                <Icon name="CheckCircle" size={16} className="mr-1" />
                All review checks completed
              </span>
            ) : (
              <span className="flex items-center">
                <Icon name="AlertCircle" size={16} className="mr-1" />
                Complete all checks before submission
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
              variant={reviewStatus === 'rejected' ? 'destructive' : 'success'}
              onClick={handleSubmitReview}
              disabled={!allChecksComplete || loading}
              className="flex-1 sm:flex-initial"
              loading={loading}
            >
              <Icon name={reviewStatus === 'rejected' ? 'XCircle' : 'CheckCircle'} size={16} className="mr-2" />
              Submit Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationReviewModal;
