import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { resolveUploadUrl } from '../../../utils/documentUrls';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CommissionConfigModal = ({ agent, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    loanType: 'home_loan',
    commissionType: 'percentage',
    commissionValue: 2.5,
    minLoanAmount: '',
    maxLoanAmount: '',
    effectiveFrom: new Date()?.toISOString()?.split('T')?.[0],
    effectiveTo: '',
    circularTitle: '',
    circularFileUrl: '',
  });
  const [circularTitle, setCircularTitle] = useState('');
  const [circularDescription, setCircularDescription] = useState('');
  const [circularFile, setCircularFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [circulars, setCirculars] = useState([]);

  useEffect(() => {
    if (!isOpen || !agent?.id) return;
    (async () => {
      const { data } = await adminService.getAgentCommission(agent.id);
      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        setFormData({
          loanType: row.loanType || row.loan_type || 'home_loan',
          commissionType: row.commissionType || row.commission_type || 'percentage',
          commissionValue: row.commissionValue ?? row.commission_value ?? 2.5,
          minLoanAmount: row.minLoanAmount ?? row.min_loan_amount ?? '',
          maxLoanAmount: row.maxLoanAmount ?? row.max_loan_amount ?? '',
          effectiveFrom: row.effectiveFrom || row.effective_from || new Date().toISOString().split('T')[0],
          effectiveTo: row.effectiveTo || row.effective_to || '',
          circularTitle: row.circularTitle || row.circular_title || '',
          circularFileUrl: row.circularFileUrl || row.circular_file_url || '',
        });
      }
      const circularRes = await adminService.getCommissionCirculars();
      setCirculars(circularRes?.data || []);
    })();
  }, [isOpen, agent?.id]);

  const loanTypeOptions = [
    { value: 'home_loan', label: 'Home Loan' },
    { value: 'personal_loan', label: 'Personal Loan' },
    { value: 'business_loan', label: 'Business Loan' },
    { value: 'auto_loan', label: 'Auto Loan' },
    { value: 'education_loan', label: 'Education Loan' }
  ];

  const commissionTypeOptions = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed', label: 'Fixed Amount (₹)' }
  ];

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSave(formData);
  };

  const handleUploadCircular = async () => {
    if (!circularFile) {
      alert('Please select a PDF file first.');
      return;
    }
    setUploading(true);
    const { error } = await adminService.uploadCommissionCircular({
      title: circularTitle,
      description: circularDescription,
      file: circularFile,
    });
    setUploading(false);
    if (error) {
      alert(error.message);
      return;
    }
    setCircularTitle('');
    setCircularDescription('');
    setCircularFile(null);
    const circularRes = await adminService.getCommissionCirculars();
    setCirculars(circularRes?.data || []);
    alert('Circular uploaded and now visible to all agents.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-border p-4 md:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Configure Commission</h2>
            <p className="text-sm text-muted-foreground">
              Agent: {agent?.name || agent?.agent_name || '—'} ({agent?.agentId || agent?.agent_code || '—'})
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Loan Type"
              options={loanTypeOptions}
              value={formData?.loanType}
              onChange={(value) => setFormData({ ...formData, loanType: value })}
              required
            />

            <Select
              label="Commission Type"
              options={commissionTypeOptions}
              value={formData?.commissionType}
              onChange={(value) => setFormData({ ...formData, commissionType: value })}
              required
            />

            <Input
              label={`Commission Value ${formData?.commissionType === 'percentage' ? '(%)' : '(₹)'}`}
              type="number"
              step="0.01"
              value={formData?.commissionValue}
              onChange={(e) => setFormData({ ...formData, commissionValue: e?.target?.value })}
              required
            />

            <Input
              label="Minimum Loan Amount (₹)"
              type="number"
              value={formData?.minLoanAmount}
              onChange={(e) => setFormData({ ...formData, minLoanAmount: e?.target?.value })}
              placeholder="Optional"
            />

            <Input
              label="Maximum Loan Amount (₹)"
              type="number"
              value={formData?.maxLoanAmount}
              onChange={(e) => setFormData({ ...formData, maxLoanAmount: e?.target?.value })}
              placeholder="Optional"
            />

            <Input
              label="Effective From"
              type="date"
              value={formData?.effectiveFrom}
              onChange={(e) => setFormData({ ...formData, effectiveFrom: e?.target?.value })}
              required
            />

            <Input
              label="Effective To"
              type="date"
              value={formData?.effectiveTo}
              onChange={(e) => setFormData({ ...formData, effectiveTo: e?.target?.value })}
              placeholder="Optional"
            />

            <Input
              label="Circular title"
              value={formData?.circularTitle}
              onChange={(e) => setFormData({ ...formData, circularTitle: e?.target?.value })}
              placeholder="e.g. Commission policy Q1 2026"
            />

            <Input
              label="Circular file URL / upload reference"
              value={formData?.circularFileUrl}
              onChange={(e) => setFormData({ ...formData, circularFileUrl: e?.target?.value })}
              placeholder="PDF URL or filename from bulk upload"
            />
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={20} color="var(--color-primary)" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Commission Calculation</p>
                <p>
                  {formData?.commissionType === 'percentage'
                    ? `Agent will receive ${formData?.commissionValue}% of the loan amount as commission.`
                    : `Agent will receive a fixed amount of ₹${formData?.commissionValue} per approved loan.`}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Commission Circular (PDF)</h3>
            <p className="text-xs text-muted-foreground">
              Upload circular once and it becomes visible to all agents in Agent Dashboard.
            </p>
            <Input
              label="Circular title"
              value={circularTitle}
              onChange={(e) => setCircularTitle(e.target.value)}
              placeholder="e.g. Commission update May 2026"
            />
            <Input
              label="Description (optional)"
              value={circularDescription}
              onChange={(e) => setCircularDescription(e.target.value)}
              placeholder="Short note for agents"
            />
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setCircularFile(e.target.files?.[0] || null)}
              className="block w-full text-sm"
            />
            <Button type="button" variant="outline" onClick={handleUploadCircular} disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload Circular PDF'}
            </Button>

            {circulars.length > 0 && (
              <div className="space-y-2">
                {circulars.slice(0, 5).map((c) => (
                  <a
                    key={c.id}
                    href={resolveUploadUrl(c.fileUrl || c.file_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm text-primary hover:underline"
                  >
                    {c.title}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-border">
            <Button variant="outline" fullWidth onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="default" fullWidth type="submit">
              Save Commission Config
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommissionConfigModal;
