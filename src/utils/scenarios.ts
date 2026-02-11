// Custom Scenario Definitions
export interface FieldRule {
  enabled: boolean;
  nullPercent?: number; // 0–100, percentage of null values
  fixedValue?: string;
  customValues?: string[]; // pick from these values
  minValue?: number;
  maxValue?: number;
  dateStart?: string;
  dateEnd?: string;
  pattern?: string; // e.g. prefix
}

export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  dataType: string;
  fieldRules: Record<string, FieldRule>;
  // Global rules
  nullRate?: number; // default null rate for all fields
  duplicateRate?: number; // 0–100, percentage of duplicate rows
  errorRate?: number; // 0–100, percentage of rows with intentional errors
}

export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'general' | 'healthcare' | 'edge-case' | 'performance';
  dataTypes: string[];
  config: Partial<ScenarioConfig>;
  color: string;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  // General
  {
    id: 'clean-data',
    name: 'Clean Data',
    description: 'Perfect data with no nulls, no errors, all fields populated',
    icon: '✨',
    category: 'general',
    dataTypes: ['users', 'addresses', 'transactions', 'patients', 'medicalRecords', 'prescriptions', 'labResults', 'insuranceClaims', 'healthcareProviders'],
    config: { nullRate: 0, duplicateRate: 0, errorRate: 0 },
    color: 'from-emerald-500/20 to-green-500/20',
  },
  {
    id: 'dirty-data',
    name: 'Dirty / Messy Data',
    description: '15% nulls, 5% duplicates, 3% errors — test your validation',
    icon: '🗑️',
    category: 'edge-case',
    dataTypes: ['users', 'addresses', 'transactions', 'patients', 'medicalRecords', 'prescriptions', 'labResults', 'insuranceClaims', 'healthcareProviders'],
    config: { nullRate: 15, duplicateRate: 5, errorRate: 3 },
    color: 'from-orange-500/20 to-red-500/20',
  },
  {
    id: 'high-null',
    name: 'Sparse Data',
    description: '40% null values across all optional fields',
    icon: '🕳️',
    category: 'edge-case',
    dataTypes: ['users', 'addresses', 'transactions', 'patients', 'medicalRecords', 'prescriptions', 'labResults', 'insuranceClaims', 'healthcareProviders'],
    config: { nullRate: 40, duplicateRate: 0, errorRate: 0 },
    color: 'from-gray-500/20 to-zinc-500/20',
  },
  {
    id: 'high-volume-txn',
    name: 'High-Value Transactions',
    description: 'All transactions > $5,000 — fraud detection testing',
    icon: '💰',
    category: 'general',
    dataTypes: ['transactions'],
    config: {
      fieldRules: {
        amount: { enabled: true, minValue: 5000, maxValue: 100000 },
        status: { enabled: true, customValues: ['Completed', 'Processing', 'Pending'] },
      },
    },
    color: 'from-yellow-500/20 to-amber-500/20',
  },
  {
    id: 'fraud-patterns',
    name: 'Fraud Patterns',
    description: 'Suspicious transactions: odd hours, foreign currencies, rapid succession',
    icon: '🚨',
    category: 'general',
    dataTypes: ['transactions'],
    config: {
      fieldRules: {
        amount: { enabled: true, minValue: 1, maxValue: 50000 },
        currency: { enabled: true, customValues: ['EUR', 'GBP', 'JPY', 'CHF', 'BTC'] },
        status: { enabled: true, customValues: ['Pending', 'Processing', 'Failed', 'Completed'] },
        category: { enabled: true, customValues: ['Transfer', 'Investment', 'Shopping', 'Travel'] },
      },
      errorRate: 8,
    },
    color: 'from-red-500/20 to-rose-500/20',
  },
  {
    id: 'micro-transactions',
    name: 'Micro-Transactions',
    description: 'Small amounts < $10 — POS and subscription testing',
    icon: '🪙',
    category: 'general',
    dataTypes: ['transactions'],
    config: {
      fieldRules: {
        amount: { enabled: true, minValue: 0.01, maxValue: 9.99 },
        category: { enabled: true, customValues: ['Subscriptions', 'Food & Dining', 'Entertainment'] },
      },
    },
    color: 'from-sky-500/20 to-blue-500/20',
  },
  {
    id: 'new-users',
    name: 'New User Signups',
    description: 'Users created in last 30 days — onboarding flow testing',
    icon: '🆕',
    category: 'general',
    dataTypes: ['users'],
    config: {
      fieldRules: {
        createdAt: { enabled: true, dateStart: '2024-11-01', dateEnd: '2024-12-01' },
        isActive: { enabled: true, fixedValue: 'true' },
      },
    },
    color: 'from-cyan-500/20 to-sky-500/20',
  },
  {
    id: 'inactive-users',
    name: 'Churned Users',
    description: 'Inactive users from 2+ years ago — retention analysis',
    icon: '👻',
    category: 'general',
    dataTypes: ['users'],
    config: {
      fieldRules: {
        isActive: { enabled: true, fixedValue: 'false' },
        createdAt: { enabled: true, dateStart: '2020-01-01', dateEnd: '2022-06-30' },
      },
    },
    color: 'from-zinc-500/20 to-gray-500/20',
  },

  // Healthcare
  {
    id: 'elderly-cohort',
    name: 'Elderly Patient Cohort',
    description: 'Patients aged 65+, multiple chronic conditions, high medication count',
    icon: '👴',
    category: 'healthcare',
    dataTypes: ['patients'],
    config: {
      fieldRules: {
        dateOfBirth: { enabled: true, dateStart: '1935-01-01', dateEnd: '1959-12-31' },
        conditions: { enabled: true, customValues: ['Hypertension, Type 2 Diabetes', 'COPD, Heart Failure', 'Atrial Fibrillation, Chronic Kidney Disease', 'Osteoarthritis, Hypertension, Hyperlipidemia', 'Alzheimer\'s Disease, Hypertension'] },
        status: { enabled: true, customValues: ['Active', 'Admitted', 'Observation'] },
      },
    },
    color: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 'pediatric-cohort',
    name: 'Pediatric Cohort',
    description: 'Children aged 0–17 with age-appropriate conditions',
    icon: '👶',
    category: 'healthcare',
    dataTypes: ['patients'],
    config: {
      fieldRules: {
        dateOfBirth: { enabled: true, dateStart: '2007-01-01', dateEnd: '2024-11-30' },
        conditions: { enabled: true, customValues: ['Asthma', 'None', 'Allergic Rhinitis', 'ADHD', 'Type 1 Diabetes', 'Epilepsy', 'None'] },
        allergies: { enabled: true, customValues: ['Peanuts', 'NKDA', 'Milk/Dairy', 'Eggs', 'NKDA', 'Penicillin', 'NKDA'] },
      },
    },
    color: 'from-pink-500/20 to-rose-500/20',
  },
  {
    id: 'critical-labs',
    name: 'Critical Lab Values',
    description: 'All results are abnormal with high/low/critical flags',
    icon: '⚠️',
    category: 'healthcare',
    dataTypes: ['labResults'],
    config: {
      fieldRules: {
        flag: { enabled: true, customValues: ['High', 'Low', 'Critical'] },
        status: { enabled: true, customValues: ['Final', 'Preliminary'] },
      },
    },
    color: 'from-red-500/20 to-orange-500/20',
  },
  {
    id: 'denied-claims',
    name: 'Denied Claims Batch',
    description: 'All claims denied — appeals workflow testing',
    icon: '❌',
    category: 'healthcare',
    dataTypes: ['insuranceClaims'],
    config: {
      fieldRules: {
        status: { enabled: true, customValues: ['Denied', 'Appealed', 'Denied', 'Resubmitted', 'Denied'] },
        paidAmount: { enabled: true, fixedValue: '0.00' },
      },
    },
    color: 'from-red-600/20 to-red-400/20',
  },
  {
    id: 'high-cost-claims',
    name: 'High-Cost Claims',
    description: 'Claims > $10,000 — utilization review testing',
    icon: '🏦',
    category: 'healthcare',
    dataTypes: ['insuranceClaims'],
    config: {
      fieldRules: {
        chargedAmount: { enabled: true, minValue: 10000, maxValue: 150000 },
        claimType: { enabled: true, customValues: ['Institutional', 'Professional'] },
      },
    },
    color: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    id: 'er-visits',
    name: 'Emergency Department',
    description: 'All records are ER visits with urgent vitals',
    icon: '🚑',
    category: 'healthcare',
    dataTypes: ['medicalRecords'],
    config: {
      fieldRules: {
        visitType: { enabled: true, fixedValue: 'Emergency' },
        heartRate: { enabled: true, minValue: 90, maxValue: 150 },
        systolicBP: { enabled: true, minValue: 85, maxValue: 200 },
        oxygenSat: { enabled: true, minValue: 85, maxValue: 97 },
      },
    },
    color: 'from-red-500/20 to-pink-500/20',
  },
  {
    id: 'telehealth-visits',
    name: 'Telehealth Visits',
    description: 'Remote consultations only — telemedicine app testing',
    icon: '📹',
    category: 'healthcare',
    dataTypes: ['medicalRecords'],
    config: {
      fieldRules: {
        visitType: { enabled: true, fixedValue: 'Telehealth' },
        facility: { enabled: true, customValues: ['Virtual Care Center', 'Telehealth Hub', 'Remote Health Platform', 'Online Clinic'] },
      },
    },
    color: 'from-violet-500/20 to-purple-500/20',
  },
  {
    id: 'controlled-rx',
    name: 'Controlled Substances',
    description: 'DEA Schedule II–IV medications only',
    icon: '⚕️',
    category: 'healthcare',
    dataTypes: ['prescriptions'],
    config: {
      fieldRules: {
        medication: { enabled: true, customValues: ['Oxycodone', 'Hydrocodone', 'Adderall', 'Xanax', 'Valium', 'Tramadol', 'Fentanyl Patch', 'Morphine', 'Ritalin', 'Ambien'] },
        dosage: { enabled: true, customValues: ['5mg', '10mg', '20mg', '30mg', '50mg', '25mcg/hr'] },
        refills: { enabled: true, minValue: 0, maxValue: 0 },
      },
    },
    color: 'from-amber-600/20 to-orange-500/20',
  },

  // Edge Cases
  {
    id: 'unicode-names',
    name: 'Unicode / International',
    description: 'Names with accents, special characters, and multi-byte chars',
    icon: '🌍',
    category: 'edge-case',
    dataTypes: ['users', 'patients'],
    config: {
      fieldRules: {
        firstName: { enabled: true, customValues: ['José', 'François', 'Müller', 'Søren', 'Łukasz', 'Björk', 'Héctor', 'Naïve', 'Renée', 'André', 'Zoë', 'Noël', 'Chloé', 'Māori', 'Jiří', 'Ólafur'] },
        lastName: { enabled: true, customValues: ['García', 'Müller', 'Ødegaard', 'Łuczak', 'Björnsson', 'O\'Brien', 'Al-Rashid', 'Nguyễn', 'Hernández', 'Böhm', 'Çelik', 'Übel', 'D\'Angelo', 'Vøller'] },
      },
    },
    color: 'from-indigo-500/20 to-blue-500/20',
  },
  {
    id: 'boundary-values',
    name: 'Boundary Values',
    description: 'Extreme min/max values for numeric fields — stress test parsing',
    icon: '📐',
    category: 'edge-case',
    dataTypes: ['transactions', 'labResults', 'insuranceClaims'],
    config: {
      fieldRules: {
        amount: { enabled: true, minValue: 0.01, maxValue: 999999.99 },
        chargedAmount: { enabled: true, minValue: 1, maxValue: 999999 },
        result: { enabled: true, minValue: 0, maxValue: 99999 },
      },
      errorRate: 5,
    },
    color: 'from-purple-500/20 to-violet-500/20',
  },
  {
    id: 'all-same-status',
    name: 'Single Status',
    description: 'All records have status "Completed" — filter testing',
    icon: '🎯',
    category: 'edge-case',
    dataTypes: ['transactions', 'prescriptions', 'labResults', 'insuranceClaims', 'medicalRecords'],
    config: {
      fieldRules: {
        status: { enabled: true, fixedValue: 'Completed' },
      },
    },
    color: 'from-teal-500/20 to-cyan-500/20',
  },
  {
    id: 'long-strings',
    name: 'Long Text Values',
    description: 'Extra-long names, addresses, and notes — UI overflow testing',
    icon: '📝',
    category: 'edge-case',
    dataTypes: ['users', 'addresses', 'medicalRecords'],
    config: {
      fieldRules: {
        firstName: { enabled: true, customValues: ['Bartholomew-Alexander', 'Mary-Catherine-Elizabeth', 'Jean-Pierre-Christophe', 'Alexandrina-Victoria-Sophia'] },
        lastName: { enabled: true, customValues: ['Montgomery-Worthington-Smythe', 'Von-Habsburger-Lothringen', 'Fitzpatrick-Willoughby-Ashton', 'Cholmondeley-Featherstonehaugh'] },
        street: { enabled: true, customValues: ['12345 Northeast Martin Luther King Jr Boulevard Extension', '99999 Southwest Christopher Columbus Memorial Highway', '00001 Upper East Side Metropolitan Transportation Avenue'] },
        notes: { enabled: true, customValues: ['Patient presents with an extensive and complex medical history including but not limited to multiple chronic conditions requiring ongoing management and coordination across several specialty departments. Comprehensive review of systems reveals significant findings in the cardiovascular, respiratory, gastrointestinal, and musculoskeletal systems. Detailed discussion with patient and family regarding treatment options, risks, benefits, and alternatives was conducted at length.'] },
      },
    },
    color: 'from-lime-500/20 to-green-500/20',
  },
  {
    id: 'duplicates-test',
    name: 'Heavy Duplicates',
    description: '30% duplicate records — deduplication pipeline testing',
    icon: '👯',
    category: 'edge-case',
    dataTypes: ['users', 'addresses', 'transactions', 'patients', 'medicalRecords', 'prescriptions', 'labResults', 'insuranceClaims', 'healthcareProviders'],
    config: { duplicateRate: 30 },
    color: 'from-fuchsia-500/20 to-pink-500/20',
  },
];

