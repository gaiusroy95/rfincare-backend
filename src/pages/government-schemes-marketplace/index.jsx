import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        {resumeSessions.length > 0 ? (
          <GuestResumeBanner sessions={resumeSessions} onDismiss={refreshResumeSessions} />
        ) : null}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Government Schemes Marketplace</h1>
            <p className="text-sm text-muted-foreground">
              Compare central and state government schemes for loans, subsidies, pensions, and insurance. Select up to {MAX_COMPARE} to compare side by side.
            </p>
            {profile?.fullName ? (
              <p className="text-xs text-emerald-700 mt-2 inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                <Icon name="CheckCircle2" size={14} />
                Verified: {profile.phone} · {profile.email}
              </p>
            ) : null}
          </div>
          <Button variant="outline" onClick={() => navigate('/product-comparison')}>
            <Icon name="GitCompare" size={16} />
            Compare other products
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 md:p-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-[360px]">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Search scheme or ministry…"
                className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <Button variant="ghost" onClick={() => setFilters(resetGovernmentSchemeFilters())}>
              Reset
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            {filters.category !== 'all' ? (
              <>Showing <span className="font-semibold text-foreground">{getCategoryLabel(filters.category)}</span> · {filteredSchemes.length} options</>
            ) : (
              <>{filteredSchemes.length} options</>
            )}
          </div>
        </div>

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
      </div>

      <MarketplaceLeadWizard
        open={wizardOpen}
        onClose={() => { setWizardOpen(false); setPendingScheme(null); }}
        onComplete={handleWizardComplete}
        marketplaceType="government_scheme"
        productLabel={pendingScheme?.name}
        productCategory={pendingScheme?.categories?.[0]}
      />
    </div>
  );
};

export default GovernmentSchemesMarketplacePage;
