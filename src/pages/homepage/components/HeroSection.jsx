import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import HomeSidebarWidgets from './HomeSidebarWidgets';
import HeroCibilScoreCard from './HeroCibilScoreCard';
import HeroFlashBanner from './HeroFlashBanner';

const TRUST_ITEMS = [
  { icon: 'Shield', label: '100% Secure' },
  { icon: 'BadgeIndianRupee', label: 'Best Prices' },
  { icon: 'Building2', label: '50+ Partners' },
  { icon: 'Users', label: '10L+ Users' },
];

const QUICK_LINKS = [
  { label: 'Personal Loan', path: '/bank-marketplace?loanType=personal', icon: 'Wallet' },
  { label: 'Home Loan', path: '/bank-marketplace?loanType=home', icon: 'Home' },
  { label: 'Mutual Funds', path: '/mutual-fund-marketplace', icon: 'TrendingUp' },
  { label: 'Credit cards', path: '/credit-cards', icon: 'CreditCard' },
  { label: 'Insurance', path: '/insurance-marketplace', icon: 'Shield' },
  { label: 'Calculators', path: '/resources/calculators', icon: 'Calculator' },
];

const PLANNER_CARDS = [
  {
    id: 'loan-planner',
    title: 'Loan Planner',
    description: 'Check eligibility, EMI & pick the right loan offer.',
    icon: 'Landmark',
    path: '/eligibility-assessment',
    accent: 'loan',
  },
  {
    id: 'tax-saving-planner',
    title: 'Tax Saving Planner',
    description: 'Maximise 80C & find ELSS, NPS and tax FDs.',
    icon: 'Receipt',
    path: '/tax-saving',
    accent: 'tax',
  },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) navigate(`/product-comparison?search=${encodeURIComponent(q)}`);
    else navigate('/product-comparison');
  };

  return (
    <section className="rf-home-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-stretch">
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div>
              <h1 className="rf-hero-title text-3xl md:text-4xl lg:text-[2.5rem] font-bold leading-tight">
                Everything You Need. One Place. For Your Financial Freedom.
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mt-3 max-w-xl">
                Compare, Invest, Insure &amp; Grow your wealth with India&apos;s most trusted financial marketplace.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {TRUST_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name={item.icon} size={16} className="text-[var(--color-brand-green)]" />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSearch}
              className="flex gap-0 max-w-xl shadow-md rounded-xl overflow-hidden border border-border"
            >
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="flex-1 px-4 py-3.5 text-sm outline-none bg-white min-w-0"
              />
              <button
                type="submit"
                className="px-5 py-3.5 text-sm font-semibold text-white bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-dark)] transition-colors shrink-0"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-3">
              <Button
                className="rf-btn-primary"
                iconName="ArrowRight"
                iconPosition="right"
                onClick={() => navigate('/eligibility-assessment')}
              >
                Check Eligibility
              </Button>
              <Button
                variant="outline"
                className="rf-btn-outline-green"
                iconName="Phone"
                iconPosition="left"
                onClick={() => navigate('/book-appointment')}
              >
                Talk to Expert
              </Button>
            </div>

            <div className="rf-hero-planner-grid">
              {PLANNER_CARDS.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => navigate(card.path)}
                  className={`rf-hero-planner-card rf-hero-planner-card--${card.accent}`}
                >
                  <span className="rf-hero-planner-icon">
                    <Icon name={card.icon} size={20} />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-bold text-foreground">{card.title}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5 leading-snug">
                      {card.description}
                    </span>
                  </span>
                  <Icon name="ChevronRight" size={16} className="rf-hero-planner-arrow shrink-0" />
                </button>
              ))}
            </div>

            <div className="rf-hero-quick-links">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Popular products
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_LINKS.map((link) => (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => navigate(link.path)}
                    className="rf-hero-quick-chip"
                  >
                    <Icon name={link.icon} size={14} className="text-[var(--color-brand-green)]" />
                    <span>{link.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto min-h-[12rem] sm:min-h-[14rem] flex-1">
              <HeroFlashBanner />
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col">
            <HeroCibilScoreCard />
          </div>

          <div className="lg:col-span-3 space-y-4">
            <HomeSidebarWidgets />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
