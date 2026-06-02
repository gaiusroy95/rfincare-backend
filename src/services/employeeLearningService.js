import { apiClient } from '../lib/apiClient';
import { getApiBaseUrl } from '../lib/runtimeConfig';

const toCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {});
};

export function resolveLearningOpenUrl(item) {
  const raw = item?.openUrl || item?.videoUrl || item?.fileUrl;
  if (!raw) return null;
  if (raw.startsWith('http')) return raw;
  const base = getApiBaseUrl().replace(/\/$/, '');
  return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

export const employeeLearningService = {
  async listForEmployee() {
    const res = await apiClient.get('/portal/employee/learning');
    return toCamelCase(res.data);
  },

  async updateProgress(contentId, progress) {
    const res = await apiClient.post(`/portal/employee/learning/${contentId}/progress`, { progress });
    return toCamelCase(res.data);
  },
};

export const adminEmployeeLearningService = {
  async listAll() {
    const res = await apiClient.get('/admin/employee-learning');
    return toCamelCase(res.data);
  },

  async publish(formData) {
    const res = await apiClient.post('/admin/employee-learning', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return toCamelCase(res.data);
  },

  async update(id, payload) {
    const res = await apiClient.patch(`/admin/employee-learning/${id}`, payload);
    return toCamelCase(res.data);
  },

  async deactivate(id) {
    const res = await apiClient.delete(`/admin/employee-learning/${id}`);
    return res.data;
  },
};
