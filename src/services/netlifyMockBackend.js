/**
 * Chaitanya (Deemed to be University) — SDRMS Netlify Embedded Database Engine
 * Enables 100% full-functionality client-side execution when deployed to Netlify static hosting!
 */

const STORAGE_KEY = 'sdrms_embedded_cloud_db_v2';

const OFFICIAL_11_DEPTS = [
  { id: 1, name: 'Department of Engineering', code: 'ENG', faculty_id: 1, faculty_name: 'Faculty of Engineering and Technology', hod_id: 101, hod_name: 'Dr. K. V. S. Sharma', dean_name: 'Dr. Jagadeeshwar Madiraju' },
  { id: 2, name: 'Department of Science', code: 'SCI', faculty_id: 2, faculty_name: 'Faculty of Science', hod_id: 102, hod_name: 'Dr. K. Lakshmi', dean_name: 'Prof. S. Kavitha' },
  { id: 3, name: 'Department of Pharmacy', code: 'PHARM', faculty_id: 3, faculty_name: 'Faculty of Pharmacy', hod_id: 103, hod_name: 'Dr. V. Rajesh', dean_name: 'Dr. G. Kumaraswamy' },
  { id: 4, name: 'Department of Allied Health Sciences', code: 'AHS', faculty_id: 4, faculty_name: 'Faculty of Allied Health Sciences', hod_id: 104, hod_name: 'Dr. P. Kishore', dean_name: 'Dr. S. Ramesh' },
  { id: 5, name: 'Department of Nursing', code: 'NURS', faculty_id: 5, faculty_name: 'Faculty of Nursing', hod_id: 105, hod_name: 'Prof. Mary Thomas', dean_name: 'Dr. Sunitha Chinnam' },
  { id: 6, name: 'Department of Agriculture', code: 'AGRI', faculty_id: 6, faculty_name: 'Faculty of Agriculture', hod_id: 106, hod_name: 'Dr. C. H. Venkat', dean_name: 'Dr. D. Dev Kumar' },
  { id: 7, name: 'Department of Commerce and Business Management', code: 'CBM', faculty_id: 7, faculty_name: 'Faculty of Commerce and Business Management', hod_id: 107, hod_name: 'Dr. A. Sridhar', dean_name: 'Dr. Pagadala Suganda Devi' },
  { id: 8, name: 'Department of Computer Applications', code: 'MCA', faculty_id: 1, faculty_name: 'Faculty of Engineering and Technology', hod_id: 108, hod_name: 'Dr. P. Sreedhar', dean_name: 'Dr. Jagadeeshwar Madiraju' },
  { id: 9, name: 'Department of Clinical Embryology & ART', code: 'CEART', faculty_id: 4, faculty_name: 'Faculty of Allied Health Sciences', hod_id: 109, hod_name: 'Dr. K. Swathi', dean_name: 'Dr. S. Ramesh' },
  { id: 10, name: 'Department of Humanities & Science', code: 'HS', faculty_id: 8, faculty_name: 'Academic Affairs', hod_id: 110, hod_name: 'Dr. G. Prasad', dean_name: 'Prof. B. S. Anuradha' },
  { id: 11, name: 'Department of Research (Ph.D.)', code: 'RES-PHD', faculty_id: 9, faculty_name: 'Research & Development', hod_id: 111, hod_name: 'Dr. T. Satish', dean_name: 'Dr. T Christopher Reuben' }
];

const OFFICIAL_12_DEANS = [
  { id: 201, role: 'dean', email: 'dean.engineering@chaitanya.edu.in', name: 'Dr. Jagadeeshwar Madiraju', title: 'Dean, Faculty of Engineering & Technology', faculty_id: 1, faculty_name: 'Faculty of Engineering and Technology', password: 'Dean@123' },
  { id: 202, role: 'dean', email: 'dean.science@chaitanya.edu.in', name: 'Prof. S. Kavitha', title: 'Dean, Science', faculty_id: 2, faculty_name: 'Faculty of Science', password: 'Dean@123' },
  { id: 203, role: 'dean', email: 'dean.pharmacy@chaitanya.edu.in', name: 'Dr. G. Kumaraswamy', title: 'Dean, Department of Pharmacy', faculty_id: 3, faculty_name: 'Faculty of Pharmacy', password: 'Dean@123' },
  { id: 204, role: 'dean', email: 'dean.academic@chaitanya.edu.in', name: 'Prof. B. S. Anuradha', title: 'Professor & Dean – Academic Affairs', faculty_id: 8, faculty_name: 'Academic Affairs', password: 'Dean@123' },
  { id: 205, role: 'dean', email: 'dean.admin@chaitanya.edu.in', name: 'Dr. Amireddy Raju', title: 'Dean, Administration', faculty_id: 10, faculty_name: 'University Administration', password: 'Dean@123' },
  { id: 206, role: 'dean', email: 'dean.rd@chaitanya.edu.in', name: 'Dr. T Christopher Reuben', title: 'Dean, Research & Development', faculty_id: 9, faculty_name: 'Research & Development', password: 'Dean@123' },
  { id: 207, role: 'dean', email: 'dean.agri@chaitanya.edu.in', name: 'Dr. D. Dev Kumar', title: 'Dean, Faculty of Agriculture', faculty_id: 6, faculty_name: 'Faculty of Agriculture', password: 'Dean@123' },
  { id: 208, role: 'dean', email: 'dean.cbm@chaitanya.edu.in', name: 'Dr. Pagadala Suganda Devi', title: 'Dean, Faculty of Commerce & Business Management', faculty_id: 7, faculty_name: 'Faculty of Commerce and Business Management', password: 'Dean@123' },
  { id: 209, role: 'dean', email: 'dean.nursing@chaitanya.edu.in', name: 'Dr. Sunitha Chinnam', title: 'Dean, Faculty of Nursing', faculty_id: 5, faculty_name: 'Faculty of Nursing', password: 'Dean@123' },
  { id: 210, role: 'dean', email: 'dean.admissions@chaitanya.edu.in', name: 'Dr. Ch. Prathyusha Reddy', title: 'Dean, Admissions', faculty_id: 11, faculty_name: 'Admissions Division', password: 'Dean@123' },
  { id: 211, role: 'dean', email: 'dean.science2@chaitanya.edu.in', name: 'Dr. B. Sreelatha', title: 'Dean, Faculty of Science', faculty_id: 12, faculty_name: 'Faculty of Science (Division II)', password: 'Dean@123' },
  { id: 212, role: 'dean', email: 'dean.coe@chaitanya.edu.in', name: 'Prof. B. Rajender Reddy', title: 'Controller of Examinations', faculty_id: 13, faculty_name: 'Examination Branch', password: 'Dean@123' }
];

