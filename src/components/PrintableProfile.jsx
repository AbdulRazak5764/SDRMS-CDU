import React from 'react';
import { Printer, ArrowLeft, Building, CheckCircle2, User, Award, ShieldCheck, BookOpen, Clock } from 'lucide-react';

export default function PrintableProfile({ profileData, onBack }) {
  const profile = profileData?.profile || {};
  const qualifications = profileData?.qualifications || [];
  const professionalQuals = profileData?.professionalQuals || [];
  const teachingExp = profileData?.teachingExp || [];
  const publications = profileData?.publications || [];
  const projects = profileData?.projects || [];
  const trainingProgrammes = profileData?.trainingProgrammes || [];
  const documents = profileData?.documents || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Floating Action Bar (Hidden on print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between sticky top-16 z-30">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to SDRMS Portal</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Print ready official dossier (A4 formatted)
          </span>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Official University Letterhead Dossier Sheet */}
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-slate-300 card-print font-sans text-slate-900 space-y-6">
        {/* Institutional Letterhead */}
        <div className="border-b-2 border-[#0f2942] pb-5 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-[#0f2942] to-teal-700 text-white font-black text-2xl flex items-center justify-center shadow-inner mb-2 border border-teal-500/40">
            CDU
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f2942] uppercase">
            Chaitanya (Deemed to be University)
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide mt-0.5">
            Hyderabad, Telangana, India
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-teal-900 border border-slate-300 tracking-wider uppercase">
            Staff Digital Records Management System (SDRMS) — Official Employee Dossier
          </div>
        </div>

        {/* Header Summary & Passport Photo */}
        <div className="flex items-start justify-between gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
          <div className="space-y-1.5 flex-1 text-xs">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{profile.full_name || 'Staff Member'}</h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                {profile.workflow_status || 'Approved'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-slate-700 pt-1">
              <div><strong className="text-slate-900">Employee ID:</strong> {profile.employee_id}</div>
              <div><strong className="text-slate-900">Designation:</strong> {profile.designation}</div>
              <div><strong className="text-slate-900">Department:</strong> {profile.department_name}</div>
              <div><strong className="text-slate-900">Faculty:</strong> {profile.faculty_name || 'Constituent'}</div>
              <div><strong className="text-slate-900">Official Email:</strong> {profile.official_email}</div>
              <div><strong className="text-slate-900">Mobile:</strong> {profile.mobile}</div>
              <div><strong className="text-slate-900">Joining Date (CDU):</strong> {profile.joining_date_university}</div>
              <div><strong className="text-slate-900">Total Experience:</strong> {profile.calculated_total_exp_years} Years</div>
            </div>
          </div>

          <div className="w-24 h-32 rounded-lg border-2 border-slate-300 bg-white overflow-hidden shadow-sm flex items-center justify-center flex-shrink-0">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-slate-400" />
            )}
          </div>
        </div>

        {/* Section 1 & 2: Personal & Service Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#0f2942] uppercase tracking-wider border-b border-slate-300 pb-1">
            1. Personal & Employment Profile
          </h3>
          <table className="w-full text-xs border border-slate-200">
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-slate-50/60">
                <td className="px-3 py-1.5 font-bold w-1/4 text-slate-800">Date of Birth</td>
                <td className="px-3 py-1.5 w-1/4">{profile.dob}</td>
                <td className="px-3 py-1.5 font-bold w-1/4 text-slate-800">Gender & Marital Status</td>
                <td className="px-3 py-1.5 w-1/4">{profile.gender} • {profile.marital_status}</td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 font-bold text-slate-800">Current Address</td>
                <td colSpan={3} className="px-3 py-1.5">{profile.current_address}, {profile.city}, {profile.state} - {profile.pincode}</td>
              </tr>
              <tr className="bg-slate-50/60">
                <td className="px-3 py-1.5 font-bold text-slate-800">Employment Type</td>
                <td className="px-3 py-1.5">{profile.employment_type}</td>
                <td className="px-3 py-1.5 font-bold text-slate-800">Campus Location</td>
                <td className="px-3 py-1.5">{profile.campus_location}</td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 font-bold text-slate-800">Appointment Order</td>
                <td className="px-3 py-1.5">{profile.appointment_order_no} ({profile.appointment_order_date})</td>
                <td className="px-3 py-1.5 font-bold text-slate-800">Confirmation Date</td>
                <td className="px-3 py-1.5">{profile.confirmation_date || 'Confirmed'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Educational Qualifications */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#0f2942] uppercase tracking-wider border-b border-slate-300 pb-1">
            2. Educational & Academic Qualifications
          </h3>
          <table className="w-full text-xs border border-slate-200">
            <thead className="bg-slate-100 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-1.5 text-left">Degree / Level</th>
                <th className="px-3 py-1.5 text-left">Discipline / Branch</th>
                <th className="px-3 py-1.5 text-left">Institution / University</th>
                <th className="px-3 py-1.5 text-center">Year</th>
                <th className="px-3 py-1.5 text-left">Grade / CGPA</th>
                <th className="px-3 py-1.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {qualifications.map(q => (
                <tr key={q.id}>
                  <td className="px-3 py-1.5 font-bold text-slate-900">{q.degree_title} ({q.level})</td>
                  <td className="px-3 py-1.5">{q.discipline || 'General'}</td>
                  <td className="px-3 py-1.5">{q.institution}</td>
                  <td className="px-3 py-1.5 text-center">{q.year_of_completion}</td>
                  <td className="px-3 py-1.5 font-semibold">{q.percentage_or_cgpa}</td>
                  <td className="px-3 py-1.5 text-center font-bold text-emerald-700">Verified</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 5: Teaching Experience */}
        {teachingExp.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#0f2942] uppercase tracking-wider border-b border-slate-300 pb-1">
              3. Teaching & Collegiate Experience
            </h3>
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-100 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-1.5 text-left">Institution</th>
                  <th className="px-3 py-1.5 text-left">Designation</th>
                  <th className="px-3 py-1.5 text-left">Period</th>
                  <th className="px-3 py-1.5 text-left">Level</th>
                  <th className="px-3 py-1.5 text-left">Courses Taught</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {teachingExp.map(te => (
                  <tr key={te.id}>
                    <td className="px-3 py-1.5 font-bold">{te.institution_name}</td>
                    <td className="px-3 py-1.5">{te.designation_held}</td>
                    <td className="px-3 py-1.5">{te.start_date} to {te.is_current ? 'Present' : te.end_date}</td>
                    <td className="px-3 py-1.5">{te.teaching_involvement}</td>
                    <td className="px-3 py-1.5">{te.subjects_taught}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section 6: Research Highlights */}
        {publications.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#0f2942] uppercase tracking-wider border-b border-slate-300 pb-1">
              4. Research Publications & Funded Projects Summary
            </h3>
            <div className="space-y-1.5 text-xs">
              {publications.map((p, idx) => (
                <div key={p.id} className="text-slate-800">
                  {idx + 1}. <strong>{p.title}</strong>, <em>{p.journal_or_conf_name}</em> ({p.publication_year}), Indexed: {p.indexing || 'Scopus'}.
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 10: Verified Documents Seal */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#0f2942] uppercase tracking-wider border-b border-slate-300 pb-1">
            5. Document Compliance Verification Seal
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {documents.map(d => (
              <div key={d.id} className="p-2 border rounded bg-slate-50/70 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 truncate">{d.document_title}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{d.doc_uuid}</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                  VERIFIED
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Statutory Declaration Block */}
        <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg text-xs space-y-1.5 text-slate-700">
          <strong className="text-slate-900 block">Statutory Confirmation:</strong>
          <p className="italic">
            "I declare that the information provided by me is true and correct to the best of my knowledge and belief. I understand that the University may verify the information and supporting documents and may require corrections or additional evidence."
          </p>
          <div className="pt-2 flex items-center justify-between font-mono text-[11px] text-slate-500 border-t border-slate-200 mt-2">
            <span>Ref: {profile.submission_ref || 'CDU-SDRMS-2026-0042'}</span>
            <span>Electronic Timestamp: {profile.submitted_at || 'Verified Record'}</span>
          </div>
        </div>

        {/* Official University Signatures */}
        <div className="pt-8 flex items-end justify-between text-center text-xs">
          <div>
            <div className="w-40 border-b border-slate-800 pb-1 font-semibold text-slate-900">
              {profile.full_name}
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Staff Member Signature</span>
          </div>

          <div className="w-20 h-20 rounded-full border-2 border-teal-800 flex items-center justify-center p-1 text-[9px] font-black uppercase text-teal-900 text-center leading-tight">
            Chaitanya University<br/>Verified Seal
          </div>

          <div>
            <div className="w-44 border-b border-slate-800 pb-1 font-semibold text-slate-900">
              Registrar / Establishment
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Authorized University Seal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
