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

export const adminProfileService = {
  async getProfile() {
    const res = await apiClient.get('/portal/admin/profile');
    return toCamelCase(res.data);
  },

  async uploadPhoto(file) {
    const fd = new FormData();
    fd.append('photo', file);
    const res = await apiClient.post('/portal/admin/profile/photo', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return toCamelCase(res.data);
  },

  async updateVerificationEmails(emails) {
    const res = await apiClient.put('/portal/admin/profile/verification-emails', { emails });
    return toCamelCase(res.data);
  },

  async requestPasswordResetOtp() {
    const res = await apiClient.post('/portal/admin/profile/password-reset/request-otp');
    return res.data;
  },

  async confirmPasswordReset(otp, newPassword) {
    const res = await apiClient.post('/portal/admin/profile/password-reset/confirm', {
      otp,
      newPassword,
    });
    return res.data;
  },
};
