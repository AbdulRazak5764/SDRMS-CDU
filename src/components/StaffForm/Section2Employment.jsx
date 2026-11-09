import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, Building, Check, FileText, Info } from 'lucide-react';

function SelectWithOther({ label, name, value, onChange, options = [], disabled, required, placeholder = 'Select...' }) {
  const isPredefined = options.includes(value);
  const [showOtherInput, setShowOtherInput] = useState(!isPredefined && Boolean(value));

  useEffect(() => {
    if (options.includes(value)) {
      setShowOtherInput(false);
    } else if (value && value !== '') {
      setShowOtherInput(true);
    }
  }, [value, options]);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'Others') {
      setShowOtherInput(true);
      onChange({ target: { name, value: '' } });
    } else {
      setShowOtherInput(false);
      onChange({ target: { name, value: val } });
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <select
        name={name}
        disabled={disabled}
        value={showOtherInput ? 'Others' : (value || '')}
        onChange={handleSelectChange}
        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
        required={required && !showOtherInput}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value="Others">Others (Type manually)</option>
      </select>
      {showOtherInput && (
        <input
          type="text"
          name={name}
          disabled={disabled}
          value={value || ''}
          onChange={onChange}
          placeholder={`Please type ${label.toLowerCase()}...`}
          className="w-full mt-1.5 bg-slate-50 border border-teal-500 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          required={required}
          autoFocus
        />
      )}
    </div>
  );
}

// Official Administrative Units for Non-Teaching / Non-Academic Staff
const ADMINISTRATIVE_UNITS = [
  'Office of the Registrar (Central Administration)',
  'Dean Administration & Establishment Section',
  'Examinations Branch & Evaluation Center',
  'Finance & Accounts Section',
  'Central University Library & Information Center',
  'Estate, Campus Maintenance & Civil Works',
  'IT Services, Networking & Systems Division',
  'Admissions & Student Welfare Division',
  'University Health Center',
  'Laboratories & Technical Workshop Division',
  'Security & Campus Logistics'
];

// Official 21 Program-Wise Department Heads (HOD Offices) without personal names
const HOD_OFFICE_OPTIONS = [
  'Head of Department – Computer Science & Engineering (HOD - CSE)',
  'Head of Department – Electronics & Communication Engineering (HOD - ECE)',
  'Head of Department – Electrical & Electronics Engineering (HOD - EEE)',
  'Head of Department – Mechanical Engineering (HOD - ME)',
  'Head of Department – Civil Engineering (HOD - CE)',
  'Head of Department – Pharmacy (HOD - Pharmacy)',
  'Head of Department – Agriculture (HOD - Agriculture)',
  'Head of Department – Nursing (HOD - Nursing)',
  'Head of Department – Physiotherapy (HOD - Physiotherapy)',
  'Head of Department – Commerce & Business Management (HOD - CBM)',
  'Head of Department – Computer Science & Applications (HOD - CS)',
  'Head of Department – Life Sciences (Biotechnology, Microbiology & Chemistry)',
  'Head of Department – Forensic Science & Chemistry',
  'Head of Department – Food Science & Nutrition',
  'Head of Department – Department of RIT (Radiology & Imaging Technology)',
  'Head of Department – Department of AOTT (Anaesthesia & Operation Theatre Technology)',
  'Head of Department – Department of CVT (Cardiovascular Technology)',
  'Head of Department – Department of MLT (Medical Lab Technology)',
  'Head of Department – Clinical Embryology & ART',
  'Head of Department – Humanities & Science (Basic Sciences & Humanities)',
  'Head of Department – Research & Ph.D. Division',
  'Dean, Administration (Non-Teaching, Administrative & Technical Staff)',
  'Office of the Dean',
  'Office of the Registrar'
];

