import React, { useState } from 'react';
import { Plus, Trash2, GraduationCap, CheckCircle2, Clock, AlertCircle, FileText, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Section3Education({ qualifications = [], onRefreshData, isLocked }) {
  const { showToast } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customDegree, setCustomDegree] = useState('');
  const [customDiscipline, setCustomDiscipline] = useState('');
  const [customClassGrade, setCustomClassGrade] = useState('');

  const emptyForm = {
    level: '',
    degree_title: '',
    discipline: '',
    institution: '',
    college: '',
    country: 'India',
    year_of_admission: '',
    year_of_completion: '',
    award_month_year: '',
    mode_of_study: '',
    registration_no: '',
    class_grade: '',
    percentage_or_cgpa: '',
    max_marks: '',
    marks_obtained: '',
    equivalence_details: ''
  };

  const [form, setForm] = useState(emptyForm);

  const openAddModal = () => {
    setForm(emptyForm);
    setCustomDegree('');
    setCustomDiscipline('');
    setCustomClassGrade('');
    setShowAddModal(true);
  };

  const degreeOptions = [
    'B.Tech', 'B.E.', 'B.Sc', 'B.Com', 'B.Pharm', 'B.A.', 'B.B.A.', 'B.C.A.',
    'M.Tech', 'M.E.', 'M.Sc', 'M.Com', 'M.Pharm', 'M.B.A.', 'M.C.A.', 'M.Phil',
    'Ph.D. in Engineering', 'Ph.D. in Science', 'Ph.D. in Pharmacy', 'Ph.D. in Management',
    'Ph.D. in Nursing', 'Ph.D. in Agriculture', 'Post-Doctoral Fellowship',
    'Intermediate / +2 (MPC/BiPC)', '10th SSC / Matriculation', 'Polytechnic Diploma', 'Other'
  ];

  const disciplineOptions = [
    'Computer Science & Engineering', 'Artificial Intelligence & Machine Learning',
    'Electronics & Communication Engineering', 'Data Science & Cyber Security',
    'Electrical & Electronics Engineering', 'Mechanical Engineering', 'Civil Engineering',
    'Pharmacy & Pharmaceutical Sciences', 'Pharmaceutics', 'Pharmacology',
    'Nursing & Clinical Healthcare', 'Medical Surgical Nursing',
    'Biotechnology', 'Chemistry / Organic Chemistry', 'Mathematics & Statistics',
    'Physics', 'Commerce & Banking', 'Business Administration / Finance',
    'Agriculture & Agronomy', 'Humanities & English', 'Other'
  ];

  const universityOptions = [
    'Chaitanya (Deemed to be University), Hyderabad',
    'Osmania University, Hyderabad',
    'Jawaharlal Nehru Technological University (JNTUH), Hyderabad',
    'Kakatiya University, Warangal',
    'University of Hyderabad (HCU), Hyderabad',
    'NIT Warangal (National Institute of Technology)',
    'IIT Hyderabad (Indian Institute of Technology)',
    'Andhra University, Visakhapatnam',
    'Sri Venkateswara University, Tirupati',
    'Telangana University, Nizamabad',
    'State Board of Intermediate Education, Telangana',
    'Board of Secondary Education (SSC), Telangana',
    'Central Board of Secondary Education (CBSE)',
    'Other Renowned Indian University / Board'
  ];

  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const finalDegree = form.degree_title === 'Other' ? customDegree.trim() : form.degree_title;
    const finalDiscipline = form.discipline === 'Other' ? customDiscipline.trim() : form.discipline;
    const finalClassGrade = form.class_grade === 'Other' ? customClassGrade.trim() : form.class_grade;

    if (!finalDegree || !form.institution) {
      showToast('Degree title and awarding university/board are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/staff/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sdrms_token')}`
        },
        body: JSON.stringify({
          ...form,
          degree_title: finalDegree,
          discipline: finalDiscipline,
          class_grade: finalClassGrade
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add qualification');
      showToast('Educational qualification recorded.', 'success');
      setShowAddModal(false);
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this degree record?')) return;
    try {
      const res = await fetch(`/api/staff/education/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('Degree entry removed.', 'info');
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
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Module 3: Educational Qualifications (SSC to Ph.D.)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Record all chronological degrees with award years, university boards, and class divisions.
          </p>
        </div>

        {!isLocked && (
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Qualification</span>
          </button>
        )}
      </div>

      {/* Qualifications List Table */}
      {qualifications.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Degree & Discipline</th>
                  <th className="py-3 px-4">Awarding Institution / University</th>
                  <th className="py-3 px-4">Year & Mode</th>
                  <th className="py-3 px-4">Grade / CGPA</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  {!isLocked && <th className="py-3 px-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {qualifications.map((q) => (
                  <tr key={q.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                        {q.level || 'Degree'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{q.degree_title}</div>
                      {q.discipline && <div className="text-[11px] text-slate-500">{q.discipline}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{q.institution}</div>
                      {q.college && <div className="text-[10px] text-slate-400">{q.college}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold">{q.year_of_completion || '—'}</div>
                      <div className="text-[10px] text-slate-500">{q.mode_of_study}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{q.percentage_or_cgpa || '—'}</div>
                      <div className="text-[10px] text-slate-500">{q.class_grade}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Recorded</span>
                      </span>
                    </td>
                    {!isLocked && (
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(q.id)}
                          className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded"
                          title="Remove degree"
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
          <GraduationCap className="w-10 h-10 text-slate-400 mx-auto stroke-1" />
          <h4 className="font-bold text-sm text-slate-800">No Degree Records Added Yet</h4>
          <p className="text-xs max-w-sm mx-auto">
            Please record your qualifications (e.g. B.Tech, M.Tech, Ph.D.) with university, year, and marks.
          </p>
          {!isLocked && (
            <button
              type="button"
              onClick={openAddModal}
              className="mt-2 px-5 py-2 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
            >
              Add First Qualification Record
            </button>
          )}
        </div>
      )}

      {/* Add Degree Modal with Clean User-Selected Dropdowns & Free Text Inputs */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  Add Educational Qualification
                </h4>
                <p className="text-xs text-slate-500">
                  Select your qualification details or type your University / Board name directly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Qualification Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium"
                    required
                  >
                    <option value="">Select Qualification Level...</option>
                    <option value="Undergraduate">Undergraduate (UG)</option>
                    <option value="Postgraduate">Postgraduate (PG)</option>
                    <option value="Doctoral (Ph.D)">Doctoral (Ph.D.)</option>
                    <option value="Post-Doctoral">Post-Doctoral Fellowship</option>
                    <option value="Intermediate / +2">Intermediate / +2</option>
                    <option value="SSC / 10th">SSC / 10th Class</option>
                    <option value="Diploma">Polytechnic Diploma</option>
                    <option value="Other">Other Certificate / Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Degree Title <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="degree_title"
                    value={form.degree_title}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold"
                    required
                  >
                    <option value="">Select Degree Title...</option>
                    {degreeOptions.map(deg => (
                      <option key={deg} value={deg}>{deg}</option>
                    ))}
                  </select>
                  {form.degree_title === 'Other' && (
                    <input
                      type="text"
                      value={customDegree}
                      onChange={e => setCustomDegree(e.target.value)}
                      placeholder="Please type your degree title..."
                      className="w-full mt-2 bg-white border border-blue-400 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                      required
                      autoFocus
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Discipline / Specialization <span className="text-rose-500">*</span>
                </label>
                <select
                  name="discipline"
                  value={form.discipline}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium"
                  required
                >
                  <option value="">Select Discipline / Branch...</option>
                  {disciplineOptions.map(disc => (
                    <option key={disc} value={disc}>{disc}</option>
                  ))}
                </select>
                {form.discipline === 'Other' && (
                  <input
                    type="text"
                    value={customDiscipline}
                    onChange={e => setCustomDiscipline(e.target.value)}
                    placeholder="Please type your discipline / specialization..."
                    className="w-full mt-2 bg-white border border-blue-400 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                    required
                    autoFocus
                  />
                )}
              </div>

              {/* Awarding University / Board & College Name: Simple Type Text Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Awarding University / Board <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={form.institution}
                    onChange={handleChange}
                    placeholder="Type University or Board name (e.g. Osmania, JNTUH, CBSE)..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College / Institution Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="college"
                    value={form.college}
                    onChange={handleChange}
                    placeholder="Type College / School name if applicable..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Award Year <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="year_of_completion"
                    value={form.year_of_completion}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold"
                    required
                  >
                    <option value="">Select Year (1950 to Present)...</option>
                    {yearsList.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mode of Study <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="mode_of_study"
                    value={form.mode_of_study}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                    required
                  >
                    <option value="">Select Mode...</option>
                    <option value="Full-time">Full-time Regular</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Distance / Online">Distance / Online</option>
                    <option value="Evening / Executive">Evening / Executive</option>
                  </select>
                </div>
              </div>

              {/* Marks & Grade Details: Type Marks Freely or Select/Type Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Marks / % / CGPA Obtained <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="percentage_or_cgpa"
                    value={form.percentage_or_cgpa}
                    onChange={handleChange}
                    placeholder="Type marks (e.g. 85%, 8.4 CGPA, 850/1000)..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Class / Grade / Division
                  </label>
                  <select
                    name="class_grade"
                    value={form.class_grade}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="">Select Grade / Division...</option>
                    <option value="First Class with Distinction">Distinction (75% and above)</option>
                    <option value="First Class">First Class (60% to 74%)</option>
                    <option value="Second Class">Second Class (50% to 59%)</option>
                    <option value="Pass Class">Pass Division</option>
                    <option value="Exemplary Grade">Exemplary Grade</option>
                    <option value="Grade Points / CGPA">Grade Points / CGPA</option>
                    <option value="Other">Other (Type Grade Manually)...</option>
                  </select>
                  {form.class_grade === 'Other' && (
                    <input
                      type="text"
                      value={customClassGrade}
                      onChange={e => setCustomClassGrade(e.target.value)}
                      placeholder="Type grade (e.g. O Grade, A+, First Div)..."
                      className="w-full mt-2 bg-white border border-blue-400 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                      autoFocus
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hall Ticket / Roll / Registration No.
                  </label>
                  <input
                    type="text"
                    name="registration_no"
                    value={form.registration_no}
                    onChange={handleChange}
                    placeholder="Type Hall Ticket / Roll number..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Add Qualification Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
