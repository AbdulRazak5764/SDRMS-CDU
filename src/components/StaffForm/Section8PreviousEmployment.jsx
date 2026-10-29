import React, { useState } from 'react';
import { Plus, Trash2, Briefcase, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Section8PreviousEmployment({ previousEmployment = [], onRefreshData, isLocked }) {
  const { showToast } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    employer_name: '',
    designation: '',
    department: '',
    employment_type: 'Regular',
    date_of_joining: '',
    date_of_leaving: '',
    reason_for_leaving: 'Career advancement / Joined Chaitanya University'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.employer_name || !form.designation || !form.date_of_joining) {
      showToast('Employer name, designation, and joining date are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/staff/previous-employment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sdrms_token')}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record previous employment');
      showToast('Prior employment record added.', 'success');
      setShowAddModal(false);
      setForm({
        employer_name: '',
        designation: '',
        department: '',
        employment_type: 'Regular',
        date_of_joining: '',
        date_of_leaving: '',
        reason_for_leaving: 'Career advancement / Joined Chaitanya University'
      });
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employment record?')) return;
    try {
      const res = await fetch(`/api/staff/previous-employment/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('Employment record deleted.', 'info');
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
            <Briefcase className="w-5 h-5 text-teal-600" />
            Previous Employment History (Prior to University)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Full history of past organizational postings. Date sequences are validated to detect overlapping service periods.
          </p>
        </div>

        {!isLocked && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Previous Employment</span>
          </button>
        )}
      </div>

      {previousEmployment.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
          <Briefcase className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
          <h4 className="text-xs font-semibold text-slate-700 mt-2">No previous employment records entered</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            If this is your first institutional employment, you may leave this blank.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-slate-800 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-3">Prior Employer</th>
                <th className="px-3.5 py-3">Designation & Dept</th>
                <th className="px-3.5 py-3">Duration (Joining - Leaving)</th>
                <th className="px-3.5 py-3">Type</th>
                <th className="px-3.5 py-3">Reason for Leaving</th>
                {!isLocked && <th className="px-3.5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {previousEmployment.map((pe) => (
                <tr key={pe.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3.5 py-3 font-bold text-slate-900">
                    {pe.employer_name}
                  </td>
                  <td className="px-3.5 py-3">
                    <div className="font-semibold text-teal-900">{pe.designation}</div>
                    <div className="text-[10px] text-slate-500">{pe.department || '—'}</div>
                  </td>
                  <td className="px-3.5 py-3 font-mono text-[11px]">
                    {pe.date_of_joining} to {pe.date_of_leaving || 'Relieved'}
                  </td>
                  <td className="px-3.5 py-3 text-slate-700">
                    {pe.employment_type}
                  </td>
                  <td className="px-3.5 py-3 text-slate-600 max-w-xs truncate">
                    {pe.reason_for_leaving || 'Career Advancement'}
                  </td>
                  {!isLocked && (
                    <td className="px-3.5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(pe.id)}
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
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-teal-600" />
                Add Previous Employment Record
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employer / Organization Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="employer_name"
                  value={form.employer_name}
                  onChange={handleChange}
                  placeholder="e.g. VNR Vignana Jyothi Institute"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Joining <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_of_joining"
                    value={form.date_of_joining}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Leaving
                  </label>
                  <input
                    type="date"
                    name="date_of_leaving"
                    value={form.date_of_leaving}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Leaving
                </label>
                <input
                  type="text"
                  name="reason_for_leaving"
                  value={form.reason_for_leaving}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                />
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
                  {saving ? 'Saving...' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
