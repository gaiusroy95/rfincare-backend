import React from 'react';

import Icon from '../../../components/AppIcon';

const COLS = [
  { key: 'agent_name', label: 'Agent' },
  { key: 'agent_code', label: 'Agent code' },
  { key: 'payout_email', label: 'Email' },
  { key: 'payout_mobile', label: 'Mobile' },
  { key: 'commission_account_number', label: 'Account number' },
  { key: 'commission_bank_name', label: 'Bank name' },
  { key: 'commission_ifsc_code', label: 'IFSC' },
  { key: 'approved', label: 'Approved apps' },
  { key: 'payout_bank_ready', label: 'Bank ready' },
];

const AgentPayoutReportTable = ({ rows = [], loading = false, dateLabel = '' }) => {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">Loading agent payout details…</p>
    );
  }

  if (!rows?.length) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No agents found for this period.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-lg border border-agent-primary/20 bg-agent-primary/5 px-4 py-3">
        <Icon name="Landmark" size={20} className="text-agent-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm text-foreground">
          <p className="font-medium">Commission payout bank details</p>
          <p className="text-muted-foreground mt-1">
            Shows each agent&apos;s verified commission account from profile settings
            {dateLabel ? ` (${dateLabel})` : ''}. Use this to process commission transfers.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
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
            {rows.map((row, idx) => {
              const ready = row.payout_bank_ready === 'yes';
              return (
                <tr key={`${row.agent_code}-${idx}`} className="border-b border-border last:border-0">
                  {COLS.map((c) => {
                    if (c.key === 'payout_bank_ready') {
                      return (
                        <td key={c.key} className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              ready
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ready ? 'Ready' : 'Missing'}
                          </span>
                        </td>
                      );
                    }
                    const val = row[c.key];
                    const display =
                      val == null || val === ''
                        ? '—'
                        : c.key === 'commission_ifsc_code'
                          ? String(val).toUpperCase()
                          : String(val);
                    return (
                      <td
                        key={c.key}
                        className={`px-3 py-2 whitespace-nowrap ${
                          c.key === 'commission_account_number' ? 'font-mono' : ''
                        } ${c.key === 'agent_code' ? 'font-mono text-agent-primary' : 'text-foreground'}`}
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentPayoutReportTable;
