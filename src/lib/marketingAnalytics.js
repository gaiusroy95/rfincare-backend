import { apiClient } from '../lib/apiClient';

const UTM_STORAGE_KEY = 'rfincare_utm_attribution';

/** Persist UTM params from the landing URL for conversion attribution. */
export function captureUtmFromUrl(search = '') {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(search || window.location.search);
  const utm = {
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
    utmContent: params.get('utm_content') || '',
    utmTerm: params.get('utm_term') || '',
    capturedAt: Date.now(),
  };
  if (utm.utmSource || utm.utmCampaign || utm.utmMedium) {
    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
    } catch {
      /* ignore */
    }
    return utm;
  }
  return getStoredUtm();
}

export function getStoredUtm() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

let marketingSettingsCache = null;
let marketingSettingsPromise = null;

export async function fetchMarketingSettings() {
  if (marketingSettingsCache) return marketingSettingsCache;
  if (!marketingSettingsPromise) {
    marketingSettingsPromise = apiClient
      .get('/public/marketing-settings')
      .then((r) => {
        marketingSettingsCache = r.data;
        return r.data;
      })
      .catch(() => ({}))
      .finally(() => {
        marketingSettingsPromise = null;
      });
  }
  return marketingSettingsPromise;
}

export function clearMarketingSettingsCache() {
  marketingSettingsCache = null;
}

export async function trackMarketingEvent(eventName, extra = {}) {
  const utm = getStoredUtm();
  const payload = {
    eventName,
    platform: 'web',
    pagePath: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '',
    utmSource: utm.utmSource || undefined,
    utmMedium: utm.utmMedium || undefined,
    utmCampaign: utm.utmCampaign || undefined,
    utmContent: utm.utmContent || undefined,
    utmTerm: utm.utmTerm || undefined,
    payload: extra,
  };
  try {
    await apiClient.post('/public/marketing/track', payload);
  } catch {
    /* non-blocking */
  }
}

function injectScriptOnce(id, src, inline) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  if (src) {
    script.src = src;
    script.async = true;
  } else if (inline) {
    script.text = inline;
  }
  document.head.appendChild(script);
}

function injectHtmlFragment(container, html, markerClass) {
  if (!html?.trim()) return;
  const existing = document.querySelector(`.${markerClass}`);
  if (existing) existing.remove();
  const wrap = document.createElement('div');
  wrap.className = markerClass;
  wrap.style.display = 'none';
  wrap.innerHTML = html;
  container.appendChild(wrap);
  wrap.querySelectorAll('script').forEach((oldScript) => {
    const script = document.createElement('script');
    [...oldScript.attributes].forEach((attr) => script.setAttribute(attr.name, attr.value));
    if (oldScript.textContent) script.text = oldScript.textContent;
    oldScript.parentNode?.replaceChild(script, oldScript);
  });
}

export function installMarketingTags(settings) {
  if (typeof window === 'undefined' || !settings) return;

  const gaId = settings.gaEnabled && settings.gaMeasurementId ? settings.gaMeasurementId : '';
  const gtmId = settings.gaEnabled && settings.gtmContainerId ? settings.gtmContainerId : '';
  const pixelId = settings.metaPixelEnabled && settings.metaPixelId ? settings.metaPixelId : '';

  if (gtmId) {
    injectScriptOnce(
      'rf-gtm',
      null,
      `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
    );
  }

  if (gaId && !gtmId) {
    injectScriptOnce('rf-gtag', `https://www.googletagmanager.com/gtag/js?id=${gaId}`);
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(...args) {
      window.dataLayer.push(...args);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId, { send_page_view: false });
  }

  if (pixelId) {
    if (!window.fbq) {
      const n = function fbq(...args) {
        if (n.callMethod) n.callMethod(...args);
        else n.queue.push(args);
      };
      n.queue = [];
      n.loaded = true;
      n.version = '2.0';
      window.fbq = n;
      window._fbq = n;
      injectScriptOnce('rf-fbpixel', 'https://connect.facebook.net/en_US/fbevents.js');
    }
    window.fbq('init', pixelId);
  }

  (settings.customTags || []).forEach((tag) => {
    if (tag.enabled === false || !tag.scriptHtml) return;
    const target = tag.placement === 'body' ? document.body : document.head;
    injectHtmlFragment(target, tag.scriptHtml, `rf-custom-tag-${tag.id}`);
  });

  injectHtmlFragment(document.head, settings.customHeadHtml, 'rf-custom-head-html');
  injectHtmlFragment(document.body, settings.customBodyHtml, 'rf-custom-body-html');
}

export function trackPageView(path, title) {
  const pagePath = path || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '');
  const pageTitle = title || (typeof document !== 'undefined' ? document.title : '');

  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: typeof window !== 'undefined' ? window.location.href : '',
    });
  }
  if (typeof window.fbq !== 'undefined') {
    window.fbq('track', 'PageView');
  }
  trackMarketingEvent('page_view', { pageTitle });
}

export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, eventParams);
  }
  if (typeof window.fbq !== 'undefined') {
    const fbMap = {
      lead: 'Lead',
      conversion: 'Purchase',
      apply_start: 'InitiateCheckout',
      apply_complete: 'CompleteRegistration',
      sign_up: 'CompleteRegistration',
    };
    const fbEvent = fbMap[eventName] || 'CustomEvent';
    if (fbEvent === 'CustomEvent') {
      window.fbq('trackCustom', eventName, eventParams);
    } else {
      window.fbq('track', fbEvent, eventParams);
    }
  }
  trackMarketingEvent(eventName, eventParams);
};

export const trackConversion = (conversionName, value = null) => {
  const params = { event_category: 'conversion' };
  if (value !== null) params.value = value;
  trackEvent(conversionName, params);
};

export const trackEngagement = (action, label = '', value = null) => {
  const params = { event_category: 'engagement', event_label: label };
  if (value !== null) params.value = value;
  trackEvent(action, params);
};
