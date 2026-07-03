import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PortalShell from '../../components/layout/PortalShell';
import DashboardKpiCard from '../../components/dashboard/DashboardKpiCard';
import { CUSTOMER_NAV_ITEMS, CUSTOMER_TAB_IDS } from '../../constants/portalNavigation';
import ApplicationStatusCard from './components/ApplicationStatusCard';
import DocumentCard from './components/DocumentCard';
import NotificationCard from './components/NotificationCard';
import QuickActionCard from './components/QuickActionCard';
import ProfileSummaryCard from './components/ProfileSummaryCard';

import SupportCard from './components/SupportCard';
import CustomerProfilePanel from './components/CustomerProfilePanel';
import CustomerSupportPanel from './components/CustomerSupportPanel';
import CustomerSettingsPanel from './components/CustomerSettingsPanel';
import UnifiedFinancialOverview from './components/UnifiedFinancialOverview';
import FinancialHealthCard from './components/FinancialHealthCard';
import CreditScoreCard from './components/CreditScoreCard';
import NextBestActionBanner from './components/NextBestActionBanner';
import DocumentUploadModal from './components/DocumentUploadModal';
import ApplicationDetailModal from './components/ApplicationDetailModal';
import { useAuth } from '../../contexts/AuthContext';
import { customerJourneyService } from '../../services/customerJourneyService';
import { customerFinancialService } from '../../services/customerFinancialService';
import { bankService } from '../../services/apiServices';
import { milestone4Service } from '../../services/milestone4Service';
import CreditCardsQuickApply from '../../components/credit-cards/CreditCardsQuickApply';
import { openAssessmentOrEligibilityFirst } from '../../utils/eligibilityGate';
import { computeProfileCompletion } from '../../utils/profileCompletion';


