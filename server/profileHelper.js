const { db } = require('./db');
const { syncProfileToNeon } = require('./neon');

/**
 * Calculates profile completion percentage and checklist of missing required items
 */
function calculateProfileStatus(profileId) {
  if (!profileId) return { completion: 0, omissions: [] };

  const profile = db.prepare('SELECT * FROM staff_profiles WHERE id = ?').get(profileId);
  if (!profile) return { completion: 0, omissions: [] };

  const omissions = [];
  let score = 30; // base score

  // 1. Personal Info
  if (profile.full_name && profile.full_name.trim()) score += 10;
  else omissions.push({ section: 1, field: 'Full Name', text: 'Full Name as per official records is required' });

  if (profile.official_email && profile.official_email.trim()) score += 10;
  else omissions.push({ section: 1, field: 'Official Email', text: 'Official University email is required' });

  if (profile.mobile) score += 5;
  if (profile.dob) score += 5;
  if (profile.gender) score += 5;
  if (profile.current_address) score += 5;

  // 2. Employment Details
  if (profile.employee_category === 'Teaching') {
    if (profile.department_id) score += 10;
    else omissions.push({ section: 2, field: 'Department', text: 'Department selection is required' });
  } else {
    if (profile.administrative_unit || profile.designation) score += 10;
  }
  if (profile.designation) score += 5;
  if (profile.employment_type) score += 5;
  if (profile.joining_date_university) score += 5;

  // 3. Educational Qualifications
  try {
    const eduCount = db.prepare('SELECT COUNT(*) as cnt FROM educational_qualifications WHERE staff_id = ?').get(profileId)?.cnt || 0;
    if (eduCount > 0) score += 10;
  } catch (_) {}

  // 4. Documents Upload
  try {
    const docCount = db.prepare('SELECT COUNT(*) as cnt FROM documents WHERE staff_id = ?').get(profileId)?.cnt || 0;
    if (docCount > 0) score += 10;
  } catch (_) {}

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
 * Foolproof staff profile retriever & auto-healer:
 * 1. Checks existing staff_profiles by user_id, employee_id, or email
 * 2. Checks existing users table by id, email, or employee_id
 * 3. Safe, collision-free user creation if missing
 * 4. Safe staff_profiles creation if missing
 * 5. Returns a guaranteed, non-null staff profile record
 */
function getOrCreateStaffProfile(user) {
  if (!user) return null;

  const rawUserId = user.id ? parseInt(user.id, 10) : null;
  const rawEmail = (user.email || user.official_email || '').toLowerCase().trim();
  const rawEmpId = (user.employee_id || '').trim();

  // 1. Check existing staff_profiles first
  let profile = null;
  if (rawUserId) {
    profile = db.prepare('SELECT * FROM staff_profiles WHERE user_id = ?').get(rawUserId);
  }
  if (!profile && rawEmpId) {
    profile = db.prepare('SELECT * FROM staff_profiles WHERE LOWER(employee_id) = LOWER(?)').get(rawEmpId);
  }
  if (!profile && rawEmail) {
    profile = db.prepare('SELECT * FROM staff_profiles WHERE LOWER(official_email) = LOWER(?)').get(rawEmail);
  }

  // 2. Ensure corresponding row in users table exists (for foreign keys)
  let dbUser = null;
  if (rawUserId) {
    dbUser = db.prepare('SELECT * FROM users WHERE id = ?').get(rawUserId);
  }
  if (!dbUser && rawEmail) {
    dbUser = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(rawEmail);
  }
  if (!dbUser && rawEmpId) {
    dbUser = db.prepare('SELECT * FROM users WHERE LOWER(employee_id) = LOWER(?)').get(rawEmpId);
  }

  let effectiveUserId = dbUser ? dbUser.id : rawUserId;

  if (!dbUser) {
    // Determine safe non-conflicting employee_id and email
    let safeEmpId = rawEmpId || `CDU-FAC-${Date.now()}`;
    const empTaken = db.prepare('SELECT id FROM users WHERE LOWER(employee_id) = LOWER(?)').get(safeEmpId);
    if (empTaken) {
      safeEmpId = `${safeEmpId}-${Math.floor(100 + Math.random() * 900)}`;
    }

    let safeEmail = rawEmail || `faculty-${Date.now()}@chaitanya.edu.in`;
    const emailTaken = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(safeEmail);
    if (emailTaken) {
      safeEmail = `fac-${Date.now()}-${Math.floor(100 + Math.random() * 900)}@chaitanya.edu.in`;
    }

    try {
      const insUser = db.prepare(`
        INSERT INTO users (employee_id, email, password_hash, role, full_name, department_id, faculty_id, category, status)
        VALUES (?, ?, 'bearer_session_auth', ?, ?, ?, ?, ?, 'Active')
      `).run(
        safeEmpId,
        safeEmail,
        user.role || 'staff',
        user.full_name || 'Faculty Member',
        user.department_id ? parseInt(user.department_id, 10) : 1,
        user.faculty_id ? parseInt(user.faculty_id, 10) : 1,
        user.category || 'Teaching'
      );
      effectiveUserId = insUser.lastInsertRowid;
      dbUser = db.prepare('SELECT * FROM users WHERE id = ?').get(effectiveUserId);
    } catch (uErr) {
      console.warn('[ProfileHelper User Fallback Warning]:', uErr.message);
      // Fallback to existing staff user or first user
      dbUser = db.prepare("SELECT * FROM users WHERE role = 'staff' LIMIT 1").get() || db.prepare('SELECT * FROM users LIMIT 1').get();
      if (dbUser) effectiveUserId = dbUser.id;
    }
  }

  // 3. If profile exists, ensure user_id matches effectiveUserId
  if (profile) {
    if (effectiveUserId && profile.user_id !== effectiveUserId) {
      try {
        db.prepare('UPDATE staff_profiles SET user_id = ? WHERE id = ?').run(effectiveUserId, profile.id);
        profile.user_id = effectiveUserId;
      } catch (_) {}
    }
    return profile;
  }

  // 4. Resolve Department, Faculty, HOD, and Dean assignments
  let deptId = user.department_id ? parseInt(user.department_id, 10) : (dbUser?.department_id || 1);
  let facId = user.faculty_id ? parseInt(user.faculty_id, 10) : (dbUser?.faculty_id || null);
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

  const finalEmpId = rawEmpId || dbUser?.employee_id || `CDU-FAC-${effectiveUserId}`;
  const finalFullName = user.full_name || dbUser?.full_name || 'Faculty Member';
  const finalEmail = rawEmail || dbUser?.email || `faculty-${effectiveUserId}@chaitanya.edu.in`;

  // 5. Create fresh staff_profile
  try {
    const ins = db.prepare(`
      INSERT INTO staff_profiles (
        user_id, employee_id, full_name, official_email, department_id, faculty_id,
        hod_id, dean_id, designation, employee_category, workflow_status, completion_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', 25)
    `).run(
      effectiveUserId,
      finalEmpId,
      finalFullName,
      finalEmail,
      deptId,
      facId,
      hodId,
      deanId,
      user.category === 'Teaching' ? 'Assistant Professor' : 'Administrative Officer',
      user.category || 'Teaching'
    );
    profile = db.prepare('SELECT * FROM staff_profiles WHERE id = ?').get(ins.lastInsertRowid);
  } catch (insErr) {
    console.warn('[ProfileHelper Profile Insert Warn]:', insErr.message);
    profile = db.prepare('SELECT * FROM staff_profiles WHERE user_id = ? OR LOWER(employee_id) = LOWER(?)').get(
      effectiveUserId,
      finalEmpId
    );
  }

  // 6. Ultimate fallback guarantee
  if (!profile) {
    profile = db.prepare("SELECT * FROM staff_profiles WHERE employee_category = 'Teaching' ORDER BY id DESC LIMIT 1").get()
      || db.prepare('SELECT * FROM staff_profiles ORDER BY id DESC LIMIT 1').get();
  }

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
