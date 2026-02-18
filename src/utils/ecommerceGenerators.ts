import { SeededRandom } from './fakerData';

// ===== ECOMMERCE =====
export function generateOrders(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const statuses = ['Delivered','Shipped','Processing','Pending','Cancelled','Returned'];
  const payments = ['Credit Card','PayPal','Apple Pay','Google Pay','Bank Transfer','Crypto'];
  const items = ['Laptop','Phone','Headphones','Tablet','Monitor','Keyboard','Mouse','Camera','Speaker','Watch'];
  const result = [];
  for (let i = 0; i < count; i++) {
    const qty = rng.nextInt(1, 5);
    const price = +(rng.nextInt(10, 2000) + rng.next()).toFixed(2);
    result.push({
      id: 'ORD-' + String(rng.nextInt(100000,999999)),
      customer: ['James','Mary','John','Linda','Robert','Sarah','Michael','Emily'][rng.nextInt(0,7)] + ' ' + ['Smith','Johnson','Brown','Davis','Wilson','Taylor'][rng.nextInt(0,5)],
      item: rng.pick(items),
      quantity: qty,
      unitPrice: price.toFixed(2),
      total: (price * qty).toFixed(2),
      payment: rng.pick(payments),
      shipping: rng.pick(['Standard','Express','Overnight','Free','Economy']),
      status: rng.pick(statuses),
      orderDate: `${rng.nextInt(2023,2024)}-${String(rng.nextInt(1,12)).padStart(2,'0')}-${String(rng.nextInt(1,28)).padStart(2,'0')}`,
      tracking: 'TRK' + rng.nextInt(1000000000,9999999999),
    });
  }
  return result;
}

export function generateProducts(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const categories = ['Electronics','Clothing','Home','Sports','Books','Beauty','Toys','Garden','Auto','Food'];
  const brands = ['TechCo','StylePro','HomeBase','SportMax','ReadMore','GlowUp','FunTime','GreenThumb','AutoParts','FreshBite'];
  const adjectives = ['Premium','Classic','Ultra','Pro','Elite','Basic','Deluxe','Essential','Advanced','Smart'];
  const nouns = ['Widget','Gadget','Tool','Device','Kit','Set','Pack','Bundle','System','Unit'];
  const result = [];
  for (let i = 0; i < count; i++) {
    const cat = rng.pick(categories);
    const price = +(rng.nextInt(5, 999) + rng.next()).toFixed(2);
    result.push({
      id: 'SKU-' + String(rng.nextInt(10000,99999)),
      name: rng.pick(adjectives) + ' ' + rng.pick(nouns),
      category: cat,
      brand: rng.pick(brands),
      price: price.toFixed(2),
      stock: rng.nextInt(0, 500),
      rating: (rng.next() * 3 + 2).toFixed(1),
      reviews: rng.nextInt(0, 5000),
      weight: (rng.next() * 10 + 0.1).toFixed(1) + ' kg',
      status: rng.pick(['Active','Draft','Discontinued','Out of Stock']),
    });
  }
  return result;
}

export function generateReviews(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const titles = ['Great product','Not worth it','Amazing quality','Decent value','Love it','Could be better','Perfect','Disappointing','Exceeded expectations','Good enough'];
  const products = ['Laptop Pro','Smart Watch','Wireless Earbuds','Tablet X','Camera Z','Speaker Max','Keyboard Elite','Mouse Pro','Monitor HD','Phone Ultra'];
  const result = [];
  for (let i = 0; i < count; i++) {
    const rating = rng.nextInt(1, 5);
    result.push({
      id: 'REV-' + String(rng.nextInt(100000,999999)),
      product: rng.pick(products),
      rating: rating,
      title: rng.pick(titles),
      body: 'This product is ' + ['excellent','good','okay','mediocre','poor'][5-rating] + '. ' + rng.pick(['Would recommend.','Would not buy again.','Great for the price.','Needs improvement.','Exactly as described.']),
      author: ['Alex','Sam','Jordan','Casey','Taylor','Morgan','Riley','Quinn'][rng.nextInt(0,7)],
      verified: rng.next() > 0.3,
      helpful: rng.nextInt(0, 200),
      date: `${rng.nextInt(2023,2024)}-${String(rng.nextInt(1,12)).padStart(2,'0')}-${String(rng.nextInt(1,28)).padStart(2,'0')}`,
    });
  }
  return result;
}

