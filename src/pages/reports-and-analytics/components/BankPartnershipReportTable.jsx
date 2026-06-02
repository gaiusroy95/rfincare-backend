import React from 'react';

import Icon from '../../../components/AppIcon';

const COLS = [
  { key: 'bank_name', label: 'Bank name' },
  { key: 'status', label: 'Status' },
  { key: 'commission_slab', label: 'Commission slab' },
  { key: 'submitted_cases', label: 'Submitted cases' },
  { key: 'approved_cases', label: 'Approved cases' },
  { key: 'rejected_cases', label: 'Rejected cases' },
  { key: 'approval_rate', label: 'Approval rate', pct: true },
  { key: 'disbursed_amount', label: 'Disbursed amount', money: true },
  { key: 'commission_earned', label: 'Commission earned', money: true },
  { key: 'avg_processing_time_days', label: 'Avg processing time (days)' },
  { key: 'approval_pct', label: 'Approval %', pct: true },
];

const formatCell = (col, val) => {
  if (val == null || val === '') return '—';
  if (col.pct) return `${val}%`;
  if (col.money) return `₹${Number(val).toLocaleString('en-IN')}`;
  if (col.key === 'status') return String(val);
  return String(val);
};

const BankPartnershipReportTable = ({ rows = [], loading = false, dateLabel = '' }) => {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">Loading bank partnership report…</p>
    );
  }

  if (!rows?.length) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">No banks configured yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <Icon name="Building2" size={20} className="text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm text-foreground">
          <p className="font-medium">Bank partnership performance</p>
          <p className="text-muted-foreground mt-1">
            Per-bank submission, approval, disbursement, and commission metrics
            {dateLabel ? ` (${dateLabel})` : ''}.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm min-w-[1200px]">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              {COLS.map((c) => (
                <th
                  key={c.key}
                  className="text-left font-semibold px-3 py-2.5 whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={`${row.bank_name}-${idx}`}
                className="border-b border-border last:border-0 bg-card"
              >
                {COLS.map((c) => (
                  <td
                    key={c.key}
                    className={`px-3 py-2 whitespace-nowrap text-foreground ${
                      c.money ? 'font-mono text-xs' : ''
                    } ${c.key === 'bank_name' ? 'font-medium' : ''}`}
                  >
                    {c.key === 'status' ? (
                      <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 capitalize">
                        {formatCell(c, row[c.key])}
                      </span>
                    ) : (
                      formatCell(c, row[c.key])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BankPartnershipReportTable;
