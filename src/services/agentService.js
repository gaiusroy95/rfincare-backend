import { apiClient } from '../lib/apiClient';

export const agentService = {
  async getDashboard() {
    const res = await apiClient.get('/portal/agent/dashboard');
    return res.data;
  },

  async updateClientStatus(applicationId, kanbanStatus) {
    const statusMap = {
      new: 'submitted',
      'in-progress': 'under_review',
      documents: 'under_review',
      submitted: 'approved',
    };
    const res = await apiClient.patch(`/loan-applications/${applicationId}`, {
      status: statusMap[kanbanStatus] || 'under_review',
    });
    return res.data;
  },
};
