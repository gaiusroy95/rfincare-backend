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
];

const CategoryGridSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Explore Our Top Categories</h2>
          <button
            type="button"
            onClick={() => navigate('/product-comparison')}
            className="text-sm font-semibold text-[var(--color-brand-green)] hover:underline hidden sm:inline"
          >
            View All Products →
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-3 md:gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => navigate(cat.path)}
              className="rf-category-tile group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"
                style={{ backgroundColor: `${cat.color}18` }}
              >
                <Icon name={cat.icon} size={24} style={{ color: cat.color }} />
              </div>
              <span className="text-xs font-semibold text-foreground leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGridSection;
