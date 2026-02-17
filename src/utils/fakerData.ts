// Seeded random number generator for reproducibility
export class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 16807 + 0) % 2147483647;
    return this.seed / 2147483647;
  }
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)];
  }
  shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  pickWeighted<T>(arr: T[], weights: number[]): T {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = this.next() * total;
    for (let i = 0; i < arr.length; i++) {
      r -= weights[i];
      if (r <= 0) return arr[i];
    }
    return arr[arr.length - 1];
  }
}

// ======================= DATA POOLS =======================

const FIRST_NAMES_MALE = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph',
  'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark',
  'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian',
  'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan',
  'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin',
  'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Raymond', 'Gregory', 'Frank',
  'Alexander', 'Patrick', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Nathan',
  'Henry', 'Peter', 'Adam', 'Zachary', 'Douglas', 'Harold', 'Carl',
];

const FIRST_NAMES_FEMALE = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan',
  'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra',
  'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol',
  'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura',
  'Cynthia', 'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda',
  'Pamela', 'Emma', 'Nicole', 'Helen', 'Samantha', 'Katherine', 'Christine',
  'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather',
  'Diane', 'Ruth', 'Julie', 'Olivia', 'Joyce', 'Virginia', 'Victoria',
  'Kelly', 'Lauren', 'Christina', 'Joan', 'Evelyn', 'Judith', 'Andrea',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen',
  'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera',
  'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Phillips', 'Evans', 'Turner',
  'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart',
  'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz',
  'Morgan', 'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard',
];

const STREET_NAMES = [
  'Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Washington', 'Park',
  'Walnut', 'Sunset', 'Highland', 'Lake', 'Hill', 'Meadow', 'Forest',
  'River', 'Spring', 'Valley', 'Church', 'North', 'South', 'Willow',
  'Cherry', 'Birch', 'Hickory', 'Dogwood', 'Magnolia', 'Chestnut',
];

const STREET_TYPES = [
  'Street', 'Avenue', 'Boulevard', 'Drive', 'Lane', 'Road', 'Way',
  'Court', 'Place', 'Circle', 'Trail', 'Parkway', 'Terrace',
];

const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fort Worth', 'Columbus', 'Charlotte', 'Indianapolis', 'San Francisco',
  'Seattle', 'Denver', 'Nashville', 'Oklahoma City', 'El Paso', 'Washington',
  'Boston', 'Las Vegas', 'Portland', 'Memphis', 'Louisville', 'Baltimore',
  'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Mesa',
  'Kansas City', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh',
  'Long Beach', 'Virginia Beach', 'Miami', 'Oakland', 'Minneapolis',
  'Tampa', 'Tulsa', 'Arlington', 'New Orleans', 'Wichita',
];

const STATES = [
  { name: 'Alabama', abbr: 'AL' }, { name: 'Alaska', abbr: 'AK' },
  { name: 'Arizona', abbr: 'AZ' }, { name: 'Arkansas', abbr: 'AR' },
  { name: 'California', abbr: 'CA' }, { name: 'Colorado', abbr: 'CO' },
  { name: 'Connecticut', abbr: 'CT' }, { name: 'Delaware', abbr: 'DE' },
  { name: 'Florida', abbr: 'FL' }, { name: 'Georgia', abbr: 'GA' },
  { name: 'Hawaii', abbr: 'HI' }, { name: 'Idaho', abbr: 'ID' },
  { name: 'Illinois', abbr: 'IL' }, { name: 'Indiana', abbr: 'IN' },
  { name: 'Iowa', abbr: 'IA' }, { name: 'Kansas', abbr: 'KS' },
  { name: 'Kentucky', abbr: 'KY' }, { name: 'Louisiana', abbr: 'LA' },
  { name: 'Maine', abbr: 'ME' }, { name: 'Maryland', abbr: 'MD' },
  { name: 'Massachusetts', abbr: 'MA' }, { name: 'Michigan', abbr: 'MI' },
  { name: 'Minnesota', abbr: 'MN' }, { name: 'Mississippi', abbr: 'MS' },
  { name: 'Missouri', abbr: 'MO' }, { name: 'Montana', abbr: 'MT' },
  { name: 'Nebraska', abbr: 'NE' }, { name: 'Nevada', abbr: 'NV' },
  { name: 'New Hampshire', abbr: 'NH' }, { name: 'New Jersey', abbr: 'NJ' },
  { name: 'New Mexico', abbr: 'NM' }, { name: 'New York', abbr: 'NY' },
  { name: 'North Carolina', abbr: 'NC' }, { name: 'North Dakota', abbr: 'ND' },
  { name: 'Ohio', abbr: 'OH' }, { name: 'Oklahoma', abbr: 'OK' },
  { name: 'Oregon', abbr: 'OR' }, { name: 'Pennsylvania', abbr: 'PA' },
  { name: 'Rhode Island', abbr: 'RI' }, { name: 'South Carolina', abbr: 'SC' },
  { name: 'South Dakota', abbr: 'SD' }, { name: 'Tennessee', abbr: 'TN' },
  { name: 'Texas', abbr: 'TX' }, { name: 'Utah', abbr: 'UT' },
  { name: 'Vermont', abbr: 'VT' }, { name: 'Virginia', abbr: 'VA' },
  { name: 'Washington', abbr: 'WA' }, { name: 'West Virginia', abbr: 'WV' },
  { name: 'Wisconsin', abbr: 'WI' }, { name: 'Wyoming', abbr: 'WY' },
];

const EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'mail.com', 'protonmail.com', 'fastmail.com', 'zoho.com', 'aol.com',
];

const COMPANY_NAMES = [
  'Acme Corp', 'TechVision Inc', 'GlobalTech Solutions', 'Pinnacle Systems',
  'Nexus Innovations', 'Vertex Labs', 'Quantum Dynamics', 'Atlas Industries',
  'Horizon Digital', 'Sterling & Co', 'Apex Partners', 'CrestWave',
  'Ironclad Security', 'Nimbus Cloud', 'Prism Analytics', 'Silverline Media',
  'TrueNorth Ventures', 'Zenith Corp', 'BrightStar LLC', 'Cobalt Solutions',
];

const JOB_TITLES = [
  'Software Engineer', 'Product Manager', 'Data Analyst', 'UX Designer',
  'DevOps Engineer', 'Marketing Manager', 'Sales Representative', 'Account Executive',
  'Financial Analyst', 'Project Manager', 'Business Analyst', 'HR Specialist',
  'Content Writer', 'Graphic Designer', 'Full Stack Developer', 'QA Engineer',
  'System Administrator', 'Database Administrator', 'Cloud Architect',
  'Machine Learning Engineer', 'Cybersecurity Analyst', 'Technical Writer',
  'Operations Manager', 'Customer Success Manager', 'Frontend Developer',
  'Backend Developer', 'Mobile Developer', 'Data Scientist', 'CTO', 'CEO',
];

const PHONE_AREA_CODES = [
  '212', '310', '312', '404', '415', '512', '617', '702', '713', '718',
  '214', '305', '323', '347', '469', '503', '516', '609', '626', '646',
  '650', '678', '720', '737', '773', '818', '832', '847', '862', '917',
];

