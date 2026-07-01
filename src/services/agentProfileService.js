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

export function resolveAvatarUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = getApiBaseUrl().replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

export const agentProfileService = {
  async getProfile() {
    const res = await apiClient.get('/portal/agent/profile');
    return toCamelCase(res.data);
  },

  async uploadPhoto(file) {
    const fd = new FormData();
    fd.append('photo', file);
    const res = await apiClient.post('/portal/agent/profile/photo', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return toCamelCase(res.data);
  },

  async requestBankOtp(payload) {
    const res = await apiClient.post('/portal/agent/profile/bank/request-otp', payload);
    return res.data;
  },

  async confirmBank(payload) {
    const res = await apiClient.post('/portal/agent/profile/bank/confirm', payload);
    return res.data;
  },

  async requestEmailOtp(newEmail) {
    const res = await apiClient.post('/portal/agent/profile/email/request-otp', { newEmail });
    return res.data;
  },

  async confirmEmail(newEmail, otp) {
    const res = await apiClient.post('/portal/agent/profile/email/confirm', { newEmail, otp });
    return res.data;
  },

  async requestPasswordResetOtp() {
    const res = await apiClient.post('/portal/agent/profile/password-reset/request-otp');
    return res.data;
  },

  async confirmPasswordReset(otp, newPassword, currentPassword) {
    const res = await apiClient.post('/portal/agent/profile/password-reset/confirm', {
      otp,
      newPassword,
      currentPassword,
    });
    return res.data;
  },

  async requestDeactivateOtp() {
    const res = await apiClient.post('/portal/agent/profile/deactivate/request-otp');
    return res.data;
  },

  async confirmDeactivate(otp, confirmText = 'DEACTIVATE') {
    const res = await apiClient.post('/portal/agent/profile/deactivate/confirm', {
      otp,
      confirmText,
    });
    return res.data;
  },
};
