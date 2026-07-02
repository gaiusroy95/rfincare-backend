import { apiClient } from '../lib/apiClient';
import { buildQueryParams } from '../utils/governmentSchemeFilters';

export const governmentSchemeService = {
  async listActive(filters = {}) {
    const params = buildQueryParams(filters);
    const res = await apiClient.get('/government-schemes', { params });
    return res.data;
  },

  async listAll(filters = {}) {
    const params = { includeInactive: 'true', ...buildQueryParams(filters) };
    const res = await apiClient.get('/government-schemes', { params });
    return res.data;
  },

  async getTaxonomy() {
    const res = await apiClient.get('/government-schemes/taxonomy');
    return res.data;
  },

  async getById(id) {
    const res = await apiClient.get(`/government-schemes/${id}`);
    return res.data;
  },

  async create(payload) {
    const res = await apiClient.post('/government-schemes', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await apiClient.put(`/government-schemes/${id}`, payload);
    return res.data;
  },

  async remove(id) {
    const res = await apiClient.delete(`/government-schemes/${id}`);
    return res.data;
  },

  formatListField(text) {
    if (!text) return [];
    if (Array.isArray(text)) return text.filter(Boolean).map(String);
    return String(text).split('\n').map((s) => s.trim()).filter(Boolean);
  },
};
