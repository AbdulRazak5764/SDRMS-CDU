const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { verifyToken, requireRoles, logAudit } = require('../auth');

// Allow authorized administrative roles
const adminRoles = ['hod', 'dean', 'hr', 'registrar', 'vc'];

// Helper to check departmental or faculty access scope
function enforceScope(req, staffRecord) {
  if (['registrar', 'vc', 'hr'].includes(req.user.role)) {
    return true; // Super admins have university-wide access
  }

  // Fallback to DB if JWT lacks faculty_id or department_id
  let userFacultyId = req.user.faculty_id;
  let userDeptId = req.user.department_id;
  if (!userFacultyId || !userDeptId) {
    const dbUser = db.prepare('SELECT faculty_id, department_id FROM users WHERE id = ?').get(req.user.id);
    if (dbUser) {
      userFacultyId = userFacultyId || dbUser.faculty_id;
      userDeptId = userDeptId || dbUser.department_id;
    }
  }

  if (req.user.role === 'dean') {
    // Dean can access anyone within their faculty
    if (staffRecord.faculty_id && userFacultyId) {
      if (staffRecord.faculty_id === userFacultyId) return true;
    }
    // Check via department
    if (staffRecord.department_id) {
      const dept = db.prepare('SELECT faculty_id FROM departments WHERE id = ?').get(staffRecord.department_id);
      if (dept && dept.faculty_id === userFacultyId) return true;
    }
    return false;
  }

  if (req.user.role === 'hod') {
    // HOD can only access staff within their department
    if (staffRecord.department_id && userDeptId) {
      return staffRecord.department_id === userDeptId;
    }
    return false;
  }

  return false;
}

// GET /api/admin/stats
router.get('/stats', verifyToken, requireRoles(...adminRoles), (req, res) => {
  const isHOD = req.user.role === 'hod';
  const isDean = req.user.role === 'dean';
  const hodDeptId = req.user.department_id;
  const deanFacId = req.user.faculty_id;

  let filter = 'WHERE 1=1';
  const params = [];

  if (isHOD && hodDeptId) {
    filter += ' AND p.department_id = ?';
    params.push(hodDeptId);
  } else if (isDean && deanFacId) {
    filter += ' AND (p.faculty_id = ? OR d.faculty_id = ?)';
    params.push(deanFacId, deanFacId);
  }

  // Base join
  const baseFrom = `
    FROM staff_profiles p
    LEFT JOIN departments d ON p.department_id = d.id
    LEFT JOIN faculties f ON (p.faculty_id = f.id OR d.faculty_id = f.id)
    ${filter}
  `;

  // Summary counts
  const totalStaff = db.prepare(`SELECT COUNT(p.id) as cnt ${baseFrom}`).get(...params).cnt;
  const teaching = db.prepare(`SELECT COUNT(p.id) as cnt ${baseFrom} AND p.employee_category = 'Teaching'`).get(...params).cnt;
  const nonTeaching = db.prepare(`SELECT COUNT(p.id) as cnt ${baseFrom} AND p.employee_category != 'Teaching'`).get(...params).cnt;

  // Workflow status breakdown
  const draft = db.prepare(`SELECT COUNT(p.id) as cnt ${baseFrom} AND p.workflow_status = 'Draft'`).get(...params).cnt;
  const pendingHOD = db.prepare(`SELECT COUNT(p.id) as cnt ${baseFrom} AND p.workflow_status IN ('Pending HOD Approval', 'Submitted')`).get(...params).cnt;
  const pendingDean = db.prepare(`SELECT COUNT(p.id) as cnt ${baseFrom} AND p.workflow_status = 'Pending Dean Approval'`).get(...params).cnt;
  const pendingRegistrar = db.prepare(`SELECT COUNT(p.id) as cnt ${baseFrom} AND p.workflow_status = 'Pending Registrar Approval'`).get(...params).cnt;
  const correctionRequired = db.prepare(`SELECT COUNT(p.id) as cnt ${baseFrom} AND p.workflow_status = 'Correction Required'`).get(...params).cnt;
  const approved = db.prepare(`SELECT COUNT(p.id) as cnt ${baseFrom} AND p.workflow_status = 'Approved'`).get(...params).cnt;

  // Department-wise staff counts
  let deptCountsQuery = `
    SELECT d.id, d.name as department_name, d.hod_name, f.name as faculty_name, f.dean_name, COUNT(p.id) as staff_count
    FROM departments d
    LEFT JOIN faculties f ON d.faculty_id = f.id
    LEFT JOIN staff_profiles p ON p.department_id = d.id
  `;
  const deptParams = [];
  if (isHOD && hodDeptId) {
    deptCountsQuery += ' WHERE d.id = ?';
    deptParams.push(hodDeptId);
  } else if (isDean && deanFacId) {
    deptCountsQuery += ' WHERE d.faculty_id = ?';
    deptParams.push(deanFacId);
  }
  deptCountsQuery += ' GROUP BY d.id ORDER BY staff_count DESC, d.name ASC';
  const deptCounts = db.prepare(deptCountsQuery).all(...deptParams);

  res.json({
    totalStaff,
    teaching,
    nonTeaching,
    draft,
    pendingHOD,
    pendingDean,
    pendingRegistrar,
    correctionRequired,
    approved,
    deptCounts
  });
});

