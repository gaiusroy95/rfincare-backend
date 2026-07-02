import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../AppIcon';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { calculatorService } from '../../services/calculatorService';
import { getApiErrorMessage } from '../../lib/apiErrors';
import {
  coerceFieldValue,
  getFieldsForEngine,
  RESULT_HIGHLIGHT_KEYS,
} from '../../constants/calculatorFieldSchemas';

function formatInr(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value ?? '—');
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatResultValue(key, value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'object') return null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number' && /amount|emi|corpus|value|tax|worth|savings|pension|payout|invested|principal|deposit|premium|fee|duty|income|expense|sip|withdrawal/i.test(key)) {
    return formatInr(value);
  }
  if (typeof value === 'number' && /percent|rate|ratio|cagr/i.test(key)) return `${value}%`;
  return String(value);
}

function flattenResults(result, prefix = '') {
  if (!result || typeof result !== 'object') return [];
  const rows = [];
  for (const [key, value] of Object.entries(result)) {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      rows.push(...flattenResults(value, `${prefix}${label} — `));
    } else if (!Array.isArray(value)) {
      const formatted = formatResultValue(key, value);
      if (formatted != null) rows.push({ key, label: `${prefix}${label}`, value: formatted, raw: value });
    }
  }
  return rows;
}

const UniversalCalculator = ({ slug, title, description, engine, defaults = {} }) => {
  const fields = useMemo(() => getFieldsForEngine(engine), [engine]);
  const [form, setForm] = useState({});
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runCalculation = useCallback(async (formValues) => {
    setError('');
    setLoading(true);
    try {
      const payload = {};
      for (const field of fields) {
        const raw = formValues[field.key];
        if (raw === '' || raw == null) continue;
        payload[field.key] = coerceFieldValue(field, raw);
      }
      const data = await calculatorService.calculate(slug, payload);
      setOutput(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Calculation failed'));
      setOutput(null);
    } finally {
      setLoading(false);
    }
  }, [slug, fields]);

  useEffect(() => {
    if (!fields.length) return;
    const initial = { ...defaults };
    for (const field of fields) {
      if (initial[field.key] === undefined) {
        if (field.type === 'select' && field.options?.[0]) {
          initial[field.key] = field.options[0].value;
        } else {
          initial[field.key] = '';
        }
      } else if (field.type === 'select' && typeof initial[field.key] === 'boolean') {
        initial[field.key] = String(initial[field.key]);
      }
    }
    setForm(initial);
    runCalculation(initial);
  }, [slug, defaults, fields, runCalculation]);

  const result = output?.result;
  const highlights = useMemo(() => {
    if (!result) return [];
    return RESULT_HIGHLIGHT_KEYS.filter((k) => result[k] != null).map((k) => ({
      key: k,
      label: k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
      value: formatResultValue(k, result[k]),
    }));
  }, [result]);

  const detailRows = useMemo(() => flattenResults(result).filter((r) => !RESULT_HIGHLIGHT_KEYS.includes(r.key)), [result]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">{title || 'Calculator'}</h2>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>

        {fields.map((field) => {
          if (field.type === 'select') {
            return (
              <Select
                key={field.key}
                label={field.label}
                value={String(form[field.key] ?? '')}
                onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                options={field.options}
              />
            );
          }
          return (
            <Input
              key={field.key}
              label={field.label}
              type="number"
              min={field.min}
              step={field.step}
              value={form[field.key] ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
            />
          );
        })}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="button" onClick={() => runCalculation(form)} disabled={loading} className="w-full sm:w-auto">
          <Icon name="Calculator" size={16} className="mr-2" />
          {loading ? 'Calculating…' : 'Calculate'}
        </Button>
      </div>

      <div className="space-y-4">
        {result?.summary && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
            <p className="text-sm font-medium text-primary flex items-start gap-2">
              <Icon name="Info" size={18} className="shrink-0 mt-0.5" />
              {result.summary}
            </p>
          </div>
        )}

        {highlights.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {highlights.map((h) => (
              <div key={h.key} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{h.label}</p>
                <p className="text-xl font-bold text-foreground mt-1">{h.value}</p>
              </div>
            ))}
          </div>
        )}

        {detailRows.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-sm">Detailed breakdown</h3>
            </div>
            <dl className="divide-y divide-border">
              {detailRows.map((row) => (
                <div key={row.key + row.label} className="flex justify-between gap-4 px-5 py-3 text-sm">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="font-medium text-foreground text-right">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Enter values and click Calculate to see results.
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalCalculator;
