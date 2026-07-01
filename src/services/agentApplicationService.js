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

const toSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    acc[snakeKey] = toSnakeCase(obj[key]);
    return acc;
  }, {});
};

export const agentApplicationService = {
  async getProfile() {
    const res = await apiClient.get('/portal/agent/profile');
    return toCamelCase(res.data);
  },

  async provisionCustomer(customerData) {
    const res = await apiClient.post('/portal/agent/provision-customer', customerData);
    return toCamelCase(res.data);
  },

  async createApplication(applicationData) {
    const res = await apiClient.post('/portal/agent/applications', toSnakeCase(applicationData));
    return toCamelCase(res.data);
  },

  async updateApplication(applicationId, applicationData) {
    const res = await apiClient.patch(
      `/portal/agent/applications/${applicationId}`,
      toSnakeCase(applicationData),
    );
    return toCamelCase(res.data);
  },

  async submitApplication(applicationId) {
    const res = await apiClient.post(`/portal/agent/applications/${applicationId}/submit`);
    return toCamelCase(res.data);
  },
};
