import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../AppIcon';
import Button from './Button';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const baseLang = (i18n?.language || 'en').split('-')[0];
  const currentLanguage =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === baseLang) || SUPPORTED_LANGUAGES[0];

  const changeLanguage = (langCode) => {
    i18n?.changeLanguage(langCode);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        className="flex items-center space-x-2 text-sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Icon name="Globe" size={16} />
        <span className="hidden md:inline">{currentLanguage?.nativeName}</span>
        <Icon name="ChevronDown" size={14} />
      </Button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 max-h-72 overflow-y-auto bg-popover border border-border rounded-lg shadow-lg z-50"
          role="listbox"
        >
          <div className="py-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={baseLang === lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between ${
                  baseLang === lang.code ? 'bg-muted text-primary font-semibold' : ''
                }`}
              >
                <span>{lang.nativeName}</span>
                {baseLang === lang.code && <Icon name="Check" size={16} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
