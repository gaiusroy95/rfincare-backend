import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import HomeSidebarWidgets from './HomeSidebarWidgets';
import HeroCibilScoreCard from './HeroCibilScoreCard';

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
              <h1 className="rf-hero-title text-3xl md:text-4xl lg:text-[2.65rem] font-bold leading-tight">
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
                onClick={() => navigate('/eligibility-assessment')}
              >
                Check Eligibility
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
            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3] bg-gradient-to-br from-sky-50 to-emerald-50">
              <img
                src="https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=900&q=80"
                alt="Person reviewing credit score and financial health on a laptop"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:max-w-[20rem] sm:w-full">
                <HeroCibilScoreCard />
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
