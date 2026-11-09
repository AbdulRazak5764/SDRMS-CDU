const { db } = require('./db');
const { pool } = require('./neon');

/**
 * Creates an in-app university clearance notification
 */
function createNotification({
  user_id = null,
  target_role = null,
  department_id = null,
  faculty_id = null,
  title,
  message,
  type = 'info', // 'approval', 'submission', 'warning', 'reminder'
  staff_profile_id = null,
  staff_name = null,
  department_name = null
}) {
  try {
    const stmt = db.prepare(`
      INSERT INTO notifications (
        user_id, target_role, department_id, faculty_id, title, message,
        type, staff_profile_id, staff_name, department_name, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      user_id,
      target_role,
      department_id,
      faculty_id,
      title,
      message,
      type,
      staff_profile_id,
      staff_name,
      department_name
    );

    // Also mirror to Neon Cloud Database asynchronously if connected
    if (pool) {
      pool.query(`
        INSERT INTO notifications (
          user_id, target_role, department_id, faculty_id, title, message,
          type, staff_profile_id, staff_name, department_name, is_read
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0)
      `, [
        user_id, target_role, department_id, faculty_id, title, message,
        type, staff_profile_id, staff_name, department_name
      ]).catch(err => console.warn('Neon notification sync note:', err.message));
    }

    return result.lastInsertRowid;
  } catch (err) {
    console.error('Error creating notification:', err.message);
    return null;
  }
}

/**
 * Retrieves notifications and generates real-time evaluation reminders for any authority
 */
function getNotificationsForUser(user) {
  const notifs = [];

  // 1. Fetch persistent database notifications
  let query = `
    SELECT * FROM notifications
    WHERE 
      user_id = ?
  `;
  const params = [user.id];

  if (user.role === 'hod') {
    query += ` OR (target_role = 'hod' AND (department_id = ? OR department_id IS NULL))`;
    params.push(user.department_id || null);
  } else if (user.role === 'dean') {
    query += ` OR (target_role = 'dean' AND (faculty_id = ? OR faculty_id IS NULL))`;
    params.push(user.faculty_id || null);
  } else if (user.role === 'registrar' || user.role === 'vc' || user.role === 'hr') {
    query += ` OR target_role = 'registrar' OR target_role = 'all'`;
  }

  query += ` ORDER BY created_at DESC LIMIT 30`;

  const dbNotifs = db.prepare(query).all(...params);
  notifs.push(...dbNotifs);

  // 2. Real-time Pending Evaluation Reminders (24-hour / Action Required Prompts)
  if (user.role === 'hod') {
    const pendingStaff = db.prepare(`
      SELECT p.id, p.full_name, p.employee_id, d.name as dept_name, p.submitted_at
      FROM staff_profiles p
      JOIN departments d ON p.department_id = d.id
      WHERE p.department_id = ?
        AND p.workflow_status IN ('Pending HOD Approval', 'Submitted')
      ORDER BY p.submitted_at ASC
    `).all(user.department_id);

    pendingStaff.forEach((st, idx) => {
      // Check if already notified
      const alreadyHas = notifs.some(n => n.staff_profile_id === st.id && n.type === 'reminder');
      if (!alreadyHas) {
        notifs.unshift({
          id: `reminder-hod-${st.id}-${idx}`,
          title: `⏰ Action Required: Evaluate Faculty Dossier`,
          message: `Faculty member "${st.full_name}" (${st.employee_id}) has submitted their 9-module dossier for your HOD Evaluation & Scrutiny. Please review and endorse.`,
          type: 'reminder',
          staff_profile_id: st.id,
          staff_name: st.full_name,
          department_name: st.dept_name,
          is_read: 0,
          created_at: st.submitted_at || new Date().toISOString()
        });
      }
    });
  } else if (user.role === 'dean') {
    const pendingStaff = db.prepare(`
      SELECT p.id, p.full_name, p.employee_id, d.name as dept_name, f.name as fac_name, p.hod_reviewed_at
      FROM staff_profiles p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN faculties f ON (p.faculty_id = f.id OR d.faculty_id = f.id)
      WHERE (p.faculty_id = ? OR d.faculty_id = ?)
        AND p.workflow_status = 'Pending Dean Approval'
      ORDER BY p.hod_reviewed_at ASC
    `).all(user.faculty_id, user.faculty_id);

    pendingStaff.forEach((st, idx) => {
      const alreadyHas = notifs.some(n => n.staff_profile_id === st.id && n.type === 'reminder');
      if (!alreadyHas) {
        notifs.unshift({
          id: `reminder-dean-${st.id}-${idx}`,
          title: `🏛️ Dean Clearance Pending: ${st.full_name}`,
          message: `HOD has endorsed "${st.full_name}" (${st.dept_name || 'Department'}). Dossier is awaiting your Level 2 Dean Review and endorsement.`,
          type: 'reminder',
          staff_profile_id: st.id,
          staff_name: st.full_name,
          department_name: st.dept_name,
          is_read: 0,
          created_at: st.hod_reviewed_at || new Date().toISOString()
        });
      }
    });
  } else if (user.role === 'registrar' || user.role === 'vc') {
    const pendingStaff = db.prepare(`
      SELECT p.id, p.full_name, p.employee_id, d.name as dept_name, f.name as fac_name, p.dean_reviewed_at
      FROM staff_profiles p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN faculties f ON (p.faculty_id = f.id OR d.faculty_id = f.id)
      WHERE p.workflow_status = 'Pending Registrar Approval'
      ORDER BY p.dean_reviewed_at ASC
    `).all();

    pendingStaff.forEach((st, idx) => {
      const alreadyHas = notifs.some(n => n.staff_profile_id === st.id && n.type === 'reminder');
      if (!alreadyHas) {
        notifs.unshift({
          id: `reminder-reg-${st.id}-${idx}`,
          title: `⭐ Final Seal Required: ${st.full_name}`,
          message: `Dossier from ${st.dept_name} (${st.fac_name || 'University Faculty'}) has received HOD & Dean clearances and is awaiting your Registrar Final Certification & Official Seal.`,
          type: 'reminder',
          staff_profile_id: st.id,
          staff_name: st.full_name,
          department_name: st.dept_name,
          is_read: 0,
          created_at: st.dean_reviewed_at || new Date().toISOString()
        });
      }
    });
  }

  return notifs;
}

module.exports = {
  createNotification,
  getNotificationsForUser
};

