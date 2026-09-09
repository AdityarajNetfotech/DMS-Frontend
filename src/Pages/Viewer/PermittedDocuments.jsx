import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Eye,
  FileText,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  User,
  Building,
  Lock,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Folder,
  Tag,
  CheckCircle2,
  FileCheck2
} from 'lucide-react';
import Viewer from '../../components/Viewer/Viewer';
import DocumentPreviewModal from '../../components/DocumentPreviewModal';
import { API_BASE_URL } from '../../config/api';

const typeColors = {
  PDF: 'bg-red-50 text-red-600 border-red-200',
  DOCX: 'bg-blue-50 text-blue-600 border-blue-200',
  DOC: 'bg-blue-50 text-blue-600 border-blue-200',
  XLSX: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  XLS: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  PPTX: 'bg-orange-50 text-orange-600 border-orange-200',
  PPT: 'bg-orange-50 text-orange-600 border-orange-200',
  PNG: 'bg-amber-50 text-amber-600 border-amber-200',
  JPG: 'bg-amber-50 text-amber-600 border-amber-200',
  JPEG: 'bg-amber-50 text-amber-600 border-amber-200',
  ZIP: 'bg-violet-50 text-violet-600 border-violet-200'
};

const getFileTypeColor = (type) => {
  return typeColors[type?.toUpperCase()] || 'bg-slate-50 text-slate-600 border-slate-200';
};

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function PermittedDocuments() {
  const { companySlug } = useParams();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Modal State
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fetchPermittedDocs = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate(`/${companySlug}/login`);
        return;
      }

      // Fetch viewer permitted documents
      const res = await fetch(`${API_BASE_URL}/api/${companySlug}/viewer/documents`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setDocuments(data.data);
      } else if (res.status === 403) {
        setError('Viewer access restricted. You can only view documents explicitly shared by a manager.');
        setDocuments([]);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error('Error fetching permitted documents:', err);
      setError('Unable to load permitted documents. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companySlug) {
      fetchPermittedDocs();
    }
  }, [companySlug]);

  // Derived filter options
  const fileTypes = useMemo(() => {
    const types = new Set();
    documents.forEach((d) => {
      const ext = d.extension || (d.fileType ? d.fileType.toUpperCase() : '') || 'FILE';
      types.add(ext.replace('.', '').toUpperCase());
    });
    return ['ALL', ...Array.from(types)];
  }, [documents]);

  const documentTypes = useMemo(() => {
    const categories = new Set();
    documents.forEach((d) => {
      if (d.documentType) categories.add(d.documentType);
    });
    return ['ALL', ...Array.from(categories)];
  }, [documents]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const name = doc.name || doc.originalFileName || '';
      const docType = doc.documentType || '';
      const custName = doc.customerName || doc.customerRef || '';
      const acctNo = doc.accountNumber || '';
      const facNo = doc.facilityNumber || '';
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        docType.toLowerCase().includes(q) ||
        custName.toLowerCase().includes(q) ||
        acctNo.toLowerCase().includes(q) ||
        facNo.toLowerCase().includes(q);

      const ext = (doc.extension || doc.fileType || '').replace('.', '').toUpperCase();
      const matchesType = selectedType === 'ALL' || ext === selectedType;
      const matchesCategory = selectedCategory === 'ALL' || doc.documentType === selectedCategory;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [documents, searchQuery, selectedType, selectedCategory]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = documents.length;
    const confidential = documents.filter((d) => d.isConfidential).length;
    const verified = documents.filter((d) => d.validationStatus === 'Valid').length;
    return { total, confidential, verified };
  }, [documents]);

  const handleOpenPreview = (doc) => {
    setPreviewDoc(doc);
    setIsPreviewOpen(true);
  };

  return (
    <Viewer>
      <div className="space-y-6">
        
        {/* Page Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-blue-700/30">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
              <ShieldCheck size={14} className="text-blue-400" />
              <span>Permission Granted Documents</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Permitted Documents
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              These documents have been explicitly authorized by your Workspace Managers for secure inline viewing.
              Downloads are restricted in accordance with Viewer role security governance.
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <FileCheck2 size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Permitted Files</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Lock size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidential</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.confidential}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Documents</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.verified}</h3>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by file name, customer, account or doc type..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* File Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none transition cursor-pointer"
            >
              {fileTypes.map((t) => (
                <option key={t} value={t}>
                  Type: {t}
                </option>
              ))}
            </select>

            {/* Document Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none transition cursor-pointer max-w-[180px] truncate"
            >
              {documentTypes.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchPermittedDocs}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
              title="Refresh List"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : ''} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Document Grid / List Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
            <RefreshCw size={32} className="animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-semibold text-slate-600">Loading permitted documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl border border-slate-200 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Permitted Documents Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
              {searchQuery || selectedType !== 'ALL' || selectedCategory !== 'ALL'
                ? 'No documents matched your active filter criteria. Try resetting the filters.'
                : 'You do not have any documents shared by a manager yet. Once a manager grants you permission, they will appear here.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDocuments.map((doc) => {
              const ext = (doc.extension || doc.fileType || 'FILE').replace('.', '').toUpperCase();
              const isConfidential = !!doc.isConfidential;
              return (
                <div
                  key={doc._id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                >
                  {/* Card Header Tags */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getFileTypeColor(ext)}`}>
                        {ext}
                      </span>
                      {isConfidential && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                          <Lock size={10} /> Confidential
                        </span>
                      )}
                    </div>

                    {/* File Icon & Name */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition"
                          title={doc.name || doc.originalFileName}
                        >
                          {doc.name || doc.originalFileName}
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {doc.documentType || 'General Document'}
                        </p>
                      </div>
                    </div>

                    {/* Customer & Metadata snippet */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-2.5 text-xs text-slate-600">
                      {doc.customerName && (
                        <div className="flex items-center gap-1.5 text-slate-700 truncate">
                          <User size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{doc.customerName}</span>
                        </div>
                      )}
                      {doc.accountNumber && (
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] truncate">
                          <Building size={13} className="text-slate-400 shrink-0" />
                          <span>A/C: {doc.accountNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>{formatBytes(doc.fileSize)}</span>
                        <span>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(doc)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Eye size={14} />
                      <span>Preview Document</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Document Name</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Customer / Reference</th>
                    <th className="px-4 py-3.5">Size</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocuments.map((doc) => {
                    const ext = (doc.extension || doc.fileType || 'FILE').replace('.', '').toUpperCase();
                    return (
                      <tr key={doc._id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${getFileTypeColor(ext)}`}>
                              {ext}
                            </span>
                            <span
                              className="font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer"
                              onClick={() => handleOpenPreview(doc)}
                              title={doc.name || doc.originalFileName}
                            >
                              {doc.name || doc.originalFileName}
                            </span>
                            {doc.isConfidential && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                Confidential
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {doc.documentType || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {doc.customerName || doc.accountNumber || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500">
                          {formatBytes(doc.fileSize)}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500">
                          {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(doc)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-xs transition cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Preview</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Integrated Document Preview Modal */}
        {isPreviewOpen && previewDoc && (
          <DocumentPreviewModal
            isOpen={isPreviewOpen}
            onClose={() => {
              setIsPreviewOpen(false);
              setPreviewDoc(null);
            }}
            document={previewDoc}
            companySlug={companySlug}
            initialTab="preview"
          />
        )}

      </div>
    </Viewer>
  );
}
