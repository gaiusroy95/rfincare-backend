import { describe, it, expect, beforeEach } from 'vitest';
import {
  normalizeAgentCode,
  setStoredAgentCode,
  getStoredAgentCode,
  getAgentAttributionPayload,
  clearStoredAgentCode,
} from './agentAttribution';

describe('agentAttribution', () => {
  beforeEach(() => {
    clearStoredAgentCode();
    sessionStorage.clear();
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
    });
  });

  it('rejects short codes', () => {
    expect(normalizeAgentCode('ab')).toBeNull();
  });
});
