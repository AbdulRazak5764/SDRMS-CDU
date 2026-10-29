import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle2, FileText, Award, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Section6Research({
  publications = [],
  projects = [],
  patents = [],
  academicContributions = [],
  onRefreshData,
  isLocked
}) {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('pubs');
  const [isNotApplicable, setIsNotApplicable] = useState(false);

  // Modals state
  const [showPubModal, setShowPubModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);
  const [showPatentModal, setShowPatentModal] = useState(false);
  const [showContribModal, setShowContribModal] = useState(false);

  // Forms
  const [pubForm, setPubForm] = useState({
    title: '', authors: '', journal_or_conf_name: '', publication_year: 2024,
    volume: '', issue: '', page_numbers: '', doi: '', indexing: 'Scopus, Web of Science', url: ''
  });

  const [projForm, setProjForm] = useState({
    title: '', funding_agency: 'DST-SERB', role: 'Principal Investigator',
    sanctioned_amount: 1500000, duration: '3 Years', status: 'Ongoing'
  });

  const [patentForm, setPatentForm] = useState({
    title: '', application_number: '', filing_date: '', grant_number: '',
    grant_date: '', applicant_inventors: '', status: 'Filed'
  });

  const [contribForm, setContribForm] = useState({
    category: 'Book / Book Chapter', title_or_activity: '', details: '', academic_year: '2023-2024'
  });

  // Add Publication
  const handleAddPub = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff/publication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` },
        body: JSON.stringify(pubForm)
      });
      if (!res.ok) throw new Error('Failed to record publication');
      showToast('Publication added.', 'success');
      setShowPubModal(false);
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Add Project
  const handleAddProj = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` },
        body: JSON.stringify(projForm)
      });
      if (!res.ok) throw new Error('Failed to add project');
      showToast('Research project recorded.', 'success');
      setShowProjModal(false);
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Add Patent
  const handleAddPatent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff/patent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` },
        body: JSON.stringify(patentForm)
      });
      if (!res.ok) throw new Error('Failed to add patent');
      showToast('Patent record added.', 'success');
      setShowPatentModal(false);
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Add Contribution
  const handleAddContrib = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff/academic-contrib', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` },
        body: JSON.stringify(contribForm)
      });
      if (!res.ok) throw new Error('Failed to record contribution');
      showToast('Academic contribution saved.', 'success');
      setShowContribModal(false);
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Generic Delete
  const handleDeleteItem = async (endpoint, id, label) => {
    if (!window.confirm(`Delete this ${label}?`)) return;
    try {
      const res = await fetch(`/api/staff/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('sdrms_token')}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      showToast(`${label} removed.`, 'info');
      onRefreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Not Applicable Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            Research, Projects & Academic Contributions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Indexed publications (Scopus, Web of Science), funded projects, patents, and Ph.D. supervision.
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer">
          <input
            type="checkbox"
            checked={isNotApplicable}
            onChange={(e) => setIsNotApplicable(e.target.checked)}
            className="rounded text-teal-600"
          />
          <span>Mark Section as Not Applicable (Non-Teaching Staff)</span>
        </label>
      </div>

      {isNotApplicable ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
          <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-700 mt-2">Marked as Not Applicable</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            You have marked this research section as Not Applicable for your designated employee category. You may proceed to subsequent sections.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sub Navigation Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('pubs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'pubs' ? 'bg-[#0f2942] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Publications ({publications.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'projects' ? 'bg-[#0f2942] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Funded Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('patents')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'patents' ? 'bg-[#0f2942] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Patents ({patents.length})
            </button>
            <button
              onClick={() => setActiveTab('contribs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'contribs' ? 'bg-[#0f2942] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Other Contributions & Ph.D. ({academicContributions.length})
            </button>
          </div>

          {/* Sub Tab: Publications */}
          {activeTab === 'pubs' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-700">Indexed Journal Articles & Conference Proceedings</span>
                {!isLocked && (
                  <button
                    onClick={() => setShowPubModal(true)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Publication
                  </button>
                )}
              </div>

              {publications.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-lg text-xs text-slate-500">No publications added yet.</div>
              ) : (
                <div className="space-y-2.5">
                  {publications.map(p => (
                    <div key={p.id} className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-start justify-between gap-3 hover:border-slate-300">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{p.title}</h4>
                        <div className="text-[11px] text-slate-600 mt-0.5">Authors: {p.authors}</div>
                        <div className="text-[11px] text-teal-800 font-semibold mt-1">
                          {p.journal_or_conf_name} ({p.publication_year}) • Vol: {p.volume || '—'}, Issue: {p.issue || '—'}, Pages: {p.page_numbers || '—'}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-1">
                          <span className="bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded font-medium text-teal-800">{p.indexing || 'Peer Reviewed'}</span>
                          {p.doi && <span className="font-mono">DOI: {p.doi}</span>}
                        </div>
                      </div>
                      {!isLocked && (
                        <button
                          onClick={() => handleDeleteItem('publication', p.id, 'Publication')}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub Tab: Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-700">Externally Funded / Institutional Research Projects</span>
                {!isLocked && (
                  <button
                    onClick={() => setShowProjModal(true)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                )}
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-lg text-xs text-slate-500">No funded research projects recorded.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projects.map(pr => (
                    <div key={pr.id} className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">{pr.role}</span>
                          <span className="text-[10px] font-semibold text-emerald-700">{pr.status}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-2">{pr.title}</h4>
                        <div className="text-[11px] text-slate-600 mt-1">Funding Agency: <strong className="text-slate-800">{pr.funding_agency}</strong></div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900">₹{Number(pr.sanctioned_amount || 0).toLocaleString('en-IN')}</span>
                        {!isLocked && (
                          <button onClick={() => handleDeleteItem('project', pr.id, 'Project')} className="text-slate-400 hover:text-rose-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub Tab: Patents */}
          {activeTab === 'patents' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-700">Intellectual Property & Patents (Filed / Published / Granted)</span>
                {!isLocked && (
                  <button
                    onClick={() => setShowPatentModal(true)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Patent
                  </button>
                )}
              </div>

              {patents.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-lg text-xs text-slate-500">No patents recorded.</div>
              ) : (
                <div className="space-y-2">
                  {patents.map(pat => (
                    <div key={pat.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{pat.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">App No: {pat.application_number} • Status: <span className="font-semibold text-teal-800">{pat.status}</span></div>
                      </div>
                      {!isLocked && (
                        <button onClick={() => handleDeleteItem('patent', pat.id, 'Patent')} className="text-slate-400 hover:text-rose-600 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub Tab: Contributions */}
          {activeTab === 'contribs' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-700">Books, Book Chapters, Awards & Ph.D. Supervision</span>
                {!isLocked && (
                  <button
                    onClick={() => setShowContribModal(true)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Entry
                  </button>
                )}
              </div>

              {academicContributions.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-lg text-xs text-slate-500">No other contributions recorded.</div>
              ) : (
                <div className="space-y-2">
                  {academicContributions.map(c => (
                    <div key={c.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border">{c.category}</span>
                        <div className="font-bold text-xs text-slate-900 mt-1">{c.title_or_activity}</div>
                        <div className="text-[11px] text-slate-500">{c.details} ({c.academic_year})</div>
                      </div>
                      {!isLocked && (
                        <button onClick={() => handleDeleteItem('academic-contrib', c.id, 'Contribution')} className="text-slate-400 hover:text-rose-600 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Publication */}
      {showPubModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-8">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">Add Research Publication</h3>
            <form onSubmit={handleAddPub} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Paper Title *</label>
                <input
                  type="text"
                  value={pubForm.title}
                  onChange={e => setPubForm({ ...pubForm, title: e.target.value })}
                  placeholder="Full title of publication"
                  className="w-full border rounded-lg p-2 text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Authors *</label>
                  <input
                    type="text"
                    value={pubForm.authors}
                    onChange={e => setPubForm({ ...pubForm, authors: e.target.value })}
                    placeholder="e.g. R. K. Reddy, K. V. S. Sharma"
                    className="w-full border rounded-lg p-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Publication Year *</label>
                  <input
                    type="number"
                    value={pubForm.publication_year}
                    onChange={e => setPubForm({ ...pubForm, publication_year: parseInt(e.target.value) })}
                    className="w-full border rounded-lg p-2 text-xs"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Journal / Conference Name *</label>
                <input
                  type="text"
                  value={pubForm.journal_or_conf_name}
                  onChange={e => setPubForm({ ...pubForm, journal_or_conf_name: e.target.value })}
                  placeholder="e.g. IEEE Transactions on Cloud Computing"
                  className="w-full border rounded-lg p-2 text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Volume</label>
                  <input
                    type="text"
                    value={pubForm.volume}
                    onChange={e => setPubForm({ ...pubForm, volume: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Issue</label>
                  <input
                    type="text"
                    value={pubForm.issue}
                    onChange={e => setPubForm({ ...pubForm, issue: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Pages</label>
                  <input
                    type="text"
                    value={pubForm.page_numbers}
                    onChange={e => setPubForm({ ...pubForm, page_numbers: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Indexing</label>
                  <input
                    type="text"
                    value={pubForm.indexing}
                    onChange={e => setPubForm({ ...pubForm, indexing: e.target.value })}
                    placeholder="Scopus, Web of Science, UGC-CARE"
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">DOI / URL</label>
                  <input
                    type="text"
                    value={pubForm.doi}
                    onChange={e => setPubForm({ ...pubForm, doi: e.target.value })}
                    placeholder="10.1109/..."
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowPubModal(false)} className="px-4 py-2 border rounded-lg text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold">Save Publication</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Project */}
      {showProjModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">Add Research Project</h3>
            <form onSubmit={handleAddProj} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Project Title *</label>
                <input
                  type="text"
                  value={projForm.title}
                  onChange={e => setProjForm({ ...projForm, title: e.target.value })}
                  className="w-full border rounded-lg p-2 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Funding Agency *</label>
                <input
                  type="text"
                  value={projForm.funding_agency}
                  onChange={e => setProjForm({ ...projForm, funding_agency: e.target.value })}
                  placeholder="e.g. DST, DBT, AICTE, UGC"
                  className="w-full border rounded-lg p-2 text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Sanctioned Amount (INR)</label>
                  <input
                    type="number"
                    value={projForm.sanctioned_amount}
                    onChange={e => setProjForm({ ...projForm, sanctioned_amount: parseFloat(e.target.value) })}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={projForm.duration}
                    onChange={e => setProjForm({ ...projForm, duration: e.target.value })}
                    placeholder="e.g. 3 Years"
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowProjModal(false)} className="px-4 py-2 border rounded-lg text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Patent */}
      {showPatentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">Add Patent Record</h3>
            <form onSubmit={handleAddPatent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Patent Title *</label>
                <input
                  type="text"
                  value={patentForm.title}
                  onChange={e => setPatentForm({ ...patentForm, title: e.target.value })}
                  className="w-full border rounded-lg p-2 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Application Number *</label>
                <input
                  type="text"
                  value={patentForm.application_number}
                  onChange={e => setPatentForm({ ...patentForm, application_number: e.target.value })}
                  className="w-full border rounded-lg p-2 text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Status</label>
                  <select
                    value={patentForm.status}
                    onChange={e => setPatentForm({ ...patentForm, status: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs"
                  >
                    <option value="Filed">Filed</option>
                    <option value="Published">Published</option>
                    <option value="Granted">Granted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Filing Date</label>
                  <input
                    type="date"
                    value={patentForm.filing_date}
                    onChange={e => setPatentForm({ ...patentForm, filing_date: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowPatentModal(false)} className="px-4 py-2 border rounded-lg text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold">Save Patent</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Contribution */}
      {showContribModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">Add Academic Contribution</h3>
            <form onSubmit={handleAddContrib} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Contribution Type *</label>
                <select
                  value={contribForm.category}
                  onChange={e => setContribForm({ ...contribForm, category: e.target.value })}
                  className="w-full border rounded-lg p-2 text-xs"
                >
                  <option value="Book / Book Chapter">Book / Book Chapter Authored</option>
                  <option value="Ph.D. Guidance">Ph.D. Research Scholar Supervision / Awarded</option>
                  <option value="Award / Recognition">Academic / State / National Award</option>
                  <option value="Editorial / Membership">Editorial Board / Professional Membership</option>
                  <option value="Invited Talk">Invited Lecture / Keynote Presentation</option>
                  <option value="Consultancy">Funded Industrial Consultancy</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Title / Activity *</label>
                <input
                  type="text"
                  value={contribForm.title_or_activity}
                  onChange={e => setContribForm({ ...contribForm, title_or_activity: e.target.value })}
                  className="w-full border rounded-lg p-2 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Details / Description</label>
                <textarea
                  value={contribForm.details}
                  onChange={e => setContribForm({ ...contribForm, details: e.target.value })}
                  rows={2}
                  className="w-full border rounded-lg p-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowContribModal(false)} className="px-4 py-2 border rounded-lg text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
