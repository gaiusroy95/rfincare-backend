import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const ConversionFunnelTab = () => {
  const [days, setDays] = useState(30);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingProductKey, setDownloadingProductKey] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data: result, error: err } = await adminService.getFunnelAnalytics({
      days,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    if (err) {
      setError(err.message);
      setData(null);
    } else {
      setData(result);
    }
    setLoading(false);
  }, [days, dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDownloadProduct = async (bucket) => {
    if (!bucket?.productKey) return;
    setDownloadingProductKey(bucket.productKey);
    try {
      const blob = await adminService.downloadFunnelProductCsv({
        productKey: bucket.productKey,
        days,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${bucket.productKey}-conversion-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not download product conversion file');
    } finally {
      setDownloadingProductKey('');
    }
  };

  const totals = data?.totals || {};
  const rates = data?.conversionRates || {};
  const productBuckets = data?.productBuckets || [];
  const nonZeroBuckets = useMemo(
    () => productBuckets.filter((b) => b.leadsCreated > 0 || b.conversions > 0),
    [productBuckets],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Conversion funnel</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Product buckets with lead creator, converter and payout mapping.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <Button key={d} size="sm" variant={days === d ? 'default' : 'outline'} onClick={() => setDays(d)}>
              {d}d
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <Icon name="RefreshCw" size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">From date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">To date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Window: <span className="font-medium text-foreground">{data?.windowLabel || `Last ${days} days`}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={load}>Apply</Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setDateFrom('');
              setDateTo('');
              setTimeout(() => load(), 0);
            }}
          >
            Reset
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

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Product buckets</h3>
              <p className="text-xs text-muted-foreground">
                Excel/CSV download available at each product row
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[980px]">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-2 pr-4">Product</th>
                    <th className="pb-2 pr-4">Leads</th>
                    <th className="pb-2 pr-4">Conversions</th>
                    <th className="pb-2 pr-4">Created by agent</th>
                    <th className="pb-2 pr-4">Created by employee</th>
                    <th className="pb-2 pr-4">Converted by agent</th>
                    <th className="pb-2 pr-4">Converted by employee</th>
                    <th className="pb-2 pr-4">Payout mapped</th>
                    <th className="pb-2">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {nonZeroBuckets.map((bucket) => (
                    <tr key={bucket.productKey} className="border-b border-border/60">
                      <td className="py-2 pr-4 font-medium">{bucket.productLabel}</td>
                      <td className="py-2 pr-4">{bucket.leadsCreated.toLocaleString('en-IN')}</td>
                      <td className="py-2 pr-4">{bucket.conversions.toLocaleString('en-IN')}</td>
                      <td className="py-2 pr-4">{bucket.createdByAgent.toLocaleString('en-IN')}</td>
                      <td className="py-2 pr-4">{bucket.createdByEmployee.toLocaleString('en-IN')}</td>
                      <td className="py-2 pr-4">{bucket.convertedByAgent.toLocaleString('en-IN')}</td>
                      <td className="py-2 pr-4">{bucket.convertedByEmployee.toLocaleString('en-IN')}</td>
                      <td className="py-2 pr-4">₹{Number(bucket.payoutAmount || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2">
                        <Button
                          size="xs"
                          variant="outline"
                          iconName="Download"
                          loading={downloadingProductKey === bucket.productKey}
                          onClick={() => handleDownloadProduct(bucket)}
                        >
                          Export
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!nonZeroBuckets.length && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-muted-foreground">
                        No conversion data found for selected date range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConversionFunnelTab;
