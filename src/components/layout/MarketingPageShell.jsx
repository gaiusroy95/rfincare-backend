import React from 'react';
import Header from '../ui/Header';
import Footer from '../../pages/homepage/components/Footer';

/**
 * Branded static/marketing pages — About, Contact, Staff login hub.
 */
const MarketingPageShell = ({ title, subtitle, children, heroClassName = '' }) => (
  <div className="min-h-screen bg-[#f8faf9]">
    <Header />
    <section className={`bg-[var(--color-brand-green-dark)] text-white py-14 md:py-16 ${heroClassName}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{title}</h1>
        {subtitle ? (
          <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto">{subtitle}</p>
        ) : null}
      </div>
    </section>
    <main>{children}</main>
    <Footer />
  </div>
);

export default MarketingPageShell;
