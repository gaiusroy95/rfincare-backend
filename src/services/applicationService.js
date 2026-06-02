import { apiClient } from '../lib/apiClient';

// Helper function to convert snake_case to camelCase
const toCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {});
};

// Helper function to convert camelCase to snake_case
const toSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = toSnakeCase(obj[key]);
    return acc;
  }, {});
};

export const applicationService = {
  // Create or update loan application
  async createApplication(applicationData) {
    try {
      const res = await apiClient.post('/loan-applications', toSnakeCase(applicationData));
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: { message: error.response?.data?.error || 'Failed to create application' } };
    }
  },

  // Update application
  async updateApplication(applicationId, applicationData) {
    try {
      const res = await apiClient.patch(`/loan-applications/${applicationId}`, toSnakeCase(applicationData));
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: { message: error.response?.data?.error || 'Failed to update application' } };
    }
  },

  // Submit application
  async submitApplication(applicationId, selectedBankId) {
    try {
      const res = await apiClient.post(`/loan-applications/${applicationId}/submit`, { selectedBankId });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: { message: error.response?.data?.error || 'Failed to submit application' } };
    }
  },

  // Save consents
  async saveConsents(applicationId, consents) {
    try {
      await apiClient.post(`/loan-applications/${applicationId}/consents`, { consents });
      return { error: null };
    } catch (error) {
      return { error: { message: 'Failed to save consents' } };
    }
  },

  // OTP Management (Stubbed for now)
  async sendOTP(phoneNumber, email, applicationId) {
    console.log('OTP requested for:', phoneNumber, email);
    return { error: null };
  },

  async verifyOTP(applicationId, otpCode) {
    console.log('OTP verification for:', applicationId, otpCode);
    return { success: true, error: null };
  },

  // Get application by ID
  async getApplicationById(applicationId) {
    try {
      const res = await apiClient.get(`/loan-applications/${applicationId}`);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: { message: 'Failed to fetch application' } };
    }
  }
};