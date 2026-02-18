import { useState, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  generateUsers, generateAddresses, generateTransactions,
  generatePatients, generateMedicalRecords, generatePrescriptions,
  generateLabResults, generateInsuranceClaims, generateHealthcareProviders,
  SeededRandom,
} from './utils/fakerData';
import {
  generateOrders, generateProducts, generateReviews,
  generateBankAccounts, generateLoanApplications, generateInvestments,
  generateStudents, generateCourses, generateEnrollments,
  generateSocialPosts, generateSocialUsers, generateNotifications,
  generateSensorReadings, generateDevices, generateAlerts,
  generateEmployees, generateJobPostings, generateTimesheets,
} from './utils/ecommerceGenerators';

const supabaseUrl = 'https://mmyhdaphoqjxzhxqqbfk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1teWhkYXBob3FqeHpoeHFxYmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTU0ODIsImV4cCI6MjA4NjQ5MTQ4Mn0.sJJRntpm2G-hiEsAnueOWmV9uX8kFnVq-5ZylYtyi_M';
const supabase = createClient(supabaseUrl, supabaseKey);

/* ───────── types ───────── */
interface CustomField {
  id: string; name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select';
  options?: string[]; min?: number; max?: number; prefix?: string; suffix?: string; nullPct?: number;
}
interface CustomDataType { id: string; name: string; icon: string; fields: CustomField[]; }
interface ScenarioRule {
  field: string; action: 'fixed' | 'range' | 'null' | 'oneOf';
  value?: string; min?: number; max?: number; values?: string[]; pct?: number;
}
interface CustomScenario { id: string; name: string; dataType: string; rules: ScenarioRule[]; }

/* ───────── generators map ───────── */
const GENERATORS: Record<string, (c: number, s: number) => any[]> = {
  users: generateUsers, addresses: generateAddresses, transactions: generateTransactions,
  patients: generatePatients, medicalRecords: generateMedicalRecords, prescriptions: generatePrescriptions,
  labResults: generateLabResults, insuranceClaims: generateInsuranceClaims, healthcareProviders: generateHealthcareProviders,
  orders: generateOrders, products: generateProducts, reviews: generateReviews,
  bankAccounts: generateBankAccounts, loanApplications: generateLoanApplications, investments: generateInvestments,
  students: generateStudents, courses: generateCourses, enrollments: generateEnrollments,
  socialPosts: generateSocialPosts, socialUsers: generateSocialUsers, notifications: generateNotifications,
  sensorReadings: generateSensorReadings, devices: generateDevices, alerts: generateAlerts,
  employees: generateEmployees, jobPostings: generateJobPostings, timesheets: generateTimesheets,
};

/* ───────── categories ───────── */
const CATEGORIES = [
  { id: 'general', label: '📊 General', color: '#06b6d4' },
  { id: 'healthcare', label: '🏥 Healthcare', color: '#14b8a6' },
  { id: 'ecommerce', label: '🛒 E-Commerce', color: '#a855f7' },
  { id: 'finance', label: '🏦 Finance', color: '#f59e0b' },
  { id: 'education', label: '🎓 Education', color: '#ec4899' },
  { id: 'iot', label: '📡 IoT & More', color: '#f97316' },
];

