import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { apiClient } from '../../../lib/apiClient';

const APP_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'disbursed', label: 'Disbursed' },
  { value: 'rejected', label: 'Rejected' },
];

const COMM_STATUS_OPTIONS = [
  { value: 'all', label: 'All commission statuses' },
  { value: 'ineligible', label: 'Ineligible' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_process', label: 'In process' },
  { value: 'paid', label: 'Paid' },
];

const CommissionReportPanel = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applicationStatus, setApplicationStatus] = useState('all');
  const [commissionStatus, setCommissionStatus] = useState('all');
  const [loanType, setLoanType] = useState('all');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const params = { from, to, applicationStatus, commissionStatus, loanType };

  const loadPreview = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/portal/agent/reports/commission-report', { params });
      setPreview(res.data);
    } finally {
      setLoading(false);
    }
  };

  const download = async (format) => {
    const res = await apiClient.get('/portal/agent/reports/commission-report', {
      params: { ...params, format },
      responseType: 'blob',
    });
    const blob = new Blob([res.data], {
      type: format === 'pdf' ? 'application/pdf' : 'text/csv',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission-report-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
      <h2 className="text-lg font-bold text-foreground">Commission report</h2>
      <p className="text-sm text-muted-foreground">
        Filter by date, application status, commission status, and loan type. Export CSV for
        reconciliation or PDF for communication. Commission = % × disbursed amount; TDS 10% unless
        overridden on disbursement.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="From date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input label="To date" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Select
          label="Application status"
          options={APP_STATUS_OPTIONS}
          value={applicationStatus}
          onChange={setApplicationStatus}
        />
        <Select
          label="Commission status"
          options={COMM_STATUS_OPTIONS}
          value={commissionStatus}
          onChange={setCommissionStatus}
        />
        <Input
          label="Loan type (optional)"
          placeholder="e.g. personal_loan"
          value={loanType === 'all' ? '' : loanType}
          onChange={(e) => setLoanType(e.target.value || 'all')}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" loading={loading} onClick={loadPreview}>
          Preview
        </Button>
        <Button iconName="Download" onClick={() => download('csv')}>
          Download CSV
        </Button>
        <Button variant="outline" iconName="FileText" onClick={() => download('pdf')}>
          Download PDF
        </Button>
      </div>
      {preview?.entries?.length > 0 && (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 text-left">App #</th>
                <th className="p-2 text-left">Customer</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-right">Disbursed</th>
                <th className="p-2 text-right">Gross</th>
                <th className="p-2 text-right">TDS</th>
                <th className="p-2 text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              {preview.entries.slice(0, 20).map((row) => (
                <tr key={row.applicationNumber} className="border-t border-border">
                  <td className="p-2">{row.applicationNumber}</td>
                  <td className="p-2">{row.customerName}</td>
                  <td className="p-2">{row.commissionStatus}</td>
                  <td className="p-2 text-right">{row.disbursedAmount}</td>
                  <td className="p-2 text-right">{row.grossCommission}</td>
                  <td className="p-2 text-right">{row.tdsAmount}</td>
                  <td className="p-2 text-right">{row.netPayout}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground p-2">
            Generated {preview.generatedAt} — showing up to 20 rows
          </p>
        </div>
      )}
    </section>
  );
};

export default CommissionReportPanel;
