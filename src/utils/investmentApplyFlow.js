import { leadService } from '../services/leadService';

export function buildInvestmentEligibilityData(product, profile = {}, calculatorContext = {}) {
  return {
    marketplaceType: 'investment',
    productId: product?.id,
    productName: product?.name,
    providerName: product?.providerName,
    applyUrl: product?.applyUrl,
    categories: product?.categories,
    expectedReturn: product?.expectedReturn,
    calculatorContext,
    ...profile,
  };
}

export async function recordInvestmentApplicationLead(product, profile, calculatorContext = {}) {
  if (!product?.id) return null;

  const eligibilityData = buildInvestmentEligibilityData(product, profile, calculatorContext);

  if (profile?.leadId) {
    await leadService.updateLead(profile.leadId, {
      loanType: 'investment',
      eligibilityData,
      status: 'application_started',
    });
    return profile.leadId;
  }

  const res = await leadService.createLead({
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    loanType: 'investment',
    source: 'investment_marketplace',
    consentAccepted: true,
    eligibilityData,
    status: 'application_started',
  });
  return res?.id || res?.lead?.id || null;
}

export function redirectToInvestmentApplication(applyUrl) {
  if (!applyUrl) return false;
  window.open(applyUrl, '_blank', 'noopener,noreferrer');
  return true;
}

export async function completeInvestmentApply(product, profile, calculatorContext = {}) {
  try {
    await recordInvestmentApplicationLead(product, profile, calculatorContext);
  } catch {
    /* best-effort */
  }

  if (product?.applyUrl) {
    return redirectToInvestmentApplication(product.applyUrl);
  }
  return true;
}
