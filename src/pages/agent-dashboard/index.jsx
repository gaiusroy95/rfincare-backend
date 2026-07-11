import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import PortalShell from '../../components/layout/PortalShell';
import DashboardKpiCard from '../../components/dashboard/DashboardKpiCard';
import {
  AGENT_NAV_ITEMS,
  resolveAgentNavFromSearch,
  getAgentSearchParamsForNavId,
} from '../../constants/portalNavigation';
import CustomerSupportPanel from '../customer-dashboard/components/CustomerSupportPanel';
import AgentSettingsPanel from './components/AgentSettingsPanel';
import AgentProductsPanel from './components/AgentProductsPanel';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import AgentDashboardOverview from './components/AgentDashboardOverview';
import PerformanceMetrics from './components/PerformanceMetrics';
import ClientKanbanBoard from './components/ClientKanbanBoard';
import AgentLeadSubmissionPanel from './components/AgentLeadSubmissionPanel';
import AgentApplicationsPanel from './components/AgentApplicationsPanel';
import CommissionTracker from './components/CommissionTracker';
import CommissionReportPanel from './components/CommissionReportPanel';
import { usePortalPolling } from '../../hooks/usePortalPolling';
import PerformanceChart from './components/PerformanceChart';
import StaffCommunicationPanel from './components/StaffCommunicationPanel';
import TrainingResources from './components/TrainingResources';
import ReferralSharePanel from '../../components/referral/ReferralSharePanel';
import SessionTimeout from '../../components/SessionTimeout';
import { agentService } from '../../services/agentService';
import {
  agentLearningService,
  resolveLearningOpenUrl,
  openLearningResource,
} from '../../services/agentLearningService';
import { resolveAvatarUrl } from '../../services/agentProfileService';
import { useAuth } from '../../contexts/AuthContext';
import { setStoredAgentCode } from '../../utils/agentAttribution';

const CLIENT_SECTION_META = {
  leads: { title: 'Leads', subtitle: 'New prospects in your pipeline.' },
  applications: { title: 'Applications', subtitle: 'Your submitted and in-progress loan applications.' },
  customers: { title: 'My Customers', subtitle: 'All clients you are working with.' },
};

const PERFORMANCE_SECTION_META = {
  earnings: { title: 'My Earnings', subtitle: 'Commission earned and payout history.' },
  payouts: { title: 'Payouts', subtitle: 'Pending and upcoming commission payouts.' },
  reports: { title: 'Reports', subtitle: 'Performance analytics and commission reports.' },
};

const VIEW_HEADINGS = {
  learning: { title: 'Trainings & Materials', subtitle: 'Courses, guides, and marketing resources.' },
  products: { title: 'Products', subtitle: 'Browse financial products to offer your clients.' },
  support: { title: 'Support Center', subtitle: 'Get help from our team — we are here for you.' },
  settings: { title: 'Profile Settings', subtitle: 'Manage your photo, login, and payout account.' },
  refer: { title: 'Refer & Earn', subtitle: 'Invite partners and grow your income.' },
};

function filterClientsBySection(clients, section) {
  if (section === 'leads') return clients.filter((c) => c.status === 'new');
  if (section === 'applications') {
    return clients.filter((c) => ['in-progress', 'documents', 'submitted'].includes(c.status));
  }
  return clients;
}

