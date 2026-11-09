/**
 * Neon PostgreSQL Cloud Database Connector & Real-Time Sync Engine
 * Chaitanya (Deemed to be University) - SDRMS
 * 
 * Provides real-time synchronization between the application and Neon PostgreSQL:
 * 1. Automatic table creation in Neon Cloud on initialization.
 * 2. Instant sync of newly registered users, credentials, and profiles.
 * 3. Real-time sync for research publications, qualifications, and dossiers.
 * 4. Fallback lookup: Checks Neon directly on login if local cache misses.
 * 5. Automatic bi-directional bootstrap on cold starts (Vercel Serverless ready).
 */

const { Pool } = require('pg');

let pool = null;
let isNeonConnected = false;

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRESQL_URL;

if (connectionString) {
  try {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 10
    });

    pool.on('error', (err) => {
      console.error('[Neon Postgres Error]:', err.message);
    });
  } catch (err) {
    console.error('[Neon Init Error]:', err.message);
  }
}

/**
 * Initializes Neon Cloud Schema
 */
async function initNeonSchema() {
  if (!pool) return false;

  try {
    const client = await pool.connect();
    try {
      await client.query(`
        -- Master Data: Faculties
        CREATE TABLE IF NOT EXISTS faculties (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          code TEXT NOT NULL UNIQUE,
          dean_id INTEGER,
          dean_name TEXT,
          dean_title TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Master Data: Departments
        CREATE TABLE IF NOT EXISTS departments (
          id SERIAL PRIMARY KEY,
          faculty_id INTEGER REFERENCES faculties(id) ON DELETE SET NULL,
          hod_id INTEGER,
          hod_name TEXT,
          name TEXT NOT NULL,
          code TEXT NOT NULL UNIQUE,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Master Data: Designations
        CREATE TABLE IF NOT EXISTS designations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Users Table (Credentials & Roles)
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          employee_id TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL,
          full_name TEXT NOT NULL,
          department_id INTEGER,
          faculty_id INTEGER,
          category TEXT DEFAULT 'Teaching',
          status TEXT NOT NULL DEFAULT 'Active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Staff Profiles Table
        CREATE TABLE IF NOT EXISTS staff_profiles (
          id SERIAL PRIMARY KEY,
          user_id INTEGER UNIQUE NOT NULL,
          employee_id TEXT NOT NULL,
          salutation TEXT,
          full_name TEXT,
          name_regional TEXT,
          previous_name TEXT,
          dob TEXT,
          gender TEXT,
          blood_group TEXT,
          marital_status TEXT,
          nationality TEXT DEFAULT 'Indian',
          social_category TEXT,
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
          employee_category TEXT,
          administrative_unit TEXT,
          faculty_id INTEGER,
          department_id INTEGER,
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
          pay_scale TEXT,
          basic_pay TEXT,
          pay_components TEXT,
          payroll_code TEXT,
          salary_bank_name TEXT,
          salary_account_masked TEXT,
          payroll_verification_status TEXT DEFAULT 'Pending',
          statutory_docs_notes TEXT,
          leave_deputation_info TEXT,
          promotion_history_notes TEXT,
          transfer_history_notes TEXT,
          disciplinary_info TEXT,
          retirement_info TEXT,
          service_gap_explanation TEXT,
          declaration_agreed INTEGER DEFAULT 0,
          declaration_date TEXT,
          version_number INTEGER DEFAULT 1,
          submission_ref TEXT,
          workflow_status TEXT DEFAULT 'Draft',
          completion_percentage INTEGER DEFAULT 0,
          last_saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          submitted_at TIMESTAMP,
          hod_id INTEGER,
          dean_id INTEGER,
          hod_remarks TEXT,
          hod_reviewed_at TIMESTAMP,
          hod_reviewer_name TEXT,
          dean_remarks TEXT,
          dean_reviewed_at TIMESTAMP,
          dean_reviewer_name TEXT,
          registrar_remarks TEXT,
          registrar_reviewed_at TIMESTAMP,
          registrar_reviewer_name TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Educational Qualifications
        CREATE TABLE IF NOT EXISTS educational_qualifications (
          id SERIAL PRIMARY KEY,
          staff_id INTEGER NOT NULL,
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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Professional Qualifications
        CREATE TABLE IF NOT EXISTS professional_qualifications (
          id SERIAL PRIMARY KEY,
          staff_id INTEGER NOT NULL,
          qualification_type TEXT NOT NULL,
          title_or_exam TEXT NOT NULL,
          qualifying_authority TEXT,
          registration_no TEXT,
          award_date TEXT,
          validity_date TEXT,
          certificate_file TEXT,
          verification_status TEXT DEFAULT 'Pending',
          verification_remarks TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Teaching Experiences
        CREATE TABLE IF NOT EXISTS teaching_experiences (
          id SERIAL PRIMARY KEY,
          staff_id INTEGER NOT NULL,
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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Research Publications
        CREATE TABLE IF NOT EXISTS research_publications (
          id SERIAL PRIMARY KEY,
          staff_id INTEGER NOT NULL,
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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Research Projects
        CREATE TABLE IF NOT EXISTS research_projects (
          id SERIAL PRIMARY KEY,
          staff_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          funding_agency TEXT NOT NULL,
          role TEXT DEFAULT 'Principal Investigator',
          sanctioned_amount REAL,
          duration TEXT,
          status TEXT DEFAULT 'Ongoing',
          sanction_order_file TEXT,
          completion_cert_file TEXT,
          verification_status TEXT DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Patents
        CREATE TABLE IF NOT EXISTS patents (
          id SERIAL PRIMARY KEY,
          staff_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          application_number TEXT NOT NULL,
          filing_date TEXT,
          grant_number TEXT,
          grant_date TEXT,
          applicant_inventors TEXT,
          status TEXT DEFAULT 'Filed',
          evidence_file TEXT,
          verification_status TEXT DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Academic Contributions
        CREATE TABLE IF NOT EXISTS academic_contributions (
          id SERIAL PRIMARY KEY,
          staff_id INTEGER NOT NULL,
          category TEXT NOT NULL,
          title_or_activity TEXT NOT NULL,
          details TEXT,
          academic_year TEXT,
          evidence_file TEXT,
          verification_status TEXT DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Audit Logs
        CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          action TEXT NOT NULL,
          resource TEXT NOT NULL,
          resource_id INTEGER,
          details TEXT,
          ip_address TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- University Clearance Notifications
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          target_role TEXT,
          department_id INTEGER,
          faculty_id INTEGER,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT DEFAULT 'info',
          staff_profile_id INTEGER,
          staff_name TEXT,
          department_name TEXT,
          is_read INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Deleted Accounts Ledger (Prevents resurrecting deleted users on cold-start seeds)
        CREATE TABLE IF NOT EXISTS deleted_accounts (
          email TEXT PRIMARY KEY,
          employee_id TEXT,
          deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      isNeonConnected = true;
      console.log('✅ [Neon PostgreSQL]: Cloud database connected and schema verified successfully.');
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('⚠️ [Neon PostgreSQL Connection Warning]:', err.message);
    isNeonConnected = false;
    return false;
  }
}

/**
 * Real-time sync of a new user account to Neon Cloud
 */
async function syncUserToNeon(user) {
  if (!pool) return;
  try {
    const query = `
      INSERT INTO users (employee_id, email, password_hash, role, full_name, department_id, faculty_id, category, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (email) DO UPDATE SET
        employee_id = EXCLUDED.employee_id,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        department_id = EXCLUDED.department_id,
        faculty_id = EXCLUDED.faculty_id,
        category = EXCLUDED.category,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;
    const values = [
      user.employee_id,
      user.email.toLowerCase(),
      user.password_hash,
      user.role,
      user.full_name,
      user.department_id || null,
      user.faculty_id || null,
      user.category || 'Teaching',
      user.status || 'Active'
    ];
    await pool.query(query, values);
    console.log(`☁️ [Neon Cloud]: Real-time account synced for ${user.email} (${user.employee_id})`);
  } catch (err) {
    console.error('⚠️ [Neon User Sync Error]:', err.message);
  }
}

/**
 * Delete user account permanently from Neon Cloud
 */
async function deleteUserFromNeon(userId, email, employeeId) {
  if (!pool) return;
  try {
    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const cleanEmpId = employeeId ? employeeId.trim() : null;

    // Record into persistent deleted_accounts ledger
    if (cleanEmail) {
      await pool.query(
        'INSERT INTO deleted_accounts (email, employee_id) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
        [cleanEmail, cleanEmpId]
      );
    }

    // Resolve profile in neon
    let profileId = null;
    if (cleanEmpId) {
      const pRes = await pool.query('SELECT id, user_id FROM staff_profiles WHERE employee_id = $1 LIMIT 1', [cleanEmpId]);
      if (pRes.rows[0]) {
        profileId = pRes.rows[0].id;
        if (!userId && pRes.rows[0].user_id) userId = pRes.rows[0].user_id;
      }
    }
    if (!profileId && cleanEmail) {
      const pRes = await pool.query('SELECT id, user_id FROM staff_profiles WHERE LOWER(official_email) = LOWER($1) LIMIT 1', [cleanEmail]);
      if (pRes.rows[0]) {
        profileId = pRes.rows[0].id;
        if (!userId && pRes.rows[0].user_id) userId = pRes.rows[0].user_id;
      }
    }

    // Purge child tables in neon if profile exists
    if (profileId) {
      await pool.query('DELETE FROM educational_qualifications WHERE staff_id = $1', [profileId]);
      await pool.query('DELETE FROM professional_qualifications WHERE staff_id = $1', [profileId]);
      await pool.query('DELETE FROM teaching_experiences WHERE staff_id = $1', [profileId]);
      await pool.query('DELETE FROM research_publications WHERE staff_id = $1', [profileId]);
      await pool.query('DELETE FROM research_projects WHERE staff_id = $1', [profileId]);
      await pool.query('DELETE FROM patents WHERE staff_id = $1', [profileId]);
      await pool.query('DELETE FROM academic_contributions WHERE staff_id = $1', [profileId]);
      await pool.query('DELETE FROM staff_profiles WHERE id = $1', [profileId]);
    }

    if (cleanEmail) {
      await pool.query('DELETE FROM staff_profiles WHERE LOWER(official_email) = LOWER($1)', [cleanEmail]);
      await pool.query('DELETE FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
    }
    if (cleanEmpId) {
      await pool.query('DELETE FROM staff_profiles WHERE employee_id = $1', [cleanEmpId]);
      await pool.query('DELETE FROM users WHERE employee_id = $1', [cleanEmpId]);
    }
    if (userId) {
      await pool.query('DELETE FROM staff_profiles WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }
    console.log(`☁️ [Neon Cloud]: Account permanently purged for ${cleanEmail || cleanEmpId || userId}`);
  } catch (err) {
    console.error('⚠️ [Neon Delete User Error]:', err.message);
  }
}

/**
 * Real-time sync of research publication to Neon Cloud
 */
async function syncPublicationToNeon(pub, staffEmployeeId) {
  if (!pool) return;
  try {
    // Lookup staff profile id in neon if needed
    const staffRes = await pool.query('SELECT id FROM staff_profiles WHERE employee_id = $1 LIMIT 1', [staffEmployeeId]);
    const staffId = staffRes.rows[0] ? staffRes.rows[0].id : pub.staff_id;

    const query = `
      INSERT INTO research_publications (staff_id, title, authors, journal_or_conf_name, publication_year, volume, issue, page_numbers, doi, indexing, url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;
    const values = [
      staffId,
      pub.title,
      pub.authors,
      pub.journal_or_conf_name,
      pub.publication_year || null,
      pub.volume || '',
      pub.issue || '',
      pub.page_numbers || '',
      pub.doi || '',
      pub.indexing || '',
      pub.url || ''
    ];
    await pool.query(query, values);
    console.log(`☁️ [Neon Cloud]: Real-time publication synced: "${pub.title.substring(0, 40)}..."`);
  } catch (err) {
    console.error('⚠️ [Neon Pub Sync Error]:', err.message);
  }
}

/**
 * Batch sync publications (e.g. 80+ papers bulk import)
 */
async function syncBulkPublicationsToNeon(publications, staffEmployeeId) {
  if (!pool || !publications || publications.length === 0) return;
  try {
    const staffRes = await pool.query('SELECT id FROM staff_profiles WHERE employee_id = $1 LIMIT 1', [staffEmployeeId]);
    const staffId = staffRes.rows[0] ? staffRes.rows[0].id : (publications[0].staff_id || 1);

    for (const pub of publications) {
      const query = `
        INSERT INTO research_publications (staff_id, title, authors, journal_or_conf_name, publication_year, volume, issue, page_numbers, doi, indexing, url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      const values = [
        staffId,
        pub.title,
        pub.authors,
        pub.journal_or_conf_name,
        pub.publication_year || null,
        pub.volume || '',
        pub.issue || '',
        pub.page_numbers || '',
        pub.doi || '',
        pub.indexing || '',
        pub.url || ''
      ];
      await pool.query(query, values);
    }
    console.log(`☁️ [Neon Cloud]: Real-time batch synced ${publications.length} publications for ${staffEmployeeId}`);
  } catch (err) {
    console.error('⚠️ [Neon Bulk Pub Sync Error]:', err.message);
  }
}

/**
 * Real-time sync of staff profile to Neon Cloud
 */
async function syncProfileToNeon(profile) {
  if (!pool || !profile) return;
  try {
    const query = `
      INSERT INTO staff_profiles (
        user_id, employee_id, salutation, full_name, employee_category,
        official_email, mobile, department_id, faculty_id, designation,
        employment_type, joining_date_university, workflow_status,
        completion_percentage, calculated_total_exp_years, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        employee_id = EXCLUDED.employee_id,
        salutation = EXCLUDED.salutation,
        full_name = EXCLUDED.full_name,
        employee_category = EXCLUDED.employee_category,
        official_email = EXCLUDED.official_email,
        mobile = EXCLUDED.mobile,
        department_id = EXCLUDED.department_id,
        faculty_id = EXCLUDED.faculty_id,
        designation = EXCLUDED.designation,
        employment_type = EXCLUDED.employment_type,
        joining_date_university = EXCLUDED.joining_date_university,
        workflow_status = EXCLUDED.workflow_status,
        completion_percentage = EXCLUDED.completion_percentage,
        calculated_total_exp_years = EXCLUDED.calculated_total_exp_years,
        updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [
      profile.user_id,
      profile.employee_id,
      profile.salutation || '',
      profile.full_name || '',
      profile.employee_category || 'Teaching',
      profile.official_email || '',
      profile.mobile || '',
      profile.department_id || null,
      profile.faculty_id || null,
      profile.designation || '',
      profile.employment_type || 'Regular',
      profile.joining_date_university || null,
      profile.workflow_status || 'Draft',
      profile.completion_percentage || 25,
      profile.calculated_total_exp_years || 0
    ]);
    console.log(`☁️ [Neon Cloud]: Real-time profile synced for ${profile.full_name} (${profile.employee_id})`);
  } catch (err) {
    console.error('⚠️ [Neon Profile Sync Error]:', err.message);
  }
}

/**
 * Find profile in Neon directly (Fallback on cold start cache miss)
 */
async function findProfileInNeon(userId, employeeId, email) {
  if (!pool) return null;
  try {
    const res = await pool.query(
      `SELECT * FROM staff_profiles 
       WHERE user_id = $1 OR employee_id = $2 OR LOWER(official_email) = LOWER($3)
       LIMIT 1`,
      [userId || -1, employeeId || '', email || '']
    );
    return res.rows[0] || null;
  } catch (err) {
    console.error('⚠️ [Neon Find Profile Error]:', err.message);
    return null;
  }
}

/**
 * Find user in Neon directly (Fallback on login cache miss)
 */
async function findUserInNeon(identifier) {
  if (!pool || !identifier) return null;
  try {
    const clean = identifier.trim().toLowerCase();
    const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(employee_id) = LOWER($1) LIMIT 1', [clean]);
    return res.rows[0] || null;
  } catch (err) {
    console.error('⚠️ [Neon Find User Error]:', err.message);
    return null;
  }
}

/**
 * Sync entire local user list to Neon if Neon is empty (Initial Seed Migration)
 */
async function bootstrapSyncToNeon(localDb) {
  if (!pool) return;
  try {
    const countRes = await pool.query('SELECT COUNT(*) as cnt FROM users');
    const neonUserCount = parseInt(countRes.rows[0].cnt, 10);

    if (neonUserCount === 0) {
      console.log('☁️ [Neon Cloud]: Empty cloud database detected. Migrating local accounts to Neon...');
      const localUsers = localDb.prepare('SELECT * FROM users').all();
      for (const u of localUsers) {
        await syncUserToNeon(u);
      }
      console.log(`✅ [Neon Cloud]: Successfully seeded ${localUsers.length} accounts to Neon Cloud!`);
    } else {
      console.log(`☁️ [Neon Cloud]: Active cloud database with ${neonUserCount} users connected.`);
      
      // Pull missing users from Neon into local DB
      const neonUsersRes = await pool.query('SELECT * FROM users');
      const insertLocal = localDb.prepare(`
        INSERT OR IGNORE INTO users (id, employee_id, email, password_hash, role, full_name, department_id, faculty_id, category, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const nu of neonUsersRes.rows) {
        insertLocal.run(
          nu.id,
          nu.employee_id,
          nu.email,
          nu.password_hash,
          nu.role,
          nu.full_name,
          nu.department_id,
          nu.faculty_id,
          nu.category,
          nu.status
        );
      }

      // Pull missing staff_profiles from Neon into local DB
      try {
        const neonProfilesRes = await pool.query('SELECT * FROM staff_profiles');
        const insertLocalProfile = localDb.prepare(`
          INSERT OR IGNORE INTO staff_profiles (
            user_id, employee_id, salutation, full_name, employee_category,
            official_email, mobile, department_id, faculty_id, designation,
            employment_type, joining_date_university, workflow_status,
            completion_percentage, calculated_total_exp_years
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const np of neonProfilesRes.rows) {
          insertLocalProfile.run(
            np.user_id,
            np.employee_id,
            np.salutation || '',
            np.full_name || '',
            np.employee_category || 'Teaching',
            np.official_email || '',
            np.mobile || '',
            np.department_id || null,
            np.faculty_id || null,
            np.designation || '',
            np.employment_type || 'Regular',
            np.joining_date_university || null,
            np.workflow_status || 'Draft',
            np.completion_percentage || 25,
            np.calculated_total_exp_years || 0
          );
        }
      } catch (profSyncErr) {
        console.warn('Neon profile sync warning:', profSyncErr.message);
      }
    }
  } catch (err) {
    console.error('⚠️ [Neon Bootstrap Sync Error]:', err.message);
  }
}

module.exports = {
  pool,
  isNeonConnected: () => isNeonConnected,
  initNeonSchema,
  syncUserToNeon,
  deleteUserFromNeon,
  syncPublicationToNeon,
  syncBulkPublicationsToNeon,
  syncProfileToNeon,
  findProfileInNeon,
  findUserInNeon,
  bootstrapSyncToNeon
};

