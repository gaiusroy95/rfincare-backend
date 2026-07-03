import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

function scoreColor(score) {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 65) return 'text-primary';
  if (score >= 45) return 'text-amber-600';
  return 'text-orange-600';
}

function barColor(score, max) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-primary';
  return 'bg-amber-500';
}

const FinancialHealthCard = ({ snapshot, loading, onViewPortfolio }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 animate-pulse h-48" />
    );
  }

  if (!snapshot?.summary) return null;

  const score = snapshot.summary.financialHealthScore ?? 0;
  const grade = snapshot.healthGrade || snapshot.summary.healthGrade || 'Fair';
  const breakdown = snapshot.healthBreakdown || [];
  const actions = snapshot.improvementActions || snapshot.recommendations || [];
  const nextAction = snapshot.nextBestAction;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-6 md:p-8 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 264} 264`}
                  className="text-primary"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${scoreColor(score)}`}>{score}</span>
                <span className="text-[10px] text-muted-foreground uppercase">/ 100</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Financial Health Score</p>
              <p className={`text-xl font-bold ${scoreColor(score)}`}>{grade}</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Complete recommended actions below to improve your score and unlock better product offers.
              </p>
            </div>
          </div>
          {nextAction && (
            <div className="bg-background border border-primary/20 rounded-xl p-4 md:max-w-sm w-full">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">Recommended next</p>
              <p className="font-semibold text-foreground mt-1">{nextAction.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{nextAction.description}</p>
              <Button
                size="sm"
                className="mt-3 w-full sm:w-auto"
                onClick={() => navigate(nextAction.path)}
              >
                {nextAction.cta || 'Take action'}
                {nextAction.pointsGain > 0 && (
                  <span className="ml-2 text-xs opacity-80">+{nextAction.pointsGain} pts</span>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {breakdown.length > 0 && (
        <div className="p-6 md:p-8 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Score breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {breakdown.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <Icon name={item.icon || 'Circle'} size={16} className="text-muted-foreground" />
                    {item.label}
                  </span>
                  <span className="text-muted-foreground">{item.score}/{item.max}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(item.score, item.max)}`}
                    style={{ width: `${item.max ? (item.score / item.max) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {actions.length > 0 && (
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">How to improve</h3>
            <button
              type="button"
              onClick={onViewPortfolio}
              className="text-sm text-primary font-medium hover:underline"
            >
              View portfolio →
            </button>
          </div>
          <div className="space-y-3">
            {actions.slice(0, 4).map((action) => (
              <button
                key={action.id || action.title}
                type="button"
                onClick={() => navigate(action.path)}
                className="w-full flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon name="ArrowRight" size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                </div>
                {action.pointsGain > 0 && (
                  <span className="text-xs font-semibold text-emerald-600 shrink-0">+{action.pointsGain}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialHealthCard;
