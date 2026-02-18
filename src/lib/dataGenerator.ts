// ─────────────────────────────────────────────────────────────────────────────
//  Data Forge — Synthetic Data Engine
// ─────────────────────────────────────────────────────────────────────────────

export type FieldType =
  | 'fullName'   | 'firstName' | 'lastName'   | 'email'      | 'phone'
  | 'address'    | 'city'      | 'country'    | 'zipCode'    | 'state'
  | 'company'    | 'jobTitle'  | 'department' | 'industry'
  | 'uuid'       | 'integer'   | 'float'      | 'boolean'    | 'date'
  | 'timestamp'  | 'percentage'| 'currency'
  | 'url'        | 'ipAddress' | 'creditCard' | 'color'      | 'userAgent'
  | 'paragraph'  | 'sentence'  | 'word'       | 'slug'
  | 'username'   | 'password'
  | 'productName'| 'price'     | 'category'   | 'sku'        | 'rating'
  | 'status'     | 'priority'  | 'tag'
  // Healthcare
  | 'medicalRecordNo' | 'diagnosis' | 'icdCode' | 'medication' | 'dosage'
  | 'bloodType' | 'allergen' | 'procedure' | 'insuranceProvider'
  | 'hospitalWard' | 'doctorName' | 'vitalBP' | 'vitalHR' | 'vitalTemp'
  | 'labTest' | 'labResult' | 'patientAge' | 'gender' | 'admissionType'
  | 'dischargeStatus'
  | 'custom_list'| 'custom_regex' | 'custom_template';

export interface CustomFieldConfig {
  /** For custom_list: comma-separated values to pick from */
  listValues?: string;
  /** For custom_regex: simple pattern tokens like [A-Z]{3}[0-9]{4} */
  regexPattern?: string;
  /** For custom_template: template string, e.g. "USER-{{integer}}-{{city}}" */
  template?: string;
}

export interface Field {
  id: string;
  name: string;
  type: FieldType;
  config?: CustomFieldConfig;
}

export type ExportFormat = 'json' | 'csv' | 'sql' | 'xml';

// ── Scenario definition ─────────────────────────────────────────────────────
export interface Scenario {
  id: string;
  label: string;
  icon: string;
  description: string;
  fields: { name: string; type: FieldType; config?: CustomFieldConfig }[];
  rowCount?: number;
}

// ── Seed data ─────────────────────────────────────────────────────────────
const FIRST_NAMES  = ['James','Oliver','William','Henry','Charlotte','Amelia','Sophia','Emma','Liam','Noah','Ethan','Ava','Isabella','Mia','Lucas','Mason','Logan','Elijah','Aiden','Caden','Harper','Evelyn','Abigail','Emily','Elizabeth','Ryan','Grace','Nathan','Zoe','Hannah'];
const LAST_NAMES   = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Moore','Young','Allen','Mitchell','Roberts','Scott','Carter','Phillips','Evans','Turner','Parker'];
const COMPANIES    = ['Acme Corp','Nexus Tech','Orbit Solutions','Zenith AI','Stratus Cloud','Ironclad Security','Vertex Analytics','Luminary Labs','Cascade Systems','Polaris Data','Nova Dynamics','Summit Digital','Apex Ventures','Horizon Group','Quantum Leap','Forge Digital','Iron Peak','Stellar Systems'];
const JOBS         = ['Software Engineer','Product Manager','Data Scientist','UX Designer','DevOps Engineer','Marketing Director','Sales Executive','CTO','CFO','CEO','Backend Developer','Frontend Developer','ML Engineer','Security Analyst','Cloud Architect','Data Engineer','QA Engineer','Scrum Master'];
const DEPARTMENTS  = ['Engineering','Product','Design','Marketing','Sales','Finance','HR','Legal','Operations','Customer Success','Research','Security'];
const INDUSTRIES   = ['Technology','Healthcare','Finance','E-commerce','Education','Manufacturing','Retail','Media','Logistics','Consulting','Real Estate','Energy'];
const CITIES       = ['New York','London','Tokyo','Berlin','Sydney','Toronto','Paris','Dubai','Singapore','Amsterdam','Chicago','Los Angeles','San Francisco','Mumbai','Seoul','Austin','Seattle','Boston','Denver','Miami'];
const STATES       = ['California','Texas','New York','Florida','Illinois','Pennsylvania','Ohio','Georgia','Washington','Colorado','Arizona','Massachusetts','Tennessee','North Carolina','Virginia'];
const COUNTRIES    = ['United States','United Kingdom','Japan','Germany','Australia','Canada','France','UAE','Singapore','Netherlands','India','South Korea','Brazil','Mexico','Italy'];
const DOMAINS      = ['gmail.com','yahoo.com','outlook.com','proton.me','company.io','corp.com','tech.dev','email.net','dataforge.io'];
const STREETS      = ['Maple Ave','Oak Street','Pine Road','Cedar Lane','Elm Court','Birch Blvd','Walnut Way','Chestnut Dr','Spruce St','Willow Pl','Summit Dr','Harbor Blvd','Pacific Ave'];
const ADJECTIVES   = ['Premium','Elite','Pro','Advanced','Smart','Ultra','Turbo','Nano','Mega','Hyper','Next-Gen','Compact','Essential','Signature','Classic'];
const NOUNS        = ['Desk','Chair','Lamp','Notebook','Pen','Bag','Case','Stand','Dock','Cable','Monitor','Headset','Keyboard','Webcam','Hub'];
const CATEGORIES   = ['Electronics','Clothing','Food & Beverage','Sports','Books','Home & Garden','Beauty','Toys','Automotive','Office Supplies','Health','Outdoors'];
const LOREM        = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur'.split(' ');
const STATUSES     = ['active','inactive','pending','suspended','verified','draft','published','archived','processing','completed','failed','cancelled'];
const PRIORITIES   = ['low','medium','high','critical','urgent'];
const TAGS         = ['featured','new','sale','trending','limited','exclusive','popular','bestseller','clearance','seasonal'];
const USER_AGENTS  = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/121.0',
];

