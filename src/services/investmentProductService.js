import { apiClient } from '../lib/apiClient';
import { buildQueryParams } from '../utils/investmentMarketplaceFilters';

export const investmentProductService = {
  async listActive(filters = {}) {
    const params = buildQueryParams(filters);
    const res = await apiClient.get('/investment-products', { params });
    return res.data;
  },

  async listAll(filters = {}) {
    const params = { includeInactive: 'true', ...buildQueryParams(filters) };
    const res = await apiClient.get('/investment-products', { params });
    return res.data;
  },

  async getTaxonomy() {
    const res = await apiClient.get('/investment-products/taxonomy');
    return res.data;
  },

  async getById(id) {
    const res = await apiClient.get(`/investment-products/${id}`);
    return res.data;
  },

  async create(payload) {
    const res = await apiClient.post('/investment-products', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await apiClient.put(`/investment-products/${id}`, payload);
    return res.data;
  },

  async remove(id) {
    const res = await apiClient.delete(`/investment-products/${id}`);
    return res.data;
  },

  formatListField(text) {
    if (!text) return [];
    if (Array.isArray(text)) return text.filter(Boolean).map(String);
    return String(text).split('\n').map((s) => s.trim()).filter(Boolean);
  },
};
