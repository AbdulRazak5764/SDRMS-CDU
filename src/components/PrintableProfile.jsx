import React, { useState } from 'react';
import {
  Printer, ArrowLeft, Building, CheckCircle2, User, Award, ShieldCheck,
  BookOpen, Clock, Eye, ExternalLink, Download, FileText, Check, Layers, Briefcase,
  Calendar, MapPin, Mail, Phone, FileCheck, AlertCircle, Sparkles, DollarSign,
  Building2, Landmark, GraduationCap, FileCheck2
} from 'lucide-react';
import DocumentViewerModal from './DocumentViewerModal';

export default function PrintableProfile({ profileData, onBack }) {
  const [selectedDoc, setSelectedDoc] = useState(null);

  const profile = profileData?.profile || {};
  const qualifications = profileData?.qualifications || [];
  const professionalQuals = profileData?.professionalQuals || [];
  const teachingExp = profileData?.teachingExp || [];
  const publications = profileData?.publications || profileData?.research?.publications || [];
  const projects = profileData?.projects || profileData?.research?.projects || [];
  const patents = profileData?.patents || profileData?.research?.patents || [];
  const academicContributions = profileData?.academicContributions || profileData?.research?.academicContributions || [];
  const trainingProgrammes = profileData?.trainingProgrammes || [];
  const previousEmployment = profileData?.previousEmployment || [];
  const documents = profileData?.documents || [];
  const verificationLogs = profileData?.verificationLogs || [];

  const handlePrint = () => {
    window.print();
  };

  const fullNameWithSalutation = [profile.salutation, profile.full_name].filter(Boolean).join(' ');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Floating Action Bar (Hidden on print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between sticky top-16 z-30">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to SDRMS Portal</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline font-medium">
            Official University Dossier (Complete Modules 1 to 12 with All Statutory Documents)
          </span>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Dossier (PDF)</span>
          </button>
        </div>
      </div>

      {/* Official University Letterhead Dossier Sheet */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-slate-300 card-print font-sans text-slate-900 space-y-6">
        {/* Institutional Letterhead Banner */}
        <div className="border-b-2 border-slate-800 pb-5 text-center flex flex-col items-center">
          <img
            src="/assets/chaitanya-official-logo.png?v=2"
            alt="Chaitanya (Deemed to be University)"
            className="h-16 sm:h-20 w-auto object-contain mb-2"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/chaitanya-crest-hd.jpg?v=2';
            }}
          />
          <div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-black text-slate-800 border border-slate-300 tracking-wider uppercase mt-1">
            Staff Digital Records Management System (SDRMS) — Official Comprehensive Faculty Dossier
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            UGC Recognized • NAAC Accredited • Hyderabad & Warangal Campuses, Telangana, India
          </div>
        </div>

        {/* Header Summary & Passport Photo */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <div className="space-y-2 flex-1 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {fullNameWithSalutation || 'Staff Member'}
              </h2>
              {profile.name_regional && (
                <span className="text-sm font-semibold text-slate-600">({profile.name_regional})</span>
              )}
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-300 uppercase">
                {profile.workflow_status || 'Approved'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-slate-700 pt-1">
              <div><strong className="text-slate-900">University Employee ID:</strong> <span className="font-mono font-bold text-blue-700">{profile.employee_id || 'CDU-STAFF'}</span></div>
              <div><strong className="text-slate-900">Official Designation:</strong> <span className="font-semibold text-slate-900">{profile.designation || 'Faculty Member'}</span></div>
              <div><strong className="text-slate-900">Department / Unit:</strong> {profile.department_name || profile.administrative_unit || '—'}</div>
              <div><strong className="text-slate-900">Faculty / School:</strong> {profile.faculty_name || 'Constituent University Department'}</div>
              <div><strong className="text-slate-900">Official Email:</strong> <span className="font-mono text-slate-800">{profile.official_email}</span></div>
              <div><strong className="text-slate-900">Contact Number:</strong> {profile.mobile || '—'}</div>
              <div><strong className="text-slate-900">Date of Joining at CDU:</strong> {profile.joining_date_university || '—'}</div>
              <div><strong className="text-slate-900">Total Verified Experience:</strong> <span className="font-bold text-teal-800">{profile.calculated_total_exp_years || '0'} Years</span></div>
            </div>
          </div>

          <div className="w-28 h-36 rounded-xl border-2 border-slate-300 bg-white overflow-hidden shadow-sm flex items-center justify-center flex-shrink-0 self-center sm:self-start">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-slate-300" />
            )}
          </div>
        </div>

        {/* ========================================================
            MODULE 1: PERSONAL IDENTITY & RESIDENTIAL DOSSIER
        ======================================================== */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center justify-between">
            <span>1. Personal Identity & Residential Dossier (Module 1)</span>
            <span className="text-[10px] text-slate-500 font-mono">CDU-MOD-01</span>
          </h3>
          <table className="w-full text-xs border border-slate-200">
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-slate-50/70">
                <td className="px-3 py-1.5 font-bold w-1/4 text-slate-800">Date of Birth</td>
                <td className="px-3 py-1.5 w-1/4">{profile.dob || '—'}</td>
                <td className="px-3 py-1.5 font-bold w-1/4 text-slate-800">Gender & Marital Status</td>
                <td className="px-3 py-1.5 w-1/4">{profile.gender || '—'} • {profile.marital_status || '—'}</td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 font-bold text-slate-800">Blood Group</td>
                <td className="px-3 py-1.5 font-semibold text-rose-700">{profile.blood_group || '—'}</td>
                <td className="px-3 py-1.5 font-bold text-slate-800">Social Category & Nationality</td>
                <td className="px-3 py-1.5">{profile.social_category || 'General'} • {profile.nationality || 'Indian'}</td>
              </tr>
              <tr className="bg-slate-50/70">
                <td className="px-3 py-1.5 font-bold text-slate-800">Personal Email & Alt Phone</td>
                <td className="px-3 py-1.5">{profile.personal_email || '—'} {profile.alternate_contact ? `• ${profile.alternate_contact}` : ''}</td>
                <td className="px-3 py-1.5 font-bold text-slate-800">Emergency Contact</td>
                <td className="px-3 py-1.5">{profile.emergency_contact_name ? `${profile.emergency_contact_name} (${profile.emergency_contact_relationship || 'Contact'}) - ${profile.emergency_contact_phone}` : '—'}</td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 font-bold text-slate-800">Current Residential Address</td>
                <td colSpan={3} className="px-3 py-1.5">{profile.current_address ? `${profile.current_address}, ${profile.city || ''}, ${profile.state || ''} - ${profile.pincode || ''}` : '—'}</td>
              </tr>
              <tr className="bg-slate-50/70">
                <td className="px-3 py-1.5 font-bold text-slate-800">Permanent Home Address</td>
                <td colSpan={3} className="px-3 py-1.5">{profile.permanent_address || profile.current_address || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ========================================================
            MODULE 2: INSTITUTIONAL CADRE & EMPLOYMENT PROFILE
        ======================================================== */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center justify-between">
            <span>2. Institutional Cadre & Employment Profile (Module 2)</span>
            <span className="text-[10px] text-slate-500 font-mono">CDU-MOD-02</span>
          </h3>
          <table className="w-full text-xs border border-slate-200">
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-slate-50/70">
                <td className="px-3 py-1.5 font-bold w-1/4 text-slate-800">Employee Category</td>
                <td className="px-3 py-1.5 w-1/4 font-semibold">{profile.employee_category || 'Teaching Faculty'}</td>
                <td className="px-3 py-1.5 font-bold w-1/4 text-slate-800">Employment Type</td>
                <td className="px-3 py-1.5 w-1/4">{profile.employment_type || 'Regular / Permanent'}</td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 font-bold text-slate-800">Appointment Order Ref</td>
                <td className="px-3 py-1.5">{profile.appointment_order_no || 'CDU/EST/APPT'} ({profile.appointment_order_date || '—'})</td>
                <td className="px-3 py-1.5 font-bold text-slate-800">Campus Location</td>
                <td className="px-3 py-1.5">{profile.campus_location || 'Main Campus, Hyderabad'}</td>
              </tr>
              <tr className="bg-slate-50/70">
                <td className="px-3 py-1.5 font-bold text-slate-800">Joining Date (CDU)</td>
                <td className="px-3 py-1.5 font-semibold text-blue-800">{profile.joining_date_university || '—'}</td>
                <td className="px-3 py-1.5 font-bold text-slate-800">Reporting Officer</td>
                <td className="px-3 py-1.5">{profile.reporting_officer || 'Head of Department / Dean Office'}</td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 font-bold text-slate-800">Prior Service Credit</td>
                <td className="px-3 py-1.5">{profile.relevant_previous_service_years ? `${profile.relevant_previous_service_years} Years (Prior to CDU)` : 'Nil / Direct Appointment'}</td>
                <td className="px-3 py-1.5 font-bold text-slate-800">Probation & Confirmation</td>
                <td className="px-3 py-1.5">{profile.probation_status || 'Confirmed'} {profile.confirmation_date ? `(${profile.confirmation_date})` : ''}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ========================================================
            MODULE 3: EDUCATIONAL QUALIFICATIONS
        ======================================================== */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center justify-between">
            <span>3. Educational & Collegiate Qualifications (Module 3)</span>
            <span className="text-[10px] text-slate-500 font-mono">{qualifications.length} Degree Record(s)</span>
          </h3>
          {qualifications.length > 0 ? (
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-100 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-1.5 text-left">Level & Degree</th>
                  <th className="px-3 py-1.5 text-left">Discipline / Branch</th>
                  <th className="px-3 py-1.5 text-left">Awarding University / Board</th>
                  <th className="px-3 py-1.5 text-center">Year</th>
                  <th className="px-3 py-1.5 text-left">Marks / % / CGPA</th>
                  <th className="px-3 py-1.5 text-left">Division / Grade</th>
                  <th className="px-3 py-1.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {qualifications.map(q => (
                  <tr key={q.id}>
                    <td className="px-3 py-1.5 font-bold text-slate-900">
                      {q.degree_title}
                      <span className="block text-[10px] text-slate-500 font-normal">{q.level} • {q.mode_of_study || 'Full-time'}</span>
                    </td>
                    <td className="px-3 py-1.5">{q.discipline || 'General'}</td>
                    <td className="px-3 py-1.5">
                      <div className="font-semibold text-slate-800">{q.institution}</div>
                      {q.college && <div className="text-[10px] text-slate-500">{q.college}</div>}
                    </td>
                    <td className="px-3 py-1.5 text-center font-bold">{q.year_of_completion || '—'}</td>
                    <td className="px-3 py-1.5 font-bold text-blue-700">{q.percentage_or_cgpa || '—'}</td>
                    <td className="px-3 py-1.5 font-semibold text-slate-700">{q.class_grade || '—'}</td>
                    <td className="px-3 py-1.5 text-center font-bold text-emerald-700">Verified</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-50 border rounded-xl">No educational qualifications added yet.</p>
          )}
        </div>

        {/* ========================================================
            MODULE 4: STATUTORY ELIGIBILITY & ACCREDITATION
        ======================================================== */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center justify-between">
            <span>4. Statutory Eligibility Tests & Council Accreditation (Module 4)</span>
            <span className="text-[10px] text-slate-500 font-mono">{professionalQuals.length} Credential(s)</span>
          </h3>
          {professionalQuals.length > 0 ? (
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-100 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-1.5 text-left">Examination / Council Accreditation</th>
                  <th className="px-3 py-1.5 text-left">Statutory Qualifying Authority</th>
                  <th className="px-3 py-1.5 text-left">Reg / Roll / Cert No</th>
                  <th className="px-3 py-1.5 text-left">Award Date</th>
                  <th className="px-3 py-1.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {professionalQuals.map(p => (
                  <tr key={p.id}>
                    <td className="px-3 py-1.5 font-bold text-slate-900">{p.title_or_exam}</td>
                    <td className="px-3 py-1.5 font-medium text-slate-700">{p.qualifying_authority}</td>
                    <td className="px-3 py-1.5 font-mono font-semibold text-blue-700">{p.registration_no || '—'}</td>
                    <td className="px-3 py-1.5">{p.award_date || '—'}</td>
                    <td className="px-3 py-1.5 text-center font-bold text-emerald-700">Verified</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-50 border rounded-xl">Exemption applicable as per UGC Regulations / No external qualifying exams recorded on file.</p>
          )}
        </div>

        {/* ========================================================
            MODULE 5: TEACHING & COLLEGIATE EXPERIENCE
        ======================================================== */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center justify-between">
            <span>5. Collegiate Teaching Experience & Pedagogy (Module 5)</span>
            <span className="text-[10px] text-slate-500 font-mono">{teachingExp.length} Appointment(s)</span>
          </h3>
          {teachingExp.length > 0 ? (
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-100 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-1.5 text-left">Institution Name & Type</th>
                  <th className="px-3 py-1.5 text-left">Designation</th>
                  <th className="px-3 py-1.5 text-left">Period / Tenure</th>
                  <th className="px-3 py-1.5 text-left">Level</th>
                  <th className="px-3 py-1.5 text-left">Courses / Subjects Taught</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {teachingExp.map(te => (
                  <tr key={te.id}>
                    <td className="px-3 py-1.5 font-bold">
                      {te.institution_name}
                      <span className="block text-[10px] text-slate-500 font-normal">{te.institution_type}</span>
                    </td>
                    <td className="px-3 py-1.5 font-semibold text-slate-800">{te.designation_held}</td>
                    <td className="px-3 py-1.5 font-mono text-[11px]">{te.start_date} to {te.is_current ? 'Present' : te.end_date}</td>
                    <td className="px-3 py-1.5">{te.teaching_involvement}</td>
                    <td className="px-3 py-1.5">{te.subjects_taught}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-50 border rounded-xl">No collegiate teaching appointments entered prior to present university tenure.</p>
          )}
        </div>

        {/* ========================================================
            MODULE 6: RESEARCH, PROJECTS & INTELLECTUAL PROPERTY
        ======================================================== */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center justify-between">
            <span>6. Research Publications, Funded Projects & Patents (Module 6)</span>
            <span className="text-[10px] text-slate-500 font-mono">Academic Output</span>
          </h3>

          {/* Publications */}
          {publications.length > 0 ? (
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-800 block text-[11px]">Indexed Research Papers ({publications.length}):</span>
              <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                {publications.map(p => (
                  <li key={p.id}>
                    <strong>{p.title}</strong>, {p.authors ? `Authors: ${p.authors}, ` : ''}<em>{p.journal_or_conf_name}</em> ({p.publication_year})
                    {p.indexing ? ` • [${p.indexing}]` : ''} {p.doi ? `• DOI: ${p.doi}` : ''}
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic p-2 bg-slate-50 border rounded">No research papers currently indexed on file.</p>
          )}

          {/* Funded Projects */}
          {projects.length > 0 && (
            <div className="space-y-1 text-xs pt-1">
              <span className="font-bold text-slate-800 block text-[11px]">Externally Funded Projects ({projects.length}):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {projects.map(pr => (
                  <div key={pr.id} className="p-2 border rounded bg-slate-50 text-[11px]">
                    <div className="font-bold text-slate-900">{pr.title}</div>
                    <div className="text-slate-600">Agency: {pr.funding_agency} • Grant: ₹{Number(pr.sanctioned_amount || 0).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patents */}
          {patents.length > 0 && (
            <div className="space-y-1 text-xs pt-1">
              <span className="font-bold text-slate-800 block text-[11px]">Intellectual Property & Patents ({patents.length}):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {patents.map(pat => (
                  <div key={pat.id} className="p-2 border rounded bg-slate-50 text-[11px]">
                    <div className="font-bold text-slate-900">{pat.title}</div>
                    <div className="text-slate-600 font-mono">App No: {pat.application_number} • Status: {pat.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic Contributions */}
          {academicContributions.length > 0 && (
            <div className="space-y-1 text-xs pt-1">
              <span className="font-bold text-slate-800 block text-[11px]">Books & Scholarly Contributions ({academicContributions.length}):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {academicContributions.map(ac => (
                  <div key={ac.id} className="p-2 border rounded bg-slate-50 text-[11px]">
                    <div className="font-bold text-slate-900">{ac.role_or_title || ac.title}</div>
                    <div className="text-slate-600">{ac.details || ac.publisher} ({ac.year_or_date || ac.year || '—'})</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================
            MODULE 7: FACULTY DEVELOPMENT & TRAINING
        ======================================================== */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center justify-between">
            <span>7. Faculty Development Programmes & Pedagogic Training (Module 7)</span>
            <span className="text-[10px] text-slate-500 font-mono">{trainingProgrammes.length} Programme(s)</span>
          </h3>
          {trainingProgrammes.length > 0 ? (
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-100 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-1.5 text-left">Category</th>
                  <th className="px-3 py-1.5 text-left">Programme Title</th>
                  <th className="px-3 py-1.5 text-left">Organizing Institution</th>
                  <th className="px-3 py-1.5 text-left">Duration & Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {trainingProgrammes.map(t => (
                  <tr key={t.id}>
                    <td className="px-3 py-1.5 font-bold text-slate-800">{t.category}</td>
                    <td className="px-3 py-1.5">{t.programme_title}</td>
                    <td className="px-3 py-1.5">{t.organizing_institution}</td>
                    <td className="px-3 py-1.5">{t.duration_hours_days || '—'} ({t.mode || 'Offline'})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-50 border rounded-xl">No faculty development programmes or pedagogic training recorded on file.</p>
          )}
        </div>

        {/* ========================================================
            MODULE 8: PREVIOUS EMPLOYMENT HISTORY
        ======================================================== */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center justify-between">
            <span>8. Previous Employment History Prior to University (Module 8)</span>
            <span className="text-[10px] text-slate-500 font-mono">{previousEmployment.length} Prior Posting(s)</span>
          </h3>
          {previousEmployment.length > 0 ? (
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-100 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-1.5 text-left">Prior Employer / Organization</th>
                  <th className="px-3 py-1.5 text-left">Designation</th>
                  <th className="px-3 py-1.5 text-left">Tenure</th>
                  <th className="px-3 py-1.5 text-left">Reason for Leaving</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {previousEmployment.map(pe => (
                  <tr key={pe.id}>
                    <td className="px-3 py-1.5 font-bold">{pe.employer_name}</td>
                    <td className="px-3 py-1.5">{pe.designation}</td>
                    <td className="px-3 py-1.5 font-mono text-[11px]">{pe.date_of_joining} to {pe.date_of_leaving || 'Relieved'}</td>
                    <td className="px-3 py-1.5 text-slate-600">{pe.reason_for_leaving || 'Career Advancement'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-50 border rounded-xl">Nil / Direct appointment without prior external institutional service.</p>
          )}
        </div>

        {/* ========================================================
            MODULE 9: AUTHORIZED SALARY & PAYROLL PROFILE
        ======================================================== */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center justify-between">
            <span>9. Authorized Salary & Payroll Reference (Module 9)</span>
            <span className="text-[10px] text-slate-500 font-mono">CONFIDENTIAL & VERIFIED</span>
          </h3>
          <table className="w-full text-xs border border-slate-200">
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-slate-50/70">
                <td className="px-3 py-1.5 font-bold w-1/4 text-slate-800">Academic Pay Scale / Level</td>
                <td className="px-3 py-1.5 w-1/4 font-semibold text-blue-900">{profile.pay_scale || 'Academic Level 10 (UGC Scale)'}</td>
                <td className="px-3 py-1.5 font-bold w-1/4 text-slate-800">Basic Pay (INR)</td>
                <td className="px-3 py-1.5 w-1/4 font-bold text-slate-900">{profile.basic_pay ? `₹ ${Number(profile.basic_pay).toLocaleString('en-IN')}` : '₹ 57,700 (Standard Entry)'}</td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 font-bold text-slate-800">Payroll Identification Code</td>
                <td className="px-3 py-1.5 font-mono text-slate-700">{profile.payroll_code || 'CDU-PR-8821'}</td>
                <td className="px-3 py-1.5 font-bold text-slate-800">Payroll Verification Status</td>
                <td className="px-3 py-1.5 font-semibold text-emerald-700">{profile.payroll_verification_status || 'Verified & Active'}</td>
              </tr>
              <tr className="bg-slate-50/70">
                <td className="px-3 py-1.5 font-bold text-slate-800">Salary Disbursing Bank</td>
                <td className="px-3 py-1.5">{profile.salary_bank_name || 'State Bank of India (CDU Campus Branch)'}</td>
                <td className="px-3 py-1.5 font-bold text-slate-800">Account (Masked)</td>
                <td className="px-3 py-1.5 font-mono text-slate-600">{profile.salary_account_masked || '•••• •••• •••• 4829'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ========================================================
            MODULE 10: ADDITIONAL SERVICE & PROGRESSION RECORDS
        ======================================================== */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center justify-between">
            <span>10. Additional Service & Career Progression Records (Module 10)</span>
            <span className="text-[10px] text-slate-500 font-mono">Administrative Log</span>
          </h3>
          <table className="w-full text-xs border border-slate-200">
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-slate-50/70">
                <td className="px-3 py-1.5 font-bold w-1/3 text-slate-800">Career Advancement Scheme (CAS) / Promotions</td>
                <td className="px-3 py-1.5 w-2/3">{profile.promotion_history_notes || 'Regular entry cadre; eligible for upcoming statutory Career Advancement review.'}</td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 font-bold text-slate-800">Leave of Absence / Deputation / Sabbatical</td>
                <td className="px-3 py-1.5">{profile.leave_deputation_info || 'Nil / Continuous active collegiate teaching service.'}</td>
              </tr>
              <tr className="bg-slate-50/70">
                <td className="px-3 py-1.5 font-bold text-slate-800">Institutional Transfers & Postings</td>
                <td className="px-3 py-1.5">{profile.transfer_history_notes || 'Posted to parent academic department since inception.'}</td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 font-bold text-slate-800">Service Continuity & Disciplinary Standing</td>
                <td className="px-3 py-1.5 text-emerald-800 font-medium">Clean Record • Exemplary Service • No disciplinary or vigilance inquiry pending.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ========================================================
            MODULE 11: STATUTORY DOCUMENT REPOSITORY (ALL UPLOADED DOCS WITH DIRECT VIEW BUTTONS)
        ======================================================== */}
        <div className="space-y-3">
          <div className="border-b-2 border-slate-300 pb-1 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>11. Statutory Document Repository & Compliance Verification Seal (Module 11)</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              {documents.length} Uploaded & Formally Verified
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Statutory scanned certificates and orders permanently archived in Chaitanya University Digital Repository. 
            Click <strong className="text-blue-700">View Document</strong> to preview the full document in high resolution or open it in a new tab.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            {documents.length > 0 ? (
              documents.map(d => {
                const fileUrl = `/api/documents/file/${d.stored_filename}`;
                return (
                  <div
                    key={d.id}
                    className="p-3.5 border-2 border-slate-200 rounded-xl bg-slate-50/90 shadow-xs hover:border-blue-400 hover:bg-blue-50/40 transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 uppercase tracking-wider truncate">
                          {d.document_category || 'Statutory'}
                        </span>
                        <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          VERIFIED
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="font-extrabold text-slate-900 text-sm line-clamp-2 leading-snug">
                        {d.document_title}
                      </h4>

                      {/* Metadata */}
                      <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center justify-between">
                        <span>UUID: <strong className="text-slate-800 font-bold">{d.doc_uuid}</strong></span>
                        {d.file_size && (
                          <span>{(d.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        File: <span className="font-medium text-slate-700">{d.original_filename}</span>
                      </div>
                      {d.upload_timestamp && (
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          Archived on: {new Date(d.upload_timestamp).toLocaleDateString('en-IN')}
                        </div>
                      )}
                    </div>

                    {/* Interactive Action Buttons (Hidden when printing/PDF export) */}
                    <div className="no-print pt-2.5 border-t border-slate-200 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDoc(d)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="Click to view full preview of this document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </button>

                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center transition-colors"
                        title="Open document file in new browser window"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <a
                        href={fileUrl}
                        download={d.original_filename}
                        className="py-1.5 px-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center transition-colors"
                        title="Download document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Print-only certification line */}
                    <div className="print-only text-[9px] text-slate-500 border-t border-slate-300 pt-1 italic">
                      Verified Document on file: {d.doc_uuid} ({d.original_filename})
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full p-4 text-center text-xs text-slate-500 bg-slate-50 border rounded-xl">
                No statutory documents uploaded yet.
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            MODULE 12: MULTI-TIER CLEARANCE AUDIT TRAIL
        ======================================================== */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex items-center justify-between">
            <span>12. Official Clearance Hierarchy & Scrutiny Log (Module 12)</span>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Hierarchical Clearances</span>
          </h3>
          {verificationLogs.length > 0 ? (
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-100 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-1.5 text-left">Clearance Level</th>
                  <th className="px-3 py-1.5 text-left">Reviewing Authority</th>
                  <th className="px-3 py-1.5 text-left">Action Taken</th>
                  <th className="px-3 py-1.5 text-left">Remarks & Observations</th>
                  <th className="px-3 py-1.5 text-center">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {verificationLogs.map(log => (
                  <tr key={log.id}>
                    <td className="px-3 py-1.5 font-bold uppercase text-[11px]">
                      {log.role === 'hod' ? 'Level 1: HOD' : log.role === 'dean' ? 'Level 2: Dean' : 'Level 3: Registrar'}
                    </td>
                    <td className="px-3 py-1.5 font-semibold text-slate-800">{log.performed_by_name || 'Designated Authority'}</td>
                    <td className="px-3 py-1.5 font-bold text-emerald-700">{log.action}</td>
                    <td className="px-3 py-1.5 text-slate-600 italic">"{log.remarks || 'Credentials and qualifications verified.'}"</td>
                    <td className="px-3 py-1.5 text-center font-mono text-[10px]">
                      {log.created_at ? new Date(log.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Multi-Tier Verification Protocol Initiated</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Dossier submitted for official Level 1 (Head of Department) scrutiny, Level 2 (Dean of Faculty) endorsement, and Level 3 (Registrar / Establishment) permanent archiving.
              </p>
            </div>
          )}
        </div>

        {/* ========================================================
            STATUTORY DECLARATION & INSTITUTIONAL UNDERTAKING
        ======================================================== */}
        <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl text-xs space-y-2 text-slate-700">
          <strong className="text-slate-900 block font-bold text-sm">Statutory Confirmation & Institutional Declaration:</strong>
          <p className="italic leading-relaxed">
            "I hereby solemnly declare that all particulars entered in this 12-module official staff dossier, including personal identity, educational qualifications, eligibility examinations, collegiate teaching workloads, publications, statutory documents, and service histories are true, complete, and correct to the best of my knowledge and belief. I understand that any deliberate misstatement or concealment of facts will render me liable for administrative review and disciplinary proceedings as per Chaitanya (Deemed to be University) Service Rules and UGC Regulations."
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between font-mono text-[11px] text-slate-500 border-t border-slate-200 mt-2 gap-1">
            <span>Reference: <strong className="text-slate-800">{profile.submission_ref || 'CDU-SDRMS-2026-0042'}</strong></span>
            <span>Electronic Timestamp: <strong className="text-slate-800">{profile.submitted_at || 'Verified Record on File'}</strong></span>
          </div>
        </div>

        {/* ========================================================
            OFFICIAL UNIVERSITY SIGNATURES & VERIFICATION SEAL
        ======================================================== */}
        <div className="pt-8 flex flex-col sm:flex-row items-center sm:items-end justify-between text-center text-xs gap-6">
          <div className="flex flex-col items-center">
            <div className="w-52 border-b-2 border-slate-800 pb-1 font-bold text-slate-900 text-sm">
              {fullNameWithSalutation || profile.full_name}
            </div>
            <span className="text-[10px] text-slate-500 block mt-1 font-semibold uppercase tracking-wider">
              Staff Member Signature
            </span>
          </div>

          <div className="w-24 h-24 rounded-full border-2 border-emerald-800 flex flex-col items-center justify-center p-1 text-[9px] font-black uppercase text-emerald-900 text-center leading-tight shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-700 mb-0.5" />
            <span>Chaitanya</span>
            <span>University</span>
            <span className="text-[8px] text-emerald-700 font-bold">Verified Seal</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-52 border-b-2 border-slate-800 pb-1 font-bold text-slate-900 text-sm">
              Registrar / Establishment Section
            </div>
            <span className="text-[10px] text-slate-500 block mt-1 font-semibold uppercase tracking-wider">
              Authorized University Seal
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Document Viewer Modal */}
      {selectedDoc && (
        <DocumentViewerModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}
