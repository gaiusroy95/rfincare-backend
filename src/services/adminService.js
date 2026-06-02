import { apiClient } from '../lib/apiClient';

const toCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {});
};

function apiError(error, fallback) {
  return { message: error?.response?.data?.error || error?.message || fallback };
}

export const adminService = {
  async getAllApplications(filters = {}) {
    try {
      const res = await apiClient.get('/loan-applications', { params: filters });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to fetch applications') };
    }
  },

  async getApplicationById(applicationId) {
    try {
      const res = await apiClient.get(`/loan-applications/${applicationId}`);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to fetch application') };
    }
  },

  async getApplicationDocuments(applicationId) {
    try {
      const res = await apiClient.get('/documents', { params: { applicationId } });
      const list = toCamelCase(res.data);
      return { data: Array.isArray(list) ? list : [], error: null };
    } catch (error) {
      return { data: [], error: apiError(error, 'Failed to fetch documents') };
    }
  },

  async approveApplication(applicationId, reviewNotes = '') {
    try {
      const res = await apiClient.patch(`/loan-applications/${applicationId}`, {
        status: 'approved',
        review_notes: reviewNotes,
      });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Approval failed') };
    }
  },

  async rejectApplication(applicationId, rejectionReason) {
    try {
      const res = await apiClient.patch(`/loan-applications/${applicationId}`, {
        status: 'rejected',
        rejection_reason: rejectionReason,
      });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Rejection failed') };
    }
  },

  async updateApplicationStage(applicationId, payload) {
    try {
      const res = await apiClient.patch(`/loan-applications/${applicationId}`, payload);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to update stage tracking') };
    }
  },

  async requestDeleteApplicationsOtp() {
    const res = await apiClient.post('/loan-applications/bulk-delete/request-otp');
    return res.data;
  },

  async confirmDeleteApplications(applicationIds, otp) {
    const res = await apiClient.post('/loan-applications/bulk-delete/confirm', {
      applicationIds,
      otp,
    });
    return res.data;
  },

  async getDashboardStats() {
    try {
      const res = await apiClient.get('/admin/stats');
      const stats = toCamelCase(res.data);
      return {
        data: {
          totalApplications: stats?.totalApplications ?? 0,
          pendingReviews: stats?.pendingReviews ?? 0,
          activeAgents: stats?.activeAgents ?? 0,
          approvalRate: stats?.approvalRate ?? '0%',
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to fetch dashboard stats') };
    }
  },

  async getAllAgents() {
    try {
      const res = await apiClient.get('/admin/agents');
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: [], error: apiError(error, 'Failed to fetch agents') };
    }
  },

  async getAllEmployees() {
    try {
      const res = await apiClient.get('/admin/employees');
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: [], error: apiError(error, 'Failed to fetch employees') };
    }
  },

  async getAgentDetail(agentId) {
    try {
      const res = await apiClient.get(`/admin/agents/${agentId}`);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to load agent details') };
    }
  },

  async getEmployeeDetail(employeeId) {
    try {
      const res = await apiClient.get(`/admin/employees/${employeeId}`);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to load employee details') };
    }
  },

  async updateAgent(agentId, payload) {
    try {
      const res = await apiClient.patch(`/admin/agents/${agentId}`, payload);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to update agent') };
    }
  },

  async updateEmployee(employeeId, payload) {
    try {
      const res = await apiClient.patch(`/admin/employees/${employeeId}`, payload);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to update employee') };
    }
  },

  async resetAgentPassword(agentId, password, notifyEmail = true) {
    try {
      const res = await apiClient.post(`/admin/agents/${agentId}/reset-password`, {
        password,
        notifyEmail,
      });
      return { data: res.data, error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to reset agent password') };
    }
  },

  async resetEmployeePassword(employeeId, password, notifyEmail = true) {
    try {
      const res = await apiClient.post(`/admin/employees/${employeeId}/reset-password`, {
        password,
        notifyEmail,
      });
      return { data: res.data, error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to reset employee password') };
    }
  },

  /** Employees + agents for lead assignment (names and codes). */
  async getStaffAssignees() {
    try {
      const res = await apiClient.get('/admin/assignees');
      const data = toCamelCase(res.data);
      return {
        data: {
          employees: data?.employees || [],
          agents: data?.agents || [],
          all: data?.all || [...(data?.employees || []), ...(data?.agents || [])],
        },
        error: null,
      };
    } catch (error) {
      return {
        data: { employees: [], agents: [], all: [] },
        error: apiError(error, 'Failed to load staff for assignment'),
      };
    }
  },

  async approveAgent(agentId) {
    try {
      const res = await apiClient.patch(`/admin/agents/${agentId}`, {
        account_status: 'active',
        onboarding_status: 'active',
      });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to approve agent') };
    }
  },

  async rejectAgent(agentId, reason) {
    try {
      const res = await apiClient.patch(`/admin/agents/${agentId}`, {
        account_status: 'inactive',
        onboarding_status: 'suspended',
        rejection_reason: reason,
      });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to reject agent') };
    }
  },

  async getAgentCommission(agentId) {
    try {
      const res = await apiClient.get(`/admin/agents/${agentId}/commission`);
      const rows = Array.isArray(res.data) ? res.data : [];
      return { data: rows[0] ? toCamelCase(rows[0]) : null, error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to load commission') };
    }
  },

  async updateAgentCommission(agentId, config) {
    try {
      await apiClient.put(`/admin/agents/${agentId}/commission`, {
        loan_type: config.loanType,
        commission_type: config.commissionType,
        commission_value: config.commissionValue,
        min_loan_amount: config.minLoanAmount || null,
        max_loan_amount: config.maxLoanAmount || null,
        effective_from: config.effectiveFrom || null,
        effective_to: config.effectiveTo || null,
      });
      return { error: null };
    } catch (error) {
      return { error: apiError(error, 'Failed to save commission') };
    }
  },

  async getCommissionCirculars() {
    try {
      const res = await apiClient.get('/admin/commission/circulars');
      return { data: toCamelCase(res.data || []), error: null };
    } catch (error) {
      return { data: [], error: apiError(error, 'Failed to load commission circulars') };
    }
  },

  async uploadCommissionCircular({ title, description, file }) {
    try {
      const form = new FormData();
      if (title) form.append('title', title);
      if (description) form.append('description', description);
      form.append('file', file);
      const res = await apiClient.post('/admin/commission/circulars', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to upload circular PDF') };
    }
  },

  async getEmployeeAccessControls(employeeId) {
    try {
      const res = await apiClient.get(`/admin/employees/${employeeId}/access-controls`);
      const rows = Array.isArray(res.data) ? res.data : [];
      return { data: rows, error: null };
    } catch (error) {
      return { data: [], error: apiError(error, 'Failed to load access controls') };
    }
  },

  async updateEmployeeAccessControls(employeeId, accessControls) {
    try {
      await apiClient.put(`/admin/employees/${employeeId}/access-controls`, {
        module_name: accessControls.moduleName,
        permissions: accessControls.permissions,
        is_active: accessControls.isActive,
        expires_at: accessControls.expiresAt || null,
      });
      return { error: null };
    } catch (error) {
      return { error: apiError(error, 'Failed to update access controls') };
    }
  },

  async bulkUpdateApplicationStatus(applicationIds, status, notes = '') {
    try {
      const payload = {
        applicationIds,
        status,
        review_notes: status === 'approved' ? notes : undefined,
        rejection_reason: status === 'rejected' ? notes : undefined,
      };
      const res = await apiClient.post('/loan-applications/bulk-status', payload);
      return { data: res.data, error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Bulk update failed') };
    }
  },

  async createAgentOnboarding(formData) {
    try {
      const res = await apiClient.post('/admin/agents', formData);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to create agent') };
    }
  },

  async getAgentOnboardingList() {
    return { data: [], error: null };
  },

  async createEmployeeOnboarding(formData) {
    try {
      const res = await apiClient.post('/admin/employees', formData);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to create employee') };
    }
  },

  async getEmployeeOnboardingList() {
    return { data: [], error: null };
  },

  async getAllDocuments(filters = {}) {
    try {
      const res = await apiClient.get('/documents', { params: filters });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to fetch documents') };
    }
  },

  async getCustomers(search = '') {
    try {
      const res = await apiClient.get('/admin/customers', {
        params: search ? { search } : {},
      });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: [], error: apiError(error, 'Failed to load customers') };
    }
  },

  async updateCustomer(customerId, payload) {
    try {
      const res = await apiClient.patch(`/admin/customers/${customerId}`, payload);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to update customer') };
    }
  },

  async approveEmployee(employeeId) {
    try {
      const res = await apiClient.patch(`/admin/employees/${employeeId}`, {
        account_status: 'active',
        onboarding_status: 'active',
      });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to activate employee') };
    }
  },

  async getAuditLogs(limit = 100) {
    try {
      const res = await apiClient.get('/audit-logs', { params: { limit } });
      const rows = Array.isArray(res.data) ? res.data : [];
      return {
        data: rows.map((row) => ({
          id: row.id,
          type: String(row.action_type || 'update').toLowerCase(),
          actionType: `${row.action_type} · ${row.table_name}`,
          userName: row.user_id ? `User ${String(row.user_id).slice(0, 8)}` : 'System',
          timestamp: row.created_at
            ? new Date(row.created_at).toLocaleString()
            : '',
          details: row.record_id
            ? `Record ${row.record_id}`
            : row.table_name,
        })),
        error: null,
      };
    } catch (error) {
      return { data: [], error: apiError(error, 'Failed to load audit logs') };
    }
  },

  async getSystemConfigurations() {
    return { data: [], error: null };
  },

  async updateSystemConfiguration() {
    return { error: null };
  },

  async generateReport() {
    return { data: null, error: { message: 'Reporting service unavailable' } };
  },

  async lookupApplications({ email, applicationNumber }) {
    const res = await apiClient.get('/admin/status-check/lookup', {
      params: { email, applicationNumber },
    });
    return res.data;
  },

  async getStatusCheckOtpLog() {
    const res = await apiClient.get('/admin/status-check/otp-log');
    return res.data;
  },

  async sendStatusCheckOtp(payload) {
    const res = await apiClient.post('/admin/status-check/send-otp', payload);
    return res.data;
  },

  async verifyStatusCheck(payload) {
    const res = await apiClient.post('/admin/status-check/verify', payload);
    return res.data;
  },

  async getDocumentRequirements(filters = {}) {
    try {
      const res = await apiClient.get('/admin/document-requirements', { params: filters });
      return { data: toCamelCase(res.data || []), error: null };
    } catch (error) {
      return { data: [], error: apiError(error, 'Failed to load document requirements') };
    }
  },

  async createDocumentRequirement(payload) {
    try {
      const res = await apiClient.post('/admin/document-requirements', payload);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to create requirement') };
    }
  },

  async updateDocumentRequirement(id, payload) {
    try {
      const res = await apiClient.patch(`/admin/document-requirements/${id}`, payload);
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to update requirement') };
    }
  },

  async deleteDocumentRequirement(id) {
    try {
      await apiClient.delete(`/admin/document-requirements/${id}`);
      return { error: null };
    } catch (error) {
      return { error: apiError(error, 'Failed to delete requirement') };
    }
  },

  async importDocumentRequirementsCsv(csv, replaceAll = true) {
    try {
      const res = await apiClient.post('/admin/document-requirements/import.csv', {
        csv,
        replaceAll,
      });
      return { data: toCamelCase(res.data), error: null };
    } catch (error) {
      return { data: null, error: apiError(error, 'Failed to import CSV') };
    }
  },

  async exportDocumentRequirementsCsv() {
    try {
      const res = await apiClient.get('/admin/document-requirements/export.csv', {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document-requirements.csv';
      a.click();
      URL.revokeObjectURL(url);
      return { error: null };
    } catch (error) {
      return { error: apiError(error, 'Failed to export CSV') };
    }
  },
};
