import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import GuestResumeBanner from '../../components/GuestResumeBanner';
import { getLoanProductBySlug } from '../../constants/loanProducts';
import { useLoanProducts } from '../../contexts/LoanProductsContext';
import { useMarketplaceVisibility } from '../../contexts/MarketplaceVisibilityContext';
import { buildProductCatalogChips, filterMarketplaceShowcase } from '../../utils/showcaseProducts';
import BankOffersSection from '../product-landing/components/BankOffersSection';
import { openAssessmentOrEligibilityFirst } from '../../utils/eligibilityGate';
import { ADVANCED_COMPARE_DIMENSIONS, COMPARE_BUNDLES } from '../../constants/advancedCompareDimensions';
import {
  loadProductComparisonSelection,
  saveProductComparisonSelection,
  listGuestResumeSessions,
} from '../../utils/guestSessionResume';

const MARKETPLACE_COMPARE_LINKS = [
  { slug: 'insurance', label: 'Insurance plans', path: '/insurance-marketplace', icon: 'Shield', visibilityKey: 'insuranceMarketplace' },
  { slug: 'mutual_fund', label: 'Mutual funds', path: '/mutual-fund-marketplace', icon: 'TrendingUp', visibilityKey: 'mutualFundMarketplace' },
  { slug: 'credit_card', label: 'Credit cards', path: '/credit-cards', icon: 'CreditCard', visibilityKey: 'creditCardMarketplace' },
  { slug: 'bank', label: 'Bank loans', path: '/bank-marketplace', icon: 'Building2', visibilityKey: 'bankMarketplace' },
  { slug: 'fixed_income', label: 'Fixed income', path: '/fixed-income-marketplace', icon: 'Landmark', visibilityKey: 'fixedIncomeMarketplace' },
  { slug: 'post_office', label: 'Post office schemes', path: '/post-office-marketplace', icon: 'Mailbox', visibilityKey: 'postOfficeMarketplace' },
  { slug: 'government_scheme', label: 'Government schemes', path: '/government-schemes-marketplace', icon: 'Landmark', visibilityKey: 'governmentSchemesMarketplace' },
  { slug: 'investment', label: 'Investment products', path: '/investment-marketplace', icon: 'Gem', visibilityKey: 'investmentMarketplace' },
];

function getCatalogViewRoute(product) {
  if (product.route) return product.route;
  if (product.slug === 'credit_card') return '/credit-cards';
  return `/products/${product.slug}`;
}

