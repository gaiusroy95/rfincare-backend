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

export const registrationService = {
  // Get all pending registrations (Admin only)
  async getPendingRegistrations() {
    try {
      const res = await apiClient.get('/auth/registrations');
      const rows = res.data.registrations || [];

      const data = rows.filter(reg => reg.registration_status === 'pending').map(reg => ({
        id: reg.id,
        email: reg.email,
        fullName: reg.full_name,
        phone: reg.phone,
        oauthProvider: reg.oauth_provider,
        dateOfBirth: reg.date_of_birth,
        addressLine1: reg.address_line1,
        addressLine2: reg.address_line2,
        city: reg.city,
        state: reg.state,
        pinCode: reg.pin_code,
        employmentType: reg.employment_type,
        employerName: reg.employer_name,
        annualIncome: reg.annual_income,
        bankName: reg.bank_name,
        accountName: reg.account_name,
        registrationStatus: reg.registration_status,
        approvedBy: reg.reviewed_by,
        approvedAt: reg.approved_at,
        rejectionReason: reg.rejection_reason,
        createdAt: reg.created_at
      }));

      return { data, error: null };
    } catch (error) {
      return {
        data: [],
        error: { message: error.response?.data?.error || 'Failed to fetch registrations' },
      };
    }
  },

  // Get registration by ID
  async getRegistrationById(id) {
    try {
      // For now, we reuse the list or we could add a specific GET /auth/registrations/:id
      const res = await apiClient.get('/auth/registrations');
      const data = res.data.registrations.find(r => r.id === id);

      if (!data) throw new Error('Registration not found');

      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        phone: data.phone,
        oauthProvider: data.oauth_provider,
        dateOfBirth: data.date_of_birth,
        gender: data.gender,
        addressLine1: data.address_line1,
        addressLine2: data.address_line2,
        city: data.city,
        state: data.state,
        pinCode: data.pin_code,
        employmentType: data.employment_type,
        employerName: data.employer_name,
        annualIncome: data.annual_income,
        bankName: data.bank_name,
        accountName: data.account_name,
        registrationStatus: data.registration_status,
        approvedBy: data.reviewed_by,
        approvedAt: data.approved_at,
        rejectionReason: data.rejection_reason,
        submittedAt: data.created_at
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch registration');
    }
  },

  // Approve registration
  async approveRegistration(registrationId, password) {
    try {
      const res = await apiClient.post(`/auth/registrations/${registrationId}/approve`, { password });
      return { success: true, message: 'Registration approved', data: res.data };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to approve registration');
    }
  },

  // Reject registration
  async rejectRegistration(registrationId, reason) {
    try {
      const res = await apiClient.post(`/auth/registrations/${registrationId}/reject`, { reason });
      return { success: true, message: 'Registration rejected', data: res.data };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to reject registration');
    }
  },

  // Onboarding status (Stubs for now as we migrate onboarding tables)
  async getOnboardingStatus(userId) {
    return null;
  },

  async updateOnboardingStep(userId, step, verifications = {}) {
    return { success: true, message: 'Onboarding updated' };
  }
};