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
  const defaultStatusByRole = isHOD ? 'Pending HOD' : isDean ? 'Pending Dean' : isRegistrar ? 'Pending Registrar' : '';
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(defaultStatusByRole);
  const [sortBy, setSortBy] = useState('recent');

  // Department-Wise Master-Detail Explorer states (for Registrar Portal)
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [deptSearch, setDeptSearch] = useState('');
  const [deptFilterStatus, setDeptFilterStatus] = useState('all'); // 'all' or 'pending'
  const [deptStaffFilter, setDeptStaffFilter] = useState('all'); // 'all', 'pending', 'approved'
  const [realtimeAlerts, setRealtimeAlerts] = useState([]);

  // Flattened department list with parent faculty info for easy navigation
  const flattenedDepts = React.useMemo(() => {
    const list = [];
    (hierarchyTree || []).forEach(fac => {
      (fac.departments || []).forEach(dept => {
        const pendingCount = (dept.facultyMembers || []).filter(
          m => m.workflow_status === 'Pending Registrar Approval'
        ).length;
        const approvedCount = (dept.facultyMembers || []).filter(
          m => m.workflow_status === 'Approved'
        ).length;
        list.push({
          ...dept,
          faculty_id: fac.id,
          faculty_name: fac.name,
          dean_name: fac.dean_name,
          dean_title: fac.dean_title,
          pendingCount,
          approvedCount,
          totalCount: (dept.facultyMembers || []).length
        });
      });
    });
    return list;
  }, [hierarchyTree]);

  // Auto-select first department or department with pending files
  useEffect(() => {
    if (!selectedDeptId && flattenedDepts.length > 0) {
      const pendingDept = flattenedDepts.find(d => d.pendingCount > 0);
      setSelectedDeptId(pendingDept ? pendingDept.id : flattenedDepts[0].id);
    }
  }, [flattenedDepts, selectedDeptId]);

  // Fetch real-time alerts for Registrar
  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          const unreadAlerts = (data.notifications || []).filter(n => !n.is_read);
          setRealtimeAlerts(unreadAlerts);
        }
      } catch (e) {}
    };
    checkAlerts();
    const interval = setInterval(checkAlerts, 12000);
    return () => clearInterval(interval);
  }, []);

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
      const targetId = deleteTarget.user_id || deleteTarget.id;
      const res = await fetch(`/api/admin/user/${targetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      showToast(data.message || 'Staff account and entire dossier permanently deleted.', 'success');
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
              <span>Department-Wise Dossier Evaluation Desk (Side-by-Side)</span>
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
            <span>All Staff Records Table</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-semibold">
          Showing {staffList.length} staff records
        </span>
      </div>

      {/* Real-time Floating Notification Banner for Registrar / Admin */}
      {realtimeAlerts.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs shrink-0">
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="font-extrabold text-xs flex items-center gap-2">
                <span>⚡ Real-Time Action Alert</span>
                <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold">
                  {realtimeAlerts.length} Pending
                </span>
              </div>
              <div className="text-xs text-amber-100 font-medium mt-0.5">
                {realtimeAlerts[0].title}: {realtimeAlerts[0].message}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {realtimeAlerts[0].staff_profile_id && (
              <button
                onClick={() => {
                  if (realtimeAlerts[0].department_id) setSelectedDeptId(realtimeAlerts[0].department_id);
                  onInspectStaff(realtimeAlerts[0].staff_profile_id);
                }}
                className="px-3.5 py-1.5 bg-white text-orange-900 rounded-xl text-xs font-bold hover:bg-amber-50 cursor-pointer shadow-xs transition-colors"
              >
                Evaluate Now
              </button>
            )}
            <button
              onClick={() => setRealtimeAlerts([])}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: SIDE-BY-SIDE DEPARTMENT DIRECTORY & DOSSIER EVALUATION WORKSPACE */}
      {viewLayout === 'hierarchy' && isRegistrar && (
        <div className="space-y-4">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-[#0f2942] to-blue-900 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <School className="w-5 h-5 text-blue-300" />
                <span>Department-Wise University Clearance Directorate</span>
              </h3>
              <p className="text-xs text-blue-100 mt-1">
                Select any academic department from the left panel to inspect its Dean, HOD, and evaluate faculty dossiers awaiting your Final University Seal.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
              <Building className="w-4 h-4 text-blue-200" />
              <span className="text-xs font-bold">{flattenedDepts.length} Academic Departments</span>
            </div>
          </div>

          {/* Master-Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT COLUMN: Department Explorer & Quick Switcher */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 sticky top-4 max-h-[820px] flex flex-col">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FolderTree className="w-4 h-4 text-blue-600" />
                  Select Department
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {flattenedDepts.length} Total
                </span>
              </div>

              {/* Department Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  placeholder="Search department or school..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-blue-600"
                />
              </div>

              {/* Quick Status Filter Tabs */}
              <div className="flex items-center gap-1.5 pt-1 border-b border-slate-100 pb-2">
                <button
                  onClick={() => setDeptFilterStatus('all')}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer text-center ${
                    deptFilterStatus === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({flattenedDepts.length})
                </button>
                <button
                  onClick={() => setDeptFilterStatus('pending')}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer text-center ${
                    deptFilterStatus === 'pending'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  ⚡ Awaiting Seal ({flattenedDepts.filter(d => d.pendingCount > 0).length})
                </button>
              </div>

              {/* Departments List */}
              <div className="overflow-y-auto space-y-1.5 pr-1 flex-1 max-h-[620px]">
                {flattenedDepts
                  .filter(d => {
                    const matchesSearch = !deptSearch ||
                      d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
                      (d.faculty_name && d.faculty_name.toLowerCase().includes(deptSearch.toLowerCase())) ||
                      (d.hod_name && d.hod_name.toLowerCase().includes(deptSearch.toLowerCase()));
                    const matchesPending = deptFilterStatus === 'all' || (deptFilterStatus === 'pending' && d.pendingCount > 0);
                    return matchesSearch && matchesPending;
                  })
                  .map(dept => {
                    const isSelected = selectedDeptId === dept.id;
                    return (
                      <div
                        key={dept.id}
                        onClick={() => setSelectedDeptId(dept.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 text-left ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#0f2942] to-blue-900 text-white border-blue-900 shadow-sm'
                            : 'bg-white hover:bg-blue-50/60 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <h5 className={`text-xs font-bold leading-snug ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {dept.name}
                          </h5>
                          {dept.pendingCount > 0 && (
                            <span className="shrink-0 bg-amber-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                              ⚡ {dept.pendingCount}
                            </span>
                          )}
                        </div>

                        <div className={`text-[10px] font-medium truncate ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                          {dept.faculty_name}
                        </div>

                        <div className="flex items-center justify-between text-[10px] pt-1 mt-0.5 border-t border-slate-200/40">
                          <span className={isSelected ? 'text-blue-300' : 'text-indigo-600 font-semibold'}>
                            HOD: {dept.hod_name ? dept.hod_name.split(' ').slice(0, 2).join(' ') : 'Assigned HOD'}
                          </span>
                          <span className={`font-mono font-bold ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                            {dept.totalCount} Staff
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* RIGHT COLUMN: Active Department Showcase & Faculty Evaluation Desk */}
            <div className="lg:col-span-8 space-y-4">
              {(() => {
                const activeDept = flattenedDepts.find(d => d.id === selectedDeptId) || flattenedDepts[0];
                if (!activeDept) {
                  return (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                      <Building className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-bold text-slate-600">Select a department from the left panel to begin evaluation</p>
                    </div>
                  );
                }

                // Filter members for active department
                const allMembers = activeDept.facultyMembers || [];
                const membersToShow = allMembers.filter(m => {
                  if (deptStaffFilter === 'pending') return m.workflow_status === 'Pending Registrar Approval';
                  if (deptStaffFilter === 'approved') return m.workflow_status === 'Approved';
                  return true;
                });

                return (
                  <div className="space-y-4">
                    {/* Active Department Header Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                              {activeDept.code || 'DEPT'}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              {activeDept.faculty_name}
                            </span>
                          </div>
                          <h2 className="text-lg font-black text-slate-900 mt-0.5">
                            {activeDept.name}
                          </h2>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {allMembers.length} Faculty Members
                          </span>
                          {activeDept.pendingCount > 0 ? (
                            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                              ⚡ {activeDept.pendingCount} Awaiting Registrar Seal
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ All Clearances Up to Date
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Leadership Hierarchy Strip: Dean & HOD */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* Dean Card */}
                        <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-purple-200 text-purple-800 shrink-0">
                            <School className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wide">
                              Dean of Faculty (Level 2 Clearance)
                            </div>
                            <div className="text-xs font-black text-slate-900 truncate mt-0.5">
                              {activeDept.dean_name || 'Designated Dean'}
                            </div>
                            <div className="text-[11px] text-purple-900/80 truncate">
                              {activeDept.dean_title || activeDept.faculty_name}
                            </div>
                          </div>
                        </div>

                        {/* HOD Card */}
                        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-indigo-200 text-indigo-800 shrink-0">
                            <Building className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wide">
                              Head of Department (Level 1 Scrutiny)
                            </div>
                            <div className="text-xs font-black text-slate-900 truncate mt-0.5">
                              {activeDept.hod_name || 'Assigned Head of Department'}
                            </div>
                            <div className="text-[11px] text-indigo-900/80 truncate">
                              {activeDept.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Department Faculty Dossiers & Evaluation Desk */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-teal-600" />
                            <span>Faculty Dossiers & Clearance Table</span>
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Inspect dossiers, verify HOD & Dean remarks, and confer the Final University Seal.
                          </p>
                        </div>

                        {/* Sub-Filter Tabs */}
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                          <button
                            onClick={() => setDeptStaffFilter('all')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              deptStaffFilter === 'all'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            All ({allMembers.length})
                          </button>
                          <button
                            onClick={() => setDeptStaffFilter('pending')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              deptStaffFilter === 'pending'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-amber-800 hover:text-amber-950'
                            }`}
                          >
                            ⚡ Awaiting Seal ({activeDept.pendingCount})
                          </button>
                          <button
                            onClick={() => setDeptStaffFilter('approved')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              deptStaffFilter === 'approved'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-emerald-800 hover:text-emerald-950'
                            }`}
                          >
                            Approved ({activeDept.approvedCount})
                          </button>
                        </div>
                      </div>

                      {/* Faculty Cards / Table */}
                      {membersToShow.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-xs font-bold text-slate-600">
                            {deptStaffFilter === 'pending'
                              ? 'No faculty dossiers currently awaiting Registrar seal in this department.'
                              : 'No faculty members found for this filter.'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Faculty submissions endorsed by Dean will appear here for your final approval.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {membersToShow.map(member => {
                            const isAwaitingRegistrar = member.workflow_status === 'Pending Registrar Approval';
                            return (
                              <div
                                key={member.id}
                                className={`p-4 rounded-xl border transition-all ${
                                  isAwaitingRegistrar
                                    ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                  {/* Staff Info */}
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm overflow-hidden shrink-0">
                                      {member.photo_url ? (
                                        <img src={member.photo_url} alt={member.full_name} className="w-full h-full object-cover" />
                                      ) : (
                                        member.full_name?.substring(0, 2).toUpperCase()
                                      )}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-extrabold text-slate-900">{member.full_name}</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadge(member.workflow_status)}`}>
                                          {member.workflow_status}
                                        </span>
                                      </div>
                                      <div className="text-[11px] text-slate-600 mt-0.5">
                                        {member.designation} • <span className="font-mono text-slate-500">{member.employee_id}</span>
                                      </div>
                                      <div className="text-[10px] text-blue-600 mt-0.5">{member.official_email}</div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                    <button
                                      onClick={() => onInspectStaff(member.id)}
                                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                                      <span>Inspect</span>
                                    </button>

                                    {isAwaitingRegistrar ? (
                                      <button
                                        onClick={() => {
                                          setVerifyTarget(member);
                                          setActionType('APPROVE');
                                        }}
                                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                                      >
                                        <Award className="w-3.5 h-3.5" />
                                        <span>Grant Final Seal</span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setVerifyTarget(member)}
                                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                      >
                                        Action
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Reviewer Remarks Trail */}
                                {(member.hod_remarks || member.dean_remarks || member.registrar_remarks) && (
                                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                    {member.hod_remarks && (
                                      <div className="p-2 bg-indigo-50/60 rounded-lg text-indigo-900">
                                        <span className="font-bold text-[10px] text-indigo-700 block">✓ HOD Level 1 Scrutiny ({member.hod_reviewer_name || 'HOD'}):</span>
                                        "{member.hod_remarks}"
                                      </div>
                                    )}
                                    {member.dean_remarks && (
                                      <div className="p-2 bg-purple-50/60 rounded-lg text-purple-900">
                                        <span className="font-bold text-[10px] text-purple-700 block">✓ Dean Level 2 Clearance ({member.dean_reviewer_name || 'Dean'}):</span>
                                        "{member.dean_remarks}"
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-800"
                >
                  {isHOD && (
                    <>
                      <option value="Pending HOD">⚡ Pending HOD Clearance (Action Required)</option>
                      <option value="All">All Submitted Records (Dept)</option>
                      <option value="Approved">Approved & Certified</option>
                      <option value="Correction Required">Correction Required</option>
                      <option value="Draft">Unsubmitted Drafts (In Progress)</option>
                    </>
                  )}
                  {isDean && (
                    <>
                      <option value="Pending Dean">⚡ Pending Dean Clearance (Action Required)</option>
                      <option value="All">All HOD-Endorsed Submissions</option>
                      <option value="Pending Registrar">Forwarded to Registrar</option>
                      <option value="Approved">Approved & Certified</option>
                      <option value="Correction Required">Correction Required</option>
                    </>
                  )}
                  {(isRegistrar || isVC || isHR) && (
                    <>
                      <option value="Pending Registrar">⚡ Pending Registrar Clearance (Action Required)</option>
                      <option value="All">All Submissions (HOD & Dean Approved)</option>
                      <option value="Approved">Approved & Sealed in Archives</option>
                      <option value="Correction Required">Correction Required</option>
                      <option value="All Records">University Master Roster (All Staff)</option>
                    </>
                  )}
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
              <strong>{deleteTarget.full_name}</strong> ({deleteTarget.official_email || deleteTarget.account_email}, Employee ID: {deleteTarget.employee_id})?
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
