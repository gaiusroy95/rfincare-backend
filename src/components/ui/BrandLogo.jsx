import React, { useState } from 'react';

/** Official brand assets — use only these two site-wide. */
export const BRAND_LOGO_SRC = '/assets/images/Translogo.png';
export const BRAND_FAVICON_SRC = '/assets/images/fevicon.png';

/**
 * Translogo is a wide lockup (emblem + wordmark). Favicon is the square mark.
 * `icon` size uses the favicon for collapsed portal sidebars.
 */
const LOGO_CLASS = {
  sm: 'h-8 w-auto max-w-[140px]',
  md: 'h-10 w-auto max-w-[180px]',
  lg: 'h-12 w-auto max-w-[220px]',
  xl: 'h-14 w-auto max-w-[260px]',
  '2xl': 'h-16 w-auto max-w-[300px]',
  icon: 'h-10 w-10',
  sidebar: 'h-12 w-auto max-w-[200px]',
};

/**
 * RFINCARE brand logo — Translogo for full lockups; fevicon for compact icon slots.
 */
const BrandLogo = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const useFavicon = size === 'icon';
  const src = useFavicon ? BRAND_FAVICON_SRC : BRAND_LOGO_SRC;
  const logoClass = LOGO_CLASS[size] || LOGO_CLASS.md;

  if (!imgFailed) {
    return (
      <div className={`inline-flex flex-col items-start leading-none ${className}`}>
        <img
          src={src}
          alt="RFINCARE"
          className={`${logoClass} object-contain object-left shrink-0`}
          onError={() => setImgFailed(true)}
        />
        {showTagline && !useFavicon ? (
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
