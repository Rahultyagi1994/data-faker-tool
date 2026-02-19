import { useState } from 'react';
import { signIn, signUp, trackPageVisit } from '../lib/supabase';
import { cn } from '../utils/cn';
import {
  Database, Zap, Eye, EyeOff, Mail, Lock, User, AlertCircle,
  CheckCircle2, Loader2, Heart, Shield, Sparkles, Layers,
  Package, Settings, ArrowRight,
} from 'lucide-react';

interface Props {
  onSignIn: (email: string, name: string) => void;
}

export default function SignIn({ onSignIn }: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [info, setInfo]         = useState('');
  const [mode, setMode]         = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }
    if (mode === 'signup' && !name.trim()) { setError('Please enter your name.'); return; }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const result = await signUp(email, password || 'local-mode', name);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        if (!result.session) {
          setInfo('Account created! Check your email to confirm, then sign in.');
          setMode('signin');
          setLoading(false);
          return;
        }
        await trackPageVisit('sign-up', email);
        onSignIn(email, name || email.split('@')[0]);
      } else {
        const result = await signIn(email, password || 'local-mode');
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        const userName = result.user?.user_metadata?.name || result.user?.user_metadata?.full_name || email.split('@')[0];
        await trackPageVisit('sign-in', email);
        onSignIn(email, userName);
      }
    } catch {
      setError('Something went wrong. Please try again.');
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
        <div className="absolute inset-0 opacity-[0.025]"
             style={{ backgroundImage: 'linear-gradient(rgba(249,115,22,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.6) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute inset-0 opacity-5"
             style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 80px, rgba(249,115,22,0.1) 80px, rgba(249,115,22,0.1) 81px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo & Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 relative"
               style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 0 60px rgba(249,115,22,0.45)' }}>
            <Database className="w-10 h-10 text-white" strokeWidth={1.5} />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center bg-amber-400"
                 style={{ boxShadow: '0 0 12px rgba(251,191,36,0.5)' }}>
              <Zap className="w-3.5 h-3.5 text-slate-900" fill="currentColor" />
            </div>
          </div>
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            Data<span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #f97316, #fbbf24)' }}> Forge</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide">Craft Realistic Synthetic Data at Scale</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[
              { label: 'JSON', Icon: Layers },
              { label: 'CSV', Icon: Package },
              { label: 'SQL', Icon: Database },
              { label: 'XML', Icon: Settings },
            ].map(f => (
              <span key={f.label} className="px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5"
                    style={{ background: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.25)', color: '#fb923c' }}>
                <f.Icon className="w-3 h-3" strokeWidth={2} />
                {f.label}
              </span>
            ))}
            <span className="px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5"
                  style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)', color: '#34d399' }}>
              <Heart className="w-3 h-3" strokeWidth={2} />
              Healthcare
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 border"
             style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)' }}>

          <div className="mb-2" />

          {/* Tab toggle */}
          <div className="flex rounded-2xl p-1 mb-8" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {(['signin', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setInfo(''); }}
                      className={cn('flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2',
                        mode === m ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-300')}
                      style={mode === m ? { background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 20px rgba(249,115,22,0.4)' } : {}}>
                {m === 'signin' ? (
                  <><ArrowRight className="w-4 h-4" /> Sign In</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Create Account</>
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
                  <User className="w-3.5 h-3.5" strokeWidth={2} />
                  Full Name
                </label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith"
                       className="w-full px-4 py-3.5 rounded-xl text-white placeholder-slate-700 outline-none transition-all border text-sm font-medium"
                       style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                       onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.2)'; }}
                       onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
              </div>
            )}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
                <Mail className="w-3.5 h-3.5" strokeWidth={2} />
                Email Address
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                     className="w-full px-4 py-3.5 rounded-xl text-white placeholder-slate-700 outline-none transition-all border text-sm font-medium"
                     style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                     onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.2)'; }}
                     onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
                <Lock className="w-3.5 h-3.5" strokeWidth={2} />
                Password
              </label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                       placeholder="••••••••"
                       className="w-full px-4 py-3.5 pr-12 rounded-xl text-white placeholder-slate-700 outline-none transition-all border text-sm font-medium"
                       style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                       onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.2)'; }}
                       onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors p-1 rounded-lg hover:bg-white/5">
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" strokeWidth={2} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-rose-400 text-sm"
                   style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                {error}
              </div>
            )}

            {info && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-emerald-400 text-sm"
                   style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                {info}
              </div>
            )}

            <button type="submit" disabled={loading}
                    className="w-full py-4 rounded-xl font-black text-white text-sm transition-all duration-200 mt-2 flex items-center justify-center gap-2.5"
                    style={{ background: loading ? 'rgba(249,115,22,0.4)' : 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: loading ? 'none' : '0 8px 32px rgba(249,115,22,0.45)' }}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating…
                </>
              ) : mode === 'signin' ? (
                <>
                  <Zap className="w-4 h-4" fill="currentColor" />
                  Sign In to Data Forge
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-2" />
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-8">
          {[
            { label: 'Healthcare Data', Icon: Heart, highlight: true },
            { label: '50+ Data Types', Icon: Sparkles, highlight: false },
            { label: 'Custom Fields', Icon: Settings, highlight: false },
            { label: '15 Scenarios', Icon: Layers, highlight: false },
            { label: 'Bulk Export', Icon: Package, highlight: false },
            { label: 'HIPAA-Safe', Icon: Shield, highlight: true },
          ].map(f => (
            <span key={f.label}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5"
                  style={f.highlight
                    ? { background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)', color: '#34d399' }
                    : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }
                  }>
              <f.Icon className="w-3.5 h-3.5" strokeWidth={2} />
              {f.label}
            </span>
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