// ── Healthcare Seed Data ───────────────────────────────────────────────────
const DIAGNOSES = [
  'Type 2 Diabetes Mellitus','Essential Hypertension','Acute Upper Respiratory Infection',
  'Major Depressive Disorder','Generalized Anxiety Disorder','Asthma, Unspecified',
  'Chronic Obstructive Pulmonary Disease','Atrial Fibrillation','Congestive Heart Failure',
  'Urinary Tract Infection','Pneumonia, Unspecified','Osteoarthritis of Knee',
  'Lumbar Disc Herniation','Iron Deficiency Anemia','Hypothyroidism',
  'Gastroesophageal Reflux Disease','Chronic Kidney Disease Stage 3','Migraine Without Aura',
  'Cellulitis of Lower Extremity','Acute Bronchitis','Coronary Artery Disease',
  'Deep Vein Thrombosis','Pulmonary Embolism','Sepsis, Unspecified Organism',
  'Acute Myocardial Infarction','Stroke, Cerebral Infarction','Appendicitis',
  'Cholecystitis','Pancreatitis','Fracture of Femur',
];
const ICD_CODES = [
  'E11.9','I10','J06.9','F32.9','F41.1','J45.909','J44.1','I48.91','I50.9',
  'N39.0','J18.9','M17.9','M51.16','D50.9','E03.9','K21.0','N18.3','G43.009',
  'L03.116','J20.9','I25.10','I82.409','I26.99','A41.9','I21.9','I63.9','K35.80',
  'K81.0','K85.9','S72.009A',
];
const MEDICATIONS = [
  'Metformin 500mg','Lisinopril 10mg','Amoxicillin 500mg','Sertraline 50mg',
  'Atorvastatin 20mg','Omeprazole 20mg','Amlodipine 5mg','Metoprolol 25mg',
  'Gabapentin 300mg','Levothyroxine 50mcg','Hydrochlorothiazide 25mg',
  'Prednisone 10mg','Albuterol Inhaler','Furosemide 40mg','Warfarin 5mg',
  'Insulin Glargine 100U/mL','Clopidogrel 75mg','Apixaban 5mg','Losartan 50mg',
  'Pantoprazole 40mg','Tramadol 50mg','Acetaminophen 500mg','Ibuprofen 400mg',
  'Ciprofloxacin 500mg','Azithromycin 250mg','Dexamethasone 4mg',
  'Morphine 10mg','Ondansetron 4mg','Enoxaparin 40mg','Ceftriaxone 1g',
];
const DOSAGES = [
  'Once daily','Twice daily','Three times daily','Every 8 hours','Every 12 hours',
  'Every 6 hours','Once weekly','As needed','At bedtime','With meals',
  'Before meals','After meals','Every 4 hours PRN','Sublingual PRN',
];
const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const ALLERGENS = [
  'Penicillin','Sulfa Drugs','Aspirin','Ibuprofen','Codeine','Latex','Peanuts',
  'Shellfish','Egg','Soy','Tree Nuts','Milk','Wheat/Gluten','Bee Venom',
  'Contrast Dye','Morphine','ACE Inhibitors','NSAIDs','No Known Allergies',
];
const PROCEDURES = [
  'Complete Blood Count (CBC)','Chest X-Ray','CT Scan Abdomen','MRI Brain',
  'Echocardiogram','Electrocardiogram (ECG)','Colonoscopy','Upper Endoscopy',
  'Appendectomy','Cholecystectomy','Cardiac Catheterization','CABG Surgery',
  'Total Knee Replacement','Total Hip Replacement','Lumbar Spinal Fusion',
  'Cesarean Section','Laparoscopic Hernia Repair','Tonsillectomy',
  'Cataract Surgery','Skin Biopsy','Bone Marrow Biopsy','Dialysis Session',
  'Blood Transfusion','Bronchoscopy','Lumbar Puncture','Thoracentesis',
  'Paracentesis','Central Line Placement','Intubation','CPR',
];
const INSURANCE_PROVIDERS = [
  'Blue Cross Blue Shield','UnitedHealthcare','Aetna','Cigna','Humana',
  'Kaiser Permanente','Anthem','Molina Healthcare','Centene','WellCare',
  'Medicare Part A','Medicare Part B','Medicaid','Tricare','Self-Pay',
  'Oscar Health','Ambetter','CareSource','Health Net','Bright Health',
];
const HOSPITAL_WARDS = [
  'Emergency Department','ICU','NICU','PICU','CCU','Medical-Surgical',
  'Orthopedic Ward','Cardiology Ward','Neurology Ward','Oncology Ward',
  'Pediatric Ward','Labor & Delivery','Post-Anesthesia Care Unit','Burns Unit',
  'Psychiatric Ward','Rehabilitation Unit','Geriatric Ward','Outpatient Clinic',
  'Radiology','Operating Room','Telemetry Unit','Step-Down Unit',
];
const LAB_TESTS = [
  'Complete Blood Count','Basic Metabolic Panel','Comprehensive Metabolic Panel',
  'Lipid Panel','Hemoglobin A1C','Thyroid Panel (TSH, T3, T4)',
  'Liver Function Tests','Urinalysis','Blood Culture','Troponin I',
  'D-Dimer','PT/INR','BNP','Creatinine Kinase','Lactate',
  'C-Reactive Protein','ESR','Procalcitonin','Blood Glucose',
  'Arterial Blood Gas','COVID-19 PCR','HIV Screening','Hepatitis Panel',
  'Drug Screen','Urine Culture','Stool Occult Blood','PSA',
];
const LAB_RESULTS = ['Normal','Abnormal - High','Abnormal - Low','Critical High','Critical Low','Positive','Negative','Pending','Indeterminate','Borderline'];
const GENDERS = ['Male','Female','Non-Binary','Other','Prefer not to say'];
const ADMISSION_TYPES = ['Emergency','Urgent','Elective','Newborn','Trauma','Observation','Transfer','Direct Admit'];
const DISCHARGE_STATUSES = ['Discharged Home','Discharged to SNF','Discharged to Rehab','Against Medical Advice','Transferred','Expired','Still Admitted','Discharged to Hospice'];

