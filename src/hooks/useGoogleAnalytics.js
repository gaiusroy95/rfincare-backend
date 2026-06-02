import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useGoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const measurementId = import.meta.env?.VITE_GA_MEASUREMENT_ID;
    
    if (!measurementId || measurementId === 'your-google-analytics-id-here') {
      console.warn('Google Analytics Measurement ID not configured');
      return;
    }

    if (!window.dataLayer) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head?.appendChild(script);

      window.dataLayer = [];
      window.gtag = function gtag(...args) {
        window.dataLayer?.push(...args);
      };
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        send_page_view: false // Manual page view tracking
      });
    }

    // Track page view on route change
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_path: location?.pathname + location?.search,
        page_title: document.title,
        page_location: window.location?.href
      });
    }
  }, [location]);
}

// Utility function for tracking custom events
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, eventParams);
  }
};

// Utility function for tracking conversions
export const trackConversion = (conversionName, value = null) => {
  if (typeof window.gtag !== 'undefined') {
    const params = { event_category: 'conversion' };
    if (value !== null) params.value = value;
    window.gtag('event', conversionName, params);
  }
};

// Utility function for tracking user engagement
export const trackEngagement = (action, label = '', value = null) => {
  if (typeof window.gtag !== 'undefined') {
    const params = {
      event_category: 'engagement',
      event_label: label
    };
    if (value !== null) params.value = value;
    window.gtag('event', action, params);
  }
};