/** Post office marketplace taxonomy — mirrors backend/src/lib/postOfficeTaxonomy.js */

export const POST_OFFICE_CATEGORIES = [
  { slug: 'ppf', label: 'PPF', icon: 'PiggyBank' },
  { slug: 'nsc', label: 'NSC', icon: 'FileBadge' },
  { slug: 'kvp', label: 'KVP', icon: 'TrendingUp' },
  { slug: 'sukanya_samriddhi', label: 'Sukanya Samriddhi', icon: 'HeartHandshake' },
  { slug: 'senior_citizen_savings', label: 'SCSS', icon: 'Users' },
  { slug: 'monthly_income_scheme', label: 'MIS', icon: 'Calendar' },
  { slug: 'time_deposit', label: 'TD', icon: 'Clock' },
  { slug: 'recurring_deposit', label: 'RD', icon: 'Repeat' },
];

export const DEFAULT_POST_OFFICE_FILTERS = {
  search: '',
  category: 'all',
};

export const COMPARE_TABLE_ROWS = [
  { key: 'eligibilityText', label: 'Eligibility', type: 'text' },
  { key: 'returnsSummary', label: 'Returns', type: 'text' },
  { key: 'maturityValue', label: 'Maturity Value', type: 'maturity' },
  { key: 'taxBenefitsText', label: 'Tax Benefits', type: 'text' },
];

export function getCategoryLabel(slug) {
  return POST_OFFICE_CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}
