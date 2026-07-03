import React, { useState } from 'react';

const LOGO_SRC = '/assets/images/logo.png';
const LOGO_SRC_ALT = '/assets/images/Logo_-_Copy_-_Copy-1771484476490.jpg';

/** Square emblem sizes — logo.png is the RFINCARE icon mark (no baked-in wordmark). */
const EMBLEM_CLASS = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-14 w-14',
  '2xl': 'h-[4.5rem] w-[4.5rem]',
  icon: 'h-10 w-10',
  sidebar: 'h-11 w-11',
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
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    '2xl': 'text-5xl',
    icon: 'text-xl',
    sidebar: 'text-2xl',
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
