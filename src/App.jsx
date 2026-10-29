import React, { useState, useEffect } from 'react';
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
import { LayoutDashboard, FileText, Database, History, Eye, ArrowLeft, CheckCircle2, AlertTriangle, Info, Building2 } from 'lucide-react';

export default function App() {
  const { user, token, loading, toast, showToast, refreshUser, switchDemoRole } = useAuth();

  // Public portal view: 'landing', 'login', or 'register'
  const [publicView, setPublicView] = useState('landing');

  // Navigation states for logged-in users
  const [currentView, setCurrentView] = useState('dashboard'); // 'landing', 'dashboard', 'form', 'print', 'admin-dashboard', 'master-data', 'audit-logs'
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
        setCurrentView('print'); // Show printable / full inspect view
      }
    } catch (err) {
      console.error('Failed to load inspected profile:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyProfile();
      // Default view based on role
      if (isStaff) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('admin-dashboard');
      }
    }
  }, [user]);

  // Handle Save Draft
  const handleSaveDraft = async (customFields = {}) => {
    setSavingDraft(true);
    try {
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
      fetchMyProfile();
      refreshUser();
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
    if (publicView === 'landing') {
      return (
        <LandingPage
          onGoLogin={() => setPublicView('login')}
          onGoRegister={() => setPublicView('register')}
          onDemoLogin={(email) => switchDemoRole(email)}
        />
      );
    }
    return (
      <Login
        onBackToLanding={() => setPublicView('landing')}
        initialMode={publicView}
      />
    );
  }

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
      <Header activeTab={currentView} setActiveTab={setCurrentView} />

      {/* Secondary Role Navigation Tabs */}
      <div className="no-print bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center space-x-1 sm:space-x-2 py-2">
            {/* If Admin Role, provide Admin Dashboard and My Profile toggle */}
            {isAdminRole ? (
              <>
                <button
                  onClick={() => setCurrentView('admin-dashboard')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                    currentView === 'admin-dashboard'
                      ? 'bg-[#3865F6] text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>
                    {isHOD ? 'HOD Scrutiny Desk' : isDean ? 'Dean Clearance Overview' : isVC ? 'VC Executive Overview' : 'Office of Registrar & Org Tree'}
                  </span>
                </button>

                {(isHOD || isDean) && (
                  <button
                    onClick={() => {
                      fetchMyProfile();
                      setCurrentView('form');
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                      currentView === 'dashboard' || currentView === 'form'
                        ? 'bg-[#3865F6] text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>My Academic Profile ({isHOD ? 'Submits to Dean' : 'Submits to Registrar'})</span>
                  </button>
                )}

                {isRegistrar && (
                  <button
                    onClick={() => setCurrentView('master-data')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                      currentView === 'master-data'
                        ? 'bg-[#3865F6] text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                    <span>Master Data & Policies</span>
                  </button>
                )}

                {(isRegistrar || isHR) && (
                  <button
                    onClick={() => setCurrentView('audit-logs')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                      currentView === 'audit-logs'
                        ? 'bg-[#3865F6] text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    <span>Audit Trail</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                    currentView === 'dashboard'
                      ? 'bg-[#3865F6] text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Faculty Dashboard</span>
                </button>

                <button
                  onClick={() => setCurrentView('form')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                    currentView === 'form'
                      ? 'bg-[#3865F6] text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Complete Staff Entry Form (9 Modules)</span>
                </button>

                <button
                  onClick={() => setCurrentView('print')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                    currentView === 'print'
                      ? 'bg-[#3865F6] text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>View / Print Profile Dossier</span>
                </button>

                <button
                  onClick={() => setCurrentView('landing')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                    currentView === 'landing'
                      ? 'bg-[#3865F6] text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>University Portal Home</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {currentView === 'dashboard' && (
          <StaffDashboard
            profileData={profileData}
            onNavigateSection={(step) => {
              setActiveFormStep(step);
              setCurrentView('form');
            }}
            onOpenPrintView={() => setCurrentView('print')}
            onOpenDocs={() => {
              setActiveFormStep(10);
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

        {currentView === 'landing' && (
          <LandingPage
            onGoLogin={() => setCurrentView(isStaff ? 'dashboard' : 'admin-dashboard')}
            onGoRegister={() => setCurrentView('form')}
            onDemoLogin={(email) => switchDemoRole(email)}
          />
        )}
      </main>

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
