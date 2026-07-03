import React, { useState } from 'react';

const LOGO_SRC = '/assets/images/logo.png';
const LOGO_SRC_ALT = '/assets/images/Logo_-_Copy_-_Copy-1771484476490.jpg';

/** Visible container height per size */
const SIZES = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-14',
  '2xl': 'h-[4.5rem]',
  icon: 'h-9',
  sidebar: 'h-16',
};

/** Taller image height when cropping embedded tagline from logo.png */
const IMG_SIZES_CROP = {
  sm: 'h-[2.75rem]',
  md: 'h-[3.5rem]',
  lg: 'h-[4.25rem]',
  xl: 'h-[5.25rem]',
  '2xl': 'h-[6.5rem]',
  icon: 'h-9 w-9 object-contain',
  sidebar: 'h-auto w-[220px] max-w-none',
};

/** Width-based crop — shows RFINCARE wordmark clearly in portal sidebars */
const SIDEBAR_LOGO_WIDTH = 220;

/**
 * RFINCARE logo — image from public/assets with text wordmark fallback.
 * By default shows wordmark only (no tagline text, crops tagline baked into logo.png).
 */
const BrandLogo = ({
  size = 'md',
  showTagline = false,
  wordmarkOnly = true,
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const containerHeight = SIZES[size] || SIZES.md;
  const isSidebar = size === 'sidebar';
  const isIcon = size === 'icon';
  const imgHeight = wordmarkOnly && !isSidebar && !isIcon
    ? IMG_SIZES_CROP[size] || IMG_SIZES_CROP.md
    : isSidebar
      ? IMG_SIZES_CROP.sidebar
      : isIcon
        ? IMG_SIZES_CROP.icon
        : containerHeight;

  if (!imgFailed) {
    const img = (
      <img
        src={LOGO_SRC}
        alt="RFINCARE"
        className={
          isSidebar
            ? `${imgHeight} object-contain object-left object-top`
            : `${imgHeight} w-auto object-contain object-left object-top`
        }
        style={isSidebar ? { width: SIDEBAR_LOGO_WIDTH } : undefined}
        onError={(e) => {
          if (e.currentTarget.src.includes(LOGO_SRC_ALT)) {
            setImgFailed(true);
          } else {
            e.currentTarget.src = LOGO_SRC_ALT;
          }
        }}
      />
    );

    return (
      <div className={`inline-flex flex-col leading-none ${className}`}>
        {wordmarkOnly ? (
          <div
            className={`${containerHeight} overflow-hidden flex items-start ${
              isSidebar ? 'w-full max-w-[220px]' : ''
            }`}
          >
            {img}
          </div>
        ) : (
          img
        )}
        {showTagline ? (
          <span className="text-[10px] font-semibold text-[var(--color-brand-green)] mt-0.5 tracking-wide uppercase">
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
