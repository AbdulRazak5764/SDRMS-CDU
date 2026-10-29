import React, { useState } from 'react';
import { Plus, Trash2, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Section7Training({ trainingProgrammes = [], onRefreshData, isLocked }) {
  const { showToast } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    programme_title: '',
    organizing_institution: '',
    category: 'FDP',
    start_date: '',
    end_date: '',
    duration_hours_days: '5 Days (40 Hours)',
    mode: 'Hybrid',
    certificate_no: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.programme_title || !form.organizing_institution) {
      showToast('Title and organizing institution are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/staff/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sdrms_token')}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add training programme');
      showToast('Training programme added.', 'success');
      setShowAddModal(false);
      setForm({
        programme_title: '',
        organizing_institution: '',
        category: 'FDP',
        start_date: '',
        end_date: '',
        duration_hours_days: '5 Days (40 Hours)',
        mode: 'Hybrid',
        certificate_no: ''
      });
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this training record?')) return;
    try {
      const res = await fetch(`/api/staff/training/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('Training record removed.', 'info');
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
            <Award className="w-5 h-5 text-teal-600" />
            Professional Development & Faculty Training (FDPs, Refresher, Orientation)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Support FDPs, orientation programmes, refresher courses, workshops, seminars, and relevant certifications.
          </p>
        </div>

        {!isLocked && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Training Programme</span>
          </button>
        )}
      </div>

      {trainingProgrammes.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
          <h4 className="text-xs font-semibold text-slate-700 mt-2">No training programmes recorded yet</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Record institutional FDPs, AICTE ATAL workshops, and pedagogic training.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-slate-800 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-3">Category</th>
                <th className="px-3.5 py-3">Programme Title</th>
                <th className="px-3.5 py-3">Organizing Institution</th>
                <th className="px-3.5 py-3">Duration & Dates</th>
                <th className="px-3.5 py-3">Mode</th>
                <th className="px-3.5 py-3 text-center">Status</th>
                {!isLocked && <th className="px-3.5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {trainingProgrammes.map((tp) => (
                <tr key={tp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3.5 py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {tp.category}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 font-bold text-slate-900">
                    {tp.programme_title}
                    {tp.certificate_no && (
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">Cert: {tp.certificate_no}</div>
                    )}
                  </td>
                  <td className="px-3.5 py-3 font-medium text-slate-800">
                    {tp.organizing_institution}
                  </td>
                  <td className="px-3.5 py-3">
                    <div className="font-semibold text-slate-900">{tp.duration_hours_days || '—'}</div>
                    <div className="text-[10px] text-slate-500">{tp.start_date} to {tp.end_date}</div>
                  </td>
                  <td className="px-3.5 py-3 text-slate-700">
                    {tp.mode}
                  </td>
                  <td className="px-3.5 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  </td>
                  {!isLocked && (
                    <td className="px-3.5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(tp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
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
      )}

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" />
                Add Training Programme
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Programme Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                >
                  <option value="FDP">Faculty Development Programme (FDP)</option>
                  <option value="Orientation">Orientation Programme</option>
                  <option value="Refresher">UGC / AICTE Refresher Course</option>
                  <option value="Workshop">Technical Workshop / Hands-on Lab</option>
                  <option value="Seminar">Conference / Seminar</option>
                  <option value="Short-Term">Short-term Training Programme (STTP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Programme Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="programme_title"
                  value={form.programme_title}
                  onChange={handleChange}
                  placeholder="e.g. AICTE ATAL FDP on Cloud Security & Blockchain"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organizing Institution <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="organizing_institution"
                  value={form.organizing_institution}
                  onChange={handleChange}
                  placeholder="e.g. IIT Hyderabad / Chaitanya University"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration_hours_days"
                    value={form.duration_hours_days}
                    onChange={handleChange}
                    placeholder="e.g. 5 Days / 40 Hours"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mode
                  </label>
                  <select
                    name="mode"
                    value={form.mode}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="Offline">Offline / In-Person</option>
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Certificate Number
                  </label>
                  <input
                    type="text"
                    name="certificate_no"
                    value={form.certificate_no}
                    onChange={handleChange}
                    placeholder="Cert Ref No"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
                >
                  {saving ? 'Saving...' : 'Add Programme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
