/**
 * Loan product types a bank can offer in marketplace comparison (admin configuration).
 * Matches the standard product taxonomy used across Rfincare.
 */
export const BANK_MARKETPLACE_PRODUCT_CATEGORIES = [
  { slug: 'personal_loan', label: 'Personal Loan', parentLoanType: 'personal_loan', sortOrder: 1 },
  { slug: 'home_loan', label: 'Home Loan', parentLoanType: 'home_loan', sortOrder: 2 },
  {
    slug: 'loan_against_property',
    label: 'Loan Against Property',
    parentLoanType: 'home_loan',
    sortOrder: 3,
  },
  { slug: 'mortgage_loan', label: 'Mortgage Loan', parentLoanType: 'home_loan', sortOrder: 4 },
  { slug: 'business_loan', label: 'Business Loan', parentLoanType: 'business_loan', sortOrder: 5 },
  { slug: 'car_loan', label: 'Car Loan', parentLoanType: 'auto_loan', sortOrder: 6 },
  {
    slug: 'two_wheeler_loan',
    label: 'Two Wheeler Loan',
    parentLoanType: 'auto_loan',
    sortOrder: 7,
  },
  { slug: 'consumer_loan', label: 'Consumer Loan', parentLoanType: 'personal_loan', sortOrder: 8 },
  { slug: 'overdraft', label: 'Overdraft', parentLoanType: 'business_loan', sortOrder: 9 },
  { slug: 'cc_limit', label: 'CC Limit', parentLoanType: 'business_loan', sortOrder: 10 },
  {
    slug: 'kisan_credit_card',
    label: 'Kisan Credit Card',
    parentLoanType: 'business_loan',
    sortOrder: 11,
  },
  { slug: 'credit_card', label: 'Credit Card', parentLoanType: 'personal_loan', sortOrder: 12 },
  {
    slug: 'unsecured_cc_limit',
    label: 'Unsecured CC Limit',
    parentLoanType: 'business_loan',
    sortOrder: 13,
  },
  {
    slug: 'unsecured_overdraft_limit',
    label: 'Unsecured Overdraft Limit',
    parentLoanType: 'business_loan',
    sortOrder: 14,
  },
  /** Legacy / optional — kept for banks already configured before taxonomy expansion */
  {
    slug: 'education_loan',
    label: 'Education Loan',
    parentLoanType: 'education_loan',
    sortOrder: 15,
  },
];

/** Short catalog slugs stored on older bank product rows */
const LEGACY_CATALOG_SLUG_ALIASES = {
  personal: 'personal_loan',
  home: 'home_loan',
  business: 'business_loan',
  auto: 'car_loan',
  car: 'car_loan',
  education: 'education_loan',
};

export const MARKETPLACE_BASE_CATEGORY_SLUGS = new Set([
  'personal_loan',
  'home_loan',
  'business_loan',
  'auto_loan',
  'education_loan',
]);

const BY_SLUG = new Map(
  BANK_MARKETPLACE_PRODUCT_CATEGORIES.map((c) => [c.slug, c]),
);

export function normalizeMarketplaceCategorySlug(input) {
  const key = String(input || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
  if (!key) return '';
  return LEGACY_CATALOG_SLUG_ALIASES[key] || key;
}

export function getMarketplaceProductCategory(slug) {
  const normalized = normalizeMarketplaceCategorySlug(slug);
  return BY_SLUG.get(normalized) || null;
}

export function mergeMarketplaceProductCategories(apiCategories = []) {
  const merged = new Map();
  for (const cat of BANK_MARKETPLACE_PRODUCT_CATEGORIES) {
    merged.set(cat.slug, { ...cat });
  }
  for (const row of apiCategories) {
    const slug = normalizeMarketplaceCategorySlug(row.slug);
    if (!slug) continue;
    merged.set(slug, {
      id: row.id,
      slug,
      label: row.label || merged.get(slug)?.label || slug,
      parentLoanType:
        row.parentLoanType || row.parent_loan_type || merged.get(slug)?.parentLoanType || slug,
      sortOrder: row.sortOrder ?? row.sort_order ?? merged.get(slug)?.sortOrder ?? 99,
    });
  }
  return [...merged.values()].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99) || a.label.localeCompare(b.label),
  );
}

export function marketplaceCategorySelectOptions(categories = BANK_MARKETPLACE_PRODUCT_CATEGORIES) {
  return categories.map((cat) => ({
    value: cat.slug,
    label: cat.label,
  }));
}
