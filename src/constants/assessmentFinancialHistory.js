/** Yes/No options for financial history disclosures (assessment Financial step). */
export const FINANCIAL_YES_NO_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
];

/**
 * Financial history questions shown on the customer assessment form.
 * Update labels here if your Excel spec changes.
 */
export const FINANCIAL_HISTORY_QUESTIONS = [
  {
    field: 'loanDefaultPast36Months',
    label:
      'Have you defaulted on any loan or credit card payment for more than 90 days in the last 36 months?',
    description: 'Include overdue EMIs or missed payments reported to CIBIL or other bureaus',
    payloadKey: 'loan_default_past_36_months',
    legacyBooleanKey: 'has_bankruptcy',
  },
  {
    field: 'accountNpaWrittenOff',
    label:
      'Has any bank or NBFC classified your account as NPA, written off, or settled in the last 7 years?',
    description: 'Select Yes if any lender has reported a write-off or OTS settlement',
    payloadKey: 'account_npa_written_off',
    legacyBooleanKey: 'has_foreclosure',
  },
  {
    field: 'creditBureauOverdue',
    label: 'Do you currently have overdue amounts on your credit bureau report (CIBIL/Experian)?',
    description: 'Outstanding dues shown on your latest credit report',
    payloadKey: 'credit_bureau_overdue',
    legacyBooleanKey: 'has_tax_liens',
  },
  {
    field: 'coApplicantOrGuarantor',
    label: 'Are you a co-applicant or guarantor on any other active loan?',
    description: 'Include loans where you are not the primary borrower',
    payloadKey: 'co_applicant_or_guarantor',
    legacyBooleanKey: 'has_co_signed_loans',
  },
];

export const FINANCIAL_HISTORY_INITIAL = Object.fromEntries(
  FINANCIAL_HISTORY_QUESTIONS.map((q) => [q.field, '']),
);

export function financialHistoryLabel(value) {
  if (value === 'yes') return 'Yes';
  if (value === 'no') return 'No';
  return value || '—';
}

export function isFinancialHistoryYes(value) {
  return value === 'yes';
}
