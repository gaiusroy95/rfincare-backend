import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from './AdminLayout';
import Header from '../ui/Header';
import Button from '../ui/Button';

/** Reports page shell — admin chrome for admins, employee header for staff. */
const ReportsRouteShell = () => {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const role = userProfile?.role;
  const isAdmin = role === 'admin' || role === 'super_admin';

  const handleLogout = async () => {
    await signOut();
    navigate(isAdmin ? '/admin-login' : '/employee-login');
  };

  if (isAdmin) {
    return <AdminLayout />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header>
        <Button variant="outline" size="sm" onClick={() => navigate('/employee-portal')} iconName="Briefcase">
          Employee Portal
        </Button>
        <Button variant="outline" size="sm" onClick={handleLogout} iconName="LogOut">
          Logout
        </Button>
      </Header>
      <Outlet />
    </div>
  );
};

export default ReportsRouteShell;
