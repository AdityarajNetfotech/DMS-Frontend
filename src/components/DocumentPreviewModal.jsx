import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Download,
  Shield,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  Lock,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Edit3,
  Database,
  Eye,
  Save,
  Plus,
  CheckCircle2,
  Sparkles,
  Check,
  Copy,
  RefreshCw,
  User,
  Building,
  CreditCard,
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  ShieldAlert,
  PenTool,
  Fingerprint,
  Clock,
  CheckCheck,
  Stamp,
  FileCheck
} from 'lucide-react';

import { API_BASE_URL } from '../config/api';
import CloudDocumentEditor from './CloudDocumentEditor';

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

export default function DocumentPreviewModal({
  isOpen,
  onClose,
  document: initialDoc,
  companySlug,
  folderName = '',
  folderCategory = '',
  initialTab = 'preview',
  onUpdated
}) {
  const [doc, setDoc] = useState(initialDoc || {});
  const [activeTab, setActiveTab] = useState(initialTab || 'preview');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [branding, setBranding] = useState({ companyName: '', logo: '' });
  const [loading, setLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState('');
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reclassifying, setReclassifying] = useState(false);
  const [isCloudEditorOpen, setIsCloudEditorOpen] = useState(false);

  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

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

  // Synchronize doc & form data when document opens or changes
  useEffect(() => {
    if (initialDoc) {
      setDoc(initialDoc);
      const isViewerRole = (localStorage.getItem('userRole') || '').toLowerCase() === 'viewer';
      const targetTab = (isViewerRole && initialTab === 'edit') ? 'preview' : (initialTab || 'preview');
      setActiveTab(targetTab);
      setError('');
      setSaveSuccess('');
      setSaveError('');

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
        name: initialDoc.name || initialDoc.originalFileName || '',
        description: initialDoc.description || '',
        documentType: initialDoc.documentType || initialDoc.aiClassification || '',
        customerName: initialDoc.customerName || initialDoc.customerRef || '',
        customerId: initialDoc.customerId || '',
        customerRef: initialDoc.customerRef || '',
        accountNumber: initialDoc.accountNumber || '',
        cifNumber: initialDoc.cifNumber || '',
        ifscCode: initialDoc.ifscCode || '',
        facilityNumber: initialDoc.facilityNumber || initialDoc.facilityRef || '',
        facilityRef: initialDoc.facilityRef || '',
        branch: initialDoc.branch || '',
        branchCode: initialDoc.branchCode || '',
        accountType: initialDoc.accountType || '',
        signatory: initialDoc.signatory || '',
        partner: initialDoc.partner || '',
        typeOfService: initialDoc.typeOfService || '',
        documentDate: toDateInput(initialDoc.documentDate || initialDoc.executionDate),
        executionDate: toDateInput(initialDoc.executionDate),
        expiryDate: toDateInput(initialDoc.expiryDate),
        isConfidential: !!initialDoc.isConfidential,
        watermarkText: initialDoc.watermarkText || '',
        tags: Array.isArray(initialDoc.tags) ? [...initialDoc.tags] : []
      });
    }
  }, [initialDoc, initialTab, isOpen]);

  // Fetch tenant branding
  useEffect(() => {
    if (!companySlug) return;
    try {
      const cached = localStorage.getItem(`branding_${companySlug}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setBranding({
          companyName: parsed.companyName || companySlug.toUpperCase(),
          logo: parsed.logo || ''
        });
      } else {
        setBranding({ companyName: companySlug.toUpperCase(), logo: '' });
      }
    } catch {
      setBranding({ companyName: companySlug.toUpperCase(), logo: '' });
    }
  }, [companySlug]);

  const docId = doc?._id || doc?.id || '';
  const token = localStorage.getItem('accessToken') || '';
  const userRole = (localStorage.getItem('userRole') || '').toLowerCase();
  const isViewer = userRole === 'viewer';
  const canEditCloud = ['manager', 'reporting manager', 'tenant admin', 'company admin', 'admin', 'super admin'].includes(userRole);
  const service = isViewer ? 'viewer' : 'manager';
  const storedSlug = localStorage.getItem('companySlug') || localStorage.getItem('tenantSlug') || '';
  const effectiveSlug = companySlug || doc.tenantId || (storedSlug && storedSlug !== 'undefined' && storedSlug !== 'null' ? storedSlug : '') || 'default';

  const previewTimestamp = doc?.updatedAt ? new Date(doc.updatedAt).getTime() : (doc?.approvalStatus || '');
  const previewUrl = docId && effectiveSlug
    ? `${API_BASE_URL}/api/${effectiveSlug}/${service}/documents/${docId}/preview?token=${token}&_t=${previewTimestamp}`
    : '';
  const downloadUrl = docId && effectiveSlug
    ? `${API_BASE_URL}/api/${effectiveSlug}/${service}/documents/${docId}/download?token=${token}&_t=${previewTimestamp}`
    : '';

  // File extension
  const ext = useMemo(() => {
    if (!doc) return '';
    const rawExt =
      doc.extension ||
      (doc.originalFileName ? doc.originalFileName.split('.').pop() : '') ||
      (doc.name ? doc.name.split('.').pop() : '') ||
      (doc.fileType || '');
    return String(rawExt).replace('.', '').toLowerCase();
  }, [doc]);

  // Multi-party E-Signatures (Manager on upload, Reporting Manager on approval, Legal/Compliance Manager on approval)
  const displaySignatures = useMemo(() => {
    const cat = (folderCategory || doc?.folderId?.folderCategory || '').toLowerCase();
    const currentPath = typeof window !== 'undefined' ? (window.location.pathname || '') : '';
    const isLegal =
      cat === 'legal' ||
      doc?.approvalWorkflow?.requiresLegal ||
      (doc?.approvalWorkflow?.legalApproval && doc.approvalWorkflow.legalApproval.status !== 'Not_Required') ||
      /legal/i.test(folderName || '') ||
      /legal/i.test(doc?.folderId?.name || '') ||
      /legal/i.test(doc?.name || '') ||
      currentPath.includes('/legal/');

    const isCompliance =
      cat === 'compliance' ||
      doc?.approvalWorkflow?.requiresCompliance ||
      (doc?.approvalWorkflow?.complianceApproval && doc.approvalWorkflow.complianceApproval.status !== 'Not_Required') ||
      /compliance/i.test(folderName || '') ||
      /compliance/i.test(doc?.folderId?.name || '') ||
      /compliance/i.test(doc?.name || '') ||
      currentPath.includes('/compliance/');

    const repApproval = doc?.approvalWorkflow?.reportingApproval;
    const legApproval = doc?.approvalWorkflow?.legalApproval;
    const compApproval = doc?.approvalWorkflow?.complianceApproval;

    if (Array.isArray(doc?.signatures) && doc.signatures.length > 0) {
      const mapped = doc.signatures.map(sig => {
        let sigData = sig.signature || '';
        let sType = sig.signatureType || '';
        let sFont = sig.signatureFont || 'Great Vibes';
        let sInitials = sig.signatureInitials || '';
        let isSlotSigned = sig.status === 'Signed';
        let sName = sig.signerName || '';
        let sEmail = sig.signerEmail || '';
        let sDate = sig.signedAt || null;
        let sComments = sig.comments || '';

        const slotLower = (sig.slot || '').toLowerCase();
        const roleLower = (sig.role || '').toLowerCase();

        // 1. Manager (Uploader) Slot
        if (slotLower.includes('uploader') || slotLower.includes('manager (uploader)') || (roleLower === 'manager' && !slotLower.includes('reporting'))) {
          if (!sigData && doc?.uploadedBy?.signature) {
            sigData = doc.uploadedBy.signature;
            sType = doc.uploadedBy.signatureType || sType;
            sFont = doc.uploadedBy.signatureFont || sFont;
            sInitials = doc.uploadedBy.signatureInitials || sInitials;
          }
          if (!sigData && localStorage.getItem('userSignature')) {
            sigData = localStorage.getItem('userSignature') || '';
            sType = localStorage.getItem('userSignatureType') || sType;
          }
        }

        // 2. Reporting Manager Slot
        if (slotLower.includes('reporting') || roleLower.includes('reporting')) {
          if (repApproval && (repApproval.status === 'Approved' || isSlotSigned)) {
            isSlotSigned = true;
            sName = repApproval.approvedBy?.name || sName;
            sEmail = repApproval.approvedBy?.email || sEmail;
            sDate = repApproval.approvedAt || sDate || new Date();
            sComments = repApproval.comments || sComments;
            if (!sigData && repApproval.approvedBy?.signature) {
              sigData = repApproval.approvedBy.signature;
              sType = repApproval.approvedBy.signatureType || sType;
              sFont = repApproval.approvedBy.signatureFont || sFont;
              sInitials = repApproval.approvedBy.signatureInitials || sInitials;
            }
          }
        }

        // 3. Legal Manager Slot
        if (slotLower.includes('legal') || roleLower.includes('legal')) {
          if (legApproval && (legApproval.status === 'Approved' || isSlotSigned)) {
            isSlotSigned = true;
            sName = legApproval.approvedBy?.name || sName;
            sEmail = legApproval.approvedBy?.email || sEmail;
            sDate = legApproval.approvedAt || sDate || new Date();
            sComments = legApproval.comments || sComments;
            if (!sigData && legApproval.approvedBy?.signature) {
              sigData = legApproval.approvedBy.signature;
              sType = legApproval.approvedBy.signatureType || sType;
              sFont = legApproval.approvedBy.signatureFont || sFont;
              sInitials = legApproval.approvedBy.signatureInitials || sInitials;
            }
          }
        }

        // 4. Compliance Manager Slot
        if (slotLower.includes('compliance') || roleLower.includes('compliance')) {
          if (compApproval && (compApproval.status === 'Approved' || isSlotSigned)) {
            isSlotSigned = true;
            sName = compApproval.approvedBy?.name || sName;
            sEmail = compApproval.approvedBy?.email || sEmail;
            sDate = compApproval.approvedAt || sDate || new Date();
            sComments = compApproval.comments || sComments;
            if (!sigData && compApproval.approvedBy?.signature) {
              sigData = compApproval.approvedBy.signature;
              sType = compApproval.approvedBy.signatureType || sType;
              sFont = compApproval.approvedBy.signatureFont || sFont;
              sInitials = compApproval.approvedBy.signatureInitials || sInitials;
            }
          }
        }

        return {
          ...sig,
          status: isSlotSigned ? 'Signed' : 'Pending',
          signerName: sName,
          signerEmail: sEmail,
          signedAt: sDate,
          comments: sComments,
          signature: sigData,
          signatureType: sType,
          signatureFont: sFont,
          signatureInitials: sInitials
        };
      });

      // Ensure 3rd slot (Legal or Compliance) is present if workflow/folder requires it
      const hasLegal = mapped.some(s => (s.slot || '').toLowerCase().includes('legal') || (s.role || '').toLowerCase().includes('legal'));
      const hasCompliance = mapped.some(s => (s.slot || '').toLowerCase().includes('compliance') || (s.role || '').toLowerCase().includes('compliance'));

      if (isLegal && !hasLegal) {
        mapped.push({
          slot: 'Legal Manager',
          role: 'Legal Team',
          step: mapped.length + 1,
          signerName: legApproval?.approvedBy?.name || '',
          signerEmail: legApproval?.approvedBy?.email || '',
          status: legApproval?.status === 'Approved' ? 'Signed' : 'Pending',
          signature: legApproval?.approvedBy?.signature || '',
          signatureType: legApproval?.approvedBy?.signatureType || '',
          signatureFont: legApproval?.approvedBy?.signatureFont || 'Great Vibes',
          signatureInitials: legApproval?.approvedBy?.signatureInitials || '',
          signedAt: legApproval?.approvedAt || null,
          comments: legApproval?.comments || ''
        });
      } else if (isCompliance && !hasCompliance) {
        mapped.push({
          slot: 'Compliance Manager',
          role: 'Compliance Team',
          step: mapped.length + 1,
          signerName: compApproval?.approvedBy?.name || '',
          signerEmail: compApproval?.approvedBy?.email || '',
          status: compApproval?.status === 'Approved' ? 'Signed' : 'Pending',
          signature: compApproval?.approvedBy?.signature || '',
          signatureType: compApproval?.approvedBy?.signatureType || '',
          signatureFont: compApproval?.approvedBy?.signatureFont || 'Great Vibes',
          signatureInitials: compApproval?.approvedBy?.signatureInitials || '',
          signedAt: compApproval?.approvedAt || null,
          comments: compApproval?.comments || ''
        });
      }

      return mapped;
    }

    const uploaderSig = doc?.uploadedBy?.signature || localStorage.getItem('userSignature') || '';
    const uploaderSigType = doc?.uploadedBy?.signatureType || localStorage.getItem('userSignatureType') || '';
    const uploaderSigFont = doc?.uploadedBy?.signatureFont || 'Great Vibes';
    const uploaderSigInitials = doc?.uploadedBy?.signatureInitials || localStorage.getItem('userSignatureInitials') || '';

    const list = [
      {
        slot: 'Manager (Uploader)',
        role: 'Manager',
        step: 1,
        signerName: doc?.uploadedBy?.name || localStorage.getItem('userName') || 'Manager (Uploader)',
        signerEmail: doc?.uploadedBy?.email || localStorage.getItem('userEmail') || '',
        status: 'Signed',
        signature: uploaderSig,
        signatureType: uploaderSigType,
        signatureFont: uploaderSigFont,
        signatureInitials: uploaderSigInitials,
        signedAt: doc?.createdAt || null,
        comments: 'Document uploaded & initial e-signature registered.'
      },
      {
        slot: 'Reporting Manager',
        role: 'Reporting Manager',
        step: 2,
        signerName: repApproval?.approvedBy?.name || '',
        signerEmail: repApproval?.approvedBy?.email || '',
        status: repApproval?.status === 'Approved' ? 'Signed' : 'Pending',
        signature: repApproval?.approvedBy?.signature || '',
        signatureType: repApproval?.approvedBy?.signatureType || '',
        signatureFont: repApproval?.approvedBy?.signatureFont || 'Great Vibes',
        signatureInitials: repApproval?.approvedBy?.signatureInitials || '',
        signedAt: repApproval?.approvedAt || null,
        comments: repApproval?.comments || ''
      }
    ];

    if (isLegal) {
      list.push({
        slot: 'Legal Manager',
        role: 'Legal Team',
        step: 3,
        signerName: legApproval?.approvedBy?.name || '',
        signerEmail: legApproval?.approvedBy?.email || '',
        status: legApproval?.status === 'Approved' ? 'Signed' : 'Pending',
        signature: legApproval?.approvedBy?.signature || '',
        signatureType: legApproval?.approvedBy?.signatureType || '',
        signatureFont: legApproval?.approvedBy?.signatureFont || 'Great Vibes',
        signatureInitials: legApproval?.approvedBy?.signatureInitials || '',
        signedAt: legApproval?.approvedAt || null,
        comments: legApproval?.comments || ''
      });
    } else if (isCompliance) {
      list.push({
        slot: 'Compliance Manager',
        role: 'Compliance Team',
        step: 3,
        signerName: compApproval?.approvedBy?.name || '',
        signerEmail: compApproval?.approvedBy?.email || '',
        status: compApproval?.status === 'Approved' ? 'Signed' : 'Pending',
        signature: compApproval?.approvedBy?.signature || '',
        signatureType: compApproval?.approvedBy?.signatureType || '',
        signatureFont: compApproval?.approvedBy?.signatureFont || 'Great Vibes',
        signatureInitials: compApproval?.approvedBy?.signatureInitials || '',
        signedAt: compApproval?.approvedAt || null,
        comments: compApproval?.comments || ''
      });
    }
    return list;
  }, [doc, folderCategory, folderName]);

  const isPdf = ext === 'pdf' || (doc?.mimeType && doc.mimeType.includes('pdf')) || (doc?.fileType || '').toUpperCase() === 'PDF';

  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'ico'].includes(ext) || (doc?.mimeType && doc.mimeType.startsWith('image/'));
  const canPreview = isPdf || isImage;

  // Fetch file as blob for both PDFs and images
  useEffect(() => {
    if (!isOpen || !doc || !canPreview || !previewUrl) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl('');
      }
      setError('');
      setLoading(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    setZoom(100);
    setRotation(0);

    fetch(previewUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status} ${res.statusText}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        let finalBlob = blob;
        if (isPdf && blob.type !== 'application/pdf') {
          finalBlob = new Blob([blob], { type: 'application/pdf' });
        }
        const url = URL.createObjectURL(finalBlob);
        setBlobUrl(url);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('File fetch error:', err);
        setError(err.message || 'Failed to load file preview');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isOpen, docId, canPreview, isPdf, previewUrl]);

  // Cleanup blob on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  if (!isOpen || !doc) return null;

  const isConfidential =
    doc.isConfidential ||
    folderCategory === 'Legal' ||
    folderCategory === 'Confidential' ||
    /legal/i.test(folderName || '') ||
    /confidential/i.test(folderName || '') ||
    /legal/i.test(doc.name || '') ||
    /confidential/i.test(doc.name || '');

  const userEmail = localStorage.getItem('userEmail') || 'Workspace User';
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const tenantDisplayName = branding.companyName || companySlug?.toUpperCase() || 'DMS WORKSPACE';

  const handleDownload = () => {
    if (downloadUrl) window.open(downloadUrl, '_blank');
  };

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
    setSaveError('');
    setSaveSuccess('');

    try {
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

      const res = await fetch(`${API_BASE_URL}/api/${effectiveSlug}/manager/documents/${docId}`, {
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

      const updatedDoc = data.data || { ...doc, ...payload };
      setDoc(updatedDoc);
      setSaveSuccess('Document details updated successfully!');
      if (onUpdated) onUpdated(updatedDoc);
    } catch (err) {
      setSaveError(err.message || 'Failed to save document details.');
    } finally {
      setSaving(false);
    }
  };

  const handleReclassify = async () => {
    setReclassifying(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const savedGemini = localStorage.getItem('dms_gemini_key') || '';
      const savedOpenai = localStorage.getItem('dms_openai_key') || '';

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      if (savedGemini) headers['x-gemini-key'] = savedGemini;
      if (savedOpenai) headers['x-openai-key'] = savedOpenai;

      const res = await fetch(`${API_BASE_URL}/api/${effectiveSlug}/manager/documents/${docId}/classify`, {
        method: 'POST',
        headers
      });
      const data = await res.json();

      if (data.success) {
        setDoc(prev => ({
          ...prev,
          ...data.data,
          extractedText: data.data.extractedText || prev.extractedText
        }));
        setSaveSuccess('Document re-analyzed & AI metadata updated!');
        if (onUpdated) onUpdated(data.data);
      } else {
        throw new Error(data.message || 'Failed to re-classify document');
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to run OCR & AI classification.');
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

  const validationStatus = doc.validationStatus || 'Pending';
  const missingFields = doc.missingMandatoryFields || [];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[92vh] flex flex-col bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden relative">

        {/* ════════════════════ HEADER (WHITE THEME) ════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 z-30 gap-3">

          {/* Doc Title & Icon */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
              {isPdf && <FileText size={22} className="text-red-600" />}
              {isImage && <ImageIcon size={22} className="text-emerald-600" />}
              {!isPdf && !isImage && <FileText size={22} className="text-blue-600" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-slate-900 font-bold text-sm sm:text-base md:text-lg truncate max-w-xs sm:max-w-md" title={doc.name || doc.originalFileName}>
                  {doc.name || doc.originalFileName || 'Document'}
                </h3>
                {isConfidential && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 shrink-0 uppercase tracking-wider">
                    <Shield size={11} /> Confidential
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate font-medium">
                {doc.documentType || doc.fileType || ext.toUpperCase() || 'Document'} • {doc.fileSize ? (doc.fileSize / 1024).toFixed(1) + ' KB' : 'Standard'}
              </p>
            </div>
          </div>

          {/* Tab Navigation & Actions */}
          <div className="flex items-center flex-wrap gap-2.5">

            {/* View Switching Tabs */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                <Eye size={14} />
                <span>Preview</span>
              </button>
              {!isViewer && (
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'edit'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                >
                  <Edit3 size={14} />
                  <span>Edit Details</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('metadata')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'metadata'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                <Database size={14} />
                <span>Metadata & AI</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signatures')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'signatures'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                title="View multi-party electronic signatures stamped on the last page"
              >
                <PenTool size={14} />
                <span>Signatures</span>
                {displaySignatures.length > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'signatures' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                    }`}>
                    {displaySignatures.filter(s => s.status === 'Signed').length}/{displaySignatures.length}
                  </span>
                )}
              </button>
            </div>


            {/* Preview Controls (Zoom/Rotate if on preview tab with image) */}
            {activeTab === 'preview' && isImage && !error && blobUrl && (
              <div className="hidden md:flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                <button type="button" onClick={() => setZoom((p) => Math.max(50, p - 15))}
                  className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg transition hover:bg-slate-200 cursor-pointer" title="Zoom Out">
                  <ZoomOut size={15} />
                </button>
                <span className="text-xs font-mono text-slate-700 px-2 min-w-[2.75rem] text-center font-bold">{zoom}%</span>
                <button type="button" onClick={() => setZoom((p) => Math.min(250, p + 15))}
                  className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg transition hover:bg-slate-200 cursor-pointer" title="Zoom In">
                  <ZoomIn size={15} />
                </button>
                <button type="button" onClick={() => setRotation((p) => (p + 90) % 360)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg transition hover:bg-slate-200 cursor-pointer ml-1 border-l border-slate-200" title="Rotate">
                  <RotateCw size={15} />
                </button>
              </div>
            )}

            {isViewer && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <ShieldCheck size={13} />
                <span>Preview Only</span>
              </span>
            )}

            {canEditCloud && (
              <button
                type="button"
                onClick={() => setIsCloudEditorOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
                title="Edit document content in Cloud"
              >
                <Sparkles size={14} />
                <span>Edit in Cloud</span>
              </button>
            )}

            {!isViewer && (
              <button type="button" onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer" title="Download file">
                <Download size={14} />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            {canPreview && previewUrl && (
              <button type="button" onClick={() => window.open(previewUrl, '_blank')}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200 cursor-pointer" title="Open preview in new tab">
                <ExternalLink size={16} />
              </button>
            )}

            <button type="button" onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition border border-slate-200 cursor-pointer ml-1" title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Alerts */}
        {(saveSuccess || saveError) && (
          <div className="px-6 py-2.5 shrink-0 z-30 bg-slate-50 border-b border-slate-200">
            {saveSuccess && (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{saveSuccess}</span>
                </div>
                <button onClick={() => setSaveSuccess('')} className="text-emerald-700 hover:text-emerald-900"><X size={14} /></button>
              </div>
            )}
            {saveError && (
              <div className="flex items-center justify-between rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-600 shrink-0" />
                  <span>{saveError}</span>
                </div>
                <button onClick={() => setSaveError('')} className="text-red-700 hover:text-red-900"><X size={14} /></button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════ MODAL MAIN BODY (WHITE THEME) ════════════════════ */}
        <div className="flex-1 relative overflow-hidden bg-slate-50 flex flex-col">

          {/* ─────────────────── TAB 1: PREVIEW SECTION ─────────────────── */}
          {activeTab === 'preview' && (
            <div className="w-full h-full relative flex items-center justify-center overflow-hidden p-3 sm:p-5">

              {/* Floating Quick Edit in Cloud CTA */}
              {canEditCloud && (
                <div className="absolute top-5 right-5 z-30">
                  <button
                    type="button"
                    onClick={() => setIsCloudEditorOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md transition cursor-pointer"
                    title="Click to edit document in Cloud"
                  >
                    <Sparkles size={14} className="text-blue-600" />
                    <span>Edit in Cloud</span>
                  </button>
                </div>
              )}

              {/* Loading */}
              {loading && canPreview && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-40 backdrop-blur-xs">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                  <p className="text-sm font-semibold text-slate-700">Loading document preview...</p>
                </div>
              )}

              {/* PDF Preview */}
              {isPdf && (
                error ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-white text-slate-900 rounded-2xl border border-slate-200 text-center max-w-md mx-auto z-10 shadow-lg">
                    <AlertCircle size={40} className="text-amber-500 mb-3" />
                    <h4 className="text-base font-bold mb-1">PDF Preview Failed</h4>
                    <p className="text-xs text-slate-500 mb-4">{error}</p>
                    <div className="flex items-center gap-2">
                      {canEditCloud && (
                        <button type="button" onClick={() => setIsCloudEditorOpen(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
                          <Sparkles size={14} /> Edit in Cloud
                        </button>
                      )}
                      {!isViewer && (
                        <button type="button" onClick={handleDownload}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                          <Download size={14} /> Download
                        </button>
                      )}
                    </div>
                  </div>
                ) : blobUrl ? (
                  <div className="w-full h-full relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xl z-10">
                    <iframe
                      src={`${blobUrl}#toolbar=1&navpanes=1&view=FitH`}
                      title={doc.name || 'PDF Preview'}
                      className="w-full h-full border-0 bg-slate-50"
                    />
                  </div>
                ) : null
              )}

              {/* Image Preview */}
              {isImage && (
                error ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-white text-slate-900 rounded-2xl border border-slate-200 text-center max-w-md mx-auto z-10 shadow-lg">
                    <AlertCircle size={40} className="text-amber-500 mb-3" />
                    <h4 className="text-base font-bold mb-1">Image Preview Failed</h4>
                    <p className="text-xs text-slate-500 mb-4">{error}</p>
                    {!isViewer ? (
                      <button type="button" onClick={handleDownload}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm">
                        <Download size={14} /> Download Image
                      </button>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Please contact your workspace manager for assistance.</p>
                    )}
                  </div>
                ) : blobUrl ? (
                  <div className="w-full h-full relative flex items-center justify-center overflow-auto z-10 transition-transform duration-200 ease-out"
                    style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)`, transformOrigin: 'center center' }}>
                    <img
                      src={blobUrl}
                      alt={doc.name || 'Image Preview'}
                      onError={() => { setError('Image could not be rendered.'); setLoading(false); }}
                      className="max-h-[82vh] max-w-full object-contain rounded-2xl shadow-xl select-none border border-slate-200"
                    />
                  </div>
                ) : null
              )}

              {/* Unsupported Format Banner */}
              {!canPreview && (
                <div className="flex flex-col items-center justify-center p-10 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full z-10 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-5 shadow-xs">
                    <FileText size={38} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">{doc.name || doc.originalFileName || 'Document'}</h4>
                  <p className="text-xs text-slate-500 mb-3">
                    {ext ? ext.toUpperCase() : 'Binary'} File • {doc.fileSize ? (doc.fileSize / 1024).toFixed(1) + ' KB' : 'Standard'}
                  </p>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    Direct inline preview is not supported for <span className="font-bold text-slate-900">.{ext || 'this'}</span> files.
                    {isViewer
                      ? ' You can view extracted metadata below or contact your workspace manager for support.'
                      : ' You can edit document content directly in the cloud, edit details, or download the original file.'}
                  </p>
                  <div className="flex items-center gap-2.5 w-full">
                    {!isViewer ? (
                      <>
                        {canEditCloud && (
                          <button type="button" onClick={() => setIsCloudEditorOpen(true)}
                            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer">
                            <Sparkles size={14} /> Edit in Cloud
                          </button>
                        )}
                        <button type="button" onClick={() => setActiveTab('edit')}
                          className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
                          <Edit3 size={14} /> Details
                        </button>
                        <button type="button" onClick={handleDownload}
                          className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
                          <Download size={14} /> Download
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => setActiveTab('metadata')}
                        className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer">
                        <Database size={15} /> View Metadata & OCR
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Watermark Overlay for Confidential */}
              {isConfidential && canPreview && !error && blobUrl && (
                <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between overflow-hidden select-none">
                  <div className="bg-red-50/90 border-b border-red-200 text-red-800 px-4 py-2 flex items-center justify-between shadow-xs backdrop-blur-xs">
                    <div className="flex items-center gap-2 text-xs font-black tracking-wider">
                      {branding.logo ? (
                        <img src={branding.logo} alt="Logo" className="w-5 h-5 object-contain rounded" />
                      ) : (
                        <Lock size={14} className="text-red-600" />
                      )}
                      <span>CONFIDENTIAL & PROPRIETARY — {tenantDisplayName}</span>
                    </div>
                    <div className="text-[10px] font-mono text-red-700 font-semibold">
                      VIEWER: {userEmail} • {currentDate}
                    </div>
                  </div>

                  <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-3 gap-12 items-center justify-items-center p-8 opacity-15">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="transform -rotate-35 flex flex-col items-center justify-center text-center select-none">
                        <p className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-slate-900 font-sans uppercase">
                          {tenantDisplayName}
                        </p>
                        <p className="text-xs font-black text-red-600 uppercase tracking-widest mt-0.5">
                          CONFIDENTIAL • DO NOT DISTRIBUTE
                        </p>
                        <p className="text-[10px] font-mono text-slate-600 mt-0.5">
                          {userEmail} • {currentDate}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/90 border-t border-slate-200 text-slate-600 px-4 py-1.5 flex items-center justify-center text-[10px] font-medium tracking-wide shadow-xs">
                    <span>RESTRICTED ASSET • PROTECTED BY {tenantDisplayName} DATA GOVERNANCE • UNAUTHORIZED SHARING PROHIBITED</span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ─────────────────── TAB 2: EDIT DOCUMENT DETAILS SECTION ─────────────────── */}
          {activeTab === 'edit' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70">
              <form onSubmit={handleSaveChanges} className="max-w-4xl mx-auto space-y-5">

                {/* General Information Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
                      <FileText size={16} />
                      <span>General Document Information</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Edit document title, classification, and notes</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Document Title / Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g. Loan Agreement - John Doe.pdf"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Document Category / Type
                      </label>
                      <input
                        type="text"
                        list="preview-doc-type-suggestions"
                        value={formData.documentType}
                        onChange={(e) => handleInputChange('documentType', e.target.value)}
                        placeholder="e.g. KYC Document, Loan Sanction Letter..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      />
                      <datalist id="preview-doc-type-suggestions">
                        {DOCUMENT_TYPE_SUGGESTIONS.map((suggestion, idx) => (
                          <option key={idx} value={suggestion} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Description & Notes
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter description, internal notes, or context for this document..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                </div>

                {/* Customer & Account Identifiers Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-wider text-indigo-700">
                    <User size={16} />
                    <span>Customer & Account Identifiers</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer / Borrower Name</label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        placeholder="e.g. John Doe / Acme Corp"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer / CIF ID</label>
                      <input
                        type="text"
                        value={formData.customerId}
                        onChange={(e) => handleInputChange('customerId', e.target.value)}
                        placeholder="e.g. CIF-908214"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Number</label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        placeholder="e.g. 501004928172"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Facility, Branch & Banking Details Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-wider text-amber-700">
                    <Building size={16} />
                    <span>Facility, Branch & Banking Metadata</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Facility / Loan Number</label>
                      <input
                        type="text"
                        value={formData.facilityNumber}
                        onChange={(e) => handleInputChange('facilityNumber', e.target.value)}
                        placeholder="e.g. LN-2025-0819"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Branch Name</label>
                      <input
                        type="text"
                        value={formData.branch}
                        onChange={(e) => handleInputChange('branch', e.target.value)}
                        placeholder="e.g. Downtown Main Branch"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">IFSC / Branch Code</label>
                      <input
                        type="text"
                        value={formData.ifscCode}
                        onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                        placeholder="e.g. HDFC0001234"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Critical Lifecycle Dates Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    <Calendar size={16} />
                    <span>Document Lifecycle Dates</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Document / Issue Date</label>
                      <input
                        type="date"
                        value={formData.documentDate}
                        onChange={(e) => handleInputChange('documentDate', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Execution Date</label>
                      <input
                        type="date"
                        value={formData.executionDate}
                        onChange={(e) => handleInputChange('executionDate', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Expiry / Maturity Date</label>
                      <input
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2 pb-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition cursor-pointer"
                  >
                    Back to Preview
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Save size={16} />
                    {saving ? "Saving Changes..." : "Save Document Details"}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ─────────────────── TAB 3: METADATA & OCR SECTION ─────────────────── */}
          {activeTab === 'metadata' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70 space-y-5 max-w-4xl mx-auto w-full">

              {/* Classification & Validation Header Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* AI Document Classification */}
                <div className="md:col-span-2 rounded-2xl border border-violet-200 bg-violet-50/70 p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-violet-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-violet-800">Document Type & AI Classification</span>
                    </div>
                    {doc.aiConfidence && (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${doc.aiConfidence === 'High' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        doc.aiConfidence === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-200 text-slate-800'
                        }`}>
                        AI Confidence: {doc.aiConfidence}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xl font-bold text-slate-900">
                    {doc.documentType || doc.aiClassification || 'Unclassified / General'}
                  </div>
                  {doc.typeOfService && (
                    <p className="mt-1 text-xs text-slate-600">Service: <span className="font-semibold text-slate-800">{doc.typeOfService}</span></p>
                  )}
                  {doc.description && (
                    <p className="mt-2 text-xs text-slate-600 italic">{doc.description}</p>
                  )}
                </div>

                {/* Mandatory Fields Compliance */}
                <div className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between ${validationStatus === 'Valid'
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                  : 'border-amber-200 bg-amber-50/70 text-amber-900'
                  }`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      {validationStatus === 'Valid' ? <ShieldCheck size={18} className="text-emerald-600" /> : <ShieldAlert size={18} className="text-amber-600" />}
                      <span className="text-xs font-bold uppercase tracking-wider">Mandatory Fields</span>
                    </div>
                    <div className="text-base font-bold text-slate-900">
                      {validationStatus === 'Valid' ? 'Complete (Valid)' : 'Incomplete'}
                    </div>
                  </div>
                  {missingFields.length > 0 ? (
                    <div className="mt-2 text-[11px] text-amber-800 leading-tight">
                      <span className="font-bold">Missing:</span> {missingFields.join(', ')}
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-emerald-700 font-semibold">
                      All required identifiers present
                    </div>
                  )}
                </div>

              </div>

              {/* Customer & Facility Details Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
                    <User size={14} className="text-blue-600" />
                    <span>Customer Name</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {doc.customerName || doc.customerRef || '—'}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
                    <CreditCard size={14} className="text-indigo-600" />
                    <span>Customer / CIF ID</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 font-mono">
                    {doc.customerId || doc.cifNumber || '—'}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
                    <CreditCard size={14} className="text-emerald-600" />
                    <span>Account Number</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 font-mono">
                    {doc.accountNumber || '—'}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
                    <Building size={14} className="text-amber-600" />
                    <span>Facility / Loan No</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 font-mono">
                    {doc.facilityNumber || doc.facilityRef || '—'}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
                    <MapPin size={14} className="text-rose-600" />
                    <span>Branch & Code</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {doc.branch ? `${doc.branch}${doc.branchCode ? ` (${doc.branchCode})` : ''}` : (doc.partner || '—')}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
                    <Calendar size={14} className="text-purple-600" />
                    <span>Document Date</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {formatDate(doc.documentDate || doc.executionDate)}
                  </div>
                </div>
              </div>

              {/* OCR Extracted Text Preview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      OCR Extracted Text ({doc.extractedText ? `${doc.extractedText.length} characters` : 'None'})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isViewer && (
                      <button
                        onClick={handleReclassify}
                        disabled={reclassifying}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        <RefreshCw size={13} className={reclassifying ? "animate-spin text-blue-600" : ""} />
                        {reclassifying ? "Re-Analyzing..." : "Re-Analyze (AI/OCR)"}
                      </button>
                    )}
                    {doc.extractedText && (
                      <button
                        onClick={() => handleCopyText(doc.extractedText)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition cursor-pointer shadow-xs"
                      >
                        {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        {copied ? "Copied" : "Copy Text"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {doc.extractedText ? doc.extractedText : (
                    <span className="italic text-slate-500">No text extracted. Click "Re-Analyze (AI/OCR)" above to run OCR on this file.</span>
                  )}
                </div>
              </div>

              {/* Security & Deduplication Hash */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 shadow-xs">
                <div>
                  <span className="block text-[11px] text-slate-500">SHA-256 Hash</span>
                  <span className="font-mono text-slate-800 truncate block font-semibold" title={doc.fileHash || 'Generated on upload'}>
                    {doc.fileHash ? `${doc.fileHash.substring(0, 18)}...` : 'Generated on upload'}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">Ingestion Channel</span>
                  <span className="font-semibold text-slate-800">{doc.ingestionSource || 'Web UI Upload'}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">Scan Status</span>
                  <span className="font-semibold text-emerald-600">{doc.scanResult || 'Clean & Verified'}</span>
                </div>
              </div>

            </div>
          )}

          {/* ─────────────────── TAB 4: LAST PAGE E-SIGNATURES SECTION ─────────────────── */}
          {activeTab === 'signatures' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70 space-y-6 max-w-5xl mx-auto w-full">

              {/* Top Banner explaining the Last Page E-Signature Workflow */}
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                      <Stamp size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                        Official Last-Page Multi-Party Electronic Signatures
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          {displaySignatures.length} Signer Workflow
                        </span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Signatures are dynamically fetched from each user's profile settings and stamped on the <strong>final page</strong> of this document upon upload & approval decisions.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-[11px] font-semibold text-slate-500">Document Workflow</div>
                      <div className="text-xs font-bold text-slate-800">
                        {folderCategory || doc.folderId?.folderCategory || (doc.approvalWorkflow?.requiresLegal ? 'Legal Folder' : doc.approvalWorkflow?.requiresCompliance ? 'Compliance Folder' : 'Standard Folder')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2 or 3 Multi-Party Signature Cards */}
              <div className={`grid grid-cols-1 gap-5 ${displaySignatures.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
                }`}>
                {displaySignatures.map((sig, idx) => {
                  const isSigned = sig.status === 'Signed';
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${isSigned
                        ? 'border-emerald-200 ring-1 ring-emerald-500/10 shadow-emerald-500/5'
                        : 'border-amber-200/90 bg-slate-50/50'
                        }`}
                    >
                      {/* Top Step & Status Header */}
                      <div>
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-black flex items-center justify-center">
                              {sig.step || idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              {sig.slot || sig.role}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${isSigned
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                          >
                            {isSigned ? (
                              <>
                                <CheckCheck size={12} className="text-emerald-600" />
                                Signed
                              </>
                            ) : (
                              <>
                                <Clock size={12} className="text-amber-600" />
                                Pending
                              </>
                            )}
                          </span>
                        </div>

                        {/* Signer Visual Representation */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                            <span>Electronic Signature</span>
                            {isSigned && sig.signatureType && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full capitalize">
                                {sig.signatureType === 'draw' ? 'Handwritten Draw' : sig.signatureType === 'upload' ? 'Uploaded Image' : 'Typed Calligraphy'}
                              </span>
                            )}
                          </div>
                          <div className={`h-24 rounded-xl border flex items-center justify-center p-3 relative ${isSigned
                            ? 'bg-gradient-to-b from-blue-50/20 to-slate-50/40 border-slate-200'
                            : 'border-dashed border-slate-300 bg-slate-50/70'
                            }`}>
                            {isSigned && sig.signature && (sig.signature.startsWith('data:image/') || sig.signature.startsWith('http://') || sig.signature.startsWith('https://') || sig.signature.startsWith('/')) ? (
                              <img
                                src={sig.signature}
                                alt={`${sig.signerName || 'Signer'} Signature`}
                                className="max-h-16 max-w-full object-contain filter contrast-125 select-none"
                              />
                            ) : isSigned ? (
                              <div
                                style={{ fontFamily: sig.signatureFont || 'Great Vibes, cursive' }}
                                className="text-2xl sm:text-3xl text-blue-950 font-normal select-none tracking-wide text-center"
                              >
                                {sig.signerName || 'Authorized Signer'}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center text-slate-400 text-center">
                                <PenTool size={18} className="mb-1.5 text-slate-300 animate-pulse" />
                                <span className="text-xs font-medium text-slate-500">Awaiting {sig.slot || sig.role}</span>
                                <span className="text-[10px] text-slate-400">Signature will be fetched upon approval</span>
                              </div>
                            )}

                            {isSigned && (
                              <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                                <Fingerprint size={10} /> Verified
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Signer Info */}
                        <div className="space-y-1.5 bg-slate-50/80 rounded-xl p-3 border border-slate-100 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Signer:</span>
                            <span className="font-bold text-slate-900 truncate max-w-[150px]" title={sig.signerName || '—'}>
                              {sig.signerName || (isSigned ? 'Authorized Signer' : 'Required Role')}
                            </span>
                          </div>
                          {sig.signerEmail && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">Email:</span>
                              <span className="font-mono text-slate-700 truncate max-w-[150px]" title={sig.signerEmail}>
                                {sig.signerEmail}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Date & Time:</span>
                            <span className="text-slate-800 font-semibold">
                              {isSigned && sig.signedAt ? (
                                new Date(sig.signedAt).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              ) : (
                                <span className="text-amber-600 italic">Pending Approval</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Audit Remark */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="truncate max-w-[180px] italic" title={sig.comments || (isSigned ? 'Approved & Signed' : 'Pending Review')}>
                          {sig.comments || (isSigned ? 'Approved & Signed' : 'Pending Review')}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          Last Page Stamped
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legal & Security Compliance Footer */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-600 shrink-0" />
                  <span>
                    <strong>Tamper-Evident Stamping:</strong> Signatures are embedded directly onto the PDF's last page with cryptographic audit trail logging.
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-500">
                  <span>Standard / Legal / Compliance Workflow</span>
                </div>
              </div>

            </div>
          )}


        </div>

      </div>

      {/* Interactive Cloud Document Editor Modal */}
      {isCloudEditorOpen && (
        <CloudDocumentEditor
          isOpen={isCloudEditorOpen}
          onClose={() => setIsCloudEditorOpen(false)}
          document={doc}
          companySlug={companySlug}
          onSaved={(updatedDoc) => {
            setDoc(updatedDoc);
            setSaveSuccess(`Document updated & saved to Cloud successfully! (Version ${updatedDoc.versionNumber || (doc.versionNumber + 1)})`);
            if (onUpdated) onUpdated(updatedDoc);
          }}
        />
      )}
      {/* Changes Saved Toast Notification Pop-up */}
      {saveSuccess && (
        <div className="fixed top-6 right-6 z-[99999999] flex items-center gap-3.5 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-700/60 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold">Changes Have Been Saved!</span>
            <span className="text-[11px] text-emerald-100">{saveSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccess('')}
            className="ml-2 text-white/80 hover:text-white p-1 rounded-lg hover:bg-emerald-700 transition cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
