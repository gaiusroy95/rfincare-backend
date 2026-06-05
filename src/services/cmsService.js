import { apiClient } from '../lib/apiClient';

export const cmsService = {
  news: {
    list: () => apiClient.get('/cms/news').then((r) => r.data),
    create: (body) => apiClient.post('/cms/news', body).then((r) => r.data),
    update: (id, body) => apiClient.put(`/cms/news/${id}`, body).then((r) => r.data),
    remove: (id) => apiClient.delete(`/cms/news/${id}`).then((r) => r.data),
  },
  videos: {
    list: () => apiClient.get('/cms/videos').then((r) => r.data),
    create: (body) => apiClient.post('/cms/videos', body).then((r) => r.data),
    update: (id, body) => apiClient.put(`/cms/videos/${id}`, body).then((r) => r.data),
    remove: (id) => apiClient.delete(`/cms/videos/${id}`).then((r) => r.data),
  },
  legal: {
    list: () => apiClient.get('/cms/legal').then((r) => r.data),
    update: (slug, body) => apiClient.put(`/cms/legal/${slug}`, body).then((r) => r.data),
  },
  stories: {
    list: (status = 'pending') => apiClient.get('/cms/success-stories', { params: { status } }).then((r) => r.data),
    moderate: (id, body) => apiClient.post(`/cms/success-stories/${id}/moderate`, body).then((r) => r.data),
  },
  siteContact: {
    get: () => apiClient.get('/cms/site-contact').then((r) => r.data),
    update: (body) => apiClient.put('/cms/site-contact', body).then((r) => r.data),
  },
  trustSignals: {
    get: () => apiClient.get('/cms/homepage/trust-signals').then((r) => r.data),
    update: (body) => apiClient.put('/cms/homepage/trust-signals', body).then((r) => r.data),
  },
  aboutContent: {
    get: () => apiClient.get('/cms/about-content').then((r) => r.data),
    update: (body) => apiClient.put('/cms/about-content', body).then((r) => r.data),
  },
  otpSettings: {
    get: () => apiClient.get('/cms/otp-settings').then((r) => r.data),
    update: (body) => apiClient.put('/cms/otp-settings', body).then((r) => r.data),
    getStatus: () => apiClient.get('/cms/otp-settings/status').then((r) => r.data),
    testSms: (phone) =>
      apiClient.post('/cms/otp-settings/test', { phone, channel: 'sms' }).then((r) => r.data),
    testWhatsapp: (phone) =>
      apiClient.post('/cms/otp-settings/test', { phone, channel: 'whatsapp' }).then((r) => r.data),
  },
  oauthSettings: {
    get: () => apiClient.get('/cms/oauth-settings').then((r) => r.data),
    update: (body) => apiClient.put('/cms/oauth-settings', body).then((r) => r.data),
  },
};
