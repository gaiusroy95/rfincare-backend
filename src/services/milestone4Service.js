import { apiClient } from '../lib/apiClient';
import { getApiBaseUrl } from '../lib/runtimeConfig';

export const milestone4Service = {
  async getCibilVendors() {
    const res = await apiClient.get('/admin/milestone4/cibil-vendors');
    return res.data.vendors;
  },

  async updateCibilVendor(vendorKey, payload) {
    const res = await apiClient.put(`/admin/milestone4/cibil-vendors/${vendorKey}`, payload);
    return res.data.vendors;
  },

  async sandboxCibilPull(applicationId) {
    const res = await apiClient.post(`/admin/milestone4/cibil-sandbox/${applicationId}`);
    return res.data;
  },

  async getApplicationCibil(applicationId) {
    const res = await apiClient.get(`/admin/milestone4/applications/${applicationId}/cibil`);
    return res.data.check;
  },

  cibilReportDownloadUrl(applicationId) {
    const base = getApiBaseUrl().replace(/\/$/, '');
    return `${base}/admin/milestone4/applications/${applicationId}/cibil/report`;
  },

  async getFileNotificationSettings() {
    const res = await apiClient.get('/admin/milestone4/file-notification-settings');
    return res.data;
  },

  async saveFileNotificationSettings(settings) {
    const res = await apiClient.put('/admin/milestone4/file-notification-settings', settings);
    return res.data;
  },

  applicationSummaryPdfUrl(applicationId) {
    const base = getApiBaseUrl().replace(/\/$/, '');
    return `${base}/loan-applications/${applicationId}/summary-pdf`;
  },

  commissionReportDownloadUrl(params, format = 'csv') {
    const base = getApiBaseUrl().replace(/\/$/, '');
    const q = new URLSearchParams({ ...params, format });
    return `${base}/portal/agent/reports/commission-report?${q.toString()}`;
  },
};
