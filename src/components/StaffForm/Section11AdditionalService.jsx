import React, { useState } from 'react';
import { ShieldAlert, Check } from 'lucide-react';

export default function Section11AdditionalService({ profile, onSaveDraft, isLocked }) {
  const [formData, setFormData] = useState({
    leave_deputation_info: profile.leave_deputation_info || '',
    promotion_history_notes: profile.promotion_history_notes || 'Promoted to Assistant Professor (Senior Scale) under Career Advancement Scheme (CAS) w.e.f. August 2021.',
    transfer_history_notes: profile.transfer_history_notes || '',
    service_gap_explanation: profile.service_gap_explanation || 'No service breaks or gaps between postings.'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveDraft(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <ShieldAlert className="w-5 h-5 text-teal-600" />
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Additional Service & Career Progression Records
          </h3>
          <p className="text-xs text-slate-500">
            Career Advancement Scheme (CAS) promotions, departmental transfers, deputations, and service continuity explanations.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Promotion History & CAS Upgradations
          </label>
          <textarea
            name="promotion_history_notes"
            disabled={isLocked}
            value={formData.promotion_history_notes}
            onChange={handleChange}
            rows={2}
            placeholder="Details of Career Advancement Scheme (CAS) promotions or re-designations"
            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Leave of Absence / Deputation / Lien Records
          </label>
          <textarea
            name="leave_deputation_info"
            disabled={isLocked}
            value={formData.leave_deputation_info}
            onChange={handleChange}
            rows={2}
            placeholder="Study leave, sabbatical, maternity leave, or external institutional deputation details"
            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Departmental Transfer History (within Chaitanya University)
          </label>
          <textarea
            name="transfer_history_notes"
            disabled={isLocked}
            value={formData.transfer_history_notes}
            onChange={handleChange}
            rows={2}
            placeholder="Transfers between schools, faculties, or campus centres"
            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Service Gap Explanation (if any gaps occurred between appointments)
          </label>
          <textarea
            name="service_gap_explanation"
            disabled={isLocked}
            value={formData.service_gap_explanation}
            onChange={handleChange}
            rows={2}
            placeholder="Provide formal reason for any gaps in service history"
            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {!isLocked && (
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save Section 11 Details</span>
          </button>
        </div>
      )}
    </form>
  );
}
