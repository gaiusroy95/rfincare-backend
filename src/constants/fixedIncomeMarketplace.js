/** Fixed income marketplace taxonomy — mirrors backend/src/lib/fixedIncomeTaxonomy.js */

export const FIXED_INCOME_CATEGORIES = [
  { slug: 'fixed_deposits', label: 'Fixed Deposits', icon: 'Landmark' },
  { slug: 'corporate_fd', label: 'Corporate FD', icon: 'Building2' },
  { slug: 'nbfc_fd', label: 'NBFC FD', icon: 'Briefcase' },
  { slug: 'senior_citizen_fd', label: 'Senior Citizen FD', icon: 'HeartHandshake' },
  { slug: 'tax_saving_fd', label: 'Tax Saving FD', icon: 'Receipt' },
  { slug: 'recurring_deposit', label: 'Recurring Deposit', icon: 'Repeat' },
];

export const DEFAULT_FIXED_INCOME_FILTERS = {
  search: '',
  category: 'all',
};

export const COMPARE_TABLE_ROWS = [
  { key: 'interestRate', label: 'Interest Rate', type: 'rate' },
  { key: 'lockInMonths', label: 'Lock-in', type: 'months' },
  { key: 'prematureWithdrawal', label: 'Premature Withdrawal', type: 'bool' },
  { key: 'monthlyInterest', label: 'Monthly Interest', type: 'bool' },
  { key: 'quarterlyInterest', label: 'Quarterly Interest', type: 'bool' },
];

export function getCategoryLabel(slug) {
  return FIXED_INCOME_CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}

