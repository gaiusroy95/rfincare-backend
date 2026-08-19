import { describe, it, expect, beforeEach } from 'vitest';
import {
  normalizeAgentCode,
  setStoredAgentCode,
  getStoredAgentCode,
  getAgentAttributionPayload,
  clearStoredAgentCode,
  captureAgentFromUrl,
} from './agentAttribution';

describe('agentAttribution', () => {
  beforeEach(() => {
    clearStoredAgentCode();
    sessionStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('normalizes and stores agent codes', () => {
    setStoredAgentCode('rfa20261');
    expect(getStoredAgentCode()).toBe('RFA20261');
  });

  it('returns attribution payload when code is stored', () => {
    setStoredAgentCode('RFA99999');
    expect(getAgentAttributionPayload()).toEqual({
      sourcedAgentCode: 'RFA99999',
      agentCode: 'RFA99999',
      referralCode: 'RFA99999',
      referralProgram: 'customer',
    });
  });

  it('captures unique customer referral codes from ref param', () => {
    window.history.replaceState({}, '', '/?ref=RFN-C-AB12CD34');
    captureAgentFromUrl();
    expect(getAgentAttributionPayload()).toEqual({
      sourcedAgentCode: undefined,
      agentCode: undefined,
      referralCode: 'RFN-C-AB12CD34',
      referralProgram: 'customer',
    });
  });

  it('captures unique agent referral codes from aref param', () => {
    window.history.replaceState({}, '', '/?aref=RFN-A-ZZ99YY11');
    captureAgentFromUrl();
    expect(getAgentAttributionPayload()).toEqual({
      sourcedAgentCode: undefined,
      agentCode: undefined,
      referralCode: 'RFN-A-ZZ99YY11',
      referralProgram: 'agent',
    });
  });

  it('rejects short codes', () => {
    expect(normalizeAgentCode('ab')).toBeNull();
  });
});
