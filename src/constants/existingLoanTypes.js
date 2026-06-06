/** Loan types for dynamic existing-loan / EMI rows on the assessment form. */
export const EXISTING_LOAN_TYPE_OPTIONS = [
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'home_loan', label: 'Home Loan' },
  { value: 'loan_against_property', label: 'Loan Against Property' },
  { value: 'mortgage_loan', label: 'Mortgage Loan' },
  { value: 'business_loan', label: 'Business Loan' },
  { value: 'car_loan', label: 'Car Loan' },
  { value: 'two_wheeler_loan', label: 'Two Wheeler Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'consumer_loan', label: 'Consumer Loan' },
  { value: 'overdraft_cc', label: 'Overdraft / CC' },
];

const LABEL_BY_VALUE = Object.fromEntries(
  EXISTING_LOAN_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

export function getExistingLoanTypeLabel(loanType) {
  return LABEL_BY_VALUE[loanType] || loanType || 'Loan';
}
