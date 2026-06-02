import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const BankSelectionCard = ({ bank, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`relative p-4 md:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-lg'
          : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
      }`}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 md:top-4 md:right-4 w-6 h-6 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center">
          <Icon name="Check" size={16} color="white" />
        </div>
      )}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-white rounded-lg p-2 border border-border">
          <Image
            src={bank?.logo}
            alt={bank?.logoAlt}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">
            {bank?.name}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2">
            {bank?.description}
          </p>

          <div className="flex flex-wrap gap-2 md:gap-3">
            <div className="flex items-center gap-1.5">
              <Icon name="TrendingDown" size={14} className="text-success" />
              <span className="text-xs md:text-sm font-medium text-success">
                {bank?.interestRate}% Interest
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="Clock" size={14} className="text-primary" />
              <span className="text-xs md:text-sm text-muted-foreground">
                {bank?.processingTime}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="Target" size={14} className="text-accent" />
              <span className="text-xs md:text-sm font-medium text-accent">
                {bank?.approvalProbability}% Match
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankSelectionCard;