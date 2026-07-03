import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { POPULAR_CALCULATORS } from '../../../constants/calculatorProductBridges';

const CALC_ICONS = {
  'emi-calculator': { icon: 'Calculator', color: 'bg-emerald-100 text-emerald-700' },
  'sip-calculator': { icon: 'TrendingUp', color: 'bg-violet-100 text-violet-700' },
  'rd-calculator': { icon: 'PiggyBank', color: 'bg-sky-100 text-sky-700' },
  'tax-saving-calculator': { icon: 'Receipt', color: 'bg-orange-100 text-orange-700' },
};

const HomeSidebarWidgets = () => {
  const navigate = useNavigate();
  const calcs = POPULAR_CALCULATORS.slice(0, 4);

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
        <div className="flex items-center gap-3 flex-wrap">
          {['SBI', 'HDFC', 'ICICI'].map((bank) => (
            <span
              key={bank}
              className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-slate-700 border border-border"
            >
              {bank}
            </span>
          ))}
          <span className="text-sm font-semibold text-[var(--color-brand-green)]">+47</span>
        </div>
      </div>
    </>
  );
};

export default HomeSidebarWidgets;
