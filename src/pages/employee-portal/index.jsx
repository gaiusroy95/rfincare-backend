import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

import Input from '../../components/ui/Input';

import DocumentViewer from './components/DocumentViewer';
import PerformanceMetrics from './components/PerformanceMetrics';
import ActivityLog from './components/ActivityLog';
import TrainingResources from './components/TrainingResources';
import AgentVerificationModal from './components/AgentVerificationModal';
import ApplicationWorkspaceModal from './components/ApplicationWorkspaceModal';
import { employeeService } from '../../services/employeeService';
import {
  employeeLearningService,
  resolveLearningOpenUrl,
} from '../../services/employeeLearningService';
import SessionTimeout from '../../components/SessionTimeout';
import { useAuth } from '../../contexts/AuthContext';
import { usePortalPolling } from '../../hooks/usePortalPolling';
import StaffCommunicationPanel from '../agent-dashboard/components/StaffCommunicationPanel';
import { staffMessagingService } from '../../services/staffMessagingService';


const EmployeePortal = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [workspaceApplication, setWorkspaceApplication] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('applications');
  const [loading, setLoading] = useState(false);
  
  // Real data from Supabase
  const [pendingAgents, setPendingAgents] = useState([]);
  const [assignedApplications, setAssignedApplications] = useState([]);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activityLog, setActivityLog] = useState([]);

  const [trainingResources, setTrainingResources] = useState([]);
  const [communicationOpen, setCommunicationOpen] = useState(false);
  const [communicationContext, setCommunicationContext] = useState({
    applicationId: null,
    clientLabel: '',
  });
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: dashboard } = await employeeService.getEmployeeDashboard();
      setDashboardStats(dashboard?.stats || dashboard);

      // Load pending agents
      const { data: agents } = await employeeService?.getPendingAgentOnboarding();
      setPendingAgents(agents || []);

      // Load assigned applications
      const { data: applications } = await employeeService?.getAssignedApplications();
      const appList = applications || [];
      setAssignedApplications(appList);
      const appById = Object.fromEntries(appList.map((a) => [a.id, a]));

      // Load pending documents
      const { data: documents } = await employeeService?.getPendingDocuments();
      setPendingDocuments(
        (documents || []).map((doc) => ({
          ...doc,
          applicationNumber:
            doc.applicationNumber ||
            appById[doc.applicationId]?.applicationNumber,
        })),
      );

      // Load activity log
      const { data: activities } = await employeeService?.getEmployeeActivityLog();
      setActivityLog(activities || []);

      const learning = dashboard?.learningResources?.length
        ? dashboard.learningResources
        : await employeeLearningService.listForEmployee();
      setTrainingResources(
        (Array.isArray(learning) ? learning : []).map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category || item.categoryLabel || 'Document Verification',
          duration: item.duration || item.durationLabel || '—',
          completions: item.completions ?? '0',
          isNew: item.isNew,
          progress: item.progress ?? 0,
          openUrl: resolveLearningOpenUrl(item),
        })),
      );
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  usePortalPolling(loadDashboardData, 20000, !loading);

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

  const handleApproveAgent = async (agentUserId, notes) => {
    const { error } = await employeeService?.approveAgentOnboarding(agentUserId, notes);
    if (!error) {
      setSelectedAgent(null);
      loadDashboardData();
    }
  };

  const handleRejectAgent = async (agentUserId, reason) => {
    const { error } = await employeeService?.rejectAgentOnboarding(agentUserId, reason);
    if (!error) {
      setSelectedAgent(null);
      loadDashboardData();
    }
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
    const url = resource.openUrl;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
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
    await handleLearningOpen(resource);
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

  const tabs = [
  { id: 'applications', label: 'Applications', icon: 'FileText', count: assignedApplications?.length },
  { id: 'agents', label: 'Agent Verification', icon: 'UserCheck', count: pendingAgents?.length },
  { id: 'documents', label: 'Pending documents', icon: 'FolderOpen', count: pendingDocuments?.length },
  { id: 'activity', label: 'Activity Log', icon: 'Activity' },
  { id: 'training', label: 'Training', icon: 'GraduationCap' }];


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <SessionTimeout timeoutMinutes={30} warningMinutes={2} />
      
      {/* Header */}
      <Header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-employee-primary to-employee-secondary rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="Briefcase" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-employee-primary to-employee-secondary bg-clip-text text-transparent">
                Employee Portal
              </h1>
              <p className="text-sm text-gray-600">Document verification and application processing</p>
            </div>
          </div>
          <Button
            onClick={async () => {
              await signOut();
              navigate('/employee-login');
            }}
            variant="outline"
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <Icon name="LogOut" className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </Header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Employee Portal
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage verifications, applications, and customer support tasks
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                iconName="MessageSquare"
                onClick={() => openCommunication({})}
              >
                Agent messages
                {unreadMessageCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-destructive text-destructive-foreground rounded-full text-xs font-semibold">
                    {unreadMessageCount}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                iconName="User"
                onClick={() => navigate('/employee/settings')}
              >
                Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/document-management-center')}
              >
                <Icon name="FolderOpen" size={16} className="mr-2" />
                All documents
              </Button>
              <Button
                variant="default"
                onClick={() => loadDashboardData()}>
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {dashboardStats && (
            <PerformanceMetrics metrics={{
              tasksCompletedToday: dashboardStats?.completedToday ?? 0,
              pendingTasks:
                (Number(dashboardStats?.pendingReview) || 0) +
                (Number(dashboardStats?.pendingDocuments) || 0),
              avgProcessingTime: '18 min',
              qualityScore: 96,
            }} />
          )}
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-border">
            {tabs?.map((tab) =>
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab?.id
                ? 'border-primary text-primary font-semibold' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}>

                <Icon name={tab?.icon} size={18} />
                <span className="text-sm md:text-base">{tab?.label}</span>
                {tab?.count !== undefined && (
                  <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-semibold">
                    {tab?.count}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {activeTab === 'applications' && (
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

            {loading ? (
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
                          <h3 className="text-lg font-semibold text-foreground">{app?.customer?.fullName}</h3>
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

        {activeTab === 'agents' && (
          <div className="space-y-4">
            {loading ? (
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
            {loading ? (
              <div className="text-center py-12">
                <Icon name="Loader" size={32} className="animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-4">Loading documents...</p>
              </div>
            ) : pendingDocuments?.length > 0 ? (
              <div className="space-y-4">
                {pendingDocuments?.map((doc) => (
                  <div key={doc?.id} className="bg-card border border-border rounded-lg p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-foreground">
                            {doc?.documentName || doc?.title || 'Document'}
                          </h3>
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                            {doc?.documentType || doc?.type}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Application:</span>
                            <p className="font-medium text-foreground">
                              {doc?.applicationNumber || doc?.applicationId?.slice(0, 8) || '—'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <p className="font-medium text-foreground">{doc?.status}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Uploaded:</span>
                            <p className="font-medium text-foreground">
                              {doc?.uploadedAt || doc?.createdAt
                                ? new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString('en-IN')
                                : '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {doc?.applicationId && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openWorkspaceByApplicationId(doc.applicationId)}
                          >
                            <Icon name="ClipboardCheck" size={14} className="mr-1" />
                            Process application
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Icon name="FolderOpen" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No documents pending</p>
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
      </main>

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
      />
    </div>
  );
};

export default EmployeePortal;