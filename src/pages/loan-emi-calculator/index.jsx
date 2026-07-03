import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { calculateEmi, formatInr } from '../../utils/emiCalculator';

const TENURE_OPTIONS = [
  { value: '12', label: '1 year' },
  { value: '24', label: '2 years' },
  { value: '36', label: '3 years' },
  { value: '48', label: '4 years' },
  { value: '60', label: '5 years' },
  { value: '84', label: '7 years' },
  { value: '120', label: '10 years' },
  { value: '180', label: '15 years' },
  { value: '240', label: '20 years' },
  { value: '300', label: '25 years' },
];

const LoanEmiCalculator = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loanAmount, setLoanAmount] = useState('1000000');
  const [interestRate, setInterestRate] = useState('10.5');
  const [tenureMonths, setTenureMonths] = useState('60');

  const result = useMemo(() => {
    return calculateEmi(
      parseFloat(loanAmount),
      parseFloat(interestRate),
      parseInt(tenureMonths, 10),
    );
  }, [loanAmount, interestRate, tenureMonths]);

  const years = tenureMonths ? (Number(tenureMonths) / 12).toFixed(1) : '—';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="bg-[var(--color-brand-green-dark)] text-white py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Icon name="Calculator" size={40} className="mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {t('footer.loanEmiCalculator', 'Loan EMI Calculator')}
            </h1>
            <p className="text-white/90 text-sm md:text-base max-w-2xl mx-auto">
              Estimate your monthly EMI, total interest, and repayment amount before you apply.
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rf-filter-card space-y-5">
                <h2 className="text-lg font-bold text-foreground">Loan details</h2>

                <Input
                  label="Loan amount (₹)"
                  type="number"
                  min="10000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="e.g. 1000000"
                  required
                />

                <Input
                  label="Interest rate (% per year)"
                  type="number"
                  min="0"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="e.g. 10.5"
                  required
                />

                <Select
                  label="Loan tenure"
                  options={TENURE_OPTIONS}
                  value={tenureMonths}
                  onChange={setTenureMonths}
                />

                <p className="text-xs text-muted-foreground">
                  EMI is calculated using the standard reducing-balance method. Actual bank EMI may
                  vary slightly based on fees and rounding.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-[var(--color-brand-green-dark)] text-white rounded-2xl p-6 md:p-8 shadow-lg">
                  <p className="text-sm opacity-90 mb-1">Estimated monthly EMI</p>
                  <p className="text-4xl md:text-5xl font-bold tracking-tight">
                    {result ? formatInr(result.emi) : '—'}
                  </p>
                  <p className="text-sm opacity-80 mt-2">
                    for {formatInr(loanAmount || 0)} over {years} years ({tenureMonths} months)
                  </p>
                </div>

                {result && (
                  <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                    <div className="flex justify-between p-4 md:p-5">
                      <span className="text-muted-foreground">Principal amount</span>
                      <span className="font-semibold text-foreground">
                        {formatInr(result.principal)}
                      </span>
                    </div>
                    <div className="flex justify-between p-4 md:p-5">
                      <span className="text-muted-foreground">Total interest payable</span>
                      <span className="font-semibold text-foreground">
                        {formatInr(result.totalInterest)}
                      </span>
                    </div>
                    <div className="flex justify-between p-4 md:p-5">
                      <span className="text-muted-foreground">Total amount payable</span>
                      <span className="font-semibold text-primary">
                        {formatInr(result.totalPayment)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Next steps</p>
                  <p className="text-sm text-muted-foreground">
                    Check how much you can borrow and compare bank offers based on your profile.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="default"
                      className="flex-1 rf-btn-primary"
                      iconName="Calculator"
                      iconPosition="left"
                      onClick={() => navigate('/eligibility-assessment')}
                    >
                      Check eligibility
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      iconName="GitCompare"
                      iconPosition="left"
                      onClick={() => navigate('/product-comparison')}
                    >
                      Compare products
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LoanEmiCalculator;
