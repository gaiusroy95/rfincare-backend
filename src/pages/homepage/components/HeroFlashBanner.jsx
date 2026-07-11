import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const BENEFIT_SLIDES = [
  {
    id: 'one-portal',
    slogan: 'One portal for loans, investments & insurance',
    subline: 'Compare, apply and track everything in your Rfincare account.',
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
    imageAlt: 'Family reviewing finances together on a laptop',
    cta: 'Explore portal',
    path: '/customer-login',
  },
  {
    id: 'trusted-partners',
    slogan: 'RBI registered partners you can trust',
    subline: 'Bank-grade security with India’s leading financial institutes.',
    image:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80',
    imageAlt: 'Secure banking and digital payments',
    cta: 'View partners',
    path: '/bank-marketplace',
  },
  {
    id: 'cibil-expert',
    slogan: 'Free CIBIL check & expert guidance',
    subline: 'Know your score instantly and talk to advisors when you need help.',
    image:
      'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=1200&q=80',
    imageAlt: 'Person checking credit score on a laptop',
    cta: 'Book expert',
    path: '/book-appointment',
  },
  {
    id: 'compare-save',
    slogan: 'Plan smarter. Compare better. Save more',
    subline: 'Loan Planner and Tax Saving tools help you choose the right path.',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
    imageAlt: 'Professional planning finances at a desk',
    cta: 'Start planning',
    path: '/eligibility-assessment',
  },
];

const AUTO_MS = 5200;

const HeroFlashBanner = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((next) => {
    setIndex((prev) => {
      const len = BENEFIT_SLIDES.length;
      return ((typeof next === 'number' ? next : prev + 1) + len) % len;
    });
  }, []);

  useEffect(() => {
    if (paused) return undefined;
    const id = window.setInterval(() => goTo(), AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, goTo]);

  const slide = BENEFIT_SLIDES[index];

  return (
    <div
      className="rf-hero-flash"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Rfincare portal benefits"
    >
      {BENEFIT_SLIDES.map((item, i) => (
        <div
          key={item.id}
          className={`rf-hero-flash-slide ${i === index ? 'rf-hero-flash-slide--active' : ''}`}
          aria-hidden={i !== index}
        >
          <img src={item.image} alt={item.imageAlt} className="rf-hero-flash-image" />
        </div>
      ))}

      <div className="rf-hero-flash-overlay" />

      <div className="rf-hero-flash-content">
        <p className="rf-hero-flash-eyebrow">Rfincare portal benefits</p>
        <h3 className="rf-hero-flash-slogan">{slide.slogan}</h3>
        <p className="rf-hero-flash-sub">{slide.subline}</p>
        <button
          type="button"
          className="rf-hero-flash-cta"
          onClick={() => navigate(slide.path)}
        >
          {slide.cta}
          <Icon name="ArrowRight" size={14} />
        </button>
      </div>

      <div className="rf-hero-flash-controls">
        <button
          type="button"
          className="rf-hero-flash-nav"
          aria-label="Previous benefit"
          onClick={() => goTo(index - 1)}
        >
          <Icon name="ChevronLeft" size={16} />
        </button>
        <div className="rf-hero-flash-dots" role="tablist" aria-label="Benefit slides">
          {BENEFIT_SLIDES.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show benefit ${i + 1}`}
              className={`rf-hero-flash-dot ${i === index ? 'rf-hero-flash-dot--active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="rf-hero-flash-nav"
          aria-label="Next benefit"
          onClick={() => goTo(index + 1)}
        >
          <Icon name="ChevronRight" size={16} />
        </button>
      </div>
    </div>
  );
};

export default HeroFlashBanner;
