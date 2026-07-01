import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import CreditCardOfferTile from './CreditCardOfferTile';
import { getBankLogoUrl } from '../../utils/bankBranding';
import { creditCardService } from '../../services/creditCardService';
import { resolveCreditCardLogo } from '../../utils/creditCardMarketplace';
import { openAssessmentOrEligibilityFirst } from '../../utils/eligibilityGate';

const QUICK_LOANS = [
  { loanType: 'personal_loan', label: 'Personal', icon: 'User' },
  { loanType: 'home_loan', label: 'Home', icon: 'Home' },
  { loanType: 'business_loan', label: 'Business', icon: 'Store' },
  { loanType: 'auto_loan', label: 'Vehicle', icon: 'Car' },
];

const CreditCardsQuickApply = ({ banks = [], comparePath = '/credit-cards' }) => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const applyBanks = (banks || []).filter((b) => b?.applyUrl);

  useEffect(() => {
    creditCardService.listActive().then((list) => {
      setCards(Array.isArray(list) ? list : []);
    }).catch(() => setCards([]));
  }, []);

  const banksById = useMemo(() => {
    const map = {};
    for (const bank of banks || []) {
      if (bank?.id) map[bank.id] = bank;
    }
    return map;
  }, [banks]);

  const featuredCards = cards.slice(0, 6);

  const handleCardClick = (card) => {
    if (card?.applyUrl) {
      window.open(card.applyUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(comparePath);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Apply</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_LOANS.map((item) => (
            <button
              key={item.loanType}
              type="button"
              onClick={() => openAssessmentOrEligibilityFirst(navigate, { loanType: item.loanType })}
              className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon name={item.icon} size={22} className="text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">{item.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => navigate('/bank-marketplace?loanType=credit_card')}
            className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center">
              <Icon name="CreditCard" size={22} className="text-violet-700" />
            </div>
            <span className="text-sm font-semibold text-foreground">Credit Card</span>
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Credit Card Offers</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/bank-marketplace?loanType=credit_card')}
              className="text-sm font-semibold text-primary"
            >
              Marketplace
            </button>
            <button type="button" onClick={() => navigate(comparePath)} className="text-sm font-semibold text-primary">
              Compare all
            </button>
          </div>
        </div>
        {featuredCards.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {featuredCards.map((card) => (
              <CreditCardOfferTile
                key={card.id}
                card={card}
                banksById={banksById}
                onClick={handleCardClick}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">No credit card offers published yet.</p>
            <Button size="sm" variant="outline" onClick={() => navigate('/bank-marketplace?loanType=credit_card')}>
              Browse marketplace
            </Button>
          </div>
        )}
      </div>

      {applyBanks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Exclusive Loan Offers</h2>
            <Button variant="link" size="sm" onClick={() => navigate('/bank-marketplace')}>
              All banks
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {applyBanks.map((bank) => (
              <div
                key={bank.id}
                className="flex-shrink-0 w-36 bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2 overflow-hidden">
                  {getBankLogoUrl(bank) ? (
                    <img src={getBankLogoUrl(bank)} alt={bank.name} className="w-10 h-10 object-contain" />
                  ) : (
                    <Icon name="Building2" size={22} className="text-primary" />
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground line-clamp-2 min-h-[2.5rem] mb-3">{bank.name}</p>
                <a
                  href={bank.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Apply
                  <Icon name="ExternalLink" size={13} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCardsQuickApply;
