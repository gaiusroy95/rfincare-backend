import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketingPageShell from '../../components/layout/MarketingPageShell';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { openAssessmentOrEligibilityFirst } from '../../utils/eligibilityGate';
import { homepageService } from '../../services/homepageService';

const AboutUs = () => {
  const navigate = useNavigate();
  const [aboutContent, setAboutContent] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    homepageService.getAboutContent().then(setAboutContent).catch(() => {});
  }, []);

  const values = aboutContent?.values || [
    { id: 'mission', icon: 'Target', title: 'Our Mission', description: 'To simplify financial services and make loans, insurance, and investments accessible to everyone across India.' },
    { id: 'vision', icon: 'Eye', title: 'Our Vision', description: "To become India's most trusted financial marketplace for comparison and application processing." },
    { id: 'values', icon: 'Heart', title: 'Our Values', description: 'Transparency, customer-first approach, innovation, and commitment to financial inclusion.' },
    { id: 'promise', icon: 'Shield', title: 'Our Promise', description: 'Secure, fast, and reliable processing with complete transparency at every step.' },
  ];

  const stats = aboutContent?.stats || [
    { value: '10L+', label: 'Happy Customers' },
    { value: '50+', label: 'Partner Institutions' },
    { value: '₹50,000Cr+', label: 'Loans Disbursed' },
    { value: '4.8/5', label: 'Customer Rating' },
  ];

  return (
    <MarketingPageShell
      title={aboutContent?.heroTitle || 'About RFINCARE'}
      subtitle={aboutContent?.heroSubtitle || "India's financial supermarket — compare, invest, insure & grow your wealth in one place."}
    >
      <section className="py-10 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={stat?.id || index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[var(--color-brand-green)] mb-1">{stat?.value}</div>
                <div className="text-sm text-muted-foreground">{stat?.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">What Drives Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={value?.id || index} className="rf-why-card bg-white">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon name={value?.icon} size={24} className="text-[var(--color-brand-green)]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{value?.title}</h3>
                <p className="text-sm text-muted-foreground">{value?.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{aboutContent?.storyHeading || 'Our Story'}</h2>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            {(aboutContent?.storyParagraphs || [
              'RFINCARE was built on a simple idea: every Indian deserves one trusted place to compare loans, insurance, mutual funds, and more — without confusion or hidden terms.',
              'We partner with RBI-registered banks and insurers to bring you the best prices, expert guidance, and a seamless digital experience from comparison to application.',
              'Today, thousands of customers and agents use RFINCARE every day to plan smarter and achieve their financial goals.',
            ]).map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-[var(--color-brand-green-dark)] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-white/90 mb-8">Join millions of Indians who trust RFINCARE for their financial journey</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-white text-[var(--color-brand-green)] hover:bg-white/90" onClick={() => openAssessmentOrEligibilityFirst(navigate)}>
              Check Eligibility
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10" onClick={() => navigate('/contact-us')}>
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
};

export default AboutUs;
