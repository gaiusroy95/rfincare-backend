import { apiClient } from '../lib/apiClient';
import {
  buildBankListCacheKey,
  fetchBanksCached,
  invalidateBankCache,
  setCachedBanks,
} from './bankCache';

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
function sanitizeLogoUrlForApi(url) {
  if (url == null || url === '') return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('/uploads/')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return trimmed;
  } catch {
    /* invalid */
  }
  return null;
}

const toSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = toSnakeCase(obj[key]);
    return acc;
  }, {});
};

async function fetchBankList(params, { forceRefresh = false } = {}) {
  const listParams = { ...params };
  if (forceRefresh) {
    listParams._ = Date.now();
  }
  const key = buildBankListCacheKey(params);

  if (forceRefresh) {
    invalidateBankCache();
    const res = await apiClient.get('/banks', {
      params: listParams,
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    });
    const data = toCamelCase(res?.data);
    setCachedBanks(key, data);
    return data;
  }

  return fetchBanksCached(key, async () => {
    const res = await apiClient.get('/banks', {
      params: listParams,
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    });
    return toCamelCase(res?.data);
  });
}

export const bankService = {
  async getAllBanks(options = {}) {
    const { forceRefresh = false } = options;
    return fetchBankList(
      { includeInactive: true, includeProducts: true },
      { forceRefresh },
    );
  },
  async getActiveBanks(options = {}) {
    const params = { includeProducts: options.includeProducts !== false };
    if (options.loanType) params.loanType = options.loanType;
    if (options.includeProducts === false) params.includeProducts = false;
    return fetchBankList(params, { forceRefresh: options.forceRefresh === true });
  },
  async getBankById(bankId) {
    const res = await apiClient.get(`/banks/${bankId}`);
    return toCamelCase(res?.data);
  },
  async createBank(bankData) {
    const payload = toSnakeCase(bankData);
    payload.logo_url = sanitizeLogoUrlForApi(payload.logo_url ?? bankData?.logoUrl);
    if (payload.logo_alt === '') payload.logo_alt = null;
    const res = await apiClient.post('/banks', payload);
    invalidateBankCache();
    return toCamelCase(res?.data);
  },
  async updateBank(bankId, bankData) {
    const payload = toSnakeCase(bankData);
    if (bankData?.logoUrl !== undefined) {
      payload.logo_url = sanitizeLogoUrlForApi(payload.logo_url ?? bankData.logoUrl);
    }
    if (payload.logo_alt === '') payload.logo_alt = null;
    const res = await apiClient.patch(`/banks/${bankId}`, payload);
    invalidateBankCache();
    return toCamelCase(res?.data);
  },
  async uploadBankLogo(bankId, file) {
    const form = new FormData();
    form.append('logo', file);
    const res = await apiClient.post(`/banks/${bankId}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    invalidateBankCache();
    return toCamelCase(res?.data);
  },
  async deleteBank(bankId) {
    await apiClient.delete(`/banks/${bankId}`);
    invalidateBankCache();
  },
  async getBankProducts(bankId) {
    const res = await apiClient.get(`/banks/${bankId}/products`);
    return toCamelCase(res?.data);
  },
  async createBankProduct(bankId, productData) {
    const res = await apiClient.post(`/banks/${bankId}/products`, toSnakeCase(productData));
    invalidateBankCache();
    return toCamelCase(res?.data);
  },
  async updateBankProduct(productId, productData) {
    const res = await apiClient.patch(`/bank-products/${productId}`, toSnakeCase(productData));
    invalidateBankCache();
    return toCamelCase(res?.data);
  },
  async deleteBankProduct(productId) {
    await apiClient.delete(`/bank-products/${productId}`);
    invalidateBankCache();
  },
  async getBanksWithProbability(userProfile) {
    const res = await apiClient.post('/banks/probability', userProfile);
    return toCamelCase(res?.data);
  }
};

async function fetchApprovalMatrixRules(path = '/approval-matrix-rules') {
  try {
    const res = await apiClient.get(path);
    return toCamelCase(res?.data);
  } catch (err) {
    if (path === '/approval-matrix-rules' && err?.response?.status === 404) {
      const fallback = await apiClient.get('/admin/approval-matrix-rules');
      return toCamelCase(fallback?.data);
    }
    throw err;
  }
}

export const approvalMatrixService = {
  async getAllRules() {
    return fetchApprovalMatrixRules('/approval-matrix-rules');
  },
  async getRulesByBank(bankId) {
    const res = await apiClient.get(`/banks/${bankId}/approval-matrix-rules`);
    return toCamelCase(res?.data);
  },
  async createRule(ruleData) {
    const payload = toSnakeCase(ruleData);
    try {
      const res = await apiClient.post('/approval-matrix-rules', payload);
      return toCamelCase(res?.data);
    } catch (err) {
      if (err?.response?.status === 404) {
        const res = await apiClient.post('/admin/approval-matrix-rules', payload);
        return toCamelCase(res?.data);
      }
      throw err;
    }
  },
  async updateRule(ruleId, ruleData) {
    const payload = toSnakeCase(ruleData);
    try {
      const res = await apiClient.patch(`/approval-matrix-rules/${ruleId}`, payload);
      return toCamelCase(res?.data);
    } catch (err) {
      if (err?.response?.status === 404) {
        const res = await apiClient.patch(`/admin/approval-matrix-rules/${ruleId}`, payload);
        return toCamelCase(res?.data);
      }
      throw err;
    }
  },
  async deleteRule(ruleId) {
    try {
      await apiClient.delete(`/approval-matrix-rules/${ruleId}`);
    } catch (err) {
      if (err?.response?.status === 404) {
        await apiClient.delete(`/admin/approval-matrix-rules/${ruleId}`);
        return;
      }
      throw err;
    }
  },
  async calculateProbability(bankId, userProfile) {
    const res = await apiClient.post(`/banks/${bankId}/calculate-approval-probability`, userProfile);
    return res?.data;
  }
};

export const applicationService = {
  async getUserApplications() {
    const res = await apiClient.get('/loan-applications/me');
    return toCamelCase(res?.data);
  },
  async createApplication(applicationData) {
    const res = await apiClient.post('/loan-applications', toSnakeCase(applicationData));
    return toCamelCase(res?.data);
  },
  async updateApplication(applicationId, applicationData) {
    const res = await apiClient.patch(`/loan-applications/${applicationId}`, toSnakeCase(applicationData));
    return toCamelCase(res?.data);
  },
  async submitApplication(applicationId) {
    const res = await apiClient.post(`/loan-applications/${applicationId}/submit`);
    return toCamelCase(res?.data);
  },
  async getAllApplications(filters = {}) {
    const res = await apiClient.get('/loan-applications', { params: filters });
    return toCamelCase(res?.data);
  }
};

export const stateService = {
  async getAllStates() {
    const res = await apiClient.get('/states');
    return toCamelCase(res?.data);
  }
};

export const localizationService = {
  async getSettings() {
    const res = await apiClient.get('/localization/settings');
    return res?.data;
  },
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  },
  formatPhoneNumber(phone) {
    const cleaned = phone?.replace(/\D/g, '');
    if (cleaned?.length === 10) {
      return cleaned?.replace(/(\d{5})(\d{5})/, '$1 $2');
    }
    return phone;
  },
  validatePinCode(pinCode) {
    const cleaned = pinCode?.replace(/\D/g, '');
    return cleaned?.length === 6;
  },
  validatePhoneNumber(phone) {
    const cleaned = phone?.replace(/\D/g, '');
    return cleaned?.length === 10 && /^[6-9]/.test(cleaned);
  }
};

export const auditService = {
  async logAction(actionType, tableName, recordId, oldValues, newValues) {
    try {
      await apiClient.post('/audit-logs', {
        actionType,
        tableName,
        recordId,
        oldValues,
        newValues,
      });
    } catch {
      // Non-blocking: bank/CMS actions should succeed even if audit logging fails
    }
  },
  async getLogs(filters = {}) {
    const res = await apiClient.get('/audit-logs', { params: filters });
    return toCamelCase(res?.data);
  }
};
