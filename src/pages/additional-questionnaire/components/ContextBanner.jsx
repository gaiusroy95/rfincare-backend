import React from 'react';
import Icon from '../../../components/AppIcon';

const ContextBanner = ({ loanType, loanAmount }) => {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Icon name="Info" size={20} color="var(--color-primary)" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">
            Additional Information Required
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mb-3">
            Based on your selected banks and loan application, we need some additional details to process your request efficiently.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-card rounded-lg border border-border">
              <Icon name="FileText" size={14} color="var(--color-primary)" />
              <span className="text-xs font-medium text-foreground">{loanType}</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-card rounded-lg border border-border">
              <Icon name="IndianRupee" size={14} color="var(--color-success)" />
              <span className="text-xs font-medium text-foreground">${loanAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextBanner;