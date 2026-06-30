import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getLoanProductBySlug } from '../../constants/loanProducts';

import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import BankCard from './components/BankCard';
import BankListItem from './components/BankListItem';
import FilterPanel from './components/FilterPanel';
import SortBar from './components/SortBar';
import BankProductsModal from './components/BankProductsModal';
import BankComparisonPanel from '../../components/bank-comparison/BankComparisonPanel';
import { MAX_BANK_COMPARE } from '../../constants/bankComparison';
import { bankService } from '../../services/apiServices';
import { useAuth } from '../../contexts/AuthContext';
import {
  getMarketplaceCompareKey,
  listMarketplaceOffers,
} from '../../utils/bankMarketplace';
import { listCreditCardMarketplaceOffers } from '../../utils/creditCardMarketplace';
import { creditCardService } from '../../services/creditCardService';
import { getBankProbabilityMap, loadEligibilityResults, saveEligibilityResults } from '../../services/leadService';
import { homepageService } from '../../services/homepageService';
import MarketplaceEligibilityBanner from './components/MarketplaceEligibilityBanner';

function isAllFilterValue(value) {
  return value == null || value === '' || value === 'all';
}

function matchesNumericRange(value, actual) {
  if (isAllFilterValue(value)) return true;
  const parts = String(value).split('-').map((v) => v.replace('+', ''));
  const min = parseFloat(parts[0]);
  const max = parts[1] ? parseFloat(parts[1]) : null;
  if (Number.isNaN(min)) return true;
  const num = Number(actual);
  if (Number.isNaN(num)) return false;
  if (max != null && !Number.isNaN(max)) {
    return num >= min && num <= max;
  }
  return num >= min;
}

