import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import { copyTextToClipboard } from '../../utils/copyToClipboard';

const LINK_LABELS = [
  { key: 'homepage', label: 'Homepage' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'mutualFunds', label: 'Mutual funds' },
  { key: 'calculators', label: 'Calculators' },
];

export default function AgentReferralBanner({ attribution }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!attribution?.agentCode || !attribution?.shareLinks) return null;

  const handleCopy = async (key, url) => {
    const ok = await copyTextToClipboard(url);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">Referral links</p>
          <p className="font-semibold text-foreground mt-1">
            Agent code: <span className="font-mono">{attribution.agentCode}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Share these links — customers who apply through them are attributed to you.
            {attribution.attributedLeads > 0 && (
              <span className="ml-1 font-medium text-foreground">
                {attribution.attributedLeads} attributed lead{attribution.attributedLeads !== 1 ? 's' : ''}
              </span>
            )}
            {attribution.sipOrders > 0 && (
              <span className="ml-1 font-medium text-foreground">
                · {attribution.sipOrders} SIP order{attribution.sipOrders !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {LINK_LABELS.map(({ key, label }) => {
            const url = attribution.shareLinks[key];
            if (!url) return null;
            return (
              <Button
                key={key}
                size="sm"
                variant="outline"
                onClick={() => handleCopy(key, url)}
              >
                <Icon name={copiedKey === key ? 'Check' : 'Link'} size={14} className="mr-1" />
                {copiedKey === key ? 'Copied!' : label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
