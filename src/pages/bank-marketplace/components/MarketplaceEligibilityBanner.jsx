import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { loadEligibilityResults } from '../../../services/leadService';

const MarketplaceEligibilityBanner = ({ loanTypeSlug }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const eligibility = loadEligibilityResults();

  if (eligibility?.banks?.length) {
    return (
      <div className="mb-6 p-4 rounded-lg border border-success/30 bg-success/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-success">
          <Icon name="CheckCircle2" size={18} />
          <span>
            {t('marketplace.eligibilityLoaded', 'Showing approval estimates from your eligibility check')}
            {eligibility.overallProbability != null && (
              <> — {eligibility.overallProbability}% overall</>
            )}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/eligibility-assessment${loanTypeSlug ? `?loanType=${loanTypeSlug}` : ''}`)}
        >
          {t('marketplace.recheck', 'Recheck eligibility')}
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 rounded-lg border border-warning/30 bg-warning/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="font-medium text-foreground">
            {t('marketplace.noEligibilityTitle', 'Get personalised bank approval scores')}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {t(
              'marketplace.noEligibilityHint',
              'Run the free eligibility calculator first. Bank cards will show real match percentages instead of estimates.',
            )}
          </p>
        </div>
        <Button
          onClick={() =>
            navigate(`/eligibility-assessment${loanTypeSlug ? `?loanType=${loanTypeSlug}` : ''}`)
          }
        >
          {t('marketplace.checkEligibility', 'Check eligibility')}
        </Button>
      </div>
    </div>
  );
};

export default MarketplaceEligibilityBanner;