const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, userProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [detailApplication, setDetailApplication] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  
  // State for real data
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [applyBanks, setApplyBanks] = useState([]);
  const [partnerBanks, setPartnerBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [financialSnapshot, setFinancialSnapshot] = useState(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [creditPulling, setCreditPulling] = useState(false);
  const [creditPullError, setCreditPullError] = useState('');

  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    if (!CUSTOMER_TAB_IDS.includes(tab)) {
      setSearchParams({});
      setActiveTab('overview');
      return;
    }
    if (tab !== activeTab) setActiveTab(tab);
  }, [searchParams]);

  const loadFinancialSnapshot = async () => {
    setSnapshotLoading(true);
    try {
      const data = await customerFinancialService.getFinancialSnapshot();
      setFinancialSnapshot(data);
    } catch {
      setFinancialSnapshot(null);
    } finally {
      setSnapshotLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && (activeTab === 'portfolio' || activeTab === 'overview')) {
      loadFinancialSnapshot();
    }
  }, [user?.id, activeTab]);

  const handlePullCreditScore = async () => {
    setCreditPulling(true);
    setCreditPullError('');
    try {
      const result = await customerFinancialService.pullCreditScore();
      if (result?.creditProfile) {
        setFinancialSnapshot((prev) => ({
          ...prev,
          creditProfile: {
            ...result.creditProfile,
            pullSandbox: result.pull?.sandboxMode,
          },
          summary: {
            ...prev?.summary,
            creditScore: result.creditProfile.score,
            creditScoreBand: result.creditProfile.band,
            creditScoreSource: result.creditProfile.source,
          },
        }));
      } else {
        await loadFinancialSnapshot();
      }
    } catch (err) {
      setCreditPullError(
        err?.response?.data?.error || err?.message || 'Could not pull credit score',
      );
    } finally {
      setCreditPulling(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return undefined;

    loadDashboardData();

    const docChannel = customerJourneyService.subscribeToDocumentUpdates(user.id, (payload) => {
      if (payload?.eventType === 'REFRESH' && Array.isArray(payload.new)) {
        setDocuments(payload.new);
        return;
      }
      if (payload?.eventType === 'INSERT') {
        setDocuments((prev) => [payload.new, ...prev]);
      } else if (payload?.eventType === 'UPDATE') {
        setDocuments((prev) =>
          prev.map((doc) => (doc?.id === payload?.new?.id ? payload.new : doc)),
        );
      } else if (payload?.eventType === 'DELETE') {
        setDocuments((prev) => prev.filter((doc) => doc?.id !== payload?.old?.id));
      }
    });

    const notifChannel = customerJourneyService.subscribeToNotifications(user.id, (payload) => {
      if (payload?.eventType === 'REFRESH' && Array.isArray(payload.new)) {
        setNotifications(payload.new);
        return;
      }
      if (payload?.eventType === 'INSERT') {
        setNotifications((prev) => [payload.new, ...prev]);
      }
    });

    return () => {
      customerJourneyService.unsubscribe(docChannel);
      customerJourneyService.unsubscribe(notifChannel);
    };
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [{ data: appsData }, { data: docsData }, { data: notifsData }] = await Promise.all([
        customerJourneyService.getApplications(),
        customerJourneyService.getDocuments(user.id),
        customerJourneyService.getNotifications(),
      ]);

      setApplications(appsData || []);
      if (appsData?.length > 0) {
        setSelectedApplicationId(appsData[0].id);
      }
      setDocuments(docsData || []);
      setNotifications(notifsData || []);

      try {
        const banks = await bankService.getActiveBanks({ includeProducts: false });
        const list = Array.isArray(banks) ? banks : [];
        setPartnerBanks(list);
        setApplyBanks(list.filter((b) => b?.applyUrl));
      } catch {
        setApplyBanks([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (newDocument) => {
    setDocuments(prev => [newDocument, ...prev]);
  };

  const handleMarkNotificationRead = async (notificationId) => {
    await customerJourneyService?.markNotificationAsRead(notificationId);
    setNotifications(prev => prev?.map(n => n?.id === notificationId ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    await customerJourneyService.markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/customer-login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuDropdownOpen && !event?.target?.closest('.menu-dropdown-container')) {
        setIsMenuDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuDropdownOpen]);

  const handleViewDetails = (application) => {
    if (!application?.id) return;
    setSelectedApplicationId(application.id);
    setDetailApplication(application);
    setIsDetailModalOpen(true);
  };

  const handleDocumentDeleted = (documentId) => {
    setDocuments((prev) => prev.filter((d) => d.id !== documentId));
  };

  const profileData = {
    name: userProfile?.fullName || 'Customer',
    email: userProfile?.email || user?.email,
    phone: userProfile?.phone || '',
    location: '',
    avatar: userProfile?.avatarUrl || '',
    avatarAlt: `Profile picture of ${userProfile?.fullName || 'Customer'}`,
    completionPercentage: computeProfileCompletion(userProfile, financialSnapshot),
    activeApplications: applications?.filter(a => ['submitted', 'under_review', 'documents_pending']?.includes(a?.status))?.length || 0,
    documentsUploaded: documents?.filter(d => d?.status === 'verified')?.length || 0,
    creditScore: financialSnapshot?.summary?.creditScore
      ?? financialSnapshot?.creditProfile?.score
      ?? '—',
    memberSince: new Date(userProfile?.createdAt || Date.now())?.getFullYear()?.toString()
  };

  const unreadNotifications = notifications?.filter(n => !n?.isRead);
  const displayedNotifications = showAllNotifications ? notifications : notifications?.slice(0, 5);

  const primaryApp = applications?.[0];
  const documentOnlyMode =
    primaryApp?.journeyMode === 'document_only' ||
    primaryApp?.journey_mode === 'document_only' ||
    (primaryApp?.status === 'submitted' && primaryApp?.submittedAt);

  const navItems = CUSTOMER_NAV_ITEMS.map((item) => ({
    ...item,
    badge: item.badgeKey === 'notifications' ? unreadNotifications?.length || 0 : 0,
  }));

  const handleNavSelect = (item) => {
    if (item.tab) handleTabChange(item.tab);
    else if (item.path) navigate(item.path);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: tabId });
    }
  };

  const formatCurrency = (n) => {
    if (n == null || Number.isNaN(Number(n))) return '—';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader" size={48} className="animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const sidebarActiveId = navItems.find((n) => n.tab === activeTab)?.id || 'overview';

  const TAB_HEADINGS = {
    overview: null,
    applications: { title: 'My Applications', subtitle: 'Track and manage all your loan applications.' },
    portfolio: { title: 'My Investments', subtitle: 'Your unified financial portfolio and holdings.' },
    documents: { title: 'My Documents', subtitle: 'Upload and manage verification documents.' },
    notifications: { title: 'My Alerts', subtitle: 'Stay updated on your applications and account activity.' },
    profile: { title: 'My Profile', subtitle: 'Update your personal information and contact details.' },
    support: { title: 'Support Center', subtitle: 'Get help from our financial experts — we are here for you.' },
    settings: { title: 'Settings', subtitle: 'Manage your password, sessions, and account security.' },
  };

  const tabHeading = TAB_HEADINGS[activeTab];

  return (
    <PortalShell
      portalLabel="Customer Dashboard"
      navItems={navItems}
      activeId={sidebarActiveId}
      onNavSelect={handleNavSelect}
      userName={profileData?.name}
      userRole="Customer"
      userId={userProfile?.customerCode ? `Customer ID: ${userProfile.customerCode}` : ''}
      avatarUrl={profileData?.avatar}
      notificationCount={unreadNotifications?.length || 0}
      onLogout={handleLogout}
      promoCard={(
        <div>
          <p className="text-sm font-bold text-foreground mb-1">Refer &amp; Earn</p>
          <p className="text-xs text-muted-foreground mb-3">Invite friends and earn rewards</p>
          <Button className="rf-btn-primary w-full" size="sm" onClick={() => navigate('/share-your-story')}>
            Refer Now
          </Button>
        </div>
      )}
      headerActions={(
        <>
          <Button
            variant="outline"
            size="sm"
            className="rf-portal-action-hide-md"
            title="Explore Products"
            onClick={() => navigate('/product-comparison')}
          >
            Explore Products
          </Button>
          <Button
            className="rf-btn-primary"
            size="sm"
            title="Apply for Loan"
            onClick={() => openAssessmentOrEligibilityFirst(navigate)}
          >
            Apply for Loan
          </Button>
        </>
      )}
    >
        <div className="mb-6 md:mb-8">
          {tabHeading ? (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{tabHeading.title}</h1>
              <p className="text-sm md:text-base text-muted-foreground">{tabHeading.subtitle}</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                Welcome back, {profileData?.name?.split(' ')?.[0]}! 👋
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {documentOnlyMode
                  ? 'Your application is submitted. Upload documents and view your read-only application summary below.'
                  : "Here's your financial overview for today."}
              </p>
            </>
          )}
        </div>

        {activeTab === 'overview' && financialSnapshot?.summary ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <DashboardKpiCard
              title="Total Investments"
              value={formatCurrency(financialSnapshot.summary.totalInvestments)}
              change="+12.45% 1Y Returns"
              icon="TrendingUp"
            />
            <DashboardKpiCard
              title="Total Loans"
              value={formatCurrency(financialSnapshot.summary.totalLoansOutstanding)}
              subtitle="Outstanding Amount"
              icon="Wallet"
              iconBg="bg-orange-50"
              iconColor="text-orange-600"
            />
            <DashboardKpiCard
              title="Active Insurance"
              value={formatCurrency(financialSnapshot.summary.totalInsuranceCover)}
              subtitle="Total Sum Assured"
              icon="Shield"
              iconBg="bg-sky-50"
              iconColor="text-sky-600"
            />
            <DashboardKpiCard
              title="Monthly Savings"
              value={formatCurrency(financialSnapshot.summary.monthlySavings)}
              subtitle="Your SIP & RD Amount"
              icon="PiggyBank"
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
            />
            <DashboardKpiCard
              title="Credit Score"
              value={`${financialSnapshot.summary.creditScore ?? '—'} / 900`}
              subtitle={financialSnapshot.summary.creditScoreBand || 'Pull score to update'}
              icon="Gauge"
              iconBg="bg-emerald-50"
            />
          </div>
        ) : null}

        {documentOnlyMode && primaryApp?.id && (
          <div className="mb-6 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-950 text-sm space-y-2">
            <p className="font-semibold">Document-only mode</p>
            <p>
              Your full application and final consent are locked. You may upload required documents
              and download a read-only PDF summary. For changes, contact our helpline or write to
              support.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(milestone4Service.applicationSummaryPdfUrl(primaryApp.id), '_blank')
              }
            >
              View / download application PDF
            </Button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <ProfileSummaryCard 
              profile={profileData} 
              onEditProfile={() => handleTabChange('profile')} 
            />

            <NextBestActionBanner
              action={financialSnapshot?.nextBestAction}
              loading={snapshotLoading}
            />

            <FinancialHealthCard
              snapshot={financialSnapshot}
              loading={snapshotLoading}
              onViewPortfolio={() => handleTabChange('portfolio')}
            />

            <CreditScoreCard
              creditProfile={financialSnapshot?.creditProfile || {
                score: financialSnapshot?.summary?.creditScore,
                band: financialSnapshot?.summary?.creditScoreBand,
                source: financialSnapshot?.summary?.creditScoreSource,
              }}
              loading={snapshotLoading}
              pulling={creditPulling}
              pullError={creditPullError}
              onPullScore={handlePullCreditScore}
              onImprove={() => handleTabChange('portfolio')}
            />

            {financialSnapshot?.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{financialSnapshot.summary.financialHealthScore ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Health Score</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">{financialSnapshot.summary.activeLoans ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Active Loans</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">{financialSnapshot.summary.insurancePolicies ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Policies</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange('portfolio')}
                  className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center hover:bg-primary/15 transition-colors"
                >
                  <p className="text-sm font-bold text-primary">View full portfolio →</p>
                </button>
              </div>
            )}

            <CreditCardsQuickApply banks={partnerBanks} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">Active Applications</h2>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setActiveTab('applications')}
                    >
                      View All
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {applications?.slice(0, 2)?.map((app) => (
                      <ApplicationStatusCard
                        key={app?.id}
                        application={app}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                    {applications?.length === 0 && (
                      <div className="bg-card border border-border rounded-lg p-8 text-center">
                        <Icon name="FileText" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No applications yet</p>
                        <Button
                          variant="default"
                          onClick={() => openAssessmentOrEligibilityFirst(navigate)}
                        >
                          Apply for Loan
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">Recent Documents</h2>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setActiveTab('documents')}
                    >
                      View All
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents?.slice(0, 4)?.map((doc) => (
                      <DocumentCard
                        key={doc?.id}
                        document={doc}
                        onDelete={handleDocumentDeleted}
                      />
                    ))}
                    {documents?.length === 0 && (
                      <div className="col-span-2 bg-card border border-border rounded-lg p-8 text-center">
                        <Icon name="FolderOpen" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
                        <Button
                          variant="default"
                          onClick={() => setIsUploadModalOpen(true)}
                        >
                          Upload Document
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {localStorage.getItem('loan_assessment_form_data') && (
                  <QuickActionCard
                    action={{
                      type: 'apply',
                      icon: 'PlayCircle',
                      title: 'Continue application',
                      description: 'Resume your saved loan assessment where you left off',
                      badge: 'Draft saved',
                    }}
                    onClick={() => navigate('/customer-assessment-portal?resume=1')}
                  />
                )}
                <QuickActionCard
                  action={{
                    type: 'apply',
                    icon: 'FileText',
                    title: 'New application',
                    description: 'Start a fresh loan assessment',
                  }}
                  onClick={() => openAssessmentOrEligibilityFirst(navigate)}
                />
                <SupportCard />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <UnifiedFinancialOverview
            snapshot={financialSnapshot}
            loading={snapshotLoading}
            onRefresh={loadFinancialSnapshot}
          />
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">All Applications</h2>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                onClick={() => openAssessmentOrEligibilityFirst(navigate)}
              >
                New Application
              </Button>
            </div>
            <div className="space-y-4">
              {applications?.map((app) => (
                <ApplicationStatusCard
                  key={app?.id}
                  application={app}
                  onViewDetails={handleViewDetails}
                />
              ))}
              {applications?.length === 0 && (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <Icon name="FileText" size={64} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground mb-6">Start your loan application journey today</p>
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => openAssessmentOrEligibilityFirst(navigate)}
                  >
                    Apply for Loan
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">My Documents</h2>
              <Button
                variant="default"
                iconName="Upload"
                iconPosition="left"
                onClick={() => setIsUploadModalOpen(true)}
              >
                Upload Document
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents?.map((doc) => (
                <DocumentCard
                  key={doc?.id}
                  document={doc}
                  onDelete={handleDocumentDeleted}
                />
              ))}
              {documents?.length === 0 && (
                <div className="col-span-full bg-card border border-border rounded-lg p-12 text-center">
                  <Icon name="FolderOpen" size={64} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">No Documents Yet</h3>
                  <p className="text-muted-foreground mb-6">Upload your documents to speed up loan processing</p>
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    Upload Document
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-end">
              {unreadNotifications?.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                >
                  Mark All as Read
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {displayedNotifications?.map((notification) => (
                <NotificationCard
                  key={notification?.id}
                  notification={notification}
                  onMarkAsRead={handleMarkNotificationRead}
                />
              ))}
              {notifications?.length === 0 && (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <Icon name="Bell" size={64} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">No Notifications</h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </div>
              )}
              {notifications?.length > 5 && !showAllNotifications && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAllNotifications(true)}
                >
                  Show All Notifications
                </Button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && <CustomerProfilePanel />}

        {activeTab === 'support' && <CustomerSupportPanel />}

        {activeTab === 'settings' && <CustomerSettingsPanel />}

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        applicationId={selectedApplicationId}
      />

      <ApplicationDetailModal
        applicationId={detailApplication?.id}
        summary={detailApplication}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailApplication(null);
        }}
      />
    </PortalShell>
  );
};

export default CustomerDashboard;