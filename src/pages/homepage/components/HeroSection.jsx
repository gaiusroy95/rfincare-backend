import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import CustomerStatusCheckModal from './CustomerStatusCheckModal';

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const heroSlides = [
    {
      title: t('hero.slide1Title'),
      subtitle: t('hero.slide1Subtitle'),
      cta: t('hero.slide1CTA'),
      icon: "TrendingUp"
    },
    {
      title: t('hero.slide2Title'),
      subtitle: t('hero.slide2Subtitle'),
      cta: t('hero.slide2CTA'),
      icon: "Shield"
    },
    {
      title: t('hero.slide3Title'),
      subtitle: t('hero.slide3Subtitle'),
      cta: t('hero.slide3CTA'),
      icon: "Target"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides?.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <section className="relative bg-gradient-to-br from-primary via-secondary to-accent text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left space-y-6 md:space-y-8">
              <div className="inline-flex items-center justify-center lg:justify-start space-x-3 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-scale-in">
                  <Icon name={heroSlides?.[currentSlide]?.icon} size={32} color="white" />
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight animate-fade-in">
                {heroSlides?.[currentSlide]?.title}
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto lg:mx-0 animate-fade-in">
                {heroSlides?.[currentSlide]?.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button
                  variant="default"
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg"
                  iconName="ArrowRight"
                  iconPosition="right"
                  onClick={() => navigate('/eligibility-assessment')}
                >
                  Check Eligibility
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white/10"
                  iconName="Search"
                  iconPosition="left"
                  onClick={() => setIsStatusModalOpen(true)}
                >
                  Check Status
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-4">
                <button
                  onClick={() => navigate('/about-us')}
                  className="text-sm text-white/80 hover:text-white underline transition-colors"
                >
                  About Us
                </button>
                <span className="text-white/40">•</span>
                <button
                  onClick={() => navigate('/contact-us')}
                  className="text-sm text-white/80 hover:text-white underline transition-colors"
                >
                  Contact Us
                </button>
                <span className="text-white/40">•</span>
                <button
                  onClick={() => navigate('/customer-login')}
                  className="text-sm text-white/80 hover:text-white underline transition-colors"
                >
                  Login
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-2 pt-6">
                {heroSlides?.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-2xl blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                        <Icon name="Check" size={20} color="white" />
                      </div>
                      <span className="text-sm md:text-base">{t('hero.instantEligibility')}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                        <Icon name="Check" size={20} color="white" />
                      </div>
                      <span className="text-sm md:text-base">{t('hero.compareMultiple')}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                        <Icon name="Check" size={20} color="white" />
                      </div>
                      <span className="text-sm md:text-base">{t('hero.secureDocuments')}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                        <Icon name="Check" size={20} color="white" />
                      </div>
                      <span className="text-sm md:text-base">{t('hero.realtimeTracking')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CustomerStatusCheckModal 
        isOpen={isStatusModalOpen} 
        onClose={() => setIsStatusModalOpen(false)} 
      />
    </>
  );
};

export default HeroSection;