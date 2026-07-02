/** Form field schemas per calculator engine — drives UniversalCalculator UI. */

export const ENGINE_FIELD_SCHEMAS = {
  emi: [
    { key: 'principal', label: 'Loan amount (₹)', type: 'number', min: 1000 },
    { key: 'annualRate', label: 'Interest rate (% p.a.)', type: 'number', step: 0.1 },
    { key: 'tenureMonths', label: 'Tenure (months)', type: 'number', min: 1 },
  ],
  sip: [
    { key: 'monthlyInvestment', label: 'Monthly investment (₹)', type: 'number' },
    { key: 'expectedReturn', label: 'Expected return (% p.a.)', type: 'number', step: 0.1 },
    { key: 'tenureYears', label: 'Tenure (years)', type: 'number', min: 1 },
  ],
  'step-up-sip': [
    { key: 'monthlyInvestment', label: 'Starting SIP (₹)', type: 'number' },
    { key: 'stepUpPercent', label: 'Annual step-up (%)', type: 'number' },
    { key: 'expectedReturn', label: 'Expected return (% p.a.)', type: 'number' },
    { key: 'tenureYears', label: 'Tenure (years)', type: 'number' },
  ],
  swp: [
    { key: 'monthlyWithdrawal', label: 'Monthly withdrawal (₹)', type: 'number' },
    { key: 'expectedReturn', label: 'Expected return (% p.a.)', type: 'number' },
    { key: 'tenureYears', label: 'Withdrawal period (years)', type: 'number' },
  ],
  lumpsum: [
    { key: 'amount', label: 'Investment amount (₹)', type: 'number' },
    { key: 'expectedReturn', label: 'Expected return (% p.a.)', type: 'number' },
    { key: 'tenureYears', label: 'Tenure (years)', type: 'number' },
  ],
  fd: [
    { key: 'principal', label: 'Deposit amount (₹)', type: 'number' },
    { key: 'annualRate', label: 'Interest rate (% p.a.)', type: 'number' },
    { key: 'years', label: 'Tenure (years)', type: 'number' },
  ],
  rd: [
    { key: 'monthlyDeposit', label: 'Monthly deposit (₹)', type: 'number' },
    { key: 'annualRate', label: 'Interest rate (% p.a.)', type: 'number' },
    { key: 'months', label: 'Tenure (months)', type: 'number' },
  ],
  ppf: [
    { key: 'annualDeposit', label: 'Annual deposit (₹)', type: 'number' },
    { key: 'annualRate', label: 'Interest rate (% p.a.)', type: 'number' },
    { key: 'years', label: 'Tenure (years)', type: 'number' },
  ],
  'compound-interest': [
    { key: 'principal', label: 'Principal (₹)', type: 'number' },
    { key: 'annualRate', label: 'Interest rate (% p.a.)', type: 'number' },
    { key: 'years', label: 'Tenure (years)', type: 'number' },
    { key: 'compoundingFrequency', label: 'Compounding per year', type: 'number' },
  ],
  cagr: [
    { key: 'beginValue', label: 'Beginning value (₹)', type: 'number' },
    { key: 'endValue', label: 'Ending value (₹)', type: 'number' },
    { key: 'years', label: 'Period (years)', type: 'number' },
  ],
  'loan-eligibility': [
    { key: 'monthlyIncome', label: 'Monthly income (₹)', type: 'number' },
    { key: 'existingEmi', label: 'Existing EMI (₹)', type: 'number' },
    { key: 'interestRate', label: 'Interest rate (% p.a.)', type: 'number' },
    { key: 'tenureYears', label: 'Tenure (years)', type: 'number' },
  ],
  'debt-consolidation': [
    { key: 'newRate', label: 'New consolidated rate (% p.a.)', type: 'number' },
    { key: 'newTenureYears', label: 'New tenure (years)', type: 'number' },
  ],
  'loan-prepayment': [
    { key: 'principal', label: 'Outstanding loan (₹)', type: 'number' },
    { key: 'annualRate', label: 'Interest rate (% p.a.)', type: 'number' },
    { key: 'tenureMonths', label: 'Remaining tenure (months)', type: 'number' },
    { key: 'prepayment', label: 'Prepayment amount (₹)', type: 'number' },
    { key: 'afterMonths', label: 'Prepay after (months)', type: 'number' },
  ],
  'balance-transfer': [
    { key: 'outstanding', label: 'Outstanding (₹)', type: 'number' },
    { key: 'currentRate', label: 'Current rate (% p.a.)', type: 'number' },
    { key: 'newRate', label: 'New rate (% p.a.)', type: 'number' },
    { key: 'tenureMonths', label: 'Tenure (months)', type: 'number' },
  ],
  'income-tax': [
    { key: 'annualIncome', label: 'Annual income (₹)', type: 'number' },
    { key: 'deductions', label: 'Deductions — old regime (₹)', type: 'number' },
    {
      key: 'regime',
      label: 'Regime',
      type: 'select',
      options: [
        { value: 'both', label: 'Compare both' },
        { value: 'old', label: 'Old regime' },
        { value: 'new', label: 'New regime' },
      ],
    },
  ],
  hra: [
    { key: 'basicSalary', label: 'Basic salary / month (₹)', type: 'number' },
    { key: 'hraReceived', label: 'HRA received / month (₹)', type: 'number' },
    { key: 'rentPaid', label: 'Rent paid / month (₹)', type: 'number' },
    {
      key: 'metro',
      label: 'Metro city',
      type: 'select',
      options: [
        { value: 'true', label: 'Yes (50% of basic)' },
        { value: 'false', label: 'No (40% of basic)' },
      ],
    },
  ],
  'capital-gain': [
    { key: 'purchasePrice', label: 'Purchase price (₹)', type: 'number' },
    { key: 'salePrice', label: 'Sale price (₹)', type: 'number' },
    { key: 'holdingMonths', label: 'Holding period (months)', type: 'number' },
    {
      key: 'assetType',
      label: 'Asset type',
      type: 'select',
      options: [
        { value: 'equity', label: 'Equity / MF' },
        { value: 'other', label: 'Other assets' },
      ],
    },
  ],
  gst: [
    { key: 'amount', label: 'Amount (₹)', type: 'number' },
    { key: 'gstRate', label: 'GST rate (%)', type: 'number' },
    {
      key: 'inclusive',
      label: 'Amount type',
      type: 'select',
      options: [
        { value: 'false', label: 'Exclusive of GST' },
        { value: 'true', label: 'Inclusive of GST' },
      ],
    },
  ],
  tds: [
    { key: 'amount', label: 'Payment amount (₹)', type: 'number' },
    { key: 'tdsRate', label: 'TDS rate (%)', type: 'number' },
  ],
  'section-80c': [
    { key: 'ppf', label: 'PPF (₹)', type: 'number' },
    { key: 'elss', label: 'ELSS (₹)', type: 'number' },
    { key: 'epf', label: 'EPF (₹)', type: 'number' },
    { key: 'lifeInsurance', label: 'Life insurance (₹)', type: 'number' },
  ],
  'section-80d': [
    { key: 'selfPremium', label: 'Self/family premium (₹)', type: 'number' },
    { key: 'parentsPremium', label: 'Parents premium (₹)', type: 'number' },
    {
      key: 'parentsSenior',
      label: 'Senior citizen parents',
      type: 'select',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
    },
  ],
  'advance-tax': [
    { key: 'annualIncome', label: 'Annual income (₹)', type: 'number' },
    { key: 'tdsPaid', label: 'TDS already paid (₹)', type: 'number' },
  ],
  'retirement-corpus': [
    { key: 'monthlyExpense', label: 'Current monthly expense (₹)', type: 'number' },
    { key: 'inflationRate', label: 'Inflation (% p.a.)', type: 'number' },
    { key: 'yearsToRetirement', label: 'Years to retirement', type: 'number' },
    { key: 'postRetirementYears', label: 'Post-retirement years', type: 'number' },
    { key: 'returnRate', label: 'Expected return (% p.a.)', type: 'number' },
  ],
  pension: [
    { key: 'corpus', label: 'Retirement corpus (₹)', type: 'number' },
    { key: 'annualRate', label: 'Payout rate (% p.a.)', type: 'number' },
    { key: 'payoutYears', label: 'Payout period (years)', type: 'number' },
  ],
  nps: [
    { key: 'age', label: 'Current age', type: 'number' },
    { key: 'retirementAge', label: 'Retirement age', type: 'number' },
    { key: 'monthlyContribution', label: 'Your monthly contribution (₹)', type: 'number' },
    { key: 'employerContribution', label: 'Employer contribution (₹)', type: 'number' },
    { key: 'expectedReturn', label: 'Expected return (% p.a.)', type: 'number' },
  ],
  annuity: [
    { key: 'principal', label: 'Lump sum (₹)', type: 'number' },
    { key: 'annualRate', label: 'Annuity rate (% p.a.)', type: 'number' },
    { key: 'payoutYears', label: 'Payout period (years)', type: 'number' },
  ],
  epf: [
    { key: 'monthlyBasic', label: 'Monthly basic (₹)', type: 'number' },
    { key: 'employeePct', label: 'Employee EPF (%)', type: 'number' },
    { key: 'employerPct', label: 'Employer EPF (%)', type: 'number' },
    { key: 'annualIncrease', label: 'Annual increment (%)', type: 'number' },
    { key: 'years', label: 'Years of service', type: 'number' },
    { key: 'epfRate', label: 'EPF interest (% p.a.)', type: 'number' },
  ],
  gratuity: [
    { key: 'basicSalary', label: 'Last drawn basic (₹)', type: 'number' },
    { key: 'yearsOfService', label: 'Years of service', type: 'number' },
  ],
  'goal-sip': [
    { key: 'goalAmount', label: 'Goal amount (₹)', type: 'number' },
    { key: 'years', label: 'Years to goal', type: 'number' },
    { key: 'expectedReturn', label: 'Expected return (% p.a.)', type: 'number' },
  ],
  'net-worth': [
    { key: 'assets', label: 'Total assets (₹)', type: 'number' },
    { key: 'liabilities', label: 'Total liabilities (₹)', type: 'number' },
  ],
  fire: [
    { key: 'annualExpense', label: 'Annual expenses (₹)', type: 'number' },
    { key: 'withdrawalRate', label: 'Safe withdrawal rate (%)', type: 'number' },
  ],
  inflation: [
    { key: 'futureValue', label: 'Future amount (₹)', type: 'number' },
    { key: 'inflationRate', label: 'Inflation (% p.a.)', type: 'number' },
    { key: 'years', label: 'Years', type: 'number' },
  ],
  'rent-vs-buy': [
    { key: 'rent', label: 'Monthly rent (₹)', type: 'number' },
    { key: 'homePrice', label: 'Home price (₹)', type: 'number' },
    { key: 'downPayment', label: 'Down payment (₹)', type: 'number' },
    { key: 'loanRate', label: 'Loan rate (% p.a.)', type: 'number' },
    { key: 'tenureYears', label: 'Loan tenure (years)', type: 'number' },
    { key: 'appreciation', label: 'Home appreciation (% p.a.)', type: 'number' },
  ],
  'stamp-duty': [
    { key: 'propertyValue', label: 'Property value (₹)', type: 'number' },
    { key: 'stampDutyPercent', label: 'Stamp duty (%)', type: 'number' },
  ],
  'property-registration': [
    { key: 'propertyValue', label: 'Property value (₹)', type: 'number' },
    { key: 'registrationPercent', label: 'Registration (%)', type: 'number' },
  ],
  'salary-breakup': [
    { key: 'ctc', label: 'Annual CTC (₹)', type: 'number' },
    { key: 'basicPercent', label: 'Basic (% of CTC)', type: 'number' },
  ],
  breakeven: [
    { key: 'fixedCost', label: 'Fixed costs (₹)', type: 'number' },
    { key: 'variableCostPerUnit', label: 'Variable cost / unit (₹)', type: 'number' },
    { key: 'pricePerUnit', label: 'Selling price / unit (₹)', type: 'number' },
  ],
  'bond-yield': [
    { key: 'faceValue', label: 'Face value (₹)', type: 'number' },
    { key: 'couponRate', label: 'Coupon rate (% p.a.)', type: 'number' },
    { key: 'years', label: 'Years to maturity', type: 'number' },
    { key: 'marketPrice', label: 'Market price (₹)', type: 'number' },
  ],
  affordability: [
    { key: 'monthlyIncome', label: 'Monthly income (₹)', type: 'number' },
    { key: 'existingEmi', label: 'Existing EMI (₹)', type: 'number' },
    { key: 'downPayment', label: 'Down payment (₹)', type: 'number' },
    { key: 'interestRate', label: 'Interest rate (% p.a.)', type: 'number' },
    { key: 'tenureYears', label: 'Tenure (years)', type: 'number' },
  ],
};

export const RESULT_HIGHLIGHT_KEYS = [
  'emi', 'totalPayment', 'totalInterest', 'futureValue', 'maturityValue', 'corpusRequired',
  'monthlySipNeeded', 'monthlyPension', 'totalCorpus', 'netWorth', 'totalTax', 'hraExempt',
  'capitalGain', 'gstAmount', 'monthlySavings', 'eligibleLoanAmount', 'maxAffordableHomePrice',
  'fireCorpus', 'cagrPercent', 'gratuityAmount', 'epfCorpus', 'monthlyPayout', 'deductionClaimed',
];

export function getFieldsForEngine(engine) {
  return ENGINE_FIELD_SCHEMAS[engine] || [];
}

export function coerceFieldValue(field, raw) {
  if (field.type === 'number') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : '';
  }
  if (field.type === 'select' && (field.key === 'metro' || field.key === 'inclusive' || field.key === 'parentsSenior')) {
    return raw === 'true' || raw === true;
  }
  return raw;
}
