import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MarketplacePageShell from '../../components/layout/MarketplacePageShell';
import { getLoanProductBySlug } from '../../constants/loanProducts';
import { useLoanProducts } from '../../contexts/LoanProductsContext';
import { useMarketplaceVisibility } from '../../contexts/MarketplaceVisibilityContext';
import { buildProductCatalogChips } from '../../utils/showcaseProducts';
import NotFound from '../NotFound';
import BankOffersSection from './components/BankOffersSection';
import { openAssessmentOrEligibilityFirst } from '../../utils/eligibilityGate';

const LOAN_BENEFITS = {
  home_loan: [
    { icon: 'Percent', label: 'Lowest Interest Rates', sub: 'Starting from 8.25% p.a.' },
    { icon: 'FileText', label: 'Minimal Documentation', sub: 'Easy & quick process' },
    { icon: 'Clock', label: 'Quick Approval', sub: 'Get approval in 24-48 hrs' },
    { icon: 'Home', label: 'Top-up Loan Facility', sub: 'Available with select lenders' },
  ],
  default: [
    { icon: 'Percent', label: 'Competitive Rates', sub: 'Best offers from 50+ partners' },
    { icon: 'FileText', label: 'Easy Application', sub: 'Minimal documentation' },
    { icon: 'Clock', label: 'Fast Processing', sub: 'Quick approval turnaround' },
    { icon: 'ShieldCheck', label: '100% Secure', sub: 'RBI registered partners' },
  ],
};

const ProductLanding = () => {
  const { loanType } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useLoanProducts();
  const { visibility } = useMarketplaceVisibility();
  const [loanAmount, setLoanAmount] = useState(1000000);
  const product = useMemo(() => getLoanProductBySlug(loanType), [loanType, products]);
  const catalogChips = useMemo(
    () => buildProductCatalogChips(products, visibility),
    [products, visibility],
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loanType]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return <NotFound />;
  }

  const benefits = LOAN_BENEFITS[product.slug] || LOAN_BENEFITS.default;
  const otherProducts = catalogChips.filter((p) => p.slug !== product.slug);

  const filterSidebar = (
    <div className="space-y-5">
      <h3 className="font-bold text-foreground">Customize Your Search</h3>
      <div>
        <label className="text-sm font-medium text-foreground">Loan Amount</label>
        <p className="text-lg font-bold text-[var(--color-brand-green)] mt-1">
          ₹{loanAmount.toLocaleString('en-IN')}
        </p>
        <input
          type="range"
          min={100000}
          max={50000000}
          step={100000}
          value={loanAmount}
          onChange={(e) => setLoanAmount(Number(e.target.value))}
          className="w-full mt-2 accent-[var(--color-brand-green)]"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>₹1 Lakh</span>
          <span>₹5 Crore</span>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Interest Rate (%)</label>
        <select className="w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm bg-white">
          <option>Any</option>
          <option>Below 9%</option>
          <option>9% - 12%</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Loan Tenure</label>
        <select className="w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm bg-white">
          <option>20 Years</option>
          <option>15 Years</option>
          <option>10 Years</option>
          <option>5 Years</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Processing Fee</label>
        <select className="w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm bg-white">
          <option>Any</option>
          <option>Zero</option>
          <option>Below 1%</option>
        </select>
      </div>
      <Button className="rf-btn-primary w-full">Show Results</Button>
      <button type="button" className="text-sm text-muted-foreground hover:text-foreground w-full text-center">
        Clear All Filters
      </button>
    </div>
  );

  return (
    <MarketplacePageShell
      breadcrumbs={[
        { label: 'Home', path: '/homepage' },
        { label: 'Loans', path: '/product-comparison' },
        { label: product.label },
      ]}
      title={product.label}
      subtitle={`Compare ${product.label} offers from 50+ Banks & NBFCs`}
      benefits={benefits}
      filterSidebar={filterSidebar}
      ctaTitle="Check Your Home Loan Eligibility"
      ctaDescription="Get instant eligibility check without affecting your credit score."
      ctaButtonLabel="Check Eligibility Now"
      onCtaClick={() => navigate(`/eligibility-assessment?loanType=${product.slug}`)}
    >
      <BankOffersSection product={product} />

      <section className="mt-8 pt-8 border-t border-border">
        <h2 className="text-lg font-semibold mb-4">Other loan products</h2>
        <div className="flex flex-wrap gap-2">
          {otherProducts.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => navigate(p.route || `/products/${p.slug}`)}
              className="px-4 py-2 rounded-full text-sm border border-border hover:border-[var(--color-brand-green)] hover:bg-emerald-50 transition-colors"
            >
              {p.shortLabel || p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <Button className="rf-btn-primary" onClick={() => openAssessmentOrEligibilityFirst(navigate, { slug: product.slug })}>
            Apply Now
          </Button>
          <Button variant="outline" className="rf-btn-outline-green" onClick={() => navigate(`/product-comparison?loanType=${product.slug}`)}>
            Compare Products
          </Button>
        </div>
      </section>
    </MarketplacePageShell>
  );
};

export default ProductLanding;
