import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import PortalShell from '../../components/layout/PortalShell';
import DashboardKpiCard from '../../components/dashboard/DashboardKpiCard';
import {
  EMPLOYEE_NAV_ITEMS,
  EMPLOYEE_ALWAYS_VISIBLE_TABS,
  getEmployeeTabFromSearch,
} from '../../constants/portalNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

import Input from '../../components/ui/Input';

import DocumentViewer from './components/DocumentViewer';
import PerformanceMetrics from './components/PerformanceMetrics';
import ActivityLog from './components/ActivityLog';
import TrainingResources from './components/TrainingResources';
import EmployeeLeadsTab from './components/EmployeeLeadsTab';
import LearningResourceModal from '../../components/learning/LearningResourceModal';
import AgentVerificationModal from './components/AgentVerificationModal';
import ApplicationWorkspaceModal from './components/ApplicationWorkspaceModal';
import { employeeService } from '../../services/employeeService';
import {
  employeeLearningService,
} from '../../services/employeeLearningService';
import SessionTimeout from '../../components/SessionTimeout';
import { useAuth } from '../../contexts/AuthContext';
import { usePortalPolling } from '../../hooks/usePortalPolling';
import StaffCommunicationPanel from '../agent-dashboard/components/StaffCommunicationPanel';
import CustomerSupportPanel from '../customer-dashboard/components/CustomerSupportPanel';
import EmployeeSettingsPanel from './components/EmployeeSettingsPanel';
import ReferralSharePanel from '../../components/referral/ReferralSharePanel';
import { staffMessagingService } from '../../services/staffMessagingService';
import {
  employeeCan,
  grantedModuleLabels,
  isAccessConfigured,
  isEmployeeAccessActive,
} from '../../utils/employeeAccess';


