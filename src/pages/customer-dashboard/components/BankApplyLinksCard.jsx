import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { getBankLogoUrl } from '../../../utils/bankBranding';

const QUICK_APPLY = [
  { loanType: 'personal_loan', label: 'Personal', icon: 'User' },
  { loanType: 'home_loan', label: 'Home', icon: 'Home' },
  { loanType: 'business_loan', label: 'Business', icon: 'Store' },
  { loanType: 'credit_card', label: 'Credit Card', icon: 'CreditCard' },
];

const BankApplyLinksCard = ({ banks = [] }) => {
  const navigate = useNavigate();
  const applyBanks = (banks || []).filter((b) => b?.applyUrl);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Apply</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_APPLY.map((item) => (
            <button
              key={item.loanType}
              type="button"
              onClick={() => navigate(`/customer-assessment-portal?loanType=${item.loanType}`)}
              className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon name={item.icon} size={22} className="text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {applyBanks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Apply for Credit Cards & Loans</h2>
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
                    <img
                      src={getBankLogoUrl(bank)}
                      alt={bank.name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <Icon name="Building2" size={22} className="text-primary" />
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground line-clamp-2 min-h-[2.5rem] mb-3">
                  {bank.name}
                </p>
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

export default BankApplyLinksCard;
