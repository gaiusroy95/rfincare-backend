import { DEFAULT_INVESTMENT_FILTERS, getRiskLabel } from '../constants/investmentMarketplace';

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

export function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN')}`;
}

export function formatCompareCell(product, row) {
  if (!product) return '—';
  switch (row.type) {
    case 'percent':
      return formatPercent(product[row.key]);
    case 'expense':
      return formatExpenseRatio(product[row.key]);
    case 'currency':
      return formatCurrency(product[row.key]);
    case 'risk':
      return product.riskLevel ? getRiskLabel(product.riskLevel) : '—';
    case 'text':
    default:
      return product[row.key] || '—';
  }
}

export function buildQueryParams(filters = {}) {
  const params = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  return params;
}

export function resetInvestmentFilters() {
  return { ...DEFAULT_INVESTMENT_FILTERS };
}
