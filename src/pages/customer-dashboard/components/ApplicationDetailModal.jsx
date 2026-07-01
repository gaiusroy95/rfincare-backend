import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { customerJourneyService } from '../../../services/customerJourneyService';
import { buildApplicationDetailSections } from '../../../utils/applicationFormDetails';
import { documentTypeLabel } from '../../../utils/documentUrls';
import { formatInr } from '../../../utils/currency';
import TimelineCard from './TimelineCard';
import DocumentPreviewModal from '../../customer-assessment-portal/components/DocumentPreviewModal';

const formatStatus = (status) =>
  status?.split('_')?.map((w) => w.charAt(0).toUpperCase() + w.slice(1))?.join(' ') || status;

const ApplicationDetailModal = ({ applicationId, summary, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    if (!isOpen || !applicationId) {
      setDetail(null);
      setDocuments([]);
      setTimeline([]);
      setError('');
      return undefined;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      const [appRes, docsRes, timelineRes] = await Promise.all([
        customerJourneyService.getApplicationById(applicationId),
        customerJourneyService.getMyDocuments(applicationId),
        customerJourneyService.getApplicationTimeline(applicationId),
      ]);
      if (cancelled) return;

      if (appRes.error) {
        setError(appRes.error.message || 'Could not load application details');
      } else {
        setDetail(appRes.data);
      }
      setDocuments(docsRes.data || []);
      setTimeline(
        (timelineRes.data || []).map((e) => ({
          id: e.id,
          type: e.status === 'approved' ? 'approval' : e.status === 'rejected' ? 'rejection' : 'update',
          title: formatStatus(e.status),
          description: e.message || `Status: ${formatStatus(e.status)}`,
          timestamp: e.createdAt
            ? new Date(e.createdAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
        })),
      );
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, applicationId]);

  if (!isOpen) return null;

  const sections = detail ? buildApplicationDetailSections(detail) : [];
  const appNumber = detail?.applicationNumber || summary?.applicationNumber || applicationId;
  const loanType =
    detail?.loanTypeLabel ||
    detail?.loanType ||
    summary?.loanType ||
    'Loan Application';
  const loanAmount =
    detail?.loanAmount ??
    summary?.loanAmount ??
    0;
  const status = detail?.status || summary?.status;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div
          className="bg-card rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-4 md:px-6 shrink-0">
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-foreground truncate">{loanType}</h2>
              <p className="text-sm text-muted-foreground truncate">
                {appNumber} · {formatStatus(status)}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {loading && (
              <div className="flex flex-col items-center py-12 gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                <p className="text-sm text-muted-foreground">Loading application…</p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
            )}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Loan amount</p>
                    <p className="font-semibold">{formatInr(loanAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bank</p>
                    <p className="font-semibold">{detail?.bank?.name || summary?.bankName || 'Rfincare Partner'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Applied</p>
                    <p className="font-semibold">{summary?.appliedDate || '—'}</p>
                  </div>
                </div>

                {sections.map((section) => (
                  <div key={section.title} className="rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                      <Icon name={section.icon} size={16} className="text-primary" />
                      {section.title}
                    </h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      {section.fields.map((field) => (
                        <div key={field.key}>
                          <dt className="text-muted-foreground">{field.label}</dt>
                          <dd className="font-medium break-words">{field.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}

                {sections.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No detailed form data is saved for this application yet.
                  </p>
                )}

                <div>
                  <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                    <Icon name="FolderOpen" size={18} className="text-primary" />
                    Documents ({documents.length})
                  </h3>
                  {documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents uploaded for this application.</p>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {documentTypeLabel(doc.documentType)}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{doc.documentName}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            iconName="Eye"
                            onClick={() => setPreviewDoc({ ...doc, label: documentTypeLabel(doc.documentType) })}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {timeline.length > 0 && <TimelineCard events={timeline} />}
              </>
            )}
          </div>

          <div className="border-t border-border px-4 py-3 md:px-6 flex justify-end shrink-0">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
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

export default ApplicationDetailModal;
