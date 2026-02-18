import { useState, useCallback } from 'react';
import { cn } from '../utils/cn';
import {
  Field, FieldType, ExportFormat, CustomFieldConfig,
  generateRows, exportData, SCENARIOS,
} from '../lib/dataGenerator';
import { trackPageVisit } from '../lib/supabase';

// ── Field type catalogue ─────────────────────────────────────────────────
const FIELD_CATEGORIES: { label: string; icon: string; types: { value: FieldType; label: string }[] }[] = [
  {
    label: 'Personal', icon: '👤',
    types: [
      { value: 'fullName',  label: 'Full Name'  },
      { value: 'firstName', label: 'First Name' },
      { value: 'lastName',  label: 'Last Name'  },
      { value: 'email',     label: 'Email'      },
      { value: 'phone',     label: 'Phone'      },
      { value: 'username',  label: 'Username'   },
      { value: 'password',  label: 'Password'   },
    ],
  },
  {
    label: 'Location', icon: '📍',
    types: [
      { value: 'address', label: 'Address'  },
      { value: 'city',    label: 'City'     },
      { value: 'state',   label: 'State'    },
      { value: 'country', label: 'Country'  },
      { value: 'zipCode', label: 'ZIP Code' },
    ],
  },
  {
    label: 'Business', icon: '🏢',
    types: [
      { value: 'company',     label: 'Company'    },
      { value: 'jobTitle',    label: 'Job Title'  },
      { value: 'department',  label: 'Department' },
      { value: 'industry',    label: 'Industry'   },
      { value: 'productName', label: 'Product'    },
      { value: 'price',       label: 'Price'      },
      { value: 'category',    label: 'Category'   },
      { value: 'sku',         label: 'SKU'        },
      { value: 'rating',      label: 'Rating'     },
    ],
  },
  {
    label: 'Data', icon: '🔢',
    types: [
      { value: 'uuid',        label: 'UUID'       },
      { value: 'integer',     label: 'Integer'    },
      { value: 'float',       label: 'Float'      },
      { value: 'boolean',     label: 'Boolean'    },
      { value: 'percentage',  label: 'Percentage' },
      { value: 'currency',    label: 'Currency'   },
      { value: 'date',        label: 'Date'       },
      { value: 'timestamp',   label: 'Timestamp'  },
      { value: 'status',      label: 'Status'     },
      { value: 'priority',    label: 'Priority'   },
      { value: 'tag',         label: 'Tag'        },
    ],
  },
  {
    label: 'Internet', icon: '🌐',
    types: [
      { value: 'url',        label: 'URL'        },
      { value: 'ipAddress',  label: 'IP Address' },
      { value: 'creditCard', label: 'Credit Card'},
      { value: 'color',      label: 'Color Hex'  },
      { value: 'userAgent',  label: 'User Agent' },
    ],
  },
  {
    label: 'Text', icon: '📝',
    types: [
      { value: 'sentence',  label: 'Sentence'  },
      { value: 'paragraph', label: 'Paragraph' },
      { value: 'word',      label: 'Word'      },
      { value: 'slug',      label: 'Slug'      },
    ],
  },
  {
    label: 'Healthcare', icon: '🏥',
    types: [
      { value: 'medicalRecordNo',  label: 'Medical Record #'  },
      { value: 'diagnosis',        label: 'Diagnosis'         },
      { value: 'icdCode',          label: 'ICD Code'          },
      { value: 'medication',       label: 'Medication'        },
      { value: 'dosage',           label: 'Dosage'            },
      { value: 'bloodType',        label: 'Blood Type'        },
      { value: 'allergen',         label: 'Allergen'          },
      { value: 'procedure',        label: 'Procedure'         },
      { value: 'insuranceProvider',label: 'Insurance'         },
      { value: 'hospitalWard',     label: 'Hospital Ward'     },
      { value: 'doctorName',       label: 'Doctor Name'       },
      { value: 'vitalBP',          label: 'Blood Pressure'    },
      { value: 'vitalHR',          label: 'Heart Rate'        },
      { value: 'vitalTemp',        label: 'Temperature'       },
      { value: 'labTest',          label: 'Lab Test'          },
      { value: 'labResult',        label: 'Lab Result'        },
      { value: 'patientAge',       label: 'Patient Age'       },
      { value: 'gender',           label: 'Gender'            },
      { value: 'admissionType',    label: 'Admission Type'    },
      { value: 'dischargeStatus',  label: 'Discharge Status'  },
    ],
  },
  {
    label: 'Custom', icon: '⚙️',
    types: [
      { value: 'custom_list',     label: 'Custom List'     },
      { value: 'custom_regex',    label: 'Custom Pattern'  },
      { value: 'custom_template', label: 'Custom Template' },
    ],
  },
];

