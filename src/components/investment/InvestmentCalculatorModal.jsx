import React, { useEffect, useMemo, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Icon from '../AppIcon';
import { investmentProductService } from '../../services/investmentProductService';
import { INVESTMENT_CATEGORIES } from '../../constants/investmentMarketplace';
import { formatCurrency } from '../../utils/postOfficeFilters';

const DEFAULT_INPUTS = {
  calculatorType: 'sovereign_gold_bonds',
  investmentAmount: '100000',
  annualReturn: '8',
  couponRate: '7',
  tenureYears: '5',
  tenureMonths: '12',
};

function getDefaultInputs(product) {
  if (!product) return { ...DEFAULT_INPUTS };
  const type = product.categories?.[0] || 'lump_sum';
  return {
    calculatorType: type,
    investmentAmount: product.minInvestmentAmount != null ? String(product.minInvestmentAmount) : '100000',
    annualReturn: product.returns3y != null ? String(product.returns3y) : product.returns1y != null ? String(product.returns1y) : '8',
    couponRate: product.returns3y != null ? String(product.returns3y) : '7',
    tenureYears: '5',
    tenureMonths: '12',
  };
}

export default function InvestmentCalculatorModal({ open, onClose, product, onApply }) {
  const [inputs, setInputs] = useState(() => getDefaultInputs(product));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculatorOptions = useMemo(
    () => INVESTMENT_CATEGORIES.map((c) => ({ value: c.slug, label: c.label })),
    [],
  );

  const type = inputs.calculatorType;
  const isBond = ['bonds', 'corporate_bonds', 'rbi_floating_bonds', 'government_securities'].includes(type);
  const isTbill = type === 'treasury_bills';
  const isIncome = ['reit', 'invit'].includes(type);

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
        investmentAmount: inputs.investmentAmount !== '' ? Number(inputs.investmentAmount) : undefined,
        annualReturn: inputs.annualReturn !== '' ? Number(inputs.annualReturn) : undefined,
        couponRate: inputs.couponRate !== '' ? Number(inputs.couponRate) : undefined,
        tenureYears: !isTbill && inputs.tenureYears !== '' ? Number(inputs.tenureYears) : undefined,
        tenureMonths: isTbill && inputs.tenureMonths !== '' ? Number(inputs.tenureMonths) : undefined,
      };
      const data = await investmentProductService.calculate(payload);
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
            <h3 className="text-xl font-bold">Investment Calculator</h3>
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
            label="Investment type"
            value={inputs.calculatorType}
            onChange={(v) => setInputs((prev) => ({ ...prev, calculatorType: v }))}
            options={calculatorOptions}
          />

          <Input
            label="Investment amount (₹)"
            type="number"
            value={inputs.investmentAmount}
            onChange={(e) => setInputs((prev) => ({ ...prev, investmentAmount: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={isIncome ? 'Distribution yield (% p.a.)' : 'Expected return (% p.a.)'}
              type="number"
              value={inputs.annualReturn}
              onChange={(e) => setInputs((prev) => ({ ...prev, annualReturn: e.target.value }))}
            />
            {isBond ? (
              <Input
                label="Coupon rate (% p.a.)"
                type="number"
                value={inputs.couponRate}
                onChange={(e) => setInputs((prev) => ({ ...prev, couponRate: e.target.value }))}
              />
            ) : isTbill ? (
              <Input
                label="Tenure (months)"
                type="number"
                value={inputs.tenureMonths}
                onChange={(e) => setInputs((prev) => ({ ...prev, tenureMonths: e.target.value }))}
              />
            ) : (
              <Input
                label="Tenure (years)"
                type="number"
                value={inputs.tenureYears}
                onChange={(e) => setInputs((prev) => ({ ...prev, tenureYears: e.target.value }))}
              />
            )}
          </div>

          {!isTbill && isBond ? (
            <Input
              label="Tenure (years)"
              type="number"
              value={inputs.tenureYears}
              onChange={(e) => setInputs((prev) => ({ ...prev, tenureYears: e.target.value }))}
            />
          ) : null}

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={handleCalculate} loading={loading}>Calculate</Button>
          </div>

          {result ? (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-sm text-muted-foreground">{result.summary}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-card border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Maturity / future value</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(result.maturityValue)}</p>
                </div>
                <div className="rounded-lg bg-card border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total invested</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(result.totalInvested)}</p>
                </div>
                <div className="rounded-lg bg-card border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Estimated gains</p>
                  <p className="text-lg font-bold text-emerald-700">{formatCurrency(result.returnsAmount)}</p>
                </div>
              </div>
              {result.monthlyIncome != null ? (
                <p className="text-sm font-medium text-foreground">
                  Estimated monthly income: {formatCurrency(result.monthlyIncome)}
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Illustrative estimate only. Actual returns depend on market conditions, issuer performance, and taxes.
              </p>
              {product && onApply ? (
                <Button
                  className="w-full"
                  onClick={() => onApply(product, { inputs, result })}
                >
                  Apply for {product.name}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
