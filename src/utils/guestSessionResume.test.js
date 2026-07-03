import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveCompareBasket,
  loadCompareBasket,
  marketplaceResumePath,
  listMarketplaceResumeSessions,
  clearGuestSession,
} from './guestSessionResume';

describe('guestSessionResume', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('resolves marketplace resume paths', () => {
    expect(marketplaceResumePath('insurance')).toBe('/insurance-marketplace');
    expect(marketplaceResumePath('post_office')).toBe('/post-office-marketplace');
  });

  it('saves and loads compare basket', () => {
    saveCompareBasket('insurance', {
      selectedIds: ['a', 'b'],
      productLabels: ['Plan A', 'Plan B'],
    });
    const saved = loadCompareBasket('insurance');
    expect(saved.selectedIds).toEqual(['a', 'b']);
    expect(saved.productLabels).toEqual(['Plan A', 'Plan B']);
  });

  it('lists marketplace-specific resume sessions', () => {
    saveCompareBasket('mutual_funds', { selectedIds: ['f1'], productLabels: ['Fund 1'] });
    const sessions = listMarketplaceResumeSessions('mutual_funds');
    expect(sessions.length).toBe(1);
    expect(sessions[0].path).toBe('/mutual-fund-marketplace');
    clearGuestSession(sessions[0].key);
    expect(listMarketplaceResumeSessions('mutual_funds').length).toBe(0);
  });
});
