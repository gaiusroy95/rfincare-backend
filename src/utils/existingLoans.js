import { getExistingLoanTypeLabel } from '../constants/existingLoanTypes';

export function newLoanRowId() {
  return `loan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptyLoanRow() {
  return { id: newLoanRowId(), loanType: '', emiAmount: '' };
}

function parseEmi(value) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function normalizeRow(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = raw.id || raw.row_id || newLoanRowId();
  const loanType = raw.loanType || raw.loan_type || '';
  const emiAmount = raw.emiAmount ?? raw.emi_amount ?? '';
  if (!loanType && (emiAmount === '' || emiAmount == null)) return null;
  return {
    id: String(id),
    loanType: String(loanType),
    emiAmount: emiAmount === '' || emiAmount == null ? '' : String(emiAmount),
  };
}

/** Rows with both loan type and a positive EMI amount. */
export function getCompleteExistingLoans(existingLoans) {
  if (!Array.isArray(existingLoans)) return [];
  return existingLoans
    .map(normalizeRow)
    .filter((row) => row && row.loanType && parseEmi(row.emiAmount) > 0);
}

function pushLegacyRow(rows, loanType, amount) {
  if (parseEmi(amount) <= 0) return;
  rows.push({
    id: newLoanRowId(),
    loanType,
    emiAmount: String(amount),
  });
}

/** Convert legacy fixed EMI columns into dynamic rows for older drafts. */
export function migrateLegacyEmiFieldsToExistingLoans(formData = {}) {
  const rows = [];
  pushLegacyRow(rows, 'personal_loan', formData.personalLoanEmi1 ?? formData.personal_loan_emi_1);
  pushLegacyRow(rows, 'personal_loan', formData.personalLoanEmi2 ?? formData.personal_loan_emi_2);
  pushLegacyRow(rows, 'home_loan', formData.housingLoanEmi1 ?? formData.housing_loan_emi_1);
  pushLegacyRow(rows, 'home_loan', formData.housingLoanEmi2 ?? formData.housing_loan_emi_2);
  pushLegacyRow(rows, 'car_loan', formData.carLoanEmi ?? formData.car_loan_emi);
  pushLegacyRow(rows, 'two_wheeler_loan', formData.twoWheelerLoanEmi ?? formData.two_wheeler_loan_emi);
  pushLegacyRow(rows, 'consumer_loan', formData.otherLoanEmi1 ?? formData.other_loan_emi_1);
  pushLegacyRow(rows, 'consumer_loan', formData.otherLoanEmi2 ?? formData.other_loan_emi_2);
  pushLegacyRow(rows, 'credit_card', formData.creditCardOutstanding1 ?? formData.credit_card_outstanding_1);
  pushLegacyRow(rows, 'credit_card', formData.creditCardOutstanding2 ?? formData.credit_card_outstanding_2);
  pushLegacyRow(rows, 'credit_card', formData.creditCardOutstanding3 ?? formData.credit_card_outstanding_3);
  pushLegacyRow(rows, 'credit_card', formData.creditCardOutstanding4 ?? formData.credit_card_outstanding_4);
  return rows;
}

export function normalizeExistingLoans(raw = {}, formData = {}) {
  const source = raw.existingLoans ?? raw.existing_loans;
  if (Array.isArray(source) && source.length) {
    const rows = source.map(normalizeRow).filter(Boolean);
    if (rows.length) return rows;
  }
  const migrated = migrateLegacyEmiFieldsToExistingLoans({ ...formData, ...raw });
  if (migrated.length) return migrated;
  if (formData.hasRunningLoanOrCard === 'yes' || raw.has_running_loan_or_card === 'yes') {
    return [createEmptyLoanRow()];
  }
  return [];
}

export function sumExistingLoanEmi(existingLoans) {
  if (!Array.isArray(existingLoans)) return 0;
  return existingLoans.reduce((sum, row) => sum + parseEmi(row?.emiAmount ?? row?.emi_amount), 0);
}

export function existingLoanStatementDocType(rowId) {
  return `existing_loan_statement_${rowId}`;
}

export function isExistingLoanStatementDocType(docType) {
  return String(docType || '').startsWith('existing_loan_statement_');
}

export function buildExistingLoanStatementDocuments(existingLoans = []) {
  return getCompleteExistingLoans(existingLoans).map((loan, index) => {
    const label = getExistingLoanTypeLabel(loan.loanType);
    const emi = parseEmi(loan.emiAmount);
    return {
      type: existingLoanStatementDocType(loan.id),
      label: `${label} — Statement`,
      description: `Upload the latest loan statement, sanction letter, or credit card statement for ${label} (EMI ₹${Math.round(emi).toLocaleString('en-IN')})`,
      icon: 'FileText',
      isRequired: true,
      sortOrder: 100 + index,
      loanRowId: loan.id,
    };
  });
}

export function serializeExistingLoansForPayload(existingLoans = []) {
  return getCompleteExistingLoans(existingLoans).map((loan) => ({
    id: loan.id,
    loan_type: loan.loanType,
    emi_amount: parseEmi(loan.emiAmount),
  }));
}
