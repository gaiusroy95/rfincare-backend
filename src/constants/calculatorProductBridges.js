/**
 * Maps calculator slugs to product CTAs shown after calculation results.
 */

function formatInr(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

const BRIDGES = {
  emi: {
    headline: (result) => {
      const emi = formatInr(result?.emi);
      return emi ? `Your EMI is ${emi}/month` : 'Ready to apply for a loan?';
    },
    subline: 'Compare personal loan rates from partner banks and apply in minutes.',
    products: [
      { label: 'Apply for Personal Loan', path: '/eligibility-assessment?loanType=personal', icon: 'Landmark', primary: true },
      { label: 'Browse Bank Marketplace', path: '/bank-marketplace', icon: 'Building2' },
    ],
  },
  'personal-loan': {
    headline: () => 'Found your EMI estimate?',
    subline: 'Check eligibility and get offers matched to your profile.',
    products: [
      { label: 'Check Eligibility', path: '/eligibility-assessment?loanType=personal', icon: 'CheckCircle', primary: true },
      { label: 'Compare Loans', path: '/product-comparison', icon: 'GitCompare' },
    ],
  },
  'home-loan': {
    headline: () => 'Planning your dream home?',
    subline: 'Compare home loan rates and start your application.',
    products: [
      { label: 'Apply for Home Loan', path: '/eligibility-assessment?loanType=home', icon: 'Home', primary: true },
      { label: 'Bank Marketplace', path: '/bank-marketplace', icon: 'Building2' },
    ],
  },
  'loan-eligibility': {
    headline: (result) => {
      const amount = formatInr(result?.eligibleAmount || result?.maxLoanAmount);
      return amount ? `You may be eligible for up to ${amount}` : 'See your loan options';
    },
    subline: 'Continue to a full application with document upload and bank selection.',
    products: [
      { label: 'Start Application', path: '/customer-assessment-portal', icon: 'FileText', primary: true },
      { label: 'Compare Banks', path: '/bank-marketplace', icon: 'Building2' },
    ],
  },
  sip: {
    headline: (result) => {
      const corpus = formatInr(result?.futureValue || result?.maturityAmount);
      return corpus ? `Projected corpus: ${corpus}` : 'Start investing today';
    },
    subline: 'Turn your plan into action with curated mutual fund SIPs from ₹500/month.',
    products: [
      { label: 'Start SIP', path: '/mutual-fund-marketplace', icon: 'TrendingUp', primary: true },
      { label: 'Wealth Management Hub', path: '/wealth-management', icon: 'PieChart' },
    ],
  },
  'mutual-fund-returns': {
    headline: () => 'Ready to invest?',
    subline: 'Explore top-rated mutual funds aligned with your return expectations.',
    products: [
      { label: 'Mutual Fund Marketplace', path: '/mutual-fund-marketplace', icon: 'TrendingUp', primary: true },
      { label: 'Compare Funds', path: '/product-comparison', icon: 'GitCompare' },
    ],
  },
  'retirement-corpus': {
    headline: (result) => {
      const corpus = formatInr(result?.requiredCorpus || result?.corpusRequired);
      const sip = formatInr(result?.monthlySipRequired || result?.sipRequired);
      if (corpus && sip) return `Need ${corpus}? Start SIP of ${sip}/mo`;
      return 'Secure your retirement';
    },
    subline: 'Bridge the gap with NPS, pension plans or equity SIPs.',
    products: [
      { label: 'Retirement Planning Hub', path: '/retirement-planning', icon: 'Sunset', primary: true },
      { label: 'Start SIP', path: '/mutual-fund-marketplace?category=retirement', icon: 'TrendingUp' },
      { label: 'NPS Schemes', path: '/government-schemes-marketplace?category=nps', icon: 'Landmark' },
    ],
  },
  nps: {
    headline: () => 'Open your NPS account',
    subline: 'Tax benefits under 80CCD and long-term retirement corpus.',
    products: [
      { label: 'Explore NPS', path: '/government-schemes-marketplace?category=nps', icon: 'Landmark', primary: true },
      { label: 'Retirement Hub', path: '/retirement-planning', icon: 'Sunset' },
    ],
  },
  'income-tax': {
    headline: (result) => {
      const saving = formatInr(result?.taxSaving || result?.savings);
      return saving ? `Potential tax saving: ${saving}` : 'Optimise your taxes';
    },
    subline: 'Invest in ELSS, PPF alternatives and insurance for deductions.',
    products: [
      { label: 'Tax Saving Hub', path: '/tax-saving', icon: 'Receipt', primary: true },
      { label: 'ELSS Funds', path: '/mutual-fund-marketplace?category=elss', icon: 'TrendingUp' },
    ],
  },
  'section-80c': {
    headline: () => 'Maximise your 80C deduction',
    subline: 'ELSS, tax-saving FDs and life insurance count toward ₹1.5 lakh limit.',
    products: [
      { label: 'Tax Saving Options', path: '/tax-saving', icon: 'Receipt', primary: true },
      { label: 'ELSS Mutual Funds', path: '/mutual-fund-marketplace?category=elss', icon: 'TrendingUp' },
    ],
  },
  'section-80d': {
    headline: () => 'Save tax on health insurance',
    subline: 'Health plans qualify for Section 80D — compare top insurers now.',
    products: [
      { label: 'Health Insurance', path: '/insurance-marketplace?category=health', icon: 'HeartPulse', primary: true },
      { label: 'All Insurance', path: '/insurance-marketplace', icon: 'Shield' },
    ],
  },
};

export const CALCULATOR_BRIDGE_SLUGS = Object.keys(BRIDGES);

export function getCalculatorProductBridge(slug, result = null) {
  const bridge = BRIDGES[slug];
  if (!bridge) return null;
  return {
    slug,
    headline: typeof bridge.headline === 'function' ? bridge.headline(result) : bridge.headline,
    subline: bridge.subline,
    products: bridge.products,
  };
}

export const POPULAR_CALCULATORS = [
  { slug: 'emi', title: 'EMI Calculator', description: 'Monthly loan repayment', icon: 'Landmark', path: '/resources/calculators/emi' },
  { slug: 'sip', title: 'SIP Calculator', description: 'Mutual fund returns', icon: 'TrendingUp', path: '/resources/calculators/sip' },
  { slug: 'retirement-corpus', title: 'Retirement Planner', description: 'Corpus & SIP needed', icon: 'Sunset', path: '/resources/calculators/retirement-corpus' },
  { slug: 'income-tax', title: 'Income Tax', description: 'Old vs new regime', icon: 'Receipt', path: '/resources/calculators/income-tax' },
  { slug: 'loan-eligibility', title: 'Loan Eligibility', description: 'How much can you borrow', icon: 'CheckCircle', path: '/resources/calculators/loan-eligibility' },
  { slug: 'section-80d', title: 'Section 80D', description: 'Health insurance tax benefit', icon: 'HeartPulse', path: '/resources/calculators/section-80d' },
];

export const FINANCIAL_PILLARS = [
  {
    id: 'borrow',
    title: 'Borrow',
    subtitle: 'Loans & credit',
    description: 'Personal, home, business loans with eligibility check and bank comparison.',
    icon: 'Landmark',
    path: '/eligibility-assessment',
    cta: 'Check eligibility',
    gradient: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'protect',
    title: 'Protect',
    subtitle: 'Insurance',
    description: 'Term life, health and motor insurance — compare and buy online.',
    icon: 'Shield',
    path: '/insurance-marketplace',
    cta: 'Compare plans',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'invest',
    title: 'Invest',
    subtitle: 'Mutual funds & more',
    description: 'SIP, ELSS and curated funds. Start from ₹500/month.',
    icon: 'TrendingUp',
    path: '/mutual-fund-marketplace',
    cta: 'Start investing',
    gradient: 'from-violet-600 to-purple-600',
  },
  {
    id: 'plan',
    title: 'Plan',
    subtitle: 'Calculators & goals',
    description: '55+ calculators for retirement, tax, EMI and wealth planning.',
    icon: 'Calculator',
    path: '/resources/calculators',
    cta: 'Open calculators',
    gradient: 'from-orange-500 to-amber-600',
  },
];
