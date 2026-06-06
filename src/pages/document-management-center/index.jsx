import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ApplicationsDocumentTable from './components/ApplicationsDocumentTable';
import ApplicationDocumentsView from './components/ApplicationDocumentsView';
import DocumentReviewModal from './components/DocumentReviewModal';
import {
  documentManagementService,
  mapApiDocumentToCard,
  DOC_SUMMARY_LABELS,
} from '../../services/documentManagementService';
import { getDocumentPreviewUrl } from '../../utils/documentUrls';

const DocumentManagementCenter = () => {
  const location = useLocation();
  const useAdminChrome = location.pathname.startsWith('/admin/');
  const { userProfile, user } = useAuth();
  const role = userProfile?.role || user?.role;
  const isAgent = role === 'agent';

  const [view, setView] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewDocument, setReviewDocument] = useState(null);

  const loadApplications = useCallback(async () => {
    setLoadingApps(true);
    setError('');
    try {
      const data = await documentManagementService.getApplicationsWithDocuments({
        search: searchQuery || undefined,
        documentStatus: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load applications');
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    if (view === 'applications') {
      const t = setTimeout(loadApplications, 300);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [view, loadApplications]);

  const loadDocumentsForApplication = async (app) => {
    setLoadingDocs(true);
    setError('');
    try {
      const data = await documentManagementService.getDocumentsByApplication(app.applicationId);
      setDocuments((Array.isArray(data) ? data : []).map(mapApiDocumentToCard));
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleSelectApplication = async (app) => {
    setSelectedApplication(app);
    setView('documents');
    await loadDocumentsForApplication(app);
  };

  const handleBackToApplications = () => {
    setView('applications');
    setSelectedApplication(null);
    setDocuments([]);
    setReviewDocument(null);
    loadApplications();
  };

  const handleOpenDocument = (doc) => {
    setReviewDocument(doc);
  };

  const handleDownload = async (doc) => {
    const { data, error: dlErr } = await documentManagementService.downloadDocument(doc.id);
    if (data?.blob) {
      const url = URL.createObjectURL(data.blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = data.fileName || doc.name;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const staticUrl = getDocumentPreviewUrl(doc.raw || doc);
    if (staticUrl) {
      const a = window.document.createElement('a');
      a.href = staticUrl;
      a.download = doc.name || 'document';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
      return;
    }
    window.alert(dlErr?.message || 'Could not download document');
  };

  const handleDocumentUpdated = async () => {
    if (selectedApplication) {
      await loadDocumentsForApplication(selectedApplication);
      const data = await documentManagementService.getApplicationsWithDocuments({
        search: searchQuery || undefined,
        documentStatus: statusFilter !== 'all' ? statusFilter : undefined,
      });
      const updated = (Array.isArray(data) ? data : []).find(
        (a) => a.applicationId === selectedApplication.applicationId,
      );
      if (updated) setSelectedApplication(updated);
    }
  };

  const statusFilterOptions = [
    { value: 'all', label: 'All document statuses' },
    ...Object.entries(DOC_SUMMARY_LABELS).map(([value, label]) => ({ value, label })),
  ];

  return (
    <div className={useAdminChrome ? '' : 'min-h-screen bg-background'}>
      {!useAdminChrome && <Header />}
      <main className={useAdminChrome ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-12'}>
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Document Management Center
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {isAgent
              ? 'Search your customer applications by application number or mobile number, then upload documents on their behalf.'
              : 'Review customer documents by application — open each file, approve or reject with remarks'}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Icon name="Search" size={14} />
            <span>Search by application ID or customer mobile</span>
            {isAgent ? (
              <>
                <span>·</span>
                <Icon name="Upload" size={14} />
                <span>Upload PAN, Aadhaar, income proof, and more</span>
              </>
            ) : (
              <>
                <span>·</span>
                <Icon name="FileCheck" size={14} />
                <span>Per-document verification</span>
              </>
            )}
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
            {error}
          </p>
        )}

        {view === 'applications' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  label="Search"
                  placeholder={
                    isAgent
                      ? 'Application number or customer mobile number…'
                      : 'Application ID, name, mobile, or email…'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <Select
                  label="Document status"
                  options={statusFilterOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </div>
            </div>
            <ApplicationsDocumentTable
              applications={applications}
              loading={loadingApps}
              isAgent={isAgent}
              onSelectApplication={handleSelectApplication}
            />
          </div>
        )}

        {view === 'documents' && selectedApplication && (
          <ApplicationDocumentsView
            application={selectedApplication}
            documents={documents}
            loading={loadingDocs}
            isAgent={isAgent}
            onBack={handleBackToApplications}
            onOpenDocument={handleOpenDocument}
            onDownload={handleDownload}
            onDocumentUploaded={() => loadDocumentsForApplication(selectedApplication)}
          />
        )}

        <DocumentReviewModal
          isOpen={!!reviewDocument}
          document={reviewDocument}
          application={selectedApplication}
          readOnly={isAgent}
          onClose={() => setReviewDocument(null)}
          onUpdated={handleDocumentUpdated}
        />
      </main>
    </div>
  );
};

export default DocumentManagementCenter;