function mergePipelineItems(applications, pipelineLeads) {
  const apps = Array.isArray(applications) ? applications : [];
  const leads = Array.isArray(pipelineLeads) ? pipelineLeads : [];
  const appIds = new Set(apps.map((item) => item.id));
  const leadOnly = leads.filter((lead) => !lead.applicationId || !appIds.has(lead.applicationId));
  return [...leadOnly, ...apps];
}

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userProfile, signOut } = useAuth();
  const navState = resolveAgentNavFromSearch(searchParams);
  const selectedView = navState.view;
  const selectedSection = navState.section;
  const activeNavId = navState.navId;
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [communicationOpen, setCommunicationOpen] = useState(false);
  const [communicationContext, setCommunicationContext] = useState({
    applicationId: null,
    clientLabel: '',
    mode: 'help',
  });

  const loadDashboard = useCallback(async ({ background = false } = {}) => {
    if (!background) setLoading(true);
    try {
      const data = await agentService.getDashboard();
      setDashboard(data);
    } catch (err) {
      if (!background) {
        console.error('Agent dashboard load failed:', err);
      }
      setDashboard((prev) =>
        prev || {
          profile: { name: userProfile?.full_name || 'Agent', tier: 'Agent' },
          metrics: [
            { id: 1, type: 'customers', label: 'Active Clients', value: '0', subtitle: 'Could not load data' },
          ],
          clients: [],
          performanceAnalytics: { week: [], month: [], quarter: [], year: [] },
        },
      );
    } finally {
      if (!background) setLoading(false);
    }
  }, [userProfile?.full_name]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  usePortalPolling(() => loadDashboard({ background: true }), 20000, true);

  useEffect(() => {
    if (dashboard?.attribution?.agentCode) {
      setStoredAgentCode(dashboard.attribution.agentCode);
    }
  }, [dashboard?.attribution?.agentCode]);

  const agentProfile = {
    name: dashboard?.profile?.name || userProfile?.full_name || 'Agent',
    agentId: dashboard?.profile?.agentId || '—',
    avatar:
      resolveAvatarUrl(dashboard?.profile?.avatarUrl) ||
      'https://img.rocket.new/generatedImages/rocket_gen_img_14da91c34-1763294780479.png',
    avatarAlt: `Profile of ${dashboard?.profile?.name || 'agent'}`,
    joinDate: '—',
    tier: dashboard?.profile?.tier || 'Agent',
    rating: 4.5,
    totalClients: dashboard?.profile?.totalClients ?? 0,
    activeClients: dashboard?.profile?.activeClients ?? 0,
  };

  const performanceMetrics = dashboard?.metrics?.length
    ? dashboard.metrics
    : [
        { id: 1, type: 'customers', label: 'Active Clients', value: '0', subtitle: 'Loading…' },
      ];

  const clients = (dashboard?.clients || []).map((c) => ({
    ...c,
    avatar: c.avatar || agentProfile.avatar,
    avatarAlt: c.avatarAlt || c.name,
  }));

  const agentApplications = dashboard?.applications || clients;
  const pipelineItems = mergePipelineItems(clients, dashboard?.pipelineLeads || []);

  const commissions = (dashboard?.commissionEntries || []).map((entry) => ({
    id: entry.id,
    clientName: entry.clientName,
    loanType: entry.loanType,
    amount: entry.amount || 0,
    status: entry.status || 'pending',
    date: entry.date
      ? new Date(entry.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
      : '—',
  }));

  const performanceAnalytics = dashboard?.performanceAnalytics || null;
  const chartData =
    performanceAnalytics?.month || dashboard?.weeklyPerformance || [];

  const openCommunication = (item, mode = 'help') => {
    setCommunicationContext({
      applicationId: item?.applicationId || item?.id || null,
      clientLabel: item?.clientName || item?.name || '',
      mode,
    });
    setCommunicationOpen(true);
  };


  const mapLearningResource = (item) => ({
    id: item.id,
    type: item.type || item.contentType,
    title: item.title,
    description: item.description,
    duration: item.duration || item.durationLabel || '—',
    progress: item.progress ?? 0,
    isNew: Boolean(item.isNew ?? item.is_new),
    openUrl: resolveLearningOpenUrl(item),
    legacy: item.legacy,
  });

  const trainingResources = (dashboard?.learningResources || []).map(mapLearningResource);

  const handleLearningOpen = async (resource) => {
    try {
      await openLearningResource(resource);
    } catch (err) {
      console.error('Failed to open learning resource:', err);
    }
    if (!resource.legacy && resource.id) {
      const nextProgress = resource.progress > 0 ? Math.min(100, resource.progress + 25) : 50;
      try {
        await agentLearningService.updateProgress(resource.id, nextProgress);
        setDashboard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            learningResources: (prev.learningResources || []).map((r) =>
              r.id === resource.id ? { ...r, progress: nextProgress } : r,
            ),
          };
        });
      } catch {
        /* ignore */
      }
    }
  };

  const handleLearningStart = async (resource) => {
    await handleLearningOpen(resource);
    if (!resource.legacy && resource.id && (resource.progress || 0) < 100) {
      try {
        await agentLearningService.updateProgress(resource.id, 100);
        setDashboard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            learningResources: (prev.learningResources || []).map((r) =>
              r.id === resource.id ? { ...r, progress: 100 } : r,
            ),
          };
        });
      } catch {
        /* ignore */
      }
    }
  };


  const handleClientClick = (client) => {
    if (client?.kind === 'lead' && !client?.applicationId) {
      handleStartApplication(client);
      return;
    }
    const loanSlug = String(client?.loanType || 'personal')
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/_loan$/, '');
    navigate(`/agent/customer-application?loanType=${encodeURIComponent(loanSlug)}`, {
      state: {
        leadMeta: {
          leadId: client?.leadId,
          fullName: client?.name,
          email: client?.email,
          phone: client?.phone,
          applicationId: client?.id,
        },
        resumeApplicationId: client?.id,
      },
    });
  };

  const handleStartApplication = (client) => {
    const loanSlug = String(client?.loanType || 'personal')
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/_loan$/, '');
    navigate(`/agent/customer-application?loanType=${encodeURIComponent(loanSlug)}`, {
      state: {
        leadMeta: {
          leadId: client?.leadId || client?.id,
          fullName: client?.name,
          email: client?.email,
          phone: client?.phone,
        },
      },
    });
  };

  const handleStatusChange = async (clientId, newStatus) => {
    const item = pipelineItems.find((c) => c.id === clientId);
    if (item?.kind === 'lead') return;
    try {
      await agentService.updateClientStatus(clientId, newStatus);
      await loadDashboard();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'add-client':
      case 'add-lead':
        navigate('/agent/customer-application');
        break;
      case 'view-leads':
        handleNavSelect({ id: 'leads' });
        break;
      case 'track-application':
        handleNavSelect({ id: 'applications' });
        break;
      case 'marketing-tools':
        handleNavSelect({ id: 'marketing' });
        break;
      case 'training':
        handleNavSelect({ id: 'training' });
        break;
      case 'upload-document':
        openCommunication({}, 'upload');
        break;
      case 'message-employee':
        openCommunication({}, 'help');
        break;
      case 'schedule-meeting':
        setSearchParams({});
        setTimeout(() => {
          const appointmentsSection = document.querySelector('[data-section="appointments"]');
          appointmentsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        break;
      case 'view-commission':
        handleNavSelect({ id: 'earnings' });
        break;
      default:
        break;
    }
  };

  const leadCount = pipelineItems.filter((c) => c.status === 'new').length;

  const handleNavSelect = (item) => {
    const navItem = typeof item === 'string'
      ? AGENT_NAV_ITEMS.find((i) => i.id === item)
      : (AGENT_NAV_ITEMS.find((i) => i.id === item?.id) || item);
    if (navItem?.path) {
      navigate(navItem.path);
      return;
    }
    const params = getAgentSearchParamsForNavId(navItem?.id || item?.id || item);
    if (Object.keys(params).length === 0) {
      setSearchParams({});
    } else {
      setSearchParams(params);
    }
  };

  const sectionMeta =
    selectedView === 'clients'
      ? CLIENT_SECTION_META[selectedSection] || CLIENT_SECTION_META.leads
      : selectedView === 'performance'
        ? PERFORMANCE_SECTION_META[selectedSection] || PERFORMANCE_SECTION_META.earnings
        : VIEW_HEADINGS[selectedView];

  const filteredClients = filterClientsBySection(pipelineItems, selectedSection || 'leads');

  const handleLeadRowClick = (lead) => {
    const client = pipelineItems.find((c) => c.id === lead.id);
    if (client) handleClientClick(client);
    else handleNavSelect({ id: 'leads' });
  };

  const handleDownloadReport = () => {
    handleNavSelect({ id: 'reports' });
  };

  return (
    <PortalShell
      portalLabel="Agent Dashboard"
      searchPlaceholder="Search products, leads, customers..."
      showSiteHeader
      navItems={AGENT_NAV_ITEMS.map((item) => ({
        ...item,
        badge: item.badgeKey === 'leads' ? leadCount : 0,
      }))}
      activeId={activeNavId}
      onNavSelect={handleNavSelect}
      userName={agentProfile?.name}
      userRole="Agent"
      userId={`Agent ID: ${agentProfile?.agentId}`}
      avatarUrl={agentProfile?.avatar}
      notificationCount={5}
      onLogout={async () => {
        await signOut();
        navigate('/agent-login', { replace: true });
      }}
      promoCard={(
        <div>
          <p className="text-sm font-bold text-foreground mb-1">Earn More</p>
          <p className="text-xs text-muted-foreground mb-3">Refer partners and grow your income</p>
          <Button className="rf-btn-primary w-full" size="sm" onClick={() => handleNavSelect({ id: 'refer' })}>
            Refer Now
          </Button>
        </div>
      )}
      headerActions={(
        <Button
          className="rf-btn-primary"
          size="sm"
          iconName="Download"
          title="Download Report"
          onClick={handleDownloadReport}
        >
          Download Report
        </Button>
      )}
    >
      <SessionTimeout timeoutMinutes={30} warningMinutes={2} />

        {selectedView !== 'overview' && sectionMeta ? (
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{sectionMeta.title}</h1>
            <p className="text-sm text-muted-foreground">{sectionMeta.subtitle}</p>
          </div>
        ) : null}

        {selectedView === 'overview' ? (
          <AgentDashboardOverview
            agentName={agentProfile?.name}
            overview={dashboard?.overview}
            dashboard={dashboard}
            loading={loading}
            onDownloadReport={handleDownloadReport}
            onNavSelect={handleNavSelect}
            onQuickAction={handleQuickAction}
            onLeadClick={handleLeadRowClick}
          />
        ) : null}

        {selectedView === 'clients' && (
          <div className="space-y-6">
            {selectedSection === 'leads' && (
              <AgentLeadSubmissionPanel
                agentCode={dashboard?.attribution?.agentCode}
                onLeadCreated={() => loadDashboard({ background: true })}
              />
            )}
            {selectedSection === 'applications' ? (
              <>
                <AgentLeadSubmissionPanel
                  agentCode={dashboard?.attribution?.agentCode}
                  onLeadCreated={() => loadDashboard({ background: true })}
                />
                <AgentApplicationsPanel
                  applications={agentApplications}
                  onOpenApplication={handleClientClick}
                  onMessage={(app) => openCommunication(app, 'help')}
                />
              </>
            ) : selectedSection === 'customers' ? (
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                {pipelineItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-6 text-center">No customers yet.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {pipelineItems.map((client) => (
                      <div key={client.id} className="p-4 md:p-5 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-foreground">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.loanType || 'Loan application'}</p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                          {client.status?.replace('-', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : selectedSection === 'leads' ? (
              <ClientKanbanBoard
                clients={filteredClients}
                onClientClick={handleClientClick}
                onStatusChange={handleStatusChange}
                onStartApplication={handleStartApplication}
              />
            ) : null}
          </div>
        )}

        {selectedView === 'performance' && (
          <div className="space-y-6">
            {selectedSection === 'earnings' && (
              <>
                <PerformanceMetrics metrics={performanceMetrics} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div data-section="commission">
                    <CommissionTracker commissions={commissions} />
                  </div>
                  <CommissionReportPanel />
                </div>
              </>
            )}
            {selectedSection === 'payouts' && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  <DashboardKpiCard
                    title="Pending Payout"
                    value={`₹${(dashboard?.pendingPayout || 0).toLocaleString('en-IN')}`}
                    subtitle="Next payout: 25 May"
                    icon="Wallet"
                    iconBg="bg-sky-50"
                    iconColor="text-sky-600"
                  />
                  <DashboardKpiCard
                    title="Total Earnings"
                    value={`₹${(dashboard?.totalEarnings || 0).toLocaleString('en-IN')}`}
                    icon="IndianRupee"
                    iconBg="bg-orange-50"
                    iconColor="text-orange-600"
                  />
                </div>
                <CommissionTracker commissions={commissions} />
              </>
            )}
            {selectedSection === 'reports' && (
              <>
                <PerformanceChart performanceAnalytics={performanceAnalytics} fallbackData={chartData} />
                <CommissionReportPanel />
              </>
            )}
            {!selectedSection && (
              <>
                <PerformanceMetrics metrics={performanceMetrics} />
                <PerformanceChart performanceAnalytics={performanceAnalytics} fallbackData={chartData} />
                <CommissionTracker commissions={commissions} />
              </>
            )}
          </div>
        )}

        {selectedView === 'learning' && (
          <div className="space-y-6">
            {selectedSection === 'marketing' && (
              <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">Marketing Toolkit</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Download brochures, social media creatives, and co-branded materials for your campaigns.
                </p>
              </div>
            )}
            <TrainingResources
              resources={trainingResources}
              onOpenResource={handleLearningOpen}
              onStartResource={handleLearningStart}
            />
          </div>
        )}

        {selectedView === 'products' && <AgentProductsPanel />}

        {selectedView === 'support' && <CustomerSupportPanel />}

        {selectedView === 'settings' && <AgentSettingsPanel />}

        {selectedView === 'refer' && (
          <div className="space-y-6">
            <ReferralSharePanel
              variant="agent"
              referralCode={dashboard?.attribution?.agentCode || agentProfile?.agentId}
              shareLinks={dashboard?.attribution?.shareLinks}
              stats={{
                attributedCount: dashboard?.attribution?.attributedLeads || 0,
                attributedLabel: 'attributed leads',
              }}
            />
          </div>
        )}

      <StaffCommunicationPanel
        isOpen={communicationOpen}
        onClose={() => setCommunicationOpen(false)}
        applicationId={communicationContext.applicationId}
        clientLabel={communicationContext.clientLabel}
        variant="agent"
        initialMode={communicationContext.mode}
      />
    </PortalShell>
  );

};

export default AgentDashboard;