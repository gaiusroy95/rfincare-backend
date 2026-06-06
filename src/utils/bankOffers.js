import { filterProductsForCategory } from './bankProductMatching';
import { getBankLogoAlt, getBankLogoUrl } from './bankBranding';

export function parseProductData(product) {
  if (!product?.data) return {};
  if (typeof product.data === 'object') return product.data;
  try {
    return JSON.parse(product.data);
  } catch {
    return {};
  }
}

export function buildBankOffers(banks, loanProduct) {
  if (!Array.isArray(banks) || !loanProduct) return [];

  const offers = [];

  for (const bank of banks) {
    const products = filterProductsForCategory(
      bank.bankProducts || bank.bank_products || [],
      loanProduct,
    );

    if (products.length === 0) {
      continue;
    }

    products.forEach((product, index) => {
      const data = parseProductData(product);
      const min = data.interestRateMin ?? data.interest_rate_min;
      const max = data.interestRateMax ?? data.interest_rate_max;
      offers.push({
        bankId: bank.id,
        bankName: bank.name,
        logoUrl: getBankLogoUrl(bank),
        logoAlt: getBankLogoAlt(bank),
        rating: bank.rating,
        reviewsCount: bank.reviewsCount,
        productId: product.id,
        productName: product.name,
        interestMin: min,
        interestMax: max,
        interestLabel:
          min != null && max != null ? `${min}% – ${max}% p.a.` : 'On request',
        maxAmount: data.maxLoanAmount ?? data.max_loan_amount,
        maxTenure: data.maxTenureYears ?? data.max_tenure_years,
        processingFee:
          data.processingFeePercentage ?? data.processing_fee_percentage,
        eligibilityCriteria: Array.isArray(data.eligibility_criteria || data.eligibilityCriteria)
          ? (data.eligibility_criteria || data.eligibilityCriteria).slice(0, 4)
          : [],
        features: Array.isArray(data.features) ? data.features.slice(0, 4) : [],
        isFeatured: index === 0,
      });
    });
  }

  return offers.sort((a, b) => {
    if (a.interestMin != null && b.interestMin != null) {
      return a.interestMin - b.interestMin;
    }
    return a.bankName.localeCompare(b.bankName);
  });
}

export { formatLoanAmount } from './currency.js';
