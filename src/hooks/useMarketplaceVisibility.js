import { useEffect, useState } from 'react';
import { adminProfileService } from '../services/adminProfileService';

const DEFAULT_VISIBILITY = {
  bankMarketplace: true,
  creditCardMarketplace: true,
  insuranceMarketplace: true,
  mutualFundMarketplace: true,
};

export function useMarketplaceVisibility() {
  const [visibility, setVisibility] = useState(DEFAULT_VISIBILITY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    adminProfileService
      .getPublicMarketplaceVisibility()
      .then((data) => {
        if (!active || !data) return;
        setVisibility({
          bankMarketplace: data.bankMarketplace !== false,
          creditCardMarketplace: data.creditCardMarketplace !== false,
          insuranceMarketplace: data.insuranceMarketplace !== false,
          mutualFundMarketplace: data.mutualFundMarketplace !== false,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { visibility, loading };
}
