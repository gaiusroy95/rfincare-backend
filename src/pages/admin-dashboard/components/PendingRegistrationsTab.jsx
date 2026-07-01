import React, { useState, useEffect } from 'react';
import { registrationService } from '../../../services/registrationService';
import { authService } from '../../../services/authService';
import { UserPlus, CheckCircle, XCircle, Clock, Mail, User, Phone } from 'lucide-react';
import { format } from 'date-fns';

const PendingRegistrationsTab = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    const { data, error } = await registrationService?.getPendingRegistrations();
    if (error) {
      setError(error?.message);
    } else {
      setRegistrations(data || []);
    }
    setLoading(false);
  };

  const handleApprove = (registration) => {
    setSelectedRegistration(registration);
    setUsername(registration?.email?.split('@')?.[0] || '');
    setPassword('');
    setShowApprovalModal(true);
  };

  const handleReject = (registration) => {
    setSelectedRegistration(registration);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  const confirmApproval = async () => {
    if (!username || !password) {
      alert('Username and password are required');
      return;
    }

    setProcessing(true);
    const { error } = await authService?.approveRegistration(
      selectedRegistration?.id,
      username,
      password
    );

    if (error) {
      alert(error?.message);
    } else {
      alert('Registration approved successfully!');
      setShowApprovalModal(false);
      loadRegistrations();
    }
    setProcessing(false);
  };

  const confirmRejection = async () => {
    if (!rejectionReason) {
      alert('Rejection reason is required');
      return;
    }

    setProcessing(true);
    const { error } = await authService?.rejectRegistration(
      selectedRegistration?.id,
      rejectionReason
    );

    if (error) {
      alert(error?.message);
    } else {
      alert('Registration rejected');
      setShowRejectionModal(false);
      loadRegistrations();
    }
    setProcessing(false);
  };

  const getProviderBadge = (provider) => {
    const colors = {
      google: 'bg-red-100 text-red-800',
      microsoft: 'bg-blue-100 text-blue-800',
      outlook: 'bg-blue-100 text-blue-800',
      yahoo: 'bg-purple-100 text-purple-800',
      rediff: 'bg-red-100 text-red-800',
      email: 'bg-gray-100 text-gray-800'
    };
    return colors?.[provider] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
        {error}
      </div>
    );
  }

  if (registrations?.length === 0) {
    return (
      <div className="text-center py-12">
        <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No pending registrations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Pending Customer Registrations</h2>
        <button
          onClick={loadRegistrations}
          className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>
      <div className="grid gap-4">
        {registrations?.map((registration) => (
          <div
            key={registration?.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{registration?.fullName}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProviderBadge(registration?.oauthProvider)}`}>
                    {registration?.oauthProvider?.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{registration?.email}</span>
                  </div>
                  {registration?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{registration?.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Registered: {format(new Date(registration?.createdAt), 'PPp')}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(registration)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(registration)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {registration?.employmentType && (
                <div>
                  <p className="text-xs text-gray-500">Employment</p>
                  <p className="text-sm font-medium text-gray-900">{registration?.employmentType}</p>
                </div>
              )}
              {registration?.annualIncome && (
                <div>
                  <p className="text-xs text-gray-500">Annual Income</p>
                  <p className="text-sm font-medium text-gray-900">₹{Number(registration?.annualIncome)?.toLocaleString()}</p>
                </div>
              )}
              {registration?.city && (
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium text-gray-900">{registration?.city}, {registration?.state}</p>
                </div>
              )}
              {registration?.bankName && (
                <div>
                  <p className="text-xs text-gray-500">Preferred Bank</p>
                  <p className="text-sm font-medium text-gray-900">{registration?.bankName}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Approve Registration</h3>
            <p className="text-sm text-gray-600 mb-4">
              Set up login credentials for {selectedRegistration?.fullName}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e?.target?.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e?.target?.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter temporary password"
                />
                <p className="text-xs text-gray-500 mt-1">User will be required to change password on first login</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={confirmApproval}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm Approval'}
              </button>
              <button
                onClick={() => setShowApprovalModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Reject Registration</h3>
            <p className="text-sm text-gray-600 mb-4">
              Provide a reason for rejecting {selectedRegistration?.fullName}'s registration
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e?.target?.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter reason for rejection"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={confirmRejection}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm Rejection'}
              </button>
              <button
                onClick={() => setShowRejectionModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRegistrationsTab;