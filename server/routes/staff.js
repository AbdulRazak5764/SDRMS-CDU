const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { verifyToken, logAudit } = require('../auth');
const { syncPublicationToNeon, syncBulkPublicationsToNeon } = require('../neon');

// Helper to calculate completion percentage and omission checklist
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
  const eduCount = db.prepare('SELECT COUNT(*) as cnt FROM educational_qualifications WHERE staff_id = ?').get(profileId).cnt;
  if (eduCount > 0) score += 10;

  // 4. Documents Upload
  const docCount = db.prepare('SELECT COUNT(*) as cnt FROM documents WHERE staff_id = ?').get(profileId).cnt;
  if (docCount > 0) score += 10;

  const finalCompletion = Math.min(100, Math.max(25, score));

  // Update profile completion in DB
  db.prepare('UPDATE staff_profiles SET completion_percentage = ? WHERE id = ?').run(finalCompletion, profileId);

  return { completion: finalCompletion, omissions };
}

// Helper to auto-calculate years between dates
function calculateExperienceYears(startDateStr, endDateStr) {
  if (!startDateStr) return 0;
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();
  if (isNaN(start.getTime())) return 0;
  const diffTime = Math.max(0, end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return parseFloat((diffDays / 365.25).toFixed(1));
}

// GET /api/staff/my-profile
router.get('/my-profile', verifyToken, (req, res) => {
  // Ensure profile exists for this user
  let profile = db.prepare(`
    SELECT p.*, d.name as department_name, d.hod_name, f.name as faculty_name, f.dean_name, u.email as user_email, u.role as user_role
    FROM staff_profiles p
    LEFT JOIN departments d ON p.department_id = d.id
    LEFT JOIN faculties f ON (p.faculty_id = f.id OR d.faculty_id = f.id)
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
  `).get(req.user.id);

  if (!profile) {
    // Lookup default department & faculty from user
    const userRow = db.prepare('SELECT department_id, faculty_id FROM users WHERE id = ?').get(req.user.id);
    let facId = userRow?.faculty_id;
    let hodId = null;
    let deanId = null;

    if (userRow?.department_id) {
      const dept = db.prepare('SELECT faculty_id, hod_id FROM departments WHERE id = ?').get(userRow.department_id);
      if (dept) {
        facId = facId || dept.faculty_id;
        hodId = dept.hod_id;
      }
    }
    if (facId) {
      const fac = db.prepare('SELECT dean_id FROM faculties WHERE id = ?').get(facId);
      if (fac) deanId = fac.dean_id;
    }

    const info = db.prepare(`
      INSERT INTO staff_profiles (
        user_id, employee_id, full_name, official_email, department_id, faculty_id,
        hod_id, dean_id, employee_category, workflow_status, completion_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', 25)
    `).run(
      req.user.id,
      req.user.employee_id,
      req.user.full_name,
      req.user.email,
      req.user.department_id,
      facId,
      hodId,
      deanId,
      req.user.category || 'Teaching'
    );
    profile = db.prepare(`
      SELECT p.*, d.name as department_name, d.hod_name, f.name as faculty_name, f.dean_name, u.email as user_email, u.role as user_role
      FROM staff_profiles p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN faculties f ON (p.faculty_id = f.id OR d.faculty_id = f.id)
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(info.lastInsertRowid);
  }

  const profileId = profile.id;

  // Resolve assigned HOD details
  let assignedHod = null;
  if (profile.department_id) {
    const d = db.prepare(`
      SELECT d.hod_name, u.email as hod_email, u.full_name, u.employee_id
      FROM departments d
      LEFT JOIN users u ON d.hod_id = u.id
      WHERE d.id = ?
    `).get(profile.department_id);
    if (d) {
      assignedHod = {
        name: d.hod_name || d.full_name || 'Department Head',
        email: d.hod_email || 'hod@chaitanya.edu.in'
      };
    }
  }

  // Resolve assigned Dean details
  let assignedDean = null;
  const facultyId = profile.faculty_id || (profile.department_id ? db.prepare('SELECT faculty_id FROM departments WHERE id = ?').get(profile.department_id)?.faculty_id : null);
  if (facultyId) {
    const f = db.prepare(`
      SELECT f.name, f.dean_name, f.dean_title, u.email as dean_email
      FROM faculties f
      LEFT JOIN users u ON f.dean_id = u.id
      WHERE f.id = ?
    `).get(facultyId);
    if (f) {
      assignedDean = {
        name: f.dean_name || 'Dean of Faculty',
        title: f.dean_title || f.name,
        email: f.dean_email || 'dean@chaitanya.edu.in'
      };
    }
  }

  // Registrar info
  const registrar = db.prepare("SELECT full_name, email FROM users WHERE role = 'registrar' LIMIT 1").get();
  const assignedRegistrar = {
    name: registrar ? registrar.full_name : 'Office of the Registrar',
    title: 'Registrar & Chief Academic Administrator',
    email: registrar ? registrar.email : 'registrar@chaitanya.edu.in'
  };

  // Fetch all repeatable sections
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

  const { completion, omissions } = calculateProfileStatus(profileId);
  profile.completion_percentage = completion;

  res.json({
    profile,
    assignedHod,
    assignedDean,
    assignedRegistrar,
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
    verificationLogs,
    omissions
  });
});

// PUT /api/staff/my-profile
// Save draft or update form fields
router.put('/my-profile', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT * FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found.' });
  }

  // Prevent edits if already submitted or approved unless reopened for correction
  const lockedStatuses = ['Submitted', 'Under Verification', 'Approved', 'Archived'];
  if (lockedStatuses.includes(profile.workflow_status)) {
    return res.status(400).json({
      error: `Your profile is currently '${profile.workflow_status}' and locked against edits. Request your Department Head or Establishment section to return for correction if changes are needed.`
    });
  }

  const b = req.body;

  // Calculate university experience automatically
  let calculatedUnivExp = profile.calculated_univ_exp_years;
  if (b.joining_date_university) {
    calculatedUnivExp = calculateExperienceYears(b.joining_date_university, null);
  }

  // Calculate total professional experience: prior service + university service
  const priorYears = parseFloat(b.relevant_previous_service_years || profile.relevant_previous_service_years || 0);
  const totalExp = parseFloat((calculatedUnivExp + priorYears).toFixed(1));

  // Update users table if employee_id, full_name, or salutation changed
  if (b.employee_id && b.employee_id.trim()) {
    db.prepare('UPDATE users SET employee_id = ? WHERE id = ?').run(b.employee_id.trim(), req.user.id);
  }
  const effectiveSalutation = b.salutation !== undefined ? b.salutation : (profile.salutation || '');
  const effectiveBaseName = b.full_name !== undefined ? b.full_name.trim() : (profile.full_name || '');
  if (effectiveBaseName) {
    const combinedFullName = [effectiveSalutation, effectiveBaseName].filter(Boolean).join(' ');
    db.prepare('UPDATE users SET full_name = ? WHERE id = ?').run(combinedFullName, req.user.id);
  }

  const stmt = db.prepare(`
    UPDATE staff_profiles SET
      employee_id = COALESCE(?, employee_id),
      full_name = COALESCE(?, full_name),
      salutation = COALESCE(?, salutation),
      blood_group = COALESCE(?, blood_group),
      social_category = COALESCE(?, social_category),
      administrative_unit = COALESCE(?, administrative_unit),
      name_regional = COALESCE(?, name_regional),
      previous_name = COALESCE(?, previous_name),
      dob = COALESCE(?, dob),
      gender = COALESCE(?, gender),
      marital_status = COALESCE(?, marital_status),
      nationality = COALESCE(?, nationality),
      official_email = COALESCE(?, official_email),
      personal_email = COALESCE(?, personal_email),
      mobile = COALESCE(?, mobile),
      alternate_contact = COALESCE(?, alternate_contact),
      current_address = COALESCE(?, current_address),
      permanent_address = COALESCE(?, permanent_address),
      city = COALESCE(?, city),
      state = COALESCE(?, state),
      pincode = COALESCE(?, pincode),
      country = COALESCE(?, country),
      emergency_contact_name = COALESCE(?, emergency_contact_name),
      emergency_contact_relationship = COALESCE(?, emergency_contact_relationship),
      emergency_contact_phone = COALESCE(?, emergency_contact_phone),

      employee_category = COALESCE(?, employee_category),
      faculty_id = COALESCE(?, faculty_id),
      department_id = COALESCE(?, department_id),
      designation = COALESCE(?, designation),
      employment_type = COALESCE(?, employment_type),
      appointment_order_no = COALESCE(?, appointment_order_no),
      appointment_order_date = COALESCE(?, appointment_order_date),
      joining_date_university = COALESCE(?, joining_date_university),
      joining_date_present_position = COALESCE(?, joining_date_present_position),
      joining_date_present_department = COALESCE(?, joining_date_present_department),
      previous_designation_univ = COALESCE(?, previous_designation_univ),
      reporting_officer = COALESCE(?, reporting_officer),
      campus_location = COALESCE(?, campus_location),
      employment_status = COALESCE(?, employment_status),
      probation_status = COALESCE(?, probation_status),
      confirmation_date = COALESCE(?, confirmation_date),
      previous_employer = COALESCE(?, previous_employer),
      previous_employment_period = COALESCE(?, previous_employment_period),
      relevant_previous_service_years = ?,
      calculated_univ_exp_years = ?,
      calculated_total_exp_years = ?,

      pay_scale = COALESCE(?, pay_scale),
      basic_pay = COALESCE(?, basic_pay),
      pay_components = COALESCE(?, pay_components),
      payroll_code = COALESCE(?, payroll_code),
      salary_bank_name = COALESCE(?, salary_bank_name),
      salary_account_masked = COALESCE(?, salary_account_masked),

      leave_deputation_info = COALESCE(?, leave_deputation_info),
      promotion_history_notes = COALESCE(?, promotion_history_notes),
      transfer_history_notes = COALESCE(?, transfer_history_notes),
      service_gap_explanation = COALESCE(?, service_gap_explanation),

      last_saved_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(
    b.employee_id,
    b.full_name,
    b.salutation !== undefined ? (b.salutation || null) : (b.title !== undefined ? (b.title || null) : null),
    b.blood_group !== undefined ? (b.blood_group || null) : null,
    b.social_category !== undefined ? (b.social_category || null) : null,
    b.administrative_unit !== undefined ? (b.administrative_unit || null) : null,
    b.name_regional, b.previous_name, b.dob, b.gender, b.marital_status, b.nationality,
    b.official_email, b.personal_email, b.mobile, b.alternate_contact,
    b.current_address, b.permanent_address, b.city, b.state, b.pincode, b.country,
    b.emergency_contact_name, b.emergency_contact_relationship, b.emergency_contact_phone,

    b.employee_category, b.faculty_id, b.department_id, b.designation, b.employment_type,
    b.appointment_order_no, b.appointment_order_date,
    b.joining_date_university, b.joining_date_present_position, b.joining_date_present_department,
    b.previous_designation_univ, b.reporting_officer, b.campus_location, b.employment_status,
    b.probation_status, b.confirmation_date, b.previous_employer, b.previous_employment_period,
    priorYears, calculatedUnivExp, totalExp,

    b.pay_scale, b.basic_pay, b.pay_components, b.payroll_code, b.salary_bank_name, b.salary_account_masked,
    b.leave_deputation_info, b.promotion_history_notes, b.transfer_history_notes, b.service_gap_explanation,

    profile.id
  );

  const { completion, omissions } = calculateProfileStatus(profile.id);

  logAudit(req.user.id, req.user.email, req.user.role, 'PROFILE_SAVE_DRAFT', 'staff_profiles', profile.id, 'Saved draft changes to staff profile', req);

  res.json({
    message: 'Profile details saved successfully.',
    completion_percentage: completion,
    omissions
  });
});

// POST /api/staff/education (Add qualification)
router.post('/education', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id, workflow_status FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found.' });
  if (['Submitted', 'Under Verification', 'Approved'].includes(profile.workflow_status)) {
    return res.status(400).json({ error: 'Cannot modify qualifications while profile is submitted or approved.' });
  }

  const { level, degree_title, discipline, institution, college, country, year_of_admission, year_of_completion, award_month_year, mode_of_study, registration_no, class_grade, percentage_or_cgpa, max_marks, marks_obtained, equivalence_details } = req.body;

  if (!level || !degree_title || !institution) {
    return res.status(400).json({ error: 'Level, degree title, and institution are required.' });
  }

  const stmt = db.prepare(`
    INSERT INTO educational_qualifications (
      staff_id, level, degree_title, discipline, institution, college, country,
      year_of_admission, year_of_completion, award_month_year, mode_of_study,
      registration_no, class_grade, percentage_or_cgpa, max_marks, marks_obtained, equivalence_details
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    profile.id, level, degree_title, discipline || '', institution, college || '', country || 'India',
    year_of_admission ? parseInt(year_of_admission) : null,
    year_of_completion ? parseInt(year_of_completion) : null,
    award_month_year || '', mode_of_study || 'Full-time', registration_no || '',
    class_grade || '', percentage_or_cgpa || '',
    max_marks ? parseFloat(max_marks) : null,
    marks_obtained ? parseFloat(marks_obtained) : null,
    equivalence_details || ''
  );

  calculateProfileStatus(profile.id);
  res.json({ message: 'Qualification added successfully.', id: info.lastInsertRowid });
});

// DELETE /api/staff/education/:id
router.delete('/education/:id', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id, workflow_status FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found.' });

  db.prepare('DELETE FROM educational_qualifications WHERE id = ? AND staff_id = ?').run(req.params.id, profile.id);
  calculateProfileStatus(profile.id);
  res.json({ message: 'Qualification removed successfully.' });
});

// Repeatable: Professional Qualifications
router.post('/professional', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id, workflow_status FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found.' });

  const { qualification_type, title_or_exam, qualifying_authority, registration_no, award_date, validity_date } = req.body;
  if (!title_or_exam) return res.status(400).json({ error: 'Examination / accreditation title is required.' });

  const qualType = (qualification_type && qualification_type.trim())
    ? qualification_type.trim()
    : ((title_or_exam.toLowerCase().includes('council') || title_or_exam.toLowerCase().includes('pharmacist') || title_or_exam.toLowerCase().includes('nurse') || title_or_exam.toLowerCase().includes('advocate'))
        ? 'Statutory Council Registration'
        : 'National / State Eligibility Test');

  const stmt = db.prepare(`
    INSERT INTO professional_qualifications (staff_id, qualification_type, title_or_exam, qualifying_authority, registration_no, award_date, validity_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(profile.id, qualType, title_or_exam, qualifying_authority || '', registration_no || '', award_date || null, validity_date || null);
  res.json({ message: 'Professional qualification recorded.', id: info.lastInsertRowid });
});

router.delete('/professional/:id', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  db.prepare('DELETE FROM professional_qualifications WHERE id = ? AND staff_id = ?').run(req.params.id, profile.id);
  res.json({ message: 'Record removed.' });
});

// Repeatable: Teaching Experience
router.post('/teaching-exp', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id, workflow_status FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found.' });

  const { institution_name, designation_held, department, institution_type, employment_type, start_date, end_date, is_current, full_or_part_time, subjects_taught, teaching_involvement } = req.body;
  if (!institution_name || !designation_held || !start_date) return res.status(400).json({ error: 'Institution name, designation, and start date are required.' });

  const stmt = db.prepare(`
    INSERT INTO teaching_experiences (
      staff_id, institution_name, designation_held, department, institution_type, employment_type,
      start_date, end_date, is_current, full_or_part_time, subjects_taught, teaching_involvement
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(profile.id, institution_name, designation_held, department || '', institution_type || 'University', employment_type || 'Regular', start_date, end_date || null, is_current ? 1 : 0, full_or_part_time || 'Full-time', subjects_taught || '', teaching_involvement || 'UG');
  calculateProfileStatus(profile.id);
  res.json({ message: 'Teaching experience recorded.', id: info.lastInsertRowid });
});

router.delete('/teaching-exp/:id', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  db.prepare('DELETE FROM teaching_experiences WHERE id = ? AND staff_id = ?').run(req.params.id, profile.id);
  res.json({ message: 'Record removed.' });
});

// Repeatable: Research Publications
// Helper: Clean and extract standard DOI from URLs
function extractDoi(raw) {
  if (!raw) return '';
  const match = raw.match(/10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/);
  return match ? match[0] : raw.trim();
}

// GET /api/staff/fetch-doi - Instant DOI metadata auto-fetch from official CrossRef registry (Public utility)
router.get('/fetch-doi', async (req, res) => {
  const rawDoi = req.query.doi;
  if (!rawDoi) return res.status(400).json({ error: 'DOI is required.' });

  const cleanDoi = extractDoi(rawDoi);
  if (!cleanDoi) return res.status(400).json({ error: 'Invalid DOI format.' });

  try {
    const crossRefUrl = `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`;
    const response = await fetch(crossRefUrl, {
      headers: {
        'User-Agent': 'Chaitanya-University-SDRMS/1.0 (mailto:admin@chaitanya.edu.in)'
      }
    });

    if (!response.ok) {
      return res.status(404).json({ error: `DOI not found on CrossRef registry (${cleanDoi}). Please check the number or enter manually.` });
    }

    const json = await response.json();
    const m = json.message;

    // Format authors
    const authorsList = (m.author || []).map(a => {
      const parts = [a.given, a.family].filter(Boolean);
      return parts.join(' ');
    }).filter(Boolean);
    const authors = authorsList.join(', ');

    // Format journal/conference name
    const journalName = (m['container-title'] && m['container-title'][0]) || m.publisher || '';

    // Format year
    const yearParts = m['published-print']?.['date-parts']?.[0] || m['published-online']?.['date-parts']?.[0] || m.issued?.['date-parts']?.[0];
    const year = yearParts && yearParts[0] ? parseInt(yearParts[0]) : (m.created?.['date-parts']?.[0]?.[0] || new Date().getFullYear());

    // Auto-detect high-impact indexing
    const publisherOrJournal = `${m.publisher || ''} ${journalName}`.toLowerCase();
    let indexing = 'Peer Reviewed, UGC-CARE';
    if (/ieee|elsevier|springer|nature|wiley|acm|mdpi|taylor & francis|oxford|cambridge|sage|science/i.test(publisherOrJournal)) {
      indexing = 'Scopus, Web of Science, UGC-CARE';
    } else if (/ugc|care|peer/i.test(publisherOrJournal)) {
      indexing = 'UGC-CARE Listed';
    }

    res.json({
      title: (m.title && m.title[0]) || '',
      authors: authors || '',
      journal_or_conf_name: journalName,
      publication_year: year,
      volume: m.volume || '',
      issue: m.issue || '',
      page_numbers: m.page || m['article-number'] || '',
      doi: m.DOI || cleanDoi,
      url: m.URL || `https://doi.org/${cleanDoi}`,
      indexing,
      publisher: m.publisher || ''
    });
  } catch (err) {
    console.error('CrossRef fetch error:', err.message);
    res.status(500).json({ error: 'Failed to connect to CrossRef registry. Please check your network or enter details manually.' });
  }
});

