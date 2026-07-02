import React, { useState } from 'react';
import Icon from '../AppIcon';

const SLIDES = [
  {
    title: 'Best time to buy Health Insurance is now',
    highlight: 'Additional discount up to 25%*',
    sub: '0%* GST on select health insurance plans',
    cta: 'View plans',
  },
  {
    title: 'Secure your family with term life cover',
    highlight: '₹1 Crore cover from ₹400/month⁺',
    sub: 'Compare 50+ insurers in one place',
    cta: 'Get quotes',
  },
  {
    title: 'Renew motor insurance hassle-free',
    highlight: 'Upto 85% discount on 2-wheeler',
    sub: 'Instant policy comparison',
    cta: 'Compare now',
  },
];

const MarketplaceHero = ({ type = 'insurance', onCtaClick }) => {
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];
  const isInsurance = type === 'insurance';

  return (
    <section className="rounded-2xl border border-border bg-gradient-to-br from-slate-50 via-white to-blue-50/50 p-6 md:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-5">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 leading-tight">
            {isInsurance ? (
              <>Let&apos;s find you the <span className="text-primary">Best Insurance</span></>
            ) : (
              <>Grow wealth with the <span className="text-primary">Best Mutual Funds</span></>
            )}
          </h1>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm md:text-base text-slate-700">
              <span className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                <Icon name="Calculator" size={18} className="text-violet-600" />
              </span>
              {isInsurance ? '50+ insurers offering competitive prices' : '500+ funds across all categories'}
            </li>
            <li className="flex items-center gap-3 text-sm md:text-base text-slate-700">
              <span className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Icon name="Zap" size={18} className="text-amber-600" />
              </span>
              Quick, easy &amp; hassle free
            </li>
          </ul>
        </div>

        <div className="relative">
          <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-blue-900 text-white p-6 md:p-8 shadow-xl min-h-[200px] flex flex-col justify-between">
            <div className="space-y-2">
              <p className="text-lg md:text-xl font-semibold">{current.title}</p>
              <p className="text-amber-300 font-bold text-sm md:text-base">{current.highlight}</p>
              <p className="text-blue-100 text-sm">{current.sub}</p>
            </div>
            <button
              type="button"
              onClick={onCtaClick}
              className="mt-4 self-start inline-flex items-center gap-1 bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              {current.cta}
              <Icon name="ChevronRight" size={16} />
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setSlide(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === slide ? 'bg-primary' : 'bg-slate-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceHero;
