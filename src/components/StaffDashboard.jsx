import React, { useState } from 'react';
import {
  User, GraduationCap, Briefcase, BookOpen, Award, FileText, CheckCircle2,
  Clock, ShieldCheck, Download, Bookmark, Video, Paperclip, Image, Edit3,
  Grid, List, ChevronRight, Star, ArrowRight, TrendingUp, Sparkles, AlertCircle
} from 'lucide-react';

export default function StaffDashboard({ profileData, onNavigateSection, onOpenPrintView, onOpenDocs }) {
  const profile = profileData?.profile || {};
  const documents = profileData?.documents || [];
  const omissions = profileData?.omissions || [];
  const verificationLogs = profileData?.verificationLogs || [];
  const assignedHod = profileData?.assignedHod;
  const assignedDean = profileData?.assignedDean;
  const assignedRegistrar = profileData?.assignedRegistrar;

  const completion = profile.completion_percentage || 100;
  const status = profile.workflow_status || 'Draft';

  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' or 'list'
  const [quickThought, setQuickThought] = useState('');
  const [activeMenu, setActiveMenu] = useState('feeds'); // 'feeds', 'posts', 'courses', 'analytics', 'docs'

  // Default portrait photo matching aesthetic
  const defaultPhoto = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';

  // 6 Main Feature Cards for the Center Feed (exact layout from Image 3)
  const centerFeedCards = [
    {
      id: 1,
      title: 'UI / UX Trends in Higher Ed & Dossier Portal',
      category: 'Design',
      readTime: '30 mins read',
      tag: 'Basic Personal Dossier',
      description: 'Official name, date of birth, emergency contact, residential address, and verified digital credentials.',
      stats: '100% Complete',
      views: '512 views',
      image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
      section: 1
    },
    {
      id: 2,
      title: 'Collegiate Degree Records & Ph.D. Registry',
      category: 'Academics',
      readTime: '25 mins read',
      tag: 'Educational Qualifications',
      description: `${profileData?.qualifications?.length || 3} degrees certified (Ph.D., M.Tech, B.Tech) with university mark sheets & transcripts.`,
      stats: `${profileData?.qualifications?.length || 3} Verified`,
      views: '600 views',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
      section: 3
    },
    {
      id: 3,
      title: 'Collegiate Teaching Experience & AI Workload',
      category: 'Teaching',
      readTime: '40 mins read',
      tag: 'Teaching Experience',
      description: 'Undergraduate & Postgraduate classroom pedagogy, student mentoring, labs, and modern curriculum design.',
      stats: '8.3 Yrs Univ Exp',
      views: '430 views',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80',
      section: 5
    },
    {
      id: 4,
      title: 'Scopus & Web of Science Research Publications',
      category: 'Research',
      readTime: '35 mins read',
      tag: 'Research & Publications',
      description: `${profileData?.publications?.length || 2} indexed research articles in IEEE Transactions & Springer journals with high citations.`,
      stats: 'Scopus / WoS Indexed',
      views: '780 views',
      image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=600&q=80',
      section: 6
    },
    {
      id: 5,
      title: 'Sponsored Research Grants & AICTE Projects',
      category: 'Grants',
      readTime: '20 mins read',
      tag: 'Funded Research',
      description: 'DST-SERB funded AI-driven institutional records integrity project sanctioned for ₹28,50,000.',
      stats: '₹28.5L Sanctioned',
      views: '390 views',
      image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
      section: 6
    },
    {
      id: 6,
      title: 'Statutory Documents Vault & Compliance Scans',
      category: 'Compliance',
      readTime: '15 mins read',
      tag: 'Statutory Vault',
      description: `${documents.length || 3} verified PDF scans including Appointment Orders, UGC-NET certificate, and Aadhaar card.`,
      stats: `${documents.length || 3} Uploads`,
      views: '640 views',
      image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
      section: 10
    }
  ];

  return (
    <div className="space-y-6">
      {/* Correction Banner if Flagged */}
      {status === 'Correction Required' && verificationLogs.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-900 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-sm">Administrative Reviewer Remarks:</span>
            <p className="mt-0.5 text-rose-800">
              "{verificationLogs[0]?.remarks || 'Please review your records and address the flagged sections.'}"
            </p>
          </div>
          <button
            onClick={() => onNavigateSection(1)}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-xs shadow-sm transition-all"
          >
            Fix & Resubmit
          </button>
        </div>
      )}

      {/* THREE-COLUMN LAYOUT (Exact match to User Reference Image 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================= */}
        {/* COLUMN 1: LEFT PROFILE CARD & SIDEBAR (3 of 12 columns)    */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-5">
          {/* Main User Card (Image 3 Left Profile Box) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-sm text-center flex flex-col items-center">
            {/* Circular Staff Photo */}
            <div className="w-24 h-24 rounded-full border-4 border-slate-100 overflow-hidden bg-slate-50 shadow-md flex items-center justify-center relative mb-3">
              <img
                src={profile.photo_url || defaultPhoto}
                alt={profile.full_name || 'Staff Member'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultPhoto;
                }}
              />
            </div>

            {/* Name and Designation */}
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight">
              {profile.full_name || 'Dr. Ramesh Kumar Reddy'}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {profile.designation || 'Assistant Professor'}
            </p>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
              {profile.department_name || 'Computer Science & Engineering'}
            </p>

            {/* Stars Rating (4 gold stars + 1 hollow star like Image 3) */}
            <div className="flex items-center gap-1 my-3 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
              <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
              <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
              <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
              <Star className="w-4 h-4 text-slate-300 stroke-slate-300" />
            </div>

            {/* Blue Pill Button: VIEW PROFILE (Matches Image 3) */}
            <button
              onClick={() => onNavigateSection(1)}
              className="w-full py-2.5 px-6 rounded-full bg-[#3865F6] hover:bg-[#2554EB] text-white font-bold text-xs tracking-wider uppercase shadow-md shadow-blue-500/20 transition-all mt-1 mb-4"
            >
              VIEW PROFILE
            </button>

            {/* Stats Row with mini curve & connections (Matches Image 3) */}
            <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-around text-center">
              <div>
                <div className="text-lg font-black text-slate-800">
                  {profile.calculated_univ_exp_years || '8.3'}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Univ Exp (Yrs)</div>
              </div>

              <div className="h-8 w-px bg-slate-200" />

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  {/* Decorative Mini Sparkline Curve SVG (Matches Image 3) */}
                  <svg className="w-10 h-4 text-purple-500" viewBox="0 0 40 16" fill="none">
                    <path
                      d="M2 13 Q 10 2, 20 10 T 36 4"
                      stroke="#8B5CF6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="36" cy="4" r="2.5" fill="#8B5CF6" />
                  </svg>
                  <span className="text-xs font-bold text-slate-800">{completion}%</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Activity Level</div>
              </div>
            </div>
          </div>

          {/* Left Vertical Navigation Menu (Matches Image 3 list) */}
          <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm p-3.5 space-y-1">
            <button
              onClick={() => setActiveMenu('feeds')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeMenu === 'feeds'
                  ? 'text-blue-600 bg-blue-50/80 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>New Feeds</span>
              {activeMenu === 'feeds' && <ChevronRight className="w-4 h-4 text-blue-600" />}
            </button>

            <button
              onClick={() => {
                setActiveMenu('posts');
                onNavigateSection(1);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeMenu === 'posts'
                  ? 'text-blue-600 bg-blue-50/80 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>My Post / Dossier</span>
              {activeMenu === 'posts' && <ChevronRight className="w-4 h-4 text-blue-600" />}
            </button>

            <button
              onClick={() => {
                setActiveMenu('courses');
                onNavigateSection(3);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeMenu === 'courses'
                  ? 'text-blue-600 bg-blue-50/80 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Courses & Degrees</span>
              <ChevronRight className="w-4 h-4 text-blue-600" />
            </button>

            <button
              onClick={() => {
                setActiveMenu('analytics');
                onNavigateSection(5);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeMenu === 'analytics'
                  ? 'text-blue-600 bg-blue-50/80 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Analytics & Workload</span>
              {activeMenu === 'analytics' && <ChevronRight className="w-4 h-4 text-blue-600" />}
            </button>

            <button
              onClick={onOpenPrintView}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              <span>Print Official Dossier</span>
              <Download className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2: CENTER MAIN CONTENT FEED (6 of 12 columns)       */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 space-y-5">
          {/* Clearance Pathway Stepper Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  Dossier Clearance Pathway
                </span>
              </div>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                status === 'Pending Registrar Approval' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                status === 'Pending Dean Approval' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                status === 'Pending HOD Approval' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                status === 'Correction Required' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                'bg-slate-100 text-slate-700 border-slate-300'
              }`}>
                Stage: {status}
              </span>
            </div>

            {/* 3 Step Visual Flow */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className={`p-2.5 rounded-2xl border transition-all ${
                status !== 'Draft' ? 'bg-blue-50/80 border-blue-300' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="w-5 h-5 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold mb-1">
                  1
                </div>
                <div className="font-extrabold text-[11px] text-slate-900 truncate">
                  {assignedHod?.name || 'Department HOD'}
                </div>
                <div className="text-[10px] text-slate-400">Level 1 Scrutiny</div>
              </div>

              <div className={`p-2.5 rounded-2xl border transition-all ${
                ['Pending Dean Approval', 'Pending Registrar Approval', 'Approved'].includes(status)
                  ? 'bg-purple-50/80 border-purple-300' : 'bg-slate-50 border-slate-200 opacity-70'
              }`}>
                <div className="w-5 h-5 mx-auto rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold mb-1">
                  2
                </div>
                <div className="font-extrabold text-[11px] text-slate-900 truncate">
                  {assignedDean?.name || 'Dean of Faculty'}
                </div>
                <div className="text-[10px] text-slate-400">Level 2 Endorsement</div>
              </div>

              <div className={`p-2.5 rounded-2xl border transition-all ${
                status === 'Approved' ? 'bg-emerald-50 border-emerald-300' :
                status === 'Pending Registrar Approval' ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200 opacity-70'
              }`}>
                <div className="w-5 h-5 mx-auto rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold mb-1">
                  3
                </div>
                <div className="font-extrabold text-[11px] text-slate-900 truncate">
                  Prof. M. Ravinder
                </div>
                <div className="text-[10px] text-slate-400">Final University Seal</div>
              </div>
            </div>

            {/* Reviewer Feedback / Remarks Callout if available */}
            {(profile.hod_remarks || profile.dean_remarks || profile.registrar_remarks) && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                {profile.hod_remarks && (
                  <div className="text-indigo-900">
                    <strong>HOD Feedback:</strong> "{profile.hod_remarks}"
                  </div>
                )}
                {profile.dean_remarks && (
                  <div className="text-purple-900">
                    <strong>Dean Feedback:</strong> "{profile.dean_remarks}"
                  </div>
                )}
                {profile.registrar_remarks && (
                  <div className="text-amber-900">
                    <strong>Registrar Seal:</strong> "{profile.registrar_remarks}"
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Top "Share your thoughts" Card (Matches Image 3) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm space-y-3">
            <input
              type="text"
              value={quickThought}
              onChange={(e) => setQuickThought(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full bg-transparent border-0 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-0"
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-4 text-slate-400">
                <button
                  type="button"
                  onClick={() => onNavigateSection(10)}
                  className="hover:text-blue-600 transition-colors p-1"
                  title="Upload Video / Media"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateSection(10)}
                  className="hover:text-blue-600 transition-colors p-1"
                  title="Upload Document / PDF"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateSection(1)}
                  className="hover:text-blue-600 transition-colors p-1"
                  title="Upload Photo"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateSection(12)}
                  className="hover:text-blue-600 transition-colors p-1"
                  title="Edit Notes"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Royal Blue Pill POST Button (Image 3) */}
              <button
                onClick={() => onNavigateSection(1)}
                className="px-6 py-2 rounded-full bg-[#3865F6] hover:bg-[#2554EB] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all uppercase tracking-wider"
              >
                POST
              </button>
            </div>
          </div>

          {/* Sort By & Layout Switcher Bar (Matches Image 3) */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">Sort By :</span>
              <span className="px-3.5 py-1 rounded-full bg-[#3865F6] text-white font-bold text-[11px] cursor-pointer flex items-center gap-1 shadow-xs">
                RECENT ▾
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Layout :</span>
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${layoutMode === 'grid' ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${layoutMode === 'list' ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feed Cards (Grid 2-column or List) */}
          <div className={layoutMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-5' : 'space-y-4'}>
            {centerFeedCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Card Illustration / 16:9 Image */}
                  <div className="h-36 w-full bg-slate-100 overflow-hidden relative">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Yellow Bookmark Ribbon (Image 3) */}
                    <div className="absolute top-3 right-3">
                      <Bookmark className="w-4 h-4 text-amber-500 fill-amber-400 filter drop-shadow-xs cursor-pointer" />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-2">
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug line-clamp-1">
                      {card.title}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {card.category} . {card.readTime}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">{card.views}</span>
                  <button
                    onClick={() => onNavigateSection(card.section)}
                    className="font-bold text-blue-600 hover:text-blue-700 tracking-wider uppercase text-[11px] flex items-center gap-1 group-hover:gap-1.5 transition-all"
                  >
                    <span>VIEW MORE</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 3: RIGHT QUICK ACCESS & TRENDING (3 of 12 columns)  */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-6">
          {/* Quick Access Rounded Badge Tags (Image 3 Right Top) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 tracking-wider">
              Quick Access
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'UI/UX DESIGN', sec: 1 },
                { label: 'TECHNOLOGY', sec: 5 },
                { label: 'SALES', sec: 2 },
                { label: 'BUSINESS DEV', sec: 6 },
                { label: 'MACHINE LEARN', sec: 6 },
                { label: 'WRITING', sec: 10 }
              ].map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateSection(pill.sec)}
                  className="px-3 py-2 rounded-full bg-white hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 text-[10px] font-bold text-slate-600 hover:text-blue-600 uppercase tracking-wider transition-all shadow-2xs text-center truncate"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Courses / Status Cards (Pastel Colors like Image 3) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 tracking-wider">
              Trending Courses
            </h3>

            {/* 1. Purple Card: Web Development (Exact match to Image 3) */}
            <div
              onClick={() => onNavigateSection(12)}
              className="bg-[#6979F8] hover:bg-[#5b6bf0] text-white rounded-2xl p-4 shadow-sm cursor-pointer transition-all space-y-0.5"
            >
              <div className="text-sm font-bold tracking-tight">
                Web Development
              </div>
              <div className="text-[11px] text-white/80 font-medium">
                Development . 25 mins read
              </div>
            </div>

            {/* 2. Mint Green Card: Robotics Learning (Exact match to Image 3) */}
            <div
              onClick={() => onNavigateSection(3)}
              className="bg-[#5CD69D] hover:bg-[#4bc78e] text-white rounded-2xl p-4 shadow-sm cursor-pointer transition-all space-y-0.5"
            >
              <div className="text-sm font-bold tracking-tight">
                Robotics Learning
              </div>
              <div className="text-[11px] text-white/80 font-medium">
                Information . 40 mins read
              </div>
            </div>

            {/* 3. Warm Golden Yellow Card: Practical Sales Techniques (Exact match to Image 3) */}
            <div
              onClick={() => onNavigateSection(2)}
              className="bg-[#FFCE56] hover:bg-[#f5c345] text-slate-900 rounded-2xl p-4 shadow-sm cursor-pointer transition-all space-y-0.5"
            >
              <div className="text-sm font-bold tracking-tight">
                Practical Sales Techniques
              </div>
              <div className="text-[11px] text-slate-800/80 font-medium">
                Sales . 25 mins read
              </div>
            </div>

            {/* 4. Soft Pastel Pink / Rose Card: Databases (Exact match to Image 3) */}
            <div
              onClick={() => onNavigateSection(10)}
              className="bg-[#FF8DA1] hover:bg-[#f77b92] text-white rounded-2xl p-4 shadow-sm cursor-pointer transition-all space-y-0.5"
            >
              <div className="text-sm font-bold tracking-tight">
                Databases
              </div>
              <div className="text-[11px] text-white/80 font-medium">
                Development . 50 mins read
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
