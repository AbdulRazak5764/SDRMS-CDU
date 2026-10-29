import React, { useState } from 'react';
import { Camera, Upload, User, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Section1Personal({ profile, onSaveDraft, onRefreshData, isLocked }) {
  const { showToast } = useAuth();
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    name_regional: profile.name_regional || '',
    previous_name: profile.previous_name || '',
    dob: profile.dob || '1985-05-15',
    gender: profile.gender || 'Male',
    marital_status: profile.marital_status || 'Married',
    nationality: profile.nationality || 'Indian',
    official_email: profile.official_email || '',
    personal_email: profile.personal_email || '',
    mobile: profile.mobile || '',
    alternate_contact: profile.alternate_contact || '',
    current_address: profile.current_address || 'Flat 402, Sri Sai Residency, Hanamkonda',
    permanent_address: profile.permanent_address || 'Flat 402, Sri Sai Residency, Hanamkonda',
    city: profile.city || 'Warangal',
    state: profile.state || 'Telangana',
    pincode: profile.pincode || '506001',
    country: profile.country || 'India',
    emergency_contact_name: profile.emergency_contact_name || '',
    emergency_contact_relationship: profile.emergency_contact_relationship || 'Spouse',
    emergency_contact_phone: profile.emergency_contact_phone || ''
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(profile.photo_url || null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
                University Employee ID (Assigned by HR)
              </label>
              <input
                type="text"
                disabled
                value={profile.employee_id || 'Generating...'}
                className="w-full bg-slate-100 border border-slate-300 text-slate-600 rounded-lg px-3 py-2 text-sm font-mono font-semibold cursor-not-allowed"
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
          <span className="text-xs text-blue-600 font-semibold">Select via Standard Dropdowns</span>
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
              placeholder="e.g. Dr. Sirikonda Vinod"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title / Salutation <span className="text-rose-500">*</span>
            </label>
            <select
              disabled={isLocked}
              name="salutation"
              defaultValue="Dr."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Dr.">Dr.</option>
              <option value="Prof.">Prof.</option>
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Mrs.">Mrs.</option>
            </select>
          </div>

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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gender <span className="text-rose-500">*</span>
            </label>
            <select
              name="gender"
              disabled={isLocked}
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Decline to state">Decline to state</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Blood Group <span className="text-rose-500">*</span>
            </label>
            <select
              name="blood_group"
              disabled={isLocked}
              defaultValue="O+"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="O+">O Positive (O+)</option>
              <option value="O-">O Negative (O-)</option>
              <option value="A+">A Positive (A+)</option>
              <option value="A-">A Negative (A-)</option>
              <option value="B+">B Positive (B+)</option>
              <option value="B-">B Negative (B-)</option>
              <option value="AB+">AB Positive (AB+)</option>
              <option value="AB-">AB Negative (AB-)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Marital Status <span className="text-rose-500">*</span>
            </label>
            <select
              name="marital_status"
              disabled={isLocked}
              value={formData.marital_status}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Married">Married</option>
              <option value="Single">Single</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nationality <span className="text-rose-500">*</span>
            </label>
            <select
              name="nationality"
              disabled={isLocked}
              value={formData.nationality}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Indian">Indian</option>
              <option value="NRI">Non-Resident Indian (NRI)</option>
              <option value="OCI">Overseas Citizen of India (OCI)</option>
              <option value="Foreign National">Foreign National</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Social Category (for Statutory Compliance)
            </label>
            <select
              name="social_category"
              disabled={isLocked}
              defaultValue="OC / General"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="OC / General">OC / General Category</option>
              <option value="BC-A">Backward Class Group A (BC-A)</option>
              <option value="BC-B">Backward Class Group B (BC-B)</option>
              <option value="BC-C">Backward Class Group C (BC-C)</option>
              <option value="BC-D">Backward Class Group D (BC-D)</option>
              <option value="BC-E">Backward Class Group E (BC-E)</option>
              <option value="SC">Scheduled Caste (SC)</option>
              <option value="ST">Scheduled Tribe (ST)</option>
              <option value="EWS">Economically Weaker Section (EWS)</option>
            </select>
          </div>

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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              State <span className="text-rose-500">*</span>
            </label>
            <select
              name="state"
              disabled={isLocked}
              value={formData.state}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Telangana">Telangana</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Kerala">Kerala</option>
              <option value="Delhi">Delhi</option>
              <option value="Other">Other State</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              City / District <span className="text-rose-500">*</span>
            </label>
            <select
              name="city"
              disabled={isLocked}
              value={formData.city}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Hyderabad">Hyderabad</option>
              <option value="Warangal">Warangal</option>
              <option value="Hanamkonda">Hanamkonda</option>
              <option value="Karimnagar">Karimnagar</option>
              <option value="Nizamabad">Nizamabad</option>
              <option value="Secunderabad">Secunderabad</option>
              <option value="Khammam">Khammam</option>
              <option value="Visakhapatnam">Visakhapatnam</option>
              <option value="Vijayawada">Vijayawada</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Other">Other</option>
            </select>
          </div>

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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Country <span className="text-rose-500">*</span>
            </label>
            <select
              name="country"
              disabled={isLocked}
              value={formData.country}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="UAE">UAE</option>
              <option value="Australia">Australia</option>
              <option value="Other">Other</option>
            </select>
          </div>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Relationship
            </label>
            <select
              name="emergency_contact_relationship"
              disabled={isLocked}
              value={formData.emergency_contact_relationship}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Spouse">Spouse</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
              <option value="Guardian">Guardian</option>
              <option value="Other">Other</option>
            </select>
          </div>

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
            className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save Module 1 Personal Details</span>
          </button>
        </div>
      )}
    </form>
  );
}
