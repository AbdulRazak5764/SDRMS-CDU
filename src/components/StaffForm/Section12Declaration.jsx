import React, { useState } from 'react';
import {
  CheckSquare, AlertCircle, FileCheck, ShieldCheck, Printer, ArrowRight,
  Clock, Lock, CheckCircle2, History, AlertTriangle, Building, School, Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Section12Declaration({
  profileData,
  onRefreshData,
  onNavigateSection,
  onOpenPrintView,
  isLocked
}) {
  const { user, showToast } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const profile = profileData?.profile || {};
  const omissions = profileData?.omissions || [];
  const verificationLogs = profileData?.verificationLogs || [];
  const assignedHod = profileData?.assignedHod;
  const assignedDean = profileData?.assignedDean;
  const assignedRegistrar = profileData?.assignedRegistrar;

  const canSubmit = omissions.length === 0;

  const handleSubmitProfile = async () => {
    if (!agreed) {
      showToast('You must check and agree to the statutory declaration statement.', 'error');
      return;
    }
    if (!canSubmit) {
      showToast('Please address the missing mandatory fields listed below before submitting.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/staff/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sdrms_token')}`
        },
        body: JSON.stringify({ declaration_agreed: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmittedData(data);
      showToast(data.message || 'Profile submitted successfully for clearance!', 'success');
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getTargetReviewerLabel = () => {
    if (user?.role === 'staff') {
      return {
        target: assignedHod?.name || 'Department Head (HOD)',
        targetRole: 'Level 1: Head of Department (HOD)',
        next: assignedDean?.name || 'Dean of Faculty',
        nextRole: 'Level 2: Dean of Faculty',
        final: assignedRegistrar?.name || 'Prof. M. Ravinder, M.Sc., Ph.D (Registrar)'
      };
    }
    if (user?.role === 'hod') {
      return {
        target: assignedDean?.name || 'Dean of Faculty',
        targetRole: 'Level 2: Dean of Faculty',
        next: assignedRegistrar?.name || 'Prof. M. Ravinder, M.Sc., Ph.D (Registrar)',
        nextRole: 'Final Seal: Office of the Registrar',
        final: 'Registrar Certification'
      };
    }
    if (user?.role === 'dean') {
      return {
        target: assignedRegistrar?.name || 'Prof. M. Ravinder, M.Sc., Ph.D (Registrar)',
        targetRole: 'Final University Clearance & Certification',
        next: null,
        nextRole: null,
        final: null
      };
    }
    return {
      target: 'Administrative Authority',
      targetRole: 'University Verification Desk'
    };
  };

  const routing = getTargetReviewerLabel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            Module 9: Multi-Tier Clearance Routing & Statutory Declaration
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Review dossier completeness, execute statutory electronic declaration, and route to your assigned authority.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPrintView}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-bold border border-slate-300 transition-colors flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Preview Full Profile Dossier</span>
        </button>
      </div>

      {/* Multi-Tier Clearance Routing Infobox */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 rounded-2xl border border-blue-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Assigned University Clearance Authorities:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Step 1 Box */}
          <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs">
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
              {routing.targetRole}
            </div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">
              {routing.target}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {assignedHod?.email || 'Department Review Authority'}
            </div>
            {profile.hod_remarks && (
              <div className="mt-2 text-[10px] bg-blue-50 text-blue-800 p-1.5 rounded border border-blue-100">
                <strong>HOD Remarks:</strong> "{profile.hod_remarks}"
              </div>
            )}
          </div>

          {/* Step 2 Box */}
          <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-2xs">
            <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wide">
              {routing.nextRole || 'Level 2: Dean of Faculty'}
            </div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">
              {routing.next || assignedDean?.name || 'Dean of Faculty'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {assignedDean?.title || assignedDean?.email || 'Academic Faculty Endorsement'}
            </div>
            {profile.dean_remarks && (
              <div className="mt-2 text-[10px] bg-purple-50 text-purple-800 p-1.5 rounded border border-purple-100">
                <strong>Dean Remarks:</strong> "{profile.dean_remarks}"
              </div>
            )}
          </div>

          {/* Step 3 Box */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
              Level 3: Final University Certification
            </div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">
              Prof. M. Ravinder, M.Sc., Ph.D
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Registrar & Super Administrator
            </div>
            {profile.registrar_remarks && (
              <div className="mt-2 text-[10px] bg-amber-50 text-amber-900 p-1.5 rounded border border-amber-200">
                <strong>Registrar Seal:</strong> "{profile.registrar_remarks}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submission Success Confirmation Screen */}
      {(submittedData || isLocked) && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 sm:p-6 text-emerald-950 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-emerald-900">
                Dossier Formally Routed in Clearance System
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Your dossier has been securely dispatched. Your record remains permanently saved in the university database.
              </p>
            </div>
          </div>

          <div className="bg-white/90 border border-emerald-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Submission Reference</span>
              <div className="font-mono font-bold text-slate-900 mt-0.5">
                {submittedData?.submission_ref || profile.submission_ref || 'CDU-SDRMS-2026-0042'}
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Clearance Stage</span>
              <div className="font-bold text-blue-700 mt-0.5">
                {submittedData?.workflow_status || profile.workflow_status}
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Forwarded To</span>
              <div className="font-bold text-slate-900 mt-0.5 truncate">
                {routing.target}
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Timestamp</span>
              <div className="font-medium text-slate-700 mt-0.5">
                {profile.submitted_at ? new Date(profile.submitted_at).toLocaleDateString() : 'Active'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Omissions Checklist if Incomplete */}
      {!isLocked && omissions.length > 0 && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 sm:p-5 text-rose-950 space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>Missing Mandatory Information ({omissions.length} items to complete before submission)</span>
          </div>
          <p className="text-xs text-rose-800">
            Please complete the following required items before routing for clearance:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {omissions.map((om, idx) => (
              <div
                key={idx}
                onClick={() => onNavigateSection(om.section)}
                className="bg-white/80 hover:bg-white border border-rose-200 hover:border-rose-400 p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all text-xs"
              >
                <div>
                  <span className="font-bold text-rose-900">{om.field}:</span>{' '}
                  <span className="text-rose-700">{om.text}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statutory Electronic Declaration Statement */}
      {!isLocked && (
        <div className="bg-white border border-slate-300 rounded-2xl p-5 space-y-4 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Statutory University Declaration & Compliance Agreement</span>
          </h4>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-serif italic">
            "I hereby solemnly declare that all particulars, dates of appointment, educational qualifications, research publications, and uploaded documents submitted in this 9-Module Digital Dossier are true, complete, and correct to the best of my knowledge and belief. I understand that any false declaration, misrepresentation, or omission may lead to disciplinary action and cancellation of clearance as per the Regulations of Chaitanya (Deemed to be University)."
          </div>

          <label className="flex items-start gap-3 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-xs font-bold text-slate-800">
              I have read, understood, and solemnly agree to the Statutory Declaration statement above.
            </span>
          </label>

          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Routing Destination: <strong className="text-blue-700">{routing.target}</strong> ({routing.targetRole})
            </div>

            <button
              type="button"
              disabled={!agreed || !canSubmit || submitting}
              onClick={handleSubmitProfile}
              className={`px-7 py-3 rounded-full font-bold text-xs tracking-wider uppercase shadow-md transition-all flex items-center gap-2 ${
                agreed && canSubmit && !submitting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{submitting ? 'Routing Dossier...' : `Submit Dossier for ${user?.role === 'hod' ? 'Dean' : user?.role === 'dean' ? 'Registrar' : 'HOD'} Clearance`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
