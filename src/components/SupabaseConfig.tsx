import { useState, useEffect } from 'react';
import {
  hasCredentials,
  getStoredCredentials,
  saveCredentials,
  clearCredentials,
  testConnection,
} from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupabaseConfig({ isOpen, onClose }: Props) {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'warning'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [connected, setConnected] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showSQL, setShowSQL] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getStoredCredentials();
      setUrl(creds.url);
      setKey(creds.key);
      setConnected(hasCredentials());
      setStatus('idle');
      setStatusMsg('');
    }
  }, [isOpen]);

  const handleTest = async () => {
    if (!url.trim() || !key.trim()) {
      setStatus('error');
      setStatusMsg('Please enter both URL and API key.');
      return;
    }
    if (!url.startsWith('https://')) {
      setStatus('error');
      setStatusMsg('URL must start with https://');
      return;
    }

    setTesting(true);
    setStatus('idle');

    // Save first so testConnection uses them
    saveCredentials(url, key);

    const result = await testConnection();
    setTesting(false);

    if (result.success && !result.error?.includes('not created')) {
      setStatus('success');
      setStatusMsg('✅ Connected successfully! Supabase is active.');
      setConnected(true);
    } else if (result.success && result.error) {
      setStatus('warning');
      setStatusMsg(`⚠️ ${result.error}`);
      setConnected(true);
    } else {
      setStatus('error');
      setStatusMsg(`❌ ${result.error || 'Connection failed'}`);
    }
  };

  const handleSave = () => {
    saveCredentials(url, key);
    setConnected(hasCredentials());
    onClose();
  };

  const handleDisconnect = () => {
    clearCredentials();
    setUrl('');
    setKey('');
    setConnected(false);
    setStatus('idle');
    setStatusMsg('Disconnected. App will run in local-only mode.');
  };

  if (!isOpen) return null;

  const SQL_SETUP = `-- Run this in your Supabase SQL Editor
-- Project Settings → SQL Editor → New Query

-- 1. Page Visits table
CREATE TABLE IF NOT EXISTS page_visits (
  id BIGSERIAL PRIMARY KEY,
  page TEXT NOT NULL,
  user_id TEXT,
  user_email TEXT,
  user_agent TEXT,
  referrer TEXT,
  metadata JSONB DEFAULT '{}',
  visited_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Analytics Events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_email TEXT,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- 4. Allow anonymous inserts (for tracking)
CREATE POLICY "Allow anon inserts on page_visits"
  ON page_visits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anon inserts on analytics_events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- 5. Allow authenticated reads (for admin dashboard)
CREATE POLICY "Allow auth reads on page_visits"
  ON page_visits FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow auth reads on analytics_events"
  ON analytics_events FOR SELECT
  USING (auth.role() = 'authenticated');`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
         onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto"
           style={{ background: 'rgba(12,12,24,0.98)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Supabase Connection</h2>
              <p className="text-xs text-slate-500">Connect your Supabase project for auth & analytics</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Connection Status */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
               style={{
                 background: connected ? 'rgba(16,185,129,0.06)' : 'rgba(249,115,22,0.06)',
                 borderColor: connected ? 'rgba(16,185,129,0.2)' : 'rgba(249,115,22,0.2)',
               }}>
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-orange-400'}`} />
            <span className={`text-sm font-semibold ${connected ? 'text-emerald-300' : 'text-orange-300'}`}>
              {connected ? 'Connected to Supabase' : 'Not Connected — Running in Local Mode'}
            </span>
          </div>

          {/* Credentials */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                Supabase Project URL
              </label>
              <input value={url} onChange={e => setUrl(e.target.value)}
                     placeholder="https://your-project.supabase.co"
                     className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-700 outline-none border border-white/10 font-mono transition-all"
                     style={{ background: 'rgba(255,255,255,0.05)' }}
                     onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 2px rgba(16,185,129,0.2)'; }}
                     onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
              <p className="text-[10px] text-slate-700 mt-1">Found in: Project Settings → API → Project URL</p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                Anon / Public API Key
              </label>
              <div className="relative">
                <input value={key} onChange={e => setKey(e.target.value)}
                       type={showKey ? 'text' : 'password'}
                       placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                       className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white placeholder-slate-700 outline-none border border-white/10 font-mono transition-all"
                       style={{ background: 'rgba(255,255,255,0.05)' }}
                       onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 2px rgba(16,185,129,0.2)'; }}
                       onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
                <button onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                  {showKey ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-700 mt-1">Found in: Project Settings → API → anon public key</p>
            </div>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div className={`px-4 py-3 rounded-xl text-sm border ${
              status === 'success' ? 'text-emerald-300 border-emerald-500/20 bg-emerald-500/5' :
              status === 'warning' ? 'text-amber-300 border-amber-500/20 bg-amber-500/5' :
              status === 'error' ? 'text-rose-300 border-rose-500/20 bg-rose-500/5' :
              'text-slate-400 border-white/10 bg-white/5'
            }`}>
              {statusMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={handleTest} disabled={testing}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-sm transition-all"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)', opacity: testing ? 0.6 : 1 }}>
              {testing ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/></svg>Testing…</>
              ) : (
                <>🔗 Test Connection</>
              )}
            </button>
            <button onClick={handleSave}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-sm border border-white/10 hover:border-white/20 transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
              💾 Save & Close
            </button>
            {connected && (
              <button onClick={handleDisconnect}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-rose-400 text-sm border border-rose-500/20 hover:border-rose-500/40 transition-all"
                      style={{ background: 'rgba(239,68,68,0.05)' }}>
                ⛓️‍💥 Disconnect
              </button>
            )}
          </div>

          {/* SQL Setup Section */}
          <div className="border-t border-white/10 pt-6">
            <button onClick={() => setShowSQL(!showSQL)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors w-full">
              <svg className={`w-4 h-4 transition-transform ${showSQL ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
              📋 Database Setup SQL
              <span className="text-[10px] text-slate-600 font-normal ml-1">(required for tracking)</span>
            </button>

            {showSQL && (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Copy this SQL and run it in your Supabase <strong className="text-slate-300">SQL Editor</strong> to create
                  the required tables for traffic tracking and analytics.
                </p>
                <div className="relative">
                  <pre className="text-[11px] text-slate-400 font-mono p-4 rounded-xl border border-white/10 overflow-auto max-h-64 leading-relaxed"
                       style={{ background: 'rgba(0,0,0,0.3)' }}>
                    {SQL_SETUP}
                  </pre>
                  <button onClick={() => { navigator.clipboard.writeText(SQL_SETUP); }}
                          className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                          style={{ background: 'rgba(255,255,255,0.05)' }}>
                    📋 Copy SQL
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="rounded-xl p-4 border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 className="text-xs font-bold text-slate-400 mb-2">ℹ️ How it works</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
              <li>• <strong className="text-slate-400">Without Supabase:</strong> App runs locally. Sign in stores email in browser. No tracking.</li>
              <li>• <strong className="text-slate-400">With Supabase:</strong> Full email/password auth, page visit tracking, event analytics.</li>
              <li>• <strong className="text-slate-400">Auth:</strong> Uses Supabase Auth (email/password). Enable it in Authentication → Providers.</li>
              <li>• <strong className="text-slate-400">Privacy:</strong> Generated data never leaves your browser. Only auth & analytics go to Supabase.</li>
              <li>• <strong className="text-slate-400">Credentials:</strong> Stored in browser localStorage. Never sent anywhere except your Supabase project.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
