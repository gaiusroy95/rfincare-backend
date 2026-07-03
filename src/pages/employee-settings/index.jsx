import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** Legacy route — keep employees inside the portal. */
const EmployeeSettingsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/employee-portal?tab=settings', { replace: true });
  }, [navigate]);

  return null;
};

export default EmployeeSettingsPage;
