import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import StaffDashboard from './components/StaffDashboard';
import StaffFormWizard from './components/StaffForm/StaffFormWizard';
import AdminDashboard from './components/AdminDashboard';
import MasterDataManager from './components/MasterDataManager';
import AuditLogViewer from './components/AuditLogViewer';
import PrintableProfile from './components/PrintableProfile';
import {
  LayoutDashboard, FileText, Database, History, Eye, ArrowLeft,
  CheckCircle2, AlertTriangle, Info, Building2, ShieldCheck,
  LogOut, ChevronRight, User, CheckSquare, Sparkles
} from 'lucide-react';

export default function App() {
  const { user, token, loading, toast, showToast, refreshUser, logout } = useAuth();

  // Public portal view: 'landing', 'login', or 'register'
  const [publicView, setPublicView] = useState('landing');
  const [selectedPortal, setSelectedPortal] = useState('faculty');

  // Navigation states for logged-in users
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'form', 'print', 'admin-dashboard', 'master-data', 'audit-logs'
  const [activeFormStep, setActiveFormStep] = useState(1);
  const [inspectedStaffId, setInspectedStaffId] = useState(null);

  // Profile data for active user or inspected user
  const [profileData, setProfileData] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);

  const isStaff = user?.role === 'staff';
  const isHOD = user?.role === 'hod';
  const isDean = user?.role === 'dean';
  const isHR = user?.role === 'hr';
  const isRegistrar = user?.role === 'registrar';
  const isVC = user?.role === 'vc';
  const isAdminRole = isHOD || isDean || isHR || isRegistrar || isVC;

  // Fetch current user's profile
  const fetchMyProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/staff/my-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  // Fetch inspected staff profile (for administrators)
  const fetchInspectedStaff = async (id) => {
    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        setCurrentView('print');
      }
    } catch (err) {
      console.error('Failed to load inspected profile:', err);
    }
  };

  const loggedInUserIdRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchMyProfile();
      // Only set initial view when first logging in or switching user accounts
      if (loggedInUserIdRef.current !== user.id) {
        loggedInUserIdRef.current = user.id;
        if (isStaff) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('admin-dashboard');
        }
      }
    } else {
      loggedInUserIdRef.current = null;
    }
  }, [user?.id]);

  // Handle Save Draft
  const handleSaveDraft = async (customFields = {}) => {
    setSavingDraft(true);
    try {
      // Optimistically update local profile state so UI updates immediately
      if (customFields && Object.keys(customFields).length > 0) {
        setProfileData(prev => prev ? {
          ...prev,
          profile: {
            ...prev.profile,
            ...customFields
          }
        } : prev);
      }

      const res = await fetch('/api/staff/my-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(customFields)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save draft');
      showToast('Profile draft saved successfully.', 'success');
      await fetchMyProfile();
      await refreshUser();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingDraft(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400 font-semibold text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading Chaitanya University SDRMS...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom duration-200">
            <div className={`px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold ${
              toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}>
              {toast.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              ) : toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Info className="w-4 h-4 text-teal-400" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}
        {publicView === 'landing' ? (
          <LandingPage
            onGoLogin={(portal) => {
              const role = typeof portal === 'string' ? portal : 'faculty';
              setSelectedPortal(role);
              setPublicView('login');
            }}
            onGoRegister={() => {
              setSelectedPortal('faculty');
              setPublicView('register');
            }}
          />
        ) : (
          <Login
            onBackToLanding={() => setPublicView('landing')}
            initialMode={publicView}
            initialPortal={typeof selectedPortal === 'string' ? selectedPortal : 'faculty'}
          />
        )}
      </>
    );
  }

  const roleLabel = isStaff
    ? 'Faculty Member'
    : isHOD
    ? 'Head of Department (HOD)'
    : isDean
    ? 'Dean of Faculty'
    : isRegistrar
    ? 'Office of Registrar'
    : isVC
    ? 'Vice-Chancellor'
    : user.role?.toUpperCase();

  const profile = profileData?.profile || {};
  const userDisplayName = [
    profile.salutation || user?.salutation,
    profile.full_name || user?.profile_full_name || user?.full_name
  ].filter(Boolean).join(' ') || user?.full_name || 'Staff Member';

  const userPhoto = profile.photo_url || user?.photo_url;
  const userEmployeeId = profile.employee_id || user?.employee_id || 'CDU-STAFF';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom duration-200">
          <div className={`px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Info className="w-4 h-4 text-teal-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={currentView}
        profileData={profileData}
        setActiveTab={(view, step) => {
          setCurrentView(view);
          if (step) setActiveFormStep(step);
        }}
      />

      {/* Side-by-Side Official University Layout */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1680px] mx-auto min-h-[calc(100vh-100px)]">
        {/* Left Sidebar: Official University ERP Navigation */}
        <aside className="no-print w-full md:w-64 lg:w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between flex-shrink-0 shadow-2xs">
          <div className="p-4 sm:p-5 space-y-5">
            {/* Faculty Identity Card in Sidebar */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0 overflow-hidden">
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={userDisplayName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <span>{(userDisplayName || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-black text-xs text-slate-900 truncate">
                  {userDisplayName}
                </div>
                <div className="text-[11px] text-blue-700 font-semibold truncate">
                  {roleLabel}
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  ID: {userEmployeeId}
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                University ERP Navigation
              </div>

              {isAdminRole ? (
                <>
                  <button
                    onClick={() => setCurrentView('admin-dashboard')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      currentView === 'admin-dashboard'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {isHOD ? 'HOD Scrutiny Desk' : isDean ? 'Dean Clearance Desk' : isVC ? 'VC Executive Overview' : 'Office of Registrar'}
                    </span>
                  </button>

                  {(isHOD || isDean) && (
                    <button
                      onClick={() => {
                        fetchMyProfile();
                        setCurrentView('form');
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                        currentView === 'form'
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                      }`}
                    >
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">My Academic Profile</span>
                    </button>
                  )}

                  {isRegistrar && (
                    <button
                      onClick={() => setCurrentView('master-data')}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                        currentView === 'master-data'
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                      }`}
                    >
                      <Database className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Master Data & Policies</span>
                    </button>
                  )}

                  {(isRegistrar || isHR) && (
                    <button
                      onClick={() => setCurrentView('audit-logs')}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                        currentView === 'audit-logs'
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                      }`}
                    >
                      <History className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Audit Trail & Security</span>
                    </button>
                  )}

                  <button
                    onClick={() => setCurrentView('print')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      currentView === 'print'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                    }`}
                  >
                    <Eye className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Inspect / Print Dossier</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      currentView === 'dashboard'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                    <span>Faculty Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('form');
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      currentView === 'form'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                    }`}
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>Staff Dossier (10 Modules)</span>
                  </button>

                  <button
                    onClick={() => setCurrentView('print')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      currentView === 'print'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                    }`}
                  >
                    <Eye className="w-4 h-4 flex-shrink-0" />
                    <span>View & Print Dossier</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Sidebar Bottom Status & Sign Out */}
          <div className="p-4 border-t border-slate-200 space-y-3">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Real-Time Database Active</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                SQLite WAL • Zero-Mock Mode
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Institutional Session</span>
            </button>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentView === 'dashboard' && (
            <StaffDashboard
              profileData={profileData}
              onNavigateSection={(step) => {
                setActiveFormStep(step);
                setCurrentView('form');
              }}
              onOpenPrintView={() => setCurrentView('print')}
              onOpenDocs={() => {
                setActiveFormStep(9);
                setCurrentView('form');
              }}
            />
          )}

          {currentView === 'form' && (
            <StaffFormWizard
              profileData={profileData}
              activeStep={activeFormStep}
              setActiveStep={setActiveFormStep}
              onSaveDraft={handleSaveDraft}
              onRefreshData={fetchMyProfile}
              onLiveUpdate={(fields) => {
                setProfileData(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    profile: {
                      ...prev.profile,
                      ...fields
                    }
                  };
                });
              }}
              onOpenPrintView={() => setCurrentView('print')}
              saving={savingDraft}
            />
          )}

          {currentView === 'admin-dashboard' && (
            <AdminDashboard
              onInspectStaff={(id) => {
                setInspectedStaffId(id);
                fetchInspectedStaff(id);
              }}
            />
          )}

          {currentView === 'master-data' && <MasterDataManager />}

          {currentView === 'audit-logs' && <AuditLogViewer />}

          {currentView === 'print' && (
            <PrintableProfile
              profileData={profileData}
              onBack={() => {
                if (isAdminRole && inspectedStaffId) {
                  setCurrentView('admin-dashboard');
                } else {
                  setCurrentView('dashboard');
                }
              }}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Chaitanya (Deemed to be University) — Staff Digital Records Management System (SDRMS)
          </span>
          <span className="text-slate-400">
            Administrative Headquarters: Hyderabad, Telangana, India
          </span>
        </div>
      </footer>
    </div>
  );
}
