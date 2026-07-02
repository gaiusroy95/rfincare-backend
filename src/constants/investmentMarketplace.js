/** Investment marketplace taxonomy — mirrors backend/src/lib/investmentMarketplaceTaxonomy.js */

export const INVESTMENT_CATEGORIES = [
  { slug: 'sovereign_gold_bonds', label: 'Sovereign Gold Bonds', icon: 'Gem' },
  { slug: 'digital_gold', label: 'Digital Gold', icon: 'Coins' },
  { slug: 'gold_etf', label: 'Gold ETF', icon: 'BarChart3' },
  { slug: 'silver_etf', label: 'Silver ETF', icon: 'LineChart' },
  { slug: 'bonds', label: 'Bonds', icon: 'FileText' },
  { slug: 'rbi_floating_bonds', label: 'RBI Floating Bonds', icon: 'Landmark' },
  { slug: 'government_securities', label: 'Government Securities', icon: 'Building2' },
  { slug: 'treasury_bills', label: 'Treasury Bills', icon: 'Receipt' },
  { slug: 'corporate_bonds', label: 'Corporate Bonds', icon: 'Briefcase' },
  { slug: 'reit', label: 'REIT', icon: 'Home' },
  { slug: 'invit', label: 'InvIT', icon: 'Network' },
];

export const RISK_LEVELS = [
  { slug: 'low', label: 'Low' },
  { slug: 'low_to_moderate', label: 'Low to Moderate' },
  { slug: 'moderate', label: 'Moderate' },
  { slug: 'moderately_high', label: 'Moderately High' },
  { slug: 'high', label: 'High' },
];

export const DEFAULT_INVESTMENT_FILTERS = {
  search: '',
  category: 'all',
};

export const COMPARE_TABLE_ROWS = [
  { key: 'returns1y', label: '1Y Returns', type: 'percent' },
  { key: 'returns3y', label: '3Y Returns', type: 'percent' },
  { key: 'riskLevel', label: 'Risk', type: 'risk' },
  { key: 'minInvestmentAmount', label: 'Min Investment', type: 'currency' },
  { key: 'expenseRatio', label: 'Expense Ratio', type: 'expense' },
  { key: 'taxBenefitsText', label: 'Tax Benefits', type: 'text' },
];

export function getCategoryLabel(slug) {
  return INVESTMENT_CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}

export function getRiskLabel(slug) {
  return RISK_LEVELS.find((r) => r.slug === slug)?.label || slug;
}
