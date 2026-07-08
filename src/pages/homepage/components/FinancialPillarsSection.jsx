import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { FINANCIAL_PILLARS } from '../../../constants/calculatorProductBridges';

const PILLAR_STYLES = {
  borrow: 'rf-pillar-card--borrow',
  protect: 'rf-pillar-card--protect',
  invest: 'rf-pillar-card--invest',
  plan: 'rf-pillar-card--plan',
};

const FinancialPillarsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="rf-home-pillars">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-green)] mb-2">
            Your financial journey
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-sky-500">
            Plan · Protect · Invest · Borrow
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
            One platform for every financial goal — loans, insurance, mutual funds and retirement planning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {FINANCIAL_PILLARS.map((pillar) => (
            <button
              key={pillar.id}
              type="button"
              onClick={() => navigate(pillar.path)}
              className={`rf-pillar-card group ${PILLAR_STYLES[pillar.id] || ''}`}
            >
              <div className="rf-pillar-card-icon">
                <Icon name={pillar.icon} size={24} color="white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {pillar.subtitle}
                </p>
                <h3 className="text-lg font-bold text-sky-500 mt-0.5">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
              <span className="rf-pillar-card-cta">
                {pillar.cta}
                <Icon name="ArrowRight" size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FinancialPillarsSection;
