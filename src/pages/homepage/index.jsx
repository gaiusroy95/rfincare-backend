import React, { useEffect } from 'react';
import Header from '../../components/ui/Header';
import SEO from '../../components/SEO';
import HeroSection from './components/HeroSection';
import QuickEligibilityCheck from './components/QuickEligibilityCheck';
import LoanTypesShowcase from './components/LoanTypesShowcase';
import TrustSignals from './components/TrustSignals';
import TestimonialsSection from './components/TestimonialsSection';
import HowItWorksSection from './components/HowItWorksSection';
import FAQSection from './components/FAQSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import NewsSection from './components/NewsSection';
import VideosSection from './components/VideosSection';
import PartnersSection from './components/PartnersSection';

const Homepage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Header />
      
      <main>
        <HeroSection />
        <QuickEligibilityCheck />
        <NewsSection />
        <VideosSection />
        <LoanTypesShowcase />
        <HowItWorksSection />
        <PartnersSection />
        <TrustSignals />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Homepage;