// ===== FINANCE =====
export function generateBankAccounts(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const types = ['Checking','Savings','Money Market','CD','IRA','Business Checking','Business Savings'];
  const banks = ['Chase','Bank of America','Wells Fargo','Citi','Capital One','TD Bank','PNC','US Bank','Truist','Ally'];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push({
      id: 'ACC-' + String(rng.nextInt(100000,999999)),
      holder: ['James','Mary','John','Linda','Robert','Sarah'][rng.nextInt(0,5)] + ' ' + ['Smith','Johnson','Brown','Davis','Wilson'][rng.nextInt(0,4)],
      bank: rng.pick(banks),
      type: rng.pick(types),
      accountNumber: '****' + rng.nextInt(1000,9999),
      routingNumber: String(rng.nextInt(100000000,999999999)),
      balance: (rng.nextInt(100, 500000) + rng.next()).toFixed(2),
      interestRate: (rng.next() * 5).toFixed(2) + '%',
      opened: `${rng.nextInt(2015,2024)}-${String(rng.nextInt(1,12)).padStart(2,'0')}-${String(rng.nextInt(1,28)).padStart(2,'0')}`,
      status: rng.pick(['Active','Closed','Frozen','Dormant']),
      fdic: true,
    });
  }
  return result;
}

export function generateLoanApplications(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const types = ['Mortgage','Auto','Personal','Student','Business','Home Equity','Refinance'];
  const statuses = ['Approved','Denied','Pending','Under Review','Conditionally Approved','Withdrawn'];
  const result = [];
  for (let i = 0; i < count; i++) {
    const amount = rng.nextInt(1000, 500000);
    result.push({
      id: 'LOAN-' + String(rng.nextInt(100000,999999)),
      applicant: ['James','Mary','John','Linda','Robert','Sarah'][rng.nextInt(0,5)] + ' ' + ['Smith','Johnson','Brown','Davis'][rng.nextInt(0,3)],
      type: rng.pick(types),
      amount: amount.toFixed(2),
      term: rng.pick([12,24,36,48,60,120,180,240,360]) + ' months',
      interestRate: (rng.next() * 15 + 2).toFixed(2) + '%',
      creditScore: rng.nextInt(500, 850),
      income: rng.nextInt(30000, 300000).toFixed(2),
      dti: (rng.next() * 50 + 5).toFixed(1) + '%',
      status: rng.pick(statuses),
      applicationDate: `${rng.nextInt(2023,2024)}-${String(rng.nextInt(1,12)).padStart(2,'0')}-${String(rng.nextInt(1,28)).padStart(2,'0')}`,
    });
  }
  return result;
}

export function generateInvestments(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const types = ['Stock','Bond','ETF','Mutual Fund','Crypto','REIT','Options','Futures'];
  const tickers = ['AAPL','MSFT','GOOGL','AMZN','TSLA','META','NVDA','BRK.B','JPM','V','JNJ','WMT','PG','MA','UNH','HD','DIS','BAC','XOM','PFE'];
  const result = [];
  for (let i = 0; i < count; i++) {
    const buyPrice = +(rng.nextInt(10, 500) + rng.next()).toFixed(2);
    const currentPrice = +(buyPrice * (0.5 + rng.next() * 1.5)).toFixed(2);
    const shares = rng.nextInt(1, 500);
    const gain = +((currentPrice - buyPrice) * shares).toFixed(2);
    result.push({
      id: 'INV-' + String(rng.nextInt(100000,999999)),
      type: rng.pick(types),
      ticker: rng.pick(tickers),
      shares: shares,
      buyPrice: buyPrice.toFixed(2),
      currentPrice: currentPrice.toFixed(2),
      gainLoss: gain.toFixed(2),
      gainPercent: (((currentPrice - buyPrice) / buyPrice) * 100).toFixed(1) + '%',
      purchaseDate: `${rng.nextInt(2020,2024)}-${String(rng.nextInt(1,12)).padStart(2,'0')}-${String(rng.nextInt(1,28)).padStart(2,'0')}`,
      status: rng.pick(['Active','Sold','Matured','Expired']),
    });
  }
  return result;
}