function getHodOfficeForDept(deptId, deptsList = []) {
  const dept = deptsList.find(d => String(d.id) === String(deptId));
  if (!dept) return '';
  const name = (dept.name || '').toLowerCase();
  const code = (dept.code || '').toUpperCase();

  if (code === 'CSE' || name.includes('computer science & engineering')) return 'Head of Department – Computer Science & Engineering (HOD - CSE)';
  if (code === 'ECE' || name.includes('electronics & communication')) return 'Head of Department – Electronics & Communication Engineering (HOD - ECE)';
  if (code === 'EEE' || name.includes('electrical & electronics')) return 'Head of Department – Electrical & Electronics Engineering (HOD - EEE)';
  if (code === 'ME' || code === 'MECH' || name.includes('mechanical')) return 'Head of Department – Mechanical Engineering (HOD - ME)';
  if (code === 'CE' || code === 'CIVIL' || name.includes('civil')) return 'Head of Department – Civil Engineering (HOD - CE)';
  if (code === 'MCA' || code === 'CS' || name.includes('computer applications') || name.includes('computer science & applications')) return 'Head of Department – Computer Science & Applications (HOD - CS)';
  if (code === 'PHARM' || name.includes('pharmacy')) return 'Head of Department – Pharmacy (HOD - Pharmacy)';
  if (code === 'AGRI' || name.includes('agriculture')) return 'Head of Department – Agriculture (HOD - Agriculture)';
  if (code === 'NURS' || name.includes('nursing')) return 'Head of Department – Nursing (HOD - Nursing)';
  if (code === 'BPT' || code === 'PT' || name.includes('physiotherapy')) return 'Head of Department – Physiotherapy (HOD - Physiotherapy)';
  if (code === 'RIT' || code === 'RAD' || name.includes('radiology')) return 'Head of Department – Department of RIT (Radiology & Imaging Technology)';
  if (code === 'AOTT' || name.includes('anaesthesia')) return 'Head of Department – Department of AOTT (Anaesthesia & Operation Theatre Technology)';
  if (code === 'CVT' || name.includes('cardiovascular')) return 'Head of Department – Department of CVT (Cardiovascular Technology)';
  if (code === 'MLT' || name.includes('medical lab')) return 'Head of Department – Department of MLT (Medical Lab Technology)';
  if (code === 'CEART' || name.includes('embryology')) return 'Head of Department – Clinical Embryology & ART';
  if (code === 'CBM' || name.includes('commerce') || name.includes('business')) return 'Head of Department – Commerce & Business Management (HOD - CBM)';
  if (code === 'LIFE-SCI' || name.includes('biotechnology') || name.includes('microbiology')) return 'Head of Department – Life Sciences (Biotechnology, Microbiology & Chemistry)';
  if (code === 'FORENSIC' || name.includes('forensic')) return 'Head of Department – Forensic Science & Chemistry';
  if (code === 'FOOD-SCI' || name.includes('nutrition') || name.includes('food')) return 'Head of Department – Food Science & Nutrition';
  if (code === 'MATH' || code === 'HS' || name.includes('humanities') || name.includes('mathematics')) return 'Head of Department – Humanities & Science (Basic Sciences & Humanities)';
  if (code === 'RES-PHD' || name.includes('research')) return 'Head of Department – Research & Ph.D. Division';
  if (dept.faculty_id === 15 || name.includes('administration') || name.includes('library') || name.includes('technical') || name.includes('finance') || name.includes('estate') || name.includes('registrar')) {
    return 'Dean, Administration (Non-Teaching, Administrative & Technical Staff)';
  }
  return 'Head of Department – Computer Science & Engineering (HOD - CSE)';
}

