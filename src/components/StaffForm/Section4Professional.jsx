import React, { useState } from 'react';
import { Award, Plus, Trash2, CheckCircle2, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Section4Professional({ professionalQuals = [], onRefreshData, isLocked }) {
  const { showToast } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customExam, setCustomExam] = useState('');
  const [customAuthority, setCustomAuthority] = useState('');

  const emptyForm = {
    qualification_type: '',
    title_or_exam: '',
    qualifying_authority: '',
    registration_no: '',
    award_date: '',
    validity_date: '',
    verification_remarks: ''
  };

  const [form, setForm] = useState(emptyForm);

  const openModal = () => {
    setForm(emptyForm);
    setCustomExam('');
    setCustomAuthority('');
    setShowModal(true);
  };

  const examOptions = [
    'UGC-NET for Lectureship / Assistant Professor',
    'UGC-NET with Junior Research Fellowship (JRF)',
    'CSIR-UGC NET for Science Disciplines',
    'Telangana State Eligibility Test (TS-SET)',
    'Andhra Pradesh State Eligibility Test (AP-SET)',
    'Graduate Aptitude Test in Engineering (GATE)',
    'Graduate Pharmacy Aptitude Test (GPAT)',
    'ICMR-JRF (Indian Council of Medical Research)',
    'ICAR-NET (Agricultural Scientists Recruitment Board)',
    'Pharmacy Council of India (PCI) Registered Pharmacist',
    'Indian Nursing Council (INC) Registered Nurse & Midwife',
    'Bar Council of India Advocate Enrollment',
    'Certified Information Systems Auditor (CISA)',
    'Other Statutory Accreditation'
  ];

  const authorityOptions = [
    'National Testing Agency (NTA) / UGC',
    'Council of Scientific and Industrial Research (CSIR)',
    'Osmania University (TS-SET Agency)',
    'Andhra University (AP-SET Agency)',
    'Indian Institute of Technology (IIT / GATE Board)',
    'Pharmacy Council of India (PCI)',
    'Indian Nursing Council (INC) / Telangana Nursing Council',
    'Bar Council of India',
    'Institution of Engineers (India)',
    'Other Statutory University / National Body'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const finalExam = (form.title_or_exam === 'Other Statutory Accreditation' || form.title_or_exam === 'Other')
      ? customExam.trim()
      : form.title_or_exam;
    const finalAuthority = (form.qualifying_authority === 'Other Statutory University / National Body' || form.qualifying_authority === 'Other')
      ? customAuthority.trim()
      : form.qualifying_authority;

    if (!finalExam || !finalAuthority) {
      showToast('Please select examination and qualifying authority.', 'error');
      return;
    }

    const derivedQualType = form.qualification_type || (
      finalExam.toLowerCase().includes('council') || finalExam.toLowerCase().includes('pharmacist') || finalExam.toLowerCase().includes('nurse') || finalExam.toLowerCase().includes('advocate') || finalExam.toLowerCase().includes('license')
        ? 'Statutory Council Registration'
        : 'National / State Eligibility Test'
    );

    setSaving(true);
    try {
      const res = await fetch('/api/staff/professional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sdrms_token')}`
        },
        body: JSON.stringify({
          ...form,
          qualification_type: derivedQualType,
          title_or_exam: finalExam,
          qualifying_authority: finalAuthority
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add record');
      showToast('Statutory eligibility recorded.', 'success');
      setShowModal(false);
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this record?')) return;
    try {
      const res = await fetch(`/api/staff/professional/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('Record removed.', 'info');
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Module 4: Statutory Eligibility (NET/SLET/GATE) & Council Accreditations
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            UGC-NET, CSIR-NET, State Eligibility Tests, GATE, GPAT, and Professional Council Licenses.
          </p>
        </div>

        {!isLocked && (
          <button
            type="button"
            onClick={openModal}
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Eligibility / Council</span>
          </button>
        )}
      </div>

      {professionalQuals.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Exam / Council Accreditation</th>
                  <th className="py-3 px-4">Issuing Statutory Authority</th>
                  <th className="py-3 px-4">Registration / Roll No</th>
                  <th className="py-3 px-4">Award Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  {!isLocked && <th className="py-3 px-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {professionalQuals.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {p.title_or_exam}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {p.qualifying_authority}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-700">
                      {p.registration_no || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {p.award_date || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Valid</span>
                      </span>
                    </td>
                    {!isLocked && (
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500 space-y-2">
          <Award className="w-10 h-10 text-slate-400 mx-auto stroke-1" />
          <h4 className="font-bold text-sm text-slate-800">No Professional Qualifications Recorded</h4>
          <p className="text-xs max-w-sm mx-auto">
            If you have qualified UGC-NET, SET, GATE, or hold Pharmacy / Nursing council registration, add it here.
          </p>
          {!isLocked && (
            <button
              type="button"
              onClick={openModal}
              className="mt-2 px-5 py-2 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
            >
              Add Eligibility Record
            </button>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Add Eligibility Exam / Council Accreditation
                </h4>
                <p className="text-xs text-slate-500">
                  Select your examination or council accreditation from options.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Examination / Council Accreditation <span className="text-rose-500">*</span>
                </label>
                <select
                  name="title_or_exam"
                  value={form.title_or_exam}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white"
                  required
                >
                  <option value="">Select Examination / Council Accreditation...</option>
                  {examOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {(form.title_or_exam === 'Other Statutory Accreditation' || form.title_or_exam === 'Other') && (
                  <input
                    type="text"
                    value={customExam}
                    onChange={e => setCustomExam(e.target.value)}
                    placeholder="Type name of your examination / accreditation..."
                    className="w-full mt-2 bg-white border border-blue-400 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                    required
                    autoFocus
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Statutory Qualifying Authority <span className="text-rose-500">*</span>
                </label>
                <select
                  name="qualifying_authority"
                  value={form.qualifying_authority}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white"
                  required
                >
                  <option value="">Select Statutory Qualifying Authority...</option>
                  {authorityOptions.map(auth => (
                    <option key={auth} value={auth}>{auth}</option>
                  ))}
                </select>
                {(form.qualifying_authority === 'Other Statutory University / National Body' || form.qualifying_authority === 'Other') && (
                  <input
                    type="text"
                    value={customAuthority}
                    onChange={e => setCustomAuthority(e.target.value)}
                    placeholder="Type name of statutory body / agency..."
                    className="w-full mt-2 bg-white border border-blue-400 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                    required
                    autoFocus
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registration / Roll / Certificate Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="registration_no"
                    value={form.registration_no}
                    onChange={handleChange}
                    placeholder=""
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Award / Qualifying Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="award_date"
                    value={form.award_date}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Add Statutory Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
