import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ApplicationStatusCard from './components/ApplicationStatusCard';
import DocumentCard from './components/DocumentCard';
import NotificationCard from './components/NotificationCard';
import QuickActionCard from './components/QuickActionCard';
import ProfileSummaryCard from './components/ProfileSummaryCard';

import SupportCard from './components/SupportCard';
import DocumentUploadModal from './components/DocumentUploadModal';
import ApplicationDetailModal from './components/ApplicationDetailModal';
import { useAuth } from '../../contexts/AuthContext';
import { customerJourneyService } from '../../services/customerJourneyService';
import { bankService } from '../../services/apiServices';
import { milestone4Service } from '../../services/milestone4Service';
import BankApplyLinksCard from './components/BankApplyLinksCard';


const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
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
  const [loading, setLoading] = useState(true);

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
    completionPercentage: 85,
    activeApplications: applications?.filter(a => ['submitted', 'under_review', 'documents_pending']?.includes(a?.status))?.length || 0,
    documentsUploaded: documents?.filter(d => d?.status === 'verified')?.length || 0,
    creditScore: 720,
    memberSince: new Date(userProfile?.createdAt || Date.now())?.getFullYear()?.toString()
  };

  const unreadNotifications = notifications?.filter(n => !n?.isRead);
  const displayedNotifications = showAllNotifications ? notifications : notifications?.slice(0, 5);

  const primaryApp = applications?.[0];
  const documentOnlyMode =
    primaryApp?.journeyMode === 'document_only' ||
    primaryApp?.journey_mode === 'document_only' ||
    (primaryApp?.status === 'submitted' && primaryApp?.submittedAt);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'applications', label: 'Applications', icon: 'FileText' },
    { id: 'documents', label: 'Documents', icon: 'FolderOpen' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell', badge: unreadNotifications?.length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Icon name="Loader" size={48} className="animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-lg">
              <Icon name="User" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Customer Dashboard</h2>
              <p className="text-sm text-gray-600">Track your loan applications and manage documents</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <Icon name="LogOut" className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Welcome back, {profileData?.name?.split(' ')?.[0]}!
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {documentOnlyMode
              ? 'Your application is submitted. Upload documents and view your read-only application summary below.'
              : 'Track your loan applications and manage your documents'}
          </p>
        </div>

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

        {/* Tabs */}
        <div className="mb-6 border-b border-border overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary font-semibold' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={18} />
                <span>{tab?.label}</span>
                {tab?.badge > 0 && (
                  <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {tab?.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <ProfileSummaryCard 
              profile={profileData} 
              onEditProfile={() => navigate('/profile')} 
            />

            <BankApplyLinksCard banks={applyBanks} />

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
                          onClick={() => navigate('/customer-assessment-portal')}
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
                  onClick={() => navigate('/customer-assessment-portal')}
                />
                <SupportCard />
              </div>
            </div>
          </div>
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
                onClick={() => navigate('/customer-assessment-portal')}
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
                    onClick={() => navigate('/customer-assessment-portal')}
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Notifications</h2>
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
      </main>

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
    </div>
  );
};

export default CustomerDashboard;