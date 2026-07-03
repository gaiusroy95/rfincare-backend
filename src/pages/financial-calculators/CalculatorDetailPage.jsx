import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MarketingPageShell from '../../components/layout/MarketingPageShell';
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
    <MarketingPageShell
      title={meta?.title || 'Financial Calculator'}
      subtitle={meta?.description || 'Free calculator from RFINCARE'}
    >
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-muted-foreground mb-6 flex flex-wrap items-center gap-2">
            <Link to="/resources/calculators" className="hover:text-[var(--color-brand-green)]">Calculators</Link>
            <Icon name="ChevronRight" size={14} />
            <span className="text-foreground font-medium">{meta?.title || slug}</span>
          </nav>

          {loading ? (
            <p className="text-center py-16 text-muted-foreground">Loading calculator…</p>
          ) : !meta ? (
            <div className="text-center py-16 rf-filter-card">
              <p className="text-muted-foreground mb-4">Calculator not found.</p>
              <button type="button" className="text-[var(--color-brand-green)] font-semibold" onClick={() => navigate('/resources/calculators')}>
                Back to all calculators
              </button>
            </div>
          ) : (
            <div className="rf-filter-card">
              <UniversalCalculator
                slug={slug}
                title={meta.title}
                description={meta.description}
                engine={meta.engine}
                defaults={meta.defaults}
              />
            </div>
          )}
        </div>
      </section>
    </MarketingPageShell>
  );
};

export default CalculatorDetailPage;
