import React, { useState } from 'react';
import { FileText, Upload, Trash2, Eye, CheckCircle2, Clock, AlertCircle, ShieldCheck, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DocumentViewerModal from '../DocumentViewerModal';

export default function Section10StatutoryDocs({ documents = [], onRefreshData, isLocked }) {
  const { showToast } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [uploading, setUploading] = useState(false);

  const emptyForm = {
    document_category: '',
    document_title: '',
    issuing_authority: '',
    issue_date: ''
  };

  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);

  const openUploadModal = () => {
    setForm(emptyForm);
    setSelectedFile(null);
    setShowUploadModal(true);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.document_category) {
      showToast('Please select the document category.', 'error');
      return;
    }
    if (!selectedFile) {
      showToast('Please select a PDF or image document to upload.', 'error');
      return;
    }
    if (!form.document_title) {
      showToast('Please enter the document title.', 'error');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5 MB limit.', 'error');
      return;
    }

    const data = new FormData();
    data.append('document', selectedFile);
    data.append('document_category', form.document_category);
    data.append('document_title', form.document_title);
    data.append('issuing_authority', form.issuing_authority);
    data.append('issue_date', form.issue_date);

    setUploading(true);
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` },
        body: data
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Upload failed');
      showToast('Statutory document uploaded successfully.', 'success');
      setShowUploadModal(false);
      setSelectedFile(null);
      setForm(emptyForm);
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this uploaded document?')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
      });
      if (!res.ok) throw new Error('Failed to delete document');
      showToast('Document removed.', 'info');
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Statutory & Administrative Documents Repository
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload verified PDF or image scans of Appointment Orders, Educational Degrees, Identity Proof, and Service Reports.
          </p>
        </div>

        {!isLocked && (
          <button
            onClick={openUploadModal}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Compliance Guidelines Alert */}
      <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 text-xs text-teal-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-teal-950">University Document Verification Protocol:</span>
          <p className="mt-0.5 text-teal-900">
            Permitted formats: <strong>PDF, JPG, JPEG, PNG</strong>. Max size: <strong>5 MB per document</strong>. All uploads are scanned for integrity and validated by the Establishment Section before final approval.
          </p>
        </div>
      </div>

      {/* Uploaded Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
          <FileText className="w-10 h-10 text-slate-400 mx-auto stroke-1" />
          <h4 className="text-sm font-semibold text-slate-700 mt-2">No documents uploaded yet</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Mandatory documents (Identity Proof, Appointment Order, Highest Degree) must be uploaded prior to final submission.
          </p>
          {!isLocked && (
            <button
              onClick={openUploadModal}
              className="mt-3 px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700"
            >
              Upload First Document
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-slate-800 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-3">Document Title & ID</th>
                <th className="px-3.5 py-3">Category</th>
                <th className="px-3.5 py-3">File Name & Size</th>
                <th className="px-3.5 py-3">Uploaded On</th>
                <th className="px-3.5 py-3 text-center">Status</th>
                <th className="px-3.5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3.5 py-3">
                    <div className="font-bold text-slate-900">{doc.document_title}</div>
                    <span className="text-[10px] font-mono text-slate-500">{doc.doc_uuid}</span>
                  </td>
                  <td className="px-3.5 py-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border">
                      {doc.document_category}
                    </span>
                  </td>
                  <td className="px-3.5 py-3">
                    <div className="font-medium text-slate-800 truncate max-w-xs">{doc.original_filename}</div>
                    <div className="text-[10px] text-slate-400">{(doc.file_size / (1024 * 1024)).toFixed(2)} MB</div>
                  </td>
                  <td className="px-3.5 py-3 text-slate-600 text-[11px]">
                    {new Date(doc.upload_timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-3.5 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      doc.verification_status === 'Verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : doc.verification_status === 'Correction Required'
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}>
                      {doc.verification_status === 'Verified' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-600" />
                      )}
                      {doc.verification_status || 'Pending'}
                    </span>
                    {doc.remarks && (
                      <div className="text-[10px] text-slate-500 mt-0.5 italic max-w-xs truncate">
                        "{doc.remarks}"
                      </div>
                    )}
                  </td>
                  <td className="px-3.5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </button>
                      {!isLocked && (
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-600" />
                Upload Statutory Document
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.document_category}
                  onChange={e => setForm({ ...form, document_category: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  required
                >
                  <option value="">Select Document Category...</option>
                  <option value="Identity">Identity & Address Proof (Voter ID, Passport, DL)</option>
                  <option value="Educational">Educational Degree / Transcript / Marks Memo</option>
                  <option value="Professional">Professional Qualification / NET / Council License</option>
                  <option value="Employment">Appointment Order / Joining Report / Relieving Letter</option>
                  <option value="Service">Service Book Extract / Promotion Order</option>
                  <option value="Other">Other Approved Establishment Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.document_title}
                  onChange={e => setForm({ ...form, document_title: e.target.value })}
                  placeholder="e.g. Ph.D. Convocation Degree Certificate"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    value={form.issuing_authority}
                    onChange={e => setForm({ ...form, issuing_authority: e.target.value })}
                    placeholder="e.g. Osmania University / Registrar CDU"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={form.issue_date}
                    onChange={e => setForm({ ...form, issue_date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Document File (PDF, JPG, PNG, WebP) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={e => setSelectedFile(e.target.files[0])}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-slate-50"
                  required
                />
                <span className="text-[10px] text-slate-500 block mt-1">Maximum permitted file size: 5 MB</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow"
                >
                  {uploading ? 'Uploading...' : 'Upload & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline Document Preview Modal */}
      {previewDoc && (
        <DocumentViewerModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
