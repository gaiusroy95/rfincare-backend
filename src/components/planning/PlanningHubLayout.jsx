import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../ui/Header';
import Footer from '../../pages/homepage/components/Footer';
import Icon from '../AppIcon';
import Button from '../ui/Button';

const TYPE_STYLES = {
  calculator: 'bg-blue-50 text-blue-700 border-blue-200',
  marketplace: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  dashboard: 'bg-violet-50 text-violet-700 border-violet-200',
  content: 'bg-amber-50 text-amber-800 border-amber-200',
};

const PlanningHubLayout = ({ hub, relatedCalculators = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className={`bg-gradient-to-br ${hub.gradient} text-white py-14 md:py-20`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm mb-4">
                <Icon name={hub.icon} size={16} />
                <span>Planning Hub</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{hub.title}</h1>
              <p className="text-lg text-white/90 mb-6">{hub.subtitle}</p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  className="bg-white text-gray-900 hover:bg-white/90"
                  onClick={() => navigate('/resources/calculators')}
                >
                  All Calculators
                </Button>
                <Button
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                  onClick={() => navigate('/product-comparison')}
                >
                  Compare Products
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Products &amp; Tools</h2>
            <p className="text-muted-foreground mb-8">Curated solutions to help you plan, save and invest smarter.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {hub.products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => navigate(product.path)}
                  className="text-left bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon name={product.icon} size={24} />
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border ${TYPE_STYLES[product.type] || TYPE_STYLES.calculator}`}>
                      {product.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{product.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary mt-4">
                    Explore <Icon name="ArrowRight" size={14} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {relatedCalculators.length > 0 && (
          <section className="py-12 bg-muted/30 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-bold mb-6">Related calculators</h2>
              <div className="flex flex-wrap gap-3">
                {relatedCalculators.map((calc) => (
                  <button
                    key={calc.slug}
                    type="button"
                    onClick={() => navigate(`/resources/calculators/${calc.slug}`)}
                    className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                  >
                    {calc.title}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PlanningHubLayout;
