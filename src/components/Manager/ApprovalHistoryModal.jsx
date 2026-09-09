import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  FileText,
  Folder,
  MessageSquare,
  Eye,
  Hash,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function ApprovalHistoryModal({ isOpen, onClose, document, companySlug }) {
  const [docDetails, setDocDetails] = useState(document);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !document?._id) return;
    
    setDocDetails(document);

    const fetchLatestDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/documents/${document._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success && data.data?.document) {
          setDocDetails(data.data.document);
        }
      } catch (err) {
        console.error('Failed to fetch detailed document approval history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestDetails();
  }, [isOpen, document, companySlug]);

  if (!isOpen || !docDetails) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const workflow = docDetails.approvalWorkflow || {};
  const reportingApp = workflow.reportingApproval || {};
  const legalApp = workflow.legalApproval || {};
  const complianceApp = workflow.complianceApproval || {};

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={14} className="text-emerald-600" /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
            <XCircle size={14} className="text-rose-600" /> Rejected
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <Clock size={14} className="text-amber-600 animate-pulse" /> Pending Review
          </span>
        );
      case 'Not_Required':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 border border-slate-200">
            Not Required
          </span>
        );
    }
  };

  const handlePreview = () => {
    const token = localStorage.getItem('accessToken');
    window.open(`${API_BASE_URL}/api/${companySlug}/manager/documents/${docDetails._id}/preview?token=${token}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50/80">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Approval & Audit History
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Maker-Checker verification timeline and reviewer decisions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Document Quick Info Card */}
        <div className="p-6 pb-4 border-b border-slate-100 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 font-bold text-xs uppercase">
                {docDetails.extension || 'DOC'}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate" title={docDetails.name}>
                  {docDetails.name}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <User size={13} className="text-slate-400" />
                    Uploaded by: <strong className="text-slate-700">{docDetails.uploadedBy?.name || 'Manager'}</strong>
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(docDetails.fileSize)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-slate-400" />
                    {formatDate(docDetails.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={handlePreview}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition"
              >
                <Eye size={14} /> View File
              </button>
            </div>
          </div>

          {/* Overall Status Banner */}
          <div className="mt-4">
            {docDetails.approvalStatus === 'Approved' ? (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-emerald-900">Fully Approved Document</h5>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    All required maker-checker validations have been successfully completed.
                  </p>
                </div>
              </div>
            ) : docDetails.approvalStatus === 'Rejected' ? (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-900">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white font-bold mt-0.5">
                  <XCircle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-rose-900">Document Rejected</h5>
                    <span className="text-[11px] font-semibold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded">Action Required</span>
                  </div>
                  {docDetails.rejectionReason && (
                    <div className="mt-2 p-2.5 rounded-lg bg-white/80 border border-rose-200 text-xs text-rose-800 font-medium">
                      <span className="font-bold text-rose-900">Rejection Reason / Notes: </span>
                      {docDetails.rejectionReason}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-600 text-white font-bold">
                  <Clock size={18} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-amber-900">
                    {docDetails.approvalStatus === 'Pending_Dual_Approval'
                      ? 'Awaiting Dual Approval (Reporting Manager + Specialized Officer)'
                      : docDetails.approvalStatus === 'Pending_Legal_Approval'
                      ? 'Awaiting Legal Team Approval'
                      : docDetails.approvalStatus === 'Pending_Compliance_Approval'
                      ? 'Awaiting Compliance Team Approval'
                      : 'Awaiting Reporting Manager Approval'}
                  </h5>
                  <p className="text-xs text-amber-700 mt-0.5">
                    This document is currently in review queue and awaiting decision by designated officers.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline Body */}
        <div className="p-6 max-h-[420px] overflow-y-auto space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Maker-Checker Verification Workflow
          </h4>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            
            {/* Step 1: Upload & Submission */}
            <div className="relative group">
              <div className="absolute -left-6 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white ring-4 ring-white shadow-sm">
                <FileText size={12} />
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm hover:border-slate-300 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    1. Document Ingested & Uploaded
                  </span>
                  <span className="text-xs text-slate-500">{formatDate(docDetails.createdAt)}</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    Uploaded by <strong className="text-slate-800">{docDetails.uploadedBy?.name || 'Manager'}</strong>
                    {docDetails.uploadedBy?.email && <span className="text-slate-400"> ({docDetails.uploadedBy.email})</span>}
                  </p>
                  <p className="text-slate-500">
                    Source: <span className="font-medium text-slate-700">{docDetails.ingestionSource || 'Web Portal'}</span>
                    {docDetails.fileHash && (
                      <span className="ml-2 inline-flex items-center gap-1 font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                        <Hash size={10} /> {docDetails.fileHash.slice(0, 12)}...
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Reporting Manager Review */}
            <div className="relative group">
              <div className={`absolute -left-6 top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-white ring-4 ring-white shadow-sm ${
                reportingApp.status === 'Approved' ? 'bg-emerald-600' :
                reportingApp.status === 'Rejected' ? 'bg-rose-600' :
                'bg-amber-500'
              }`}>
                {reportingApp.status === 'Approved' ? <CheckCircle2 size={13} /> :
                 reportingApp.status === 'Rejected' ? <XCircle size={13} /> :
                 <Clock size={13} />}
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm hover:border-slate-300 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      2. Reporting Manager Review
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold border border-blue-100">
                      Primary Reviewer
                    </span>
                  </div>
                  <div>{getStatusBadge(reportingApp.status || (docDetails.approvalStatus === 'Approved' ? 'Approved' : 'Pending'))}</div>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5">
                  {reportingApp.approvedBy ? (
                    <p>
                      Decided by: <strong className="text-slate-800">{reportingApp.approvedBy.name}</strong>
                      {reportingApp.approvedBy.email && <span className="text-slate-400"> ({reportingApp.approvedBy.email})</span>}
                    </p>
                  ) : reportingApp.status === 'Approved' || reportingApp.status === 'Rejected' ? (
                    <p className="text-slate-500 italic">Decision recorded</p>
                  ) : (
                    <p className="text-amber-700 font-medium">Awaiting decision by assigned Reporting Manager</p>
                  )}

                  {reportingApp.approvedAt && (
                    <p className="text-slate-500 flex items-center gap-1">
                      <Calendar size={12} className="text-slate-400" />
                      Date of Decision: <strong className="text-slate-700">{formatDate(reportingApp.approvedAt)}</strong>
                    </p>
                  )}

                  {reportingApp.comments && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mb-0.5">
                        <MessageSquare size={12} /> Remarks & Notes:
                      </div>
                      <p className="italic">{reportingApp.comments}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Legal Team Review (If Applicable) */}
            {(workflow.requiresLegal || legalApp.status !== 'Not_Required') && (
              <div className="relative group">
                <div className={`absolute -left-6 top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-white ring-4 ring-white shadow-sm ${
                  legalApp.status === 'Approved' ? 'bg-emerald-600' :
                  legalApp.status === 'Rejected' ? 'bg-rose-600' :
                  legalApp.status === 'Pending' ? 'bg-amber-500' :
                  'bg-slate-400'
                }`}>
                  {legalApp.status === 'Approved' ? <CheckCircle2 size={13} /> :
                   legalApp.status === 'Rejected' ? <XCircle size={13} /> :
                   legalApp.status === 'Pending' ? <Clock size={13} /> :
                   <Shield size={13} />}
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm hover:border-slate-300 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        3. Legal Team Review
                      </span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold border border-indigo-100">
                        Legal Officer
                      </span>
                    </div>
                    <div>{getStatusBadge(legalApp.status || 'Not_Required')}</div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1.5">
                    {legalApp.approvedBy ? (
                      <p>
                        Decided by: <strong className="text-slate-800">{legalApp.approvedBy.name}</strong>
                        {legalApp.approvedBy.email && <span className="text-slate-400"> ({legalApp.approvedBy.email})</span>}
                      </p>
                    ) : legalApp.status === 'Pending' ? (
                      <p className="text-amber-700 font-medium">Awaiting decision by Legal Officer</p>
                    ) : (
                      <p className="text-slate-500 italic">Not required or automatically waived</p>
                    )}

                    {legalApp.approvedAt && (
                      <p className="text-slate-500 flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        Date of Decision: <strong className="text-slate-700">{formatDate(legalApp.approvedAt)}</strong>
                      </p>
                    )}

                    {legalApp.comments && (
                      <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mb-0.5">
                          <MessageSquare size={12} /> Legal Notes:
                        </div>
                        <p className="italic">{legalApp.comments}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Compliance Team Review (If Applicable) */}
            {(workflow.requiresCompliance || complianceApp.status !== 'Not_Required') && (
              <div className="relative group">
                <div className={`absolute -left-6 top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-white ring-4 ring-white shadow-sm ${
                  complianceApp.status === 'Approved' ? 'bg-emerald-600' :
                  complianceApp.status === 'Rejected' ? 'bg-rose-600' :
                  complianceApp.status === 'Pending' ? 'bg-amber-500' :
                  'bg-slate-400'
                }`}>
                  {complianceApp.status === 'Approved' ? <CheckCircle2 size={13} /> :
                   complianceApp.status === 'Rejected' ? <XCircle size={13} /> :
                   complianceApp.status === 'Pending' ? <Clock size={13} /> :
                   <Shield size={13} />}
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm hover:border-slate-300 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {workflow.requiresLegal ? '4' : '3'}. Compliance Team Review
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-100">
                        Compliance Officer
                      </span>
                    </div>
                    <div>{getStatusBadge(complianceApp.status || 'Not_Required')}</div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1.5">
                    {complianceApp.approvedBy ? (
                      <p>
                        Decided by: <strong className="text-slate-800">{complianceApp.approvedBy.name}</strong>
                        {complianceApp.approvedBy.email && <span className="text-slate-400"> ({complianceApp.approvedBy.email})</span>}
                      </p>
                    ) : complianceApp.status === 'Pending' ? (
                      <p className="text-amber-700 font-medium">Awaiting decision by Compliance Officer</p>
                    ) : (
                      <p className="text-slate-500 italic">Not required or automatically waived</p>
                    )}

                    {complianceApp.approvedAt && (
                      <p className="text-slate-500 flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        Date of Decision: <strong className="text-slate-700">{formatDate(complianceApp.approvedAt)}</strong>
                      </p>
                    )}

                    {complianceApp.comments && (
                      <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mb-0.5">
                          <MessageSquare size={12} /> Compliance Notes:
                        </div>
                        <p className="italic">{complianceApp.comments}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>Bank-Grade Maker-Checker Audit Trail</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
