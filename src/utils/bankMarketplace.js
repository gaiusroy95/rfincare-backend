import { getLoanProductBySlug } from '../constants/loanProducts';
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

function normalizeLoanType(value) {
  if (!value) return '';
  return String(value).toLowerCase().replace(/-/g, '_');
}

function pickProductForLoanType(products, loanTypeSlug) {
  if (!products?.length) return null;
  const target = normalizeLoanType(
    getLoanProductBySlug(loanTypeSlug)?.apiKey || loanTypeSlug,
  );
  if (!target) return products[0];

  const match = products.find((product) => {
    const data = parseProductData(product);
    const lt = normalizeLoanType(
      product.loanType || product.loan_type || data.loan_type || data.loanType,
    );
    if (!lt) return false;
    return lt === target || lt.includes(target.replace('_loan', ''));
  });
  return match || products[0];
}

function formatProcessingFee(productData) {
  const pct =
    productData.processingFeePercentage ?? productData.processing_fee_percentage;
  const fixed = productData.processingFeeFixed ?? productData.processing_fee_fixed;
  if (pct != null && pct !== '') return `${pct}% + GST`;
  if (fixed != null && fixed !== '') return `₹${Number(fixed).toLocaleString('en-IN')} + GST`;
  return 'Contact bank';
}

/**
 * Map API bank + products into marketplace / comparison card shape.
 */
export function mapBankForMarketplace(bank, loanTypeSlug, probabilityMap = null) {
  const products = bank?.bankProducts || bank?.bank_products || [];
  const primaryProduct = pickProductForLoanType(products, loanTypeSlug) || {};
  const productData = parseProductData(primaryProduct);
  const activeProduct = getLoanProductBySlug(loanTypeSlug);
  const fallbackFeatures = activeProduct?.features || [
    'Flexible repayment options',
    'Digital application process',
    'Transparent pricing',
  ];

  const interestMin = productData.interestRateMin ?? productData.interest_rate_min;
  const interestMax = productData.interestRateMax ?? productData.interest_rate_max;
  const interestRate =
    interestMin != null && interestMin !== ''
      ? Number(interestMin)
      : interestMax != null && interestMax !== ''
        ? Number(interestMax)
        : 8.0;

  const maxLoan = productData.maxLoanAmount ?? productData.max_loan_amount ?? 2000000;
  const maxTenure = productData.maxTenureYears ?? productData.max_tenure_years ?? 20;
  const otherCharges =
    productData.otherCharges ??
    productData.other_charges ??
    productData.otherFees ??
    productData.other_fees ??
    '';

  const features = normalizeFeatures(productData.features, fallbackFeatures);

  return {
    id: bank?.id,
    productId: primaryProduct?.id,
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
    maxAmount: `₹${Number(maxLoan).toLocaleString('en-IN')}`,
    maxTenure: `${maxTenure} years`,
    features,
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
    interest_rate_min: form.interestRateMin !== '' ? Number(form.interestRateMin) : null,
    interest_rate_max: form.interestRateMax !== '' ? Number(form.interestRateMax) : null,
    processing_fee_percentage:
      form.processingFeePercentage !== '' ? Number(form.processingFeePercentage) : null,
    other_charges: form.otherCharges || '',
    max_loan_amount: form.maxLoanAmount !== '' ? Number(form.maxLoanAmount) : null,
    max_tenure_years: form.maxTenureYears !== '' ? Number(form.maxTenureYears) : null,
    features: (form.featuresText || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export function formFromProduct(product, loanTypeDefault = 'personal_loan') {
  const data = parseProductData(product);
  const features = normalizeFeatures(data.features, []);
  return {
    id: product?.id || '',
    loanType: data.loan_type || data.loanType || loanTypeDefault,
    interestRateMin: data.interest_rate_min ?? data.interestRateMin ?? '',
    interestRateMax: data.interest_rate_max ?? data.interestRateMax ?? '',
    processingFeePercentage:
      data.processing_fee_percentage ?? data.processingFeePercentage ?? '',
    otherCharges: data.other_charges ?? data.otherCharges ?? '',
    maxLoanAmount: data.max_loan_amount ?? data.maxLoanAmount ?? '',
    maxTenureYears: data.max_tenure_years ?? data.maxTenureYears ?? '',
    featuresText: features.join('\n'),
  };
}
