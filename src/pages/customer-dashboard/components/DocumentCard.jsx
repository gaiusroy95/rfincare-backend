import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { customerJourneyService } from '../../../services/customerJourneyService';
import { documentTypeLabel } from '../../../utils/documentUrls';
import DocumentPreviewModal from '../../customer-assessment-portal/components/DocumentPreviewModal';

const DocumentCard = ({ document, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const getStatusColor = (status) => {
    const colors = {
      verified: 'text-green-600 bg-green-50',
      pending: 'text-yellow-600 bg-yellow-50',
      rejected: 'text-red-600 bg-red-50',
      required: 'text-orange-600 bg-orange-50',
    };
    return colors?.[status] || 'text-gray-600 bg-gray-50';
  };

  const getStatusIcon = (status) => {
    const icons = {
      verified: 'CheckCircle2',
      pending: 'Clock',
      rejected: 'XCircle',
      required: 'AlertCircle',
    };
    return icons?.[status] || 'FileText';
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return 'FileText';
    if (mimeType?.includes('image')) return 'Image';
    return 'File';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const displayName =
    document?.documentName ||
    documentTypeLabel(document?.documentType) ||
    'Document';

  const handleDownload = async () => {
    if (!document?.id) return;
    setLoading(true);
    const { data, error } = await customerJourneyService.downloadDocument(document.id);
    if (!error && data?.blob) {
      const url = URL.createObjectURL(data.blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = data.fileName || displayName;
      link.click();
      URL.revokeObjectURL(url);
    }
    setLoading(false);
  };

  const handleView = () => {
    if (!document?.id) return;
    setPreviewDoc({
      ...document,
      label: documentTypeLabel(document.documentType) || displayName,
    });
  };

  const handleDelete = async () => {
    if (!document?.id || !confirm('Are you sure you want to delete this document?')) return;
    setLoading(true);
    const { error } = await customerJourneyService.deleteDocument(document.id);
    if (!error) onDelete?.(document.id);
    setLoading(false);
  };

  const canOpen = Boolean(document?.id);

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-300">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name={getFileIcon(document?.mimeType)} size={20} color="var(--color-primary)" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm md:text-base font-semibold text-foreground mb-1 truncate">
              {displayName}
            </h4>
            {document?.documentType && (
              <p className="text-xs text-muted-foreground mb-1">
                {documentTypeLabel(document.documentType)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mb-2">
              {formatDate(document?.uploadedAt)}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document?.status)}`}
              >
                <Icon name={getStatusIcon(document?.status)} size={12} />
                {document?.status?.charAt(0)?.toUpperCase() + document?.status?.slice(1)}
              </span>
              {document?.fileSize && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatFileSize(document.fileSize)}
                </span>
              )}
            </div>
          </div>
        </div>
        {document?.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-red-800">
              <span className="font-semibold">Rejection reason: </span>
              {document.rejectionReason}
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          {canOpen && document?.status !== 'required' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                iconName="Download"
                iconPosition="left"
                onClick={handleDownload}
                disabled={loading}
              >
                Download
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                iconName="Eye"
                iconPosition="left"
                onClick={handleView}
                disabled={loading}
              >
                View
              </Button>
            </>
          )}
          {document?.status === 'required' && (
            <Button variant="default" size="sm" className="flex-1" iconName="Upload" disabled={loading}>
              Upload
            </Button>
          )}
          {canOpen && document?.status !== 'required' && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              iconName="Trash2"
              onClick={handleDelete}
              disabled={loading}
              className="text-destructive"
            />
          )}
        </div>
      </div>

      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </>
  );
};

export default DocumentCard;