// ===== EDUCATION =====
export function generateStudents(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const majors = ['Computer Science','Business','Biology','Engineering','Psychology','English','Mathematics','History','Nursing','Art'];
  const grades = ['Freshman','Sophomore','Junior','Senior','Graduate','K','1st','2nd','3rd','4th','5th'];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push({
      id: 'STU-' + String(rng.nextInt(100000,999999)),
      firstName: ['James','Mary','John','Linda','Robert','Sarah','Michael','Emily'][rng.nextInt(0,7)],
      lastName: ['Smith','Johnson','Brown','Davis','Wilson','Taylor','Anderson','Thomas'][rng.nextInt(0,7)],
      grade: rng.pick(grades),
      gpa: (rng.next() * 3 + 1).toFixed(2),
      major: rng.pick(majors),
      enrollmentStatus: rng.pick(['Full-time','Part-time','Audit','Withdrawn','Graduated']),
      scholarship: rng.next() > 0.7 ? '$' + (rng.nextInt(1,20) * 1000) : 'None',
      extracurriculars: rng.pick(['Sports','Music','Debate','Art Club','Robotics','Volunteer','Theater','None']),
      email: 'student' + rng.nextInt(1000,9999) + '@university.edu',
      enrollDate: `${rng.nextInt(2019,2024)}-${String(rng.nextInt(1,12)).padStart(2,'0')}-01`,
    });
  }
  return result;
}

export function generateCourses(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const depts = ['CS','MATH','ENG','BIO','CHEM','PHYS','HIST','PSYCH','BUS','ART'];
  const names = ['Introduction to','Advanced','Principles of','Survey of','Topics in','Seminar on','Workshop in','Foundations of'];
  const subjects = ['Programming','Calculus','Literature','Genetics','Organic Chemistry','Mechanics','World History','Behavior','Marketing','Design'];
  const days = ['MWF','TR','MW','Online','Sat','MWF/Online'];
  const result = [];
  for (let i = 0; i < count; i++) {
    const capacity = rng.nextInt(20, 200);
    const enrolled = rng.nextInt(5, capacity);
    result.push({
      id: rng.pick(depts) + '-' + rng.nextInt(100,499),
      name: rng.pick(names) + ' ' + rng.pick(subjects),
      department: rng.pick(depts),
      credits: rng.pick([1,2,3,3,3,4,4]),
      professor: 'Dr. ' + ['Smith','Johnson','Brown','Davis','Wilson','Lee','Clark'][rng.nextInt(0,6)],
      capacity: capacity,
      enrolled: enrolled,
      schedule: rng.pick(days) + ' ' + rng.nextInt(8,16) + ':00-' + rng.nextInt(9,17) + ':00',
      room: ['Hall','Building','Center'][rng.nextInt(0,2)] + ' ' + rng.nextInt(100,400),
      status: rng.pick(['Open','Closed','Waitlist','Cancelled']),
    });
  }
  return result;
}

export function generateEnrollments(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const semesters = ['Fall 2023','Spring 2024','Summer 2024','Fall 2024'];
  const letterGrades = ['A','A-','B+','B','B-','C+','C','C-','D','F'];
  const result = [];
  for (let i = 0; i < count; i++) {
    const midterm = rng.nextInt(40, 100);
    const final1 = rng.nextInt(40, 100);
    result.push({
      id: 'ENR-' + String(rng.nextInt(100000,999999)),
      studentId: 'STU-' + String(rng.nextInt(100000,999999)),
      courseId: ['CS','MATH','ENG','BIO'][rng.nextInt(0,3)] + '-' + rng.nextInt(100,499),
      semester: rng.pick(semesters),
      grade: rng.pick(letterGrades),
      attendance: rng.nextInt(60, 100) + '%',
      midtermScore: midterm,
      finalScore: final1,
      average: Math.round((midterm + final1) / 2),
      status: rng.pick(['Enrolled','Completed','Dropped','Incomplete','Withdrawn']),
    });
  }
  return result;
}