const ProductComparison = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { products: loanProducts } = useLoanProducts();
  const { visibility } = useMarketplaceVisibility();
  const filterSlug = searchParams.get('loanType');
  const activeProduct = filterSlug ? getLoanProductBySlug(filterSlug) : null;
  const [selectedSlugs, setSelectedSlugs] = useState(() => loadProductComparisonSelection());
  const [resumeSessions, setResumeSessions] = useState(() => listGuestResumeSessions());
  const refreshResumeSessions = () => setResumeSessions(listGuestResumeSessions());

  const scrollToBankComparison = () => {
    document.getElementById('bank-comparison')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openBankCompareForProduct = (slug) => {
    if (filterSlug === slug) {
      scrollToBankComparison();
      return;
    }
    navigate(`/product-comparison?loanType=${slug}#bank-comparison`);
  };

  const catalog = useMemo(() => {
    const loans = loanProducts.map((p, index) => ({
      id: index + 1,
      slug: p.slug,
      name: p.label,
      icon: p.icon,
      interestRate: p.interestRange,
      maxAmount: p.features[0]?.replace('Up to ', '') || '—',
      tenure: p.features[1] || '—',
      processingFee: 'Varies by lender',
      features: p.features,
      kind: 'loan',
    }));
    const marketplaces = filterMarketplaceShowcase(visibility).map((p, index) => ({
      id: `mp-${index}`,
      slug: p.slug,
      name: p.label,
      icon: p.icon,
      interestRate: p.interestRange,
      maxAmount: '—',
      tenure: '—',
      processingFee: '—',
      features: p.features,
      kind: 'marketplace',
      route: p.route,
    }));
    return [...loans, ...marketplaces];
  }, [loanProducts, visibility]);

  const filterChips = useMemo(
    () => buildProductCatalogChips(loanProducts, visibility),
    [loanProducts, visibility],
  );

  const marketplaceCompareLinks = useMemo(
    () => MARKETPLACE_COMPARE_LINKS.filter((item) => visibility[item.visibilityKey] !== false),
    [visibility],
  );

  const visibleProducts = useMemo(() => {
    if (!filterSlug) return catalog;
    const match = getLoanProductBySlug(filterSlug);
    if (!match) return catalog;
    return catalog.filter((p) => p.slug === match.slug);
  }, [catalog, filterSlug]);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [filterSlug, location.hash]);

  useEffect(() => {
    if (location.hash === '#bank-comparison') {
      const t = setTimeout(scrollToBankComparison, 300);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [filterSlug, location.hash, activeProduct]);

  useEffect(() => {
    if (filterSlug && visibleProducts.length === 1) {
      setSelectedSlugs([visibleProducts[0].slug]);
    }
  }, [filterSlug, visibleProducts]);

  useEffect(() => {
    saveProductComparisonSelection(selectedSlugs);
  }, [selectedSlugs]);

  const toggleProduct = (slug) => {
    if (selectedSlugs.includes(slug)) {
      setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
    } else if (selectedSlugs.length < 3) {
      setSelectedSlugs([...selectedSlugs, slug]);
    }
  };

  const selectedProductDetails = catalog.filter((p) => selectedSlugs.includes(p.slug));

  const bestLoanSlug = useMemo(() => {
    if (!selectedProductDetails.length) return null;
    const loans = selectedProductDetails.filter((p) => p.kind !== 'marketplace');
    if (!loans.length) return null;
    const parseRate = (s) => {
      const m = String(s || '').match(/[\d.]+/);
      return m ? Number(m[0]) : 999;
    };
    return loans.reduce((best, p) => (parseRate(p.interestRate) < parseRate(best.interestRate) ? p : best)).slug;
  }, [selectedProductDetails]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="bg-[var(--color-brand-green-dark)] text-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Compare Products</h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Compare loans, insurance, mutual funds, and credit cards side by side — then drill into bank and marketplace offers
            </p>
          </div>
        </section>

        {!activeProduct && resumeSessions.length > 0 && (
          <section className="py-6 bg-muted/20 border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <GuestResumeBanner sessions={resumeSessions} onDismiss={refreshResumeSessions} />
            </div>
          </section>
        )}

        {activeProduct && (
          <section className="py-3 bg-card border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Link to="/product-comparison" className="hover:text-primary">
                Product comparison
              </Link>
              <Icon name="ChevronRight" size={14} />
              <span className="text-foreground font-medium">{activeProduct.label}</span>
              <span className="text-xs text-muted-foreground">— compare bank offers below</span>
            </div>
          </section>
        )}

        <section className="py-6 bg-muted border-b border-border">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-2 justify-center">
            <Link
              to="/product-comparison"
              className={`px-4 py-2 rounded-full text-sm border ${
                !filterSlug ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card'
              }`}
            >
              All products
            </Link>
            {filterChips
              .filter((p) => p.chipKind !== 'compare')
              .map((p) => (
                <Link
                  key={p.slug}
                  to={
                    p.chipKind === 'loan'
                      ? `/product-comparison?loanType=${p.slug}#bank-comparison`
                      : p.route
                  }
                  className={`px-4 py-2 rounded-full text-sm border ${
                    filterSlug === p.slug ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card'
                  }`}
                >
                  {p.shortLabel || p.label}
                </Link>
              ))}
            <Link
              to="/product-comparison"
              className="px-4 py-2 rounded-full text-sm border border-primary/30 bg-primary/5 text-primary font-medium"
            >
              Compare
            </Link>
          </div>
        </section>

        {!activeProduct && marketplaceCompareLinks.length > 0 && (
          <section className="py-8 bg-card border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-center">Marketplace comparison</h2>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-2xl mx-auto">
                Open a marketplace to compare live plans with side-by-side columns, filters, and apply links.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {marketplaceCompareLinks.map((item) => (
                  <Link
                    key={item.slug}
                    to={item.path}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name={item.icon} size={20} color="var(--color-primary)" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">Side-by-side compare</p>
                    </div>
                    <Icon name="ArrowRight" size={16} className="ml-auto text-muted-foreground flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {!activeProduct && (
          <section className="py-10 bg-muted/40 border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-center">Advanced comparison engine</h2>
              <p className="text-sm text-muted-foreground text-center mb-8 max-w-3xl mx-auto">
                Filter and compare products by return rate, fees, eligibility, tenure, tax benefits, ratings, TAT and more.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {COMPARE_BUNDLES.map((bundle) => (
                  <Link
                    key={bundle.id}
                    to={bundle.path}
                    className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    <h3 className="font-bold text-foreground">{bundle.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{bundle.description}</p>
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {ADVANCED_COMPARE_DIMENSIONS.map((dim) => (
                  <span
                    key={dim.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium text-muted-foreground"
                  >
                    <Icon name="Filter" size={12} />
                    {dim.label}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeProduct && (
          <BankOffersSection product={activeProduct} />
        )}

        <section className={`py-12 bg-gray-50 ${activeProduct ? 'border-t border-border' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              {activeProduct ? 'Compare loan product types' : 'Select products to compare'}
            </h2>
            {activeProduct && (
              <p className="text-center text-muted-foreground text-sm mb-6 max-w-2xl mx-auto">
                Bank offers for {activeProduct.label} are above. Use this section to compare different loan
                categories, or pick another product tab.
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleProducts.map((product) => (
                <div
                  key={product.slug}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleProduct(product.slug)}
                  onKeyDown={(e) => e.key === 'Enter' && toggleProduct(product.slug)}
                  className={`bg-white rounded-xl p-6 shadow-md cursor-pointer transition-all ${
                    selectedSlugs.includes(product.slug) ? 'ring-4 ring-primary shadow-xl' : 'hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name={product.icon} size={24} className="text-[var(--color-brand-green)]" />
                    </div>
                    {selectedSlugs.includes(product.slug) && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Icon name="Check" size={16} color="white" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {product.kind === 'marketplace' ? 'From: ' : 'Interest: '}
                    {product.interestRate}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(getCatalogViewRoute(product));
                    }}
                  >
                    {product.kind === 'marketplace' ? 'Open marketplace' : 'View product page'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {selectedProductDetails.length > 0 && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Comparison details</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-4 text-left font-semibold">Feature</th>
                      {selectedProductDetails.map((product) => (
                        <th key={product.slug} className={`p-4 text-left font-semibold ${product.slug === bestLoanSlug ? 'bg-emerald-50' : ''}`}>
                          <div className="flex items-center space-x-2">
                            <Icon name={product.icon} size={20} className="text-[var(--color-brand-green)]" />
                            <span>{product.name}</span>
                            {product.slug === bestLoanSlug && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white ml-1">
                                Best rate
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-medium">{selectedProductDetails.some((p) => p.kind === 'marketplace') ? 'Rate / premium' : 'Interest rate'}</td>
                      {selectedProductDetails.map((product) => (
                        <td key={product.slug} className="p-4">{product.interestRate}</td>
                      ))}
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="p-4 font-medium">Highlights</td>
                      {selectedProductDetails.map((product) => (
                        <td key={product.slug} className="p-4">
                          <ul className="space-y-1 text-sm">
                            {product.features.slice(0, 3).map((f) => (
                              <li key={f}>{f}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Actions</td>
                      {selectedProductDetails.map((product) => (
                        <td key={product.slug} className="p-4 space-y-2">
                          {product.kind === 'marketplace' ? (
                            <Button
                              size="sm"
                              className="w-full"
                              iconName="GitCompare"
                              onClick={() => navigate(product.route)}
                            >
                              Compare in marketplace
                            </Button>
                          ) : product.slug === 'credit_card' ? (
                            <Button
                              size="sm"
                              className="w-full"
                              iconName="GitCompare"
                              onClick={() => navigate('/credit-cards')}
                            >
                              Compare cards
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full"
                              iconName="GitCompare"
                              onClick={() => openBankCompareForProduct(product.slug)}
                            >
                              Compare bank offers
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className={`w-full ${product.slug === bestLoanSlug ? '' : ''}`}
                            variant={product.slug === bestLoanSlug ? 'default' : 'outline'}
                            onClick={() => {
                              if (product.kind === 'marketplace') {
                                navigate(product.route);
                                return;
                              }
                              if (product.slug === 'credit_card') {
                                navigate('/credit-cards');
                                return;
                              }
                              openAssessmentOrEligibilityFirst(navigate, { slug: product.slug });
                            }}
                          >
                            {product.slug === bestLoanSlug ? 'Apply — best rate' : product.kind === 'marketplace' ? 'Explore' : 'Apply now'}
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductComparison;
