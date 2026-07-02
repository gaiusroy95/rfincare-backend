/** Shared demographic capture options for insurance & mutual fund marketplaces */

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const OCCUPATION_OPTIONS = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'student', label: 'Student' },
];

export const INCOME_RANGE_OPTIONS = [
  { value: '25_lac_plus', label: '25 Lac +' },
  { value: '15_to_24_9_lac', label: '15 Lac to 24.9 Lac' },
  { value: '10_to_14_9_lac', label: '10 Lac to 14.9 Lac' },
  { value: '8_to_9_9_lac', label: '8 Lac to 9.9 Lac' },
  { value: '5_to_7_9_lac', label: '5 Lac to 7.9 Lac' },
  { value: '3_to_4_9_lac', label: '3 Lac to 4.9 Lac' },
  { value: '2_to_2_9_lac', label: '2 Lac to 2.9 Lac' },
  { value: 'below_2_lac', label: 'Less than 2 Lac' },
];

export const EDUCATION_OPTIONS = [
  { value: 'post_graduation', label: 'Post Graduation' },
  { value: 'graduation', label: 'Graduation' },
  { value: '12th', label: '12th' },
  { value: '10th_and_below', label: '10th and Below' },
];

export const HABIT_FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'occasionally', label: 'Occasionally' },
];

export const YES_NO_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
];

export const MARKETPLACE_WIZARD_STEPS = [
  { key: 'contact', label: 'Contact details' },
  { key: 'occupation', label: 'Occupation' },
  { key: 'income', label: 'Annual income' },
  { key: 'education', label: 'Education' },
  { key: 'habits', label: 'Health habits' },
];

export const INSURANCE_PRODUCT_GRID = [
  { slug: 'term_insurance', label: 'Term Life Insurance', icon: 'Shield', badge: 'Upto 15% Discount', segment: 'life' },
  { slug: 'individual', label: 'Health Insurance', icon: 'Heart', badge: 'Lowest Price Guarantee', segment: 'health' },
  { slug: 'ulip', label: 'Investment Plans', icon: 'TrendingUp', badge: 'In-Built Life Cover', segment: 'life' },
  { slug: 'car_insurance', label: 'Car Insurance', icon: 'Car', badge: 'Lowest Price Guarantee', segment: 'motor' },
  { slug: 'bike_insurance', label: '2 Wheeler Insurance', icon: 'Bike', badge: 'Upto 85% Discount', segment: 'motor' },
  { slug: 'family_floater', label: 'Family Health Insurance', icon: 'Users', badge: 'Upto 25% Discount', segment: 'health' },
  { slug: 'personal_accident', label: 'Travel Insurance', icon: 'Plane', badge: null, segment: 'health' },
  { slug: 'term_insurance', label: 'Term Insurance (Women)', icon: 'User', badge: 'Upto 20% Cheaper', segment: 'life', genderHint: 'female' },
  { slug: 'endowment', label: 'Term Plans with Return of Premium', icon: 'IndianRupee', badge: null, segment: 'life' },
  { slug: 'guaranteed_income_plans', label: 'Guaranteed Return Plans', icon: 'BadgeIndianRupee', badge: 'Upto 7.4% Returns', segment: 'life' },
  { slug: 'child_plans', label: 'Child Savings Plans', icon: 'Baby', badge: 'Premium Waiver', badgeTone: 'warning', segment: 'life' },
  { slug: 'retirement_plans', label: 'Retirement Plans', icon: 'Sunset', badge: null, segment: 'life' },
  { slug: 'family_floater', label: 'Employee Group Health Insurance', icon: 'Users', badge: 'Upto 65% Discount', segment: 'health', groupPlan: true },
  { slug: 'individual', label: 'Home Insurance', icon: 'Home', badge: 'Upto 25% Discount', segment: 'health' },
];

export const MUTUAL_FUND_PRODUCT_GRID = [
  { slug: 'sip', label: 'SIP Plans', icon: 'CalendarClock', badge: 'Start from ₹500/mo' },
  { slug: 'elss', label: 'ELSS Tax Saver', icon: 'Receipt', badge: 'Upto ₹1.5L deduction' },
  { slug: 'large_cap', label: 'Large Cap Funds', icon: 'Building2', badge: 'Stable growth' },
  { slug: 'mid_cap', label: 'Mid Cap Funds', icon: 'TrendingUp', badge: 'High growth potential' },
  { slug: 'small_cap', label: 'Small Cap Funds', icon: 'Rocket', badge: 'Aggressive returns' },
  { slug: 'flexi_cap', label: 'Flexi Cap Funds', icon: 'Shuffle', badge: 'Flexible allocation' },
  { slug: 'debt_funds', label: 'Debt Funds', icon: 'Landmark', badge: 'Low risk' },
  { slug: 'liquid_funds', label: 'Liquid Funds', icon: 'Droplets', badge: 'Instant liquidity' },
  { slug: 'hybrid_funds', label: 'Hybrid Funds', icon: 'Blend', badge: 'Balanced portfolio' },
  { slug: 'index_funds', label: 'Index Funds', icon: 'BarChart3', badge: 'Low expense ratio' },
  { slug: 'etf', label: 'ETF', icon: 'LineChart', badge: 'Exchange traded' },
  { slug: 'international_funds', label: 'International Funds', icon: 'Globe', badge: 'Global exposure' },
  { slug: 'lumpsum', label: 'Lumpsum Investment', icon: 'IndianRupee', badge: 'One-time invest' },
  { slug: 'sip', label: 'Goal Based SIP', icon: 'Target', badge: 'Plan your goals' },
];
