import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bankService } from '../../../services/apiServices';
import { mapBankForMarketplace } from '../../../utils/bankMarketplace';
import { getBankProbabilityMap, loadEligibilityResults } from '../../../services/leadService';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const BankEligibilityPreview = ({ loanTypeSlug, productLabel }) => {
  const navigate = useNavigate();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loanTypeSlug) {
      setBanks([]);
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const data = await bankService.getActiveBanks({ loanType: loanTypeSlug });
        const list = Array.isArray(data) ? data : [];
        const eligibility = loadEligibilityResults();
        const probabilityMap = getBankProbabilityMap(eligibility);
        setBanks(
          list
            .map((b) => mapBankForMarketplace(b, loanTypeSlug, probabilityMap))
            .filter(Boolean)
            .slice(0, 4),
        );
      } catch {
        setBanks([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loanTypeSlug]);

  if (!loanTypeSlug) return null;

  return (
    <section className="py-10 bg-white border-y border-border">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-2">
          Bank eligibility for {productLabel}
        </h2>
        <p className="text-center text-muted-foreground text-sm mb-6 max-w-2xl mx-auto">
          Compare how partner banks may approve your {productLabel?.toLowerCase()} application.
          Run the eligibility calculator for the most accurate scores.
        </p>
        {loading ? (
          <p className="text-center text-muted-foreground">Loading banks…</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {banks.map((bank) => (
              <div key={bank.id} className="border border-border rounded-xl p-4 bg-card">
                <p className="font-semibold text-sm truncate">{bank.name}</p>
                <p className="text-2xl font-bold text-primary mt-2">{bank.probability}%</p>
                <p className="text-xs text-muted-foreground">Approval estimate</p>
                <p className="text-xs mt-2">{bank.interestRate}</p>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Button
            iconName="Building2"
            iconPosition="left"
            onClick={() => navigate(`/bank-marketplace?loanType=${loanTypeSlug}`)}
          >
            Compare all banks
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/eligibility-assessment?loanType=${loanTypeSlug}`)}
          >
            Check eligibility
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BankEligibilityPreview;
