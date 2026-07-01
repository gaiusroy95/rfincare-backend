/**
 * CMS-managed legal pages — slugs match `legal_pages` table and `/legal/:slug` routes.
 */
export const LEGAL_PAGE_SECTIONS = [
  {
    id: 'general',
    label: 'General',
    pages: [
      { slug: 'privacy-policy', title: 'Privacy Policy' },
      { slug: 'terms-of-service', title: 'Terms of Service' },
      { slug: 'cookie-policy', title: 'Cookie Policy' },
      { slug: 'help-center', title: 'Help Center' },
      { slug: 'financial-guides', title: 'Financial Guides' },
      { slug: 'careers', title: 'Careers' },
    ],
  },
  {
    id: 'policies',
    label: 'Policies & Disclosures',
    pages: [
      { slug: 'disclaimer', title: 'Disclaimer' },
      { slug: 'grievance-redressal-policy', title: 'Grievance Redressal Policy' },
      { slug: 'fair-practices-code', title: 'Fair Practices Code' },
      { slug: 'kyc-aml-policy', title: 'KYC & AML Policy' },
      { slug: 'refund-cancellation-policy', title: 'Refund & Cancellation Policy' },
      { slug: 'data-retention-policy', title: 'Data Retention Policy' },
      {
        slug: 'consent-data-collection-credit-bureau',
        title: 'Consent for Data Collection & Credit Bureau Access',
      },
      { slug: 'digital-lending-disclosure', title: 'Digital Lending Disclosure' },
      { slug: 'partner-bank-nbfc-disclosure', title: 'Partner Bank & NBFC Disclosure' },
      { slug: 'code-of-conduct-dsa-employees', title: 'Code of Conduct for DSAs & Employees' },
      { slug: 'security-fraud-awareness', title: 'Security & Fraud Awareness' },
      { slug: 'accessibility-statement', title: 'Accessibility Statement' },
    ],
  },
];

export const ALL_LEGAL_PAGES = LEGAL_PAGE_SECTIONS.flatMap((section) => section.pages);

export const POLICY_PAGES = LEGAL_PAGE_SECTIONS.find((s) => s.id === 'policies')?.pages || [];

const titleBySlug = new Map(ALL_LEGAL_PAGES.map((p) => [p.slug, p.title]));

export function getLegalPageTitle(slug) {
  return titleBySlug.get(slug) || slug?.replace(/-/g, ' ') || 'Legal';
}

export function legalPagePath(slug) {
  return `/legal/${slug}`;
}