// POST /api/staff/bulk-publications - Import multiple papers at once (for 80+ papers)
router.post('/bulk-publications', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found.' });

  const { publications } = req.body;
  if (!Array.isArray(publications) || publications.length === 0) {
    return res.status(400).json({ error: 'Valid array of publications required.' });
  }

  const stmt = db.prepare(`
    INSERT INTO research_publications (staff_id, title, authors, journal_or_conf_name, publication_year, volume, issue, page_numbers, doi, indexing, url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let addedCount = 0;
  const insertMany = db.transaction((papers) => {
    for (const p of papers) {
      if (p.title && p.journal_or_conf_name) {
        stmt.run(
          profile.id,
          p.title,
          p.authors || 'Self',
          p.journal_or_conf_name,
          p.publication_year ? parseInt(p.publication_year) : null,
          p.volume || '',
          p.issue || '',
          p.page_numbers || '',
          p.doi || '',
          p.indexing || 'Scopus, Web of Science',
          p.url || ''
        );
        addedCount++;
      }
    }
  });

  insertMany(publications);

  // Sync to Neon PostgreSQL in real-time
  syncBulkPublicationsToNeon(publications, req.user.employee_id).catch(err => {
    console.error('Neon bulk publications sync error:', err.message);
  });

  res.json({ message: `Successfully imported ${addedCount} research publications.`, count: addedCount });
});

router.post('/publication', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found.' });

  const { title, authors, journal_or_conf_name, publication_year, volume, issue, page_numbers, doi, indexing, url } = req.body;
  if (!title || !authors || !journal_or_conf_name) return res.status(400).json({ error: 'Title, authors, and journal/conference name are required.' });

  const stmt = db.prepare(`
    INSERT INTO research_publications (staff_id, title, authors, journal_or_conf_name, publication_year, volume, issue, page_numbers, doi, indexing, url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(profile.id, title, authors, journal_or_conf_name, publication_year ? parseInt(publication_year) : null, volume || '', issue || '', page_numbers || '', doi || '', indexing || '', url || '');

  // Sync to Neon PostgreSQL in real-time
  syncPublicationToNeon({
    staff_id: profile.id,
    title,
    authors,
    journal_or_conf_name,
    publication_year,
    volume,
    issue,
    page_numbers,
    doi,
    indexing,
    url
  }, req.user.employee_id).catch(err => console.error('Neon pub sync error:', err.message));

  res.json({ message: 'Publication recorded.', id: info.lastInsertRowid });
});

router.delete('/publication/:id', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  db.prepare('DELETE FROM research_publications WHERE id = ? AND staff_id = ?').run(req.params.id, profile.id);
  res.json({ message: 'Publication removed.' });
});

