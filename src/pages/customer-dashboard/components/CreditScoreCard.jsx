import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BAND_META = {
  excellent: { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  good: { label: 'Good', color: 'text-primary', bg: 'bg-primary/5 border-primary/20' },
  fair: { label: 'Fair', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  needs_improvement: { label: 'Needs improvement', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  unknown: { label: 'Not available', color: 'text-muted-foreground', bg: 'bg-muted border-border' },
};

function scoreArcColor(score) {
  if (score >= 750) return 'text-emerald-500';
  if (score >= 700) return 'text-primary';
  if (score >= 650) return 'text-amber-500';
  return 'text-orange-500';
}

const CreditScoreCard = ({
  creditProfile,
  loading,
  pulling,
  pullError,
  onImprove,
  onPullScore,
}) => {
  if (loading) {
    return <div className="bg-card border border-border rounded-2xl p-6 animate-pulse h-40" />;
  }

  const score = creditProfile?.score ?? null;
  const band = creditProfile?.band || 'unknown';
  const meta = BAND_META[band] || BAND_META.unknown;
  const sourceLabel = creditProfile?.source === 'bureau'
    ? `Bureau pull${creditProfile?.bureauVendor ? ` · ${creditProfile.bureauVendor}` : ''}`
    : creditProfile?.source === 'self_reported'
      ? 'Estimated from your application'
      : 'Request a bureau check to see your score';

  const arcPct = score != null ? Math.min(100, Math.max(0, ((score - 300) / 600) * 100)) : 0;
  const showSandbox = creditProfile?.sandboxMode || creditProfile?.pullSandbox;

  return (
    <div className={`border rounded-2xl overflow-hidden ${meta.bg}`}>
      <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-28 h-28 shrink-0">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
            {score != null && (
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(arcPct / 100) * 264} 264`}
                className={scoreArcColor(score)}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${score != null ? scoreArcColor(score) : 'text-muted-foreground'}`}>
              {score ?? '—'}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase">CIBIL</span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <Icon name="Gauge" size={18} className={meta.color} />
            <p className="text-sm font-semibold text-foreground">Credit score</p>
            {showSandbox && (
              <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Sandbox
              </span>
            )}
          </div>
          <p className={`text-lg font-bold mt-1 ${meta.color}`}>{meta.label}</p>
          <p className="text-xs text-muted-foreground mt-2">{sourceLabel}</p>
          {creditProfile?.selfReportedRange && !creditProfile?.hasBureauPull && (
            <p className="text-xs text-muted-foreground mt-1">
              Self-reported range: {creditProfile.selfReportedRange}
            </p>
          )}
          {pullError && (
            <p className="text-xs text-destructive mt-2">{pullError}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
            {onPullScore && (
              <Button size="sm" onClick={onPullScore} disabled={pulling}>
                {pulling ? 'Checking…' : score == null ? 'Check my score' : 'Refresh score'}
              </Button>
            )}
            {score != null && score < 700 && onImprove && (
              <Button size="sm" variant="outline" onClick={onImprove}>
                Tips to improve
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditScoreCard;
