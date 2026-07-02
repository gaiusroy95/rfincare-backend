import { apiClient } from '../lib/apiClient';
import { buildQueryParams } from '../utils/postOfficeFilters';

export const postOfficeService = {
  async listActive(filters = {}) {
    const params = buildQueryParams(filters);
    const res = await apiClient.get('/post-office-investments', { params });
    return res.data;
  },

  async listAll(filters = {}) {
    const params = { includeInactive: 'true', ...buildQueryParams(filters) };
    const res = await apiClient.get('/post-office-investments', { params });
    return res.data;
  },

  async getTaxonomy() {
    const res = await apiClient.get('/post-office-investments/taxonomy');
    return res.data;
  },

  async getById(id) {
    const res = await apiClient.get(`/post-office-investments/${id}`);
    return res.data;
  },

  async create(payload) {
    const res = await apiClient.post('/post-office-investments', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await apiClient.put(`/post-office-investments/${id}`, payload);
    return res.data;
  },

  async remove(id) {
    const res = await apiClient.delete(`/post-office-investments/${id}`);
    return res.data;
  },

  async calculate(payload) {
    const res = await apiClient.post('/post-office-investments/calculate', payload);
    return res.data;
  },

  formatListField(text) {
    if (!text) return [];
    if (Array.isArray(text)) return text.filter(Boolean).map(String);
    return String(text).split('\n').map((s) => s.trim()).filter(Boolean);
  },
};
