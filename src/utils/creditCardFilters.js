import { DEFAULT_CREDIT_CARD_FILTERS } from '../constants/creditCardMarketplace';

export function formatCardFee(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return 'Free';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function formatBenefitValue(card, key, detailsKey) {
  if (!card?.[key]) return '—';
  const details = detailsKey ? card[detailsKey] : null;
  return details ? `Yes — ${details}` : 'Yes';
}

export function formatCompareCell(card, row) {
  if (!card) return '—';
  switch (row.type) {
    case 'fee':
      return formatCardFee(card[row.key]);
    case 'percent':
      return card[row.key] != null ? `${card[row.key]}%` : '—';
    case 'boolean':
      return card[row.key] ? 'Yes' : '—';
    case 'benefit':
      return formatBenefitValue(card, row.key, row.detailsKey);
    case 'text':
    default:
      return card[row.key] || '—';
  }
}

export function buildCreditCardQueryParams(filters = {}) {
  const params = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  if (filters.annualFee && filters.annualFee !== 'all') params.annualFee = filters.annualFee;
  if (filters.joiningFee && filters.joiningFee !== 'all') params.joiningFee = filters.joiningFee;
  if (filters.forexCharges && filters.forexCharges !== 'all') params.forexCharges = filters.forexCharges;

  const boolKeys = [
    'rewardPoints',
    'loungeAccess',
    'fuelSurchargeWaiver',
    'movieBenefits',
    'diningBenefits',
    'insuranceCover',
    'emiConversion',
  ];
  for (const key of boolKeys) {
    if (filters[key]) params[key] = 'true';
  }
  return params;
}

export function countActiveFilters(filters = {}) {
  let count = 0;
  if (filters.search?.trim()) count += 1;
  if (filters.category && filters.category !== 'all') count += 1;
  if (filters.annualFee && filters.annualFee !== 'all') count += 1;
  if (filters.joiningFee && filters.joiningFee !== 'all') count += 1;
  if (filters.forexCharges && filters.forexCharges !== 'all') count += 1;
  const boolKeys = [
    'rewardPoints',
    'loungeAccess',
    'fuelSurchargeWaiver',
    'movieBenefits',
    'diningBenefits',
    'insuranceCover',
    'emiConversion',
  ];
  for (const key of boolKeys) {
    if (filters[key]) count += 1;
  }
  return count;
}

export function resetCreditCardFilters() {
  return { ...DEFAULT_CREDIT_CARD_FILTERS };
}

/** Client-side filter for marketplace offers mapped via creditCardMarketplace.js */
export function filterCreditCardOffer(offer, filters = {}) {
  const card = offer?.rawCard || offer;
  if (!card) return false;

  if (filters.search?.trim()) {
    const q = filters.search.toLowerCase();
    const hay = `${card.name || ''} ${card.bankName || ''} ${card.description || ''}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }

  if (filters.category && filters.category !== 'all') {
    const cats = Array.isArray(card.categories) ? card.categories : [];
    if (!cats.includes(filters.category)) return false;
  }

  if (filters.annualFee && filters.annualFee !== 'all') {
    const fee = Number(card.annualFee);
    if (filters.annualFee === 'free' && fee !== 0) return false;
    if (filters.annualFee === '0-500' && (fee < 0 || fee > 500)) return false;
    if (filters.annualFee === '500-2500' && (fee < 500 || fee > 2500)) return false;
    if (filters.annualFee === '2500+' && fee < 2500) return false;
  }

  if (filters.joiningFee && filters.joiningFee !== 'all') {
    const fee = Number(card.joiningFee);
    if (filters.joiningFee === 'free' && fee !== 0) return false;
    if (filters.joiningFee === '0-500' && (fee < 0 || fee > 500)) return false;
    if (filters.joiningFee === '500+' && fee < 500) return false;
  }

  if (filters.rewardPoints && !card.hasRewardPoints && !card.rewardPoints) return false;
  if (filters.loungeAccess && !card.loungeAccess) return false;
  if (filters.fuelSurchargeWaiver && !card.fuelSurchargeWaiver) return false;
  if (filters.movieBenefits && !card.movieBenefits) return false;
  if (filters.diningBenefits && !card.diningBenefits) return false;
  if (filters.insuranceCover && !card.insuranceCover) return false;
  if (filters.emiConversion && !card.emiConversion) return false;

  if (filters.forexCharges && filters.forexCharges !== 'all') {
    const fx = String(card.forexCharges || '').toLowerCase();
    if (filters.forexCharges === 'zero') {
      if (!fx.includes('zero') && !fx.includes('nil') && !fx.includes('0') && !fx.includes('no markup')) {
        return false;
      }
    } else {
      const match = fx.match(/^[\d.]+/);
      const pct = match ? Number(match[0]) : NaN;
      if (filters.forexCharges === 'under_2' && !(Number.isFinite(pct) && pct < 2)) return false;
      if (filters.forexCharges === 'under_3' && !(Number.isFinite(pct) && pct < 3)) return false;
    }
  }

  return true;
}