// ── Helpers ────────────────────────────────────────────────────────────────
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const rand  = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad   = (n: number) => String(n).padStart(2, '0');

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function randomDate(from = new Date(1970, 0, 1), to = new Date()) {
  return new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
}

function loremWords(n: number) {
  return Array.from({ length: n }, () => pick(LOREM)).join(' ');
}

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/** Expand a custom_template string — replaces {{type}} tokens */
function expandTemplate(template: string): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, token) => {
    const v = generateValue(token as FieldType, undefined);
    return String(v ?? token);
  });
}

/** Very simple pattern interpreter: [A-Z]{n} [0-9]{n} [a-z]{n} literal */
function expandPattern(pattern: string): string {
  return pattern.replace(/\[([^\]]+)\]\{(\d+)\}|([^[]+)/g, (_match, charset, count, literal) => {
    if (literal !== undefined) return literal;
    const n = parseInt(count, 10);
    const chars = expandCharset(charset);
    return Array.from({ length: n }, () => pick(chars)).join('');
  });
}

function expandCharset(charset: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < charset.length; i++) {
    if (charset[i + 1] === '-' && charset[i + 2]) {
      const from = charset.charCodeAt(i);
      const to   = charset.charCodeAt(i + 2);
      for (let c = from; c <= to; c++) out.push(String.fromCharCode(c));
      i += 2;
    } else {
      out.push(charset[i]);
    }
  }
  return out.length ? out : ['?'];
}