const TRANSACTION_DESCRIPTIONS = [
  'Online Purchase', 'Subscription Payment', 'Wire Transfer', 'Direct Deposit',
  'ATM Withdrawal', 'POS Purchase', 'Bill Payment', 'Refund', 'Payroll',
  'Vendor Payment', 'Service Fee', 'Insurance Premium', 'Loan Payment',
  'Investment Transfer', 'Utility Payment', 'Rent Payment', 'Grocery Purchase',
  'Restaurant Payment', 'Gas Station', 'Travel Booking', 'Software License',
  'Cloud Services', 'Office Supplies', 'Marketing Expense', 'Consulting Fee',
];

const TRANSACTION_CATEGORIES = [
  'Shopping', 'Food & Dining', 'Transportation', 'Bills & Utilities',
  'Entertainment', 'Health & Fitness', 'Travel', 'Education', 'Business',
  'Income', 'Transfer', 'Investment', 'Insurance', 'Subscriptions',
];

const MERCHANT_NAMES = [
  'Amazon', 'Walmart', 'Target', 'Costco', 'Best Buy', 'Apple Store',
  'Starbucks', 'McDonald\'s', 'Uber', 'Netflix', 'Spotify', 'Adobe',
  'Microsoft', 'Google Cloud', 'AWS', 'Whole Foods', 'Home Depot',
  'Chevron', 'Shell', 'Delta Airlines', 'Airbnb', 'DoorDash',
  'Grubhub', 'Lyft', 'Walgreens', 'CVS', 'Chipotle', 'Subway',
];

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
  'Australia', 'Japan', 'Brazil', 'India', 'Mexico',
];

// ======================= HEALTHCARE DATA POOLS =======================

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const BLOOD_TYPE_WEIGHTS = [35, 6, 8, 2, 3, 1, 37, 8]; // approximate US distribution

const ALLERGIES = [
  'Penicillin', 'Sulfa Drugs', 'Aspirin', 'Ibuprofen', 'Latex', 'Peanuts',
  'Shellfish', 'Eggs', 'Soy', 'Tree Nuts', 'Codeine', 'Morphine', 'Contrast Dye',
  'Bee Stings', 'Amoxicillin', 'Cephalosporins', 'Tetracycline', 'Dust Mites',
  'Pollen', 'Mold', 'Pet Dander', 'Wheat/Gluten', 'Milk/Dairy', 'None',
];

const MEDICAL_CONDITIONS = [
  'Hypertension', 'Type 2 Diabetes', 'Asthma', 'Hyperlipidemia', 'Hypothyroidism',
  'GERD', 'Depression', 'Anxiety Disorder', 'Osteoarthritis', 'Atrial Fibrillation',
  'COPD', 'Chronic Kidney Disease', 'Heart Failure', 'Coronary Artery Disease',
  'Rheumatoid Arthritis', 'Migraine', 'Epilepsy', 'Psoriasis', 'Celiac Disease',
  'Crohn\'s Disease', 'Ulcerative Colitis', 'Multiple Sclerosis', 'Parkinson\'s Disease',
  'Alzheimer\'s Disease', 'Lupus', 'Fibromyalgia', 'Sleep Apnea', 'Anemia', 'Obesity',
];

