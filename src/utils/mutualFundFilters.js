import {
  DEFAULT_MUTUAL_FUND_FILTERS,
  FILTER_FUND_CATEGORIES,
  getRiskLabel,
} from '../constants/mutualFundMarketplace';

export function formatMinInvestment(fund) {
  const amount = fund?.minSipAmount ?? fund?.minLumpsumAmount;
  if (amount == null) return '—';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function getRiskDotLevel(riskSlug) {
  const map = {
    low: 1,
    low_to_moderate: 2,
    moderate: 3,
    moderately_high: 4,
    high: 4,
    very_high: 5,
  };
  return map[riskSlug] || 3;
}

export function categoryGroupToParam(groupId) {
  if (!groupId || groupId === 'all') return 'all';
  const group = FILTER_FUND_CATEGORIES.find((g) => g.id === groupId);
  if (!group?.slugs?.length) return 'all';
  return group.slugs.join(',');
}

export function sortMutualFunds(funds, sortBy) {
  const list = [...funds];
  switch (sortBy) {
    case 'returns3y-desc':
      return list.sort((a, b) => Number(b?.returns3y ?? -999) - Number(a?.returns3y ?? -999));
    case 'returns3y-asc':
      return list.sort((a, b) => Number(a?.returns3y ?? 999) - Number(b?.returns3y ?? 999));
    case 'expense-asc':
      return list.sort((a, b) => Number(a?.expenseRatio ?? 999) - Number(b?.expenseRatio ?? 999));
    case 'expense-desc':
      return list.sort((a, b) => Number(b?.expenseRatio ?? -999) - Number(a?.expenseRatio ?? -999));
    case 'rating-desc':
      return list.sort((a, b) => Number(b?.rating ?? 0) - Number(a?.rating ?? 0));
    case 'name-asc':
      return list.sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || '')));
    default:
      return list.sort((a, b) => Number(b?.displayPriority ?? 0) - Number(a?.displayPriority ?? 0));
  }
}

export function filterByMinInvestment(funds, minInvestment) {
  if (!minInvestment || minInvestment === 'all') return funds;
  const max = Number(minInvestment);
  if (!Number.isFinite(max)) return funds;
  return funds.filter((f) => {
    const min = f?.minSipAmount ?? f?.minLumpsumAmount;
    if (min == null) return true;
    return Number(min) <= max;
  });
}

export function formatPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(2)}%`;
}

export function formatExpenseRatio(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(2)}%`;
}

export function formatAum(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k Cr`;
  return `₹${n.toLocaleString('en-IN')} Cr`;
}

export function formatRating(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(1)} ★`;
}

export function formatCompareCell(fund, row) {
  if (!fund) return '—';
  switch (row.type) {
    case 'percent': return formatPercent(fund[row.key]);
    case 'expense': return formatExpenseRatio(fund[row.key]);
    case 'aum': return formatAum(fund[row.key]);
    case 'rating': return formatRating(fund[row.key]);
    case 'risk': return fund.riskLevel ? getRiskLabel(fund.riskLevel) : '—';
    case 'text':
    default: return fund[row.key] || '—';
  }
}

export function buildMutualFundQueryParams(filters = {}) {
  const params = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  const categoryParam = filters.categoryGroup
    ? categoryGroupToParam(filters.categoryGroup)
    : filters.category;
  if (categoryParam && categoryParam !== 'all') params.category = categoryParam;
  if (filters.riskLevel && filters.riskLevel !== 'all') params.riskLevel = filters.riskLevel;
  if (filters.returns && filters.returns !== 'all') params.returns = filters.returns;
  if (filters.expenseRatio && filters.expenseRatio !== 'all') params.expenseRatio = filters.expenseRatio;
  if (filters.rating && filters.rating !== 'all') params.rating = filters.rating;
  if (filters.supportsSip) params.supportsSip = 'true';
  if (filters.supportsLumpsum) params.supportsLumpsum = 'true';
  return params;
}

export function countActiveFilters(filters = {}) {
  let count = 0;
  if (filters.search?.trim()) count += 1;
  if (filters.categoryGroup && filters.categoryGroup !== 'all') count += 1;
  else if (filters.category && filters.category !== 'all') count += 1;
  if (filters.riskLevel && filters.riskLevel !== 'all') count += 1;
  if (filters.returns && filters.returns !== 'all') count += 1;
  if (filters.minInvestment && filters.minInvestment !== 'all') count += 1;
  if (filters.expenseRatio && filters.expenseRatio !== 'all') count += 1;
  if (filters.rating && filters.rating !== 'all') count += 1;
  if (filters.supportsSip) count += 1;
  if (filters.supportsLumpsum) count += 1;
  return count;
}

export function resetMutualFundFilters() {
  return { ...DEFAULT_MUTUAL_FUND_FILTERS };
}
