import React from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import BankComparisonTable from './BankComparisonTable';
import { MAX_BANK_COMPARE } from '../../constants/bankComparison';
import { getMarketplaceCompareKey } from '../../utils/bankMarketplace';

const BankComparisonPanel = ({
  productLabel,
  banks,
  rawBanks,
  onApply,
  onRemoveBank,
  onClearAll,
  compareCount,
  maxCompare = MAX_BANK_COMPARE,
}) => {
  if (!compareCount) return null;

  const canCompare = banks.length >= 2;

  return (
    <section
      id="bank-comparison"
      className="mb-6 md:mb-8 scroll-mt-24 rounded-xl border-2 border-primary/30 bg-card shadow-md overflow-hidden"
      aria-label="Bank comparison"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 md:p-5 bg-primary/5 border-b border-border">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon name="GitCompare" size={22} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">
              {productLabel ? `${productLabel} — product comparison` : 'Compare products side by side'}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              {canCompare
                ? `Comparing ${banks.length} products on rates, fees, features, and policies. Select up to ${maxCompare} from the list below.`
                : `Select ${2 - compareCount} more product${compareCount === 1 ? '' : 's'} using the compare checkbox on each card.`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {banks.map((bank) => {
            const compareKey = getMarketplaceCompareKey(bank);
            const label =
              bank?.productName && bank.productName !== bank?.name
                ? `${bank.name} — ${bank.productName}`
                : bank.name;
            return (
              <span
                key={compareKey}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background border border-border text-xs font-medium"
              >
                {label}
                {onRemoveBank && (
                  <button
                    type="button"
                    className="p-0.5 hover:bg-muted rounded-full"
                    onClick={() => onRemoveBank(compareKey)}
                    aria-label={`Remove ${label} from comparison`}
                  >
                    <Icon name="X" size={14} />
                  </button>
                )}
              </span>
            );
          })}
          {onClearAll && compareCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              Clear all
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 md:p-6">
        {canCompare ? (
          <BankComparisonTable
            banks={banks}
            rawBanks={rawBanks}
            onApply={onApply}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Icon name="GitCompare" size={40} className="mb-3 opacity-40" />
            <p className="text-sm max-w-md">
              Tick &quot;Compare&quot; on at least two bank cards below to see interest rates, fees,
              and features in one table — without leaving this page.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BankComparisonPanel;
