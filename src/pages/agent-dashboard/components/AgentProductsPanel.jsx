import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import CreditCardsQuickApply from '../../../components/credit-cards/CreditCardsQuickApply';

const PRODUCT_CATEGORIES = [
  {
    title: 'Loan Products',
    description: 'Home, personal, business, and vehicle loans from partner banks.',
    icon: 'Landmark',
    path: '/product-comparison',
  },
  {
    title: 'Credit Cards',
    description: 'Compare rewards, cashback, and travel cards for your clients.',
    icon: 'CreditCard',
    path: '/credit-cards',
  },
  {
    title: 'Insurance',
    description: 'Life, health, and motor insurance plans.',
    icon: 'Shield',
    path: '/insurance-marketplace',
  },
  {
    title: 'Mutual Funds',
    description: 'SIP and lump-sum investment options.',
    icon: 'TrendingUp',
    path: '/mutual-fund-marketplace',
  },
  {
    title: 'Fixed Income',
    description: 'Bonds, FDs, and debt instruments.',
    icon: 'PiggyBank',
    path: '/fixed-income-marketplace',
  },
  {
    title: 'Government Schemes',
    description: 'PMSBY, PMJJBY, Sukanya Samriddhi, and more.',
    icon: 'Landmark',
    path: '/government-schemes-marketplace',
  },
];

const AgentProductsPanel = () => (
  <div className="space-y-6">
    <CreditCardsQuickApply />

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {PRODUCT_CATEGORIES.map((product) => (
        <div
          key={product.title}
          className="bg-card border border-border rounded-lg p-5 flex flex-col"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <Icon name={product.icon} size={20} className="text-[var(--color-brand-green)]" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{product.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-auto self-start"
            iconName="ExternalLink"
            onClick={() => window.open(product.path, '_blank', 'noopener,noreferrer')}
          >
            Open marketplace
          </Button>
        </div>
      ))}
    </div>
  </div>
);

export default AgentProductsPanel;
