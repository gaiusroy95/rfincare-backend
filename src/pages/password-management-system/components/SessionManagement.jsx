import React, { useState, useEffect } from 'react';
import { authService } from '../../../services/authService';
import { Monitor, Smartphone, Tablet, MapPin, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const SessionManagement = ({ userId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSessions();
  }, [userId]);

  const loadSessions = async () => {
    setLoading(true);
    const { data, error } = await authService?.getUserSessions(userId);
    if (error) {
      setError(error?.message);
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  };

  const handleTerminateSession = async (sessionId) => {
    if (!confirm('Are you sure you want to terminate this session?')) return;
    
    const { error } = await authService?.terminateSession(sessionId);
    if (error) {
      alert(error?.message);
    } else {
      loadSessions();
    }
  };

  const getDeviceIcon = (userAgent) => {
    if (!userAgent) return <Monitor className="w-5 h-5" />;
    
    const ua = userAgent?.toLowerCase();
    if (ua?.includes('mobile') || ua?.includes('android') || ua?.includes('iphone')) {
      return <Smartphone className="w-5 h-5" />;
    }
    if (ua?.includes('tablet') || ua?.includes('ipad')) {
      return <Tablet className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (sessions?.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No active sessions found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Active Sessions</h2>
      <div className="space-y-4">
        {sessions?.map((session) => (
          <div
            key={session?.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                  {getDeviceIcon(session?.userAgent)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {session?.oauthProvider ? `${session?.oauthProvider} Login` : 'Email Login'}
                    </h3>
                    {session?.isActive && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    {session?.ipAddress && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{session?.ipAddress}</span>
                      </div>
                    )}
                    {session?.lastActivity && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Last active: {format(new Date(session?.lastActivity), 'PPp')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleTerminateSession(session?.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Terminate session"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionManagement;