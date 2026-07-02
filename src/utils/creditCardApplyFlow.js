import { leadService } from '../services/leadService';

export function normalizeCreditCardForApply(card) {
  if (!card) return null;
  if (card.rawCard) return card.rawCard;
  if (card.creditCardId) {
    return {
      id: card.creditCardId,
      name: card.productName || card.name,
      bankName: card.bankName || card.name,
      applyUrl: card.applyUrl,
      categories: card.categories,
      annualFee: card.annualFee,
      joiningFee: card.joiningFee,
      cardNetwork: card.cardNetwork,
    };
  }
  return card;
}

export function buildCreditCardEligibilityData(card, profile = {}) {
  const normalized = normalizeCreditCardForApply(card);
  return {
    marketplaceType: 'credit_card',
    productId: normalized?.id,
    productName: normalized?.name,
    bankName: normalized?.bankName,
    applyUrl: normalized?.applyUrl,
    categories: normalized?.categories,
    annualFee: normalized?.annualFee,
    joiningFee: normalized?.joiningFee,
    cardNetwork: normalized?.cardNetwork,
    ...profile,
  };
}

export async function recordCreditCardApplicationLead(card, profile) {
  const normalized = normalizeCreditCardForApply(card);
  if (!normalized?.id) return null;

  const eligibilityData = buildCreditCardEligibilityData(normalized, profile);

  if (profile?.leadId) {
    await leadService.updateLead(profile.leadId, {
      loanType: 'credit_card',
      eligibilityData,
      status: 'application_started',
    });
    return profile.leadId;
  }

  const res = await leadService.createLead({
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    loanType: 'credit_card',
    source: 'credit_card_marketplace',
    consentAccepted: true,
    eligibilityData,
    status: 'application_started',
  });
  return res?.id || res?.lead?.id || null;
}

export function redirectToCreditCardApplication(applyUrl) {
  if (!applyUrl) return false;
  window.open(applyUrl, '_blank', 'noopener,noreferrer');
  return true;
}

export async function completeCreditCardApply(card, profile) {
  const normalized = normalizeCreditCardForApply(card);
  if (!normalized?.applyUrl) return false;

  try {
    await recordCreditCardApplicationLead(normalized, profile);
  } catch {
    // Continue to bank even if lead recording fails.
  }

  return redirectToCreditCardApplication(normalized.applyUrl);
}
