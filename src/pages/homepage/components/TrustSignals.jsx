import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { homepageService } from '../../../services/homepageService';
import { bankService } from '../../../services/apiServices';
import { getBankLogoAlt, getBankLogoUrl } from '../../../utils/bankBranding';

const DEFAULT_STATISTICS = [
  {
    id: 'applications',
    value: '50,000+',
    label: 'Applications Processed',
    icon: 'FileCheck',
    color: 'var(--color-primary)'
  },
  {
    id: 'approval',
    value: '87%',
    label: 'Average Approval Rate',
    icon: 'TrendingUp',
    color: 'var(--color-success)'
  },
  {
    id: 'processing',
    value: '48 Hours',
    label: 'Average Processing Time',
    icon: 'Clock',
    color: 'var(--color-secondary)'
  },
  {
    id: 'satisfaction',
    value: '4.8/5',
    label: 'Customer Satisfaction',
    icon: 'Star',
    color: 'var(--color-warning)'
  }];


const DEFAULT_CERTIFICATIONS = [
  {
    id: 'ssl',
    name: 'SSL Secured',
    icon: 'Lock',
    description: '256-bit encryption'
  },
  {
    id: 'pci',
    name: 'PCI Compliant',
    icon: 'CreditCard',
    description: 'Payment security'
  },
  {
    id: 'iso',
    name: 'ISO 27001',
    icon: 'Shield',
    description: 'Information security'
  },
  {
    id: 'gdpr',
    name: 'GDPR Compliant',
    icon: 'FileText',
    description: 'Data protection'
  }];

const TrustSignals = () => {
  const [statistics, setStatistics] = useState(DEFAULT_STATISTICS);
  const [certifications, setCertifications] = useState(DEFAULT_CERTIFICATIONS);
  const [heading, setHeading] = useState('Trusted by Thousands');
  const [subtitle, setSubtitle] = useState(
    'Our commitment to security, transparency, and customer success speaks for itself',
  );
  const [bankPartners, setBankPartners] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await homepageService.getTrustSignals();
        if (cancelled || !data) return;
        setHeading(data.heading || 'Trusted by Thousands');
        setSubtitle(
          data.subtitle ||
            'Our commitment to security, transparency, and customer success speaks for itself',
        );
        if (Array.isArray(data.stats) && data.stats.length) {
          setStatistics(data.stats);
        }
        if (Array.isArray(data.certifications) && data.certifications.length) {
          setCertifications(data.certifications);
        }
      } catch {
        /* fallback to defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const banks = await bankService.getActiveBanks({ includeProducts: false });
        if (cancelled || !Array.isArray(banks)) return;
        const mapped = banks
          .map((bank) => ({
            id: bank?.id,
            name: bank?.name,
            logo: getBankLogoUrl(bank),
            logoAlt: getBankLogoAlt(bank),
            years: bank?.partnershipDuration || bank?.partnership_duration || '-',
            volume: bank?.customersServed || bank?.customers_served || '-',
            displayPriority: bank?.displayPriority || bank?.display_priority || 0,
          }))
          .sort((a, b) => b.displayPriority - a.displayPriority)
          .slice(0, 4);
        setBankPartners(mapped);
      } catch {
        setBankPartners([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);


  return (
    <section className="bg-background py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
            {heading}
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
          {statistics?.map((stat) =>
          <div key={stat?.id} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full mb-3 md:mb-4" style={{ backgroundColor: `${stat?.color}20` }}>
                <Icon name={stat?.icon} size={24} color={stat?.color} />
              </div>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1 md:mb-2">
                {stat?.value}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                {stat?.label}
              </div>
            </div>
          )}
        </div>

        <div className="bg-muted rounded-2xl p-6 md:p-8 lg:p-10 mb-12 md:mb-16">
          <h3 className="text-xl md:text-2xl font-bold text-foreground text-center mb-6 md:mb-8">
            Security & Compliance Certifications
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {certifications?.map((cert) =>
            <div key={cert?.id} className="trust-badge flex-col text-center">
                <Icon name={cert?.icon} size={32} color="var(--color-primary)" className="mb-3" />
                <div className="font-semibold text-sm md:text-base text-foreground mb-1">{cert?.name}</div>
                <div className="text-xs text-muted-foreground">{cert?.description}</div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground text-center mb-6 md:mb-8">
            Our Banking Partners
          </h3>
          {bankPartners.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">No active partner banks configured.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {bankPartners?.map((bank) =>
              <div key={bank?.id} className="feature-card text-center">
                  <div className="w-full h-16 md:h-20 mb-4 flex items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {bank?.logo ? (
                      <Image
                        src={bank?.logo}
                        alt={bank?.logoAlt}
                        className="w-full h-full object-contain p-2" />
                    ) : (
                      <Icon name="Building2" size={24} className="text-muted-foreground" />
                    )}
                  </div>
                  <h4 className="font-semibold text-sm md:text-base text-foreground mb-2 line-clamp-2">
                    {bank?.name}
                  </h4>
                  <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Icon name="Calendar" size={12} />
                      <span>{bank?.years}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Icon name="FileCheck" size={12} />
                      <span>{bank?.volume}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>);

};

export default TrustSignals;