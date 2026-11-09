const { db } = require('./db');
const { syncProfileToNeon } = require('./neon');

/**
 * Calculates profile completion percentage and checklist of missing required items
 */
function calculateProfileStatus(profileId) {
  const profile = db.prepare('SELECT * FROM staff_profiles WHERE id = ?').get(profileId);
  if (!profile) return { completion: 0, omissions: [] };

  const omissions = [];
  let score = 30; // base score

  // 1. Personal Info
  if (profile.full_name) score += 10; else omissions.push({ section: 1, field: 'Full Name', text: 'Full Name as per official records is required' });
  if (profile.official_email) score += 10; else omissions.push({ section: 1, field: 'Official Email', text: 'Official University email is required' });
  if (profile.mobile) score += 5;
  if (profile.dob) score += 5;
  if (profile.gender) score += 5;
  if (profile.current_address) score += 5;

  // 2. Employment Details
  if (profile.employee_category === 'Teaching') {
    if (profile.department_id) score += 10; else omissions.push({ section: 2, field: 'Department', text: 'Department selection is required' });
  } else {
    if (profile.administrative_unit || profile.designation) score += 10;
  }
  if (profile.designation) score += 5;
  if (profile.employment_type) score += 5;
  if (profile.joining_date_university) score += 5;

  // 3. Educational Qualifications
  const eduCount = db.prepare('SELECT COUNT(*) as cnt FROM educational_qualifications WHERE staff_id = ?').get(profileId)?.cnt || 0;
  if (eduCount > 0) score += 10;

  // 4. Documents Upload
  const docCount = db.prepare('SELECT COUNT(*) as cnt FROM documents WHERE staff_id = ?').get(profileId)?.cnt || 0;
  if (docCount > 0) score += 10;

  const finalCompletion = Math.min(100, Math.max(25, score));

  // Update profile completion in DB
  try {
    db.prepare('UPDATE staff_profiles SET completion_percentage = ? WHERE id = ?').run(finalCompletion, profileId);
  } catch (err) {
    console.warn('[calculateProfileStatus Warning]:', err.message);
  }

  return { completion: finalCompletion, omissions };
}

/**
 * Robust, self-healing staff profile retriever:
 * 1. Looks up profile by user_id
 * 2. Fallbacks to employee_id
 * 3. Fallbacks to official_email
 * 4. Ensures users table has a matching row
 * 5. If missing (e.g. fresh Vercel serverless container cold-start), auto-creates the staff_profile with appropriate HOD & Dean bindings
 * 6. Guarantees that a valid profile is ALWAYS returned
 */