const DIAGNOSES_ICD10 = [
  { code: 'I10', desc: 'Essential (primary) hypertension' },
  { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications' },
  { code: 'J45.909', desc: 'Unspecified asthma, uncomplicated' },
  { code: 'E78.5', desc: 'Hyperlipidemia, unspecified' },
  { code: 'E03.9', desc: 'Hypothyroidism, unspecified' },
  { code: 'K21.0', desc: 'Gastro-esophageal reflux disease with esophagitis' },
  { code: 'F32.9', desc: 'Major depressive disorder, single episode' },
  { code: 'F41.1', desc: 'Generalized anxiety disorder' },
  { code: 'M17.9', desc: 'Osteoarthritis of knee, unspecified' },
  { code: 'I48.91', desc: 'Unspecified atrial fibrillation' },
  { code: 'J44.1', desc: 'COPD with acute exacerbation' },
  { code: 'N18.3', desc: 'Chronic kidney disease, stage 3' },
  { code: 'I50.9', desc: 'Heart failure, unspecified' },
  { code: 'I25.10', desc: 'Atherosclerotic heart disease without angina pectoris' },
  { code: 'M06.9', desc: 'Rheumatoid arthritis, unspecified' },
  { code: 'G43.909', desc: 'Migraine, unspecified, not intractable' },
  { code: 'G40.909', desc: 'Epilepsy, unspecified, not intractable' },
  { code: 'L40.9', desc: 'Psoriasis, unspecified' },
  { code: 'J06.9', desc: 'Acute upper respiratory infection, unspecified' },
  { code: 'M54.5', desc: 'Low back pain' },
  { code: 'R51.9', desc: 'Headache, unspecified' },
  { code: 'J02.9', desc: 'Acute pharyngitis, unspecified' },
  { code: 'N39.0', desc: 'Urinary tract infection, site not specified' },
  { code: 'R10.9', desc: 'Unspecified abdominal pain' },
  { code: 'R05.9', desc: 'Cough, unspecified' },
];

const MEDICATIONS = [
  { name: 'Lisinopril', dosage: '10mg', form: 'Tablet', frequency: 'Once daily' },
  { name: 'Metformin', dosage: '500mg', form: 'Tablet', frequency: 'Twice daily' },
  { name: 'Amlodipine', dosage: '5mg', form: 'Tablet', frequency: 'Once daily' },
  { name: 'Metoprolol', dosage: '50mg', form: 'Tablet', frequency: 'Twice daily' },
  { name: 'Omeprazole', dosage: '20mg', form: 'Capsule', frequency: 'Once daily' },
  { name: 'Atorvastatin', dosage: '40mg', form: 'Tablet', frequency: 'Once daily' },
  { name: 'Levothyroxine', dosage: '75mcg', form: 'Tablet', frequency: 'Once daily' },
  { name: 'Albuterol', dosage: '90mcg', form: 'Inhaler', frequency: 'As needed' },
  { name: 'Sertraline', dosage: '50mg', form: 'Tablet', frequency: 'Once daily' },
  { name: 'Gabapentin', dosage: '300mg', form: 'Capsule', frequency: 'Three times daily' },
  { name: 'Amoxicillin', dosage: '500mg', form: 'Capsule', frequency: 'Three times daily' },
  { name: 'Prednisone', dosage: '10mg', form: 'Tablet', frequency: 'Once daily' },
  { name: 'Hydrochlorothiazide', dosage: '25mg', form: 'Tablet', frequency: 'Once daily' },
  { name: 'Losartan', dosage: '50mg', form: 'Tablet', frequency: 'Once daily' },
  { name: 'Furosemide', dosage: '40mg', form: 'Tablet', frequency: 'Once daily' },
  { name: 'Warfarin', dosage: '5mg', form: 'Tablet', frequency: 'Once daily' },
  { name: 'Clopidogrel', dosage: '75mg', form: 'Tablet', frequency: 'Once daily' },
  { name: 'Escitalopram', dosage: '10mg', form: 'Tablet', frequency: 'Once daily' },
  { name: 'Tramadol', dosage: '50mg', form: 'Tablet', frequency: 'Every 6 hours as needed' },
  { name: 'Duloxetine', dosage: '60mg', form: 'Capsule', frequency: 'Once daily' },
  { name: 'Insulin Glargine', dosage: '100units/mL', form: 'Injection', frequency: 'Once daily' },
  { name: 'Fluticasone', dosage: '50mcg', form: 'Nasal Spray', frequency: 'Twice daily' },
  { name: 'Montelukast', dosage: '10mg', form: 'Tablet', frequency: 'Once daily at bedtime' },
  { name: 'Pantoprazole', dosage: '40mg', form: 'Tablet', frequency: 'Once daily' },
  { name: 'Rosuvastatin', dosage: '20mg', form: 'Tablet', frequency: 'Once daily' },
];

const LAB_TESTS = [
  { name: 'Complete Blood Count (CBC)', code: 'CBC', unit: 'cells/mcL', minNorm: 4500, maxNorm: 11000, minVal: 2000, maxVal: 20000 },
  { name: 'Hemoglobin', code: 'HGB', unit: 'g/dL', minNorm: 12.0, maxNorm: 17.5, minVal: 6.0, maxVal: 22.0 },
  { name: 'Hematocrit', code: 'HCT', unit: '%', minNorm: 36, maxNorm: 52, minVal: 20, maxVal: 60 },
  { name: 'White Blood Cell Count', code: 'WBC', unit: 'K/uL', minNorm: 4.5, maxNorm: 11.0, minVal: 1.0, maxVal: 30.0 },
  { name: 'Platelet Count', code: 'PLT', unit: 'K/uL', minNorm: 150, maxNorm: 400, minVal: 50, maxVal: 600 },
  { name: 'Blood Glucose (Fasting)', code: 'GLU', unit: 'mg/dL', minNorm: 70, maxNorm: 100, minVal: 40, maxVal: 400 },
  { name: 'HbA1c', code: 'A1C', unit: '%', minNorm: 4.0, maxNorm: 5.6, minVal: 3.5, maxVal: 14.0 },
  { name: 'Total Cholesterol', code: 'CHOL', unit: 'mg/dL', minNorm: 125, maxNorm: 200, minVal: 80, maxVal: 400 },
  { name: 'LDL Cholesterol', code: 'LDL', unit: 'mg/dL', minNorm: 0, maxNorm: 100, minVal: 30, maxVal: 300 },
  { name: 'HDL Cholesterol', code: 'HDL', unit: 'mg/dL', minNorm: 40, maxNorm: 60, minVal: 20, maxVal: 100 },
  { name: 'Triglycerides', code: 'TG', unit: 'mg/dL', minNorm: 0, maxNorm: 150, minVal: 30, maxVal: 500 },
  { name: 'Creatinine', code: 'CREAT', unit: 'mg/dL', minNorm: 0.7, maxNorm: 1.3, minVal: 0.3, maxVal: 10.0 },
  { name: 'BUN (Blood Urea Nitrogen)', code: 'BUN', unit: 'mg/dL', minNorm: 7, maxNorm: 20, minVal: 3, maxVal: 80 },
  { name: 'eGFR', code: 'EGFR', unit: 'mL/min', minNorm: 90, maxNorm: 120, minVal: 10, maxVal: 130 },
  { name: 'ALT (SGPT)', code: 'ALT', unit: 'U/L', minNorm: 7, maxNorm: 56, minVal: 3, maxVal: 500 },
  { name: 'AST (SGOT)', code: 'AST', unit: 'U/L', minNorm: 10, maxNorm: 40, minVal: 5, maxVal: 400 },
  { name: 'TSH', code: 'TSH', unit: 'mIU/L', minNorm: 0.4, maxNorm: 4.0, minVal: 0.01, maxVal: 50.0 },
  { name: 'Sodium', code: 'NA', unit: 'mEq/L', minNorm: 136, maxNorm: 145, minVal: 120, maxVal: 160 },
  { name: 'Potassium', code: 'K', unit: 'mEq/L', minNorm: 3.5, maxNorm: 5.0, minVal: 2.5, maxVal: 7.0 },
  { name: 'Calcium', code: 'CA', unit: 'mg/dL', minNorm: 8.5, maxNorm: 10.5, minVal: 6.0, maxVal: 14.0 },
  { name: 'Vitamin D', code: 'VITD', unit: 'ng/mL', minNorm: 30, maxNorm: 100, minVal: 5, maxVal: 150 },
  { name: 'Iron', code: 'FE', unit: 'mcg/dL', minNorm: 60, maxNorm: 170, minVal: 20, maxVal: 300 },
  { name: 'Ferritin', code: 'FERR', unit: 'ng/mL', minNorm: 20, maxNorm: 250, minVal: 5, maxVal: 1000 },
  { name: 'C-Reactive Protein', code: 'CRP', unit: 'mg/L', minNorm: 0, maxNorm: 3.0, minVal: 0, maxVal: 200 },
  { name: 'PSA', code: 'PSA', unit: 'ng/mL', minNorm: 0, maxNorm: 4.0, minVal: 0, maxVal: 50 },
  { name: 'Urinalysis - pH', code: 'UA-PH', unit: '', minNorm: 4.5, maxNorm: 8.0, minVal: 4.0, maxVal: 9.0 },
];

const INSURANCE_PROVIDERS = [
  'UnitedHealthcare', 'Blue Cross Blue Shield', 'Aetna', 'Cigna', 'Humana',
  'Kaiser Permanente', 'Anthem', 'Molina Healthcare', 'Centene Corp', 'WellCare',
  'Magellan Health', 'Tricare', 'Medicare', 'Medicaid', 'Oxford Health Plans',
  'HealthNet', 'AmeriHealth', 'EmblemHealth', 'Highmark', 'CareSource',
];

const PLAN_TYPES = ['HMO', 'PPO', 'EPO', 'POS', 'HDHP', 'Medicare Advantage', 'Medicaid'];

const HOSPITALS = [
  'General Hospital', 'Memorial Medical Center', 'University Hospital', 'St. Mary\'s Hospital',
  'Community Health Center', 'Regional Medical Center', 'Veterans Affairs Hospital',
  'Children\'s Hospital', 'Mercy Hospital', 'Baptist Health', 'Methodist Hospital',
  'Presbyterian Hospital', 'Mount Sinai Hospital', 'Johns Hopkins Hospital',
  'Mayo Clinic', 'Cleveland Clinic', 'Mass General Hospital', 'Cedars-Sinai',
  'Northwestern Memorial', 'Duke University Hospital',
];

const MEDICAL_SPECIALTIES = [
  'Family Medicine', 'Internal Medicine', 'Pediatrics', 'Cardiology',
  'Orthopedics', 'Dermatology', 'Neurology', 'Oncology', 'Psychiatry',
  'Radiology', 'Anesthesiology', 'Emergency Medicine', 'Endocrinology',
  'Gastroenterology', 'Nephrology', 'Pulmonology', 'Rheumatology',
  'Urology', 'Ophthalmology', 'Otolaryngology (ENT)', 'Obstetrics & Gynecology',
  'General Surgery', 'Plastic Surgery', 'Pathology', 'Geriatrics',
];

const PROCEDURES_CPT = [
  { code: '99213', desc: 'Office visit, established patient, low complexity' },
  { code: '99214', desc: 'Office visit, established patient, moderate complexity' },
  { code: '99203', desc: 'Office visit, new patient, low complexity' },
  { code: '99204', desc: 'Office visit, new patient, moderate complexity' },
  { code: '36415', desc: 'Venipuncture (blood draw)' },
  { code: '71046', desc: 'Chest X-ray, 2 views' },
  { code: '93000', desc: 'Electrocardiogram (ECG), 12-lead' },
  { code: '80053', desc: 'Comprehensive metabolic panel' },
  { code: '85025', desc: 'Complete blood count (CBC)' },
  { code: '80061', desc: 'Lipid panel' },
  { code: '87880', desc: 'Strep test, rapid' },
  { code: '81001', desc: 'Urinalysis, automated with microscopy' },
  { code: '90471', desc: 'Immunization administration' },
  { code: '90658', desc: 'Influenza vaccine' },
  { code: '27447', desc: 'Total knee replacement' },
  { code: '27130', desc: 'Total hip replacement' },
  { code: '43239', desc: 'Upper GI endoscopy with biopsy' },
  { code: '45380', desc: 'Colonoscopy with biopsy' },
  { code: '29881', desc: 'Knee arthroscopy' },
  { code: '47562', desc: 'Laparoscopic cholecystectomy' },
];

const VITALS_TEMPLATES = {
  systolicBP: { min: 90, max: 180, normalMin: 110, normalMax: 130 },
  diastolicBP: { min: 50, max: 110, normalMin: 60, normalMax: 85 },
  heartRate: { min: 50, max: 130, normalMin: 60, normalMax: 100 },
  temperature: { min: 96.0, max: 104.0, normalMin: 97.8, normalMax: 99.1 },
  respiratoryRate: { min: 10, max: 30, normalMin: 12, normalMax: 20 },
  oxygenSaturation: { min: 85, max: 100, normalMin: 95, normalMax: 100 },
  weight: { min: 90, max: 350, normalMin: 120, normalMax: 220 },
  height: { min: 58, max: 78, normalMin: 62, normalMax: 74 },
};

const DOCTOR_PREFIXES = ['Dr.'];
const DOCTOR_SUFFIXES = ['MD', 'DO', 'MD, PhD', 'MD, FACC', 'MD, FACS', 'DO, MPH'];

// ======================= TYPES =======================

export interface FakeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  company: string;
  jobTitle: string;
  avatar: string;
  username: string;
  createdAt: string;
  isActive: boolean;
}

