import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, UserCheck, Key, Clock, Globe, CheckCircle2, XCircle, AlertTriangle, X, RefreshCw, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RealTimeSecurityModal({ isOpen, onClose }) {
  const { user, token } = useAuth();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchRealtimeSession = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/realtime-session', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessionData(data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to load real-time session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRealtimeSession();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm tracking-tight">Real-Time Security & Authorization Hub</h3>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE RBAC
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Chaitanya University SDRMS — Active Session & Permission Inspector
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRealtimeSession}
              disabled={loading}
              title="Refresh Security Status"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* Card 1: Real-Time Authentication */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-600" />
                1. REAL-TIME AUTHENTICATION STATUS
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                AUTHENTICATED & ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">User Identity:</span>
                <span className="font-bold text-slate-800">{user?.full_name} ({user?.employee_id || 'N/A'})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">Email:</span>
                <span className="font-mono text-slate-800">{user?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">Security Protocol:</span>
                <span className="text-slate-800">JWT 256-bit Cryptographic HMAC Token</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold">Live Verified At:</span>
                <span className="font-mono text-slate-800">{lastRefreshed.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Real-Time Authorization (Role & Jurisdiction) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-purple-600" />
                2. REAL-TIME AUTHORIZATION & RBAC SCOPE
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px] border border-purple-200 uppercase">
                Role: {user?.role}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Administrative Jurisdiction Boundary:
              </span>
              <p className="font-bold text-slate-900 text-xs">
                {sessionData?.jurisdiction || `${user?.department_name || 'Assigned Department'} • ${user?.faculty_name || 'Assigned School'}`}
              </p>
            </div>

            {/* Permission Matrix */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                Real-Time Enforced Permissions:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: 'Edit & Save 9 Modules', allowed: sessionData?.permissions?.canEditOwnProfile ?? true },
                  { label: 'Submit Dossier for Clearance', allowed: sessionData?.permissions?.canSubmitDossier ?? true },
                  { label: 'HOD Level 1 Verification', allowed: sessionData?.permissions?.canReviewDepartmentStaff ?? false },
                  { label: 'Dean Level 2 Endorsement', allowed: sessionData?.permissions?.canEndorseDeanLevel ?? false },
                  { label: 'Registrar Final Clearance Seal', allowed: sessionData?.permissions?.canGrantRegistrarFinalSeal ?? false },
                  { label: 'Delete Department Accounts', allowed: sessionData?.permissions?.canDeleteDepartmentStaff ?? false },
                  { label: 'Delete Any University Account', allowed: sessionData?.permissions?.canDeleteAnyUniversityUser ?? false },
                  { label: 'Master Data & Policy Control', allowed: sessionData?.permissions?.canManageMasterData ?? false },
                ].map((p, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-lg border text-[11px] ${
                      p.allowed
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-slate-100/60 border-slate-200 text-slate-400 font-normal'
                    }`}
                  >
                    <span>{p.label}</span>
                    {p.allowed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Live Security Audit Trail */}
          {sessionData?.recentLogs && sessionData.recentLogs.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600" />
                3. LIVE SECURITY AUDIT LOGS (REAL-TIME ACTIVITY STREAM)
              </span>
              <div className="space-y-1.5">
                {sessionData.recentLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700">{log.action}</span>
                      <span className="text-slate-600 truncate max-w-xs">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>End-to-end multi-tier access enforced in real-time.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Close Security Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