const ALL_TYPES = FIELD_CATEGORIES.flatMap(c => c.types);
const typeLabel = (t: FieldType) => ALL_TYPES.find(x => x.value === t)?.label ?? t;

const FORMAT_OPTS: { value: ExportFormat; label: string; color: string }[] = [
  { value: 'json', label: 'JSON', color: '#f59e0b' },
  { value: 'csv',  label: 'CSV',  color: '#10b981' },
  { value: 'sql',  label: 'SQL',  color: '#3b82f6' },
  { value: 'xml',  label: 'XML',  color: '#ef4444' },
];

const uid = () => Math.random().toString(36).slice(2, 10);
const CUSTOM_TYPES: FieldType[] = ['custom_list', 'custom_regex', 'custom_template'];

type SideTab = 'schema' | 'custom' | 'scenarios';

interface Props { userName: string; onSignOut: () => void; }

export default function Generator({ userName, onSignOut }: Props) {
  const [fields, setFields]           = useState<Field[]>([
    { id: uid(), name: 'id',      type: 'uuid'     },
    { id: uid(), name: 'name',    type: 'fullName' },
    { id: uid(), name: 'email',   type: 'email'    },
    { id: uid(), name: 'company', type: 'company'  },
  ]);
  const [count, setCount]             = useState(25);
  const [format, setFormat]           = useState<ExportFormat>('json');
  const [rows, setRows]               = useState<Record<string, unknown>[]>([]);
  const [outputText, setOutputText]   = useState('');
  const [copied, setCopied]           = useState(false);
  const [generating, setGenerating]   = useState(false);
  const [activeTab, setActiveTab]     = useState<'table' | 'code'>('table');
  const [sideTab, setSideTab]         = useState<SideTab>('schema');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [tableName, setTableName]     = useState('my_table');
  const [editingConfig, setEditingConfig] = useState<string | null>(null);

  // Custom field being built in the Custom tab
  const [customName, setCustomName]   = useState('my_field');
  const [customType, setCustomType]   = useState<FieldType>('custom_list');
  const [customList, setCustomList]   = useState('option_a,option_b,option_c');
  const [customRegex, setCustomRegex] = useState('[A-Z]{3}[0-9]{4}');
  const [customTmpl, setCustomTmpl]   = useState('ITEM-{{integer}}-{{city}}');

  // ── Field ops ─────────────────────────────────────────────────────────
  const addField = (type: FieldType, config?: CustomFieldConfig) => {
    const base = typeLabel(type).toLowerCase().replace(/\s+/g, '_');
    setFields(f => [...f, { id: uid(), name: `${base}_${uid().slice(0, 4)}`, type, config }]);
    setShowAddPanel(false);
  };

  const addCustomField = () => {
    const config: CustomFieldConfig = customType === 'custom_list'
      ? { listValues: customList }
      : customType === 'custom_regex'
      ? { regexPattern: customRegex }
      : { template: customTmpl };
    setFields(f => [...f, { id: uid(), name: customName.trim() || 'custom_field', type: customType, config }]);
    setSideTab('schema');
  };

  const removeField = (id: string) => setFields(f => f.filter(x => x.id !== id));
  const updateName  = (id: string, name: string) => setFields(f => f.map(x => x.id === id ? { ...x, name } : x));
  const updateType  = (id: string, type: FieldType) => setFields(f => f.map(x => x.id === id ? { ...x, type, config: undefined } : x));
  const updateConfig = (id: string, config: CustomFieldConfig) => setFields(f => f.map(x => x.id === id ? { ...x, config } : x));

  const loadScenario = (scenarioId: string) => {
    const s = SCENARIOS.find(sc => sc.id === scenarioId);
    if (!s) return;
    setFields(s.fields.map(f => ({ id: uid(), ...f })));
    if (s.rowCount) setCount(s.rowCount);
    setRows([]); setOutputText('');
    setSideTab('schema');
  };

  // ── Generate ──────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!fields.length) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 300));
    const generated = generateRows(fields, count);
    const text      = exportData(generated, format, tableName);
    setRows(generated);
    setOutputText(text);
    setGenerating(false);
    setActiveTab('table');
    trackPageVisit('generate', userName);
  }, [fields, count, format, tableName, userName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${tableName}.${format}`;
    a.click();
  };

  const previewRows = rows.slice(0, 10);
  const headers     = fields.map(f => f.name);

  // ── Helpers for config display ─────────────────────────────────────────
  const configSummary = (f: Field) => {
    if (!f.config) return null;
    if (f.type === 'custom_list') return f.config.listValues?.slice(0, 30) + (f.config.listValues && f.config.listValues.length > 30 ? '…' : '');
    if (f.type === 'custom_regex') return f.config.regexPattern;
    if (f.type === 'custom_template') return f.config.template?.slice(0, 30);
    return null;
  };

  return (
    <div className="min-h-screen" style={{ background: '#07070f', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Top Nav ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/10"
           style={{ background: 'rgba(7,7,15,0.9)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 0 20px rgba(249,115,22,0.4)' }}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>
            <span className="font-black text-white text-xl tracking-tight">
              Data<span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#f97316,#fbbf24)' }}> Forge</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-orange-400 border border-orange-500/30 ml-1"
                  style={{ background: 'rgba(249,115,22,0.08)' }}>
              ⚡ PRO
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10"
                 style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400 font-medium">{userName}</span>
            </div>
            <button onClick={onSignOut}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-white border border-white/10 hover:border-white/20 transition-all">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 flex gap-5">

        {/* ── LEFT SIDEBAR ────────────────────────────────────────────── */}
        <div className="w-72 xl:w-80 flex-shrink-0 space-y-4">

          {/* Sidebar tab strip */}
          <div className="flex rounded-2xl p-1 border border-white/10"
               style={{ background: 'rgba(255,255,255,0.03)' }}>
            {([
              { id: 'schema',    label: 'Schema',    icon: '🏗️' },
              { id: 'custom',    label: 'Custom',    icon: '⚙️' },
              { id: 'scenarios', label: 'Scenarios', icon: '🎭' },
            ] as { id: SideTab; label: string; icon: string }[]).map(t => (
              <button key={t.id} onClick={() => setSideTab(t.id)}
                      className={cn('flex-1 py-2 text-[11px] font-bold rounded-xl transition-all',
                        sideTab === t.id ? 'text-white' : 'text-slate-600 hover:text-slate-400')}
                      style={sideTab === t.id ? { background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 12px rgba(249,115,22,0.35)' } : {}}>
                <span className="mr-1">{t.icon}</span>{t.label}
              </button>
            ))}
          </div>

          {/* ── SCHEMA TAB ────────────────────────────────────────────── */}
          {sideTab === 'schema' && (
            <>
              <div className="rounded-2xl border border-white/10 overflow-hidden"
                   style={{ background: 'rgba(255,255,255,0.025)' }}>
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Schema Fields</span>
                  <span className="text-[10px] text-slate-600 font-semibold bg-white/5 px-2 py-0.5 rounded-full">{fields.length}</span>
                </div>
                <div className="p-2.5 space-y-1.5 max-h-[340px] overflow-y-auto">
                  {fields.map((f, i) => (
                    <div key={f.id} className="group rounded-xl border border-white/5 hover:border-white/10 transition-all"
                         style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="flex items-center gap-2 px-2.5 py-2">
                        <span className="text-[10px] text-slate-700 font-mono w-4 text-center flex-shrink-0">{i + 1}</span>
                        <input value={f.name} onChange={e => updateName(f.id, e.target.value)}
                               className="flex-1 min-w-0 bg-transparent text-xs text-slate-300 outline-none font-mono"
                               placeholder="field_name" />
                        <select value={f.type} onChange={e => updateType(f.id, e.target.value as FieldType)}
                                className="text-[10px] bg-transparent outline-none cursor-pointer max-w-[100px] truncate"
                                style={{ color: CUSTOM_TYPES.includes(f.type) ? '#fb923c' : '#818cf8' }}>
                          {FIELD_CATEGORIES.map(cat => (
                            <optgroup key={cat.label} label={`${cat.icon} ${cat.label}`}>
                              {cat.types.map(t => (
                                <option key={t.value} value={t.value} style={{ background: '#1a1a2e' }}>{t.label}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <button onClick={() => removeField(f.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-400 transition-all flex-shrink-0">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                      {/* Custom config inline */}
                      {CUSTOM_TYPES.includes(f.type) && (
                        <div className="px-2.5 pb-2">
                          {editingConfig === f.id ? (
                            <div className="space-y-1.5">
                              {f.type === 'custom_list' && (
                                <input
                                  value={f.config?.listValues ?? ''}
                                  onChange={e => updateConfig(f.id, { listValues: e.target.value })}
                                  placeholder="val1,val2,val3"
                                  className="w-full text-[10px] font-mono px-2 py-1.5 rounded-lg outline-none text-slate-300 border border-white/10"
                                  style={{ background: 'rgba(255,255,255,0.05)' }}
                                />
                              )}
                              {f.type === 'custom_regex' && (
                                <input
                                  value={f.config?.regexPattern ?? ''}
                                  onChange={e => updateConfig(f.id, { regexPattern: e.target.value })}
                                  placeholder="[A-Z]{3}[0-9]{4}"
                                  className="w-full text-[10px] font-mono px-2 py-1.5 rounded-lg outline-none text-slate-300 border border-white/10"
                                  style={{ background: 'rgba(255,255,255,0.05)' }}
                                />
                              )}
                              {f.type === 'custom_template' && (
                                <input
                                  value={f.config?.template ?? ''}
                                  onChange={e => updateConfig(f.id, { template: e.target.value })}
                                  placeholder="ITEM-{{integer}}-{{city}}"
                                  className="w-full text-[10px] font-mono px-2 py-1.5 rounded-lg outline-none text-slate-300 border border-white/10"
                                  style={{ background: 'rgba(255,255,255,0.05)' }}
                                />
                              )}
                              <button onClick={() => setEditingConfig(null)}
                                      className="text-[10px] text-orange-400 font-semibold hover:text-orange-300">Done ✓</button>
                            </div>
                          ) : (
                            <button onClick={() => setEditingConfig(f.id)}
                                    className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-orange-400 font-mono transition-colors">
                              <span className="text-orange-500/60">⚙</span>
                              <span className="truncate max-w-[180px]">{configSummary(f) ?? 'Configure…'}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-2.5 border-t border-white/10">
                  <button onClick={() => setShowAddPanel(!showAddPanel)}
                          className="w-full py-2.5 rounded-xl text-xs font-bold border border-dashed transition-all flex items-center justify-center gap-1.5"
                          style={{
                            color: showAddPanel ? '#f97316' : '#64748b',
                            borderColor: showAddPanel ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.1)',
                            background: showAddPanel ? 'rgba(249,115,22,0.05)' : 'transparent',
                          }}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
                    {showAddPanel ? 'Close Picker' : 'Add Field'}
                  </button>
                </div>
              </div>

              {/* Add field type picker */}
              {showAddPanel && (
                <div className="rounded-2xl border border-white/10 overflow-hidden"
                     style={{ background: 'rgba(255,255,255,0.025)' }}>
                  <div className="px-4 py-3 border-b border-white/10">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Pick Type</span>
                  </div>
                  <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
                    {FIELD_CATEGORIES.map(cat => (
                      <div key={cat.label}>
                        <div className="text-[10px] text-slate-600 font-bold mb-1.5 px-1 uppercase tracking-wider">{cat.icon} {cat.label}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.types.map(t => (
                            <button key={t.value} onClick={() => addField(t.value)}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-white/10 transition-all"
                                    style={{ color: CUSTOM_TYPES.includes(t.value) ? '#fb923c' : '#94a3b8', background: 'rgba(255,255,255,0.03)' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = CUSTOM_TYPES.includes(t.value) ? 'rgba(249,115,22,0.4)' : 'rgba(99,102,241,0.4)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── CUSTOM FIELDS TAB ─────────────────────────────────────── */}
          {sideTab === 'custom' && (
            <div className="rounded-2xl border border-white/10 overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.025)' }}>
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <span className="text-sm">⚙️</span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Custom Field Builder</span>
              </div>
              <div className="p-4 space-y-5">

                {/* Field name */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Field Name</label>
                  <input value={customName} onChange={e => setCustomName(e.target.value)}
                         placeholder="my_custom_field"
                         className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none border border-white/10 font-mono transition-all"
                         style={{ background: 'rgba(255,255,255,0.05)' }}
                         onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 2px rgba(249,115,22,0.2)'; }}
                         onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
                </div>

                {/* Type selector */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Custom Type</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { value: 'custom_list',     label: '📋 List',     desc: 'Pick from values' },
                      { value: 'custom_regex',    label: '🔡 Pattern',  desc: 'Regex-style' },
                      { value: 'custom_template', label: '📐 Template', desc: 'Token-based' },
                    ] as { value: FieldType; label: string; desc: string }[]).map(t => (
                      <button key={t.value} onClick={() => setCustomType(t.value)}
                              className="py-2.5 px-2 rounded-xl text-center transition-all border"
                              style={{
                                background: customType === t.value ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
                                borderColor: customType === t.value ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.08)',
                              }}>
                        <div className="text-[11px] font-bold" style={{ color: customType === t.value ? '#fb923c' : '#64748b' }}>{t.label}</div>
                        <div className="text-[9px] text-slate-700 mt-0.5">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Config per type */}
                {customType === 'custom_list' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Values <span className="text-slate-700 normal-case font-normal">(comma-separated)</span>
                    </label>
                    <textarea value={customList} onChange={e => setCustomList(e.target.value)} rows={3}
                              placeholder="apple,banana,cherry,mango"
                              className="w-full px-3 py-2.5 rounded-xl text-xs text-white outline-none border border-white/10 font-mono resize-none transition-all"
                              style={{ background: 'rgba(255,255,255,0.05)' }}
                              onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 2px rgba(249,115,22,0.2)'; }}
                              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
                    <p className="text-[10px] text-slate-700 mt-1.5">One random value will be picked per row.</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {customList.split(',').slice(0, 6).map(v => v.trim()).filter(Boolean).map((v, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-orange-400 border border-orange-500/25"
                              style={{ background: 'rgba(249,115,22,0.08)' }}>{v}</span>
                      ))}
                    </div>
                  </div>
                )}

                {customType === 'custom_regex' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Pattern</label>
                    <input value={customRegex} onChange={e => setCustomRegex(e.target.value)}
                           placeholder="[A-Z]{3}[0-9]{4}"
                           className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none border border-white/10 font-mono transition-all"
                           style={{ background: 'rgba(255,255,255,0.05)' }}
                           onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 2px rgba(249,115,22,0.2)'; }}
                           onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
                    <div className="mt-3 rounded-xl p-3 space-y-1.5 border border-white/5"
                         style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Supported Tokens</p>
                      {[
                        ['[A-Z]{n}', 'n uppercase letters'],
                        ['[a-z]{n}', 'n lowercase letters'],
                        ['[0-9]{n}', 'n digits'],
                        ['[A-Za-z0-9]{n}', 'n alphanumeric'],
                        ['LITERAL',  'copied as-is'],
                      ].map(([tok, desc]) => (
                        <div key={tok} className="flex items-center gap-2">
                          <code className="text-[10px] text-orange-400 font-mono bg-orange-500/10 px-1.5 py-0.5 rounded">{tok}</code>
                          <span className="text-[10px] text-slate-600">{desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {customType === 'custom_template' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Template String</label>
                    <input value={customTmpl} onChange={e => setCustomTmpl(e.target.value)}
                           placeholder="ORDER-{{integer}}-{{city}}"
                           className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none border border-white/10 font-mono transition-all"
                           style={{ background: 'rgba(255,255,255,0.05)' }}
                           onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 2px rgba(249,115,22,0.2)'; }}
                           onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }} />
                    <div className="mt-3 rounded-xl p-3 space-y-1.5 border border-white/5"
                         style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Token Examples</p>
                      {[
                        ['{{integer}}',   'Random integer'],
                        ['{{city}}',      'Random city'],
                        ['{{firstName}}', 'Random first name'],
                        ['{{uuid}}',      'UUID v4'],
                        ['{{date}}',      'Random date'],
                        ['{{company}}',   'Company name'],
                      ].map(([tok, desc]) => (
                        <div key={tok} className="flex items-center gap-2">
                          <code className="text-[10px] text-orange-400 font-mono bg-orange-500/10 px-1.5 py-0.5 rounded">{tok}</code>
                          <span className="text-[10px] text-slate-600">{desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={addCustomField}
                        className="w-full py-3 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all"
                        style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 6px 20px rgba(249,115,22,0.4)' }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
                  Add to Schema
                </button>
              </div>
            </div>
          )}

          {/* ── SCENARIOS TAB ─────────────────────────────────────────── */}
          {sideTab === 'scenarios' && (
            <div className="rounded-2xl border border-white/10 overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.025)' }}>
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <span className="text-sm">🎭</span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Scenarios</span>
              </div>
              <div className="p-3 space-y-2 max-h-[560px] overflow-y-auto">
                {SCENARIOS.map(sc => (
                  <button key={sc.id} onClick={() => loadScenario(sc.id)}
                          className="w-full text-left rounded-xl p-3 border border-white/8 hover:border-orange-500/30 transition-all group"
                          style={{ background: 'rgba(255,255,255,0.02)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.04)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg leading-none">{sc.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{sc.label}</div>
                          <div className="text-[10px] text-slate-600 mt-0.5">{sc.description}</div>
                        </div>
                      </div>
                      <svg className="w-3.5 h-3.5 text-slate-700 group-hover:text-orange-400 flex-shrink-0 mt-0.5 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-700 font-mono">{sc.fields.length} fields</span>
                      <span className="text-slate-800">·</span>
                      <span className="text-[10px] text-slate-700 font-mono">{sc.rowCount ?? 50} rows</span>
                      {sc.fields.some(f => f.type.startsWith('custom_')) && (
                        <>
                          <span className="text-slate-800">·</span>
                          <span className="text-[10px] text-orange-500 font-semibold">custom fields</span>
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="rounded-2xl border border-white/10 overflow-hidden"
               style={{ background: 'rgba(255,255,255,0.025)' }}>
            <div className="px-4 py-3 border-b border-white/10">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Settings</span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Rows to Generate</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={1} max={1000} value={count} onChange={e => setCount(+e.target.value)} className="flex-1" />
                  <input type="number" min={1} max={10000} value={count}
                         onChange={e => setCount(Math.max(1, Math.min(10000, +e.target.value)))}
                         className="w-20 px-2 py-1.5 rounded-lg text-sm text-white text-center outline-none border border-white/10"
                         style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Table / Root Name</label>
                <input value={tableName} onChange={e => setTableName(e.target.value)}
                       className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none border border-white/10 font-mono"
                       style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Export Format</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {FORMAT_OPTS.map(f => (
                    <button key={f.value} onClick={() => setFormat(f.value)}
                            className={cn('py-2 rounded-xl text-xs font-black transition-all', format === f.value ? 'text-white' : 'text-slate-600 hover:text-slate-400 border border-white/10')}
                            style={format === f.value ? { background: f.color, boxShadow: `0 4px 14px ${f.color}55` } : { background: 'rgba(255,255,255,0.03)' }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generate CTA */}
          <button onClick={handleGenerate} disabled={generating || !fields.length}
                  className="w-full py-4 rounded-2xl font-black text-white text-sm transition-all duration-300 flex items-center justify-center gap-2"
                  style={{
                    background: generating ? 'rgba(249,115,22,0.3)' : 'linear-gradient(135deg,#f97316,#ea580c)',
                    boxShadow: generating ? 'none' : '0 8px 32px rgba(249,115,22,0.5)',
                  }}>
            {generating ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/></svg>
                Forging…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                Forge {count.toLocaleString()} Rows
              </>
            )}
          </button>
        </div>

        {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Stats bar */}
          {rows.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Rows',    value: rows.length.toLocaleString(),                icon: '📊', color: '#f97316' },
                { label: 'Fields',  value: fields.length,                               icon: '🏷️', color: '#8b5cf6' },
                { label: 'Format',  value: format.toUpperCase(),                        icon: '📄', color: '#06b6d4' },
                { label: 'Size',    value: `~${(outputText.length / 1024).toFixed(1)} KB`, icon: '💾', color: '#10b981' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-4 border border-white/10 relative overflow-hidden"
                     style={{ background: 'rgba(255,255,255,0.025)' }}>
                  <div className="absolute inset-0 opacity-5 pointer-events-none rounded-2xl"
                       style={{ background: `radial-gradient(circle at top left, ${s.color}, transparent 70%)` }} />
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xl font-black text-white">{s.value}</div>
                  <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Output area */}
          {rows.length > 0 ? (
            <div className="rounded-2xl border border-white/10 overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 flex-wrap gap-2">
                <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {([['table', 'Table View'], ['code', 'Code View']] as const).map(([k, l]) => (
                    <button key={k} onClick={() => setActiveTab(k)}
                            className={cn('px-4 py-1.5 rounded-lg text-xs font-bold transition-all', activeTab === k ? 'text-white' : 'text-slate-600 hover:text-slate-300')}
                            style={activeTab === k ? { background: 'linear-gradient(135deg,#f97316,#ea580c)' } : {}}>
                      {l}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleCopy}
                          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border',
                            copied ? 'text-emerald-400 border-emerald-500/40' : 'text-slate-400 hover:text-white border-white/10 hover:border-white/20')}
                          style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {copied ? '✓ Copied!' : (
                      <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>Copy</>
                    )}
                  </button>
                  <button onClick={handleDownload}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                          style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 15V3m0 12l-4-4m4 4l4-4"/><path strokeLinecap="round" d="M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"/></svg>
                    Download .{format}
                  </button>
                </div>
              </div>

              {activeTab === 'table' ? (
                <div className="overflow-auto max-h-[520px]">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0" style={{ background: 'rgba(10,10,20,0.98)' }}>
                      <tr>
                        <th className="px-4 py-3 text-left text-slate-700 font-semibold border-b border-white/10 w-10">#</th>
                        {headers.map(h => (
                          <th key={h} className="px-4 py-3 text-left text-slate-400 font-bold border-b border-white/10 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-orange-500/70">◆</span>
                              {h}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors">
                          <td className="px-4 py-2.5 text-slate-700 font-mono">{i + 1}</td>
                          {headers.map(h => (
                            <td key={h} className="px-4 py-2.5 text-slate-400 font-mono max-w-[200px] truncate">
                              {String(row[h] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {rows.length > 10 && (
                    <div className="px-4 py-3 text-xs text-slate-700 text-center border-t border-white/5">
                      Showing 10 of {rows.length.toLocaleString()} rows — download to view all
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <pre className="p-5 text-xs overflow-auto max-h-[520px] text-slate-400 leading-relaxed"
                       style={{ fontFamily: 'JetBrains Mono, monospace', background: 'transparent' }}>
                    {outputText.slice(0, 8000)}{outputText.length > 8000 ? '\n\n… (truncated — download for full output)' : ''}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            /* Empty state */
            <div className="rounded-2xl border border-white/10 flex flex-col items-center justify-center py-28"
                 style={{ background: 'rgba(255,255,255,0.015)' }}>
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
                   style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(234,88,12,0.12))', border: '1px solid rgba(249,115,22,0.2)' }}>
                <svg className="w-12 h-12 opacity-70" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Ready to Forge</h3>
              <p className="text-slate-600 text-sm text-center max-w-sm leading-relaxed">
                Build a schema or pick a <span className="text-orange-400 font-semibold cursor-pointer" onClick={() => setSideTab('scenarios')}>Scenario →</span><br/>
                then hit <span className="text-orange-400 font-semibold">Forge</span> to generate your data.
              </p>
              <div className="flex items-center gap-3 mt-8">
                <button onClick={() => setSideTab('scenarios')}
                        className="px-6 py-3 rounded-xl font-bold text-white text-sm border border-orange-500/40 hover:border-orange-500/70 transition-all"
                        style={{ background: 'rgba(249,115,22,0.1)' }}>
                  Browse Scenarios
                </button>
                <button onClick={handleGenerate}
                        className="px-6 py-3 rounded-xl font-black text-white text-sm transition-all"
                        style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 8px 24px rgba(249,115,22,0.4)' }}>
                  ⚡ Quick Generate
                </button>
              </div>
            </div>
          )}

          {/* Custom Field Examples Info Card */}
          <div className="rounded-2xl border border-white/10 overflow-hidden"
               style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">⚙️ Custom Field Types</span>
              <button onClick={() => setSideTab('custom')}
                      className="text-[10px] font-bold text-orange-400 hover:text-orange-300 transition-colors">
                Build one →
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: '📋',
                  title: 'Custom List',
                  color: '#f97316',
                  desc: 'Define your own set of values. One is randomly picked per row.',
                  example: 'active,inactive,pending,banned',
                  type: 'custom_list' as FieldType,
                  config: { listValues: 'active,inactive,pending,banned' },
                },
                {
                  icon: '🔡',
                  title: 'Custom Pattern',
                  color: '#8b5cf6',
                  desc: 'Generate strings using character-class notation.',
                  example: 'ORD-[A-Z]{2}[0-9]{5}',
                  type: 'custom_regex' as FieldType,
                  config: { regexPattern: 'ORD-[A-Z]{2}[0-9]{5}' },
                },
                {
                  icon: '📐',
                  title: 'Custom Template',
                  color: '#06b6d4',
                  desc: 'Compose values using {{tokens}} from any built-in type.',
                  example: 'USER-{{integer}}-{{city}}',
                  type: 'custom_template' as FieldType,
                  config: { template: 'USER-{{integer}}-{{city}}' },
                },
              ].map(card => (
                <div key={card.title} className="rounded-xl p-4 border border-white/8 group cursor-pointer transition-all"
                     style={{ background: 'rgba(255,255,255,0.02)' }}
                     onClick={() => addField(card.type, card.config)}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{card.icon}</span>
                    <span className="text-xs font-bold text-slate-300">{card.title}</span>
                    <span className="ml-auto text-[10px] text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">+ Add</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2">{card.desc}</p>
                  <code className="text-[10px] font-mono px-2 py-1 rounded-lg block"
                        style={{ background: `${card.color}12`, color: card.color }}>
                    {card.example}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
