import React, { useEffect, useState } from 'react';

/** Official / widely spoken Indian languages supported by Google Translate */
export const GOOGLE_INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
];

const SCRIPT_ID = 'google-translate-script';
const ELEMENT_ID = 'google_translate_element';
const INCLUDED_LANGUAGES = GOOGLE_INDIAN_LANGUAGES.map((l) => l.code).join(',');

function readGoogTransLang() {
  try {
    const match = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([^;]+)/);
    return match?.[1] || 'en';
  } catch {
    return 'en';
  }
}

function setGoogTrans(lang) {
  const value = lang === 'en' ? '/en/en' : `/en/${lang}`;
  const domains = [window.location.hostname, `.${window.location.hostname}`];
  domains.forEach((domain) => {
    document.cookie = `googtrans=${value};path=/;domain=${domain}`;
  });
  document.cookie = `googtrans=${value};path=/`;
}

function initGoogleTranslate() {
  if (typeof window === 'undefined' || !window.google?.translate?.TranslateElement) return;
  const host = document.getElementById(ELEMENT_ID);
  if (!host || host.querySelector('.goog-te-combo, .skiptranslate')) return;

  // eslint-disable-next-line no-new
  new window.google.translate.TranslateElement(
    {
      pageLanguage: 'en',
      includedLanguages: INCLUDED_LANGUAGES,
      layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
      autoDisplay: false,
    },
    ELEMENT_ID,
  );
}

/**
 * Indian-language switcher backed by Google Translate.
 * Custom select keeps English UI labels (avoids browser-locale gadget text).
 */
const LanguageSwitcher = () => {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    setLang(readGoogTransLang());
    window.googleTranslateElementInit = initGoogleTranslate;

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      if (window.google?.translate?.TranslateElement) initGoogleTranslate();
      return undefined;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`;
    script.async = true;
    document.body.appendChild(script);
    return undefined;
  }, []);

  const handleChange = (e) => {
    const next = e.target.value;
    setLang(next);
    setGoogTrans(next);

    const combo = document.querySelector(`#${ELEMENT_ID} select.goog-te-combo`);
    if (combo) {
      combo.value = next;
      combo.dispatchEvent(new Event('change'));
      return;
    }
    window.location.reload();
  };

  return (
    <div className="rf-google-translate" aria-label="Translate page">
      <label className="sr-only" htmlFor="rf-lang-select">
        Language
      </label>
      <select
        id="rf-lang-select"
        className="rf-lang-select"
        value={lang}
        onChange={handleChange}
      >
        {GOOGLE_INDIAN_LANGUAGES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.nativeName}
          </option>
        ))}
      </select>
      {/* Hidden Google host used to apply translations */}
      <div id={ELEMENT_ID} className="rf-google-translate-host" aria-hidden="true" />
    </div>
  );
};

export default LanguageSwitcher;
