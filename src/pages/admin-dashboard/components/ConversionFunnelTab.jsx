import React, { useCallback, useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { adminService } from '../../../services/adminService';

function FunnelStageBar({ stage, maxCount }) {
  const pct = maxCount > 0 ? Math.round((stage.count / maxCount) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{stage.label}</span>
        <span className="text-muted-foreground">{stage.count.toLocaleString('en-IN')}</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const ConversionFunnelTab = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data: result, error: err } = await adminService.getFunnelAnalytics(days);
    if (err) {
      setError(err.message);
      setData(null);
    } else {
      setData(result);
    }
    setLoading(false);
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = data?.totals || {};
  const rates = data?.conversionRates || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Conversion funnel</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Marketplace leads, loan applications, insurance checkout and SIP orders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <Button
              key={d}
              size="sm"
              variant={days === d ? 'default' : 'outline'}
              onClick={() => setDays(d)}
            >
              {d}d
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <Icon name="RefreshCw" size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="text-center py-16 text-muted-foreground">Loading funnel analytics…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Leads', value: totals.leads, icon: 'UserCheck' },
              { label: 'Loan apps', value: totals.loanApplications, icon: 'FileText' },
              { label: 'Insurance checkout', value: totals.insuranceCheckouts, icon: 'Shield' },
              { label: 'Insurance paid', value: totals.insurancePaid, icon: 'CheckCircle2' },
              { label: 'SIP orders', value: totals.sipOrders, icon: 'TrendingUp' },
            ].map((item) => (
              <div key={item.label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Icon name={item.icon} size={16} />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <p className="text-2xl font-bold">{(item.value ?? 0).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Lead → profile', value: `${rates.leadToProfile ?? 0}%` },
              { label: 'Loan approval rate', value: `${rates.loanApproval ?? 0}%` },
              { label: 'Insurance payment rate', value: `${rates.insurancePayment ?? 0}%` },
            ].map((item) => (
              <div key={item.label} className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(data?.funnels || []).map((funnel) => {
              const maxCount = Math.max(...funnel.stages.map((s) => s.count), 1);
              return (
                <div key={funnel.id} className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold mb-4">{funnel.label}</h3>
                  <div className="space-y-4">
                    {funnel.stages.map((stage) => (
                      <FunnelStageBar key={stage.key} stage={stage} maxCount={maxCount} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {data?.productMix?.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-4">Product mix</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.productMix.map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <span className="font-bold">{item.count.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ConversionFunnelTab;
