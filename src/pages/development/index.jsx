import React, { useCallback, useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  checkDevSession,
  devLogin,
  devLogout,
  fetchEnvFiles,
  saveEnvFile,
} from '../../services/developmentService';
import { loadRuntimeConfig } from '../../lib/runtimeConfig';

const DevelopmentPanel = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('backend');
  const [backendContent, setBackendContent] = useState('');
  const [frontendContent, setFrontendContent] = useState('');
  const [backendPath, setBackendPath] = useState('');
  const [frontendPath, setFrontendPath] = useState('');
  const [frontendHint, setFrontendHint] = useState('');
  const [loadError, setLoadError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadEnv = useCallback(async () => {
    setLoadError('');
    try {
      const data = await fetchEnvFiles();
      setBackendContent(data?.backend?.content ?? '');
      setFrontendContent(data?.frontend?.content ?? '');
      setBackendPath(data?.backend?.path ?? '');
      setFrontendPath(data?.frontend?.path ?? '');
      setFrontendHint(data?.frontend?.hint ?? '');
    } catch (err) {
      setLoadError(err?.response?.data?.error || 'Failed to load environment files');
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const ok = await checkDevSession();
        setAuthenticated(ok);
        if (ok) await loadEnv();
      } catch {
        setAuthenticated(false);
      } finally {
        setChecking(false);
      }
    })();
  }, [loadEnv]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await devLogin(password);
      setAuthenticated(true);
      setPassword('');
      await loadEnv();
    } catch (err) {
      setLoginError(err?.response?.data?.error || 'Invalid password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await devLogout();
    setAuthenticated(false);
    setBackendContent('');
    setFrontendContent('');
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    setSaveError('');
    try {
      const target = activeTab;
      const content = target === 'backend' ? backendContent : frontendContent;
      const result = await saveEnvFile(target, content);
      setSaveMessage(result?.message || 'Saved successfully.');
      if (target === 'frontend') {
        await loadRuntimeConfig();
        window.location.reload();
        return;
      }
      await loadEnv();
    } catch (err) {
      setSaveError(err?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
        <p>Loading developer panel…</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
          <h1 className="text-2xl font-semibold text-white mb-2">Developer panel</h1>
          <p className="text-slate-400 text-sm mb-6">
            Sign in to view and edit frontend and backend environment files for local setup.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter developer password"
              required
            />
            {loginError && <p className="text-sm text-red-400">{loginError}</p>}
            <Button type="submit" className="w-full" disabled={loginLoading}>
              {loginLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const activeContent = activeTab === 'backend' ? backendContent : frontendContent;
  const activePath = activeTab === 'backend' ? backendPath : frontendPath;
  const setActiveContent = activeTab === 'backend' ? setBackendContent : setFrontendContent;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Developer environment</h1>
            <p className="text-slate-400 text-sm mt-1">
              Edit .env files. Backend changes apply on the API server immediately. Frontend values are used for Vercel deploy.
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Sign out
          </Button>
        </div>

        <div className="flex gap-2 mb-4">
          {['backend', 'frontend'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab} .env
            </button>
          ))}
        </div>

        {loadError && <p className="text-red-400 text-sm mb-4">{loadError}</p>}
        {activePath && (
          <p className="text-xs text-slate-500 mb-2 font-mono break-all">{activePath}</p>
        )}
        {activeTab === 'frontend' && frontendHint && (
          <p className="text-xs text-amber-400/90 mb-3">{frontendHint}</p>
        )}

        <textarea
          className="w-full min-h-[420px] font-mono text-sm rounded-lg border border-slate-700 bg-slate-900 p-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={activeContent}
          onChange={(e) => setActiveContent(e.target.value)}
          spellCheck={false}
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : `Save ${activeTab} .env`}
          </Button>
          <Button variant="outline" onClick={loadEnv} disabled={saving}>
            Reload
          </Button>
        </div>

        {saveMessage && <p className="mt-4 text-sm text-emerald-400">{saveMessage}</p>}
        {saveError && <p className="mt-4 text-sm text-red-400">{saveError}</p>}
      </div>
    </div>
  );
};

export default DevelopmentPanel;
