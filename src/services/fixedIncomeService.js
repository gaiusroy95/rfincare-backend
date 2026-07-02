import { apiClient } from '../lib/apiClient';
import { buildFixedIncomeQueryParams } from '../utils/fixedIncomeFilters';

export const fixedIncomeService = {
  async listActive(filters = {}) {
    const params = buildFixedIncomeQueryParams(filters);
    const res = await apiClient.get('/fixed-income', { params });
    return res.data;
  },

  async listAll(filters = {}) {
    const params = { includeInactive: 'true', ...buildFixedIncomeQueryParams(filters) };
    const res = await apiClient.get('/fixed-income', { params });
    return res.data;
  },

  async getTaxonomy() {
    const res = await apiClient.get('/fixed-income/taxonomy');
    return res.data;
  },

  async getById(id) {
    const res = await apiClient.get(`/fixed-income/${id}`);
    return res.data;
  },

  async create(payload) {
    const res = await apiClient.post('/fixed-income', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await apiClient.put(`/fixed-income/${id}`, payload);
    return res.data;
  },

  async remove(id) {
    const res = await apiClient.delete(`/fixed-income/${id}`);
    return res.data;
  },
};

