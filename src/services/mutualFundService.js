import { apiClient } from '../lib/apiClient';
import { buildMutualFundQueryParams } from '../utils/mutualFundFilters';

function linesToList(text) {
  if (!text) return [];
  if (Array.isArray(text)) return text.filter(Boolean).map(String);
  return String(text).split('\n').map((s) => s.trim()).filter(Boolean);
}

export const mutualFundService = {
  async listActive(filters = {}) {
    const params = buildMutualFundQueryParams(filters);
    const res = await apiClient.get('/mutual-funds', { params });
    return res.data;
  },

  async listAll(filters = {}) {
    const params = { includeInactive: 'true', ...buildMutualFundQueryParams(filters) };
    const res = await apiClient.get('/mutual-funds', { params });
    return res.data;
  },

  async getTaxonomy() {
    const res = await apiClient.get('/mutual-funds/taxonomy');
    return res.data;
  },

  async getById(id) {
    const res = await apiClient.get(`/mutual-funds/${id}`);
    return res.data;
  },

  async create(payload) {
    const res = await apiClient.post('/mutual-funds', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await apiClient.put(`/mutual-funds/${id}`, payload);
    return res.data;
  },

  async remove(id) {
    const res = await apiClient.delete(`/mutual-funds/${id}`);
    return res.data;
  },

  async uploadLogo(id, file) {
    const form = new FormData();
    form.append('logo', file);
    const res = await apiClient.post(`/mutual-funds/${id}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  formatListField: linesToList,
};