export interface FakeAddress {
  id: string;
  street: string;
  apartment: string;
  city: string;
  state: string;
  stateAbbr: string;
  zipCode: string;
  country: string;
  latitude: string;
  longitude: string;
  type: string;
}

export interface FakeTransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  merchant: string;
  amount: string;
  currency: string;
  type: 'credit' | 'debit';
  status: string;
  accountNumber: string;
  referenceId: string;
}

export interface FakePatient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  bloodType: string;
  phone: string;
  email: string;
  emergencyContact: string;
  emergencyPhone: string;
  allergies: string;
  conditions: string;
  insuranceProvider: string;
  policyNumber: string;
  primaryPhysician: string;
  admitDate: string;
  status: string;
}

export interface FakeMedicalRecord {
  id: string;
  mrn: string;
  patientName: string;
  visitDate: string;
  visitType: string;
  provider: string;
  specialty: string;
  facility: string;
  diagnosisCode: string;
  diagnosisDesc: string;
  procedureCode: string;
  procedureDesc: string;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  temperature: string;
  respiratoryRate: number;
  oxygenSat: number;
  notes: string;
  followUp: string;
  status: string;
}

export interface FakePrescription {
  id: string;
  rxNumber: string;
  mrn: string;
  patientName: string;
  medication: string;
  dosage: string;
  form: string;
  frequency: string;
  quantity: number;
  refills: number;
  prescriber: string;
  pharmacy: string;
  prescribedDate: string;
  expirationDate: string;
  daysSupply: number;
  dea: string;
  ndc: string;
  status: string;
}

export interface FakeLabResult {
  id: string;
  labOrderId: string;
  mrn: string;
  patientName: string;
  testName: string;
  testCode: string;
  result: string;
  unit: string;
  referenceRange: string;
  flag: string;
  collectionDate: string;
  resultDate: string;
  orderingProvider: string;
  facility: string;
  specimen: string;
  status: string;
}

export interface FakeInsuranceClaim {
  id: string;
  claimNumber: string;
  mrn: string;
  patientName: string;
  provider: string;
  facility: string;
  serviceDate: string;
  filingDate: string;
  diagnosisCode: string;
  diagnosisDesc: string;
  procedureCode: string;
  procedureDesc: string;
  chargedAmount: string;
  allowedAmount: string;
  paidAmount: string;
  patientResponsibility: string;
  insuranceProvider: string;
  policyNumber: string;
  planType: string;
  claimType: string;
  status: string;
}

export interface FakeHealthcareProvider {
  id: string;
  npi: string;
  prefix: string;
  firstName: string;
  lastName: string;
  credentials: string;
  specialty: string;
  subSpecialty: string;
  facility: string;
  phone: string;
  fax: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  acceptingPatients: boolean;
  yearsExperience: number;
  rating: string;
  status: string;
}

export type DataType =
  | 'users'
  | 'addresses'
  | 'transactions'
  | 'patients'
  | 'medicalRecords'
  | 'prescriptions'
  | 'labResults'
  | 'insuranceClaims'
  | 'healthcareProviders';

export type FakeData =
  | FakeUser
  | FakeAddress
  | FakeTransaction
  | FakePatient
  | FakeMedicalRecord
  | FakePrescription
  | FakeLabResult
  | FakeInsuranceClaim
  | FakeHealthcareProvider;

// ======================= HELPERS =======================

function generateUUID(rng: SeededRandom): string {
  const hex = '0123456789abcdef';
  let uuid = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-';
    } else if (i === 14) {
      uuid += '4';
    } else {
      uuid += hex[rng.nextInt(0, 15)];
    }
  }
  return uuid;
}

