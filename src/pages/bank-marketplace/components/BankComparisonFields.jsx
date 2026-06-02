import React from 'react';
import Input from '../../../components/ui/Input';

const BankComparisonFields = ({ bankId, values, onChange, compact = false }) => {
  const handle = (field) => (e) => {
    const raw = e?.target?.value;
    onChange(bankId, {
      [field]: field === 'interestRate' ? (raw === '' ? '' : Number(raw)) : raw,
    });
  };

  return (
    <div
      className={`rounded-lg border border-primary/20 bg-primary/5 mb-4 md:mb-6 ${
        compact ? 'p-3 space-y-2' : 'p-3 md:p-4 space-y-3'
      }`}
    >
      <p className="text-xs font-semibold text-foreground">Adjust for comparison</p>
      <div className={compact ? 'space-y-2' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}>
        <Input
          label="Interest rate (% p.a.)"
          type="number"
          step="0.01"
          min="0"
          value={values?.interestRate ?? ''}
          onChange={handle('interestRate')}
        />
        <Input
          label="Processing fee"
          placeholder="e.g. 1% + GST"
          value={values?.processingFee ?? ''}
          onChange={handle('processingFee')}
        />
        <Input
          label="Other charges"
          placeholder="e.g. Legal fee, stamp duty"
          value={values?.otherCharges ?? ''}
          onChange={handle('otherCharges')}
          className={compact ? '' : 'sm:col-span-2'}
        />
        <div className={compact ? '' : 'sm:col-span-2'}>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Key features (one per line)
          </label>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={values?.featuresText ?? ''}
            onChange={(e) => onChange(bankId, { featuresText: e.target.value })}
            placeholder={'Quick disbursal\nNo collateral\nFlexible tenure'}
          />
        </div>
      </div>
    </div>
  );
};

export default BankComparisonFields;
