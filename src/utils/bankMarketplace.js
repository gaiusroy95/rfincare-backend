import { getMarketplaceProductCategory } from '../constants/bankMarketplaceProductCategories';
import { getLoanProductBySlug } from '../constants/loanProducts';
import { pickProductForCategory } from './bankProductMatching';
import { getBankLogoAlt, getBankLogoUrl } from './bankBranding';

export function parseProductData(product) {
  if (!product) return {};
  let data = product.data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      data = {};
    }
  }
  return data && typeof data === 'object' ? data : {};
}

export function normalizeFeatures(features, fallback = []) {
  if (Array.isArray(features)) return features.filter(Boolean);
  if (typeof features === 'string') {
    const trimmed = features.trim();
    if (!trimmed) return fallback;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return trimmed.split('\n').map((s) => s.trim()).filter(Boolean);
    }
  }
  return fallback;
}

function formatProcessingFee(productData) {
  const pct =
    productData.processingFeePercentage ?? productData.processing_fee_percentage;
  const fixed = productData.processingFeeFixed ?? productData.processing_fee_fixed;
  if (pct != null && pct !== '') return `${pct}% + GST`;
  if (fixed != null && fixed !== '') return `₹${Number(fixed).toLocaleString('en-IN')} + GST`;
  return 'Contact bank';
}