function generateDate(rng: SeededRandom, startYear: number, endYear: number): string {
  const year = rng.nextInt(startYear, endYear);
  const month = rng.nextInt(1, 12);
  const day = rng.nextInt(1, 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function generateDateTime(rng: SeededRandom, startYear: number, endYear: number): string {
  const date = generateDate(rng, startYear, endYear);
  const hour = rng.nextInt(0, 23);
  const minute = rng.nextInt(0, 59);
  const second = rng.nextInt(0, 59);
  return `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}Z`;
}

function generatePhone(rng: SeededRandom): string {
  const areaCode = rng.pick(PHONE_AREA_CODES);
  return `(${areaCode}) ${rng.nextInt(200, 999)}-${String(rng.nextInt(0, 9999)).padStart(4, '0')}`;
}

function generateName(rng: SeededRandom): { firstName: string; lastName: string; gender: string } {
  const isMale = rng.next() > 0.5;
  const firstName = isMale ? rng.pick(FIRST_NAMES_MALE) : rng.pick(FIRST_NAMES_FEMALE);
  const lastName = rng.pick(LAST_NAMES);
  return { firstName, lastName, gender: isMale ? 'Male' : 'Female' };
}

function generateDoctorName(rng: SeededRandom): string {
  const { firstName, lastName } = generateName(rng);
  return `${rng.pick(DOCTOR_PREFIXES)} ${firstName} ${lastName}`;
}

function generateMRN(rng: SeededRandom): string {
  return `MRN-${String(rng.nextInt(100000, 999999))}`;
}

function generateNPI(rng: SeededRandom): string {
  let npi = '1';
  for (let i = 0; i < 9; i++) {
    npi += String(rng.nextInt(0, 9));
  }
  return npi;
}

function generateNDC(rng: SeededRandom): string {
  const p1 = String(rng.nextInt(10000, 99999));
  const p2 = String(rng.nextInt(1000, 9999));
  const p3 = String(rng.nextInt(10, 99));
  return `${p1}-${p2}-${p3}`;
}

function generateDEA(rng: SeededRandom): string {
  const prefixes = 'ABFM';
  const prefix = prefixes[rng.nextInt(0, prefixes.length - 1)];
  const letter = String.fromCharCode(rng.nextInt(65, 90));
  let digits = '';
  for (let i = 0; i < 7; i++) digits += String(rng.nextInt(0, 9));
  return `${prefix}${letter}${digits}`;
}

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date(2024, 11, 1);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function generateVitalValue(rng: SeededRandom, config: { min: number; max: number; normalMin: number; normalMax: number }): number {
  // 80% chance of normal value
  if (rng.next() < 0.8) {
    return rng.nextInt(config.normalMin, config.normalMax);
  }
  return rng.nextInt(config.min, config.max);
}

// ======================= GENERATORS =======================

export function generateUsers(count: number, seed: number): FakeUser[] {
  const rng = new SeededRandom(seed);
  const users: FakeUser[] = [];
  for (let i = 0; i < count; i++) {
    const { firstName, lastName, gender } = generateName(rng);
    const emailSep = rng.pick(['.', '_', '']);
    const emailNum = rng.nextInt(1, 999);
    const domain = rng.pick(EMAIL_DOMAINS);
    const email = `${firstName.toLowerCase()}${emailSep}${lastName.toLowerCase()}${emailNum}@${domain}`;
    const phone = generatePhone(rng);
    const dob = generateDate(rng, 1960, 2003);
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${rng.nextInt(1, 9999)}`;
    const avatarId = rng.nextInt(1, 70);
    users.push({
      id: generateUUID(rng),
      firstName, lastName, email, phone,
      dateOfBirth: dob,
      gender,
      company: rng.pick(COMPANY_NAMES),
      jobTitle: rng.pick(JOB_TITLES),
      avatar: `https://i.pravatar.cc/150?img=${avatarId}`,
      username,
      createdAt: generateDateTime(rng, 2020, 2024),
      isActive: rng.next() > 0.2,
    });
  }
  return users;
}

export function generateAddresses(count: number, seed: number): FakeAddress[] {
  const rng = new SeededRandom(seed);
  const addresses: FakeAddress[] = [];
  for (let i = 0; i < count; i++) {
    const streetNum = rng.nextInt(1, 9999);
    const streetName = rng.pick(STREET_NAMES);
    const streetType = rng.pick(STREET_TYPES);
    const state = rng.pick(STATES);
    const hasApt = rng.next() > 0.6;
    const aptTypes = ['Apt', 'Suite', 'Unit', 'Floor', '#'];
    const apartment = hasApt ? `${rng.pick(aptTypes)} ${rng.nextInt(1, 999)}` : '';
    const zipCode = String(rng.nextInt(10000, 99999));
    const lat = (rng.next() * (49.38 - 25.13) + 25.13).toFixed(6);
    const lng = (-(rng.next() * (124.77 - 66.95) + 66.95)).toFixed(6);
    const addressTypes = ['Home', 'Work', 'Billing', 'Shipping', 'Mailing'];
    addresses.push({
      id: generateUUID(rng),
      street: `${streetNum} ${streetName} ${streetType}`,
      apartment,
      city: rng.pick(CITIES),
      state: state.name,
      stateAbbr: state.abbr,
      zipCode,
      country: rng.pick(COUNTRIES),
      latitude: lat,
      longitude: lng,
      type: rng.pick(addressTypes),
    });
  }
  return addresses;
}

export function generateTransactions(count: number, seed: number): FakeTransaction[] {
  const rng = new SeededRandom(seed);
  const transactions: FakeTransaction[] = [];
  const statuses = ['Completed', 'Pending', 'Processing', 'Failed', 'Cancelled'];
  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  for (let i = 0; i < count; i++) {
    const isDebit = rng.next() > 0.3;
    const amount = isDebit
      ? (rng.next() * 5000 + 1).toFixed(2)
      : (rng.next() * 15000 + 100).toFixed(2);
    const accountNum = `****${String(rng.nextInt(1000, 9999))}`;
    const refChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let refId = 'TXN-';
    for (let j = 0; j < 10; j++) refId += refChars[rng.nextInt(0, refChars.length - 1)];
    transactions.push({
      id: generateUUID(rng),
      date: generateDateTime(rng, 2023, 2024),
      description: rng.pick(TRANSACTION_DESCRIPTIONS),
      category: rng.pick(TRANSACTION_CATEGORIES),
      merchant: rng.pick(MERCHANT_NAMES),
      amount,
      currency: rng.pick(currencies),
      type: isDebit ? 'debit' : 'credit',
      status: rng.pick(statuses),
      accountNumber: accountNum,
      referenceId: refId,
    });
  }
  return transactions;
}

