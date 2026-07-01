import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';
import Icon from './AppIcon';

const SessionTimeout = ({ timeoutMinutes = 30, warningMinutes = 2 }) => {
  const { signOut, user, getRoleBasedRoute } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const countdownRef = useRef(null);

  const TIMEOUT_MS = timeoutMinutes * 60 * 1000; // 30 minutes
  const WARNING_MS = warningMinutes * 60 * 1000; // 2 minutes before timeout

  const clearAllTimers = () => {
    if (timeoutRef?.current) clearTimeout(timeoutRef?.current);
    if (warningRef?.current) clearTimeout(warningRef?.current);
    if (countdownRef?.current) clearInterval(countdownRef?.current);
  };

  const handleLogout = async () => {
    clearAllTimers();
    setShowWarning(false);
    await signOut();
    
    // Redirect to appropriate login page based on role
    const currentPath = window.location?.pathname;
    if (currentPath?.includes('admin')) {
      navigate('/admin-login');
    } else if (currentPath?.includes('employee')) {
      navigate('/employee-login');
    } else if (currentPath?.includes('agent')) {
      navigate('/agent-login');
    } else {
      navigate('/customer-login');
    }
  };

  const startCountdown = () => {
    setCountdown(WARNING_MS / 1000); // Convert to seconds
    
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef?.current);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const showWarningDialog = () => {
    setShowWarning(true);
    startCountdown();
  };

  const resetTimer = () => {
    clearAllTimers();
    setShowWarning(false);
    setCountdown(0);

    // Set warning timer (show warning 2 minutes before logout)
    warningRef.current = setTimeout(() => {
      showWarningDialog();
    }, TIMEOUT_MS - WARNING_MS);

    // Set logout timer (logout after full timeout)
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, TIMEOUT_MS);
  };

  const handleStayLoggedIn = () => {
    resetTimer();
  };

  useEffect(() => {
    if (!user) return;

    // Activity events to track
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Throttle activity tracking to avoid excessive resets
    let lastActivity = Date.now();
    const throttleDelay = 1000; // 1 second

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity > throttleDelay) {
        lastActivity = now;
        if (!showWarning) {
          resetTimer();
        }
      }
    };

    // Add event listeners
    events?.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events?.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearAllTimers();
    };
  }, [user, showWarning]);

  if (!showWarning) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Warning Dialog */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
              <Icon name="Clock" className="w-8 h-8 text-warning" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Session Timeout Warning
          </h2>

          {/* Message */}
          <p className="text-gray-600 text-center mb-6">
            Your session will expire due to inactivity. You will be automatically logged out in:
          </p>

          {/* Countdown */}
          <div className="bg-gradient-to-br from-warning/10 to-orange-50 rounded-xl p-6 mb-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-warning mb-2">
                {formatTime(countdown)}
              </div>
              <div className="text-sm text-gray-600">
                minutes remaining
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Logout Now
            </Button>
            <Button
              onClick={handleStayLoggedIn}
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
            >
              Stay Logged In
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Click "Stay Logged In" to continue your session
          </p>
        </div>
      </div>
    </>
  );
};

export default SessionTimeout;