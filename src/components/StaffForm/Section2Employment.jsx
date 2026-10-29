import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, Building, Check, FileText, Info } from 'lucide-react';

export default function Section2Employment({ profile, onSaveDraft, onRefreshData, isLocked }) {
  const [formData, setFormData] = useState({
    employee_category: profile.employee_category || 'Teaching',
    faculty_id: profile.faculty_id || 2,
    department_id: profile.department_id || 6,
    designation: profile.designation || 'Assistant Professor',
    employment_type: profile.employment_type || 'Regular',
    appointment_order_no: profile.appointment_order_no || 'CDU/EST/APPT/2018/142',
    appointment_order_date: profile.appointment_order_date || '2018-06-20',
    joining_date_university: profile.joining_date_university || '2018-07-02',
    joining_date_present_position: profile.joining_date_present_position || '2021-08-01',
    joining_date_present_department: profile.joining_date_present_department || '2018-07-02',
    previous_designation_univ: profile.previous_designation_univ || 'Assistant Professor (Grade I)',
    reporting_officer: profile.reporting_officer || 'Dr. K. V. S. Sharma (HOD - CSE)',
    campus_location: profile.campus_location || 'Main Campus, Hyderabad',
    employment_status: profile.employment_status || 'Active',
    probation_status: profile.probation_status || 'Confirmed',
    confirmation_date: profile.confirmation_date || '2020-07-02',
    previous_employer: profile.previous_employer || 'VNR Vignana Jyothi Institute of Engineering',
    previous_employment_period: profile.previous_employment_period || '2014-08-01 to 2018-06-25 (3.9 Years)',
    relevant_previous_service_years: profile.relevant_previous_service_years || 3.9
  });

  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetch('/api/admin/master-data', {
      headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.faculties) setFaculties(data.faculties);
        if (data.departments) setDepartments(data.departments);
      })
      .catch(err => console.error('Error fetching master data:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveDraft(formData);
  };

  // Filter departments for selected faculty
  const filteredDepts = departments.filter(d => !formData.faculty_id || d.faculty_id == formData.faculty_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dynamic Experience Calculation Card */}
      <div className="bg-gradient-to-r from-teal-900 to-[#0f2942] text-white rounded-xl p-5 shadow-sm border border-teal-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-teal-300">
                Service Duration Engine
              </span>
              <span className="text-[10px] bg-teal-500/20 text-teal-200 border border-teal-500/30 px-2 py-0.5 rounded-full font-medium">
                {profile.experience_is_verified ? 'Verified by HR' : 'Provisional until HR verification'}
              </span>
            </div>
            <h3 className="text-lg font-bold mt-1">
              Calculated Academic & Professional Experience
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Experience calculated from verified appointment dates and service records.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
            <div className="text-center">
              <div className="text-[11px] text-teal-300 font-semibold">At Chaitanya Univ</div>
              <div className="text-2xl font-black text-white">
                {profile.calculated_univ_exp_years || 8.3}
                <span className="text-xs font-normal text-slate-300 ml-1">yrs</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center">
              <div className="text-[11px] text-teal-300 font-semibold">Total Experience</div>
              <div className="text-2xl font-black text-teal-400">
                {profile.calculated_total_exp_years || 12.2}
                <span className="text-xs font-normal text-slate-300 ml-1">yrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment & Unit Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
          A. Institutional Placement & Category
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Employee Category <span className="text-rose-500">*</span>
            </label>
            <select
              name="employee_category"
              disabled={isLocked}
              value={formData.employee_category}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              required
            >
              <option value="Teaching">Teaching Faculty</option>
              <option value="Non-Teaching">Non-Teaching Staff</option>
              <option value="Technical">Technical Staff</option>
              <option value="Administrative">Administrative Staff</option>
              <option value="Laboratory">Laboratory Staff</option>
              <option value="Library">Library Staff</option>
              <option value="Other">Other Authorized Staff</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Faculty / School <span className="text-rose-500">*</span>
            </label>
            <select
              name="faculty_id"
              disabled={isLocked}
              value={formData.faculty_id}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              required
            >
              <option value="">Select Faculty</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department / Section <span className="text-rose-500">*</span>
            </label>
            <select
              name="department_id"
              disabled={isLocked}
              value={formData.department_id}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              required
            >
              <option value="">Select Department</option>
              {filteredDepts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Present Designation <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="designation"
              disabled={isLocked}
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g. Assistant Professor"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Employment Type <span className="text-rose-500">*</span>
            </label>
            <select
              name="employment_type"
              disabled={isLocked}
              value={formData.employment_type}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              required
            >
              <option value="Regular">Regular / Permanent</option>
              <option value="Contract">Contractual Appointment</option>
              <option value="Temporary">Temporary / Ad-hoc</option>
              <option value="Part-Time">Part-Time / Visiting</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Campus Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="campus_location"
              disabled={isLocked}
              value={formData.campus_location}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              required
            />
          </div>
        </div>
      </div>

      {/* Appointment & Service Chronology */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
          B. Service Chronology & Key Appointment Dates
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date of Initial Appointment at CDU <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="joining_date_university"
              disabled={isLocked}
              value={formData.joining_date_university}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date of Joining Present Position
            </label>
            <input
              type="date"
              name="joining_date_present_position"
              disabled={isLocked}
              value={formData.joining_date_present_position}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date of Joining Present Department
            </label>
            <input
              type="date"
              name="joining_date_present_department"
              disabled={isLocked}
              value={formData.joining_date_present_department}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Appointment Order Number
            </label>
            <input
              type="text"
              name="appointment_order_no"
              disabled={isLocked}
              value={formData.appointment_order_no}
              onChange={handleChange}
              placeholder="CDU/EST/APPT/2018/..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Appointment Order Date
            </label>
            <input
              type="date"
              name="appointment_order_date"
              disabled={isLocked}
              value={formData.appointment_order_date}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Designated Reporting Officer
            </label>
            <input
              type="text"
              name="reporting_officer"
              disabled={isLocked}
              value={formData.reporting_officer}
              onChange={handleChange}
              placeholder="HOD or Dean Name"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Employment Status
            </label>
            <select
              name="employment_status"
              disabled={isLocked}
              value={formData.employment_status}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              <option value="Active">Active Service</option>
              <option value="On Leave">On Leave</option>
              <option value="Deputation">On Deputation</option>
              <option value="Retired">Retired</option>
              <option value="Resigned">Resigned</option>
              <option value="Relieved">Relieved</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Probation / Confirmation Status
            </label>
            <select
              name="probation_status"
              disabled={isLocked}
              value={formData.probation_status}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              <option value="Confirmed">Confirmed in Service</option>
              <option value="On Probation">On Probation</option>
              <option value="Extended">Probation Extended</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirmation Date (if confirmed)
            </label>
            <input
              type="date"
              name="confirmation_date"
              disabled={isLocked}
              value={formData.confirmation_date}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>
        </div>
      </div>

      {/* Prior Institutional Service Summary */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
          C. Previous Service Credit (Prior to Chaitanya University)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Previous Employer Name
            </label>
            <input
              type="text"
              name="previous_employer"
              disabled={isLocked}
              value={formData.previous_employer}
              onChange={handleChange}
              placeholder="Prior College / University"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Previous Service Period
            </label>
            <input
              type="text"
              name="previous_employment_period"
              disabled={isLocked}
              value={formData.previous_employment_period}
              onChange={handleChange}
              placeholder="e.g. 2014 to 2018 (3.9 Years)"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Relevant Prior Service (Years Claimed)
            </label>
            <input
              type="number"
              step="0.1"
              name="relevant_previous_service_years"
              disabled={isLocked}
              value={formData.relevant_previous_service_years}
              onChange={handleChange}
              placeholder="e.g. 3.9"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>
        </div>
      </div>

      {!isLocked && (
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save Section 2 Details</span>
          </button>
        </div>
      )}
    </form>
  );
}
