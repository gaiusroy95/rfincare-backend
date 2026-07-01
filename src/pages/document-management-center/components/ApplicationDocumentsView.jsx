import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { documentTypeLabel } from '../../../utils/documentUrls';
import { DOC_STATUS_LABELS } from '../../../services/documentManagementService';
import AgentDocumentUploadPanel from './AgentDocumentUploadPanel';

const statusStyles = {
  approved: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  uploaded: 'bg-blue-500/10 text-blue-600',
  rejected: 'bg-destructive/10 text-destructive',
  expired: 'bg-muted text-muted-foreground',
};

const ApplicationDocumentsView = ({
  application,
  documents,
  loading,
  isAgent = false,
  onBack,
  onOpenDocument,
  onDownload,
  onDocumentUploaded,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" iconName="ArrowLeft" onClick={onBack}>
          Back to applications
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-bold text-foreground">
            {application?.applicationNumber || application?.applicationId}
          </h2>
          <p className="text-sm text-muted-foreground">
            {application?.customerName} · {application?.customerPhone} · {application?.customerEmail}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{application?.totalDocs ?? 0}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-warning">{application?.pendingDocs ?? 0}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-success">{application?.approvedDocs ?? 0}</p>
          <p className="text-xs text-muted-foreground">Approved</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-destructive">{application?.rejectedDocs ?? 0}</p>
          <p className="text-xs text-muted-foreground">Rejected</p>
        </div>
      </div>

      {isAgent && (
        <AgentDocumentUploadPanel application={application} onUploaded={onDocumentUploaded} />
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading documents…</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
          No documents uploaded for this application.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => {
            const isImage = (doc.mimeType || '').startsWith('image/');
            const isPdf = String(doc.mimeType || doc.name || '').toLowerCase().includes('pdf');
            const status = doc.status || 'pending';
            return (
              <div
                key={doc.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onOpenDocument(doc)}
                onKeyDown={(e) => e.key === 'Enter' && onOpenDocument(doc)}
                role="button"
                tabIndex={0}
              >
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    <Icon
                      name={isImage ? 'Image' : isPdf ? 'FileText' : 'FileText'}
                      size={24}
                      className="text-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {documentTypeLabel(doc.documentType)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{doc.name}</p>
                    <span
                      className={`inline-flex mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        statusStyles[status] || statusStyles.pending
                      }`}
                    >
                      {DOC_STATUS_LABELS[status] || status}
                    </span>
                  </div>
                </div>
                {doc.verificationNote && (
                  <p className="mt-3 text-xs text-muted-foreground bg-muted/50 rounded p-2 line-clamp-2">
                    Remark: {doc.verificationNote}
                  </p>
                )}
                <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" iconName="Eye" onClick={() => onOpenDocument(doc)}>
                    Open
                  </Button>
                  <Button variant="outline" size="sm" iconName="Download" onClick={() => onDownload(doc)}>
                    Download
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationDocumentsView;
