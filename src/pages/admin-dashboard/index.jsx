import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { trackEvent } from '../../hooks/useGoogleAnalytics';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import StatsCard from './components/StatsCard';
import ApplicationTable from './components/ApplicationTable';
import AgentManagementCard from './components/AgentManagementCard';
import EmployeeCard from './components/EmployeeCard';
import ActivityLog from './components/ActivityLog';

import { useAuth } from '../../contexts/AuthContext';
import { getApiBaseUrl } from '../../lib/runtimeConfig';
import { getAdminTabFromSearch, ADMIN_NAV_ITEMS } from '../../constants/adminNavigation';


import FilterPanel from './components/FilterPanel';
import PendingRegistrationsTab from './components/PendingRegistrationsTab';
import PendingPartnerRegistrationsTab from './components/PendingPartnerRegistrationsTab';
import { partnerRegistrationService } from '../../services/partnerRegistrationService';
import CustomersTab from './components/CustomersTab';
import AgentOnboardingModal from './components/AgentOnboardingModal';
import EmployeeOnboardingModal from './components/EmployeeOnboardingModal';
import SystemConfigPanel from './components/SystemConfigPanel';
import CommissionConfigModal from './components/CommissionConfigModal';
import AgentCommissionCsvUploadModal from './components/AgentCommissionCsvUploadModal';
import AccessControlModal from './components/AccessControlModal';
import StaffManageModal from './components/StaffManageModal';
import DocumentVerificationModal from './components/DocumentVerificationModal';
import MarketplaceEnquiryDetailModal from './components/MarketplaceEnquiryDetailModal';
import ApplicationDeleteModal from './components/ApplicationDeleteModal';
import { adminService } from '../../services/adminService';
import { getLoanProductBySlug } from '../../constants/loanProducts';
import { resolveUploadUrl } from '../../utils/documentUrls';
import BankManagementTab from './components/BankManagementTab';
import CreditCardsTab from './components/CreditCardsTab';
import InsuranceTab from './components/InsuranceTab';
import MutualFundsTab from './components/MutualFundsTab';
import PostOfficeTab from './components/PostOfficeTab';
import GovernmentSchemesTab from './components/GovernmentSchemesTab';
import InvestmentProductsTab from './components/InvestmentProductsTab';
import HomepageCmsTab from './components/HomepageCmsTab';
import MarketingSeoTab from './components/MarketingSeoTab';
import ConversionFunnelTab from './components/ConversionFunnelTab';
import LeadsTab from './components/LeadsTab';
import StatusCheckAdminTab from './components/StatusCheckAdminTab';
import OtpProviderSettingsForm from './components/OtpProviderSettingsForm';
import OAuthProviderSettingsForm from './components/OAuthProviderSettingsForm';
import LoanProductsTab from './components/LoanProductsTab';
import DocumentRequirementsTab from './components/DocumentRequirementsTab';
import HierarchyMappingTab from './components/HierarchyMappingTab';
import AgentLearningTab from './components/AgentLearningTab';
import EmployeeLearningTab from './components/EmployeeLearningTab';
import AdminSettingsTab from './components/AdminSettingsTab';
import Milestone4AdminPanel from './components/Milestone4AdminPanel';
import AdminDashboardOverview from './components/AdminDashboardOverview';


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, userProfile, loading: authLoading } = useAuth();
  const activeTab = getAdminTabFromSearch(searchParams);
  const [registrationSubTab, setRegistrationSubTab] = useState(() => {
    const partner = searchParams.get('partner');
    if (partner === 'pending') return 'partners';
    return 'pending';
  });
  const [pendingPartnerCount, setPendingPartnerCount] = useState(0);

  useEffect(() => {
    let active = true;
    const loadPartnerCount = async () => {
      const { data } = await partnerRegistrationService.getPendingPartnerApplications();
      if (active) setPendingPartnerCount(Array.isArray(data) ? data.length : 0);
    };
    loadPartnerCount();
    const id = setInterval(loadPartnerCount, 60000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [registrationSubTab]);
  const [activityLog, setActivityLog] = useState([]);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showCommissionCsvModal, setShowCommissionCsvModal] = useState(false);
  const [showAccessControlModal, setShowAccessControlModal] = useState(false);
  const [showStaffManageModal, setShowStaffManageModal] = useState(false);
  const [staffManageType, setStaffManageType] = useState('agent');
  const [staffManageTab, setStaffManageTab] = useState('details');
  const [showDocVerificationModal, setShowDocVerificationModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteApplicationIds, setDeleteApplicationIds] = useState([]);
  const [tableSelectionResetKey, setTableSelectionResetKey] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationsData, setApplicationsData] = useState([]);
  const [agentsData, setAgentsData] = useState([]);
  const [employeesData, setEmployeesData] = useState([]);
  const [statsData, setStatsData] = useState([
    {
      title: 'Total Applications',
      value: '0',
      change: '+0%',
      changeType: 'positive',
      icon: 'FileText',
      iconBg: 'bg-[var(--color-brand-green-dark)]',
      trend: 'up'
    },
    {
      title: 'Pending Reviews',
      value: '0',
      change: '+0%',
      changeType: 'positive',
      icon: 'Clock',
      iconBg: 'bg-gradient-to-br from-warning to-orange-500',
      trend: 'up'
    },
    {
      title: 'Active Agents',
      value: '0',
      change: '+0%',
      changeType: 'positive',
      icon: 'Users',
      iconBg: 'bg-gradient-to-br from-agent-primary to-pink-600',
      trend: 'up'
    },
    {
      title: 'Approval Rate',
      value: '0%',
      change: '+0%',
      changeType: 'positive',
      icon: 'TrendingUp',
      iconBg: 'bg-gradient-to-br from-success to-emerald-600',
      trend: 'up'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    loanType: 'all'
  });
  const [showApplicationsTable, setShowApplicationsTable] = useState(false);

  const activeTabMeta = ADMIN_NAV_ITEMS.find((i) => i.tab === activeTab);

  useEffect(() => {
    if (!searchParams.get('tab')) {
      navigate('/admin-dashboard?tab=applications', { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (authLoading || !user) return;
    loadStats();
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading || !user) return;
    loadTabData(activeTab);
    if (activeTab === 'applications' || activeTab === 'activity') {
      adminService.getAuditLogs(20).then(({ data }) => {
        if (data) setActivityLog(data);
      });
    }
  }, [activeTab, authLoading, user]);

  const resolveLoanTypeLabel = (app) => {
    if (app?.loanTypeLabel) return app.loanTypeLabel;
    if (app?.loan_type_label) return app.loan_type_label;
    const raw = app?.loanType || app?.loan_type || app?.data?.loanPurpose || app?.data?.loan_purpose;
    const product = getLoanProductBySlug(raw);
    if (product) return product.label;
    if (raw) {
      return String(raw)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return 'Not specified';
  };

  const resolveLoanAmount = (app) => {
    const amount =
      app?.loanAmount ??
      app?.requestedLoanAmount ??
      app?.data?.requestedLoanAmount ??
      app?.data?.requested_loan_amount;
    const num = Number(amount);
    return Number.isFinite(num) ? num : 0;
  };

  const mapApplicationRow = (app, customerImage = null) => {
    const isEnquiry =
      app?.recordType === 'marketplace_enquiry' || app?.record_type === 'marketplace_enquiry';
    return {
      id: app?.id,
      recordType: isEnquiry ? 'marketplace_enquiry' : 'loan_application',
      rawApplication: app,
      applicationNumber: app?.applicationNumber || app?.application_number || app?.id,
      customerName: app?.customer?.fullName || app?.customer?.full_name || 'Unknown',
      customerEmail: app?.customer?.email || '',
      customerImage,
      customerImageAlt: customerImage
        ? `Photo of ${app?.customer?.fullName || app?.customer?.full_name || 'customer'}`
        : `Profile of ${app?.customer?.fullName || app?.customer?.full_name || 'customer'}`,
      loanType: resolveLoanTypeLabel(app),
      amount: isEnquiry ? Number(app?.loanAmount ?? app?.loan_amount ?? 0) : resolveLoanAmount(app),
      bankName: isEnquiry ? 'Not applicable' : (app?.bank?.name || 'Not selected'),
      bankLogo: isEnquiry ? '' : (app?.bank?.logoUrl || app?.bank?.logo_url || ''),
      bankLogoAlt: isEnquiry ? 'N/A' : (app?.bank?.name ? `${app.bank.name} logo` : 'Bank'),
      status: app?.status || 'pending',
      documentStageStatus: app?.documentStageStatus || app?.document_stage_status || 'documents_pending',
      bankApprovalStatus: app?.bankApprovalStatus || app?.bank_approval_status || 'submitted_to_bank',
      agentCode: app?.sourcedAgentCode || app?.sourced_agent_code || app?.agentCode || '—',
      priority: app?.adminPriority || app?.admin_priority || 'medium',
      date: new Date(app?.createdAt || app?.created_at || app?.submittedAt || app?.submitted_at)
        ?.toISOString()
        ?.split('T')?.[0] || '',
    };
  };

  const enrichApplicationsWithPhotos = (apps) =>
    apps.map((app) => {
      const photoUrl = app.customerPhotoUrl ? resolveUploadUrl(app.customerPhotoUrl) : null;
      return mapApplicationRow(app, photoUrl);
    });

  const loadApplications = async (filterState = filters) => {
    const { data: apps, error } = await adminService.getAllApplications({
      ...filterState,
      page: 1,
      pageSize: 100,
      includePhotos: true,
      includeMarketplaceEnquiries: true,
    });
    if (error) {
      setApplicationsData([]);
      return { error };
    }
    const list = Array.isArray(apps) ? apps : [];
    const rows = enrichApplicationsWithPhotos(list);
    setApplicationsData(rows);
    return { error: null };
  };

  const loadStats = async () => {
    if (statsLoaded) return;
    setLoading(true);
    setLoadError('');

    if (!getApiBaseUrl()) {
      setLoadError('API is not configured. Set VITE_API_BASE_URL or redeploy with runtime config.');
      setLoading(false);
      return;
    }

    const { data: stats, error: statsError } = await adminService.getDashboardStats();
    if (statsError) {
      setLoadError(statsError.message);
    } else if (stats) {
        setStatsData([
          {
            title: 'Total Applications',
            value: stats?.totalApplications?.toString() || '0',
            change: '+12.5%',
            changeType: 'positive',
            icon: 'FileText',
            iconBg: 'bg-[var(--color-brand-green-dark)]',
            trend: 'up'
          },
          {
            title: 'Pending Reviews',
            value: stats?.pendingReviews?.toString() || '0',
            change: '+8.2%',
            changeType: 'positive',
            icon: 'Clock',
            iconBg: 'bg-gradient-to-br from-warning to-orange-500',
            trend: 'up'
          },
          {
            title: 'Active Agents',
            value: stats?.activeAgents?.toString() || '0',
            change: '+5.3%',
            changeType: 'positive',
            icon: 'Users',
            iconBg: 'bg-gradient-to-br from-agent-primary to-pink-600',
            trend: 'up'
          },
          {
            title: 'Approval Rate',
            value: stats?.approvalRate || '0%',
            change: '-2.1%',
            changeType: 'negative',
            icon: 'TrendingUp',
            iconBg: 'bg-gradient-to-br from-success to-emerald-600',
            trend: 'down'
          }
        ]);
    }
    setStatsLoaded(true);
    setLoading(false);
  };

  const loadTabData = async (tab) => {
    setTabLoading(true);
    const errors = [];

    try {
      if (tab === 'applications') {
        const { error: appsError } = await loadApplications(filters);
        if (appsError) errors.push(appsError.message);
      }

      if (tab === 'agents') {
        if (typeof adminService.getAllAgents !== 'function') {
          errors.push('Agent list is unavailable. Redeploy the frontend to load the latest admin API.');
        } else {
          const { data: agents, error: agentsError } = await adminService.getAllAgents();
          if (agentsError) {
            errors.push(agentsError.message);
          } else if (agents) {
            setAgentsData(agents.map(agent => ({
              id: agent?.id,
              agentId: agent?.agentCode || 'N/A',
              name: agent?.agentName || 'Unknown',
              email: agent?.email || '',
              profileImage: "https://img.rocket.new/generatedImages/rocket_gen_img_14760cf8e-1763296171419.png",
              profileImageAlt: `Profile picture of ${agent?.agentName}`,
              status: agent?.onboardingStatus || 'pending',
              totalClients: agent?.agent?.totalClients || 0,
              totalCommission: agent?.agent?.totalCommission || 0,
              successRate: agent?.agent?.successRate || 0,
              joinedDate: new Date(agent?.createdAt)?.toISOString()?.split('T')?.[0] || ''
            })));
          }
        }
      }

      if (tab === 'activity') {
        const { data: logs, error: logErr } = await adminService.getAuditLogs(150);
        if (logErr) errors.push(logErr.message);
        else setActivityLog(logs || []);
      }

      if (tab === 'employees') {
        if (typeof adminService.getAllEmployees !== 'function') {
          errors.push('Employee list is unavailable. Redeploy the frontend to load the latest admin API.');
        } else {
          const { data: employees, error: employeesError } = await adminService.getAllEmployees();
          if (employeesError) {
            errors.push(employeesError.message);
          } else if (employees) {
            setEmployeesData(employees.map(emp => ({
              id: emp?.id,
              employeeCode: emp?.employeeCode || 'N/A',
              name: emp?.employeeName || 'Unknown',
              email: emp?.email || '',
              profileImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1b80e6770-1763297889591.png",
              profileImageAlt: `Profile picture of ${emp?.employeeName}`,
              role: emp?.userProfile?.role || 'employee',
              status:
                (emp?.onboardingStatus === 'active' || emp?.userProfile?.isActive)
                  ? 'active'
                  : 'pending',
              department: 'Operations',
              tasksCompleted: 0,
              tasksTotal: 0,
              lastActive: '5 min ago',
              isOnline: emp?.userProfile?.isActive || false,
              permissions: emp?.grantedModules || [],
              accessConfigured: Boolean(emp?.accessConfigured),
            })));
          }
        }
      }
    } catch (error) {
      console.error('Error loading tab data:', error);
      errors.push(error?.message || 'Failed to load section');
    }

    if (errors.length) {
      setLoadError(errors.join(' '));
    }
    setTabLoading(false);
  };

  const refreshCurrentTab = () => loadTabData(activeTab);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (activeTab === 'applications') {
        setTimeout(() => loadApplications(next), 0);
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    const reset = {
      search: '',
      status: 'all',
      priority: 'all',
      loanType: 'all',
    };
    setFilters(reset);
    if (activeTab === 'applications') {
      loadApplications(reset);
    }
  };

  const handleApproveApplication = async (applicationId, reviewNotes) => {
    const { error } = await adminService?.approveApplication(applicationId, reviewNotes);
    if (!error) {
      await refreshCurrentTab();
      alert('Application approved successfully');
    } else {
      alert('Failed to approve application: ' + error?.message);
    }
  };

  const handleRejectApplication = async (applicationId, rejectionReason) => {
    const { error } = await adminService?.rejectApplication(applicationId, rejectionReason);
    if (!error) {
      await refreshCurrentTab();
      alert('Application rejected');
    } else {
      alert('Failed to reject application: ' + error?.message);
    }
  };

  const filterLoanApplicationIds = (applicationIds) =>
    (applicationIds || []).filter((id) => {
      const row = applicationsData.find((app) => app.id === id);
      return row?.recordType !== 'marketplace_enquiry';
    });

  const handleBulkApproveApplications = async (applicationIds) => {
    const loanIds = filterLoanApplicationIds(applicationIds);
    if (!loanIds.length) {
      alert('Bulk approve applies to loan applications only. Marketplace enquiries cannot be approved this way.');
      return;
    }
    if (loanIds.length < applicationIds.length) {
      alert('Note: marketplace enquiries were skipped. Only loan applications will be approved.');
    }
    const notes = prompt('Optional review notes for bulk approval:') || '';
    const { data, error } = await adminService.bulkUpdateApplicationStatus(loanIds, 'approved', notes);
    if (error) {
      alert(error.message);
      return;
    }
    setTableSelectionResetKey((k) => k + 1);
    await refreshCurrentTab();
    alert(`Approved ${data?.updated ?? loanIds.length} application(s).`);
  };

  const handleBulkRejectApplications = async (applicationIds) => {
    const loanIds = filterLoanApplicationIds(applicationIds);
    if (!loanIds.length) {
      alert('Bulk reject applies to loan applications only.');
      return;
    }
    if (loanIds.length < applicationIds.length) {
      alert('Note: marketplace enquiries were skipped.');
    }
    if (!loanIds?.length) return;
    const reason = prompt('Rejection reason (required):');
    if (!reason?.trim()) return;
    const { data, error } = await adminService.bulkUpdateApplicationStatus(loanIds, 'rejected', reason);
    if (error) {
      alert(error.message);
      return;
    }
    setTableSelectionResetKey((k) => k + 1);
    await refreshCurrentTab();
    alert(`Rejected ${data?.updated ?? loanIds.length} application(s).`);
  };

  const handleBulkDeleteApplications = (applicationIds) => {
    const loanIds = filterLoanApplicationIds(applicationIds);
    if (!loanIds.length) {
      alert('Bulk delete applies to loan applications only.');
      return;
    }
    if (loanIds.length < applicationIds.length) {
      alert('Note: marketplace enquiries were skipped.');
    }
    setDeleteApplicationIds(loanIds);
    setShowDeleteModal(true);
  };

  const handleApplicationsDeleted = async () => {
    setDeleteApplicationIds([]);
    setTableSelectionResetKey((k) => k + 1);
    await refreshCurrentTab();
    alert('Selected applications were permanently deleted.');
  };

  const handleViewApplicationDetails = (application) => {
    setSelectedApplication(application);
    if (application?.recordType === 'marketplace_enquiry') {
      setShowEnquiryModal(true);
      return;
    }
    setShowDocVerificationModal(true);
  };

  const handleApproveEmployee = async (employeeId) => {
    const { error } = await adminService?.approveEmployee(employeeId);
    if (error) {
      alert(error?.message);
    } else {
      refreshCurrentTab();
    }
  };

  const handleApproveAgent = async (agentId) => {
    const { error } = await adminService?.approveAgent(agentId);
    if (!error) {
      await refreshCurrentTab();
      alert('Agent approved successfully');
    } else {
      alert('Failed to approve agent: ' + error?.message);
    }
  };

  const handleRejectAgent = async (agentId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    const { error } = await adminService?.rejectAgent(agentId, reason);
    if (!error) {
      await refreshCurrentTab();
      alert('Agent rejected');
    } else {
      alert('Failed to reject agent: ' + error?.message);
    }
  };

  const handleSuspendAgent = async (agentId) => {
    if (!window.confirm('Suspend this agent? They will not be able to log in until reactivated.')) {
      return;
    }
    const { error } = await adminService?.suspendAgent(agentId);
    if (!error) {
      await refreshCurrentTab();
      alert('Agent suspended');
    } else {
      alert('Failed to suspend agent: ' + error?.message);
    }
  };

  const handleConfigureCommission = (agent) => {
    setSelectedAgent(agent);
    setShowCommissionModal(true);
  };

  const handleSaveCommission = async (commissionConfig) => {
    if (!selectedAgent) return;

    const { error } = await adminService?.updateAgentCommission(selectedAgent?.id, commissionConfig);
    if (!error) {
      setShowCommissionModal(false);
      alert('Commission configuration saved successfully');
    } else {
      alert('Failed to save commission: ' + error?.message);
    }
  };

  const openStaffManage = (type, person, tab = 'details') => {
    setStaffManageType(type);
    setStaffManageTab(tab);
    if (type === 'agent') {
      setSelectedAgent(person);
    } else {
      setSelectedEmployee(person);
    }
    setShowStaffManageModal(true);
  };

  const handleEditEmployeeRole = (employee) => {
    setSelectedEmployee(employee);
    setShowAccessControlModal(true);
  };

  const handleSaveAccessControl = async (accessControls) => {
    if (!selectedEmployee) return;

    const { error } = await adminService?.updateEmployeeAccessControls(selectedEmployee?.id, accessControls);
    if (!error) {
      setShowAccessControlModal(false);
      await refreshCurrentTab();
      alert('Access controls updated successfully');
    } else {
      alert('Failed to update access controls: ' + error?.message);
    }
  };

  const handleViewAgentProfile = (agent) => {
    setSelectedAgent(agent);
    setShowCommissionModal(true);
  };

  const handleViewEmployeeActivity = () => {
    navigate('/admin-dashboard?tab=activity');
  };

  const handleQuickAction = (actionId) => {
    trackEvent('admin_quick_action', { action: actionId });
    const actionMap = {
      'approve-applications': () => navigate('/admin-dashboard?tab=applications'),
      'review-agents': () => navigate('/admin-dashboard?tab=agents'),
      'manage-employees': () => navigate('/admin-dashboard?tab=employees'),
      'update-matrix': () => navigate('/interest-matrix-management'),
      'view-reports': () => navigate('/reports-and-analytics'),
      'system-settings': () => navigate('/admin-dashboard?tab=system'),
      'otp-settings': () => navigate('/admin-dashboard?tab=otp'),
    };

    const action = actionMap?.[actionId];
    if (action) action();
  };

  const showStats = ['applications', 'agents', 'employees', 'registrations', 'leads', 'hierarchy'].includes(activeTab);

  return (
    <>
        {loadError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {loadError}
          </div>
        )}

        {showStats && activeTab !== 'applications' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
            {statsData?.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
        )}

        {activeTab === 'applications' && !showApplicationsTable && (
          <AdminDashboardOverview
            applications={applicationsData}
            stats={{
              totalApplications: statsData[0]?.value,
              pendingReviews: statsData[1]?.value,
              activeAgents: statsData[2]?.value,
            }}
            activityLog={activityLog}
            onQuickAction={handleQuickAction}
            onViewApplication={handleViewApplicationDetails}
          />
        )}

        {activeTab === 'applications' && (
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              {showApplicationsTable ? 'All Applications' : activeTabMeta?.label || 'Dashboard'}
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApplicationsTable((v) => !v)}
            >
              {showApplicationsTable ? 'Back to overview' : 'Manage all applications'}
            </Button>
          </div>
        )}

        {activeTab !== 'applications' && (
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {activeTabMeta?.label || 'Dashboard'}
          </h1>
        </div>
        )}

        <div className={`bg-card rounded-lg border border-border p-4 md:p-6 ${activeTab === 'applications' && !showApplicationsTable ? 'hidden' : ''}`}>
            {loading || tabLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
              </div>
            ) : (
              <>
                {/* Applications Tab */}
                {activeTab === 'applications' && (
                  <div className="space-y-6">
                    <FilterPanel filters={filters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />
                    <ApplicationTable
                      applications={applicationsData}
                      onViewDetails={handleViewApplicationDetails}
                      onApprove={handleApproveApplication}
                      onReject={handleRejectApplication}
                      onBulkApprove={handleBulkApproveApplications}
                      onBulkReject={handleBulkRejectApplications}
                      onBulkDelete={handleBulkDeleteApplications}
                      selectionResetKey={tableSelectionResetKey}
                    />
                  </div>
                )}

                {/* Registrations Tab */}
                {activeTab === 'registrations' && (
                  <div className="space-y-6">
                    <div className="flex gap-2 border-b border-border">
                      <button
                        type="button"
                        onClick={() => setRegistrationSubTab('pending')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                          registrationSubTab === 'pending'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground'
                        }`}
                      >
                        Customer registrations
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegistrationSubTab('partners')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px inline-flex items-center gap-2 ${
                          registrationSubTab === 'partners'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground'
                        }`}
                      >
                        Partner applications
                        {pendingPartnerCount > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-error text-white text-xs font-bold">
                            {pendingPartnerCount}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegistrationSubTab('customers')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                          registrationSubTab === 'customers'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground'
                        }`}
                      >
                        All customers
                      </button>
                    </div>
                    {registrationSubTab === 'pending' ? (
                      <PendingRegistrationsTab />
                    ) : registrationSubTab === 'partners' ? (
                      <PendingPartnerRegistrationsTab />
                    ) : (
                      <CustomersTab />
                    )}
                  </div>
                )}

                {/* Agents Tab */}
                {activeTab === 'agents' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <h2 className="text-xl font-bold text-foreground">Agent Management</h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowCommissionCsvModal(true)}
                          iconName="Upload"
                        >
                          Upload commission CSV
                        </Button>
                        <Button onClick={() => setShowAgentModal(true)} iconName="Plus">
                          Add Agent
                        </Button>
                      </div>
                    </div>
                    {pendingPartnerCount > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-warning/10 border border-warning/40 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-warning/20">
                            <Icon name="UserPlus" size={20} className="text-warning" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {pendingPartnerCount} new agent application{pendingPartnerCount > 1 ? 's' : ''} awaiting review
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted from the agent app. Approve to create an agent account and send the FY code.
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setRegistrationSubTab('partners');
                            navigate('/admin-dashboard?tab=registrations&partner=pending');
                          }}
                          iconName="ArrowRight"
                          iconPosition="right"
                        >
                          Review applications
                        </Button>
                      </div>
                    )}
                    <div className="grid gap-4">
                      {agentsData?.map((agent) => (
                        <AgentManagementCard
                          key={agent?.id}
                          agent={agent}
                          onApprove={handleApproveAgent}
                          onReject={handleRejectAgent}
                          onSuspend={handleSuspendAgent}
                          onViewProfile={handleConfigureCommission}
                          onEditDetails={(a) => openStaffManage('agent', a, 'details')}
                          onResetPassword={(a) => openStaffManage('agent', a, 'password')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Employees Tab */}
                {activeTab === 'employees' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-foreground">Employee Management</h2>
                      <Button onClick={() => setShowEmployeeModal(true)} iconName="Plus">
                        Add Employee
                      </Button>
                    </div>
                    <div className="grid gap-4">
                      {employeesData?.map((employee) => (
                        <EmployeeCard
                          key={employee?.id}
                          employee={employee}
                          onApprove={handleApproveEmployee}
                          onEditDetails={(emp) => openStaffManage('employee', emp, 'details')}
                          onResetPassword={(emp) => openStaffManage('employee', emp, 'password')}
                          onEditRole={handleEditEmployeeRole}
                          onViewActivity={handleViewEmployeeActivity}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'bank-management' && <BankManagementTab />}

                {activeTab === 'credit-cards' && <CreditCardsTab />}
                {activeTab === 'insurance' && <InsuranceTab />}
                {activeTab === 'mutual-funds' && <MutualFundsTab />}
                {activeTab === 'post-office' && <PostOfficeTab />}
                {activeTab === 'government-schemes' && <GovernmentSchemesTab />}
                {activeTab === 'investment-products' && <InvestmentProductsTab />}

                {activeTab === 'loan-products' && <LoanProductsTab />}

                {activeTab === 'document-requirements' && <DocumentRequirementsTab />}

                {activeTab === 'homepage-cms' && <HomepageCmsTab />}

                {activeTab === 'marketing-seo' && <MarketingSeoTab />}

                {activeTab === 'status-check' && <StatusCheckAdminTab />}

                {activeTab === 'otp' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">OTP verification</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure SMS (MSG91), email (MSG91 domain), and eligibility Step 1 OTP delivery.
                      </p>
                    </div>
                    <OtpProviderSettingsForm />
                  </div>
                )}

                {activeTab === 'leads' && <LeadsTab />}

                {activeTab === 'conversion-funnel' && <ConversionFunnelTab />}

                {activeTab === 'hierarchy' && <HierarchyMappingTab />}

                {activeTab === 'agent-learning' && <AgentLearningTab />}

                {activeTab === 'employee-learning' && <EmployeeLearningTab />}

                {activeTab === 'settings' && <AdminSettingsTab />}

                {/* System Configuration Tab */}
                {activeTab === 'system' && (
                  <div className="space-y-8">
                    <Milestone4AdminPanel />
                    <OAuthProviderSettingsForm />
                    <OtpProviderSettingsForm />
                    <SystemConfigPanel />
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <ActivityLog activities={activityLog} />
                )}
              </>
            )}
        </div>

      {/* Modals */}
      <AgentOnboardingModal
        isOpen={showAgentModal}
        onClose={() => setShowAgentModal(false)}
        onSuccess={refreshCurrentTab}
      />
      <EmployeeOnboardingModal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        onSuccess={refreshCurrentTab}
      />
      <CommissionConfigModal
        agent={selectedAgent}
        isOpen={showCommissionModal}
        onClose={() => setShowCommissionModal(false)}
        onSave={handleSaveCommission}
      />
      <AgentCommissionCsvUploadModal
        isOpen={showCommissionCsvModal}
        onClose={() => setShowCommissionCsvModal(false)}
        onImported={async () => {
          await refreshCurrentTab();
        }}
      />
      <StaffManageModal
        staffType={staffManageType}
        staff={staffManageType === 'agent' ? selectedAgent : selectedEmployee}
        isOpen={showStaffManageModal}
        initialTab={staffManageTab}
        onClose={() => setShowStaffManageModal(false)}
        onSuccess={refreshCurrentTab}
      />
      <AccessControlModal
        employee={selectedEmployee}
        isOpen={showAccessControlModal}
        onClose={() => setShowAccessControlModal(false)}
        onSave={handleSaveAccessControl}
      />
      <DocumentVerificationModal
        application={selectedApplication}
        isOpen={showDocVerificationModal}
        onClose={() => setShowDocVerificationModal(false)}
        onApprove={handleApproveApplication}
        onReject={handleRejectApplication}
      />
      <MarketplaceEnquiryDetailModal
        application={selectedApplication}
        isOpen={showEnquiryModal}
        onClose={() => setShowEnquiryModal(false)}
      />
      <ApplicationDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteApplicationIds([]);
        }}
        applicationIds={deleteApplicationIds}
        applications={applicationsData}
        adminEmail={userProfile?.email || user?.email || ''}
        onDeleted={handleApplicationsDeleted}
      />
    </>
  );
};

export default AdminDashboard;