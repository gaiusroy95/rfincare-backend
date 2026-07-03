import { apiClient } from '../lib/apiClient';

export const customerFinancialService = {
  async getFinancialSnapshot() {
    const res = await apiClient.get('/portal/customer/financial-snapshot');
    return res.data;
  },

  async getCustomer360() {
    const res = await apiClient.get('/portal/customer/360');
    return res.data;
  },

  async getCreditScore() {
    const res = await apiClient.get('/portal/customer/credit-score');
    return res.data;
  },

  async pullCreditScore() {
    const res = await apiClient.post('/portal/customer/credit-score/pull');
    return res.data;
  },
};
