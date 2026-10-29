const bcrypt = require('bcryptjs');
const { db } = require('./db');

function seedDatabase() {
  console.log('Seeding Chaitanya (Deemed to be University) SDRMS database...');

  const hashPassword = (pw) => bcrypt.hashSync(pw, 10);

  // 1. Settings
  const insertSetting = db.prepare(`
    INSERT OR REPLACE INTO system_settings (key, value, description)
    VALUES (?, ?, ?)
  `);

  insertSetting.run('university_name', 'Chaitanya (Deemed to be University)', 'Official university name');
  insertSetting.run('university_location', 'Hyderabad, Telangana, India', 'Location of administrative headquarters');
  insertSetting.run('university_status', 'Deemed to be University', 'Accreditation status');
  insertSetting.run('logo_url', '/assets/chaitanya-crest.jpg', 'Custom institutional logo URL');
  insertSetting.run('max_doc_size_mb', '5', 'Max document file upload size in MB');
  insertSetting.run('max_photo_size_mb', '2', 'Max staff photo upload size in MB');
  insertSetting.run('allowed_doc_types', 'pdf,jpg,jpeg,png', 'Allowed document file extensions');

  // 2. Faculties / Administrative Deanships (12 Deans as requested by user)
  const faculties = [
    { name: 'Faculty of Engineering and Technology', code: 'FET', dean_name: 'Dr. Jagadeeshwar Madiraju', dean_title: 'Dean, Faculty of Engineering & Technology' },
    { name: 'Faculty of Science', code: 'FS', dean_name: 'Prof. S. Kavitha', dean_title: 'Dean, Science' },
    { name: 'Faculty of Pharmacy', code: 'FPH', dean_name: 'Dr. G. Kumaraswamy', dean_title: 'Dean, Department of Pharmacy' },
    { name: 'Faculty of Nursing', code: 'FNU', dean_name: 'Dr. Sunitha Chinnam', dean_title: 'Dean, Faculty of Nursing' },
    { name: 'Faculty of Agriculture', code: 'FAG', dean_name: 'Dr. D. Dev Kumar', dean_title: 'Dean, Faculty of Agriculture' },
    { name: 'Faculty of Commerce and Business Management', code: 'FCBM', dean_name: 'Dr. Pagadala Suganda Devi', dean_title: 'Dean, Faculty of Commerce & Business Management' },
    { name: 'Academic Affairs', code: 'ACAD', dean_name: 'Prof. B. S. Anuradha', dean_title: 'Professor & Dean – Academic Affairs' },
    { name: 'University Administration', code: 'ADMIN', dean_name: 'Dr. Amireddy Raju', dean_title: 'Dean, Administration' },
    { name: 'Research & Development', code: 'RD', dean_name: 'Dr. T Christopher Reuben', dean_title: 'Dean, Research & Development' },
    { name: 'Admissions Division', code: 'ADMIS', dean_name: 'Dr. Ch. Prathyusha Reddy', dean_title: 'Dean, Admissions' },
    { name: 'Faculty of Science (Division II)', code: 'FS2', dean_name: 'Dr. B. Sreelatha', dean_title: 'Dean, Faculty of Science' },
    { name: 'Examination Branch', code: 'EXAM', dean_name: 'Prof. B. Rajender Reddy', dean_title: 'Controller of Examinations' },
    { name: 'Faculty of Allied Health Sciences', code: 'FAHS', dean_name: 'Dr. S. Ramesh', dean_title: 'Dean, Allied Health Sciences' }
  ];

  const insertFaculty = db.prepare(`
    INSERT INTO faculties (name, code, dean_name, dean_title)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(code) DO UPDATE SET
      name = excluded.name,
      dean_name = excluded.dean_name,
      dean_title = excluded.dean_title
  `);
  faculties.forEach(f => insertFaculty.run(f.name, f.code, f.dean_name, f.dean_title));

  // Map faculties
  const facultyMap = {};
  db.prepare('SELECT id, name, code FROM faculties').all().forEach(f => {
    facultyMap[f.name] = f.id;
    facultyMap[f.code] = f.id;
  });

  // 3. Departments mapped to Faculties (11 Official Departments as requested)
  const departments = [
    { name: 'Department of Engineering', code: 'ENG', faculty: 'Faculty of Engineering and Technology', hod: 'Dr. K. V. S. Sharma' },
    { name: 'Department of Science', code: 'SCI', faculty: 'Faculty of Science', hod: 'Dr. K. Lakshmi' },
    { name: 'Department of Pharmacy', code: 'PHARM', faculty: 'Faculty of Pharmacy', hod: 'Dr. V. Rajesh' },
    { name: 'Department of Allied Health Sciences', code: 'AHS', faculty: 'Faculty of Allied Health Sciences', hod: 'Dr. P. Kishore' },
    { name: 'Department of Nursing', code: 'NURS', faculty: 'Faculty of Nursing', hod: 'Prof. Mary Thomas' },
    { name: 'Department of Agriculture', code: 'AGRI', faculty: 'Faculty of Agriculture', hod: 'Dr. C. H. Venkat' },
    { name: 'Department of Commerce and Business Management', code: 'CBM', faculty: 'Faculty of Commerce and Business Management', hod: 'Dr. A. Sridhar' },
    { name: 'Department of Computer Applications', code: 'MCA', faculty: 'Faculty of Engineering and Technology', hod: 'Dr. P. Sreedhar' },
    { name: 'Department of Clinical Embryology & ART', code: 'CEART', faculty: 'Faculty of Allied Health Sciences', hod: 'Dr. K. Swathi' },
    { name: 'Department of Humanities & Science', code: 'HS', faculty: 'Academic Affairs', hod: 'Dr. G. Prasad' },
    { name: 'Department of Research (Ph.D.)', code: 'RES-PHD', faculty: 'Research & Development', hod: 'Dr. T. Satish' }
  ];

  const insertDept = db.prepare(`
    INSERT INTO departments (name, code, faculty_id, hod_name)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(code) DO UPDATE SET
      name = excluded.name,
      faculty_id = excluded.faculty_id,
      hod_name = excluded.hod_name
  `);
  departments.forEach(d => {
    const facId = d.faculty ? facultyMap[d.faculty] : null;
    insertDept.run(d.name, d.code, facId, d.hod);
  });

  const deptMap = {};
  db.prepare('SELECT id, name, code FROM departments').all().forEach(d => {
    deptMap[d.name] = d.id;
    deptMap[d.code] = d.id;
  });

  // 4. Designations
  const designations = [
    { name: 'Professor', category: 'Teaching' },
    { name: 'Associate Professor', category: 'Teaching' },
    { name: 'Assistant Professor', category: 'Teaching' },
    { name: 'Professor of Practice', category: 'Teaching' },
    { name: 'Senior Lecturer', category: 'Teaching' },
    { name: 'Lecturer', category: 'Teaching' },
    { name: 'Head of Department', category: 'Teaching' },
    { name: 'Dean of Faculty', category: 'Teaching' },
    { name: 'Registrar', category: 'Administrative' },
    { name: 'Finance Officer', category: 'Administrative' },
    { name: 'Assistant Registrar', category: 'Administrative' },
    { name: 'Section Officer', category: 'Administrative' },
    { name: 'Senior Assistant', category: 'Administrative' },
    { name: 'Junior Assistant', category: 'Administrative' },
    { name: 'System Administrator', category: 'Technical' },
    { name: 'Senior Lab Assistant', category: 'Technical' },
    { name: 'Laboratory Technician', category: 'Laboratory' },
    { name: 'University Librarian', category: 'Library' },
    { name: 'Assistant Librarian', category: 'Library' }
  ];

  const insertDesig = db.prepare(`
    INSERT OR IGNORE INTO designations (name, category) VALUES (?, ?)
  `);
  designations.forEach(d => insertDesig.run(d.name, d.category));

  // 5. Document Requirements
  const docReqs = [
    { name: 'Recent Passport Photograph', category: 'Identity', is_mandatory: 'Mandatory', applies_to_category: 'All', description: 'Recent color passport size photo (white background)' },
    { name: 'Official Identity Proof (Aadhaar / Passport)', category: 'Identity', is_mandatory: 'Mandatory', applies_to_category: 'All', description: 'Aadhaar Card, Passport, or Driving License' },
    { name: 'Proof of Date of Birth (10th / SSC Memo)', category: 'Identity', is_mandatory: 'Mandatory', applies_to_category: 'All', description: '10th Class SSC memo or Birth Certificate' },
    { name: 'Undergraduate Degree Certificate', category: 'Educational', is_mandatory: 'Mandatory', applies_to_category: 'All', description: 'Original or Provisional UG Degree Certificate' },
    { name: 'Postgraduate Degree Certificate', category: 'Educational', is_mandatory: 'Mandatory', applies_to_category: 'Teaching', description: 'Master degree certificate in relevant discipline' },
    { name: 'Ph.D. Degree / Notification', category: 'Educational', is_mandatory: 'Conditional', applies_to_category: 'Teaching', description: 'Doctoral degree certificate or notification' },
    { name: 'NET / SET / SLET / GATE Certificate', category: 'Professional', is_mandatory: 'Conditional', applies_to_category: 'Teaching', description: 'UGC-NET / CSIR-NET / SLET / GATE' },
    { name: 'Professional Council Registration', category: 'Professional', is_mandatory: 'Conditional', applies_to_category: 'All', description: 'Pharmacy Council, Nursing Council, Bar Council, etc.' },
    { name: 'University Appointment Order', category: 'Employment', is_mandatory: 'Mandatory', applies_to_category: 'All', description: 'Official appointment letter issued by the University' },
    { name: 'Joining Report at Chaitanya University', category: 'Employment', is_mandatory: 'Mandatory', applies_to_category: 'All', description: 'Counter-signed joining report' }
  ];

  const insertDocReq = db.prepare(`
    INSERT OR IGNORE INTO document_requirements (name, category, is_mandatory, applies_to_category, description)
    VALUES (?, ?, ?, ?, ?)
  `);
  docReqs.forEach(dr => insertDocReq.run(dr.name, dr.category, dr.is_mandatory, dr.applies_to_category, dr.description));

  // Helper to upsert a user and ensure profile
  const upsertUser = (user) => {
    let existing = db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get(user.email);
    let userId;
    if (existing) {
      db.prepare(`
        UPDATE users SET
          employee_id = ?,
          role = ?,
          full_name = ?,
          department_id = ?,
          faculty_id = ?,
          category = ?
        WHERE id = ?
      `).run(
        user.employee_id,
        user.role,
        user.full_name,
        user.department_id || null,
        user.faculty_id || null,
        user.category || 'Teaching',
        existing.id
      );
      userId = existing.id;
    } else {
      const res = db.prepare(`
        INSERT INTO users (employee_id, email, password_hash, role, full_name, department_id, faculty_id, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        user.employee_id,
        user.email.toLowerCase(),
        user.password_hash,
        user.role,
        user.full_name,
        user.department_id || null,
        user.faculty_id || null,
        user.category || 'Teaching'
      );
      userId = res.lastInsertRowid;
    }

    // Ensure staff_profiles row exists
    const existingProfile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(userId);
    if (!existingProfile) {
      db.prepare(`
        INSERT INTO staff_profiles (
          user_id, employee_id, full_name, official_email, department_id, faculty_id,
          designation, employee_category, workflow_status, completion_percentage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 65)
      `).run(
        userId,
        user.employee_id,
        user.full_name,
        user.email.toLowerCase(),
        user.department_id || null,
        user.faculty_id || null,
        user.designation || (user.role === 'dean' ? 'Dean of Faculty' : user.role === 'hod' ? 'Head of Department' : 'Professor'),
        user.category || 'Teaching',
        user.role === 'staff' ? 'Draft' : 'Approved'
      );
    } else {
      db.prepare(`
        UPDATE staff_profiles SET
          full_name = COALESCE(full_name, ?),
          department_id = COALESCE(department_id, ?),
          faculty_id = COALESCE(faculty_id, ?)
        WHERE user_id = ?
      `).run(user.full_name, user.department_id || null, user.faculty_id || null, userId);
    }

    return userId;
  };

  // 6. SEED REGISTRAR (Prof. M. Ravinder)
  const registrarId = upsertUser({
    employee_id: 'CDU-REG-0001',
    email: 'registrar@chaitanya.edu.in',
    password_hash: hashPassword('Registrar@123'),
    role: 'registrar',
    full_name: 'Prof. M. Ravinder, M.Sc., Ph.D',
    department_id: deptMap['Registrar Office & Administration'],
    faculty_id: facultyMap['University Administration'],
    category: 'Administrative',
    designation: 'Registrar & Chief Academic Administrator'
  });

  // 7. SEED THE 12 OFFICIAL DEANS
  const deansToSeed = [
    {
      employee_id: 'CDU-DEAN-001',
      name: 'Prof. B. S. Anuradha',
      title: 'Professor & Dean – Academic Affairs',
      email: 'dean.academic@chaitanya.edu.in',
      facultyCode: 'ACAD'
    },
    {
      employee_id: 'CDU-DEAN-002',
      name: 'Prof. S. Kavitha',
      title: 'Dean, Science',
      email: 'dean.science@chaitanya.edu.in',
      facultyCode: 'FS'
    },
    {
      employee_id: 'CDU-DEAN-003',
      name: 'Dr. Amireddy Raju',
      title: 'Dean, Administration',
      email: 'dean.admin@chaitanya.edu.in',
      facultyCode: 'ADMIN'
    },
    {
      employee_id: 'CDU-DEAN-004',
      name: 'Dr. T Christopher Reuben',
      title: 'Dean, Research & Development',
      email: 'dean.rd@chaitanya.edu.in',
      facultyCode: 'RD'
    },
    {
      employee_id: 'CDU-DEAN-005',
      name: 'Dr. D. Dev Kumar',
      title: 'Dean, Faculty of Agriculture',
      email: 'dean.agri@chaitanya.edu.in',
      facultyCode: 'FAG'
    },
    {
      employee_id: 'CDU-DEAN-006',
      name: 'Dr. Jagadeeshwar Madiraju',
      title: 'Dean, Faculty of Engineering & Technology',
      email: 'dean.engineering@chaitanya.edu.in',
      facultyCode: 'FET'
    },
    {
      employee_id: 'CDU-DEAN-007',
      name: 'Dr. Ch. Prathyusha Reddy',
      title: 'Dean, Admissions',
      email: 'dean.admissions@chaitanya.edu.in',
      facultyCode: 'ADMIS'
    },
    {
      employee_id: 'CDU-DEAN-008',
      name: 'Dr. Pagadala Suganda Devi',
      title: 'Dean, Faculty of Commerce & Business Management',
      email: 'dean.cbm@chaitanya.edu.in',
      facultyCode: 'FCBM'
    },
    {
      employee_id: 'CDU-DEAN-009',
      name: 'Dr. G. Kumaraswamy',
      title: 'Dean, Department of Pharmacy',
      email: 'dean.pharmacy@chaitanya.edu.in',
      facultyCode: 'FPH'
    },
    {
      employee_id: 'CDU-DEAN-010',
      name: 'Dr. Sunitha Chinnam',
      title: 'Dean, Faculty of Nursing',
      email: 'dean.nursing@chaitanya.edu.in',
      facultyCode: 'FNU'
    },
    {
      employee_id: 'CDU-DEAN-011',
      name: 'Dr. B. Sreelatha',
      title: 'Dean, Faculty of Science',
      email: 'dean.science2@chaitanya.edu.in',
      facultyCode: 'FS2'
    },
    {
      employee_id: 'CDU-DEAN-012',
      name: 'Prof. B. Rajender Reddy',
      title: 'Controller of Examinations',
      email: 'coe@chaitanya.edu.in',
      facultyCode: 'EXAM'
    }
  ];

  deansToSeed.forEach(d => {
    const facId = facultyMap[d.facultyCode] || null;
    const uid = upsertUser({
      employee_id: d.employee_id,
      email: d.email,
      password_hash: hashPassword('Dean@123'),
      role: 'dean',
      full_name: d.name,
      faculty_id: facId,
      category: 'Teaching',
      designation: d.title
    });
    if (facId) {
      db.prepare('UPDATE faculties SET dean_id = ?, dean_name = ?, dean_title = ? WHERE id = ?').run(uid, d.name, d.title, facId);
    }
  });

  // 8. SEED HODs MAPPED TO DEPARTMENTS & FACULTIES
  const hodsToSeed = [
    // Engineering (Dean: Dr. Jagadeeshwar Madiraju)
    {
      employee_id: 'CDU-HOD-1002',
      name: 'Dr. K. V. S. Sharma',
      email: 'hod.cse@chaitanya.edu.in',
      deptCode: 'CSE',
      facCode: 'FET',
      designation: 'Professor & HOD, Computer Science & Engineering'
    },
    {
      employee_id: 'CDU-HOD-1003',
      name: 'Dr. P. Sreedhar',
      email: 'hod.ece@chaitanya.edu.in',
      deptCode: 'ECE',
      facCode: 'FET',
      designation: 'Professor & HOD, Electronics & Communication'
    },
    {
      employee_id: 'CDU-HOD-1004',
      name: 'Dr. N. Ramesh',
      email: 'hod.eee@chaitanya.edu.in',
      deptCode: 'EEE',
      facCode: 'FET',
      designation: 'Professor & HOD, Electrical & Electronics Engineering'
    },
    {
      employee_id: 'CDU-HOD-1005',
      name: 'Dr. M. Ashok',
      email: 'hod.mech@chaitanya.edu.in',
      deptCode: 'MECH',
      facCode: 'FET',
      designation: 'Professor & HOD, Mechanical Engineering'
    },
    {
      employee_id: 'CDU-HOD-1006',
      name: 'Dr. K. Srinivas',
      email: 'hod.civil@chaitanya.edu.in',
      deptCode: 'CIVIL',
      facCode: 'FET',
      designation: 'Professor & HOD, Civil Engineering'
    },

    // Science (Dean: Prof. S. Kavitha)
    {
      employee_id: 'CDU-HOD-2001',
      name: 'Dr. T. Satish',
      email: 'hod.cs@chaitanya.edu.in',
      deptCode: 'CS',
      facCode: 'FS',
      designation: 'Professor & HOD, Computer Science'
    },
    {
      employee_id: 'CDU-HOD-2002',
      name: 'Dr. K. Lakshmi',
      email: 'hod.chem@chaitanya.edu.in',
      deptCode: 'CHEM',
      facCode: 'FS',
      designation: 'Professor & HOD, Chemistry'
    },
    {
      employee_id: 'CDU-HOD-2003',
      name: 'Dr. S. Radhika',
      email: 'hod.biotech@chaitanya.edu.in',
      deptCode: 'BIOTECH',
      facCode: 'FS',
      designation: 'Professor & HOD, Biotechnology'
    },
    {
      employee_id: 'CDU-HOD-2004',
      name: 'Dr. V. Sunitha',
      email: 'hod.micro@chaitanya.edu.in',
      deptCode: 'MICRO',
      facCode: 'FS',
      designation: 'Professor & HOD, Microbiology'
    },
    {
      employee_id: 'CDU-HOD-2005',
      name: 'Dr. G. Prasad',
      email: 'hod.math@chaitanya.edu.in',
      deptCode: 'MATH',
      facCode: 'FS',
      designation: 'Professor & HOD, Mathematics & Statistics'
    },

    // Pharmacy (Dean: Dr. G. Kumaraswamy)
    {
      employee_id: 'CDU-HOD-3001',
      name: 'Dr. V. Rajesh',
      email: 'hod.pharmacy@chaitanya.edu.in',
      deptCode: 'PHARM',
      facCode: 'FPH',
      designation: 'Professor & HOD, Pharmacy'
    },

    // Nursing (Dean: Dr. Sunitha Chinnam)
    {
      employee_id: 'CDU-HOD-4001',
      name: 'Prof. Mary Thomas',
      email: 'hod.nursing@chaitanya.edu.in',
      deptCode: 'NURS',
      facCode: 'FNU',
      designation: 'Professor & HOD, Nursing'
    },

    // Agriculture (Dean: Dr. D. Dev Kumar)
    {
      employee_id: 'CDU-HOD-5001',
      name: 'Dr. C. H. Venkat',
      email: 'hod.agri@chaitanya.edu.in',
      deptCode: 'AGRI',
      facCode: 'FAG',
      designation: 'Professor & HOD, Agriculture'
    },

    // Commerce & Business Management (Dean: Dr. Pagadala Suganda Devi)
    {
      employee_id: 'CDU-HOD-6001',
      name: 'Dr. A. Sridhar',
      email: 'hod.cbm@chaitanya.edu.in',
      deptCode: 'CBM',
      facCode: 'FCBM',
      designation: 'Professor & HOD, Commerce & Business Management'
    }
  ];

  hodsToSeed.forEach(h => {
    const deptId = deptMap[h.deptCode] || null;
    const facId = facultyMap[h.facCode] || null;
    const uid = upsertUser({
      employee_id: h.employee_id,
      email: h.email,
      password_hash: hashPassword('Hod@123'),
      role: 'hod',
      full_name: h.name,
      department_id: deptId,
      faculty_id: facId,
      category: 'Teaching',
      designation: h.designation
    });
    if (deptId) {
      db.prepare('UPDATE departments SET hod_id = ?, hod_name = ? WHERE id = ?').run(uid, h.name, deptId);
    }
  });

  // 9. ENSURE DR. SIRIKONDA VINOD (vinod@gmail.com) HAS KNOWN CREDENTIALS & CORRECT DEPARTMENT
  const vinodUser = db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get('vinod@gmail.com');
  if (vinodUser) {
    db.prepare(`
      UPDATE users SET
        password_hash = ?,
        department_id = ?,
        faculty_id = ?
      WHERE id = ?
    `).run(
      hashPassword('Vinod@123'),
      deptMap['CSE'],
      facultyMap['FET'],
      vinodUser.id
    );

    // Update profile
    const fetDean = db.prepare("SELECT id FROM users WHERE email = 'dean.engineering@chaitanya.edu.in'").get();
    const cseHod = db.prepare("SELECT id FROM users WHERE email = 'hod.cse@chaitanya.edu.in'").get();

    db.prepare(`
      UPDATE staff_profiles SET
        department_id = ?,
        faculty_id = ?,
        hod_id = ?,
        dean_id = ?
      WHERE user_id = ?
    `).run(
      deptMap['CSE'],
      facultyMap['FET'],
      cseHod ? cseHod.id : null,
      fetDean ? fetDean.id : null,
      vinodUser.id
    );
  }

  // 10. Vice-Chancellor & HR
  upsertUser({
    employee_id: 'CDU-VC-0001',
    email: 'vc@chaitanya.edu.in',
    password_hash: hashPassword('Vc@123'),
    role: 'vc',
    full_name: 'Prof. G. Narayana',
    department_id: deptMap['RO-ADMIN'],
    faculty_id: facultyMap['ADMIN'],
    category: 'Teaching',
    designation: 'Hon’ble Vice-Chancellor'
  });

  upsertUser({
    employee_id: 'CDU-HR-0001',
    email: 'hr.establishment@chaitanya.edu.in',
    password_hash: hashPassword('Hr@123'),
    role: 'hr',
    full_name: 'Mr. M. Praveen',
    department_id: deptMap['EST-HR'],
    faculty_id: facultyMap['ADMIN'],
    category: 'Administrative',
    designation: 'Assistant Registrar (Establishment & HR)'
  });

  console.log('Database seeding successfully completed with all 12 Deans, HODs, Registrar, and Faculty!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase
};
