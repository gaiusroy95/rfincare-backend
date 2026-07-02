/**
 * Advanced comparison dimensions — normalised filters across product types.
 * Used on product-comparison hub and marketplace compare boards.
 */

export const ADVANCED_COMPARE_DIMENSIONS = [
  { id: 'interest_return_rate', label: 'Interest / Return Rate', types: ['loan', 'fixed_income', 'post_office', 'mutual_fund', 'investment', 'government_scheme'] },
  { id: 'processing_fee', label: 'Processing Fee', types: ['loan', 'credit_card', 'insurance'] },
  { id: 'eligibility', label: 'Eligibility', types: ['loan', 'insurance', 'credit_card', 'government_scheme'] },
  { id: 'tenure', label: 'Tenure', types: ['loan', 'fixed_income', 'post_office', 'insurance'] },
  { id: 'min_investment', label: 'Minimum Investment', types: ['mutual_fund', 'fixed_income', 'post_office', 'investment', 'government_scheme'] },
  { id: 'max_coverage', label: 'Maximum Coverage', types: ['insurance'] },
  { id: 'claim_settlement', label: 'Claim Settlement Ratio', types: ['insurance'] },
  { id: 'lock_in', label: 'Lock-in Period', types: ['mutual_fund', 'fixed_income', 'post_office', 'government_scheme'] },
  { id: 'tax_benefits', label: 'Tax Benefits', types: ['insurance', 'mutual_fund', 'fixed_income', 'post_office', 'government_scheme'] },
  { id: 'customer_ratings', label: 'Customer Ratings', types: ['loan', 'insurance', 'mutual_fund', 'credit_card', 'investment'] },
  { id: 'provider_ratings', label: 'Provider Ratings', types: ['loan', 'insurance', 'mutual_fund', 'credit_card'] },
  { id: 'tat', label: 'Turnaround Time (TAT)', types: ['loan', 'insurance', 'credit_card'] },
  { id: 'cashback_rewards', label: 'Cashback / Rewards', types: ['credit_card', 'loan'] },
  { id: 'hidden_charges', label: 'Hidden Charges', types: ['loan', 'credit_card', 'insurance', 'mutual_fund'] },
  { id: 'documentation', label: 'Documentation Required', types: ['loan', 'insurance', 'credit_card', 'government_scheme'] },
];

export const COMPARE_BUNDLES = [
  {
    id: 'retirement-stack',
    title: 'Retirement Planning Stack',
    description: 'Compare NPS, pension plans, SCSS and retirement calculators side by side.',
    path: '/retirement-planning',
    productTypes: ['government_scheme', 'insurance', 'post_office'],
  },
  {
    id: 'tax-saving-stack',
    title: 'Tax Saving Stack',
    description: 'ELSS, tax FD, NPS, ULIP and term insurance for maximum deductions.',
    path: '/tax-saving',
    productTypes: ['mutual_fund', 'fixed_income', 'government_scheme', 'insurance'],
  },
  {
    id: 'wealth-stack',
    title: 'Wealth Creation Stack',
    description: 'Mutual funds, investments and goal-based SIP planning.',
    path: '/wealth-management',
    productTypes: ['mutual_fund', 'investment'],
  },
];

export function getDimensionsForType(productType) {
  return ADVANCED_COMPARE_DIMENSIONS.filter((d) => d.types.includes(productType));
}
