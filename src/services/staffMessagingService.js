import { apiClient } from '../lib/apiClient';

const toCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {});
};

export const staffMessagingService = {
  async getContext(applicationId) {
    const res = await apiClient.get('/portal/communication/context', {
      params: applicationId ? { applicationId } : undefined,
    });
    return toCamelCase(res.data);
  },

  async getMessages({ peerId, applicationId }) {
    const res = await apiClient.get('/portal/communication/messages', {
      params: { peerId, applicationId: applicationId || undefined },
    });
    return toCamelCase(res.data);
  },

  async sendMessage({ peerId, applicationId, subject, body, channel, documentIds }) {
    const res = await apiClient.post('/portal/communication/messages', {
      peerId,
      applicationId: applicationId || undefined,
      subject,
      body,
      channel: channel || 'internal',
      documentIds: documentIds || [],
    });
    return toCamelCase(res.data);
  },

  async getApplicationDocuments(applicationId) {
    const res = await apiClient.get('/portal/communication/documents', {
      params: { applicationId },
    });
    return toCamelCase(res.data);
  },
};

export const hierarchyService = {
  async listMappings() {
    const res = await apiClient.get('/admin/hierarchy');
    return toCamelCase(res.data);
  },

  async createMapping(payload) {
    const res = await apiClient.post('/admin/hierarchy', payload);
    return toCamelCase(res.data);
  },

  async updateMapping(id, payload) {
    const res = await apiClient.patch(`/admin/hierarchy/${id}`, payload);
    return toCamelCase(res.data);
  },

  async deleteMapping(id) {
    const res = await apiClient.delete(`/admin/hierarchy/${id}`);
    return res.data;
  },
};
