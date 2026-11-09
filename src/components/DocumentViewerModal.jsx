import React from 'react';
import { X, Download, FileText, ExternalLink } from 'lucide-react';

export default function DocumentViewerModal({ document, onClose }) {
  if (!document) return null;

  // The file is served via /api/documents/file/:filename
  const fileUrl = `/api/documents/file/${document.stored_filename}`;
  const isPdf = document.file_type === 'application/pdf' || document.original_filename?.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#0f2942] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white line-clamp-1">
                {document.document_title}
              </h3>
              <p className="text-[11px] text-slate-300 flex items-center gap-2">
                <span>{document.original_filename}</span>
                <span>•</span>
                <span>Category: {document.document_category}</span>
                <span>•</span>
                <span className="font-mono text-teal-300">{document.doc_uuid}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Open document in new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in Tab</span>
            </a>
            <a
              href={fileUrl}
              download={document.original_filename}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content View */}
        <div className="flex-1 bg-slate-100 p-2 sm:p-4 overflow-auto flex items-center justify-center">
          {isPdf ? (
            <iframe
              src={fileUrl}
              title={document.document_title}
              className="w-full h-full rounded-lg bg-white shadow-sm border border-slate-300"
            />
          ) : (
            <div className="max-h-full flex items-center justify-center p-2">
              <img
                src={fileUrl}
                alt={document.document_title}
                className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-md border border-slate-200"
              />
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Verification Status:</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              document.verification_status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {document.verification_status || 'Pending Review'}
            </span>
            {document.remarks && (
              <span className="text-slate-500 italic">"{document.remarks}"</span>
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            Chaitanya (Deemed to be University) Digital Records Vault
          </span>
        </div>
      </div>
    </div>
  );
}