// Repeatable: Research Projects
router.post('/project', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  const { title, funding_agency, role, sanctioned_amount, duration, status } = req.body;
  if (!title || !funding_agency) return res.status(400).json({ error: 'Project title and funding agency are required.' });

  const stmt = db.prepare(`
    INSERT INTO research_projects (staff_id, title, funding_agency, role, sanctioned_amount, duration, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(profile.id, title, funding_agency, role || 'Principal Investigator', sanctioned_amount ? parseFloat(sanctioned_amount) : 0, duration || '', status || 'Ongoing');
  res.json({ message: 'Research project added.', id: info.lastInsertRowid });
});

router.delete('/project/:id', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  db.prepare('DELETE FROM research_projects WHERE id = ? AND staff_id = ?').run(req.params.id, profile.id);
  res.json({ message: 'Project removed.' });
});

// Repeatable: Patents
router.post('/patent', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  const { title, application_number, filing_date, grant_number, grant_date, applicant_inventors, status } = req.body;
  if (!title || !application_number) return res.status(400).json({ error: 'Title and application number are required.' });

  const stmt = db.prepare(`
    INSERT INTO patents (staff_id, title, application_number, filing_date, grant_number, grant_date, applicant_inventors, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(profile.id, title, application_number, filing_date || null, grant_number || '', grant_date || null, applicant_inventors || '', status || 'Filed');
  res.json({ message: 'Patent entry added.', id: info.lastInsertRowid });
});

router.delete('/patent/:id', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  db.prepare('DELETE FROM patents WHERE id = ? AND staff_id = ?').run(req.params.id, profile.id);
  res.json({ message: 'Patent removed.' });
});

