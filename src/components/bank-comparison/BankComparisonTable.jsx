import React from 'react';
import Icon from '../AppIcon';
import Image from '../AppImage';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { applyComparisonOverrides } from '../../utils/bankMarketplace';

const BankComparisonTable = ({
  banks,
  rawBanks = [],
  comparisonOverrides = {},
  onComparisonChange,
  onApply,
  editable = false,
}) => {
  if (!banks?.length) return null;

  const sourceById = Object.fromEntries((rawBanks.length ? rawBanks : banks).map((b) => [b.id, b]));
  const bankIds = banks.map((b) => b.id);

  const getFieldValues = (bankId) => {
    const base = sourceById[bankId] || {};
    const o = comparisonOverrides[bankId] || {};
    return {
      interestRate: o.interestRate ?? base.interestRate ?? '',
      processingFee: o.processingFee ?? base.processingFee ?? '',
      otherCharges: o.otherCharges ?? base.otherCharges ?? '',
      featuresText: o.featuresText ?? (base.features || []).join('\n'),
    };
  };

  const displayBank = (bankId) => {
    const base = sourceById[bankId];
    if (!base) return banks.find((b) => b.id === bankId);
    return applyComparisonOverrides(base, {
      ...comparisonOverrides[bankId],
      features:
        comparisonOverrides[bankId]?.features ||
        (comparisonOverrides[bankId]?.featuresText
          ? comparisonOverrides[bankId].featuresText
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean)
          : base.features),
    });
  };

  const staticRows = [
    { label: 'Approval match', render: (bank) => `${bank?.probability ?? '—'}%` },
    { label: 'Max loan amount', render: (bank) => bank?.maxAmount },
    { label: 'Max tenure', render: (bank) => bank?.maxTenure },
    { label: 'Rating', render: (bank) => bank?.rating },
  ];

  const renderCell = (bankId, field, display) => {
    if (!editable || !onComparisonChange) {
      return <span className="text-sm text-foreground">{display}</span>;
    }
    const values = getFieldValues(bankId);
    if (field === 'interestRate') {
      return (
        <Input
          type="number"
          step="0.01"
          value={values.interestRate}
          onChange={(e) =>
            onComparisonChange(bankId, {
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
          onChange={(e) => onComparisonChange(bankId, { processingFee: e.target.value })}
        />
      );
    }
    if (field === 'otherCharges') {
      return (
        <Input
          value={values.otherCharges}
          onChange={(e) => onComparisonChange(bankId, { otherCharges: e.target.value })}
        />
      );
    }
    if (field === 'features') {
      return (
        <>
          <textarea
            className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs md:text-sm"
            value={values.featuresText}
            onChange={(e) => onComparisonChange(bankId, { featuresText: e.target.value })}
            placeholder="One feature per line"
          />
          <ul className="mt-2 space-y-1 text-left">
            {(displayBank(bankId)?.features || []).slice(0, 4).map((f) => (
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

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr>
            <th className="text-left p-3 bg-muted rounded-tl-lg w-36 md:w-44 sticky left-0 z-10">
              <span className="text-sm font-semibold text-foreground">Compare</span>
            </th>
            {bankIds.map((bankId) => {
              const bank = displayBank(bankId);
              return (
                <th key={bankId} className="p-3 bg-muted align-top min-w-[120px] max-w-[160px]">
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
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border bg-primary/5">
            <td className="p-3 text-xs md:text-sm font-semibold sticky left-0 bg-primary/5 z-10">
              Interest rate (% p.a.)
            </td>
            {bankIds.map((bankId) => (
              <td key={bankId} className="p-3 align-top">
                {editable
                  ? renderCell(bankId, 'interestRate')
                  : renderCell(bankId, 'interestRate', getFieldValues(bankId).interestRate)}
              </td>
            ))}
          </tr>
          <tr className="border-b border-border">
            <td className="p-3 text-xs md:text-sm font-semibold sticky left-0 bg-card z-10">
              Processing fee
            </td>
            {bankIds.map((bankId) => (
              <td key={bankId} className="p-3 align-top">
                {editable
                  ? renderCell(bankId, 'processingFee')
                  : renderCell(bankId, 'processingFee', displayBank(bankId)?.processingFee)}
              </td>
            ))}
          </tr>
          <tr className="border-b border-border bg-muted/30">
            <td className="p-3 text-xs md:text-sm font-semibold sticky left-0 bg-muted/30 z-10">
              Other charges
            </td>
            {bankIds.map((bankId) => (
              <td key={bankId} className="p-3 align-top">
                {editable
                  ? renderCell(bankId, 'otherCharges')
                  : renderCell(bankId, 'otherCharges', displayBank(bankId)?.otherCharges)}
              </td>
            ))}
          </tr>
          <tr className="border-b border-border">
            <td className="p-3 text-xs md:text-sm font-semibold align-top sticky left-0 bg-card z-10">
              Key features
            </td>
            {bankIds.map((bankId) => (
              <td key={bankId} className="p-3 align-top">
                {editable ? (
                  renderCell(bankId, 'features')
                ) : (
                  <ul className="space-y-1 text-left">
                    {(displayBank(bankId)?.features || []).slice(0, 5).map((f) => (
                      <li key={f} className="text-xs text-muted-foreground flex gap-1">
                        <Icon name="Check" size={12} className="text-success mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </td>
            ))}
          </tr>
          {staticRows.map((row, index) => (
            <tr
              key={row.label}
              className={`border-b border-border ${index % 2 === 0 ? 'bg-muted/15' : ''}`}
            >
              <td className="p-3 text-xs md:text-sm font-semibold sticky left-0 bg-inherit z-10">
                {row.label}
              </td>
              {bankIds.map((bankId) => (
                <td key={bankId} className="p-3 text-center text-sm">
                  {row.render(displayBank(bankId))}
                </td>
              ))}
            </tr>
          ))}
          {onApply && (
            <tr>
              <td className="p-3 sticky left-0 bg-card z-10" />
              {bankIds.map((bankId) => (
                <td key={bankId} className="p-3">
                  <Button
                    variant="default"
                    size="sm"
                    fullWidth
                    onClick={() => onApply(displayBank(bankId))}
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
