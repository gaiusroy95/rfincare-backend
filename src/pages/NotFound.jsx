import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/ui/Header';
import Footer from './homepage/components/Footer';
import Button from '../components/ui/Button';
import Icon from '../components/AppIcon';
import BrandLogo from '../components/ui/BrandLogo';

const NotFound = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { label: 'Home', path: '/', icon: 'Home' },
    { label: 'About Us', path: '/about-us', icon: 'Info' },
    { label: 'Contact Support', path: '/contact-us', icon: 'MessageCircle' },
    { label: 'Check Eligibility', path: '/eligibility-assessment', icon: 'CheckCircle' },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 py-16">
        <div className="text-center max-w-2xl">
          <div className="flex justify-center mb-8">
            <BrandLogo size="2xl" showTagline={false} />
          </div>

          <div className="relative mb-6">
            <h1 className="text-9xl font-bold text-[var(--color-brand-green)] opacity-15">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-full p-6 shadow-lg border border-border">
                <Icon name="AlertCircle" size={48} className="text-[var(--color-brand-green)]" />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-3">Page Not Found</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved or deleted.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              variant="default"
              icon={<Icon name="Home" />}
              iconPosition="left"
              onClick={() => navigate('/')}
              className="px-6 py-3 rf-btn-primary"
            >
              Back to Home
            </Button>
            <Button
              variant="outline"
              icon={<Icon name="ArrowLeft" />}
              iconPosition="left"
              onClick={() => window.history?.back()}
              className="px-6 py-3"
            >
              Go Back
            </Button>
          </div>

          <div className="border-t border-border pt-8">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
              Quick Links
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickLinks.map((link) => (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => navigate(link.path)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-emerald-50 transition-colors group"
                >
                  <div className="bg-emerald-50 p-3 rounded-full group-hover:bg-emerald-100 transition-colors">
                    <Icon name={link.icon} size={20} className="text-[var(--color-brand-green)]" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-[var(--color-brand-green)]">
                    {link.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 text-sm text-muted-foreground">
            <p>
              Need help?{' '}
              <button
                type="button"
                onClick={() => navigate('/contact-us')}
                className="text-[var(--color-brand-green)] hover:underline font-medium"
              >
                Contact our support team
              </button>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
