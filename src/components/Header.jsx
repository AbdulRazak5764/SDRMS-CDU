import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, LogOut, ChevronDown, Sparkles, ShieldCheck } from 'lucide-react';
import RealTimeSecurityModal from './RealTimeSecurityModal';

export default function Header({ activeTab, setActiveTab }) {
  const { user, logout, switchDemoRole, demoAccounts } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

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

  return (
    <header className="no-print bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
      {/* Top Quick Demo Role Switcher Strip */}
      <div className="bg-slate-50/90 px-4 sm:px-6 py-1.5 text-xs border-b border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          <span className="font-semibold text-slate-800">Chaitanya (Deemed to be University)</span>
          <span>•</span>
          <span>Hyderabad, Telangana, India</span>
          <span>•</span>
          <span className="text-emerald-700 font-medium">SDRMS Digital Records Portal</span>
        </div>

        {/* Quick Demo Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-600 font-semibold text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-600" />
            Switch Demo Role:
          </span>
          <div className="flex items-center gap-1">
            {demoAccounts.slice(0, 4).map((acc) => (
              <button
                key={acc.email}
                onClick={() => switchDemoRole(acc.email)}
                className={`px-2 py-0.5 rounded-full text-[11px] transition-all font-semibold border ${
                  user?.email === acc.email
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-blue-700'
                }`}
                title={`Switch to ${acc.name} (${acc.badge})`}
              >
                {acc.badge.replace(' Faculty', '').replace(' Staff', '')}
              </button>
            ))}

            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="px-2 py-0.5 rounded-full text-[11px] bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 flex items-center gap-1 font-semibold"
              >
                More <ChevronDown className="w-3 h-3" />
              </button>

              {showRoleMenu && (
                <div
                  className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-left"
                  onMouseLeave={() => setShowRoleMenu(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                    Switch Test Account
                  </div>
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => {
                        switchDemoRole(acc.email);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-slate-50 transition-colors ${
                        user?.email === acc.email ? 'bg-blue-50/70 text-blue-800' : 'text-slate-700'
                      }`}
                    >
                      <span className="font-bold flex items-center justify-between">
                        {acc.name}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                          {acc.badge}
                        </span>
                      </span>
                      <span className="text-[11px] text-slate-500 truncate">{acc.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Clean White Navbar (Inspired by Image 3) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Official University Banner Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/assets/chaitanya-banner.png"
            alt="Chaitanya (Deemed to be University)"
            className="h-10 sm:h-12 w-auto object-contain"
            onError={(e) => {
              // Fallback to crest if banner fails
              e.target.onerror = null;
              e.target.src = '/assets/chaitanya-crest.jpg';
            }}
          />
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search staff profile, qualifications, research, records..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Right: Actions, Notifications, Avatar */}
        {user ? (
          <div className="flex items-center gap-3">
            {/* Live Real-Time Auth & Authorization Pill */}
            <button
              onClick={() => setShowSecurityModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
              title="Click to view Live Real-Time Authentication & Authorization Scope"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Real-Time Auth Verified</span>
            </button>

            {/* Red Pill Button (Exact match to "▶ GO LIVE" in Image 3) */}
            <button
              onClick={() => setActiveTab && setActiveTab('form')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FF424D] hover:bg-[#ea323d] text-white text-[11px] font-bold tracking-wider uppercase shadow-sm shadow-red-500/20 transition-all cursor-pointer"
            >
              <span className="text-[9px]">▶</span>
              <span>SUBMIT DOSSIER</span>
            </button>

            {/* Notification Bell with red badge dot (Image 3) */}
            <button className="relative p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            {/* User Avatar & Info */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-2xs">
                <img
                  src={user.photo_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'}
                  alt={user.full_name || 'Staff Member'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {user.full_name}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border mt-0.5 inline-block ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors ml-1"
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
