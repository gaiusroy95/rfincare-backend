import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const PasswordHistoryList = ({ history }) => {
  if (!history || history?.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No password change history available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Password Change History</h2>
      <div className="space-y-4">
        {history?.map((entry) => (
          <div
            key={entry?.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {format(new Date(entry?.createdAt), 'PPpp')}
                  </span>
                </div>
                {entry?.changeReason && (
                  <p className="text-sm text-gray-600 mb-2">
                    Reason: {entry?.changeReason}
                  </p>
                )}
                {entry?.ipAddress && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>IP: {entry?.ipAddress}</span>
                  </div>
                )}
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Changed
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordHistoryList;