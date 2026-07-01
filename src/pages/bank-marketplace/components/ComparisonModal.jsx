import React from 'react';
import Icon from '../../../components/AppIcon';
import BankComparisonTable from '../../../components/bank-comparison/BankComparisonTable';

const ComparisonModal = ({ banks, rawBanks = [], onClose, onApply }) => {
  if (banks?.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">
              Compare Banks
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Compare interest rates, fees, and features side by side
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close comparison"
          >
            <Icon name="X" size={24} />
          </button>
        </div>
        <div className="overflow-auto flex-1 p-4 md:p-6">
          <BankComparisonTable
            banks={banks}
            rawBanks={rawBanks}
            onApply={onApply}
          />
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;
