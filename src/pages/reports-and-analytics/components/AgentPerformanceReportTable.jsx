import React from 'react';

import Icon from '../../../components/AppIcon';

const COLS = [
  { key: 'agent_name', label: 'Agent name' },
  { key: 'agent_code', label: 'Agent code' },
  { key: 'customer_code', label: 'Customer code' },
  { key: 'application_number', label: 'Application #' },
  { key: 'customer_name', label: 'Customer name' },
  { key: 'loan_type', label: 'Loan type' },
  { key: 'status', label: 'Status' },
  { key: 'document_stage_status', label: 'Document stage' },
  { key: 'bank_approval_status', label: 'Bank approval' },
  { key: 'payout_status', label: 'Payout status' },
  { key: 'created_at', label: 'Created at' },
];

const payoutBadgeClass = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'paid') return 'bg-green-100 text-green-800';
  if (s === 'processed') return 'bg-blue-100 text-blue-800';
  if (s === 'not applicable') return 'bg-muted text-muted-foreground';
  return 'bg-amber-100 text-amber-800';
};

const formatCell = (key, val) => {
  if (val == null || val === '') return '—';
  if (key === 'created_at') {
    try {
      return new Date(val).toLocaleString('en-IN');
    } catch {
      return String(val);
    }
  }
  if (key === 'document_stage_status' || key === 'bank_approval_status') {
    return String(val).replace(/_/g, ' ');
  }
  return String(val);
};

const AgentPerformanceReportTable = ({ rows = [], loading = false, dateLabel = '' }) => {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">Loading agent performance…</p>
    );
  }

  if (!rows?.length) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No agent-linked applications in this period.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-lg border border-agent-primary/20 bg-agent-primary/5 px-4 py-3">
        <Icon name="TrendingUp" size={20} className="text-agent-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm text-foreground">
          <p className="font-medium">Agent performance detail</p>
          <p className="text-muted-foreground mt-1">
            One row per application with customer, loan, document/bank stages, and payout status
            {dateLabel ? ` (${dateLabel})` : ''}.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm min-w-[1100px]">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {COLS.map((c) => (
                <th
                  key={c.key}
                  className="text-left font-semibold text-foreground px-3 py-2 whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={`${row.application_number || idx}-${idx}`}
                className="border-b border-border last:border-0"
              >
                {COLS.map((c) => {
                  const val = row[c.key];
                  if (c.key === 'payout_status') {
                    const label = formatCell(c.key, val);
                    return (
                      <td key={c.key} className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${payoutBadgeClass(val)}`}
                        >
                          {label}
                        </span>
                      </td>
                    );
                  }
                  return (
                    <td
                      key={c.key}
                      className={`px-3 py-2 whitespace-nowrap text-foreground ${
                        c.key === 'agent_code' ? 'font-mono text-agent-primary' : ''
                      } ${c.key === 'customer_code' || c.key === 'application_number' ? 'font-mono text-xs' : ''}`}
                    >
                      {formatCell(c.key, val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentPerformanceReportTable;