export function generatePatients(count: number, seed: number): FakePatient[] {
  const rng = new SeededRandom(seed);
  const patients: FakePatient[] = [];
  const patientStatuses = ['Active', 'Discharged', 'Admitted', 'Observation', 'Transferred', 'Deceased'];
  const statusWeights = [50, 20, 15, 8, 5, 2];

  for (let i = 0; i < count; i++) {
    const { firstName, lastName, gender } = generateName(rng);
    const dob = generateDate(rng, 1935, 2020);
    const age = calculateAge(dob);
    const { firstName: ecFirst, lastName: ecLast } = generateName(rng);
    const numAllergies = rng.nextInt(0, 3);
    const allergyList: string[] = [];
    for (let j = 0; j < numAllergies; j++) {
      const allergy = rng.pick(ALLERGIES);
      if (!allergyList.includes(allergy)) allergyList.push(allergy);
    }
    const numConditions = rng.nextInt(0, 4);
    const conditionList: string[] = [];
    for (let j = 0; j < numConditions; j++) {
      const cond = rng.pick(MEDICAL_CONDITIONS);
      if (!conditionList.includes(cond)) conditionList.push(cond);
    }

    patients.push({
      id: generateUUID(rng),
      mrn: generateMRN(rng),
      firstName, lastName,
      dateOfBirth: dob,
      age,
      gender,
      bloodType: rng.pickWeighted(BLOOD_TYPES, BLOOD_TYPE_WEIGHTS),
      phone: generatePhone(rng),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rng.nextInt(1, 99)}@${rng.pick(EMAIL_DOMAINS)}`,
      emergencyContact: `${ecFirst} ${ecLast}`,
      emergencyPhone: generatePhone(rng),
      allergies: allergyList.length > 0 ? allergyList.join(', ') : 'NKDA',
      conditions: conditionList.length > 0 ? conditionList.join(', ') : 'None',
      insuranceProvider: rng.pick(INSURANCE_PROVIDERS),
      policyNumber: `POL-${rng.nextInt(100000, 999999)}`,
      primaryPhysician: generateDoctorName(rng),
      admitDate: generateDate(rng, 2023, 2024),
      status: rng.pickWeighted(patientStatuses, statusWeights),
    });
  }
  return patients;
}

export function generateMedicalRecords(count: number, seed: number): FakeMedicalRecord[] {
  const rng = new SeededRandom(seed);
  const records: FakeMedicalRecord[] = [];
  const visitTypes = ['Office Visit', 'Emergency', 'Telehealth', 'Urgent Care', 'Annual Physical', 'Follow-up', 'Consultation', 'Pre-op', 'Post-op'];
  const recordStatuses = ['Completed', 'In Progress', 'Pending Review', 'Amended', 'Signed'];
  const followUps = ['2 weeks', '1 month', '3 months', '6 months', '1 year', 'As needed', 'PRN', 'None'];
  const noteTemplates = [
    'Patient presents with complaints of {symptom}. Physical exam {finding}. Plan: {plan}.',
    'Follow-up for {condition}. Patient reports {response} to current treatment. Will continue current regimen.',
    'Annual wellness visit. All screening tests ordered. Patient counseled on {topic}.',
    'Acute visit for {symptom}. Vitals stable. Prescribed {treatment}. Return if symptoms worsen.',
    'Post-procedure follow-up. Healing well. No signs of infection. Continue current care plan.',
  ];
  const symptoms = ['chest pain', 'shortness of breath', 'headache', 'fatigue', 'joint pain', 'abdominal pain', 'dizziness', 'cough', 'back pain', 'nausea'];
  const findings = ['unremarkable', 'within normal limits', 'notable for tenderness', 'reveals mild swelling', 'shows improved range of motion'];
  const plans = ['continue medications', 'order imaging', 'refer to specialist', 'adjust dosage', 'lifestyle modifications'];
  const conditions = ['hypertension', 'diabetes', 'asthma', 'depression', 'chronic pain', 'hypothyroidism'];
  const responses = ['improvement', 'no change', 'mild improvement', 'good response', 'partial response'];
  const topics = ['diet and exercise', 'medication adherence', 'smoking cessation', 'fall prevention', 'stress management'];
  const treatments = ['antibiotics', 'anti-inflammatory', 'pain management', 'physical therapy', 'rest and observation'];

  for (let i = 0; i < count; i++) {
    const { firstName, lastName } = generateName(rng);
    const diag = rng.pick(DIAGNOSES_ICD10);
    const proc = rng.pick(PROCEDURES_CPT);
    let note = rng.pick(noteTemplates);
    note = note.replace('{symptom}', rng.pick(symptoms))
      .replace('{finding}', rng.pick(findings))
      .replace('{plan}', rng.pick(plans))
      .replace('{condition}', rng.pick(conditions))
      .replace('{response}', rng.pick(responses))
      .replace('{topic}', rng.pick(topics))
      .replace('{treatment}', rng.pick(treatments));

    const temp = generateVitalValue(rng, VITALS_TEMPLATES.temperature);

    records.push({
      id: generateUUID(rng),
      mrn: generateMRN(rng),
      patientName: `${firstName} ${lastName}`,
      visitDate: generateDateTime(rng, 2023, 2024),
      visitType: rng.pick(visitTypes),
      provider: generateDoctorName(rng),
      specialty: rng.pick(MEDICAL_SPECIALTIES),
      facility: rng.pick(HOSPITALS),
      diagnosisCode: diag.code,
      diagnosisDesc: diag.desc,
      procedureCode: proc.code,
      procedureDesc: proc.desc,
      systolicBP: generateVitalValue(rng, VITALS_TEMPLATES.systolicBP),
      diastolicBP: generateVitalValue(rng, VITALS_TEMPLATES.diastolicBP),
      heartRate: generateVitalValue(rng, VITALS_TEMPLATES.heartRate),
      temperature: (temp / 1).toFixed(1),
      respiratoryRate: generateVitalValue(rng, VITALS_TEMPLATES.respiratoryRate),
      oxygenSat: generateVitalValue(rng, VITALS_TEMPLATES.oxygenSaturation),
      notes: note,
      followUp: rng.pick(followUps),
      status: rng.pick(recordStatuses),
    });
  }
  return records;
}

export function generatePrescriptions(count: number, seed: number): FakePrescription[] {
  const rng = new SeededRandom(seed);
  const prescriptions: FakePrescription[] = [];
  const pharmacies = [
    'CVS Pharmacy', 'Walgreens', 'Rite Aid', 'Walmart Pharmacy', 'Costco Pharmacy',
    'Kroger Pharmacy', 'Publix Pharmacy', 'Express Scripts', 'OptumRx', 'Capsule Pharmacy',
    'Amazon Pharmacy', 'Alto Pharmacy', 'Pillpack', 'Target Pharmacy', 'Safeway Pharmacy',
  ];
  const rxStatuses = ['Active', 'Filled', 'Expired', 'Cancelled', 'On Hold', 'Transferred', 'Refill Requested', 'Partial Fill'];

  for (let i = 0; i < count; i++) {
    const { firstName, lastName } = generateName(rng);
    const med = rng.pick(MEDICATIONS);
    const prescribedDate = generateDate(rng, 2023, 2024);
    const daysSupply = rng.pick([7, 14, 30, 60, 90]);

    prescriptions.push({
      id: generateUUID(rng),
      rxNumber: `RX-${rng.nextInt(10000000, 99999999)}`,
      mrn: generateMRN(rng),
      patientName: `${firstName} ${lastName}`,
      medication: med.name,
      dosage: med.dosage,
      form: med.form,
      frequency: med.frequency,
      quantity: rng.pick([7, 14, 28, 30, 60, 90, 120]),
      refills: rng.nextInt(0, 11),
      prescriber: generateDoctorName(rng),
      pharmacy: rng.pick(pharmacies),
      prescribedDate,
      expirationDate: `${parseInt(prescribedDate.slice(0, 4)) + 1}${prescribedDate.slice(4)}`,
      daysSupply,
      dea: generateDEA(rng),
      ndc: generateNDC(rng),
      status: rng.pick(rxStatuses),
    });
  }
  return prescriptions;
}

export function generateLabResults(count: number, seed: number): FakeLabResult[] {
  const rng = new SeededRandom(seed);
  const results: FakeLabResult[] = [];
  const specimens = ['Blood', 'Serum', 'Plasma', 'Urine', 'Whole Blood', 'Capillary Blood'];
  const labStatuses = ['Final', 'Preliminary', 'Corrected', 'Pending', 'Cancelled'];

  for (let i = 0; i < count; i++) {
    const { firstName, lastName } = generateName(rng);
    const test = rng.pick(LAB_TESTS);
    const isAbnormal = rng.next() < 0.25; // 25% abnormal results
    let resultValue: number;
    if (isAbnormal) {
      resultValue = rng.next() < 0.5
        ? rng.nextInt(test.minVal * 10, test.minNorm * 10) / 10
        : rng.nextInt(test.maxNorm * 10, test.maxVal * 10) / 10;
    } else {
      resultValue = rng.nextInt(test.minNorm * 10, test.maxNorm * 10) / 10;
    }
    const flag = resultValue < test.minNorm ? 'Low' : resultValue > test.maxNorm ? 'High' : 'Normal';
    const collDate = generateDateTime(rng, 2023, 2024);

    results.push({
      id: generateUUID(rng),
      labOrderId: `LAB-${rng.nextInt(100000, 999999)}`,
      mrn: generateMRN(rng),
      patientName: `${firstName} ${lastName}`,
      testName: test.name,
      testCode: test.code,
      result: resultValue.toFixed(1),
      unit: test.unit,
      referenceRange: `${test.minNorm} - ${test.maxNorm}`,
      flag,
      collectionDate: collDate,
      resultDate: collDate.replace(/T.*/, `T${String(rng.nextInt(8, 18)).padStart(2, '0')}:${String(rng.nextInt(0, 59)).padStart(2, '0')}:00Z`),
      orderingProvider: generateDoctorName(rng),
      facility: rng.pick(HOSPITALS),
      specimen: rng.pick(specimens),
      status: rng.pick(labStatuses),
    });
  }
  return results;
}

export function generateInsuranceClaims(count: number, seed: number): FakeInsuranceClaim[] {
  const rng = new SeededRandom(seed);
  const claims: FakeInsuranceClaim[] = [];
  const claimTypes = ['Professional', 'Institutional', 'Dental', 'Vision', 'Pharmacy'];
  const claimStatuses = ['Approved', 'Denied', 'Pending', 'In Review', 'Partially Approved', 'Appealed', 'Resubmitted'];

  for (let i = 0; i < count; i++) {
    const { firstName, lastName } = generateName(rng);
    const diag = rng.pick(DIAGNOSES_ICD10);
    const proc = rng.pick(PROCEDURES_CPT);
    const charged = rng.nextInt(50, 50000);
    const allowedPct = rng.next() * 0.4 + 0.5; // 50-90%
    const allowed = Math.round(charged * allowedPct);
    const paidPct = rng.next() * 0.3 + 0.6; // 60-90%
    const paid = Math.round(allowed * paidPct);
    const patientResp = allowed - paid;
    const serviceDate = generateDate(rng, 2023, 2024);

    claims.push({
      id: generateUUID(rng),
      claimNumber: `CLM-${rng.nextInt(10000000, 99999999)}`,
      mrn: generateMRN(rng),
      patientName: `${firstName} ${lastName}`,
      provider: generateDoctorName(rng),
      facility: rng.pick(HOSPITALS),
      serviceDate,
      filingDate: serviceDate, // simplification
      diagnosisCode: diag.code,
      diagnosisDesc: diag.desc,
      procedureCode: proc.code,
      procedureDesc: proc.desc,
      chargedAmount: charged.toFixed(2),
      allowedAmount: allowed.toFixed(2),
      paidAmount: paid.toFixed(2),
      patientResponsibility: patientResp.toFixed(2),
      insuranceProvider: rng.pick(INSURANCE_PROVIDERS),
      policyNumber: `POL-${rng.nextInt(100000, 999999)}`,
      planType: rng.pick(PLAN_TYPES),
      claimType: rng.pick(claimTypes),
      status: rng.pick(claimStatuses),
    });
  }
  return claims;
}

export function generateHealthcareProviders(count: number, seed: number): FakeHealthcareProvider[] {
  const rng = new SeededRandom(seed);
  const providers: FakeHealthcareProvider[] = [];
  const subSpecialties: Record<string, string[]> = {
    'Cardiology': ['Interventional Cardiology', 'Electrophysiology', 'Heart Failure', 'Preventive Cardiology'],
    'Orthopedics': ['Sports Medicine', 'Joint Replacement', 'Spine Surgery', 'Hand Surgery'],
    'Oncology': ['Medical Oncology', 'Radiation Oncology', 'Surgical Oncology', 'Hematology-Oncology'],
    'Neurology': ['Stroke', 'Epilepsy', 'Movement Disorders', 'Neuro-oncology'],
    'Internal Medicine': ['Hospitalist', 'Critical Care', 'Infectious Disease', 'Palliative Care'],
    'General Surgery': ['Trauma Surgery', 'Bariatric Surgery', 'Colorectal Surgery', 'Vascular Surgery'],
  };
  const providerStatuses = ['Active', 'On Leave', 'Inactive', 'Retired', 'Provisional'];

  for (let i = 0; i < count; i++) {
    const { firstName, lastName } = generateName(rng);
    const specialty = rng.pick(MEDICAL_SPECIALTIES);
    const subs = subSpecialties[specialty] || ['General'];
    const state = rng.pick(STATES);

    providers.push({
      id: generateUUID(rng),
      npi: generateNPI(rng),
      prefix: rng.pick(DOCTOR_PREFIXES),
      firstName, lastName,
      credentials: rng.pick(DOCTOR_SUFFIXES),
      specialty,
      subSpecialty: rng.pick(subs),
      facility: rng.pick(HOSPITALS),
      phone: generatePhone(rng),
      fax: generatePhone(rng),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${rng.pick(['hospital.org', 'medicalcenter.com', 'healthsystem.org', 'clinic.com'])}`,
      address: `${rng.nextInt(100, 9999)} ${rng.pick(STREET_NAMES)} ${rng.pick(STREET_TYPES)}`,
      city: rng.pick(CITIES),
      state: state.abbr,
      zipCode: String(rng.nextInt(10000, 99999)),
      acceptingPatients: rng.next() > 0.2,
      yearsExperience: rng.nextInt(1, 40),
      rating: (rng.next() * 2 + 3).toFixed(1), // 3.0 - 5.0
      status: rng.pick(providerStatuses),
    });
  }
  return providers;
}