const DATA_TYPES = [
  { id: 'users', name: 'Users', icon: '👤', cat: 'general', desc: 'Names, emails, phones' },
  { id: 'addresses', name: 'Addresses', icon: '📍', cat: 'general', desc: 'Streets, cities, ZIP codes' },
  { id: 'transactions', name: 'Transactions', icon: '💳', cat: 'general', desc: 'Amounts, merchants' },
  { id: 'patients', name: 'Patients', icon: '🩺', cat: 'healthcare', desc: 'MRN, blood type, allergies' },
  { id: 'medicalRecords', name: 'Medical Records', icon: '📋', cat: 'healthcare', desc: 'ICD-10, vitals, notes' },
  { id: 'prescriptions', name: 'Prescriptions', icon: '💊', cat: 'healthcare', desc: 'Medications, dosages' },
  { id: 'labResults', name: 'Lab Results', icon: '🔬', cat: 'healthcare', desc: 'Tests, reference ranges' },
  { id: 'insuranceClaims', name: 'Insurance Claims', icon: '📄', cat: 'healthcare', desc: 'Claims, amounts, status' },
  { id: 'healthcareProviders', name: 'Providers', icon: '🏥', cat: 'healthcare', desc: 'NPI, specialties' },
  { id: 'orders', name: 'Orders', icon: '🛒', cat: 'ecommerce', desc: 'Cart, shipping, tracking' },
  { id: 'products', name: 'Products', icon: '📦', cat: 'ecommerce', desc: 'SKU, price, stock' },
  { id: 'reviews', name: 'Reviews', icon: '⭐', cat: 'ecommerce', desc: 'Ratings, comments' },
  { id: 'bankAccounts', name: 'Bank Accounts', icon: '🏦', cat: 'finance', desc: 'Accounts, balances' },
  { id: 'loanApplications', name: 'Loans', icon: '💰', cat: 'finance', desc: 'Credit, terms, status' },
  { id: 'investments', name: 'Investments', icon: '📈', cat: 'finance', desc: 'Stocks, bonds, crypto' },
  { id: 'students', name: 'Students', icon: '🎒', cat: 'education', desc: 'GPA, major, enrollment' },
  { id: 'courses', name: 'Courses', icon: '📚', cat: 'education', desc: 'Credits, schedule' },
  { id: 'enrollments', name: 'Enrollments', icon: '📝', cat: 'education', desc: 'Grades, attendance' },
  { id: 'socialPosts', name: 'Social Posts', icon: '💬', cat: 'iot', desc: 'Content, likes, shares' },
  { id: 'socialUsers', name: 'Social Users', icon: '👥', cat: 'iot', desc: 'Followers, engagement' },
  { id: 'notifications', name: 'Notifications', icon: '🔔', cat: 'iot', desc: 'Alerts, messages' },
  { id: 'sensorReadings', name: 'Sensors', icon: '🌡️', cat: 'iot', desc: 'Temperature, humidity' },
  { id: 'devices', name: 'Devices', icon: '📱', cat: 'iot', desc: 'IoT devices, firmware' },
  { id: 'alerts', name: 'Alerts', icon: '⚠️', cat: 'iot', desc: 'Severity, thresholds' },
  { id: 'employees', name: 'Employees', icon: '👔', cat: 'iot', desc: 'HR, salary, performance' },
  { id: 'jobPostings', name: 'Job Postings', icon: '💼', cat: 'iot', desc: 'Positions, applicants' },
  { id: 'timesheets', name: 'Timesheets', icon: '⏰', cat: 'iot', desc: 'Hours, billing' },
];

/* ───────── export helpers ───────── */
function toCSV(data: any[]): string {
  if (!data.length) return '';
  const keys = Object.keys(data[0]);
  const rows = data.map(r => keys.map(k => { const v = String(r[k] ?? ''); return v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v; }).join(','));
  return [keys.join(','), ...rows].join('\n');
}
function toSQL(data: any[], table: string): string {
  if (!data.length) return '';
  const keys = Object.keys(data[0]);
  return data.map(r => {
    const vals = keys.map(k => { const v = r[k]; return typeof v === 'number' || typeof v === 'boolean' ? String(v) : `'${String(v ?? '').replace(/'/g, "''")}'`; });
    return `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${vals.join(', ')});`;
  }).join('\n');
}
function toFHIR(data: any[], type: string): string {
  const entries = data.slice(0, 100).map(r => ({ resource: { resourceType: type === 'patients' ? 'Patient' : 'Observation', id: r.id, ...r } }));
  return JSON.stringify({ resourceType: 'Bundle', type: 'collection', total: data.length, entry: entries }, null, 2);
}
/* applyCustomFields is used internally by custom type generation */
function applyScenarioRules(data: any[], rules: ScenarioRule[], seed: number): any[] {
  const rng = new SeededRandom(seed + 7777);
  return data.map(row => {
    const newRow = { ...row };
    rules.forEach(r => {
      switch (r.action) {
        case 'fixed': newRow[r.field] = r.value ?? ''; break;
        case 'range': newRow[r.field] = rng.nextInt(r.min ?? 0, r.max ?? 100); break;
        case 'null': if (rng.next() * 100 < (r.pct ?? 50)) newRow[r.field] = null; break;
        case 'oneOf': if (r.values?.length) newRow[r.field] = rng.pick(r.values); break;
      }
    });
    return newRow;
  });
}

