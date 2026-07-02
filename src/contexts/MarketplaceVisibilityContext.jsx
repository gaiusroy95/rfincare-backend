import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { adminProfileService } from '../services/adminProfileService';
import { queryCacheFetch } from '../lib/queryCache';

const CACHE_KEY = 'public:marketplace-visibility';
const CACHE_TTL_MS = 5 * 60 * 1000;

const DEFAULT_VISIBILITY = {
  bankMarketplace: true,
  creditCardMarketplace: true,
  insuranceMarketplace: true,
  mutualFundMarketplace: true,
  fixedIncomeMarketplace: true,
  postOfficeMarketplace: true,
  governmentSchemesMarketplace: true,
  investmentMarketplace: true,
};

const MarketplaceVisibilityContext = createContext({
  visibility: DEFAULT_VISIBILITY,
  loading: true,
});

export function MarketplaceVisibilityProvider({ children }) {
  const [visibility, setVisibility] = useState(DEFAULT_VISIBILITY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    queryCacheFetch(
      CACHE_KEY,
      () => adminProfileService.getPublicMarketplaceVisibility(),
      CACHE_TTL_MS,
    )
      .then((data) => {
        if (!active || !data) return;
        setVisibility({
          bankMarketplace: data.bankMarketplace !== false,
          creditCardMarketplace: data.creditCardMarketplace !== false,
          insuranceMarketplace: data.insuranceMarketplace !== false,
          mutualFundMarketplace: data.mutualFundMarketplace !== false,
          fixedIncomeMarketplace: data.fixedIncomeMarketplace !== false,
          postOfficeMarketplace: data.postOfficeMarketplace !== false,
          governmentSchemesMarketplace: data.governmentSchemesMarketplace !== false,
          investmentMarketplace: data.investmentMarketplace !== false,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({ visibility, loading }), [visibility, loading]);

  return (
    <MarketplaceVisibilityContext.Provider value={value}>
      {children}
    </MarketplaceVisibilityContext.Provider>
  );
}

export function useMarketplaceVisibility() {
  return useContext(MarketplaceVisibilityContext);
}