// GET /api/admin/staff-list
router.get('/staff-list', verifyToken, requireRoles(...adminRoles), (req, res) => {
  const { search, department, faculty, category, status, sortBy, roleFilter } = req.query;
  const isHOD = req.user.role === 'hod';
  const isDean = req.user.role === 'dean';
  const hodDeptId = req.user.department_id;
  const deanFacId = req.user.faculty_id;

  let query = `
    SELECT p.id, p.user_id, p.employee_id, p.full_name, p.dob, p.gender, p.official_email, p.mobile,
           p.employee_category, p.designation, p.employment_type, p.campus_location,
           p.workflow_status, p.completion_percentage, p.submission_ref, p.submitted_at,
           p.calculated_univ_exp_years, p.calculated_total_exp_years, p.photo_url,
           p.hod_remarks, p.hod_reviewed_at, p.hod_reviewer_name,
           p.dean_remarks, p.dean_reviewed_at, p.dean_reviewer_name,
           p.registrar_remarks, p.registrar_reviewed_at, p.registrar_reviewer_name,
           u.role as user_role, u.email as account_email,
           d.id as department_id, d.name as department_name, d.hod_name,
           f.id as faculty_id, f.name as faculty_name, f.dean_name,
           (SELECT COUNT(*) FROM documents doc WHERE doc.staff_id = p.id) as uploaded_docs_count
    FROM staff_profiles p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN departments d ON p.department_id = d.id
    LEFT JOIN faculties f ON (p.faculty_id = f.id OR d.faculty_id = f.id)
    WHERE 1=1
  `;

  const params = [];

  // Role Scope Filtering
  if (isHOD && hodDeptId) {
    query += ' AND p.department_id = ?';
    params.push(hodDeptId);
  } else if (isDean && deanFacId) {
    query += ' AND (p.faculty_id = ? OR d.faculty_id = ?)';
    params.push(deanFacId, deanFacId);
  }

  if (department) {
    query += ' AND p.department_id = ?';
    params.push(department);
  }

  if (faculty) {
    query += ' AND (p.faculty_id = ? OR d.faculty_id = ?)';
    params.push(faculty, faculty);
  }

  if (roleFilter) {
    query += ' AND u.role = ?';
    params.push(roleFilter);
  }

  if (category) {
    query += ' AND p.employee_category = ?';
    params.push(category);
  }

  if (status) {
    if (status === 'Pending HOD') {
      query += " AND p.workflow_status IN ('Pending HOD Approval', 'Submitted')";
    } else if (status === 'Pending Dean') {
      query += " AND p.workflow_status = 'Pending Dean Approval'";
    } else if (status === 'Pending Registrar') {
      query += " AND p.workflow_status = 'Pending Registrar Approval'";
    } else {
      query += ' AND p.workflow_status = ?';
      params.push(status);
    }
  }

  if (search) {
    query += ' AND (p.full_name LIKE ? OR p.employee_id LIKE ? OR p.official_email LIKE ? OR p.designation LIKE ? OR d.name LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s, s);
  }

  // Sorting
  if (sortBy === 'name') query += ' ORDER BY p.full_name ASC';
  else if (sortBy === 'completion') query += ' ORDER BY p.completion_percentage DESC';
  else if (sortBy === 'status') query += ' ORDER BY p.workflow_status ASC';
  else query += ' ORDER BY p.submitted_at DESC, p.id DESC';

  const staff = db.prepare(query).all(...params);
  res.json({ staff });
});

