import React from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import { requiresCoApplicant } from '../../../constants/assessmentDocuments';
import {
  FINANCIAL_HISTORY_QUESTIONS,
  financialHistoryLabel,
} from '../../../constants/assessmentFinancialHistory';
import { getCreditScoreRangeLabel } from '../../../constants/creditScoreRanges';
import { calculateTotalMonthlyEmi } from '../../../utils/calculateTotalMonthlyEmi';
import { getExistingLoanTypeLabel } from '../../../constants/existingLoanTypes';
import { getCompleteExistingLoans } from '../../../utils/existingLoans';

const displayValue = (val) => {
  if (val == null || val === '') return '';
  if (typeof val === 'object') return '';
  return String(val);
};

const ReviewSubmitForm = ({ formData, errors, onChange }) => {
  const formatCurrency = (val) => {
    const n = Number.parseFloat(val);
    if (!Number.isFinite(n) || n <= 0) return '';
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
  };
  const formatTotalEmi = () => {
    if (formData?.hasRunningLoanOrCard === 'no') return '₹0';
    return formatCurrency(totalMonthlyEmi) || '—';
  };
  const showCoApplicant = requiresCoApplicant(formData?.employmentType);
  const ca = formData?.coApplicant || {};
  const totalMonthlyEmi = calculateTotalMonthlyEmi(formData);

  const sections = [
    {
      title: 'Personal Information',
      icon: 'User',
      items: [
        { label: 'Full Name', value: [formData?.title, formData?.firstName, formData?.middleName, formData?.lastName]?.filter(Boolean)?.join(' ') },
        { label: 'Date of Birth', value: formData?.dateOfBirth },
        { label: 'Gender', value: formData?.gender },
        { label: 'Marital Status', value: formData?.maritalStatus },
        { label: 'Email', value: formData?.email },
        { label: 'Mobile', value: formData?.phone },
        { label: 'Aadhaar', value: formData?.aadhaar ? 'XXXX-XXXX-' + String(formData?.aadhaar)?.slice(-4) : '' },
        { label: 'PAN', value: formData?.pan }
      ]
    },
    {
      title: 'Address Information',
      icon: 'MapPin',
      items: [
        { label: 'Address Line 1', value: formData?.addressLine1 },
        { label: 'Address Line 2', value: formData?.addressLine2 },
        { label: 'City, District', value: [formData?.city, formData?.district]?.filter(Boolean)?.join(', ') },
        { label: 'State, PIN', value: [formData?.state, formData?.pinCode]?.filter(Boolean)?.join(' - ') },
        { label: 'Residence Type', value: formData?.residenceType },
        { label: 'Years at Address', value: formData?.yearsAtAddress ? `${formData?.yearsAtAddress} years` : '' }
      ]
    },
    {
      title: 'Employment Information',
      icon: 'Briefcase',
      items: [
        { label: 'Employment Status', value: formData?.employmentType },
        { label: 'Employer / Business', value: formData?.employerName },
        { label: 'Job Title', value: formData?.jobTitle },
        { label: 'Industry', value: formData?.industry },
        { label: 'Annual Income', value: formatCurrency(formData?.annualIncome) },
        { label: 'Monthly Income', value: formatCurrency(formData?.monthlyIncome) },
        { label: 'Retirement Income', value: formatCurrency(formData?.retirementIncome) },
      ]
    },
    ...(showCoApplicant
      ? [{
          title: 'Co-applicant Information',
          icon: 'Users',
          items: [
            {
              label: 'Name',
              value: [ca.firstName, ca.lastName].filter(Boolean).join(' '),
            },
            { label: 'Relationship', value: ca.relationship },
            { label: 'Mobile', value: ca.phone },
            { label: 'Email', value: ca.email },
            { label: 'PAN', value: ca.pan },
            { label: 'Employment Status', value: ca.employmentType },
            { label: 'Employer / Business', value: ca.employerName },
            { label: 'Job Title', value: ca.jobTitle },
            { label: 'Annual Income', value: formatCurrency(ca.annualIncome) },
            { label: 'Monthly Income', value: formatCurrency(ca.monthlyIncome) },
          ],
        }]
      : []),
    {
      title: 'Financial Information',
      icon: 'IndianRupee',
      items: [
        { label: 'Loan Purpose', value: displayValue(formData?.loanPurpose) },
        { label: 'Requested Amount', value: formatCurrency(formData?.loanAmount) },
        { label: 'Credit Score Range', value: getCreditScoreRangeLabel(formData?.creditScoreRange) },
        { label: 'Total Monthly EMI (auto-calculated)', value: formatTotalEmi() },
        { label: 'Any running loan / credit card', value: formData?.hasRunningLoanOrCard === 'yes' ? 'Yes' : formData?.hasRunningLoanOrCard === 'no' ? 'No' : '' },
        ...getCompleteExistingLoans(formData?.existingLoans).map((loan, index) => ({
          label: `Existing loan ${index + 1}`,
          value: `${getExistingLoanTypeLabel(loan.loanType)} — ${formatCurrency(loan.emiAmount)}/month`,
        })),
        { label: 'Any overdue in any loan', value: formData?.hasAnyOverdue === 'yes' ? 'Yes' : formData?.hasAnyOverdue === 'no' ? 'No' : '' },
        { label: 'Overdue amount', value: formatCurrency(formData?.overdueAmount) },
        { label: 'Overdue loan type', value: displayValue(formData?.overdueLoanType) },
        ...FINANCIAL_HISTORY_QUESTIONS.map((q) => ({
          label: q.label,
          value: financialHistoryLabel(formData?.[q.field]),
        })),
      ]
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Review Sections */}
      <div className="space-y-4 md:space-y-6">
        {sections?.map((section, index) => (
          <div key={index} className="feature-card">
            <div className="flex items-center space-x-3 mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name={section?.icon} size={20} className="text-primary md:w-6 md:h-6" />
              </div>
              <h3 className="text-base md:text-lg lg:text-xl font-semibold text-foreground">
                {section?.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {section?.items?.map((item, itemIndex) => (
                item?.value ? (
                  <div key={itemIndex} className="space-y-1">
                    <p className="text-xs md:text-sm text-muted-foreground">{item?.label}</p>
                    <p className="text-sm md:text-base font-medium text-foreground break-words">
                      {item?.value}
                    </p>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Consent & Agreements */}
      <div className="space-y-4 p-4 md:p-6 bg-muted rounded-lg border border-border">
        <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">
          Consent &amp; Agreements
        </h3>

        <div className="space-y-4">
          <Checkbox
            label="I certify that all information provided is accurate and complete to the best of my knowledge"
            description="Providing false information may result in loan denial or legal consequences"
            checked={formData?.certifyAccuracy}
            onChange={(e) => onChange('certifyAccuracy', e?.target?.checked)}
            error={errors?.certifyAccuracy}
            required
          />

          <Checkbox
            label="I authorize Rfincare to obtain my credit report and share my information with partner lenders"
            description="This is required to match you with appropriate loan options"
            checked={formData?.authorizeCredit}
            onChange={(e) => onChange('authorizeCredit', e?.target?.checked)}
            error={errors?.authorizeCredit}
            required
          />

          <Checkbox
            label="I agree to the Terms of Service and Privacy Policy"
            description="Please review our policies before submitting"
            checked={formData?.agreeTerms}
            onChange={(e) => onChange('agreeTerms', e?.target?.checked)}
            error={errors?.agreeTerms}
            required
          />

          <Checkbox
            label="I consent to receive communications from Rfincare and partner lenders via email, phone, and SMS"
            checked={formData?.consentCommunications}
            onChange={(e) => onChange('consentCommunications', e?.target?.checked)}
          />
        </div>
      </div>

      {/* Important Notice */}
      <div className="p-4 md:p-6 bg-warning/10 border border-warning/30 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="AlertTriangle" size={20} className="text-warning flex-shrink-0 mt-1 md:w-6 md:h-6" />
          <div className="flex-1">
            <h4 className="text-sm md:text-base font-semibold text-foreground mb-2">
              Important Notice
            </h4>
            <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
              <li>• This is not a loan application but a pre-qualification assessment</li>
              <li>• Actual loan terms will be determined by individual lenders</li>
              <li>• A hard credit inquiry may be performed by lenders you choose to apply with</li>
              <li>• You are not obligated to accept any loan offers</li>
              <li>• After review, you will upload documents and sign before final submission</li>
              <li>• Your account will be created when you continue to document upload</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmitForm;