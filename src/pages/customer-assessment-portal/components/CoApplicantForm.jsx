import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const relationshipOptions = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
];

const employmentTypeOptions = [
  { value: 'salaried', label: 'Salaried Employee' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'professional', label: 'Professional' },
];

const industryOptions = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'construction', label: 'Construction' },
  { value: 'government', label: 'Government' },
  { value: 'other', label: 'Other' },
];

const CoApplicantForm = ({ coApplicant, errors, onChange }) => {
  const data = coApplicant || {};
  const err = (field) => errors?.[`coApplicant_${field}`];

  const isEmployed = ['salaried', 'business_owner', 'professional']?.includes(data?.employmentType);
  const isSelfEmployed = data?.employmentType === 'self_employed';
  const usesBusinessName = ['self_employed', 'business_owner'].includes(data?.employmentType);
  const showWorkDetails = isEmployed || isSelfEmployed;

  return (
    <div className="mt-6 pt-6 border-t-2 border-dashed border-primary/30 space-y-6">
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <Icon name="Users" size={22} className="text-primary shrink-0 mt-0.5" />
        <div>
          <h3 className="text-base md:text-lg font-semibold text-foreground">Co-applicant details</h3>
          <p className="text-sm text-muted-foreground mt-1">
            As a retired applicant, add a working co-applicant (spouse or family member) with their employment and income details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Input
          label="Co-applicant first name"
          type="text"
          placeholder="Enter first name"
          value={data.firstName}
          onChange={(e) => onChange('firstName', e?.target?.value)}
          error={err('firstName')}
          required
        />
        <Input
          label="Co-applicant last name"
          type="text"
          placeholder="Enter last name"
          value={data.lastName}
          onChange={(e) => onChange('lastName', e?.target?.value)}
          error={err('lastName')}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Select
          label="Relationship to you"
          options={relationshipOptions}
          value={data.relationship}
          onChange={(value) => onChange('relationship', value)}
          error={err('relationship')}
          required
        />
        <Input
          label="Mobile number"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="9876543210"
          description="10-digit mobile number"
          value={data.phone}
          onChange={(e) => onChange('phone', e?.target?.value?.replace(/\D/g, '').slice(0, 10))}
          error={err('phone')}
          required
          maxLength={10}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Input
          label="Email (optional)"
          type="email"
          placeholder="coapplicant@email.com"
          value={data.email}
          onChange={(e) => onChange('email', e?.target?.value)}
          error={err('email')}
        />
        <Input
          label="PAN number"
          type="text"
          placeholder="ABCDE1234F"
          value={data.pan}
          onChange={(e) => onChange('pan', e?.target?.value?.toUpperCase())}
          error={err('pan')}
          required
          maxLength={10}
        />
      </div>

      <Input
        label="Aadhaar (last 4 digits)"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="1234"
        description="Last 4 digits of Aadhaar only"
        value={data.aadhaar}
        onChange={(e) => onChange('aadhaar', e?.target?.value?.replace(/\D/g, '').slice(0, 4))}
        error={err('aadhaar')}
        required
        maxLength={4}
      />

      <Select
        label="Co-applicant employment status"
        description="Select their current work situation"
        options={employmentTypeOptions}
        value={data.employmentType}
        onChange={(value) => onChange('employmentType', value)}
        error={err('employmentType')}
        required
      />

      {showWorkDetails && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Input
              label={usesBusinessName ? 'Business name' : 'Employer name'}
              type="text"
              placeholder={usesBusinessName ? 'Business name' : 'Employer name'}
              value={data.employerName}
              onChange={(e) => onChange('employerName', e?.target?.value)}
              error={err('employerName')}
              required
            />
            <Input
              label="Job title / position"
              type="text"
              placeholder="Job title"
              value={data.jobTitle}
              onChange={(e) => onChange('jobTitle', e?.target?.value)}
              error={err('jobTitle')}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Select
              label="Industry"
              options={industryOptions}
              value={data.industry}
              onChange={(value) => onChange('industry', value)}
              error={err('industry')}
              searchable
              required
            />
            <Input
              label="Years in current role"
              type="number"
              placeholder="0"
              value={data.yearsEmployed}
              onChange={(e) => onChange('yearsEmployed', e?.target?.value)}
              error={err('yearsEmployed')}
              required
              min={0}
              max={50}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Input
              label="Annual gross income"
              type="number"
              placeholder="600000"
              description="Annual income in INR (₹)"
              value={data.annualIncome}
              onChange={(e) => onChange('annualIncome', e?.target?.value)}
              error={err('annualIncome')}
              required
              min={0}
            />
            <Input
              label="Monthly net income"
              type="number"
              placeholder="40000"
              description="Monthly take-home pay in INR (₹)"
              value={data.monthlyIncome}
              onChange={(e) => onChange('monthlyIncome', e?.target?.value)}
              error={err('monthlyIncome')}
              required
              min={0}
            />
          </div>

          {isEmployed && (
            <Input
              label="Employer phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="9876543210"
              value={data.employerPhone}
              onChange={(e) =>
                onChange('employerPhone', e?.target?.value?.replace(/\D/g, '').slice(0, 10))
              }
              error={err('employerPhone')}
              required
              maxLength={10}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CoApplicantForm;