// GET /api/admin/hierarchy - Full Organizational Tree (Deans -> HODs -> Faculty)
router.get('/hierarchy', verifyToken, requireRoles(...adminRoles), (req, res) => {
  const isHOD = req.user.role === 'hod';
  const isDean = req.user.role === 'dean';

  // 1. Fetch faculties
  let facultiesQuery = 'SELECT id, name, code, dean_name, dean_title FROM faculties WHERE is_active = 1';
  const facParams = [];
  if (isDean && req.user.faculty_id) {
    facultiesQuery += ' AND id = ?';
    facParams.push(req.user.faculty_id);
  }
  facultiesQuery += ' ORDER BY name ASC';
  const faculties = db.prepare(facultiesQuery).all(...facParams);

  // 2. Build tree
  const tree = faculties.map(fac => {
    let deptQuery = 'SELECT id, name, code, hod_name FROM departments WHERE faculty_id = ? AND is_active = 1';
    const deptParams = [fac.id];
    if (isHOD && req.user.department_id) {
      deptQuery += ' AND id = ?';
      deptParams.push(req.user.department_id);
    }
    deptQuery += ' ORDER BY name ASC';
    const departments = db.prepare(deptQuery).all(...deptParams);

    const departmentsWithStaff = departments.map(dept => {
      const facultyMembers = db.prepare(`
        SELECT p.id, p.user_id, p.employee_id, p.full_name, p.official_email, p.designation,
               p.employee_category, p.workflow_status, p.completion_percentage, p.photo_url,
               u.role as user_role
        FROM staff_profiles p
        JOIN users u ON p.user_id = u.id
        WHERE p.department_id = ?
        ORDER BY p.full_name ASC
      `).all(dept.id);

      return {
        ...dept,
        facultyCount: facultyMembers.length,
        facultyMembers
      };
    });

    const totalFacMembers = departmentsWithStaff.reduce((sum, d) => sum + d.facultyCount, 0);

    return {
      ...fac,
      departments: departmentsWithStaff,
      totalStaff: totalFacMembers
    };
  });

  res.json({ tree });
});

