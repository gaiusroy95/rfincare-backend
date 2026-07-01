import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const BankRequirementCard = ({ bank }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center space-x-4 hover:shadow-md transition-shadow">
      <Image
        src={bank?.logo}
        alt={bank?.logoAlt}
        className="w-12 h-12 md:w-16 md:h-16 object-contain flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm md:text-base font-semibold text-foreground mb-1">
          {bank?.name}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {bank?.requirement}
        </p>
      </div>
      <div className="flex items-center space-x-1 flex-shrink-0">
        <Icon name="CheckCircle2" size={16} color="var(--color-success)" />
        <span className="text-xs font-medium" style={{ color: 'var(--color-success)' }}>
          Selected
        </span>
      </div>
    </div>
  );
};

export default BankRequirementCard;