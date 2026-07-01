import { apiClient } from '../lib/apiClient';

export const partnerRegistrationService = {
  async getPendingPartnerApplications() {
    try {
      const res = await apiClient.get('/partners/registrations', { params: { status: 'pending' } });
      return { data: res.data?.registrations || [], error: null };
    } catch (error) {
      return {
        data: [],
        error: { message: error.response?.data?.error || 'Failed to load partner applications' },
      };
    }
  },

  async approvePartnerApplication(id) {
    try {
      const res = await apiClient.post(`/partners/registrations/${id}/approve`);
      return { data: res.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: error.response?.data?.error || 'Failed to approve partner application' },
      };
    }
  },

  async rejectPartnerApplication(id, reason) {
    try {
      const res = await apiClient.post(`/partners/registrations/${id}/reject`, { reason });
      return { data: res.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: error.response?.data?.error || 'Failed to reject partner application' },
      };
    }
  },
};
