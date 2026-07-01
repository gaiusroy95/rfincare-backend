import React, { useEffect, useState } from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';
import { bankService } from '../../../services/apiServices';
import {
  LOAN_PRIORITY_OPTIONS,
  getLoanPriorities,
  serializeLoanPriorities,
} from '../../../utils/loanPriorities';

const MAX_PRIORITIES = 2;
const MIN_PRIORITIES = 1;

const BankPreferencesStep = ({ formData, onChange, errors = {} }) => {
  const [banks, setBanks] = useState([]);
  const selected = getLoanPriorities(formData);

  useEffect(() => {
    bankService
      .getActiveBanks({ includeProducts: false })
      .then((data) => setBanks(Array.isArray(data) ? data : []))
      .catch(() => setBanks([]));
  }, []);

  const bankOptions = [
    { value: '', label: 'Select preferred bank (optional)' },
    ...banks.map((b) => ({ value: b.id, label: b.name })),
  ];

  const togglePriority = (id) => {
    let next;
    if (selected.includes(id)) {
      next = selected.filter((x) => x !== id);
    } else if (selected.length >= MAX_PRIORITIES) {
      return;
    } else {
      next = [...selected, id];
    }
    onChange('loanPriorities', next);
    onChange('loanPriority', serializeLoanPriorities(next));
  };

  const atMax = selected.length >= MAX_PRIORITIES;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Bank & loan preferences</h2>
        <p className="text-sm text-muted-foreground">
          Choose your preferred lender and what matters most for your loan.
        </p>
      </div>

      <Select
        label="Preferred bank to apply with"
        options={bankOptions}
        value={formData.preferredBankId || ''}
        onChange={(value) => {
          const bank = banks.find((b) => b.id === value);
          onChange('preferredBankId', value);
          onChange('preferredBankName', bank?.name || '');
        }}
        error={errors.preferredBankId}
      />

      {formData.preferredBankName && (
        <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
          <Icon name="Building2" size={18} className="text-primary" />
          <span>
            Applying with: <strong>{formData.preferredBankName}</strong>
          </span>
        </div>
      )}

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="text-sm font-semibold text-foreground">
            Your top priorities <span className="font-normal text-muted-foreground">(select {MIN_PRIORITIES}–{MAX_PRIORITIES})</span>
          </p>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              selected.length >= MIN_PRIORITIES
                ? 'bg-success/10 text-success'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {selected.length} / {MAX_PRIORITIES} selected
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LOAN_PRIORITY_OPTIONS.map((opt) => {
            const isSelected = selected.includes(opt.id);
            const isDisabled = !isSelected && atMax;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isDisabled}
                onClick={() => togglePriority(opt.id)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : isDisabled
                      ? 'border-border opacity-50 cursor-not-allowed'
                      : 'border-border hover:border-primary/40'
                }`}
                aria-pressed={isSelected}
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 shrink-0">
                    <Icon
                      name={isSelected ? 'CheckSquare' : 'Square'}
                      size={18}
                      className={isSelected ? 'text-primary' : 'text-muted-foreground'}
                    />
                    <Icon name={opt.icon} size={20} className="text-primary flex-shrink-0" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {atMax && (
          <p className="text-xs text-muted-foreground mt-2">
            Maximum {MAX_PRIORITIES} priorities selected. Deselect one to choose a different option.
          </p>
        )}
        {errors.loanPriority && (
          <p className="text-xs text-destructive mt-2">{errors.loanPriority}</p>
        )}
      </div>
    </div>
  );
};

export default BankPreferencesStep;