// Repeatable: Academic Contributions (Books, awards, Ph.D. guidance)
router.post('/academic-contrib', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  const { category, title_or_activity, details, academic_year } = req.body;
  if (!category || !title_or_activity) return res.status(400).json({ error: 'Category and title/activity are required.' });

  const stmt = db.prepare(`
    INSERT INTO academic_contributions (staff_id, category, title_or_activity, details, academic_year)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(profile.id, category, title_or_activity, details || '', academic_year || '');
  res.json({ message: 'Academic contribution recorded.', id: info.lastInsertRowid });
});

router.delete('/academic-contrib/:id', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  db.prepare('DELETE FROM academic_contributions WHERE id = ? AND staff_id = ?').run(req.params.id, profile.id);
  res.json({ message: 'Contribution removed.' });
});

// Repeatable: Training Programmes
router.post('/training', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  const { programme_title, organizing_institution, category, start_date, end_date, duration_hours_days, mode, certificate_no } = req.body;
  if (!programme_title || !organizing_institution) return res.status(400).json({ error: 'Programme title and organizing institution are required.' });

  const stmt = db.prepare(`
    INSERT INTO training_programmes (staff_id, programme_title, organizing_institution, category, start_date, end_date, duration_hours_days, mode, certificate_no)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(profile.id, programme_title, organizing_institution, category || 'FDP', start_date || null, end_date || null, duration_hours_days || '', mode || 'Offline', certificate_no || '');
  res.json({ message: 'Training programme added.', id: info.lastInsertRowid });
});

