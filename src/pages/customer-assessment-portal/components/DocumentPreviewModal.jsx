import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { customerJourneyService } from '../../../services/customerJourneyService';
import { loadDocumentPreviewUrl } from '../../../utils/documentUrls';

const DocumentPreviewModal = ({ isOpen, document, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !document) {
      setPreviewUrl(null);
      setError('');
      return undefined;
    }

    if (document.localPreviewUrl) {
      setPreviewUrl(document.localPreviewUrl);
      setLoading(false);
      setError('');
      return undefined;
    }

    let revoke = () => {};
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      const result = await loadDocumentPreviewUrl(
        document,
        customerJourneyService.downloadDocument.bind(customerJourneyService),
      );
      if (cancelled) {
        result.revoke();
        return;
      }
      revoke = result.revoke;
      if (result.url) {
        setPreviewUrl(result.url);
      } else {
        setError(result.error || 'Could not load document. Please try again.');
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
      revoke();
    };
  }, [isOpen, document?.id, document?.localPreviewUrl]);

  if (!isOpen || !document) return null;

  const mimeType = document.mimeType || '';
  const isPdf = mimeType.includes('pdf');
  const isImage = mimeType.includes('image');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-preview-title"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 md:px-6">
          <div className="min-w-0">
            <h2 id="document-preview-title" className="text-lg font-semibold text-foreground truncate">
              {document.label || document.documentName}
            </h2>
            {document.documentName && document.label && (
              <p className="text-sm text-muted-foreground truncate">{document.documentName}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close preview">
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6 bg-muted/30 min-h-[240px]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              <p className="text-sm text-muted-foreground">Loading preview...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
              <Icon name="AlertCircle" size={32} className="text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {!loading && !error && previewUrl && isImage && (
            <img
              src={previewUrl}
              alt={document.documentName || 'Document preview'}
              className="max-w-full max-h-[70vh] mx-auto rounded-lg border border-border object-contain bg-white"
            />
          )}

          {!loading && !error && previewUrl && isPdf && (
            <iframe
              title={document.documentName || 'Document preview'}
              src={previewUrl}
              className="w-full h-[70vh] rounded-lg border border-border bg-white"
            />
          )}

          {!loading && !error && previewUrl && !isImage && !isPdf && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <Icon name="FileText" size={40} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Preview is not available for this file type. You can download it instead.
              </p>
              <a
                href={previewUrl}
                download={document.documentName || 'document'}
                className="text-primary font-medium hover:underline"
              >
                Download file
              </a>
            </div>
          )}
        </div>

        <div className="border-t border-border px-4 py-3 md:px-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
