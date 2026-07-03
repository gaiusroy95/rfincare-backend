import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/ui/Header';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <SessionTimeout timeoutMinutes={30} warningMinutes={2} />
      
      {/* Header */}
      <Header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-agent-primary to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="Users" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-agent-primary to-pink-600 bg-clip-text text-transparent">
                Agent Dashboard
              </h1>
              <p className="text-sm text-gray-600">Manage clients and track performance</p>
            </div>
          </div>
          <Button
            onClick={async () => {
              await signOut();
              navigate('/agent-login', { replace: true });
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate('/agent/settings')}
                className="rounded-full border-4 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
                title="Profile settings"
              >
                <img
                  src={agentProfile?.avatar}
                  alt={agentProfile?.avatarAlt}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
                />
              </button>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Welcome back, {agentProfile?.name}
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm text-muted-foreground">{agentProfile?.agentId}</span>
                  <span className="text-sm px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold">
                    {agentProfile?.tier}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={14} color="var(--color-warning)" />
                    <span className="text-sm font-semibold text-foreground">{agentProfile?.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="LifeBuoy"
                onClick={() => openCommunication({}, 'help')}
              >
                Get Help
              </Button>
              <Button variant="outline" size="sm" iconName="Bell">
                Notifications
              </Button>
              <Button
                variant="default"
                size="sm"
                iconName="Settings"
                onClick={() => navigate('/agent/settings')}
              >
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
            <button
              onClick={() => setSelectedView('overview')}
              className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
              selectedView === 'overview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`
              }>

              <div className="flex items-center justify-center space-x-2">
                <Icon name="LayoutDashboard" size={16} />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedView('clients')}
              className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
              selectedView === 'clients' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`
              }>

              <div className="flex items-center justify-center space-x-2">
                <Icon name="Users" size={16} />
                <span>Clients</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedView('performance')}
              className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
              selectedView === 'performance' ?
              'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`
              }>

              <div className="flex items-center justify-center space-x-2">
                <Icon name="TrendingUp" size={16} />
                <span>Performance</span>
              </div>
            </button>
          </div>
        </div>

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
      </main>

      <StaffCommunicationPanel
        isOpen={communicationOpen}
        onClose={() => setCommunicationOpen(false)}
        applicationId={communicationContext.applicationId}
        clientLabel={communicationContext.clientLabel}
        variant="agent"
        initialMode={communicationContext.mode}
      />
    </div>
  );

};

export default AgentDashboard;