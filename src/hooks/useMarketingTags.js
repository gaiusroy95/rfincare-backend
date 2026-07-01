import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import {
  captureUtmFromUrl,
  fetchMarketingSettings,
  installMarketingTags,
  trackPageView,
} from '../lib/marketingAnalytics';

let tagsInstalled = false;
let lastSettingsKey = '';

export function useMarketingTags() {
  const location = useLocation();

  useEffect(() => {
    captureUtmFromUrl(location.search);
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const settings = await fetchMarketingSettings();
      if (cancelled) return;

      const envGa = import.meta.env?.VITE_GA_MEASUREMENT_ID;
      const merged = {
        ...settings,
        gaEnabled: settings.gaEnabled || Boolean(envGa && envGa !== 'your-google-analytics-id-here'),
        gaMeasurementId: settings.gaMeasurementId || envGa || '',
      };

      const key = JSON.stringify({
        ga: merged.gaMeasurementId,
        gtm: merged.gtmContainerId,
        pixel: merged.metaPixelId,
        gaOn: merged.gaEnabled,
        pixelOn: merged.metaPixelEnabled,
      });

      if (!tagsInstalled || key !== lastSettingsKey) {
        installMarketingTags(merged);
        tagsInstalled = true;
        lastSettingsKey = key;
      }

      trackPageView(location.pathname + location.search, document.title);
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search]);
}

// Backward-compatible re-exports
export { trackEvent, trackConversion, trackEngagement } from '../lib/marketingAnalytics';
