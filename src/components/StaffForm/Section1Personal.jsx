import React, { useState, useEffect } from 'react';
import { Camera, Upload, User, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { INDIAN_STATES_AND_UTS, STATE_DISTRICTS_MAP } from '../../data/indiaLocations';

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
        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
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
          className="w-full mt-1.5 bg-slate-50 border border-blue-400 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          required={required}
          autoFocus
        />
      )}
    </div>
  );
}

export default function Section1Personal({ profile, onSaveDraft, onRefreshData, onLiveUpdate, isLocked }) {
  const { showToast } = useAuth();
  const [formData, setFormData] = useState({
    employee_id: profile.employee_id || '',
    full_name: profile.full_name || '',
    salutation: profile.salutation || '',
    name_regional: profile.name_regional || '',
    previous_name: profile.previous_name || '',
    dob: profile.dob || '',
    gender: profile.gender || '',
    blood_group: profile.blood_group || '',
    marital_status: profile.marital_status || '',
    nationality: profile.nationality || 'Indian',
    social_category: profile.social_category || '',
    official_email: profile.official_email || '',
    personal_email: profile.personal_email || '',
    mobile: profile.mobile || '',
    alternate_contact: profile.alternate_contact || '',
    current_address: profile.current_address || '',
    permanent_address: profile.permanent_address || '',
    city: profile.city || '',
    state: profile.state || '',
    pincode: profile.pincode || '',
    country: profile.country || 'India',
    emergency_contact_name: profile.emergency_contact_name || '',
    emergency_contact_relationship: profile.emergency_contact_relationship || '',
    emergency_contact_phone: profile.emergency_contact_phone || ''
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(profile.photo_url || null);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        employee_id: profile.employee_id ?? prev.employee_id ?? '',
        full_name: profile.full_name ?? prev.full_name ?? '',
        salutation: profile.salutation || profile.title || prev.salutation || '',
        name_regional: profile.name_regional ?? prev.name_regional ?? '',
        previous_name: profile.previous_name ?? prev.previous_name ?? '',
        dob: profile.dob ?? prev.dob ?? '',
        gender: profile.gender ?? prev.gender ?? '',
        blood_group: profile.blood_group ?? prev.blood_group ?? '',
        marital_status: profile.marital_status ?? prev.marital_status ?? '',
        nationality: profile.nationality ?? prev.nationality ?? 'Indian',
        social_category: profile.social_category ?? prev.social_category ?? '',
        official_email: profile.official_email ?? prev.official_email ?? '',
        personal_email: profile.personal_email ?? prev.personal_email ?? '',
        mobile: profile.mobile ?? prev.mobile ?? '',
        alternate_contact: profile.alternate_contact ?? prev.alternate_contact ?? '',
        current_address: profile.current_address ?? prev.current_address ?? '',
        permanent_address: profile.permanent_address ?? prev.permanent_address ?? '',
        city: profile.city ?? prev.city ?? '',
        state: profile.state ?? prev.state ?? '',
        pincode: profile.pincode ?? prev.pincode ?? '',
        country: profile.country ?? prev.country ?? 'India',
        emergency_contact_name: profile.emergency_contact_name ?? prev.emergency_contact_name ?? '',
        emergency_contact_relationship: profile.emergency_contact_relationship ?? prev.emergency_contact_relationship ?? '',
        emergency_contact_phone: profile.emergency_contact_phone ?? prev.emergency_contact_phone ?? ''
      }));
      if (profile.photo_url) {
        setPhotoPreview(profile.photo_url);
      }
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (onLiveUpdate && (name === 'full_name' || name === 'salutation' || name === 'employee_id')) {
      onLiveUpdate({ [name]: value });
    }
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    const availableDists = STATE_DISTRICTS_MAP[newState] || [];
    setFormData(prev => ({
      ...prev,
      state: newState,
      city: availableDists.includes(prev.city) ? prev.city : ''
    }));
  };

  const currentDistricts = formData.state && STATE_DISTRICTS_MAP[formData.state]
    ? STATE_DISTRICTS_MAP[formData.state]
    : [];

  const handleCopyAddress = (e) => {
    if (e.target.checked) {
      setFormData(prev => ({ ...prev, permanent_address: prev.current_address }));
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Photo file size must not exceed 2 MB.', 'error');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Allowed image formats: JPG, PNG, WebP.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);

    const data = new FormData();
    data.append('photo', file);

    setUploadingPhoto(true);
    try {
      const res = await fetch('/api/documents/upload-photo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sdrms_token')}`
        },
        body: data
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Photo upload failed');
      showToast('Passport photograph updated securely.', 'success');
      if (onLiveUpdate && (resData.photo_url || resData.url)) {
        onLiveUpdate({ photo_url: resData.photo_url || resData.url });
      }
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveDraft(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Banner: Passport Photograph & Key Identifiers */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row items-center gap-6">
        {/* Photo Box */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-28 h-32 rounded-lg border-2 border-dashed border-blue-400 bg-white overflow-hidden shadow-inner flex items-center justify-center relative group">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Passport Photo Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2 text-slate-400">
                <User className="w-12 h-12 mx-auto stroke-1" />
                <span className="text-[10px] block mt-1 font-medium">Passport Photo</span>
              </div>
            )}

            {!isLocked && (
              <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer text-xs font-medium">
                <Camera className="w-5 h-5 mb-1" />
                <span>Change Photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
              </label>
            )}
          </div>

          {!isLocked && (
            <label className="px-3 py-1 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 rounded text-xs font-semibold text-slate-700 cursor-pointer shadow-sm transition-colors flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photograph'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
            </label>
          )}
          <span className="text-[10px] text-slate-500 text-center">
            Passport size (white background). Max 2MB.
          </span>
        </div>

        {/* Core Profile Highlights */}
        <div className="flex-1 space-y-3 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                University Employee ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="employee_id"
                disabled={isLocked}
                value={formData.employee_id}
                onChange={handleChange}
                placeholder="Enter Employee ID (e.g. CDU-1042)"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                required
              />
              <span className="text-[11px] text-slate-500">Official institutional employee code</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official University Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="official_email"
                disabled={isLocked}
                value={formData.official_email}
                onChange={handleChange}
                placeholder="username@chaitanya.edu.in"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                required
              />
            </div>
          </div>

          <div className="text-xs bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-blue-900">
            <strong>Clearance Protocol:</strong> Once submitted, this profile dossier routes directly to your Department Head (HOD) for scrutiny, followed by Dean endorsement and Registrar final seal.
          </div>
        </div>
      </div>

      {/* Personal Identity Fields (Rich Dropdowns) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center justify-between">
          <span>A. Primary Demographic & Identity Details</span>
          <span className="text-xs text-blue-600 font-semibold">Select via Standard Dropdowns or Type Custom</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name (as per SSC Records) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              disabled={isLocked}
              value={formData.full_name}
              onChange={handleChange}
              placeholder=""
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              required
            />
          </div>

          <SelectWithOther
            label="Title / Salutation"
            name="salutation"
            value={formData.salutation}
            onChange={handleChange}
            options={['Dr.', 'Prof.', 'Mr.', 'Ms.', 'Mrs.']}
            disabled={isLocked}
            required
            placeholder="Select Title..."
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date of Birth <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="dob"
              disabled={isLocked}
              value={formData.dob}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SelectWithOther
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={['Male', 'Female', 'Transgender']}
            disabled={isLocked}
            required
            placeholder="Select Gender..."
          />

          <SelectWithOther
            label="Blood Group"
            name="blood_group"
            value={formData.blood_group}
            onChange={handleChange}
            options={['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']}
            disabled={isLocked}
            required
            placeholder="Select Blood Group..."
          />

          <SelectWithOther
            label="Marital Status"
            name="marital_status"
            value={formData.marital_status}
            onChange={handleChange}
            options={['Single', 'Married', 'Divorced', 'Widowed']}
            disabled={isLocked}
            required
            placeholder="Select Marital Status..."
          />

          <SelectWithOther
            label="Nationality"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            options={['Indian', 'NRI', 'OCI', 'Foreign National']}
            disabled={isLocked}
            required
            placeholder="Select Nationality..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectWithOther
            label="Social Category"
            name="social_category"
            value={formData.social_category}
            onChange={handleChange}
            options={['OC / General', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST', 'EWS']}
            disabled={isLocked}
            placeholder="Select Category..."
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Contact Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              name="mobile"
              disabled={isLocked}
              value={formData.mobile}
              onChange={handleChange}
              placeholder="e.g. 9848022338"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Personal / Recovery Email
            </label>
            <input
              type="email"
              name="personal_email"
              disabled={isLocked}
              value={formData.personal_email}
              onChange={handleChange}
              placeholder="personal@gmail.com"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Residential Address Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
          B. Residential & Communication Address
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Residential Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="current_address"
              disabled={isLocked}
              value={formData.current_address}
              onChange={handleChange}
              rows={3}
              placeholder="Door No, Street Name, Landmark..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Permanent Address <span className="text-rose-500">*</span>
              </label>
              {!isLocked && (
                <label className="text-xs text-blue-600 font-semibold cursor-pointer flex items-center gap-1">
                  <input
                    type="checkbox"
                    onChange={handleCopyAddress}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Same as Current</span>
                </label>
              )}
            </div>
            <textarea
              name="permanent_address"
              disabled={isLocked}
              value={formData.permanent_address}
              onChange={handleChange}
              rows={3}
              placeholder="Permanent home address as per Aadhaar..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SelectWithOther
            label="State"
            name="state"
            value={formData.state}
            onChange={handleStateChange}
            options={INDIAN_STATES_AND_UTS}
            disabled={isLocked}
            required
            placeholder="Select State / UT..."
          />

          <SelectWithOther
            label="City / District"
            name="city"
            value={formData.city}
            onChange={handleChange}
            options={currentDistricts}
            disabled={isLocked}
            required
            placeholder={formData.state ? `Select District in ${formData.state}...` : 'Select State first...'}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              PIN Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="pincode"
              disabled={isLocked}
              value={formData.pincode}
              onChange={handleChange}
              placeholder="e.g. 506001"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <SelectWithOther
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            options={[
              'India',
              'United States',
              'United Kingdom',
              'United Arab Emirates',
              'Australia',
              'Canada',
              'Germany',
              'Singapore'
            ]}
            disabled={isLocked}
            required
            placeholder="Select Country..."
          />
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
          C. Emergency Contact Reference
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Person Name
            </label>
            <input
              type="text"
              name="emergency_contact_name"
              disabled={isLocked}
              value={formData.emergency_contact_name}
              onChange={handleChange}
              placeholder="e.g. S. Anuradha"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <SelectWithOther
            label="Relationship"
            name="emergency_contact_relationship"
            value={formData.emergency_contact_relationship}
            onChange={handleChange}
            options={[
              'Spouse',
              'Father',
              'Mother',
              'Brother',
              'Sister',
              'Son',
              'Daughter',
              'Guardian'
            ]}
            disabled={isLocked}
            placeholder="Select Relationship..."
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Emergency Phone Number
            </label>
            <input
              type="tel"
              name="emergency_contact_phone"
              disabled={isLocked}
              value={formData.emergency_contact_phone}
              onChange={handleChange}
              placeholder="e.g. 9848011223"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!isLocked && (
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save & Proceed to Module 2 (Cadre & Service) →</span>
          </button>
        </div>
      )}
    </form>
  );
}
