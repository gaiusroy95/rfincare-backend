import React from 'react';
import Icon from '../AppIcon';
import Image from '../AppImage';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { applyComparisonOverrides, getMarketplaceCompareKey } from '../../utils/bankMarketplace';
import { PRODUCT_COMPARISON_ROWS } from '../../constants/bankProductComparisonFields';

const BankComparisonTable = ({
  banks,
  rawBanks = [],
  comparisonOverrides = {},
  onComparisonChange,
  onApply,
  editable = false,
}) => {
  if (!banks?.length) return null;

  const sourceList = rawBanks.length ? rawBanks : banks;
  const sourceByKey = Object.fromEntries(
    sourceList.map((b) => [getMarketplaceCompareKey(b), b]),
  );
  const compareKeys = banks.map((b) => getMarketplaceCompareKey(b));

  const getFieldValues = (compareKey) => {
    const base = sourceByKey[compareKey] || {};
    const o = comparisonOverrides[compareKey] || comparisonOverrides[base.id] || {};
    return {
      interestRate: o.interestRate ?? base.interestRate ?? '',
      processingFee: o.processingFee ?? base.processingFee ?? '',
      otherCharges: o.otherCharges ?? base.otherCharges ?? '',
      featuresText: o.featuresText ?? (base.features || []).join('\n'),
    };
  };

  const displayBank = (compareKey) => {
    const base = sourceByKey[compareKey];
    if (!base) return banks.find((b) => getMarketplaceCompareKey(b) === compareKey);
    return applyComparisonOverrides(base, {
      ...(comparisonOverrides[compareKey] || comparisonOverrides[base.id] || {}),
      features:
        comparisonOverrides[compareKey]?.features ||
        comparisonOverrides[base.id]?.features ||
        (comparisonOverrides[compareKey]?.featuresText ||
        comparisonOverrides[base.id]?.featuresText
          ? (comparisonOverrides[compareKey]?.featuresText ||
              comparisonOverrides[base.id]?.featuresText)
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean)
          : base.features),
    });
  };

  const renderListCell = (items, limit = 5) => {
    const list = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!list.length) {
      return <span className="text-xs text-muted-foreground">—</span>;
    }
    return (
      <ul className="space-y-1 text-left">
        {list.slice(0, limit).map((item) => (
          <li key={item} className="text-xs text-muted-foreground flex gap-1">
            <Icon name="Check" size={12} className="text-success mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    );
  };

  const renderCellValue = (bank, row) => {
    if (row.type === 'static') {
      if (row.key === 'probability') return `${bank?.probability ?? '—'}%`;
      if (row.key === 'rating') return bank?.rating ?? '—';
    }
    if (row.type === 'list') {
      return renderListCell(bank?.[row.key]);
    }
    if (row.type === 'rate') {
      const min = bank?.interestRateMin ?? bank?.interestRate;
      const max = bank?.interestRateMax ?? bank?.interestRate;
      if (min != null && max != null && min !== max) {
        return `${min}% – ${max}%`;
      }
      return bank?.interestRate != null ? `${bank.interestRate}%` : '—';
    }
    return bank?.[row.key] || '—';
  };

  const renderCell = (compareKey, field, display) => {
    if (!editable || !onComparisonChange) {
      return <span className="text-sm text-foreground">{display}</span>;
    }
    const values = getFieldValues(compareKey);
    if (field === 'interestRate') {
      return (
        <Input
          type="number"
          step="0.01"
          value={values.interestRate}
          onChange={(e) =>
            onComparisonChange(compareKey, {
              interestRate: e.target.value === '' ? '' : Number(e.target.value),
            })
          }
        />
      );
    }
    if (field === 'processingFee') {
      return (
        <Input
          value={values.processingFee}
          onChange={(e) => onComparisonChange(compareKey, { processingFee: e.target.value })}
        />
      );
    }
    if (field === 'otherCharges') {
      return (
        <Input
          value={values.otherCharges}
          onChange={(e) => onComparisonChange(compareKey, { otherCharges: e.target.value })}
        />
      );
    }
    if (field === 'features') {
      return (
        <>
          <textarea
            className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs md:text-sm"
            value={values.featuresText}
            onChange={(e) => onComparisonChange(compareKey, { featuresText: e.target.value })}
            placeholder="One feature per line"
          />
          <ul className="mt-2 space-y-1 text-left">
            {(displayBank(compareKey)?.features || []).slice(0, 4).map((f) => (
              <li key={f} className="text-xs text-muted-foreground flex gap-1">
                <Icon name="Check" size={12} className="text-success mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </>
      );
    }
    return null;
  };

  const editableRows = new Set(['interestRate', 'processingFee', 'otherCharges', 'features']);

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr>
            <th className="text-left p-3 bg-muted rounded-tl-lg w-36 md:w-44 sticky left-0 z-10">
              <span className="text-sm font-semibold text-foreground">Compare</span>
            </th>
            {compareKeys.map((compareKey) => {
              const bank = displayBank(compareKey);
              return (
                <th key={compareKey} className="p-3 bg-muted align-top min-w-[120px] max-w-[180px]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden bg-background border border-border">
                      <Image
                        src={bank?.logo}
                        alt={bank?.logoAlt}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <span className="text-xs md:text-sm font-semibold text-foreground text-center leading-tight">
                      {bank?.name}
                    </span>
                    {bank?.productName && bank.productName !== bank?.name && (
                      <span className="text-[10px] md:text-xs text-primary text-center leading-tight line-clamp-2">
                        {bank.productName}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {PRODUCT_COMPARISON_ROWS.map((row, index) => (
            <tr
              key={row.key}
              className={`border-b border-border ${index % 2 === 0 ? 'bg-muted/15' : ''}`}
            >
              <td className="p-3 text-xs md:text-sm font-semibold sticky left-0 bg-inherit z-10">
                {row.label}
              </td>
              {compareKeys.map((compareKey) => {
                const bank = displayBank(compareKey);
                const display = renderCellValue(bank, row);
                return (
                  <td key={compareKey} className="p-3 align-top text-sm">
                    {editable && editableRows.has(row.key)
                      ? renderCell(compareKey, row.key, display)
                      : row.type === 'list'
                        ? renderListCell(bank?.[row.key])
                        : (
                          <span className="text-sm text-foreground">{display}</span>
                        )}
                  </td>
                );
              })}
            </tr>
          ))}
          {onApply && (
            <tr>
              <td className="p-3 sticky left-0 bg-card z-10" />
              {compareKeys.map((compareKey) => (
                <td key={compareKey} className="p-3">
                  <Button
                    variant="default"
                    size="sm"
                    fullWidth
                    onClick={() => onApply(displayBank(compareKey))}
                    iconName="ArrowRight"
                    iconPosition="right"
                  >
                    Apply
                  </Button>
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BankComparisonTable;
