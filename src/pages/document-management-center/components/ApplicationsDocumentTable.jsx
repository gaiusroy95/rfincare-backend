import React from 'react';
import Icon from '../../../components/AppIcon';
import { DOC_SUMMARY_LABELS } from '../../../services/documentManagementService';

const summaryStyles = {
  no_documents: 'bg-muted text-muted-foreground',
  pending_review: 'bg-warning/10 text-warning',
  has_rejected: 'bg-destructive/10 text-destructive',
  all_approved: 'bg-success/10 text-success',
  in_review: 'bg-blue-500/10 text-blue-600',
};

const ApplicationsDocumentTable = ({ applications, onSelectApplication, loading, isAgent = false }) => {
  if (loading) {
    return (
      <div className="text-center py-16">
        <span className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Loading applications…</p>
      </div>
    );
  }

  if (!applications?.length) {
    return (
      <div className="text-center py-16">
        <Icon name="FolderOpen" size={48} className="text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">
          {isAgent
            ? 'No applications found. Search by application number or customer mobile (10 digits). Only applications you submitted appear here.'
            : 'No applications found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="w-full min-w-[900px]">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Application ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Customer name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Mobile</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Email</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Documents</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Breakdown</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {applications.map((app) => {
            const summary = app.documentSummaryStatus || 'no_documents';
            return (
              <tr
                key={app.applicationId}
                className="hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => onSelectApplication(app)}
              >
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="text-sm font-semibold text-primary hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectApplication(app);
                    }}
                  >
                    {app.applicationNumber || app.applicationId}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{app.customerName || '—'}</td>
                <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                  {app.customerPhone || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[200px]">
                  {app.customerEmail || '—'}
                </td>
                <td className="px-4 py-3 text-sm font-medium">{app.totalDocs ?? 0}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      summaryStyles[summary] || summaryStyles.in_review
                    }`}
                  >
                    {DOC_SUMMARY_LABELS[summary] || summary}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  <span className="text-success">{app.approvedDocs ?? 0} approved</span>
                  {' · '}
                  <span className="text-warning">{app.pendingDocs ?? 0} pending</span>
                  {' · '}
                  <span className="text-destructive">{app.rejectedDocs ?? 0} rejected</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationsDocumentTable;
