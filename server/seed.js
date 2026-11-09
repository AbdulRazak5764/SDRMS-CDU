const bcrypt = require('bcryptjs');
const { db } = require('./db');

function seedDatabase() {
  console.log('===============================================================');
  console.log('Chaitanya (Deemed to be University) — SDRMS Program-Wise HOD Seeder');
  console.log('===============================================================');

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
  insertSetting.run('max_doc_size_mb', '10', 'Max document file upload size in MB');
  insertSetting.run('max_photo_size_mb', '5', 'Max staff photo upload size in MB');
  insertSetting.run('allowed_doc_types', 'pdf,jpg,jpeg,png', 'Allowed document file extensions');

  // 2. Faculties / Academic Divisions (Deans)
  const faculties = [
    { name: 'Faculty of Engineering and Technology', code: 'FET', dean_name: 'Dean, Faculty of Engineering & Technology', dean_title: 'Dean, Faculty of Engineering & Technology' },
    { name: 'Faculty of Science', code: 'FS', dean_name: 'Dean, Faculty of Science', dean_title: 'Dean, Science' },
    { name: 'Faculty of Pharmacy', code: 'FPH', dean_name: 'Dean, Faculty of Pharmacy', dean_title: 'Dean, Department of Pharmacy' },
    { name: 'Faculty of Nursing', code: 'FNU', dean_name: 'Dean, Faculty of Nursing', dean_title: 'Dean, Faculty of Nursing' },
    { name: 'Faculty of Agriculture', code: 'FAG', dean_name: 'Dean, Faculty of Agriculture', dean_title: 'Dean, Faculty of Agriculture' },
    { name: 'Faculty of Commerce and Business Management', code: 'FCBM', dean_name: 'Dean, Faculty of Commerce & Business Management', dean_title: 'Dean, Faculty of Commerce & Business Management' },
    { name: 'Academic Affairs', code: 'ACAD', dean_name: 'Dean, Academic Affairs', dean_title: 'Professor & Dean – Academic Affairs' },
    { name: 'University Administration', code: 'ADMIN', dean_name: 'Dean, Administration', dean_title: 'Dean, Administration' },
    { name: 'Research & Development', code: 'RD', dean_name: 'Dean, Research & Development', dean_title: 'Dean, Research & Development' },
    { name: 'Admissions Division', code: 'ADMIS', dean_name: 'Dean, Admissions', dean_title: 'Dean, Admissions' },
    { name: 'Faculty of Science (Division II)', code: 'FS2', dean_name: 'Dean, Faculty of Science (Division II)', dean_title: 'Dean, Faculty of Science' },
    { name: 'Examination Branch', code: 'EXAM', dean_name: 'Controller of Examinations', dean_title: 'Controller of Examinations' },
    { name: 'Faculty of Allied Health Sciences', code: 'FAHS', dean_name: 'Dean, Faculty of Allied Health Sciences', dean_title: 'Dean, Allied Health Sciences' }
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

  const facultyMap = {};
  db.prepare('SELECT id, name, code FROM faculties').all().forEach(f => {
    facultyMap[f.name] = f.id;
    facultyMap[f.code] = f.id;
  });

  // 3. Program-Wise Departments from handwritten list (No personal names)
  const PROGRAM_DEPARTMENTS = [
    // 1. Undergraduate – Engineering
    {
      name: 'Department of Computer Science & Engineering',
      code: 'CSE',
      facultyCode: 'FET',
      hodTitle: 'Head of Department (CSE)',
      hodEmail: 'hod.cse@chaitanya.edu.in',
      hodPassword: 'Hod@CSE2026!',
      programs: 'B.Tech. CSE, B.Tech. CSE (AIML), B.Tech. CSE (Data Science)'
    },
    {
      name: 'Department of Electronics & Communication Engineering',
      code: 'ECE',
      facultyCode: 'FET',
      hodTitle: 'Head of Department (ECE)',
      hodEmail: 'hod.ece@chaitanya.edu.in',
      hodPassword: 'Hod@ECE2026!',
      programs: 'B.Tech. Electronics and Communication Engineering'
    },
    {
      name: 'Department of Electrical & Electronics Engineering',
      code: 'EEE',
      facultyCode: 'FET',
      hodTitle: 'Head of Department (EEE)',
      hodEmail: 'hod.eee@chaitanya.edu.in',
      hodPassword: 'Hod@EEE2026!',
      programs: 'B.Tech. Electrical & Electronics Engineering'
    },
    {
      name: 'Department of Mechanical Engineering',
      code: 'ME',
      facultyCode: 'FET',
      hodTitle: 'Head of Department (Mechanical Engineering)',
      hodEmail: 'hod.me@chaitanya.edu.in',
      hodPassword: 'Hod@ME2026!',
      programs: 'B.Tech. Mechanical Engineering'
    },
    {
      name: 'Department of Civil Engineering',
      code: 'CE',
      facultyCode: 'FET',
      hodTitle: 'Head of Department (Civil Engineering)',
      hodEmail: 'hod.ce@chaitanya.edu.in',
      hodPassword: 'Hod@CE2026!',
      programs: 'B.Tech. Civil Engineering'
    },

    // 2. Undergraduate – Pharmacy
    {
      name: 'Department of Pharmacy',
      code: 'PHARM',
      facultyCode: 'FPH',
      hodTitle: 'Head of Department (Pharmacy)',
      hodEmail: 'hod.pharmacy@chaitanya.edu.in',
      hodPassword: 'Hod@Pharm2026!',
      programs: 'B.Pharmacy, Pharm. D, Pharm. D (PB), M.Pharmacy specializations'
    },

    // 3. Undergraduate – Agriculture
    {
      name: 'Department of Agriculture',
      code: 'AGRI',
      facultyCode: 'FAG',
      hodTitle: 'Head of Department (Agriculture)',
      hodEmail: 'hod.agri@chaitanya.edu.in',
      hodPassword: 'Hod@Agri2026!',
      programs: 'B.Sc. (Hons.) Agriculture, M.Sc. Agronomy'
    },

    // 4. Undergraduate – Nursing
    {
      name: 'Department of Nursing',
      code: 'NURS',
      facultyCode: 'FNU',
      hodTitle: 'Head of Department (Nursing)',
      hodEmail: 'hod.nursing@chaitanya.edu.in',
      hodPassword: 'Hod@Nursing2026!',
      programs: 'B.Sc. Nursing, M.Sc. Nursing'
    },

    // 5. Undergraduate – Physiotherapy
    {
      name: 'Department of Physiotherapy',
      code: 'BPT',
      facultyCode: 'FAHS',
      hodTitle: 'Head of Department (Physiotherapy)',
      hodEmail: 'hod.physio@chaitanya.edu.in',
      hodPassword: 'Hod@Physio2026!',
      programs: 'Bachelor of Physiotherapy (BPT), MPT'
    },

    // 6. Commerce & Business Management
    {
      name: 'Department of Commerce & Business Management',
      code: 'CBM',
      facultyCode: 'FCBM',
      hodTitle: 'Head of Department (Commerce & Business Management)',
      hodEmail: 'hod.cbm@chaitanya.edu.in',
      hodPassword: 'Hod@CBM2026!',
      programs: 'B.Com (Computer Applications), BBA (AICTE Approved), MBA'
    },

    // 7. Science Programs
    {
      name: 'Department of Computer Science & Applications',
      code: 'CS',
      facultyCode: 'FS',
      hodTitle: 'Head of Department (Computer Science & Applications)',
      hodEmail: 'hod.cs@chaitanya.edu.in',
      hodPassword: 'Hod@CS2026!',
      programs: 'B.Sc. Computer Science, BCA (AICTE Approved), MCA'
    },
    {
      name: 'Department of Biotechnology, Microbiology & Chemistry',
      code: 'LIFE-SCI',
      facultyCode: 'FS',
      hodTitle: 'Head of Department (Biotechnology, Microbiology & Chemistry)',
      hodEmail: 'hod.lifesciences@chaitanya.edu.in',
      hodPassword: 'Hod@LifeSci2026!',
      programs: 'B.Sc. Biotechnology, Microbiology & Chemistry'
    },
    {
      name: 'Department of Forensic Science & Chemistry',
      code: 'FORENSIC',
      facultyCode: 'FS',
      hodTitle: 'Head of Department (Forensic Science & Chemistry)',
      hodEmail: 'hod.forensic@chaitanya.edu.in',
      hodPassword: 'Hod@Forensic2026!',
      programs: 'B.Sc. Forensic Science'
    },
    {
      name: 'Department of Nutrition, Dietetics and Food Science',
      code: 'FOOD-SCI',
      facultyCode: 'FS',
      hodTitle: 'Head of Department (Food Science & Nutrition)',
      hodEmail: 'hod.nutrition@chaitanya.edu.in',
      hodPassword: 'Hod@Nutrition2026!',
      programs: 'B.Sc. Nutrition, Dietetics and Food Science, M.Sc. Clinical Nutrition & Dietetics'
    },

    // 8. Allied Health Sciences
    {
      name: 'Department of Radiology & Imaging Technology',
      code: 'RIT',
      facultyCode: 'FAHS',
      hodTitle: 'Head of Department (Radiology & Imaging Technology)',
      hodEmail: 'hod.rit@chaitanya.edu.in',
      hodPassword: 'Hod@RIT2026!',
      programs: 'B.Sc. Radiology & Imaging Technology (RIT)'
    },
    {
      name: 'Department of Anaesthesia & Operation Theatre Technology',
      code: 'AOTT',
      facultyCode: 'FAHS',
      hodTitle: 'Head of Department (Anaesthesia & Operation Theatre Technology)',
      hodEmail: 'hod.aott@chaitanya.edu.in',
      hodPassword: 'Hod@AOTT2026!',
      programs: 'B.Sc. Anaesthesia & Operation Theatre Technology (AOTT)'
    },
    {
      name: 'Department of Cardiovascular Technology',
      code: 'CVT',
      facultyCode: 'FAHS',
      hodTitle: 'Head of Department (Cardiovascular Technology)',
      hodEmail: 'hod.cvt@chaitanya.edu.in',
      hodPassword: 'Hod@CVT2026!',
      programs: 'B.Sc. Cardiovascular Technology (CVT), M.Sc. Echocardiography'
    },
    {
      name: 'Department of Medical Lab Technology',
      code: 'MLT',
      facultyCode: 'FAHS',
      hodTitle: 'Head of Department (Medical Lab Technology)',
      hodEmail: 'hod.mlt@chaitanya.edu.in',
      hodPassword: 'Hod@MLT2026!',
      programs: 'B.Sc. Medical Lab Technology (MLT), M.Sc. MLT'
    },
    {
      name: 'Department of Clinical Embryology & ART',
      code: 'CEART',
      facultyCode: 'FAHS',
      hodTitle: 'Head of Department (Clinical Embryology & ART)',
      hodEmail: 'hod.embryology@chaitanya.edu.in',
      hodPassword: 'Hod@Embryo2026!',
      programs: 'M.Sc. Clinical Embryology & ART'
    },

    // 9. Academic Affairs & Research
    {
      name: 'Department of Humanities & Science',
      code: 'HS',
      facultyCode: 'ACAD',
      hodTitle: 'Head of Department (Humanities & Science)',
      hodEmail: 'hod.hs@chaitanya.edu.in',
      hodPassword: 'Hod@HS2026!',
      programs: 'Humanities & Basic Sciences'
    },
    {
      name: 'Department of Research (Ph.D.)',
      code: 'RES-PHD',
      facultyCode: 'RD',
      hodTitle: 'Head of Department (Research & Ph.D.)',
      hodEmail: 'hod.research@chaitanya.edu.in',
      hodPassword: 'Hod@Research2026!',
      programs: 'Ph.D. Doctoral Research Programs'
    }
  ];

  // Disable old departments so only these official ones are active
  db.prepare('UPDATE departments SET is_active = 0').run();

  // Remove legacy HOD accounts that had personal names
  const legacyHodEmails = [
    'hod.mech@chaitanya.edu.in', 'hod.civil@chaitanya.edu.in', 'hod.chem@chaitanya.edu.in',
    'hod.biotech@chaitanya.edu.in', 'hod.micro@chaitanya.edu.in', 'hod.math@chaitanya.edu.in',
    'hod.science@chaitanya.edu.in', 'hod.ahs@chaitanya.edu.in', 'hod.ca@chaitanya.edu.in'
  ];
  const deleteLegacy = db.prepare(`DELETE FROM users WHERE email IN (${legacyHodEmails.map(() => '?').join(',')})`);
  deleteLegacy.run(...legacyHodEmails);
  db.prepare('DELETE FROM staff_profiles WHERE user_id NOT IN (SELECT id FROM users)').run();

  const insertDept = db.prepare(`
    INSERT INTO departments (name, code, faculty_id, hod_name, is_active)
    VALUES (?, ?, ?, ?, 1)
    ON CONFLICT(code) DO UPDATE SET
      name = excluded.name,
      faculty_id = excluded.faculty_id,
      hod_name = excluded.hod_name,
      is_active = 1
  `);

  PROGRAM_DEPARTMENTS.forEach(d => {
    const facId = facultyMap[d.facultyCode] || null;
    insertDept.run(d.name, d.code, facId, d.hodTitle);
  });

  const deptMap = {};
  db.prepare('SELECT id, name, code FROM departments').all().forEach(d => {
    deptMap[d.code] = d.id;
    deptMap[d.name] = d.id;
  });

  // Helper to upsert admin user
  const upsertAdminUser = (u) => {
    // Check if account was previously permanently deleted by an administrator
    try {
      const isDeleted = db.prepare('SELECT email FROM deleted_accounts WHERE LOWER(email) = LOWER(?) OR (employee_id IS NOT NULL AND employee_id = ?)').get(u.email, u.employee_id);
      if (isDeleted) {
        return null;
      }
    } catch (e) {}

    let existing = db.prepare('SELECT id, employee_id FROM users WHERE email = ? COLLATE NOCASE').get(u.email);
    let userId;
    if (existing) {
      db.prepare(`
        UPDATE users SET
          password_hash = ?,
          role = ?,
          full_name = ?,
          department_id = ?,
          faculty_id = ?,
          category = ?
        WHERE id = ?
      `).run(
        u.password_hash,
        u.role,
        u.full_name,
        u.department_id || null,
        u.faculty_id || null,
        u.category || 'Teaching',
        existing.id
      );
      userId = existing.id;
    } else {
      let empId = u.employee_id;
      const empTaken = db.prepare('SELECT id FROM users WHERE employee_id = ?').get(empId);
      if (empTaken) {
        empId = `${u.employee_id}-${Math.floor(100 + Math.random() * 900)}`;
      }

      const res = db.prepare(`
        INSERT INTO users (employee_id, email, password_hash, role, full_name, department_id, faculty_id, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        empId,
        u.email.toLowerCase().trim(),
        u.password_hash,
        u.role,
        u.full_name,
        u.department_id || null,
        u.faculty_id || null,
        u.category || 'Teaching'
      );
      userId = res.lastInsertRowid;
    }

    return userId;
  };

  // Remove any fake/test staff profiles and non-staff profiles
  console.log('Cleaning fake staff profiles and admin self-profiles...');
  db.prepare(`
    DELETE FROM staff_profiles
    WHERE user_id IN (SELECT id FROM users WHERE role != 'staff')
       OR official_email LIKE '%faculty.test.%'
       OR official_email LIKE '%test.%'
  `).run();

  db.prepare(`
    DELETE FROM users
    WHERE email LIKE '%faculty.test.%'
  `).run();

  // 4. Seed Registrar
  console.log('Seeding Registrar account...');
  const registrarPassword = hashPassword('Registrar@Chaitanya2026');
  upsertAdminUser({
    employee_id: 'CDU-REG-0001',
    email: 'registrar@chaitanya.edu.in',
    password_hash: registrarPassword,
    role: 'registrar',
    full_name: 'Office of the Registrar',
    department_id: null,
    faculty_id: facultyMap['ADMIN'] || null,
    category: 'Administrative',
    designation: 'Registrar & Chief Academic Administrator'
  });

  // 5. Seed 12 Deans
  console.log('Seeding 12 Official University Deans...');
  const deanPassword = hashPassword('Dean@Chaitanya2026');
  const deansList = [
    { employee_id: 'CDU-DEAN-001', name: 'Dean, Faculty of Engineering & Technology', title: 'Dean, Faculty of Engineering & Technology', email: 'dean.engineering@chaitanya.edu.in', facCode: 'FET' },
    { employee_id: 'CDU-DEAN-002', name: 'Dean, Faculty of Science', title: 'Dean, Science', email: 'dean.science@chaitanya.edu.in', facCode: 'FS' },
    { employee_id: 'CDU-DEAN-003', name: 'Dean, Faculty of Pharmacy', title: 'Dean, Department of Pharmacy', email: 'dean.pharmacy@chaitanya.edu.in', facCode: 'FPH' },
    { employee_id: 'CDU-DEAN-004', name: 'Dean, Faculty of Nursing', title: 'Dean, Faculty of Nursing', email: 'dean.nursing@chaitanya.edu.in', facCode: 'FNU' },
    { employee_id: 'CDU-DEAN-005', name: 'Dean, Faculty of Agriculture', title: 'Dean, Faculty of Agriculture', email: 'dean.agri@chaitanya.edu.in', facCode: 'FAG' },
    { employee_id: 'CDU-DEAN-006', name: 'Dean, Faculty of Commerce & Business Management', title: 'Dean, Faculty of Commerce & Business Management', email: 'dean.cbm@chaitanya.edu.in', facCode: 'FCBM' },
    { employee_id: 'CDU-DEAN-007', name: 'Dean, Academic Affairs', title: 'Professor & Dean – Academic Affairs', email: 'dean.academic@chaitanya.edu.in', facCode: 'ACAD' },
    { employee_id: 'CDU-DEAN-008', name: 'Dean, Administration', title: 'Dean, Administration', email: 'dean.admin@chaitanya.edu.in', facCode: 'ADMIN' },
    { employee_id: 'CDU-DEAN-009', name: 'Dean, Research & Development', title: 'Dean, Research & Development', email: 'dean.rd@chaitanya.edu.in', facCode: 'RD' },
    { employee_id: 'CDU-DEAN-010', name: 'Dean, Admissions', title: 'Dean, Admissions', email: 'dean.admissions@chaitanya.edu.in', facCode: 'ADMIS' },
    { employee_id: 'CDU-DEAN-011', name: 'Dean, Faculty of Science (Division II)', title: 'Dean, Faculty of Science', email: 'dean.science2@chaitanya.edu.in', facCode: 'FS2' },
    { employee_id: 'CDU-DEAN-012', name: 'Controller of Examinations', title: 'Controller of Examinations', email: 'coe@chaitanya.edu.in', facCode: 'EXAM' },
    { employee_id: 'CDU-DEAN-013', name: 'Dean, Allied Health Sciences', title: 'Dean, Allied Health Sciences', email: 'dean.ahs@chaitanya.edu.in', facCode: 'FAHS' }
  ];

  deansList.forEach(d => {
    const facId = facultyMap[d.facCode] || null;
    const uid = upsertAdminUser({
      employee_id: d.employee_id,
      email: d.email,
      password_hash: deanPassword,
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

  // 6. Seed All Program-Wise HODs with Unique Emails & Passwords (NO personal names)
  console.log(`Seeding all ${PROGRAM_DEPARTMENTS.length} Program-Wise HODs...`);
  PROGRAM_DEPARTMENTS.forEach(d => {
    const deptId = deptMap[d.code] || null;
    const facId = facultyMap[d.facultyCode] || null;
    const hashedPassword = hashPassword(d.hodPassword);

    const uid = upsertAdminUser({
      employee_id: `CDU-HOD-${d.code}`,
      email: d.hodEmail,
      password_hash: hashedPassword,
      role: 'hod',
      full_name: d.hodTitle, // e.g. "Head of Department (CSE)"
      department_id: deptId,
      faculty_id: facId,
      category: 'Teaching',
      designation: d.hodTitle
    });

    if (deptId) {
      db.prepare('UPDATE departments SET hod_id = ?, hod_name = ? WHERE id = ?').run(uid, d.hodTitle, deptId);
    }
  });

  // Aliases for compatibility
  // Engineering general alias
  const cseDeptId = deptMap['CSE'];
  const cseFacId = facultyMap['FET'];
  upsertAdminUser({
    employee_id: 'CDU-HOD-ENG-ALIAS',
    email: 'hod.engineering@chaitanya.edu.in',
    password_hash: hashPassword('Hod@CSE2026!'),
    role: 'hod',
    full_name: 'Head of Department (Engineering)',
    department_id: cseDeptId,
    faculty_id: cseFacId,
    category: 'Teaching',
    designation: 'Head of Department (Engineering)'
  });

  // 7. Seed VC & HR
  upsertAdminUser({
    employee_id: 'CDU-VC-0001',
    email: 'vc@chaitanya.edu.in',
    password_hash: hashPassword('Vc@Chaitanya2026'),
    role: 'vc',
    full_name: 'Hon’ble Vice-Chancellor',
    faculty_id: facultyMap['ADMIN'] || null,
    category: 'Teaching',
    designation: 'Hon’ble Vice-Chancellor'
  });

  upsertAdminUser({
    employee_id: 'CDU-HR-0001',
    email: 'hr.establishment@chaitanya.edu.in',
    password_hash: hashPassword('Hr@Chaitanya2026'),
    role: 'hr',
    full_name: 'Assistant Registrar (HR & Establishment)',
    faculty_id: facultyMap['ADMIN'] || null,
    category: 'Administrative',
    designation: 'Assistant Registrar (Establishment & HR)'
  });

  // 8. Seed Official Faculty Member: Dr. Shaik Abdul Razak
  console.log('Seeding official faculty member: Dr. Shaik Abdul Razak...');
  const cseHodId = db.prepare('SELECT hod_id FROM departments WHERE id = ?').get(cseDeptId)?.hod_id || null;
  const cseDeanId = db.prepare('SELECT dean_id FROM faculties WHERE id = ?').get(cseFacId)?.dean_id || null;

  const razakUserId = upsertAdminUser({
    employee_id: '223208033',
    email: '23cse2035@chaitanya.edu.in',
    password_hash: hashPassword('Razak@2026!'),
    role: 'staff',
    full_name: 'Dr. Shaik Abdul Razak',
    department_id: cseDeptId,
    faculty_id: cseFacId,
    category: 'Teaching',
    designation: 'Assistant Professor'
  });

  // Ensure staff_profile exists for Dr. Razak
  const existingRazakProfile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ? OR employee_id = ?').get(razakUserId, '223208033');
  if (!existingRazakProfile) {
    db.prepare(`
      INSERT INTO staff_profiles (
        user_id, employee_id, salutation, full_name, official_email,
        department_id, faculty_id, hod_id, dean_id, designation,
        employee_category, employment_type, campus_location,
        reporting_officer, nationality, country, workflow_status,
        completion_percentage, joining_date_university, joining_date_present_position,
        joining_date_present_department, pay_scale, basic_pay
      ) VALUES (
        ?, '223208033', 'Dr.', 'Dr. Shaik Abdul Razak', '23cse2035@chaitanya.edu.in',
        ?, ?, ?, ?, 'Assistant Professor',
        'Teaching', 'Permanent / Regular', 'Main Campus, Hyderabad',
        'Head of Department (CSE)', 'Indian', 'India', 'Draft',
        50, '2021-07-01', '2021-07-01',
        '2021-07-01', 'Academic Level 10 (UGC 7th CPC)', '57700'
      )
    `).run(razakUserId, cseDeptId, cseFacId, cseHodId, cseDeanId);
  } else {
    db.prepare(`
      UPDATE staff_profiles SET
        user_id = ?, employee_id = '223208033', salutation = 'Dr.', full_name = 'Dr. Shaik Abdul Razak',
        official_email = '23cse2035@chaitanya.edu.in', department_id = ?, faculty_id = ?,
        hod_id = ?, dean_id = ?, designation = 'Assistant Professor', employee_category = 'Teaching'
      WHERE id = ?
    `).run(razakUserId, cseDeptId, cseFacId, cseHodId, cseDeanId, existingRazakProfile.id);
  }

  // Check if demo faculty Dr. Ramesh Kumar Reddy was permanently deleted
  let isRameshDeleted = false;
  try {
    isRameshDeleted = !!db.prepare('SELECT email FROM deleted_accounts WHERE LOWER(email) = ? OR employee_id = ?').get('staff.teaching@chaitanya.edu.in', 'CDU-FAC-2001');
  } catch (e) {}

  if (!isRameshDeleted) {
    // Also seed demo faculty: Dr. Ramesh Kumar Reddy
    const rameshUserId = upsertAdminUser({
      employee_id: 'CDU-FAC-2001',
      email: 'staff.teaching@chaitanya.edu.in',
      password_hash: hashPassword('Staff@2026!'),
      role: 'staff',
      full_name: 'Dr. Ramesh Kumar Reddy',
      department_id: cseDeptId,
      faculty_id: cseFacId,
      category: 'Teaching',
      designation: 'Assistant Professor'
    });

    if (rameshUserId) {
      const existingRameshProfile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ? OR employee_id = ?').get(rameshUserId, 'CDU-FAC-2001');
      if (!existingRameshProfile) {
        db.prepare(`
          INSERT INTO staff_profiles (
            user_id, employee_id, salutation, full_name, official_email,
            department_id, faculty_id, hod_id, dean_id, designation,
            employee_category, employment_type, campus_location,
            reporting_officer, nationality, country, workflow_status,
            completion_percentage
          ) VALUES (
            ?, 'CDU-FAC-2001', 'Dr.', 'Dr. Ramesh Kumar Reddy', 'staff.teaching@chaitanya.edu.in',
            ?, ?, ?, ?, 'Assistant Professor',
            'Teaching', 'Permanent / Regular', 'Main Campus, Hyderabad',
            'Head of Department (CSE)', 'Indian', 'India', 'Draft',
            50
          )
        `).run(rameshUserId, cseDeptId, cseFacId, cseHodId, cseDeanId);
      }
    }
  }

  console.log('✅ All Program-Wise HODs and Faculty Seeded Successfully!');
  console.log('===============================================================');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
