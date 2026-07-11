import { apiClient } from '../lib/apiClient';

export const marketService = {
  async getMarketOverview({ force = false } = {}) {
    const res = await apiClient.get('/public/market-overview', {
      params: force ? { force: 1 } : undefined,
    });
    return res.data;
  },
};
