import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../ui/Header';
import Footer from '../../pages/homepage/components/Footer';
import Icon from '../AppIcon';
import Button from '../ui/Button';

/**
 * Shared marketplace layout — FD, MF, credit cards, insurance, etc.
 */
const MarketplacePageShell = ({
  breadcrumbs = [],
  title,
  subtitle,
  benefits = [],
  filterSidebar,
  resultCount,
  sortControl,
  children,
  ctaTitle = 'Not sure which option is right for you?',
  ctaDescription = 'Get free expert advice and find the best product for your goals.',
  ctaButtonLabel = 'Get Recommendation',
  onCtaClick,
  footer = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {breadcrumbs.length > 0 ? (
          <nav className="rf-breadcrumbs mb-4" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.label} className="inline-flex items-center gap-1.5">
                {i > 0 ? <Icon name="ChevronRight" size={14} className="text-muted-foreground" /> : null}
                {crumb.path && i < breadcrumbs.length - 1 ? (
                  <Link to={crumb.path} className="rf-breadcrumb-link">{crumb.label}</Link>
                ) : (
                  <span className={i === breadcrumbs.length - 1 ? 'rf-breadcrumb-current' : 'rf-breadcrumb-link'}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        ) : null}

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
          {subtitle ? <p className="text-muted-foreground mt-2 max-w-3xl">{subtitle}</p> : null}
        </div>

        {benefits.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {benefits.map((b) => (
              <div key={b.label} className="rf-benefit-pill">
                <div className="rf-benefit-pill-icon">
                  <Icon name={b.icon} size={18} className="text-[var(--color-brand-green)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{b.label}</p>
                  {b.sub ? <p className="text-xs text-muted-foreground">{b.sub}</p> : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {filterSidebar ? (
            <aside className="lg:col-span-3">
              <div className="rf-filter-card sticky top-28">{filterSidebar}</div>
            </aside>
          ) : null}

          <div className={filterSidebar ? 'lg:col-span-9' : 'lg:col-span-12'}>
            {(resultCount != null || sortControl) ? (
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                {resultCount != null ? (
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{resultCount}</span> offers
                  </p>
                ) : <span />}
                {sortControl}
              </div>
            ) : null}

            <div className="space-y-4">{children}</div>
          </div>
        </div>

        <section className="rf-marketplace-cta mt-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                <Icon name="Lightbulb" size={20} className="text-[var(--color-brand-green)]" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{ctaTitle}</h3>
                <p className="text-sm text-muted-foreground mt-1">{ctaDescription}</p>
              </div>
            </div>
            <Button
              className="rf-btn-primary shrink-0"
              onClick={onCtaClick || (() => navigate('/contact-us'))}
            >
              {ctaButtonLabel}
              <Icon name="ArrowRight" size={16} className="ml-2" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-2">
            <span className="flex -space-x-2">
              {[1, 2, 3].map((n) => (
                <span key={n} className="w-7 h-7 rounded-full bg-slate-300 border-2 border-white" />
              ))}
            </span>
            50K+ Happy Investors
          </p>
        </section>
      </div>

      {footer ? <Footer /> : null}
    </div>
  );
};

export default MarketplacePageShell;