export default function Section2Employment({ profile, onSaveDraft, onRefreshData, isLocked }) {
  const [formData, setFormData] = useState({
    employee_category: profile.employee_category || 'Teaching',
    administrative_unit: profile.administrative_unit || '',
    faculty_id: profile.faculty_id || '',
    department_id: profile.department_id || '',
    designation: profile.designation || '',
    employment_type: profile.employment_type || 'Regular',
    appointment_order_no: profile.appointment_order_no || '',
    appointment_order_date: profile.appointment_order_date || '',
    joining_date_university: profile.joining_date_university || '',
    joining_date_present_position: profile.joining_date_present_position || '',
    joining_date_present_department: profile.joining_date_present_department || '',
    previous_designation_univ: profile.previous_designation_univ || '',
    reporting_officer: profile.reporting_officer || '',
    campus_location: profile.campus_location || 'Main Campus, Hyderabad',
    employment_status: profile.employment_status || 'Active',
    probation_status: profile.probation_status || 'Confirmed',
    confirmation_date: profile.confirmation_date || '',
    previous_employer: profile.previous_employer || '',
    previous_employment_period: profile.previous_employment_period || '',
    relevant_previous_service_years: profile.relevant_previous_service_years || 0
  });

  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        employee_category: profile.employee_category || prev.employee_category || 'Teaching',
        administrative_unit: profile.administrative_unit ?? prev.administrative_unit ?? '',
        faculty_id: profile.faculty_id ?? prev.faculty_id ?? '',
        department_id: profile.department_id ?? prev.department_id ?? '',
        designation: profile.designation ?? prev.designation ?? '',
        employment_type: profile.employment_type || prev.employment_type || 'Regular',
        appointment_order_no: profile.appointment_order_no ?? prev.appointment_order_no ?? '',
        appointment_order_date: profile.appointment_order_date ?? prev.appointment_order_date ?? '',
        joining_date_university: profile.joining_date_university ?? prev.joining_date_university ?? '',
        joining_date_present_position: profile.joining_date_present_position ?? prev.joining_date_present_position ?? '',
        joining_date_present_department: profile.joining_date_present_department ?? prev.joining_date_present_department ?? '',
        previous_designation_univ: profile.previous_designation_univ ?? prev.previous_designation_univ ?? '',
        reporting_officer: profile.reporting_officer || prev.reporting_officer || '',
        campus_location: profile.campus_location || prev.campus_location || 'Main Campus, Hyderabad',
        employment_status: profile.employment_status || prev.employment_status || 'Active',
        probation_status: profile.probation_status || prev.probation_status || 'Confirmed',
        confirmation_date: profile.confirmation_date ?? prev.confirmation_date ?? '',
        previous_employer: profile.previous_employer ?? prev.previous_employer ?? '',
        previous_employment_period: profile.previous_employment_period ?? prev.previous_employment_period ?? '',
        relevant_previous_service_years: profile.relevant_previous_service_years ?? prev.relevant_previous_service_years ?? 0
      }));
    }
  }, [profile]);

  useEffect(() => {
    fetch('/api/admin/master-data', {
      headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.faculties) setFaculties(data.faculties);
        if (data.departments) {
          setDepartments(data.departments);
          if (formData.department_id && !formData.reporting_officer) {
            const autoHod = getHodOfficeForDept(formData.department_id, data.departments);
            if (autoHod) setFormData(prev => ({ ...prev, reporting_officer: autoHod }));
          }
        }
      })
      .catch(err => console.error('Error fetching master data:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (e) => {
    const newDeptId = e.target.value;
    const autoHod = getHodOfficeForDept(newDeptId, departments);
    setFormData(prev => ({
      ...prev,
      department_id: newDeptId,
      reporting_officer: autoHod || prev.reporting_officer
    }));
  };

  const handleFacultyChange = (e) => {
    const newFacultyId = e.target.value;
    setFormData(prev => ({
      ...prev,
      faculty_id: newFacultyId,
      department_id: '' // Reset department so faculty chooses valid department under this school
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveDraft(formData);
  };

  // Dynamic real-time calculation of experience from joining date
  const calculateUnivExp = (joiningDate) => {
    if (!joiningDate) return 0;
    const start = new Date(joiningDate);
    if (isNaN(start.getTime())) return 0;
    const now = new Date();
    const diffMs = now - start;
    if (diffMs <= 0) return 0;
    const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, parseFloat(years.toFixed(1)));
  };

  const univExpYears = calculateUnivExp(formData.joining_date_university);
  const prevExpYears = parseFloat(formData.relevant_previous_service_years) || 0;
  const totalExpYears = parseFloat((univExpYears + prevExpYears).toFixed(1));

  // Filter departments for selected faculty
  const filteredDepts = formData.faculty_id
    ? departments.filter(d => String(d.faculty_id) === String(formData.faculty_id))
    : departments;

  // Predefined designations based on category
  const isTeaching = formData.employee_category === 'Teaching';
  const designationOptions = isTeaching
    ? [
        'Assistant Professor',
        'Associate Professor',
        'Professor',
        'Senior Professor',
        'Adjunct Professor',
        'Visiting Faculty',
        'Lecturer',
        'Head of Department'
      ]
    : [
        'Administrative Officer',
        'Superintendent',
        'Section Officer',
        'Senior Assistant',
        'Junior Assistant',
        'System Administrator',
        'Technical Officer',
        'Lab Technician',
        'Lab Assistant',
        'Chief Librarian',
        'Assistant Librarian',
        'Library Assistant',
        'Office Subordinate',
        'Accountant'
      ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dynamic Experience Calculation Card (Without 'Verified by HR' pill, strictly real-time calculated) */}
      <div className="bg-gradient-to-r from-teal-900 to-[#0f2942] text-white rounded-xl p-5 shadow-sm border border-teal-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-teal-300">
                Service Duration Engine
              </span>
            </div>
            <h3 className="text-lg font-bold mt-1">
              {isTeaching ? 'Calculated Academic & Professional Experience' : 'Calculated Institutional Service Duration'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {isTeaching
                ? 'Experience calculated in real-time from your joining date at Chaitanya University and verified prior service.'
                : 'Service duration calculated in real-time from your joining date at Chaitanya University.'}
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
            <div className="text-center">
              <div className="text-[11px] text-teal-300 font-semibold">At Chaitanya Univ</div>
              <div className="text-2xl font-black text-white">
                {univExpYears > 0 ? univExpYears : '0.0'}
                <span className="text-xs font-normal text-slate-300 ml-1">yrs</span>
              </div>
            </div>
            {isTeaching && (
              <>
                <div className="h-8 w-px bg-slate-700" />
                <div className="text-center">
                  <div className="text-[11px] text-teal-300 font-semibold">Total Experience</div>
                  <div className="text-2xl font-black text-teal-400">
                    {totalExpYears > 0 ? totalExpYears : '0.0'}
                    <span className="text-xs font-normal text-slate-300 ml-1">yrs</span>
                  </div>
                </div>
              </>
            )}
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
              onChange={(e) => {
                const cat = e.target.value;
                const isNowTeaching = cat === 'Teaching';
                setFormData(prev => ({
                  ...prev,
                  employee_category: cat,
                  designation: prev.designation || '',
                  reporting_officer: isNowTeaching 
                    ? prev.reporting_officer 
                    : 'Dean, Administration (Non-Teaching, Administrative & Technical Staff)',
                  department_id: isNowTeaching ? prev.department_id : '',
                  faculty_id: isNowTeaching ? prev.faculty_id : '',
                  relevant_previous_service_years: isNowTeaching ? prev.relevant_previous_service_years : 0
                }));
              }}
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

          {isTeaching ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty / School <span className="text-rose-500">*</span>
                </label>
                <select
                  name="faculty_id"
                  disabled={isLocked}
                  value={formData.faculty_id}
                  onChange={handleFacultyChange}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  required
                >
                  <option value="">Select Faculty / School...</option>
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
                  onChange={handleDepartmentChange}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  required
                >
                  <option value="">
                    {formData.faculty_id ? 'Select Department / Section...' : 'Select Faculty first (or choose below)'}
                  </option>
                  {filteredDepts.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.code ? `(${d.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="col-span-1 sm:col-span-2">
              <SelectWithOther
                label="Administrative Unit / Branch / Office"
                name="administrative_unit"
                value={formData.administrative_unit}
                onChange={handleChange}
                options={ADMINISTRATIVE_UNITS}
                disabled={isLocked}
                required
                placeholder="Select Administrative Office / Unit..."
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectWithOther
            label="Present Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            options={designationOptions}
            disabled={isLocked}
            required
            placeholder="Select Designation..."
          />

          <SelectWithOther
            label="Employment Type"
            name="employment_type"
            value={formData.employment_type}
            onChange={handleChange}
            options={[
              'Regular / Permanent',
              'Contractual Appointment',
              'Temporary / Ad-hoc',
              'Part-Time / Visiting',
              'Probationary'
            ]}
            disabled={isLocked}
            required
            placeholder="Select Employment Type..."
          />

          <SelectWithOther
            label="Campus Location"
            name="campus_location"
            value={formData.campus_location}
            onChange={handleChange}
            options={[
              'Main Campus, Hyderabad',
              'Warangal Campus',
              'Kishanpura Campus, Hanamkonda',
              'City Extension Center'
            ]}
            disabled={isLocked}
            required
            placeholder="Select Campus Location..."
          />
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
            <span className="text-[10px] text-slate-400 block mt-0.5">Calculates university service duration</span>
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

          {isTeaching && (
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
          )}
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
              placeholder="e.g. CDU/EST/APPT/2026/..."
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

          <SelectWithOther
            label="Designated Reporting Officer (HOD / Reviewing Authority)"
            name="reporting_officer"
            value={formData.reporting_officer}
            onChange={handleChange}
            options={HOD_OFFICE_OPTIONS}
            disabled={isLocked}
            placeholder="Select HOD Office..."
          />
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

          <SelectWithOther
            label="Probation / Confirmation Status"
            name="probation_status"
            value={formData.probation_status}
            onChange={handleChange}
            options={[
              'Confirmed in Service',
              'On Probation',
              'Probation Extended',
              'Contract Tenured',
              'Temporary Appointment'
            ]}
            disabled={isLocked}
            placeholder="Select Status..."
          />

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

      {/* Prior Institutional Service Summary (For Teaching Faculty) */}
      {isTeaching && (
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
                placeholder="e.g. Prior College / University"
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
                placeholder="e.g. 2018 to 2022 (4 Years)"
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
                min="0"
                name="relevant_previous_service_years"
                disabled={isLocked}
                value={formData.relevant_previous_service_years}
                onChange={handleChange}
                placeholder="e.g. 3.5"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Adds to Total Experience calculation</span>
            </div>
          </div>
        </div>
      )}

      {!isLocked && (
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save & Proceed to Module 3 (Educational Quals) →</span>
          </button>
        </div>
      )}
    </form>
  );
}
