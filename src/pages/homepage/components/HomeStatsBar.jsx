import React from 'react';

const STATS = [
  { value: '10L+', label: 'Happy Customers' },
  { value: '50+', label: 'Partner Institutions' },
  { value: '500+', label: 'Financial Products' },
  { value: '₹50,000Cr+', label: 'Disbursed Loans' },
  { value: '4.8/5', label: 'Customer Rating' },
];

const HomeStatsBar = () => (
  <section className="rf-home-stats-bar">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-0">
        {STATS.map((stat) => (
          <div key={stat.label} className="rf-home-stat-item">
            <p className="text-lg md:text-xl font-bold">{stat.value}</p>
            <p className="text-xs md:text-sm text-white/80 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HomeStatsBar;