const BankMarketplace = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loanTypeSlug = searchParams.get('loanType');
  const activeProduct = getLoanProductBySlug(loanTypeSlug);
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('probability-desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const comparisonSectionRef = useRef(null);
  const [banks, setBanks] = useState([]);
  const [allOffers, setAllOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadSlowHint, setLoadSlowHint] = useState(false);
  const [selectedBankOffer, setSelectedBankOffer] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    productType: 'all',
    interestRate: 'all',
    probability: 'all',
    loanAmount: 'all',
    tenure: 'all',
    bankTypes: [],
    features: []
  });

  useEffect(() => {
    loadBanks();
  }, [loanTypeSlug]);

  const loadBanks = async () => {
    let slowTimer;
    try {
      setLoading(true);
      setLoadSlowHint(false);
      slowTimer = setTimeout(() => setLoadSlowHint(true), 4000);
      const [data, creditCards] = await Promise.all([
        bankService?.getActiveBanks({
          forceRefresh: true,
        }),
        creditCardService.listActive().catch(() => []),
      ]);
      const list = Array.isArray(data) ? data : [];
      const cardList = Array.isArray(creditCards) ? creditCards : [];

      let eligibility = loadEligibilityResults();
      if (!eligibility?.banks?.length && eligibility?.formData) {
        try {
          const recalc = await homepageService.calculateEligibility(eligibility.formData);
          if (recalc?.banks?.length) {
            saveEligibilityResults(recalc, eligibility.formData);
            eligibility = loadEligibilityResults();
          }
        } catch {
          /* use cached or empty map */
        }
      }
      const probabilityMap = getBankProbabilityMap(eligibility);
      const bankOffers = listMarketplaceOffers(list, loanTypeSlug, probabilityMap);
      const cardOffers = listCreditCardMarketplaceOffers(cardList, list);

      const isCreditCardView = loanTypeSlug === 'credit_card';
      const transformedOffers = isCreditCardView
        ? cardOffers
        : loanTypeSlug
          ? bankOffers
          : [...bankOffers, ...cardOffers];
      setAllOffers(transformedOffers);
      setBanks(transformedOffers);
    } catch (err) {
      setError(err?.message);
      setBanks([]);
      setAllOffers([]);
      console.error('Failed to load banks:', err);
    } finally {
      if (slowTimer) clearTimeout(slowTimer);
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      productType: 'all',
      interestRate: 'all',
      probability: 'all',
      loanAmount: 'all',
      tenure: 'all',
      bankTypes: [],
      features: []
    });
  };

  const handleViewBank = (offer) => {
    setSelectedBankOffer(offer);
  };

  const selectedBankProducts = useMemo(() => {
    if (!selectedBankOffer?.id) return [];
    const siblings = allOffers.filter((offer) => offer.id === selectedBankOffer.id);
    const activeKey = getMarketplaceCompareKey(selectedBankOffer);
    const active = siblings.find((offer) => getMarketplaceCompareKey(offer) === activeKey);
    const rest = siblings.filter((offer) => getMarketplaceCompareKey(offer) !== activeKey);
    return active ? [active, ...rest] : siblings;
  }, [allOffers, selectedBankOffer]);

  const selectedProductKey = selectedBankOffer
    ? getMarketplaceCompareKey(selectedBankOffer)
    : null;

  const scrollToComparison = () => {
    comparisonSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCompareToggle = (bank) => {
    const compareKey = getMarketplaceCompareKey(bank);
    setCompareList((prev) => {
      let next;
      if (prev?.includes(compareKey)) {
        next = prev.filter((key) => key !== compareKey);
      } else if (prev?.length >= MAX_BANK_COMPARE) {
        return prev;
      } else {
        next = [...prev, compareKey];
      }
      if (next.length >= 2) {
        setTimeout(scrollToComparison, 100);
      }
      return next;
    });
  };

  const handleRemoveFromCompare = (compareKey) => {
    setCompareList((prev) => prev.filter((key) => key !== compareKey));
  };

  const handleClearCompare = () => setCompareList([]);

  const handleApply = (bank) => {
    if (bank?.isCreditCard) {
      if (bank?.applyUrl) {
        window.open(bank.applyUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    const qs = activeProduct ? `?loanType=${activeProduct.slug}` : '';
    navigate(`/customer-assessment-portal${qs}`, {
      state: {
        selectedBank: bank,
        loanType: activeProduct?.apiKey,
        eligibilityData: loadEligibilityResults()?.formData,
      },
    });
  };

  const filteredAndSortedBanks = useMemo(() => {
    let result = [...banks];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result?.filter(
        (offer) =>
          offer?.name?.toLowerCase()?.includes(q) ||
          offer?.productName?.toLowerCase()?.includes(q) ||
          offer?.productCategoryLabel?.toLowerCase()?.includes(q),
      );
    }

    if (!isAllFilterValue(filters?.productType)) {
      result = result.filter(
        (offer) =>
          offer?.productCategorySlug === filters.productType ||
          offer?.loanType === filters.productType,
      );
    }

    if (!isAllFilterValue(filters?.interestRate)) {
      result = result.filter((offer) =>
        matchesNumericRange(filters.interestRate, offer?.interestRateMin ?? offer?.interestRate),
      );
    }

    if (!isAllFilterValue(filters?.probability)) {
      result = result.filter((bank) =>
        matchesNumericRange(filters.probability, bank?.probability)
      );
    }

    if (filters?.bankTypes?.length > 0) {
      result = result?.filter((bank) => filters?.bankTypes?.includes(bank?.type));
    }

    const [sortKey, sortOrder] = sortBy?.split('-');
    result?.sort((a, b) => {
      let aVal, bVal;
      if (sortKey === 'probability') {
        aVal = a?.probability;
        bVal = b?.probability;
      } else if (sortKey === 'interest') {
        aVal = a?.interestRateMin ?? a?.interestRate;
        bVal = b?.interestRateMin ?? b?.interestRate;
      } else if (sortKey === 'rating') {
        aVal = a?.rating;
        bVal = b?.rating;
      } else if (sortKey === 'name') {
        aVal = a?.name;
        bVal = b?.name;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [banks, filters, sortBy]);

  const comparedBanks = banks?.filter((bank) =>
    compareList?.includes(getMarketplaceCompareKey(bank)),
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <MarketplaceEligibilityBanner loanTypeSlug={loanTypeSlug} />
        {/* Page Header */}
        <div className="mb-6 md:mb-8 lg:mb-12">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3 md:mb-4">
            <button onClick={() => navigate('/homepage')} className="hover:text-primary transition-colors">
              Home
            </button>
            <Icon name="ChevronRight" size={16} />
            {activeProduct ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate(`/products/${activeProduct.slug}`)}
                  className="hover:text-primary transition-colors"
                >
                  {activeProduct.label}
                </button>
                <Icon name="ChevronRight" size={16} />
              </>
            ) : null}
            <span className="text-foreground font-medium">Bank Marketplace</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                {activeProduct ? `${activeProduct.label} — Compare Banks` : 'Find Your Perfect Lender'}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {activeProduct
                  ? activeProduct.apiKey === 'credit_card'
                    ? 'Compare credit cards from partner banks — fees, rewards, and apply links'
                    : `All ${activeProduct.label.toLowerCase()} products from partner banks`
                  : 'Compare every loan product and credit card from our trusted banking partners'}
              </p>
              {activeProduct && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => navigate('/bank-marketplace')}>
                    Show all loan types
                  </Button>
                  {activeProduct.apiKey !== 'credit_card' ? (
                    <Button size="sm" variant="outline" onClick={() => navigate(`/eligibility-assessment?loanType=${activeProduct.slug}`)}>
                      Check eligibility
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => navigate('/credit-cards')}>
                      Full card comparison
                    </Button>
                  )}
                </div>
              )}
            </div>

            {compareList?.length > 0 && (
              <Button
                variant="default"
                onClick={scrollToComparison}
                iconName="GitCompare"
                iconPosition="left"
                className="w-full md:w-auto"
              >
                View comparison ({compareList.length})
              </Button>
            )}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-card rounded-lg border border-border p-3 md:p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Icon name="Shield" size={24} className="text-success" />
            </div>
            <div className="text-lg md:text-xl font-bold text-foreground">100%</div>
            <div className="text-xs md:text-sm text-muted-foreground">Secure Process</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-3 md:p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Icon name="Building2" size={24} className="text-primary" />
            </div>
            <div className="text-lg md:text-xl font-bold text-foreground">25+</div>
            <div className="text-xs md:text-sm text-muted-foreground">Partner Banks</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-3 md:p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Icon name="Users" size={24} className="text-secondary" />
            </div>
            <div className="text-lg md:text-xl font-bold text-foreground">50K+</div>
            <div className="text-xs md:text-sm text-muted-foreground">Happy Customers</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-3 md:p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Icon name="Clock" size={24} className="text-accent" />
            </div>
            <div className="text-lg md:text-xl font-bold text-foreground">48hrs</div>
            <div className="text-xs md:text-sm text-muted-foreground">Avg. Approval</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)} />

          </div>

          {/* Bank Listings */}
          <div className="lg:col-span-3">
            <SortBar
              sortBy={sortBy}
              onSortChange={setSortBy}
              resultCount={filteredAndSortedBanks?.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            <div ref={comparisonSectionRef}>
              <BankComparisonPanel
                productLabel={activeProduct?.label}
                banks={comparedBanks}
                rawBanks={banks.filter((b) => compareList.includes(getMarketplaceCompareKey(b)))}
                onApply={handleApply}
                onRemoveBank={handleRemoveFromCompare}
                onClearAll={handleClearCompare}
                compareCount={compareList.length}
                maxCompare={MAX_BANK_COMPARE}
              />
            </div>

            {loading ? (
            <section className="bg-card rounded-lg border border-border p-8 md:p-12 text-center">
                <span className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading partner banks...</p>
                {loadSlowHint && (
                  <p className="text-xs text-muted-foreground mt-3 max-w-sm mx-auto">
                    First load may take a moment while the server wakes up. Repeat visits are faster.
                  </p>
                )}
              </section>
            ) : filteredAndSortedBanks?.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-8 md:p-12 text-center">
                <Icon name="Search" size={48} className="text-muted mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
                  {activeProduct?.apiKey === 'credit_card'
                    ? 'No credit cards match your filters'
                    : 'No loan products match your filters'}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground mb-6">
                  Try adjusting your filter criteria to see more options
                </p>
                <Button variant="outline" onClick={handleResetFilters} iconName="RotateCcw">
                  Reset Filters
                </Button>
              </div>
            ) : (

            <div className={
            viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6' : 'space-y-4 md:space-y-6'
            }>
                {filteredAndSortedBanks?.map((bank) =>
              viewMode === 'grid' ?
              <BankCard
                key={bank?.compareKey || bank?.productId || bank?.id}
                bank={bank}
                onApply={handleApply}
                onCompare={handleCompareToggle}
                onViewBank={handleViewBank}
                isComparing={compareList?.includes(getMarketplaceCompareKey(bank))}
              /> :


              <BankListItem
                key={bank?.compareKey || bank?.productId || bank?.id}
                bank={bank}
                onApply={handleApply}
                onCompare={handleCompareToggle}
                onViewBank={handleViewBank}
                isComparing={compareList?.includes(getMarketplaceCompareKey(bank))}
              />


              )}
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 md:mt-12 bg-primary/5 rounded-lg border border-primary/20 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name="HelpCircle" size={24} className="text-primary" />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
                Need Help Choosing?
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Our loan experts are available to help you understand your options and make the best decision for your financial needs.
              </p>
            </div>
            <Button variant="default" iconName="Phone" iconPosition="left" className="w-full md:w-auto">
              Talk to Expert
            </Button>
          </div>
        </div>
      </main>
      <BankProductsModal
        isOpen={Boolean(selectedBankOffer)}
        bankName={selectedBankOffer?.name}
        bankOffer={selectedBankOffer}
        products={selectedBankProducts}
        activeProductKey={selectedProductKey}
        onClose={() => setSelectedBankOffer(null)}
        onApply={(product) => {
          setSelectedBankOffer(null);
          handleApply(product);
        }}
      />
    </div>
  );

};

export default BankMarketplace;