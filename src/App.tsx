import { useState, useMemo, useCallback } from 'react';
import {
  generateData,
  getColumns,
  exportToJSON,
  exportToCSV,
  exportToSQL,
  exportToHL7FHIR,
  type DataType,
  type FakeData,
} from './utils/fakerData';
import { applyScenario, type ScenarioConfig, PRESET_SCENARIOS } from './utils/scenarios';
import { ScenarioBuilder } from './components/ScenarioBuilder';

import { cn } from './utils/cn';

type ExportFormat = 'json' | 'csv' | 'sql' | 'fhir';

interface DataTypeConfig {
  value: DataType;
  label: string;
  icon: string;
  description: string;
  category: 'general' | 'healthcare';
  color: string;
}

const DATA_TYPES: DataTypeConfig[] = [
  { value: 'users', label: 'Users', icon: '👤', description: 'Names, emails, phones, jobs', category: 'general', color: 'from-blue-500/20 to-cyan-500/20' },
  { value: 'addresses', label: 'Addresses', icon: '🏠', description: 'Streets, cities, ZIP codes', category: 'general', color: 'from-purple-500/20 to-pink-500/20' },
  { value: 'transactions', label: 'Transactions', icon: '💳', description: 'Payments, amounts, merchants', category: 'general', color: 'from-emerald-500/20 to-teal-500/20' },
  { value: 'patients', label: 'Patients', icon: '🏥', description: 'Demographics, MRN, allergies', category: 'healthcare', color: 'from-teal-500/20 to-cyan-500/20' },
  { value: 'medicalRecords', label: 'Medical Records', icon: '📋', description: 'Visits, diagnoses, vitals', category: 'healthcare', color: 'from-blue-500/20 to-indigo-500/20' },
  { value: 'prescriptions', label: 'Prescriptions', icon: '💊', description: 'Rx orders, meds, dosages', category: 'healthcare', color: 'from-pink-500/20 to-rose-500/20' },
  { value: 'labResults', label: 'Lab Results', icon: '🔬', description: 'Tests, values, flags', category: 'healthcare', color: 'from-amber-500/20 to-orange-500/20' },
  { value: 'insuranceClaims', label: 'Insurance Claims', icon: '📄', description: 'Claims, CPT codes, billing', category: 'healthcare', color: 'from-indigo-500/20 to-purple-500/20' },
  { value: 'healthcareProviders', label: 'Providers', icon: '⚕️', description: 'Doctors, NPI, specialties', category: 'healthcare', color: 'from-emerald-500/20 to-green-500/20' },
];

const EXPORT_FORMATS: { value: ExportFormat; label: string; icon: string }[] = [
  { value: 'json', label: 'JSON', icon: '{ }' },
  { value: 'csv', label: 'CSV', icon: '📊' },
  { value: 'sql', label: 'SQL', icon: '🗃️' },
  { value: 'fhir', label: 'FHIR', icon: '🔥' },
];

const PRESET_COUNTS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000];

const HEALTHCARE_TYPES: DataType[] = ['patients', 'medicalRecords', 'prescriptions', 'labResults', 'insuranceClaims', 'healthcareProviders'];

