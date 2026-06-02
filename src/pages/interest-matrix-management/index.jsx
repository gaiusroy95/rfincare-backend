import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';

import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { interestMatrixService } from '../../services/interestMatrixService';
import MatrixFilters from './components/MatrixFilters';
import MatrixGrid from './components/MatrixGrid';
import RateModal from './components/RateModal';
import ImpactAnalyzer from './components/ImpactAnalyzer';
import BulkActions from './components/BulkActions';
import RateHeatmap from './components/RateHeatmap';
import VersionHistory from './components/VersionHistory';
import { bankService } from '../../services/apiServices';

const CSV_TEMPLATE = `bank_name,product_type,loan_type,credit_score_min,credit_score_max,loan_amount_min,loan_amount_max,term_min,term_max,interest_rate,status,effective_date,change_note
HDFC Bank,Personal Loan,Unsecured,700,900,10000,50000,12,60,6.5,active,2026-01-01,Initial rate`;

const InterestMatrixManagement = () => {
  const [matrixData, setMatrixData] = useState([]);
  const [matrixLoading, setMatrixLoading] = useState(true);
  const [matrixError, setMatrixError] = useState('');
  const [importing, setImporting] = useState(false);
  const [bankOptions, setBankOptions] = useState([]);

  const loadMatrix = useCallback(async () => {
    setMatrixLoading(true);
    setMatrixError('');
    try {
      const rows = await interestMatrixService.list();
      setMatrixData(rows || []);
    } catch (err) {
      setMatrixError(err?.response?.data?.error || err?.message || 'Failed to load interest matrix');
    } finally {
      setMatrixLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const banks = await bankService.getActiveBanks({ includeProducts: false });
        setBankOptions(
          (banks || []).map((bank) => ({
            value: bank.id,
            label: bank.name,
          })),
        );
      } catch {
        setBankOptions([]);
      }
    };
    loadBanks();
  }, []);

  const handleDownloadFullCsv = () => interestMatrixService.downloadCsv();

  const handleBulkCsvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const replaceAll = window.confirm(
        'Replace ALL existing rates with this file?\n\nOK = replace entire matrix\nCancel = append rows only',
      );
      const result = await interestMatrixService.importCsv(text, replaceAll);
      alert(`Imported ${result.imported} rate row(s).`);
      await loadMatrix();
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || 'CSV import failed');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const [filters, setFilters] = useState({
    bankId: '',
    productType: '',
    loanType: '',
    minCreditScore: '',
    maxCreditScore: '',
    minLoanAmount: '',
    maxLoanAmount: '',
    minTerm: '',
    maxTerm: ''
  });

  const [filteredData, setFilteredData] = useState(matrixData);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isImpactAnalyzerOpen, setIsImpactAnalyzerOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const productTypes = [
    { value: "Personal Loan", label: "Personal Loan" },
    { value: "Home Loan", label: "Home Loan" },
    { value: "Business Loan", label: "Business Loan" },
    { value: "Auto Loan", label: "Auto Loan" },
    { value: "Education Loan", label: "Education Loan" }
  ];

  const loanTypes = [
    { value: "Secured", label: "Secured" },
    { value: "Unsecured", label: "Unsecured" }
  ];

  const versionHistory = [
    {
      id: 1,
      productType: "Personal Loan",
      loanType: "Unsecured",
      interestRate: 6.5,
      timestamp: "2026-01-15T10:30:00",
      modifiedBy: "Admin User",
      changeNote: "Current active rate"
    },
    {
      id: 2,
      productType: "Personal Loan",
      loanType: "Unsecured",
      interestRate: 7.0,
      timestamp: "2025-12-01T14:20:00",
      modifiedBy: "Rate Manager",
      changeNote: "Reduced rate for competitive positioning"
    },
    {
      id: 3,
      productType: "Personal Loan",
      loanType: "Unsecured",
      interestRate: 7.5,
      timestamp: "2025-10-15T09:15:00",
      modifiedBy: "Super Admin",
      changeNote: "Quarterly rate adjustment"
    }
  ];

  const impactData = {
    affectedApplications: 247,
    revenueImpact: 125000,
    customerImpact: 189
  };

  useEffect(() => {
    applyFilters();
  }, [matrixData]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    let filtered = [...matrixData];

    if (filters?.productType) {
      filtered = filtered?.filter(item => item?.productType === filters?.productType);
    }

    if (filters?.bankId) {
      filtered = filtered?.filter(item => item?.bankId === filters?.bankId);
    }

    if (filters?.loanType) {
      filtered = filtered?.filter(item => item?.loanType === filters?.loanType);
    }

    if (filters?.minCreditScore) {
      filtered = filtered?.filter(item => item?.creditScoreMax >= parseInt(filters?.minCreditScore));
    }

    if (filters?.maxCreditScore) {
      filtered = filtered?.filter(item => item?.creditScoreMin <= parseInt(filters?.maxCreditScore));
    }

    if (filters?.minLoanAmount) {
      filtered = filtered?.filter(item => item?.loanAmountMax >= parseInt(filters?.minLoanAmount));
    }

    if (filters?.maxLoanAmount) {
      filtered = filtered?.filter(item => item?.loanAmountMin <= parseInt(filters?.maxLoanAmount));
    }

    if (filters?.minTerm) {
      filtered = filtered?.filter(item => item?.termMax >= parseInt(filters?.minTerm));
    }

    if (filters?.maxTerm) {
      filtered = filtered?.filter(item => item?.termMin <= parseInt(filters?.maxTerm));
    }

    setFilteredData(filtered);
  };

  const handleResetFilters = () => {
    setFilters({
      bankId: '',
      productType: '',
      loanType: '',
      minCreditScore: '',
      maxCreditScore: '',
      minLoanAmount: '',
      maxLoanAmount: '',
      minTerm: '',
      maxTerm: ''
    });
    setFilteredData(matrixData);
  };

  const handleSaveRate = async (formData) => {
    try {
      if (editData?.id) {
        await interestMatrixService.update(editData.id, formData);
      } else {
        await interestMatrixService.create(formData);
      }
      setIsRateModalOpen(false);
      setEditData(null);
      await loadMatrix();
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || 'Failed to save rate');
    }
  };

  const handleEditRate = (row) => {
    setEditData(row);
    setIsRateModalOpen(true);
  };

  const handleDeleteRate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rate configuration?')) return;
    try {
      await interestMatrixService.remove(id);
      setSelectedRows((prev) => prev?.filter((rowId) => rowId !== id));
      await loadMatrix();
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || 'Delete failed');
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev => 
      prev?.includes(id) ? prev?.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredData?.map(item => item?.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedRows?.length} rate configuration(s)?`)) return;
    try {
      await Promise.all(selectedRows.map((id) => interestMatrixService.remove(id)));
      setSelectedRows([]);
      await loadMatrix();
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || 'Bulk delete failed');
    }
  };

  const handleBulkExport = () => {
    const selectedData = matrixData?.filter(item => selectedRows?.includes(item?.id));
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(selectedData?.[0])?.join(",") + "\n" +
      selectedData?.map(row => Object.values(row)?.join(","))?.join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link?.setAttribute("href", encodedUri);
    link?.setAttribute("download", `interest_matrix_export_${new Date()?.toISOString()?.split('T')?.[0]}.csv`);
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
  };

  const handleRestoreVersion = (version) => {
    if (window.confirm('Are you sure you want to restore this version?')) {
      const restoredRate = {
        ...version,
        id: matrixData?.length + 1,
        status: 'pending',
        effectiveDate: new Date()?.toISOString()?.split('T')?.[0],
        modifiedBy: 'Admin User',
        changeNote: 'Restored from version history'
      };
      setMatrixData(prev => [...prev, restoredRate]);
      setIsVersionHistoryOpen(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Interest Matrix Management - Rfincare</title>
        <meta name="description" content="Configure and manage dynamic interest rates across multiple loan products and customer segments" />
      </Helmet>
      <div>
        <div>
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Interest Matrix Management
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Bulk update via CSV upload or download. Rates are stored in the database.
                </p>
                {matrixError && (
                  <p className="text-sm text-destructive mt-2">{matrixError}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Download"
                  onClick={handleDownloadFullCsv}
                  disabled={matrixLoading}
                >
                  Download CSV
                </Button>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted">
                    <Icon name="Upload" size={16} />
                    {importing ? 'Importing…' : 'Bulk upload CSV'}
                  </span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    disabled={importing}
                    onChange={handleBulkCsvUpload}
                  />
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'interest-matrix-template.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Template
                </Button>
                <Button variant="outline" size="sm" iconName="RefreshCw" onClick={loadMatrix}>
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  iconName="Grid3x3"
                  iconPosition="left"
                >
                  {showHeatmap ? 'Hide' : 'Show'} Heatmap
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVersionHistoryOpen(true)}
                  iconName="History"
                  iconPosition="left"
                >
                  History
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImpactAnalyzerOpen(true)}
                  iconName="TrendingUp"
                  iconPosition="left"
                >
                  Impact
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setEditData(null);
                    setIsRateModalOpen(true);
                  }}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Add Rate
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Icon name="Database" size={20} color="var(--color-primary)" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Configurations</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">{matrixData?.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} color="var(--color-success)" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Rates</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {matrixData?.filter(item => item?.status === 'active')?.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                  <Icon name="Clock" size={20} color="var(--color-warning)" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending Approval</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {matrixData?.filter(item => item?.status === 'pending')?.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Icon name="Calendar" size={20} color="var(--color-primary)" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Scheduled</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {matrixData?.filter(item => item?.status === 'scheduled')?.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {showHeatmap && (
            <div className="mb-6">
              <RateHeatmap matrixData={matrixData} />
            </div>
          )}

          <MatrixFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={applyFilters}
            onResetFilters={handleResetFilters}
            bankOptions={bankOptions}
            productTypes={productTypes}
            loanTypes={loanTypes}
          />

          <MatrixGrid
            matrixData={filteredData}
            onEditRate={handleEditRate}
            onDeleteRate={handleDeleteRate}
            selectedRows={selectedRows}
            onSelectRow={handleSelectRow}
            onSelectAll={handleSelectAll}
          />

          <BulkActions
            selectedCount={selectedRows?.length}
            onBulkEdit={() => console.log('Bulk edit')}
            onBulkDelete={handleBulkDelete}
            onBulkExport={handleBulkExport}
            onClearSelection={() => setSelectedRows([])}
          />
        </div>
      </div>
      <RateModal
        isOpen={isRateModalOpen}
        onClose={() => {
          setIsRateModalOpen(false);
          setEditData(null);
        }}
        onSave={handleSaveRate}
        editData={editData}
        productTypes={productTypes}
        loanTypes={loanTypes}
        bankOptions={bankOptions}
      />
      <ImpactAnalyzer
        isOpen={isImpactAnalyzerOpen}
        onClose={() => setIsImpactAnalyzerOpen(false)}
        impactData={impactData}
      />
      <VersionHistory
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        versions={versionHistory}
        onRestore={handleRestoreVersion}
      />
    </>
  );
};

export default InterestMatrixManagement;