import { apiClient } from '../lib/apiClient';
import { getApiBaseUrl } from '../lib/runtimeConfig';

export const OAUTH_RETURN_PATH_KEY = 'rfincare_oauth_return_path';

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

export const authService = {
  // Email/Password Authentication
  async signIn(email, password) {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      
      // Map API response to match what the old frontend components expect
      return { 
        data: { 
          user: res.data.user, 
          session: { access_token: res.data.accessToken },
          profile: toCamelCase({
            role: res.data.user.role,
            account_status: 'active',
            is_active: 1
          })
        }, 
        error: null 
      };
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: error.response?.data?.error || error.message || 'Login failed' 
        } 
      };
    }
  },

  async signOut() {
    try {
      await apiClient.post('/auth/logout');
      return { error: null };
    } catch (error) {
      return { error: { message: 'Sign out failed' } };
    }
  },

  // Customer Registration
  async signUpCustomer(data) {
    try {
      const { email, password, fullName, phone } = data;
      
      if (password) {
        const res = await apiClient.post('/auth/signup', {
          email,
          password,
          fullName,
          phone,
          role: 'customer'
        });
        return { 
          data: { 
            user: res.data.user, 
            session: { access_token: res.data.accessToken } 
          }, 
          error: null 
        };
      }
      
      // Portal registration (no password)
      const res = await apiClient.post('/auth/register-portal', toSnakeCase(data));
      return { data: res.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: error.response?.data?.error || error.message || 'Sign up failed' 
        } 
      };
    }
  },

  async approveRegistration(registrationId, username, password) {
    try {
      const res = await apiClient.post(`/auth/registrations/${registrationId}/approve`, { password });
      return { success: true, message: 'Registration approved', data: res.data };
    } catch (error) {
      return { 
        error: { 
          message: error.response?.data?.error || error.message || 'Failed to approve registration' 
        } 
      };
    }
  },

  async rejectRegistration(registrationId, reason) {
    try {
      const res = await apiClient.post(`/auth/registrations/${registrationId}/reject`, { reason });
      return { success: true, message: 'Registration rejected', data: res.data };
    } catch (error) {
      return { 
        error: { 
          message: error.response?.data?.error || error.message || 'Failed to reject registration' 
        } 
      };
    }
  },

  // Role check
  async checkUserRole(requiredRoles = []) {
    try {
      const res = await apiClient.get('/auth/me');
      const { user, profile } = res.data;
      
      if (!profile || !profile.is_active) {
        return { hasAccess: false, error: { message: 'Account is inactive' } };
      }

      const hasAccess = requiredRoles.length === 0 || requiredRoles.includes(profile.role);
      return { hasAccess, role: profile.role, error: null };
    } catch (error) {
      return { hasAccess: false, error: { message: 'Role check failed' } };
    }
  },

  // Profile management
  async getCurrentUserProfile() {
    try {
      const res = await apiClient.get('/auth/me');
      return { data: toCamelCase(res.data.profile), error: null };
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: error.response?.data?.error || error.message || 'Failed to fetch profile' 
        } 
      };
    }
  },

  // Password management
  async changePassword(currentPassword, newPassword) {
    try {
      await apiClient.post('/auth/change-password', { currentPassword, newPassword });
      return { error: null };
    } catch (error) {
      return { 
        error: { 
          message: error.response?.data?.error || 'Failed to change password' 
        } 
      };
    }
  },

  // Session management
  async getUserSessions() {
    try {
      const res = await apiClient.get('/auth/sessions');
      return { data: toCamelCase(res.data.sessions), error: null };
    } catch (error) {
      return { data: null, error: { message: 'Failed to fetch sessions' } };
    }
  },

  async terminateSession(sessionId) {
    try {
      await apiClient.delete(`/auth/sessions/${sessionId}`);
      return { error: null };
    } catch (error) {
      return { error: { message: 'Failed to terminate session' } };
    }
  },

  // Additional stubs for compatibility
  async getPasswordHistory() {
    return { data: [], error: null }; // Stubbed for now
  },

  /**
   * Redirect to backend OAuth (Google / Microsoft / Apple).
   * @param {string} provider
   * @param {string} [returnPath] SPA path after success, e.g. /customer-dashboard
   */
  signInWithOAuth(provider, returnPath = '/customer-dashboard') {
    const map = { google: 'google', microsoft: 'microsoft', outlook: 'microsoft', apple: 'apple' };
    const p = map[provider] || provider;
    const apiBase = getApiBaseUrl().replace(/\/$/, '');
    if (!apiBase) {
      return {
        data: null,
        error: { message: 'API URL is not configured (VITE_API_BASE_URL).' },
      };
    }
    try {
      sessionStorage.setItem(OAUTH_RETURN_PATH_KEY, returnPath);
    } catch {
      /* ignore */
    }
    const returnOrigin =
      typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
    const qs = returnOrigin ? `?return_origin=${returnOrigin}` : '';
    window.location.href = `${apiBase}/auth/oauth/${p}${qs}`;
    return { data: { redirecting: true }, error: null };
  },
};