// ======================= DISPATCH =======================

export function generateData(type: DataType, count: number, seed: number): FakeData[] {
  switch (type) {
    case 'users': return generateUsers(count, seed);
    case 'addresses': return generateAddresses(count, seed);
    case 'transactions': return generateTransactions(count, seed);
    case 'patients': return generatePatients(count, seed);
    case 'medicalRecords': return generateMedicalRecords(count, seed);
    case 'prescriptions': return generatePrescriptions(count, seed);
    case 'labResults': return generateLabResults(count, seed);
    case 'insuranceClaims': return generateInsuranceClaims(count, seed);
    case 'healthcareProviders': return generateHealthcareProviders(count, seed);
  }
}

export function getColumns(type: DataType): { key: string; label: string }[] {
  switch (type) {
    case 'users':
      return [
        { key: 'id', label: 'ID' },
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'dateOfBirth', label: 'DOB' },
        { key: 'gender', label: 'Gender' },
        { key: 'company', label: 'Company' },
        { key: 'jobTitle', label: 'Job Title' },
        { key: 'username', label: 'Username' },
        { key: 'createdAt', label: 'Created At' },
        { key: 'isActive', label: 'Active' },
      ];
    case 'addresses':
      return [
        { key: 'id', label: 'ID' },
        { key: 'street', label: 'Street' },
        { key: 'apartment', label: 'Apt/Suite' },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'stateAbbr', label: 'Code' },
        { key: 'zipCode', label: 'ZIP' },
        { key: 'country', label: 'Country' },
        { key: 'latitude', label: 'Lat' },
        { key: 'longitude', label: 'Lng' },
        { key: 'type', label: 'Type' },
      ];
    case 'transactions':
      return [
        { key: 'id', label: 'ID' },
        { key: 'date', label: 'Date' },
        { key: 'description', label: 'Description' },
        { key: 'category', label: 'Category' },
        { key: 'merchant', label: 'Merchant' },
        { key: 'amount', label: 'Amount' },
        { key: 'currency', label: 'Currency' },
        { key: 'type', label: 'Type' },
        { key: 'status', label: 'Status' },
        { key: 'accountNumber', label: 'Account' },
        { key: 'referenceId', label: 'Ref ID' },
      ];
    case 'patients':
      return [
        { key: 'id', label: 'ID' },
        { key: 'mrn', label: 'MRN' },
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'dateOfBirth', label: 'DOB' },
        { key: 'age', label: 'Age' },
        { key: 'gender', label: 'Gender' },
        { key: 'bloodType', label: 'Blood Type' },
        { key: 'phone', label: 'Phone' },
        { key: 'allergies', label: 'Allergies' },
        { key: 'conditions', label: 'Conditions' },
        { key: 'insuranceProvider', label: 'Insurance' },
        { key: 'primaryPhysician', label: 'Physician' },
        { key: 'status', label: 'Status' },
      ];
    case 'medicalRecords':
      return [
        { key: 'id', label: 'ID' },
        { key: 'mrn', label: 'MRN' },
        { key: 'patientName', label: 'Patient' },
        { key: 'visitDate', label: 'Visit Date' },
        { key: 'visitType', label: 'Visit Type' },
        { key: 'provider', label: 'Provider' },
        { key: 'specialty', label: 'Specialty' },
        { key: 'facility', label: 'Facility' },
        { key: 'diagnosisCode', label: 'ICD-10' },
        { key: 'diagnosisDesc', label: 'Diagnosis' },
        { key: 'systolicBP', label: 'Sys BP' },
        { key: 'diastolicBP', label: 'Dia BP' },
        { key: 'heartRate', label: 'HR' },
        { key: 'temperature', label: 'Temp' },
        { key: 'oxygenSat', label: 'SpO2' },
        { key: 'status', label: 'Status' },
      ];
    case 'prescriptions':
      return [
        { key: 'id', label: 'ID' },
        { key: 'rxNumber', label: 'Rx #' },
        { key: 'mrn', label: 'MRN' },
        { key: 'patientName', label: 'Patient' },
        { key: 'medication', label: 'Medication' },
        { key: 'dosage', label: 'Dosage' },
        { key: 'form', label: 'Form' },
        { key: 'frequency', label: 'Frequency' },
        { key: 'quantity', label: 'Qty' },
        { key: 'refills', label: 'Refills' },
        { key: 'prescriber', label: 'Prescriber' },
        { key: 'pharmacy', label: 'Pharmacy' },
        { key: 'prescribedDate', label: 'Prescribed' },
        { key: 'daysSupply', label: 'Days' },
        { key: 'status', label: 'Status' },
      ];
    case 'labResults':
      return [
        { key: 'id', label: 'ID' },
        { key: 'labOrderId', label: 'Order ID' },
        { key: 'mrn', label: 'MRN' },
        { key: 'patientName', label: 'Patient' },
        { key: 'testName', label: 'Test' },
        { key: 'testCode', label: 'Code' },
        { key: 'result', label: 'Result' },
        { key: 'unit', label: 'Unit' },
        { key: 'referenceRange', label: 'Ref Range' },
        { key: 'flag', label: 'Flag' },
        { key: 'collectionDate', label: 'Collected' },
        { key: 'orderingProvider', label: 'Provider' },
        { key: 'specimen', label: 'Specimen' },
        { key: 'status', label: 'Status' },
      ];
    case 'insuranceClaims':
      return [
        { key: 'id', label: 'ID' },
        { key: 'claimNumber', label: 'Claim #' },
        { key: 'mrn', label: 'MRN' },
        { key: 'patientName', label: 'Patient' },
        { key: 'serviceDate', label: 'Service Date' },
        { key: 'diagnosisCode', label: 'ICD-10' },
        { key: 'procedureCode', label: 'CPT' },
        { key: 'chargedAmount', label: 'Charged' },
        { key: 'allowedAmount', label: 'Allowed' },
        { key: 'paidAmount', label: 'Paid' },
        { key: 'patientResponsibility', label: 'Pt Resp' },
        { key: 'insuranceProvider', label: 'Insurer' },
        { key: 'planType', label: 'Plan' },
        { key: 'claimType', label: 'Type' },
        { key: 'status', label: 'Status' },
      ];
    case 'healthcareProviders':
      return [
        { key: 'id', label: 'ID' },
        { key: 'npi', label: 'NPI' },
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'credentials', label: 'Credentials' },
        { key: 'specialty', label: 'Specialty' },
        { key: 'subSpecialty', label: 'Sub-Specialty' },
        { key: 'facility', label: 'Facility' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'acceptingPatients', label: 'Accepting' },
        { key: 'yearsExperience', label: 'Exp (yrs)' },
        { key: 'rating', label: 'Rating' },
        { key: 'status', label: 'Status' },
      ];
  }
}