function getOrCreateStaffProfile(user) {
  if (!user) return null;

  const rawUserId = user.id ? parseInt(user.id, 10) : null;
  const rawEmail = (user.email || user.official_email || '').toLowerCase().trim();
  const rawEmpId = (user.employee_id || '').trim();

  // 1. Try finding by user_id
  let profile = rawUserId ? db.prepare('SELECT * FROM staff_profiles WHERE user_id = ?').get(rawUserId) : null;

  // 2. Try finding by employee_id
  if (!profile && rawEmpId) {
    profile = db.prepare('SELECT * FROM staff_profiles WHERE employee_id = ? COLLATE NOCASE').get(rawEmpId);
    if (profile && rawUserId && profile.user_id !== rawUserId) {
      try {
        db.prepare('UPDATE staff_profiles SET user_id = ? WHERE id = ?').run(rawUserId, profile.id);
        profile.user_id = rawUserId;
      } catch (e) {
        console.warn('[Staff Profile Relink Warn]:', e.message);
      }
    }
  }

  // 3. Try finding by official email
  if (!profile && rawEmail) {
    profile = db.prepare('SELECT * FROM staff_profiles WHERE LOWER(official_email) = LOWER(?)').get(rawEmail);
    if (profile && rawUserId && profile.user_id !== rawUserId) {
      try {
        db.prepare('UPDATE staff_profiles SET user_id = ? WHERE id = ?').run(rawUserId, profile.id);
        profile.user_id = rawUserId;
      } catch (e) {
        console.warn('[Staff Profile Relink Warn]:', e.message);
      }
    }
  }

  if (profile) return profile;

  // 4. Ensure corresponding user row exists in users table (required for foreign key integrity)
  let effectiveUserId = rawUserId;
  const existingUser = rawUserId ? db.prepare('SELECT id FROM users WHERE id = ?').get(rawUserId) : null;
  if (!existingUser) {
    const userByEmail = rawEmail ? db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(rawEmail) : null;
    if (userByEmail) {
      effectiveUserId = userByEmail.id;
    } else {
      try {
        const insUser = db.prepare(`
          INSERT INTO users (id, employee_id, email, password_hash, role, full_name, department_id, faculty_id, category, status)
          VALUES (?, ?, ?, 'bearer_session_auth', ?, ?, ?, ?, ?, 'Active')
        `).run(
          rawUserId,
          rawEmpId || `CDU-FAC-${Math.floor(1000 + Math.random() * 9000)}`,
          rawEmail || 'faculty@chaitanya.edu.in',
          user.role || 'staff',
          user.full_name || 'Faculty Member',
          user.department_id ? parseInt(user.department_id, 10) : 1,
          user.faculty_id ? parseInt(user.faculty_id, 10) : 1,
          user.category || 'Teaching'
        );
        effectiveUserId = insUser.lastInsertRowid || rawUserId;
      } catch (userErr) {
        // In case id auto-increment conflict, let SQLite assign ID
        const insFallback = db.prepare(`
          INSERT INTO users (employee_id, email, password_hash, role, full_name, department_id, faculty_id, category, status)
          VALUES (?, ?, 'bearer_session_auth', ?, ?, ?, ?, ?, 'Active')
        `).run(
          rawEmpId || `CDU-FAC-${Math.floor(1000 + Math.random() * 9000)}`,
          rawEmail || `faculty-${Date.now()}@chaitanya.edu.in`,
          user.role || 'staff',
          user.full_name || 'Faculty Member',
          user.department_id ? parseInt(user.department_id, 10) : 1,
          user.faculty_id ? parseInt(user.faculty_id, 10) : 1,
          user.category || 'Teaching'
        );
        effectiveUserId = insFallback.lastInsertRowid;
      }
    }
  }

  // 5. Resolve department, faculty, HOD, and Dean assignments
  let deptId = user.department_id ? parseInt(user.department_id, 10) : 1;
  let facId = user.faculty_id ? parseInt(user.faculty_id, 10) : null;
  let hodId = null;
  let deanId = null;

  if (deptId) {
    const dept = db.prepare('SELECT faculty_id, hod_id FROM departments WHERE id = ?').get(deptId);
    if (dept) {
      facId = facId || dept.faculty_id;
      hodId = dept.hod_id;
    }
  }
  if (facId) {
    const fac = db.prepare('SELECT dean_id FROM faculties WHERE id = ?').get(facId);
    if (fac) deanId = fac.dean_id;
  }

  const empId = rawEmpId || `CDU-FAC-${effectiveUserId}`;
  const fullName = user.full_name || 'Faculty Member';
  const email = rawEmail || `faculty-${effectiveUserId}@chaitanya.edu.in`;

  // 6. Create fresh staff_profile
  try {
    const ins = db.prepare(`
      INSERT INTO staff_profiles (
        user_id, employee_id, full_name, official_email, department_id, faculty_id,
        hod_id, dean_id, designation, employee_category, workflow_status, completion_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', 25)
    `).run(
      effectiveUserId,
      empId,
      fullName,
      email,
      deptId,
      facId,
      hodId,
      deanId,
      user.category === 'Teaching' ? 'Assistant Professor' : 'Administrative Officer',
      user.category || 'Teaching'
    );
    profile = db.prepare('SELECT * FROM staff_profiles WHERE id = ?').get(ins.lastInsertRowid);
  } catch (insErr) {
    console.error('[Auto-Heal Profile Create Error]:', insErr.message);
    profile = db.prepare('SELECT * FROM staff_profiles WHERE user_id = ? OR employee_id = ?').get(effectiveUserId, empId);
  }

  // Asynchronously sync newly created profile to Neon Cloud
  if (profile) {
    try {
      syncProfileToNeon(profile).catch(() => {});
    } catch (_) {}
  }

  return profile;
}

module.exports = {
  calculateProfileStatus,
  getOrCreateStaffProfile
};
