import React, { useEffect, useState } from 'react';

import ReferralSharePanel from '../referral/ReferralSharePanel';
import { referralService } from '../../services/referralService';
import Icon from '../AppIcon';

export default function PortalReferralSection({
  program = 'customer',
  fallbackCode = '',
  fallbackLinks = null,
  fallbackCount = 0,
}) {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await referralService.getReferral(program);
        if (!cancelled) setPayload(data);
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.error || err?.message || 'Could not load referral code');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [program]);

  const referralCode = payload?.referralCode || fallbackCode;
  const shareLinks = payload?.shareLinks || fallbackLinks;
  const attributedCount = payload?.attributedCount ?? fallbackCount;

  if (!referralCode && !error) {
    return (
      <div className="rounded-xl border border-border bg-muted/40 p-6 text-center">
        <Icon name="Loader" size={28} className="mx-auto mb-2 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Creating your unique referral code…</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && !referralCode ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
      <ReferralSharePanel
        variant={program === 'agent' ? 'agent' : 'customer'}
        program={program}
        referralCode={referralCode}
        shareLinks={shareLinks}
        stats={{
          attributedCount,
          attributedLabel: program === 'agent' ? 'referred agents' : 'referred customers',
        }}
      />
    </div>
  );
}
