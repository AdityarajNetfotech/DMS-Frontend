import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Scale,
  User,
  Search,
  Eye,
  AlertTriangle,
  RefreshCw,
  Folder,
  Check,
  X
} from 'lucide-react';
import LegalLayout from '../../layout/LegalLayout';
import Pagination from '../../components/common/Pagination';
import { API_BASE_URL } from '../../config/api';

export default function LegalApprovals() {
  const { companySlug: paramSlug } = useParams();
  const storedSlug = localStorage.getItem('companySlug');
  const companySlug = paramSlug || (storedSlug && storedSlug !== 'undefined' && storedSlug !== 'null' ? storedSlug : '') || '';
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // Sort latest first (createdAt descending)
  const sortedDocuments = React.useMemo(() => {
    return [...documents].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return timeB - timeA;
    });
  }, [documents]);

  // Paginate 10 documents per page
  const paginatedDocuments = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedDocuments.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedDocuments, currentPage]);
  
  // Modal states
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [actionType, setActionType] = useState(null); // 'Approve' | 'Reject'
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const token = localStorage.getItem('accessToken');

  const fetchApprovals = async () => {
    const effectiveSlug = companySlug || 'default';
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/${effectiveSlug}/manager/approvals?status=${activeTab}&search=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Legal Officer only evaluates documents in Legal folders
        const legalDocs = data.data.filter(doc => doc.folderId?.folderCategory === 'Legal');
        setDocuments(legalDocs);
      }
    } catch (err) {
      console.error('Failed to load legal approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const effectiveSlug = companySlug || 'default';
    try {
      const res = await fetch(`${API_BASE_URL}/api/${effectiveSlug}/manager/approvals/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setStats({
          pendingCount: data.data.pendingAction ?? data.data.pendingCount ?? data.data.myPendingActionCount ?? 0,
          approvedCount: data.data.approved ?? data.data.approvedCount ?? 0,
          rejectedCount: data.data.rejected ?? data.data.rejectedCount ?? 0,
          total: data.data.total ?? data.data.totalCount ?? 0
        });
      }
    } catch (err) {
      console.error('Failed to load legal approval stats:', err);
    }
  };

  useEffect(() => {
    fetchApprovals();
    fetchStats();
  }, [companySlug, activeTab, searchTerm]);

  const handleOpenDecisionModal = (doc, type) => {
    setSelectedDoc(doc);
    setActionType(type);
    setComments(type === 'Approve' ? 'Legal review verified and approved.' : '');
    setActionError('');
  };

  const handleCloseModal = () => {
    setSelectedDoc(null);
    setActionType(null);
    setComments('');
    setActionError('');
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoc || !actionType) return;

    if (actionType === 'Reject' && (!comments || comments.trim() === '')) {
      setActionError('Please provide a legal remark or reason for rejection.');
      return;
    }

    setActionLoading(true);
    setActionError('');

    try {
      const effectiveSlug = companySlug || 'default';
      const res = await fetch(`${API_BASE_URL}/api/${effectiveSlug}/manager/approvals/${selectedDoc._id}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: actionType,
          comments: comments.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        handleCloseModal();
        fetchApprovals();
        fetchStats();
        window.dispatchEvent(new Event('approvals-update'));
      } else {
        throw new Error(data.message || 'Failed to submit legal decision');
      }
    } catch (err) {
      setActionError(err.message || 'Error processing legal decision');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (doc) => {
    const status = doc.approvalStatus;
    if (status === 'Approved') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={13} className="text-emerald-600" /> Approved
        </span>
      );
    }
    if (status === 'Rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200" title={doc.rejectionReason}>
          <XCircle size={13} className="text-rose-600" /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 border border-purple-200">
        <Clock size={13} className="text-purple-600" /> Awaiting Legal Approval
      </span>
    );
  };

  const canCurrentUserApprove = (doc) => {
    const wf = doc.approvalWorkflow;
    if (!wf || doc.approvalStatus === 'Approved' || doc.approvalStatus === 'Rejected') return false;
    return wf.requiresLegal && wf.legalApproval?.status === 'Pending';
  };

  return (
    <LegalLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                <Scale size={22} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Legal Document Approvals
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Dual Maker-Checker verification for contracts, agreements, and legal documentation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchApprovals(); fetchStats(); }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-purple-400 hover:text-purple-600 cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-purple-600" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Summary Cards (3 Cards: Awaiting Action, Approved, Rejected) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <button
            onClick={() => setActiveTab('pending')}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20'
                : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Awaiting Action</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{stats.pendingCount}</div>
            <p className="mt-1 text-[11px] text-purple-600 font-medium">Pending legal review</p>
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Approved</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-700">{stats.approvedCount}</div>
            <p className="mt-1 text-[11px] text-emerald-600 font-medium">Legally verified & signed off</p>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20'
                : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Rejected</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle size={16} />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-rose-700">{stats.rejectedCount}</div>
            <p className="mt-1 text-[11px] text-rose-600 font-medium">Returned with legal remarks</p>
          </button>

        </div>

        {/* Filter Toolbar & Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            
            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setActiveTab('pending')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'pending' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({stats.pendingCount})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'approved' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Approved ({stats.approvedCount})
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'rejected' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rejected ({stats.rejectedCount})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All History
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search legal documents..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-purple-500 transition"
              />
            </div>

          </div>
        </div>

        {/* Documents Queue List */}
        <div className="space-y-3.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-16 text-slate-400">
              <RefreshCw size={28} className="animate-spin text-purple-600 mb-2.5" />
              <p className="text-xs font-semibold text-slate-600">Loading legal queue...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mb-3">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Legal Documents in This Queue</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                All legal submissions have been processed or no files match your search.
              </p>
            </div>
          ) : (
            paginatedDocuments.map((doc) => {
              const wf = doc.approvalWorkflow || {};
              const eligible = canCurrentUserApprove(doc);

              return (
                <div
                  key={doc._id}
                  className={`rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md ${
                    eligible ? 'border-purple-300 ring-2 ring-purple-400/20' : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    
                    {/* Document Info */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 font-bold shadow-xs">
                        <Scale size={24} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                            {doc.name || doc.originalFileName}
                          </h3>
                          {getStatusBadge(doc)}
                          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                            <Scale size={12} /> Legal Document
                          </span>
                        </div>
                        
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1 text-slate-600">
                            <User size={13} className="text-slate-400" />
                            Submitted By: <strong className="text-slate-800">{doc.uploadedBy?.name || 'Manager'}</strong>
                          </span>
                          <span>•</span>
                          <span>Date: {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'}</span>
                          {doc.customerName && (
                            <>
                              <span>•</span>
                              <span>Party: <strong className="text-slate-700">{doc.customerName}</strong></span>
                            </>
                          )}
                        </div>

                        {/* Rejection Remarks */}
                        {doc.approvalStatus === 'Rejected' && doc.rejectionReason && (
                          <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-800 border border-rose-200">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-rose-600" />
                            <div>
                              <strong>Rejection Reason:</strong> {doc.rejectionReason}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stepper Status Pills & Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                      
                      {/* Stepper Pills */}
                      <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 border border-slate-200/80 text-[11px] flex-wrap">
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold ${
                          wf.legalApproval?.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          wf.legalApproval?.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          <Scale size={12} />
                          Legal Review: {wf.legalApproval?.status || 'Pending'}
                        </div>

                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold ${
                          wf.reportingApproval?.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          wf.reportingApproval?.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          <User size={12} />
                          Reporting Sign-Off: {wf.reportingApproval?.status || 'Pending'}
                        </div>
                      </div>

                      {/* Preview Button */}
                      <button
                        onClick={() => {
                          const effectiveSlug = companySlug || 'default';
                          window.open(`${API_BASE_URL}/api/${effectiveSlug}/manager/documents/${doc._id}/preview?token=${token}`, '_blank');
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-purple-600 hover:border-purple-300 transition cursor-pointer shadow-xs"
                        title="Preview Legal Document"
                      >
                        <Eye size={14} /> Preview
                      </button>

                      {/* Decision Action Buttons */}
                      {eligible && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenDecisionModal(doc, 'Approve')}
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition cursor-pointer"
                          >
                            <Check size={14} /> Approve Legal
                          </button>
                          <button
                            onClick={() => handleOpenDecisionModal(doc, 'Reject')}
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm transition cursor-pointer"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      )}

                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {sortedDocuments.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <Pagination
              currentPage={currentPage}
              totalItems={sortedDocuments.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemName="legal documents"
            />
          </div>
        )}

        {/* Decision Modal */}
        {selectedDoc && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 overflow-hidden">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                    actionType === 'Approve' ? 'bg-emerald-600 shadow-md shadow-emerald-500/20' : 'bg-rose-600 shadow-md shadow-rose-500/20'
                  }`}>
                    {actionType === 'Approve' ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {actionType === 'Approve' ? 'Confirm Legal Approval' : 'Reject Legal Document'}
                    </h3>
                    <p className="text-xs text-slate-500">Record legal officer sign-off decision.</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDecisionSubmit} className="mt-5 space-y-4">
                
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Document:</span>
                    <strong className="text-slate-800 truncate max-w-[260px]">{selectedDoc.name || selectedDoc.originalFileName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Folder Category:</span>
                    <strong className="text-purple-700">Legal Documents</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Uploaded By:</span>
                    <strong className="text-slate-800">{selectedDoc.uploadedBy?.name || 'Manager'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Acting Role:</span>
                    <strong className="text-purple-600">Legal Team</strong>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    {actionType === 'Approve' ? 'Legal Approval Remarks (Optional)' : 'Rejection Reason (Mandatory)'}
                  </label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder={actionType === 'Approve' ? 'e.g. Legal covenants and contract clauses verified.' : 'e.g. Missing indemnity clause.'}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium outline-none focus:border-purple-500 focus:bg-white bg-slate-50 transition"
                    required={actionType === 'Reject'}
                  />
                </div>

                {actionError && (
                  <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 font-semibold">
                    {actionError}
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer ${
                      actionType === 'Approve'
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                        : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                    } disabled:opacity-50`}
                  >
                    {actionLoading ? 'Processing...' : actionType === 'Approve' ? 'Confirm Legal Approval' : 'Confirm Rejection'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </LegalLayout>
  );
}