// Apply scenario overrides to generated data
export function applyScenario(
  data: Record<string, unknown>[],
  scenario: Partial<ScenarioConfig> | null,
  seed: number
): Record<string, unknown>[] {
  if (!scenario) return data;

  let result = [...data];

  // Apply field rules
  if (scenario.fieldRules) {
    result = result.map((row, i) => {
      const newRow = { ...row };
      for (const [field, rule] of Object.entries(scenario.fieldRules!)) {
        if (!rule.enabled) continue;
        if (!(field in newRow)) continue;

        // Fixed value
        if (rule.fixedValue !== undefined && rule.fixedValue !== '') {
          if (rule.fixedValue === 'true') newRow[field] = true;
          else if (rule.fixedValue === 'false') newRow[field] = false;
          else if (!isNaN(Number(rule.fixedValue)) && rule.fixedValue.trim() !== '') {
            newRow[field] = rule.fixedValue; // keep as string for amounts
          } else {
            newRow[field] = rule.fixedValue;
          }
        }

        // Custom values — pick based on seed+index
        if (rule.customValues && rule.customValues.length > 0 && !rule.fixedValue) {
          const pickIdx = ((seed + i * 7 + field.charCodeAt(0) * 13) % rule.customValues.length);
          newRow[field] = rule.customValues[pickIdx];
        }

        // Min/Max for numeric fields
        if (rule.minValue !== undefined || rule.maxValue !== undefined) {
          const currentVal = Number(newRow[field]);
          if (!isNaN(currentVal)) {
            const min = rule.minValue ?? 0;
            const max = rule.maxValue ?? 999999;
            // Pseudo-random within range based on seed+index
            const pseudoRand = ((seed * 16807 + i * 31 + field.charCodeAt(0) * 47) % 2147483647) / 2147483647;
            const newVal = min + pseudoRand * (max - min);
            // Preserve decimal places of original
            const originalStr = String(newRow[field]);
            const decimals = originalStr.includes('.') ? originalStr.split('.')[1]?.length ?? 0 : 0;
            newRow[field] = decimals > 0 ? newVal.toFixed(decimals) : Math.round(newVal);
          }
        }

        // Date range
        if (rule.dateStart || rule.dateEnd) {
          const start = rule.dateStart ? new Date(rule.dateStart).getTime() : new Date('2020-01-01').getTime();
          const end = rule.dateEnd ? new Date(rule.dateEnd).getTime() : new Date('2024-12-31').getTime();
          const pseudoRand = ((seed * 16807 + i * 37 + field.charCodeAt(0) * 53) % 2147483647) / 2147483647;
          const dateMs = start + pseudoRand * (end - start);
          const d = new Date(dateMs);
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          // Check if original had time component
          if (String(newRow[field]).includes('T')) {
            const h = String(Math.floor(pseudoRand * 24)).padStart(2, '0');
            const m = String(Math.floor((pseudoRand * 1000) % 60)).padStart(2, '0');
            newRow[field] = `${dateStr}T${h}:${m}:00Z`;
          } else {
            newRow[field] = dateStr;
          }

          // Recalculate age if dateOfBirth is changed
          if (field === 'dateOfBirth' && 'age' in newRow) {
            const birth = new Date(dateStr);
            const today = new Date(2024, 11, 1);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
              age--;
            }
            newRow['age'] = age;
          }
        }

        // Null percentage per field
        if (rule.nullPercent && rule.nullPercent > 0) {
          const pseudoRand = ((seed * 16807 + i * 41 + field.charCodeAt(0) * 59) % 2147483647) / 2147483647;
          if (pseudoRand * 100 < rule.nullPercent) {
            newRow[field] = null;
          }
        }
      }
      return newRow;
    });
  }

  // Apply global null rate
  if (scenario.nullRate && scenario.nullRate > 0) {
    const protectedFields = ['id', 'mrn', 'npi', 'claimNumber', 'rxNumber', 'labOrderId'];
    result = result.map((row, i) => {
      const newRow = { ...row };
      const keys = Object.keys(newRow).filter(k => !protectedFields.includes(k));
      for (const key of keys) {
        // Check if field already has a specific rule
        if (scenario.fieldRules?.[key]?.enabled) continue;
        const pseudoRand = ((seed * 16807 + i * 43 + key.charCodeAt(0) * 61) % 2147483647) / 2147483647;
        if (pseudoRand * 100 < scenario.nullRate!) {
          newRow[key] = null;
        }
      }
      return newRow;
    });
  }

  // Apply error rate (introduce garbled data)
  if (scenario.errorRate && scenario.errorRate > 0) {
    const protectedFields = ['id'];
    result = result.map((row, i) => {
      const pseudoRand = ((seed * 16807 + i * 47 + 67) % 2147483647) / 2147483647;
      if (pseudoRand * 100 >= scenario.errorRate!) return row;

      const newRow = { ...row };
      const keys = Object.keys(newRow).filter(k => !protectedFields.includes(k));
      const errorKey = keys[Math.floor(((seed * 31 + i * 71) % 2147483647) / 2147483647 * keys.length)];
      if (errorKey) {
        const errorTypes = ['garble', 'type-mismatch', 'truncate', 'empty'];
        const errorType = errorTypes[Math.abs((seed + i * 13) % errorTypes.length)];
        switch (errorType) {
          case 'garble':
            newRow[errorKey] = '##ERR##' + String(newRow[errorKey]).slice(0, 3);
            break;
          case 'type-mismatch':
            newRow[errorKey] = typeof newRow[errorKey] === 'number' ? 'NaN' : -1;
            break;
          case 'truncate':
            newRow[errorKey] = String(newRow[errorKey]).slice(0, 1);
            break;
          case 'empty':
            newRow[errorKey] = '';
            break;
        }
      }
      return newRow;
    });
  }

  // Apply duplicate rate
  if (scenario.duplicateRate && scenario.duplicateRate > 0) {
    const origLength = result.length;
    const dupeCount = Math.floor(origLength * scenario.duplicateRate / 100);
    for (let i = 0; i < dupeCount; i++) {
      const srcIdx = Math.abs((seed * 16807 + i * 97) % origLength);
      const insertIdx = Math.abs((seed * 31 + i * 73) % result.length);
      result.splice(insertIdx, 0, { ...result[srcIdx] });
    }
    // Trim back to original count
    result = result.slice(0, origLength);
  }

  return result;
}

