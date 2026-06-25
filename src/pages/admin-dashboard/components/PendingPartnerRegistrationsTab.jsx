import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, ExternalLink, Mail, Phone, XCircle } from 'lucide-react';
import { partnerRegistrationService } from '../../../services/partnerRegistrationService';

const PendingPartnerRegistrationsTab = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadApplications = async () => {
    setLoading(true);
    const { data, error: err } = await partnerRegistrationService.getPendingPartnerApplications();
    if (err) setError(err.message);
    else {
      setError('');
      setApplications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const confirmApprove = async (application) => {
    if (!window.confirm(`Approve partner application for ${application.fullName}? An FY agent code and welcome email will be sent automatically.`)) {
      return;
    }
    setProcessing(true);
    const { data, error: err } = await partnerRegistrationService.approvePartnerApplication(application.id);
    if (err) alert(err.message);
    else {
      alert(`Approved. Agent code: ${data?.agentCode || 'assigned'}. Welcome email sent.`);
      loadApplications();
    }
    setProcessing(false);
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Rejection reason is required');
      return;
    }
    setProcessing(true);
    const { error: err } = await partnerRegistrationService.rejectPartnerApplication(selected.id, rejectionReason.trim());
    if (err) alert(err.message);
    else {
      alert('Application rejected. Applicant will be notified by email.');
      setShowRejectModal(false);
      setSelected(null);
      loadApplications();
    }
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>;
  }

  if (!applications.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No pending partner applications</p>
        <button type="button" onClick={loadApplications} className="mt-4 text-primary text-sm font-medium">
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Pending partner applications</h3>
        <button type="button" onClick={loadApplications} className="text-sm text-primary font-medium">
          Refresh
        </button>
      </div>

      {applications.map((app) => (
        <div key={app.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 space-y-2">
              <h4 className="text-lg font-semibold text-gray-900">{app.fullName}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" />{app.email}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" />{app.phone}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" />Applied: {format(new Date(app.createdAt), 'PPp')}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 text-sm">
                <div><span className="text-gray-500">PAN:</span> {app.panNumber}</div>
                <div><span className="text-gray-500">IFSC:</span> {app.ifscCode}</div>
                <div><span className="text-gray-500">Bank:</span> {app.bankName}</div>
                <div><span className="text-gray-500">Account:</span> {app.accountNumber}</div>
                <div className="md:col-span-2"><span className="text-gray-500">Address:</span> {[app.addressLine1, app.city, app.state, app.pinCode].filter(Boolean).join(', ')}</div>
                <div className="md:col-span-2"><span className="text-gray-500">Branch:</span> {app.branchAddress}</div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                {app.photoUrl && (
                  <a href={app.photoUrl} target="_blank" rel="noreferrer" className="text-sm text-primary inline-flex items-center gap-1">
                    Photo <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {app.panCardUrl && (
                  <a href={app.panCardUrl} target="_blank" rel="noreferrer" className="text-sm text-primary inline-flex items-center gap-1">
                    PAN card <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {app.cancelledChequeUrl && (
                  <a href={app.cancelledChequeUrl} target="_blank" rel="noreferrer" className="text-sm text-primary inline-flex items-center gap-1">
                    Cancelled cheque <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {app.addressProofUrl && (
                  <a href={app.addressProofUrl} target="_blank" rel="noreferrer" className="text-sm text-primary inline-flex items-center gap-1">
                    Address proof <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                disabled={processing}
                onClick={() => confirmApprove(app)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => { setSelected(app); setRejectionReason(''); setShowRejectModal(true); }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}

      {showRejectModal && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-2">Reject partner application</h3>
            <p className="text-sm text-gray-600 mb-4">{selected.fullName}</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Reason for rejection"
            />
            <div className="flex gap-3 mt-4">
              <button type="button" disabled={processing} onClick={confirmReject} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50">
                {processing ? 'Processing…' : 'Confirm reject'}
              </button>
              <button type="button" disabled={processing} onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingPartnerRegistrationsTab;
