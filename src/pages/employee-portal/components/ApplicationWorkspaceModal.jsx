import React, { useCallback, useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { employeeService } from '../../../services/employeeService';
import { milestone4Service } from '../../../services/milestone4Service';
import { apiClient } from '../../../lib/apiClient';
import {
  documentManagementService,
  mapApiDocumentToCard,
} from '../../../services/documentManagementService';
import DocumentReviewModal from '../../document-management-center/components/DocumentReviewModal';
import {
  BANK_APPROVAL_STAGE_SELECT_OPTIONS,
  DOCUMENT_STAGE_SELECT_OPTIONS,
} from '../../../constants/applicationStageOptions';

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'documents_pending', label: 'Documents Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'disbursed', label: 'Disbursed' },
];

function appFields(application) {
  const data = application?.data || {};
  return {
    loanLabel:
      application?.loanTypeLabel ||
      application?.loanPurpose ||
      data?.loan_type_label ||
      data?.loan_purpose ||
      '—',
    amount:
      application?.loanAmount ??
      application?.requestedLoanAmount ??
      data?.requested_loan_amount ??
      data?.loan_amount,
    submitted: application?.submittedAt || application?.createdAt,
    email: application?.email || data?.email || application?.customer?.email,
    phone: application?.phone || data?.phone || data?.mobile || application?.customer?.phone,
    panNumber: application?.panNumber || data?.pan_number || data?.panNumber,
    aadhaarNumber: application?.aadhaarNumber || data?.aadhaar_number || data?.aadhaarNumber,
    employmentType: application?.employmentType || data?.employment_type,
    annualIncome: application?.annualIncome || data?.annual_income,
    city: application?.city || data?.city,
    state: application?.state || data?.state,
    pinCode: application?.pinCode || data?.pin_code || data?.pinCode,
  };
}

function statusBadgeClass(status) {
  const s = String(status || 'pending').toLowerCase();
  if (s === 'approved' || s === 'verified') return 'bg-green-100 text-green-800';
  if (s === 'rejected') return 'bg-red-100 text-red-800';
  return 'bg-amber-100 text-amber-800';
}

