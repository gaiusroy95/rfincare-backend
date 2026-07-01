import React from 'react';

/**
 * Theme-aligned Rfincare mark (Milestone 1 logo update).
 */
const BrandLogo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    sm: { box: 'w-8 h-8', text: 'text-base', letter: 'text-sm' },
    md: { box: 'w-10 h-10', text: 'text-xl', letter: 'text-lg' },
    lg: { box: 'w-12 h-12', text: 'text-2xl', letter: 'text-xl' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div
        className={`${s.box} rounded-lg flex items-center justify-center bg-primary shadow-sm`}
        aria-hidden
      >
        <span className={`${s.letter} font-bold text-primary-foreground`}>R</span>
      </div>
      {showText && <span className={`${s.text} font-bold text-foreground`}>Rfincare</span>}
    </div>
  );
};

export default BrandLogo;
