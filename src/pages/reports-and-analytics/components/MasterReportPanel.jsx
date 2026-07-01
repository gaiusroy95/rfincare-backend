import React, { useState } from 'react';

import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MasterReportPanel = ({
  masterData,
  loading = false,
  downloading = false,
  dateLabel = '',
  onDownload,
  onDownloadCombinedOnly,
}) => {
  const [expanded, setExpanded] = useState(null);
  const sections = masterData?.sections || [];
  const summary = masterData?.summary;

  if (loading && !sections.length) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">Preparing master report…</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 md:p-6">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Icon name="FileArchive" size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Master report</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Downloads every report type in one package: applications, agents, financials, banks,
              customers, leads, and audit logs
              {dateLabel ? ` for ${dateLabel}` : ''}.
            </p>
            {summary && (
              <p className="text-xs text-muted-foreground mt-2">
                {summary.sectionCount} sections · {summary.totalRows} total rows
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <Button
            variant="default"
            iconName="Download"
            loading={downloading}
            onClick={onDownload}
          >
            Download all (ZIP-style)
          </Button>
          <Button
            variant="outline"
            iconName="FileText"
            loading={downloading}
            onClick={onDownloadCombinedOnly}
          >
            Single combined CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sections.map((section) => (
          <div
            key={section.key}
            className="border border-border rounded-lg bg-card overflow-hidden"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50"
              onClick={() => setExpanded(expanded === section.key ? null : section.key)}
            >
              <div>
                <p className="font-medium text-sm text-foreground">{section.name}</p>
                <p className="text-xs text-muted-foreground">
                  {section.rowCount} rows · {section.columns?.length || 0} columns
                </p>
              </div>
              <Icon
                name={expanded === section.key ? 'ChevronUp' : 'ChevronDown'}
                size={18}
                className="text-muted-foreground"
              />
            </button>
            {expanded === section.key && section.columns?.length > 0 && (
              <div className="px-4 pb-3 text-xs text-muted-foreground border-t border-border pt-2">
                {section.columns.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasterReportPanel;
