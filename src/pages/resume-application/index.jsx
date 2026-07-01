import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { leadService } from '../../services/leadService';

const SESSION_KEY = 'loan_assessment_session';

const ResumeApplicationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Restoring your application…');

  useEffect(() => {
    const run = async () => {
      if (!token) {
        navigate('/customer-assessment-portal');
        return;
      }
      try {
        const data = await leadService.resolveResumeToken(token);
        if (data?.sessionKey) {
          localStorage.setItem(SESSION_KEY, data.sessionKey);
        }
        const qs = data?.loanType ? `?loanType=${encodeURIComponent(data.loanType)}` : '';
        navigate(`/customer-assessment-portal${qs}`, {
          replace: true,
          state: { resumeDraft: true },
        });
      } catch (err) {
        setMessage(err?.response?.data?.error || 'This link is invalid or expired.');
      }
    };
    run();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <p className="text-muted-foreground text-center max-w-md">{message}</p>
    </div>
  );
};

export default ResumeApplicationPage;
