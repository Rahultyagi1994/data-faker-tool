import { useState } from 'react';
import { trackPageVisit } from '../lib/supabase';
import { cn } from '../utils/cn';

interface Props {
  onSignIn: (email: string, name: string) => void;
  onGuest: () => void;
}

export default function SignIn({ onSignIn, onGuest }: Props) {
  const [email, setEmail]     = useState('');
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [mode, setMode]       = useState<'signin' | 'signup'>('signin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (mode === 'signup' && !name.trim()) { setError('Please enter your name.'); return; }
    setLoading(true);
    try {
      await trackPageVisit('sign-in', email);
      onSignIn(email, name || email.split('@')[0]);
    } catch {
      setError('Something went wrong. Continuing as guest.');
      onGuest();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #05050f 0%, #0b0e2a 50%, #05050f 100%)' }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-[140px]"
             style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 65%)', top: '-300px', left: '-300px', animation: 'floatA 10s ease-in-out infinite' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-[110px]"
             style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 65%)', bottom: '-200px', right: '-200px', animation: 'floatB 13s ease-in-out infinite' }} />
        <div className="absolute w-[350px] h-[350px] rounded-full opacity-10 blur-[90px]"
             style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 65%)', top: '50%', left: '60%', animation: 'floatA 9s ease-in-out infinite reverse' }} />
        {/* Fine grid */}
        <div className="absolute inset-0 opacity-[0.025]"
             style={{ backgroundImage: 'linear-gradient(rgba(249,115,22,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.6) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
        {/* Diagonal shine */}
        <div className="absolute inset-0 opacity-5"
             style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 80px, rgba(249,115,22,0.1) 80px, rgba(249,115,22,0.1) 81px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo & Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 relative"
               style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 0 60px rgba(249,115,22,0.45)' }}>
            {/* Anvil / forge icon */}
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                 style={{ background: '#fbbf24' }}>
              <svg className="w-3 h-3 text-slate-900" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
          </div>
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            Data<span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #f97316, #fbbf24)' }}> Forge</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide">Craft Realistic Synthetic Data at Scale</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {['JSON', 'CSV', 'SQL', 'XML'].map(f => (
              <span key={f} className="px-2.5 py-1 rounded-full text-xs font-bold border"
                    style={{ background: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.25)', color: '#fb923c' }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 border"
             style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)' }}>

          {/* Tab toggle */}
          <div className="flex rounded-2xl p-1 mb-8" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {(['signin', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                      className={cn('flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200',
                        mode === m ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-300')}
                      style={mode === m ? { background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 20px rgba(249,115,22,0.4)' } : {}}>
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith"
                       className="w-full px-4 py-3.5 rounded-xl text-white placeholder-slate-700 outline-none transition-all border text-sm font-medium"
                       style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                       onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.2)'; }}
                       onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                     className="w-full px-4 py-3.5 rounded-xl text-white placeholder-slate-700 outline-none transition-all border text-sm font-medium"
                     style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                     onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.2)'; }}
                     onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-rose-400 text-sm"
                   style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
                    className="w-full py-4 rounded-xl font-black text-white text-sm transition-all duration-200 mt-2"
                    style={{ background: loading ? 'rgba(249,115,22,0.4)' : 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: loading ? 'none' : '0 8px 32px rgba(249,115,22,0.45)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/></svg>
                  Connecting…
                </span>
              ) : mode === 'signin' ? '⚡ Sign In to Data Forge' : '🔥 Create Account'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative text-center"><span className="px-3 text-xs text-slate-600 bg-transparent">or continue without account</span></div>
          </div>

          <button onClick={onGuest}
                  className="w-full py-3.5 rounded-xl font-bold text-slate-400 text-sm border border-white/10 hover:border-white/20 hover:text-white transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
            Continue as Guest →
          </button>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-8">
          {['🔥 30+ Data Types', '⚡ Custom Fields', '🎭 Scenarios', '📦 Bulk Export', '🔒 Privacy Safe'].map(f => (
            <span key={f} className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-400 border border-white/10"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>{f}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes floatA { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-40px) scale(1.05)} }
        @keyframes floatB { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-25px) rotate(5deg)} }
      `}</style>
    </div>
  );
}
