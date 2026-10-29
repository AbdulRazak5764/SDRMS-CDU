import React, { useState } from 'react';
import { DollarSign, ShieldCheck, Lock, Check } from 'lucide-react';

export default function Section9Salary({ profile, onSaveDraft, isLocked }) {
  const [formData, setFormData] = useState({
    pay_scale: profile.pay_scale || 'Academic Level 12 (79,800 - 2,11,500)',
    basic_pay: profile.basic_pay || '89,900',
    pay_components: profile.pay_components || 'DA (50%), HRA (27%), TA, Special Allowance',
    payroll_code: profile.payroll_code || ('PAY-' + (profile.employee_id || '1001')),
    salary_bank_name: profile.salary_bank_name || 'State Bank of India',
    salary_account_masked: profile.salary_account_masked || 'XXXX-XXXX-6789'
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
      {/* Information Security & Privacy Notice */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-700 shadow-sm flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex-shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-white">Sensitive Establishment Data Policy</h4>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.2 rounded font-semibold">
              Restricted Role Access
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            In compliance with University Information Security Guidelines, payroll data, PAN, and full bank identifiers are collected solely for authorized statutory disbursement. Sensitive account numbers are masked in general displays and excluded from public or departmental exports.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
          Authorized Payroll Reference Fields
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pay Scale / Academic Pay Level
            </label>
            <input
              type="text"
              name="pay_scale"
              disabled={isLocked}
              value={formData.pay_scale}
              onChange={handleChange}
              placeholder="e.g. Academic Level 12"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Basic Pay (INR)
            </label>
            <input
              type="text"
              name="basic_pay"
              disabled={isLocked}
              value={formData.basic_pay}
              onChange={handleChange}
              placeholder="e.g. 89,900"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payroll Employee Code
            </label>
            <input
              type="text"
              name="payroll_code"
              disabled={isLocked}
              value={formData.payroll_code}
              onChange={handleChange}
              placeholder="PAY-CDU-..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Disbursement Bank Name
            </label>
            <input
              type="text"
              name="salary_bank_name"
              disabled={isLocked}
              value={formData.salary_bank_name}
              onChange={handleChange}
              placeholder="e.g. State Bank of India, University Campus Branch"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Salary Account Reference (Masked Display)</span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1 font-normal">
                <Lock className="w-3 h-3 text-slate-400" />
                Masked by System
              </span>
            </label>
            <input
              type="text"
              name="salary_account_masked"
              disabled={isLocked}
              value={formData.salary_account_masked}
              onChange={handleChange}
              placeholder="XXXX-XXXX-1234"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Applicable Allowances & Components
          </label>
          <input
            type="text"
            name="pay_components"
            disabled={isLocked}
            value={formData.pay_components}
            onChange={handleChange}
            placeholder="e.g. DA, HRA, Medical Allowance, Special Pay"
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20"
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
            <span>Save Section 9 Details</span>
          </button>
        </div>
      )}
    </form>
  );
}
