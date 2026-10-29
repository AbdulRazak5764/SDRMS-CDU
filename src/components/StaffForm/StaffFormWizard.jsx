import React, { useState } from 'react';
import {
  User, Briefcase, GraduationCap, Award, BookOpen, Clock, FileText,
  DollarSign, CheckSquare, ShieldAlert, ArrowLeft, ArrowRight, Save,
  CheckCircle2, AlertTriangle, Eye, Lock, Sparkles
} from 'lucide-react';

import Section1Personal from './Section1Personal';
import Section2Employment from './Section2Employment';
import Section3Education from './Section3Education';
import Section4Professional from './Section4Professional';
import Section5TeachingExp from './Section5TeachingExp';
import Section6Research from './Section6Research';
import Section7Training from './Section7Training';
import Section10StatutoryDocs from './Section10StatutoryDocs';
import Section12Declaration from './Section12Declaration';

export default function StaffFormWizard({
  profileData,
  activeStep = 1,
  setActiveStep,
  onSaveDraft,
  onRefreshData,
  onOpenPrintView,
  saving
}) {
  const profile = profileData?.profile || {};
  const omissions = profileData?.omissions || [];
  const status = profile.workflow_status || 'Draft';
  const isLocked = ['Pending HOD Approval', 'Pending Dean Approval', 'Pending Registrar Approval', 'Submitted', 'Under Verification', 'Approved', 'Archived'].includes(status);

  // Exactly 9 Core Faculty Modules as requested by user
  const sections = [
    { num: 1, title: '1. Personal Dossier', fullTitle: 'Module 1: Personal Identity & Residential Dossier', icon: User },
    { num: 2, title: '2. Cadre & Service', fullTitle: 'Module 2: University Employment & Cadre Placement', icon: Briefcase },
    { num: 3, title: '3. Educational Quals', fullTitle: 'Module 3: Educational Qualifications (SSC to Ph.D.)', icon: GraduationCap },
    { num: 4, title: '4. Eligibility & NET', fullTitle: 'Module 4: Statutory Eligibility (NET/SLET/GATE) & Councils', icon: Award },
    { num: 5, title: '5. Teaching Workload', fullTitle: 'Module 5: Collegiate Teaching Experience & Pedagogy', icon: Clock },
    { num: 6, title: '6. Research & Patents', fullTitle: 'Module 6: Research Publications, Patents & Books', icon: BookOpen },
    { num: 7, title: '7. Funded Projects', fullTitle: 'Module 7: Sponsored Research Grants & Consultancy', icon: DollarSign },
    { num: 8, title: '8. FDPs & Workshops', fullTitle: 'Module 8: Faculty Development Programmes & Training', icon: Award },
    { num: 9, title: '9. Vault & Clearance', fullTitle: 'Module 9: Statutory Documents Vault & Multi-Tier Clearance', icon: CheckSquare }
  ];

  const currentSection = sections.find(s => s.num === activeStep) || sections[0];

  return (
    <div className="space-y-4">
      {/* Locked Notice Banner */}
      {isLocked && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <div>
              <span className="font-bold text-sm block">Record Formally Locked in Workflow</span>
              <span>
                Your dossier is currently under clearance review: <strong className="text-amber-900 bg-amber-100 px-2 py-0.5 rounded font-mono">{status}</strong>. Edits are disabled until approved or returned for corrections.
              </span>
            </div>
          </div>
          <button
            onClick={onOpenPrintView}
            className="px-4 py-2 bg-white hover:bg-amber-100 rounded-full border border-amber-300 font-bold text-amber-900 flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Eye className="w-4 h-4 text-amber-700" />
            <span>Print Official Dossier</span>
          </button>
        </div>
      )}

      {/* 9-Module Horizontal Step Navigator */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-2 overflow-x-auto">
        <div className="flex items-center min-w-max gap-1">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeStep === sec.num;
            const hasOmission = omissions.some(o => o.section === sec.num);

            return (
              <button
                key={sec.num}
                onClick={() => setActiveStep(sec.num)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/30'
                    : hasOmission
                    ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isActive ? 'bg-white text-blue-700 font-black' : 'bg-slate-200 text-slate-700'
                }`}>
                  {sec.num}
                </span>
                <span>{sec.title}</span>
                {hasOmission && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Incomplete requirement" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky Top Control Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-16 z-30">
        <div>
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Module {activeStep} of 9
          </span>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            {currentSection.fullTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {!isLocked && (
            <button
              onClick={() => onSaveDraft({})}
              disabled={saving}
              className="px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Save className="w-4 h-4 text-blue-600" />
              <span>{saving ? 'Saving...' : 'Save Module Draft'}</span>
            </button>
          )}

          <button
            onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
            disabled={activeStep === 1}
            className="px-3 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={() => setActiveStep(Math.min(9, activeStep + 1))}
            disabled={activeStep === 9}
            className="px-4 py-2 rounded-full bg-slate-900 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-40"
          >
            <span className="hidden sm:inline">Next Module</span>
            <span className="sm:hidden">Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Render Active Section Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7">
        {activeStep === 1 && (
          <Section1Personal
            profile={profile}
            onSaveDraft={onSaveDraft}
            onRefreshData={onRefreshData}
            isLocked={isLocked}
          />
        )}

        {activeStep === 2 && (
          <Section2Employment
            profile={profile}
            onSaveDraft={onSaveDraft}
            onRefreshData={onRefreshData}
            isLocked={isLocked}
          />
        )}

        {activeStep === 3 && (
          <Section3Education
            qualifications={profileData?.qualifications || []}
            onRefreshData={onRefreshData}
            isLocked={isLocked}
          />
        )}

        {activeStep === 4 && (
          <Section4Professional
            professionalQuals={profileData?.professionalQuals || []}
            onRefreshData={onRefreshData}
            isLocked={isLocked}
          />
        )}

        {activeStep === 5 && (
          <Section5TeachingExp
            teachingExp={profileData?.teachingExp || []}
            onRefreshData={onRefreshData}
            isLocked={isLocked}
          />
        )}

        {activeStep === 6 && (
          <Section6Research
            publications={profileData?.publications || []}
            projects={profileData?.projects || []}
            patents={profileData?.patents || []}
            academicContributions={profileData?.academicContributions || []}
            onRefreshData={onRefreshData}
            isLocked={isLocked}
          />
        )}

        {activeStep === 7 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Module 7: Sponsored Research Grants, Projects & Consultancy
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Funded projects from DST, SERB, AICTE, UGC, ICMR, and institutional seed grants.
              </p>
            </div>

            <Section6Research
              publications={profileData?.publications || []}
              projects={profileData?.projects || []}
              patents={profileData?.patents || []}
              academicContributions={profileData?.academicContributions || []}
              onRefreshData={onRefreshData}
              isLocked={isLocked}
            />
          </div>
        )}

        {activeStep === 8 && (
          <Section7Training
            trainingProgrammes={profileData?.trainingProgrammes || []}
            onRefreshData={onRefreshData}
            isLocked={isLocked}
          />
        )}

        {activeStep === 9 && (
          <div className="space-y-8">
            {/* 1. Document Vault */}
            <div>
              <div className="border-b border-slate-200 pb-2 mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Statutory Documents Vault
                </h3>
                <p className="text-xs text-slate-500">
                  Upload Appointment Order, SSC Memo, UG/PG Degrees, and Aadhaar card copies.
                </p>
              </div>

              <Section10StatutoryDocs
                documents={profileData?.documents || []}
                onRefreshData={onRefreshData}
                isLocked={isLocked}
              />
            </div>

            {/* 2. Declaration & Multi-Tier Routing */}
            <div className="pt-6 border-t-2 border-slate-200">
              <Section12Declaration
                profileData={profileData}
                onRefreshData={onRefreshData}
                onNavigateSection={setActiveStep}
                onOpenPrintView={onOpenPrintView}
                isLocked={isLocked}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
