export const LOAN_PRIORITY_OPTIONS = [
  {
    id: 'low_interest',
    label: 'Lowest interest rate',
    description: 'Minimize EMI and total interest paid',
    icon: 'TrendingDown',
  },
  {
    id: 'low_charges',
    label: 'Low processing & other charges',
    description: 'Focus on fees, legal, and stamp duty costs',
    icon: 'IndianRupee',
  },
  {
    id: 'urgent',
    label: 'Fast disbursal',
    description: 'Get funds quickly even if rate is slightly higher',
    icon: 'Zap',
  },
  {
    id: 'best_deal',
    label: 'Best overall deal',
    description: 'Balance rate, charges, and lender reputation',
    icon: 'Award',
  },
];

const VALID_IDS = new Set(LOAN_PRIORITY_OPTIONS.map((o) => o.id));

/** Read priorities from form state (array or legacy single string). */
export function getLoanPriorities(formData) {
  const rawPriorities = formData?.loanPriorities;
  if (Array.isArray(rawPriorities) && rawPriorities.length) {
    return rawPriorities.filter((id) => VALID_IDS.has(id)).slice(0, 2);
  }
  const legacy = formData?.loanPriority;
  if (!legacy || typeof legacy !== 'string') return [];
  return legacy
    .split(',')
    .map((s) => s.trim())
    .filter((id) => VALID_IDS.has(id))
    .slice(0, 2);
}

export function serializeLoanPriorities(ids) {
  return getLoanPriorities({ loanPriorities: ids }).join(',');
}

export function labelForPriority(id) {
  return LOAN_PRIORITY_OPTIONS.find((o) => o.id === id)?.label || id;
}
