import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { POPULAR_CALCULATORS } from '../../../constants/calculatorProductBridges';

const PopularCalculatorsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Popular calculators</h2>
            <p className="text-muted-foreground mt-2">
              Plan smarter with 55+ free tools — then apply for the right product in one click.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/resources/calculators')}>
            View all calculators
            <Icon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_CALCULATORS.map((calc) => (
            <button
              key={calc.slug}
              type="button"
              onClick={() => navigate(calc.path)}
              className="flex items-start gap-4 p-5 bg-card border border-border rounded-xl hover:border-primary/40 hover:shadow-md transition-all text-left"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon name={calc.icon} size={22} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{calc.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{calc.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCalculatorsSection;
