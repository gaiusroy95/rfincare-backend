import React from 'react';
import Icon from '../../../components/AppIcon';

const RateHeatmap = ({ matrixData }) => {
  const creditScoreRanges = [
    { min: 300, max: 579, label: '300-579' },
    { min: 580, max: 669, label: '580-669' },
    { min: 670, max: 739, label: '670-739' },
    { min: 740, max: 799, label: '740-799' },
    { min: 800, max: 900, label: '800-900' }
  ];

  const loanAmountRanges = [
    { min: 0, max: 25000, label: '₹0-₹25K' },
    { min: 25001, max: 50000, label: '₹25K-₹50K' },
    { min: 50001, max: 100000, label: '₹50K-₹100K' },
    { min: 100001, max: 250000, label: '₹100K-₹250K' },
    { min: 250001, max: 1000000, label: '₹250K+' }
  ];

  const getAverageRate = (creditRange, loanRange) => {
    const matchingRates = matrixData?.filter(item => {
      const creditMatch = item?.creditScoreMin <= creditRange?.max && item?.creditScoreMax >= creditRange?.min;
      const loanMatch = item?.loanAmountMin <= loanRange?.max && item?.loanAmountMax >= loanRange?.min;
      return creditMatch && loanMatch && item?.status === 'active';
    });

    if (matchingRates?.length === 0) return null;

    const avgRate = matchingRates?.reduce((sum, item) => sum + parseFloat(item?.interestRate), 0) / matchingRates?.length;
    return avgRate;
  };

  const getHeatmapColor = (rate) => {
    if (!rate) return 'bg-muted';
    if (rate < 5) return 'bg-success/80';
    if (rate < 6) return 'bg-success/60';
    if (rate < 7) return 'bg-warning/60';
    if (rate < 8) return 'bg-warning/80';
    if (rate < 9) return 'bg-destructive/60';
    return 'bg-destructive/80';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Grid3x3" size={20} color="var(--color-primary)" />
          Rate Distribution Heatmap
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Low</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-success/80"></div>
            <div className="w-4 h-4 rounded bg-warning/60"></div>
            <div className="w-4 h-4 rounded bg-destructive/80"></div>
          </div>
          <span className="text-muted-foreground">High</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-6 gap-2">
            <div className="text-xs font-semibold text-muted-foreground p-2"></div>
            {loanAmountRanges?.map((range) => (
              <div key={range?.label} className="text-xs font-semibold text-center text-muted-foreground p-2">
                {range?.label}
              </div>
            ))}

            {creditScoreRanges?.map((creditRange) => (
              <React.Fragment key={creditRange?.label}>
                <div className="text-xs font-semibold text-muted-foreground p-2 flex items-center">
                  {creditRange?.label}
                </div>
                {loanAmountRanges?.map((loanRange) => {
                  const rate = getAverageRate(creditRange, loanRange);
                  return (
                    <div
                      key={`${creditRange?.label}-${loanRange?.label}`}
                      className={`${getHeatmapColor(rate)} rounded-lg p-3 flex items-center justify-center transition-all hover:scale-105 cursor-pointer`}
                      title={rate ? `Average Rate: ${rate?.toFixed(2)}%` : 'No data'}
                    >
                      <span className="text-xs font-bold text-white">
                        {rate ? `${rate?.toFixed(2)}%` : '-'}
                      </span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <Icon name="Info" size={14} className="inline mr-1" />
          Heatmap shows average interest rates across credit score and loan amount ranges. Darker colors indicate higher rates.
        </p>
      </div>
    </div>
  );
};

export default RateHeatmap;