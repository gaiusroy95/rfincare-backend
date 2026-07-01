import React from 'react';
import Icon from '../../../components/AppIcon';

const STATUS_LABELS = {
  likely_approved: 'Likely approved',
  conditional: 'Conditional approval',
  unlikely: 'Unlikely with current parameters',
};

function formatInr(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

const EligibilityResultSummary = ({ result, compact = false }) => {
  if (!result) return null;

  const score = Number(result.overallProbability);
  const scoreLabel = Number.isFinite(score) ? `${Math.round(score)}%` : '—';
  const statusLabel = STATUS_LABELS[result.status] || '';
  const topBanks = (result.banks || []).filter((b) => b?.bankName).slice(0, 3);

  return (
    <div
      className={`rounded-lg border border-primary/20 bg-primary/5 p-4 md:p-5 ${
        compact ? 'mb-4' : 'mb-6'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon name="TrendingUp" size={18} className="text-primary" />
        <h3 className="text-base md:text-lg font-semibold text-foreground">Expected eligibility</h3>
      </div>

      <p className="text-xl md:text-2xl font-bold text-primary mb-1">
        Approval score: {scoreLabel}
      </p>
      {statusLabel ? (
        <p className="text-sm font-semibold text-foreground mb-3">{statusLabel}</p>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div className="flex items-center justify-between gap-3 rounded-md bg-background/80 px-3 py-2 border border-border">
          <span className="text-sm text-muted-foreground">Eligible amount</span>
          <span className="text-sm font-semibold text-foreground">{formatInr(result.eligibleAmount)}</span>
        </div>
        {result.maxMonthlyEmi ? (
          <div className="flex items-center justify-between gap-3 rounded-md bg-background/80 px-3 py-2 border border-border">
            <span className="text-sm text-muted-foreground">Max monthly EMI</span>
            <span className="text-sm font-semibold text-foreground">{formatInr(result.maxMonthlyEmi)}</span>
          </div>
        ) : null}
      </div>

      {result.message ? (
        <p className="text-sm text-muted-foreground mb-3">{result.message}</p>
      ) : null}

      {!compact && topBanks.length > 0 ? (
        <div className="border-t border-border pt-3 mt-1">
          <p className="text-sm font-semibold text-foreground mb-2">Top matching banks</p>
          <ul className="space-y-2">
            {topBanks.map((bank) => (
              <li key={bank.bankName} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{bank.bankName}</span>
                <span className="font-semibold text-primary">
                  {Number.isFinite(Number(bank.bestProbability))
                    ? `${Math.round(Number(bank.bestProbability))}%`
                    : '—'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        Indicative estimate based on your application. Final approval depends on document verification
        and lender policies.
      </p>
    </div>
  );
};

export default EligibilityResultSummary;
