import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MarketplacePageShell from '../../components/layout/MarketplacePageShell';
import { MarketplaceFilterSidebar, MarketplaceSearchInput } from '../../components/marketplace/MarketplacePageHelpers';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import GuestResumeBanner from '../../components/GuestResumeBanner';
import MarketplaceProductGrid from '../../components/marketplace/MarketplaceProductGrid';
import MarketplaceCompareBoard from '../../components/marketplace/compare/MarketplaceCompareBoard';
import MarketplaceLeadWizard from '../../components/marketplace/MarketplaceLeadWizard';
import { governmentSchemeService } from '../../services/governmentSchemeService';
import { GOVERNMENT_SCHEME_PRODUCT_GRID } from '../../constants/governmentSchemeLeadFlow';
import { DEFAULT_GOVERNMENT_SCHEME_FILTERS, getCategoryLabel } from '../../constants/governmentSchemeMarketplace';
import { formatInterestRate, resetGovernmentSchemeFilters } from '../../utils/governmentSchemeFilters';
import { completeGovernmentSchemeApply } from '../../utils/governmentSchemeApplyFlow';
import { loadMarketplaceProfile, saveMarketplaceProfile } from '../../utils/marketplaceLeadSession';
import { listMarketplaceResumeSessions, loadCompareBasket } from '../../utils/guestSessionResume';

const MAX_COMPARE = 3;

const GovernmentSchemesMarketplacePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [profile, setProfile] = useState(() => loadMarketplaceProfile('government_scheme'));
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pendingScheme, setPendingScheme] = useState(null);
  const [resumeSessions, setResumeSessions] = useState(() => listMarketplaceResumeSessions('government_scheme', { includeCalculators: false }));
  const refreshResumeSessions = () => setResumeSessions(listMarketplaceResumeSessions('government_scheme', { includeCalculators: false }));
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_GOVERNMENT_SCHEME_FILTERS,
    category: searchParams.get('category') || 'all',
  }));

  const loadSchemes = useCallback(async () => {
    setLoading(true);
    try {
      const list = await governmentSchemeService.listActive(filters);
      setSchemes(Array.isArray(list) ? list : []);
    } catch {
      setSchemes([]);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    loadSchemes();
  }, [loadSchemes]);

  useEffect(() => {
    if (schemes.length === 0) return;
    const saved = loadCompareBasket('government_scheme');
    if (!saved?.selectedIds?.length) return;
    const validIds = saved.selectedIds.filter((id) => schemes.some((s) => s.id === id));
    if (validIds.length >= 2) {
      setSelected(validIds);
      setShowCompare(true);
    }
  }, [schemes]);

  useEffect(() => {
    const cat = filters.category;
    if (cat && cat !== 'all') setSearchParams({ category: cat }, { replace: true });
    else setSearchParams({}, { replace: true });
  }, [filters.category, setSearchParams]);

  const categoryCounts = useMemo(() => {
    const counts = { all: schemes.length };
    for (const s of schemes) {
      for (const slug of s.categories || []) counts[slug] = (counts[slug] || 0) + 1;
    }
    return counts;
  }, [schemes]);

  const handleCategorySelect = (item) => {
    setFilters((prev) => ({ ...prev, category: item.slug }));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        if (next.length < 2) setShowCompare(false);
        return next;
      }
      if (prev.length >= MAX_COMPARE) return prev;
      const next = [...prev, id];
      if (next.length >= 2) setShowCompare(true);
      return next;
    });
  };

  const selectedSchemes = useMemo(
    () => selected.map((id) => schemes.find((s) => s.id === id)).filter(Boolean),
    [schemes, selected],
  );

  const filteredSchemes = useMemo(() => {
    const search = filters.search?.trim().toLowerCase();
    const cat = filters.category;
    return schemes.filter((s) => {
      if (cat && cat !== 'all' && !(s.categories || []).includes(cat)) return false;
      if (search) {
        const hay = `${s.name || ''} ${s.ministryName || ''} ${s.description || ''} ${s.highlights || ''}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }, [schemes, filters.category, filters.search]);

  const onClearSelection = () => {
    setSelected([]);
    setShowCompare(false);
  };

  const handleSchemeApply = useCallback(async (scheme) => {
    const activeProfile = profile || loadMarketplaceProfile('government_scheme');
    if (!activeProfile?.verifiedAt) {
      setPendingScheme(scheme);
      setWizardOpen(true);
      return;
    }
    await completeGovernmentSchemeApply(scheme, activeProfile);
  }, [profile]);

  const handleWizardComplete = useCallback(async (completedProfile) => {
    const saved = saveMarketplaceProfile('government_scheme', {
      ...completedProfile,
      productLabel: pendingScheme?.name || completedProfile.productLabel,
      productCategory: pendingScheme?.categories?.[0] || completedProfile.productCategory,
    });
    setProfile(saved);
    setWizardOpen(false);
    const scheme = pendingScheme;
    setPendingScheme(null);
    if (scheme) {
      await completeGovernmentSchemeApply(scheme, saved);
    }
  }, [pendingScheme]);

  const filterSidebar = (
    <MarketplaceFilterSidebar resultCount={filteredSchemes.length} onClear={() => setFilters(resetGovernmentSchemeFilters())}>
      <MarketplaceSearchInput
        value={filters.search}
        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        placeholder="Search scheme or ministry…"
      />
    </MarketplaceFilterSidebar>
  );

  return (
    <>
    <MarketplacePageShell
      breadcrumbs={[{ label: 'Home', path: '/homepage' }, { label: 'Government Schemes' }]}
      title="Government Schemes"
      subtitle="Compare central and state government schemes for loans, subsidies, pensions, and insurance."
      benefits={[
        { icon: 'Landmark', label: 'Govt. Backed', sub: 'Official programs' },
        { icon: 'IndianRupee', label: 'Subsidies & Loans', sub: 'Financial support' },
        { icon: 'Users', label: 'For All Citizens', sub: 'Wide eligibility' },
        { icon: 'ShieldCheck', label: 'Trusted Schemes', sub: 'Verified listings' },
      ]}
      resultCount={`${filteredSchemes.length} Government Schemes`}
      filterSidebar={filterSidebar}
      ctaTitle="Need help finding the right government scheme?"
      ctaButtonLabel="Get Free Guidance"
    >
        {resumeSessions.length > 0 ? <GuestResumeBanner sessions={resumeSessions} onDismiss={refreshResumeSessions} /> : null}
        <MarketplaceProductGrid
          items={[
            { slug: 'all', label: 'All', icon: 'LayoutGrid' },
            ...GOVERNMENT_SCHEME_PRODUCT_GRID,
          ].map((x) => (x.slug === 'all' ? x : { ...x, badge: categoryCounts[x.slug] ? String(categoryCounts[x.slug]) : null }))}
          onSelect={(item) => {
            if (item.slug === 'all') setFilters((prev) => ({ ...prev, category: 'all' }));
            else handleCategorySelect(item);
          }}
          title="Choose a scheme category"
          subtitle="Loans, subsidies, pensions, and social security programs"
        />

        <MarketplaceCompareBoard
          type="government_scheme"
          products={filteredSchemes}
          loading={loading}
          selectedIds={selected}
          selectedProducts={selectedSchemes}
          showCompare={showCompare}
          onToggleCompare={() => setShowCompare((v) => !v)}
          onToggleSelect={toggleSelect}
          onClearSelection={onClearSelection}
          onApply={handleSchemeApply}
          context={{}}
          renderGridCard={(scheme, isSelected) => (
            <div
              key={scheme.id}
              className={`rounded-xl border bg-card p-4 space-y-3 ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
            >
              <div>
                <p className="text-xs font-bold text-primary uppercase">{scheme.ministryName || 'Government of India'}</p>
                <h3 className="font-bold">{scheme.name}</h3>
                {scheme.interestRate != null ? (
                  <p className="text-sm text-muted-foreground mt-1">{formatInterestRate(scheme.interestRate)}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="default" onClick={() => handleSchemeApply(scheme)}>
                  Apply / Enquire
                </Button>
                <Button
                  size="sm"
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => toggleSelect(scheme.id)}
                >
                  {isSelected ? 'Selected' : 'Compare'}
                </Button>
              </div>
            </div>
          )}
        />
    </MarketplacePageShell>

      <MarketplaceLeadWizard
        open={wizardOpen}
        onClose={() => { setWizardOpen(false); setPendingScheme(null); }}
        onComplete={handleWizardComplete}
        marketplaceType="government_scheme"
        productLabel={pendingScheme?.name}
        productCategory={pendingScheme?.categories?.[0]}
      />
    </>
  );
};

export default GovernmentSchemesMarketplacePage;
