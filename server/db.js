const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'sdrms.db');
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Ensure directories exist
fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    -- Master Data: Faculties
    CREATE TABLE IF NOT EXISTS faculties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      dean_id INTEGER,
      dean_name TEXT,
      dean_title TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Master Data: Departments
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      faculty_id INTEGER REFERENCES faculties(id) ON DELETE SET NULL,
      hod_id INTEGER,
      hod_name TEXT,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Master Data: Designations
    CREATE TABLE IF NOT EXISTS designations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Teaching', 'Non-Teaching', 'Technical', 'Administrative', 'Library', 'Laboratory', 'Other')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('staff', 'hod', 'dean', 'registrar', 'hr', 'vc')),
      full_name TEXT NOT NULL,
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      faculty_id INTEGER REFERENCES faculties(id) ON DELETE SET NULL,
      category TEXT DEFAULT 'Teaching',
      status TEXT NOT NULL DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Staff Profiles Table
    CREATE TABLE IF NOT EXISTS staff_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      employee_id TEXT NOT NULL,
      
      -- Section 1: Basic Personal Info
      full_name TEXT,
      name_regional TEXT,
      previous_name TEXT,
      dob TEXT,
      gender TEXT,
      marital_status TEXT,
      nationality TEXT DEFAULT 'Indian',
      official_email TEXT,
      personal_email TEXT,
      mobile TEXT,
      alternate_contact TEXT,
      current_address TEXT,
      permanent_address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      country TEXT DEFAULT 'India',
      emergency_contact_name TEXT,
      emergency_contact_relationship TEXT,
      emergency_contact_phone TEXT,
      photo_url TEXT,
      
      -- Section 2: Employment and Service Details
      employee_category TEXT,
      faculty_id INTEGER REFERENCES faculties(id) ON DELETE SET NULL,
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      designation TEXT,
      employment_type TEXT,
      appointment_order_no TEXT,
      appointment_order_date TEXT,
      appointment_order_file TEXT,
      joining_date_university TEXT,
      joining_date_present_position TEXT,
      joining_date_present_department TEXT,
      joining_report_file TEXT,
      previous_designation_univ TEXT,
      reporting_officer TEXT,
      campus_location TEXT DEFAULT 'Main Campus, Hyderabad',
      employment_status TEXT DEFAULT 'Active',
      probation_status TEXT DEFAULT 'Confirmed',
      confirmation_date TEXT,
      confirmation_order_file TEXT,
      promotion_orders_file TEXT,
      relieving_order_file TEXT,
      previous_employer TEXT,
      previous_employment_period TEXT,
      relevant_previous_service_years REAL DEFAULT 0,
      calculated_univ_exp_years REAL DEFAULT 0,
      calculated_total_exp_years REAL DEFAULT 0,
      experience_is_verified INTEGER DEFAULT 0,

      -- Section 9: Salary and Payroll Reference Details
      pay_scale TEXT,
      basic_pay TEXT,
      pay_components TEXT,
      payroll_code TEXT,
      salary_bank_name TEXT,
      salary_account_masked TEXT,
      payroll_verification_status TEXT DEFAULT 'Pending',

      -- Section 10: Statutory & Administrative Document Status
      statutory_docs_notes TEXT,

      -- Section 11: Additional Service Information
      leave_deputation_info TEXT,
      promotion_history_notes TEXT,
      transfer_history_notes TEXT,
      disciplinary_info TEXT,
      retirement_info TEXT,
      service_gap_explanation TEXT,

      -- Section 12: Declaration & Final Submission
      declaration_agreed INTEGER DEFAULT 0,
      declaration_date TEXT,
      version_number INTEGER DEFAULT 1,
      submission_ref TEXT,
      workflow_status TEXT DEFAULT 'Draft',
      completion_percentage INTEGER DEFAULT 0,
      last_saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      submitted_at DATETIME,

      -- Clearances and Approvals Hierarchy
      hod_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      dean_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      hod_remarks TEXT,
      hod_reviewed_at DATETIME,
      hod_reviewer_name TEXT,
      dean_remarks TEXT,
      dean_reviewed_at DATETIME,
      dean_reviewer_name TEXT,
      registrar_remarks TEXT,
      registrar_reviewed_at DATETIME,
      registrar_reviewer_name TEXT,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Section 3: Educational Qualifications
    CREATE TABLE IF NOT EXISTS educational_qualifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
      level TEXT NOT NULL,
      degree_title TEXT NOT NULL,
      discipline TEXT,
      institution TEXT NOT NULL,
      college TEXT,
      country TEXT DEFAULT 'India',
      year_of_admission INTEGER,
      year_of_completion INTEGER,
      award_month_year TEXT,
      mode_of_study TEXT DEFAULT 'Full-time',
      registration_no TEXT,
      class_grade TEXT,
      percentage_or_cgpa TEXT,
      max_marks REAL,
      marks_obtained REAL,
      equivalence_details TEXT,
      degree_cert_file TEXT,
      marks_memo_file TEXT,
      supporting_doc_file TEXT,
      verification_status TEXT DEFAULT 'Pending',
      verification_remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Section 4: Professional Qualifications & Eligibility
    CREATE TABLE IF NOT EXISTS professional_qualifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
      qualification_type TEXT NOT NULL,
      title_or_exam TEXT NOT NULL,
      qualifying_authority TEXT,
      registration_no TEXT,
      award_date TEXT,
      validity_date TEXT,
      certificate_file TEXT,
      verification_status TEXT DEFAULT 'Pending',
      verification_remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Section 5: Teaching Experience
    CREATE TABLE IF NOT EXISTS teaching_experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
      institution_name TEXT NOT NULL,
      designation_held TEXT NOT NULL,
      department TEXT,
      institution_type TEXT,
      employment_type TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT,
      is_current INTEGER DEFAULT 0,
      full_or_part_time TEXT DEFAULT 'Full-time',
      subjects_taught TEXT,
      teaching_involvement TEXT,
      experience_cert_file TEXT,
      verification_status TEXT DEFAULT 'Pending',
      verification_remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Section 6: Research Publications
    CREATE TABLE IF NOT EXISTS research_publications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      authors TEXT NOT NULL,
      journal_or_conf_name TEXT NOT NULL,
      publication_year INTEGER,
      volume TEXT,
      issue TEXT,
      page_numbers TEXT,
      doi TEXT,
      indexing TEXT,
      url TEXT,
      evidence_file TEXT,
      verification_status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Section 6: Research Projects
    CREATE TABLE IF NOT EXISTS research_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      funding_agency TEXT NOT NULL,
      role TEXT DEFAULT 'Principal Investigator',
      sanctioned_amount REAL,
      duration TEXT,
      status TEXT DEFAULT 'Ongoing',
      sanction_order_file TEXT,
      completion_cert_file TEXT,
      verification_status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Section 6: Patents
    CREATE TABLE IF NOT EXISTS patents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      application_number TEXT NOT NULL,
      filing_date TEXT,
      grant_number TEXT,
      grant_date TEXT,
      applicant_inventors TEXT,
      status TEXT DEFAULT 'Filed',
      evidence_file TEXT,
      verification_status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Section 6: Other Academic Contributions
    CREATE TABLE IF NOT EXISTS academic_contributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      title_or_activity TEXT NOT NULL,
      details TEXT,
      academic_year TEXT,
      evidence_file TEXT,
      verification_status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Section 7: Professional Development & Training
    CREATE TABLE IF NOT EXISTS training_programmes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
      programme_title TEXT NOT NULL,
      organizing_institution TEXT NOT NULL,
      category TEXT DEFAULT 'FDP',
      start_date TEXT,
      end_date TEXT,
      duration_hours_days TEXT,
      mode TEXT DEFAULT 'Offline',
      certificate_no TEXT,
      certificate_file TEXT,
      verification_status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Section 8: Previous Employment History
    CREATE TABLE IF NOT EXISTS previous_employments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
      employer_name TEXT NOT NULL,
      designation TEXT NOT NULL,
      department TEXT,
      employment_type TEXT,
      date_of_joining TEXT NOT NULL,
      date_of_leaving TEXT,
      reason_for_leaving TEXT,
      experience_cert_file TEXT,
      relieving_letter_file TEXT,
      verification_status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Centralized Document Management
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_uuid TEXT UNIQUE NOT NULL,
      staff_id INTEGER NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
      employee_id TEXT NOT NULL,
      document_category TEXT NOT NULL,
      document_title TEXT NOT NULL,
      issuing_authority TEXT,
      issue_date TEXT,
      expiry_date TEXT,
      original_filename TEXT NOT NULL,
      stored_filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      version_number INTEGER DEFAULT 1,
      uploaded_by INTEGER REFERENCES users(id),
      upload_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      verification_status TEXT DEFAULT 'Pending',
      verified_by INTEGER REFERENCES users(id),
      verification_date DATETIME,
      remarks TEXT,
      replacement_history TEXT
    );

    -- Document Requirements Master Table
    CREATE TABLE IF NOT EXISTS document_requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      is_mandatory TEXT NOT NULL DEFAULT 'Mandatory',
      applies_to_category TEXT DEFAULT 'All',
      description TEXT,
      is_active INTEGER DEFAULT 1
    );

    -- Verification Remarks & Workflow Log
    CREATE TABLE IF NOT EXISTS verification_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      from_status TEXT,
      to_status TEXT,
      reviewer_id INTEGER REFERENCES users(id),
      reviewer_name TEXT,
      reviewer_role TEXT,
      section_affected TEXT,
      remarks TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- System Audit Trail
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_email TEXT,
      role TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- System Settings
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  runMigrations();
}

