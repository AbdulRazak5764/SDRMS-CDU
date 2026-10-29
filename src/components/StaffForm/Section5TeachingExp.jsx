import React, { useState } from 'react';
import { Clock, Plus, Trash2, CheckCircle2, Building, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Section5TeachingExp({ teachingExp = [], onRefreshData, isLocked }) {
  const { showToast } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    institution_name: 'Chaitanya (Deemed to be University), Hyderabad',
    designation_held: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    institution_type: 'Deemed to be University',
    employment_type: 'Full-time Regular',
    start_date: '2018-07-02',
    end_date: '',
    is_current: 1,
    full_or_part_time: 'Full-time',
    subjects_taught: 'Data Structures & Algorithms, Machine Learning, Operating Systems',
    teaching_involvement: 'Undergraduate (UG) & Postgraduate (PG)'
  });

  const designationOptions = [
    'Assistant Professor', 'Associate Professor', 'Professor', 'Professor of Practice',
    'Senior Lecturer', 'Lecturer', 'Head of Department (HOD)', 'Visiting Faculty', 'Teaching Fellow'
  ];

  const instTypeOptions = [
    'Deemed to be University', 'State Public University', 'Central University',
    'Autonomous Engineering College', 'Affiliated Engineering College', 'Pharmacy College',
    'Nursing College', 'Autonomous Degree College', 'Polytechnic College'
  ];

  const streamOptions = [
    'Data Structures & Algorithms, Machine Learning, Operating Systems',
    'Artificial Intelligence, Deep Learning, Natural Language Processing',
    'Web Technologies, Database Management Systems, Cloud Computing',
    'VLSI Design, Embedded Systems, Digital Signal Processing',
    'Analog Electronics, Microprocessors, Wireless Communication',
    'Pharmaceutics, Novel Drug Delivery Systems, Biopharmaceutics',
    'Pharmacology, Clinical Pharmacy, Hospital Pharmacy',
    'Medical Surgical Nursing, Community Health Nursing, Pediatric Nursing',
    'Organic Chemistry, Physical Chemistry, Spectroscopy',
    'Discrete Mathematics, Engineering Mathematics, Statistics',
    'Financial Accounting, Strategic Management, Marketing Management',
    'Agronomy, Soil Science, Agricultural Entomology'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/staff/teaching-exp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sdrms_token')}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add teaching experience');
      showToast('Teaching experience recorded.', 'success');
      setShowModal(false);
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this teaching experience entry?')) return;
    try {
      const res = await fetch(`/api/staff/teaching-exp/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('Entry removed.', 'info');
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
            <Clock className="w-5 h-5 text-blue-600" />
            Module 5: Collegiate Teaching Experience & Pedagogy
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional appointments, academic cadre levels, subjects taught, and student involvement.
          </p>
        </div>

        {!isLocked && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Experience (Dropdown)</span>
          </button>
        )}
      </div>

      {teachingExp.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Designation & Cadre</th>
                  <th className="py-3 px-4">Institution Name & Type</th>
                  <th className="py-3 px-4">Duration & Tenure</th>
                  <th className="py-3 px-4">Subjects / Student Level</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  {!isLocked && <th className="py-3 px-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachingExp.map((exp) => (
                  <tr key={exp.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{exp.designation_held}</div>
                      <div className="text-[11px] text-blue-600 font-semibold">{exp.department}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{exp.institution_name}</div>
                      <div className="text-[10px] text-slate-500">{exp.institution_type}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {exp.start_date} to {exp.is_current ? <span className="text-emerald-600 font-bold">Present</span> : (exp.end_date || '—')}
                      </div>
                      <div className="text-[10px] text-slate-400">{exp.full_or_part_time}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="truncate text-slate-700">{exp.subjects_taught}</div>
                      <div className="text-[10px] text-slate-500">{exp.teaching_involvement}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    </td>
                    {!isLocked && (
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(exp.id)}
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
          <Clock className="w-10 h-10 text-slate-400 mx-auto stroke-1" />
          <h4 className="font-bold text-sm text-slate-800">No Collegiate Teaching Experience Added</h4>
          <p className="text-xs max-w-sm mx-auto">
            Record your past and present collegiate teaching appointments at Chaitanya University and prior institutions.
          </p>
          {!isLocked && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-2 px-5 py-2 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-sm"
            >
              Add Teaching Experience
            </button>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Add Collegiate Teaching Experience
                </h4>
                <p className="text-xs text-slate-500">
                  Select designation, institution type, and course stream from pre-filled choices.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation Held <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="designation_held"
                    value={form.designation_held}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold"
                  >
                    {designationOptions.map(des => (
                      <option key={des} value={des}>{des}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institution Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="institution_type"
                    value={form.institution_type}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium"
                  >
                    {instTypeOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institution Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="institution_name"
                  value={form.institution_name}
                  onChange={handleChange}
                  placeholder="e.g. Chaitanya (Deemed to be University), Hyderabad"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date (Blank if Current)
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    disabled={Boolean(form.is_current)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      name="is_current"
                      checked={Boolean(form.is_current)}
                      onChange={handleChange}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Present / Current Position</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subjects Taught / Course Specialization <span className="text-rose-500">*</span>
                </label>
                <select
                  name="subjects_taught"
                  value={form.subjects_taught}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium"
                >
                  {streamOptions.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teaching Involvement <span className="text-rose-500">*</span>
                </label>
                <select
                  name="teaching_involvement"
                  value={form.teaching_involvement}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                >
                  <option value="Undergraduate (UG) Only">Undergraduate (UG) Only</option>
                  <option value="Postgraduate (PG) Only">Postgraduate (PG) Only</option>
                  <option value="Undergraduate (UG) & Postgraduate (PG)">Undergraduate (UG) & Postgraduate (PG)</option>
                  <option value="Doctoral Guidance & Ph.D. Coursework">Doctoral Guidance & Ph.D. Coursework</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Add Teaching Experience'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
