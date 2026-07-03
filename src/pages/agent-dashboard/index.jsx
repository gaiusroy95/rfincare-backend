import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import PortalShell from '../../components/layout/PortalShell';
import DashboardKpiCard from '../../components/dashboard/DashboardKpiCard';
import { AGENT_NAV_ITEMS } from '../../constants/portalNavigation';
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

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const [selectedView, setSelectedView] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [communicationOpen, setCommunicationOpen] = useState(false);
  const [communicationContext, setCommunicationContext] = useState({
    applicationId: null,
    clientLabel: '',
    mode: 'help',
  });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await agentService.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Agent dashboard load failed:', err);
      setDashboard({
        profile: { name: userProfile?.full_name || 'Agent', tier: 'Agent' },
        metrics: [
          { id: 1, type: 'customers', label: 'Active Clients', value: '0', subtitle: 'Could not load data' },
        ],
        clients: [],
        performanceAnalytics: { week: [], month: [], quarter: [], year: [] },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  usePortalPolling(loadDashboard, 20000, !loading);

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
        // Scroll to appointments section or open scheduling modal
        setSelectedView('overview');
        setTimeout(() => {
          const appointmentsSection = document.querySelector('[data-section="appointments"]');
          appointmentsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        break;
      case 'view-commission':
        // Switch to performance view to show commission tracker
        setSelectedView('performance');
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
    if (item.path) {
      navigate(item.path);
      return;
    }
    if (item.view) setSelectedView(item.view);
  };

  const sidebarActiveId = AGENT_NAV_ITEMS.find((n) => n.view === selectedView)?.id || 'overview';

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
      activeId={sidebarActiveId}
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
          <Button className="rf-btn-primary w-full" size="sm" onClick={() => navigate('/share-your-story')}>
            Refer Now
          </Button>
        </div>
      )}
      headerActions={(
        <Button className="rf-btn-primary" size="sm" iconName="Download" onClick={() => handleQuickAction('view-commission')}>
          Download Report
        </Button>
      )}
    >
      <SessionTimeout timeoutMinutes={30} warningMinutes={2} />

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            Welcome back, {agentProfile?.name?.split(' ')?.[0]}! 👋
          </h1>
          <p className="text-sm text-muted-foreground">Here&apos;s your business overview for today.</p>
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
              onViewAll={() => navigate('/agent/learning')}
              onOpenResource={handleLearningOpen}
              onStartResource={handleLearningStart}
            />
          </div>
        }

        {selectedView === 'clients' &&
        <div className="space-y-6">
            <ClientKanbanBoard
            clients={clients}
            onClientClick={handleClientClick}
            onStatusChange={handleStatusChange} />

          </div>
        }

        {selectedView === 'performance' &&
        <div className="space-y-6">
            <PerformanceMetrics metrics={performanceMetrics} />
            <PerformanceChart performanceAnalytics={performanceAnalytics} fallbackData={chartData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div data-section="commission">
                <CommissionTracker commissions={commissions} />
              </div>
              <TrainingResources
                resources={trainingResources}
                onViewAll={() => navigate('/agent/learning')}
                onOpenResource={handleLearningOpen}
                onStartResource={handleLearningStart}
              />
            </div>
          </div>
        }

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