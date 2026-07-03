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
import PerformanceMetrics from './components/PerformanceMetrics';
import ClientKanbanBoard from './components/ClientKanbanBoard';
import CommissionTracker from './components/CommissionTracker';
import CommissionReportPanel from './components/CommissionReportPanel';
import { usePortalPolling } from '../../hooks/usePortalPolling';
import PerformanceChart from './components/PerformanceChart';
import UpcomingAppointments from './components/UpcomingAppointments';
import StaffCommunicationPanel from './components/StaffCommunicationPanel';
import TrainingResources from './components/TrainingResources';
import CreditCardsQuickApply from '../../components/credit-cards/CreditCardsQuickApply';
import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';
import AgentReferralBanner from '../../components/agent/AgentReferralBanner';
import SessionTimeout from '../../components/SessionTimeout';
import { agentService } from '../../services/agentService';
import {
  agentLearningService,
  resolveLearningOpenUrl,
  openLearningResource,
} from '../../services/agentLearningService';
import { resolveAvatarUrl } from '../../services/agentProfileService';
import { resolveUploadUrl } from '../../utils/documentUrls';
import { useAuth } from '../../contexts/AuthContext';

const CLIENT_SECTION_META = {
  leads: { title: 'Leads', subtitle: 'New prospects in your pipeline.' },
  applications: { title: 'Applications', subtitle: 'Track in-progress loan applications.' },
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
  const circulars = dashboard?.circulars || [];


  const appointments = clients.length
    ? clients.slice(0, 6).map((c, idx) => ({
        id: c.id,
        applicationId: c.id,
        clientName: c.name,
        clientAvatar: c.avatar,
        clientAvatarAlt: c.avatarAlt || c.name,
        title: c.nextAction || 'Client follow-up',
        type: c.status === 'new' ? 'consultation' : c.status === 'documents' ? 'document-review' : 'follow-up',
        date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: '—',
        location: c.loanType || 'Loan application',
      }))
    : [];

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


  const recentActivities = (dashboard?.recentActivities || []).map((activity) => ({
    ...activity,
    timestamp: activity.timestamp ? new Date(activity.timestamp) : new Date(),
  }));


  const handleClientClick = (client) => {
    console.log('Client clicked:', client);
  };

  const handleStatusChange = async (clientId, newStatus) => {
    try {
      await agentService.updateClientStatus(clientId, newStatus);
      await loadDashboard();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleQuickAction = (actionId) => {
    console.log('Quick action:', actionId);
    
    switch(actionId) {
      case 'add-client':
        navigate('/agent/customer-application');
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
        setSearchParams({ view: 'performance', section: 'earnings' });
        setTimeout(() => {
          const commissionSection = document.querySelector('[data-section="commission"]');
          commissionSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        break;
      default:
        console.log('Unknown action:', actionId);
    }
  };

  const leadCount = clients.filter((c) => c.status === 'new').length;

  const handleNavSelect = (item) => {
    const params = getAgentSearchParamsForNavId(item.id);
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

  const filteredClients = filterClientsBySection(clients, selectedSection || 'leads');

  const agentKpis = [
    { title: 'Total Leads', value: String(dashboard?.metrics?.find((m) => m.type === 'leads')?.value || clients.length), change: '+18.4%', icon: 'UserPlus' },
    { title: 'Total Applications', value: String(dashboard?.metrics?.find((m) => m.type === 'applications')?.value || '—'), change: '+15.2%', icon: 'FileText', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
    { title: 'Approved Applications', value: String(dashboard?.metrics?.find((m) => m.type === 'approved')?.value || '—'), change: '+16.7%', icon: 'CheckCircle2' },
    { title: 'Total Earnings', value: `₹${(dashboard?.totalEarnings || 78450).toLocaleString('en-IN')}`, change: '+22.6%', icon: 'IndianRupee', iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
    { title: 'Pending Payout', value: `₹${(dashboard?.pendingPayout || 18750).toLocaleString('en-IN')}`, subtitle: 'Next payout: 25 May', icon: 'Wallet', iconBg: 'bg-sky-50', iconColor: 'text-sky-600' },
  ];

  return (
    <PortalShell
      portalLabel="Agent Dashboard"
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
          onClick={() => handleQuickAction('view-commission')}
        >
          Download Report
        </Button>
      )}
    >
      <SessionTimeout timeoutMinutes={30} warningMinutes={2} />

        <div className="mb-6 md:mb-8">
          {selectedView === 'overview' ? (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                Welcome back, {agentProfile?.name?.split(' ')?.[0]}! 👋
              </h1>
              <p className="text-sm text-muted-foreground">Here&apos;s your business overview for today.</p>
            </>
          ) : sectionMeta ? (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{sectionMeta.title}</h1>
              <p className="text-sm text-muted-foreground">{sectionMeta.subtitle}</p>
            </>
          ) : null}
        </div>

        {selectedView === 'overview' ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {agentKpis.map((kpi) => (
              <DashboardKpiCard key={kpi.title} {...kpi} />
            ))}
          </div>
        ) : null}

        {selectedView === 'overview' &&
        <div className="space-y-6">
            <AgentReferralBanner attribution={dashboard?.attribution} />

            <PerformanceMetrics metrics={performanceMetrics} />

            <CreditCardsQuickApply />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <QuickActions onActionClick={handleQuickAction} />
              </div>
              <div>
                <CommissionTracker commissions={commissions} />
                <CommissionReportPanel />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div data-section="appointments">
                <UpcomingAppointments appointments={appointments} onMessage={openCommunication} />
              </div>
              <RecentActivity activities={recentActivities} />
            </div>

            <div className="bg-card rounded-lg border border-border p-4 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-foreground">Commission Circulars</h2>
                <Icon name="FileText" size={18} className="text-primary" />
              </div>
              {circulars.length === 0 ? (
                <p className="text-sm text-muted-foreground">No circular uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {circulars.map((c) => (
                    <a
                      key={c.id}
                      href={resolveUploadUrl(c.file_url || c.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-primary hover:underline"
                    >
                      {c.title}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <TrainingResources
              resources={trainingResources}
              onViewAll={() => handleNavSelect({ id: 'training' })}
              onOpenResource={handleLearningOpen}
              onStartResource={handleLearningStart}
            />
          </div>
        }

        {selectedView === 'clients' && (
          <div className="space-y-6">
            {selectedSection === 'customers' ? (
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                {filteredClients.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-6 text-center">No customers yet.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredClients.map((client) => (
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
            ) : (
              <ClientKanbanBoard
                clients={filteredClients}
                onClientClick={handleClientClick}
                onStatusChange={handleStatusChange}
              />
            )}
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
            <AgentReferralBanner attribution={dashboard?.attribution} />
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Share your referral link and earn commissions when partners join RFINCARE.
              </p>
              <Button className="rf-btn-primary" iconName="Share2" onClick={() => navigate('/share-your-story')}>
                Share Referral Link
              </Button>
            </div>
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