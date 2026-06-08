import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { employeeCanReachRoute } from '../utils/employeeAccess';

const ProtectedRoute = ({ children, allowedRoles = [], employeeRoute = null }) => {
  const { user, userProfile, loading, employeeAccess } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login page if not authenticated
  if (!user) {
    return <Navigate to="/login-page" state={{ from: location }} replace />;
  }

  const effectiveRole = userProfile?.role || user?.role;

  // Check if user has required role
  if (allowedRoles?.length > 0 && !allowedRoles?.includes(effectiveRole)) {
    // Redirect to appropriate dashboard based on user's actual role
    const roleRoutes = {
      'customer': '/customer-dashboard',
      'admin': '/admin-dashboard',
      'super_admin': '/admin-dashboard',
      'employee': '/employee-portal',
      'agent': '/agent-dashboard'
    };
    
    const redirectPath = roleRoutes?.[effectiveRole] || '/login-page';
    return <Navigate to={redirectPath} replace />;
  }

  if (
    effectiveRole === 'employee'
    && employeeRoute
    && employeeAccess?.configured
    && !employeeCanReachRoute(employeeAccess, employeeRoute)
  ) {
    return <Navigate to="/employee-portal" replace />;
  }

  return children;
};

export default ProtectedRoute;