import { useState, useCallback } from 'react';
import { cn } from '../utils/cn';
import {
  Field, FieldType, ExportFormat, CustomFieldConfig,
  generateRows, exportData, SCENARIOS,
} from '../lib/dataGenerator';
import { trackPageVisit, trackEvent } from '../lib/supabase';
import {
  Database, Zap, Layers, Heart, Settings, Sparkles, Plus, X, ChevronRight,
  Copy, Download, Check, Loader2, Eye, Code2, LogOut, Activity,
  UserCircle, Stethoscope, Building2, ListChecks, FileType, FileCode2,
  ClipboardList, ArrowRight, Menu, ChevronDown,
} from 'lucide-react';

// ── Field type catalogue ─────────────────────────────────────────────────
const FIELD_CATEGORIES: { label: string; Icon: typeof Database; types: { value: FieldType; label: string }[] }[] = [
  {
    label: 'Personal', Icon: UserCircle,
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
    label: 'Location', Icon: Building2,
    types: [
      { value: 'address', label: 'Address'  },
      { value: 'city',    label: 'City'     },
      { value: 'state',   label: 'State'    },
      { value: 'country', label: 'Country'  },
      { value: 'zipCode', label: 'ZIP Code' },
    ],
  },
  {
    label: 'Business', Icon: Building2,
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
    label: 'Data', Icon: Database,
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
    label: 'Internet', Icon: Activity,
    types: [
      { value: 'url',        label: 'URL'        },
      { value: 'ipAddress',  label: 'IP Address' },
      { value: 'creditCard', label: 'Credit Card'},
      { value: 'color',      label: 'Color Hex'  },
      { value: 'userAgent',  label: 'User Agent' },
    ],
  },
  {
    label: 'Text', Icon: FileType,
    types: [
      { value: 'sentence',  label: 'Sentence'  },
      { value: 'paragraph', label: 'Paragraph' },
      { value: 'word',      label: 'Word'      },
      { value: 'slug',      label: 'Slug'      },
    ],
  },
  {
    label: 'Healthcare', Icon: Heart,
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
      { value: 'vitalSpO2',        label: 'SpO₂ Oxygen'      },
      { value: 'vitalRR',          label: 'Respiratory Rate'  },
      { value: 'labTest',          label: 'Lab Test'          },
      { value: 'labResult',        label: 'Lab Result'        },
      { value: 'patientAge',       label: 'Patient Age'       },
      { value: 'gender',           label: 'Gender'            },
      { value: 'admissionType',    label: 'Admission Type'    },
      { value: 'dischargeStatus',  label: 'Discharge Status'  },
      { value: 'bmi',              label: 'BMI'               },
      { value: 'painScale',        label: 'Pain Scale'        },
      { value: 'roomNumber',       label: 'Room Number'       },
      { value: 'nursingNote',      label: 'Nursing Note'      },
      { value: 'emergencyContact', label: 'Emergency Contact' },
      { value: 'copayAmount',      label: 'Copay Amount'      },
    ],
  },
  {
    label: 'Custom', Icon: Settings,
    types: [
      { value: 'custom_list',     label: 'Custom List'     },
      { value: 'custom_regex',    label: 'Custom Pattern'  },
      { value: 'custom_template', label: 'Custom Template' },
    ],
  },
];

const ALL_TYPES = FIELD_CATEGORIES.flatMap(c => c.types);
const typeLabel = (t: FieldType) => ALL_TYPES.find(x => x.value === t)?.label ?? t;

const FORMAT_OPTS: { value: ExportFormat; label: string; color: string; Icon: typeof Database }[] = [
  { value: 'json', label: 'JSON', color: '#f59e0b', Icon: ClipboardList },
  { value: 'csv',  label: 'CSV',  color: '#10b981', Icon: FileType },
  { value: 'sql',  label: 'SQL',  color: '#3b82f6', Icon: Database },
  { value: 'xml',  label: 'XML',  color: '#ef4444', Icon: FileCode2 },
];

const uid = () => Math.random().toString(36).slice(2, 10);
const CUSTOM_TYPES: FieldType[] = ['custom_list', 'custom_regex', 'custom_template'];

const HEALTHCARE_TYPES: FieldType[] = [
  'medicalRecordNo','diagnosis','icdCode','medication','dosage','bloodType','allergen',
  'procedure','insuranceProvider','hospitalWard','doctorName','vitalBP','vitalHR',
  'vitalTemp','vitalSpO2','vitalRR','labTest','labResult','patientAge','gender',
  'admissionType','dischargeStatus','bmi','painScale','roomNumber','nursingNote',
  'emergencyContact','copayAmount',
];

const isHealthcareType = (t: FieldType) => HEALTHCARE_TYPES.includes(t);

type SideTab = 'schema' | 'healthcare' | 'custom' | 'scenarios';

interface Props { userName: string; userEmail?: string; onSignOut: () => void; }

