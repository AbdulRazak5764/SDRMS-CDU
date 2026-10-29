import React, { useState, useEffect } from 'react';
import { Database, Plus, Check, Edit2, Shield, Settings, Building, Award, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MasterDataManager() {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('depts');

  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [docRequirements, setDocRequirements] = useState([]);
  const [settings, setSettings] = useState({});

  // Modals / Input states
  const [newFaculty, setNewFaculty] = useState({ name: '', code: '' });
  const [newDept, setNewDept] = useState({ name: '', code: '', faculty_id: '' });
  const [newDesig, setNewDesig] = useState({ name: '', category: 'Teaching' });

  const fetchMasterData = async () => {
    try {
      const res = await fetch('/api/admin/master-data', {
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFaculties(data.faculties || []);
        setDepartments(data.departments || []);
        setDesignations(data.designations || []);
        setDocRequirements(data.docRequirements || []);
        setSettings(data.settings || {});
      }
    } catch (err) {
      console.error('Failed to load master data:', err);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!newFaculty.name || !newFaculty.code) return;
    try {
      const res = await fetch('/api/admin/faculties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` },
        body: JSON.stringify(newFaculty)
      });
      if (!res.ok) throw new Error('Failed to save faculty');
      showToast('Faculty added successfully.', 'success');
      setNewFaculty({ name: '', code: '' });
      fetchMasterData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!newDept.name || !newDept.code) return;
    try {
      const res = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` },
        body: JSON.stringify(newDept)
      });
      if (!res.ok) throw new Error('Failed to save department');
      showToast('Department registered.', 'success');
      setNewDept({ name: '', code: '', faculty_id: '' });
      fetchMasterData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddDesig = async (e) => {
    e.preventDefault();
    if (!newDesig.name) return;
    try {
      const res = await fetch('/api/admin/designations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` },
        body: JSON.stringify(newDesig)
      });
      if (!res.ok) throw new Error('Failed to save designation');
      showToast('Designation registered.', 'success');
      setNewDesig({ name: '', category: 'Teaching' });
      fetchMasterData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateDocPolicy = async (id, is_mandatory) => {
    try {
      const res = await fetch(`/api/admin/doc-requirements/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` },
        body: JSON.stringify({ is_mandatory })
      });
      if (!res.ok) throw new Error('Failed to update policy');
      showToast('Document requirement policy updated.', 'success');
      fetchMasterData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to save settings');
      showToast('Institutional settings updated.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-teal-600" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Master Data & Policy Configuration
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Authorized Registrar Console: Manage faculties, academic departments, official designations, and statutory document compliance rules.
        </p>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-200">
          <button
            onClick={() => setActiveTab('depts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'depts' ? 'bg-[#0f2942] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Departments ({departments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('faculties')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'faculties' ? 'bg-[#0f2942] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Faculties & Schools ({faculties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('desigs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'desigs' ? 'bg-[#0f2942] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Designations ({designations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'docs' ? 'bg-[#0f2942] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Document Policies ({docRequirements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'settings' ? 'bg-[#0f2942] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>University Branding & Limits</span>
          </button>
        </div>
      </div>

      {/* Tab: Departments */}
      {activeTab === 'depts' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Add New Academic Department
            </h3>
            <form onSubmit={handleAddDept} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Department Name (e.g. Artificial Intelligence)"
                value={newDept.name}
                onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                className="border rounded-lg p-2 text-xs"
                required
              />
              <input
                type="text"
                placeholder="Unique Code (e.g. AI)"
                value={newDept.code}
                onChange={e => setNewDept({ ...newDept, code: e.target.value })}
                className="border rounded-lg p-2 text-xs"
                required
              />
              <select
                value={newDept.faculty_id}
                onChange={e => setNewDept({ ...newDept, faculty_id: e.target.value })}
                className="border rounded-lg p-2 text-xs"
              >
                <option value="">Select Faculty</option>
                {faculties.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold px-4 py-2 flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Department
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 uppercase font-bold text-slate-800 border-b">
                <tr>
                  <th className="px-4 py-3">Department Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Faculty / School</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {departments.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{d.name}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-teal-800">{d.code}</td>
                    <td className="px-4 py-3 text-slate-600">{d.faculty_name || 'Constituent Administrative Unit'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Faculties */}
      {activeTab === 'faculties' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Add New Faculty / School
            </h3>
            <form onSubmit={handleAddFaculty} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Faculty Name (e.g. Faculty of Law)"
                value={newFaculty.name}
                onChange={e => setNewFaculty({ ...newFaculty, name: e.target.value })}
                className="border rounded-lg p-2 text-xs"
                required
              />
              <input
                type="text"
                placeholder="Code (e.g. FLAW)"
                value={newFaculty.code}
                onChange={e => setNewFaculty({ ...newFaculty, code: e.target.value })}
                className="border rounded-lg p-2 text-xs"
                required
              />
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold px-4 py-2 flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Faculty
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 uppercase font-bold text-slate-800 border-b">
                <tr>
                  <th className="px-4 py-3">Faculty / School Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {faculties.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{f.name}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-teal-800">{f.code}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Designations */}
      {activeTab === 'desigs' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Add New Designation
            </h3>
            <form onSubmit={handleAddDesig} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Designation Title"
                value={newDesig.name}
                onChange={e => setNewDesig({ ...newDesig, name: e.target.value })}
                className="border rounded-lg p-2 text-xs"
                required
              />
              <select
                value={newDesig.category}
                onChange={e => setNewDesig({ ...newDesig, category: e.target.value })}
                className="border rounded-lg p-2 text-xs"
              >
                <option value="Teaching">Teaching</option>
                <option value="Non-Teaching">Non-Teaching</option>
                <option value="Technical">Technical</option>
                <option value="Administrative">Administrative</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Library">Library</option>
              </select>
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold px-4 py-2 flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Designation
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 uppercase font-bold text-slate-800 border-b">
                <tr>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {designations.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{d.name}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{d.category}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Document Requirements Policy */}
      {activeTab === 'docs' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              Statutory Document Verification Policy
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure whether each statutory document is Mandatory, Conditional, Optional, or Not Applicable.
            </p>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 uppercase font-bold text-slate-800 border-b">
              <tr>
                <th className="px-4 py-3">Document Requirement</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Applicable Staff</th>
                <th className="px-4 py-3">Requirement Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {docRequirements.map(dr => (
                <tr key={dr.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{dr.name}</div>
                    <div className="text-[10px] text-slate-500">{dr.description}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{dr.category}</td>
                  <td className="px-4 py-3 font-medium text-slate-600">{dr.applies_to_category}</td>
                  <td className="px-4 py-3">
                    <select
                      value={dr.is_mandatory}
                      onChange={(e) => handleUpdateDocPolicy(dr.id, e.target.value)}
                      className={`text-xs font-bold rounded-lg px-2 py-1 border ${
                        dr.is_mandatory === 'Mandatory'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : dr.is_mandatory === 'Conditional'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      <option value="Mandatory">Mandatory</option>
                      <option value="Conditional">Conditional</option>
                      <option value="Optional">Optional</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: System Settings & Logo */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
            University Identity & Storage Limits Configuration
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official University Name
            </label>
            <input
              type="text"
              value={settings.university_name || 'Chaitanya (Deemed to be University)'}
              onChange={e => setSettings({ ...settings, university_name: e.target.value })}
              className="w-full border rounded-lg p-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location / Headquarters
            </label>
            <input
              type="text"
              value={settings.university_location || 'Hyderabad, Telangana, India'}
              onChange={e => setSettings({ ...settings, university_location: e.target.value })}
              className="w-full border rounded-lg p-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Document Upload Size (MB)
              </label>
              <input
                type="number"
                value={settings.max_doc_size_mb || 5}
                onChange={e => setSettings({ ...settings, max_doc_size_mb: e.target.value })}
                className="w-full border rounded-lg p-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Photograph Upload Size (MB)
              </label>
              <input
                type="number"
                value={settings.max_photo_size_mb || 2}
                onChange={e => setSettings({ ...settings, max_photo_size_mb: e.target.value })}
                className="w-full border rounded-lg p-2 text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow"
            >
              Save System Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
