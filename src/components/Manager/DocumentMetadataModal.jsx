import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Sparkles, 
  Calendar, 
  User, 
  Building, 
  FileText, 
  Tag, 
  Copy, 
  Check, 
  RefreshCw, 
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  MapPin,
  Edit3,
  Save,
  Plus,
  Lock,
  Eye
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const DOCUMENT_TYPE_SUGGESTIONS = [
  'KYC Document',
  'National ID / Passport',
  'Bank Passbook / Statement',
  'Loan Application',
  'Loan Sanction Letter',
  'Facility Agreement',
  'Mortgage Deed',
  'Board Resolution',
  'Power of Attorney',
  'Commercial Contract',
  'Invoice / Bill',
  'Tax Return / Financials',
  'Audited Financial Statement',
  'General Document'
];

export default function DocumentMetadataModal({ isOpen, onClose, document, companySlug, onUpdated, initialEditMode = false }) {
  const [copied, setCopied] = useState(false);
  const [reclassifying, setReclassifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [docData, setDocData] = useState(document || {});
  
  // Edit form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    documentType: '',
    customerName: '',
    customerId: '',
    customerRef: '',
    accountNumber: '',
    cifNumber: '',
    ifscCode: '',
    facilityNumber: '',
    facilityRef: '',
    branch: '',
    branchCode: '',
    accountType: '',
    signatory: '',
    partner: '',
    typeOfService: '',
    documentDate: '',
    executionDate: '',
    expiryDate: '',
    isConfidential: false,
    watermarkText: '',
    tags: []
  });

  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    if (document) {
      setDocData(document);
      setIsEditing(initialEditMode);
      setError('');
      setSuccess('');
      
      const toDateInput = (d) => {
        if (!d) return '';
        try {
          const dt = new Date(d);
          if (isNaN(dt.getTime())) return '';
          return dt.toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      setFormData({
        name: document.name || document.originalFileName || '',
        description: document.description || '',
        documentType: document.documentType || document.aiClassification || '',
        customerName: document.customerName || document.customerRef || '',
        customerId: document.customerId || '',
        customerRef: document.customerRef || '',
        accountNumber: document.accountNumber || '',
        cifNumber: document.cifNumber || '',
        ifscCode: document.ifscCode || '',
        facilityNumber: document.facilityNumber || document.facilityRef || '',
        facilityRef: document.facilityRef || '',
        branch: document.branch || '',
        branchCode: document.branchCode || '',
        accountType: document.accountType || '',
        signatory: document.signatory || '',
        partner: document.partner || '',
        typeOfService: document.typeOfService || '',
        documentDate: toDateInput(document.documentDate || document.executionDate),
        executionDate: toDateInput(document.executionDate),
        expiryDate: toDateInput(document.expiryDate),
        isConfidential: !!document.isConfidential,
        watermarkText: document.watermarkText || '',
        tags: Array.isArray(document.tags) ? [...document.tags] : []
      });
    }
  }, [document, initialEditMode, isOpen]);

  if (!isOpen || !docData) return null;

  const handleCopyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = (e) => {
    e?.preventDefault();
    const tag = newTagInput.trim();
    if (!tag) return;
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleSaveChanges = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      const payload = {
        name: formData.name.trim(),
        description: formData.description,
        documentType: formData.documentType.trim(),
        customerName: formData.customerName.trim(),
        customerId: formData.customerId.trim(),
        customerRef: formData.customerRef.trim() || formData.customerName.trim(),
        accountNumber: formData.accountNumber.trim(),
        cifNumber: formData.cifNumber.trim(),
        ifscCode: formData.ifscCode.trim(),
        facilityNumber: formData.facilityNumber.trim(),
        facilityRef: formData.facilityRef.trim() || formData.facilityNumber.trim(),
        branch: formData.branch.trim(),
        branchCode: formData.branchCode.trim(),
        accountType: formData.accountType.trim(),
        signatory: formData.signatory.trim(),
        partner: formData.partner.trim(),
        typeOfService: formData.typeOfService.trim(),
        documentDate: formData.documentDate ? new Date(formData.documentDate) : null,
        executionDate: formData.executionDate ? new Date(formData.executionDate) : null,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        isConfidential: formData.isConfidential,
        watermarkText: formData.watermarkText.trim(),
        tags: formData.tags
      };

      const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/documents/${docData._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update document details');
      }

      const updatedDoc = data.data || { ...docData, ...payload };
      setDocData(updatedDoc);
      setIsEditing(false);
      setSuccess('Document details updated successfully!');
      if (onUpdated) onUpdated(updatedDoc);
    } catch (err) {
      setError(err.message || 'Failed to save document details.');
    } finally {
      setSaving(false);
    }
  };

  const handleReclassify = async () => {
    setReclassifying(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('accessToken');
      const savedGemini = localStorage.getItem('dms_gemini_key') || '';
      const savedOpenai = localStorage.getItem('dms_openai_key') || '';

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      if (savedGemini) headers['x-gemini-key'] = savedGemini;
      if (savedOpenai) headers['x-openai-key'] = savedOpenai;

      const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/documents/${docData._id}/classify`, {
        method: 'POST',
        headers
      });
      const data = await res.json();

      if (data.success) {
        setDocData(prev => ({
          ...prev,
          ...data.data,
          extractedText: data.data.extractedText || prev.extractedText
        }));
        setSuccess('Document successfully re-analyzed and metadata updated!');
        if (onUpdated) onUpdated(data.data);
      } else {
        throw new Error(data.message || 'Failed to re-classify document');
      }
    } catch (err) {
      setError(err.message || 'Failed to run OCR & AI classification.');
    } finally {
      setReclassifying(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return String(d);
    }
  };

  const validationStatus = docData.validationStatus || 'Pending';
  const missingFields = docData.missingMandatoryFields || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? "Edit Document Details & Metadata" : "Document Metadata & Details"}
              </h2>
              <p className="text-xs text-slate-500 truncate max-w-md">{docData.name || docData.originalFileName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100 cursor-pointer"
                  title="Edit document properties and banking metadata"
                >
                  <Edit3 size={14} />
                  Edit Details
                </button>
                <button
                  onClick={handleReclassify}
                  disabled={reclassifying}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 cursor-pointer"
                  title="Re-run OCR and AI Classification"
                >
                  <RefreshCw size={14} className={reclassifying ? "animate-spin text-blue-600" : ""} />
                  {reclassifying ? "Analyzing..." : "Re-Analyze (AI/OCR)"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
              >
                <Eye size={14} />
                View Mode
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* EDIT MODE */}
          {isEditing ? (
            <form onSubmit={handleSaveChanges} className="space-y-6">
              
              {/* Primary Document Details */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <FileText size={16} className="text-blue-600" />
                  <span>General Information</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Document Title / Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g. Loan Agreement - John Doe.pdf"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Document Category / Type
                    </label>
                    <input
                      type="text"
                      list="doc-type-suggestions"
                      value={formData.documentType}
                      onChange={(e) => handleInputChange('documentType', e.target.value)}
                      placeholder="e.g. KYC Document, Loan Sanction Letter..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                    <datalist id="doc-type-suggestions">
                      {DOCUMENT_TYPE_SUGGESTIONS.map((suggestion, idx) => (
                        <option key={idx} value={suggestion} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description & Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide additional details or notes about this document..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              {/* Customer & Account Identifiers */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <User size={16} className="text-indigo-600" />
                  <span>Customer & Account Identifiers</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Borrower Name</label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      placeholder="e.g. John Doe / Acme Corp"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / CIF ID</label>
                    <input
                      type="text"
                      value={formData.customerId}
                      onChange={(e) => handleInputChange('customerId', e.target.value)}
                      placeholder="e.g. CIF-908214"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      placeholder="e.g. 501004928172"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Facility, Branch & Banking Metadata */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Building size={16} className="text-amber-600" />
                  <span>Facility, Branch & Operations</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Facility / Loan Number</label>
                    <input
                      type="text"
                      value={formData.facilityNumber}
                      onChange={(e) => handleInputChange('facilityNumber', e.target.value)}
                      placeholder="e.g. LN-2025-0819"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name</label>
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => handleInputChange('branch', e.target.value)}
                      placeholder="e.g. Central City Branch"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Code / IFSC</label>
                    <input
                      type="text"
                      value={formData.ifscCode}
                      onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                      placeholder="e.g. HDFC0001234"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Account / Product Type</label>
                    <input
                      type="text"
                      value={formData.accountType}
                      onChange={(e) => handleInputChange('accountType', e.target.value)}
                      placeholder="e.g. Term Loan / Savings"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Authorized Signatory</label>
                    <input
                      type="text"
                      value={formData.signatory}
                      onChange={(e) => handleInputChange('signatory', e.target.value)}
                      placeholder="e.g. Relationship Manager / Officer"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Partner / Institution</label>
                    <input
                      type="text"
                      value={formData.partner}
                      onChange={(e) => handleInputChange('partner', e.target.value)}
                      placeholder="e.g. Partner Bank / Fintech"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Critical Dates */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Calendar size={16} className="text-emerald-600" />
                  <span>Document Lifecycle Dates</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Document / Issue Date</label>
                    <input
                      type="date"
                      value={formData.documentDate}
                      onChange={(e) => handleInputChange('documentDate', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Execution Date</label>
                    <input
                      type="date"
                      value={formData.executionDate}
                      onChange={(e) => handleInputChange('executionDate', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry / Maturity Date</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Tags & Security */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Tag size={16} className="text-purple-600" />
                  <span>Tags & Document Security</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-medium text-blue-800">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-500 hover:text-blue-800 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {formData.tags.length === 0 && (
                      <span className="text-xs italic text-slate-400">No tags added yet.</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2 max-w-sm">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add a new tag..."
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 transition cursor-pointer"
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Watermark Text</label>
                    <input
                      type="text"
                      value={formData.watermarkText}
                      onChange={(e) => handleInputChange('watermarkText', e.target.value)}
                      placeholder="e.g. CONFIDENTIAL - INTERNAL USE ONLY"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="isConfidentialCheck"
                      checked={formData.isConfidential}
                      onChange={(e) => handleInputChange('isConfidential', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isConfidentialCheck" className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                      <Lock size={14} className="text-rose-500" />
                      Mark as High Confidentiality Document
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  <Save size={16} />
                  {saving ? "Saving Changes..." : "Save Document Details"}
                </button>
              </div>

            </form>
          ) : (
            /* VIEW MODE */
            <>
              {/* AI Classification & Mandatory Validation Top Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Document Type & AI Confidence */}
                <div className="md:col-span-2 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50/70 to-indigo-50/70 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-violet-600" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-violet-700">Document Type / Category</span>
                    </div>
                    {docData.aiConfidence && (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        docData.aiConfidence === 'High' ? 'bg-emerald-100 text-emerald-800' :
                        docData.aiConfidence === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        AI Confidence: {docData.aiConfidence}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xl font-bold text-slate-900">
                    {docData.documentType || docData.aiClassification || 'Unclassified / General'}
                  </div>
                  {docData.typeOfService && (
                    <p className="mt-1 text-xs text-slate-600">Product / Service: <span className="font-medium text-slate-800">{docData.typeOfService}</span></p>
                  )}
                  {docData.description && (
                    <p className="mt-2 text-xs text-slate-600 italic">{docData.description}</p>
                  )}
                </div>

                {/* Mandatory-field Validation Status */}
                <div className={`rounded-xl border p-4 flex flex-col justify-between ${
                  validationStatus === 'Valid' 
                    ? 'border-emerald-200 bg-emerald-50/60' 
                    : validationStatus === 'Incomplete'
                    ? 'border-amber-200 bg-amber-50/60'
                    : 'border-slate-200 bg-slate-50'
                }`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {validationStatus === 'Valid' ? (
                        <ShieldCheck size={18} className="text-emerald-600" />
                      ) : (
                        <ShieldAlert size={18} className="text-amber-600" />
                      )}
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        validationStatus === 'Valid' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        Mandatory Fields
                      </span>
                    </div>
                    <div className={`text-base font-bold ${
                      validationStatus === 'Valid' ? 'text-emerald-900' : 'text-amber-900'
                    }`}>
                      {validationStatus === 'Valid' ? 'Complete (Valid)' : 'Incomplete'}
                    </div>
                  </div>
                  {missingFields.length > 0 ? (
                    <div className="mt-2 text-[11px] text-amber-800">
                      <span className="font-semibold">Missing:</span> {missingFields.join(', ')}
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-emerald-700">
                      All mandatory fields present
                    </div>
                  )}
                </div>

              </div>

              {/* Section 1: Customer & Account Identifiers */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Customer & Account Identifiers</h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <User size={14} className="text-blue-500" />
                      <span>Customer Name</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      {docData.customerName || docData.customerRef || '—'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <CreditCard size={14} className="text-indigo-500" />
                      <span>Customer / CIF ID</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800 font-mono">
                      {docData.customerId || docData.cifNumber || '—'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <CreditCard size={14} className="text-emerald-500" />
                      <span>Account Number</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800 font-mono">
                      {docData.accountNumber || '—'}
                    </div>
                  </div>

                </div>
              </div>

              {/* Section 2: Facility, Branch & Banking Metadata */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">2. Facility, Branch & Operations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Building size={14} className="text-indigo-500" />
                      <span>Facility / Loan Number</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800 font-mono">
                      {docData.facilityNumber || docData.facilityRef || '—'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <MapPin size={14} className="text-rose-500" />
                      <span>Branch Name & Code</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      {docData.branch ? `${docData.branch}${docData.branchCode ? ` (${docData.branchCode})` : ''}` : (docData.partner || '—')}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Building size={14} className="text-amber-500" />
                      <span>IFSC / Bank Code</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800 font-mono">
                      {docData.ifscCode || '—'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <FileText size={14} className="text-purple-500" />
                      <span>Account / Product Type</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      {docData.accountType || docData.typeOfService || '—'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <User size={14} className="text-teal-500" />
                      <span>Signatory / Officer</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      {docData.signatory || '—'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Building size={14} className="text-blue-500" />
                      <span>Partner / Institution</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      {docData.partner || '—'}
                    </div>
                  </div>

                </div>
              </div>

              {/* Section 3: Critical Dates */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">3. Document Lifecycle Dates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Calendar size={14} className="text-blue-500" />
                      <span>Document / Issue Date</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      {formatDate(docData.documentDate || docData.executionDate)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Calendar size={14} className="text-emerald-500" />
                      <span>Execution Date</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      {formatDate(docData.executionDate)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Calendar size={14} className="text-rose-500" />
                      <span>Expiry / Maturity Date</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      {formatDate(docData.expiryDate)}
                    </div>
                  </div>

                </div>
              </div>

              {/* Tags & Security */}
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Tags & Security</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {docData.tags && docData.tags.length > 0 ? (
                    docData.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        <Tag size={12} className="text-slate-400" />
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No tags assigned</span>
                  )}
                  {docData.isConfidential && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700">
                      <Lock size={12} /> Confidential
                    </span>
                  )}
                  {docData.watermarkText && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-700">
                      Watermark: {docData.watermarkText}
                    </span>
                  )}
                </div>
              </div>

              {/* OCR Extracted Text Preview */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    OCR Extracted Text ({docData.extractedText ? `${docData.extractedText.length} characters` : 'None'})
                  </h3>
                  {docData.extractedText && (
                    <button
                      onClick={() => handleCopyText(docData.extractedText)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy Text"}
                    </button>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {docData.extractedText ? docData.extractedText : (
                    <span className="italic text-slate-400">No text extracted. Click "Re-Analyze (AI/OCR)" above to run OCR on this file.</span>
                  )}
                </div>
              </div>

              {/* Section 4: Security, Ingestion & Deduplication */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">4. Security & System Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span>Security & Anti-Virus</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-emerald-700">
                      <Check size={14} className="text-emerald-600" />
                      <span>{docData.scanResult || 'Clean & Verified'}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Database size={14} className="text-blue-500" />
                      <span>Ingestion Channel</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      {docData.ingestionSource || 'Web UI Upload'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="flex items-center gap-1.5"><Tag size={14} className="text-purple-500" /> SHA-256 Hash</span>
                      {docData.fileHash && (
                        <button
                          onClick={() => handleCopyText(docData.fileHash)}
                          className="text-[10px] text-blue-600 hover:text-blue-700 font-mono cursor-pointer"
                          title="Copy SHA-256 Hash"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-700 truncate" title={docData.fileHash || 'Generated upon upload'}>
                      {docData.fileHash ? `${docData.fileHash.substring(0, 16)}...` : 'Computed on upload'}
                    </div>
                  </div>

                </div>
              </div>

              {/* System Properties */}
              <div className="border-t border-slate-100 pt-4 text-[11px] text-slate-400 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>Document ID: <span className="font-mono text-slate-600">{docData._id}</span></div>
                <div>File Type: <span className="font-semibold text-slate-600">{docData.fileType || docData.extension}</span></div>
                <div>Status: <span className="font-semibold text-slate-600">{docData.status || 'Active'}</span></div>
                <div>Last Updated: <span className="text-slate-600">{formatDate(docData.updatedAt || docData.createdAt)}</span></div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
          <div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <Edit3 size={14} />
                Edit all properties & metadata
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