// GET /api/admin/staff/:id
router.get('/staff/:id', verifyToken, requireRoles(...adminRoles), (req, res) => {
  const profileId = req.params.id;

  const profile = db.prepare(`
    SELECT p.*, d.name as department_name, d.hod_name, f.name as faculty_name, f.dean_name,
           u.email as user_email, u.role as user_role
    FROM staff_profiles p
    LEFT JOIN departments d ON p.department_id = d.id
    LEFT JOIN faculties f ON (p.faculty_id = f.id OR d.faculty_id = f.id)
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(profileId);

  if (!profile) {
    return res.status(404).json({ error: 'Staff profile not found.' });
  }

  // Check Scope
  if (!enforceScope(req, profile)) {
    return res.status(403).json({ error: 'Access denied. This profile is outside your assigned administrative jurisdiction.' });
  }

  // Fetch repeatable modules
  const qualifications = db.prepare('SELECT * FROM educational_qualifications WHERE staff_id = ? ORDER BY year_of_completion DESC').all(profileId);
  const professionalQuals = db.prepare('SELECT * FROM professional_qualifications WHERE staff_id = ? ORDER BY id DESC').all(profileId);
  const teachingExp = db.prepare('SELECT * FROM teaching_experiences WHERE staff_id = ? ORDER BY start_date DESC').all(profileId);
  const publications = db.prepare('SELECT * FROM research_publications WHERE staff_id = ? ORDER BY publication_year DESC').all(profileId);
  const projects = db.prepare('SELECT * FROM research_projects WHERE staff_id = ? ORDER BY id DESC').all(profileId);
  const patents = db.prepare('SELECT * FROM patents WHERE staff_id = ? ORDER BY id DESC').all(profileId);
  const trainingProgrammes = db.prepare('SELECT * FROM training_programmes WHERE staff_id = ? ORDER BY start_date DESC').all(profileId);
  const previousEmployment = db.prepare('SELECT * FROM previous_employments WHERE staff_id = ? ORDER BY date_of_joining DESC').all(profileId);
  const documents = db.prepare('SELECT * FROM documents WHERE staff_id = ? ORDER BY upload_timestamp DESC').all(profileId);
  const verificationLogs = db.prepare('SELECT * FROM verification_logs WHERE staff_id = ? ORDER BY created_at DESC').all(profileId);

  res.json({
    profile,
    qualifications,
    professionalQuals,
    teachingExp,
    publications,
    projects,
    patents,
    trainingProgrammes,
    previousEmployment,
    documents,
    verificationLogs
  });
});

// POST /api/admin/verify-action - Multi-Tier Hierarchical Approval Workflow
router.post('/verify-action', verifyToken, requireRoles('hod', 'dean', 'registrar', 'hr'), (req, res) => {
  const { staff_id, action, remarks, section_affected } = req.body;

  if (!staff_id || !action || !remarks) {
    return res.status(400).json({ error: 'Staff ID, action, and mandatory review remarks are required.' });
  }

  const profile = db.prepare('SELECT * FROM staff_profiles WHERE id = ?').get(staff_id);
  if (!profile) {
    return res.status(404).json({ error: 'Staff record not found.' });
  }

  if (!enforceScope(req, profile)) {
    return res.status(403).json({ error: 'Access denied. You do not have authority over this staff profile.' });
  }

  const role = req.user.role;
  let newStatus = profile.workflow_status;
  let actionMessage = '';

  if (action === 'APPROVE') {
    if (role === 'hod') {
      newStatus = 'Pending Dean Approval';
      actionMessage = 'HOD clearance granted. Profile forwarded to Dean for secondary approval.';
      db.prepare(`
        UPDATE staff_profiles SET
          workflow_status = ?,
          hod_id = ?,
          hod_remarks = ?,
          hod_reviewed_at = CURRENT_TIMESTAMP,
          hod_reviewer_name = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newStatus, req.user.id, remarks, req.user.full_name, staff_id);
    } else if (role === 'dean') {
      newStatus = 'Pending Registrar Approval';
      actionMessage = 'Dean clearance granted. Profile forwarded to the Registrar for final University seal.';
      db.prepare(`
        UPDATE staff_profiles SET
          workflow_status = ?,
          dean_id = ?,
          dean_remarks = ?,
          dean_reviewed_at = CURRENT_TIMESTAMP,
          dean_reviewer_name = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newStatus, req.user.id, remarks, req.user.full_name, staff_id);
    } else if (role === 'registrar' || role === 'hr') {
      newStatus = 'Approved';
      actionMessage = 'Official University Clearance granted by the Registrar. Record is permanently archived and certified.';
      db.prepare(`
        UPDATE staff_profiles SET
          workflow_status = ?,
          registrar_remarks = ?,
          registrar_reviewed_at = CURRENT_TIMESTAMP,
          registrar_reviewer_name = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newStatus, remarks, req.user.full_name, staff_id);
    }
  } else if (action === 'CORRECTION_REQUIRED') {
    newStatus = 'Correction Required';
    actionMessage = `Correction requested by ${role.toUpperCase()}: ${remarks}`;
    const updateField = role === 'hod' ? 'hod_remarks' : role === 'dean' ? 'dean_remarks' : 'registrar_remarks';
    db.prepare(`
      UPDATE staff_profiles SET
        workflow_status = ?,
        ${updateField} = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStatus, remarks, staff_id);
  } else if (action === 'REJECT') {
    newStatus = 'Rejected';
    actionMessage = `Application rejected by ${role.toUpperCase()}: ${remarks}`;
    db.prepare(`
      UPDATE staff_profiles SET
        workflow_status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStatus, staff_id);
  }

  // Insert verification log
  db.prepare(`
    INSERT INTO verification_logs (
      staff_id, action, from_status, to_status, reviewer_id, reviewer_name, reviewer_role, section_affected, remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    staff_id,
    action,
    profile.workflow_status,
    newStatus,
    req.user.id,
    req.user.full_name,
    role,
    section_affected || 'Clearance Review Desk',
    remarks
  );

  logAudit(req.user.id, req.user.email, role, `VERIFY_${action}`, 'staff_profiles', staff_id, `${actionMessage} Remarks: ${remarks}`, req);

  res.json({
    message: actionMessage,
    from_status: profile.workflow_status,
    to_status: newStatus
  });
});

// DELETE /api/admin/user/:id - Account Deletion with Hierarchy Permissions
// "credentails save hona bahi ek baar account cerate karey tho bhii ohh account ka account hod ,dean aur register three memebers delete karey tak rehna bahii"
router.delete('/user/:id', verifyToken, requireRoles('hod', 'dean', 'registrar'), (req, res) => {
  const targetUserId = parseInt(req.params.id);

  if (targetUserId === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own administrative account.' });
  }

  const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ error: 'Target user account not found.' });
  }

  // Permission checks:
  if (req.user.role === 'hod') {
    // HOD can only delete faculty in their department
    if (targetUser.role !== 'staff' || targetUser.department_id !== req.user.department_id) {
      return res.status(403).json({ error: 'HOD can only delete faculty accounts within their assigned department.' });
    }
  } else if (req.user.role === 'dean') {
    // Dean can delete faculty or HODs in their faculty
    const dept = targetUser.department_id ? db.prepare('SELECT faculty_id FROM departments WHERE id = ?').get(targetUser.department_id) : null;
    const belongsToFaculty = (targetUser.faculty_id === req.user.faculty_id) || (dept && dept.faculty_id === req.user.faculty_id);
    if (!belongsToFaculty || targetUser.role === 'dean' || targetUser.role === 'registrar') {
      return res.status(403).json({ error: 'Dean can only delete accounts within their assigned faculty/schools.' });
    }
  } else if (req.user.role === 'registrar') {
    // Registrar can delete anyone except other registrars
    if (targetUser.role === 'registrar') {
      return res.status(403).json({ error: 'Cannot delete Registrar administrative account.' });
    }
  }

  try {
    // Get profile id if exists
    const profile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(targetUserId);

    // Delete user (cascade deletes profile and documents due to foreign key)
    db.prepare('DELETE FROM users WHERE id = ?').run(targetUserId);

    logAudit(
      req.user.id,
      req.user.email,
      req.user.role,
      'DELETE_USER',
      'users',
      targetUserId,
      `Deleted account: ${targetUser.full_name} (${targetUser.email}, Role: ${targetUser.role})`,
      req
    );

    res.json({
      message: `Account for ${targetUser.full_name} (${targetUser.email}) has been permanently deleted from SDRMS.`
    });
  } catch (err) {
    console.error('Account deletion error:', err);
    res.status(500).json({ error: 'Failed to delete user account: ' + err.message });
  }
});

// GET /api/admin/master-data
router.get('/master-data', verifyToken, (req, res) => {
  const faculties = db.prepare('SELECT * FROM faculties ORDER BY name ASC').all();
  const departments = db.prepare(`
    SELECT d.*, f.name as faculty_name, f.dean_name
    FROM departments d
    LEFT JOIN faculties f ON d.faculty_id = f.id
    WHERE d.is_active = 1
    ORDER BY d.id ASC
  `).all();
  const designations = db.prepare('SELECT * FROM designations ORDER BY category ASC, name ASC').all();
  const docRequirements = db.prepare('SELECT * FROM document_requirements ORDER BY id ASC').all();
  const settingsRows = db.prepare('SELECT * FROM system_settings').all();

  const settings = {};
  settingsRows.forEach(r => { settings[r.key] = r.value; });

  res.json({
    faculties,
    departments,
    designations,
    docRequirements,
    settings
  });
});

// GET /api/admin/export/csv
router.get('/export/csv', verifyToken, requireRoles('registrar', 'dean', 'hod', 'hr', 'vc'), (req, res) => {
  const staff = db.prepare(`
    SELECT p.employee_id, p.full_name, d.name as department, f.name as faculty,
           p.designation, p.employee_category, p.employment_type, p.official_email,
           p.mobile, p.dob, p.joining_date_university, p.calculated_univ_exp_years,
           p.calculated_total_exp_years, p.workflow_status, p.submission_ref, p.submitted_at
    FROM staff_profiles p
    LEFT JOIN departments d ON p.department_id = d.id
    LEFT JOIN faculties f ON (p.faculty_id = f.id OR d.faculty_id = f.id)
    ORDER BY p.id ASC
  `).all();

  const headers = [
    'Employee ID', 'Full Name', 'Department', 'Faculty', 'Designation',
    'Category', 'Employment Type', 'Official Email', 'Mobile', 'Date of Birth',
    'Joining Date (Univ)', 'University Exp (Yrs)', 'Total Exp (Yrs)',
    'Verification Status', 'Submission Ref', 'Submission Date'
  ];

  let csv = headers.join(',') + '\r\n';

  staff.forEach(s => {
    const row = [
      `"${s.employee_id || ''}"`,
      `"${s.full_name || ''}"`,
      `"${s.department || ''}"`,
      `"${s.faculty || ''}"`,
      `"${s.designation || ''}"`,
      `"${s.employee_category || ''}"`,
      `"${s.employment_type || ''}"`,
      `"${s.official_email || ''}"`,
      `"${s.mobile || ''}"`,
      `"${s.dob || ''}"`,
      `"${s.joining_date_university || ''}"`,
      s.calculated_univ_exp_years || 0,
      s.calculated_total_exp_years || 0,
      `"${s.workflow_status || ''}"`,
      `"${s.submission_ref || ''}"`,
      `"${s.submitted_at || ''}"`
    ];
    csv += row.join(',') + '\r\n';
  });

  logAudit(req.user.id, req.user.email, req.user.role, 'EXPORT_CSV', 'staff_profiles', 'all', `Exported ${staff.length} staff records to CSV`, req);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="Chaitanya_University_Staff_Directory.csv"');
  res.send(csv);
});

module.exports = router;
