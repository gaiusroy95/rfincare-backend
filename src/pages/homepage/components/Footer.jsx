import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import BrandLogo from '../../../components/ui/BrandLogo';
import { useLoanProducts } from '../../../contexts/LoanProductsContext';
import { useSiteContact } from '../../../contexts/SiteContactContext';
import { POLICY_PAGES, legalPagePath } from '../../../constants/legalPages';

const normalizeAddress = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

function getAdditionalFooterOffices(contact) {
  const primary = new Set(
    [contact.registeredAddress, contact.branchAddress]
      .filter(Boolean)
      .map(normalizeAddress),
  );
  const offices = (contact.offices || []).filter((o) => o?.address?.trim());
  if (offices.length) {
    return offices.filter((o) => !primary.has(normalizeAddress(o.address)));
  }
  return [];
}

const linkClass =
  'group flex w-full items-start gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors text-left';

const FooterColumn = ({ title, links, onNavigate }) => (
  <div className="min-w-0">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
      <span className="w-1 h-4 rounded-full bg-primary shrink-0" aria-hidden />
      {title}
    </h3>
    <ul className="space-y-2.5">
      {links?.map((link) => (
        <li key={link?.label} className="min-w-0">
          <button type="button" onClick={() => onNavigate(link?.path)} className={linkClass}>
            <span className="break-words transition-transform group-hover:translate-x-0.5">{link?.label}</span>
          </button>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { products: loanProducts } = useLoanProducts();
  const { contact } = useSiteContact();
  const currentYear = new Date()?.getFullYear();
  const additionalOffices = useMemo(() => getAdditionalFooterOffices(contact), [contact]);
  const hasAdditionalOffices = additionalOffices.length > 0;

  const footerLinks = {
    products: (Array.isArray(loanProducts) ? loanProducts : [])
      .filter((p) => p?.slug)
      .map((p) => ({
        label: p.label,
        path: `/products/${p.slug}`,
      })),
    company: [
      { label: t('footer.aboutUs'), path: '/about-us' },
      { label: t('footer.howItWorks'), path: '/homepage#how-it-works' },
      { label: t('footer.bankPartners'), path: '/bank-marketplace' },
      { label: 'Credit Cards', path: '/credit-cards' },
      { label: 'Insurance Marketplace', path: '/insurance-marketplace' },
      { label: 'Mutual Fund Marketplace', path: '/mutual-fund-marketplace' },
      { label: t('footer.careers'), path: '/legal/careers' },
    ],
    resources: [
      { label: t('footer.helpCenter'), path: '/legal/help-center' },
      { label: t('footer.financialGuides'), path: '/legal/financial-guides' },
      { label: t('footer.loanEmiCalculator'), path: '/resources/loan-emi-calculator' },
      { label: 'Share Your Story', path: '/share-your-story' },
    ],
    legal: [
      { label: t('footer.privacyPolicy'), path: '/legal/privacy-policy' },
      { label: t('footer.termsOfService'), path: '/legal/terms-of-service' },
      { label: t('footer.cookiePolicy'), path: '/legal/cookie-policy' },
      { label: t('footer.helpCenter'), path: '/legal/help-center' },
    ],
    policies: POLICY_PAGES.map((page) => ({
      label: page.title,
      path: legalPagePath(page.slug),
    })),
  };

  const socialLinks = [
    { name: 'Facebook', icon: 'Facebook', url: contact.socialFacebook },
    { name: 'Twitter', icon: 'Twitter', url: contact.socialTwitter },
    { name: 'Linkedin', icon: 'Linkedin', url: contact.socialLinkedin },
    { name: 'Instagram', icon: 'Instagram', url: contact.socialInstagram },
  ];

  return (
    <footer className="relative border-t border-border bg-gradient-to-b from-muted/30 via-card to-muted/50">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-10 md:mb-12">
          <div
            className={`sm:col-span-2 ${hasAdditionalOffices ? 'lg:col-span-3' : 'lg:col-span-4'}`}
          >
            <div className="mb-5">
              <BrandLogo size="md" />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground mb-6 max-w-sm">
              {contact.tagline || t('footer.tagline')}
            </p>

            <div className="space-y-3 mb-6">
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon name="Mail" size={16} />
                </span>
                <span className="break-all">{contact.email}</span>
              </a>
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon name="Phone" size={16} />
                </span>
                {contact.phone}
              </a>
            </div>

            <div className="grid gap-3 mb-6">
              <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-3 text-xs leading-relaxed text-muted-foreground">
                <p className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <Icon name="MapPin" size={14} className="text-primary shrink-0" />
                  {contact.registeredOfficeLabel || t('footer.registeredOffice')}
                </p>
                <p>{contact.registeredAddress}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-3 text-xs leading-relaxed text-muted-foreground">
                <p className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <Icon name="Building2" size={14} className="text-primary shrink-0" />
                  {contact.branchOfficeLabel || t('footer.branchOffice')}
                </p>
                <p>{contact.branchAddress}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {socialLinks?.map((social) => (
                <a
                  key={social?.name}
                  href={social?.url || '#'}
                  target={social?.url?.startsWith('http') ? '_blank' : undefined}
                  rel={social?.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  aria-label={social?.name}
                >
                  <Icon name={social?.icon} size={18} />
                </a>
              ))}
            </div>
          </div>

          {hasAdditionalOffices && (
            <div className="sm:col-span-2 lg:col-span-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-primary shrink-0" aria-hidden />
                {t('footer.officeLocations', { defaultValue: 'Office locations' })}
              </h3>
              <div className="grid gap-3">
                {additionalOffices.map((office, index) => (
                  <div
                    key={`${office.title}-${index}`}
                    className="rounded-lg border border-border/60 bg-muted/30 px-3 py-3 text-xs leading-relaxed text-muted-foreground"
                  >
                    <p className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                      <Icon name="MapPin" size={14} className="text-primary shrink-0" />
                      {office.title || t('footer.office', { defaultValue: 'Office' })}
                    </p>
                    <p>{office.address}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className={`sm:col-span-2 ${
              hasAdditionalOffices ? 'lg:col-span-6' : 'lg:col-span-8'
            } grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6`}
          >
            <FooterColumn
              title={t('footer.products')}
              links={footerLinks.products}
              onNavigate={navigate}
            />
            <FooterColumn
              title={t('footer.company')}
              links={footerLinks.company}
              onNavigate={navigate}
            />
            <FooterColumn
              title={t('footer.resources')}
              links={footerLinks.resources}
              onNavigate={navigate}
            />
            <FooterColumn
              title={t('footer.legal')}
              links={footerLinks.legal}
              onNavigate={navigate}
            />
          </div>
        </div>

        <div className="mb-10 md:mb-12 pt-8 border-t border-border/60">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-primary shrink-0" aria-hidden />
            Policies & Disclosures
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
            {footerLinks.policies?.map((link) => (
              <li key={link.path} className="min-w-0">
                <button type="button" onClick={() => navigate(link.path)} className={linkClass}>
                  <span className="break-words transition-transform group-hover:translate-x-0.5">
                    {link.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border/60 bg-background/50 px-4 py-5 md:px-6 md:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
              &copy; {currentYear} Rfincare. {t('footer.allRightsReserved')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs text-muted-foreground">
                <Icon name="Shield" size={14} className="text-success shrink-0" />
                {t('footer.sslSecured')}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs text-muted-foreground">
                <Icon name="Lock" size={14} className="text-success shrink-0" />
                {t('footer.pciCompliant')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
