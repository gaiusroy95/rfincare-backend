import React from 'react';
import ProtectedRoute from '../ProtectedRoute';
import AdminLayout from './AdminLayout';

/** Auth guard + persistent admin chrome for all admin routes. */
const AdminRouteShell = () => (
  <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
    <AdminLayout />
  </ProtectedRoute>
);

export default AdminRouteShell;