function getInitialDB() {
  const users = [
    // Registrar
    {
      id: 1,
      employee_id: 'CDU-REG-001',
      email: 'registrar@chaitanya.edu.in',
      full_name: 'Prof. M. Ravinder, M.Sc., Ph.D',
      role: 'registrar',
      password: 'Registrar@123',
      department_id: null,
      faculty_id: null,
      category: 'Administrative'
    },
    // Faculty Vinod
    {
      id: 2,
      employee_id: 'CDU-FAC-0013',
      email: 'vinod@gmail.com',
      full_name: 'Dr. Sirikonda Vinod',
      role: 'staff',
      password: 'Vinod@123',
      department_id: 1, // Engineering
      faculty_id: 1,
      category: 'Teaching'
    },
    // Faculty Abdul
    {
      id: 3,
      employee_id: 'CDU-FAC-9289',
      email: 'razak@chaitanya.edu.in',
      full_name: 'Dr. Abdul Razak',
      role: 'staff',
      password: 'Password@123',
      department_id: 1,
      faculty_id: 1,
      category: 'Teaching'
    },
    {
      id: 4,
      employee_id: 'CDU-FAC-9290',
      email: 'razak@chaitanya.eduin',
      full_name: 'Dr. Abdul Razak',
      role: 'staff',
      password: 'Password@123',
      department_id: 1,
      faculty_id: 1,
      category: 'Teaching'
    },
    // HODs
    ...OFFICIAL_11_DEPTS.map((d, i) => ({
      id: 100 + d.id,
      employee_id: `CDU-HOD-${String(d.id).padStart(3, '0')}`,
      email: d.code === 'ENG' ? 'hod.cse@chaitanya.edu.in' : `hod.${d.code.toLowerCase()}@chaitanya.edu.in`,
      full_name: d.hod_name,
      role: 'hod',
      password: 'Hod@123',
      department_id: d.id,
      faculty_id: d.faculty_id,
      category: 'Teaching'
    })),
    // Deans
    ...OFFICIAL_12_DEANS.map(dean => ({
      id: dean.id,
      employee_id: `CDU-DEAN-${dean.id}`,
      email: dean.email,
      full_name: dean.name,
      role: 'dean',
      password: dean.password,
      department_id: null,
      faculty_id: dean.faculty_id,
      category: 'Teaching'
    }))
  ];

  const profiles = [
    {
      id: 13,
      user_id: 2,
      employee_id: 'CDU-FAC-0013',
      full_name: 'Dr. Sirikonda Vinod',
      official_email: 'vinod@gmail.com',
      dob: '1985-06-15',
      gender: 'Male',
      marital_status: 'Married',
      nationality: 'Indian',
      mobile: '+91 98480 12345',
      city: 'Hyderabad',
      state: 'Telangana',
      department_id: 1,
      faculty_id: 1,
      designation: 'Assistant Professor',
      employee_category: 'Teaching',
      workflow_status: 'Approved',
      completion_percentage: 100,
      hod_id: 101,
      dean_id: 201,
      hod_remarks: 'Verified all 9 modules, qualifications, and teaching experience. Recommended for Dean approval.',
      hod_reviewer_name: 'Dr. K. V. S. Sharma',
      dean_remarks: 'Faculty credentials and departmental quota verified. Endorsed for Registrar clearance seal.',
      dean_reviewer_name: 'Dr. Jagadeeshwar Madiraju',
      registrar_remarks: 'Official clearance granted by the Office of the Registrar. Profile active and verified in university records.',
      registrar_reviewer_name: 'Prof. M. Ravinder, M.Sc., Ph.D',
      submission_ref: 'CDU-SDRMS-2026-0013'
    },
    {
      id: 14,
      user_id: 3,
      employee_id: 'CDU-FAC-9289',
      full_name: 'Dr. Abdul Razak',
      official_email: 'razak@chaitanya.edu.in',
      department_id: 1,
      faculty_id: 1,
      designation: 'Assistant Professor',
      employee_category: 'Teaching',
      workflow_status: 'Draft',
      completion_percentage: 30,
      hod_id: 101,
      dean_id: 201
    },
    {
      id: 15,
      user_id: 4,
      employee_id: 'CDU-FAC-9290',
      full_name: 'Dr. Abdul Razak',
      official_email: 'razak@chaitanya.eduin',
      department_id: 1,
      faculty_id: 1,
      designation: 'Assistant Professor',
      employee_category: 'Teaching',
      workflow_status: 'Draft',
      completion_percentage: 30,
      hod_id: 101,
      dean_id: 201
    }
  ];

  return {
    users,
    profiles,
    departments: OFFICIAL_11_DEPTS,
    deans: OFFICIAL_12_DEANS,
    audit_logs: [
      { id: 1, user_id: 1, action: 'SYSTEM_BOOT', details: 'SDRMS Netlify Cloud Engine initialized', created_at: new Date().toISOString() }
    ]
  };
}

function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const init = getInitialDB();
  saveDB(init);
  return init;
}

function saveDB(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {}
}

function createJWT(user) {
  const payload = {
    id: user.id,
    employee_id: user.employee_id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    department_id: user.department_id,
    faculty_id: user.faculty_id,
    category: user.category
  };
  return 'NETLIFY_SDRMS_' + btoa(JSON.stringify(payload)) + '_' + Date.now();
}

function parseToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const t = authHeader.split(' ')[1];
  try {
    if (t.startsWith('NETLIFY_SDRMS_')) {
      const parts = t.split('_');
      return JSON.parse(atob(parts[2]));
    }
    // standard JWT
    const payload = t.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}

/**
 * Handle Mock API Requests on Netlify
 */
