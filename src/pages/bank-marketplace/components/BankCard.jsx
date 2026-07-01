import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import BankComparisonFields from './BankComparisonFields';

const BankCard = ({
  bank,
  onApply,
  onCompare,
  onViewBank,
  isComparing,
  showComparisonFields = false,
  comparisonValues,
  onComparisonChange,
}) => {
  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'text-success';
    if (probability >= 60) return 'text-warning';
    return 'text-error';
  };

  const getProbabilityBgColor = (probability) => {
    if (probability >= 80) return 'bg-success/10';
    if (probability >= 60) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const isCreditCard = Boolean(bank?.isCreditCard);

  return (
    <div className="feature-card group h-full flex flex-col">
      {/* Bank Header */}
      <div className="flex items-start justify-between mb-4 md:mb-6">
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
              className="text-base md:text-lg lg:text-xl font-bold text-foreground line-clamp-1 hover:text-primary text-left transition-colors"
            >
              {bank?.name}
            </button>
            {(bank?.productName || bank?.productCategoryLabel) && (
              <p className="text-xs text-primary line-clamp-1 mt-0.5">
                {bank?.productName || bank?.productCategoryLabel}
              </p>
            )}
            <div className="flex items-center space-x-2 mt-1">
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
              <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                {bank?.rating} ({bank?.reviews})
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onCompare(bank)}
          className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
            isComparing ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          aria-label={isComparing ? 'Remove from comparison' : 'Add to comparison'}
        >
          <Icon name={isComparing ? 'CheckSquare' : 'Square'} size={20} />
        </button>
      </div>
      {/* Probability Score */}
      {!isCreditCard ? (
      <div className={`${getProbabilityBgColor(bank?.probability)} rounded-lg p-3 md:p-4 mb-4 md:mb-6`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm font-semibold text-foreground">Approval Probability</span>
          <span className={`text-lg md:text-xl lg:text-2xl font-bold ${getProbabilityColor(bank?.probability)}`}>
            {bank?.probability}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              bank?.probability >= 80 ? 'bg-success' : bank?.probability >= 60 ? 'bg-warning' : 'bg-error'
            }`}
            style={{ width: `${bank?.probability}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{bank?.probabilityReason}</p>
      </div>
      ) : (
      <div className="bg-violet-500/10 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
        <p className="text-xs md:text-sm font-semibold text-foreground mb-1">Credit Card Offer</p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {bank?.description || 'Compare fees, rewards, and benefits — apply on the bank website.'}
        </p>
      </div>
      )}
      {/* Rates & charges */}
      <div className="bg-muted rounded-lg p-3 md:p-4 mb-4 md:mb-6 space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <span className="text-xs md:text-sm text-muted-foreground">
              {isCreditCard ? 'Interest Rate' : 'Interest Rate'}
            </span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
                {bank?.interestRateLabel ?? bank?.interestRate ?? 'On request'}
              </span>
              {(bank?.interestRateLabel ?? bank?.interestRate) &&
                bank?.interestRateLabel !== 'On request' && (
                  <span className="text-xs md:text-sm text-muted-foreground">% p.m.</span>
                )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs md:text-sm text-muted-foreground">
              {isCreditCard ? 'Joining Fee' : 'Processing Fee'}
            </span>
            <div className="text-base md:text-lg font-semibold text-foreground mt-1 whitespace-nowrap">
              {bank?.processingFee}
            </div>
          </div>
        </div>
        <div>
          <span className="text-xs md:text-sm text-muted-foreground">Other charges</span>
          <p className="text-sm font-medium text-foreground mt-1">{bank?.otherCharges || '—'}</p>
        </div>
      </div>

      {showComparisonFields && onComparisonChange && (
        <BankComparisonFields
          bankId={bank?.id}
          values={comparisonValues}
          onChange={onComparisonChange}
        />
      )}

      {/* Key Features */}
      <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 flex-grow">
        <h4 className="text-xs md:text-sm font-semibold text-foreground">Key Features</h4>
        <div className="space-y-2">
          {(bank?.features?.length ? bank.features : ['Contact lender for full feature list']).map(
            (feature, index) => (
            <div key={`${feature}-${index}`} className="flex items-start space-x-2">
              <Icon name="CheckCircle2" size={16} className="text-success flex-shrink-0 mt-0.5" />
              <span className="text-xs md:text-sm text-muted-foreground line-clamp-2">{feature}</span>
            </div>
          ),
          )}
        </div>
      </div>
      {/* Loan Details */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-muted rounded-lg p-2 md:p-3">
          <div className="flex items-center space-x-1 mb-1">
            <Icon name="IndianRupee" size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">{isCreditCard ? 'Annual Fee' : 'Max Amount'}</span>
          </div>
          <span className="text-sm md:text-base font-semibold text-foreground whitespace-nowrap">
            {isCreditCard ? (bank?.annualFeeLabel || bank?.maxAmount) : bank?.maxAmount}
          </span>
        </div>
        <div className="bg-muted rounded-lg p-2 md:p-3">
          <div className="flex items-center space-x-1 mb-1">
            <Icon name="CreditCard" size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">{isCreditCard ? 'Network' : 'Max Tenure'}</span>
          </div>
          <span className="text-sm md:text-base font-semibold text-foreground whitespace-nowrap">
            {isCreditCard ? bank?.cardNetwork : bank?.maxTenure}
          </span>
        </div>
      </div>
      {/* Trust Indicators */}
      <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
        {bank?.certifications?.map((cert, index) => (
          <div key={index} className="trust-badge">
            <Icon name="Shield" size={14} className="text-primary" />
            <span className="text-xs">{cert}</span>
          </div>
        ))}
      </div>
      {/* Partnership Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 md:mb-6 pb-4 md:pb-6 border-b border-border">
        <div className="flex items-center space-x-1">
          <Icon name="Users" size={14} />
          <span className="whitespace-nowrap">{bank?.customersServed} customers</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Clock" size={14} />
          <span className="whitespace-nowrap">{bank?.partnershipDuration}</span>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mt-auto">
        {!isCreditCard ? (
          <Button
            variant="outline"
            fullWidth
            onClick={() => onViewBank?.(bank)}
            iconName="Layers"
          >
            All bank products
          </Button>
        ) : null}
        <Button
          variant="default"
          fullWidth
          onClick={() => onApply(bank)}
          iconName={isCreditCard ? 'ExternalLink' : 'ArrowRight'}
          iconPosition="right"
        >
          {isCreditCard ? 'Apply on Bank Site' : 'Apply Now'}
        </Button>
      </div>
      {bank?.applyUrl && (
        <a
          href={bank.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <Icon name="ExternalLink" size={15} />
          Apply on {bank?.name || 'bank'} website
        </a>
      )}
    </div>
  );
};

export default BankCard;