/* ───────── app ───────── */
export default function App() {
  // Auth
  const [page, setPage] = useState<'auth' | 'app'>('auth');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMsg, setAuthMsg] = useState('');
  const [userName, setUserName] = useState('');
  const [, setUserEmail] = useState('');

  // Data
  const [activeCat, setActiveCat] = useState('general');
  const [selectedType, setSelectedType] = useState('users');
  const [count, setCount] = useState(100);
  const [seed, setSeed] = useState(42);
  const [format, setFormat] = useState<'json' | 'csv' | 'sql' | 'fhir'>('json');
  const [search, setSearch] = useState('');
  const [showCode, setShowCode] = useState(false);

  // Custom features
  const [showCustomType, setShowCustomType] = useState(false);
  const [showCustomScenario, setShowCustomScenario] = useState(false);
  const [customTypes, setCustomTypes] = useState<CustomDataType[]>([]);
  const [customScenarios, setCustomScenarios] = useState<CustomScenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  // Custom type builder
  const [ctName, setCtName] = useState('');
  const [ctIcon, setCtIcon] = useState('🔧');
  const [ctFields, setCtFields] = useState<CustomField[]>([]);

  // Custom scenario builder
  const [csName, setCsName] = useState('');
  const [csDataType, setCsDataType] = useState('users');
  const [csRules, setCsRules] = useState<ScenarioRule[]>([]);

  // Generate data
  const allTypes = [...DATA_TYPES, ...customTypes.map(ct => ({ id: ct.id, name: ct.name, icon: ct.icon, cat: 'custom', desc: ct.fields.length + ' custom fields' }))];
  const visibleTypes = allTypes.filter(t => t.cat === activeCat);

  const data = useMemo(() => {
    const gen = GENERATORS[selectedType];
    let result: any[];
    if (gen) {
      result = gen(count, seed);
    } else {
      const ct = customTypes.find(c => c.id === selectedType);
      if (ct) {
        const rng = new SeededRandom(seed);
        result = Array.from({ length: count }, (_, i) => {
          const row: any = { id: i + 1 };
          ct.fields.forEach(f => {
            if (f.nullPct && rng.next() * 100 < f.nullPct) { row[f.name] = null; return; }
            switch (f.type) {
              case 'text': row[f.name] = (f.prefix ?? '') + (f.options?.length ? rng.pick(f.options) : 'Value_' + rng.nextInt(1, 9999)) + (f.suffix ?? ''); break;
              case 'number': row[f.name] = rng.nextInt(f.min ?? 0, f.max ?? 1000); break;
              case 'boolean': row[f.name] = rng.next() > 0.5; break;
              case 'date': { const s = new Date(2020, 0).getTime(); const e = Date.now(); row[f.name] = new Date(s + rng.next() * (e - s)).toISOString().split('T')[0]; break; }
              case 'select': row[f.name] = f.options?.length ? rng.pick(f.options) : ''; break;
            }
          });
          return row;
        });
      } else {
        result = [];
      }
    }
    // Apply active scenario
    const scenario = customScenarios.find(s => s.id === activeScenario);
    if (scenario && scenario.dataType === selectedType) {
      result = applyScenarioRules(result, scenario.rules, seed);
    }
    return result;
  }, [selectedType, count, seed, customTypes, activeScenario, customScenarios]);

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(r => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(q)));
  }, [data, search]);

  const exportStr = useMemo(() => {
    if (format === 'csv') return toCSV(data);
    if (format === 'sql') return toSQL(data, selectedType);
    if (format === 'fhir') return toFHIR(data, selectedType);
    return JSON.stringify(data.slice(0, 200), null, 2);
  }, [data, format, selectedType]);

  // Auth handlers
  const handleAuth = async () => {
    setAuthError(''); setAuthMsg('');
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email: authEmail, password: authPass, options: { data: { full_name: authName } } });
        if (error) throw error;
        setAuthMsg('Check your email to confirm, or continue as guest.');
      } else {
        const { data: d, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPass });
        if (error) throw error;
        setUserName(d.user?.user_metadata?.full_name || authEmail.split('@')[0]);
        setUserEmail(d.user?.email || '');
        setPage('app');
      }
    } catch (e: any) { setAuthError(e.message || 'Authentication failed'); }
  };

  const guestLogin = () => { setUserName('Guest'); setUserEmail('guest@demo.com'); setPage('app'); };
  const signOut = async () => { await supabase.auth.signOut(); setPage('auth'); setUserName(''); setUserEmail(''); };

  // Download
  const handleDownload = useCallback(() => {
    const ext = format === 'fhir' ? 'json' : format;
    const mime = format === 'csv' ? 'text/csv' : format === 'sql' ? 'text/sql' : 'application/json';
    const content = format === 'csv' ? toCSV(data) : format === 'sql' ? toSQL(data, selectedType) : format === 'fhir' ? toFHIR(data, selectedType) : JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${selectedType}_${count}.${ext}`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
  }, [data, format, selectedType, count]);

  // Custom type helpers
  const addField = () => setCtFields(p => [...p, { id: Date.now().toString(), name: '', type: 'text' }]);
  const removeField = (id: string) => setCtFields(p => p.filter(f => f.id !== id));
  const updateField = (id: string, updates: Partial<CustomField>) => setCtFields(p => p.map(f => f.id === id ? { ...f, ...updates } : f));
  const saveCustomType = () => {
    if (!ctName.trim() || ctFields.length === 0) return;
    const id = 'custom_' + Date.now();
    setCustomTypes(p => [...p, { id, name: ctName, icon: ctIcon, fields: ctFields.filter(f => f.name.trim()) }]);
    setCtName(''); setCtIcon('🔧'); setCtFields([]); setShowCustomType(false);
    setActiveCat('custom');
    setSelectedType(id);
  };

  // Custom scenario helpers
  const addRule = () => setCsRules(p => [...p, { field: '', action: 'fixed', value: '' }]);
  const removeRule = (i: number) => setCsRules(p => p.filter((_, idx) => idx !== i));
  const updateRule = (i: number, updates: Partial<ScenarioRule>) => setCsRules(p => p.map((r, idx) => idx === i ? { ...r, ...updates } : r));
  const saveScenario = () => {
    if (!csName.trim() || csRules.length === 0) return;
    const id = 'scenario_' + Date.now();
    setCustomScenarios(p => [...p, { id, name: csName, dataType: csDataType, rules: csRules.filter(r => r.field.trim()) }]);
    setCsName(''); setCsRules([]); setShowCustomScenario(false);
  };

  const availableFields = data.length > 0 ? Object.keys(data[0]) : [];

  /* ═══════ AUTH PAGE ═══════ */
  if (page === 'auth') {
    return (
      <div style={{ minHeight: '100vh', background: '#08090d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', padding: 20, display: 'flex', gap: 60, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Left side */}
          <div style={{ flex: 1, minWidth: 320, maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>⚡</div>
              <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #06b6d4, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DataForge</h1>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 16, color: '#e2e8f0' }}>Generate Realistic Synthetic Data in Seconds</h2>
            <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>Create test data for users, healthcare, e-commerce, finance, education, IoT & more. Export as JSON, CSV, SQL, or FHIR.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {CATEGORIES.map(c => (
                <span key={c.id} style={{ padding: '6px 14px', borderRadius: 20, background: c.color + '20', color: c.color, fontSize: 13, fontWeight: 600, border: `1px solid ${c.color}40` }}>{c.label}</span>
              ))}
              {customTypes.length > 0 && <span style={{ padding: '6px 14px', borderRadius: 20, background: '#10b98120', color: '#10b981', fontSize: 13, fontWeight: 600, border: '1px solid #10b98140' }}>🔧 Custom ({customTypes.length})</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['27+ Data Types', '50K Records', 'Custom Fields', 'Custom Scenarios', 'JSON / CSV / SQL / FHIR'].map(f => (
                <span key={f} style={{ padding: '4px 12px', borderRadius: 12, background: '#1e293b', color: '#94a3b8', fontSize: 12, border: '1px solid #334155' }}>✓ {f}</span>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <a href="https://www.producthunt.com/products/dataforge-synthetic-data-generator" target="_blank" rel="noopener noreferrer">
                <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1077479&theme=dark&t=1770829437528" alt="DataForge on Product Hunt" width="200" height="43" />
              </a>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div style={{ width: 380, background: '#111318', borderRadius: 16, padding: 32, border: '1px solid #1e293b' }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{authMode === 'signin' ? 'Welcome Back' : 'Create Account'}</h3>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>{authMode === 'signin' ? 'Sign in to continue' : 'Get started for free'}</p>

            {authError && <div style={{ padding: '10px 14px', borderRadius: 8, background: '#7f1d1d40', border: '1px solid #dc2626', color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{authError}</div>}
            {authMsg && <div style={{ padding: '10px 14px', borderRadius: 8, background: '#14532d40', border: '1px solid #16a34a', color: '#86efac', fontSize: 13, marginBottom: 16 }}>{authMsg}</div>}

            {authMode === 'signup' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Full Name</label>
                <input value={authName} onChange={e => setAuthName(e.target.value)} placeholder="John Doe" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#0f1117', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Email</label>
              <input value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="you@example.com" type="email" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#0f1117', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Password</label>
              <input value={authPass} onChange={e => setAuthPass(e.target.value)} placeholder="••••••••" type="password" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#0f1117', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} onKeyDown={e => e.key === 'Enter' && handleAuth()} />
            </div>

            <button onClick={handleAuth} style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>
              {authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>

            <button onClick={guestLogin} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: 14, cursor: 'pointer', marginBottom: 20 }}>
              Continue as Guest →
            </button>

            <p style={{ textAlign: 'center', color: '#64748b', fontSize: 13 }}>
              {authMode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <span onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setAuthError(''); setAuthMsg(''); }} style={{ color: '#06b6d4', cursor: 'pointer', fontWeight: 600 }}>
                {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════ MAIN APP ═══════ */
  return (
    <div style={{ minHeight: '100vh', background: '#08090d', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#0f1117', borderBottom: '1px solid #1e293b', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #06b6d4, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DataForge</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <a href="https://www.producthunt.com/products/dataforge-synthetic-data-generator" target="_blank" rel="noopener noreferrer">
            <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1077479&theme=dark&t=1770829437528" alt="Product Hunt" width="160" height="34" />
          </a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: '#1e293b', color: '#94a3b8', fontSize: 12 }}>👤 {userName || 'User'}</span>
          <button onClick={signOut} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>Sign Out</button>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              style={{ padding: '8px 18px', borderRadius: 10, border: activeCat === c.id ? `2px solid ${c.color}` : '2px solid #1e293b', background: activeCat === c.id ? c.color + '20' : '#111318', color: activeCat === c.id ? c.color : '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              {c.label}
            </button>
          ))}
          {customTypes.length > 0 && (
            <button onClick={() => setActiveCat('custom')}
              style={{ padding: '8px 18px', borderRadius: 10, border: activeCat === 'custom' ? '2px solid #10b981' : '2px solid #1e293b', background: activeCat === 'custom' ? '#10b98120' : '#111318', color: activeCat === 'custom' ? '#10b981' : '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              🔧 Custom ({customTypes.length})
            </button>
          )}
        </div>

        {/* Data Type Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
          {visibleTypes.map(t => (
            <button key={t.id} onClick={() => setSelectedType(t.id)}
              style={{ padding: '14px', borderRadius: 12, border: selectedType === t.id ? `2px solid ${CATEGORIES.find(c => c.id === activeCat)?.color || '#10b981'}` : '2px solid #1e293b', background: selectedType === t.id ? (CATEGORIES.find(c => c.id === activeCat)?.color || '#10b981') + '15' : '#111318', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{t.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{t.name}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* Custom Data Type & Scenario Buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <button onClick={() => setShowCustomType(true)} style={{ padding: '10px 20px', borderRadius: 10, border: '2px dashed #334155', background: '#111318', color: '#06b6d4', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>＋</span> Create Custom Data Type
          </button>
          <button onClick={() => setShowCustomScenario(true)} style={{ padding: '10px 20px', borderRadius: 10, border: '2px dashed #334155', background: '#111318', color: '#a855f7', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🎬</span> Create Custom Scenario
          </button>
          {customScenarios.length > 0 && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>Scenarios:</span>
              {customScenarios.map(s => (
                <button key={s.id} onClick={() => { setActiveScenario(activeScenario === s.id ? null : s.id); setSelectedType(s.dataType); }}
                  style={{ padding: '4px 12px', borderRadius: 8, border: activeScenario === s.id ? '1px solid #a855f7' : '1px solid #334155', background: activeScenario === s.id ? '#a855f720' : '#1e293b', color: activeScenario === s.id ? '#a855f7' : '#94a3b8', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                  {s.name} {activeScenario === s.id && '✓'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Count */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[10, 50, 100, 500, 1000, 5000, 10000, 50000].map(n => (
              <button key={n} onClick={() => setCount(n)}
                style={{ padding: '6px 12px', borderRadius: 8, border: count === n ? '1px solid #06b6d4' : '1px solid #1e293b', background: count === n ? '#06b6d420' : '#111318', color: count === n ? '#06b6d4' : '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {n >= 1000 ? (n / 1000) + 'K' : n}
              </button>
            ))}
          </div>
          {/* Seed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Seed:</span>
            <input type="number" value={seed} onChange={e => setSeed(+e.target.value)} style={{ width: 70, padding: '6px 8px', borderRadius: 8, border: '1px solid #1e293b', background: '#111318', color: '#e2e8f0', fontSize: 13, outline: 'none' }} />
            <button onClick={() => setSeed(Math.floor(Math.random() * 99999))} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #1e293b', background: '#111318', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>🎲</button>
          </div>
          {/* Format */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['json', 'csv', 'sql', 'fhir'] as const).map(f => (
              <button key={f} onClick={() => setFormat(f)}
                style={{ padding: '6px 12px', borderRadius: 8, border: format === f ? '1px solid #3b82f6' : '1px solid #1e293b', background: format === f ? '#3b82f620' : '#111318', color: format === f ? '#3b82f6' : '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase' }}>
                {f}
              </button>
            ))}
          </div>
          {/* Search */}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search data..." style={{ flex: 1, minWidth: 150, padding: '8px 14px', borderRadius: 8, border: '1px solid #1e293b', background: '#111318', color: '#e2e8f0', fontSize: 13, outline: 'none' }} />
          {/* Download */}
          <button onClick={handleDownload} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            ⬇ Download
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ padding: '4px 12px', borderRadius: 8, background: '#1e293b', color: '#94a3b8', fontSize: 12 }}>📊 {data.length.toLocaleString()} records</span>
          <span style={{ padding: '4px 12px', borderRadius: 8, background: '#1e293b', color: '#94a3b8', fontSize: 12 }}>📋 {columns.length} fields</span>
          <span style={{ padding: '4px 12px', borderRadius: 8, background: '#1e293b', color: '#94a3b8', fontSize: 12 }}>🌱 Seed: {seed}</span>
          <span style={{ padding: '4px 12px', borderRadius: 8, background: '#1e293b', color: '#94a3b8', fontSize: 12 }}>📁 {format.toUpperCase()}</span>
          {activeScenario && <span style={{ padding: '4px 12px', borderRadius: 8, background: '#a855f720', color: '#a855f7', fontSize: 12, border: '1px solid #a855f740' }}>🎬 {customScenarios.find(s => s.id === activeScenario)?.name}</span>}
        </div>

        {/* Data Table */}
        <div style={{ borderRadius: 12, border: '1px solid #1e293b', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ overflowX: 'auto', maxHeight: 500 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#111318', position: 'sticky', top: 0, zIndex: 10 }}>
                  {columns.map(col => (
                    <th key={col} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 300).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1e293b15' }} onMouseEnter={e => (e.currentTarget.style.background = '#1e293b30')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    {columns.map(col => (
                      <td key={col} style={{ padding: '8px 14px', whiteSpace: 'nowrap', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', color: row[col] === null ? '#475569' : row[col] === true ? '#22c55e' : row[col] === false ? '#ef4444' : '#cbd5e1' }}>
                        {row[col] === null ? 'null' : row[col] === true ? '✓ true' : row[col] === false ? '✗ false' : String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 300 && (
            <div style={{ padding: '10px', textAlign: 'center', background: '#111318', color: '#64748b', fontSize: 12 }}>
              Showing 300 of {filtered.length.toLocaleString()} records. Download for full dataset.
            </div>
          )}
        </div>

        {/* Code Preview */}
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => setShowCode(!showCode)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #1e293b', background: '#111318', color: '#94a3b8', fontSize: 13, cursor: 'pointer', marginBottom: 10 }}>
            {showCode ? '▼ Hide' : '▶ Show'} Code Preview
          </button>
          {showCode && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => navigator.clipboard.writeText(exportStr)} style={{ position: 'absolute', top: 10, right: 10, padding: '4px 10px', borderRadius: 6, border: '1px solid #334155', background: '#1e293b', color: '#94a3b8', fontSize: 11, cursor: 'pointer', zIndex: 5 }}>Copy</button>
              <pre style={{ background: '#0a0b0f', border: '1px solid #1e293b', borderRadius: 10, padding: 16, fontSize: 12, color: '#94a3b8', overflow: 'auto', maxHeight: 400, margin: 0 }}>{exportStr.slice(0, 5000)}{exportStr.length > 5000 ? '\n\n... truncated ...' : ''}</pre>
            </div>
          )}
        </div>
      </main>

      {/* ═══════ CUSTOM DATA TYPE MODAL ═══════ */}
      {showCustomType && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setShowCustomType(false); }}>
          <div style={{ background: '#111318', borderRadius: 16, border: '1px solid #1e293b', width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto', padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#e2e8f0' }}>🔧 Create Custom Data Type</h2>
              <button onClick={() => setShowCustomType(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Name & Icon */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Type Name *</label>
                <input value={ctName} onChange={e => setCtName(e.target.value)} placeholder="e.g., Vehicles, Recipes, Invoices" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#0a0b0f', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ width: 80 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Icon</label>
                <input value={ctIcon} onChange={e => setCtIcon(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#0a0b0f', color: '#fff', fontSize: 14, outline: 'none', textAlign: 'center', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Fields */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Fields ({ctFields.length})</label>
                <button onClick={addField} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #06b6d4', background: '#06b6d420', color: '#06b6d4', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add Field</button>
              </div>

              {ctFields.length === 0 && (
                <div style={{ padding: 30, textAlign: 'center', border: '2px dashed #1e293b', borderRadius: 12, color: '#475569' }}>
                  <p style={{ fontSize: 14, margin: 0 }}>No fields yet. Click "Add Field" to start building your data type.</p>
                </div>
              )}

              {ctFields.map((f) => (
                <div key={f.id} style={{ padding: 16, background: '#0a0b0f', borderRadius: 10, border: '1px solid #1e293b', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                    <input value={f.name} onChange={e => updateField(f.id, { name: e.target.value })} placeholder="Field name" style={{ flex: 1, minWidth: 120, padding: '8px 12px', borderRadius: 6, border: '1px solid #334155', background: '#111318', color: '#fff', fontSize: 13, outline: 'none' }} />
                    <select value={f.type} onChange={e => updateField(f.id, { type: e.target.value as any })} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #334155', background: '#111318', color: '#fff', fontSize: 13, outline: 'none' }}>
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="date">Date</option>
                      <option value="select">Select from List</option>
                    </select>
                    <button onClick={() => removeField(f.id)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #dc2626', background: '#dc262620', color: '#dc2626', fontSize: 12, cursor: 'pointer' }}>✕</button>
                  </div>

                  {/* Type-specific options */}
                  {f.type === 'number' && (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <div>
                        <label style={{ fontSize: 11, color: '#64748b' }}>Min</label>
                        <input type="number" value={f.min ?? 0} onChange={e => updateField(f.id, { min: +e.target.value })} style={{ width: 80, padding: '6px 8px', borderRadius: 6, border: '1px solid #334155', background: '#111318', color: '#fff', fontSize: 12, outline: 'none', display: 'block', marginTop: 4 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: '#64748b' }}>Max</label>
                        <input type="number" value={f.max ?? 1000} onChange={e => updateField(f.id, { max: +e.target.value })} style={{ width: 80, padding: '6px 8px', borderRadius: 6, border: '1px solid #334155', background: '#111318', color: '#fff', fontSize: 12, outline: 'none', display: 'block', marginTop: 4 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: '#64748b' }}>Prefix</label>
                        <input value={f.prefix ?? ''} onChange={e => updateField(f.id, { prefix: e.target.value })} placeholder="$" style={{ width: 50, padding: '6px 8px', borderRadius: 6, border: '1px solid #334155', background: '#111318', color: '#fff', fontSize: 12, outline: 'none', display: 'block', marginTop: 4 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: '#64748b' }}>Suffix</label>
                        <input value={f.suffix ?? ''} onChange={e => updateField(f.id, { suffix: e.target.value })} placeholder="kg" style={{ width: 50, padding: '6px 8px', borderRadius: 6, border: '1px solid #334155', background: '#111318', color: '#fff', fontSize: 12, outline: 'none', display: 'block', marginTop: 4 }} />
                      </div>
                    </div>
                  )}

                  {(f.type === 'text' || f.type === 'select') && (
                    <div>
                      <label style={{ fontSize: 11, color: '#64748b' }}>Values (comma separated)</label>
                      <input value={(f.options ?? []).join(', ')} onChange={e => updateField(f.id, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="e.g., Red, Blue, Green" style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #334155', background: '#111318', color: '#fff', fontSize: 12, outline: 'none', marginTop: 4, boxSizing: 'border-box' }} />
                    </div>
                  )}

                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 11, color: '#64748b' }}>Null % (0-100)</label>
                    <input type="number" value={f.nullPct ?? 0} onChange={e => updateField(f.id, { nullPct: +e.target.value })} min={0} max={100} style={{ width: 60, padding: '6px 8px', borderRadius: 6, border: '1px solid #334155', background: '#111318', color: '#fff', fontSize: 12, outline: 'none', display: 'block', marginTop: 4 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={saveCustomType} disabled={!ctName.trim() || ctFields.length === 0} style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: ctName.trim() && ctFields.length > 0 ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : '#1e293b', color: ctName.trim() && ctFields.length > 0 ? '#fff' : '#475569', fontSize: 15, fontWeight: 700, cursor: ctName.trim() && ctFields.length > 0 ? 'pointer' : 'default' }}>
                Create Data Type
              </button>
              <button onClick={() => setShowCustomType(false)} style={{ padding: '12px 24px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ CUSTOM SCENARIO MODAL ═══════ */}
      {showCustomScenario && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setShowCustomScenario(false); }}>
          <div style={{ background: '#111318', borderRadius: 16, border: '1px solid #1e293b', width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto', padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#e2e8f0' }}>🎬 Create Custom Scenario</h2>
              <button onClick={() => setShowCustomScenario(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>Define rules to shape your generated data. For example: force all ages to 65+, set 20% of emails to null, or limit status to specific values.</p>

            {/* Scenario Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Scenario Name *</label>
              <input value={csName} onChange={e => setCsName(e.target.value)} placeholder="e.g., Elderly Patients, High-Value Orders" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#0a0b0f', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Target Data Type */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Apply to Data Type</label>
              <select value={csDataType} onChange={e => setCsDataType(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#0a0b0f', color: '#fff', fontSize: 14, outline: 'none' }}>
                {allTypes.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
              </select>
            </div>

            {/* Rules */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Rules ({csRules.length})</label>
                <button onClick={addRule} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #a855f7', background: '#a855f720', color: '#a855f7', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add Rule</button>
              </div>

              {csRules.length === 0 && (
                <div style={{ padding: 30, textAlign: 'center', border: '2px dashed #1e293b', borderRadius: 12, color: '#475569' }}>
                  <p style={{ fontSize: 14, margin: 0 }}>No rules yet. Click "Add Rule" to define how data should be shaped.</p>
                </div>
              )}

              {csRules.map((r, ri) => (
                <div key={ri} style={{ padding: 16, background: '#0a0b0f', borderRadius: 10, border: '1px solid #1e293b', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                    {/* Field selector */}
                    <select value={r.field} onChange={e => updateRule(ri, { field: e.target.value })} style={{ flex: 1, minWidth: 120, padding: '8px 12px', borderRadius: 6, border: '1px solid #334155', background: '#111318', color: '#fff', fontSize: 13, outline: 'none' }}>
                      <option value="">Select field...</option>
                      {availableFields.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    {/* Action */}
                    <select value={r.action} onChange={e => updateRule(ri, { action: e.target.value as any })} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #334155', background: '#111318', color: '#fff', fontSize: 13, outline: 'none' }}>
                      <option value="fixed">Set Fixed Value</option>
                      <option value="range">Number Range</option>
                      <option value="null">Inject Nulls</option>
                      <option value="oneOf">One of Values</option>
                    </select>
                    <button onClick={() => removeRule(ri)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #dc2626', background: '#dc262620', color: '#dc2626', fontSize: 12, cursor: 'pointer' }}>✕</button>
                  </div>

                  {/* Action-specific inputs */}
                  {r.action === 'fixed' && (
                    <input value={r.value ?? ''} onChange={e => updateRule(ri, { value: e.target.value })} placeholder="Fixed value for all rows" style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #334155', background: '#111318', color: '#fff', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                  )}
                  {r.action === 'range' && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, color: '#64748b' }}>Min</label>
                        <input type="number" value={r.min ?? 0} onChange={e => updateRule(ri, { min: +e.target.value })} style={{ width: 100, padding: '6px 8px', borderRadius: 6, border: '1px solid #334155', background: '#111318', color: '#fff', fontSize: 12, outline: 'none', display: 'block', marginTop: 4 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: '#64748b' }}>Max</label>
                        <input type="number" value={r.max ?? 100} onChange={e => updateRule(ri, { max: +e.target.value })} style={{ width: 100, padding: '6px 8px', borderRadius: 6, border: '1px solid #334155', background: '#111318', color: '#fff', fontSize: 12, outline: 'none', display: 'block', marginTop: 4 }} />
                      </div>
                    </div>
                  )}
                  {r.action === 'null' && (
                    <div>
                      <label style={{ fontSize: 11, color: '#64748b' }}>Null percentage (0-100)</label>
                      <input type="number" value={r.pct ?? 50} onChange={e => updateRule(ri, { pct: +e.target.value })} min={0} max={100} style={{ width: 80, padding: '6px 8px', borderRadius: 6, border: '1px solid #334155', background: '#111318', color: '#fff', fontSize: 12, outline: 'none', display: 'block', marginTop: 4 }} />
                    </div>
                  )}
                  {r.action === 'oneOf' && (
                    <div>
                      <label style={{ fontSize: 11, color: '#64748b' }}>Values (comma separated)</label>
                      <input value={(r.values ?? []).join(', ')} onChange={e => updateRule(ri, { values: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="e.g., Active, Pending, Closed" style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #334155', background: '#111318', color: '#fff', fontSize: 12, outline: 'none', marginTop: 4, boxSizing: 'border-box' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Preset Scenario Templates */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 10, display: 'block' }}>Quick Templates</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { label: '🧓 Elderly (65+)', dt: 'patients', rules: [{ field: 'age', action: 'range' as const, min: 65, max: 95 }] },
                  { label: '👶 Pediatric (0-17)', dt: 'patients', rules: [{ field: 'age', action: 'range' as const, min: 0, max: 17 }] },
                  { label: '💰 High Value ($5K+)', dt: 'transactions', rules: [{ field: 'amount', action: 'range' as const, min: 5000, max: 50000 }] },
                  { label: '❌ Denied Claims', dt: 'insuranceClaims', rules: [{ field: 'status', action: 'fixed' as const, value: 'Denied' }] },
                  { label: '🗑️ Dirty Data (30% nulls)', dt: 'users', rules: [{ field: 'email', action: 'null' as const, pct: 30 }, { field: 'phone', action: 'null' as const, pct: 30 }] },
                  { label: '⭐ 5-Star Reviews', dt: 'reviews', rules: [{ field: 'rating', action: 'fixed' as const, value: '5' }] },
                  { label: '🚨 Critical Alerts', dt: 'alerts', rules: [{ field: 'severity', action: 'fixed' as const, value: 'Critical' }] },
                  { label: '🏠 Remote Workers', dt: 'employees', rules: [{ field: 'remote', action: 'fixed' as const, value: 'Remote' }] },
                ].map((tpl, ti) => (
                  <button key={ti} onClick={() => { setCsName(tpl.label.replace(/^[^ ]+ /, '')); setCsDataType(tpl.dt); setCsRules(tpl.rules); }}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={saveScenario} disabled={!csName.trim() || csRules.length === 0} style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: csName.trim() && csRules.length > 0 ? 'linear-gradient(135deg, #a855f7, #ec4899)' : '#1e293b', color: csName.trim() && csRules.length > 0 ? '#fff' : '#475569', fontSize: 15, fontWeight: 700, cursor: csName.trim() && csRules.length > 0 ? 'pointer' : 'default' }}>
                Save Scenario
              </button>
              <button onClick={() => setShowCustomScenario(false)} style={{ padding: '12px 24px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
