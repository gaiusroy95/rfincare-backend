import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import { adminService } from '../../../services/adminService';
import { customerJourneyService } from '../../../services/customerJourneyService';
import { buildApplicationDetailSections, pickCustomerPhotoDocument } from '../../../utils/applicationFormDetails';
import { documentTypeLabel, inferDocumentMediaType, loadDocumentPreviewUrl } from '../../../utils/documentUrls';
import {
  BANK_APPROVAL_STAGE_SELECT_OPTIONS,
  DOCUMENT_STAGE_SELECT_OPTIONS,
} from '../../../constants/applicationStageOptions';

const DocumentVerificationModal = ({ application, isOpen, onClose, onApprove, onReject }) => {
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [detail, setDetail] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [previewMediaType, setPreviewMediaType] = useState('doc');
  const [documentStageStatus, setDocumentStageStatus] = useState('documents_pending');
  const [bankApprovalStatus, setBankApprovalStatus] = useState('submitted_to_bank');
  const [stageUpdateNotes, setStageUpdateNotes] = useState('');
  const [customerPhotoUrl, setCustomerPhotoUrl] = useState(null);

  useEffect(() => {
    if (!isOpen || !application?.id) {
      setDetail(null);
      setDocuments([]);
      setLoadError('');
      setShowRejectForm(false);
      setReviewNotes('');
      setRejectionReason('');
      return undefined;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError('');
      const [appRes, docsRes] = await Promise.all([
        adminService.getApplicationById(application.id),
        adminService.getApplicationDocuments(application.id),
      ]);
      if (cancelled) return;
      if (appRes.error) {
        setLoadError(appRes.error.message);
        setDetail(application.rawApplication || null);
      } else {
        setDetail(appRes.data);
        setDocumentStageStatus(appRes.data?.documentStageStatus || 'documents_pending');
        setBankApprovalStatus(appRes.data?.bankApprovalStatus || 'submitted_to_bank');
      }
      setDocuments(docsRes.data || []);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, application?.id]);

  useEffect(() => {
    if (!previewDoc?.id) {
      setPreviewUrl(null);
      setPreviewError('');
      return undefined;
    }

    let revoke = () => {};
    let cancelled = false;
    (async () => {
      setPreviewLoading(true);
      setPreviewError('');
      const result = await loadDocumentPreviewUrl(
        previewDoc,
        customerJourneyService.downloadDocument.bind(customerJourneyService),
      );
      if (cancelled) {
        result.revoke();
        return;
      }
      revoke = result.revoke;
      if (result.url) {
        setPreviewUrl(result.url);
        const media = inferDocumentMediaType({
          mimeType: result.mimeType || previewDoc.mimeType,
          documentName: previewDoc.documentName,
          filePath: previewDoc.filePath,
        });
        setPreviewMediaType(media);
      } else {
        setPreviewUrl(null);
        setPreviewError(result.error || 'Could not load document preview.');
      }
      setPreviewLoading(false);
    })();

    return () => {
      cancelled = true;
      revoke();
    };
  }, [previewDoc]);

  const app = detail || application?.rawApplication || application;
  const photoDoc = pickCustomerPhotoDocument(documents);

  useEffect(() => {
    if (!photoDoc?.id) {
      setCustomerPhotoUrl(null);
      return undefined;
    }
    let revoke = () => {};
    let cancelled = false;
    (async () => {
      const result = await loadDocumentPreviewUrl(
        photoDoc,
        customerJourneyService.downloadDocument.bind(customerJourneyService),
      );
      if (cancelled) {
        result.revoke();
        return;
      }
      revoke = result.revoke;
      setCustomerPhotoUrl(result.url);
    })();
    return () => {
      cancelled = true;
      revoke();
    };
  }, [photoDoc?.id]);
  const sections = buildApplicationDetailSections(app);
  const customerName =
    app?.customer?.fullName ||
    application?.customerName ||
    [app?.data?.firstName, app?.data?.lastName].filter(Boolean).join(' ') ||
    'Applicant';

  const amount = Number(app?.loanAmount ?? app?.data?.loanAmount ?? application?.amount ?? 0);
  const handleApprove = () => {
    onApprove(application?.id, reviewNotes);
    onClose();
  };

  const handleReject = () => {
    if (!rejectionReason?.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    onReject(application?.id, rejectionReason);
    onClose();
  };

  const handleStageUpdate = async () => {
    const { error } = await adminService.updateApplicationStage(application?.id, {
      document_stage_status: documentStageStatus,
      bank_approval_status: bankApprovalStatus,
      status_notes: stageUpdateNotes,
    });
    if (error) {
      alert(error.message);
      return;
    }
    alert('QC/Bank stage updated successfully.');
  };

  if (!isOpen || !application) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-lg max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col">
          <div className="border-b border-border p-4 md:p-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 min-w-0">
              {customerPhotoUrl ? (
                <Image
                  src={customerPhotoUrl}
                  alt={`Photo of ${customerName}`}
                  className="w-14 h-14 rounded-full object-cover border border-border shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon name="User" size={28} className="text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-foreground truncate">{customerName}</h2>
                <p className="text-sm text-muted-foreground truncate">
                  {app?.applicationNumber || application?.id}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {loading && (
              <div className="text-center py-8 text-muted-foreground">Loading application details…</div>
            )}

            {loadError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{loadError}</div>
            )}

            {!loading && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Loan type</p>
                    <p className="text-sm font-semibold">{application?.loanType || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="text-sm font-semibold">
                      {amount > 0 ? `₹${amount.toLocaleString('en-IN')}` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bank</p>
                    <p className="text-sm font-semibold">{application?.bankName || app?.bank?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm font-semibold capitalize">{application?.status || app?.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Document stage</p>
                    <p className="text-sm font-semibold capitalize">
                      {String(app?.documentStageStatus || 'documents_pending').replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bank stage</p>
                    <p className="text-sm font-semibold capitalize">
                      {String(app?.bankApprovalStatus || 'submitted_to_bank').replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Agent code</p>
                    <p className="text-sm font-semibold">{app?.sourcedAgentCode || '—'}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                  <h3 className="text-sm font-bold text-foreground">QC and Bank Approval Tracking</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Document stage</label>
                      <select
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                        value={documentStageStatus}
                        onChange={(e) => setDocumentStageStatus(e.target.value)}
                      >
                        {DOCUMENT_STAGE_SELECT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Bank approval stage</label>
                      <select
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                        value={bankApprovalStatus}
                        onChange={(e) => setBankApprovalStatus(e.target.value)}
                      >
                        {BANK_APPROVAL_STAGE_SELECT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <textarea
                    value={stageUpdateNotes}
                    onChange={(e) => setStageUpdateNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    rows={2}
                    placeholder="Optional notes for QC/Bank stage update"
                  />
                  <Button variant="outline" onClick={handleStageUpdate}>
                    Update stage tracking
                  </Button>
                </div>

                {sections.map((section) => (
                  <div key={section.title} className="rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <Icon name={section.icon} size={16} className="text-primary" />
                      {section.title}
                    </h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      {section.fields.map((field) => (
                        <div key={field.key}>
                          <dt className="text-muted-foreground">{field.label}</dt>
                          <dd className="font-medium text-foreground break-words">{field.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}

                {sections.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No detailed form data was saved with this application yet.
                  </p>
                )}

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">Uploaded documents</h3>
                  {documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents uploaded for this application.</p>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => {
                        const isImage = (doc.mimeType || '').startsWith('image/');
                        return (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0">
                                <Icon name={isImage ? 'Image' : 'FileText'} size={20} className="text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">
                                  {documentTypeLabel(doc.documentType)}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {doc.documentName}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              iconName="Eye"
                              onClick={() => setPreviewDoc(doc)}
                            >
                              View
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {!showRejectForm ? (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Review notes (optional)
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Add any notes about this application…"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Rejection reason *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Provide a detailed reason for rejection…"
                      required
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-border p-4 md:p-6 flex flex-col md:flex-row gap-3 shrink-0">
            {!showRejectForm ? (
              <>
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  iconName="X"
                  onClick={() => setShowRejectForm(true)}
                >
                  Reject
                </Button>
                <Button variant="default" className="flex-1" iconName="Check" onClick={handleApprove}>
                  Approve
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason('');
                  }}
                >
                  Back
                </Button>
                <Button variant="destructive" className="flex-1" iconName="X" onClick={handleReject}>
                  Confirm rejection
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {previewDoc && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewDoc(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">{documentTypeLabel(previewDoc.documentType)}</h3>
              <Button variant="ghost" size="icon" onClick={() => setPreviewDoc(null)}>
                <Icon name="X" size={20} />
              </Button>
            </div>
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center min-h-[200px]">
              {previewLoading && <p className="text-muted-foreground">Loading…</p>}
              {!previewLoading && previewError && (
                <p className="text-destructive text-sm text-center">{previewError}</p>
              )}
              {!previewLoading && previewUrl && previewMediaType === 'image' && (
                <img src={previewUrl} alt={previewDoc.documentName} className="max-h-[70vh] max-w-full object-contain" />
              )}
              {!previewLoading && previewUrl && previewMediaType === 'pdf' && (
                <iframe title={previewDoc.documentName} src={previewUrl} className="w-full h-[70vh] rounded border" />
              )}
              {!previewLoading && previewUrl && previewMediaType === 'doc' && (
                <div className="text-center space-y-3">
                  <Icon name="FileText" size={40} className="mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Preview not available for this file type.</p>
                  <a href={previewUrl} download={previewDoc.documentName || 'document'} className="text-primary font-medium hover:underline">
                    Download file
                  </a>
                </div>
              )}
              {!previewLoading && !previewUrl && !previewError && (
                <p className="text-muted-foreground text-sm">Preview unavailable.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentVerificationModal;
