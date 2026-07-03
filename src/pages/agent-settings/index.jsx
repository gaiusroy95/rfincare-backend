import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** Legacy route — keep agents inside the dashboard portal. */
const AgentSettingsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/agent-dashboard?view=settings', { replace: true });
  }, [navigate]);

  return null;
};

export default AgentSettingsPage;
