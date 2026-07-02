import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DASHBOARD_BY_ROLE = {
  customer: '/customer-dashboard',
  agent: '/agent-dashboard',
  employee: '/employee-portal',
  admin: '/admin-dashboard',
  super_admin: '/admin-dashboard',
};

/**
 * Redirect after auth state is committed — avoids navigating before ProtectedRoute sees the user.
 */
export function usePortalLoginRedirect(expectedRoles) {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const allowedRoles = useMemo(
    () => (Array.isArray(expectedRoles) ? expectedRoles : [expectedRoles]),
    [Array.isArray(expectedRoles) ? expectedRoles.join('|') : expectedRoles],
  );

  useEffect(() => {
    if (!user) return;
    const role = userProfile?.role || user?.role;
    if (!role || !allowedRoles.includes(role)) return;
    const destination = DASHBOARD_BY_ROLE[role];
    if (!destination) return;
    navigate(destination, { replace: true });
  }, [user, userProfile, allowedRoles, navigate]);
}