const HC_SUBCATEGORIES = [
  {
    label: 'Patient Info', Icon: UserCircle, color: '#06b6d4',
    types: ['medicalRecordNo','patientAge','gender','bloodType','bmi','allergen','emergencyContact'] as FieldType[],
  },
  {
    label: 'Vitals & Assessment', Icon: Activity, color: '#ef4444',
    types: ['vitalBP','vitalHR','vitalTemp','vitalSpO2','vitalRR','painScale'] as FieldType[],
  },
  {
    label: 'Clinical', Icon: Stethoscope, color: '#8b5cf6',
    types: ['diagnosis','icdCode','procedure','medication','dosage','labTest','labResult'] as FieldType[],
  },
  {
    label: 'Facility & Billing', Icon: Building2, color: '#f59e0b',
    types: ['hospitalWard','roomNumber','doctorName','admissionType','dischargeStatus','insuranceProvider','copayAmount','nursingNote'] as FieldType[],
  },
];

export default function Generator({ userName, userEmail, onSignOut }: Props) {
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
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [mobileSettings, setMobileSettings] = useState(false);

  const [customName, setCustomName]   = useState('my_field');
  const [customType, setCustomType]   = useState<FieldType>('custom_list');
  const [customList, setCustomList]   = useState('option_a,option_b,option_c');
  const [customRegex, setCustomRegex] = useState('[A-Z]{3}[0-9]{4}');
  const [customTmpl, setCustomTmpl]   = useState('ITEM-{{integer}}-{{city}}');

  const addField = (type: FieldType, config?: CustomFieldConfig) => {
    const base = typeLabel(type).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
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
    setMobileSidebar(false);
  };

  const handleGenerate = useCallback(async () => {
    if (!fields.length) return;
    setGenerating(true);
    setMobileSidebar(false);
    await new Promise(r => setTimeout(r, 300));
    const generated = generateRows(fields, count);
    const text      = exportData(generated, format, tableName);
    setRows(generated);
    setOutputText(text);
    setGenerating(false);
    setActiveTab('table');
    trackPageVisit('generate', userEmail || userName);
    trackEvent('generate', userEmail || userName, {
      fields: fields.length,
      rows: count,
      format,
      healthcareFields: fields.filter(f => isHealthcareType(f.type)).length,
    });
  }, [fields, count, format, tableName, userName, userEmail]);

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
  const healthcareFieldCount = fields.filter(f => isHealthcareType(f.type)).length;
  const healthcareScenarios = SCENARIOS.filter(s => s.category === 'healthcare');

  const configSummary = (f: Field) => {
    if (!f.config) return null;
    if (f.type === 'custom_list') return f.config.listValues?.slice(0, 30) + (f.config.listValues && f.config.listValues.length > 30 ? '…' : '');
    if (f.type === 'custom_regex') return f.config.regexPattern;
    if (f.type === 'custom_template') return f.config.template?.slice(0, 30);
    return null;
  };

  // Shared sidebar content
  const sidebarContent = (
    <>
      {/* Sidebar tab strip */}
      <div className="flex rounded-xl sm:rounded-2xl p-1 border border-white/10"
           style={{ background: 'rgba(255,255,255,0.03)' }}>
        {([
          { id: 'schema' as SideTab, label: 'Schema', Icon: Layers },
          { id: 'healthcare' as SideTab, label: 'Health', Icon: Heart },
          { id: 'custom' as SideTab, label: 'Custom', Icon: Settings },
          { id: 'scenarios' as SideTab, label: 'Scenes', Icon: Sparkles },
        ]).map(t => (
          <button key={t.id} onClick={() => setSideTab(t.id)}
                  className={cn('flex-1 py-2 text-[10px] font-bold rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1',
                    sideTab === t.id ? 'text-white' : 'text-slate-600 hover:text-slate-400')}
                  style={sideTab === t.id
                    ? t.id === 'healthcare'
                      ? { background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.35)' }
                      : { background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 12px rgba(249,115,22,0.35)' }
                    : {}}>
            <t.Icon className="w-3 h-3" strokeWidth={2} />{t.label}
          </button>
        ))}
      </div>

      {/* ── SCHEMA TAB ─────────────────────────────────────────── */}
      {sideTab === 'schema' && (
        <>
          <div className="rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden"
               style={{ background: 'rgba(255,255,255,0.025)' }}>
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400" strokeWidth={2} />
                Schema Fields
              </span>
              <span className="text-[10px] text-slate-600 font-semibold bg-white/5 px-2 py-0.5 rounded-full">{fields.length}</span>
            </div>
            <div className="p-2 sm:p-2.5 space-y-1 sm:space-y-1.5 max-h-[280px] sm:max-h-[340px] overflow-y-auto">
              {fields.map((f, i) => (
                <div key={f.id} className="group rounded-lg sm:rounded-xl border border-white/5 hover:border-white/10 transition-all"
                     style={{ background: isHealthcareType(f.type) ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 sm:py-2">
                    <span className={cn("text-[9px] sm:text-[10px] font-mono w-4 text-center flex-shrink-0", isHealthcareType(f.type) ? 'text-emerald-700' : 'text-slate-700')}>{i + 1}</span>
                    <input value={f.name} onChange={e => updateName(f.id, e.target.value)}
                           className="flex-1 min-w-0 bg-transparent text-[11px] sm:text-xs text-slate-300 outline-none font-mono"
                           placeholder="field_name" />
                    <select value={f.type} onChange={e => updateType(f.id, e.target.value as FieldType)}
                            className="text-[9px] sm:text-[10px] bg-transparent outline-none cursor-pointer max-w-[80px] sm:max-w-[100px] truncate"
                            style={{ color: isHealthcareType(f.type) ? '#34d399' : CUSTOM_TYPES.includes(f.type) ? '#fb923c' : '#818cf8' }}>
                      {FIELD_CATEGORIES.map(cat => (
                        <optgroup key={cat.label} label={cat.label}>
                          {cat.types.map(t => (
                            <option key={t.value} value={t.value} style={{ background: '#1a1a2e' }}>{t.label}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <button onClick={() => removeField(f.id)}
                            className="text-slate-700 hover:text-rose-400 transition-all flex-shrink-0 p-0.5 rounded hover:bg-rose-500/10 sm:opacity-0 sm:group-hover:opacity-100">
                      <X className="w-3 h-3" strokeWidth={2.5} />
                    </button>
                  </div>
                  {CUSTOM_TYPES.includes(f.type) && (
                    <div className="px-2 sm:px-2.5 pb-2">
                      {editingConfig === f.id ? (
                        <div className="space-y-1.5">
                          {f.type === 'custom_list' && (
                            <input value={f.config?.listValues ?? ''} onChange={e => updateConfig(f.id, { listValues: e.target.value })}
                                   placeholder="val1,val2,val3"
                                   className="w-full text-[10px] font-mono px-2 py-1.5 rounded-lg outline-none text-slate-300 border border-white/10"
                                   style={{ background: 'rgba(255,255,255,0.05)' }} />
                          )}
                          {f.type === 'custom_regex' && (
                            <input value={f.config?.regexPattern ?? ''} onChange={e => updateConfig(f.id, { regexPattern: e.target.value })}
                                   placeholder="[A-Z]{3}[0-9]{4}"
                                   className="w-full text-[10px] font-mono px-2 py-1.5 rounded-lg outline-none text-slate-300 border border-white/10"
                                   style={{ background: 'rgba(255,255,255,0.05)' }} />
                          )}
                          {f.type === 'custom_template' && (
                            <input value={f.config?.template ?? ''} onChange={e => updateConfig(f.id, { template: e.target.value })}
                                   placeholder="ITEM-{{integer}}-{{city}}"
                                   className="w-full text-[10px] font-mono px-2 py-1.5 rounded-lg outline-none text-slate-300 border border-white/10"
                                   style={{ background: 'rgba(255,255,255,0.05)' }} />
                          )}
                          <button onClick={() => setEditingConfig(null)}
                                  className="text-[10px] text-orange-400 font-semibold hover:text-orange-300 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Done
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setEditingConfig(f.id)}
                                className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-orange-400 font-mono transition-colors">
                          <Settings className="w-3 h-3 text-orange-500/60" strokeWidth={2} />
                          <span className="truncate max-w-[180px]">{configSummary(f) ?? 'Configure…'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-2 sm:p-2.5 border-t border-white/10">
              <button onClick={() => setShowAddPanel(!showAddPanel)}
                      className="w-full py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-bold border border-dashed transition-all flex items-center justify-center gap-1.5"
                      style={{
                        color: showAddPanel ? '#f97316' : '#64748b',
                        borderColor: showAddPanel ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.1)',
                        background: showAddPanel ? 'rgba(249,115,22,0.05)' : 'transparent',
                      }}>
                {showAddPanel ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />}
                {showAddPanel ? 'Close Picker' : 'Add Field'}
              </button>
            </div>
          </div>

          {showAddPanel && (
            <div className="rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.025)' }}>
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10">
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ListChecks className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400" /> Pick Type
                </span>
              </div>
              <div className="p-2 sm:p-3 space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
                {FIELD_CATEGORIES.map(cat => (
                  <div key={cat.label}>
                    <div className="text-[9px] sm:text-[10px] text-slate-600 font-bold mb-1 sm:mb-1.5 px-1 uppercase tracking-wider flex items-center gap-1">
                      <cat.Icon className="w-3 h-3" strokeWidth={2} /> {cat.label}
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                      {cat.types.map(t => (
                        <button key={t.value} onClick={() => addField(t.value)}
                                className="px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold border border-white/10 transition-all hover:scale-[1.02]"
                                style={{ color: isHealthcareType(t.value) ? '#34d399' : CUSTOM_TYPES.includes(t.value) ? '#fb923c' : '#94a3b8', background: 'rgba(255,255,255,0.03)' }}>
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

      {/* ── HEALTHCARE TAB ─────────────────────────────────────── */}
      {sideTab === 'healthcare' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="rounded-xl sm:rounded-2xl border overflow-hidden relative"
               style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.05))', borderColor: 'rgba(16,185,129,0.2)' }}>
            <div className="relative p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0"
                     style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
                  <Heart className="w-5 h-5 sm:w-7 sm:h-7 text-white" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white">Healthcare Data</h3>
                  <p className="text-[9px] sm:text-[10px] text-emerald-400/70 font-medium">28 field types · 7 scenarios</p>
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed">
                Generate HIPAA-safe synthetic patient records, clinical encounters, lab results, and more.
              </p>
            </div>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden"
               style={{ background: 'rgba(255,255,255,0.025)' }}>
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2.5} /> Quick Add Fields
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-600 font-semibold">Click to add</span>
            </div>
            <div className="p-2 sm:p-3 space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[370px] overflow-y-auto">
              {HC_SUBCATEGORIES.map(sub => (
                <div key={sub.label}>
                  <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2 px-1">
                    <sub.Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: sub.color }} strokeWidth={2} />
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider" style={{ color: sub.color }}>{sub.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {sub.types.map(t => (
                      <button key={t} onClick={() => addField(t)}
                              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold border transition-all"
                              style={{ color: '#34d399', background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.15)' }}>
                        {typeLabel(t)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden"
               style={{ background: 'rgba(255,255,255,0.025)' }}>
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} /> Healthcare Scenarios
              </span>
            </div>
            <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
              {healthcareScenarios.map(sc => (
                <button key={sc.id} onClick={() => loadScenario(sc.id)}
                        className="w-full text-left rounded-lg sm:rounded-xl p-2.5 sm:p-3 border transition-all group"
                        style={{ background: 'rgba(16,185,129,0.02)', borderColor: 'rgba(16,185,129,0.1)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                           style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] sm:text-xs font-bold text-emerald-200 group-hover:text-white transition-colors truncate">{sc.label}</div>
                        <div className="text-[9px] sm:text-[10px] text-slate-600 mt-0.5 truncate">{sc.description}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-700 group-hover:text-emerald-400 flex-shrink-0 mt-0.5 transition-colors" />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                    <span className="text-[9px] sm:text-[10px] text-emerald-600 font-mono">{sc.fields.length} fields</span>
                    <span className="text-slate-800">·</span>
                    <span className="text-[9px] sm:text-[10px] text-emerald-600 font-mono">{sc.rowCount ?? 50} rows</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM FIELDS TAB ──────────────────────────────────── */}
      {sideTab === 'custom' && (
        <div className="rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden"
             style={{ background: 'rgba(255,255,255,0.025)' }}>
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" strokeWidth={2} />
            <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">Custom Field Builder</span>
          </div>
          <div className="p-3 sm:p-4 space-y-4 sm:space-y-5">
            <div>
              <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Field Name</label>
              <input value={customName} onChange={e => setCustomName(e.target.value)}
                     placeholder="my_custom_field"
                     className="w-full px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm text-white outline-none border border-white/10 font-mono transition-all"
                     style={{ background: 'rgba(255,255,255,0.05)' }}
                     onFocus={e => { e.target.style.borderColor = '#f97316'; }}
                     onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
            </div>
            <div>
              <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Custom Type</label>
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { value: 'custom_list' as FieldType, label: 'List', Icon: ListChecks, desc: 'Pick from values' },
                  { value: 'custom_regex' as FieldType, label: 'Pattern', Icon: FileCode2, desc: 'Regex-style' },
                  { value: 'custom_template' as FieldType, label: 'Template', Icon: FileType, desc: 'Token-based' },
                ]).map(t => (
                  <button key={t.value} onClick={() => setCustomType(t.value)}
                          className="py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-lg sm:rounded-xl text-center transition-all border"
                          style={{
                            background: customType === t.value ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
                            borderColor: customType === t.value ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.08)',
                          }}>
                    <t.Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1" style={{ color: customType === t.value ? '#fb923c' : '#64748b' }} strokeWidth={1.8} />
                    <div className="text-[10px] sm:text-[11px] font-bold" style={{ color: customType === t.value ? '#fb923c' : '#64748b' }}>{t.label}</div>
                    <div className="text-[8px] sm:text-[9px] text-slate-700 mt-0.5 hidden sm:block">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {customType === 'custom_list' && (
              <div>
                <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                  Values <span className="text-slate-700 normal-case font-normal">(comma-separated)</span>
                </label>
                <textarea value={customList} onChange={e => setCustomList(e.target.value)} rows={3}
                          placeholder="apple,banana,cherry,mango"
                          className="w-full px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs text-white outline-none border border-white/10 font-mono resize-none transition-all"
                          style={{ background: 'rgba(255,255,255,0.05)' }} />
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
                <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Pattern</label>
                <input value={customRegex} onChange={e => setCustomRegex(e.target.value)}
                       placeholder="[A-Z]{3}[0-9]{4}"
                       className="w-full px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm text-white outline-none border border-white/10 font-mono transition-all"
                       style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>
            )}
            {customType === 'custom_template' && (
              <div>
                <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Template String</label>
                <input value={customTmpl} onChange={e => setCustomTmpl(e.target.value)}
                       placeholder="ORDER-{{integer}}-{{city}}"
                       className="w-full px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm text-white outline-none border border-white/10 font-mono transition-all"
                       style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>
            )}

            <button onClick={addCustomField}
                    className="w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 6px 20px rgba(249,115,22,0.4)' }}>
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Add to Schema
            </button>
          </div>
        </div>
      )}

      {/* ── SCENARIOS TAB ──────────────────────────────────────── */}
      {sideTab === 'scenarios' && (
        <div className="rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden"
             style={{ background: 'rgba(255,255,255,0.025)' }}>
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" strokeWidth={2} />
            <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">All Scenarios</span>
          </div>
          <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2 max-h-[400px] sm:max-h-[560px] overflow-y-auto">
            {SCENARIOS.map(sc => (
              <button key={sc.id} onClick={() => loadScenario(sc.id)}
                      className="w-full text-left rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-white/8 hover:border-orange-500/30 transition-all group"
                      style={{ background: sc.category === 'healthcare' ? 'rgba(16,185,129,0.02)' : 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                         style={{ background: sc.category === 'healthcare' ? 'rgba(16,185,129,0.12)' : 'rgba(249,115,22,0.12)', border: `1px solid ${sc.category === 'healthcare' ? 'rgba(16,185,129,0.25)' : 'rgba(249,115,22,0.25)'}` }}>
                      {sc.category === 'healthcare'
                        ? <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" strokeWidth={1.8} />
                        : <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" strokeWidth={1.8} />
                      }
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-[11px] sm:text-xs font-bold group-hover:text-white transition-colors truncate", sc.category === 'healthcare' ? 'text-emerald-300' : 'text-slate-300')}>{sc.label}</span>
                        {sc.category === 'healthcare' && (
                          <span className="text-[7px] sm:text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-1 sm:px-1.5 py-0.5 rounded-full border border-emerald-500/20 flex-shrink-0">HC</span>
                        )}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-600 mt-0.5 truncate">{sc.description}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-700 group-hover:text-orange-400 flex-shrink-0 mt-0.5 transition-colors" />
                </div>
                <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                  <span className="text-[9px] sm:text-[10px] text-slate-700 font-mono">{sc.fields.length} fields</span>
                  <span className="text-slate-800">·</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-700 font-mono">{sc.rowCount ?? 50} rows</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden"
           style={{ background: 'rgba(255,255,255,0.025)' }}>
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10">
          <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" strokeWidth={2} /> Settings
          </span>
        </div>
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div>
            <label className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Rows to Generate</label>
            <div className="flex items-center gap-2 sm:gap-3">
              <input type="range" min={1} max={1000} value={count} onChange={e => setCount(+e.target.value)} className="flex-1" />
              <input type="number" min={1} max={10000} value={count}
                     onChange={e => setCount(Math.max(1, Math.min(10000, +e.target.value)))}
                     className="w-16 sm:w-20 px-2 py-1.5 rounded-lg text-xs sm:text-sm text-white text-center outline-none border border-white/10"
                     style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          </div>
          <div>
            <label className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Table / Root Name</label>
            <input value={tableName} onChange={e => setTableName(e.target.value)}
                   className="w-full px-3 py-2 rounded-lg text-xs sm:text-sm text-white outline-none border border-white/10 font-mono"
                   style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <div>
            <label className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Export Format</label>
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
              {FORMAT_OPTS.map(f => (
                <button key={f.value} onClick={() => setFormat(f.value)}
                        className={cn('py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center justify-center gap-0.5 sm:gap-1', format === f.value ? 'text-white' : 'text-slate-600 hover:text-slate-400 border border-white/10')}
                        style={format === f.value ? { background: f.color, boxShadow: `0 4px 14px ${f.color}55` } : { background: 'rgba(255,255,255,0.03)' }}>
                  <f.Icon className="w-3 h-3" strokeWidth={2} />
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generate CTA */}
      <button onClick={handleGenerate} disabled={generating || !fields.length}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-white text-sm transition-all duration-300 flex items-center justify-center gap-2.5 hover:scale-[1.02]"
              style={{
                background: generating ? 'rgba(249,115,22,0.3)' : healthcareFieldCount > 0 ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#f97316,#ea580c)',
                boxShadow: generating ? 'none' : healthcareFieldCount > 0 ? '0 8px 32px rgba(16,185,129,0.5)' : '0 8px 32px rgba(249,115,22,0.5)',
              }}>
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Forging…
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" fill="currentColor" />
            {healthcareFieldCount > 0 ? `Forge ${count.toLocaleString()} Records` : `Forge ${count.toLocaleString()} Rows`}
          </>
        )}
      </button>
    </>
  );

  return (
    <div className="min-h-screen" style={{ background: '#07070f', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Top Nav ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/10"
           style={{ background: 'rgba(7,7,15,0.9)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-3 sm:px-6 h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setMobileSidebar(!mobileSidebar)}
                    className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors mr-1">
              {mobileSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center relative"
                 style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 0 24px rgba(249,115,22,0.4)' }}>
              <Database className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full flex items-center justify-center bg-amber-400">
                <Zap className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-slate-900" fill="currentColor" />
              </div>
            </div>
            <span className="font-black text-white text-base sm:text-xl tracking-tight hidden sm:inline">
              Data<span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#f97316,#fbbf24)' }}> Forge</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-orange-400 border border-orange-500/30 ml-1"
                  style={{ background: 'rgba(249,115,22,0.08)' }}>
              <Zap className="w-3 h-3" /> PRO
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {healthcareFieldCount > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-emerald-500/30"
                   style={{ background: 'rgba(16,185,129,0.08)' }}>
                <Heart className="w-3 h-3 text-emerald-400" strokeWidth={2} />
                <span className="text-[10px] text-emerald-400 font-bold">{healthcareFieldCount} HC</span>
              </div>
            )}

            {/* Mobile settings toggle */}
            <button onClick={() => setMobileSettings(!mobileSettings)}
                    className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors border border-white/10"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Settings className="w-4 h-4" />
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10"
                 style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400 font-medium">{userName}</span>
            </div>
            <button onClick={onSignOut}
                    className="px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold text-slate-500 hover:text-white border border-white/10 hover:border-white/20 transition-all flex items-center gap-1 sm:gap-1.5">
              <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile settings dropdown */}
      {mobileSettings && (
        <div className="lg:hidden sticky top-14 z-40 border-b border-white/10 px-4 py-3 space-y-3"
             style={{ background: 'rgba(7,7,15,0.95)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Quick Settings</span>
            <button onClick={() => setMobileSettings(false)} className="text-slate-500"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold w-12">Rows</span>
            <input type="range" min={1} max={1000} value={count} onChange={e => setCount(+e.target.value)} className="flex-1" />
            <input type="number" min={1} max={10000} value={count} onChange={e => setCount(Math.max(1, Math.min(10000, +e.target.value)))}
                   className="w-14 px-2 py-1 rounded-lg text-xs text-white text-center outline-none border border-white/10"
                   style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold w-12">Format</span>
            <div className="grid grid-cols-4 gap-1 flex-1">
              {FORMAT_OPTS.map(f => (
                <button key={f.value} onClick={() => setFormat(f.value)}
                        className={cn('py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-0.5', format === f.value ? 'text-white' : 'text-slate-600 border border-white/10')}
                        style={format === f.value ? { background: f.color } : { background: 'rgba(255,255,255,0.03)' }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleGenerate} disabled={generating || !fields.length}
                  className="w-full py-2.5 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2"
                  style={{
                    background: healthcareFieldCount > 0 ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#f97316,#ea580c)',
                  }}>
            <Zap className="w-4 h-4" fill="currentColor" /> Forge {count} Rows
          </button>
        </div>
      )}

      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 flex gap-4 sm:gap-5">

        {/* ── Mobile sidebar overlay ──────────────────────────────── */}
        {mobileSidebar && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebar(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[340px] overflow-y-auto border-r border-white/10 p-4 space-y-4"
                 style={{ background: '#07070f' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">Builder</span>
                <button onClick={() => setMobileSidebar(false)} className="text-slate-500 p-1"><X className="w-5 h-5" /></button>
              </div>
              {sidebarContent}
            </div>
          </div>
        )}

        {/* ── Desktop sidebar ─────────────────────────────────────── */}
        <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0 space-y-4">
          {sidebarContent}
        </div>

        {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Mobile quick bar */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setMobileSidebar(true)}
                    className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-orange-400 border border-orange-500/30 flex items-center gap-1.5"
                    style={{ background: 'rgba(249,115,22,0.08)' }}>
              <Layers className="w-3.5 h-3.5" /> Schema ({fields.length})
            </button>
            <button onClick={() => { setMobileSidebar(true); setSideTab('healthcare'); }}
                    className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5"
                    style={{ background: 'rgba(16,185,129,0.08)' }}>
              <Heart className="w-3.5 h-3.5" /> Healthcare
            </button>
            <button onClick={() => { setMobileSidebar(true); setSideTab('scenarios'); }}
                    className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-purple-400 border border-purple-500/30 flex items-center gap-1.5"
                    style={{ background: 'rgba(139,92,246,0.08)' }}>
              <Sparkles className="w-3.5 h-3.5" /> Scenarios
            </button>
            <button onClick={handleGenerate} disabled={generating || !fields.length}
                    className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black text-white flex items-center gap-1.5"
                    style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
              <Zap className="w-3.5 h-3.5" fill="currentColor" /> Forge
            </button>
          </div>

          {rows.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: 'Rows',    value: rows.length.toLocaleString(), Icon: Database, color: '#f97316' },
                { label: 'Fields',  value: fields.length,                Icon: Layers, color: '#8b5cf6' },
                { label: 'Format',  value: format.toUpperCase(),         Icon: FileType, color: '#06b6d4' },
                { label: 'Size',    value: `~${(outputText.length / 1024).toFixed(1)} KB`, Icon: Download, color: '#10b981' },
              ].map(s => (
                <div key={s.label} className="rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10 relative overflow-hidden"
                     style={{ background: 'rgba(255,255,255,0.025)' }}>
                  <div className="absolute inset-0 opacity-5 pointer-events-none rounded-2xl"
                       style={{ background: `radial-gradient(circle at top left, ${s.color}, transparent 70%)` }} />
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mb-1.5 sm:mb-2"
                       style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
                    <s.Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: s.color }} strokeWidth={1.8} />
                  </div>
                  <div className="text-lg sm:text-xl font-black text-white">{s.value}</div>
                  <div className="text-[9px] sm:text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {rows.length > 0 ? (
            <div className="rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-white/10 flex-wrap gap-2">
                <div className="flex items-center gap-1 rounded-lg sm:rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {([['table', 'Table', Eye] as const, ['code', 'Code', Code2] as const]).map(([k, l, Icon]) => (
                    <button key={k} onClick={() => setActiveTab(k)}
                            className={cn('px-3 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5', activeTab === k ? 'text-white' : 'text-slate-600 hover:text-slate-300')}
                            style={activeTab === k ? { background: 'linear-gradient(135deg,#f97316,#ea580c)' } : {}}>
                      <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
                      {l}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button onClick={handleCopy}
                          className={cn('flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all border',
                            copied ? 'text-emerald-400 border-emerald-500/40' : 'text-slate-400 hover:text-white border-white/10 hover:border-white/20')}
                          style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {copied ? <><Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Copied!</> : <><Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} /> Copy</>}
                  </button>
                  <button onClick={handleDownload}
                          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                          style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
                    <span className="hidden sm:inline">Download</span> .{format}
                  </button>
                </div>
              </div>

              {activeTab === 'table' ? (
                <div className="overflow-auto max-h-[400px] sm:max-h-[520px]">
                  <table className="w-full text-[10px] sm:text-xs">
                    <thead className="sticky top-0" style={{ background: 'rgba(10,10,20,0.98)' }}>
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-slate-700 font-semibold border-b border-white/10 w-8 sm:w-10">#</th>
                        {headers.map(h => {
                          const field = fields.find(f => f.name === h);
                          const isHC = field && isHealthcareType(field.type);
                          return (
                            <th key={h} className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold border-b border-white/10 whitespace-nowrap"
                                style={{ color: isHC ? '#34d399' : '#94a3b8' }}>
                              <div className="flex items-center gap-1 sm:gap-1.5">
                                {isHC ? <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500/50" strokeWidth={2} /> : <Database className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-500/50" strokeWidth={2} />}
                                {h}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors">
                          <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-slate-700 font-mono">{i + 1}</td>
                          {headers.map(h => (
                            <td key={h} className="px-2 sm:px-4 py-2 sm:py-2.5 text-slate-400 font-mono max-w-[120px] sm:max-w-[200px] truncate">
                              {String(row[h] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {rows.length > 10 && (
                    <div className="px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs text-slate-700 text-center border-t border-white/5">
                      Showing 10 of {rows.length.toLocaleString()} rows — download to view all
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <pre className="p-3 sm:p-5 text-[10px] sm:text-xs overflow-auto max-h-[400px] sm:max-h-[520px] text-slate-400 leading-relaxed"
                       style={{ fontFamily: 'JetBrains Mono, monospace', background: 'transparent' }}>
                    {outputText.slice(0, 8000)}{outputText.length > 8000 ? '\n\n… (truncated — download for full output)' : ''}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl sm:rounded-2xl border border-white/10 flex flex-col items-center justify-center py-16 sm:py-24 px-4"
                 style={{ background: 'rgba(255,255,255,0.015)' }}>
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 relative"
                   style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(234,88,12,0.12))', border: '1px solid rgba(249,115,22,0.2)' }}>
                <Database className="w-10 h-10 sm:w-14 sm:h-14 text-orange-500/70" strokeWidth={1} />
                <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 0 16px rgba(249,115,22,0.5)' }}>
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Ready to Forge</h3>
              <p className="text-slate-600 text-xs sm:text-sm text-center max-w-sm leading-relaxed">
                Build a schema, try <span className="text-emerald-400 font-semibold cursor-pointer inline-flex items-center gap-0.5" onClick={() => { setSideTab('healthcare'); setMobileSidebar(true); }}>Healthcare Data <ArrowRight className="w-3 h-3" /></span><br/>
                or pick a <span className="text-orange-400 font-semibold cursor-pointer inline-flex items-center gap-0.5" onClick={() => { setSideTab('scenarios'); setMobileSidebar(true); }}>Scenario <ArrowRight className="w-3 h-3" /></span> then hit <span className="text-orange-400 font-semibold">Forge</span>
              </p>
              <div className="flex items-center gap-2 sm:gap-3 mt-6 sm:mt-8 flex-wrap justify-center">
                <button onClick={() => { setSideTab('healthcare'); setMobileSidebar(true); }}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-white text-xs sm:text-sm border border-emerald-500/40 hover:border-emerald-500/70 transition-all flex items-center gap-1.5 sm:gap-2 hover:scale-[1.02]"
                        style={{ background: 'rgba(16,185,129,0.1)' }}>
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" strokeWidth={2} /> Healthcare
                </button>
                <button onClick={() => { setSideTab('scenarios'); setMobileSidebar(true); }}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-white text-xs sm:text-sm border border-orange-500/40 hover:border-orange-500/70 transition-all flex items-center gap-1.5 sm:gap-2 hover:scale-[1.02]"
                        style={{ background: 'rgba(249,115,22,0.1)' }}>
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" strokeWidth={2} /> Scenarios
                </button>
                <button onClick={handleGenerate}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-black text-white text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 8px 24px rgba(249,115,22,0.4)' }}>
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" /> Quick Generate
                </button>
              </div>
            </div>
          )}

          {/* Healthcare Feature Showcase - collapsed on mobile */}
          <details className="rounded-xl sm:rounded-2xl border overflow-hidden relative group"
               style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.04), rgba(6,182,212,0.02))', borderColor: 'rgba(16,185,129,0.15)' }}>
            <summary className="cursor-pointer px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between" style={{ borderColor: 'rgba(16,185,129,0.1)' }}>
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" strokeWidth={2} />
                <span className="text-[10px] sm:text-xs font-black text-emerald-300 uppercase tracking-wider">Healthcare Data Engine</span>
                <span className="text-[7px] sm:text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20 ml-1">NEW</span>
              </div>
              <ChevronDown className="w-4 h-4 text-emerald-400 transition-transform group-open:rotate-180" />
            </summary>

            <div className="px-3 sm:px-5 py-3 sm:py-4 border-t" style={{ borderColor: 'rgba(16,185,129,0.1)' }}>
              <div className="flex items-center justify-end mb-3">
                <button onClick={() => { setSideTab('healthcare'); setMobileSidebar(true); }}
                        className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
                  Open Healthcare Tab <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { Icon: UserCircle, title: 'Patient Records', desc: '14 fields — demographics, insurance, allergies', color: '#06b6d4', scenario: 'healthcare-patients' },
                  { Icon: Stethoscope, title: 'Clinical Encounters', desc: '20 fields — admissions, vitals, treatments', color: '#8b5cf6', scenario: 'healthcare-encounters' },
                  { Icon: Activity, title: 'Emergency Dept', desc: '17 fields — triage levels, complaints', color: '#ef4444', scenario: 'healthcare-emergency' },
                  { Icon: Building2, title: 'Mental Health', desc: '14 fields — PHQ-9, therapy types', color: '#f59e0b', scenario: 'healthcare-mental' },
                  { Icon: Stethoscope, title: 'Lab Results', desc: '12 fields — specimens, statuses', color: '#10b981', scenario: 'healthcare-lab' },
                  { Icon: Heart, title: 'Pharmacy / Rx', desc: '12 fields — routes, refills', color: '#ec4899', scenario: 'healthcare-pharmacy' },
                  { Icon: Layers, title: 'Surgical Records', desc: '17 fields — anesthesia, ASA class', color: '#f97316', scenario: 'healthcare-surgical' },
                ].map(card => (
                  <div key={card.title}
                       className="rounded-lg sm:rounded-xl p-3 sm:p-3.5 border transition-all cursor-pointer group/card hover:scale-[1.02]"
                       style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(16,185,129,0.1)' }}
                       onClick={() => loadScenario(card.scenario)}>
                    <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                           style={{ background: `${card.color}15`, border: `1px solid ${card.color}25` }}>
                        <card.Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: card.color }} strokeWidth={1.8} />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-white truncate">{card.title}</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 leading-relaxed">{card.desc}</p>
                    <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold opacity-0 group-hover/card:opacity-100 transition-opacity" style={{ color: card.color }}>
                      Load Scenario <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 sm:mt-4 flex flex-wrap gap-1 sm:gap-1.5">
                <span className="text-[9px] sm:text-[10px] text-emerald-500/60 font-bold mr-1 self-center">28 TYPES:</span>
                {HEALTHCARE_TYPES.slice(0, 8).map(t => (
                  <span key={t} className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-semibold text-emerald-400/70 border border-emerald-500/15"
                        style={{ background: 'rgba(16,185,129,0.04)' }}>
                    {typeLabel(t)}
                  </span>
                ))}
                <span className="text-[8px] sm:text-[9px] text-emerald-500/40 font-semibold self-center">+{HEALTHCARE_TYPES.length - 8} more</span>
              </div>
            </div>
          </details>

          {/* Custom Field Info Card - collapsed on mobile */}
          <details className="rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden group"
               style={{ background: 'rgba(255,255,255,0.02)' }}>
            <summary className="cursor-pointer px-4 sm:px-5 py-3 flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400" strokeWidth={2} /> Custom Field Types
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-white/10">
              <div className="flex items-center justify-end mb-3">
                <button onClick={() => { setSideTab('custom'); setMobileSidebar(true); }}
                        className="text-[10px] font-bold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
                  Build one <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {[
                  {
                    Icon: ListChecks, title: 'Custom List', color: '#f97316',
                    desc: 'Define your own set of values.',
                    example: 'active,inactive,pending,banned',
                    type: 'custom_list' as FieldType,
                    config: { listValues: 'active,inactive,pending,banned' },
                  },
                  {
                    Icon: FileCode2, title: 'Custom Pattern', color: '#8b5cf6',
                    desc: 'Generate strings using character-class notation.',
                    example: 'ORD-[A-Z]{2}[0-9]{5}',
                    type: 'custom_regex' as FieldType,
                    config: { regexPattern: 'ORD-[A-Z]{2}[0-9]{5}' },
                  },
                  {
                    Icon: FileType, title: 'Custom Template', color: '#06b6d4',
                    desc: 'Compose values using {{tokens}}.',
                    example: 'USER-{{integer}}-{{city}}',
                    type: 'custom_template' as FieldType,
                    config: { template: 'USER-{{integer}}-{{city}}' },
                  },
                ].map(card => (
                  <div key={card.title} className="rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/8 group/card cursor-pointer transition-all hover:scale-[1.02]"
                       style={{ background: 'rgba(255,255,255,0.02)' }}
                       onClick={() => addField(card.type, card.config)}>
                    <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                           style={{ background: `${card.color}12`, border: `1px solid ${card.color}25` }}>
                        <card.Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: card.color }} strokeWidth={1.8} />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-slate-300">{card.title}</span>
                      <span className="ml-auto text-[9px] sm:text-[10px] text-slate-700 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-0.5">
                        <Plus className="w-3 h-3" /> Add
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-600 leading-relaxed mb-1.5 sm:mb-2">{card.desc}</p>
                    <code className="text-[9px] sm:text-[10px] font-mono px-2 py-1 rounded-lg block truncate"
                          style={{ background: `${card.color}12`, color: card.color }}>
                      {card.example}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
