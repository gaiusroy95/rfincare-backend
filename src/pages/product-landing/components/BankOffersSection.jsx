import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import BankComparisonPanel from '../../../components/bank-comparison/BankComparisonPanel';
import { bankService } from '../../../services/apiServices';
import { buildBankOffers, formatLoanAmount } from '../../../utils/bankOffers';
import { listMarketplaceOffers } from '../../../utils/bankMarketplace';
import { listCreditCardMarketplaceOffers } from '../../../utils/creditCardMarketplace';
import { creditCardService } from '../../../services/creditCardService';
import { getBankProbabilityMap, loadEligibilityResults } from '../../../services/leadService';
import { openMarketplaceApply } from '../../../utils/eligibilityGate';
import { MAX_BANK_COMPARE } from '../../../constants/bankComparison';

const BankOffersSection = ({ product }) => {
  const navigate = useNavigate();
  const [banks, setBanks] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [compareList, setCompareList] = useState([]);
  const comparisonSectionRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const isCreditCardProduct = product.apiKey === 'credit_card';
        const [data, cards] = await Promise.all([
          bankService.getActiveBanks({
            loanType: isCreditCardProduct ? undefined : product.slug,
          }),
          isCreditCardProduct ? creditCardService.listActive().catch(() => []) : Promise.resolve([]),
        ]);
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          setBanks(list);
          setCreditCards(Array.isArray(cards) ? cards : []);
          setCompareList([]);
        }
      } catch {
        if (!cancelled) setError('Unable to load bank offers right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product.slug, product.apiKey]);

  const eligibility = loadEligibilityResults();
  const probabilityMap = getBankProbabilityMap(eligibility);

  const marketplaceBanks = useMemo(() => {
    if (product.apiKey === 'credit_card') {
      return listCreditCardMarketplaceOffers(creditCards, banks);
    }
    return listMarketplaceOffers(banks, product.slug, probabilityMap);
  }, [banks, creditCards, product.slug, product.apiKey, probabilityMap]);

  const offers = useMemo(() => {
    if (product.apiKey === 'credit_card') {
      return marketplaceBanks.map((card) => ({
        bankId: card.creditCardId || card.productId,
        productId: card.productId,
        bankName: card.name,
        productName: card.productName,
        logoUrl: card.logo,
        logoAlt: card.logoAlt,
        interestLabel: card.interestRateLabel ? `${card.interestRateLabel}% p.m.` : 'On request',
        maxAmount: card.annualFeeLabel,
        maxTenure: card.cardNetwork,
        features: card.features,
        isFeatured: (card.displayPriority ?? 0) > 0,
        applyUrl: card.applyUrl,
        isCreditCard: true,
      }));
    }
    return buildBankOffers(banks, product);
  }, [banks, marketplaceBanks, product]);

  const comparedBanks = marketplaceBanks.filter((b) =>
    compareList.includes(product.apiKey === 'credit_card' ? b.creditCardId : b.id),
  );

  const scrollToComparison = () => {
    comparisonSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCompareToggle = (bankId) => {
    setCompareList((prev) => {
      let next;
      if (prev.includes(bankId)) {
        next = prev.filter((id) => id !== bankId);
      } else if (prev.length >= MAX_BANK_COMPARE) {
        return prev;
      } else {
        next = [...prev, bankId];
      }
      if (next.length >= 2) {
        setTimeout(scrollToComparison, 100);
      }
      return next;
    });
  };

  const handleApply = (bank) => {
    if (bank?.isCreditCard) {
      const url = bank.applyUrl || marketplaceBanks.find((c) => c.creditCardId === bank.id)?.applyUrl;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    openMarketplaceApply(navigate, {
      bank,
      loanType: product.apiKey,
      slug: product.slug,
      state: {
        selectedBank: bank,
        loanType: product.apiKey,
        eligibilityData: eligibility?.formData,
      },
    });
  };

  const qs = `loanType=${product.slug}`;

  return (
    <section className="py-12 md:py-16 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
              Partner banks
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {product.label} offers from leading banks
            </h2>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Select up to 3 banks and compare rates, fees, and features on this page — no need to
              open a separate screen.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {compareList.length > 0 && (
              <Button variant="default" iconName="GitCompare" onClick={scrollToComparison}>
                View comparison ({compareList.length})
              </Button>
            )}
            <Button
              variant="outline"
              iconName="Building2"
              onClick={() => navigate(`/bank-marketplace?${qs}`)}
            >
              Full marketplace
            </Button>
          </div>
        </div>

        <div ref={comparisonSectionRef} className="mb-8">
          <BankComparisonPanel
            productLabel={product.label}
            banks={comparedBanks}
            rawBanks={marketplaceBanks.filter((b) =>
              compareList.includes(product.apiKey === 'credit_card' ? b.creditCardId : b.id),
            )}
            onApply={handleApply}
            onRemoveBank={(id) => setCompareList((p) => p.filter((x) => x !== id))}
            onClearAll={() => setCompareList([])}
            compareCount={compareList.length}
            maxCompare={MAX_BANK_COMPARE}
          />
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl border border-border bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && offers.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <Icon name="Building2" size={40} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Partner bank products for {product.label.toLowerCase()} will appear here soon.
            </p>
            <Button onClick={() => navigate(`/bank-marketplace?${qs}`)}>Browse bank marketplace</Button>
          </div>
        )}

        {!loading && !error && offers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => {
              const isComparing = compareList.includes(offer.bankId);
              const compareFull = compareList.length >= MAX_BANK_COMPARE && !isComparing;
              return (
                <article
                  key={`${offer.bankId}-${offer.productId || 'default'}`}
                  className={`group relative flex flex-col rounded-2xl border bg-card shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
                    isComparing ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => !compareFull && handleCompareToggle(offer.bankId)}
                    disabled={compareFull}
                    title={compareFull ? `Maximum ${MAX_BANK_COMPARE} banks in comparison` : undefined}
                    className={`absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                      isComparing
                        ? 'bg-primary text-primary-foreground border-primary'
                        : compareFull
                          ? 'bg-muted border-border text-muted-foreground opacity-60 cursor-not-allowed'
                          : 'bg-card border-border text-muted-foreground hover:border-primary'
                    }`}
                    aria-pressed={isComparing}
                  >
                    <Icon name={isComparing ? 'CheckSquare' : 'Square'} size={14} />
                    Compare
                  </button>
                  {offer.isFeatured && (
                    <span className="absolute top-0 left-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-br-lg">
                      Popular
                    </span>
                  )}
                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 mb-4 pr-16">
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {offer.logoUrl ? (
                          <Image
                            src={offer.logoUrl}
                            alt={offer.logoAlt || offer.bankName}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <Icon name="Building2" size={28} className="text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-foreground truncate">{offer.bankName}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{offer.productName}</p>
                      </div>
                    </div>

                    <div
                      className="rounded-xl p-4 mb-4"
                      style={{ backgroundColor: `${product.color}14` }}
                    >
                      <p className="text-xs font-medium text-muted-foreground mb-1">Interest rate</p>
                      <p className="text-xl font-bold" style={{ color: product.color }}>
                        {offer.interestLabel}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground text-xs flex items-center gap-1">
                          <Icon name="IndianRupee" size={12} className="text-primary shrink-0" />
                          Max amount
                        </p>
                        <p className="font-semibold text-foreground">
                          {formatLoanAmount(offer.maxAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Tenure</p>
                        <p className="font-semibold text-foreground">
                          {offer.maxTenure ? `Up to ${offer.maxTenure} yrs` : 'Flexible'}
                        </p>
                      </div>
                    </div>

                    {offer.features?.length > 0 && (
                      <ul className="space-y-1.5 mb-5 flex-1">
                        {offer.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-xs text-muted-foreground"
                          >
                            <Icon
                              name="Check"
                              size={14}
                              className="mt-0.5 shrink-0"
                              style={{ color: product.color }}
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex gap-2 mt-auto pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={compareFull}
                        onClick={() => handleCompareToggle(offer.bankId)}
                      >
                        {isComparing ? 'In comparison' : compareFull ? 'Compare full' : 'Add to compare'}
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => handleApply({
                        id: offer.bankId,
                        name: offer.bankName,
                        applyUrl: offer.applyUrl,
                        isCreditCard: offer.isCreditCard,
                      })}>
                        {offer.isCreditCard ? 'Apply on bank site' : 'Apply'}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default BankOffersSection;
