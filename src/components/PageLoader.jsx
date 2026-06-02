import React from 'react';

/** Lightweight route loading fallback (no icon library import). */
export default function PageLoader() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 p-8">
      <div
        className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin"
        aria-hidden
      />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
