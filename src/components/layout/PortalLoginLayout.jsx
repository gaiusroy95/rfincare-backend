import React from 'react';
import BrandLogo from '../ui/BrandLogo';

/**
 * Branded login/register page shell — forest green theme.
 */
const PortalLoginLayout = ({
  title,
  subtitle,
  icon = 'User',
  children,
  footer,
  accent = 'customer',
}) => {
  const accentRing = {
    customer: 'ring-[var(--color-brand-green)]',
    agent: 'ring-pink-500',
    employee: 'ring-[var(--color-brand-green)]',
    admin: 'ring-amber-500',
  }[accent] || 'ring-[var(--color-brand-green)]';

  const accentBg = {
    customer: 'bg-[var(--color-brand-green)]',
    agent: 'bg-pink-600',
    employee: 'bg-[var(--color-brand-green)]',
    admin: 'bg-amber-600',
  }[accent] || 'bg-[var(--color-brand-green)]';

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f8]">
      <div className="bg-[var(--color-brand-green-dark)] text-white py-2 px-4 text-center text-xs">
        100% Secure · RBI Registered Partners · Best Prices Guaranteed
      </div>

      <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <button type="button" onClick={() => window.location.assign('/homepage')} className="inline-block mb-6">
              <BrandLogo size="md" showTagline />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-lg p-8 sm:p-10">
            <div className={`mx-auto h-14 w-14 ${accentBg} rounded-full flex items-center justify-center mb-5 ring-4 ring-offset-2 ${accentRing}`}>
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
              {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            {children}
          </div>

          {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
};

export default PortalLoginLayout;