export function App() {
  const [dataType, setDataType] = useState<DataType>('users');
  const [count, setCount] = useState(25);
  const [customCount, setCustomCount] = useState('');
  const [seed, setSeed] = useState(42);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'general' | 'healthcare'>('general');
  const [generationTime, setGenerationTime] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success' | 'fallback'>('idle');

  // Scenario state
  const [showScenarioBuilder, setShowScenarioBuilder] = useState(false);
  const [activeScenario, setActiveScenario] = useState<Partial<ScenarioConfig> | null>(null);

  const effectiveCount = customCount ? parseInt(customCount) || count : count;

  const data = useMemo(() => {
    const start = performance.now();
    let result = generateData(dataType, effectiveCount, seed);

    // Apply scenario if active
    if (activeScenario) {
      result = applyScenario(
        result as unknown as Record<string, unknown>[],
        activeScenario,
        seed
      ) as unknown as FakeData[];
    }

    const elapsed = performance.now() - start;
    setGenerationTime(elapsed);
    return result;
  }, [dataType, effectiveCount, seed, activeScenario]);

  const columns = useMemo(() => getColumns(dataType), [dataType]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(row => {
      return columns.some(col => {
        const val = String((row as unknown as Record<string, unknown>)[col.key] ?? '').toLowerCase();
        return val.includes(q);
      });
    });
  }, [data, searchQuery, columns]);

  const exportedData = useMemo(() => {
    switch (exportFormat) {
      case 'json': return exportToJSON(data);
      case 'csv': return exportToCSV(data, dataType);
      case 'sql': return exportToSQL(data, dataType);
      case 'fhir': return exportToHL7FHIR(data, dataType);
    }
  }, [data, dataType, exportFormat]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(exportedData).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [exportedData]);

  const handleDownload = useCallback(() => {
    const ext = exportFormat === 'json' || exportFormat === 'fhir' ? 'json' : exportFormat === 'csv' ? 'csv' : 'sql';
    const mime = exportFormat === 'json' || exportFormat === 'fhir' ? 'application/json' : 'text/plain';
    const filename = `fake_${dataType}_${effectiveCount}.${ext}`;
    const blob = new Blob([exportedData], { type: mime });

    setDownloadStatus('downloading');

    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 250);

      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus('idle'), 3000);
    } catch {
      try {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setDownloadStatus('fallback');
        setTimeout(() => {
          URL.revokeObjectURL(url);
          setDownloadStatus('idle');
        }, 5000);
      } catch {
        navigator.clipboard.writeText(exportedData).then(() => {
          setDownloadStatus('fallback');
          setTimeout(() => setDownloadStatus('idle'), 3000);
        });
      }
    }
  }, [exportedData, exportFormat, dataType, effectiveCount]);

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 99999) + 1);
  };

  const handleApplyScenario = (scenario: Partial<ScenarioConfig> | null) => {
    setActiveScenario(scenario);
    setShowScenarioBuilder(false);
  };

  const isHealthcareType = HEALTHCARE_TYPES.includes(dataType);

  // Find matching preset name
  const activePreset = useMemo(() => {
    if (!activeScenario) return null;
    const match = PRESET_SCENARIOS.find(p =>
      JSON.stringify(p.config) === JSON.stringify(activeScenario) && p.dataTypes.includes(dataType)
    );
    return match ?? null;
  }, [activeScenario, dataType]);

  // Count how many field rules & global rules are active
  const scenarioRuleSummary = useMemo(() => {
    if (!activeScenario) return null;
    const fieldCount = activeScenario.fieldRules ? Object.keys(activeScenario.fieldRules).length : 0;
    const globalRules: string[] = [];
    if (activeScenario.nullRate && activeScenario.nullRate > 0) globalRules.push(`${activeScenario.nullRate}% nulls`);
    if (activeScenario.duplicateRate && activeScenario.duplicateRate > 0) globalRules.push(`${activeScenario.duplicateRate}% dupes`);
    if (activeScenario.errorRate && activeScenario.errorRate > 0) globalRules.push(`${activeScenario.errorRate}% errors`);
    return { fieldCount, globalRules };
  }, [activeScenario]);

  const getCellDisplay = (row: FakeData, key: string) => {
    const value = (row as unknown as Record<string, unknown>)[key];

    // Handle null/undefined from scenarios
    if (value === null || value === undefined) {
      return <span className="text-[11px] text-dark-600 italic font-[JetBrains_Mono,monospace]">null</span>;
    }

    // Handle error values
    if (typeof value === 'string' && value.startsWith('##ERR##')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md ring-1 ring-red-500/20 font-[JetBrains_Mono,monospace]">
          ⚠ {value}
        </span>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <span className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase',
          value
            ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20'
            : 'bg-red-500/15 text-red-400 ring-1 ring-red-500/20'
        )}>
          <span className={cn('w-1.5 h-1.5 rounded-full', value ? 'bg-emerald-400' : 'bg-red-400')} />
          {key === 'acceptingPatients' ? (value ? 'Yes' : 'No') : (value ? 'Active' : 'Inactive')}
        </span>
      );
    }

    if (key === 'flag') {
      const flagConfig: Record<string, { bg: string; text: string; icon: string }> = {
        'Normal': { bg: 'bg-emerald-500/15 ring-emerald-500/20', text: 'text-emerald-400', icon: '✓' },
        'High': { bg: 'bg-red-500/15 ring-red-500/20', text: 'text-red-400', icon: '↑' },
        'Low': { bg: 'bg-amber-500/15 ring-amber-500/20', text: 'text-amber-400', icon: '↓' },
        'Critical': { bg: 'bg-red-600/20 ring-red-500/30', text: 'text-red-300', icon: '⚠' },
      };
      const cfg = flagConfig[String(value)] ?? { bg: 'bg-dark-600 ring-dark-500', text: 'text-dark-200', icon: '' };
      return (
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1', cfg.bg, cfg.text)}>
          {cfg.icon} {String(value)}
        </span>
      );
    }

    if (key === 'type' && dataType === 'transactions') {
      return (
        <span className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1',
          value === 'credit'
            ? 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20'
            : 'bg-amber-500/15 text-amber-400 ring-amber-500/20'
        )}>
          {value === 'credit' ? '↗' : '↙'} {String(value)}
        </span>
      );
    }

    if (key === 'status') {
      const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
        'Completed': { bg: 'bg-emerald-500/10 ring-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
        'Active': { bg: 'bg-emerald-500/10 ring-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
        'Signed': { bg: 'bg-emerald-500/10 ring-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
        'Approved': { bg: 'bg-emerald-500/10 ring-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
        'Final': { bg: 'bg-emerald-500/10 ring-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
        'Filled': { bg: 'bg-emerald-500/10 ring-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
        'Pending': { bg: 'bg-yellow-500/10 ring-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
        'Pending Review': { bg: 'bg-yellow-500/10 ring-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
        'In Review': { bg: 'bg-yellow-500/10 ring-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
        'Refill Requested': { bg: 'bg-yellow-500/10 ring-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
        'Preliminary': { bg: 'bg-yellow-500/10 ring-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
        'Processing': { bg: 'bg-blue-500/10 ring-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
        'In Progress': { bg: 'bg-blue-500/10 ring-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
        'Observation': { bg: 'bg-blue-500/10 ring-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
        'Provisional': { bg: 'bg-blue-500/10 ring-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
        'Admitted': { bg: 'bg-indigo-500/10 ring-indigo-500/20', text: 'text-indigo-400', dot: 'bg-indigo-400' },
        'On Hold': { bg: 'bg-orange-500/10 ring-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-400' },
        'On Leave': { bg: 'bg-orange-500/10 ring-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-400' },
        'Partially Approved': { bg: 'bg-orange-500/10 ring-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-400' },
        'Partial Fill': { bg: 'bg-orange-500/10 ring-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-400' },
        'Failed': { bg: 'bg-red-500/10 ring-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
        'Denied': { bg: 'bg-red-500/10 ring-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
        'Cancelled': { bg: 'bg-dark-500/30 ring-dark-400/20', text: 'text-dark-300', dot: 'bg-dark-400' },
        'Expired': { bg: 'bg-dark-500/30 ring-dark-400/20', text: 'text-dark-300', dot: 'bg-dark-400' },
        'Inactive': { bg: 'bg-dark-500/30 ring-dark-400/20', text: 'text-dark-300', dot: 'bg-dark-400' },
        'Retired': { bg: 'bg-dark-500/30 ring-dark-400/20', text: 'text-dark-300', dot: 'bg-dark-400' },
        'Deceased': { bg: 'bg-dark-600/50 ring-dark-500/30', text: 'text-dark-300', dot: 'bg-dark-400' },
        'Discharged': { bg: 'bg-teal-500/10 ring-teal-500/20', text: 'text-teal-400', dot: 'bg-teal-400' },
        'Transferred': { bg: 'bg-purple-500/10 ring-purple-500/20', text: 'text-purple-400', dot: 'bg-purple-400' },
        'Appealed': { bg: 'bg-purple-500/10 ring-purple-500/20', text: 'text-purple-400', dot: 'bg-purple-400' },
        'Resubmitted': { bg: 'bg-cyan-500/10 ring-cyan-500/20', text: 'text-cyan-400', dot: 'bg-cyan-400' },
        'Amended': { bg: 'bg-cyan-500/10 ring-cyan-500/20', text: 'text-cyan-400', dot: 'bg-cyan-400' },
        'Corrected': { bg: 'bg-cyan-500/10 ring-cyan-500/20', text: 'text-cyan-400', dot: 'bg-cyan-400' },
      };
      const cfg = statusColors[String(value)] ?? { bg: 'bg-dark-600 ring-dark-500', text: 'text-dark-200', dot: 'bg-dark-400' };
      return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1', cfg.bg, cfg.text)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
          {String(value)}
        </span>
      );
    }

    if (key === 'bloodType') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-1 text-[11px] font-bold text-red-400 ring-1 ring-red-500/20 font-[JetBrains_Mono,monospace]">
          🩸 {String(value)}
        </span>
      );
    }

    if (['amount', 'chargedAmount', 'allowedAmount', 'paidAmount', 'patientResponsibility'].includes(key)) {
      if (key === 'amount' && dataType === 'transactions') {
        const txRow = row as unknown as Record<string, unknown>;
        const isCredit = txRow['type'] === 'credit';
        return (
          <span className={cn('font-[JetBrains_Mono,monospace] text-[13px] font-medium', isCredit ? 'text-emerald-400' : 'text-dark-100')}>
            {isCredit ? '+' : '-'}${String(value)}
          </span>
        );
      }
      return <span className="font-[JetBrains_Mono,monospace] text-[13px] font-medium text-dark-100">${String(value)}</span>;
    }

    if (key === 'rating') {
      const rating = parseFloat(String(value));
      return (
        <span className="inline-flex items-center gap-1.5">
          <span className="text-amber-400 text-xs">★</span>
          <span className="font-[JetBrains_Mono,monospace] text-[13px] font-semibold text-amber-300">{isNaN(rating) ? String(value) : rating.toFixed(1)}</span>
        </span>
      );
    }

    if (key === 'oxygenSat') {
      const spO2 = Number(value);
      return (
        <span className={cn('font-[JetBrains_Mono,monospace] text-[13px] font-medium', spO2 < 95 ? 'text-red-400 font-bold' : 'text-dark-100')}>
          {isNaN(spO2) ? String(value) : `${spO2}%`}
        </span>
      );
    }

    if (['systolicBP', 'diastolicBP', 'heartRate', 'respiratoryRate'].includes(key)) {
      return <span className="font-[JetBrains_Mono,monospace] text-[13px] text-dark-100">{String(value)}</span>;
    }

    if (key === 'temperature') {
      const temp = parseFloat(String(value));
      return (
        <span className={cn('font-[JetBrains_Mono,monospace] text-[13px]', temp > 100.4 ? 'text-red-400 font-bold' : 'text-dark-100')}>
          {isNaN(temp) ? String(value) : `${String(value)}°F`}
        </span>
      );
    }

    if (['diagnosisCode', 'procedureCode', 'testCode'].includes(key)) {
      return (
        <span className="inline-flex items-center rounded-md bg-dark-650 px-2 py-0.5 font-[JetBrains_Mono,monospace] text-[11px] font-medium text-accent-cyan ring-1 ring-dark-550">
          {String(value)}
        </span>
      );
    }

    if (key === 'mrn') {
      return <span className="font-[JetBrains_Mono,monospace] text-[12px] font-medium text-cyan-400">{String(value)}</span>;
    }

    if (key === 'npi') {
      return <span className="font-[JetBrains_Mono,monospace] text-[12px] text-dark-200">{String(value)}</span>;
    }

    if (key === 'id') {
      return <span className="font-[JetBrains_Mono,monospace] text-[11px] text-dark-400">{String(value).slice(0, 8)}…</span>;
    }

    if (key === 'email') {
      return <span className="text-[13px] text-blue-400">{String(value)}</span>;
    }

    if (key === 'allergies') {
      if (String(value) === 'NKDA') {
        return <span className="text-[12px] text-dark-400 italic">NKDA</span>;
      }
      return <span className="text-[12px] text-amber-400/80">{String(value)}</span>;
    }

    // NaN check for number-type-mismatch errors
    if (value === -1 || value === 'NaN') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md ring-1 ring-orange-500/20 font-[JetBrains_Mono,monospace]">
          ⚠ {String(value)}
        </span>
      );
    }

    return <span className="text-[13px] text-dark-100">{String(value ?? '')}</span>;
  };

  const displayedCount = Math.min(filteredData.length, 500);
  const exportSize = formatBytes(new Blob([exportedData]).size);

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/[0.03] rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/[0.02] rounded-full blur-[200px]" />
      </div>

      {/* Header */}
      <header className="relative z-30 border-b border-dark-700/50 glass sticky top-0">
        <div className="max-w-[1920px] mx-auto px-5 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 8h6M9 16h3" />
                  </svg>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-dark-900 animate-glow" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  DataForge
                  <span className="text-[10px] font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent uppercase tracking-widest border border-cyan-500/20 rounded-full px-2 py-0.5">
                    Pro
                  </span>
                </h1>
                <p className="text-[12px] text-dark-300 tracking-wide">Synthetic data generator for apps & healthcare</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Active Scenario badge in header */}
              {activeScenario && (
                <button
                  onClick={() => setShowScenarioBuilder(true)}
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg px-3 py-2 hover:border-purple-500/30 transition-all group"
                >
                  <span className="text-sm">{activePreset?.icon ?? '🎬'}</span>
                  <span className="text-[12px] font-semibold text-purple-300 group-hover:text-purple-200 transition-colors">
                    {activePreset?.name ?? 'Custom Scenario'}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-glow" />
                </button>
              )}
              <div className="hidden md:flex items-center gap-2 bg-dark-800 border border-dark-650 rounded-lg px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-glow" />
                <span className="text-[12px] font-medium text-dark-200 font-[JetBrains_Mono,monospace]">
                  {filteredData.length.toLocaleString()}<span className="text-dark-400"> / </span>{data.length.toLocaleString()}
                </span>
                <span className="text-dark-500">records</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-dark-800 border border-dark-650 rounded-lg px-3 py-2">
                <span className="text-[11px] text-dark-400">⚡</span>
                <span className="text-[12px] font-[JetBrains_Mono,monospace] text-dark-200">
                  {generationTime < 1 ? '<1' : Math.round(generationTime)}ms
                </span>
              </div>
 
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-[1920px] mx-auto px-5 lg:px-8 py-6">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'general' as const, label: 'General Data', icon: '📊', gradient: 'from-blue-500 to-cyan-500' },
            { key: 'healthcare' as const, label: 'Healthcare / HIPAA', icon: '🏥', gradient: 'from-teal-500 to-emerald-500' },
          ].map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                'flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border',
                activeCategory === cat.key
                  ? `bg-gradient-to-r ${cat.gradient} text-white border-transparent shadow-lg ${cat.key === 'general' ? 'shadow-blue-500/20' : 'shadow-teal-500/20'}`
                  : 'bg-dark-800/60 text-dark-200 border-dark-650 hover:border-dark-500 hover:text-dark-100 hover:bg-dark-750'
              )}
            >
              <span className="text-lg">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Data Type Cards */}
        <div className="mb-7">
          <label className="block text-[11px] font-semibold text-dark-400 uppercase tracking-[0.15em] mb-3 ml-1">
            Select Data Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {DATA_TYPES.filter(dt => dt.category === activeCategory).map(dt => (
              <button
                key={dt.value}
                onClick={() => { setDataType(dt.value); setSearchQuery(''); }}
                className={cn(
                  'relative rounded-xl border p-4 text-left transition-all duration-300 group overflow-hidden',
                  dataType === dt.value
                    ? 'border-cyan-500/40 bg-dark-800 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/20'
                    : 'border-dark-650 bg-dark-800/40 hover:border-dark-500 hover:bg-dark-800/70'
                )}
              >
                {dataType === dt.value && (
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-30', dt.color)} />
                )}
                <div className="relative">
                  <div className="text-2xl mb-2 filter drop-shadow-lg">{dt.icon}</div>
                  <div className={cn(
                    'font-semibold text-sm leading-tight',
                    dataType === dt.value ? 'text-white' : 'text-dark-100'
                  )}>{dt.label}</div>
                  <div className="text-[11px] text-dark-400 mt-1.5 leading-snug">{dt.description}</div>
                </div>
                {dataType === dt.value && (
                  <div className="absolute top-3 right-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-glow" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Scenario Section */}
        <div className="mb-7">
          <div className={cn(
            'rounded-xl border overflow-hidden transition-all duration-300',
            activeScenario
              ? 'border-purple-500/30 bg-gradient-to-r from-purple-500/5 via-dark-800/40 to-pink-500/5'
              : 'border-dark-650 bg-dark-800/40'
          )}>
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                  activeScenario
                    ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/20'
                    : 'bg-dark-750 border border-dark-600'
                )}>
                  <span className="text-lg">{activeScenario ? (activePreset?.icon ?? '🎬') : '🎬'}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Custom Scenarios</h3>
                    {activeScenario ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-[10px] font-bold ring-1 ring-purple-500/20 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-glow" />
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-dark-500 bg-dark-750 px-2 py-0.5 rounded-full">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-dark-400 mt-0.5">
                    {activeScenario
                                          ? (activePreset ? activePreset.description : 'Custom field rules and data quality settings applied')
                    : 'Define data patterns, edge cases, null rates, duplicate records, and field constraints'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeScenario && (
                  <button
                    onClick={() => setActiveScenario(null)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[12px] font-medium border border-red-500/20 hover:bg-red-500/20 transition-all"
                  >
                    ✕ Clear
                  </button>
                )}
                <button
                  onClick={() => setShowScenarioBuilder(true)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all active:scale-[0.98]',
                    activeScenario
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30'
                      : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30'
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {activeScenario ? 'Edit Scenario' : 'Configure Scenario'}
                </button>
              </div>
            </div>

            {/* Active scenario summary badges */}
            {activeScenario && scenarioRuleSummary && (
              <div className="px-5 pb-4 flex flex-wrap gap-2">
                {scenarioRuleSummary.globalRules.map((rule, i) => (
                  <span key={i} className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium ring-1',
                    rule.includes('null') ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20' :
                    rule.includes('dupe') ? 'bg-purple-500/10 text-purple-400 ring-purple-500/20' :
                    'bg-red-500/10 text-red-400 ring-red-500/20'
                  )}>
                    {rule.includes('null') ? '🕳️' : rule.includes('dupe') ? '👯' : '💥'} {rule}
                  </span>
                ))}
                {scenarioRuleSummary.fieldCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[11px] font-medium ring-1 ring-cyan-500/20">
                    🎛️ {scenarioRuleSummary.fieldCount} field {scenarioRuleSummary.fieldCount === 1 ? 'rule' : 'rules'}
                  </span>
                )}
                {activeScenario.fieldRules && Object.entries(activeScenario.fieldRules).map(([field, rule]) => {
                  if (!rule.enabled) return null;
                  const parts: string[] = [];
                  if (rule.fixedValue) parts.push(`= "${rule.fixedValue}"`);
                  if (rule.customValues && rule.customValues.length > 0) parts.push(`${rule.customValues.length} values`);
                  if (rule.minValue !== undefined) parts.push(`≥ ${rule.minValue}`);
                  if (rule.maxValue !== undefined) parts.push(`≤ ${rule.maxValue}`);
                  if (rule.dateStart) parts.push(`from ${rule.dateStart}`);
                  if (rule.dateEnd) parts.push(`to ${rule.dateEnd}`);
                  if (rule.nullPercent && rule.nullPercent > 0) parts.push(`${rule.nullPercent}% null`);
                  if (parts.length === 0) return null;
                  return (
                    <span key={field} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-750 text-dark-200 text-[11px] font-medium ring-1 ring-dark-600">
                      <span className="font-[JetBrains_Mono,monospace] text-cyan-400/80">{field}</span>
                      <span className="text-dark-500">→</span>
                      <span className="text-dark-300">{parts.join(', ') as string}</span>
                    </span>
                  );
                }) as React.ReactNode}
              </div>
            )}
          </div>
        </div>

        {/* Controls Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-7">
          {/* Record Count */}
          <div className="lg:col-span-6 bg-dark-800/40 border border-dark-650 rounded-xl p-5">
            <label className="block text-[11px] font-semibold text-dark-400 uppercase tracking-[0.15em] mb-3">
              Record Count
            </label>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {PRESET_COUNTS.map(c => (
                <button
                  key={c}
                  onClick={() => { setCount(c); setCustomCount(''); }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 border',
                    count === c && !customCount
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'bg-dark-750 text-dark-300 border-dark-600 hover:border-dark-500 hover:text-dark-200',
                    c >= 10000 ? 'text-[11px]' : ''
                  )}
                >
                  {c >= 1000 ? `${(c / 1000).toFixed(c % 1000 === 0 ? 0 : 1)}K` : c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-dark-400 uppercase tracking-wider font-medium">Custom</span>
              <input
                type="number"
                min={1}
                max={100000}
                value={customCount}
                onChange={e => setCustomCount(e.target.value)}
                placeholder="e.g. 7500"
                className="w-36 rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-[13px] font-[JetBrains_Mono,monospace] text-dark-100 placeholder:text-dark-500 focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/30 outline-none transition-all"
              />
              {customCount && (
                <button
                  onClick={() => setCustomCount('')}
                  className="text-[11px] text-dark-400 hover:text-dark-200 transition-colors"
                >
                  ✕ Clear
                </button>
              )}
              {effectiveCount > 10000 && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  ⚡ Large dataset
                </span>
              )}
            </div>
          </div>

          {/* Seed */}
          <div className="lg:col-span-2 bg-dark-800/40 border border-dark-650 rounded-xl p-5">
            <label className="block text-[11px] font-semibold text-dark-400 uppercase tracking-[0.15em] mb-3">
              Seed Value
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={seed}
                onChange={e => setSeed(parseInt(e.target.value) || 1)}
                className="flex-1 min-w-0 rounded-lg border border-dark-600 bg-dark-750 px-3 py-2.5 text-[13px] font-[JetBrains_Mono,monospace] text-dark-100 focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/30 outline-none transition-all"
              />
              <button
                onClick={randomizeSeed}
                className="px-3 py-2.5 rounded-lg bg-dark-750 border border-dark-600 hover:bg-dark-700 hover:border-dark-500 text-lg transition-all"
                title="Randomize seed"
              >
                🎲
              </button>
            </div>
            <p className="mt-2.5 text-[10px] text-dark-500 leading-relaxed">
              Same seed = same data. Use for reproducible testing.
            </p>
          </div>

          {/* Export */}
          <div className="lg:col-span-4 bg-dark-800/40 border border-dark-650 rounded-xl p-5">
            <label className="block text-[11px] font-semibold text-dark-400 uppercase tracking-[0.15em] mb-3">Export Format</label>
            <div className="flex gap-1 bg-dark-850 border border-dark-700 rounded-lg p-1 mb-4">
              {EXPORT_FORMATS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setExportFormat(f.value)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-[12px] font-semibold transition-all duration-200',
                    exportFormat === f.value
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 ring-1 ring-cyan-500/30 shadow-sm'
                      : 'text-dark-400 hover:text-dark-200 hover:bg-dark-750',
                    f.value === 'fhir' && !isHealthcareType ? 'opacity-40' : ''
                  )}
                >
                  <span className="text-[11px]">{f.icon}</span>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                disabled={downloadStatus === 'downloading'}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-[13px] transition-all duration-300 active:scale-[0.98]',
                  downloadStatus === 'success'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20'
                    : downloadStatus === 'fallback'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500'
                )}
              >
                {downloadStatus === 'downloading' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Preparing...
                  </>
                ) : downloadStatus === 'success' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Downloaded!
                  </>
                ) : downloadStatus === 'fallback' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Opened in new tab
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                    <span className="text-[10px] opacity-70 font-[JetBrains_Mono,monospace]">({exportSize})</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowExport(!showExport)}
                className={cn(
                  'px-3.5 py-2.5 rounded-lg border text-[13px] font-bold font-[JetBrains_Mono,monospace] transition-all duration-200',
                  showExport
                    ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 ring-1 ring-cyan-500/20'
                    : 'bg-dark-750 text-dark-300 border-dark-600 hover:border-dark-500 hover:text-dark-200'
                )}
                title="Preview export"
              >
                {'</>'}
              </button>
            </div>
          </div>
        </div>

        {/* HL7 FHIR note */}
        {exportFormat === 'fhir' && (
          <div className={cn(
            'mb-6 rounded-xl border p-4 flex items-start gap-3 animate-float-in',
            isHealthcareType
              ? 'bg-teal-500/5 border-teal-500/20'
              : 'bg-amber-500/5 border-amber-500/20'
          )}>
            <span className="text-xl mt-0.5">🔥</span>
            <div>
              <p className="text-sm font-semibold text-dark-100">HL7 FHIR Export</p>
              <p className="text-[12px] text-dark-300 mt-1 leading-relaxed">
                {isHealthcareType
                  ? `Exports ${dataType === 'patients' ? 'Patient' : dataType === 'labResults' ? 'Observation' : 'resource'} FHIR Bundle. Best supported for Patients & Lab Results.`
                  : 'FHIR format is designed for healthcare data types. Switch to a healthcare type for proper FHIR output.'
                }
              </p>
            </div>
          </div>
        )}

        {/* Export Preview */}
        {showExport && (
          <div className="mb-7 rounded-xl border border-dark-650 bg-dark-900 overflow-hidden shadow-2xl shadow-black/30 animate-float-in">
            <div className="flex items-center justify-between px-5 py-3 bg-dark-800/80 border-b border-dark-700/50">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[12px] text-dark-400 font-[JetBrains_Mono,monospace]">
                  fake_{dataType}_{effectiveCount}.{exportFormat === 'fhir' ? 'json' : exportFormat}
                </span>
                <span className="text-[11px] text-dark-500 bg-dark-700 px-2 py-0.5 rounded-full font-[JetBrains_Mono,monospace]">
                  {exportSize}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 border',
                  copied
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-dark-700 text-dark-300 border-dark-600 hover:bg-dark-650 hover:text-dark-200'
                )}
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 text-[13px] text-emerald-400/90 font-[JetBrains_Mono,monospace] overflow-auto max-h-80 leading-relaxed selection:bg-cyan-500/20">
              {exportedData.slice(0, 8000)}{exportedData.length > 8000 ? '\n\n... (truncated — download for full data)' : ''}
            </pre>
          </div>
        )}

        {/* Search */}
        <div className="mb-5 flex items-center gap-4">
          <div className="relative flex-1 max-w-lg">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${DATA_TYPES.find(d => d.value === dataType)?.label.toLowerCase() ?? dataType}...`}
              className="w-full rounded-xl border border-dark-600 bg-dark-800/60 pl-10 pr-10 py-3 text-[13px] text-dark-100 placeholder:text-dark-500 focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/30 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <span className="text-[11px] text-dark-400 bg-dark-800 border border-dark-650 px-3 py-2 rounded-lg whitespace-nowrap font-[JetBrains_Mono,monospace]">
              {filteredData.length.toLocaleString()} <span className="text-dark-500">matches</span>
            </span>
          )}
          {filteredData.length > displayedCount && (
            <span className="text-[11px] text-dark-400 bg-dark-800 border border-dark-650 px-3 py-2 rounded-lg whitespace-nowrap font-[JetBrains_Mono,monospace]">
              {displayedCount.toLocaleString()} <span className="text-dark-500">of</span> {filteredData.length.toLocaleString()}
            </span>
          )}
        </div>

        {/* Data Table */}
        <div className="rounded-xl border border-dark-650 bg-dark-900/50 shadow-2xl shadow-black/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700/50 bg-dark-800/60">
                  <th className="px-4 py-3.5 text-left text-[10px] font-bold text-dark-400 uppercase tracking-[0.15em] w-14">
                    #
                  </th>
                  {columns.map(col => (
                    <th
                      key={col.key}
                      className="px-4 py-3.5 text-left text-[10px] font-bold text-dark-400 uppercase tracking-[0.15em] whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-750/50">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-16 text-center">
                      <div className="text-4xl mb-3 opacity-50">🔍</div>
                      <div className="font-semibold text-dark-200 text-sm">No results found</div>
                      <div className="text-[12px] mt-1.5 text-dark-500">Try adjusting your search query</div>
                    </td>
                  </tr>
                ) : (
                  filteredData.slice(0, displayedCount).map((row, i) => (
                    <tr
                      key={`${(row as unknown as Record<string, string>).id}-${i}`}
                      className="table-row-hover"
                    >
                      <td className="px-4 py-3 text-[11px] text-dark-500 font-[JetBrains_Mono,monospace]">{i + 1}</td>
                      {columns.map(col => (
                        <td key={col.key} className="px-4 py-3 whitespace-nowrap max-w-[240px] truncate">
                          {getCellDisplay(row, col.key)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredData.length > displayedCount && (
            <div className="px-5 py-3.5 bg-dark-800/40 border-t border-dark-700/50 text-center text-[12px] text-dark-400">
              Showing first <span className="text-dark-200 font-medium">{displayedCount.toLocaleString()}</span> of{' '}
              <span className="text-dark-200 font-medium">{filteredData.length.toLocaleString()}</span> records.
              <button onClick={handleDownload} className="text-cyan-400 hover:text-cyan-300 ml-1.5 font-medium transition-colors">
                Download full dataset →
              </button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <StatCard icon="📊" label="Records" value={data.length.toLocaleString()} glow="cyan" />
          <StatCard icon="📋" label="Fields" value={columns.length.toString()} glow="blue" />
          <StatCard icon="🌱" label="Seed" value={seed.toString()} glow="purple" />
          <StatCard icon="📦" label="Export" value={exportSize} glow="emerald" />
          <StatCard icon="⚡" label="Gen Time" value={generationTime < 1 ? '<1ms' : `${Math.round(generationTime)}ms`} glow="amber" />
          <StatCard icon="🔤" label="Format" value={exportFormat.toUpperCase()} glow="pink" />
          <StatCard
            icon="🎬"
            label="Scenario"
            value={activeScenario ? (activePreset?.name?.split(' ')[0] ?? 'Custom') : 'None'}
            glow={activeScenario ? 'purple' : 'cyan'}
          />
        </div>

        {/* Healthcare disclaimer */}
        {isHealthcareType && (
          <div className="mt-7 rounded-xl border border-teal-500/15 bg-teal-500/5 p-5 flex items-start gap-4 animate-float-in">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🔒</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-400">Synthetic Data — HIPAA Safe</p>
              <p className="text-[12px] text-dark-300 mt-1.5 leading-relaxed">
                All healthcare data is <strong className="text-dark-200">100% synthetically generated</strong> for testing purposes only.
                No real patient information (PHI/PII) is used. Suitable for development, testing,
                HIPAA-compliant training environments, and demo applications. All identifiers are fictional.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-[11px] text-dark-500 pb-8 space-y-1.5">
          <p>All data is randomly generated and does not represent real individuals or medical records.</p>
          <p className="text-dark-600">Same seed value always produces identical data for reproducible testing.</p>
        </div>
      </div>

      {/* Scenario Builder Modal */}
      {showScenarioBuilder && (
        <ScenarioBuilder
          dataType={dataType}
          activeScenario={activeScenario}
          onApplyScenario={handleApplyScenario}
          onClose={() => setShowScenarioBuilder(false)}
        />
      )}

      {/* Download Toast Notification */}
      {downloadStatus !== 'idle' && downloadStatus !== 'downloading' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-float-in">
          <div className={cn(
            'flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-xl',
            downloadStatus === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300 shadow-emerald-500/20'
              : 'bg-amber-950/90 border-amber-500/30 text-amber-300 shadow-amber-500/20'
          )}>
            {downloadStatus === 'success' ? (
              <>
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="text-sm font-semibold">Download started</div>
                  <div className="text-[11px] opacity-70 font-[JetBrains_Mono,monospace]">
                    fake_{dataType}_{effectiveCount}.{exportFormat === 'json' || exportFormat === 'fhir' ? 'json' : exportFormat}
                  </div>
                </div>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-sm font-semibold">Opened in new tab</div>
                  <div className="text-[11px] opacity-70">Use Ctrl+S / Cmd+S to save the file</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, glow }: { icon: string; label: string; value: string; glow: string }) {
  const glowColors: Record<string, { border: string; shadow: string; text: string }> = {
    cyan: { border: 'border-cyan-500/10', shadow: 'shadow-cyan-500/5', text: 'text-cyan-400' },
    blue: { border: 'border-blue-500/10', shadow: 'shadow-blue-500/5', text: 'text-blue-400' },
    purple: { border: 'border-purple-500/10', shadow: 'shadow-purple-500/5', text: 'text-purple-400' },
    emerald: { border: 'border-emerald-500/10', shadow: 'shadow-emerald-500/5', text: 'text-emerald-400' },
    amber: { border: 'border-amber-500/10', shadow: 'shadow-amber-500/5', text: 'text-amber-400' },
    pink: { border: 'border-pink-500/10', shadow: 'shadow-pink-500/5', text: 'text-pink-400' },
  };
  const cfg = glowColors[glow] ?? glowColors.cyan;

  return (
    <div className={cn(
      'rounded-xl border bg-dark-800/40 p-4 shadow-lg transition-all duration-300 hover:bg-dark-800/60',
      cfg.border, cfg.shadow
    )}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-[10px] font-bold text-dark-400 uppercase tracking-[0.15em]">{label}</span>
      </div>
      <div className={cn('text-lg font-bold font-[JetBrains_Mono,monospace] truncate', cfg.text)}>
        {value}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
