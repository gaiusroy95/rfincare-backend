import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { EXISTING_LOAN_TYPE_OPTIONS } from '../../../constants/existingLoanTypes';
import { createEmptyLoanRow } from '../../../utils/existingLoans';

const ExistingLoansForm = ({ existingLoans = [], errors = {}, onChange }) => {
  const rows = Array.isArray(existingLoans) && existingLoans.length
    ? existingLoans
    : [createEmptyLoanRow()];

  const updateRows = (nextRows) => {
    onChange('existingLoans', nextRows);
  };

  const updateRow = (rowId, patch) => {
    updateRows(rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)));
  };

  const removeRow = (rowId) => {
    if (rows.length <= 1) {
      updateRows([createEmptyLoanRow()]);
      return;
    }
    updateRows(rows.filter((row) => row.id !== rowId));
  };

  const addRow = () => {
    updateRows([...rows, createEmptyLoanRow()]);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs md:text-sm text-muted-foreground">
        Add each running loan or credit card. Select the loan type and enter the monthly EMI amount.
      </p>

      {rows.map((row, index) => (
        <div
          key={row.id}
          className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 md:gap-6 items-start p-4 rounded-lg border border-border bg-muted/20"
        >
          <Select
            label={`Loan type ${rows.length > 1 ? index + 1 : ''}`}
            options={EXISTING_LOAN_TYPE_OPTIONS}
            value={row.loanType}
            onChange={(value) => updateRow(row.id, { loanType: value })}
            error={errors?.[`existingLoan_${row.id}_type`]}
            required
            placeholder="Select loan type"
            searchable
          />

          <Input
            label="EMI amount"
            type="number"
            placeholder="0"
            description="Monthly EMI in INR (₹)"
            value={row.emiAmount}
            onChange={(e) => updateRow(row.id, { emiAmount: e?.target?.value })}
            error={errors?.[`existingLoan_${row.id}_emi`]}
            min={0}
            required
          />

          <div className="flex md:pt-7">
            <Button
              type="button"
              variant="outline"
              size="sm"
              iconName="Trash2"
              onClick={() => removeRow(row.id)}
              className="w-full md:w-auto"
              disabled={rows.length === 1 && !row.loanType && !row.emiAmount}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}

      {errors?.existingLoans && (
        <p className="text-sm text-destructive">{errors.existingLoans}</p>
      )}

      <Button type="button" variant="outline" iconName="Plus" onClick={addRow} className="w-full md:w-auto">
        Add loan / EMI
      </Button>
    </div>
  );
};

export default ExistingLoansForm;
