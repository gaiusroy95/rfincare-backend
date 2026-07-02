/** Government schemes marketplace taxonomy — mirrors backend/src/lib/governmentSchemeTaxonomy.js */

export const GOVERNMENT_SCHEME_CATEGORIES = [
  { slug: 'pm_mudra', label: 'PM Mudra', icon: 'Briefcase' },
  { slug: 'pmegp', label: 'PMEGP', icon: 'Factory' },
  { slug: 'stand_up_india', label: 'Stand-Up India', icon: 'Handshake' },
  { slug: 'startup_india', label: 'Startup India', icon: 'Rocket' },
  { slug: 'atal_pension_yojana', label: 'Atal Pension Yojana', icon: 'Heart' },
  { slug: 'nps', label: 'NPS', icon: 'Landmark' },
  { slug: 'pmjjby', label: 'PMJJBY', icon: 'Shield' },
  { slug: 'pmsby', label: 'PMSBY', icon: 'Umbrella' },
  { slug: 'ayushman_bharat', label: 'Ayushman Bharat', icon: 'Stethoscope' },
  { slug: 'solar_subsidy', label: 'Solar Subsidy', icon: 'Sun' },
  { slug: 'msme_subsidies', label: 'MSME Subsidies', icon: 'Building2' },
  { slug: 'agriculture_subsidies', label: 'Agriculture Subsidies', icon: 'Wheat' },
];

export const DEFAULT_GOVERNMENT_SCHEME_FILTERS = {
  search: '',
  category: 'all',
};

export const COMPARE_TABLE_ROWS = [
  { key: 'eligibilityText', label: 'Eligibility', type: 'text' },
  { key: 'benefitsText', label: 'Benefits', type: 'text' },
  { key: 'loanAmount', label: 'Loan / Subsidy', type: 'loanAmount' },
  { key: 'interestRate', label: 'Interest Rate', type: 'rate' },
  { key: 'subsidyPercent', label: 'Subsidy %', type: 'percent' },
];

export function getCategoryLabel(slug) {
  return GOVERNMENT_SCHEME_CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}
