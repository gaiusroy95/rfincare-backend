import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { bankService } from '../../../services/apiServices';
import { getBankLogoAlt, getBankLogoUrl } from '../../../utils/bankBranding';
import { getBankTypeLabel } from '../../../constants/bankTypes';

const PartnersSection = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bankService?.getActiveBanks({ includeProducts: false });
      
      // Transform bank data to partners format
      const transformedPartners = data?.map(bank => ({
        id: bank?.id,
        name: bank?.name,
        logo: getBankLogoUrl(bank),
        logoAlt: getBankLogoAlt(bank),
        displayPriority: bank?.displayPriority || bank?.display_priority || 0,
        type: getBankTypeLabel(bank?.bankType) === '—' ? 'Bank' : getBankTypeLabel(bank?.bankType),
        rating: bank?.rating || 4.5,
        customers: bank?.customersServed || '10K+'
      })) || [];
      
      // Sort by display priority and limit to top 6
      const sortedPartners = transformedPartners
        ?.sort((a, b) => (b?.displayPriority || 0) - (a?.displayPriority || 0))
        ?.slice(0, 6);
      
      setPartners(sortedPartners);
    } catch (err) {
      console.error('Error loading partners:', err);
      setError('Failed to load banking partners');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Banking Partners
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We partner with India's leading banks to bring you the best loan offers
            </p>
          </div>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading banking partners...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Banking Partners
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We partner with India's leading banks to bring you the best loan offers
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-error mb-4">{error}</p>
            <Button onClick={loadPartners} iconName="RefreshCw">
              Retry
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Banking Partners
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We partner with India's leading banks to bring you the best loan offers
          </p>
        </div>

        {partners?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No banking partners available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {partners?.map((partner) =>
            <div key={partner?.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4 overflow-hidden">
                  {partner?.logo ? (
                    <img
                      src={partner?.logo}
                      alt={partner?.logoAlt}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <Icon name="Building2" size={26} className="text-muted-foreground" />
                  )}
                
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2">{partner?.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{partner?.type}</p>
                <div className="flex items-center gap-1 mb-2">
                  <Icon name="Star" size={14} color="#fbbf24" />
                  <span className="text-xs font-semibold">{partner?.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">{partner?.customers} customers</span>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-12">
          <Button
            variant="default"
            size="lg"
            iconName="Building2"
            iconPosition="left"
            onClick={() => navigate('/bank-marketplace')}>
            
            View All Partners
          </Button>
        </div>
      </div>
    </section>);

};

export default PartnersSection;