function runMigrations() {
  try {
    // 1. faculties additions
    const facultyCols = db.prepare('PRAGMA table_info(faculties)').all().map(c => c.name);
    if (!facultyCols.includes('dean_id')) db.exec('ALTER TABLE faculties ADD COLUMN dean_id INTEGER;');
    if (!facultyCols.includes('dean_name')) db.exec('ALTER TABLE faculties ADD COLUMN dean_name TEXT;');
    if (!facultyCols.includes('dean_title')) db.exec('ALTER TABLE faculties ADD COLUMN dean_title TEXT;');

    // 2. departments additions
    const deptCols = db.prepare('PRAGMA table_info(departments)').all().map(c => c.name);
    if (!deptCols.includes('hod_id')) db.exec('ALTER TABLE departments ADD COLUMN hod_id INTEGER;');
    if (!deptCols.includes('hod_name')) db.exec('ALTER TABLE departments ADD COLUMN hod_name TEXT;');

    // 3. staff_profiles additions
    const profileCols = db.prepare('PRAGMA table_info(staff_profiles)').all().map(c => c.name);
    if (!profileCols.includes('hod_id')) db.exec('ALTER TABLE staff_profiles ADD COLUMN hod_id INTEGER;');
    if (!profileCols.includes('dean_id')) db.exec('ALTER TABLE staff_profiles ADD COLUMN dean_id INTEGER;');
    if (!profileCols.includes('hod_remarks')) db.exec('ALTER TABLE staff_profiles ADD COLUMN hod_remarks TEXT;');
    if (!profileCols.includes('hod_reviewed_at')) db.exec('ALTER TABLE staff_profiles ADD COLUMN hod_reviewed_at DATETIME;');
    if (!profileCols.includes('hod_reviewer_name')) db.exec('ALTER TABLE staff_profiles ADD COLUMN hod_reviewer_name TEXT;');
    if (!profileCols.includes('dean_remarks')) db.exec('ALTER TABLE staff_profiles ADD COLUMN dean_remarks TEXT;');
    if (!profileCols.includes('dean_reviewed_at')) db.exec('ALTER TABLE staff_profiles ADD COLUMN dean_reviewed_at DATETIME;');
    if (!profileCols.includes('dean_reviewer_name')) db.exec('ALTER TABLE staff_profiles ADD COLUMN dean_reviewer_name TEXT;');
    if (!profileCols.includes('registrar_remarks')) db.exec('ALTER TABLE staff_profiles ADD COLUMN registrar_remarks TEXT;');
    if (!profileCols.includes('registrar_reviewed_at')) db.exec('ALTER TABLE staff_profiles ADD COLUMN registrar_reviewed_at DATETIME;');
    if (!profileCols.includes('registrar_reviewer_name')) db.exec('ALTER TABLE staff_profiles ADD COLUMN registrar_reviewer_name TEXT;');

    // 4. users check constraint and faculty_id column
    const userSqlRow = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get();
    const userSql = userSqlRow ? userSqlRow.sql : '';
    const userCols = db.prepare('PRAGMA table_info(users)').all().map(c => c.name);

    if (!userSql.includes("'dean'") || !userCols.includes('faculty_id')) {
      db.pragma('foreign_keys = OFF');
      db.exec(`
        CREATE TABLE users_migrated (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          employee_id TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('staff', 'hod', 'dean', 'registrar', 'hr', 'vc')),
          full_name TEXT NOT NULL,
          department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
          faculty_id INTEGER REFERENCES faculties(id) ON DELETE SET NULL,
          category TEXT DEFAULT 'Teaching',
          status TEXT NOT NULL DEFAULT 'Active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO users_migrated (id, employee_id, email, password_hash, role, full_name, department_id, category, status, created_at, updated_at)
        SELECT id, employee_id, email, password_hash, role, full_name, department_id, category, status, created_at, updated_at FROM users;
        DROP TABLE users;
        ALTER TABLE users_migrated RENAME TO users;
      `);
      db.pragma('foreign_keys = ON');
    }

    // 5. staff_profiles check constraint removal migration
    const profileSqlRow = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='staff_profiles'").get();
    const profileSql = profileSqlRow ? profileSqlRow.sql : '';
    if (profileSql && profileSql.includes("workflow_status TEXT DEFAULT 'Draft' CHECK")) {
      db.pragma('foreign_keys = OFF');
      const cols = db.prepare('PRAGMA table_info(staff_profiles)').all().map(c => c.name);
      const colList = cols.map(c => `"${c}"`).join(', ');

      db.exec(`
        CREATE TABLE staff_profiles_migrated (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          employee_id TEXT NOT NULL,
          
          -- Section 1: Basic Personal Info
          full_name TEXT,
          name_regional TEXT,
          previous_name TEXT,
          dob TEXT,
          gender TEXT,
          marital_status TEXT,
          nationality TEXT DEFAULT 'Indian',
          official_email TEXT,
          personal_email TEXT,
          mobile TEXT,
          alternate_contact TEXT,
          current_address TEXT,
          permanent_address TEXT,
          city TEXT,
          state TEXT,
          pincode TEXT,
          country TEXT DEFAULT 'India',
          emergency_contact_name TEXT,
          emergency_contact_relationship TEXT,
          emergency_contact_phone TEXT,
          photo_url TEXT,
          
          -- Section 2: Employment and Service Details
          employee_category TEXT,
          faculty_id INTEGER REFERENCES faculties(id) ON DELETE SET NULL,
          department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
          designation TEXT,
          employment_type TEXT,
          appointment_order_no TEXT,
          appointment_order_date TEXT,
          appointment_order_file TEXT,
          joining_date_university TEXT,
          joining_date_present_position TEXT,
          joining_date_present_department TEXT,
          joining_report_file TEXT,
          previous_designation_univ TEXT,
          reporting_officer TEXT,
          campus_location TEXT DEFAULT 'Main Campus, Hyderabad',
          employment_status TEXT DEFAULT 'Active',
          probation_status TEXT DEFAULT 'Confirmed',
          confirmation_date TEXT,
          confirmation_order_file TEXT,
          promotion_orders_file TEXT,
          relieving_order_file TEXT,
          previous_employer TEXT,
          previous_employment_period TEXT,
          relevant_previous_service_years REAL DEFAULT 0,
          calculated_univ_exp_years REAL DEFAULT 0,
          calculated_total_exp_years REAL DEFAULT 0,
          experience_is_verified INTEGER DEFAULT 0,

          -- Section 9: Salary and Payroll Reference Details
          pay_scale TEXT,
          basic_pay TEXT,
          pay_components TEXT,
          payroll_code TEXT,
          salary_bank_name TEXT,
          salary_account_masked TEXT,
          payroll_verification_status TEXT DEFAULT 'Pending',

          -- Section 10: Statutory & Administrative Document Status
          statutory_docs_notes TEXT,

          -- Section 11: Additional Service Information
          leave_deputation_info TEXT,
          promotion_history_notes TEXT,
          transfer_history_notes TEXT,
          disciplinary_info TEXT,
          retirement_info TEXT,
          service_gap_explanation TEXT,

          -- Section 12: Declaration & Final Submission
          declaration_agreed INTEGER DEFAULT 0,
          declaration_date TEXT,
          version_number INTEGER DEFAULT 1,
          submission_ref TEXT,
          workflow_status TEXT DEFAULT 'Draft',
          completion_percentage INTEGER DEFAULT 0,
          last_saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          submitted_at DATETIME,

          -- Clearances and Approvals Hierarchy
          hod_id INTEGER,
          dean_id INTEGER,
          hod_remarks TEXT,
          hod_reviewed_at DATETIME,
          hod_reviewer_name TEXT,
          dean_remarks TEXT,
          dean_reviewed_at DATETIME,
          dean_reviewer_name TEXT,
          registrar_remarks TEXT,
          registrar_reviewed_at DATETIME,
          registrar_reviewer_name TEXT,
          
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        INSERT INTO staff_profiles_migrated (${colList})
        SELECT ${colList} FROM staff_profiles;

        DROP TABLE staff_profiles;
        ALTER TABLE staff_profiles_migrated RENAME TO staff_profiles;
      `);
      db.pragma('foreign_keys = ON');
    }
  } catch (err) {
    console.error('Migration error:', err.message);
  }
}

initSchema();

module.exports = {
  db,
  initSchema
};
