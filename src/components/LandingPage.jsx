import React, { useState } from 'react';
import {
  Building2, GraduationCap, Users, ShieldCheck, FileText, CheckCircle2,
  ArrowRight, Award, BookOpen, Sparkles, MapPin, Phone, Mail, ExternalLink,
  ChevronRight, Lock, Eye, Download, Layers, School, Camera
} from 'lucide-react';

export default function LandingPage({ onGoLogin, onGoRegister }) {
  const campusPhotos = [
    {
      src: '/assets/campus-drone-aerial.jpg',
      title: 'Panoramic Campus Aerial Drone Shot',
      subtitle: 'Complete bird\'s-eye view of Chaitanya University academic complex, solar installation, and surrounding greenery',
      tag: 'Aerial Campus'
    },
    {
      src: '/assets/campus-main-building.jpg',
      title: 'Main Administrative Headquarters & Entrance',
      subtitle: 'Prominent Chaitanya University signage, blue reflective glass facade, and landscaped entrance',
      tag: 'Main Entrance'
    },
    {
      src: '/assets/faculty-group-photo.jpg',
      title: 'Distinguished Faculty & Staff Community',
      subtitle: 'University deans, department heads, and professors gathered on the campus grounds',
      tag: 'Faculty Body'
    },
    {
      src: '/assets/campus-quadrangle.jpg',
      title: 'Multi-Storey Quadrangle & Event Arena',
      subtitle: 'Open-air central courtyard, spiral balconies, student sports arena, and pavilion',
      tag: 'Inner Courtyard'
    },
    {
      src: '/assets/campus-academic-block.jpg',
      title: 'Modern Academic Architecture',
      subtitle: 'Lush green multi-storey building with modern classrooms, lecture halls, and laboratories',
      tag: 'Academic Block'
    }
  ];

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const departmentsList = [
    {
      name: 'Computer Science & Engineering',
      faculty: 'Faculty of Engineering & Technology',
      staffCount: 48,
      icon: '💻',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      name: 'Electronics & Communication',
      faculty: 'Faculty of Engineering & Technology',
      staffCount: 32,
      icon: '⚡',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      name: 'Mechanical & Civil Engineering',
      faculty: 'Faculty of Engineering & Technology',
      staffCount: 26,
      icon: '⚙️',
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      name: 'School of Pharmacy & Health Sciences',
      faculty: 'Faculty of Pharmacy',
      staffCount: 38,
      icon: '💊',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      name: 'Department of Business Management (MBA)',
      faculty: 'Faculty of Commerce & Management',
      staffCount: 29,
      icon: '📊',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      name: 'Department of Sciences & Humanities',
      faculty: 'Faculty of Science & Arts',
      staffCount: 42,
      icon: '🔬',
      color: 'bg-rose-50 text-rose-700 border-rose-200'
    }
  ];

  const modulesList = [
    { num: '01', title: 'Personal & Residential Dossier', desc: 'SSC validated name, blood group, emergency contact, residential address, and passport photo.' },
    { num: '02', title: 'University Service & Appointments', desc: 'Appointment order, cadre classification, joining date, and automated university service calculator.' },
    { num: '03', title: 'Educational Qualifications', desc: 'Chronological degree records from SSC, Intermediate to B.Tech, M.Tech, Ph.D. with certificate scans.' },
    { num: '04', title: 'Statutory Eligibility (NET/SLET)', desc: 'UGC-NET, CSIR, SET, GATE certifications with issuing authorities, scores, and compliance.' },
    { num: '05', title: 'Collegiate Teaching Experience', desc: 'Courses taught, credit workload, undergraduate/postgraduate syllabi, and student mentoring.' },
    { num: '06', title: 'Research & Publications', desc: 'Scopus, Web of Science, UGC-CARE indexed journal publications, citations, and DOI links.' },
    { num: '07', title: 'Sponsored Research Projects', desc: 'DST, AICTE, SERB, and institutional research grants sanctioned with funding amounts.' },
    { num: '08', title: 'Patents & Academic Consultancy', desc: 'Published & granted intellectual property, industrial consultancy, and technical transfer.' },
    { num: '09', title: 'Faculty Training & FDPs', desc: 'Orientation programs, refresher courses, AICTE ATAL workshops, and certifications.' },
    { num: '10', title: 'Statutory Documents Vault', desc: 'Tamper-evident document repository with appointment orders, Aadhaar, PAN, and certificates.' },
    { num: '11', title: 'Profile Summary & Audit Trail', desc: 'Real-time completion percentage, omission checklists, and electronic verification tracking.' },
    { num: '12', title: 'Statutory Declaration & Submission', desc: 'Legally binding declaration, submission lock, and instant A4 official university PDF dossier.' }
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top University Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Logo & Accreditation Title */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/chaitanya-official-logo.png?v=2"
              alt="Chaitanya (Deemed to be University)"
              className="h-10 sm:h-12 w-auto object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/chaitanya-crest-hd.jpg?v=2';
              }}
            />
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <a href="#about" className="hover:text-blue-600 transition-colors">About SDRMS</a>
            <a href="#departments" className="hover:text-blue-600 transition-colors">Departments</a>
            <a href="#modules" className="hover:text-blue-600 transition-colors">12 Core Modules</a>
            <a href="#campus" className="hover:text-blue-600 transition-colors">Campus</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onGoLogin('faculty')}
              className="px-4 py-2 rounded-full border border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-bold text-xs transition-all shadow-2xs"
            >
              Faculty Sign In
            </button>
            <button
              onClick={onGoRegister}
              className="px-5 py-2 rounded-full bg-[#3865F6] hover:bg-[#2554EB] text-white font-bold text-xs tracking-wide shadow-md shadow-blue-500/20 transition-all uppercase"
            >
              Create Faculty Account
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Official University Campus Photo */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-[#F4F6FA] pt-8 pb-16 lg:py-16 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Accreditation Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-tight shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Approved u/s 3 of UGC Act 1956 • MHRD Govt. of India</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Chaitanya Faculty Digital Records & Records Portal
              </h1>

              {/* Sub-headline */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
                Official Staff Digital Records Management System (SDRMS) for <strong className="text-slate-800">Chaitanya (Deemed to be University)</strong>, Hyderabad, Telangana. Complete self-service 12-module faculty profile entry, statutory document compliance, and multi-tier departmental verification.
              </p>

              {/* Dual Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={onGoRegister}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#3865F6] hover:bg-[#2554EB] text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  <span>1. Create Faculty Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onGoLogin('faculty')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-blue-600 font-bold text-xs tracking-wide shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>2. Faculty Sign In</span>
                </button>
              </div>
            </div>

            {/* Right Campus Building Photo Card with Interactive Real Photo Switcher */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
                <img
                  src={campusPhotos[activePhotoIdx].src}
                  alt={campusPhotos[activePhotoIdx].title}
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 px-3 py-1 rounded-full shadow-xs">
                      {campusPhotos[activePhotoIdx].tag}
                    </span>
                    <span className="text-[10px] font-bold text-white/80 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                      {activePhotoIdx + 1} / {campusPhotos.length}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold leading-tight">
                    {campusPhotos[activePhotoIdx].title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {campusPhotos[activePhotoIdx].subtitle}
                  </p>
                </div>
              </div>

              {/* Mini Thumbnails Selector */}
              <div className="grid grid-cols-5 gap-2">
                {campusPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative rounded-xl overflow-hidden h-14 border-2 transition-all cursor-pointer ${
                      activePhotoIdx === idx
                        ? 'border-blue-600 ring-2 ring-blue-500/30 scale-105 shadow-md'
                        : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400'
                    }`}
                  >
                    <img src={photo.src} alt={photo.tag} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4 Dedicated Portals Strip */}
      <section className="bg-white border-y border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              4 Dedicated Digital Record Gateways
            </h2>
            <p className="text-xs text-slate-500">
              Select your administrative authority or portal to sign in or inspect clearances.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Faculty Portal */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">1. Faculty Portal</h3>
                <p className="text-xs text-slate-500">
                  Teaching & Non-Teaching faculty self-service entry of 9 automated modules with dropdown selections.
                </p>
              </div>
              <div className="pt-4 mt-3 border-t border-slate-200 flex items-center gap-2">
                <button
                  onClick={() => onGoLogin('faculty')}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Faculty Sign In
                </button>
                <button
                  onClick={onGoRegister}
                  className="py-2 px-3 rounded-xl border border-slate-300 hover:border-blue-500 bg-white text-slate-700 font-bold text-xs"
                >
                  Register
                </button>
              </div>
            </div>

            {/* 2. HOD Portal */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">2. HOD Portal</h3>
                <p className="text-xs text-slate-500">
                  Department Heads review departmental faculty dossiers, grant Level 1 clearance, or complete own profile.
                </p>
              </div>
              <div className="pt-4 mt-3 border-t border-slate-200">
                <button
                  onClick={() => onGoLogin('hod')}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Enter HOD Portal
                </button>
              </div>
            </div>

            {/* 3. Dean Portal */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <School className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">3. Dean Portal (12 Deans)</h3>
                <p className="text-xs text-slate-500">
                  Faculties & Schools governance: Scrutinize HODs and departmental faculty before forwarding to Registrar.
                </p>
              </div>
              <div className="pt-4 mt-3 border-t border-slate-200">
                <button
                  onClick={() => onGoLogin('dean')}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Enter Dean Portal
                </button>
              </div>
            </div>

            {/* 4. Registrar Portal */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">4. Office of the Registrar</h3>
                <p className="text-xs text-slate-500">
                  Office of the Registrar. Complete university organization hierarchy, final certification seal & deletions.
                </p>
              </div>
              <div className="pt-4 mt-3 border-t border-slate-200">
                <button
                  onClick={() => onGoLogin('registrar')}
                  className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Enter Registrar Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="bg-white border-y border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-blue-600">450+</div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Teaching & Staff Members</div>
              <div className="text-[11px] text-slate-400">All Cadres & Designations</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-indigo-600">18</div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Academic Departments</div>
              <div className="text-[11px] text-slate-400">Constituent Faculties & Schools</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600">12</div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Automated Modules</div>
              <div className="text-[11px] text-slate-400">Personal, Academic & Research</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-amber-500">100%</div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Digital Verification</div>
              <div className="text-[11px] text-slate-400">Official A4 PDF Dossier Export</div>
            </div>
          </div>
        </div>
      </section>

      {/* Department-Wise Faculty Section */}
      <section id="departments" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic Departments & Constituent Faculties
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Records are categorized and verified department-wise by designated Department Heads (HODs) and the University Establishment Section.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {departmentsList.map((dept, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl p-2.5 rounded-2xl bg-slate-50 border border-slate-100 shadow-2xs">
                    {dept.icon}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${dept.color}`}>
                    {dept.staffCount} Faculty Members
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {dept.faculty}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SDRMS Verified</span>
                </span>
                <button
                  onClick={() => onGoLogin('faculty')}
                  className="text-blue-600 hover:text-blue-700 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 group-hover:gap-1.5 transition-all"
                >
                  <span>View Dept</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Gallery Showcase (Featuring All 5 Real Campus Photos) */}
      <section id="campus" className="bg-white py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <Building2 className="w-3.5 h-3.5" />
              <span>Official Campus Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Chaitanya University Campus & Community
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Explore authentic views of our panoramic aerial drone campus, main entrance facade, faculty assembly, and event courtyard in Hyderabad, Telangana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* 1. Large Panoramic Aerial Drone View (Span 8) */}
            <div className="md:col-span-8 rounded-3xl overflow-hidden border border-slate-200 shadow-md relative h-80 sm:h-96 group">
              <img
                src="/assets/campus-drone-aerial.jpg"
                alt="Chaitanya Panoramic Campus Aerial Drone Shot"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 px-3 py-0.5 rounded-full w-max mb-1.5 shadow-xs">
                  Panoramic Drone Aerial
                </span>
                <h4 className="text-lg font-bold">Panoramic University Campus Complex</h4>
                <p className="text-xs text-slate-300">Complete bird's-eye view of academic blocks, solar installation, and surrounding greenery</p>
              </div>
            </div>

            {/* 2. Main Entrance Facade (Span 4) */}
            <div className="md:col-span-4 rounded-3xl overflow-hidden border border-slate-200 shadow-md relative h-80 sm:h-96 group">
              <img
                src="/assets/campus-main-building.jpg"
                alt="Chaitanya University Entrance Building"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 px-3 py-0.5 rounded-full w-max mb-1.5 shadow-xs">
                  Main Entrance
                </span>
                <h4 className="text-base font-bold">Main Headquarters & Facade</h4>
                <p className="text-xs text-slate-300">Prominent Chaitanya University signage and reflective glass architecture</p>
              </div>
            </div>

            {/* 3. Faculty Group Gathering (Span 7) */}
            <div className="md:col-span-7 rounded-3xl overflow-hidden border border-slate-200 shadow-md relative h-80 group">
              <img
                src="/assets/faculty-group-photo.jpg"
                alt="Chaitanya University Faculty & Staff Community"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-600 px-3 py-0.5 rounded-full w-max mb-1.5 shadow-xs">
                  Faculty Community
                </span>
                <h4 className="text-base font-bold">Academic Faculty & Leadership Body</h4>
                <p className="text-xs text-slate-300">Distinguished professors, deans, and department heads assembled on university lawn</p>
              </div>
            </div>

            {/* 4. Quadrangle Courtyard & Sports Arena (Span 5) */}
            <div className="md:col-span-5 rounded-3xl overflow-hidden border border-slate-200 shadow-md relative h-80 group">
              <img
                src="/assets/campus-quadrangle.jpg"
                alt="Chaitanya University Quadrangle Balconies"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-600 px-3 py-0.5 rounded-full w-max mb-1.5 shadow-xs">
                  Quadrangle Arena
                </span>
                <h4 className="text-base font-bold">Multi-Storey Balcony Quadrangle</h4>
                <p className="text-xs text-slate-300">Central open-air courtyard, student sports court, and ceremonial pavilion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12 Digital Modules Section */}
      <section id="modules" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            12-Module Self-Entry & Verification System
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Structured in compliance with UGC Regulations and university establishment policies with auto-calculated experience and statutory lock.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modulesList.map((m) => (
            <div
              key={m.num}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Module {m.num}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {m.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="font-bold text-slate-800">
              Chaitanya (Deemed to be University)
            </div>
            <div>Approved u/s 3 of UGC Act 1956 by MHRD Govt. of India</div>
            <div className="text-slate-400">Hyderabad, Telangana State, India</div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onGoLogin('faculty')}
              className="text-blue-600 hover:underline font-bold"
            >
              Faculty Portal
            </button>
            <span>•</span>
            <button
              onClick={onGoRegister}
              className="text-blue-600 hover:underline font-bold"
            >
              Staff Registration
            </button>
            <span>•</span>
            <button
              onClick={() => onGoLogin('registrar')}
              className="text-slate-700 hover:text-blue-600 font-semibold"
            >
              Registrar Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
