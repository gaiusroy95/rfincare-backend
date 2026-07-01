import { calculateTotalMonthlyEmi } from './calculateTotalMonthlyEmi';

export function buildEligibilityInputFromAssessment(form) {
  const monthlyFromField = parseFloat(form?.monthlyIncome || '');
  const monthlyFromAnnual = parseFloat(form?.annualIncome || '') / 12;
  const monthlyFromRetirement = parseFloat(form?.retirementIncome || '') / 12;
  let monthlyIncome = monthlyFromField;
  if (!monthlyIncome || monthlyIncome <= 0) {
    monthlyIncome =
      form?.employmentType === 'retired' ? monthlyFromRetirement : monthlyFromAnnual;
  }

  return {
    loanType: form?.loanPurpose || null,
    loanAmount: parseFloat(form?.loanAmount || '') || 0,
    monthlyIncome: monthlyIncome || 0,
    employmentType: form?.employmentType || 'salaried',
    creditScoreRange: form?.creditScoreRange || null,
    existingLoans: calculateTotalMonthlyEmi(form),
  };
}
