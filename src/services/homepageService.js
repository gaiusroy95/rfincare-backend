import { apiClient } from '../lib/apiClient';

export const homepageService = {
  async getNews() {
    const res = await apiClient.get('/public/homepage/news');
    return res.data;
  },
  async getVideos() {
    const res = await apiClient.get('/public/homepage/videos');
    return res.data;
  },
  async getTrustSignals() {
    const res = await apiClient.get('/public/homepage/trust-signals');
    return res.data;
  },
  async getAboutContent() {
    const res = await apiClient.get('/public/about-content');
    return res.data;
  },
  async getSuccessStories() {
    const res = await apiClient.get('/public/success-stories');
    return res.data;
  },
  async submitStory(payload, photoFile = null) {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        form.append(key, value);
      }
    });
    if (photoFile) {
      form.append('photo', photoFile);
    }
    const res = await apiClient.post('/public/success-stories', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  async calculateEligibility(payload) {
    const res = await apiClient.post('/public/eligibility/calculate', payload);
    return res.data;
  },
  async checkCibilScore(payload) {
    const res = await apiClient.post('/public/cibil/check', payload);
    return res.data;
  },
  async requestStatusOtp(payload) {
    const res = await apiClient.post('/public/status-check/request-otp', payload);
    return res.data;
  },
  async verifyStatusCheck(payload) {
    const res = await apiClient.post('/public/status-check/verify', payload);
    return res.data;
  },
  async requestDraftRecoveryOtp(payload) {
    const res = await apiClient.post('/public/draft-recovery/request-otp', payload);
    return res.data;
  },
  async verifyDraftRecovery(payload) {
    const res = await apiClient.post('/public/draft-recovery/verify', payload);
    return res.data;
  },
  async getSiteContact() {
    const res = await apiClient.get('/public/site-contact');
    return res.data;
  },

  async getLegalPage(slug) {
    const res = await apiClient.get(`/public/legal/${slug}`);
    return res.data;
  },
};
