import React, { useState, useEffect } from 'react';
import {
  Building2, ShieldCheck, Lock, Mail, ArrowRight, UserCheck,
  UserPlus, User, GraduationCap, Eye, EyeOff, CheckCircle2,
  School, Award, Layers, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Official University Academic & Administrative Departments (Categorized by Faculty)
const OFFICIAL_PROGRAM_DEPARTMENTS = [
  // 1. Engineering
  { id: 6, name: 'Department of Computer Science & Engineering', code: 'CSE', faculty_name: 'Faculty of Engineering and Technology', faculty_id: 2 },
  { id: 7, name: 'Department of Electronics & Communication Engineering', code: 'ECE', faculty_name: 'Faculty of Engineering and Technology', faculty_id: 2 },
  { id: 8, name: 'Department of Electrical & Electronics Engineering', code: 'EEE', faculty_name: 'Faculty of Engineering and Technology', faculty_id: 2 },
  { id: 97, name: 'Department of Mechanical Engineering', code: 'ME', faculty_name: 'Faculty of Engineering and Technology', faculty_id: 2 },
  { id: 98, name: 'Department of Civil Engineering', code: 'CE', faculty_name: 'Faculty of Engineering and Technology', faculty_id: 2 },
  { id: 46, name: 'Department of Computer Applications (MCA)', code: 'MCA', faculty_name: 'Faculty of Engineering and Technology', faculty_id: 2 },

  // 2. Pharmacy
  { id: 16, name: 'Department of Pharmacy', code: 'PHARM', faculty_name: 'Faculty of Pharmacy', faculty_id: 5 },

  // 3. Agriculture
  { id: 18, name: 'Department of Agriculture', code: 'AGRI', faculty_name: 'Faculty of Agriculture', faculty_id: 7 },

  // 4. Nursing
  { id: 17, name: 'Department of Nursing', code: 'NURS', faculty_name: 'Faculty of Nursing', faculty_id: 6 },

  // 5. Physiotherapy & Allied Health Sciences
  { id: 102, name: 'Department of Physiotherapy (BPT/MPT)', code: 'BPT', faculty_name: 'Faculty of Allied Health Sciences', faculty_id: 3 },
  { id: 108, name: 'Department of Radiology & Imaging Technology', code: 'RIT', faculty_name: 'Faculty of Allied Health Sciences', faculty_id: 3 },
  { id: 14, name: 'Department of Anaesthesia & Operation Theatre Technology', code: 'AOTT', faculty_name: 'Faculty of Allied Health Sciences', faculty_id: 3 },
  { id: 13, name: 'Department of Cardiovascular Technology', code: 'CVT', faculty_name: 'Faculty of Allied Health Sciences', faculty_id: 3 },
  { id: 111, name: 'Department of Medical Lab Technology', code: 'MLT', faculty_name: 'Faculty of Allied Health Sciences', faculty_id: 3 },
  { id: 47, name: 'Department of Clinical Embryology & ART', code: 'CEART', faculty_name: 'Faculty of Allied Health Sciences', faculty_id: 3 },

  // 6. Commerce & Business Management
  { id: 15, name: 'Department of Commerce & Business Management (B.Com/BBA/MBA)', code: 'CBM', faculty_name: 'Faculty of Commerce and Business Management', faculty_id: 4 },

  // 7. Science Programs
  { id: 5, name: 'Department of Computer Science & Applications (B.Sc CS/BCA)', code: 'CS', faculty_name: 'Faculty of Science', faculty_id: 1 },
  { id: 105, name: 'Department of Biotechnology, Microbiology & Chemistry', code: 'LIFE-SCI', faculty_name: 'Faculty of Science', faculty_id: 1 },
  { id: 106, name: 'Department of Forensic Science & Chemistry', code: 'FORENSIC', faculty_name: 'Faculty of Science', faculty_id: 1 },
  { id: 107, name: 'Department of Nutrition, Dietetics and Food Science', code: 'FOOD-SCI', faculty_name: 'Faculty of Science', faculty_id: 1 },
  { id: 4, name: 'Department of Mathematics and Statistics', code: 'MATH', faculty_name: 'Faculty of Science', faculty_id: 1 },

  // 8. Academic Affairs, Humanities & Research
  { id: 48, name: 'Department of Humanities & Science', code: 'HS', faculty_name: 'Academic Affairs & Humanities', faculty_id: 14 },
  { id: 49, name: 'Department of Research (Ph.D.)', code: 'RES-PHD', faculty_name: 'Research & Development', faculty_id: 16 },

  // 9. University Administration (Non-Teaching, Administrative & Technical Sections)
  { id: 19, name: 'Registrar Office & University Administration', code: 'RO-ADMIN', faculty_name: 'University Administration (Dean, Administration)', faculty_id: 15 },
  { id: 20, name: 'Establishment and HR Section', code: 'EST-HR', faculty_name: 'University Administration (Dean, Administration)', faculty_id: 15 },
  { id: 112, name: 'Finance & Accounts Division', code: 'FIN-ACC', faculty_name: 'University Administration (Dean, Administration)', faculty_id: 15 },
  { id: 113, name: 'Central University Library', code: 'CENT-LIB', faculty_name: 'University Administration (Dean, Administration)', faculty_id: 15 },
  { id: 114, name: 'Central Computing & Technical Services', code: 'TECH-IT', faculty_name: 'University Administration (Dean, Administration)', faculty_id: 15 },
  { id: 115, name: 'Central Laboratories & Workshop Section', code: 'CENT-LAB', faculty_name: 'University Administration (Dean, Administration)', faculty_id: 15 },
  { id: 116, name: 'Estate & Campus Maintenance Section', code: 'EST-MAINT', faculty_name: 'University Administration (Dean, Administration)', faculty_id: 15 },
  { id: 117, name: 'General Administration & Support Staff', code: 'GEN-ADMIN', faculty_name: 'University Administration (Dean, Administration)', faculty_id: 15 }
];

// Official 12 University Deans (Title-based)
const OFFICIAL_12_DEANS = [
  { title: 'Dean, Faculty of Engineering & Technology', email: 'dean.engineering@chaitanya.edu.in', password: 'Dean@Chaitanya2026' },
  { title: 'Dean, Faculty of Science', email: 'dean.science@chaitanya.edu.in', password: 'Dean@Chaitanya2026' },
  { title: 'Dean, Department of Pharmacy', email: 'dean.pharmacy@chaitanya.edu.in', password: 'Dean@Chaitanya2026' },
  { title: 'Dean, Faculty of Nursing', email: 'dean.nursing@chaitanya.edu.in', password: 'Dean@Chaitanya2026' },
  { title: 'Dean, Faculty of Agriculture', email: 'dean.agri@chaitanya.edu.in', password: 'Dean@Chaitanya2026' },
  { title: 'Dean, Faculty of Commerce & Business Management', email: 'dean.cbm@chaitanya.edu.in', password: 'Dean@Chaitanya2026' },
  { title: 'Dean, Academic Affairs', email: 'dean.academic@chaitanya.edu.in', password: 'Dean@Chaitanya2026' },
  { title: 'Dean, Administration (Non-Teaching, Administrative & Technical Staff)', email: 'dean.admin@chaitanya.edu.in', password: 'Dean@Chaitanya2026' },
  { title: 'Dean, Research & Development', email: 'dean.rd@chaitanya.edu.in', password: 'Dean@Chaitanya2026' },
  { title: 'Dean, Admissions', email: 'dean.admissions@chaitanya.edu.in', password: 'Dean@Chaitanya2026' },
  { title: 'Dean, Faculty of Science (Division II)', email: 'dean.science2@chaitanya.edu.in', password: 'Dean@Chaitanya2026' },
  { title: 'Controller of Examinations (COE)', email: 'coe@chaitanya.edu.in', password: 'Dean@Chaitanya2026' },
  { title: 'Dean, Faculty of Allied Health Sciences', email: 'dean.ahs@chaitanya.edu.in', password: 'Dean@Chaitanya2026' }
];

// Official 21 Program-Wise Department Heads (HODs)
const OFFICIAL_PROGRAM_HODS = [
  // 1. Undergraduate – Engineering
  { title: 'HOD – CSE (B.Tech CSE, AIML, Data Science)', email: 'hod.cse@chaitanya.edu.in', password: 'Hod@CSE2026!' },
  { title: 'HOD – ECE (B.Tech ECE)', email: 'hod.ece@chaitanya.edu.in', password: 'Hod@ECE2026!' },
  { title: 'HOD – EEE (B.Tech EEE)', email: 'hod.eee@chaitanya.edu.in', password: 'Hod@EEE2026!' },
  { title: 'HOD – ME (B.Tech Mechanical Engineering)', email: 'hod.me@chaitanya.edu.in', password: 'Hod@ME2026!' },
  { title: 'HOD – CE (B.Tech Civil Engineering)', email: 'hod.ce@chaitanya.edu.in', password: 'Hod@CE2026!' },

  // 2. Undergraduate – Pharmacy
  { title: 'HOD – Pharmacy (B.Pharmacy, Pharm.D, M.Pharmacy)', email: 'hod.pharmacy@chaitanya.edu.in', password: 'Hod@Pharm2026!' },

  // 3. Undergraduate – Agriculture
  { title: 'HOD – Agriculture (B.Sc. Hons. Agriculture, M.Sc. Agronomy)', email: 'hod.agri@chaitanya.edu.in', password: 'Hod@Agri2026!' },

  // 4. Undergraduate – Nursing
  { title: 'HOD – Nursing (B.Sc. Nursing, M.Sc. Nursing)', email: 'hod.nursing@chaitanya.edu.in', password: 'Hod@Nursing2026!' },

  // 5. Undergraduate – Physiotherapy
  { title: 'HOD – Physiotherapy (Bachelor of Physiotherapy - BPT, MPT)', email: 'hod.physio@chaitanya.edu.in', password: 'Hod@Physio2026!' },

  // 6. Commerce & Business Management
  { title: 'HOD – Commerce & Business Management (B.Com CA, BBA, MBA)', email: 'hod.cbm@chaitanya.edu.in', password: 'Hod@CBM2026!' },

  // 7. Science Programs
  { title: 'HOD – Computer Science & Applications (B.Sc. CS, BCA, MCA)', email: 'hod.cs@chaitanya.edu.in', password: 'Hod@CS2026!' },
  { title: 'HOD – Life Sciences (Biotechnology, Microbiology & Chemistry)', email: 'hod.lifesciences@chaitanya.edu.in', password: 'Hod@LifeSci2026!' },
  { title: 'HOD – Forensic Science & Chemistry (B.Sc. Forensic Science)', email: 'hod.forensic@chaitanya.edu.in', password: 'Hod@Forensic2026!' },
  { title: 'HOD – Food Science & Nutrition (B.Sc. Nutrition, Dietetics & Food Science)', email: 'hod.nutrition@chaitanya.edu.in', password: 'Hod@Nutrition2026!' },

  // 8. Allied Health Sciences
  { title: 'HOD – Department of RIT (Radiology & Imaging Technology)', email: 'hod.rit@chaitanya.edu.in', password: 'Hod@RIT2026!' },
  { title: 'HOD – Department of AOTT (Anaesthesia & Operation Theatre Technology)', email: 'hod.aott@chaitanya.edu.in', password: 'Hod@AOTT2026!' },
  { title: 'HOD – Department of CVT (Cardiovascular Technology, Echocardiography)', email: 'hod.cvt@chaitanya.edu.in', password: 'Hod@CVT2026!' },
  { title: 'HOD – Department of MLT (Medical Lab Technology)', email: 'hod.mlt@chaitanya.edu.in', password: 'Hod@MLT2026!' },
  { title: 'HOD – Clinical Embryology & ART (M.Sc. Clinical Embryology)', email: 'hod.embryology@chaitanya.edu.in', password: 'Hod@Embryo2026!' },

  // 9. Academic Affairs & Research
  { title: 'HOD – Humanities & Science (Basic Sciences & Humanities)', email: 'hod.hs@chaitanya.edu.in', password: 'Hod@HS2026!' },
  { title: 'HOD – Research & Ph.D. Division (Doctoral Programs)', email: 'hod.research@chaitanya.edu.in', password: 'Hod@Research2026!' }
];

export default function Login({ onBackToLanding, initialMode = 'login', initialPortal = 'faculty' }) {
  const { login, register } = useAuth();

  const safeInitialPortal = typeof initialPortal === 'string' ? initialPortal : 'faculty';
  // Active Login Portal: 'faculty', 'hod', 'dean', 'registrar'
  const [activePortal, setActivePortal] = useState(safeInitialPortal);
  // Auth action: 'login' or 'register'
  const [authMode, setAuthMode] = useState(initialMode === 'register' ? 'register' : 'login');

  // Login form state (empty - user must authenticate with real credentials)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  // Register form state
  const [regForm, setRegForm] = useState({
    full_name: '',
    email: '',
    password: '',
    employee_id: '',
    category: 'Teaching',
    faculty_id: '',
    department_id: String(OFFICIAL_PROGRAM_DEPARTMENTS[0].id),
    designation: 'Assistant Professor'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [departments, setDepartments] = useState(OFFICIAL_PROGRAM_DEPARTMENTS);

  // Separate academic (Teaching) departments and administrative (Non-Teaching) departments
  const isTeachingCategory = (regForm.category || 'Teaching') === 'Teaching';

  const visibleDepartments = departments.filter(d => {
    const isAdministrative = d.faculty_id === 15 ||
      (d.name && (
        d.name.includes('Administration') ||
        d.name.includes('Library') ||
        d.name.includes('Technical') ||
        d.name.includes('Laboratories') ||
        d.name.includes('Finance') ||
        d.name.includes('Estate') ||
        d.name.includes('Registrar') ||
        d.name.includes('HR') ||
        d.name.includes('Evaluation') ||
        d.name.includes('Admissions')
      ));

    return isTeachingCategory ? !isAdministrative : isAdministrative;
  });

  // Group visible departments by faculty/school
  const groupedDepartments = visibleDepartments.reduce((acc, dept) => {
    const group = isTeachingCategory
      ? (dept.faculty_name || dept.faculty || 'Academic Programs')
      : 'Dean, Administration (Non-Teaching & Support Sections)';
    if (!acc[group]) acc[group] = [];
    acc[group].push(dept);
    return acc;
  }, {});

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    const isTeach = newCat === 'Teaching';
    const firstDept = departments.find(d => {
      const isAdm = d.faculty_id === 15 || (d.name && (d.name.includes('Administration') || d.name.includes('Finance') || d.name.includes('Library')));
      return isTeach ? !isAdm : isAdm;
    });

    setRegForm(prev => ({
      ...prev,
      category: newCat,
      designation: isTeach ? 'Assistant Professor' : 'Administrative Officer',
      department_id: firstDept ? String(firstDept.id) : prev.department_id,
      faculty_id: firstDept ? String(firstDept.faculty_id || '') : prev.faculty_id
    }));
  };

  const teachingDesignations = [
    'Assistant Professor',
    'Associate Professor',
    'Professor',
    'Senior Professor',
    'Adjunct Professor',
    'Visiting Faculty',
    'Lecturer'
  ];

  const nonTeachingDesignations = [
    'Administrative Officer',
    'Superintendent',
    'Section Officer',
    'Senior Assistant',
    'Junior Assistant',
    'System Administrator',
    'Technical Officer',
    'Lab Technician',
    'Lab Assistant',
    'Chief Librarian',
    'Assistant Librarian',
    'Accountant',
    'Office Subordinate'
  ];

  useEffect(() => {
    // Fetch live active university departments from public auth endpoint
    fetch('/api/auth/departments')
      .then(res => res.json())
      .then(data => {
        if (data.departments && data.departments.length > 0) {
          setDepartments(data.departments);
          if (!regForm.department_id) {
            setRegForm(prev => ({
              ...prev,
              department_id: String(data.departments[0].id),
              faculty_id: String(data.departments[0].faculty_id || '')
            }));
          }
        }
      })
      .catch(err => console.error('Error loading departments:', err));
  }, []);

  // Set default institutional email context when switching portals (passwords stay strictly EMPTY)
  useEffect(() => {
    setLoginError('');
    setLoginPassword(''); // Strictly empty: user must type their password
    if (activePortal === 'faculty') {
      setLoginEmail('');
    } else if (activePortal === 'hod') {
      setLoginEmail(OFFICIAL_PROGRAM_HODS[0].email);
      setAuthMode('login');
    } else if (activePortal === 'dean') {
      setLoginEmail(OFFICIAL_12_DEANS[0].email);
      setAuthMode('login');
    } else if (activePortal === 'registrar') {
      setLoginEmail('registrar@chaitanya.edu.in');
      setAuthMode('login');
    }
  }, [activePortal]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) return;
    setSubmitting(true);
    const portalStr = typeof activePortal === 'string' ? activePortal : 'faculty';
    let emailStr = String(loginEmail || '').trim();
    
    // Auto-correct common typos like chaitnaya -> chaitanya, eduin -> edu.in
    emailStr = emailStr.replace(/@(chaitnaya|chatanya|chaitnya|chaitanyau|chaitanya)\.(edu\.in|eduin|in|ac\.in)/i, '@chaitanya.edu.in');
    if (emailStr.endsWith('@chaitanya.eduin')) {
      emailStr = emailStr.replace('@chaitanya.eduin', '@chaitanya.edu.in');
    }
    if (emailStr.endsWith('@chaitnaya.edu.in')) {
      emailStr = emailStr.replace('@chaitnaya.edu.in', '@chaitanya.edu.in');
    }

    const passStr = String(loginPassword || '');
    const result = await login(emailStr, passStr, portalStr);
    if (!result?.success) {
      setLoginError(result?.error || 'Authentication failed. Please verify your credentials.');
    }
    setSubmitting(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setRegSuccessMessage('');

    let trimmedEmail = (regForm.email || '').toLowerCase().trim();

    // Auto-fix typos in domain
    trimmedEmail = trimmedEmail.replace(/@(chaitnaya|chatanya|chaitnya|chaitanyau|chaitanya)\.(edu\.in|eduin|in|ac\.in)/i, '@chaitanya.edu.in');
    if (trimmedEmail.endsWith('@chaitanya.eduin')) {
      trimmedEmail = trimmedEmail.replace('@chaitanya.eduin', '@chaitanya.edu.in');
    }
    if (trimmedEmail.endsWith('@chaitnaya.edu.in')) {
      trimmedEmail = trimmedEmail.replace('@chaitnaya.edu.in', '@chaitanya.edu.in');
    }

    const isCollegeEmail =
      trimmedEmail.includes('chaitanya') ||
      trimmedEmail.includes('chaitnaya') ||
      trimmedEmail.endsWith('.edu.in');

    if (!isCollegeEmail) {
      setEmailError('Registration restricted: Only official university college email (@chaitanya.edu.in) is allowed.');
      return;
    }

    if (!regForm.full_name || !regForm.email || !regForm.password || !regForm.employee_id) {
      setEmailError('Please fill in all required fields (Full Name, Employee ID, College Email, and Password).');
      return;
    }
    setSubmitting(true);
    const result = await register({
      ...regForm,
      email: trimmedEmail,
      category: regForm.category || 'Teaching',
      designation: regForm.designation || (regForm.category === 'Teaching' ? 'Assistant Professor' : 'Administrative Staff')
    });
    setSubmitting(false);

    if (result?.success) {
      setRegSuccessMessage('Account created successfully! Please enter your password to sign in.');
      setLoginEmail(trimmedEmail);
      setLoginPassword('');
      setAuthMode('login');
    }
  };

  const getPortalInfo = () => {
    switch (activePortal) {
      case 'hod':
        return {
          title: 'Department Head (HOD) Portal',
          subtitle: 'Verify departmental faculty submissions and clearance requests',
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          accentColor: 'border-indigo-600 text-indigo-600',
          btnColor: 'bg-indigo-600 hover:bg-indigo-700'
        };
      case 'dean':
        return {
          title: 'Deans Council Clearance Portal',
          subtitle: 'Academic Faculty and School level dossier verification (12 Deans)',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
          accentColor: 'border-purple-600 text-purple-600',
          btnColor: 'bg-purple-600 hover:bg-purple-700'
        };
      case 'registrar':
        return {
          title: 'Office of the Registrar',
          subtitle: 'University Super Administrator & Final Institutional Seal',
          badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
          accentColor: 'border-amber-600 text-amber-700',
          btnColor: 'bg-amber-600 hover:bg-amber-700'
        };
      default:
        return {
          title: 'Faculty & Staff Portal',
          subtitle: 'Official 9-Module Dossier Submission & Service Tracking',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          accentColor: 'border-blue-600 text-blue-600',
          btnColor: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const portalInfo = getPortalInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-[#f8fafc] to-blue-50/50 text-slate-800 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/chaitanya-official-logo.png?v=2"
              alt="Chaitanya (Deemed to be University)"
              className="h-10 sm:h-12 w-auto object-contain cursor-pointer"
              onClick={onBackToLanding}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/chaitanya-crest-hd.jpg?v=2';
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToLanding}
              className="text-xs text-slate-600 hover:text-blue-600 font-bold px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <span>← Back to Campus Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Side-by-Side Content (No Scroll Needed - Everything visible on one screen) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* LEFT SIDE PANEL: Branding & Institutional Information */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-tight shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Staff Digital Records Management System (SDRMS)</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Institutional Single Sign-On Gateway
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Authorized digital credentials gateway for Faculty, Department Heads, Deans, and the Registrar Office.
              </p>
            </div>

            {/* University Accreditations & Trust Pillars */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  UGC
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Category-1 Deemed to be University</h4>
                  <p className="text-[11px] text-slate-500">Declared under Section 3 of the UGC Act 1956 by MHRD, Govt. of India.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">3-Tier Multi-Level Verification</h4>
                  <p className="text-[11px] text-slate-500">Automated routing: Faculty Submission ➔ HOD Scrutiny ➔ Dean Endorsement ➔ Registrar Seal.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Annual CAS & NAAC Statutory Vault</h4>
                  <p className="text-[11px] text-slate-500">Synchronized with NIRF rankings, NAAC Criterion 2, and AICTE compliance records.</p>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-1">
              Technical Helpdesk: <span className="font-semibold text-slate-600">support.sdrms@chaitanya.edu.in</span>
            </div>
          </div>

          {/* RIGHT SIDE PANEL: Authentication Card (Zero-Scroll Compact Layout) */}
          <div className="lg:col-span-7 w-full max-w-xl mx-auto">
            {/* 4 Dedicated Portal Switcher Tabs */}
            <div className="mb-3 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-4 gap-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setActivePortal('faculty');
                  setAuthMode('login');
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                  activePortal === 'faculty'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span className="truncate w-full text-[11px]">Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePortal('hod');
                  setAuthMode('login');
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                  activePortal === 'hod'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="truncate w-full text-[11px]">HODs</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePortal('dean');
                  setAuthMode('login');
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                  activePortal === 'dean'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
                }`}
              >
                <School className="w-4 h-4" />
                <span className="truncate w-full text-[11px]">Deans (12)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePortal('registrar');
                  setAuthMode('login');
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                  activePortal === 'registrar'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-amber-700 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="truncate w-full text-[11px]">Registrar</span>
              </button>
            </div>

            {/* Auth Card Container */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
              {/* Card Header */}
              <div className="px-5 sm:px-6 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${portalInfo.badgeColor}`}>
                    {portalInfo.title}
                  </span>
                  <p className="text-[11px] text-slate-500">{portalInfo.subtitle}</p>
                </div>

                {/* Toggle between Login and Register for Faculty Portal */}
                {activePortal === 'faculty' && (
                  <div className="flex bg-slate-100 p-0.5 rounded-full text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`px-3 py-1 rounded-full transition-all ${
                        authMode === 'login' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className={`px-3 py-1 rounded-full transition-all ${
                        authMode === 'register' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 sm:p-6">
                {/* VIEW 1: REGISTRATION FOR FACULTY & NON-TEACHING STAFF */}
                {authMode === 'register' && activePortal === 'faculty' && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                          Create Official SDRMS Account
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          Register your official University ID & verified institutional email.
                        </p>
                      </div>
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 rounded-full">
                        {isTeachingCategory ? 'Teaching Cadre' : 'Dean, Administration Cadre'}
                      </span>
                    </div>

                    {/* Compact 2-Column Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Field 1: Full Name */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          Full Name (as per SSC) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                          <input
                            type="text"
                            value={regForm.full_name}
                            onChange={e => setRegForm({ ...regForm, full_name: e.target.value })}
                            placeholder=""
                            className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50/80 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                            required
                          />
                        </div>
                      </div>

                      {/* Field 2: University Employee ID */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          University Employee ID <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                          <input
                            type="text"
                            value={regForm.employee_id}
                            onChange={e => setRegForm({ ...regForm, employee_id: e.target.value })}
                            placeholder="e.g. CDU-FAC-2026"
                            className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50/80 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono font-medium"
                            required
                          />
                        </div>
                      </div>

                      {/* Field 3: Official College Email */}
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="text-[11px] font-semibold text-slate-700">
                            Official College Email <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[9px] font-bold text-blue-700">
                            @chaitanya.edu.in
                          </span>
                        </div>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                          <input
                            type="email"
                            value={regForm.email}
                            onChange={e => {
                              setRegForm({ ...regForm, email: e.target.value });
                              setEmailError('');
                            }}
                            placeholder="username@chaitanya.edu.in"
                            className={`w-full pl-8 pr-2.5 py-1.5 bg-slate-50/80 focus:bg-white border rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 ${
                              emailError ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30' : 'border-slate-300 focus:border-blue-600'
                            }`}
                            required
                          />
                        </div>
                      </div>

                      {/* Field 4: Password */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          Password (min 6 chars) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={regForm.password}
                            onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full pl-8 pr-8 py-1.5 bg-slate-50/80 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Field 5: Employee Category (Dynamic Filter Trigger for Department & Designation) */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          Employee Category <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={regForm.category || 'Teaching'}
                          onChange={handleCategoryChange}
                          className="w-full px-2.5 py-1.5 bg-slate-50/80 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                          required
                        >
                          <option value="Teaching">Teaching Faculty</option>
                          <option value="Non-Teaching">Non-Teaching Staff</option>
                          <option value="Technical">Technical & IT Staff</option>
                          <option value="Administrative">Administrative Staff</option>
                          <option value="Laboratory">Laboratory Staff</option>
                          <option value="Library">Library Staff</option>
                        </select>
                      </div>

                      {/* Field 6: Present Designation (Dynamically changes based on Category) */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          Present Designation <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={regForm.designation}
                          onChange={e => setRegForm({ ...regForm, designation: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-slate-50/80 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                          required
                        >
                          {(isTeachingCategory ? teachingDesignations : nonTeachingDesignations).map(des => (
                            <option key={des} value={des}>{des}</option>
                          ))}
                        </select>
                      </div>

                      {/* Field 7: Department / Section (Spans across both columns, dynamically filtered!) */}
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block text-[11px] font-semibold text-slate-700">
                            Department / Section <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[10px] text-blue-700 font-medium">
                            {isTeachingCategory ? 'Showing Academic Departments' : 'Showing Dean, Administration Sections'}
                          </span>
                        </div>
                        <select
                          value={regForm.department_id}
                          onChange={e => {
                            const deptId = e.target.value;
                            const foundDept = departments.find(d => String(d.id) === String(deptId));
                            setRegForm({
                              ...regForm,
                              department_id: deptId,
                              faculty_id: foundDept?.faculty_id ? String(foundDept.faculty_id) : regForm.faculty_id
                            });
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-50/80 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                          required
                        >
                          {Object.entries(groupedDepartments).map(([groupName, depts]) => (
                            <optgroup key={groupName} label={groupName}>
                              {depts.map(d => (
                                <option key={d.id} value={d.id}>
                                  {d.name} {d.code ? `(${d.code})` : ''}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    </div>

                    {emailError && (
                      <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                        ⚠️ {emailError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
                    >
                      <span>{submitting ? 'Creating Official Record...' : 'Create Official Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="text-center pt-0.5 text-xs text-slate-500">
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setRegSuccessMessage('');
                          setAuthMode('login');
                        }}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Sign In here
                      </button>
                    </div>
                  </form>
                )}

                {/* VIEW 2: SIGN IN FOR ALL PORTALS (Zero-Scroll Compact Layout) */}
                {(authMode === 'login' || activePortal !== 'faculty') && (
                  <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>{portalInfo.title}</span>
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Enter your authorized university credentials to sign in.
                      </p>
                    </div>

                    {/* Registration Success Banner */}
                    {regSuccessMessage && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-2 text-xs text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Account Created:</span> {regSuccessMessage}
                        </div>
                      </div>
                    )}

                    {/* Dropdown helper for Deans */}
                    {activePortal === 'dean' && (
                      <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
                        <label className="block text-[11px] font-bold text-purple-900">
                          Select University Dean Office:
                        </label>
                        <select
                          onChange={(e) => {
                            setLoginEmail(e.target.value);
                            setLoginPassword(''); // Mandatory manual typing
                            setLoginError('');
                          }}
                          value={loginEmail}
                          className="w-full px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-semibold text-purple-900"
                        >
                          {OFFICIAL_12_DEANS.map(d => (
                            <option key={d.email} value={d.email}>
                              {d.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Dropdown helper for HODs */}
                    {activePortal === 'hod' && (
                      <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
                        <label className="block text-[11px] font-bold text-indigo-900">
                          Select Department Head (HOD) Office:
                        </label>
                        <select
                          onChange={(e) => {
                            setLoginEmail(e.target.value);
                            setLoginPassword(''); // Mandatory manual typing
                            setLoginError('');
                          }}
                          value={loginEmail}
                          className="w-full px-2.5 py-1.5 bg-white border border-indigo-300 rounded-lg text-xs font-semibold text-indigo-900"
                        >
                          {OFFICIAL_PROGRAM_HODS.map(h => (
                            <option key={h.email} value={h.email}>
                              {h.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Email Address or Employee ID */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        University Email or Employee ID <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={loginEmail}
                          onChange={(e) => {
                            setLoginEmail(e.target.value);
                            setLoginError('');
                          }}
                          placeholder="e.g. 23cse2035@chaitanya.edu.in or 223208033"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50/80 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            setLoginError('');
                          }}
                          placeholder="Enter authorized password"
                          className="w-full pl-9 pr-9 py-2 bg-slate-50/80 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Inline Error Message */}
                    {loginError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2 text-xs text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Login Failed:</span> {loginError}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className={`w-full py-2.5 rounded-full text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${portalInfo.btnColor}`}
                    >
                      <span>{submitting ? 'Verifying Credentials...' : `Sign In to ${portalInfo.title}`}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {activePortal === 'faculty' && (
                      <div className="text-center pt-0.5 text-xs text-slate-500">
                        Need an account?{' '}
                        <button
                          type="button"
                          onClick={() => setAuthMode('register')}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Create Official Account
                        </button>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-slate-200/90 py-2.5 text-center text-[11px] text-slate-500">
        © 2026 Chaitanya (Deemed to be University) • Hyderabad, Telangana, India. All Rights Reserved.
      </footer>
    </div>
  );
}
