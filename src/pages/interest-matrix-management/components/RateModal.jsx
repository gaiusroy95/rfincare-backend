import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const RateModal = ({ isOpen, onClose, onSave, editData, productTypes, loanTypes, bankOptions }) => {
  const [formData, setFormData] = useState({
    bankId: '',
    productType: '',
    loanType: '',
    creditScoreMin: '',
    creditScoreMax: '',
    loanAmountMin: '',
    loanAmountMax: '',
    termMin: '',
    termMax: '',
    interestRate: '',
    effectiveDate: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({
        bankId: '',
        productType: '',
        loanType: '',
        creditScoreMin: '',
        creditScoreMax: '',
        loanAmountMin: '',
        loanAmountMax: '',
        termMin: '',
        termMax: '',
        interestRate: '',
        effectiveDate: new Date()?.toISOString()?.split('T')?.[0],
        status: 'active'
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.productType) newErrors.productType = 'Product type is required';
    if (!formData?.loanType) newErrors.loanType = 'Loan type is required';
    if (!formData?.creditScoreMin) newErrors.creditScoreMin = 'Min credit score is required';
    if (!formData?.creditScoreMax) newErrors.creditScoreMax = 'Max credit score is required';
    if (!formData?.loanAmountMin) newErrors.loanAmountMin = 'Min loan amount is required';
    if (!formData?.loanAmountMax) newErrors.loanAmountMax = 'Max loan amount is required';
    if (!formData?.termMin) newErrors.termMin = 'Min term is required';
    if (!formData?.termMax) newErrors.termMax = 'Max term is required';
    if (!formData?.interestRate) newErrors.interestRate = 'Interest rate is required';
    if (!formData?.effectiveDate) newErrors.effectiveDate = 'Effective date is required';

    if (formData?.creditScoreMin && formData?.creditScoreMax) {
      if (parseInt(formData?.creditScoreMin) >= parseInt(formData?.creditScoreMax)) {
        newErrors.creditScoreMax = 'Max must be greater than min';
      }
    }

    if (formData?.loanAmountMin && formData?.loanAmountMax) {
      if (parseInt(formData?.loanAmountMin) >= parseInt(formData?.loanAmountMax)) {
        newErrors.loanAmountMax = 'Max must be greater than min';
      }
    }

    if (formData?.termMin && formData?.termMax) {
      if (parseInt(formData?.termMin) >= parseInt(formData?.termMax)) {
        newErrors.termMax = 'Max must be greater than min';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'expired', label: 'Expired' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-card border-b border-border px-4 md:px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
            <Icon name={editData ? 'Edit2' : 'Plus'} size={24} color="var(--color-primary)" />
            {editData ? 'Edit Rate Configuration' : 'Add New Rate Configuration'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Select
              label="Bank Name"
              options={bankOptions || []}
              value={formData?.bankId || ''}
              onChange={(value) => handleChange('bankId', value)}
              placeholder="All banks (generic)"
              clearable
            />

            <Select
              label="Product Type"
              required
              options={productTypes}
              value={formData?.productType}
              onChange={(value) => handleChange('productType', value)}
              error={errors?.productType}
            />

            <Select
              label="Loan Type"
              required
              options={loanTypes}
              value={formData?.loanType}
              onChange={(value) => handleChange('loanType', value)}
              error={errors?.loanType}
            />

            <Input
              label="Min Credit Score"
              type="number"
              required
              min="300"
              max="900"
              value={formData?.creditScoreMin}
              onChange={(e) => handleChange('creditScoreMin', e?.target?.value)}
              error={errors?.creditScoreMin}
              placeholder="e.g., 600"
            />

            <Input
              label="Max Credit Score"
              type="number"
              required
              min="300"
              max="900"
              value={formData?.creditScoreMax}
              onChange={(e) => handleChange('creditScoreMax', e?.target?.value)}
              error={errors?.creditScoreMax}
              placeholder="e.g., 750"
            />

            <Input
              label="Min Loan Amount (₹)"
              type="number"
              required
              min="0"
              value={formData?.loanAmountMin}
              onChange={(e) => handleChange('loanAmountMin', e?.target?.value)}
              error={errors?.loanAmountMin}
              placeholder="e.g., 10000"
            />

            <Input
              label="Max Loan Amount (₹)"
              type="number"
              required
              min="0"
              value={formData?.loanAmountMax}
              onChange={(e) => handleChange('loanAmountMax', e?.target?.value)}
              error={errors?.loanAmountMax}
              placeholder="e.g., 100000"
            />

            <Input
              label="Min Term (months)"
              type="number"
              required
              min="1"
              value={formData?.termMin}
              onChange={(e) => handleChange('termMin', e?.target?.value)}
              error={errors?.termMin}
              placeholder="e.g., 12"
            />

            <Input
              label="Max Term (months)"
              type="number"
              required
              min="1"
              value={formData?.termMax}
              onChange={(e) => handleChange('termMax', e?.target?.value)}
              error={errors?.termMax}
              placeholder="e.g., 60"
            />

            <Input
              label="Interest Rate (%)"
              type="number"
              required
              min="0"
              max="100"
              step="0.01"
              value={formData?.interestRate}
              onChange={(e) => handleChange('interestRate', e?.target?.value)}
              error={errors?.interestRate}
              placeholder="e.g., 7.50"
            />

            <Input
              label="Effective Date"
              type="date"
              required
              value={formData?.effectiveDate}
              onChange={(e) => handleChange('effectiveDate', e?.target?.value)}
              error={errors?.effectiveDate}
            />

            <Select
              label="Status"
              required
              options={statusOptions}
              value={formData?.status}
              onChange={(value) => handleChange('status', value)}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              fullWidth
              className="sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              iconName="Save"
              iconPosition="left"
              fullWidth
              className="sm:w-auto"
            >
              {editData ? 'Update Configuration' : 'Add Configuration'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RateModal;