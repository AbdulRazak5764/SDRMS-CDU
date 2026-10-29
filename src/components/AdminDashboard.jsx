import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, CheckCircle2, AlertTriangle, XCircle, Clock,
  FileText, Download, Eye, ShieldCheck, Building, ChevronRight, ChevronDown, UserCheck,
  RefreshCw, FileSpreadsheet, AlertCircle, Grid, List, Image as ImageIcon, Sparkles,
  School, Trash2, Award, FolderTree
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DocumentViewerModal from './DocumentViewerModal';
import FacultyInspectModal from './FacultyInspectModal';

export default function AdminDashboard({ onInspectStaff }) {
  const { user, showToast } = useAuth();
  const [stats, setStats] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [hierarchyTree, setHierarchyTree] = useState([]);
  const [loading, setLoading] = useState(true);

  // View layout: 'hierarchy' (University Org Tree), 'table' (All records table), 'cards' (Cards view)
  const isRegistrar = user?.role === 'registrar';
  const isDean = user?.role === 'dean';
  const isHOD = user?.role === 'hod';
  const isVC = user?.role === 'vc';
  const isHR = user?.role === 'hr';

  const [viewLayout, setViewLayout] = useState(isRegistrar ? 'hierarchy' : 'table');
  const [inspectStaffId, setInspectStaffId] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Hierarchy expand states
  const [expandedFaculties, setExpandedFaculties] = useState({});
  const [expandedDepts, setExpandedDepts] = useState({});

  // Verification Action Modal state
  const [verifyTarget, setVerifyTarget] = useState(null);
  const [actionType, setActionType] = useState('APPROVE');
  const [remarks, setRemarks] = useState('');
  const [sectionAffected, setSectionAffected] = useState('General Profile');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // Account Deletion Modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Master lists
  const [departments, setDepartments] = useState([]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedDept) params.append('department', selectedDept);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch(`/api/admin/staff-list?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.staff || []);
      }
    } catch (err) {
      console.error('Error fetching staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHierarchy = async () => {
    try {
      const res = await fetch('/api/admin/hierarchy', {
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHierarchyTree(data.tree || []);
        // Auto-expand first 2 faculties
        if (data.tree && data.tree.length > 0) {
          const initExp = {};
          data.tree.slice(0, 3).forEach(f => { initExp[f.id] = true; });
          setExpandedFaculties(initExp);
        }
      }
    } catch (err) {
      console.error('Error fetching hierarchy:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchHierarchy();
    fetch('/api/admin/master-data', {
      headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.departments) setDepartments(data.departments);
      })
      .catch(err => console.error(err));
  }, [user]);

  useEffect(() => {
    fetchStaff();
  }, [search, selectedDept, selectedCategory, selectedStatus, sortBy, user]);

  const handleExportCSV = () => {
    window.open('/api/admin/export/csv', '_blank');
    showToast('Exporting University Staff Records to CSV...', 'info');
  };

  const handleExecuteVerification = async () => {
    if (!remarks.trim()) {
      showToast('Mandatory remarks are required for all administrative review actions.', 'error');
      return;
    }

    setActionSubmitting(true);
    try {
      const res = await fetch('/api/admin/verify-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sdrms_token')}`
        },
        body: JSON.stringify({
          staff_id: verifyTarget.id,
          action: actionType,
          remarks: remarks.trim(),
          section_affected: sectionAffected
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      showToast(data.message, 'success');
      setVerifyTarget(null);
      setRemarks('');
      fetchStats();
      fetchStaff();
      fetchHierarchy();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleDeleteUserAccount = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/user/${deleteTarget.user_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      showToast(data.message, 'success');
      setDeleteTarget(null);
      fetchStats();
      fetchStaff();
      fetchHierarchy();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'Pending Registrar Approval':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'Pending Dean Approval':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
      case 'Pending HOD Approval':
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-semibold';
      case 'Correction Required':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getRoleHeaderInfo = () => {
    if (isHOD) {
      return {
        title: 'Department Head (HOD) Verification Desk',
        subtitle: `Scrutinize and verify faculty records in ${user.department_name || 'your department'}. Endorsed dossiers forward to your Dean.`,
        badge: 'HOD Scrutiny Desk',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
      };
    }
    if (isDean) {
      return {
        title: 'Deans Council Clearance Overview',
        subtitle: `Review HODs and departmental faculty in ${user.faculty_name || 'your Faculty/School'}. Approved dossiers forward to the Registrar.`,
        badge: 'Dean Clearance Desk',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
      };
    }
    if (isRegistrar) {
      return {
        title: 'Office of the Registrar — Institutional Records Desk',
        subtitle: 'Complete university organization hierarchy: 12 Deans, Department Heads, and faculty members with final certification authority.',
        badge: 'Chief Academic Administration',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
      };
    }
    return {
      title: 'Administrative Registry Desk',
      subtitle: 'Central digital repository of university teaching and administrative staff.',
      badge: 'Administration',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
    };
  };

  const roleInfo = getRoleHeaderInfo();

  return (
    <div className="space-y-6">
      {/* Top Banner / Role Indicator */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${roleInfo.badgeColor}`}>
              {roleInfo.badge}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            {roleInfo.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
            {roleInfo.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => { fetchStats(); fetchStaff(); fetchHierarchy(); }}
            className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Refresh Records"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export University CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Total Staff</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats?.totalStaff ?? '—'}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{stats?.teaching || 0} Teaching</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <div className="text-[11px] font-semibold text-blue-700">Awaiting HOD</div>
          <div className="text-2xl font-black text-blue-900 mt-1">{stats?.pendingHOD ?? '—'}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">Level 1 review</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-2xs">
          <div className="text-[11px] font-semibold text-purple-700">Awaiting Dean</div>
          <div className="text-2xl font-black text-purple-900 mt-1">{stats?.pendingDean ?? '—'}</div>
          <div className="text-[10px] text-purple-600 mt-0.5">Level 2 review</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700">Awaiting Registrar</div>
          <div className="text-2xl font-black text-amber-900 mt-1">{stats?.pendingRegistrar ?? '—'}</div>
          <div className="text-[10px] text-amber-700 mt-0.5">Final seal</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-2xs">
          <div className="text-[11px] font-semibold text-rose-700">Needs Correction</div>
          <div className="text-2xl font-black text-rose-900 mt-1">{stats?.correctionRequired ?? '—'}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Returned to faculty</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700">Approved & Sealed</div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{stats?.approved ?? '—'}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Certified dossiers</div>
        </div>
      </div>

      {/* View Switcher Tabs (Hierarchy Tree vs Records Table) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          {isRegistrar && (
            <button
              onClick={() => setViewLayout('hierarchy')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewLayout === 'hierarchy'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>University Org Hierarchy (Deans → HODs → Faculty)</span>
            </button>
          )}

          <button
            onClick={() => setViewLayout('table')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewLayout === 'table'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Staff Records Table & Clearances</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-semibold">
          Showing {staffList.length} staff records
        </span>
      </div>

      {/* VIEW 1: INTERACTIVE UNIVERSITY HIERARCHY TREE (DEANS -> HODS -> FACULTY) */}
      {viewLayout === 'hierarchy' && isRegistrar && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-3xl shadow-sm space-y-2">
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <School className="w-5 h-5 text-blue-300" />
              <span>Chaitanya University Organizational Hierarchy</span>
            </h3>
            <p className="text-xs text-blue-100 max-w-2xl">
              Expand any Dean to inspect constituent academic departments, Department Heads (HODs), and faculty members under each jurisdiction.
            </p>
          </div>

          <div className="space-y-3">
            {hierarchyTree.map((fac) => {
              const isFacExpanded = expandedFaculties[fac.id];
              return (
                <div key={fac.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  {/* Faculty / Dean Level Header */}
                  <div
                    onClick={() => setExpandedFaculties(prev => ({ ...prev, [fac.id]: !prev[fac.id] }))}
                    className="p-4 bg-slate-50/70 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between transition-colors border-b border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                        <School className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900">{fac.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            Dean: {fac.dean_name || 'Designated Dean'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {fac.dean_title || 'Academic Faculty'} • {fac.departments?.length || 0} Departments • {fac.totalStaff || 0} Faculty Members
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                        {isFacExpanded ? 'Collapse' : 'Expand'}
                      </span>
                      {isFacExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Departments under this Dean */}
                  {isFacExpanded && (
                    <div className="p-4 bg-slate-50/30 space-y-3 pl-6 sm:pl-10">
                      {fac.departments && fac.departments.length > 0 ? (
                        fac.departments.map(dept => {
                          const isDeptExpanded = expandedDepts[dept.id];
                          return (
                            <div key={dept.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                              {/* Department / HOD Header */}
                              <div
                                onClick={() => setExpandedDepts(prev => ({ ...prev, [dept.id]: !prev[dept.id] }))}
                                className="p-3 hover:bg-indigo-50/40 cursor-pointer flex items-center justify-between transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800">
                                    <Building className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-800">{dept.name}</span>
                                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                        HOD: {dept.hod_name || 'Assigned HOD'}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-slate-500">
                                      {dept.facultyCount} Faculty Members
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 text-slate-400">
                                  {isDeptExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </div>
                              </div>

                              {/* Faculty Members List under this HOD */}
                              {isDeptExpanded && (
                                <div className="p-3 bg-slate-50/50 border-t border-slate-100 space-y-2">
                                  {dept.facultyMembers && dept.facultyMembers.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {dept.facultyMembers.map(member => (
                                        <div
                                          key={member.id}
                                          className="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 shadow-2xs transition-all flex flex-col justify-between"
                                        >
                                          <div>
                                            <div className="flex items-center justify-between mb-1">
                                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadge(member.workflow_status)}`}>
                                                {member.workflow_status}
                                              </span>
                                              <span className="text-[10px] font-mono text-slate-400">{member.employee_id}</span>
                                            </div>
                                            <div className="font-extrabold text-xs text-slate-900 mt-1">{member.full_name}</div>
                                            <div className="text-[11px] text-slate-500">{member.designation}</div>
                                            <div className="text-[10px] text-blue-600 truncate">{member.official_email}</div>
                                          </div>

                                          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                                            <button
                                              onClick={() => onInspectStaff(member.id)}
                                              className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                                            >
                                              <Eye className="w-3.5 h-3.5" />
                                              <span>Inspect Dossier</span>
                                            </button>

                                            <button
                                              onClick={() => setVerifyTarget(member)}
                                              className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold"
                                            >
                                              Clearance Action
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-400 italic py-1">
                                      No faculty members currently registered in this department.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-xs text-slate-400 italic">No departments under this faculty yet.</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: SEARCH & FILTER TOOLBAR + TABLE */}
      {viewLayout === 'table' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search Box */}
              <div className="lg:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Employee ID, Name, Email or Designation..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                />
              </div>

              {/* Department Filter (hidden for HOD) */}
              {!isHOD && (
                <div>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 font-bold"
                >
                  <option value="">All Clearance Stages</option>
                  <option value="Pending HOD">Pending HOD Clearance</option>
                  <option value="Pending Dean">Pending Dean Clearance</option>
                  <option value="Pending Registrar">Pending Registrar Clearance</option>
                  <option value="Approved">Approved & Certified</option>
                  <option value="Correction Required">Correction Required</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">All Staff Categories</option>
                  <option value="Teaching">Teaching Faculty</option>
                  <option value="Administrative">Administrative Staff</option>
                  <option value="Technical">Technical Staff</option>
                </select>
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Faculty Member</th>
                    <th className="py-3.5 px-4">Department & Faculty</th>
                    <th className="py-3.5 px-4">Designation & Role</th>
                    <th className="py-3.5 px-4">Clearance Status</th>
                    <th className="py-3.5 px-4">Reviewer Trail</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffList.length > 0 ? (
                    staffList.map((st) => (
                      <tr key={st.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-extrabold text-slate-900">{st.full_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{st.employee_id}</div>
                          <div className="text-[10px] text-blue-600 truncate">{st.official_email}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{st.department_name || '—'}</div>
                          <div className="text-[10px] text-slate-500">{st.faculty_name}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{st.designation || 'Assistant Professor'}</div>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
                            {st.user_role ? st.user_role.toUpperCase() : 'STAFF'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] border ${getStatusBadge(st.workflow_status)}`}>
                            {st.workflow_status}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {st.completion_percentage || 0}% Completed
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[11px] max-w-xs">
                          {st.hod_remarks && (
                            <div className="text-indigo-800 truncate">
                              <strong>HOD:</strong> {st.hod_remarks}
                            </div>
                          )}
                          {st.dean_remarks && (
                            <div className="text-purple-800 truncate">
                              <strong>Dean:</strong> {st.dean_remarks}
                            </div>
                          )}
                          {st.registrar_remarks && (
                            <div className="text-amber-800 truncate">
                              <strong>Registrar:</strong> {st.registrar_remarks}
                            </div>
                          )}
                          {!st.hod_remarks && !st.dean_remarks && !st.registrar_remarks && (
                            <span className="text-slate-400 italic">No review remarks yet</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onInspectStaff(st.id)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 shadow-2xs"
                              title="Inspect full dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>

                            <button
                              onClick={() => setVerifyTarget(st)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs"
                              title="Perform clearance review"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Clearance</span>
                            </button>

                            {/* Delete User Account Button */}
                            <button
                              onClick={() => setDeleteTarget(st)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Permanently Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                        No staff records found matching the current search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Verification Action Modal */}
      {verifyTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span>Execute Clearance Action</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Target: <strong>{verifyTarget.full_name}</strong> ({verifyTarget.employee_id})
                </p>
              </div>
              <button
                onClick={() => setVerifyTarget(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Action:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType('APPROVE')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      actionType === 'APPROVE'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {isHOD ? 'Approve & To Dean' : isDean ? 'Approve & To Registrar' : 'Grant Final Seal'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('CORRECTION_REQUIRED')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      actionType === 'CORRECTION_REQUIRED'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    Correction Req.
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('REJECT')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      actionType === 'REJECT'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Reject Record
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mandatory Review Remarks <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Enter specific audit remarks, clearance rationale, or instructions for correction..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVerifyTarget(null)}
                  className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionSubmitting}
                  onClick={handleExecuteVerification}
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <span>{actionSubmitting ? 'Recording Action...' : 'Confirm Clearance'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Account Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-100 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Confirm Permanent Account Deletion</h4>
                <p className="text-xs text-rose-600 font-medium">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the account and dossier for{' '}
              <strong>{deleteTarget.full_name}</strong> ({deleteTarget.official_email}, Employee ID: {deleteTarget.employee_id})?
              All saved qualifications, publications, documents, and credentials will be removed from the university system.
            </p>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteUserAccount}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Deleting Account...' : 'Permanently Delete Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
