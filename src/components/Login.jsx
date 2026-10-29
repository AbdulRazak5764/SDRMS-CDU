import React, { useState, useEffect } from 'react';
import {
  Building2, ShieldCheck, Lock, Mail, ArrowRight, UserCheck, Sparkles,
  UserPlus, User, GraduationCap, Building, KeyRound, Eye, EyeOff, CheckCircle2,
  School, Award, Layers, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// 11 Official University Departments requested by administration
const OFFICIAL_11_DEPARTMENTS = [
  { id: 39, name: 'Department of Engineering' },
  { id: 40, name: 'Department of Science' },
  { id: 41, name: 'Department of Pharmacy' },
  { id: 42, name: 'Department of Allied Health Sciences' },
  { id: 43, name: 'Department of Nursing' },
  { id: 44, name: 'Department of Agriculture' },
  { id: 45, name: 'Department of Commerce and Business Management' },
  { id: 46, name: 'Department of Computer Applications' },
  { id: 47, name: 'Department of Clinical Embryology & ART' },
  { id: 48, name: 'Department of Humanities & Science' },
  { id: 49, name: 'Department of Research (Ph.D.)' }
];

export default function Login({ onBackToLanding, initialMode = 'login', initialPortal = 'faculty' }) {
  const { login, register, switchDemoRole, demoAccounts } = useAuth();

  // Active Login Portal: 'faculty', 'hod', 'dean', 'registrar'
  const [activePortal, setActivePortal] = useState(initialPortal);
  // Auth action: 'login' or 'register'
  const [authMode, setAuthMode] = useState(initialMode === 'register' ? 'register' : 'login');

  // Quick 1-click test tab filter
  const [demoTab, setDemoTab] = useState('faculty');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regForm, setRegForm] = useState({
    full_name: '',
    email: '',
    password: '',
    employee_id: '',
    category: 'Teaching',
    faculty_id: '',
    department_id: String(OFFICIAL_11_DEPARTMENTS[0].id),
    designation: 'Assistant Professor'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [departments, setDepartments] = useState(OFFICIAL_11_DEPARTMENTS);
  const [faculties, setFaculties] = useState([]);

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

  // Update default credentials when switching portals
  useEffect(() => {
    if (activePortal === 'faculty') {
      setLoginEmail('vinod@gmail.com');
      setLoginPassword('Vinod@123');
      setDemoTab('faculty');
    } else if (activePortal === 'hod') {
      setLoginEmail('hod.cse@chaitanya.edu.in');
      setLoginPassword('Hod@123');
      setAuthMode('login');
      setDemoTab('hod');
    } else if (activePortal === 'dean') {
      setLoginEmail('dean.engineering@chaitanya.edu.in');
      setLoginPassword('Dean@123');
      setAuthMode('login');
      setDemoTab('dean');
    } else if (activePortal === 'registrar') {
      setLoginEmail('registrar@chaitanya.edu.in');
      setLoginPassword('Registrar@123');
      setAuthMode('login');
      setDemoTab('registrar');
    }
  }, [activePortal]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setSubmitting(true);
    await login(loginEmail, loginPassword);
    setSubmitting(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');

    let trimmedEmail = (regForm.email || '').toLowerCase().trim();

    // Auto-fix typo if user typed @chaitanya.eduin without the dot
    if (trimmedEmail.endsWith('@chaitanya.eduin')) {
      trimmedEmail = trimmedEmail.replace('@chaitanya.eduin', '@chaitanya.edu.in');
    }

    const isCollegeEmail =
      trimmedEmail.includes('chaitanya') ||
      trimmedEmail.endsWith('.edu.in');

    if (!isCollegeEmail) {
      setEmailError('Registration restricted: Only official university college email (e.g. @chaitanya.edu.in) is allowed.');
      return;
    }

    if (!regForm.full_name || !regForm.email || !regForm.password) return;
    setSubmitting(true);
    await register({
      ...regForm,
      email: trimmedEmail,
      category: 'Teaching',
      designation: 'Assistant Professor'
    });
    setSubmitting(false);
  };

  // Group demo accounts by category
  const facultyDemos = demoAccounts.filter(a => a.role === 'staff');
  const hodDemos = demoAccounts.filter(a => a.role === 'hod');
  const deanDemos = demoAccounts.filter(a => a.role === 'dean');
  const registrarDemos = demoAccounts.filter(a => a.role === 'registrar');

  const filteredDemos =
    demoTab === 'faculty' ? facultyDemos :
    demoTab === 'hod' ? hodDemos :
    demoTab === 'dean' ? deanDemos :
    registrarDemos;

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
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col justify-between font-sans text-slate-800">
      {/* Top University Header Banner */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/chaitanya-banner.png"
              alt="Chaitanya (Deemed to be University)"
              className="h-10 sm:h-12 w-auto object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/chaitanya-crest.jpg';
              }}
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className="px-3 py-1.5 rounded-full border border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-bold transition-all flex items-center gap-1 shadow-2xs mr-2"
              >
                <span>←</span>
                <span>University Home</span>
              </button>
            )}
            <span className="hidden sm:inline">Approved by UGC u/s 3 • MHRD Govt. of India</span>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              SDRMS Clearance Gateway
            </span>
          </div>
        </div>
      </header>

      {/* Main Center Auth Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 my-2">
        {/* 4 Dedicated Role Portal Switchers */}
        <div className="max-w-4xl w-full mb-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setActivePortal('faculty')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                activePortal === 'faculty'
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/30'
                  : 'bg-white/80 text-slate-700 hover:bg-white hover:text-blue-600'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>1. Faculty Portal</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePortal('hod')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                activePortal === 'hod'
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/30'
                  : 'bg-white/80 text-slate-700 hover:bg-white hover:text-indigo-600'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>2. HOD Portal</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePortal('dean')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                activePortal === 'dean'
                  ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/30'
                  : 'bg-white/80 text-slate-700 hover:bg-white hover:text-purple-600'
              }`}
            >
              <School className="w-4 h-4" />
              <span>3. Dean Portal (12)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePortal('registrar')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                activePortal === 'registrar'
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/30'
                  : 'bg-white/80 text-slate-700 hover:bg-white hover:text-amber-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>4. Registrar Portal</span>
            </button>
          </div>
        </div>

        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column (5 cols): University Seal & Role Overview */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-blue-50/50 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between text-center items-center">
            <div>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-white border border-slate-200 shadow-xs mx-auto mb-3 overflow-hidden flex items-center justify-center">
                <img
                  src="/assets/chaitanya-crest.jpg"
                  alt="Chaitanya University Crest"
                  className="w-full h-full object-contain"
                />
              </div>

              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Chaitanya (Deemed to be University)
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Hyderabad, Telangana, India
              </p>
              
              <div className={`text-[11px] font-bold tracking-wider uppercase mt-3 px-3 py-1 rounded-full border inline-block ${portalInfo.badgeColor}`}>
                {portalInfo.title}
              </div>

              <p className="text-xs text-slate-600 mt-2 px-2">
                {portalInfo.subtitle}
              </p>
            </div>

            {/* Clearance Hierarchy Infobox */}
            <div className="w-full space-y-2 my-5 text-left text-xs bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-1.5 flex items-center justify-between">
                <span>3-Tier Clearance Hierarchy:</span>
                <span className="text-[10px] text-blue-600 font-bold">UGC Verified</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">1</div>
                <div><strong>Faculty Entry:</strong> 9 Automated Modules</div>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">2</div>
                <div><strong>HOD Level:</strong> Departmental Scrutiny</div>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">3</div>
                <div><strong>Dean Level:</strong> Faculty Endorsement</div>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">4</div>
                <div><strong>Registrar:</strong> Final Seal & Certification</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-medium">
              Administrative Authority: Office of the Registrar
            </div>
          </div>

          {/* Right Column (7 cols): Auth Forms */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Tab Switcher Pills for Faculty (Create vs Sign in) */}
              {activePortal === 'faculty' && (
                <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 mb-5">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      authMode === 'login'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Faculty Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      authMode === 'register'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create New Faculty Account</span>
                  </button>
                </div>
              )}

              {/* VIEW 1: REGISTRATION (FACULTY ONLY) */}
              {activePortal === 'faculty' && authMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      Create Faculty Account
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Register with your official University college credentials.
                    </p>
                  </div>

                  {/* Field 1: Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name (as per SSC Records) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={regForm.full_name}
                        onChange={e => setRegForm({ ...regForm, full_name: e.target.value })}
                        placeholder="e.g. Dr. Sirikonda Vinod"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50/80 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        required
                      />
                    </div>
                  </div>

                  {/* Field 2: Official College Email */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Official College Email <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        @chaitanya.edu.in only
                      </span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={regForm.email}
                        onChange={e => {
                          setRegForm({ ...regForm, email: e.target.value });
                          setEmailError('');
                        }}
                        placeholder="e.g. yourname@chaitanya.edu.in"
                        className={`w-full pl-9 pr-3 py-2 bg-slate-50/80 focus:bg-white border rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 ${
                          emailError ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30' : 'border-slate-300 focus:border-blue-600'
                        }`}
                        required
                      />
                    </div>
                    {emailError ? (
                      <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                        ⚠️ {emailError}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500 mt-1">
                        Only @chaitanya.edu.in institutional email is accepted for registration.
                      </p>
                    )}
                  </div>

                  {/* Field 3: Department */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department <span className="text-rose-500">*</span>
                    </label>
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
                      className="w-full px-3 py-2 bg-slate-50/80 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Field 4: Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password (min 6 characters) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={regForm.password}
                        onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 bg-slate-50/80 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        required
                        minLength={6}
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

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 mt-3"
                  >
                    <span>{submitting ? 'Creating Official Record...' : 'Register Account & Open Faculty Dashboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-1 text-xs text-slate-500">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Sign In here
                    </button>
                  </div>
                </form>
              )}

              {/* VIEW 2: SIGN IN FOR ALL PORTALS (FACULTY, HOD, DEAN, REGISTRAR) */}
              {(authMode === 'login' || activePortal !== 'faculty') && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{portalInfo.title}</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter your university email and password to enter the clearance system.
                    </p>
                  </div>

                  {/* Dropdown helper for HODs and Deans to quickly pick their designated account */}
                  {activePortal === 'dean' && (
                    <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl">
                      <label className="block text-[11px] font-bold text-purple-900 mb-1">
                        Select from the 12 University Deans:
                      </label>
                      <select
                        onChange={(e) => {
                          const selected = deanDemos.find(d => d.email === e.target.value);
                          if (selected) {
                            setLoginEmail(selected.email);
                            setLoginPassword('Dean@123');
                          }
                        }}
                        value={loginEmail}
                        className="w-full px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-semibold text-purple-900"
                      >
                        {deanDemos.map(d => (
                          <option key={d.email} value={d.email}>
                            {d.name} — {d.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {activePortal === 'hod' && (
                    <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                      <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                        Select Department Head (HOD):
                      </label>
                      <select
                        onChange={(e) => {
                          const selected = hodDemos.find(h => h.email === e.target.value);
                          if (selected) {
                            setLoginEmail(selected.email);
                            setLoginPassword('Hod@123');
                          }
                        }}
                        value={loginEmail}
                        className="w-full px-2.5 py-1.5 bg-white border border-indigo-300 rounded-lg text-xs font-semibold text-indigo-900"
                      >
                        {hodDemos.map(h => (
                          <option key={h.email} value={h.email}>
                            {h.name} — {h.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      University Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="username@chaitanya.edu.in"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50/80 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
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

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-2.5 rounded-full text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 ${portalInfo.btnColor}`}
                  >
                    <span>{submitting ? 'Authenticating with University DB...' : `Sign In to ${portalInfo.title}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {activePortal === 'faculty' && (
                    <div className="text-center pt-1 text-xs text-slate-500">
                      Need a faculty account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('register')}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Create Faculty Account
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Quick 1-Click Role Switcher Strip */}
            <div className="pt-4 border-t border-slate-200 mt-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                <span className="flex items-center gap-1 text-slate-700 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Instant 1-Click Role Login:
                </span>
                {/* Mini Role tabs */}
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setDemoTab('faculty')}
                    className={`px-2 py-0.5 rounded ${demoTab === 'faculty' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    Faculty
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoTab('hod')}
                    className={`px-2 py-0.5 rounded ${demoTab === 'hod' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    HODs
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoTab('dean')}
                    className={`px-2 py-0.5 rounded ${demoTab === 'dean' ? 'bg-purple-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    Deans
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoTab('registrar')}
                    className={`px-2 py-0.5 rounded ${demoTab === 'registrar' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    Registrar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {filteredDemos.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => switchDemoRole(acc.email)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 text-left text-[11px] transition-all group"
                  >
                    <div className="font-bold text-slate-800 group-hover:text-blue-700 truncate">
                      {acc.badge}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{acc.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        © 2026 Chaitanya (Deemed to be University) • Hyderabad, Telangana, India. All Rights Reserved.
      </footer>
    </div>
  );
}