// ======================= EXPORT =======================

export function exportToJSON(data: FakeData[]): string {
  return JSON.stringify(data, null, 2);
}

export function exportToCSV(data: FakeData[], type: DataType): string {
  const columns = getColumns(type);
  const header = columns.map(c => c.label).join(',');
  const rows = data.map(row => {
    return columns.map(col => {
      const value = String((row as unknown as Record<string, unknown>)[col.key] ?? '');
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  return [header, ...rows].join('\n');
}

export function exportToSQL(data: FakeData[], type: DataType): string {
  const columns = getColumns(type);
  const tableName = type;
  const colDefs = columns.map(c => c.key).join(', ');
  const lines = data.map(row => {
    const values = columns.map(col => {
      const value = (row as unknown as Record<string, unknown>)[col.key];
      if (typeof value === 'boolean') return value ? '1' : '0';
      if (typeof value === 'number') return String(value);
      return `'${String(value ?? '').replace(/'/g, "''")}'`;
    }).join(', ');
    return `INSERT INTO ${tableName} (${colDefs}) VALUES (${values});`;
  });
  return lines.join('\n');
}

export function exportToHL7FHIR(data: FakeData[], type: DataType): string {
  if (type === 'patients') {
    const patients = data as FakePatient[];
    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      total: patients.length,
      entry: patients.map(p => ({
        resource: {
          resourceType: 'Patient',
          id: p.id,
          identifier: [{ system: 'urn:mrn', value: p.mrn }],
          name: [{ family: p.lastName, given: [p.firstName] }],
          gender: p.gender.toLowerCase(),
          birthDate: p.dateOfBirth,
          telecom: [
            { system: 'phone', value: p.phone },
            { system: 'email', value: p.email },
          ],
          generalPractitioner: [{ display: p.primaryPhysician }],
        },
      })),
    };
    return JSON.stringify(bundle, null, 2);
  }
  if (type === 'labResults') {
    const labs = data as FakeLabResult[];
    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      total: labs.length,
      entry: labs.map(l => ({
        resource: {
          resourceType: 'Observation',
          id: l.id,
          status: l.status.toLowerCase(),
          code: { coding: [{ system: 'urn:lab', code: l.testCode, display: l.testName }] },
          valueQuantity: { value: parseFloat(l.result), unit: l.unit },
          referenceRange: [{ text: l.referenceRange }],
          interpretation: [{ text: l.flag }],
          effectiveDateTime: l.collectionDate,
        },
      })),
    };
    return JSON.stringify(bundle, null, 2);
  }
  // Fallback for other types
  return JSON.stringify(data, null, 2);
}
