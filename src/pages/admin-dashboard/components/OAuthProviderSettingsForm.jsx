import React, { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { cmsService } from '../../../services/cmsService';

const PROVIDER_LABELS = {
  google: 'Google',
  microsoft: 'Microsoft / Outlook',
  apple: 'Apple',
};

const OAuthProviderSettingsForm = () => {
  const [globalForm, setGlobalForm] = useState({
    apiPublicBaseUrl: '',
    frontendCallbackUrlsText: '',
    requireAppliedCustomerEmail: true,
  });
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await cmsService.oauthSettings.get();
      setGlobalForm({
        apiPublicBaseUrl: data?.global?.apiPublicBaseUrl || '',
        frontendCallbackUrlsText: (data?.global?.frontendCallbackUrls || []).join('\n'),
        requireAppliedCustomerEmail: data?.global?.requireAppliedCustomerEmail !== false,
      });
      setProviders(
        (data?.providers || []).map((p) => ({
          provider: p.provider,
          enabled: !!p.enabled,
          clientId: p.clientId || '',
          clientSecret: '',
          redirectUri: p.redirectUri || '',
          computedRedirectUri: p.computedRedirectUri || '',
        })),
      );
    } catch {
      setMessage('Could not load OAuth settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await cmsService.oauthSettings.update({
        global: {
          apiPublicBaseUrl: globalForm.apiPublicBaseUrl.trim() || undefined,
          frontendCallbackUrls: globalForm.frontendCallbackUrlsText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          requireAppliedCustomerEmail: globalForm.requireAppliedCustomerEmail,
        },
        providers: providers.map((p) => ({
          provider: p.provider,
          enabled: p.enabled,
          clientId: p.clientId.trim(),
          clientSecret: p.clientSecret.trim() || undefined,
          redirectUri: p.redirectUri.trim() || undefined,
        })),
      });
      setMessage('OAuth settings saved. Add each redirect URI below to your provider console (fixes redirect_uri_mismatch).');
      await load();
    } catch (err) {
      setMessage(err?.response?.data?.error || err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading OAuth settings…</p>;
  }

  return (
    <div className="space-y-6 border border-border rounded-xl p-6 bg-card">
      <div>
        <h3 className="text-lg font-semibold text-foreground">OAuth sign-in (Google, Microsoft, Apple)</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure client IDs and secrets here. Set the API base URL to match your live backend — the redirect URI
          must be registered exactly in Google / Microsoft / Apple developer consoles.
        </p>
      </div>

      <Input
        label="API public base URL (backend)"
        placeholder="https://your-api.onrender.com"
        value={globalForm.apiPublicBaseUrl}
        onChange={(e) => setGlobalForm((p) => ({ ...p, apiPublicBaseUrl: e.target.value }))}
        description="Used to build redirect URI: {base}/auth/oauth/{provider}/callback"
      />

      <div>
        <label className="block text-sm font-medium mb-2">
          Frontend callback URLs (one per line, must match your site)
        </label>
        <textarea
          className="w-full border rounded-lg p-3 min-h-[100px] font-mono text-sm"
          placeholder="https://rfincare.com/oauth/callback"
          value={globalForm.frontendCallbackUrlsText}
          onChange={(e) =>
            setGlobalForm((p) => ({ ...p, frontendCallbackUrlsText: e.target.value }))
          }
        />
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={globalForm.requireAppliedCustomerEmail}
          onChange={(e) =>
            setGlobalForm((p) => ({ ...p, requireAppliedCustomerEmail: e.target.checked }))
          }
        />
        Only allow OAuth login for emails that applied with Rfincare (lead, application, or existing customer)
      </label>

      {providers.map((p, idx) => (
        <div key={p.provider} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h4 className="font-semibold">{PROVIDER_LABELS[p.provider] || p.provider}</h4>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={p.enabled}
                onChange={(e) =>
                  setProviders((list) =>
                    list.map((item, i) =>
                      i === idx ? { ...item, enabled: e.target.checked } : item,
                    ),
                  )
                }
              />
              Enabled for customer login
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <Input
              label="Client ID"
              value={p.clientId}
              onChange={(e) =>
                setProviders((list) =>
                  list.map((item, i) => (i === idx ? { ...item, clientId: e.target.value } : item)),
                )
              }
            />
            <Input
              label="Client secret (leave blank to keep current)"
              type="password"
              value={p.clientSecret}
              onChange={(e) =>
                setProviders((list) =>
                  list.map((item, i) => (i === idx ? { ...item, clientSecret: e.target.value } : item)),
                )
              }
            />
          </div>

          <Input
            label="Redirect URI override (optional)"
            value={p.redirectUri}
            onChange={(e) =>
              setProviders((list) =>
                list.map((item, i) => (i === idx ? { ...item, redirectUri: e.target.value } : item)),
              )
            }
          />

          <p className="text-xs font-mono bg-muted/60 p-2 rounded break-all">
            Register this redirect URI in {PROVIDER_LABELS[p.provider]} console:
            <br />
            <strong>{p.computedRedirectUri}</strong>
          </p>
        </div>
      ))}

      {message && (
        <p className={`text-sm ${message.includes('saved') ? 'text-success' : 'text-destructive'}`}>
          {message}
        </p>
      )}

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save OAuth settings'}
      </Button>
    </div>
  );
};

export default OAuthProviderSettingsForm;