export async function handleNetlifyMockRequest(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const urlObj = new URL(url, window.location.origin);
  const path = urlObj.pathname;
  const db = loadDB();
  const authHeader = options.headers?.Authorization || options.headers?.authorization;
  const currentUser = parseToken(authHeader);

  const jsonResponse = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  // 1. Health
  if (path === '/api/health') {
    return jsonResponse({
      status: 'ONLINE',
      institution: 'Chaitanya (Deemed to be University)',
      system: 'Staff Digital Records Management System (SDRMS)',
      environment: 'Netlify Cloud Serverless Runtime',
      timestamp: new Date().toISOString()
    });
  }

  // 2. Demo Accounts
  if (path === '/api/auth/demo-accounts') {
    const demoAccounts = [
      { role: 'staff', category: 'Faculty', email: 'vinod@gmail.com', name: 'Dr. Sirikonda Vinod', title: 'Assistant Professor, Engineering', badge: 'Faculty Member', department: 'Department of Engineering' },
      { role: 'staff', category: 'Faculty', email: 'razak@chaitanya.eduin', name: 'Dr. Abdul', title: 'Assistant Professor, Engineering', badge: 'Faculty Member', department: 'Department of Engineering' },
      { role: 'hod', category: 'HOD', email: 'hod.cse@chaitanya.edu.in', name: 'Dr. K. V. S. Sharma', title: 'Professor & HOD, Engineering', badge: 'HOD (Engineering)', department: 'Department of Engineering' },
      ...OFFICIAL_12_DEANS.map(d => ({
        role: 'dean',
        category: 'Dean',
        email: d.email,
        name: d.name,
        title: d.title,
        badge: 'Dean',
        faculty: d.faculty_name
      })),
      { role: 'registrar', category: 'Registrar', email: 'registrar@chaitanya.edu.in', name: 'Prof. M. Ravinder, M.Sc., Ph.D', title: 'Registrar & Chief Administrator', badge: 'Registrar' }
    ];
    return jsonResponse({ accounts: demoAccounts });
  }

  // 3. Departments
  if (path === '/api/auth/departments') {
    return jsonResponse({ departments: db.departments });
  }

  // 4. Login
  if (path === '/api/auth/login' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    const email = (body.email || '').toLowerCase().trim();
    const user = db.users.find(u => u.email.toLowerCase() === email);

    if (!user) {
      return jsonResponse({ error: `Account not found with email: ${email}. Please register first.` }, 401);
    }

    const dept = db.departments.find(d => d.id === user.department_id);
    const token = createJWT(user);

    return jsonResponse({
      token,
      user: {
        ...user,
        department_name: dept?.name,
        assigned_hod: dept ? { name: dept.hod_name, email: `hod.${dept.code.toLowerCase()}@chaitanya.edu.in` } : null,
        assigned_dean: dept ? { name: dept.dean_name, email: 'dean.engineering@chaitanya.edu.in' } : null
      }
    });
  }

  // 5. Register
  if (path === '/api/auth/register' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    let email = (body.email || '').toLowerCase().trim();

    if (!email.includes('chaitanya') && !email.endsWith('.edu.in')) {
      return jsonResponse({ error: 'Registration restricted: Only official college email (@chaitanya.edu.in) is allowed.' }, 400);
    }

    const existing = db.users.find(u => u.email.toLowerCase() === email);
    if (existing) {
      return jsonResponse({ error: 'An account with this email already exists. Please sign in.' }, 400);
    }

    const newId = Date.now();
    const deptId = parseInt(body.department_id) || 1;
    const dept = db.departments.find(d => d.id === deptId);

    const newUser = {
      id: newId,
      employee_id: `CDU-FAC-${Math.floor(1000 + Math.random() * 9000)}`,
      email,
      full_name: body.full_name?.trim(),
      role: 'staff',
      password: body.password,
      department_id: deptId,
      faculty_id: dept?.faculty_id || 1,
      category: 'Teaching'
    };

    const newProfile = {
      id: newId,
      user_id: newId,
      employee_id: newUser.employee_id,
      full_name: newUser.full_name,
      official_email: email,
      department_id: deptId,
      faculty_id: newUser.faculty_id,
      designation: 'Assistant Professor',
      employee_category: 'Teaching',
      workflow_status: 'Draft',
      completion_percentage: 20
    };

    db.users.push(newUser);
    db.profiles.push(newProfile);
    saveDB(db);

    const token = createJWT(newUser);
    return jsonResponse({
      message: 'Account created successfully! Welcome to Chaitanya SDRMS.',
      token,
      user: {
        ...newUser,
        department_name: dept?.name,
        profile_id: newId,
        workflow_status: 'Draft',
        completion_percentage: 20
      }
    }, 201);
  }

  // 6. Auth Me
  if (path === '/api/auth/me') {
    if (!currentUser) return jsonResponse({ error: 'Unauthorized' }, 401);
    const user = db.users.find(u => u.id === currentUser.id);
    if (!user) return jsonResponse({ error: 'User not found' }, 404);

    const dept = db.departments.find(d => d.id === user.department_id);
    const profile = db.profiles.find(p => p.user_id === user.id);

    return jsonResponse({
      user: {
        ...user,
        department_name: dept?.name,
        hod_name: dept?.hod_name,
        dean_name: dept?.dean_name,
        profile_id: profile?.id,
        workflow_status: profile?.workflow_status || 'Draft',
        completion_percentage: profile?.completion_percentage || 20,
        hod_remarks: profile?.hod_remarks,
        dean_remarks: profile?.dean_remarks,
        registrar_remarks: profile?.registrar_remarks,
        submission_ref: profile?.submission_ref
      }
    });
  }

  // 7. Realtime Session Hub
  if (path === '/api/auth/realtime-session') {
    if (!currentUser) return jsonResponse({ error: 'Unauthorized' }, 401);
    const user = db.users.find(u => u.id === currentUser.id);
    const dept = db.departments.find(d => d.id === user?.department_id);

    return jsonResponse({
      authenticated: true,
      authenticationMethod: 'Netlify Cloud Cryptographic JWT Session',
      tokenExpiry: '24 Hours Rolling Session',
      verifiedAt: new Date().toISOString(),
      ipAddress: 'Netlify Edge Runtime',
      user: { ...user, department_name: dept?.name },
      jurisdiction:
        user?.role === 'registrar' ? 'University-wide Supreme Authority (All Schools, Deans & HODs)' :
        user?.role === 'dean' ? 'Faculty Level Clearance Oversight (12 Deans)' :
        user?.role === 'hod' ? `Departmental Jurisdiction: ${dept?.name || 'Department of Engineering'}` :
        `Individual Faculty Member Scope (${dept?.name || 'Assigned Department'})`,
      permissions: {
        canEditOwnProfile: true,
        canSubmitDossier: true,
        canReviewDepartmentStaff: ['hod', 'dean', 'registrar'].includes(user?.role),
        canEndorseDeanLevel: ['dean', 'registrar'].includes(user?.role),
        canGrantRegistrarFinalSeal: user?.role === 'registrar',
        canDeleteDepartmentStaff: ['hod', 'dean', 'registrar'].includes(user?.role),
        canDeleteAnyUniversityUser: user?.role === 'registrar',
        canManageMasterData: user?.role === 'registrar',
        canViewAuditLogs: user?.role === 'registrar'
      },
      recentLogs: db.audit_logs.slice(-5)
    });
  }

  // 8. Staff Profile
  if (path === '/api/staff/my-profile') {
    if (!currentUser) return jsonResponse({ error: 'Unauthorized' }, 401);
    const profile = db.profiles.find(p => p.user_id === currentUser.id) || {
      id: currentUser.id,
      user_id: currentUser.id,
      full_name: currentUser.full_name,
      official_email: currentUser.email,
      department_id: currentUser.department_id,
      workflow_status: 'Draft',
      completion_percentage: 20
    };

    const dept = db.departments.find(d => d.id === profile.department_id);

    if (method === 'PUT') {
      const updateData = JSON.parse(options.body || '{}');
      Object.assign(profile, updateData, { updated_at: new Date().toISOString() });
      saveDB(db);
      return jsonResponse({ message: 'Profile draft saved successfully.', profile });
    }

    return jsonResponse({
      profile: {
        ...profile,
        department_name: dept?.name,
        assigned_hod: dept ? { name: dept.hod_name } : null,
        assigned_dean: dept ? { name: dept.dean_name } : null
      },
      qualifications: [],
      teachingExp: [],
      publications: []
    });
  }

  // 9. Staff Submit Dossier
  if (path === '/api/staff/submit' && method === 'POST') {
    if (!currentUser) return jsonResponse({ error: 'Unauthorized' }, 401);
    const profile = db.profiles.find(p => p.user_id === currentUser.id);
    if (!profile) return jsonResponse({ error: 'Profile not found' }, 404);

    let nextStatus = 'Pending HOD Approval';
    if (currentUser.role === 'hod') nextStatus = 'Pending Dean Approval';
    if (currentUser.role === 'dean') nextStatus = 'Pending Registrar Approval';
    if (currentUser.role === 'registrar') nextStatus = 'Approved';

    profile.workflow_status = nextStatus;
    profile.submission_ref = profile.submission_ref || `CDU-SDRMS-2026-${String(profile.id).padStart(4, '0')}`;
    profile.submitted_at = new Date().toISOString();
    saveDB(db);

    return jsonResponse({
      message: `Profile submitted successfully. Next stage: ${nextStatus}`,
      submission_ref: profile.submission_ref,
      workflow_status: nextStatus
    });
  }

  // 10. Admin Hierarchy
  if (path === '/api/admin/hierarchy') {
    const tree = OFFICIAL_12_DEANS.map(dean => {
      const depts = db.departments.filter(d => d.faculty_id === dean.faculty_id);
      return {
        ...dean,
        code: dean.faculty_name.substring(0, 4).toUpperCase(),
        departments: depts.map(d => {
          const staffMembers = db.profiles.filter(p => p.department_id === d.id).map(p => ({
            id: p.id,
            name: p.full_name,
            email: p.official_email,
            designation: p.designation || 'Assistant Professor',
            status: p.workflow_status
          }));
          return {
            ...d,
            facultyCount: staffMembers.length,
            facultyList: staffMembers
          };
        })
      };
    });
    return jsonResponse({ tree });
  }

  // 11. Admin Staff List & Stats
  if (path === '/api/admin/staff') {
    return jsonResponse({ staff: db.profiles });
  }

  if (path === '/api/admin/stats') {
    return jsonResponse({
      totalStaff: db.profiles.length,
      teaching: db.profiles.length,
      nonTeaching: 0,
      approved: db.profiles.filter(p => p.workflow_status === 'Approved').length,
      pendingHOD: db.profiles.filter(p => p.workflow_status === 'Pending HOD Approval').length,
      pendingDean: db.profiles.filter(p => p.workflow_status === 'Pending Dean Approval').length,
      pendingRegistrar: db.profiles.filter(p => p.workflow_status === 'Pending Registrar Approval').length,
      deptCounts: db.departments.map(d => ({
        id: d.id,
        department_name: d.name,
        hod_name: d.hod_name,
        staff_count: db.profiles.filter(p => p.department_id === d.id).length
      }))
    });
  }

  // 12. Verify Action (Clearance Endorsement)
  if (path === '/api/admin/verify-action' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    const { staff_id, action, remarks } = body;
    const profile = db.profiles.find(p => p.id === Number(staff_id));
    if (!profile) return jsonResponse({ error: 'Staff record not found' }, 404);

    let nextStatus = profile.workflow_status;
    if (action === 'APPROVE') {
      if (currentUser?.role === 'hod') {
        nextStatus = 'Pending Dean Approval';
        profile.hod_remarks = remarks;
        profile.hod_reviewer_name = currentUser.full_name;
      } else if (currentUser?.role === 'dean') {
        nextStatus = 'Pending Registrar Approval';
        profile.dean_remarks = remarks;
        profile.dean_reviewer_name = currentUser.full_name;
      } else if (currentUser?.role === 'registrar') {
        nextStatus = 'Approved';
        profile.registrar_remarks = remarks;
        profile.registrar_reviewer_name = currentUser.full_name;
      }
    } else if (action === 'CORRECTION') {
      nextStatus = 'Correction Required';
    }

    profile.workflow_status = nextStatus;
    saveDB(db);

    return jsonResponse({
      message: 'Clearance decision recorded successfully.',
      from_status: profile.workflow_status,
      to_status: nextStatus
    });
  }

  // 13. Admin Delete User
  if (path.startsWith('/api/admin/user/') && method === 'DELETE') {
    const userId = Number(path.split('/').pop());
    const targetIdx = db.users.findIndex(u => u.id === userId);
    if (targetIdx !== -1) {
      const removed = db.users.splice(targetIdx, 1)[0];
      const pIdx = db.profiles.findIndex(p => p.user_id === userId);
      if (pIdx !== -1) db.profiles.splice(pIdx, 1);
      saveDB(db);
      return jsonResponse({ message: `Account for ${removed.full_name} has been permanently deleted from SDRMS.` });
    }
    return jsonResponse({ error: 'User not found' }, 404);
  }

  // 14. Master Data
  if (path === '/api/admin/master-data') {
    return jsonResponse({
      faculties: OFFICIAL_12_DEANS.map(d => ({ id: d.faculty_id, name: d.faculty_name, dean_name: d.name })),
      departments: db.departments,
      designations: [
        { id: 1, name: 'Assistant Professor', category: 'Teaching' },
        { id: 2, name: 'Associate Professor', category: 'Teaching' },
        { id: 3, name: 'Professor', category: 'Teaching' }
      ]
    });
  }

  // 15. Audit Logs
  if (path === '/api/admin/audit-logs') {
    return jsonResponse({ logs: db.audit_logs });
  }

  // 16. Fallback
  return jsonResponse({ success: true, message: 'Netlify mock endpoint handled.' });
}
