import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLoanProducts } from '../../../contexts/LoanProductsContext';
import { openAssessmentOrEligibilityFirst } from '../../../utils/eligibilityGate';

const LoanTypesShowcase = () => {
  const navigate = useNavigate();
  const { products: loanProducts, loading } = useLoanProducts();

  return (
    <section className="bg-muted py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Loan Solutions for Every Need
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            From personal milestones to business growth, we connect you with the right financing options
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {loading && (
            <p className="col-span-full text-center text-muted-foreground py-8">Loading loan products…</p>
          )}
          {!loading && loanProducts.map((loan) => (
            <div key={loan.slug} className="feature-card">
              <div className="flex items-start space-x-4 mb-4">
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: loan.color }}
                >
                  <Icon name={loan.icon} size={28} color="white" />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">{loan.label}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{loan.description}</p>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs md:text-sm font-medium text-muted-foreground">Interest Rate Range</span>
                  <span className="text-sm md:text-base font-bold" style={{ color: loan.color }}>
                    {loan.interestRange}
                  </span>
                </div>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {loan.features.map((feature) => (
                  <li key={feature} className="flex items-start space-x-2 text-xs md:text-sm">
                    <Icon name="Check" size={16} color={loan.color} className="flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/products/${loan.slug}`)}
                >
                  View product
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openAssessmentOrEligibilityFirst(navigate, { slug: loan.slug })}
                >
                  Apply now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LoanTypesShowcase;
