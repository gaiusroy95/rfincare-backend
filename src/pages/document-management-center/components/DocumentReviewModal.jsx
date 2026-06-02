import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import { documentTypeLabel, getDocumentPreviewUrl } from '../../../utils/documentUrls';
import {
  documentManagementService,
  DOC_STATUS_LABELS,
} from '../../../services/documentManagementService';

const DocumentReviewModal = ({
  document,
  application,
  isOpen,
  onClose,
  onUpdated,
  readOnly = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !document?.id) {
      setPreviewUrl(null);
      setRemark(document?.verificationNote || '');
      setError('');
      return undefined;
    }

    setRemark(document?.verificationNote || '');
    const staticUrl = getDocumentPreviewUrl(document.raw || document);
    if (staticUrl && document.type === 'image') {
      setPreviewUrl(staticUrl);
      return undefined;
    }

    let objectUrl = null;
    let cancelled = false;
    (async () => {
      setPreviewLoading(true);
      const { data } = await documentManagementService.downloadDocument(document.id);
      if (cancelled) return;
      if (data?.blob) {
        objectUrl = URL.createObjectURL(data.blob);
        setPreviewUrl(objectUrl);
      }
      setPreviewLoading(false);
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isOpen, document?.id]);

  if (!isOpen || !document) return null;

  const handleVerify = async (status) => {
    if (status === 'rejected' && !remark.trim()) {
      setError('Please add a remark when rejecting a document.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await documentManagementService.verifyDocument(document.id, {
        status,
        verificationNotes: remark.trim() || null,
      });
      onUpdated?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async () => {
    const { data, error: dlErr } = await documentManagementService.downloadDocument(document.id);
    if (dlErr || !data?.blob) return;
    const url = URL.createObjectURL(data.blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = data.fileName || document.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col border border-border shadow-xl">
        <div className="border-b border-border p-4 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate">
              {documentTypeLabel(document.documentType)}
            </h2>
            <p className="text-sm text-muted-foreground truncate">{document.name}</p>
            {application && (
              <p className="text-xs text-muted-foreground mt-1">
                {application.applicationNumber} · {application.customerName}
              </p>
            )}
            <span className="inline-flex mt-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-muted">
              {DOC_STATUS_LABELS[document.status] || document.status}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-muted/30 rounded-lg min-h-[240px] flex items-center justify-center p-4">
            {previewLoading && (
              <p className="text-sm text-muted-foreground">Loading preview…</p>
            )}
            {!previewLoading && document.type === 'image' && previewUrl && (
              <Image
                src={previewUrl}
                alt={document.name}
                className="max-w-full max-h-[50vh] object-contain rounded-lg"
              />
            )}
            {!previewLoading && document.type === 'pdf' && previewUrl && (
              <iframe
                title={document.name}
                src={previewUrl}
                className="w-full h-[50vh] rounded-lg bg-white border border-border"
              />
            )}
            {!previewLoading && document.type !== 'image' && document.type !== 'pdf' && (
              <div className="text-center">
                <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">Preview not available for this file type.</p>
                <Button variant="outline" iconName="Download" onClick={handleDownload}>
                  Download to view
                </Button>
              </div>
            )}
          </div>

          {!readOnly && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Remark / verification notes
              </label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm min-h-[80px] focus:ring-2 focus:ring-primary"
                placeholder="Add notes for approval or rejection (required when rejecting)…"
              />
            </div>
          )}
          {readOnly && document.verificationNote && (
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              <span className="font-medium">Remark: </span>
              {document.verificationNote}
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              {error}
            </p>
          )}
        </div>

        <div className="border-t border-border p-4 flex flex-wrap gap-2 justify-end shrink-0">
          <Button variant="outline" onClick={handleDownload} iconName="Download" disabled={submitting}>
            Download
          </Button>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Close
          </Button>
          {!readOnly && (
            <>
              <Button
                variant="outline"
                onClick={() => handleVerify('pending')}
                disabled={submitting}
                iconName="Clock"
              >
                Mark pending
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleVerify('rejected')}
                disabled={submitting}
                iconName="X"
              >
                Reject
              </Button>
              <Button
                variant="default"
                onClick={() => handleVerify('approved')}
                disabled={submitting}
                iconName="Check"
              >
                Approve
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentReviewModal;