router.delete('/training/:id', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  db.prepare('DELETE FROM training_programmes WHERE id = ? AND staff_id = ?').run(req.params.id, profile.id);
  res.json({ message: 'Training entry removed.' });
});

// Repeatable: Previous Employment
router.post('/previous-employment', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  const { employer_name, designation, department, employment_type, date_of_joining, date_of_leaving, reason_for_leaving } = req.body;
  if (!employer_name || !designation || !date_of_joining) return res.status(400).json({ error: 'Employer name, designation, and joining date are required.' });

  const stmt = db.prepare(`
    INSERT INTO previous_employments (staff_id, employer_name, designation, department, employment_type, date_of_joining, date_of_leaving, reason_for_leaving)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(profile.id, employer_name, designation, department || '', employment_type || 'Regular', date_of_joining, date_of_leaving || null, reason_for_leaving || '');
  res.json({ message: 'Previous employment record added.', id: info.lastInsertRowid });
});

router.delete('/previous-employment/:id', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT id FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  db.prepare('DELETE FROM previous_employments WHERE id = ? AND staff_id = ?').run(req.params.id, profile.id);
  res.json({ message: 'Previous employment removed.' });
});

// POST /api/staff/submit
// Section 9 / 12: Final Submission with Multi-Tier Approval Routing
router.post('/submit', verifyToken, (req, res) => {
  const profile = db.prepare('SELECT * FROM staff_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found.' });

  const { declaration_agreed } = req.body;
  if (!declaration_agreed) {
    return res.status(400).json({
      error: 'You must confirm the statutory declaration statement before final submission.'
    });
  }

  // Check omissions
  const { completion, omissions } = calculateProfileStatus(profile.id);
  if (omissions.length > 0) {
    return res.status(400).json({
      error: 'Cannot submit profile. Please complete the following required items before submitting.',
      omissions
    });
  }

  // Lookup HOD and Dean
  let hodId = profile.hod_id;
  let deanId = profile.dean_id;

  if (profile.department_id) {
    const dept = db.prepare('SELECT faculty_id, hod_id FROM departments WHERE id = ?').get(profile.department_id);
    if (dept) {
      hodId = hodId || dept.hod_id;
      if (dept.faculty_id) {
        const fac = db.prepare('SELECT dean_id FROM faculties WHERE id = ?').get(dept.faculty_id);
        if (fac) deanId = deanId || fac.dean_id;
      }
    }
  }

  // Determine target approval status based on submitter's role
  const userRole = req.user.role;
  let newStatus = 'Pending HOD Approval';
  let routingMessage = 'Your profile has been submitted to your Head of Department (HOD) for Level 1 review and clearance.';

  if (userRole === 'hod') {
    newStatus = 'Pending Dean Approval';
    routingMessage = 'Your HOD profile dossier has been forwarded to your Dean for Level 2 verification.';
  } else if (userRole === 'dean') {
    newStatus = 'Pending Registrar Approval';
    routingMessage = 'Your Dean profile dossier has been forwarded to the Registrar for Final University Certification.';
  } else if (userRole === 'registrar' || userRole === 'vc') {
    newStatus = 'Approved';
    routingMessage = 'Official University Record certified and approved.';
  }

  // Generate Reference Number: CDU-SDRMS-YYYY-XXXX
  const year = new Date().getFullYear();
  const subRef = profile.submission_ref || `CDU-SDRMS-${year}-${String(profile.id).padStart(4, '0')}`;
  const newVersion = (profile.version_number || 1) + 1;

  const stmt = db.prepare(`
    UPDATE staff_profiles SET
      workflow_status = ?,
      version_number = ?,
      submission_ref = ?,
      hod_id = ?,
      dean_id = ?,
      declaration_agreed = 1,
      declaration_date = CURRENT_TIMESTAMP,
      submitted_at = CURRENT_TIMESTAMP,
      completion_percentage = 100,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(newStatus, newVersion, subRef, hodId, deanId, profile.id);

  // Log in verification log
  db.prepare(`
    INSERT INTO verification_logs (
      staff_id, action, from_status, to_status, reviewer_name, reviewer_role, section_affected, remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    profile.id,
    'Profile Submission',
    profile.workflow_status,
    newStatus,
    profile.full_name || req.user.full_name,
    userRole,
    'Statutory Declaration & Clearance Submission',
    `${routingMessage} Reference: ${subRef}`
  );

  logAudit(req.user.id, req.user.email, userRole, 'PROFILE_SUBMIT', 'staff_profiles', profile.id, `Submitted staff profile ref ${subRef} (Status: ${newStatus})`, req);

  res.json({
    message: routingMessage,
    submission_ref: subRef,
    version_number: newVersion,
    workflow_status: newStatus,
    submitted_at: new Date().toISOString()
  });
});

module.exports = router;
