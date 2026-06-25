import React, { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { cmsService } from '../../../services/cmsService';
import { clearMarketingSettingsCache } from '../../../lib/marketingAnalytics';

const emptyCampaign = () => ({
  id: `camp-${Date.now()}`,
  name: '',
  platform: 'google',
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  utmContent: '',
  utmTerm: '',
  notes: '',
  active: true,
});

const emptyTag = () => ({
  id: `tag-${Date.now()}`,
  name: '',
  placement: 'head',
  scriptHtml: '',
  enabled: true,
});

const emptyPageSeo = () => ({
  path: '/',
  title: '',
  description: '',
  keywords: '',
  ogImage: '',
  robots: '',
});

export default function MarketingSeoTab() {
  const [form, setForm] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [subTab, setSubTab] = useState('analytics');

  const load = async () => {
    const [settings, stats] = await Promise.all([
      cmsService.marketing.get(),
      cmsService.marketing.getAnalytics(30).catch(() => null),
    ]);
    setForm(settings);
    setAnalytics(stats);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await cmsService.marketing.update(form);
      clearMarketingSettingsCache();
      setMessage('Marketing & SEO settings saved. Changes apply on the website and app within a minute.');
      await load();
    } catch (err) {
      setMessage(err?.response?.data?.error || err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const updateList = (key, index, patch) => {
    setForm((prev) => {
      const list = [...(prev[key] || [])];
      list[index] = { ...list[index], ...patch };
      return { ...prev, [key]: list };
    });
  };

  const addListItem = (key, factory) => {
    setForm((prev) => ({ ...prev, [key]: [...(prev[key] || []), factory()] }));
  };

  const removeListItem = (key, index) => {
    setForm((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== index),
    }));
  };

  if (!form) {
    return <p className="text-sm text-muted-foreground">Loading marketing settings…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {['analytics', 'google', 'meta', 'seo', 'campaigns', 'tags'].map((t) => (
          <Button key={t} variant={subTab === t ? 'default' : 'outline'} size="sm" onClick={() => setSubTab(t)}>
            {t === 'analytics' ? 'Ad results' : t === 'google' ? 'Google Analytics' : t === 'meta' ? 'Meta Ads' : t === 'seo' ? 'SEO' : t === 'campaigns' ? 'Ad campaigns' : 'Custom tags'}
          </Button>
        ))}
      </div>

      {message ? (
        <p className={`text-sm p-3 rounded border ${message.includes('saved') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
          {message}
        </p>
      ) : null}

      {subTab === 'analytics' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Events tracked on the website and mobile app (page views, leads, applications). For full ad dashboards, also use
            {' '}
            <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Analytics</a>
            {' '}
            and
            {' '}
            <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="text-primary underline">Meta Events Manager</a>.
          </p>
          {analytics ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-2xl font-bold">{analytics.totals?.total ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Total events (30 days)</p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-2xl font-bold">{analytics.totals?.pageViews ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Page views</p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-2xl font-bold">{analytics.totals?.conversions ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Leads / conversions</p>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">By ad campaign (UTM)</h3>
                {(analytics.byCampaign || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No campaign traffic yet. Add UTM parameters to your ad links (see Ad campaigns tab).</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2">Campaign</th>
                        <th>Source</th>
                        <th>Medium</th>
                        <th className="text-right">Events</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.byCampaign.map((row, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2">{row.campaign}</td>
                          <td>{row.source || '—'}</td>
                          <td>{row.medium || '—'}</td>
                          <td className="text-right font-medium">{row.events}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="border rounded-lg p-4 max-h-64 overflow-auto">
                <h3 className="font-semibold mb-3">Recent events</h3>
                <ul className="text-xs space-y-1">
                  {(analytics.recent || []).map((e) => (
                    <li key={e.id} className="flex justify-between gap-2 border-b border-border/30 py-1">
                      <span>{e.eventName} · {e.platform}</span>
                      <span className="text-muted-foreground shrink-0">{e.utmCampaign || e.pagePath || ''}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Analytics data unavailable.</p>
          )}
        </div>
      )}

      {subTab === 'google' && (
        <div className="space-y-4 border rounded-lg p-4 max-w-xl">
          <h3 className="font-semibold">Google Analytics 4</h3>
          <p className="text-xs text-muted-foreground">
            Find your Measurement ID in Google Analytics → Admin → Data streams (format G-XXXXXXXXXX).
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.gaEnabled} onChange={(e) => setForm({ ...form, gaEnabled: e.target.checked })} />
            Enable Google Analytics on website &amp; app
          </label>
          <Input label="GA4 Measurement ID" value={form.gaMeasurementId || ''} onChange={(e) => setForm({ ...form, gaMeasurementId: e.target.value })} placeholder="G-XXXXXXXXXX" />
          <Input label="Google Tag Manager ID (optional)" value={form.gtmContainerId || ''} onChange={(e) => setForm({ ...form, gtmContainerId: e.target.value })} placeholder="GTM-XXXXXXX" />
        </div>
      )}

      {subTab === 'meta' && (
        <div className="space-y-4 border rounded-lg p-4 max-w-xl">
          <h3 className="font-semibold">Meta (Facebook) Pixel</h3>
          <p className="text-xs text-muted-foreground">
            Find your Pixel ID in Meta Events Manager → Data sources → your pixel.
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.metaPixelEnabled} onChange={(e) => setForm({ ...form, metaPixelEnabled: e.target.checked })} />
            Enable Meta Pixel on website &amp; app
          </label>
          <Input label="Meta Pixel ID" value={form.metaPixelId || ''} onChange={(e) => setForm({ ...form, metaPixelId: e.target.value })} placeholder="123456789012345" />
          <Input label="Conversions API token (optional, server-side)" type="password" value={form.metaConversionsApiToken || ''} onChange={(e) => setForm({ ...form, metaConversionsApiToken: e.target.value })} placeholder="Leave blank to keep existing" />
        </div>
      )}

      {subTab === 'seo' && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4 grid md:grid-cols-2 gap-4">
            <Input label="Site name" value={form.seoSiteName || ''} onChange={(e) => setForm({ ...form, seoSiteName: e.target.value })} />
            <Input label="Default page title" value={form.seoDefaultTitle || ''} onChange={(e) => setForm({ ...form, seoDefaultTitle: e.target.value })} />
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Default meta description</label>
              <textarea className="w-full mt-1 border rounded-md p-2 text-sm min-h-[80px]" value={form.seoDefaultDescription || ''} onChange={(e) => setForm({ ...form, seoDefaultDescription: e.target.value })} />
            </div>
            <Input label="Keywords (comma-separated)" value={form.seoKeywords || ''} onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })} />
            <Input label="Canonical base URL" value={form.seoCanonicalUrl || ''} onChange={(e) => setForm({ ...form, seoCanonicalUrl: e.target.value })} placeholder="https://rfincare.com" />
            <Input label="Default OG image URL" value={form.seoOgImage || ''} onChange={(e) => setForm({ ...form, seoOgImage: e.target.value })} />
            <Input label="Robots directive" value={form.seoRobots || ''} onChange={(e) => setForm({ ...form, seoRobots: e.target.value })} placeholder="index,follow" />
            <Input label="Google Search Console verification" value={form.googleSiteVerification || ''} onChange={(e) => setForm({ ...form, googleSiteVerification: e.target.value })} />
          </div>
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Per-page SEO overrides</h3>
              <Button size="sm" variant="outline" onClick={() => addListItem('pageSeo', emptyPageSeo)}>Add page</Button>
            </div>
            {(form.pageSeo || []).map((page, i) => (
              <div key={i} className="border rounded p-3 space-y-2">
                <Input label="Path" value={page.path} onChange={(e) => updateList('pageSeo', i, { path: e.target.value })} placeholder="/eligibility-assessment" />
                <Input label="Title" value={page.title || ''} onChange={(e) => updateList('pageSeo', i, { title: e.target.value })} />
                <Input label="Description" value={page.description || ''} onChange={(e) => updateList('pageSeo', i, { description: e.target.value })} />
                <Button size="sm" variant="outline" onClick={() => removeListItem('pageSeo', i)}>Remove</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'campaigns' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Define ad campaigns with UTM parameters. Use the generated link in Google Ads or Meta Ads so visits are attributed here and in GA/Meta.
          </p>
          <Button size="sm" variant="outline" onClick={() => addListItem('adCampaigns', emptyCampaign)}>Add campaign</Button>
          {(form.adCampaigns || []).map((camp, i) => {
            const base = form.seoCanonicalUrl || 'https://rfincare.com';
            const qs = new URLSearchParams({
              ...(camp.utmSource ? { utm_source: camp.utmSource } : {}),
              ...(camp.utmMedium ? { utm_medium: camp.utmMedium } : {}),
              ...(camp.utmCampaign ? { utm_campaign: camp.utmCampaign } : {}),
              ...(camp.utmContent ? { utm_content: camp.utmContent } : {}),
              ...(camp.utmTerm ? { utm_term: camp.utmTerm } : {}),
            }).toString();
            const trackingUrl = `${base.replace(/\/$/, '')}/?${qs}`;
            return (
              <div key={camp.id || i} className="border rounded-lg p-4 space-y-2">
                <div className="grid md:grid-cols-2 gap-2">
                  <Input label="Campaign name" value={camp.name} onChange={(e) => updateList('adCampaigns', i, { name: e.target.value })} />
                  <label className="text-sm">
                    Platform
                    <select className="w-full mt-1 border rounded-md p-2" value={camp.platform || 'google'} onChange={(e) => updateList('adCampaigns', i, { platform: e.target.value })}>
                      <option value="google">Google Ads</option>
                      <option value="meta">Meta Ads</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <Input label="utm_source" value={camp.utmSource || ''} onChange={(e) => updateList('adCampaigns', i, { utmSource: e.target.value })} placeholder="google / facebook" />
                  <Input label="utm_medium" value={camp.utmMedium || ''} onChange={(e) => updateList('adCampaigns', i, { utmMedium: e.target.value })} placeholder="cpc / paid_social" />
                  <Input label="utm_campaign" value={camp.utmCampaign || ''} onChange={(e) => updateList('adCampaigns', i, { utmCampaign: e.target.value })} />
                  <Input label="utm_content" value={camp.utmContent || ''} onChange={(e) => updateList('adCampaigns', i, { utmContent: e.target.value })} />
                </div>
                <p className="text-xs bg-muted p-2 rounded break-all">
                  Tracking URL:
                  {' '}
                  <code>{trackingUrl}</code>
                </p>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={camp.active !== false} onChange={(e) => updateList('adCampaigns', i, { active: e.target.checked })} />
                  Active
                </label>
                <Button size="sm" variant="outline" onClick={() => removeListItem('adCampaigns', i)}>Remove</Button>
              </div>
            );
          })}
        </div>
      )}

      {subTab === 'tags' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Add third-party tracking scripts (LinkedIn Insight, Hotjar, etc.). Injected on website and mobile web.</p>
          <Button size="sm" variant="outline" onClick={() => addListItem('customTags', emptyTag)}>Add tag</Button>
          {(form.customTags || []).map((tag, i) => (
            <div key={tag.id || i} className="border rounded-lg p-4 space-y-2">
              <Input label="Tag name" value={tag.name} onChange={(e) => updateList('customTags', i, { name: e.target.value })} />
              <label className="text-sm">
                Placement
                <select className="w-full mt-1 border rounded-md p-2" value={tag.placement || 'head'} onChange={(e) => updateList('customTags', i, { placement: e.target.value })}>
                  <option value="head">Head</option>
                  <option value="body">Body</option>
                </select>
              </label>
              <label className="text-sm font-medium">Script HTML</label>
              <textarea className="w-full border rounded-md p-2 text-xs font-mono min-h-[100px]" value={tag.scriptHtml || ''} onChange={(e) => updateList('customTags', i, { scriptHtml: e.target.value })} placeholder="<script>...</script>" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={tag.enabled !== false} onChange={(e) => updateList('customTags', i, { enabled: e.target.checked })} />
                Enabled
              </label>
              <Button size="sm" variant="outline" onClick={() => removeListItem('customTags', i)}>Remove</Button>
            </div>
          ))}
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">Custom head / body HTML</h3>
            <textarea className="w-full border rounded-md p-2 text-xs font-mono min-h-[80px]" value={form.customHeadHtml || ''} onChange={(e) => setForm({ ...form, customHeadHtml: e.target.value })} placeholder="Additional &lt;head&gt; snippets" />
            <textarea className="w-full border rounded-md p-2 text-xs font-mono min-h-[80px]" value={form.customBodyHtml || ''} onChange={(e) => setForm({ ...form, customBodyHtml: e.target.value })} placeholder="Additional &lt;body&gt; snippets" />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t">
        <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save all marketing settings'}</Button>
        <Button variant="outline" onClick={() => load()}>Refresh</Button>
      </div>
    </div>
  );
}
