import { apiClient } from '../lib/apiClient';

export const referralService = {
  async getReferral(program = 'customer') {
    const res = await apiClient.get('/portal/referrals', { params: { program } });
    return res.data;
  },
  async recordInvite(payload) {
    const res = await apiClient.post('/portal/referrals/invites', payload);
    return res.data;
  },
};
