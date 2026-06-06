import { getCompleteExistingLoans, sumExistingLoanEmi } from './existingLoans';

export const EMI_FORM_FIELDS = [
  'personalLoanEmi1',
  'personalLoanEmi2',
  'housingLoanEmi1',
  'housingLoanEmi2',
  'carLoanEmi',
  'twoWheelerLoanEmi',
  'otherLoanEmi1',
  'otherLoanEmi2',
];

const EMI_SNAKE_FIELDS = [
  'personal_loan_emi_1',
  'personal_loan_emi_2',
  'housing_loan_emi_1',
  'housing_loan_emi_2',
  'car_loan_emi',
  'two_wheeler_loan_emi',
  'other_loan_emi_1',
  'other_loan_emi_2',
];

function parseEmi(value) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Sum dynamic existing-loan rows, with legacy fixed-field fallback. */
export function calculateTotalMonthlyEmi(formData) {
  if (!formData || formData.hasRunningLoanOrCard === 'no') return 0;

  const fromDynamic = sumExistingLoanEmi(formData.existingLoans);
  if (fromDynamic > 0) return fromDynamic;

  const complete = getCompleteExistingLoans(formData.existing_loans);
  if (complete.length) return sumExistingLoanEmi(complete);

  const fromCamel = EMI_FORM_FIELDS.reduce((sum, key) => sum + parseEmi(formData[key]), 0);
  if (fromCamel > 0) return fromCamel;

  return EMI_SNAKE_FIELDS.reduce((sum, key) => sum + parseEmi(formData[key]), 0);
}

export function formatTotalMonthlyEmi(formData) {
  const total = calculateTotalMonthlyEmi(formData);
  if (total <= 0) return '—';
  return `₹${Math.round(total).toLocaleString('en-IN')}`;
}
