import React from 'react';
import Icon from '../../../components/AppIcon';

const STATS = [
  { value: '10L+', label: 'Happy Customers', icon: 'Users' },
  { value: '50+', label: 'Partner Institutions', icon: 'Building2' },
  { value: '500+', label: 'Financial Products', icon: 'Package' },
  { value: '₹50,000Cr+', label: 'Disbursed Loans', icon: 'IndianRupee' },
  { value: '4.8/5', label: 'Customer Rating', icon: 'Star' },
];

const HomeStatsBar = () => (
  <section className="rf-home-stats-bar" aria-label="Platform statistics">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-y-6 gap-x-2 md:gap-0">
        {STATS.map((stat, index) => (
          <div
            key={stat.label}
            className={`rf-home-stat-item ${index % 2 === 0 ? 'rf-home-stat-item--border-mobile' : ''}`}
          >
            <Icon name={stat.icon} size={20} className="mx-auto mb-2 opacity-80" />
            <p className="text-xl md:text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-[11px] md:text-xs text-white/75 mt-1 leading-snug">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HomeStatsBar;
