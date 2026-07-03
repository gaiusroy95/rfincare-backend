import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const REASONS = [
  {
    title: 'One Stop Solution',
    description: 'Loans, insurance, investments & more — all under one roof.',
    icon: 'LayoutGrid',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Best Price Guarantee',
    description: 'Compare 50+ partners and get the lowest rates guaranteed.',
    icon: 'BadgeIndianRupee',
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100 text-orange-700',
  },
  {
    title: '24/7 Support',
    description: 'Expert guidance whenever you need it — chat, call or email.',
    icon: 'Headphones',
    bg: 'bg-sky-50',
    iconBg: 'bg-sky-100 text-sky-700',
  },
  {
    title: '100% Secure',
    description: 'RBI-registered partners with bank-grade data protection.',
    icon: 'ShieldCheck',
    bg: 'bg-violet-50',
    iconBg: 'bg-violet-100 text-violet-700',
  },
];

const WhyChooseSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 bg-[#f8faf9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
          Why Choose RFINCARE?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REASONS.map((item) => (
            <div key={item.title} className={`rf-why-card ${item.bg}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${item.iconBg}`}>
                <Icon name={item.icon} size={22} />
              </div>
              <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
              <button
                type="button"
                onClick={() => navigate('/about-us')}
                className="text-sm font-semibold text-[var(--color-brand-green)] hover:underline"
              >
                Learn More →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
