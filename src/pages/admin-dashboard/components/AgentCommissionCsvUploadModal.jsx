import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { adminService } from '../../../services/adminService';

const AgentCommissionCsvUploadModal = ({ isOpen, onClose, onImported }) => {
  const [csvFile, setCsvFile] = useState(null);
  const [circularFiles, setCircularFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    setError('');
    const { error: err } = await adminService.downloadAgentCommissionCsvTemplate();
    if (err) setError(err.message);
  };

  const handleUpload = async () => {
    if (!csvFile) {
      setError('Please select a CSV file.');
      return;
    }
    setUploading(true);
    setError('');
    setResult(null);
    const { data, error: err } = await adminService.uploadAgentCommissionCsv(csvFile, circularFiles);
    setUploading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setResult(data);
    onImported?.(data);
  };

  const handleClose = () => {
    setCsvFile(null);
    setCircularFiles([]);
    setResult(null);
    setError('');
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-border p-4 md:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Bulk commission CSV upload</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Update commission structure per agent using agent code (one row per agent + loan type).
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} type="button">
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-4 md:p-6 space-y-5">
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">CSV columns</p>
            <p>
              agent_name, agent_code, mobile_number, account_status, bank_details (or account_number /
              bank_name / ifsc_code), loan_type, commission_type, commission_value, min_loan_amount,
              max_loan_amount, effective_from, effective_to, circular_title, upload
            </p>
            <p>
              <strong>upload</strong> column: PDF filename (upload matching files below), URL, or
              /uploads/ path. <strong>bank_details</strong> optional format: account|bank|IFSC
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" iconName="Download" onClick={handleDownloadTemplate}>
              Download template
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Commission CSV *</label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="block w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Circular PDFs (optional)
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Select PDF files whose names match the upload column in your CSV.
            </p>
            <input
              type="file"
              accept="application/pdf,.pdf"
              multiple
              onChange={(e) => setCircularFiles(Array.from(e.target.files || []))}
              className="block w-full text-sm"
            />
          </div>

          {error && (
            <div className="text-sm text-error bg-error/10 border border-error rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-lg border border-border p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">
                Imported {result.imported} of {result.total} row(s)
                {result.failed > 0 ? ` — ${result.failed} failed` : ''}
              </p>
              <div className="max-h-48 overflow-y-auto text-xs space-y-1">
                {(result.results || []).map((r) => (
                  <div
                    key={`${r.line}-${r.status}`}
                    className={r.status === 'imported' ? 'text-success' : 'text-error'}
                  >
                    Line {r.line}: {r.status === 'imported' ? `OK (${r.agentCode})` : r.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-border">
            <Button type="button" variant="outline" fullWidth onClick={handleClose}>
              Close
            </Button>
            <Button type="button" fullWidth onClick={handleUpload} disabled={uploading} iconName="Upload">
              {uploading ? 'Uploading…' : 'Upload & apply'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentCommissionCsvUploadModal;
