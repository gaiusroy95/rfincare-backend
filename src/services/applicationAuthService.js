import { apiClient } from '../lib/apiClient';

export const applicationAuthService = {
  async requestOtp({ phone, email }) {
    const res = await apiClient.post('/auth/application/request-otp', { phone, email });
    return res.data;
  },

  async verifyOtp({ phone, otp, email, fullName }) {
    const res = await apiClient.post('/auth/application/verify-otp', {
      phone,
      otp,
      email,
      fullName,
    });
    return res.data;
  },
};
