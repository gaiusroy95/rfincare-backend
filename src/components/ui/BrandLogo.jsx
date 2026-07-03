import React, { useState } from 'react';

const LOGO_SRC = '/assets/images/logo.png';
const LOGO_SRC_ALT = '/assets/images/Logo_-_Copy_-_Copy-1771484476490.jpg';

/**
 * RFINCARE logo — image from public/assets with text wordmark fallback.
 */
const BrandLogo = ({ size = 'md', showTagline = true, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  const heights = { sm: 'h-8', md: 'h-10', lg: 'h-12' };
  const heightClass = heights[size] || heights.md;

  if (!imgFailed) {
    return (
      <div className={`flex flex-col leading-none ${className}`}>
        <img
          src={LOGO_SRC}
          alt="RFINCARE — Your Financial Supermarket"
          className={`${heightClass} w-auto object-contain object-left`}
          onError={(e) => {
            if (e.currentTarget.src.includes(LOGO_SRC_ALT)) {
              setImgFailed(true);
            } else {
              e.currentTarget.src = LOGO_SRC_ALT;
            }
          }}
        />
        {showTagline ? (
          <span className="text-[10px] font-semibold text-[var(--color-brand-green)] mt-0.5 tracking-wide uppercase">
            Your Financial Supermarket
          </span>
        ) : null}
      </div>
    );
  }

  const textSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };
  const tagSizes = { sm: 'text-[9px]', md: 'text-[10px]', lg: 'text-xs' };

  return (
    <div className={`flex flex-col leading-none ${className}`}>
      <div className={`font-extrabold tracking-tight ${textSizes[size] || textSizes.md}`} style={{ fontFamily: 'var(--font-headline)' }}>
        <span className="text-[var(--color-brand-green)]">R</span>
        <span className="text-[var(--color-brand-orange)]">FINCARE</span>
      </div>
      {showTagline ? (
        <span className={`${tagSizes[size] || tagSizes.md} font-semibold text-[var(--color-brand-green)] mt-0.5 tracking-wide uppercase`}>
          Your Financial Supermarket
        </span>
      ) : null}
    </div>
  );
};

export default BrandLogo;
