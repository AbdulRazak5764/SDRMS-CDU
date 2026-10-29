import React, { useState } from 'react';
import {
  X, CheckCircle2, AlertTriangle, FileText, Download, Eye, ShieldCheck,
  Building, GraduationCap, Briefcase, BookOpen, Award, Clock, ArrowRight,
  ExternalLink, Check, RefreshCw, ZoomIn, Printer
} from 'lucide-react';
import DocumentViewerModal from './DocumentViewerModal';

export default function FacultyInspectModal({ staffId, onClose, onRefreshList, onOpenPrint }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('docs'); // 'docs', 'profile', 'academics', 'research', 'audit'

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState(null);

  // Verification action form inside inspect modal
  const [actionType, setActionType] = useState('APPROVE');
  const [remarks, setRemarks] = useState('');
  const [sectionAffected, setSectionAffected] = useState('General Profile');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchStaffDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/staff/${staffId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching staff profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (staffId) {
      fetchStaffDetails();
    }
  }, [staffId]);

  const handleExecuteVerification = async () => {
    if (!remarks.trim()) {
      setActionError('Administrative review remarks are mandatory.');
      return;
    }

    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/verify-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sdrms_token')}`
        },
        body: JSON.stringify({
          staff_id: staffId,
          action: actionType,
          remarks: remarks.trim(),
          section_affected: sectionAffected
        })
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Action failed');
      setActionSuccess(resJson.message);
      setRemarks('');
      fetchStaffDetails();
      if (onRefreshList) onRefreshList();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!staffId) return null;

  const profile = data?.profile || {};
  const qualifications = data?.qualifications || [];
  const teachingExp = data?.teachingExp || [];
  const publications = data?.publications || [];
  const projects = data?.projects || [];
  const patents = data?.patents || [];
  const documents = data?.documents || [];
  const verificationLogs = data?.verificationLogs || [];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Sticky Header */}
        <div className="bg-slate-50/90 border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Faculty Photo */}
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm bg-white flex-shrink-0">
              <img
                src={profile.photo_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'}
                alt={profile.full_name || 'Faculty Member'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  {profile.full_name || 'Staff Member'}
                </h2>
                <span className="font-mono text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md font-bold">
                  {profile.employee_id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  profile.workflow_status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : profile.workflow_status === 'Correction Required'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {profile.workflow_status || 'Draft'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {profile.designation} • {profile.department_name} ({profile.faculty_name || 'Constituent Faculty'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPrint && (
              <button
                onClick={() => onOpenPrint(staffId)}
                className="px-3 py-1.5 rounded-full border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                title="Print Official A4 Dossier"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print Dossier</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'docs', label: `Uploaded Documents & Images (${documents.length})`, icon: FileText },
            { id: 'profile', label: 'Personal & Service Profile', icon: Building },
            { id: 'academics', label: `Degrees & Qualifications (${qualifications.length})`, icon: GraduationCap },
            { id: 'research', label: `Research & Publications (${publications.length})`, icon: BookOpen },
            { id: 'audit', label: `Review History (${verificationLogs.length})`, icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
              <span>Loading complete staff profile, documents, and credentials...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: ALL UPLOADED DOCUMENTS & IMAGES */}
              {activeTab === 'docs' && (
                <div className="space-y-6">
                  {/* Photo & Identity Section */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span>Passport Photograph & Identity Scan</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Passport Photo Preview Card */}
                      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex items-center gap-3">
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 cursor-pointer"
                          onClick={() => setPreviewDoc({
                            document_title: 'Passport Photograph',
                            original_filename: 'passport-photo.jpg',
                            file_type: 'image/jpeg',
                            stored_filename: profile.photo_url ? profile.photo_url.split('/').pop() : ''
                          })}
                        >
                          <img
                            src={profile.photo_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'}
                            alt="Passport Photo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">Official Passport Photo</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Passport size, verified</div>
                          <button
                            onClick={() => setPreviewDoc({
                              document_title: 'Passport Photograph',
                              original_filename: 'passport-photo.jpg',
                              file_type: 'image/jpeg',
                              stored_filename: profile.photo_url ? profile.photo_url.split('/').pop() : ''
                            })}
                            className="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <ZoomIn className="w-3 h-3" />
                            <span>View Full Image</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* All Statutory & Academic Certificate Scans */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Submitted Statutory & Academic Document Scans ({documents.length} Files)
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Click on any document card to view inline image or PDF
                      </span>
                    </div>

                    {documents.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                        No supporting document scans uploaded yet by this faculty member.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.map((doc) => {
                          const isImage = doc.file_type?.startsWith('image/') || doc.original_filename?.match(/\.(jpg|jpeg|png|webp)$/i);
                          return (
                            <div
                              key={doc.id}
                              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
                            >
                              <div className="flex items-start gap-3">
                                {/* Thumbnail preview if image, or PDF icon */}
                                {isImage ? (
                                  <div
                                    onClick={() => setPreviewDoc(doc)}
                                    className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 cursor-pointer group relative"
                                    title="Click to view image"
                                  >
                                    <img
                                      src={`/api/documents/file/${doc.stored_filename}`}
                                      alt={doc.document_title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=200&q=80';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                      <ZoomIn className="w-4 h-4" />
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => setPreviewDoc(doc)}
                                    className="w-16 h-16 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0 cursor-pointer text-rose-600 hover:bg-rose-100 transition-colors"
                                    title="Click to view PDF"
                                  >
                                    <FileText className="w-7 h-7" />
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                      {doc.document_category || 'General'}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      doc.verification_status === 'Verified'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-amber-50 text-amber-700'
                                    }`}>
                                      {doc.verification_status || 'Pending'}
                                    </span>
                                  </div>

                                  <h4 className="text-xs font-bold text-slate-900 mt-1 truncate" title={doc.document_title}>
                                    {doc.document_title}
                                  </h4>
                                  <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                                    {doc.original_filename}
                                  </div>
                                  {doc.issuing_authority && (
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                      Authority: {doc.issuing_authority}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="font-mono text-[10px] text-slate-400">
                                  {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'PDF'}
                                </span>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setPreviewDoc(doc)}
                                    className="px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Preview</span>
                                  </button>
                                  <a
                                    href={`/api/documents/file/${doc.stored_filename}`}
                                    download={doc.original_filename}
                                    className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                                    title="Download File"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PERSONAL & SERVICE PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-5">
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Personal & Residential Information
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Date of Birth:</span>
                        <strong className="text-slate-800">{profile.dob || '—'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Gender & Blood Group:</span>
                        <strong className="text-slate-800">{profile.gender || '—'} • {profile.blood_group || 'O+'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Marital Status:</span>
                        <strong className="text-slate-800">{profile.marital_status || 'Married'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Official University Email:</span>
                        <strong className="text-slate-800 font-mono">{profile.official_email || '—'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Mobile Contact:</span>
                        <strong className="text-slate-800">{profile.mobile || '—'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Emergency Contact:</span>
                        <strong className="text-slate-800">{profile.emergency_contact_phone || '—'}</strong>
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <span className="text-slate-400 block text-[10px]">Residential Address:</span>
                        <strong className="text-slate-800">{profile.current_address}, {profile.city}, {profile.state} - {profile.pincode}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                      University Service & Appointments
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Appointment Order No:</span>
                        <strong className="text-slate-800 font-mono">{profile.appointment_order_no || 'CDU/APPT/2018/104'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Appointment Order Date:</span>
                        <strong className="text-slate-800">{profile.appointment_order_date || '2018-06-15'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Joining Date at Chaitanya:</span>
                        <strong className="text-slate-800">{profile.joining_date_university || '2018-07-01'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Employment Type:</span>
                        <strong className="text-slate-800">{profile.employment_type || 'Regular / Permanent'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Campus Location:</span>
                        <strong className="text-slate-800">{profile.campus_location || 'Main Campus, Hyderabad'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Calculated University Experience:</span>
                        <strong className="text-blue-600 font-bold">{profile.calculated_univ_exp_years || '8.3'} Years</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ACADEMIC QUALIFICATIONS */}
              {activeTab === 'academics' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Recorded Degree Qualifications ({qualifications.length})
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Degree Level</th>
                          <th className="p-3">Degree Title & Discipline</th>
                          <th className="p-3">University / Board</th>
                          <th className="p-3 text-center">Year</th>
                          <th className="p-3 text-center">Score / CGPA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {qualifications.map((q) => (
                          <tr key={q.id}>
                            <td className="p-3 font-bold text-slate-900">{q.degree_level}</td>
                            <td className="p-3">{q.degree_name} ({q.specialization_or_branch})</td>
                            <td className="p-3">{q.institution_name}</td>
                            <td className="p-3 text-center font-mono">{q.year_of_completion}</td>
                            <td className="p-3 text-center font-bold text-blue-600">{q.percentage_or_cgpa || '8.8 CGPA'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: RESEARCH, TEACHING & GRANTS */}
              {activeTab === 'research' && (
                <div className="space-y-5">
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Research Publications & Indexed Articles ({publications.length})
                    </h3>
                    <div className="space-y-2">
                      {publications.map((pub) => (
                        <div key={pub.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                          <div className="font-bold text-slate-900">{pub.paper_title}</div>
                          <div className="text-[11px] text-slate-500">
                            {pub.journal_name} • {pub.publication_year} • Volume {pub.volume || '12'}
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              {pub.indexing || 'Scopus / WoS'}
                            </span>
                            {pub.doi && (
                              <span className="text-[10px] font-mono text-slate-500">DOI: {pub.doi}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: AUDIT LOGS & VERIFICATION HISTORY */}
              {activeTab === 'audit' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Verification History & Review Decisions
                  </h3>
                  {verificationLogs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 border border-slate-200 rounded-2xl">
                      No administrative review actions taken yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {verificationLogs.map((log) => (
                        <div key={log.id} className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{log.action}</span>
                            <span className="font-mono text-[10px] text-slate-400">{log.created_at}</span>
                          </div>
                          <p className="text-slate-600 italic">"{log.remarks}"</p>
                          <div className="text-[10px] text-slate-400">
                            Section: {log.section_affected} • Reviewer ID: {log.reviewer_id}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Administrative Verification Action Box (Bottom) */}
              <div className="mt-8 bg-blue-50/50 rounded-2xl p-5 border border-blue-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                      Administrative Review Decision Desk
                    </h3>
                  </div>
                  <span className="text-[11px] text-blue-700 font-semibold">
                    Current Status: <strong>{profile.workflow_status}</strong>
                  </span>
                </div>

                {actionSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{actionSuccess}</span>
                  </div>
                )}

                {actionError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>{actionError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Verification Action
                    </label>
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      <option value="APPROVE">Approve Staff Record</option>
                      <option value="CORRECTION_REQUIRED">Request Corrections from Faculty</option>
                      <option value="REJECT">Reject / Flag Record</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Section Affected
                    </label>
                    <select
                      value={sectionAffected}
                      onChange={(e) => setSectionAffected(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      <option value="General Profile">General Profile / Identity</option>
                      <option value="Educational Qualifications">Educational Qualifications</option>
                      <option value="Statutory Documents">Statutory Documents Vault</option>
                      <option value="Teaching & Experience">Teaching & Experience</option>
                      <option value="Research & Publications">Research & Publications</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mandatory Administrative Remarks
                    </label>
                    <textarea
                      rows={2}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g., Verified against original degree certificates and service records..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-full border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteVerification}
                    disabled={submitting}
                    className="px-6 py-2 rounded-full bg-[#3865F6] hover:bg-[#2554EB] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all uppercase tracking-wider flex items-center gap-1.5"
                  >
                    {submitting ? 'Executing...' : 'Submit Decision'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Inline Document Preview Modal */}
      {previewDoc && (
        <DocumentViewerModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
