import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { mutualFundService } from '../../services/mutualFundService';
import { formatCurrency } from '../../utils/postOfficeFilters';

const DEFAULT_INPUTS = {
  investmentMode: 'sip',
  monthlyInvestment: '5000',
  lumpsumAmount: '100000',
  expectedReturn: '12',
  expenseRatio: '0.5',
  tenureYears: '10',
};

export default function MutualFundCalculatorPanel({ className = '' }) {
  const [inputs, setInputs] = useState({ ...DEFAULT_INPUTS });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mode = inputs.investmentMode;

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        investmentMode: inputs.investmentMode,
        monthlyInvestment: inputs.monthlyInvestment !== '' ? Number(inputs.monthlyInvestment) : undefined,
        lumpsumAmount: inputs.lumpsumAmount !== '' ? Number(inputs.lumpsumAmount) : undefined,
        expectedReturn: inputs.expectedReturn !== '' ? Number(inputs.expectedReturn) : undefined,
        expenseRatio: inputs.expenseRatio !== '' ? Number(inputs.expenseRatio) : undefined,
        tenureYears: inputs.tenureYears !== '' ? Number(inputs.tenureYears) : undefined,
      };
      const data = await mutualFundService.calculate(payload);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Calculation failed');
      setResult(null);
    }
    setLoading(false);
  };

  return (
    <section className={`rounded-2xl border border-border bg-card shadow-sm overflow-hidden ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 md:p-5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon name="Calculator" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Mutual Fund Calculator</h2>
            <p className="text-sm text-muted-foreground">Estimate SIP or lumpsum returns before you invest</p>
          </div>
        </div>
        <div className="flex rounded-xl border border-border p-1 bg-background">
          {[
            { value: 'sip', label: 'SIP' },
            { value: 'lumpsum', label: 'Lumpsum' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setInputs((prev) => ({ ...prev, investmentMode: opt.value }))}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                mode === opt.value ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-5 space-y-4">
        {error ? (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {mode === 'sip' ? (
            <Input
              label="Monthly SIP (₹)"
              type="number"
              value={inputs.monthlyInvestment}
              onChange={(e) => setInputs((prev) => ({ ...prev, monthlyInvestment: e.target.value }))}
            />
          ) : (
            <Input
              label="Lumpsum amount (₹)"
              type="number"
              value={inputs.lumpsumAmount}
              onChange={(e) => setInputs((prev) => ({ ...prev, lumpsumAmount: e.target.value }))}
            />
          )}
          <Input
            label="Expected return (% p.a.)"
            type="number"
            value={inputs.expectedReturn}
            onChange={(e) => setInputs((prev) => ({ ...prev, expectedReturn: e.target.value }))}
          />
          <Input
            label="Expense ratio (% p.a.)"
            type="number"
            value={inputs.expenseRatio}
            onChange={(e) => setInputs((prev) => ({ ...prev, expenseRatio: e.target.value }))}
          />
          <Input
            label="Tenure (years)"
            type="number"
            value={inputs.tenureYears}
            onChange={(e) => setInputs((prev) => ({ ...prev, tenureYears: e.target.value }))}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleCalculate} loading={loading}>
            <Icon name="Calculator" size={16} className="mr-1" />
            Calculate returns
          </Button>
        </div>

        {result ? (
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <p className="text-sm text-muted-foreground">{result.summary}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-card border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">Future value</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(result.futureValue)}</p>
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
            <p className="text-xs text-muted-foreground">
              Illustrative estimate only. Mutual fund returns are market-linked and not guaranteed.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
