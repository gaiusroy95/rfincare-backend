import React from 'react';

import Icon from '../../../components/AppIcon';

const COLS = [
  { key: 'bank_name', label: 'Bank name' },
  { key: 'loan_type', label: 'Loan type' },
  { key: 'total_cases', label: 'Total cases' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'pending', label: 'Pending' },
  { key: 'disbursed', label: 'Disbursed' },
  { key: 'loan_amount', label: 'Loan amount', money: true },
  { key: 'disbursed_amount', label: 'Disbursed amount', money: true },
  { key: 'commission_earned', label: 'Commission earned', money: true },
  { key: 'agent_payout', label: 'Agent payout', money: true },
  { key: 'net_revenue', label: 'Net revenue', money: true },
  { key: 'approval_pct', label: 'Approval %', pct: true },
  { key: 'avg_ticket_size', label: 'Avg ticket size', money: true },
  { key: 'approval_ratio_pct', label: 'Approval ratio %', pct: true },
  { key: 'disbursement_ratio_pct', label: 'Disbursement ratio %', pct: true },
];

const formatCell = (col, val) => {
  if (val == null || val === '') return '—';
  if (col.pct) return `${val}%`;
  if (col.money) return `₹${Number(val).toLocaleString('en-IN')}`;
  if (col.key === 'loan_type') return String(val).replace(/_/g, ' ');
  return String(val);
};

const FinancialSummaryReportTable = ({ rows = [], loading = false, dateLabel = '' }) => {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">Loading financial summary…</p>
    );
  }

  if (!rows?.length) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No applications in this period for financial summary.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-lg border border-conversion/20 bg-conversion/5 px-4 py-3">
        <Icon name="IndianRupee" size={20} className="text-conversion flex-shrink-0 mt-0.5" />
        <div className="text-sm text-foreground">
          <p className="font-medium">Financial summary by bank &amp; loan type</p>
          <p className="text-muted-foreground mt-1">
            Cases, amounts, commission, and ratios{dateLabel ? ` (${dateLabel})` : ''}.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm min-w-[1400px]">
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
                key={`${row.bank_name}-${row.loan_type}-${idx}`}
                className="border-b border-border last:border-0"
              >
                {COLS.map((c) => (
                  <td
                    key={c.key}
                    className={`px-3 py-2 whitespace-nowrap text-foreground ${
                      c.money ? 'font-mono text-xs' : ''
                    }`}
                  >
                    {formatCell(c, row[c.key])}
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

export default FinancialSummaryReportTable;
