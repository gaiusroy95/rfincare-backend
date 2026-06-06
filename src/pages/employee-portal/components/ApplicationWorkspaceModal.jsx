import React, { useCallback, useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { employeeService } from '../../../services/employeeService';
import { milestone4Service } from '../../../services/milestone4Service';
import { apiClient } from '../../../lib/apiClient';
import { mapApiDocumentToCard } from '../../../services/documentManagementService';
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
  };
}

function statusBadgeClass(status) {
  const s = String(status || 'pending').toLowerCase();
  if (s === 'approved' || s === 'verified') return 'bg-green-100 text-green-800';
  if (s === 'rejected') return 'bg-red-100 text-red-800';
  return 'bg-amber-100 text-amber-800';
}

const ApplicationWorkspaceModal = ({ application, isOpen, onClose, onRefresh, onMessageAgent }) => {
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docBusy, setDocBusy] = useState(null);
  const [rejectReason, setRejectReason] = useState({});
  const [expandedReject, setExpandedReject] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);

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

  const loadCibil = useCallback(async () => {
    if (!application?.id) return;
    try {
      const check = await milestone4Service.getApplicationCibil(application.id);
      setCibilCheck(check);
    } catch {
      setCibilCheck(null);
    }
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
      setStatus(application.status || 'under_review');
      setDocumentStageStatus(application.documentStageStatus || 'documents_pending');
      setBankApprovalStatus(application.bankApprovalStatus || 'submitted_to_bank');
      setStatusNotes('');
      setMessage('');
      loadDocuments();
      loadCibil();
    }
  }, [isOpen, application, loadDocuments, loadCibil]);

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

  const handleVerifyDoc = async (docId, decision) => {
    if (decision === 'rejected') {
      const reason = rejectReason[docId]?.trim();
      if (!reason) {
        setExpandedReject(docId);
        return;
      }
    }
    setDocBusy(docId);
    const payload =
      decision === 'approved'
        ? { status: 'approved', verificationNotes: 'Verified in application workspace' }
        : { status: 'rejected', verificationNotes: rejectReason[docId] };
    const { error } = await employeeService.verifyDocument(docId, payload);
    setDocBusy(null);
    if (error) {
      alert(error.message || 'Verification failed');
      return;
    }
    setExpandedReject(null);
    setMessage('Document updated');
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

  const fields = appFields(application);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col border border-border">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">Process application</h2>
            <p className="text-sm text-muted-foreground">
              {application?.customer?.fullName} · {application?.applicationNumber}
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

          <div className="bg-muted rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Loan</span>
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
              <p className="font-medium capitalize">{String(application.status || '').replace(/_/g, ' ')}</p>
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
                Document verification
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
                    return (
                      <div
                        key={doc.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border border-border rounded-lg"
                      >
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
                        <div className="flex flex-wrap gap-2 shrink-0">
                          <Button variant="outline" size="xs" onClick={() => handleViewDocument(doc)}>
                            View
                          </Button>
                          {isPending && (
                            <>
                              <Button
                                variant="default"
                                size="xs"
                                loading={docBusy === doc.id}
                                onClick={() => handleVerifyDoc(doc.id, 'approved')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="xs"
                                onClick={() =>
                                  expandedReject === doc.id
                                    ? handleVerifyDoc(doc.id, 'rejected')
                                    : setExpandedReject(doc.id)
                                }
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                        {expandedReject === doc.id && (
                          <div className="w-full sm:col-span-full flex gap-2">
                            <input
                              className="flex-1 text-sm border border-border rounded-lg px-3 py-2"
                              placeholder="Rejection reason (required)"
                              value={rejectReason[doc.id] || ''}
                              onChange={(e) =>
                                setRejectReason((p) => ({ ...p, [doc.id]: e.target.value }))
                              }
                            />
                            <Button size="xs" variant="destructive" onClick={() => handleVerifyDoc(doc.id, 'rejected')}>
                              Confirm
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
          applicationNumber: application?.applicationNumber,
          customerName:
            application?.customer?.fullName ||
            application?.customerName ||
            application?.customer_name ||
            'Applicant',
        }}
        isOpen={Boolean(previewDocument)}
        onClose={() => setPreviewDocument(null)}
        onUpdated={async () => {
          await loadDocuments();
          onRefresh?.();
        }}
      />
    </div>
  );
};

export default ApplicationWorkspaceModal;
