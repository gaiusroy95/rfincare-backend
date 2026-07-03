import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const REASONS = [
  {
    title: 'One Stop Solution',
    description: 'Loans, insurance, investments & more — all under one roof.',
    icon: 'LayoutGrid',
    accent: 'emerald',
  },
  {
    title: 'Best Price Guarantee',
    description: 'Compare 50+ partners and get the lowest rates guaranteed.',
    icon: 'BadgeIndianRupee',
    accent: 'orange',
  },
  {
    title: '24/7 Support',
    description: 'Expert guidance whenever you need it — chat, call or email.',
    icon: 'Headphones',
    accent: 'sky',
  },
  {
    title: '100% Secure',
    description: 'RBI-registered partners with bank-grade data protection.',
    icon: 'ShieldCheck',
    accent: 'violet',
  },
];

const ACCENT = {
  emerald: {
    card: 'rf-why-card--emerald',
    icon: 'bg-emerald-100 text-emerald-700',
  },
  orange: {
    card: 'rf-why-card--orange',
    icon: 'bg-orange-100 text-orange-700',
  },
  sky: {
    card: 'rf-why-card--sky',
    icon: 'bg-sky-100 text-sky-700',
  },
  violet: {
    card: 'rf-why-card--violet',
    icon: 'bg-violet-100 text-violet-700',
  },
};

const WhyChooseSection = () => {
  const navigate = useNavigate();

  return (
    <section className="rf-home-why">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-green)] mb-2">
            Why us
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Why Choose RFINCARE?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {REASONS.map((item) => {
            const style = ACCENT[item.accent];
            return (
              <div key={item.title} className={`rf-why-card ${style.card}`}>
                <div className={`rf-why-card-icon ${style.icon}`}>
                  <Icon name={item.icon} size={22} />
                </div>
                <h3 className="font-bold text-foreground text-base mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.description}</p>
                <button
                  type="button"
                  onClick={() => navigate('/about-us')}
                  className="rf-why-card-link mt-4"
                >
                  Learn more
                  <Icon name="ArrowRight" size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
