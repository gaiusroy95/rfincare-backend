import React, { useState } from 'react';

const LOGO_SRC = '/assets/images/updated_logo.png';
const LOGO_SRC_ALT = '/assets/images/logo.png';

/** Square emblem sizes — updated_logo.png is the RFINCARE icon mark (no baked-in wordmark). */
const EMBLEM_CLASS = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20',
  '2xl': 'h-28 w-28',
  icon: 'h-12 w-12',
  sidebar: 'h-16 w-16',
};

/**
 * RFINCARE logo — emblem image with optional text wordmark fallback on load failure.
 */
const BrandLogo = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const emblemClass = EMBLEM_CLASS[size] || EMBLEM_CLASS.md;

  if (!imgFailed) {
    return (
      <div className={`inline-flex flex-col items-start leading-none ${className}`}>
        <img
          src={LOGO_SRC}
          alt="RFINCARE"
          className={`${emblemClass} object-contain object-center shrink-0`}
          onError={(e) => {
            if (e.currentTarget.src.includes(LOGO_SRC_ALT)) {
              setImgFailed(true);
            } else {
              e.currentTarget.src = LOGO_SRC_ALT;
            }
          }}
        />
        {showTagline ? (
          <span className="text-[10px] font-semibold text-[var(--color-brand-green)] mt-1 tracking-wide uppercase">
            Your Financial Supermarket
          </span>
        ) : null}
      </div>
    );
  }

  const textSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
    '2xl': 'text-6xl',
    icon: 'text-2xl',
    sidebar: 'text-3xl',
  };

  return (
    <div className={`inline-flex flex-col leading-none ${className}`}>
      <div
        className={`font-extrabold tracking-tight ${textSizes[size] || textSizes.md}`}
        style={{ fontFamily: 'var(--font-headline)' }}
      >
        <span className="text-[var(--color-brand-green)]">RFIN</span>
        <span className="text-[var(--color-brand-orange)]">CARE</span>
      </div>
      {showTagline ? (
        <span className="text-[10px] font-semibold text-[var(--color-brand-green)] mt-0.5 tracking-wide uppercase">
          Your Financial Supermarket
        </span>
      ) : null}
    </div>
  );
};

export default BrandLogo;
