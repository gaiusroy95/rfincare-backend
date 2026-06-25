import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

import { useMarketing } from '../contexts/MarketingContext';

/**
 * Per-page SEO meta tags. Merges admin defaults with optional overrides and
 * per-path rules saved in marketing settings.
 */
export default function SEO({
  title,
  description,
  keywords,
  image,
  robots,
  canonical,
  type = 'website',
}) {
  const location = useLocation();
  const { settings } = useMarketing();

  const path = location.pathname;
  const pageRule = (settings?.pageSeo || []).find(
    (p) => p.path === path || p.path === path.replace(/\/$/, ''),
  );

  const siteName = settings?.seoSiteName || 'Rfincare';
  const resolvedTitle =
    title || pageRule?.title || settings?.seoDefaultTitle || 'Rfincare - Your Trusted Loan Partner';
  const resolvedDescription =
    description
    || pageRule?.description
    || settings?.seoDefaultDescription
    || 'Rfincare - Simplifying loan applications with personalized financial solutions across India';
  const resolvedKeywords =
    keywords || pageRule?.keywords || settings?.seoKeywords || '';
  const resolvedImage = image || pageRule?.ogImage || settings?.seoOgImage || '';
  const resolvedRobots = robots || pageRule?.robots || settings?.seoRobots || 'index,follow';
  const baseCanonical = settings?.seoCanonicalUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const resolvedCanonical = canonical || (baseCanonical ? `${baseCanonical.replace(/\/$/, '')}${path}` : '');

  const fullTitle = resolvedTitle.includes(siteName) ? resolvedTitle : `${resolvedTitle} | ${siteName}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={resolvedDescription} />
      {resolvedKeywords ? <meta name="keywords" content={resolvedKeywords} /> : null}
      <meta name="robots" content={resolvedRobots} />
      {settings?.googleSiteVerification ? (
        <meta name="google-site-verification" content={settings.googleSiteVerification} />
      ) : null}
      {resolvedCanonical ? <link rel="canonical" href={resolvedCanonical} /> : null}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={resolvedDescription} />
      {resolvedCanonical ? <meta property="og:url" content={resolvedCanonical} /> : null}
      {resolvedImage ? <meta property="og:image" content={resolvedImage} /> : null}

      <meta name="twitter:card" content={settings?.seoTwitterCard || 'summary_large_image'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      {resolvedImage ? <meta name="twitter:image" content={resolvedImage} /> : null}
    </Helmet>
  );
}
