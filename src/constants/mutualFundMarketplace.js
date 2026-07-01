/** Mutual fund marketplace taxonomy — mirrors backend/src/lib/mutualFundTaxonomy.js */

export const MUTUAL_FUND_CATEGORIES = [
  { slug: 'sip', label: 'SIP', icon: 'CalendarClock' },
  { slug: 'lumpsum', label: 'Lumpsum', icon: 'IndianRupee' },
  { slug: 'elss', label: 'ELSS', icon: 'Receipt' },
  { slug: 'debt_funds', label: 'Debt Funds', icon: 'Landmark' },
  { slug: 'liquid_funds', label: 'Liquid Funds', icon: 'Droplets' },
  { slug: 'hybrid_funds', label: 'Hybrid Funds', icon: 'Blend' },
  { slug: 'flexi_cap', label: 'Flexi Cap', icon: 'Shuffle' },
  { slug: 'mid_cap', label: 'Mid Cap', icon: 'TrendingUp' },
  { slug: 'small_cap', label: 'Small Cap', icon: 'Rocket' },
  { slug: 'large_cap', label: 'Large Cap', icon: 'Building2' },
  { slug: 'index_funds', label: 'Index Funds', icon: 'BarChart3' },
  { slug: 'etf', label: 'ETF', icon: 'LineChart' },
  { slug: 'international_funds', label: 'International Funds', icon: 'Globe' },
];

export const RISK_LEVELS = [
  { slug: 'low', label: 'Low' },
  { slug: 'low_to_moderate', label: 'Low to Moderate' },
  { slug: 'moderate', label: 'Moderate' },
  { slug: 'moderately_high', label: 'Moderately High' },
  { slug: 'high', label: 'High' },
  { slug: 'very_high', label: 'Very High' },
];

export const RETURNS_FILTER_OPTIONS = [
  { value: 'all', label: 'Any returns' },
  { value: '1y_10+', label: '1Y above 10%' },
  { value: '1y_15+', label: '1Y above 15%' },
  { value: '3y_12+', label: '3Y above 12%' },
  { value: '5y_12+', label: '5Y above 12%' },
];

export const EXPENSE_RATIO_OPTIONS = [
  { value: 'all', label: 'Any expense ratio' },
  { value: '0-0.5', label: 'Up to 0.5%' },
  { value: '0.5-1', label: '0.5% – 1%' },
  { value: '1-1.5', label: '1% – 1.5%' },
  { value: '1.5+', label: 'Above 1.5%' },
];

export const RATING_FILTER_OPTIONS = [
  { value: 'all', label: 'Any rating' },
  { value: '4+', label: '4★ and above' },
  { value: '4.5+', label: '4.5★ and above' },
  { value: '5', label: '5★ only' },
];

export const DEFAULT_MUTUAL_FUND_FILTERS = {
  search: '',
  category: 'all',
  riskLevel: 'all',
  returns: 'all',
  expenseRatio: 'all',
  rating: 'all',
  supportsSip: false,
  supportsLumpsum: false,
};

export const COMPARE_TABLE_ROWS = [
  { key: 'returns1y', label: '1Y Returns', type: 'percent' },
  { key: 'returns3y', label: '3Y Returns', type: 'percent' },
  { key: 'returns5y', label: '5Y Returns', type: 'percent' },
  { key: 'riskLevel', label: 'Risk', type: 'risk' },
  { key: 'expenseRatio', label: 'Expense Ratio', type: 'expense' },
  { key: 'fundManager', label: 'Fund Manager', type: 'text' },
  { key: 'aumCrores', label: 'AUM', type: 'aum' },
  { key: 'rating', label: 'Rating', type: 'rating' },
];

export function getCategoryLabel(slug) {
  return MUTUAL_FUND_CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}

export function getRiskLabel(slug) {
  return RISK_LEVELS.find((r) => r.slug === slug)?.label || slug;
}
