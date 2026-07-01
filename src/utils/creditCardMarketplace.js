import { getBankLogoUrl, resolveBankLogoUrl } from './bankBranding';

function formatCardFee(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return 'Free';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function resolveCardLogo(card, bank) {
  return resolveBankLogoUrl(card?.logoUrl) || getBankLogoUrl(bank) || null;
}

/**
 * Map admin-managed credit card row into marketplace / dashboard offer shape.
 */
export function mapCreditCardForMarketplace(card, banksById = {}) {
  if (!card?.id) return null;

  const bank = card.bankId ? banksById[card.bankId] : null;
  const logo = resolveCardLogo(card, bank);
  const features = Array.isArray(card.features) && card.features.length
    ? card.features
    : (Array.isArray(card.benefits) ? card.benefits.slice(0, 4) : []);

  return {
    id: card.bankId || card.id,
    productId: card.id,
    compareKey: `cc-${card.id}`,
    productName: card.name,
    productCategorySlug: 'credit_card',
    productCategoryLabel: 'Credit Card',
    name: card.bankName,
    logo,
    logoAlt: card.name ? `${card.name} logo` : 'Credit card logo',
    isCreditCard: true,
    creditCardId: card.id,
    rating: bank?.rating ?? 4.5,
    reviews: bank?.reviewsCount != null ? `${bank.reviewsCount} reviews` : 'Partner offer',
    reviewsCount: bank?.reviewsCount ?? 0,
    probability: 75,
    probabilityReason: 'Apply directly on the bank website',
    interestRate: card.interestRate != null ? Number(card.interestRate) : null,
    interestRateLabel: card.interestRate != null ? String(card.interestRate) : 'On request',
    interestRateMin: card.interestRate != null ? Number(card.interestRate) : null,
    interestRateMax: card.interestRate != null ? Number(card.interestRate) : null,
    processingFee: `Joining: ${formatCardFee(card.joiningFee)}`,
    otherCharges: card.otherCharges || card.latePaymentFee || 'As per bank schedule',
    annualFeeLabel: formatCardFee(card.annualFee),
    latePaymentFee: card.latePaymentFee || null,
    cardNetwork: card.cardNetwork || '—',
    categories: card.categories || [],
    rewardPoints: card.rewardPoints || null,
    hasRewardPoints: Boolean(card.hasRewardPoints || card.rewardPoints),
    loungeAccess: Boolean(card.loungeAccess),
    loungeAccessDetails: card.loungeAccessDetails || null,
    fuelSurchargeWaiver: Boolean(card.fuelSurchargeWaiver),
    movieBenefits: Boolean(card.movieBenefits),
    movieBenefitsDetails: card.movieBenefitsDetails || null,
    diningBenefits: Boolean(card.diningBenefits),
    diningBenefitsDetails: card.diningBenefitsDetails || null,
    insuranceCover: Boolean(card.insuranceCover),
    insuranceCoverDetails: card.insuranceCoverDetails || null,
    forexCharges: card.forexCharges || null,
    emiConversion: Boolean(card.emiConversion),
    emiConversionDetails: card.emiConversionDetails || null,
    maxAmount: `Annual: ${formatCardFee(card.annualFee)}`,
    maxTenure: card.cardNetwork || '—',
    features,
    advantages: card.advantages || [],
    benefits: card.benefits || [],
    loanType: 'credit_card',
    certifications: bank?.certifications || [],
    customersServed: bank?.customersServed || bank?.customers_served || '10,000+',
    partnershipDuration: bank?.partnershipDuration || bank?.partnership_duration || 'Partner offer',
    displayPriority: card.displayPriority ?? 0,
    type: bank?.bankType || bank?.bank_type || 'private',
    applyUrl: card.applyUrl || null,
    description: card.description || '',
    rawCard: card,
  };
}

export function listCreditCardMarketplaceOffers(cards, banks = []) {
  const banksById = {};
  for (const bank of banks || []) {
    if (bank?.id) banksById[bank.id] = bank;
  }

  return (cards || [])
    .map((card) => mapCreditCardForMarketplace(card, banksById))
    .filter(Boolean)
    .sort((a, b) => {
      const priorityDiff = (b.displayPriority ?? 0) - (a.displayPriority ?? 0);
      if (priorityDiff !== 0) return priorityDiff;
      return String(a.productName || '').localeCompare(String(b.productName || ''));
    });
}

export function resolveCreditCardLogo(card, banksById = {}) {
  const bank = card?.bankId ? banksById[card.bankId] : null;
  return resolveCardLogo(card, bank);
}

export { formatCardFee };
