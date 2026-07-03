import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { leadService } from '../../services/leadService';
import LoadingPageShell from '../../components/layout/LoadingPageShell';

const SESSION_KEY = 'loan_assessment_session';

const ResumeApplicationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Restoring your application…');
  const [isError, setIsError] = useState(false);

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
        setIsError(true);
        setMessage(err?.response?.data?.error || 'This link is invalid or expired.');
      }
    };
    run();
  }, [token, navigate]);

  return <LoadingPageShell message={message} error={isError} />;
};

export default ResumeApplicationPage;
