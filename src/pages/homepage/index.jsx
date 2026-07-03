import React, { useEffect } from 'react';
import Header from '../../components/ui/Header';
import SEO from '../../components/SEO';
import HeroSection from './components/HeroSection';
import CategoryGridSection from './components/CategoryGridSection';
import WhyChooseSection from './components/WhyChooseSection';
import HomeStatsBar from './components/HomeStatsBar';
import PopularCalculatorsSection from './components/PopularCalculatorsSection';
import FinancialPillarsSection from './components/FinancialPillarsSection';
import PartnersSection from './components/PartnersSection';
import TestimonialsSection from './components/TestimonialsSection';
import FAQSection from './components/FAQSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

const Homepage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SEO />
      <Header />

      <main>
        <HeroSection />
        <CategoryGridSection />
        <WhyChooseSection />
        <HomeStatsBar />
        <FinancialPillarsSection />
        <PopularCalculatorsSection />
        <PartnersSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Homepage;
