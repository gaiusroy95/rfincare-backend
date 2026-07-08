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

export const employeeService = {
  // ============================================
  // AGENT ONBOARDING VERIFICATION (STUBS)
  // ============================================
  async getPendingAgentOnboarding() {
    try {
      const res = await apiClient.get('/portal/employee/milestone4/agent-onboarding/pending');
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: [], error: { message: 'Failed to load agent onboarding queue' } };
    }
  },
  async approveAgentOnboarding(agentUserId, { password = '', notes = '' } = {}) {
    try {
      await apiClient.post(`/portal/employee/milestone4/agent-onboarding/${agentUserId}/qc`, {
        decision: 'approved',
        notes: notes || undefined,
        temporaryPassword: password || undefined,
      });
      return { error: null };
    } catch (error) {
      return { error: { message: error.response?.data?.error || 'QC approval failed' } };
    }
  },
  async rejectAgentOnboarding(agentUserId, notes) {
    try {
      await apiClient.post(`/portal/employee/milestone4/agent-onboarding/${agentUserId}/qc`, {
        decision: 'rejected',
        notes,
      });
      return { error: null };
    } catch (error) {
      return { error: { message: error.response?.data?.error || 'QC rejection failed' } };
    }
  },
  async getCustomerProfile(customerId) {
    try {
      const res = await apiClient.get(`/portal/employee/milestone4/customers/${customerId}`);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: { message: 'Failed to load customer profile' } };
    }
  },

  // ============================================
  // APPLICATION VERIFICATION
  // ============================================
  async getAssignedApplications() {
    try {
      const res = await apiClient.get('/loan-applications/me');
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: { message: 'Failed to fetch assigned applications' } };
    }
  },

  async reviewApplication(applicationId, reviewData) {
    try {
      const res = await apiClient.patch(`/loan-applications/${applicationId}`, toSnakeCase(reviewData));
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: { message: 'Review failed' } };
    }
  },

  async updateApplicationStatus(applicationId, statusData) {
    try {
      const payload = {
        status: statusData.status,
        status_notes: statusData.notes || statusData.statusNotes || null,
        document_stage_status: statusData.documentStageStatus || null,
        bank_approval_status: statusData.bankApprovalStatus || null,
      };
      const res = await apiClient.patch(`/loan-applications/${applicationId}`, payload);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: { message: error.response?.data?.error || 'Status update failed' } };
    }
  },

  // ============================================
  // DOCUMENT VERIFICATION
  // ============================================
  async getPendingDocuments() {
    try {
      const res = await apiClient.get('/documents', { params: { status: 'pending' } });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: { message: 'Failed to fetch pending documents' } };
    }
  },

  async getApplicationDocuments(applicationId) {
    try {
      const res = await apiClient.get('/documents', { params: { applicationId } });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: [], error: { message: 'Failed to fetch application documents' } };
    }
  },

  async getApplication(applicationId) {
    try {
      const res = await apiClient.get(`/loan-applications/${applicationId}`);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: { message: 'Failed to load application' } };
    }
  },

  async verifyDocument(documentId, verificationData) {
    try {
      const res = await apiClient.patch(`/documents/${documentId}/verification`, {
        status: verificationData.status,
        verification_notes: verificationData.verificationNotes || verificationData.notes,
      });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: { message: error.response?.data?.error || 'Verification failed' } };
    }
  },

  async requestDocumentReupload(documentId, reason) {
    return employeeService.verifyDocument(documentId, {
      status: 'rejected',
      verificationNotes: reason,
    });
  },

  async downloadApplicationPdf(applicationId) {
    try {
      const res = await apiClient.get(`/loan-applications/${applicationId}/summary-pdf`, {
        responseType: 'blob',
      });
      return { data: res.data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.response?.data?.error || 'Download failed' } };
    }
  },

  // ============================================
  // EMPLOYEE DASHBOARD DATA
  // ============================================
  async getEmployeeDashboardStats() {
    try {
      const res = await apiClient.get('/portal/employee/dashboard');
      return { data: res.data?.stats || res.data, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Failed to fetch stats' } };
    }
  },

  async getEmployeeDashboard() {
    try {
      const res = await apiClient.get('/portal/employee/dashboard');
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: { message: 'Failed to fetch dashboard' } };
    }
  },

  async getEmployeeActivityLog() {
    try {
      const res = await apiClient.get('/portal/employee/dashboard');
      return { data: res.data?.activities || [], error: null };
    } catch (error) {
      return { data: [], error: { message: 'Failed to fetch activity' } };
    }
  },

  async logEmployeeActivity(activityData) {
    console.log('Employee activity log:', activityData);
  },
};