// ===== SOCIAL MEDIA =====
export function generateSocialPosts(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const platforms = ['Twitter','Instagram','Facebook','LinkedIn','TikTok','Reddit','YouTube'];
  const contents = ['Just launched my new project!','Beautiful sunset today','Check out this recipe','Working from home vibes','Big announcement coming soon','Grateful for this community','New blog post is live','Weekend adventures','Monday motivation','Learning something new'];
  const tags = ['tech','nature','food','travel','fitness','coding','photography','music','art','business'];
  const result = [];
  for (let i = 0; i < count; i++) {
    const likes = rng.nextInt(0, 50000);
    const shares = rng.nextInt(0, Math.floor(likes / 2));
    const comments = rng.nextInt(0, Math.floor(likes / 3));
    const tagCount = rng.nextInt(1, 4);
    const postTags = [];
    for (let j = 0; j < tagCount; j++) postTags.push('#' + rng.pick(tags));
    result.push({
      id: 'POST-' + String(rng.nextInt(100000,999999)),
      author: '@' + ['techguru','traveler','foodie','creator','dev'][rng.nextInt(0,4)] + rng.nextInt(1,999),
      content: rng.pick(contents),
      hashtags: postTags.join(' '),
      likes: likes,
      shares: shares,
      comments: comments,
      platform: rng.pick(platforms),
      mediaType: rng.pick(['Text','Image','Video','Carousel','Story','Reel']),
      engagement: ((likes + shares + comments) / Math.max(rng.nextInt(100, 10000), 1) * 100).toFixed(1) + '%',
      postedAt: `${rng.nextInt(2023,2024)}-${String(rng.nextInt(1,12)).padStart(2,'0')}-${String(rng.nextInt(1,28)).padStart(2,'0')}`,
    });
  }
  return result;
}

export function generateSocialUsers(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const bios = ['Digital creator','Developer by day','Travel enthusiast','Foodie','Tech lover','Photographer','Writer','Designer','Entrepreneur','Student'];
  const result = [];
  for (let i = 0; i < count; i++) {
    const followers = rng.nextInt(10, 1000000);
    result.push({
      id: 'USR-' + String(rng.nextInt(100000,999999)),
      username: ['alex','sam','jordan','casey','taylor'][rng.nextInt(0,4)] + '_' + rng.nextInt(1,9999),
      handle: '@user' + rng.nextInt(1000,99999),
      bio: rng.pick(bios),
      followers: followers,
      following: rng.nextInt(50, Math.min(followers, 5000)),
      posts: rng.nextInt(10, 5000),
      verified: rng.next() > 0.85,
      engagement: (rng.next() * 10 + 0.5).toFixed(1) + '%',
      joinDate: `${rng.nextInt(2015,2024)}-${String(rng.nextInt(1,12)).padStart(2,'0')}-${String(rng.nextInt(1,28)).padStart(2,'0')}`,
      status: rng.pick(['Active','Suspended','Deactivated','Verified']),
    });
  }
  return result;
}

export function generateNotifications(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const types = ['like','comment','follow','mention','share','reply','tag','message'];
  const senders = ['alex_dev','maria_photo','john_tech','sarah_writes','mike_design','emma_travel'];
  const messages = ['liked your post','commented on your photo','started following you','mentioned you','shared your post','replied to your comment','tagged you','sent you a message'];
  const result = [];
  for (let i = 0; i < count; i++) {
    const typeIdx = rng.nextInt(0, types.length - 1);
    result.push({
      id: 'NOT-' + String(rng.nextInt(100000,999999)),
      type: types[typeIdx],
      sender: rng.pick(senders),
      message: messages[typeIdx],
      read: rng.next() > 0.4,
      priority: rng.pick(['low','medium','high']),
      timestamp: `${rng.nextInt(2024,2024)}-${String(rng.nextInt(1,12)).padStart(2,'0')}-${String(rng.nextInt(1,28)).padStart(2,'0')} ${String(rng.nextInt(0,23)).padStart(2,'0')}:${String(rng.nextInt(0,59)).padStart(2,'0')}`,
      platform: rng.pick(['Twitter','Instagram','Facebook','LinkedIn']),
    });
  }
  return result;
}

