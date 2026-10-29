const bcrypt = require('bcryptjs');
const { db } = require('../server/db');

console.log('--- Setting up the 11 Official Departments Requested by User ---');

const DEPARTMENTS_11 = [
  {
    name: 'Department of Engineering',
    code: 'ENG',
    facultyCode: 'FET',
    hodName: 'Dr. K. V. S. Sharma',
    hodEmail: 'hod.engineering@chaitanya.edu.in'
  },
  {
    name: 'Department of Science',
    code: 'SCI',
    facultyCode: 'FS',
    hodName: 'Dr. K. Lakshmi',
    hodEmail: 'hod.science@chaitanya.edu.in'
  },
  {
    name: 'Department of Pharmacy',
    code: 'PHARM',
    facultyCode: 'FPH',
    hodName: 'Dr. V. Rajesh',
    hodEmail: 'hod.pharmacy@chaitanya.edu.in'
  },
  {
    name: 'Department of Allied Health Sciences',
    code: 'AHS',
    facultyCode: 'FAHS',
    hodName: 'Dr. P. Kishore',
    hodEmail: 'hod.ahs@chaitanya.edu.in'
  },
  {
    name: 'Department of Nursing',
    code: 'NURS',
    facultyCode: 'FNU',
    hodName: 'Prof. Mary Thomas',
    hodEmail: 'hod.nursing@chaitanya.edu.in'
  },
  {
    name: 'Department of Agriculture',
    code: 'AGRI',
    facultyCode: 'FAG',
    hodName: 'Dr. C. H. Venkat',
    hodEmail: 'hod.agri@chaitanya.edu.in'
  },
  {
    name: 'Department of Commerce and Business Management',
    code: 'CBM',
    facultyCode: 'FCBM',
    hodName: 'Dr. A. Sridhar',
    hodEmail: 'hod.cbm@chaitanya.edu.in'
  },
  {
    name: 'Department of Computer Applications',
    code: 'MCA',
    facultyCode: 'FET',
    hodName: 'Dr. P. Sreedhar',
    hodEmail: 'hod.ca@chaitanya.edu.in'
  },
  {
    name: 'Department of Clinical Embryology & ART',
    code: 'CEART',
    facultyCode: 'FAHS',
    hodName: 'Dr. K. Swathi',
    hodEmail: 'hod.embryology@chaitanya.edu.in'
  },
  {
    name: 'Department of Humanities & Science',
    code: 'HS',
    facultyCode: 'ACAD',
    hodName: 'Dr. G. Prasad',
    hodEmail: 'hod.hs@chaitanya.edu.in'
  },
  {
    name: 'Department of Research (Ph.D.)',
    code: 'RES-PHD',
    facultyCode: 'RD',
    hodName: 'Dr. T. Satish',
    hodEmail: 'hod.research@chaitanya.edu.in'
  }
];

const faculties = db.prepare('SELECT id, code, name FROM faculties').all();
const facMap = {};
faculties.forEach(f => {
  facMap[f.code] = f.id;
});

// Set all existing departments to is_active = 0 first, so only the 11 official departments will be active
db.prepare('UPDATE departments SET is_active = 0').run();

const insertOrUpdateDept = db.prepare(`
  INSERT INTO departments (name, code, faculty_id, hod_name, is_active)
  VALUES (@name, @code, @faculty_id, @hodName, 1)
  ON CONFLICT(code) DO UPDATE SET
    name = excluded.name,
    faculty_id = excluded.faculty_id,
    hod_name = excluded.hod_name,
    is_active = 1
`);

const passwordHash = bcrypt.hashSync('Hod@123', 10);

DEPARTMENTS_11.forEach((dept, idx) => {
  const facId = facMap[dept.facultyCode] || 1;
  insertOrUpdateDept.run({
    name: dept.name,
    code: dept.code,
    faculty_id: facId,
    hodName: dept.hodName
  });

  const savedDept = db.prepare('SELECT id FROM departments WHERE code = ?').get(dept.code);
  const deptId = savedDept.id;

  // Ensure HOD user exists
  const existingHod = db.prepare('SELECT id FROM users WHERE email = ?').get(dept.hodEmail);
  let hodUserId = existingHod ? existingHod.id : null;

  if (!existingHod) {
    const empId = `CDU-HOD-${String(idx + 1).padStart(3, '0')}`;
    const res = db.prepare(`
      INSERT INTO users (employee_id, email, password_hash, role, full_name, department_id, faculty_id, category)
      VALUES (?, ?, ?, 'hod', ?, ?, ?, 'Teaching')
    `).run(empId, dept.hodEmail, passwordHash, dept.hodName, deptId, facId);
    hodUserId = res.lastInsertRowid;
  } else {
    db.prepare('UPDATE users SET department_id = ?, faculty_id = ? WHERE id = ?').run(deptId, facId, hodUserId);
  }

  // Update department hod_id
  db.prepare('UPDATE departments SET hod_id = ? WHERE id = ?').run(hodUserId, deptId);
  console.log(`[OK] Configured ${dept.name} (Code: ${dept.code}, Faculty ID: ${facId}, HOD: ${dept.hodName})`);
});

// Also keep hod.cse@chaitanya.edu.in as alias for Department of Engineering for smooth continuity
const engDept = db.prepare("SELECT id FROM departments WHERE code = 'ENG'").get();
if (engDept) {
  db.prepare("UPDATE users SET department_id = ? WHERE email = 'hod.cse@chaitanya.edu.in'").run(engDept.id);
  // Also update Dr. Sirikonda Vinod's department to Department of Engineering
  db.prepare("UPDATE users SET department_id = ? WHERE email = 'vinod@gmail.com'").run(engDept.id);
  db.prepare("UPDATE staff_profiles SET department_id = ? WHERE official_email = 'vinod@gmail.com'").run(engDept.id);
  console.log(`[OK] Mapped Dr. Sirikonda Vinod (vinod@gmail.com) and HOD CSE to Department of Engineering (ID: ${engDept.id})`);
}

const activeDepts = db.prepare('SELECT id, name, code, is_active FROM departments WHERE is_active = 1').all();
console.log(`Total Active Departments: ${activeDepts.length}`);
console.log(activeDepts.map(d => d.name));