// ── Field value generators ─────────────────────────────────────────────────
export function generateValue(type: FieldType, config?: CustomFieldConfig): unknown {
  switch (type) {
    case 'firstName':    return pick(FIRST_NAMES);
    case 'lastName':     return pick(LAST_NAMES);
    case 'fullName':     return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    case 'email': {
      const fn = pick(FIRST_NAMES).toLowerCase();
      const ln = pick(LAST_NAMES).toLowerCase();
      return `${fn}.${ln}${rand(1, 999)}@${pick(DOMAINS)}`;
    }
    case 'phone':        return `+1 (${rand(200, 999)}) ${rand(100, 999)}-${rand(1000, 9999)}`;
    case 'address':      return `${rand(1, 9999)} ${pick(STREETS)}, ${pick(CITIES)}`;
    case 'city':         return pick(CITIES);
    case 'state':        return pick(STATES);
    case 'country':      return pick(COUNTRIES);
    case 'zipCode':      return String(rand(10000, 99999));
    case 'company':      return pick(COMPANIES);
    case 'jobTitle':     return pick(JOBS);
    case 'department':   return pick(DEPARTMENTS);
    case 'industry':     return pick(INDUSTRIES);
    case 'uuid':         return uuid();
    case 'integer':      return rand(1, 1_000_000);
    case 'float':        return parseFloat((Math.random() * 10000).toFixed(2));
    case 'boolean':      return Math.random() > 0.5;
    case 'percentage':   return parseFloat((Math.random() * 100).toFixed(2));
    case 'currency':     return `$${(Math.random() * 10000 + 1).toFixed(2)}`;
    case 'date': {
      const d = randomDate();
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    case 'timestamp':    return randomDate().toISOString();
    case 'url':          return `https://${pick(COMPANIES).toLowerCase().replace(/[\s.]/g, '')}.com/${loremWords(1).toLowerCase()}`;
    case 'ipAddress':    return `${rand(1, 254)}.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}`;
    case 'creditCard':   return `${rand(4000, 4999)}-${rand(1000, 9999)}-${rand(1000, 9999)}-${rand(1000, 9999)}`;
    case 'color':        return `#${rand(0, 0xffffff).toString(16).padStart(6, '0').toUpperCase()}`;
    case 'userAgent':    return pick(USER_AGENTS);
    case 'paragraph':    return loremWords(rand(30, 80)) + '.';
    case 'sentence':     return loremWords(rand(6, 15)) + '.';
    case 'word':         return pick(LOREM);
    case 'slug':         return slugify(`${pick(ADJECTIVES)} ${pick(NOUNS)}`);
    case 'username':     return `${pick(FIRST_NAMES).toLowerCase()}${pick(LAST_NAMES).toLowerCase().slice(0, 4)}${rand(10, 999)}`;
    case 'password':     return btoa(uuid()).slice(0, rand(10, 18));
    case 'productName':  return `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
    case 'price':        return `$${(Math.random() * 500 + 1).toFixed(2)}`;
    case 'category':     return pick(CATEGORIES);
    case 'sku':          return `SKU-${expandPattern('[A-Z]{3}')}-${rand(1000, 9999)}`;
    case 'rating':       return parseFloat((Math.random() * 4 + 1).toFixed(1));
    case 'status':       return pick(STATUSES);
    case 'priority':     return pick(PRIORITIES);
    case 'tag':          return pick(TAGS);

    // ── Healthcare field types ───────────────────────────────────────────
    case 'medicalRecordNo': return `MRN-${rand(100000, 999999)}`;
    case 'diagnosis':       return pick(DIAGNOSES);
    case 'icdCode':         return pick(ICD_CODES);
    case 'medication':      return pick(MEDICATIONS);
    case 'dosage':          return pick(DOSAGES);
    case 'bloodType':       return pick(BLOOD_TYPES);
    case 'allergen':        return pick(ALLERGENS);
    case 'procedure':       return pick(PROCEDURES);
    case 'insuranceProvider': return pick(INSURANCE_PROVIDERS);
    case 'hospitalWard':    return pick(HOSPITAL_WARDS);
    case 'doctorName':      return `Dr. ${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    case 'vitalBP':         return `${rand(90, 180)}/${rand(55, 110)} mmHg`;
    case 'vitalHR':         return `${rand(50, 130)} bpm`;
    case 'vitalTemp':       return `${(Math.random() * 4 + 96).toFixed(1)} °F`;
    case 'labTest':         return pick(LAB_TESTS);
    case 'labResult':       return pick(LAB_RESULTS);
    case 'patientAge':      return rand(0, 99);
    case 'gender':          return pick(GENDERS);
    case 'admissionType':   return pick(ADMISSION_TYPES);
    case 'dischargeStatus': return pick(DISCHARGE_STATUSES);

    // ── Custom field types ───────────────────────────────────────────────
    case 'custom_list': {
      const items = (config?.listValues ?? 'value1,value2,value3')
        .split(',').map(s => s.trim()).filter(Boolean);
      return pick(items.length ? items : ['value1']);
    }
    case 'custom_regex': {
      return expandPattern(config?.regexPattern ?? '[A-Z]{3}[0-9]{4}');
    }
    case 'custom_template': {
      return expandTemplate(config?.template ?? 'ITEM-{{integer}}');
    }

    default: return null;
  }
}

export function generateRows(fields: Field[], count: number): Record<string, unknown>[] {
  return Array.from({ length: count }, () =>
    Object.fromEntries(fields.map(f => [f.name, generateValue(f.type, f.config)]))
  );
}

// ── Export formatters ──────────────────────────────────────────────────────
export function toJSON(rows: Record<string, unknown>[]) {
  return JSON.stringify(rows, null, 2);
}

export function toCSV(rows: Record<string, unknown>[]) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape  = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
}

export function toSQL(rows: Record<string, unknown>[], table = 'synthetic_data') {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const cols    = headers.join(', ');
  const escape  = (v: unknown) => typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : String(v ?? 'NULL');
  const values  = rows.map(r => `(${headers.map(h => escape(r[h])).join(', ')})`).join(',\n  ');
  return `INSERT INTO ${table} (${cols})\nVALUES\n  ${values};`;
}

export function toXML(rows: Record<string, unknown>[], root = 'records', item = 'record') {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const items  = rows.map(r => {
    const fields = Object.entries(r).map(([k, v]) => `    <${k}>${escape(String(v ?? ''))}</${k}>`).join('\n');
    return `  <${item}>\n${fields}\n  </${item}>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${root}>\n${items}\n</${root}>`;
}

export function exportData(rows: Record<string, unknown>[], format: ExportFormat, table?: string) {
  switch (format) {
    case 'json': return toJSON(rows);
    case 'csv':  return toCSV(rows);
    case 'sql':  return toSQL(rows, table);
    case 'xml':  return toXML(rows);
  }
}

// ── Built-in Scenarios ─────────────────────────────────────────────────────
export const SCENARIOS: Scenario[] = [
  {
    id: 'user-profiles',
    label: 'User Profiles',
    icon: '👤',
    description: 'Complete user profile dataset with auth fields',
    rowCount: 50,
    fields: [
      { name: 'id',         type: 'uuid'      },
      { name: 'username',   type: 'username'  },
      { name: 'full_name',  type: 'fullName'  },
      { name: 'email',      type: 'email'     },
      { name: 'phone',      type: 'phone'     },
      { name: 'avatar_url', type: 'url'       },
      { name: 'joined_at',  type: 'timestamp' },
      { name: 'is_verified',type: 'boolean'   },
      { name: 'status',     type: 'status'    },
    ],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce Products',
    icon: '🛒',
    description: 'Product catalog with pricing and inventory',
    rowCount: 100,
    fields: [
      { name: 'product_id', type: 'uuid'        },
      { name: 'name',       type: 'productName' },
      { name: 'sku',        type: 'sku'         },
      { name: 'category',   type: 'category'    },
      { name: 'price',      type: 'price'       },
      { name: 'stock',      type: 'integer'     },
      { name: 'rating',     type: 'rating'      },
      { name: 'tag',        type: 'tag'         },
      { name: 'created_at', type: 'timestamp'   },
    ],
  },
  {
    id: 'analytics',
    label: 'Web Analytics',
    icon: '📊',
    description: 'Page view events with user tracking data',
    rowCount: 200,
    fields: [
      { name: 'event_id',   type: 'uuid'      },
      { name: 'session_id', type: 'uuid'      },
      { name: 'user_email', type: 'email'     },
      { name: 'ip_address', type: 'ipAddress' },
      { name: 'page_url',   type: 'url'       },
      { name: 'user_agent', type: 'userAgent' },
      { name: 'duration_s', type: 'integer'   },
      { name: 'timestamp',  type: 'timestamp' },
      { name: 'country',    type: 'country'   },
    ],
  },
  {
    id: 'employees',
    label: 'HR / Employees',
    icon: '👔',
    description: 'Employee directory with department and salary',
    rowCount: 75,
    fields: [
      { name: 'emp_id',     type: 'uuid'       },
      { name: 'full_name',  type: 'fullName'   },
      { name: 'email',      type: 'email'      },
      { name: 'job_title',  type: 'jobTitle'   },
      { name: 'department', type: 'department' },
      { name: 'company',    type: 'company'    },
      { name: 'salary',     type: 'currency'   },
      { name: 'start_date', type: 'date'       },
      { name: 'city',       type: 'city'       },
      { name: 'is_remote',  type: 'boolean'    },
    ],
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: '💳',
    description: 'Financial transaction ledger with statuses',
    rowCount: 150,
    fields: [
      { name: 'txn_id',     type: 'uuid'      },
      { name: 'user_email', type: 'email'     },
      { name: 'card',       type: 'creditCard'},
      { name: 'amount',     type: 'currency'  },
      { name: 'merchant',   type: 'company'   },
      { name: 'category',   type: 'category'  },
      { name: 'status',     type: 'status'    },
      { name: 'timestamp',  type: 'timestamp' },
      { name: 'country',    type: 'country'   },
    ],
  },
  {
    id: 'crm',
    label: 'CRM Leads',
    icon: '🤝',
    description: 'Sales CRM dataset with leads and pipeline',
    rowCount: 80,
    fields: [
      { name: 'lead_id',    type: 'uuid'     },
      { name: 'name',       type: 'fullName' },
      { name: 'email',      type: 'email'    },
      { name: 'company',    type: 'company'  },
      { name: 'industry',   type: 'industry' },
      { name: 'priority',   type: 'priority' },
      { name: 'status',     type: 'status'   },
      { name: 'deal_value', type: 'currency' },
      { name: 'city',       type: 'city'     },
      { name: 'created_at', type: 'date'     },
    ],
  },
  {
    id: 'logs',
    label: 'Server Logs',
    icon: '🖥️',
    description: 'Application logs with severity and metadata',
    rowCount: 500,
    fields: [
      { name: 'log_id',    type: 'uuid'      },
      { name: 'timestamp', type: 'timestamp' },
      { name: 'ip',        type: 'ipAddress' },
      { name: 'level',     type: 'custom_list', config: { listValues: 'INFO,DEBUG,WARN,ERROR,FATAL' } },
      { name: 'service',   type: 'custom_list', config: { listValues: 'auth,api,worker,scheduler,gateway,cache' } },
      { name: 'message',   type: 'sentence'  },
      { name: 'duration_ms', type: 'integer' },
      { name: 'user_agent', type: 'userAgent'},
    ],
  },
  {
    id: 'iot',
    label: 'IoT Sensor Data',
    icon: '🌡️',
    description: 'Sensor readings from connected devices',
    rowCount: 300,
    fields: [
      { name: 'sensor_id',   type: 'custom_regex',    config: { regexPattern: 'SENSOR-[A-Z]{2}[0-9]{4}' } },
      { name: 'device_type', type: 'custom_list',     config: { listValues: 'temperature,humidity,pressure,motion,co2,luminosity' } },
      { name: 'location',    type: 'city'             },
      { name: 'value',       type: 'float'            },
      { name: 'unit',        type: 'custom_list',     config: { listValues: '°C,°F,%,hPa,ppm,lux' } },
      { name: 'status',      type: 'custom_list',     config: { listValues: 'online,offline,maintenance,fault' } },
      { name: 'timestamp',   type: 'timestamp'        },
      { name: 'battery_pct', type: 'percentage'       },
    ],
  },
  {
    id: 'healthcare-patients',
    label: 'Patient Records',
    icon: '🏥',
    description: 'Complete patient demographics and medical records',
    rowCount: 100,
    fields: [
      { name: 'mrn',              type: 'medicalRecordNo' },
      { name: 'patient_name',     type: 'fullName'        },
      { name: 'age',              type: 'patientAge'      },
      { name: 'gender',           type: 'gender'          },
      { name: 'blood_type',       type: 'bloodType'       },
      { name: 'phone',            type: 'phone'           },
      { name: 'email',            type: 'email'           },
      { name: 'address',          type: 'address'         },
      { name: 'insurance',        type: 'insuranceProvider'},
      { name: 'allergies',        type: 'allergen'        },
      { name: 'primary_diagnosis',type: 'diagnosis'       },
      { name: 'registered_at',    type: 'timestamp'       },
    ],
  },
  {
    id: 'healthcare-encounters',
    label: 'Clinical Encounters',
    icon: '🩺',
    description: 'Hospital admissions with vitals and treatments',
    rowCount: 150,
    fields: [
      { name: 'encounter_id',   type: 'uuid'              },
      { name: 'mrn',            type: 'medicalRecordNo'   },
      { name: 'patient_name',   type: 'fullName'          },
      { name: 'admission_type', type: 'admissionType'     },
      { name: 'ward',           type: 'hospitalWard'      },
      { name: 'attending_dr',   type: 'doctorName'        },
      { name: 'diagnosis',      type: 'diagnosis'         },
      { name: 'icd_code',       type: 'icdCode'           },
      { name: 'blood_pressure', type: 'vitalBP'           },
      { name: 'heart_rate',     type: 'vitalHR'           },
      { name: 'temperature',    type: 'vitalTemp'         },
      { name: 'medication',     type: 'medication'        },
      { name: 'dosage',         type: 'dosage'            },
      { name: 'procedure',      type: 'procedure'         },
      { name: 'admitted_at',    type: 'timestamp'         },
      { name: 'discharge',      type: 'dischargeStatus'   },
    ],
  },
  {
    id: 'healthcare-lab',
    label: 'Lab Results',
    icon: '🧪',
    description: 'Laboratory test orders, results, and diagnostics',
    rowCount: 200,
    fields: [
      { name: 'order_id',    type: 'uuid'              },
      { name: 'mrn',         type: 'medicalRecordNo'   },
      { name: 'patient_name',type: 'fullName'          },
      { name: 'ordering_dr', type: 'doctorName'        },
      { name: 'test_name',   type: 'labTest'           },
      { name: 'result',      type: 'labResult'         },
      { name: 'diagnosis',   type: 'diagnosis'         },
      { name: 'icd_code',    type: 'icdCode'           },
      { name: 'priority',    type: 'custom_list', config: { listValues: 'Routine,STAT,Urgent,Timed,Pre-Op' } },
      { name: 'specimen',    type: 'custom_list', config: { listValues: 'Blood,Urine,Stool,Sputum,CSF,Tissue,Swab' } },
      { name: 'ordered_at',  type: 'timestamp'         },
      { name: 'status',      type: 'custom_list', config: { listValues: 'Ordered,Collected,In Progress,Resulted,Reviewed' } },
    ],
  },
  {
    id: 'healthcare-pharmacy',
    label: 'Pharmacy / Rx',
    icon: '💊',
    description: 'Prescription and medication administration records',
    rowCount: 120,
    fields: [
      { name: 'rx_id',         type: 'custom_regex', config: { regexPattern: 'RX-[0-9]{8}' } },
      { name: 'mrn',           type: 'medicalRecordNo'   },
      { name: 'patient_name',  type: 'fullName'          },
      { name: 'prescriber',    type: 'doctorName'        },
      { name: 'medication',    type: 'medication'        },
      { name: 'dosage',        type: 'dosage'            },
      { name: 'route',         type: 'custom_list', config: { listValues: 'Oral,IV,IM,Subcutaneous,Topical,Inhalation,Rectal,Sublingual' } },
      { name: 'refills',       type: 'custom_list', config: { listValues: '0,1,2,3,5,12' } },
      { name: 'insurance',     type: 'insuranceProvider' },
      { name: 'allergies',     type: 'allergen'          },
      { name: 'prescribed_at', type: 'timestamp'         },
      { name: 'status',        type: 'custom_list', config: { listValues: 'Active,Completed,Discontinued,On Hold,Cancelled' } },
    ],
  },
];
