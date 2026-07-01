import React from 'react';
import Icon from '../AppIcon';
import { resolveCreditCardLogo } from '../../utils/creditCardMarketplace';

const CreditCardOfferTile = ({
  card,
  banksById = {},
  onClick,
  className = '',
  showApply = true,
}) => {
  const logo = resolveCreditCardLogo(card, banksById);

  const handleClick = () => {
    if (onClick) {
      onClick(card);
      return;
    }
    if (card?.applyUrl) {
      window.open(card.applyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={`flex-shrink-0 w-40 sm:w-44 bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center ${className}`}
    >
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex flex-col items-center gap-2 mb-3"
      >
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
          {logo ? (
            <img src={logo} alt={card.name} className="w-14 h-14 object-contain" />
          ) : (
            <Icon name="CreditCard" size={26} className="text-violet-700" />
          )}
        </div>
        <p className="text-sm font-semibold text-foreground line-clamp-2 min-h-[2.5rem]">{card.name}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{card.bankName}</p>
      </button>
      {showApply && card?.applyUrl ? (
        <a
          href={card.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          Apply
          <Icon name="ExternalLink" size={13} />
        </a>
      ) : null}
    </div>
  );
};

export default CreditCardOfferTile;
