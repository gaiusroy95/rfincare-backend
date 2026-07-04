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
  categoryGroup: 'all',
  riskLevel: 'all',
  returns: 'all',
  minInvestment: 'all',
  expenseRatio: 'all',
  rating: 'all',
  supportsSip: false,
  supportsLumpsum: false,
};

/** Sidebar filter groups — map to backend category slugs */
export const FILTER_FUND_CATEGORIES = [
  { id: 'all', label: 'All Categories', slugs: [] },
  { id: 'equity', label: 'Equity Funds', slugs: ['large_cap', 'mid_cap', 'small_cap', 'flexi_cap'] },
  { id: 'debt', label: 'Debt Funds', slugs: ['debt_funds', 'liquid_funds'] },
  { id: 'hybrid', label: 'Hybrid Funds', slugs: ['hybrid_funds'] },
  { id: 'index', label: 'Index Funds', slugs: ['index_funds', 'etf'] },
  { id: 'elss', label: 'ELSS Funds', slugs: ['elss'] },
  { id: 'solution', label: 'Solution Oriented Funds', slugs: ['international_funds'] },
];

export const MIN_INVESTMENT_OPTIONS = [
  { value: 'all', label: 'Any' },
  { value: '500', label: 'Up to ₹500' },
  { value: '1000', label: 'Up to ₹1,000' },
  { value: '5000', label: 'Up to ₹5,000' },
];

export const MF_SORT_OPTIONS = [
  { value: 'returns3y-desc', label: '3Y Returns (High to Low)' },
  { value: 'returns3y-asc', label: '3Y Returns (Low to High)' },
  { value: 'expense-asc', label: 'Expense Ratio (Low to High)' },
  { value: 'expense-desc', label: 'Expense Ratio (High to Low)' },
  { value: 'rating-desc', label: 'Rating (High to Low)' },
  { value: 'name-asc', label: 'Name (A to Z)' },
];

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
  return MUTUAL_FUND_CATEGORIES.find((c) => c.slug === slug)?.label || slug?.replace(/_/g, ' ') || 'Fund';
}

export function getFundCategoryDisplay(fund) {
  const cats = fund?.categories || [];
  if (!cats.length) return 'Mutual Fund';
  const primary = cats[0];
  const label = getCategoryLabel(primary);
  if (['large_cap', 'mid_cap', 'small_cap', 'flexi_cap'].includes(primary)) {
    return `Equity - ${label.replace(' Cap', ' Cap')}`;
  }
  return label;
}

export function getRiskLabel(slug) {
  return RISK_LEVELS.find((r) => r.slug === slug)?.label || slug;
}
