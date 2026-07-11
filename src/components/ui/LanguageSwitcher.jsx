import React, { useEffect } from 'react';

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

const INCLUDED_LANGUAGES = GOOGLE_INDIAN_LANGUAGES.map((l) => l.code).join(',');
const SCRIPT_ID = 'google-translate-script';
const ELEMENT_ID = 'google_translate_element';

function initGoogleTranslate() {
  if (typeof window === 'undefined' || !window.google?.translate?.TranslateElement) return;
  const host = document.getElementById(ELEMENT_ID);
  if (!host || host.querySelector('.goog-te-combo, .skiptranslate')) return;

  // eslint-disable-next-line no-new
  new window.google.translate.TranslateElement(
    {
      pageLanguage: 'en',
      includedLanguages: INCLUDED_LANGUAGES,
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false,
    },
    ELEMENT_ID,
  );
}

/**
 * Google Translate widget for Indian languages.
 * Replaces the previous i18n dropdown at this header slot.
 */
const LanguageSwitcher = () => {
  useEffect(() => {
    window.googleTranslateElementInit = initGoogleTranslate;

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      if (window.google?.translate?.TranslateElement) {
        initGoogleTranslate();
      }
      return undefined;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`;
    script.async = true;
    document.body.appendChild(script);

    return undefined;
  }, []);

  return (
    <div className="rf-google-translate" aria-label="Translate page">
      <div id={ELEMENT_ID} />
    </div>
  );
};

export default LanguageSwitcher;