const EmployeePortal = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { signOut, employeeAccess: authEmployeeAccess } = useAuth();
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [workspaceApplication, setWorkspaceApplication] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(() => getEmployeeTabFromSearch(searchParams));
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loadInFlightRef = useRef(false);
  const initialLoadDoneRef = useRef(false);
  const authAccessRef = useRef(authEmployeeAccess);
  authAccessRef.current = authEmployeeAccess;
  
  // Real data from Supabase
  const [pendingAgents, setPendingAgents] = useState([]);
  const [assignedApplications, setAssignedApplications] = useState([]);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activityLog, setActivityLog] = useState([]);

  const [trainingResources, setTrainingResources] = useState([]);
  const [activeLearningResource, setActiveLearningResource] = useState(null);
  const [communicationOpen, setCommunicationOpen] = useState(false);
  const [communicationContext, setCommunicationContext] = useState({
    applicationId: null,
    clientLabel: '',
  });
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [employeeAccess, setEmployeeAccess] = useState(null);
  const loadDashboardData = useCallback(async ({ background = false } = {}) => {
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;

    if (background) {
      setIsRefreshing(true);
    } else if (!initialLoadDoneRef.current) {
      setInitialLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const { data: dashboard } = await employeeService.getEmployeeDashboard();
      setDashboardStats(dashboard?.stats || dashboard);
      const access = dashboard?.access || authAccessRef.current || null;
      setEmployeeAccess(access);

      const appList =
        dashboard?.applications != null
          ? dashboard.applications
          : employeeCan(access, 'applications', 'read')
            ? (await employeeService.getAssignedApplications())?.data || []
            : [];
      setAssignedApplications(appList);
      const appById = Object.fromEntries(appList.map((a) => [a.id, a]));

      if (employeeCan(access, 'agents', 'read')) {
        const { data: agents } = await employeeService.getPendingAgentOnboarding();
        setPendingAgents(agents || []);
      } else {
        setPendingAgents([]);
      }

      if (employeeCan(access, 'documents', 'read')) {
        const { data: documents } = await employeeService.getPendingDocuments();
        setPendingDocuments(
          (documents || []).map((doc) => ({
            ...doc,
            applicationNumber:
              doc.applicationNumber ||
              appById[doc.applicationId]?.applicationNumber,
          })),
        );
      } else {
        setPendingDocuments([]);
      }

      if (employeeCan(access, 'reports', 'read')) {
        setActivityLog(dashboard?.activities || []);
      } else {
        setActivityLog([]);
      }

      const learning = dashboard?.learningResources?.length
        ? dashboard.learningResources
        : await employeeLearningService.listForEmployee();
      setTrainingResources(
        (Array.isArray(learning) ? learning : []).map((item) => ({
          ...item,
          category: item.category || item.categoryLabel || 'Document Verification',
          duration: item.duration || item.durationLabel || '—',
        })),
      );
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      loadInFlightRef.current = false;
      initialLoadDoneRef.current = true;
      setInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (authEmployeeAccess) {
      setEmployeeAccess((prev) => prev || authEmployeeAccess);
    }
  }, [authEmployeeAccess]);

  usePortalPolling(
    () => loadDashboardData({ background: true }),
    20000,
    !initialLoading,
  );

  const refreshUnreadMessages = useCallback(async () => {
    try {
      const count = await staffMessagingService.getUnreadCount();
      setUnreadMessageCount(count);
    } catch {
      setUnreadMessageCount(0);
    }
  }, []);

  useEffect(() => {
    refreshUnreadMessages();
  }, [refreshUnreadMessages]);

  usePortalPolling(refreshUnreadMessages, 20000, !communicationOpen);

  const openCommunication = (item = {}) => {
    const customerName =
      item?.clientName ||
      item?.customer?.fullName ||
      item?.customerName ||
      '';
    setCommunicationContext({
      applicationId: item?.applicationId || item?.id || null,
      clientLabel: customerName
        ? `${customerName}${item?.applicationNumber ? ` · ${item.applicationNumber}` : ''}`
        : item?.applicationNumber || '',
    });
    setCommunicationOpen(true);
  };

  const handleApproveAgent = async (agentUserId, payload) => {
    const { error } = await employeeService?.approveAgentOnboarding(agentUserId, payload);
    if (!error) {
      setSelectedAgent(null);
      loadDashboardData();
    }
    return { error };
  };

  const handleRejectAgent = async (agentUserId, reason) => {
    const { error } = await employeeService?.rejectAgentOnboarding(agentUserId, reason);
    if (!error) {
      setSelectedAgent(null);
      loadDashboardData();
    }
    return { error };
  };

  const openApplicationWorkspace = (app) => {
    setWorkspaceApplication(app);
  };

  const openWorkspaceByApplicationId = async (applicationId) => {
    const local = assignedApplications.find((a) => a.id === applicationId);
    if (local) {
      openApplicationWorkspace(local);
      return;
    }
    const { data, error } = await employeeService.getApplication(applicationId);
    if (data) openApplicationWorkspace(data);
    else alert(error?.message || 'Application not found');
  };

  const handleVerifyDocument = async (documentId, verificationData) => {
    const { error } = await employeeService?.verifyDocument(documentId, verificationData);
    if (!error) {
      setSelectedDocument(null);
      loadDashboardData();
    }
  };

  const handleLearningOpen = async (resource) => {
    setActiveLearningResource(resource);
    if (resource.id) {
      const next = resource.progress > 0 ? Math.min(100, resource.progress + 25) : 50;
      try {
        await employeeLearningService.updateProgress(resource.id, next);
        setTrainingResources((prev) =>
          prev.map((r) => (r.id === resource.id ? { ...r, progress: next } : r)),
        );
      } catch {
        /* ignore */
      }
    }
  };

  const handleLearningStart = async (resource) => {
    setActiveLearningResource(resource);
    if (resource.id && (resource.progress || 0) < 100) {
      try {
        await employeeLearningService.updateProgress(resource.id, 100);
        setTrainingResources((prev) =>
          prev.map((r) => (r.id === resource.id ? { ...r, progress: 100 } : r)),
        );
      } catch {
        /* ignore */
      }
    }
  };

  const handleRequestReupload = async (documentId, reason) => {
    const { error } = await employeeService?.requestDocumentReupload(documentId, reason);
    if (!error) {
      setSelectedDocument(null);
      loadDashboardData();
    }
  };

  const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'low', label: 'Low Priority' }];


  const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }];


  const filteredApplications = assignedApplications?.filter((app) => {
    const matchesSearch = app?.customer?.fullName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      app?.applicationNumber?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    return matchesSearch;
  });

  const pendingApplicationGroups = useMemo(() => {
    const groups = {};
    for (const doc of pendingDocuments || []) {
      const appId = doc.applicationId;
      if (!appId) continue;
      if (!groups[appId]) {
        const linkedApp = assignedApplications.find((a) => a.id === appId);
        groups[appId] = {
          applicationId: appId,
          applicationNumber: doc.applicationNumber || linkedApp?.applicationNumber,
          customerName:
            linkedApp?.customer?.fullName ||
            linkedApp?.customerName ||
            doc.customerName ||
            'Applicant',
          documents: [],
          latestUpload: null,
        };
      }
      groups[appId].documents.push(doc);
      const uploaded = doc.uploadedAt || doc.createdAt;
      if (
        uploaded
        && (!groups[appId].latestUpload || new Date(uploaded) > new Date(groups[appId].latestUpload))
      ) {
        groups[appId].latestUpload = uploaded;
      }
    }
    return Object.values(groups).sort(
      (a, b) => new Date(b.latestUpload || 0) - new Date(a.latestUpload || 0),
    );
  }, [pendingDocuments, assignedApplications]);

  const effectiveAccess = employeeAccess || authEmployeeAccess;

  const allTabs = [
    { id: 'applications', label: 'Applications', icon: 'FileText', count: assignedApplications?.length, module: 'applications' },
    { id: 'leads', label: 'Leads', icon: 'UserPlus', module: 'leads' },
    { id: 'agents', label: 'Agent Verification', icon: 'UserCheck', count: pendingAgents?.length, module: 'agents' },
    { id: 'documents', label: 'Application Verification', icon: 'FolderOpen', count: pendingDocuments?.length, module: 'documents' },
    { id: 'activity', label: 'Activity Log', icon: 'Activity', module: 'reports' },
    { id: 'training', label: 'Training', icon: 'GraduationCap' },
  ];

  const tabs = allTabs.filter((tab) => !tab.module || employeeCan(effectiveAccess, tab.module, 'read'));

  useEffect(() => {
    const tab = getEmployeeTabFromSearch(searchParams);
    if (tab !== activeTab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (!tabs.length) return;
    if (EMPLOYEE_ALWAYS_VISIBLE_TABS.includes(activeTab)) return;
    if (!tabs.some((tab) => tab.id === activeTab)) {
      const nextTab = tabs[0].id;
      setActiveTab(nextTab);
      setSearchParams(nextTab === 'applications' ? {} : { tab: nextTab });
    }
  }, [tabs, activeTab, setSearchParams]);

  const accessLabels = grantedModuleLabels(effectiveAccess);
  const accessBlocked = effectiveAccess?.configured && !isEmployeeAccessActive(effectiveAccess);


  const employeeNavItems = EMPLOYEE_NAV_ITEMS.filter((item) => {
    if (item.tab && EMPLOYEE_ALWAYS_VISIBLE_TABS.includes(item.tab)) return true;
    const tab = tabs.find((t) => t.id === item.tab);
    if (item.tab && !tab) return false;
    return true;
  }).map((item) => {
    const tab = tabs.find((t) => t.id === item.tab);
    return { ...item, badge: tab?.count || 0 };
  });

  const handleEmployeeNav = (item) => {
    if (item.tab) {
      setActiveTab(item.tab);
      if (item.tab === 'applications') {
        setSearchParams({});
      } else {
        setSearchParams({ tab: item.tab });
      }
    }
  };

  const EMPLOYEE_TAB_HEADINGS = {
    applications: null,
    leads: { title: 'Leads & CRM', subtitle: 'Manage and follow up on customer leads.' },
    agents: { title: 'Agent Verification', subtitle: 'Review and verify pending agent registrations.' },
    documents: { title: 'Application Verification', subtitle: 'Review and verify pending application documents.' },
    training: { title: 'Training', subtitle: 'Complete modules to boost productivity.' },
    activity: { title: 'Activity Log', subtitle: 'Your recent actions and audit trail.' },
    'agent-referral': {
      title: 'Agent Referral',
      subtitle: 'Share partner referral links and invite new agents to join RFINCARE.',
    },
    'customer-referral': {
      title: 'Customer Referral',
      subtitle: 'Share customer referral links and help friends start their loan journey.',
    },
    support: { title: 'Support Center', subtitle: 'Get help from our operations team.' },
    settings: { title: 'Settings', subtitle: 'Update your profile photo and password.' },
  };

  const tabHeading = EMPLOYEE_TAB_HEADINGS[activeTab];

  const employeeKpis = dashboardStats ? [
    { title: 'Pending Review', value: String(dashboardStats.pendingReview ?? 0), icon: 'Clock', iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
    { title: 'Completed Today', value: String(dashboardStats.completedToday ?? 0), change: '+8.2%', icon: 'CheckCircle2' },
    { title: 'Pending Documents', value: String(dashboardStats.pendingDocuments ?? 0), icon: 'FolderOpen', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
    { title: 'Active Applications', value: String(assignedApplications.length), icon: 'FileText', iconBg: 'bg-sky-50', iconColor: 'text-sky-600' },
    { title: 'Quality Score', value: '96%', subtitle: 'This month', icon: 'Award', iconBg: 'bg-emerald-50' },
  ] : [];

  return (
    <PortalShell
      portalLabel="Employee Portal"
      navItems={employeeNavItems}
      activeId={activeTab}
      onNavSelect={handleEmployeeNav}
      userName="Employee"
      userRole="Operations"
      notificationCount={unreadMessageCount}
      onLogout={async () => {
        await signOut();
        navigate('/employee-login');
      }}
      promoCard={(
        <div>
          <p className="text-sm font-bold text-foreground mb-1">Training Hub</p>
          <p className="text-xs text-muted-foreground mb-3">Complete modules to boost productivity</p>
          <Button className="rf-btn-primary w-full" size="sm" onClick={() => handleEmployeeNav({ tab: 'training' })}>
            Start Learning
          </Button>
        </div>
      )}
      headerActions={(
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadDashboardData()}
          disabled={isRefreshing}
        >
          <Icon name="RefreshCw" size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </Button>
      )}
    >
      <SessionTimeout timeoutMinutes={30} warningMinutes={2} />

        <div className="mb-6">
          {tabHeading ? (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{tabHeading.title}</h1>
              <p className="text-sm text-muted-foreground">{tabHeading.subtitle}</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                Welcome back! 👋
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage verifications, applications, and customer support tasks
              </p>
            </>
          )}
        </div>

        {activeTab === 'applications' && employeeKpis.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {employeeKpis.map((kpi) => (
              <DashboardKpiCard key={kpi.title} {...kpi} />
            ))}
          </div>
        ) : null}

        {activeTab === 'applications' && accessBlocked && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            Your portal access has expired or been disabled. Contact your administrator.
          </div>
        )}

        {activeTab === 'applications' && !accessBlocked && (
          <div className="mb-4 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <p className="text-xs font-semibold text-foreground mb-2">Your assigned access</p>
            {accessLabels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {accessLabels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : isAccessConfigured(effectiveAccess) ? (
              <p className="text-xs text-amber-700">
                Access is configured but no modules are enabled. Contact your administrator.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Full employee access — all modules available (not restricted by admin).
              </p>
            )}
          </div>
        )}

        {activeTab === 'applications' && !accessBlocked && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by customer name or application ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="w-full"
                />
              </div>
            </div>

            {initialLoading ? (
              <div className="text-center py-12">
                <Icon name="Loader" size={32} className="animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-4">Loading applications...</p>
              </div>
            ) : filteredApplications?.length > 0 ? (
              <div className="space-y-4">
                {filteredApplications?.map((app) => {
                  const amount =
                    app?.loanAmount ??
                    app?.requestedLoanAmount ??
                    app?.data?.requested_loan_amount;
                  const loanLabel =
                    app?.loanTypeLabel || app?.loanPurpose || app?.data?.loan_purpose || '—';
                  const submitted = app?.submittedAt || app?.createdAt;
                  return (
                  <div key={app?.id} className="bg-card border border-border rounded-lg p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-foreground">
                            {app?.customer?.fullName || app?.customerName || app?.name || 'Customer'}
                          </h3>
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                            {app?.applicationNumber}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Loan Type:</span>
                            <p className="font-medium text-foreground">{loanLabel}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <p className="font-medium text-foreground">
                              {amount != null ? `₹${Number(amount).toLocaleString('en-IN')}` : '—'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <p className="font-medium text-foreground">{app?.status}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Submitted:</span>
                            <p className="font-medium text-foreground">
                              {submitted
                                ? new Date(submitted).toLocaleDateString('en-IN')
                                : '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCommunication(app)}
                        >
                          <Icon name="MessageSquare" size={14} className="mr-1" />
                          Message agent
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => openApplicationWorkspace(app)}
                        >
                          <Icon name="ClipboardCheck" size={14} className="mr-1" />
                          Process application
                        </Button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Icon name="Inbox" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No applications assigned</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leads' && employeeCan(effectiveAccess, 'leads', 'read') && (
          <EmployeeLeadsTab />
        )}

        {activeTab === 'agents' && (
          <div className="space-y-4">
            {initialLoading ? (
              <div className="text-center py-12">
                <Icon name="Loader" size={32} className="animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-4">Loading agents...</p>
              </div>
            ) : pendingAgents?.length > 0 ? (
              pendingAgents?.map((agent) => (
                <div key={agent?.id} className="bg-card border border-border rounded-lg p-4 md:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-foreground">{agent?.agentName}</h3>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                          Pending Verification
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Agent Code:</span>
                          <p className="font-medium text-foreground">{agent?.agentCode}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p className="font-medium text-foreground">{agent?.email}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mobile:</span>
                          <p className="font-medium text-foreground">{agent?.mobileNumber}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Submitted:</span>
                          <p className="font-medium text-foreground">{new Date(agent?.createdAt)?.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setSelectedAgent(agent)}>
                      <Icon name="UserCheck" size={14} className="mr-1" />
                      Verify Agent
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Icon name="UserCheck" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending agent verifications</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            {initialLoading ? (
              <div className="text-center py-12">
                <Icon name="Loader" size={32} className="animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-4">Loading applications...</p>
              </div>
            ) : pendingApplicationGroups?.length > 0 ? (
              <div className="space-y-4">
                {pendingApplicationGroups.map((group) => (
                  <button
                    key={group.applicationId}
                    type="button"
                    onClick={() => openWorkspaceByApplicationId(group.applicationId)}
                    className="w-full text-left bg-card border border-border rounded-lg p-4 md:p-6 hover:border-primary/40 hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-foreground">
                            {group.applicationNumber || group.applicationId?.slice(0, 8)}
                          </h3>
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                            {group.documents.length} document{group.documents.length === 1 ? '' : 's'} pending
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Customer:</span>
                            <p className="font-medium text-foreground">{group.customerName}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <p className="font-medium text-foreground capitalize">Pending review</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last upload:</span>
                            <p className="font-medium text-foreground">
                              {group.latestUpload
                                ? new Date(group.latestUpload).toLocaleDateString('en-IN')
                                : '—'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {group.documents.slice(0, 4).map((doc) => (
                            <span
                              key={doc.id}
                              className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                            >
                              {doc.documentType || doc.documentName || 'Document'}
                            </span>
                          ))}
                          {group.documents.length > 4 && (
                            <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                              +{group.documents.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openWorkspaceByApplicationId(group.applicationId);
                          }}
                        >
                          <Icon name="ClipboardCheck" size={14} className="mr-1" />
                          Review application
                        </Button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Icon name="FolderOpen" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No applications pending verification</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <ActivityLog activities={activityLog} />
        )}

        {activeTab === 'training' && (
          <TrainingResources
            resources={trainingResources}
            onStartResource={handleLearningStart}
            onOpenResource={handleLearningOpen}
          />
        )}

        {activeTab === 'agent-referral' && (
          <ReferralSharePanel
            variant="agent"
            referralCode="RFINCARE-AGENT"
            shareLinks={{
              homepage: `${window.location.origin}/?agent=RFINCARE-AGENT`,
              insurance: `${window.location.origin}/insurance-marketplace?agent=RFINCARE-AGENT`,
              mutualFunds: `${window.location.origin}/mutual-fund-marketplace?agent=RFINCARE-AGENT`,
              calculators: `${window.location.origin}/resources/calculators?agent=RFINCARE-AGENT`,
            }}
          />
        )}

        {activeTab === 'customer-referral' && (
          <ReferralSharePanel
            variant="customer"
            referralCode="RFINCARE-CUSTOMER"
            shareLinks={{
              homepage: `${window.location.origin}/?ref=RFINCARE-CUSTOMER`,
              insurance: `${window.location.origin}/eligibility-assessment?ref=RFINCARE-CUSTOMER`,
              mutualFunds: `${window.location.origin}/mutual-fund-marketplace?ref=RFINCARE-CUSTOMER`,
              calculators: `${window.location.origin}/resources/calculators?ref=RFINCARE-CUSTOMER`,
            }}
          />
        )}

        {activeTab === 'support' && <CustomerSupportPanel />}

        {activeTab === 'settings' && <EmployeeSettingsPanel />}

      {activeLearningResource && (
        <LearningResourceModal
          resource={activeLearningResource}
          portal="employee"
          onClose={() => setActiveLearningResource(null)}
        />
      )}

      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onApprove={handleVerifyDocument}
          onReject={handleRequestReupload}
        />
      )}

      {selectedAgent && (
        <AgentVerificationModal
          agent={selectedAgent}
          isOpen={!!selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onApprove={handleApproveAgent}
          onReject={handleRejectAgent}
        />
      )}

      {workspaceApplication && (
        <ApplicationWorkspaceModal
          application={workspaceApplication}
          isOpen={!!workspaceApplication}
          onClose={() => setWorkspaceApplication(null)}
          onRefresh={loadDashboardData}
          onMessageAgent={() => openCommunication(workspaceApplication)}
        />
      )}

      <StaffCommunicationPanel
        isOpen={communicationOpen}
        onClose={() => {
          setCommunicationOpen(false);
          refreshUnreadMessages();
        }}
        applicationId={communicationContext.applicationId}
        clientLabel={communicationContext.clientLabel}
        variant="employee"
        initialMode="help"
      />
    </PortalShell>
  );
};

export default EmployeePortal;