const ApplicationWorkspaceModal = ({ application, isOpen, onClose, onRefresh, onMessageAgent }) => {
  const [fullApplication, setFullApplication] = useState(application);
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docBusy, setDocBusy] = useState(null);
  const [docTabs, setDocTabs] = useState({});
  const [previewDocument, setPreviewDocument] = useState(null);
  const [downloadingApp, setDownloadingApp] = useState(false);

  const [status, setStatus] = useState(application?.status || 'under_review');
  const [statusNotes, setStatusNotes] = useState('');
  const [documentStageStatus, setDocumentStageStatus] = useState(
    application?.documentStageStatus || 'documents_pending',
  );
  const [bankApprovalStatus, setBankApprovalStatus] = useState(
    application?.bankApprovalStatus || 'submitted_to_bank',
  );
  const [statusSaving, setStatusSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [cibilCheck, setCibilCheck] = useState(null);

  const activeApp = fullApplication || application;

  const loadCibil = useCallback(async () => {
    if (!application?.id) return;
    try {
      const check = await milestone4Service.getApplicationCibil(application.id);
      setCibilCheck(check);
    } catch {
      setCibilCheck(null);
    }
  }, [application?.id]);

  const loadApplicationDetails = useCallback(async () => {
    if (!application?.id) return;
    const { data } = await employeeService.getApplication(application.id);
    if (data) setFullApplication(data);
  }, [application?.id]);

  const loadDocuments = useCallback(async () => {
    if (!application?.id) return;
    setDocsLoading(true);
    const { data, error } = await employeeService.getApplicationDocuments(application.id);
    setDocuments(
      error ? [] : (Array.isArray(data) ? data : []).map((row) => mapApiDocumentToCard(row)),
    );
    setDocsLoading(false);
  }, [application?.id]);

  useEffect(() => {
    if (isOpen && application) {
      setFullApplication(application);
      setStatus(application.status || 'under_review');
      setDocumentStageStatus(application.documentStageStatus || 'documents_pending');
      setBankApprovalStatus(application.bankApprovalStatus || 'submitted_to_bank');
      setStatusNotes('');
      setMessage('');
      setDocTabs({});
      loadApplicationDetails();
      loadDocuments();
      loadCibil();
    }
  }, [isOpen, application, loadDocuments, loadCibil, loadApplicationDetails]);

  const pendingCount = documents.filter((d) =>
    ['pending', 'uploaded'].includes(String(d.status || d.verificationStatus || '').toLowerCase()),
  ).length;

  const handleViewDocument = (doc) => {
    const docId = doc?.id;
    if (!docId) {
      alert('Could not open document — missing document id.');
      return;
    }
    setPreviewDocument(doc.raw ? doc : mapApiDocumentToCard(doc));
  };

  const handleDownloadDocument = async (doc) => {
    const { data, error } = await documentManagementService.downloadDocument(doc.id);
    if (data?.blob) {
      const url = URL.createObjectURL(data.blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = data.fileName || doc.name || 'document';
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    alert(error?.message || 'Download failed');
  };

  const handleDownloadApplication = async () => {
    if (!application?.id) return;
    setDownloadingApp(true);
    try {
      const res = await apiClient.get(`/loan-applications/${application.id}/summary-pdf`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `application-${activeApp?.applicationNumber || application.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not download application form. Please try again.');
    } finally {
      setDownloadingApp(false);
    }
  };

  const handleVerifyDoc = async (docId, decision, remark) => {
    if (decision === 'rejected' && !remark?.trim()) {
      alert('Please add a remark when rejecting a document.');
      return;
    }
    setDocBusy(docId);
    const payload =
      decision === 'approved'
        ? { status: 'approved', verificationNotes: remark?.trim() || 'Verified in application workspace' }
        : { status: 'rejected', verificationNotes: remark.trim() };
    const { error } = await employeeService.verifyDocument(docId, payload);
    setDocBusy(null);
    if (error) {
      alert(error.message || 'Verification failed');
      return;
    }
    setMessage(
      decision === 'approved'
        ? 'Document passed. Customer has been notified.'
        : 'Document rejected. Customer notified to resubmit via email and message.',
    );
    await loadDocuments();
    onRefresh?.();
  };

  const handleSaveStatus = async () => {
    if (!statusNotes.trim()) {
      alert('Add status notes before saving');
      return;
    }
    setStatusSaving(true);
    const { error } = await employeeService.updateApplicationStatus(application.id, {
      status,
      notes: statusNotes,
      documentStageStatus,
      bankApprovalStatus,
    });
    setStatusSaving(false);
    if (error) {
      alert(error.message || 'Status update failed');
      return;
    }
    setMessage('Application status saved');
    onRefresh?.();
  };

  if (!isOpen || !application) return null;

  const fields = appFields(activeApp);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col border border-border">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">Application verification</h2>
            <p className="text-sm text-muted-foreground">
              {activeApp?.customer?.fullName || activeApp?.customerName} ·{' '}
              {activeApp?.applicationNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onMessageAgent && (
              <Button variant="outline" size="sm" iconName="MessageSquare" onClick={onMessageAgent}>
                Message agent
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={24} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {message && (
            <p className="text-sm px-3 py-2 rounded-lg bg-green-50 text-green-800 border border-green-200">
              {message}
            </p>
          )}

          <section className="border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/80 px-4 py-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Icon name="FileText" size={18} />
                Application form
              </h3>
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                loading={downloadingApp}
                onClick={handleDownloadApplication}
              >
                Download application
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Loan type</span>
                  <p className="font-medium">{fields.loanLabel}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount</span>
                  <p className="font-medium">
                    {fields.amount != null ? `₹${Number(fields.amount).toLocaleString('en-IN')}` : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p className="font-medium capitalize">
                    {String(activeApp.status || '').replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted</span>
                  <p className="font-medium">
                    {fields.submitted
                      ? new Date(fields.submitted).toLocaleDateString('en-IN')
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm bg-muted/40 rounded-lg p-4">
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-medium">{fields.email || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone</span>
                  <p className="font-medium">{fields.phone || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Employment</span>
                  <p className="font-medium">{fields.employmentType || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Annual income</span>
                  <p className="font-medium">
                    {fields.annualIncome != null
                      ? `₹${Number(fields.annualIncome).toLocaleString('en-IN')}`
                      : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">PAN</span>
                  <p className="font-medium">{fields.panNumber || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Aadhaar</span>
                  <p className="font-medium">{fields.aadhaarNumber || '—'}</p>
                </div>
                {(fields.city || fields.state) && (
                  <div className="col-span-2 md:col-span-3">
                    <span className="text-muted-foreground">Address</span>
                    <p className="font-medium">
                      {[fields.city, fields.state, fields.pinCode].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {cibilCheck && (
            <section className="border border-border rounded-lg p-4 bg-muted/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                <Icon name="Shield" size={18} />
                CIBIL / bureau check
              </h3>
              <p className="text-sm">
                Vendor: {cibilCheck.vendorName || cibilCheck.vendorKey} · Score:{' '}
                {cibilCheck.creditScore ?? '—'} · Status: {cibilCheck.status}
              </p>
              {cibilCheck.reportPath && (
                <Button
                  className="mt-2"
                  size="xs"
                  variant="outline"
                  onClick={async () => {
                    const res = await apiClient.get(
                      `/admin/milestone4/applications/${application.id}/cibil/report`,
                      { responseType: 'blob' },
                    );
                    const url = URL.createObjectURL(res.data);
                    window.open(url, '_blank');
                  }}
                >
                  Download CIBIL PDF
                </Button>
              )}
            </section>
          )}

          <section className="border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/80 px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Icon name="FolderOpen" size={18} />
                Attached documents
              </h3>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                {pendingCount} pending
              </span>
            </div>
            <div className="p-4">
              {docsLoading ? (
                <p className="text-sm text-muted-foreground text-center py-6">Loading documents…</p>
              ) : documents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => {
                    const docStatus = doc.status || 'pending';
                    const isPending = ['pending', 'uploaded'].includes(String(docStatus).toLowerCase());
                    const activeTab = docTabs[doc.id] || 'view';
                    return (
                      <div
                        key={doc.id}
                        className="flex flex-col gap-3 p-3 border border-border rounded-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {doc.name || 'Document'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {doc.documentType || '—'}
                            </p>
                            <span
                              className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${statusBadgeClass(docStatus)}`}
                            >
                              {docStatus}
                            </span>
                          </div>
                          <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
                            <button
                              type="button"
                              className={`px-3 py-1.5 text-xs font-medium ${
                                activeTab === 'view'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-card text-muted-foreground hover:bg-muted'
                              }`}
                              onClick={() => setDocTabs((p) => ({ ...p, [doc.id]: 'view' }))}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              className={`px-3 py-1.5 text-xs font-medium border-l border-border ${
                                activeTab === 'download'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-card text-muted-foreground hover:bg-muted'
                              }`}
                              onClick={() => setDocTabs((p) => ({ ...p, [doc.id]: 'download' }))}
                            >
                              Download
                            </button>
                          </div>
                        </div>
                        {activeTab === 'view' ? (
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="xs" onClick={() => handleViewDocument(doc)}>
                              Open preview
                            </Button>
                            {isPending && (
                              <>
                                <Button
                                  variant="default"
                                  size="xs"
                                  loading={docBusy === doc.id}
                                  onClick={() => handleVerifyDoc(doc.id, 'approved')}
                                >
                                  Pass
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="xs"
                                  onClick={() => handleViewDocument(doc)}
                                >
                                  Reject (add remark)
                                </Button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="xs"
                              iconName="Download"
                              onClick={() => handleDownloadDocument(doc)}
                            >
                              Download file
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/80 px-4 py-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Icon name="RefreshCw" size={18} />
                Application status &amp; stages
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Application status" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
                <Select
                  label="Document stage"
                  options={DOCUMENT_STAGE_SELECT_OPTIONS}
                  value={documentStageStatus}
                  onChange={setDocumentStageStatus}
                />
                <Select
                  label="Bank approval stage"
                  options={BANK_APPROVAL_STAGE_SELECT_OPTIONS}
                  value={bankApprovalStatus}
                  onChange={setBankApprovalStatus}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Status notes *</label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm"
                  rows={3}
                  placeholder="Notes for customer timeline and audit trail"
                />
              </div>
              <Button loading={statusSaving} iconName="Save" onClick={handleSaveStatus}>
                Save application status
              </Button>
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <DocumentReviewModal
        document={previewDocument}
        application={{
          applicationNumber: activeApp?.applicationNumber,
          customerName:
            activeApp?.customer?.fullName ||
            activeApp?.customerName ||
            activeApp?.customer_name ||
            'Applicant',
        }}
        isOpen={Boolean(previewDocument)}
        onClose={() => setPreviewDocument(null)}
        onUpdated={async () => {
          setMessage('Document updated. Customer notified if rejected.');
          await loadDocuments();
          onRefresh?.();
        }}
        passLabel="Pass"
        rejectLabel="Reject"
      />
    </div>
  );
};

export default ApplicationWorkspaceModal;
