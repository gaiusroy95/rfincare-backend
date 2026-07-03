import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/** Legacy /profile route — keep customers inside the dashboard portal. */
const CustomerProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab') || 'profile';
    navigate(`/customer-dashboard?tab=${tab}`, { replace: true });
  }, [navigate, searchParams]);

  return null;
};

export default CustomerProfile;
