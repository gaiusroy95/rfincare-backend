import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { homepageService } from '../../services/homepageService';

const AboutUs = () => {
  const navigate = useNavigate();
  const [aboutContent, setAboutContent] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    homepageService.getAboutContent().then(setAboutContent).catch(() => {});
  }, []);

  const values = aboutContent?.values || [
    {
      id: 'mission',
      icon: 'Target',
      title: 'Our Mission',
      description:
        'To simplify the loan application process and make financial services accessible to everyone across India.',
    },
    {
      id: 'vision',
      icon: 'Eye',
      title: 'Our Vision',
      description:
        "To become India's most trusted digital platform for loan comparison and application processing.",
    },
    {
      id: 'values',
      icon: 'Heart',
      title: 'Our Values',
      description:
        'Transparency, customer-first approach, innovation, and commitment to financial inclusion.',
    },
    {
      id: 'promise',
      icon: 'Shield',
      title: 'Our Promise',
      description:
        'Secure, fast, and reliable loan processing with complete transparency at every step.',
    },
  ];

  const stats = aboutContent?.stats || [
    { value: '50,000+', label: 'Happy Customers' },
    { value: '100+', label: 'Partner Banks' },
    { value: '₹500Cr+', label: 'Loans Processed' },
    { value: '98%', label: 'Satisfaction Rate' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {aboutContent?.heroTitle || 'About Rfincare'}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              {aboutContent?.heroSubtitle ||
                'Empowering Indians with smart financial solutions through technology and transparency'}
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats?.map((stat, index) => (
                <div key={stat?.id || index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat?.value}</div>
                  <div className="text-sm md:text-base text-gray-600">{stat?.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Drives Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values?.map((value, index) => (
                <div key={value?.id || index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Icon name={value?.icon} size={28} color="#6366f1" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value?.title}</h3>
                  <p className="text-gray-600">{value?.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">{aboutContent?.storyHeading || 'Our Story'}</h2>
            <div className="space-y-6 text-gray-700 leading-relaxed">
              {(aboutContent?.storyParagraphs || [
                'Founded in 2020, Rfincare emerged from a simple observation: getting a loan in India was unnecessarily complicated. Multiple bank visits, endless paperwork, and lack of transparency made the process frustrating for millions.',
                'We set out to change this. By leveraging technology and building strong partnerships with leading financial institutions, we created a platform that puts customers first. Today, we help thousands of Indians find the right loan products, compare options transparently, and complete applications digitally.',
                'Our team of financial experts, technology professionals, and customer service specialists work tirelessly to ensure every customer gets personalized guidance and the best possible loan terms for their unique situation.',
              ]).map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg mb-8">Join thousands of satisfied customers who found their perfect loan with us</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="default"
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => navigate('/customer-assessment-portal')}
              >
                Check Eligibility
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white/10"
                onClick={() => navigate('/contact-us')}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;