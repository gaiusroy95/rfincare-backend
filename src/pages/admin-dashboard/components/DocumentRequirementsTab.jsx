import React, { useEffect, useMemo, useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { adminService } from '../../../services/adminService';
import { bankService } from '../../../services/apiServices';

const DEFAULT_FORM = {
  bankId: '',
  productType: '',
  loanType: '',
  documentType: '',
  title: '',
  subtitle: '',
  allowedFileTypesText: 'jpeg,png,pdf',
  sortOrder: 0,
  isRequired: true,
  isActive: true,
};

const LOAN_TYPE_OPTIONS = [
  { value: '', label: 'Any loan type' },
  { value: 'secured', label: 'Secured' },
  { value: 'unsecured', label: 'Unsecured' },
];

function toAllowedTypes(text) {
  return String(text || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

const DocumentRequirementsTab = () => {
  const [requirements, setRequirements] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [importing, setImporting] = useState(false);

  const bankOptions = useMemo(
    () => [{ value: '', label: 'Universal (all banks)' }].concat(
      (banks || []).map((bank) => ({ value: bank.id, label: bank.name })),
    ),
    [banks],
  );

  const loadData = async () => {
    setLoading(true);
    const [{ data: reqs, error: reqError }, loadedBanks] = await Promise.all([
      adminService.getDocumentRequirements(),
      bankService.getAllBanks().catch(() => []),
    ]);
    setRequirements(reqs || []);
    setBanks(Array.isArray(loadedBanks) ? loadedBanks : []);
    if (reqError) {
      setMessage(reqError.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm(DEFAULT_FORM);
  };

  const startEdit = (row) => {
    setEditing(row);
    setForm({
      bankId: row.bankId || '',
      productType: row.productType || '',
      loanType: row.loanType || '',
      documentType: row.documentType || '',
      title: row.title || '',
      subtitle: row.subtitle || '',
      allowedFileTypesText: (row.allowedFileTypes || []).join(','),
      sortOrder: row.sortOrder ?? 0,
      isRequired: row.isRequired !== false,
      isActive: row.isActive !== false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const payload = {
      bankId: form.bankId || null,
      productType: form.productType || null,
      loanType: form.loanType || null,
      documentType: form.documentType.trim(),
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      allowedFileTypes: toAllowedTypes(form.allowedFileTypesText),
      sortOrder: Number(form.sortOrder || 0),
      isRequired: Boolean(form.isRequired),
      isActive: Boolean(form.isActive),
    };

    const result = editing
      ? await adminService.updateDocumentRequirement(editing.id, payload)
      : await adminService.createDocumentRequirement(payload);

    setSaving(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    setMessage(editing ? 'Requirement updated.' : 'Requirement created.');
    resetForm();
    await loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this requirement?')) return;
    const { error } = await adminService.deleteDocumentRequirement(id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage('Requirement deleted.');
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Document Requirement Matrix</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Define universal or bank-specific required documents by product and loan type.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted">
              {importing ? 'Importing...' : 'Bulk import CSV'}
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              disabled={importing}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImporting(true);
                setMessage('');
                try {
                  const text = await file.text();
                  const replaceAll = window.confirm(
                    'Replace ALL existing document requirements with this CSV?\n\nOK = replace all\nCancel = append',
                  );
                  const { data, error } = await adminService.importDocumentRequirementsCsv(text, replaceAll);
                  if (error) {
                    setMessage(error.message);
                  } else {
                    setMessage(`Imported ${data?.imported ?? 0} document requirement rows.`);
                    await loadData();
                  }
                } finally {
                  setImporting(false);
                  e.target.value = '';
                }
              }}
            />
          </label>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const { error } = await adminService.exportDocumentRequirementsCsv();
              if (error) setMessage(error.message);
            }}
          >
            Export Current CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const template = [
                'Bank_Name,product_type,loan_type,Documents needed,document_2,document_3,document_4',
                'HDFC,Personal Loan,unsecured,Latest Passport size Photo,PAN Card,Aadhaar Card,Bank Statement-6months',
              ].join('\n');
              const blob = new Blob([template], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'document-requirements-template.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download CSV Template
          </Button>
        </div>
      </div>

      {message && (
        <div className="text-sm border border-border rounded-lg p-3 bg-muted/30">{message}</div>
      )}

      <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 space-y-4 bg-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Bank"
            options={bankOptions}
            value={form.bankId}
            onChange={(value) => setForm((prev) => ({ ...prev, bankId: value }))}
          />
          <Input
            label="Product Type"
            placeholder="e.g. Home Loan-Purchase"
            value={form.productType}
            onChange={(e) => setForm((prev) => ({ ...prev, productType: e.target.value }))}
          />
          <Select
            label="Loan Type"
            options={LOAN_TYPE_OPTIONS}
            value={form.loanType}
            onChange={(value) => setForm((prev) => ({ ...prev, loanType: value }))}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Document Key"
            placeholder="e.g. pan_card"
            required
            value={form.documentType}
            onChange={(e) => setForm((prev) => ({ ...prev, documentType: e.target.value }))}
          />
          <Input
            label="Document Title"
            placeholder="e.g. PAN Card"
            required
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <Input
            label="Sort Order"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
          />
        </div>
        <Input
          label="Subtitle (upload guidance)"
          placeholder="e.g. Clear photo or PDF; mask first 8 Aadhaar digits"
          value={form.subtitle}
          onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
        />
        <Input
          label="Allowed file types (comma separated)"
          placeholder="jpeg,png,pdf"
          value={form.allowedFileTypesText}
          onChange={(e) => setForm((prev) => ({ ...prev, allowedFileTypesText: e.target.value }))}
        />
        <div className="flex items-center gap-6">
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isRequired}
              onChange={(e) => setForm((prev) => ({ ...prev, isRequired: e.target.checked }))}
            />
            Required
          </label>
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            Active
          </label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {editing ? 'Update requirement' : 'Add requirement'}
          </Button>
          {editing && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel edit
            </Button>
          )}
        </div>
      </form>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left">Bank</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-left">Loan Type</th>
                <th className="px-3 py-2 text-left">Doc Key</th>
                <th className="px-3 py-2 text-left">Title</th>
                <th className="px-3 py-2 text-left">Allowed</th>
                <th className="px-3 py-2 text-left">Order</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && requirements.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-3 py-2">{banks.find((b) => b.id === row.bankId)?.name || 'Universal'}</td>
                  <td className="px-3 py-2">{row.productType || 'Any'}</td>
                  <td className="px-3 py-2">{row.loanType || 'Any'}</td>
                  <td className="px-3 py-2">{row.documentType}</td>
                  <td className="px-3 py-2">{row.title}</td>
                  <td className="px-3 py-2">{(row.allowedFileTypes || []).join(', ') || 'Any'}</td>
                  <td className="px-3 py-2">{row.sortOrder}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(row)}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(row.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && requirements.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                    No requirements added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentRequirementsTab;
