import { apiClient } from '../lib/apiClient';

export const leadService = {
  async createLead(payload) {
    const res = await apiClient.post('/leads', payload);
    return res.data;
  },

  /** Create lead + send mobile/email OTP in one API call (eligibility gate). */
  async startVerification(payload) {
    const res = await apiClient.post('/leads/start-verification', payload);
    return res.data;
  },

  async getOtpSettings() {
    const res = await apiClient.get('/leads/otp-settings');
    return res.data;
  },

  async requestOtp({ phone, email, leadId }) {
    const res = await apiClient.post('/leads/request-otp', { phone, email, leadId });
    return res.data;
  },

  async verifyOtp({ phone, email, mobileOtp, emailOtp, leadId }) {
    const res = await apiClient.post('/leads/verify-otp', {
      phone,
      email,
      mobileOtp,
      emailOtp,
      leadId,
    });
    return res.data;
  },

  async updateLead(leadId, payload) {
    const res = await apiClient.patch(`/leads/${leadId}`, payload);
    return res.data;
  },

  async saveDraft(payload) {
    const res = await apiClient.post('/leads/drafts', payload);
    return res.data;
  },

  async getDraft(sessionKey) {
    const res = await apiClient.get(`/leads/drafts/${encodeURIComponent(sessionKey)}`);
    return res.data;
  },

  async listLeads() {
    const res = await apiClient.get('/leads');
    return res.data;
  },

  async assignLead(leadId, assignedTo) {
    const res = await apiClient.patch(`/leads/${leadId}/assign`, { assignedTo });
    return res.data;
  },

  async createResumeLink(payload) {
    const res = await apiClient.post('/leads/drafts/resume-link', payload);
    return res.data;
  },

  async createLeadResumeLink(leadId, payload) {
    const res = await apiClient.post(`/leads/${leadId}/resume-link`, payload);
    return res.data;
  },

  async resolveResumeToken(token) {
    const res = await apiClient.get(`/public/resume-application/${encodeURIComponent(token)}`);
    return res.data;
  },
};

export const ELIGIBILITY_SESSION_KEY = 'rfincare_eligibility_results';

export function saveEligibilityResults(result, formData) {
  const payload = {
    ...result,
    formData,
    savedAt: Date.now(),
  };
  sessionStorage.setItem(ELIGIBILITY_SESSION_KEY, JSON.stringify(payload));
}

export function loadEligibilityResults() {
  try {
    const raw = sessionStorage.getItem(ELIGIBILITY_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getBankProbabilityMap(eligibilityPayload) {
  const banks = eligibilityPayload?.banks || [];
  const map = new Map();
  for (const b of banks) {
    if (b.bankId) map.set(b.bankId, b.bestProbability ?? b.probability);
  }
  return map;
}
