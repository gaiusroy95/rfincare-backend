import { apiClient } from '../lib/apiClient';

function linesToList(text) {
  if (!text) return [];
  if (Array.isArray(text)) return text.filter(Boolean).map(String);
  return String(text)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export const creditCardService = {
  async listActive() {
    const res = await apiClient.get('/credit-cards');
    return res.data;
  },

  async listAll() {
    const res = await apiClient.get('/credit-cards', { params: { includeInactive: 'true' } });
    return res.data;
  },

  async getById(id) {
    const res = await apiClient.get(`/credit-cards/${id}`);
    return res.data;
  },

  async create(payload) {
    const res = await apiClient.post('/credit-cards', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await apiClient.put(`/credit-cards/${id}`, payload);
    return res.data;
  },

  async remove(id) {
    const res = await apiClient.delete(`/credit-cards/${id}`);
    return res.data;
  },

  formatListField: linesToList,
};