// ===== IoT / DEVICES =====
export function generateSensorReadings(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const sensorTypes = ['Temperature','Humidity','Pressure','Motion','Light','CO2','Sound','Vibration'];
  const units: Record<string, string> = { Temperature: '°C', Humidity: '%', Pressure: 'hPa', Motion: 'events', Light: 'lux', CO2: 'ppm', Sound: 'dB', Vibration: 'mm/s' };
  const locations = ['Building A','Building B','Warehouse','Office Floor 1','Office Floor 2','Server Room','Parking','Lobby','Roof','Basement'];
  const result = [];
  for (let i = 0; i < count; i++) {
    const type = rng.pick(sensorTypes);
    const isAnomaly = rng.next() > 0.9;
    let value: number;
    if (type === 'Temperature') value = isAnomaly ? rng.nextInt(-10, 60) : rng.nextInt(18, 28);
    else if (type === 'Humidity') value = rng.nextInt(20, 95);
    else if (type === 'Pressure') value = rng.nextInt(980, 1040);
    else value = rng.nextInt(0, 1000);
    result.push({
      id: 'SNS-' + String(rng.nextInt(100000,999999)),
      sensorId: 'SENSOR-' + rng.nextInt(100,999),
      type: type,
      value: value,
      unit: units[type] || '',
      location: rng.pick(locations),
      battery: rng.nextInt(5, 100) + '%',
      signal: rng.pick(['Excellent','Good','Fair','Poor']),
      anomaly: isAnomaly,
      timestamp: `${rng.nextInt(2024,2024)}-${String(rng.nextInt(1,12)).padStart(2,'0')}-${String(rng.nextInt(1,28)).padStart(2,'0')} ${String(rng.nextInt(0,23)).padStart(2,'0')}:${String(rng.nextInt(0,59)).padStart(2,'0')}`,
    });
  }
  return result;
}

export function generateDevices(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const types = ['Sensor','Gateway','Camera','Thermostat','Lock','Light','Speaker','Display','Router','Controller'];
  const manufacturers = ['Cisco','Honeywell','Siemens','Bosch','Schneider','ABB','GE','Philips','Samsung','Intel'];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push({
      id: 'DEV-' + String(rng.nextInt(100000,999999)),
      name: rng.pick(types) + '-' + rng.nextInt(100,999),
      type: rng.pick(types),
      manufacturer: rng.pick(manufacturers),
      firmware: 'v' + rng.nextInt(1,5) + '.' + rng.nextInt(0,9) + '.' + rng.nextInt(0,20),
      ipAddress: rng.nextInt(10,192) + '.' + rng.nextInt(0,255) + '.' + rng.nextInt(0,255) + '.' + rng.nextInt(1,254),
      macAddress: Array.from({length:6},()=>rng.nextInt(0,255).toString(16).padStart(2,'0').toUpperCase()).join(':'),
      online: rng.next() > 0.15,
      uptime: rng.nextInt(1, 365) + ' days',
      lastSeen: `${rng.nextInt(2024,2024)}-${String(rng.nextInt(1,12)).padStart(2,'0')}-${String(rng.nextInt(1,28)).padStart(2,'0')}`,
      status: rng.pick(['Online','Offline','Maintenance','Error']),
    });
  }
  return result;
}

export function generateAlerts(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const severities = ['Critical','High','Medium','Low','Info'];
  const alertTypes = ['Threshold Exceeded','Connection Lost','Battery Low','Anomaly Detected','Maintenance Due','Firmware Update','Security Alert','Performance Degradation'];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push({
      id: 'ALT-' + String(rng.nextInt(100000,999999)),
      deviceId: 'DEV-' + String(rng.nextInt(100000,999999)),
      severity: rng.pick(severities),
      type: rng.pick(alertTypes),
      message: rng.pick(['Sensor reading exceeded threshold','Device went offline','Battery below 10%','Unusual pattern detected','Scheduled maintenance required','New firmware available','Unauthorized access attempt','Response time degraded']),
      acknowledged: rng.next() > 0.4,
      resolved: rng.next() > 0.5,
      createdAt: `${rng.nextInt(2024,2024)}-${String(rng.nextInt(1,12)).padStart(2,'0')}-${String(rng.nextInt(1,28)).padStart(2,'0')} ${String(rng.nextInt(0,23)).padStart(2,'0')}:${String(rng.nextInt(0,59)).padStart(2,'0')}`,
      resolvedAt: rng.next() > 0.5 ? `${rng.nextInt(2024,2024)}-${String(rng.nextInt(1,12)).padStart(2,'0')}-${String(rng.nextInt(1,28)).padStart(2,'0')}` : '',
    });
  }
  return result;
}

