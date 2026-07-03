import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import GuestResumeBanner from '../../components/GuestResumeBanner';
import { calculatorService } from '../../services/calculatorService';
import { PLANNING_HUBS } from '../../constants/planningHubs';
import { listGuestResumeSessions } from '../../utils/guestSessionResume';

const CATEGORY_ICONS = {
  loans: 'Landmark',
  investments: 'TrendingUp',
  tax: 'Receipt',
  retirement: 'Sunset',
  goals: 'Target',
  savings: 'PiggyBank',
  other: 'Calculator',
};

const FinancialCalculatorsHub = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({ calculators: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resumeSessions, setResumeSessions] = useState(() => listGuestResumeSessions());
  const activeCategory = searchParams.get('category') || 'all';

  useEffect(() => {
    calculatorService
      .listCalculators()
      .then(setData)
      .catch(() => setData({ calculators: [], categories: [] }))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = data.calculators || [];
    if (activeCategory !== 'all') list = list.filter((c) => c.category === activeCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q)
          || c.description?.toLowerCase().includes(q)
          || c.tags?.some((t) => t.includes(q)),
      );
    }
    return list;
  }, [data.calculators, activeCategory, search]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const calc of filtered) {
      const cat = calc.category || 'other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(calc);
    }
    return map;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="bg-gradient-to-br from-slate-800 via-slate-900 to-primary text-white py-14 md:py-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Icon name="Calculator" size={44} className="mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl md:text-5xl font-bold mb-3">Financial Calculators</h1>
            <p className="text-white/85 max-w-2xl mx-auto text-lg">
              {data.total || '50+'} free calculators for loans, investments, tax, retirement and wealth planning.
            </p>
          </div>
        </section>

        {resumeSessions.length > 0 && (
          <section className="py-6 border-b border-border bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <GuestResumeBanner
                sessions={resumeSessions}
                onDismiss={() => setResumeSessions(listGuestResumeSessions())}
              />
            </div>
          </section>
        )}

        <section className="py-8 border-b border-border bg-card/50 sticky top-16 z-20 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/resources/calculators')}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    activeCategory === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'
                  }`}
                >
                  All
                </button>
                {(data.categories || []).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => navigate(`/resources/calculators?category=${cat.id}`)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      activeCategory === cat.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="w-full md:max-w-xs">
                <Input
                  placeholder="Search calculators…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {PLANNING_HUBS.map((hub) => (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => navigate(hub.path)}
                  className="text-left p-5 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow"
                >
                  <Icon name={hub.icon} size={28} className="text-primary mb-2" />
                  <h3 className="font-bold">{hub.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{hub.subtitle}</p>
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground py-12">Loading calculators…</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No calculators match your search.</p>
            ) : (
              Array.from(grouped.entries()).map(([categoryId, calcs]) => {
                const catLabel = data.categories?.find((c) => c.id === categoryId)?.label || categoryId;
                return (
                  <div key={categoryId} className="mb-12">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Icon name={CATEGORY_ICONS[categoryId] || 'Calculator'} size={22} />
                      {catLabel}
                      <span className="text-sm font-normal text-muted-foreground">({calcs.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {calcs.map((calc) => (
                        <button
                          key={calc.slug}
                          type="button"
                          onClick={() => navigate(`/resources/calculators/${calc.slug}`)}
                          className="text-left bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow transition-all"
                        >
                          <h3 className="font-semibold text-foreground">{calc.title}</h3>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{calc.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FinancialCalculatorsHub;
