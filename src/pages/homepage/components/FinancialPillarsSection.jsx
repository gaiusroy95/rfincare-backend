import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { FINANCIAL_PILLARS } from '../../../constants/calculatorProductBridges';

const FinancialPillarsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Plan · Protect · Invest · Borrow
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            One platform for every financial goal — from loans and insurance to mutual funds and retirement planning.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FINANCIAL_PILLARS.map((pillar) => (
            <button
              key={pillar.id}
              type="button"
              onClick={() => navigate(pillar.path)}
              className="group text-left bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/30 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                <Icon name={pillar.icon} size={24} color="white" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{pillar.subtitle}</p>
              <h3 className="text-xl font-bold text-foreground mt-1">{pillar.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{pillar.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary mt-4 group-hover:gap-2 transition-all">
                {pillar.cta}
                <Icon name="ArrowRight" size={16} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FinancialPillarsSection;
