import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import Icon from '../../components/AppIcon';
import UniversalCalculator from '../../components/calculators/UniversalCalculator';
import { calculatorService } from '../../services/calculatorService';

const CalculatorDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    calculatorService
      .getCalculator(slug)
      .then(setMeta)
      .catch(() => setMeta(null))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-muted-foreground mb-6 flex flex-wrap items-center gap-2">
            <Link to="/resources/calculators" className="hover:text-primary">Calculators</Link>
            <Icon name="ChevronRight" size={14} />
            <span className="text-foreground font-medium">{meta?.title || slug}</span>
          </nav>

          {loading ? (
            <p className="text-center py-16 text-muted-foreground">Loading calculator…</p>
          ) : !meta ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">Calculator not found.</p>
              <button type="button" className="text-primary font-semibold" onClick={() => navigate('/resources/calculators')}>
                Back to all calculators
              </button>
            </div>
          ) : (
            <UniversalCalculator
              slug={slug}
              title={meta.title}
              description={meta.description}
              engine={meta.engine}
              defaults={meta.defaults}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CalculatorDetailPage;
