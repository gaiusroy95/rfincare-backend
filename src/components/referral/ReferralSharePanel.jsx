import React, { useMemo, useState } from 'react';

import Icon from '../AppIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { copyTextToClipboard } from '../../utils/copyToClipboard';

const DEFAULT_AGENT_MESSAGE =
  'Hi! I recommend RFINCARE for loans and financial products. Use my link to get started — I\'ll be happy to help you through the process.';

const DEFAULT_CUSTOMER_MESSAGE =
  'Hi! I used RFINCARE for my loan journey and found it helpful. Check them out with my referral link.';

/**
 * Referral share panel for agent and customer portals.
 * @param {'agent'|'customer'} variant
 * @param {string} referralCode - agent code or customer code
 * @param {Record<string,string>|null} shareLinks - optional prebuilt links (agent dashboard)
 * @param {number} [stats.attributedCount]
 * @param {string} [stats.attributedLabel]
 */
export default function ReferralSharePanel({
  variant = 'agent',
  referralCode,
  shareLinks = null,
  stats = null,
}) {
  const isAgent = variant === 'agent';
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: isAgent ? DEFAULT_AGENT_MESSAGE : DEFAULT_CUSTOMER_MESSAGE,
  });
  const [errors, setErrors] = useState({});
  const [sentHint, setSentHint] = useState('');

  const primaryLink = useMemo(() => {
    if (shareLinks?.homepage) return shareLinks.homepage;
    if (!referralCode) return '';
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://rfincare.com';
    const url = new URL('/', base);
    if (isAgent) url.searchParams.set('agent', referralCode);
    else url.searchParams.set('ref', referralCode);
    return url.toString();
  }, [shareLinks, referralCode, isAgent]);

  const linkOptions = useMemo(() => {
    if (!shareLinks) {
      return primaryLink ? [{ key: 'homepage', label: 'Homepage', url: primaryLink }] : [];
    }
    return [
      { key: 'homepage', label: 'Homepage', url: shareLinks.homepage },
      { key: 'insurance', label: 'Insurance', url: shareLinks.insurance },
      { key: 'mutualFunds', label: 'Mutual funds', url: shareLinks.mutualFunds },
      { key: 'calculators', label: 'Calculators', url: shareLinks.calculators },
    ].filter((item) => item.url);
  }, [shareLinks, primaryLink]);

  const title = isAgent ? 'Refer partners and grow your income' : 'Invite friends and earn rewards';
  const codeLabel = isAgent ? 'Agent code' : 'Your referral code';

  const handleCopyLink = async (key, url) => {
    const ok = await copyTextToClipboard(url);
    if (!ok) return;
    setCopied(true);
    setCopiedKey(key || 'primary');
    setTimeout(() => {
      setCopied(false);
      setCopiedKey(null);
    }, 2000);
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.phone.trim() && !form.email.trim()) {
      next.phone = 'Add a phone number or email';
      next.email = 'Add a phone number or email';
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email';
    }
    if (form.phone.trim()) {
      const digits = form.phone.replace(/\D/g, '');
      if (digits.length < 10) next.phone = 'Enter a valid 10-digit mobile number';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildShareText = () => {
    const greeting = form.name.trim() ? `Hi ${form.name.trim()},` : 'Hi,';
    return `${greeting}\n\n${form.message.trim()}\n\n${primaryLink}${
      referralCode ? `\n\nReferral code: ${referralCode}` : ''
    }`;
  };

  const handleWhatsApp = () => {
    if (!validate()) return;
    const digits = form.phone.replace(/\D/g, '').slice(-10);
    const text = encodeURIComponent(buildShareText());
    const url = digits
      ? `https://wa.me/91${digits}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSentHint('WhatsApp opened with your referral message.');
  };

  const handleEmail = () => {
    if (!validate()) return;
    if (!form.email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email is required for email share' }));
      return;
    }
    const subject = encodeURIComponent(
      isAgent ? 'Join RFINCARE with my referral' : 'Try RFINCARE with my referral',
    );
    const body = encodeURIComponent(buildShareText());
    window.location.href = `mailto:${encodeURIComponent(form.email.trim())}?subject=${subject}&body=${body}`;
    setSentHint('Your email app opened with the referral message.');
  };

  const handleCopyInvite = async () => {
    if (!validate()) return;
    const ok = await copyTextToClipboard(buildShareText());
    if (ok) {
      setSentHint('Invite message copied. Paste it into SMS, chat, or social media.');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!referralCode && !primaryLink) {
    return (
      <div className="rounded-xl border border-border bg-muted/40 p-6 text-center">
        <Icon name="Gift" size={32} className="mx-auto mb-3 text-muted-foreground" />
        <p className="font-semibold text-foreground">Referral code not ready yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          {isAgent
            ? 'Your agent code will appear here once onboarding is complete.'
            : 'Your customer ID will appear here once your profile is set up.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Promo card — matches portal sidebar "Earn More" style */}
      <div className="rounded-xl border border-border bg-muted/30 p-5 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-foreground">Earn More</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">{title}</p>
        <Button
          className="rf-btn-primary w-full sm:w-auto min-w-[160px]"
          onClick={() => {
            document.getElementById('referral-share-form')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }}
        >
          Refer Now
        </Button>
      </div>

      {/* Code + quick copy */}
      <div className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {isAgent ? 'Agent referral' : 'Customer referral'}
            </p>
            <p className="mt-1 font-semibold text-foreground">
              {codeLabel}: <span className="font-mono">{referralCode || '—'}</span>
            </p>
            {stats?.attributedCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {stats.attributedCount} {stats.attributedLabel || 'attributed referrals'}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            iconName={copied && copiedKey === 'primary' ? 'Check' : 'Copy'}
            iconPosition="left"
            onClick={() => handleCopyLink('primary', primaryLink)}
            disabled={!primaryLink}
          >
            {copied && copiedKey === 'primary' ? 'Copied!' : 'Copy link'}
          </Button>
        </div>

        <div className="rounded-lg bg-muted/50 border border-border px-3 py-2">
          <p className="text-xs text-muted-foreground mb-1">Your referral link</p>
          <p className="text-sm font-mono text-foreground break-all">{primaryLink}</p>
        </div>

        {linkOptions.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {linkOptions.map(({ key, label, url }) => (
              <Button
                key={key}
                size="sm"
                variant="outline"
                onClick={() => handleCopyLink(key, url)}
              >
                <Icon
                  name={copiedKey === key ? 'Check' : 'Link'}
                  size={14}
                  className="mr-1"
                />
                {copiedKey === key ? 'Copied!' : label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Share form */}
      <div
        id="referral-share-form"
        className="rounded-xl border border-border bg-card p-5 md:p-6 scroll-mt-4"
      >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Share referral</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Send your link by WhatsApp, email, or copy a personal invite.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Friend / partner name"
              required
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              error={errors.name}
              placeholder="Full name"
            />
            <Input
              label="Mobile number"
              type="tel"
              value={form.phone}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, phone: e.target.value }));
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
              }}
              error={errors.phone}
              placeholder="10-digit mobile"
            />
            <div className="md:col-span-2">
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, email: e.target.value }));
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                error={errors.email}
                placeholder="name@example.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Message
              </label>
              <textarea
                className="w-full min-h-[110px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Personalize your invite message"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row flex-wrap gap-2">
            <Button className="rf-btn-primary" iconName="MessageCircle" onClick={handleWhatsApp}>
              Share on WhatsApp
            </Button>
            <Button variant="outline" iconName="Mail" onClick={handleEmail}>
              Share by email
            </Button>
            <Button variant="outline" iconName="Copy" onClick={handleCopyInvite}>
              {copied ? 'Copied!' : 'Copy invite'}
            </Button>
          </div>

          {sentHint && (
            <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              {sentHint}
            </p>
          )}
      </div>
    </div>
  );
}
