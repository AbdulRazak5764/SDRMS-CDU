import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bell, LogOut, ShieldCheck, CheckCircle2, AlertTriangle,
  Info, Clock, Check, ExternalLink, X, FileCheck, Award
} from 'lucide-react';
import RealTimeSecurityModal from './RealTimeSecurityModal';

export default function Header({ activeTab, setActiveTab, profileData }) {
  const { user, logout } = useAuth();
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNotifFilter, setActiveNotifFilter] = useState('all'); // 'all' or 'approvals'
  const [apiNotifications, setApiNotifications] = useState([]);
  const notifRef = useRef(null);

  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sdrms_read_notifications') || '[]');
    } catch {
      return [];
    }
  });

  // Real-time clearance notifications fetch for HOD, Dean, Registrar, and Faculty
  const fetchLiveNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApiNotifications(data.notifications || []);
      }
    } catch (err) {
      // quiet fail
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'registrar':
        return { label: 'Registrar', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'dean':
        return { label: 'Dean of Faculty', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'vc':
        return { label: 'Vice-Chancellor', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'hr':
        return { label: 'HR Section', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'hod':
        return { label: 'Dept Head (HOD)', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      default:
        return { label: 'Faculty Member', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
  };

  const badge = user ? getRoleBadge(user.role) : null;

  // Profile and display name resolution
  const profile = profileData?.profile || {};
  const logs = profileData?.verificationLogs || [];

  const rawFullName = (profile.full_name || user?.profile_full_name || user?.full_name || '').trim();
  const rawSal = (profile.salutation || user?.salutation || '').trim();
  const userDisplayName = rawSal && !rawFullName.toLowerCase().startsWith(rawSal.toLowerCase()) && !/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i.test(rawFullName)
    ? `${rawSal} ${rawFullName}`
    : (rawFullName || 'Staff Member');

  const userPhoto = profile.photo_url || user?.photo_url;

  const rawNotifications = [];

  // 1. Live Notifications from multi-tier clearance engine (for HOD, Dean, Registrar, and Faculty)
  apiNotifications.forEach((n) => {
    rawNotifications.push({
      id: `api-${n.id}`,
      type: n.type || 'info',
      title: n.title,
      message: n.message,
      reviewer: n.department_name || (n.staff_name ? `Staff: ${n.staff_name}` : 'Clearance Desk'),
      time: n.created_at
        ? new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        : 'Live',
      staffProfileId: n.staff_profile_id,
      isClearance: n.type === 'approval' || n.type === 'submission'
    });
  });

  // 2. Logs from HOD / Dean / Registrar approvals
  logs.forEach((log, idx) => {
    const isApproved = Boolean(
      log.action?.includes('ENDORSE') ||
      log.action?.includes('APPROV') ||
      log.action?.includes('VERIF')
    );
    const isReturned = Boolean(
      log.action?.includes('RETURN') ||
      log.action?.includes('REJECT') ||
      log.action?.includes('CORRECT')
    );

    rawNotifications.push({
      id: `log-${log.id || idx}`,
      type: isApproved ? 'approval' : isReturned ? 'warning' : 'info',
      title: isApproved
        ? (log.role === 'hod' ? 'HOD Level 1 Scrutiny Endorsed' : log.role === 'dean' ? 'Dean Level 2 Clearance Approved' : 'Registrar Final Approval Granted')
        : (isReturned ? 'Dossier Returned for Revision' : (log.action || 'Workflow Action')),
      message: log.remarks
        ? `"${log.remarks}" — ${log.performed_by_name || 'Reviewer'}`
        : `${log.performed_by_name || 'Authority'} reviewed and updated your clearance status to '${log.new_status || 'Verified'}'.`,
      reviewer: log.performed_by_name || (log.role ? log.role.toUpperCase() : 'Authority'),
      time: log.created_at
        ? new Date(log.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        : 'Recent',
      isClearance: true
    });
  });

  // 2. Direct review timestamps on profile if not in logs
  if (profile.hod_reviewed_at && !logs.some(l => l.role === 'hod')) {
    rawNotifications.push({
      id: 'hod-review',
      type: 'approval',
      title: 'HOD Level 1 Scrutiny Endorsed',
      message: profile.hod_remarks
        ? `"${profile.hod_remarks}"`
        : 'Head of Department verified your collegiate teaching credentials & workload.',
      reviewer: profile.hod_reviewer_name || 'HOD Office',
      time: profile.hod_reviewed_at,
      isClearance: true
    });
  }

  if (profile.dean_reviewed_at && !logs.some(l => l.role === 'dean')) {
    rawNotifications.push({
      id: 'dean-review',
      type: 'approval',
      title: 'Dean Level 2 Clearance Approved',
      message: profile.dean_remarks
        ? `"${profile.dean_remarks}"`
        : 'Dean of Faculty endorsed institutional placement & cadre credentials.',
      reviewer: profile.dean_reviewer_name || 'Dean Office',
      time: profile.dean_reviewed_at,
      isClearance: true
    });
  }

  if (profile.registrar_reviewed_at && !logs.some(l => l.role === 'registrar')) {
    rawNotifications.push({
      id: 'registrar-review',
      type: 'approval',
      title: 'Registrar Final Approval Granted',
      message: profile.registrar_remarks
        ? `"${profile.registrar_remarks}"`
        : 'Statutory documents verified and final university seal conferred.',
      reviewer: profile.registrar_reviewer_name || 'Registrar Office',
      time: profile.registrar_reviewed_at,
      isClearance: true
    });
  }

  // 3. Workflow milestones
  if (profile.workflow_status === 'Approved') {
    rawNotifications.unshift({
      id: 'approved-status',
      type: 'approval',
      title: '🎉 University Clearance Conferred',
      message: 'Your official 9-module staff dossier is officially approved and sealed in university digital archives.',
      reviewer: 'Office of Registrar',
      time: 'Certified Active',
      isClearance: true
    });
  } else if (profile.workflow_status === 'Submitted' || profile.workflow_status === 'Under Verification') {
    rawNotifications.unshift({
      id: 'submitted-status',
      type: 'info',
      title: 'Dossier Under Verification',
      message: 'Your dossier has been routed to HOD and Dean Clearance Desks for official Level 1 scrutiny.',
      reviewer: 'Clearing Desk',
      time: 'In Progress',
      isClearance: true
    });
  } else {
    rawNotifications.push({
      id: 'draft-guidance',
      type: 'info',
      title: 'Dossier Verification Pathway Ready',
      message: 'Complete your 9 modules and click SUBMIT DOSSIER. You will receive real-time notifications here as your HOD & Dean endorse each stage.',
      reviewer: 'SDRMS Directorate',
      time: 'Welcome Alert',
      isClearance: false
    });
  }

  const filteredNotifications = activeNotifFilter === 'approvals'
    ? rawNotifications.filter(n => n.type === 'approval')
    : rawNotifications;

  const unreadCount = rawNotifications.filter(n => !readNotificationIds.includes(n.id)).length;

  const markAllAsRead = () => {
    const allIds = rawNotifications.map(n => n.id);
    setReadNotificationIds(allIds);
    try {
      localStorage.setItem('sdrms_read_notifications', JSON.stringify(allIds));
      fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
      }).catch(() => {});
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (item) => {
    if (!readNotificationIds.includes(item.id)) {
      const updated = [...readNotificationIds, item.id];
      setReadNotificationIds(updated);
      try {
        localStorage.setItem('sdrms_read_notifications', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
    setShowNotifications(false);
    if (setActiveTab) {
      // Jump directly to Module 10 (Clearance Pathway) or Dashboard
      setActiveTab('form', 10);
    }
  };

  return (
    <header className="no-print bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
      {/* Main Official University Navbar & Letterhead - Prominent Executive Layout */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 min-h-[82px] sm:min-h-[96px] flex items-center justify-between gap-6">
        {/* Left: Official Crystal-Clear University Letterhead Logo (Large & Prominent) */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <img
            src="/assets/chaitanya-official-logo.png?v=5"
            alt="Chaitanya (Deemed to be University)"
            className="h-16 sm:h-20 md:h-24 max-h-24 w-auto object-contain cursor-pointer transition-transform hover:scale-[1.01] drop-shadow-2xs"
            onClick={() => setActiveTab && setActiveTab('dashboard')}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/chaitanya-crest-hd.jpg?v=5';
            }}
          />
          <div className="hidden xl:flex flex-col border-l-2 border-slate-300 pl-4 py-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Staff Digital Records Management System
            </span>
            <span className="text-[11px] font-semibold text-blue-700">
              Official University Faculty Portal (SDRMS)
            </span>
          </div>
        </div>

        {/* Right: Actions, Notifications, Avatar */}
        {user ? (
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Live Real-Time Auth Verified Pill */}
            <button
              onClick={() => setShowSecurityModal(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
              title="Click to view Live Real-Time Authentication & Authorization Scope"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time Auth Verified</span>
            </button>

            {/* Red Pill Button (SUBMIT DOSSIER -> Goes to Module 10 Clearance) */}
            <button
              onClick={() => setActiveTab && setActiveTab('form', 10)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FF424D] hover:bg-[#ea323d] text-white text-[11px] font-bold tracking-wider uppercase shadow-sm shadow-red-500/20 transition-all cursor-pointer"
              title="Route dossier to HOD & Dean clearance pathway"
            >
              <span className="text-[9px]">▶</span>
              <span>SUBMIT DOSSIER</span>
            </button>

            {/* Interactive Notification Bell with Live Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(prev => !prev)}
                className={`relative p-2 rounded-full transition-colors cursor-pointer ${
                  showNotifications
                    ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-400/30'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
                title="View University Approvals & Clearance Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-extrabold text-white shadow-xs animate-in zoom-in-50">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Working Notifications Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {/* Dropdown Header */}
                  <div className="p-3.5 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                        <Bell className="w-3.5 h-3.5 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold leading-tight">University Clearance Updates</h4>
                        <p className="text-[10px] text-blue-200">
                          {unreadCount > 0 ? `${unreadCount} new update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                        </p>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-blue-300 hover:text-white font-semibold underline underline-offset-2 cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center border-b border-slate-200 bg-slate-50 px-3 py-1.5 gap-2 text-[11px]">
                    <button
                      onClick={() => setActiveNotifFilter('all')}
                      className={`px-2.5 py-1 rounded-full font-bold transition-colors cursor-pointer ${
                        activeNotifFilter === 'all'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All Updates ({rawNotifications.length})
                    </button>
                    <button
                      onClick={() => setActiveNotifFilter('approvals')}
                      className={`px-2.5 py-1 rounded-full font-bold transition-colors cursor-pointer ${
                        activeNotifFilter === 'approvals'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Approvals ({rawNotifications.filter(n => n.type === 'approval').length})
                    </button>
                  </div>

                  {/* Notification Items List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto stroke-1" />
                        <p className="text-xs font-bold text-slate-600 mt-2">No notifications found</p>
                        <p className="text-[11px] text-slate-400">Approval updates will appear here in real time.</p>
                      </div>
                    ) : (
                      filteredNotifications.map((notif) => {
                        const isUnread = !readNotificationIds.includes(notif.id);
                        return (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3 transition-colors cursor-pointer flex items-start gap-2.5 hover:bg-slate-50 ${
                              isUnread ? 'bg-blue-50/50' : 'bg-white'
                            }`}
                          >
                            <div className="mt-0.5 flex-shrink-0">
                              {notif.type === 'approval' ? (
                                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </div>
                              ) : notif.type === 'warning' ? (
                                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200">
                                  <FileCheck className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h5 className={`text-xs ${isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                  {notif.title}
                                </h5>
                                <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                                  {notif.time}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                {notif.message}
                              </p>
                              <div className="mt-1.5 flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  {notif.reviewer}
                                </span>
                                <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 hover:underline">
                                  <span>View Pathway</span>
                                  <ExternalLink className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        if (setActiveTab) setActiveTab('form', 10);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Open Multi-Tier Clearance Pathway</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar & Info */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-300 shadow-2xs bg-blue-50 flex items-center justify-center text-blue-800 font-bold text-xs flex-shrink-0">
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={userDisplayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-blue-700">{(userDisplayName || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-black text-slate-800 leading-tight">
                  {userDisplayName}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border mt-0.5 inline-block ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Real-Time Security & Authorization Hub Modal */}
      <RealTimeSecurityModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />
    </header>
  );
}
