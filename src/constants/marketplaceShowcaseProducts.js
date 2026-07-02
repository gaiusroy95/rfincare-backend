/** Homepage / comparison showcase entries for non-loan marketplaces */
export const MARKETPLACE_SHOWCASE_PRODUCTS = [
  {
    slug: 'insurance',
    apiKey: 'insurance',
    kind: 'marketplace',
    route: '/insurance-marketplace',
    label: 'Insurance',
    shortLabel: 'Insurance',
    icon: 'Shield',
    description: 'Compare life, health, motor, and travel insurance from trusted insurers.',
    interestRange: 'From ₹500/month',
    features: ['Life & health plans', 'Motor insurance', 'Tax benefits (80C/80D)', 'Quick policy quotes'],
    color: '#059669',
    visibilityKey: 'insuranceMarketplace',
  },
  {
    slug: 'mutual_fund',
    apiKey: 'mutual_funds',
    kind: 'marketplace',
    route: '/mutual-fund-marketplace',
    label: 'Mutual Fund',
    shortLabel: 'Mutual Fund',
    icon: 'TrendingUp',
    description: 'Discover SIP and lump-sum mutual fund options matched to your goals.',
    interestRange: 'SIP from ₹500/month',
    features: ['Equity & debt funds', 'SIP from ₹500', 'Goal-based investing', 'Top-rated AMCs'],
    color: '#d97706',
    visibilityKey: 'mutualFundMarketplace',
  },
];

export const COMPARE_SHOWCASE_PRODUCT = {
  slug: 'compare_products',
  kind: 'compare',
  route: '/product-comparison',
  label: 'Compare Products',
  shortLabel: 'Compare',
  icon: 'GitCompare',
  description: 'Compare loans, credit cards, insurance, and mutual funds side by side.',
  interestRange: 'All categories',
  features: ['Up to 3 products', 'Bank offer comparison', 'Insurance & MF plans', 'One-click apply'],
  color: '#6366f1',
};
