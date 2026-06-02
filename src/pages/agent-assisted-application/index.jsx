import React from 'react';
import CustomerAssessmentPortal from '../customer-assessment-portal';

/** Full loan assessment filled by a logged-in agent on behalf of the customer. */
const AgentAssistedApplicationPage = () => (
  <CustomerAssessmentPortal assistedByAgent />
);

export default AgentAssistedApplicationPage;
