import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { getLoanProductBySlug } from '../../constants/loanProducts';
import { useLoanProducts } from '../../contexts/LoanProductsContext';
import NotFound from '../NotFound';
import BankOffersSection from './components/BankOffersSection';
import { openAssessmentOrEligibilityFirst } from '../../utils/eligibilityGate';

const ProductLanding = () => {
  const { loanType } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useLoanProducts();
  const product = useMemo(() => getLoanProductBySlug(loanType), [loanType, products]);

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

  const qs = `loanType=${product.slug}`;
  const otherProducts = products.filter((p) => p.slug !== product.slug);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-14 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-white/80 mb-4">
              <button type="button" onClick={() => navigate('/homepage')} className="hover:text-white">
                Home
              </button>
              <Icon name="ChevronRight" size={14} />
              <span>{product.label}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: product.color }}
              >
                <Icon name={product.icon} size={32} color="white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">{product.label}</h1>
                <p className="text-lg text-white/90 max-w-2xl">{product.description}</p>
                <p className="mt-2 text-sm text-white/80">Typical rates: {product.interestRange}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Key features</h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Icon name="Check" size={18} style={{ color: product.color }} className="mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-3">
                <h2 className="text-lg font-semibold mb-2">Next steps</h2>
                <Button className="w-full" onClick={() => navigate(`/eligibility-assessment?${qs}`)}>
                  Check eligibility
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/product-comparison?loanType=${product.slug}#bank-comparison`)}
                >
                  Compare bank offers
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/product-comparison?${qs}`)}>
                  Compare product types
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() =>
                    openAssessmentOrEligibilityFirst(navigate, {
                      slug: product.slug,
                      state: { quickCheck: { loanType: product.apiKey } },
                    })
                  }
                >
                  Apply now
                </Button>
              </div>
            </div>
          </div>
        </section>

        <BankOffersSection product={product} />

        <section className="py-10 bg-background border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold mb-4">Other loan products</h2>
            <div className="flex flex-wrap gap-2">
              {otherProducts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/products/${p.slug}`}
                  className="px-4 py-2 rounded-full text-sm border border-border hover:bg-muted transition-colors"
                >
                  {p.shortLabel}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductLanding;
