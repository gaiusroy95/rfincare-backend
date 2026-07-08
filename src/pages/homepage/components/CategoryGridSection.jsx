import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const CATEGORIES = [
  { label: 'Personal Loan', icon: 'Wallet', color: '#004d2c', path: '/products/personal-loan' },
  { label: 'Home Loan', icon: 'Home', color: '#ff5a00', path: '/products/home-loan' },
  { label: 'Mutual Funds', icon: 'TrendingUp', color: '#2563eb', path: '/mutual-fund-marketplace' },
  { label: 'Fixed Deposit', icon: 'Landmark', color: '#7c3aed', path: '/fixed-income-marketplace' },
  { label: 'Credit Cards', icon: 'CreditCard', color: '#dc2626', path: '/credit-cards' },
  { label: 'Health Insurance', icon: 'Heart', color: '#059669', path: '/insurance-marketplace' },
  { label: 'Life Insurance', icon: 'Shield', color: '#0891b2', path: '/insurance-marketplace' },
  { label: 'Car Loan', icon: 'Car', color: '#ca8a04', path: '/products/car-loan' },
  { label: 'SIP', icon: 'LineChart', color: '#4f46e5', path: '/mutual-fund-marketplace' },
  { label: 'Govt Schemes', icon: 'Landmark', color: '#0d9488', path: '/government-schemes-marketplace' },
  { label: 'Tax Saving', icon: 'Receipt', color: '#be185d', path: '/tax-saving' },
  { label: 'Post Office', icon: 'Mailbox', color: '#c2410c', path: '/post-office-marketplace' },
];

const CategoryGridSection = () => {
  const navigate = useNavigate();

  return (
    <section className="rf-home-categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 md:mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-green)] mb-1">
              Quick access
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Explore Our Top Categories</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/product-comparison')}
            className="text-sm font-semibold text-[var(--color-brand-green)] hover:underline self-start sm:self-auto"
          >
            View all products →
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => navigate(cat.path)}
              className="rf-category-tile group"
            >
              <div
                className="rf-category-tile-icon group-hover:scale-105 transition-transform"
                style={{ backgroundColor: `${cat.color}14`, color: cat.color }}
              >
                <Icon name={cat.icon} size={26} />
              </div>
              <span className="rf-category-tile-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGridSection;
