import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from '../ui/Button';

const CalculatorProductCTA = ({ bridge }) => {
  const navigate = useNavigate();
  if (!bridge) return null;

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Next step</p>
        <h3 className="text-lg font-bold text-foreground">{bridge.headline}</h3>
        <p className="text-sm text-muted-foreground mt-1">{bridge.subline}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {bridge.products.map((product) => (
          <Button
            key={product.path}
            variant={product.primary ? 'default' : 'outline'}
            onClick={() => navigate(product.path)}
            className="inline-flex items-center gap-2"
          >
            <Icon name={product.icon || 'ArrowRight'} size={16} />
            {product.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CalculatorProductCTA;
