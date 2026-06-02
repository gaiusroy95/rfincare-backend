/**
 * Standard reducing-balance monthly EMI.
 * @param {number} principal - Loan amount (₹)
 * @param {number} annualRatePercent - Annual interest rate (%)
 * @param {number} tenureMonths - Loan tenure in months
 */
export function calculateEmi(principal, annualRatePercent, tenureMonths) {
  const p = Number(principal);
  const months = Number(tenureMonths);
  const annualRate = Number(annualRatePercent);

  if (!p || p <= 0 || !months || months <= 0) {
    return null;
  }

  if (!annualRate || annualRate <= 0) {
    const emi = p / months;
    return {
      emi: Math.round(emi),
      totalPayment: Math.round(emi * months),
      totalInterest: 0,
      principal: p,
      tenureMonths: months,
      annualRatePercent: 0,
    };
  }

  const r = annualRate / 12 / 100;
  const factor = Math.pow(1 + r, months);
  const emi = (p * r * factor) / (factor - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - p;

  return {
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    principal: p,
    tenureMonths: months,
    annualRatePercent: annualRate,
  };
}

export function formatInr(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}
