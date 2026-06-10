import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BankListItem = ({ bank, onApply, onCompare, onViewBank, isComparing }) => {
  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'text-success';
    if (probability >= 60) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="feature-card group">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Bank Info */}
        <div className="flex items-start space-x-3 md:space-x-4 flex-shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={bank?.logo}
              alt={bank?.logoAlt}
              className="w-full h-full object-contain p-2"
            />
          </div>
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => onViewBank?.(bank)}
              className="text-base md:text-lg font-bold text-foreground line-clamp-1 mb-1 hover:text-primary text-left"
            >
              {bank?.name}
            </button>
            {(bank?.productName || bank?.productCategoryLabel) && (
              <p className="text-xs text-primary line-clamp-1 mb-1">
                {bank?.productName || bank?.productCategoryLabel}
              </p>
            )}
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)]?.map((_, i) => (
                  <Icon
                    key={i}
                    name="Star"
                    size={14}
                    className={i < Math.floor(bank?.rating) ? 'text-warning fill-warning' : 'text-muted'}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {bank?.rating} ({bank?.reviews})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {bank?.certifications?.slice(0, 2)?.map((cert, index) => (
                <div key={index} className="trust-badge">
                  <Icon name="Shield" size={12} className="text-primary" />
                  <span className="text-xs">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Probability & Rate */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-grow">
          <div className="flex-1 bg-muted rounded-lg p-3 md:p-4">
            <span className="text-xs text-muted-foreground block mb-1">Approval Probability</span>
            <div className="flex items-center space-x-2">
              <span className={`text-xl md:text-2xl font-bold ${getProbabilityColor(bank?.probability)}`}>
                {bank?.probability}%
              </span>
              <div className="flex-grow">
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className={`h-full rounded-full ${
                      bank?.probability >= 80 ? 'bg-success' : bank?.probability >= 60 ? 'bg-warning' : 'bg-error'
                    }`}
                    style={{ width: `${bank?.probability}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-muted rounded-lg p-3 md:p-4">
            <span className="text-xs text-muted-foreground block mb-1">Interest Rate</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl md:text-2xl font-bold text-primary">
                {bank?.interestRateLabel ?? bank?.interestRate ?? 'On request'}
              </span>
              {(bank?.interestRateLabel ?? bank?.interestRate) &&
                bank?.interestRateLabel !== 'On request' && (
                  <span className="text-xs text-muted-foreground">% p.a.</span>
                )}
            </div>
          </div>

          <div className="flex-1 bg-muted rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-1 mb-1">
              <Icon name="IndianRupee" size={14} className="text-primary" />
              <span className="text-xs text-muted-foreground">Max Amount</span>
            </div>
            <span className="text-base md:text-lg font-semibold text-foreground whitespace-nowrap">
              {bank?.maxAmount}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex md:flex-col gap-2 md:gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewBank?.(bank)}
            iconName="Layers"
            className="flex-1 md:flex-initial"
          >
            Products
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onApply(bank)}
            iconName="ArrowRight"
            iconPosition="right"
            className="flex-1 md:flex-initial"
          >
            Apply
          </Button>
          <Button
            variant={isComparing ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCompare(bank)}
            iconName={isComparing ? 'CheckSquare' : 'Square'}
            iconPosition="left"
            className="flex-1 md:flex-initial"
          >
            Compare
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BankListItem;