import { apiClient } from '../lib/apiClient';

export const customerFinancialService = {
  async getFinancialSnapshot() {
    const res = await apiClient.get('/portal/customer/financial-snapshot');
    return res.data;
  },
};
