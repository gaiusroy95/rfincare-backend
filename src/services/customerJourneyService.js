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

const DASHBOARD_NEXT_STEPS = {
  draft: 'Complete and submit your application',
  submitted: 'We will review your application shortly',
  under_review: 'Our team is reviewing your application',
  documents_pending: 'Upload any requested documents',
  documents_required: 'Upload requested documents to continue',
  approved: 'Your loan has been approved — check your email for next steps',
  rejected: 'View details for more information',
  processing: 'Your application is being processed',
};

function mapApplicationForDashboard(app) {
  if (!app) return app;
  const data = app.data && typeof app.data === 'object' ? app.data : {};
  const status = app.status;
  const dateSrc = app.submittedAt || app.submitted_at || app.createdAt || app.created_at;
  let appliedDate = '—';
  if (dateSrc) {
    try {
      appliedDate = new Date(dateSrc).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      appliedDate = '—';
    }
  }
  const rawAmount =
    app.loanAmount ??
    app.loan_amount ??
    data.requestedLoanAmount ??
    data.requested_loan_amount ??
    data.loan_amount ??
    data.loanAmount ??
    0;
  const interestRate = data.interestRate ?? data.interest_rate ?? null;
  return {
    id: app.id,
    applicationNumber: app.applicationNumber || app.application_number,
    status,
    bankName: app.bank?.name || app.bankName || 'Rfincare Partner',
    loanType:
      app.loanTypeLabel ||
      app.loan_type_label ||
      app.loanType ||
      app.loan_type ||
      data.loan_purpose ||
      data.loanPurpose ||
      'Loan Application',
    loanAmount: Number(rawAmount) || 0,
    interestRate,
    appliedDate,
    nextStep: DASHBOARD_NEXT_STEPS[status] || 'Track your application status here',
  };
}

export const customerJourneyService = {
  // Eligibility Assessment
  async createEligibilityAssessment(assessmentData) {
    try {
      const res = await apiClient.post('/eligibility-assessments', toSnakeCase(assessmentData));
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getEligibilityAssessments(customerId) {
    try {
      const res = await apiClient.get(`/eligibility-assessments`, { params: { customerId } });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Document Management
  async uploadDocument(file, documentData) {
    try {
      const form = new FormData();
      form.append('file', file);
      if (documentData?.applicationId) form.append('applicationId', documentData.applicationId);
      if (documentData?.documentType) form.append('documentType', documentData.documentType);
      if (documentData?.customerId) form.append('customerId', documentData.customerId);
      const res = await apiClient.post('/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getDocuments(customerId, applicationId = null) {
    try {
      const res = await apiClient.get('/documents', { params: { customerId, applicationId } });
      const list = toCamelCase(res.data);
      return { data: Array.isArray(list) ? list : [], error: null };
    } catch {
      return { data: [], error: null };
    }
  },

  async getApplicationById(applicationId) {
    try {
      const res = await apiClient.get(`/loan-applications/${applicationId}`);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: error?.response?.data?.error || 'Failed to fetch application' },
      };
    }
  },

  async getDocumentRequirements({ applicationId, bankId, productType, loanType } = {}) {
    try {
      const res = await apiClient.get('/document-requirements/resolve', {
        params: {
          applicationId: applicationId || undefined,
          bankId: bankId || undefined,
          productType: productType || undefined,
          loanType: loanType || undefined,
        },
      });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: { requirements: [] }, error };
    }
  },

  async deleteDocument(documentId) {
    try {
      await apiClient.delete(`/documents/${documentId}`);
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Application Management
  async getApplications() {
    try {
      const res = await apiClient.get('/loan-applications/me');
      const list = toCamelCase(res.data) || [];
      const mapped = Array.isArray(list)
        ? list.map(mapApplicationForDashboard)
        : [];
      return { data: mapped, error: null };
    } catch {
      return { data: [], error: null };
    }
  },

  async getApplicationTimeline(applicationId) {
    try {
      const res = await apiClient.get(`/loan-applications/${applicationId}/timeline`);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateApplicationStatus(applicationId, status) {
    try {
      const res = await apiClient.patch(`/loan-applications/${applicationId}`, { status });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Notifications
  async getNotifications() {
    try {
      const res = await apiClient.get('/notifications/me');
      const list = toCamelCase(res.data);
      return { data: Array.isArray(list) ? list : [], error: null };
    } catch {
      return { data: [], error: null };
    }
  },

  async markNotificationAsRead(notificationId) {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  async markAllNotificationsAsRead() {
    try {
      await apiClient.patch('/notifications/me/read-all');
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      const res = await apiClient.patch('/profiles/me', toSnakeCase(profileData));
      return { data: toCamelCase(res.data.profile), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Compatibility methods
  async getMyDocuments(applicationId = null) {
    return this.getDocuments(null, applicationId);
  },

  async downloadDocument(documentId) {
    try {
      const res = await apiClient.get(`/documents/${documentId}/download`, { responseType: 'blob' });
      const disposition = res.headers?.['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"]+)"?/i);
      return {
        data: {
          blob: res.data,
          fileName: match?.[1] || 'document',
          mimeType: res.data?.type || '',
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: { message: 'Download failed' } };
    }
  },

  // Real-time subscriptions (polling fallback)
  subscribeToApplicationUpdates(applicationId, callback) {
    const interval = setInterval(async () => {
      try {
        const res = await apiClient.get(`/loan-applications/${applicationId}`);
        callback({ eventType: 'UPDATE', new: toCamelCase(res.data) });
      } catch {
        /* ignore poll errors */
      }
    }, 30000);
    return { __polling: interval };
  },

  subscribeToDocumentUpdates(customerId, callback) {
    const interval = setInterval(async () => {
      const { data } = await this.getDocuments(customerId);
      if (data) callback({ eventType: 'REFRESH', new: data });
    }, 30000);
    return { __polling: interval };
  },

  subscribeToNotifications(_customerId, callback) {
    const interval = setInterval(async () => {
      const { data } = await this.getNotifications();
      if (data) callback({ eventType: 'REFRESH', new: data });
    }, 30000);
    return { __polling: interval };
  },

  unsubscribe(channel) {
    if (channel?.__polling) clearInterval(channel.__polling);
  },
};