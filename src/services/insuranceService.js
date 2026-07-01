import { apiClient } from '../lib/apiClient';
import { buildInsuranceQueryParams } from '../utils/insuranceFilters';

function linesToList(text) {
  if (!text) return [];
  if (Array.isArray(text)) return text.filter(Boolean).map(String);
  return String(text)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export const insuranceService = {
  async listActive(filters = {}) {
    const params = buildInsuranceQueryParams(filters);
    const res = await apiClient.get('/insurance-products', { params });
    return res.data;
  },

  async listAll(filters = {}) {
    const params = { includeInactive: 'true', ...buildInsuranceQueryParams(filters) };
    const res = await apiClient.get('/insurance-products', { params });
    return res.data;
  },

  async getTaxonomy() {
    const res = await apiClient.get('/insurance-products/taxonomy');
    return res.data;
  },

  async getById(id) {
    const res = await apiClient.get(`/insurance-products/${id}`);
    return res.data;
  },

  async create(payload) {
    const res = await apiClient.post('/insurance-products', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await apiClient.put(`/insurance-products/${id}`, payload);
    return res.data;
  },

  async remove(id) {
    const res = await apiClient.delete(`/insurance-products/${id}`);
    return res.data;
  },

  async uploadLogo(id, file) {
    const form = new FormData();
    form.append('logo', file);
    const res = await apiClient.post(`/insurance-products/${id}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  formatListField: linesToList,
};
