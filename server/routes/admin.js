const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { db } = require('../db');
const { verifyToken, requireRoles, logAudit } = require('../auth');
const { deleteUserFromNeon, syncUserToNeon } = require('../neon');
const { createNotification } = require('../notifications');

const isVercel = !!process.env.VERCEL;
const uploadsDir = isVercel ? '/tmp/uploads' : path.join(__dirname, '..', '..', 'uploads');

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

  // Base join - only real staff members (excluding reviewers/admins)
  const baseFrom = `
    FROM staff_profiles p
    INNER JOIN users u ON p.user_id = u.id AND u.role = 'staff'
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
    INNER JOIN users u ON p.user_id = u.id AND u.role = 'staff'
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

  // Strict Clearance Hierarchy Visibility Logic
  if (!status || status === 'All' || status === 'All Records') {
    // 'All' shows all faculty in jurisdiction (HOD sees complete department roster, Dean sees faculty roster)
  } else if (status === 'All Submitted') {
    query += " AND p.workflow_status != 'Draft'";
  } else if (status === 'Pending HOD') {
    query += " AND p.workflow_status IN ('Pending HOD Approval', 'Submitted')";
  } else if (status === 'Pending Dean') {
    query += " AND p.workflow_status = 'Pending Dean Approval'";
  } else if (status === 'Pending Registrar') {
    query += " AND p.workflow_status = 'Pending Registrar Approval'";
  } else if (status === 'Approved') {
    query += " AND p.workflow_status = 'Approved'";
  } else if (status === 'Correction Required') {
    query += " AND p.workflow_status = 'Correction Required'";
  } else if (status === 'Draft') {
    query += " AND p.workflow_status = 'Draft'";
  } else {
    query += ' AND p.workflow_status = ?';
    params.push(status);
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
  const academicContributions = db.prepare('SELECT * FROM academic_contributions WHERE staff_id = ? ORDER BY id DESC').all(profileId);
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
    academicContributions,
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

  // Send real-time multi-tier notification alerts
  const deptInfo = db.prepare(`
    SELECT d.name as dept_name, f.name as fac_name
    FROM departments d
    LEFT JOIN faculties f ON d.faculty_id = f.id
    WHERE d.id = ?
  `).get(profile.department_id);
  const deptName = deptInfo ? deptInfo.dept_name : 'Department';
  const facName = deptInfo ? deptInfo.fac_name : 'Faculty';

  if (action === 'APPROVE') {
    if (role === 'hod') {
      // 1. Notify Dean
      createNotification({
        target_role: 'dean',
        faculty_id: profile.faculty_id,
        title: '🏛️ HOD-Endorsed Dossier Awaiting Dean Clearance',
        message: `HOD (${req.user.full_name}) has evaluated and endorsed "${profile.full_name}" (${deptName}). Dossier is now pending your Level 2 Dean Clearance.`,
        type: 'submission',
        staff_profile_id: profile.id,
        staff_name: profile.full_name,
        department_name: deptName
      });
      // 2. Notify Faculty
      createNotification({
        user_id: profile.user_id,
        title: '✅ HOD Level 1 Clearance Endorsed!',
        message: `Head of Department (${req.user.full_name}) has evaluated and endorsed your dossier: "${remarks}". It is now routed to Dean of Faculty for Level 2 Clearance.`,
        type: 'approval',
        staff_profile_id: profile.id,
        staff_name: profile.full_name,
        department_name: deptName
      });
    } else if (role === 'dean') {
      // 1. Notify Registrar
      createNotification({
        target_role: 'registrar',
        title: '⭐ Dossier Awaiting Final University Seal',
        message: `Dean (${req.user.full_name}) has approved "${profile.full_name}" from Department of ${deptName} (${facName}). Awaiting Registrar Final Certification & University Seal.`,
        type: 'submission',
        staff_profile_id: profile.id,
        staff_name: profile.full_name,
        department_name: deptName
      });
      // 2. Notify Faculty
      createNotification({
        user_id: profile.user_id,
        title: '✅ Dean Level 2 Clearance Approved!',
        message: `Dean of Faculty (${req.user.full_name}) has granted clearance: "${remarks}". Your file has reached the Office of the Registrar for Final University Seal.`,
        type: 'approval',
        staff_profile_id: profile.id,
        staff_name: profile.full_name,
        department_name: deptName
      });
    } else if (role === 'registrar' || role === 'hr' || role === 'vc') {
      // 1. Notify Faculty
      createNotification({
        user_id: profile.user_id,
        title: '🎉 Official University Seal Conferred!',
        message: `The Registrar has officially granted clearance and sealed your 9-module staff dossier in permanent university archives. Remarks: "${remarks}".`,
        type: 'approval',
        staff_profile_id: profile.id,
        staff_name: profile.full_name,
        department_name: deptName
      });
      // 2. Notify HOD & Dean
      createNotification({
        target_role: 'hod',
        department_id: profile.department_id,
        title: '🏅 Official Clearance Conferred',
        message: `Registrar has officially sealed and approved "${profile.full_name}" (${deptName}).`,
        type: 'approval',
        staff_profile_id: profile.id
      });
      createNotification({
        target_role: 'dean',
        faculty_id: profile.faculty_id,
        title: '🏅 Official Clearance Conferred',
        message: `Registrar has officially sealed and approved "${profile.full_name}" (${deptName}).`,
        type: 'approval',
        staff_profile_id: profile.id
      });
    }
  } else if (action === 'CORRECTION_REQUIRED') {
    createNotification({
      user_id: profile.user_id,
      title: `⚠️ Revision Requested by ${role.toUpperCase()}`,
      message: `${req.user.full_name} (${role.toUpperCase()}) reviewed your dossier and requested corrections: "${remarks}". Please make necessary updates and re-submit for clearance.`,
      type: 'warning',
      staff_profile_id: profile.id,
      staff_name: profile.full_name,
      department_name: deptName
    });
  }

  res.json({
    message: actionMessage,
    from_status: profile.workflow_status,
    to_status: newStatus
  });
});

// DELETE /api/admin/user/:id - Permanent Account & Entire Dossier Purge
// Completely removes user credentials, staff profile, all 11 child module tables, and all physical files from disk
router.delete('/user/:id', verifyToken, requireRoles('hod', 'dean', 'registrar'), (req, res) => {
  const paramId = parseInt(req.params.id);

  if (isNaN(paramId)) {
    return res.status(400).json({ error: 'Invalid user or profile ID provided.' });
  }

  if (paramId === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own administrative account.' });
  }

  // 1. Resolve target user and target profile (paramId could be user_id or staff_profiles.id)
  let targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(paramId);
  let profile = null;

  if (targetUser) {
    profile = db.prepare('SELECT * FROM staff_profiles WHERE user_id = ?').get(targetUser.id);
  } else {
    profile = db.prepare('SELECT * FROM staff_profiles WHERE id = ?').get(paramId);
    if (profile) {
      targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(profile.user_id);
    }
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'Target user account not found.' });
  }

  const targetUserId = targetUser.id;
  const staffProfileId = profile ? profile.id : null;

  // 2. Permission checks:
  if (req.user.role === 'hod') {
    // HOD can only delete staff in their department
    const staffDeptId = (profile && profile.department_id) || targetUser.department_id;
    if (targetUser.role !== 'staff' || (staffDeptId !== req.user.department_id && targetUser.department_id !== req.user.department_id)) {
      return res.status(403).json({ error: 'HOD can only delete faculty accounts within their assigned department.' });
    }
  } else if (req.user.role === 'dean') {
    // Dean can delete faculty or HODs in their faculty
    const staffFacId = (profile && profile.faculty_id) || targetUser.faculty_id;
    const deptId = (profile && profile.department_id) || targetUser.department_id;
    const dept = deptId ? db.prepare('SELECT faculty_id FROM departments WHERE id = ?').get(deptId) : null;
    const belongsToFaculty = (staffFacId === req.user.faculty_id) || 
                             (targetUser.faculty_id === req.user.faculty_id) || 
                             (dept && dept.faculty_id === req.user.faculty_id);
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
    // 3. Collect ALL physical file references across all tables and profile
    const filesToDelete = new Set();

    const addFileRef = (fileRef) => {
      if (!fileRef || typeof fileRef !== 'string') return;
      const clean = fileRef.trim();
      if (!clean) return;
      const parts = clean.split(/[/\\]/);
      const filename = parts[parts.length - 1];
      if (filename && filename !== '.' && filename !== '..') {
        filesToDelete.add(filename);
      }
    };

    if (profile) {
      addFileRef(profile.photo_url);
      addFileRef(profile.appointment_order_file);
      addFileRef(profile.joining_report_file);
      addFileRef(profile.confirmation_order_file);
      addFileRef(profile.promotion_orders_file);
      addFileRef(profile.relieving_order_file);

      // Collect files from all 11 child tables:
      const docs = db.prepare('SELECT stored_filename, file_path FROM documents WHERE staff_id = ? OR uploaded_by = ?').all(staffProfileId, targetUserId);
      for (const d of docs) {
        addFileRef(d.stored_filename);
        addFileRef(d.file_path);
      }

      const eduDocs = db.prepare('SELECT degree_cert_file, marks_memo_file, supporting_doc_file FROM educational_qualifications WHERE staff_id = ?').all(staffProfileId);
      for (const e of eduDocs) {
        addFileRef(e.degree_cert_file);
        addFileRef(e.marks_memo_file);
        addFileRef(e.supporting_doc_file);
      }

      const profDocs = db.prepare('SELECT certificate_file FROM professional_qualifications WHERE staff_id = ?').all(staffProfileId);
      for (const p of profDocs) addFileRef(p.certificate_file);

      const expDocs = db.prepare('SELECT experience_cert_file FROM teaching_experiences WHERE staff_id = ?').all(staffProfileId);
      for (const e of expDocs) addFileRef(e.experience_cert_file);

      const pubDocs = db.prepare('SELECT evidence_file FROM research_publications WHERE staff_id = ?').all(staffProfileId);
      for (const p of pubDocs) addFileRef(p.evidence_file);

      const projDocs = db.prepare('SELECT sanction_order_file, completion_cert_file FROM research_projects WHERE staff_id = ?').all(staffProfileId);
      for (const p of projDocs) {
        addFileRef(p.sanction_order_file);
        addFileRef(p.completion_cert_file);
      }

      const patDocs = db.prepare('SELECT evidence_file FROM patents WHERE staff_id = ?').all(staffProfileId);
      for (const p of patDocs) addFileRef(p.evidence_file);

      const acadDocs = db.prepare('SELECT evidence_file FROM academic_contributions WHERE staff_id = ?').all(staffProfileId);
      for (const a of acadDocs) addFileRef(a.evidence_file);

      const trainDocs = db.prepare('SELECT certificate_file FROM training_programmes WHERE staff_id = ?').all(staffProfileId);
      for (const t of trainDocs) addFileRef(t.certificate_file);

      const prevDocs = db.prepare('SELECT experience_cert_file, relieving_letter_file FROM previous_employments WHERE staff_id = ?').all(staffProfileId);
      for (const p of prevDocs) {
        addFileRef(p.experience_cert_file);
        addFileRef(p.relieving_letter_file);
      }
    }

    // 4. Physical file deletion on disk from uploads directory
    for (const filename of filesToDelete) {
      try {
        const fullPath = path.join(uploadsDir, filename);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`[DELETE PURGE] Deleted physical file from uploads: ${fullPath}`);
        }
      } catch (fileErr) {
        console.warn(`[DELETE PURGE] Could not delete disk file ${filename}:`, fileErr.message);
      }
    }

    // 5. Database deletion across all 12 tables inside a single atomic transaction
    const executePurge = db.transaction(() => {
      if (staffProfileId) {
        // Delete all child tables associated with staff_profiles
        db.prepare('DELETE FROM educational_qualifications WHERE staff_id = ?').run(staffProfileId);
        db.prepare('DELETE FROM professional_qualifications WHERE staff_id = ?').run(staffProfileId);
        db.prepare('DELETE FROM teaching_experiences WHERE staff_id = ?').run(staffProfileId);
        db.prepare('DELETE FROM research_publications WHERE staff_id = ?').run(staffProfileId);
        db.prepare('DELETE FROM research_projects WHERE staff_id = ?').run(staffProfileId);
        db.prepare('DELETE FROM patents WHERE staff_id = ?').run(staffProfileId);
        db.prepare('DELETE FROM academic_contributions WHERE staff_id = ?').run(staffProfileId);
        db.prepare('DELETE FROM training_programmes WHERE staff_id = ?').run(staffProfileId);
        db.prepare('DELETE FROM previous_employments WHERE staff_id = ?').run(staffProfileId);
        db.prepare('DELETE FROM documents WHERE staff_id = ?').run(staffProfileId);
        db.prepare('DELETE FROM verification_logs WHERE staff_id = ?').run(staffProfileId);
      }

      // Clean up any remaining documents uploaded or verified by target user
      db.prepare('DELETE FROM documents WHERE uploaded_by = ? OR verified_by = ?').run(targetUserId, targetUserId);

      // Clean up verification logs where reviewer was target user
      db.prepare('DELETE FROM verification_logs WHERE reviewer_id = ?').run(targetUserId);

      // Nullify references in departments & faculties if target user was HOD or Dean
      db.prepare('UPDATE departments SET hod_id = NULL, hod_name = NULL WHERE hod_id = ?').run(targetUserId);
      db.prepare('UPDATE faculties SET dean_id = NULL, dean_name = NULL, dean_title = NULL WHERE dean_id = ?').run(targetUserId);

      // Nullify references in staff_profiles where hod_id or dean_id was target user
      db.prepare('UPDATE staff_profiles SET hod_id = NULL WHERE hod_id = ?').run(targetUserId);
      db.prepare('UPDATE staff_profiles SET dean_id = NULL WHERE dean_id = ?').run(targetUserId);

      // Delete staff profile
      if (staffProfileId) {
        db.prepare('DELETE FROM staff_profiles WHERE id = ?').run(staffProfileId);
      }
      db.prepare('DELETE FROM staff_profiles WHERE user_id = ?').run(targetUserId);

      // Delete audit logs for this user
      db.prepare('DELETE FROM audit_logs WHERE user_id = ?').run(targetUserId);

      // Finally, delete the user account
      db.prepare('DELETE FROM users WHERE id = ?').run(targetUserId);
    });

    executePurge();

    // Also permanently delete from Neon PostgreSQL Cloud Database in real-time
    deleteUserFromNeon(targetUserId, targetUser.email).catch(err => {
      console.error('Neon account deletion error:', err.message);
    });

    // 6. Log the permanent deletion audit
    logAudit(
      req.user.id,
      req.user.email,
      req.user.role,
      'PERMANENT_USER_PURGE',
      'users',
      targetUserId,
      `Permanently deleted account and all dossier data/files: ${targetUser.full_name} (${targetUser.email}, Role: ${targetUser.role}, Emp ID: ${targetUser.employee_id})`,
      req
    );

    res.json({
      message: `Account for ${targetUser.full_name} (${targetUser.email}) and all associated dossier records have been completely and permanently deleted from the university system.`
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
