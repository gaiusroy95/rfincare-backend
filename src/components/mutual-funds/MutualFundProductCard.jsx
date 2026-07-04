import React from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import { resolveBankLogoUrl } from '../../utils/bankBranding';
import { getFundCategoryDisplay, getRiskLabel } from '../../constants/mutualFundMarketplace';
import {
  formatPercent,
  formatExpenseRatio,
  formatAum,
  formatMinInvestment,
  getRiskDotLevel,
} from '../../utils/mutualFundFilters';

function RiskDots({ riskSlug }) {
  const level = getRiskDotLevel(riskSlug);
  const isHigh = level >= 4;
  return (
    <div className="flex items-center gap-1 mt-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <span
          key={dot}
          className={`w-2 h-2 rounded-full ${
            dot <= level
              ? isHigh
                ? 'bg-red-500'
                : dot <= 2
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

const MutualFundProductCard = ({
  fund,
  selected = false,
  onToggleCompare,
  onInvest,
  onViewDetails,
}) => {
  const logo = resolveBankLogoUrl(fund?.logoUrl);
  const categoryLabel = getFundCategoryDisplay(fund);
  const rating = fund?.rating != null ? Number(fund.rating).toFixed(1) : null;

  return (
    <article className="rf-mf-fund-card">
      <div className="rf-mf-fund-card-inner">
        {/* Logo */}
        <div className="rf-mf-fund-logo">
          {logo ? (
            <img src={logo} alt={fund.amcName || ''} className="w-12 h-12 object-contain" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <Icon name="TrendingUp" size={24} className="text-[var(--color-brand-green)]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="rf-mf-fund-info">
          <h3 className="rf-mf-fund-name">{fund.name}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="rf-mf-fund-category">{categoryLabel}</span>
            {rating ? (
              <span className="rf-mf-fund-rating">
                <Icon name="Star" size={14} className="text-amber-500 fill-amber-500" />
                {rating}
              </span>
            ) : null}
          </div>
          {(fund.description || fund.highlights) ? (
            <p className="rf-mf-fund-desc">{fund.description || fund.highlights}</p>
          ) : null}
        </div>

        {/* Metrics */}
        <div className="rf-mf-fund-metrics">
          <div className="rf-mf-fund-metric">
            <span className="rf-mf-fund-metric-label">3Y Returns</span>
            <span className="rf-mf-fund-metric-value rf-mf-fund-metric-value--green">
              {formatPercent(fund.returns3y)}
            </span>
          </div>
          <div className="rf-mf-fund-metric">
            <span className="rf-mf-fund-metric-label">Min. Investment</span>
            <span className="rf-mf-fund-metric-value">{formatMinInvestment(fund)}</span>
          </div>
          <div className="rf-mf-fund-metric">
            <span className="rf-mf-fund-metric-label">Risk Level</span>
            <span className="rf-mf-fund-metric-value text-sm">
              {fund.riskLevel ? getRiskLabel(fund.riskLevel) : '—'}
            </span>
            {fund.riskLevel ? <RiskDots riskSlug={fund.riskLevel} /> : null}
          </div>
          <div className="rf-mf-fund-metric">
            <span className="rf-mf-fund-metric-label">Fund Size</span>
            <span className="rf-mf-fund-metric-value">{formatAum(fund.aumCrores)}</span>
          </div>
          <div className="rf-mf-fund-metric">
            <span className="rf-mf-fund-metric-label">Expense Ratio</span>
            <span className="rf-mf-fund-metric-value">{formatExpenseRatio(fund.expenseRatio)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="rf-mf-fund-actions">
          <Button className="rf-btn-primary w-full" size="sm" onClick={() => onInvest?.(fund)}>
            Invest Now
          </Button>
          <Button
            variant="outline"
            className="rf-btn-outline-green w-full"
            size="sm"
            onClick={() => onViewDetails?.(fund)}
          >
            View Details
          </Button>
          <label className="rf-mf-fund-compare">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleCompare?.(fund.id)}
              className="rf-mf-fund-compare-input"
            />
            <span>Compare</span>
          </label>
        </div>
      </div>
    </article>
  );
};

export default MutualFundProductCard;
