import { apiClient } from '../lib/apiClient';

export const calculatorService = {
  async listCalculators(category) {
    const res = await apiClient.get('/calculators', {
      params: category ? { category } : undefined,
    });
    return res.data;
  },

  async getCalculator(slug) {
    const res = await apiClient.get(`/calculators/${encodeURIComponent(slug)}`);
    return res.data;
  },

  async calculate(slug, input) {
    const res = await apiClient.post(`/calculators/${encodeURIComponent(slug)}/calculate`, input);
    return res.data;
  },
};
