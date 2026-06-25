import React, { createContext, useContext, useEffect, useState } from 'react';

import { fetchMarketingSettings } from '../lib/marketingAnalytics';

const DEFAULT_SETTINGS = {
  seoSiteName: 'Rfincare',
  seoDefaultTitle: 'Rfincare - Your Trusted Loan Partner',
  seoDefaultDescription:
    'Rfincare - Simplifying loan applications with personalized financial solutions across India',
  seoKeywords: 'loans, personal loan, home loan, business loan, India, Rfincare',
  seoRobots: 'index,follow',
  pageSeo: [],
  adCampaigns: [],
  customTags: [],
};

const MarketingContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refresh: async () => {},
});

export function useMarketing() {
  return useContext(MarketingContext);
}

export function MarketingProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await fetchMarketingSettings();
      setSettings({ ...DEFAULT_SETTINGS, ...data });
    } catch {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <MarketingContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </MarketingContext.Provider>
  );
}