// ===== HR / PEOPLE =====
export function generateEmployees(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const depts = ['Engineering','Marketing','Sales','HR','Finance','Operations','Legal','Support','Product','Design'];
  const titles = ['Manager','Senior Engineer','Analyst','Director','Coordinator','Specialist','Associate','VP','Lead','Intern'];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push({
      id: 'EMP-' + String(rng.nextInt(100000,999999)),
      firstName: ['James','Mary','John','Linda','Robert','Sarah','Michael','Emily'][rng.nextInt(0,7)],
      lastName: ['Smith','Johnson','Brown','Davis','Wilson','Taylor','Anderson','Thomas'][rng.nextInt(0,7)],
      department: rng.pick(depts),
      title: rng.pick(titles),
      salary: (rng.nextInt(35, 250) * 1000).toFixed(2),
      hireDate: `${rng.nextInt(2015,2024)}-${String(rng.nextInt(1,12)).padStart(2,'0')}-${String(rng.nextInt(1,28)).padStart(2,'0')}`,
      manager: ['Jane Smith','Bob Johnson','Alice Brown','Tom Davis'][rng.nextInt(0,3)],
      performance: (rng.next() * 4 + 1).toFixed(1) + '/5',
      remote: rng.pick(['Remote','Office','Hybrid']),
      status: rng.pick(['Active','On Leave','Terminated','Retired']),
    });
  }
  return result;
}

export function generateJobPostings(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const titles = ['Software Engineer','Product Manager','Data Analyst','UX Designer','DevOps Engineer','Marketing Manager','Sales Rep','HR Specialist','Financial Analyst','Support Lead'];
  const depts = ['Engineering','Product','Data','Design','DevOps','Marketing','Sales','HR','Finance','Support'];
  const result = [];
  for (let i = 0; i < count; i++) {
    const minSalary = rng.nextInt(40, 150) * 1000;
    const maxSalary = minSalary + rng.nextInt(20, 80) * 1000;
    result.push({
      id: 'JOB-' + String(rng.nextInt(100000,999999)),
      title: rng.pick(titles),
      department: rng.pick(depts),
      salaryRange: '$' + (minSalary/1000) + 'K-$' + (maxSalary/1000) + 'K',
      experience: rng.pick(['Entry','Mid','Senior','Lead','Director']),
      type: rng.pick(['Full-time','Part-time','Contract','Freelance','Internship']),
      remote: rng.pick(['Remote','On-site','Hybrid']),
      applicants: rng.nextInt(5, 500),
      postedDate: `${rng.nextInt(2024,2024)}-${String(rng.nextInt(1,12)).padStart(2,'0')}-${String(rng.nextInt(1,28)).padStart(2,'0')}`,
      status: rng.pick(['Open','Closed','Filled','On Hold','Draft']),
    });
  }
  return result;
}

export function generateTimesheets(count: number, seed: number) {
  const rng = new SeededRandom(seed);
  const projects = ['Project Alpha','Project Beta','Website Redesign','Mobile App','API Integration','Data Migration','Marketing Campaign','Support Tickets','Training','Admin'];
  const result = [];
  for (let i = 0; i < count; i++) {
    const hours = rng.nextInt(4, 12);
    const overtime = rng.next() > 0.8 ? rng.nextInt(1, 4) : 0;
    const rate = rng.nextInt(25, 150);
    result.push({
      id: 'TS-' + String(rng.nextInt(100000,999999)),
      employeeId: 'EMP-' + String(rng.nextInt(100000,999999)),
      date: `${rng.nextInt(2024,2024)}-${String(rng.nextInt(1,12)).padStart(2,'0')}-${String(rng.nextInt(1,28)).padStart(2,'0')}`,
      hoursWorked: hours,
      overtime: overtime,
      project: rng.pick(projects),
      billable: rng.next() > 0.3,
      hourlyRate: rate.toFixed(2),
      total: ((hours + overtime) * rate).toFixed(2),
      status: rng.pick(['Approved','Pending','Rejected','Draft']),
    });
  }
  return result;
}
