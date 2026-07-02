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

  async listProviderConfigs() {
    const res = await apiClient.get('/insurance-products/provider-configs');
    return res.data;
  },

  async createProviderConfig(payload) {
    const res = await apiClient.post('/insurance-products/provider-configs', payload);
    return res.data;
  },

  async updateProviderConfig(id, payload) {
    const res = await apiClient.put(`/insurance-products/provider-configs/${id}`, payload);
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

  async startPurchaseCheckout(payload) {
    const res = await apiClient.post('/insurance-purchases/checkout', payload);
    return res.data;
  },

  async fetchQuote(payload) {
    const res = await apiClient.post('/insurance-purchases/quote', payload);
    return res.data;
  },

  async createProposal(payload) {
    const res = await apiClient.post('/insurance-purchases/proposal', payload);
    return res.data;
  },

  async getPurchaseStatus(id, token) {
    const res = await apiClient.get(`/insurance-purchases/${id}`, { params: { token } });
    return res.data;
  },

  formatListField: linesToList,
};
