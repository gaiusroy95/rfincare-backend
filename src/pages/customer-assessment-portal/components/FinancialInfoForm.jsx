import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useLoanProducts } from '../../../contexts/LoanProductsContext';
import {
  FINANCIAL_HISTORY_QUESTIONS,
  FINANCIAL_YES_NO_OPTIONS,
} from '../../../constants/assessmentFinancialHistory';
import { CREDIT_SCORE_RANGE_OPTIONS_FULL } from '../../../constants/creditScoreRanges';

const FinancialInfoForm = ({ formData, errors, onChange }) => {
  const { products } = useLoanProducts();
  const productList = Array.isArray(products) ? products.filter((p) => p?.apiKey) : [];
  const loanPurposeOptions = [
    ...productList.map((p) => ({ value: p.apiKey, label: p.label || p.apiKey })),
    { value: 'debt_consolidation', label: 'Debt Consolidation' },
  ];

  const creditScoreRangeOptions = CREDIT_SCORE_RANGE_OPTIONS_FULL;

  const yesNoOptions = FINANCIAL_YES_NO_OPTIONS;
  const hasRunningLoans = formData?.hasRunningLoanOrCard === 'yes';
  const hasOverdue = formData?.hasAnyOverdue === 'yes';

  const overdueLoanTypeOptions = [
    { value: 'personal_loan', label: 'Personal loan' },
    { value: 'home_loan', label: 'Home loan' },
    { value: 'car_loan', label: 'Car loan' },
    { value: 'two_wheeler_loan', label: 'Two wheeler loan' },
    { value: 'credit_card', label: 'Credit card' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Select
          label="Loan Purpose"
          description="What will you use this loan for?"
          options={loanPurposeOptions}
          value={formData?.loanPurpose}
          onChange={(value) => onChange('loanPurpose', value)}
          error={errors?.loanPurpose}
          required
        />

        <Input
          label="Requested Loan Amount"
          type="number"
          placeholder="500000"
          description="Enter amount in INR (₹)"
          value={formData?.loanAmount}
          onChange={(e) => onChange('loanAmount', e?.target?.value)}
          error={errors?.loanAmount}
          required
          min={100000}
          max={50000000}
        />
      </div>
      <Select
        label="Estimated Credit Score Range"
        description="Select the range that best matches your credit score"
        options={creditScoreRangeOptions}
        value={formData?.creditScoreRange}
        onChange={(value) => onChange('creditScoreRange', value)}
        error={errors?.creditScoreRange}
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Input
          label="Total Monthly Debt Payments"
          type="number"
          placeholder="20000"
          description="Include all loans, credit cards, etc. in INR (₹)"
          value={formData?.monthlyDebtPayments}
          onChange={(e) => onChange('monthlyDebtPayments', e?.target?.value)}
          error={errors?.monthlyDebtPayments}
          required
          min={0}
        />

        <Input
          label="Total Savings & Assets"
          type="number"
          placeholder="500000"
          description="Bank accounts, investments, etc. in INR (₹)"
          value={formData?.totalAssets}
          onChange={(e) => onChange('totalAssets', e?.target?.value)}
          error={errors?.totalAssets}
          required
          min={0}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-4 md:p-6 space-y-4">
        <div>
          <p className="text-sm md:text-base font-semibold text-foreground">Existing loan details</p>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Do you have any running loan or credit card?
          </p>
        </div>

        <Select
          label="Do you have any loan or credit card running?"
          options={yesNoOptions}
          value={formData?.hasRunningLoanOrCard}
          onChange={(value) => onChange('hasRunningLoanOrCard', value)}
          error={errors?.hasRunningLoanOrCard}
          required
          placeholder="Select Yes or No"
        />

        {hasRunningLoans && (
          <div className="space-y-4">
            <p className="text-xs md:text-sm text-muted-foreground">
              If Yes, enter the details below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Input
                label="Personal Loan 1 EMI"
                type="number"
                placeholder="0"
                description="Monthly EMI in INR (₹)"
                value={formData?.personalLoanEmi1}
                onChange={(e) => onChange('personalLoanEmi1', e?.target?.value)}
                error={errors?.personalLoanEmi1}
                min={0}
              />
              <Input
                label="Personal Loan 2 EMI"
                type="number"
                placeholder="0"
                description="Monthly EMI in INR (₹)"
                value={formData?.personalLoanEmi2}
                onChange={(e) => onChange('personalLoanEmi2', e?.target?.value)}
                error={errors?.personalLoanEmi2}
                min={0}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Input
                label="Housing Loan 1 EMI"
                type="number"
                placeholder="0"
                description="Monthly EMI in INR (₹)"
                value={formData?.housingLoanEmi1}
                onChange={(e) => onChange('housingLoanEmi1', e?.target?.value)}
                error={errors?.housingLoanEmi1}
                min={0}
              />
              <Input
                label="Housing Loan 2 EMI"
                type="number"
                placeholder="0"
                description="Monthly EMI in INR (₹)"
                value={formData?.housingLoanEmi2}
                onChange={(e) => onChange('housingLoanEmi2', e?.target?.value)}
                error={errors?.housingLoanEmi2}
                min={0}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Input
                label="Car Loan EMI"
                type="number"
                placeholder="0"
                description="Monthly EMI in INR (₹)"
                value={formData?.carLoanEmi}
                onChange={(e) => onChange('carLoanEmi', e?.target?.value)}
                error={errors?.carLoanEmi}
                min={0}
              />
              <Input
                label="Two Wheeler Loan EMI"
                type="number"
                placeholder="0"
                description="Monthly EMI in INR (₹)"
                value={formData?.twoWheelerLoanEmi}
                onChange={(e) => onChange('twoWheelerLoanEmi', e?.target?.value)}
                error={errors?.twoWheelerLoanEmi}
                min={0}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Input
                label="Other Loan EMI 1"
                type="number"
                placeholder="0"
                description="Monthly EMI in INR (₹)"
                value={formData?.otherLoanEmi1}
                onChange={(e) => onChange('otherLoanEmi1', e?.target?.value)}
                error={errors?.otherLoanEmi1}
                min={0}
              />
              <Input
                label="Other Loan EMI 2"
                type="number"
                placeholder="0"
                description="Monthly EMI in INR (₹)"
                value={formData?.otherLoanEmi2}
                onChange={(e) => onChange('otherLoanEmi2', e?.target?.value)}
                error={errors?.otherLoanEmi2}
                min={0}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Input
                label="Credit Card 1 outstanding"
                type="number"
                placeholder="0"
                description="Outstanding amount in INR (₹)"
                value={formData?.creditCardOutstanding1}
                onChange={(e) => onChange('creditCardOutstanding1', e?.target?.value)}
                error={errors?.creditCardOutstanding1}
                min={0}
              />
              <Input
                label="Credit Card 2 outstanding"
                type="number"
                placeholder="0"
                description="Outstanding amount in INR (₹)"
                value={formData?.creditCardOutstanding2}
                onChange={(e) => onChange('creditCardOutstanding2', e?.target?.value)}
                error={errors?.creditCardOutstanding2}
                min={0}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Input
                label="Credit Card 3 outstanding"
                type="number"
                placeholder="0"
                description="Outstanding amount in INR (₹)"
                value={formData?.creditCardOutstanding3}
                onChange={(e) => onChange('creditCardOutstanding3', e?.target?.value)}
                error={errors?.creditCardOutstanding3}
                min={0}
              />
              <Input
                label="Credit Card 4 outstanding"
                type="number"
                placeholder="0"
                description="Outstanding amount in INR (₹)"
                value={formData?.creditCardOutstanding4}
                onChange={(e) => onChange('creditCardOutstanding4', e?.target?.value)}
                error={errors?.creditCardOutstanding4}
                min={0}
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4 md:p-6 space-y-4">
        <div>
          <p className="text-sm md:text-base font-semibold text-foreground">Borrowing details</p>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Are you having any overdue in any loan?
          </p>
        </div>

        <Select
          label="Any overdue in any loan?"
          options={yesNoOptions}
          value={formData?.hasAnyOverdue}
          onChange={(value) => onChange('hasAnyOverdue', value)}
          error={errors?.hasAnyOverdue}
          required
          placeholder="Select Yes or No"
        />

        {hasOverdue && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Input
              label="If yes, how much is overdue?"
              type="number"
              placeholder="0"
              description="Overdue amount in INR (₹)"
              value={formData?.overdueAmount}
              onChange={(e) => onChange('overdueAmount', e?.target?.value)}
              error={errors?.overdueAmount}
              min={0}
              required
            />
            <Select
              label="Loan details of overdue"
              options={overdueLoanTypeOptions}
              value={formData?.overdueLoanType}
              onChange={(value) => onChange('overdueLoanType', value)}
              error={errors?.overdueLoanType}
              required
              placeholder="Select loan type"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-sm md:text-base font-medium text-foreground">Financial history</p>
        <p className="text-xs md:text-sm text-muted-foreground -mt-2">
          Answer each question below. Select Yes or No as applicable.
        </p>
        <div className="space-y-4">
          {FINANCIAL_HISTORY_QUESTIONS.map((question) => (
            <Select
              key={question.field}
              label={question.label}
              description={question.description}
              options={FINANCIAL_YES_NO_OPTIONS}
              value={formData?.[question.field]}
              onChange={(value) => onChange(question.field, value)}
              error={errors?.[question.field]}
              required
              placeholder="Select Yes or No"
            />
          ))}
        </div>
      </div>
      <div className="p-4 md:p-6 bg-muted rounded-lg border border-border">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg md:text-xl">💡</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm md:text-base font-semibold text-foreground mb-2">
              Why We Ask These Questions
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground">
              This information helps us match you with the best loan options and lenders. Your debt-to-income ratio and credit history are key factors in determining loan eligibility and interest rates. All information is kept confidential and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialInfoForm;