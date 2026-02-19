import { useState, useEffect } from 'react';
import {
  Database, Zap, Shield, Globe, BarChart3, Package, Settings, Layers, Eye,
  ChevronDown, Heart, Stethoscope, FlaskConical, Brain,
  Ambulance, Scissors, Pill, UserCircle, Activity, Building2, ClipboardList,
  Download, Sparkles, CheckCircle2, ArrowDown,
} from 'lucide-react';

interface Props {
  onGetStarted: () => void;
}

function useCounter(target: number, duration = 2000, enabled = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [target, duration, enabled]);
  return val;
}

export default function LandingPage({ onGetStarted }: Props) {
  const [visible, setVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const onScroll = () => {
      const el = document.getElementById('stats-section');
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) setStatsVisible(true);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const stat1 = useCounter(50, 1500, statsVisible);
  const stat2 = useCounter(28, 1500, statsVisible);
  const stat3 = useCounter(15, 1200, statsVisible);
  const stat4 = useCounter(10000, 1800, statsVisible);

  return (
    <div className="min-h-screen" style={{ background: '#05050f', fontFamily: 'Inter, sans-serif' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
           style={{ background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(24px)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                 style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 0 24px rgba(249,115,22,0.4)' }}>
              <Database className="w-5 h-5 text-white" strokeWidth={2} />
              <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center bg-amber-400">
                <Zap className="w-2 h-2 text-slate-900" fill="currentColor" />
              </div>
            </div>
            <span className="font-black text-white text-lg tracking-tight">
              Data<span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#f97316,#fbbf24)' }}> Forge</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">Features</a>
            <a href="#healthcare" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">Healthcare</a>
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">How It Works</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onGetStarted}
                    className="text-sm text-slate-400 hover:text-white font-semibold transition-colors hidden sm:block">
              Sign In
            </button>
            <button onClick={onGetStarted}
                    className="px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}>
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[900px] h-[900px] rounded-full opacity-15 blur-[160px]"
               style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 60%)', top: '-400px', left: '50%', transform: 'translateX(-50%)', animation: 'pulse1 8s ease-in-out infinite' }} />
          <div className="absolute w-[600px] h-[600px] rounded-full opacity-10 blur-[120px]"
               style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 60%)', bottom: '-200px', right: '-100px', animation: 'pulse2 10s ease-in-out infinite' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full opacity-8 blur-[100px]"
               style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 60%)', bottom: '-100px', left: '-50px', animation: 'pulse1 12s ease-in-out infinite reverse' }} />
          <div className="absolute inset-0 opacity-[0.02]"
               style={{ backgroundImage: 'linear-gradient(rgba(249,115,22,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.8) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
        </div>

        <div className={`relative z-10 max-w-5xl mx-auto text-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8"
               style={{ background: 'rgba(249,115,22,0.06)', borderColor: 'rgba(249,115,22,0.2)' }}>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-300">#1 Synthetic Data Generator</span>
            <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">FREE</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-6">
            Forge Realistic
            <br />
            <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(90deg, #f97316, #fbbf24, #f97316)', backgroundSize: '200% 100%', animation: 'shimmer 3s linear infinite' }}>
              Synthetic Data
            </span>
            <br />
            <span className="text-slate-400 text-4xl sm:text-5xl md:text-6xl">in Seconds</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            50+ field types. <span className="text-emerald-400 font-bold">28 healthcare fields</span>. 15 ready-made scenarios.
            <br className="hidden sm:block" />
            Export as JSON, CSV, SQL, or XML. <span className="text-orange-400">No code required.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button onClick={onGetStarted}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-white text-base transition-all hover:scale-105 flex items-center justify-center gap-2.5"
                    style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 8px 40px rgba(249,115,22,0.5)' }}>
              <Zap className="w-5 h-5" fill="currentColor" />
              Start Forging — It's Free
            </button>
            <a href="#features"
               className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-slate-300 text-base border border-white/15 hover:border-white/30 transition-all flex items-center justify-center gap-2"
               style={{ background: 'rgba(255,255,255,0.04)' }}>
              See Features
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            {[
              { label: 'JSON', color: '#f59e0b', icon: <ClipboardList className="w-3 h-3" /> },
              { label: 'CSV', color: '#10b981', icon: <BarChart3 className="w-3 h-3" /> },
              { label: 'SQL', color: '#3b82f6', icon: <Database className="w-3 h-3" /> },
              { label: 'XML', color: '#ef4444', icon: <Layers className="w-3 h-3" /> },
              { label: 'Healthcare', color: '#10b981', icon: <Heart className="w-3 h-3" /> },
              { label: 'HIPAA-Safe', color: '#8b5cf6', icon: <Shield className="w-3 h-3" /> },
            ].map(b => (
              <span key={b.label} className="px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5"
                    style={{ background: `${b.color}0a`, borderColor: `${b.color}30`, color: b.color }}>
                {b.icon}
                {b.label}
              </span>
            ))}
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative">
            <div className="absolute -inset-4 rounded-3xl opacity-30 blur-3xl"
                 style={{ background: 'linear-gradient(135deg, #f97316, #6366f1, #10b981)' }} />
            <div className="relative rounded-2xl border border-white/10 overflow-hidden"
                 style={{ background: 'rgba(10,10,20,0.9)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <span className="text-[10px] text-slate-600 font-mono ml-2">dataforge.io/app</span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-orange-400 flex items-center gap-1.5" style={{ background: 'rgba(249,115,22,0.1)' }}>
                    <Layers className="w-3 h-3" /> Schema Builder
                  </div>
                  <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 flex items-center gap-1.5" style={{ background: 'rgba(16,185,129,0.1)' }}>
                    <Heart className="w-3 h-3" /> Healthcare
                  </div>
                  <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <Settings className="w-3 h-3" /> Custom
                  </div>
                  <div className="ml-auto px-4 py-1.5 rounded-lg text-xs font-black text-white flex items-center gap-1.5" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                    <Zap className="w-3 h-3" /> Forge
                  </div>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-3 py-2 text-left text-slate-500 font-semibold">#</th>
                      <th className="px-3 py-2 text-left text-emerald-400 font-bold"><span className="text-emerald-500/50 mr-1">◆</span>mrn</th>
                      <th className="px-3 py-2 text-left text-emerald-400 font-bold"><span className="text-emerald-500/50 mr-1">◆</span>patient_name</th>
                      <th className="px-3 py-2 text-left text-emerald-400 font-bold hidden md:table-cell"><span className="text-emerald-500/50 mr-1">◆</span>diagnosis</th>
                      <th className="px-3 py-2 text-left text-emerald-400 font-bold hidden lg:table-cell"><span className="text-emerald-500/50 mr-1">◆</span>medication</th>
                      <th className="px-3 py-2 text-left text-emerald-400 font-bold hidden lg:table-cell"><span className="text-emerald-500/50 mr-1">◆</span>blood_pressure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { mrn: 'MRN-847293', name: 'James Wilson', diag: 'Type 2 Diabetes', med: 'Metformin 500mg', bp: '120/80 mmHg' },
                      { mrn: 'MRN-512847', name: 'Charlotte Brown', diag: 'Essential Hypertension', med: 'Lisinopril 10mg', bp: '145/92 mmHg' },
                      { mrn: 'MRN-938472', name: 'Oliver Garcia', diag: 'Acute Bronchitis', med: 'Azithromycin 250mg', bp: '118/76 mmHg' },
                      { mrn: 'MRN-274859', name: 'Sophia Davis', diag: 'Major Depressive Disorder', med: 'Sertraline 50mg', bp: '110/70 mmHg' },
                    ].map((r, i) => (
                      <tr key={i} className="border-b border-white/[0.04]">
                        <td className="px-3 py-2.5 text-slate-700 font-mono">{i + 1}</td>
                        <td className="px-3 py-2.5 text-slate-400 font-mono">{r.mrn}</td>
                        <td className="px-3 py-2.5 text-slate-400 font-mono">{r.name}</td>
                        <td className="px-3 py-2.5 text-slate-400 font-mono hidden md:table-cell">{r.diag}</td>
                        <td className="px-3 py-2.5 text-slate-400 font-mono hidden lg:table-cell">{r.med}</td>
                        <td className="px-3 py-2.5 text-slate-400 font-mono hidden lg:table-cell">{r.bp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between mt-3 px-2">
                  <span className="text-[10px] text-slate-700">Showing 4 of 1,000 rows</span>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-400 bg-emerald-500/10 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Copied
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500 bg-white/5 flex items-center gap-1">
                      <Download className="w-3 h-3" /> Download .json
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ────────────────────────────────────────────── */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-slate-700 font-bold uppercase tracking-[0.2em] mb-8">Trusted by developers & data teams worldwide</p>
          <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap opacity-30">
            {['Acme Corp', 'Nexus Tech', 'Zenith AI', 'Orbit Solutions', 'Stratus Cloud', 'Polaris Data'].map(c => (
              <span key={c} className="text-lg sm:text-xl font-black text-white/50 tracking-tight">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ─────────────────────────────────────────── */}
      <section id="stats-section" className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: stat1, suffix: '+', label: 'Field Types', Icon: Layers, color: '#f97316' },
            { value: stat2, suffix: '', label: 'Healthcare Fields', Icon: Heart, color: '#10b981' },
            { value: stat3, suffix: '', label: 'Scenarios', Icon: Sparkles, color: '#8b5cf6' },
            { value: stat4, suffix: '+', label: 'Max Rows', Icon: BarChart3, color: '#06b6d4' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-6 border border-white/10 text-center relative overflow-hidden group hover:border-white/20 transition-all"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
                   style={{ background: `radial-gradient(circle at center, ${s.color}, transparent 70%)` }} />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                   style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                <s.Icon className="w-7 h-7" style={{ color: s.color }} strokeWidth={1.8} />
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white mb-1">
                {s.value.toLocaleString()}{s.suffix}
              </div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES SECTION ──────────────────────────────────────── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-3 block">Features</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Everything You Need to
              <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#f97316,#fbbf24)' }}>Generate Perfect Data</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">From simple test data to complex healthcare records — Data Forge has you covered.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                Icon: Layers, title: 'Visual Schema Builder', color: '#f97316',
                desc: 'Drag-and-drop fields, rename columns, change types — all in a live, reactive sidebar. See your schema take shape in real time.'
              },
              {
                Icon: Zap, title: 'Instant Generation', color: '#fbbf24',
                desc: 'Generate up to 10,000 rows in milliseconds. No server calls, no waiting — everything runs blazing-fast in your browser.'
              },
              {
                Icon: Heart, title: '28 Healthcare Fields', color: '#10b981',
                desc: 'Diagnoses, ICD codes, medications, vitals, lab results, nursing notes, insurance — the most complete healthcare data engine.'
              },
              {
                Icon: Settings, title: 'Custom Field Types', color: '#8b5cf6',
                desc: 'Build your own: Custom Lists (pick from values), Patterns (regex-style), and Templates (compose with {{tokens}}).'
              },
              {
                Icon: Sparkles, title: '15 Ready-Made Scenarios', color: '#ec4899',
                desc: 'One-click presets for User Profiles, E-commerce, Analytics, HR, CRM, Transactions, Server Logs, IoT, and 7 Healthcare scenarios.'
              },
              {
                Icon: Package, title: '4 Export Formats', color: '#06b6d4',
                desc: 'Download or copy as JSON, CSV, SQL INSERT statements, or XML. Optimized for databases, APIs, spreadsheets, and CI/CD pipelines.'
              },
              {
                Icon: Shield, title: 'HIPAA-Safe & Private', color: '#22c55e',
                desc: 'All data is generated client-side in your browser. Nothing is stored, uploaded, or shared. 100% synthetic — zero compliance risk.'
              },
              {
                Icon: Globe, title: 'Works Everywhere', color: '#3b82f6',
                desc: 'Built as a progressive web app. Works on desktop, tablet, and mobile. No installation, no dependencies — just open and forge.'
              },
              {
                Icon: Eye, title: 'Live Table Preview', color: '#f97316',
                desc: 'See your generated data instantly in a beautiful table view or raw code view. Copy to clipboard or download with one click.'
              },
            ].map(f => (
              <div key={f.title} className="rounded-2xl p-6 border border-white/10 group hover:border-white/20 transition-all relative overflow-hidden"
                   style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"
                     style={{ background: `radial-gradient(circle at top left, ${f.color}, transparent 60%)` }} />
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                     style={{ background: `${f.color}12`, border: `1px solid ${f.color}25` }}>
                  <f.Icon className="w-7 h-7" style={{ color: f.color }} strokeWidth={1.8} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HEALTHCARE SHOWCASE ────────────────────────────────────── */}
      <section id="healthcare" className="py-20 px-6 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[600px] h-[600px] rounded-full opacity-8 blur-[140px]"
               style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 60%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mb-3 block">Healthcare Data</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              The Most Complete
              <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#10b981,#06b6d4)' }}>Healthcare Data Engine</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">28 field types across 4 categories and 7 dedicated scenarios. Generate HIPAA-safe patient records, clinical encounters, and more.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              {
                Icon: UserCircle, label: 'Patient Info', color: '#06b6d4',
                fields: ['Medical Record #', 'Patient Age', 'Gender', 'Blood Type', 'BMI', 'Allergen', 'Emergency Contact'],
              },
              {
                Icon: Activity, label: 'Vitals & Assessment', color: '#ef4444',
                fields: ['Blood Pressure', 'Heart Rate', 'Temperature', 'SpO₂', 'Respiratory Rate', 'Pain Scale'],
              },
              {
                Icon: Stethoscope, label: 'Clinical', color: '#8b5cf6',
                fields: ['Diagnosis', 'ICD Code', 'Procedure', 'Medication', 'Dosage', 'Lab Test', 'Lab Result'],
              },
              {
                Icon: Building2, label: 'Facility & Billing', color: '#f59e0b',
                fields: ['Hospital Ward', 'Room Number', 'Doctor Name', 'Admission Type', 'Discharge Status', 'Insurance', 'Copay', 'Nursing Note'],
              },
            ].map(cat => (
              <div key={cat.label} className="rounded-2xl p-5 border transition-all group hover:border-white/20"
                   style={{ background: 'rgba(255,255,255,0.02)', borderColor: `${cat.color}20` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                     style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}25` }}>
                  <cat.Icon className="w-6 h-6" style={{ color: cat.color }} strokeWidth={1.8} />
                </div>
                <h4 className="text-sm font-bold text-white mb-3">{cat.label}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {cat.fields.map(f => (
                    <span key={f} className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                          style={{ background: `${cat.color}08`, borderColor: `${cat.color}20`, color: `${cat.color}` }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { Icon: Building2, title: 'Patient Records', fields: 14, rows: 100 },
              { Icon: Stethoscope, title: 'Clinical Encounters', fields: 20, rows: 150 },
              { Icon: FlaskConical, title: 'Lab Results', fields: 12, rows: 200 },
              { Icon: Pill, title: 'Pharmacy / Rx', fields: 12, rows: 120 },
              { Icon: Ambulance, title: 'Emergency Dept', fields: 17, rows: 100 },
              { Icon: Brain, title: 'Mental Health', fields: 14, rows: 80 },
              { Icon: Scissors, title: 'Surgical Records', fields: 17, rows: 60 },
            ].map(sc => (
              <div key={sc.title} className="rounded-xl p-4 border border-emerald-500/10 hover:border-emerald-500/30 transition-all cursor-pointer group"
                   style={{ background: 'rgba(16,185,129,0.02)' }}
                   onClick={onGetStarted}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                       style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <sc.Icon className="w-4 h-4 text-emerald-400" strokeWidth={1.8} />
                  </div>
                  <span className="text-xs font-bold text-emerald-200 group-hover:text-white transition-colors">{sc.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-mono">
                  <span>{sc.fields} fields</span>
                  <span className="text-slate-800">·</span>
                  <span>{sc.rows} rows</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-3 block">How It Works</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white">
              Three Steps to
              <span className="text-transparent bg-clip-text ml-2" style={{ backgroundImage: 'linear-gradient(90deg,#f97316,#fbbf24)' }}>Perfect Data</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01', title: 'Build Your Schema', color: '#f97316',
                desc: 'Pick from 50+ field types or create custom fields. Use a preset scenario or build from scratch.',
                Icon: Layers,
              },
              {
                step: '02', title: 'Forge Your Data', color: '#fbbf24',
                desc: 'Hit the Forge button. Up to 10,000 rows generated instantly in your browser. No server needed.',
                Icon: Zap,
              },
              {
                step: '03', title: 'Export & Ship', color: '#10b981',
                desc: 'Copy to clipboard or download as JSON, CSV, SQL, or XML. Drop into your app, database, or test suite.',
                Icon: ArrowDown,
              },
            ].map(s => (
              <div key={s.step} className="text-center relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 relative"
                     style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                  <s.Icon className="w-9 h-9" style={{ color: s.color }} strokeWidth={1.8} />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                        style={{ background: s.color, boxShadow: `0 0 12px ${s.color}80` }}>{s.step}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[800px] h-[800px] rounded-full opacity-10 blur-[160px]"
               style={{ background: 'radial-gradient(circle, #f97316, transparent 60%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Ready to Forge
            <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#f97316,#fbbf24)' }}>Your Data?</span>
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            Join thousands of developers who generate perfect synthetic data with Data Forge. Free forever.
          </p>
          <button onClick={onGetStarted}
                  className="px-10 py-5 rounded-2xl font-black text-white text-lg transition-all hover:scale-105 flex items-center gap-3 mx-auto"
                  style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 10px 50px rgba(249,115,22,0.5)' }}>
            <Zap className="w-6 h-6" fill="currentColor" />
            Start Forging — It's Free
          </button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                <Database className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className="font-black text-white text-sm">Data Forge</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">Craft realistic synthetic data at scale. Free, private, and powerful.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
            <p className="text-xs text-slate-700">© {new Date().getFullYear()} Data Forge. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {['Twitter', 'GitHub', 'Discord', 'LinkedIn'].map(s => (
                <a key={s} href="#" className="text-xs text-slate-700 hover:text-white transition-colors font-medium">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse1 { 0%,100%{transform:translateX(-50%) scale(1)} 50%{transform:translateX(-50%) scale(1.1)} }
        @keyframes pulse2 { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