function formatCurrency(amount) {
  if (amount == null || amount === '') return null;
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function formatTenure(years) {
  if (years == null || years === '') return null;
  return `${years} years`;
}

function readTextField(productData, ...keys) {
  for (const key of keys) {
    const value = productData[key];
    if (value != null && String(value).trim() !== '') return String(value).trim();
  }
  return '';
}

export function emptyProductForm(categorySlug = 'personal_loan') {
  const category = getMarketplaceProductCategory(categorySlug);
  const normalizedSlug = category?.slug || categorySlug;
  return {
    id: '',
    productName: '',
    loanType: category?.parentLoanType || 'personal_loan',
    productCategorySlug: normalizedSlug,
    catalogApiKey: category?.parentLoanType || '',
    interestRateMin: '',
    interestRateMax: '',
    processingFeePercentage: '',
    processingFeeFixed: '',
    otherCharges: '',
    maxLoanAmount: '',
    minLoanAmount: '',
    maxTenureYears: '',
    minTenureYears: '',
    featuresText: '',
    eligibilityCriteriaText: '',
    policiesText: '',
    documentationRequiredText: '',
    prepaymentCharges: '',
    foreclosureCharges: '',
    latePaymentCharges: '',
    documentationCharges: '',
    disbursalTimeline: '',
    collateralRequired: '',
  };
}

export function getMarketplaceCompareKey(bank) {
  if (bank?.compareKey) return String(bank.compareKey);
  if (bank?.productId) return String(bank.productId);
  return String(bank?.id ?? '');
}

/**
 * Map API bank + products into marketplace / comparison card shape.
 */
export function mapBankForMarketplace(bank, loanTypeSlug, probabilityMap = null) {
  const products = bank?.bankProducts || bank?.bank_products || [];
  const catalogProduct = getLoanProductBySlug(loanTypeSlug);
  const primaryProduct = pickProductForCategory(products, catalogProduct || loanTypeSlug);
  if (!primaryProduct) return null;

  const productData = parseProductData(primaryProduct);
  const activeProduct = catalogProduct;

  const interestMin = productData.interestRateMin ?? productData.interest_rate_min;
  const interestMax = productData.interestRateMax ?? productData.interest_rate_max;
  const interestRate =
    interestMin != null && interestMin !== ''
      ? Number(interestMin)
      : interestMax != null && interestMax !== ''
        ? Number(interestMax)
        : null;

  const maxLoan = productData.maxLoanAmount ?? productData.max_loan_amount ?? 2000000;
  const minLoan = productData.minLoanAmount ?? productData.min_loan_amount ?? null;
  const maxTenure = productData.maxTenureYears ?? productData.max_tenure_years ?? 20;
  const minTenure = productData.minTenureYears ?? productData.min_tenure_years ?? null;

  const otherCharges =
    productData.otherCharges ??
    productData.other_charges ??
    productData.otherFees ??
    productData.other_fees ??
    '';

  const features = normalizeFeatures(productData.features, []);
  const eligibilityCriteria = normalizeFeatures(
    productData.eligibility_criteria || productData.eligibilityCriteria,
    [],
  );
  const policies = normalizeFeatures(productData.policies, []);
  const documentationRequired = normalizeFeatures(
    productData.documentation_required || productData.documentationRequired,
    [],
  );

  const prepaymentCharges = readTextField(
    productData,
    'prepayment_charges',
    'prepaymentCharges',
  );
  const foreclosureCharges = readTextField(
    productData,
    'foreclosure_charges',
    'foreclosureCharges',
  );
  const latePaymentCharges = readTextField(
    productData,
    'late_payment_charges',
    'latePaymentCharges',
  );
  const documentationCharges = readTextField(
    productData,
    'documentation_charges',
    'documentationCharges',
  );
  const disbursalTimeline = readTextField(productData, 'disbursal_timeline', 'disbursalTimeline');
  const collateralRequired = readTextField(
    productData,
    'collateral_required',
    'collateralRequired',
  );

  const productId = primaryProduct?.id;
  const compareKey = productId ? String(productId) : String(bank?.id);

  return {
    id: bank?.id,
    productId,
    compareKey,
    productName: primaryProduct?.name,
    productCategorySlug:
      productData.product_category_slug ||
      productData.productCategorySlug ||
      activeProduct?.slug ||
      '',
    name: bank?.name,
    logo: getBankLogoUrl(bank),
    logoAlt: getBankLogoAlt(bank),
    rating: bank?.rating || 4.5,
    reviews: `${bank?.reviewsCount ?? bank?.reviews_count ?? 0} reviews`,
    probability:
      probabilityMap?.get?.(bank?.id) ??
      probabilityMap?.[bank?.id] ??
      75,
    probabilityReason:
      probabilityMap?.get?.(bank?.id) != null || probabilityMap?.[bank?.id] != null
        ? 'Based on your eligibility profile'
        : 'Complete eligibility check to see your personalized match',
    interestRate,
    interestRateMin: interestMin != null ? Number(interestMin) : interestRate,
    interestRateMax: interestMax != null ? Number(interestMax) : interestRate,
    processingFee: formatProcessingFee(productData),
    processingFeePercentage:
      productData.processingFeePercentage ?? productData.processing_fee_percentage ?? null,
    otherCharges: otherCharges || 'As per bank schedule',
    prepaymentCharges: prepaymentCharges || 'As per bank schedule',
    foreclosureCharges: foreclosureCharges || 'As per bank schedule',
    latePaymentCharges: latePaymentCharges || 'As per bank schedule',
    documentationCharges: documentationCharges || 'As per bank schedule',
    minAmount: formatCurrency(minLoan) || 'Contact bank',
    maxAmount: formatCurrency(maxLoan) || 'Contact bank',
    minTenure: formatTenure(minTenure) || '—',
    maxTenure: formatTenure(maxTenure) || '20 years',
    disbursalTimeline: disbursalTimeline || 'Contact bank',
    collateralRequired: collateralRequired || 'Contact bank',
    features,
    eligibilityCriteria,
    policies,
    documentationRequired,
    loanType:
      primaryProduct?.loanType ||
      productData.loan_type ||
      productData.loanType ||
      activeProduct?.apiKey,
    certifications: bank?.certifications || [],
    customersServed: bank?.customersServed || bank?.customers_served || '10,000+',
    partnershipDuration:
      bank?.partnershipDuration || bank?.partnership_duration || 'Partner since 2020',
    type: bank?.bankType || bank?.bank_type || 'private',
    description: `Trusted financial institution offering competitive loan products.`,
  };
}

export function applyComparisonOverrides(bank, overrides) {
  if (!overrides) return bank;
  const next = { ...bank, ...overrides };
  if (overrides.features) {
    next.features = normalizeFeatures(overrides.features, bank.features);
  }
  if (overrides.processingFee != null) {
    next.processingFee = overrides.processingFee;
  }
  if (overrides.otherCharges != null) {
    next.otherCharges = overrides.otherCharges;
  }
  return next;
}

export function productDataFromForm(form) {
  return {
    loan_type: form.loanType,
    product_category_slug: form.productCategorySlug || null,
    catalog_api_key: form.catalogApiKey || null,
    interest_rate_min: form.interestRateMin !== '' ? Number(form.interestRateMin) : null,
    interest_rate_max: form.interestRateMax !== '' ? Number(form.interestRateMax) : null,
    processing_fee_percentage:
      form.processingFeePercentage !== '' ? Number(form.processingFeePercentage) : null,
    processing_fee_fixed:
      form.processingFeeFixed !== '' ? Number(form.processingFeeFixed) : null,
    other_charges: form.otherCharges || '',
    max_loan_amount: form.maxLoanAmount !== '' ? Number(form.maxLoanAmount) : null,
    min_loan_amount: form.minLoanAmount !== '' ? Number(form.minLoanAmount) : null,
    max_tenure_years: form.maxTenureYears !== '' ? Number(form.maxTenureYears) : null,
    min_tenure_years: form.minTenureYears !== '' ? Number(form.minTenureYears) : null,
    prepayment_charges: form.prepaymentCharges || '',
    foreclosure_charges: form.foreclosureCharges || '',
    late_payment_charges: form.latePaymentCharges || '',
    documentation_charges: form.documentationCharges || '',
    disbursal_timeline: form.disbursalTimeline || '',
    collateral_required: form.collateralRequired || '',
    features: (form.featuresText || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    eligibility_criteria: (form.eligibilityCriteriaText || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    policies: (form.policiesText || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    documentation_required: (form.documentationRequiredText || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export function formFromProduct(product, loanTypeDefault = 'personal_loan') {
  const data = parseProductData(product);
  const features = normalizeFeatures(data.features, []);
  const eligibility = normalizeFeatures(
    data.eligibility_criteria || data.eligibilityCriteria,
    [],
  );
  const policies = normalizeFeatures(data.policies, []);
  const documentationRequired = normalizeFeatures(
    data.documentation_required || data.documentationRequired,
    [],
  );
  return {
    id: product?.id || '',
    productName: product?.name || '',
    loanType: data.loan_type || data.loanType || loanTypeDefault,
    productCategorySlug:
      data.product_category_slug ||
      data.productCategorySlug ||
      data.catalog_slug ||
      data.catalogSlug ||
      '',
    catalogApiKey: data.catalog_api_key || data.catalogApiKey || '',
    interestRateMin: data.interest_rate_min ?? data.interestRateMin ?? '',
    interestRateMax: data.interest_rate_max ?? data.interestRateMax ?? '',
    processingFeePercentage:
      data.processing_fee_percentage ?? data.processingFeePercentage ?? '',
    processingFeeFixed: data.processing_fee_fixed ?? data.processingFeeFixed ?? '',
    otherCharges: data.other_charges ?? data.otherCharges ?? '',
    maxLoanAmount: data.max_loan_amount ?? data.maxLoanAmount ?? '',
    minLoanAmount: data.min_loan_amount ?? data.minLoanAmount ?? '',
    maxTenureYears: data.max_tenure_years ?? data.maxTenureYears ?? '',
    minTenureYears: data.min_tenure_years ?? data.minTenureYears ?? '',
    prepaymentCharges: data.prepayment_charges ?? data.prepaymentCharges ?? '',
    foreclosureCharges: data.foreclosure_charges ?? data.foreclosureCharges ?? '',
    latePaymentCharges: data.late_payment_charges ?? data.latePaymentCharges ?? '',
    documentationCharges: data.documentation_charges ?? data.documentationCharges ?? '',
    disbursalTimeline: data.disbursal_timeline ?? data.disbursalTimeline ?? '',
    collateralRequired: data.collateral_required ?? data.collateralRequired ?? '',
    featuresText: features.join('\n'),
    eligibilityCriteriaText: eligibility.join('\n'),
    policiesText: policies.join('\n'),
    documentationRequiredText: documentationRequired.join('\n'),
  };
}

export function getProductCategoryLabel(product, catalogProducts = [], productCategories = []) {
  const form = formFromProduct(product);
  const fromTaxonomy =
    productCategories.find((p) => p.slug === form.productCategorySlug)
    || getMarketplaceProductCategory(form.productCategorySlug);
  if (fromTaxonomy?.label) return fromTaxonomy.label;
  const catalog = catalogProducts.find((p) => p.slug === form.productCategorySlug);
  return catalog?.label || form.productCategorySlug || 'Loan product';
}
