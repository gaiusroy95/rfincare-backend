import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import HomeSidebarWidgets from './HomeSidebarWidgets';

const TRUST_ITEMS = [
  { icon: 'Shield', label: '100% Secure' },
  { icon: 'BadgeIndianRupee', label: 'Best Prices' },
  { icon: 'Building2', label: '50+ Partners' },
  { icon: 'Users', label: '10L+ Users' },
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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-5 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-[2.65rem] font-bold text-foreground leading-tight">
                Everything You Need. One Place. For Your Financial Freedom.
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-xl">
                Compare, Invest, Insure &amp; Grow your wealth with India&apos;s most trusted financial marketplace.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {TRUST_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name={item.icon} size={16} className="text-[var(--color-brand-green)]" />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSearch} className="flex gap-0 max-w-xl shadow-md rounded-xl overflow-hidden border border-border">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="flex-1 px-4 py-3.5 text-sm outline-none bg-white"
              />
              <button
                type="submit"
                className="px-6 py-3.5 text-sm font-semibold text-white bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-dark)] transition-colors"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-3">
              <Button
                className="rf-btn-primary"
                iconName="ArrowRight"
                iconPosition="right"
                onClick={() => navigate('/product-comparison')}
              >
                Explore Products
              </Button>
              <Button
                variant="outline"
                className="rf-btn-outline-green"
                iconName="Phone"
                iconPosition="left"
                onClick={() => navigate('/contact-us')}
              >
                Talk to Expert
              </Button>
            </div>
          </div>

          <div className="xl:col-span-4 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3] bg-gradient-to-br from-emerald-50 to-orange-50">
              <img
                src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80"
                alt="Happy family planning their finances"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-56 bg-white rounded-xl shadow-xl p-4 border border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Financial Health Score</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="relative w-16 h-16">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        stroke="var(--color-brand-green)"
                        strokeWidth="3"
                        strokeDasharray={`${(728 / 900) * 97.4} 97.4`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">728</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">728<span className="text-sm font-normal text-muted-foreground">/900</span></p>
                    <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Good</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/eligibility-assessment')}
                  className="mt-3 text-xs font-semibold text-[var(--color-brand-green)] hover:underline"
                >
                  Improve Score →
                </button>
              </div>
            </div>
          </div>

          <div className="xl:col-span-3 space-y-4">
            <HomeSidebarWidgets />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
