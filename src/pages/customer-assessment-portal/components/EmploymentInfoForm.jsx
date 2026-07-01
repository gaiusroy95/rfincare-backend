import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import CoApplicantForm from './CoApplicantForm';

const EmploymentInfoForm = ({ formData, errors, onChange, onCoApplicantChange }) => {
  const employmentTypeOptions = [
    { value: 'salaried', label: 'Salaried Employee' },
    { value: 'self_employed', label: 'Self-Employed' },
    { value: 'business_owner', label: 'Business Owner' },
    { value: 'professional', label: 'Professional' },
    { value: 'retired', label: 'Retired' },
  ];

  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail' },
    { value: 'construction', label: 'Construction' },
    { value: 'other', label: 'Other' }
  ];

  const isEmployed = ['salaried', 'business_owner', 'professional']?.includes(formData?.employmentType);
  const isSelfEmployed = formData?.employmentType === 'self_employed';
  const usesBusinessName = ['self_employed', 'business_owner'].includes(formData?.employmentType);

  return (
    <div className="space-y-6 md:space-y-8">
      <Select
        label="Employment Status"
        description="Select your current employment situation"
        options={employmentTypeOptions}
        value={formData?.employmentType}
        onChange={(value) => onChange('employmentType', value)}
        error={errors?.employmentType}
        required
      />
      {(isEmployed || isSelfEmployed) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Input
              label={usesBusinessName ? 'Business Name' : 'Employer Name'}
              type="text"
              placeholder={usesBusinessName ? 'Enter your business name' : 'Enter employer name'}
              value={formData?.employerName}
              onChange={(e) => onChange('employerName', e?.target?.value)}
              error={errors?.employerName}
              required
            />

            <Input
              label="Job Title / Position"
              type="text"
              placeholder="Enter your job title"
              value={formData?.jobTitle}
              onChange={(e) => onChange('jobTitle', e?.target?.value)}
              error={errors?.jobTitle}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Select
              label="Industry"
              options={industryOptions}
              value={formData?.industry}
              onChange={(value) => onChange('industry', value)}
              error={errors?.industry}
              searchable
              required
            />

            <Input
              label="Years in Current Position"
              type="number"
              placeholder="0"
              description="Enter number of years"
              value={formData?.yearsEmployed}
              onChange={(e) => onChange('yearsEmployed', e?.target?.value)}
              error={errors?.yearsEmployed}
              required
              min={0}
              max={50}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Input
              label="Annual Gross Income"
              type="number"
              placeholder="600000"
              description="Enter your annual income in INR (₹)"
              value={formData?.annualIncome}
              onChange={(e) => onChange('annualIncome', e?.target?.value)}
              error={errors?.annualIncome}
              required
              min={0}
            />

            <Input
              label="Monthly Net Income"
              type="number"
              placeholder="40000"
              description="Enter your monthly take-home pay in INR (₹)"
              value={formData?.monthlyIncome}
              onChange={(e) => onChange('monthlyIncome', e?.target?.value)}
              error={errors?.monthlyIncome}
              required
              min={0}
            />
          </div>

          {isEmployed && (
            <Input
              label="Employer Phone Number"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="9876543210"
              description="10-digit mobile number for employment verification"
              value={formData?.employerPhone}
              onChange={(e) =>
                onChange('employerPhone', e?.target?.value?.replace(/\D/g, '').slice(0, 10))
              }
              error={errors?.employerPhone}
              required
              maxLength={10}
            />
          )}
        </>
      )}
      {formData?.employmentType === 'retired' && (
        <>
          <Input
            label="Monthly Retirement Income"
            type="number"
            placeholder="30000"
            description="Enter your monthly retirement income in INR (₹)"
            value={formData?.retirementIncome}
            onChange={(e) => onChange('retirementIncome', e?.target?.value)}
            error={errors?.retirementIncome}
            required
            min={0}
          />
          <CoApplicantForm
            coApplicant={formData?.coApplicant}
            errors={errors}
            onChange={onCoApplicantChange}
          />
        </>
      )}
    </div>
  );
};

export default EmploymentInfoForm;