import React, { useEffect, useMemo, useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { adminService } from '../../../services/adminService';
import { bankService } from '../../../services/apiServices';
import { LOAN_PRODUCTS } from '../../../constants/loanProducts';

const DEFAULT_FILTERS = {
  bankId: '',
  productType: '',
  loanType: '',
  workProfile: '',
  allowedFileTypesText: 'jpeg,png,pdf',
};

const LOAN_TYPE_OPTIONS = [
  { value: '', label: 'Select an option' },
  { value: 'secured', label: 'Secured' },
  { value: 'unsecured', label: 'Unsecured' },
];

const WORK_PROFILE_OPTIONS = [
  { value: '', label: 'Select an option' },
  { value: 'salaried', label: 'Salaried' },
  { value: 'business', label: 'Business' },
  { value: 'professional', label: 'Professional' },
  { value: 'self-employed', label: 'Self-employed' },
];

const DOCUMENT_MASTER = [
  'Photo',
  'Pan Card',
  'Masked Aadhar',
  'Bank Statements',
  'Loan Statements',
  'ITR last three year',
  'Form-16 latest two year',
  'Audit report last three year',
  'Udyham Aadhar',
  'SME Certificate',
  'Balance Sheet',
  'Property Paper/Purchase agreement',
];

function toAllowedTypes(text) {
  return String(text || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function toDocKey(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function buildComboKey(row) {
  return [row.bankId || '', normalizeText(row.productType || ''), normalizeText(row.loanType || '')].join('|');
}

function productLabel(value) {
  const normalized = normalizeText(value);
  const product = LOAN_PRODUCTS.find(
    (p) => normalizeText(p.apiKey) === normalized || normalizeText(p.label) === normalized,
  );
  return product?.label || value || '—';
}

const DocumentRequirementsTab = () => {
  const [requirements, setRequirements] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [docFlags, setDocFlags] = useState(
    Object.fromEntries(DOCUMENT_MASTER.map((name) => [toDocKey(name), false])),
  );

  const bankNameById = useMemo(() => new Map((banks || []).map((bank) => [bank.id, bank.name])), [banks]);

  const bankOptions = useMemo(
    () =>
      [{ value: '', label: 'Select an option' }].concat(
        (banks || []).map((bank) => ({ value: bank.id, label: bank.name })),
      ),
    [banks],
  );

  const productOptions = useMemo(
    () =>
      [{ value: '', label: 'Selection from Dropdown product list' }].concat(
        LOAN_PRODUCTS.map((p) => ({ value: p.apiKey, label: p.label })),
      ),
    [],
  );

  const groupedHistory = useMemo(() => {
    const groups = new Map();
    for (const row of requirements) {
      const key = buildComboKey(row);
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          bankId: row.bankId || '',
          productType: row.productType || '',
          loanType: row.loanType || '',
          rows: [],
          updatedAt: row.updatedAt || row.createdAt || null,
        });
      }
      const group = groups.get(key);
      group.rows.push(row);
      const rowDate = new Date(row.updatedAt || row.createdAt || 0).getTime();
      const groupDate = new Date(group.updatedAt || 0).getTime();
      if (rowDate > groupDate) group.updatedAt = row.updatedAt || row.createdAt || group.updatedAt;
    }
    return Array.from(groups.values()).sort(
      (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
    );
  }, [requirements]);

  const loadData = async () => {
    setLoading(true);
    setHistoryLoading(true);
    const [{ data: reqs, error: reqError }, loadedBanks] = await Promise.all([
      adminService.getDocumentRequirements(),
      bankService.getAllBanks().catch(() => []),
    ]);
    setRequirements(reqs || []);
    setBanks(Array.isArray(loadedBanks) ? loadedBanks : []);
    if (reqError) setMessage(reqError.message);
    setLoading(false);
    setHistoryLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedKey = buildComboKey(filters);

  const selectedRows = useMemo(
    () => requirements.filter((row) => buildComboKey(row) === selectedKey),
    [requirements, selectedKey],
  );

  const applyRowsToMatrix = (rows) => {
    const next = Object.fromEntries(DOCUMENT_MASTER.map((name) => [toDocKey(name), false]));
    for (const row of rows) {
      const key = toDocKey(row.title || row.documentType || '');
      if (key) next[key] = row.isActive !== false;
    }
    setDocFlags(next);
  };

  useEffect(() => {
    applyRowsToMatrix(selectedRows);
    // Only rehydrate matrix when combo changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  const resetMatrix = () => {
    applyRowsToMatrix(selectedRows);
    setMessage('');
  };

  const clearSelection = () => {
    setFilters(DEFAULT_FILTERS);
    setDocFlags(Object.fromEntries(DOCUMENT_MASTER.map((name) => [toDocKey(name), false])));
    setMessage('');
  };

  const openFromHistory = (group) => {
    setFilters((prev) => ({
      ...prev,
      bankId: group.bankId || '',
      productType: group.productType || '',
      loanType: group.loanType || '',
    }));
    applyRowsToMatrix(group.rows || []);
  };

  const saveConfiguration = async () => {
    if (!filters.productType) {
      setMessage('Please select Product Type before saving configuration.');
      return;
    }
    setSaving(true);
    setMessage('');

    const allowedTypes = toAllowedTypes(filters.allowedFileTypesText);
    const activeKeys = Object.entries(docFlags)
      .filter(([, checked]) => checked)
      .map(([key]) => key);

    const existingByKey = new Map(
      selectedRows.map((row) => [toDocKey(row.title || row.documentType || ''), row]),
    );

    try {
      for (const row of selectedRows) {
        const rowKey = toDocKey(row.title || row.documentType || '');
        const shouldBeActive = activeKeys.includes(rowKey);
        const { error } = await adminService.updateDocumentRequirement(row.id, {
          bankId: filters.bankId || null,
          productType: filters.productType || null,
          loanType: filters.loanType || null,
          title: row.title,
          documentType: row.documentType || rowKey,
          subtitle: row.subtitle || null,
          allowedFileTypes: allowedTypes,
          sortOrder: DOCUMENT_MASTER.findIndex((name) => toDocKey(name) === rowKey),
          isRequired: shouldBeActive,
          isActive: shouldBeActive,
        });
        if (error) throw new Error(error.message);
      }

      for (const key of activeKeys) {
        if (existingByKey.has(key)) continue;
        const title = DOCUMENT_MASTER.find((name) => toDocKey(name) === key) || key;
        const { error } = await adminService.createDocumentRequirement({
          bankId: filters.bankId || null,
          productType: filters.productType || null,
          loanType: filters.loanType || null,
          title,
          documentType: key,
          subtitle: null,
          allowedFileTypes: allowedTypes,
          sortOrder: DOCUMENT_MASTER.findIndex((name) => toDocKey(name) === key),
          isRequired: true,
          isActive: true,
        });
        if (error) throw new Error(error.message);
      }

      await loadData();
      setMessage('Configuration saved successfully.');
    } catch (err) {
      setMessage(err?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Document Requirement Matrix</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Define and sync document requirements by Bank, Product Type, and Loan Type.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted">
              {importing ? 'Importing...' : 'Import CSV'}
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
                  if (error) setMessage(error.message);
                  else {
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
            Export Current (Excel)
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const template = [
                'Bank_Name,product_type,loan_type,work_profile,Documents needed,document_2,document_3,document_4',
                'HDFC,Personal Loan,unsecured,salaried,Latest Passport size Photo,PAN Card,Aadhaar Card,Bank Statement-6months',
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
            Download Excel Template
          </Button>
        </div>
      </div>

      {message && (
        <div className="text-sm border border-border rounded-lg p-3 bg-muted/30">{message}</div>
      )}

      <div className="border border-border rounded-lg p-4 space-y-4 bg-card">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Select
            label="Bank"
            options={bankOptions}
            value={filters.bankId}
            onChange={(value) => setFilters((prev) => ({ ...prev, bankId: value }))}
          />
          <Select
            label="Product Type"
            options={productOptions}
            value={filters.productType}
            onChange={(value) => setFilters((prev) => ({ ...prev, productType: value }))}
          />
          <Select
            label="Loan Type"
            options={LOAN_TYPE_OPTIONS}
            value={filters.loanType}
            onChange={(value) => setFilters((prev) => ({ ...prev, loanType: value }))}
          />
          <Select
            label="Work Profile"
            options={WORK_PROFILE_OPTIONS}
            value={filters.workProfile}
            onChange={(value) => setFilters((prev) => ({ ...prev, workProfile: value }))}
          />
        </div>

        <Input
          label="Allowed file types (comma separated)"
          value={filters.allowedFileTypesText}
          placeholder="jpg,png,pdf"
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, allowedFileTypesText: e.target.value }))
          }
        />

        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-2 py-2 text-left w-[50px]">#</th>
                {DOCUMENT_MASTER.map((doc) => (
                  <th key={doc} className="px-2 py-2 text-left">
                    {doc}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-2 py-2">1</td>
                {DOCUMENT_MASTER.map((doc) => {
                  const key = toDocKey(doc);
                  return (
                    <td key={key} className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={Boolean(docFlags[key])}
                        onChange={(e) =>
                          setDocFlags((prev) => ({ ...prev, [key]: e.target.checked }))
                        }
                      />
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button type="button" onClick={saveConfiguration} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
          <Button type="button" variant="outline" onClick={resetMatrix}>
            Reset
          </Button>
          <Button type="button" variant="outline" onClick={clearSelection}>
            Cancel
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <h3 className="font-semibold text-foreground">Configuration History</h3>
          <p className="text-xs text-muted-foreground">
            View and manage previously updated document requirements.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Updated On</th>
                <th className="px-3 py-2 text-left">Bank</th>
                <th className="px-3 py-2 text-left">Product Type</th>
                <th className="px-3 py-2 text-left">Loan Type</th>
                <th className="px-3 py-2 text-left">Work Profile</th>
                <th className="px-3 py-2 text-left">Updated Documents</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {!historyLoading &&
                groupedHistory.map((group, idx) => (
                  <tr key={group.key} className="border-t border-border">
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2">
                      {group.updatedAt ? new Date(group.updatedAt).toLocaleString('en-IN') : '—'}
                    </td>
                    <td className="px-3 py-2">{bankNameById.get(group.bankId) || 'Universal'}</td>
                    <td className="px-3 py-2">{productLabel(group.productType || 'Any')}</td>
                    <td className="px-3 py-2">{group.loanType || 'Any'}</td>
                    <td className="px-3 py-2">{filters.workProfile || '-'}</td>
                    <td className="px-3 py-2">
                      {(group.rows || []).filter((row) => row.isActive !== false).length} Documents
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openFromHistory(group)}>
                          View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openFromHistory(group)}>
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!historyLoading && groupedHistory.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                    No configuration history available.
                  </td>
                </tr>
              )}
              {historyLoading && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                    Loading history...
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
