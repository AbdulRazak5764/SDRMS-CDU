import React from 'react';
import {
  User, GraduationCap, Briefcase, BookOpen, Award, FileText, CheckCircle2,
  Clock, ShieldCheck, Download, AlertCircle, ArrowRight, ExternalLink,
  ChevronRight, Building2, CheckSquare, Layers, FolderCheck, Calendar, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StaffDashboard({ profileData, onNavigateSection, onOpenPrintView, onOpenDocs }) {
  const { user } = useAuth();
  const profile = profileData?.profile || {};
  const documents = profileData?.documents || [];
  const qualifications = profileData?.qualifications || [];
  const experience = profileData?.experience || [];
  const publications = profileData?.publications || [];
  const verificationLogs = profileData?.verificationLogs || [];
  const assignedHod = profileData?.assignedHod;
  const assignedDean = profileData?.assignedDean;
  const assignedRegistrar = profileData?.assignedRegistrar;

  const status = profile.workflow_status || 'Draft';

  // Calculate real profile completion based on real filled data
  const calculateRealCompletion = () => {
    let score = 0;
    if (profile.full_name && profile.employee_id && profile.dob) score += 20; // Personal
    if (profile.designation && profile.department_name) score += 15; // Employment
    if (qualifications.length > 0) score += 20; // Education
    if (experience.length > 0) score += 15; // Experience
    if (publications.length > 0) score += 10; // Research
    if (documents.length > 0) score += 20; // Statutory Documents
    return Math.min(100, score);
  };

  const realCompletion = calculateRealCompletion();

  // 9 Official Modules Config
  const moduleCards = [
    {
      num: 1,
      title: 'Module 1: Personal Dossier & Identity',
      desc: 'SSC name, DOB, blood group, nationality, residential address & emergency contact.',
      countText: profile.dob ? 'Personal details entered' : 'Incomplete',
      isFilled: Boolean(profile.dob && profile.full_name),
      icon: User,
      color: 'blue'
    },
    {
      num: 2,
      title: 'Module 2: Cadre & Service Placement',
      desc: 'Designation, department, cadre, date of joining & university employee id.',
      countText: profile.designation ? `${profile.designation}` : 'Awaiting entry',
      isFilled: Boolean(profile.designation),
      icon: Briefcase,
      color: 'indigo'
    },
    {
      num: 3,
      title: 'Module 3: Educational Qualifications',
      desc: 'Undergraduate, Postgraduate, and Doctorate degrees with degree marksheets.',
      countText: qualifications.length > 0 ? `${qualifications.length} Degree(s) registered` : 'No qualifications added',
      isFilled: qualifications.length > 0,
      icon: GraduationCap,
      color: 'purple'
    },
    {
      num: 4,
      title: 'Module 4: Statutory Eligibility & NET/GATE',
      desc: 'UGC-NET, CSIR-NET, SLET/SET, GATE score, and State Council Registrations.',
      countText: 'Statutory clearances',
      isFilled: true,
      icon: Award,
      color: 'amber'
    },
    {
      num: 5,
      title: 'Module 5: Collegiate Teaching Experience',
      desc: 'Collegiate pedagogy, courses taught, lab sessions, and student project guidance.',
      countText: experience.length > 0 ? `${experience.length} Service record(s)` : 'Awaiting experience entry',
      isFilled: experience.length > 0,
      icon: Clock,
      color: 'teal'
    },
    {
      num: 6,
      title: 'Module 6: Research Publications & Patents',
      desc: 'Scopus & Web of Science indexed journal papers, conference proceedings, books.',
      countText: publications.length > 0 ? `${publications.length} Publication(s)` : 'Awaiting research records',
      isFilled: publications.length > 0,
      icon: BookOpen,
      color: 'rose'
    },
    {
      num: 7,
      title: 'Module 7: Sponsored Projects & Grants',
      desc: 'Extramural research grants funded by DST, SERB, AICTE, UGC, or Industry.',
      countText: 'Grants & Consultancies',
      isFilled: true,
      icon: Layers,
      color: 'sky'
    },
    {
      num: 8,
      title: 'Module 8: FDPs, Workshops & Training',
      desc: 'Faculty Development Programmes, AICTE-ATAL workshops, NPTEL MOOCs certified.',
      countText: 'FDP Records',
      isFilled: true,
      icon: Award,
      color: 'violet'
    },
    {
      num: 9,
      title: 'Module 9: Statutory Documents Vault',
      desc: 'Mandatory certificates (Aadhaar, Degree Memos, Appointment Orders) verifiable PDF scans.',
      countText: `${documents.length} Document(s) uploaded`,
      isFilled: documents.length > 0,
      icon: FileText,
      color: 'blue'
    },
    {
      num: 10,
      title: 'Module 10: Clearance & Declaration',
      desc: 'Code of conduct agreement, institutional declaration & multi-tier clearance routing.',
      countText: status,
      isFilled: status !== 'Draft',
      icon: CheckSquare,
      color: 'emerald'
    }
  ];

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Approved':
        return { label: 'Approved & Sealed', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'Pending Registrar Approval':
        return { label: 'Awaiting Registrar Seal', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'Pending Dean Approval':
        return { label: 'Awaiting Dean Endorsement', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'Pending HOD Approval':
        return { label: 'Awaiting HOD Scrutiny', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'Correction Required':
        return { label: 'Returned for Correction', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
      default:
        return { label: 'Draft (In Progress)', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  const statusBadge = getStatusBadge(status);

  return (
    <div className="space-y-6">
      {/* Correction Notice Banner if returned by reviewer */}
      {status === 'Correction Required' && verificationLogs.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-900 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block">Administrative Reviewer Remarks</span>
              <p className="mt-0.5 text-rose-800">
                "{verificationLogs[0]?.remarks || 'Please review your records and address the flagged sections.'}"
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateSection(1)}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <span>Rectify Dossier</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Academic Profile Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Avatar and Basic Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Real Photo or Initials Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-blue-50 border-2 border-blue-200 shadow-inner flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.full_name || 'Staff Member'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-blue-700">
                  <span className="text-2xl font-black">
                    {(profile.full_name || user?.full_name || 'U').charAt(0).toUpperCase()}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-500 mt-0.5">Faculty</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {(() => {
                    const rawFullName = (profile.full_name || user?.full_name || '').trim();
                    const rawSal = (profile.salutation || user?.salutation || '').trim();
                    return rawSal && !rawFullName.toLowerCase().startsWith(rawSal.toLowerCase()) && !/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i.test(rawFullName)
                      ? `${rawSal} ${rawFullName}`
                      : (rawFullName || 'Faculty Member');
                  })()}
                </h1>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>

              <p className="text-sm font-semibold text-blue-700">
                {profile.designation || 'Assistant Professor'}
              </p>

              <p className="text-xs text-slate-600 font-medium">
                {profile.department_name || 'Department of Computer Science & Engineering'}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-slate-500 font-mono">
                <span>
                  <strong className="text-slate-700 font-sans">Emp ID:</strong> {profile.employee_id || user?.employee_id || 'Not Assigned'}
                </span>
                <span>•</span>
                <span>
                  <strong className="text-slate-700 font-sans">Official Email:</strong> {profile.official_email || user?.email || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons & Real Completion Meter */}
          <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 w-full sm:w-64 text-center sm:text-right">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600">Dossier Health</span>
                <span className="font-bold text-blue-700">{realCompletion}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${realCompletion}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                {realCompletion >= 80 ? 'Ready for administrative submission' : 'Complete remaining modules to submit'}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onNavigateSection(1)}
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Edit 10 Modules</span>
              </button>

              <button
                onClick={onOpenPrintView}
                className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Dossier</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Multi-Tier Clearance Pathway */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Institutional Dossier Clearance Protocol
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Three-Stage Verification Workflow
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: HOD */}
          <div className={`p-4 rounded-xl border transition-all ${
            status !== 'Draft' ? 'bg-blue-50/70 border-blue-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                status !== 'Draft' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
              }`}>
                Stage 1
              </span>
            </div>
            <div className="font-bold text-xs text-slate-900 truncate">
              {assignedHod?.name || 'Department Head (HOD)'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Level 1 Scrutiny & Teaching Load Audit
            </div>
          </div>

          {/* Step 2: Dean */}
          <div className={`p-4 rounded-xl border transition-all ${
            ['Pending Dean Approval', 'Pending Registrar Approval', 'Approved'].includes(status)
              ? 'bg-purple-50/70 border-purple-200'
              : 'bg-slate-50 border-slate-200 opacity-70'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                ['Pending Dean Approval', 'Pending Registrar Approval', 'Approved'].includes(status)
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                Stage 2
              </span>
            </div>
            <div className="font-bold text-xs text-slate-900 truncate">
              {assignedDean?.name || 'Dean of Faculty'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Level 2 Academic & Cadre Endorsement
            </div>
          </div>

          {/* Step 3: Registrar */}
          <div className={`p-4 rounded-xl border transition-all ${
            status === 'Approved'
              ? 'bg-emerald-50/70 border-emerald-200'
              : status === 'Pending Registrar Approval'
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-slate-50 border-slate-200 opacity-70'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                status === 'Approved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : status === 'Pending Registrar Approval'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                Final Seal
              </span>
            </div>
            <div className="font-bold text-xs text-slate-900 truncate">
              Office of the Registrar
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Office of Registrar Institutional Seal
            </div>
          </div>
        </div>

        {/* Reviewer Feedback Logs */}
        {(profile.hod_remarks || profile.dean_remarks || profile.registrar_remarks) && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 mt-2">
            {profile.hod_remarks && (
              <div className="text-blue-900">
                <span className="font-bold">HOD Remarks:</span> "{profile.hod_remarks}"
              </div>
            )}
            {profile.dean_remarks && (
              <div className="text-purple-900">
                <span className="font-bold">Dean Remarks:</span> "{profile.dean_remarks}"
              </div>
            )}
            {profile.registrar_remarks && (
              <div className="text-amber-900">
                <span className="font-bold">Registrar Seal Remarks:</span> "{profile.registrar_remarks}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Real 9-Module Academic Dossier Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FolderCheck className="w-4 h-4 text-blue-600" />
            <span>Staff Digital Records Management System (10 Core Modules)</span>
          </h2>
          <span className="text-xs text-slate-500">Click any module to inspect or edit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {moduleCards.map((mod) => {
            const ModIcon = mod.icon;
            return (
              <div
                key={mod.num}
                onClick={() => onNavigateSection(mod.num)}
                className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center font-bold text-xs">
                      {mod.num}
                    </div>
                    {mod.isFilled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Entered</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                    {mod.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-slate-600">
                    {mod.countText}
                  </span>
                  <span className="text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 text-[11px] font-bold">
                    <span>Open</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statutory Document Compliance & University Notice Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Statutory Vault Status */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Statutory Compliance Documents Vault</span>
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {documents.length} / 5 Verified
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            As per UGC and university regulatory guidelines, every faculty member must upload verifiable PDF scans of their educational degrees, appointment letter, and identity proofs.
          </p>

          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-medium text-slate-700">1. Highest Degree (Ph.D. / PG Certificate)</span>
              <span className="text-[11px] text-slate-500">Mandatory</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-medium text-slate-700">2. Official Appointment & Joining Order</span>
              <span className="text-[11px] text-slate-500">Mandatory</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-medium text-slate-700">3. Government Identity Proof (Aadhaar / PAN)</span>
              <span className="text-[11px] text-slate-500">Mandatory</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateSection(9)}
              className="w-full py-2 bg-slate-100 hover:bg-blue-50 text-blue-700 hover:text-blue-800 border border-slate-200 hover:border-blue-300 rounded-xl text-xs font-bold transition-all text-center"
            >
              Manage Documents Vault (Module 9)
            </button>
          </div>
        </div>

        {/* University Official Circulars & Compliance Notice */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Chaitanya University Regulatory Notices</span>
            </h3>
            <span className="text-xs text-slate-400">Institutional</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-blue-900">
                <span>Annual Faculty Record Verification Cycle 2026</span>
                <span className="text-[10px] text-blue-700">Ref: CDU/REG/2026/01</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                All appointed faculty members are requested to complete all 9 modules of the Staff Digital Records Management System (SDRMS) for career advancement scheme (CAS) and statutory audits.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>NAAC & NIRF Data Synchronization</span>
                <span className="text-[10px] text-slate-500">Criterion 2</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Publications indexed in Scopus, Web of Science, and UGC Care list entered in Module 6 will directly populate the university's institutional ranking dossiers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
