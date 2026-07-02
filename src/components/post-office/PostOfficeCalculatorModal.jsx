import React, { useEffect, useMemo, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Icon from '../AppIcon';
import { postOfficeService } from '../../services/postOfficeService';
import { formatCurrency } from '../../utils/postOfficeFilters';
import { POST_OFFICE_CATEGORIES } from '../../constants/postOfficeMarketplace';

const DEFAULT_INPUTS = {
  calculatorType: 'time_deposit',
  principal: '100000',
  monthlyDeposit: '',
  annualDeposit: '',
  annualRate: '7.1',
  tenureYears: '5',
};

function getDefaultInputs(product) {
  if (!product) return { ...DEFAULT_INPUTS };
  const type = product.calculatorType || product.categories?.[0] || 'time_deposit';
  return {
    calculatorType: type,
    principal: product.minDepositAmount != null ? String(product.minDepositAmount) : '100000',
    monthlyDeposit: type === 'recurring_deposit' ? String(product.minDepositAmount ?? 1000) : '',
    annualDeposit: (type === 'ppf' || type === 'sukanya_samriddhi') ? String(product.minDepositAmount ?? 150000) : '',
    annualRate: product.interestRate != null ? String(product.interestRate) : '7.1',
    tenureYears: product.tenureMaxMonths
      ? String(Math.round(Number(product.tenureMaxMonths) / 12))
      : product.tenureMinMonths
        ? String(Math.round(Number(product.tenureMinMonths) / 12))
        : '5',
  };
}

export default function PostOfficeCalculatorModal({ open, onClose, product }) {
  const [inputs, setInputs] = useState(() => getDefaultInputs(product));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculatorOptions = useMemo(
    () => POST_OFFICE_CATEGORIES.map((c) => ({ value: c.slug, label: c.label })),
    [],
  );

  const type = inputs.calculatorType;

  useEffect(() => {
    if (!open) return;
    setInputs(getDefaultInputs(product));
    setResult(null);
    setError('');
  }, [open, product]);

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        calculatorType: inputs.calculatorType,
        principal: inputs.principal !== '' ? Number(inputs.principal) : undefined,
        monthlyDeposit: inputs.monthlyDeposit !== '' ? Number(inputs.monthlyDeposit) : undefined,
        annualDeposit: inputs.annualDeposit !== '' ? Number(inputs.annualDeposit) : undefined,
        annualRate: inputs.annualRate !== '' ? Number(inputs.annualRate) : undefined,
        tenureYears: inputs.tenureYears !== '' ? Number(inputs.tenureYears) : undefined,
      };
      const data = await postOfficeService.calculate(payload);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Calculation failed');
      setResult(null);
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
      <div className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-xl mt-8 mb-8">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="text-xl font-bold">Post Office Calculator</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {product?.name ? `Estimate returns for ${product.name}` : 'Estimate maturity value and returns'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error ? (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
          ) : null}

          <Select
            label="Scheme type"
            value={inputs.calculatorType}
            onChange={(v) => setInputs((prev) => ({ ...prev, calculatorType: v }))}
            options={calculatorOptions}
          />

          {(type === 'ppf' || type === 'sukanya_samriddhi') ? (
            <Input
              label="Annual deposit (₹)"
              type="number"
              value={inputs.annualDeposit}
              onChange={(e) => setInputs((prev) => ({ ...prev, annualDeposit: e.target.value }))}
            />
          ) : type === 'recurring_deposit' ? (
            <Input
              label="Monthly deposit (₹)"
              type="number"
              value={inputs.monthlyDeposit}
              onChange={(e) => setInputs((prev) => ({ ...prev, monthlyDeposit: e.target.value }))}
            />
          ) : (
            <Input
              label="Principal / lump sum (₹)"
              type="number"
              value={inputs.principal}
              onChange={(e) => setInputs((prev) => ({ ...prev, principal: e.target.value }))}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Interest rate (% p.a.)"
              type="number"
              value={inputs.annualRate}
              onChange={(e) => setInputs((prev) => ({ ...prev, annualRate: e.target.value }))}
            />
            <Input
              label="Tenure (years)"
              type="number"
              value={inputs.tenureYears}
              onChange={(e) => setInputs((prev) => ({ ...prev, tenureYears: e.target.value }))}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={handleCalculate} loading={loading}>Calculate</Button>
          </div>

          {result ? (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-sm text-muted-foreground">{result.summary}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-card border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Maturity value</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(result.maturityValue)}</p>
                </div>
                <div className="rounded-lg bg-card border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total invested</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(result.totalInvested)}</p>
                </div>
                <div className="rounded-lg bg-card border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Returns</p>
                  <p className="text-lg font-bold text-emerald-700">{formatCurrency(result.returnsAmount)}</p>
                </div>
              </div>
              {result.monthlyIncome != null ? (
                <p className="text-sm font-medium text-foreground">
                  Estimated monthly income: {formatCurrency(result.monthlyIncome)}
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Tax treatment varies by scheme. PPF/SSY may qualify under Section 80C; interest on some schemes may be taxable. Consult a tax advisor.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
