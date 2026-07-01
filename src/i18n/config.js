import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { LANGUAGE_CODES } from './languages.js';
import enTranslations from './locales/en.json';
import { installAutoTranslate } from './autoTranslate.js';

const LAZY_LOCALES = {
  hi: () => import('./locales/hi.json'),
  mr: () => import('./locales/mr.json'),
  gu: () => import('./locales/gu.json'),
  bn: () => import('./locales/bn.json'),
  ta: () => import('./locales/ta.json'),
  te: () => import('./locales/te.json'),
  kn: () => import('./locales/kn.json'),
};

async function ensureLocale(lang) {
  const code = (lang || 'en').split('-')[0];
  if (code === 'en' || i18n.hasResourceBundle(code, 'translation')) return;
  const loader = LAZY_LOCALES[code];
  if (!loader) return;
  const mod = await loader();
  i18n.addResourceBundle(code, 'translation', mod.default || mod, true, true);
}

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
  },
  supportedLngs: LANGUAGE_CODES,
  fallbackLng: 'en',
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
});

const applyDocumentLanguage = (lang) => {
  if (typeof document === 'undefined') return;
  const baseLang = (lang || 'en').split('-')[0];
  document.documentElement.lang = baseLang;
  document.documentElement.setAttribute('data-lang', baseLang);
};

applyDocumentLanguage(i18n.language);
i18n.on('languageChanged', (lang) => {
  applyDocumentLanguage(lang);
  ensureLocale(lang);
});

ensureLocale(i18n.language);

// Translate the entire rendered DOM at runtime (covers hardcoded strings that
// are not wired through t()). Hand-written keys in locale files still take
// precedence because t() resolves before the DOM walker sees the output.
installAutoTranslate(i18n);

export default i18n;
