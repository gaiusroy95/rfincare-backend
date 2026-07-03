import React from 'react';
import BrandLogo from '../ui/BrandLogo';
import Icon from '../AppIcon';

/** Branded minimal page for OAuth callback, resume links, and other transient states. */
const LoadingPageShell = ({ message = 'Please wait…', error = false }) => (
  <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center px-4 py-16">
    <BrandLogo size="md" showTagline className="mb-8" />
    <div className="flex items-center gap-3 text-muted-foreground">
      {!error ? (
        <Icon name="Loader" size={22} className="animate-spin text-[var(--color-brand-green)]" />
      ) : (
        <Icon name="AlertCircle" size={22} className="text-destructive" />
      )}
      <p className={`text-center max-w-md ${error ? 'text-destructive' : ''}`}>{message}</p>
    </div>
  </div>
);

export default LoadingPageShell;
