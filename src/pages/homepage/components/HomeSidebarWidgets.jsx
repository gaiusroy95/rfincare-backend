import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { POPULAR_CALCULATORS } from '../../../constants/calculatorProductBridges';
import { bankService } from '../../../services/apiServices';
import { getBankShortLabel } from '../../../utils/bankBranding';

const CALC_ICONS = {
  'emi-calculator': { icon: 'Calculator', color: 'bg-emerald-100 text-emerald-700' },
  'sip-calculator': { icon: 'TrendingUp', color: 'bg-violet-100 text-violet-700' },
  'rd-calculator': { icon: 'PiggyBank', color: 'bg-sky-100 text-sky-700' },
  'tax-saving-calculator': { icon: 'Receipt', color: 'bg-orange-100 text-orange-700' },
};

const FEATURED_BANK_KEYS = ['state bank of india', 'hdfc bank', 'icici bank'];

function normalizeBankKey(name) {
  return String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function pickFeaturedBanks(banks) {
  const list = Array.isArray(banks) ? banks : [];
  const sorted = [...list].sort(
    (a, b) => (b.displayPriority || b.display_priority || 0) - (a.displayPriority || a.display_priority || 0),
  );
  const picked = [];

  for (const key of FEATURED_BANK_KEYS) {
    const match = sorted.find((bank) => normalizeBankKey(bank.name) === key);
    if (match && !picked.some((b) => b.id === match.id)) picked.push(match);
  }

  for (const bank of sorted) {
    if (picked.length >= 3) break;
    if (!picked.some((b) => b.id === bank.id)) picked.push(bank);
  }

  return picked.slice(0, 3);
}

const HomeSidebarWidgets = () => {
  const navigate = useNavigate();
  const calcs = POPULAR_CALCULATORS.slice(0, 4);
  const [partnerBanks, setPartnerBanks] = useState([]);
  const [totalPartners, setTotalPartners] = useState(0);
  const [partnersLoading, setPartnersLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setPartnersLoading(true);
        const data = await bankService.getActiveBanks({ includeProducts: false });
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setPartnerBanks(pickFeaturedBanks(list));
        setTotalPartners(list.length);
      } catch {
        if (!cancelled) {
          setPartnerBanks([]);
          setTotalPartners(0);
        }
      } finally {
        if (!cancelled) setPartnersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const extraPartnerCount = useMemo(
    () => Math.max(0, totalPartners - partnerBanks.length),
    [totalPartners, partnerBanks.length],
  );

  const openBankProducts = (bankId) => {
    navigate(`/bank-marketplace?bankId=${encodeURIComponent(bankId)}`);
  };

  return (
    <>
      <div className="rf-sidebar-widget">
        <h3 className="font-bold text-foreground mb-3">Popular Tools &amp; Calculators</h3>
        <ul className="space-y-2">
          {calcs.map((calc) => {
            const style = CALC_ICONS[calc.slug] || { icon: calc.icon, color: 'bg-emerald-100 text-emerald-700' };
            return (
              <li key={calc.slug}>
                <button
                  type="button"
                  onClick={() => navigate(calc.path)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.color}`}>
                    <Icon name={style.icon} size={18} />
                  </span>
                  <span className="text-sm font-medium text-foreground">{calc.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => navigate('/resources/calculators')}
          className="mt-3 text-sm font-semibold text-[var(--color-brand-green)] hover:underline"
        >
          View All Calculators →
        </button>
      </div>

      <div className="rf-sidebar-widget bg-violet-50 border-violet-100">
        <h3 className="font-bold text-foreground mb-2">Need Help Choosing?</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Get free consultation from our financial experts
        </p>
        <Button className="rf-btn-primary w-full" size="sm" onClick={() => navigate('/contact-us')}>
          Talk to Expert
        </Button>
        <div className="flex -space-x-2 mt-3">
          {[1, 2, 3, 4].map((n) => (
            <span key={n} className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white" />
          ))}
        </div>
      </div>

      <div className="rf-sidebar-widget bg-emerald-50 border-emerald-100">
        <h3 className="font-bold text-foreground mb-3 text-sm">RBI Registered Partners</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {partnersLoading ? (
            <>
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className="px-3 py-1.5 bg-white rounded-lg text-xs border border-border animate-pulse text-transparent"
                >
                  Loading
                </span>
              ))}
            </>
          ) : partnerBanks.length ? (
            partnerBanks.map((bank) => (
              <button
                key={bank.id}
                type="button"
                onClick={() => openBankProducts(bank.id)}
                title={`View ${bank.name} products`}
                className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-slate-700 border border-border hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] transition-colors"
              >
                {getBankShortLabel(bank)}
              </button>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">Partners loading soon</span>
          )}
          {extraPartnerCount > 0 && (
            <button
              type="button"
              onClick={() => navigate('/bank-marketplace')}
              className="text-sm font-semibold text-[var(--color-brand-green)] hover:underline"
              title="View all banking partners"
            >
              +{extraPartnerCount}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default HomeSidebarWidgets;