// Get field names for a data type that are customizable
export function getCustomizableFields(dataType: string): { key: string; label: string; type: 'text' | 'number' | 'date' | 'boolean' | 'status' }[] {
  const fieldMap: Record<string, { key: string; label: string; type: 'text' | 'number' | 'date' | 'boolean' | 'status' }[]> = {
    users: [
      { key: 'firstName', label: 'First Name', type: 'text' },
      { key: 'lastName', label: 'Last Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'gender', label: 'Gender', type: 'text' },
      { key: 'company', label: 'Company', type: 'text' },
      { key: 'jobTitle', label: 'Job Title', type: 'text' },
      { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
      { key: 'createdAt', label: 'Created At', type: 'date' },
      { key: 'isActive', label: 'Active', type: 'boolean' },
    ],
    addresses: [
      { key: 'street', label: 'Street', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'state', label: 'State', type: 'text' },
      { key: 'zipCode', label: 'ZIP Code', type: 'text' },
      { key: 'country', label: 'Country', type: 'text' },
      { key: 'type', label: 'Address Type', type: 'text' },
    ],
    transactions: [
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'currency', label: 'Currency', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'merchant', label: 'Merchant', type: 'text' },
      { key: 'type', label: 'Credit/Debit', type: 'text' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'description', label: 'Description', type: 'text' },
    ],
    patients: [
      { key: 'firstName', label: 'First Name', type: 'text' },
      { key: 'lastName', label: 'Last Name', type: 'text' },
      { key: 'gender', label: 'Gender', type: 'text' },
      { key: 'bloodType', label: 'Blood Type', type: 'text' },
      { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
      { key: 'allergies', label: 'Allergies', type: 'text' },
      { key: 'conditions', label: 'Conditions', type: 'text' },
      { key: 'insuranceProvider', label: 'Insurance', type: 'text' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'admitDate', label: 'Admit Date', type: 'date' },
    ],
    medicalRecords: [
      { key: 'visitType', label: 'Visit Type', type: 'text' },
      { key: 'specialty', label: 'Specialty', type: 'text' },
      { key: 'facility', label: 'Facility', type: 'text' },
      { key: 'visitDate', label: 'Visit Date', type: 'date' },
      { key: 'systolicBP', label: 'Systolic BP', type: 'number' },
      { key: 'diastolicBP', label: 'Diastolic BP', type: 'number' },
      { key: 'heartRate', label: 'Heart Rate', type: 'number' },
      { key: 'temperature', label: 'Temperature', type: 'number' },
      { key: 'oxygenSat', label: 'SpO2', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'text' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    prescriptions: [
      { key: 'medication', label: 'Medication', type: 'text' },
      { key: 'dosage', label: 'Dosage', type: 'text' },
      { key: 'form', label: 'Form', type: 'text' },
      { key: 'frequency', label: 'Frequency', type: 'text' },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'refills', label: 'Refills', type: 'number' },
      { key: 'pharmacy', label: 'Pharmacy', type: 'text' },
      { key: 'prescribedDate', label: 'Prescribed Date', type: 'date' },
      { key: 'daysSupply', label: 'Days Supply', type: 'number' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    labResults: [
      { key: 'testName', label: 'Test Name', type: 'text' },
      { key: 'result', label: 'Result Value', type: 'number' },
      { key: 'flag', label: 'Flag', type: 'status' },
      { key: 'specimen', label: 'Specimen', type: 'text' },
      { key: 'collectionDate', label: 'Collection Date', type: 'date' },
      { key: 'facility', label: 'Facility', type: 'text' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    insuranceClaims: [
      { key: 'chargedAmount', label: 'Charged Amount', type: 'number' },
      { key: 'allowedAmount', label: 'Allowed Amount', type: 'number' },
      { key: 'paidAmount', label: 'Paid Amount', type: 'number' },
      { key: 'patientResponsibility', label: 'Patient Resp.', type: 'number' },
      { key: 'insuranceProvider', label: 'Insurance', type: 'text' },
      { key: 'planType', label: 'Plan Type', type: 'text' },
      { key: 'claimType', label: 'Claim Type', type: 'text' },
      { key: 'serviceDate', label: 'Service Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    healthcareProviders: [
      { key: 'firstName', label: 'First Name', type: 'text' },
      { key: 'lastName', label: 'Last Name', type: 'text' },
      { key: 'credentials', label: 'Credentials', type: 'text' },
      { key: 'specialty', label: 'Specialty', type: 'text' },
      { key: 'subSpecialty', label: 'Sub-Specialty', type: 'text' },
      { key: 'facility', label: 'Facility', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'state', label: 'State', type: 'text' },
      { key: 'yearsExperience', label: 'Years Experience', type: 'number' },
      { key: 'rating', label: 'Rating', type: 'number' },
      { key: 'acceptingPatients', label: 'Accepting', type: 'boolean' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
  };

  return fieldMap[dataType] ?? [];
}
