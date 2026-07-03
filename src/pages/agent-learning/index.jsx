import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** Legacy route — keep agents inside the dashboard portal. */
const AgentLearningPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/agent-dashboard?view=learning&section=training', { replace: true });
  }, [navigate]);

  return null;
};

export default AgentLearningPage;
