import { apiClient } from '../lib/apiClient';

export { openLearningResource, resolveLearningOpenUrl } from '../utils/learningResources';

const toCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {});
};

export const agentLearningService = {
  async listForAgent() {
    const res = await apiClient.get('/portal/agent/learning');
    return toCamelCase(res.data);
  },

  async updateProgress(contentId, progress) {
    const res = await apiClient.post(`/portal/agent/learning/${contentId}/progress`, { progress });
    return toCamelCase(res.data);
  },
};

export const adminAgentLearningService = {
  async listAll() {
    const res = await apiClient.get('/admin/agent-learning');
    return toCamelCase(res.data);
  },

  async publish(formData) {
    const res = await apiClient.post('/admin/agent-learning', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return toCamelCase(res.data);
  },

  async update(id, payload) {
    const res = await apiClient.patch(`/admin/agent-learning/${id}`, payload);
    return toCamelCase(res.data);
  },

  async deactivate(id) {
    const res = await apiClient.delete(`/admin/agent-learning/${id}`);
    return res.data;
  },
};
