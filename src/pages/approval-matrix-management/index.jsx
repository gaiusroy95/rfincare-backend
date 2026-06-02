import React, { useState, useEffect, useMemo, useCallback } from 'react';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { approvalMatrixService, bankService, auditService } from '../../services/apiServices';

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const principalFromEmi = (annualRatePercent, months, emi) => {
  const monthlyRate = toNumber(annualRatePercent, 0) / 1200;
  if (!months || months <= 0 || !emi || emi <= 0) return 0;
  if (monthlyRate <= 0) return emi * months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (emi * (factor - 1)) / (monthlyRate * factor);
};


const ApprovalMatrixManagement = () => {
  const [rules, setRules] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    ruleName: '',
    bankId: '',
    loanType: '',
    minAnnualIncome: '',
    maxAnnualIncome: '',
    minCreditScore: '',
    maxCreditScore: '',
    employmentTypes: [],
    eligibleStates: [],
    eligibleCities: [],
    minLoanAmount: '',
    maxLoanAmount: '',
    minAge: '',
    maxAge: '',
    foirUnsecured: '',
    foirSecured: '',
    tenureUnsecuredMonths: '',
    tenureSecuredMonths: '',
    ltvRatio: '',
    approvalProbability: 75,
    isActive: true,
    priority: 0
  });

  // Helper function to convert empty strings to null for numeric fields
  const sanitizeNumericFields = (data) => {
    const numericFields = [
      'minAnnualIncome',
      'maxAnnualIncome',
      'minCreditScore',
      'maxCreditScore',
      'minLoanAmount',
      'maxLoanAmount',
      'minAge',
      'maxAge',
      'foirUnsecured',
      'foirSecured',
      'tenureUnsecuredMonths',
      'tenureSecuredMonths',
      'ltvRatio',
      'approvalProbability',
      'priority'
    ];

    const sanitized = { ...data };
    
    numericFields?.forEach(field => {
      if (sanitized?.[field] === '' || sanitized?.[field] === null || sanitized?.[field] === undefined) {
        sanitized[field] = null;
      } else {
        // Convert to number for numeric fields
        const value = parseFloat(sanitized?.[field]);
        sanitized[field] = isNaN(value) ? null : value;
      }
    });

    // Ensure approvalProbability and priority have default values if null
    if (sanitized?.approvalProbability === null) {
      sanitized.approvalProbability = 75;
    }
    if (sanitized?.priority === null) {
      sanitized.priority = 0;
    }

    return sanitized;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadBanks = useCallback(async () => {
    try {
      const data = await bankService.getAllBanks();
      setBanks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load banks:', err);
      setBanks([]);
    }
  }, []);

  const bankOptions = useMemo(
    () =>
      (banks || [])
        .filter((b) => b?.id && (b?.name || b?.bankName))
        .map((b) => ({
          value: b.id,
          label: b.name || b.bankName,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [banks],
  );

  const loadData = async () => {
    setLoading(true);
    setError('');
    const [rulesResult, banksResult] = await Promise.allSettled([
      approvalMatrixService.getAllRules(),
      bankService.getAllBanks(),
    ]);

    if (rulesResult.status === 'fulfilled') {
      setRules(Array.isArray(rulesResult.value) ? rulesResult.value : []);
    } else {
      setRules([]);
      const status = rulesResult.reason?.response?.status;
      const msg =
        rulesResult.reason?.response?.data?.error
        || rulesResult.reason?.message
        || 'Failed to load approval rules';
      setError(
        status === 404
          ? 'Approval matrix API is not available on the server. Redeploy the backend (Render) with the latest code, then refresh this page.'
          : msg,
      );
    }

    if (banksResult.status === 'fulfilled') {
      setBanks(Array.isArray(banksResult.value) ? banksResult.value : []);
    } else {
      await loadBanks();
    }

    setLoading(false);
  };

  const handleOpenModal = async (rule = null) => {
    await loadBanks();
    if (rule) {
      setEditingRule(rule);
      setFormData({
        ruleName: rule?.ruleName,
        bankId: rule?.bankId,
        loanType: rule?.loanType || '',
        minAnnualIncome: rule?.minAnnualIncome || '',
        maxAnnualIncome: rule?.maxAnnualIncome || '',
        minCreditScore: rule?.minCreditScore || '',
        maxCreditScore: rule?.maxCreditScore || '',
        employmentTypes: rule?.employmentTypes || [],
        eligibleStates: rule?.eligibleStates || [],
        eligibleCities: rule?.eligibleCities || [],
        minLoanAmount: rule?.minLoanAmount || '',
        maxLoanAmount: rule?.maxLoanAmount || '',
        minAge: rule?.minAge || '',
        maxAge: rule?.maxAge || '',
        foirUnsecured: rule?.foirUnsecured || '',
        foirSecured: rule?.foirSecured || '',
        tenureUnsecuredMonths: rule?.tenureUnsecuredMonths || '',
        tenureSecuredMonths: rule?.tenureSecuredMonths || '',
        ltvRatio: rule?.ltvRatio || '',
        approvalProbability: rule?.approvalProbability,
        isActive: rule?.isActive,
        priority: rule?.priority
      });
    } else {
      setEditingRule(null);
      setFormData({
        ruleName: '',
        bankId: '',
        loanType: '',
        minAnnualIncome: '',
        maxAnnualIncome: '',
        minCreditScore: '',
        maxCreditScore: '',
        employmentTypes: [],
        eligibleStates: [],
        eligibleCities: [],
        minLoanAmount: '',
        maxLoanAmount: '',
        minAge: '',
        maxAge: '',
        foirUnsecured: '',
        foirSecured: '',
        tenureUnsecuredMonths: '',
        tenureSecuredMonths: '',
        ltvRatio: '',
        approvalProbability: 75,
        isActive: true,
        priority: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRule(null);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      // Sanitize numeric fields before submission
      const sanitizedData = sanitizeNumericFields(formData);
      
      if (editingRule) {
        await approvalMatrixService?.updateRule(editingRule?.id, sanitizedData);
        await auditService?.logAction('UPDATE', 'approval_matrix_rules', editingRule?.id, editingRule, sanitizedData);
      } else {
        await approvalMatrixService?.createRule(sanitizedData);
        await auditService?.logAction('CREATE', 'approval_matrix_rules', null, null, sanitizedData);
      }
      await loadData();
      handleCloseModal();
    } catch (err) {
      setError(err?.message);
    }
  };

  const handleDelete = async (rule) => {
    if (!window.confirm(`Are you sure you want to delete rule "${rule?.ruleName}"?`)) return;
    
    try {
      await approvalMatrixService?.deleteRule(rule?.id);
      await auditService?.logAction('DELETE', 'approval_matrix_rules', rule?.id, rule, null);
      await loadData();
    } catch (err) {
      setError(err?.message);
    }
  };

  const handleToggleActive = async (rule) => {
    try {
      await approvalMatrixService?.updateRule(rule?.id, { isActive: !rule?.isActive });
      await auditService?.logAction('UPDATE', 'approval_matrix_rules', rule?.id, { isActive: rule?.isActive }, { isActive: !rule?.isActive });
      await loadData();
    } catch (err) {
      setError(err?.message);
    }
  };

  const loanTypeOptions = [
    { value: '', label: 'All Loan Types' },
    { value: 'home_loan', label: 'Home Loan' },
    { value: 'personal_loan', label: 'Personal Loan' },
    { value: 'business_loan', label: 'Business Loan' },
    { value: 'auto_loan', label: 'Auto Loan' },
    { value: 'education_loan', label: 'Education Loan' },
    { value: 'debt_consolidation', label: 'Debt Consolidation' }
  ];

  const employmentTypeOptions = [
    { value: 'salaried', label: 'Salaried' },
    { value: 'self_employed', label: 'Self-Employed' },
    { value: 'business_owner', label: 'Business Owner' },
    { value: 'professional', label: 'Professional' },
    { value: 'retired', label: 'Retired' }
  ];

  const policyPreview = useMemo(() => {
    const sampleMonthlyIncome = 100000;
    const sampleExistingEmi = 15000;
    const sampleCollateralValue = 5000000;
    const sampleUnsecuredRate = 14;
    const sampleSecuredRate = 9;

    const unsecuredFoir = toNumber(formData?.foirUnsecured, 0.55);
    const securedFoir = toNumber(formData?.foirSecured, 0.65);
    const unsecuredTenure = toNumber(formData?.tenureUnsecuredMonths, 60);
    const securedTenure = toNumber(formData?.tenureSecuredMonths, 240);
    const ltvRatio = toNumber(formData?.ltvRatio, 0.75);

    const unsecuredMaxEmi = Math.max(0, sampleMonthlyIncome * unsecuredFoir - sampleExistingEmi);
    const securedMaxEmi = Math.max(0, sampleMonthlyIncome * securedFoir - sampleExistingEmi);

    const unsecuredEligible = principalFromEmi(sampleUnsecuredRate, unsecuredTenure, unsecuredMaxEmi);
    const securedEmiEligible = principalFromEmi(sampleSecuredRate, securedTenure, securedMaxEmi);
    const securedAssetCap = sampleCollateralValue * ltvRatio;
    const securedEligible = Math.min(securedEmiEligible, securedAssetCap);

    return {
      sampleMonthlyIncome,
      sampleExistingEmi,
      sampleCollateralValue,
      unsecuredFoir,
      securedFoir,
      unsecuredTenure,
      securedTenure,
      ltvRatio,
      unsecuredMaxEmi,
      securedMaxEmi,
      unsecuredEligible,
      securedEmiEligible,
      securedAssetCap,
      securedEligible,
      sampleUnsecuredRate,
      sampleSecuredRate,
    };
  }, [formData]);

  return (
    <div>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Bank Approval Matrix
            </h1>
            <p className="text-muted-foreground">
              Configure dynamic eligibility rules for bank suggestions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadBanks} iconName="RefreshCw">
              Refresh banks
            </Button>
            <Button onClick={() => handleOpenModal()} iconName="Plus">
              Add Rule
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading rules...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rules?.map((rule) => (
              <div key={rule?.id} className="feature-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{rule?.ruleName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule?.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {rule?.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Priority: {rule?.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Bank: {rule?.banks?.name || 'Unknown'} | Loan Type: {rule?.loanType || 'All'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(rule)}
                      iconName={rule?.isActive ? 'ToggleRight' : 'ToggleLeft'}
                    >
                      {rule?.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(rule)}
                      iconName="Edit"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(rule)}
                      iconName="Trash2"
                      className="text-error hover:bg-error/10"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Income Range:</span>
                    <span className="ml-2 font-medium">
                      {rule?.minAnnualIncome ? `₹${rule?.minAnnualIncome?.toLocaleString('en-IN')}` : 'Any'} - 
                      {rule?.maxAnnualIncome ? `₹${rule?.maxAnnualIncome?.toLocaleString('en-IN')}` : 'Any'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Credit Score:</span>
                    <span className="ml-2 font-medium">
                      {rule?.minCreditScore || 'Any'} - {rule?.maxCreditScore || 'Any'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">FOIR:</span>
                    <span className="ml-2 font-medium">
                      U {rule?.foirUnsecured != null && rule?.foirUnsecured !== '' ? `${Math.round(rule.foirUnsecured * 100)}%` : 'Default'} / S {rule?.foirSecured != null && rule?.foirSecured !== '' ? `${Math.round(rule.foirSecured * 100)}%` : 'Default'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Age Range:</span>
                    <span className="ml-2 font-medium">
                      {rule?.minAge || 'Any'} - {rule?.maxAge || 'Any'} years
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Approval Probability:</span>
                    <span className="ml-2 font-medium text-success">{rule?.approvalProbability}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                {editingRule ? 'Edit Approval Rule' : 'Add New Approval Rule'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Rule Name"
                value={formData?.ruleName}
                onChange={(e) => setFormData({ ...formData, ruleName: e?.target?.value })}
                required
                placeholder="e.g., High Income Salaried - Home Loan"
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Bank"
                  options={bankOptions}
                  value={formData?.bankId}
                  onChange={(value) => setFormData({ ...formData, bankId: value })}
                  required
                  searchable
                  placeholder={bankOptions.length ? 'Select bank' : 'No banks — add banks in Bank Marketplace first'}
                />
                <Select
                  label="Loan Type"
                  options={loanTypeOptions}
                  value={formData?.loanType}
                  onChange={(value) => setFormData({ ...formData, loanType: value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min Annual Income (INR)"
                  type="number"
                  value={formData?.minAnnualIncome}
                  onChange={(e) => setFormData({ ...formData, minAnnualIncome: e?.target?.value })}
                  placeholder="e.g., 600000"
                />
                <Input
                  label="Max Annual Income (INR)"
                  type="number"
                  value={formData?.maxAnnualIncome}
                  onChange={(e) => setFormData({ ...formData, maxAnnualIncome: e?.target?.value })}
                  placeholder="Leave empty for no limit"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min Credit Score"
                  type="number"
                  value={formData?.minCreditScore}
                  onChange={(e) => setFormData({ ...formData, minCreditScore: e?.target?.value })}
                  placeholder="e.g., 700"
                />
                <Input
                  label="Max Credit Score"
                  type="number"
                  value={formData?.maxCreditScore}
                  onChange={(e) => setFormData({ ...formData, maxCreditScore: e?.target?.value })}
                  placeholder="e.g., 900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="FOIR Unsecured (0-1)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData?.foirUnsecured}
                  onChange={(e) => setFormData({ ...formData, foirUnsecured: e?.target?.value })}
                  placeholder="e.g., 0.55"
                  description="Example: 0.55 means 55% FOIR"
                />
                <Input
                  label="FOIR Secured (0-1)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData?.foirSecured}
                  onChange={(e) => setFormData({ ...formData, foirSecured: e?.target?.value })}
                  placeholder="e.g., 0.65"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Tenure Unsecured (months)"
                  type="number"
                  min="1"
                  value={formData?.tenureUnsecuredMonths}
                  onChange={(e) => setFormData({ ...formData, tenureUnsecuredMonths: e?.target?.value })}
                  placeholder="e.g., 60"
                />
                <Input
                  label="Tenure Secured (months)"
                  type="number"
                  min="1"
                  value={formData?.tenureSecuredMonths}
                  onChange={(e) => setFormData({ ...formData, tenureSecuredMonths: e?.target?.value })}
                  placeholder="e.g., 240"
                />
                <Input
                  label="LTV Ratio (0-1)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData?.ltvRatio}
                  onChange={(e) => setFormData({ ...formData, ltvRatio: e?.target?.value })}
                  placeholder="e.g., 0.75"
                />
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Policy Preview (sample calculation)</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sample input used: Monthly income ₹{policyPreview.sampleMonthlyIncome.toLocaleString('en-IN')}, Existing EMI ₹{policyPreview.sampleExistingEmi.toLocaleString('en-IN')}, Collateral ₹{policyPreview.sampleCollateralValue.toLocaleString('en-IN')}.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border bg-card p-3">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Unsecured Formula</h4>
                    <p className="text-xs text-muted-foreground">
                      Max EMI = (Income × FOIR) - Existing EMI
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Eligible Amount = PrincipalFromEMI(rate, tenure, max EMI)
                    </p>
                    <div className="mt-2 text-xs space-y-1">
                      <p>FOIR: <span className="font-medium">{Math.round(policyPreview.unsecuredFoir * 100)}%</span></p>
                      <p>Tenure: <span className="font-medium">{policyPreview.unsecuredTenure} months</span></p>
                      <p>Rate Used: <span className="font-medium">{policyPreview.sampleUnsecuredRate}%</span></p>
                      <p>Max EMI: <span className="font-medium">₹{Math.round(policyPreview.unsecuredMaxEmi).toLocaleString('en-IN')}</span></p>
                      <p>Eligible Amount: <span className="font-semibold text-primary">₹{Math.round(policyPreview.unsecuredEligible).toLocaleString('en-IN')}</span></p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-3">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Secured Formula</h4>
                    <p className="text-xs text-muted-foreground">
                      EMI Eligible = PrincipalFromEMI(rate, tenure, max EMI)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Final Eligible = min(EMI Eligible, Collateral × LTV)
                    </p>
                    <div className="mt-2 text-xs space-y-1">
                      <p>FOIR: <span className="font-medium">{Math.round(policyPreview.securedFoir * 100)}%</span></p>
                      <p>Tenure: <span className="font-medium">{policyPreview.securedTenure} months</span></p>
                      <p>LTV: <span className="font-medium">{Math.round(policyPreview.ltvRatio * 100)}%</span></p>
                      <p>Rate Used: <span className="font-medium">{policyPreview.sampleSecuredRate}%</span></p>
                      <p>EMI-based Eligible: <span className="font-medium">₹{Math.round(policyPreview.securedEmiEligible).toLocaleString('en-IN')}</span></p>
                      <p>Collateral × LTV Cap: <span className="font-medium">₹{Math.round(policyPreview.securedAssetCap).toLocaleString('en-IN')}</span></p>
                      <p>Final Eligible Amount: <span className="font-semibold text-primary">₹{Math.round(policyPreview.securedEligible).toLocaleString('en-IN')}</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min Age"
                  type="number"
                  value={formData?.minAge}
                  onChange={(e) => setFormData({ ...formData, minAge: e?.target?.value })}
                  placeholder="e.g., 21"
                />
                <Input
                  label="Max Age"
                  type="number"
                  value={formData?.maxAge}
                  onChange={(e) => setFormData({ ...formData, maxAge: e?.target?.value })}
                  placeholder="e.g., 65"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Approval Probability (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={formData?.approvalProbability}
                  onChange={(e) => setFormData({ ...formData, approvalProbability: parseInt(e?.target?.value) })}
                  required
                />
                <Input
                  label="Priority"
                  type="number"
                  value={formData?.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e?.target?.value) })}
                  description="Higher priority rules are evaluated first"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalMatrixManagement;