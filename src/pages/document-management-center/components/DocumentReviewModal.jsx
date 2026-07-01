import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import {
  documentTypeLabel,
  getDocumentPreviewUrl,
  inferDocumentMediaType,
  loadDocumentPreviewUrl,
} from '../../../utils/documentUrls';
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
  const [previewError, setPreviewError] = useState('');
  const [mediaType, setMediaType] = useState('doc');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const blobUrlRef = useRef(null);

  const revokeBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !document?.id) {
      revokeBlobUrl();
      setPreviewUrl(null);
      setPreviewError('');
      setRemark(document?.verificationNote || '');
      setError('');
      return undefined;
    }

    setRemark(document?.verificationNote || '');
    setPreviewError('');
    setError('');

    const raw = document.raw || document;
    const resolvedType = inferDocumentMediaType({
      mimeType: document.mimeType || raw?.mimeType || raw?.mime_type,
      documentName: document.name || raw?.documentName || raw?.document_name,
      filePath: document.filePath || raw?.filePath || raw?.file_path,
    });
    setMediaType(resolvedType);

    let cancelled = false;
    (async () => {
      setPreviewLoading(true);
      setPreviewUrl(null);
      const result = await loadDocumentPreviewUrl(
        { ...raw, id: document.id },
        documentManagementService.downloadDocument.bind(documentManagementService),
      );
      if (cancelled) {
        result.revoke();
        return;
      }

      if (!result.url) {
        setPreviewError(result.error || 'Could not load document preview.');
        setPreviewLoading(false);
        return;
      }

      const fromBlob = inferDocumentMediaType({
        mimeType: result.mimeType,
        documentName: document.name,
      });
      if (fromBlob !== 'doc') setMediaType(fromBlob);

      if (result.isBlob) {
        revokeBlobUrl();
        blobUrlRef.current = result.url;
      }
      setPreviewUrl(result.url);
      setPreviewLoading(false);
    })();

    return () => {
      cancelled = true;
      revokeBlobUrl();
    };
  }, [isOpen, document?.id, document?.name, revokeBlobUrl]);

  const openInNewTab = useCallback(async () => {
    if (previewUrl && !previewError) {
      const opened = window.open(previewUrl, '_blank', 'noopener,noreferrer');
      if (opened) return;
    }
    const { data, error: dlErr } = await documentManagementService.downloadDocument(document.id, {
      inline: true,
    });
    if (data?.blob) {
      const url = URL.createObjectURL(data.blob);
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      if (!opened) {
        const link = window.document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return;
    }
    const staticUrl = getDocumentPreviewUrl(document.raw || document);
    if (staticUrl) {
      const opened = window.open(staticUrl, '_blank', 'noopener,noreferrer');
      if (opened) return;
    }
    setPreviewError(dlErr?.message || 'Could not open document');
  }, [document, previewUrl, previewError]);

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
    if (data?.blob) {
      const url = URL.createObjectURL(data.blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = data.fileName || document.name;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const staticUrl = getDocumentPreviewUrl(document.raw || document);
    if (staticUrl) {
      const a = window.document.createElement('a');
      a.href = staticUrl;
      a.download = document.name || 'document';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
      return;
    }
    setPreviewError(dlErr?.message || 'Download failed');
  };

  const showPreview = !previewLoading && !previewError && previewUrl;
  const showEmptyPreview =
    !previewLoading && !previewError && !previewUrl && (mediaType === 'image' || mediaType === 'pdf');

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-card rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col border border-border shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
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
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                <p className="text-sm text-muted-foreground">Loading preview…</p>
              </div>
            )}

            {previewError && (
              <div className="text-center max-w-md">
                <Icon name="AlertCircle" size={40} className="text-destructive mx-auto mb-3" />
                <p className="text-sm text-destructive mb-4">{previewError}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" iconName="Download" onClick={handleDownload}>
                    Download
                  </Button>
                  <Button variant="default" iconName="ExternalLink" onClick={openInNewTab}>
                    Open in new tab
                  </Button>
                </div>
              </div>
            )}

            {showPreview && mediaType === 'image' && (
              <img
                src={previewUrl}
                alt={document.name}
                className="max-w-full max-h-[50vh] object-contain rounded-lg"
                onError={() => {
                  setPreviewError(
                    'Could not display this image. Try Download or Open in tab.',
                  );
                  setPreviewUrl(null);
                }}
              />
            )}

            {showPreview && mediaType === 'pdf' && (
              <iframe
                title={document.name}
                src={previewUrl}
                className="w-full h-[50vh] rounded-lg bg-white border border-border"
              />
            )}

            {(showEmptyPreview || (!previewLoading && !previewError && mediaType === 'doc')) && (
              <div className="text-center">
                <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  {showEmptyPreview
                    ? 'Preview could not be embedded. Open or download the file to review.'
                    : 'Preview not available for this file type.'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" iconName="ExternalLink" onClick={openInNewTab}>
                    Open in new tab
                  </Button>
                  <Button variant="outline" iconName="Download" onClick={handleDownload}>
                    Download
                  </Button>
                </div>
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
          <Button variant="outline" onClick={openInNewTab} iconName="ExternalLink" disabled={submitting}>
            Open in tab
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
