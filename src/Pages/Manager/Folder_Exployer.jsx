import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  FolderOpen,
  FolderClosed,
  FolderX,
  ArrowLeft,
  CornerLeftUp,
  FileSpreadsheet,
  FileText,
  Folder,
  Grid2X2,
  List,
  MoreVertical,
  Plus,
  UploadCloud,
  Presentation,
  Search,
  Download,
  Lock,
  Unlock,
  Archive,
  Star,
  Trash2,
  Copy,
  FolderOutput,
  Eye,
  Share2,
  Edit3,
  RefreshCw,
  Sparkles,
  PenTool,
  UserCheck,
  Check,
  History,
  Database,
  ShieldCheck
} from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import { API_BASE_URL } from "../../config/api";
import CreateFolderModal from "../../components/Manager/CreateFolderModal";
import UploadFileModal from "../../components/Manager/UploadFileModal";
import MoveCopyModal from "../../components/Manager/MoveCopyModal";
import ShareDocumentModal from "../../components/Manager/ShareDocumentModal";
import RenameModal from "../../components/Manager/RenameModal";
import ConvertFormatModal from "../../components/Manager/ConvertFormatModal";
import DocumentMetadataModal from "../../components/Manager/DocumentMetadataModal";
import ApprovalHistoryModal from "../../components/Manager/ApprovalHistoryModal";
import DocumentPreviewModal from "../../components/DocumentPreviewModal";
import Pagination from "../../components/common/Pagination";

const iconStyles = {
  folder: "bg-amber-100 text-amber-500",
  word: "bg-blue-100 text-blue-700",
  pdf: "bg-red-100 text-red-600",
  excel: "bg-emerald-100 text-emerald-600",
  powerpoint: "bg-orange-100 text-orange-600",
};

function ItemIcon({ kind, isOpen }) {
  const className = `flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconStyles[kind] || "bg-slate-100 text-slate-500"
    }`;

  if (kind === "folder") {
    return (
      <div className={className}>
        {isOpen ? (
          <FolderOpen size={22} fill="currentColor" strokeWidth={1.7} />
        ) : (
          <Folder size={22} fill="currentColor" strokeWidth={1.7} />
        )}
      </div>
    );
  }

  if (kind === "excel") {
    return (
      <div className={className}>
        <FileSpreadsheet size={20} />
      </div>
    );
  }

  if (kind === "powerpoint") {
    return (
      <div className={className}>
        <Presentation size={20} />
      </div>
    );
  }

  return (
    <div className={className}>
      <FileText size={20} />
    </div>
  );
}

export default function FolderExployer() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const folderIdParam = searchParams.get('folderId');
  const [search, setSearch] = useState("");
  const [folderTree, setFolderTree] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null); // null means root
  const [items, setItems] = useState([]); // combined folders and files
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({}); // { [folderId]: { loading: boolean, items: [] } }
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, currentFolder]);

  // Modals state
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState(null);
  const [moveCopyConfig, setMoveCopyConfig] = useState({ isOpen: false, item: null, action: null });
  const [shareConfig, setShareConfig] = useState({ isOpen: false, document: null });
  const [renameConfig, setRenameConfig] = useState({ isOpen: false, item: null });
  const [convertConfig, setConvertConfig] = useState({ isOpen: false, item: null });
  const [metadataConfig, setMetadataConfig] = useState({ isOpen: false, item: null, initialEditMode: false });
  const [approvalHistoryConfig, setApprovalHistoryConfig] = useState({ isOpen: false, document: null });
  const [previewConfig, setPreviewConfig] = useState({ isOpen: false, document: null, initialTab: 'preview' });
  const [activeDropdown, setActiveDropdown] = useState(null);
  // Subscription model removed: always active Enterprise plan
  const subStatus = {
    plan: 'Enterprise',
    isAccessLocked: false,
    aiCount: 0
  };
  const dropdownRef = useRef(null);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  });

  const fetchFolderTree = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/folders/tree`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const seenTreeRoots = new Set();
        const cleanTree = data.data.filter(node => {
          if (!node.parentFolder && ['KYC Documents', 'KYB Documents', 'Director Documents', 'Partner Documents', 'Vendor Documents'].includes(node.name)) {
            if (seenTreeRoots.has(node.name)) return false;
            seenTreeRoots.add(node.name);
          }
          return true;
        });
        setFolderTree(cleanTree);
      }
    } catch (err) {
      console.error("Failed to fetch folder tree", err);
    }
  }, [companySlug]);

  const fetchFolderDetails = useCallback(async (folderId) => {
    setLoading(true);
    try {
      const idToFetch = folderId || 'root';
      const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/folders/${idToFetch}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        const childFolders = data.data.childFolders || data.data.subfolders || [];
        const documents = data.data.documents || [];

        const SYSTEM_ROOT_NAMES = ['KYC Documents', 'KYB Documents', 'Director Documents', 'Partner Documents', 'Vendor Documents'];
        const seenNames = new Set();
        const deduplicatedChildFolders = childFolders.filter(f => {
          if (!f.parentFolder && SYSTEM_ROOT_NAMES.includes(f.name)) {
            if (seenNames.has(f.name)) return false;
            seenNames.add(f.name);
          }
          return true;
        });

        const formattedItems = [
          ...deduplicatedChildFolders.map(f => ({ ...f, kind: 'folder', type: 'Folder' })),
          ...documents.map(d => ({ ...d, kind: getFileKind(d.mimeType || d.fileType || d.extension || d.originalFileName), type: d.fileType || 'File' }))
        ].filter(item => !item.isArchived);

        setItems(formattedItems);
        setCurrentFolder(data.data.folder);
      }
    } catch (err) {
      console.error("Failed to fetch folder details", err);
    } finally {
      setLoading(false);
    }
  }, [companySlug]);

  useEffect(() => {
    fetchFolderTree();
    fetchFolderDetails(folderIdParam || null);
  }, [fetchFolderTree, fetchFolderDetails, folderIdParam]);

  // Helper to find ancestor path in folder tree
  const findFolderPath = useCallback((nodes, targetId, path = []) => {
    if (!targetId || !nodes || nodes.length === 0) return [];
    for (const node of nodes) {
      if (String(node._id) === String(targetId)) {
        return [...path, node];
      }
      if (node.children && node.children.length > 0) {
        const found = findFolderPath(node.children, targetId, [...path, node]);
        if (found.length > 0) return found;
      }
    }
    return [];
  }, []);

  const handleOpenFolder = useCallback((folderId) => {
    if (folderId) {
      setSearchParams({ folderId });
    } else {
      setSearchParams({});
    }
    fetchFolderDetails(folderId);
  }, [fetchFolderDetails, setSearchParams]);

  const handleCloseFolder = useCallback(() => {
    if (!currentFolder) return;
    const path = findFolderPath(folderTree, currentFolder._id);
    if (path.length > 1) {
      const parent = path[path.length - 2];
      handleOpenFolder(parent._id);
    } else if (currentFolder.parentFolder) {
      const pId = typeof currentFolder.parentFolder === 'object'
        ? currentFolder.parentFolder._id
        : currentFolder.parentFolder;
      handleOpenFolder(pId);
    } else {
      handleOpenFolder(null);
    }
  }, [currentFolder, folderTree, findFolderPath, handleOpenFolder]);

  // Auto-expand ancestors in sidebar tree when currentFolder changes
  useEffect(() => {
    if (currentFolder && folderTree.length > 0) {
      const path = findFolderPath(folderTree, currentFolder._id);
      if (path.length > 0) {
        setSidebarExpanded(prev => {
          const next = { ...prev };
          path.forEach(p => { next[p._id] = true; });
          return next;
        });
      }
    }
  }, [currentFolder, folderTree, findFolderPath]);

  const toggleSidebarFolder = (e, folderId) => {
    e.stopPropagation();
    setSidebarExpanded(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const toggleInlineFolder = async (e, folderId) => {
    e.stopPropagation();
    if (expandedFolders[folderId]) {
      setExpandedFolders(prev => {
        const updated = { ...prev };
        delete updated[folderId];
        return updated;
      });
      return;
    }

    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: { loading: true, items: [] }
    }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/folders/${folderId}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        const childFolders = data.data.childFolders || data.data.subfolders || [];
        const documents = data.data.documents || [];
        const formatted = [
          ...childFolders.map(f => ({ ...f, kind: 'folder', type: 'Folder' })),
          ...documents.map(d => ({
            ...d,
            kind: getFileKind(d.mimeType || d.fileType || d.extension || d.originalFileName),
            type: d.fileType || 'File'
          }))
        ].filter(item => !item.isArchived);

        setExpandedFolders(prev => ({
          ...prev,
          [folderId]: { loading: false, items: formatted }
        }));
      } else {
        setExpandedFolders(prev => {
          const updated = { ...prev };
          delete updated[folderId];
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to expand folder inline", err);
      setExpandedFolders(prev => {
        const updated = { ...prev };
        delete updated[folderId];
        return updated;
      });
    }
  };

  // Handle outside click for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFileKind = (mimeType) => {
    if (!mimeType) return 'document';
    const lower = String(mimeType).toLowerCase();
    if (lower.includes('pdf')) return 'pdf';
    if (lower.includes('word') || lower.includes('document') || lower.includes('docx') || lower.includes('doc')) return 'word';
    if (lower.includes('excel') || lower.includes('spreadsheet') || lower.includes('xlsx') || lower.includes('xls') || lower.includes('csv')) return 'excel';
    if (lower.includes('powerpoint') || lower.includes('presentation') || lower.includes('pptx') || lower.includes('ppt')) return 'powerpoint';
    return 'document';
  };

  const handleCreateFolder = async (folderData) => {
    const formData = new FormData();
    formData.append('name', folderData.name);
    if (folderData.description) formData.append('description', folderData.description);
    if (folderData.parentFolder) formData.append('parentFolder', folderData.parentFolder);

    const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/folders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    fetchFolderTree();
    fetchFolderDetails(currentFolder?._id);
  };

  const handleUploadFile = async (formData) => {
    const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/documents/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    fetchFolderDetails(currentFolder?._id);
  };

  const handleAction = async (action, item) => {
    setActiveDropdown(null);
    try {
      let endpoint = '';
      let method = 'POST';

      const token = localStorage.getItem('accessToken');

      if (action === 'download') {
        if (item.kind === 'folder') {
          window.open(`${API_BASE_URL}/api/${companySlug}/manager/folders/${item._id}/zip?token=${token}`);
        } else {
          window.open(`${API_BASE_URL}/api/${companySlug}/manager/documents/${item._id}/download?token=${token}`);
        }
        return;
      }

      if (action === 'preview') {
        setPreviewConfig({ isOpen: true, document: item, initialTab: 'preview' });
        return;
      }

      let body = null;

      if (action === 'delete') {
        endpoint = item.kind === 'folder'
          ? `/api/${companySlug}/manager/folders/${item._id}`
          : `/api/${companySlug}/manager/documents/${item._id}`;
        method = 'DELETE';
      } else if (action === 'lock') {
        endpoint = item.kind === 'folder'
          ? `/api/${companySlug}/manager/folders/${item._id}/lock`
          : `/api/${companySlug}/manager/documents/${item._id}/lock`;
        body = JSON.stringify({ isLocked: !item.isLocked });
      } else if (action === 'archive') {
        endpoint = item.kind === 'folder'
          ? `/api/${companySlug}/manager/folders/${item._id}/archive`
          : `/api/${companySlug}/manager/documents/${item._id}/archive`;
        body = JSON.stringify({ isArchived: !item.isArchived });
      } else if (action === 'favorite') {
        endpoint = item.kind === 'folder'
          ? `/api/${companySlug}/manager/folders/${item._id}/favorite`
          : `/api/${companySlug}/manager/documents/${item._id}/favorite`;
        body = JSON.stringify({ isFavorite: !item.isFavorited });
      } else if (action === 'move' || action === 'copy') {
        setMoveCopyConfig({ isOpen: true, item, action });
        return;
      } else if (action === 'upload') {
        setUploadTargetFolderId(item._id);
        setIsUploadOpen(true);
        return;
      } else if (action === 'share') {
        setShareConfig({ isOpen: true, document: item });
        return;
      } else if (action === 'rename') {
        setRenameConfig({ isOpen: true, item });
        return;
      } else if (action === 'convert') {
        setConvertConfig({ isOpen: true, item });
        return;
      } else if (action === 'metadata') {
        setPreviewConfig({ isOpen: true, document: item, initialTab: 'metadata' });
        return;
      } else if (action === 'edit-details') {
        setPreviewConfig({ isOpen: true, document: item, initialTab: 'edit' });
        return;
      } else if (action === 'approval-history') {
        setApprovalHistoryConfig({ isOpen: true, document: item });
        return;
      }

      const headers = getAuthHeaders();
      if (body) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        ...(body && { body }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      fetchFolderTree();
      fetchFolderDetails(currentFolder?._id);
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleShareDocument = async (itemId, payload) => {
    const isFolder = shareConfig.document?.kind === 'folder';
    const endpoint = isFolder
      ? `/api/${companySlug}/manager/shares/create/folder/${itemId}`
      : `/api/${companySlug}/manager/shares/create/${itemId}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  };

  const handleRename = async (item, newName) => {
    const isFolder = item.kind === 'folder';
    const endpoint = isFolder
      ? `/api/${companySlug}/manager/folders/${item._id}`
      : `/api/${companySlug}/manager/documents/${item._id}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    fetchFolderTree();
    fetchFolderDetails(currentFolder?._id);
  };

  const handleConvert = async (item, targetFormat) => {
    const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/documents/${item._id}/convert`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetFormat }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    fetchFolderTree();
    fetchFolderDetails(currentFolder?._id);
  };

  const submitMoveCopy = async (destinationFolderId) => {
    const { item, action } = moveCopyConfig;
    const isFolder = item.kind === 'folder';
    const endpoint = isFolder
      ? `/api/${companySlug}/manager/folders/${item._id}/${action}`
      : `/api/${companySlug}/manager/documents/${item._id}/${action}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetFolderId: destinationFolderId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    fetchFolderTree();
    fetchFolderDetails(currentFolder?._id);
  };

  const filteredItems = items.filter((item) =>
    (item.name || item.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.kind === 'folder' && b.kind !== 'folder') return -1;
    if (a.kind !== 'folder' && b.kind === 'folder') return 1;
    const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
    const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
    return timeB - timeA;
  });

  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatSize = (bytes, isFolder) => {
    if (bytes === 0 || (isFolder && !bytes)) return '0 KB';
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  const renderSidebarTree = (folders, depth = 0) => {
    return folders.map((folder) => {
      const hasChildren = folder.children && folder.children.length > 0;
      const isExpanded = sidebarExpanded[folder._id] ?? (depth === 0);
      const isCurrent = currentFolder?._id === folder._id;

      return (
        <div key={folder._id}>
          <div
            style={{ paddingLeft: `${depth * 14 + 8}px` }}
            className={`flex w-full items-center justify-between rounded-lg py-2 pr-2 text-left text-sm font-semibold transition group ${isCurrent ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`}
          >
            <button
              onClick={() => handleOpenFolder(folder._id)}
              className="flex items-center gap-2.5 truncate flex-1 text-left cursor-pointer"
              title={folder.name}
            >
              {isCurrent ? (
                <FolderOpen size={18} className="text-blue-600 shrink-0" />
              ) : (
                <Folder size={18} className="text-amber-500 shrink-0" />
              )}
              <span className="truncate">{folder.name}</span>
            </button>

            {hasChildren && (
              <button
                type="button"
                onClick={(e) => toggleSidebarFolder(e, folder._id)}
                className="p-1 rounded hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                title={isExpanded ? "Close subfolders" : "Open subfolders"}
              >
                {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </button>
            )}
          </div>

          {hasChildren && isExpanded && (
            <div className="mt-0.5 border-l border-slate-200 ml-4">
              {renderSidebarTree(folder.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-10">
        <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            {(() => {
              const currentPath = currentFolder ? findFolderPath(folderTree, currentFolder._id) : [];
              const parentFolder = currentPath.length > 1
                ? currentPath[currentPath.length - 2]
                : (currentFolder?.parentFolder ? { _id: typeof currentFolder.parentFolder === 'object' ? currentFolder.parentFolder._id : currentFolder.parentFolder, name: 'Parent Folder' } : null);

              return (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-normal text-slate-950 flex items-center gap-2.5">
                      {currentFolder ? (
                        <>
                          <FolderOpen size={30} className="text-amber-500 shrink-0" />
                          <span className="truncate max-w-[500px]" title={currentFolder.name}>
                            {currentFolder.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <Folder size={30} className="text-blue-700 shrink-0" />
                          <span>Folder Explorer</span>
                        </>
                      )}
                    </h1>

                    {currentFolder && (
                      <button
                        type="button"
                        onClick={handleCloseFolder}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                        title={`Close folder and return to ${parentFolder ? parentFolder.name : 'Home'}`}
                      >
                        <FolderX size={15} className="text-rose-600" />
                        <span>Close Folder</span>
                      </button>
                    )}
                  </div>

                  <p className="mt-2 text-base text-slate-500">
                    {currentFolder
                      ? currentFolder.description || `Viewing files in ${currentFolder.name}`
                      : "Browse and manage your compliance root folders and verification documents."}
                  </p>

                  <nav className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium">
                    <button
                      onClick={() => handleOpenFolder(null)}
                      className={`hover:underline cursor-pointer flex items-center gap-1 ${!currentFolder ? 'font-bold text-slate-900' : 'text-blue-700'
                        }`}
                    >
                      <span>Home</span>
                    </button>

                    {currentPath.length > 0 ? (
                      currentPath.map((crumb, idx) => {
                        const isLast = idx === currentPath.length - 1;
                        return (
                          <div key={crumb._id} className="flex items-center gap-2">
                            <ChevronRight size={15} className="text-slate-400 shrink-0" />
                            {isLast ? (
                              <span className="font-bold text-slate-900 flex items-center gap-1 truncate max-w-[240px]">
                                <FolderOpen size={15} className="text-amber-500 shrink-0" />
                                <span className="truncate">{crumb.name}</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleOpenFolder(crumb._id)}
                                className="text-blue-700 hover:underline cursor-pointer truncate max-w-[200px]"
                                title={`Go to ${crumb.name}`}
                              >
                                {crumb.name}
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : currentFolder ? (
                      <div className="flex items-center gap-2">
                        <ChevronRight size={15} className="text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <FolderOpen size={15} className="text-amber-500 shrink-0" />
                          <span>{currentFolder.name}</span>
                        </span>
                      </div>
                    ) : null}
                  </nav>
                </>
              );
            })()}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block sm:w-[320px]">
              <Search
                size={20}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="search"
                placeholder={`Search in ${currentFolder ? currentFolder.name : 'Home'}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            {/* <div className="flex rounded-lg border border-slate-200 bg-white p-1">
              <button className="inline-flex h-10 w-11 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-50">
                <Grid2X2 size={18} />
              </button>
              <button className="inline-flex h-10 w-11 items-center justify-center rounded-md border border-blue-600 bg-blue-50 text-blue-700">
                <List size={19} />
              </button>
            </div> */}

            {/* AI Summarize Button
            <button
              onClick={() => handleAction('summarize', currentFolder || { _id: 'root', name: 'Root Folder', kind: 'folder' })}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:from-violet-700 hover:to-indigo-800 cursor-pointer"
              title="Summarize current folder contents"
            >
              <Sparkles size={19} />
              AI Summarize
            </button> */}

            {(() => {
              const uploadAllowed = !currentFolder || currentFolder.uploadAllowed === true;
              return (
                <>
                  <button
                    onClick={() => setIsCreateFolderOpen(true)}
                    disabled={!uploadAllowed}
                    className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white shadow-sm transition ${!uploadAllowed ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-800'
                      }`}
                  >
                    <Plus size={19} />
                    New Folder
                  </button>

                  <button
                    onClick={() => setIsUploadOpen(true)}
                    disabled={!uploadAllowed}
                    className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition ${!uploadAllowed ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800'
                      }`}
                  >
                    <UploadCloud size={19} />
                    Upload
                  </button>
                </>
              );
            })()}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm h-fit max-h-[800px] overflow-y-auto">
            <button
              onClick={() => handleOpenFolder(null)}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-semibold transition ${!currentFolder ? 'text-blue-700 bg-blue-50' : 'text-slate-900 hover:bg-slate-50'}`}
            >
              <ChevronDown size={17} />
              <Folder size={21} />
              My Documents
            </button>

            <div className="mt-2 space-y-1 ml-4">
              {renderSidebarTree(folderTree)}
            </div>
          </aside>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm min-h-[500px] flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full min-w-[850px] table-fixed text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-500">
                    <th className="w-[34%] px-7 py-5">Name</th>
                    <th className="w-[18%] px-6 py-5">Manager</th>
                    <th className="w-[20%] px-6 py-5">
                      <button className="inline-flex items-center gap-2">
                        Last Modified
                        <ChevronsUpDown size={16} />
                      </button>
                    </th>
                    <th className="w-[10%] px-6 py-5">Size</th>
                    <th className="w-[12%] px-6 py-5">Type</th>
                    <th className="w-[10%] px-7 py-5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {/* Top row: Close Folder / Up to Parent */}
                  {currentFolder && (
                    <tr
                      onClick={handleCloseFolder}
                      className="cursor-pointer bg-slate-50/80 hover:bg-blue-50/70 transition text-sm text-slate-700 font-medium border-b border-slate-200 group"
                      title="Close this folder and return to previous folder"
                    >
                      <td colSpan={6} className="px-7 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-200 transition">
                              <CornerLeftUp size={18} />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-blue-700 group-hover:underline">
                                .. (Close folder &amp; return to parent level)
                              </span>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-2xs group-hover:border-blue-300 group-hover:text-blue-700">
                            <FolderX size={13} className="text-rose-500" />
                            Close Folder
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                          Loading contents...
                        </div>
                      </td>
                    </tr>
                  ) : sortedItems.length > 0 ? (
                    paginatedItems.map((item, index) => {
                      const isNearBottom = index >= Math.max(3, paginatedItems.length - 3);
                      return (
                        <React.Fragment key={item._id}>
                          <tr
                            className="text-sm font-medium text-slate-900 transition hover:bg-slate-50 group"
                          >
                            <td className="px-7 py-5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {item.kind === 'folder' && (
                                  <button
                                    type="button"
                                    onClick={(e) => toggleInlineFolder(e, item._id)}
                                    className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition cursor-pointer shrink-0"
                                    title={expandedFolders[item._id] ? "Close folder preview" : "Open folder preview to see files"}
                                  >
                                    {expandedFolders[item._id] ? (
                                      <ChevronDown size={18} className="text-blue-700" />
                                    ) : (
                                      <ChevronRight size={18} />
                                    )}
                                  </button>
                                )}
                                <div
                                  className="flex items-center gap-3.5 cursor-pointer min-w-0 flex-1"
                                  onClick={() => item.kind === 'folder' ? handleOpenFolder(item._id) : handleAction('preview', item)}
                                >
                                  <ItemIcon
                                    kind={item.kind}
                                    isOpen={item.kind === 'folder' && (Boolean(expandedFolders[item._id]) || currentFolder?._id === item._id)}
                                  />
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="truncate group-hover:text-blue-700 transition-colors font-semibold">
                                        {item.name || item.title}
                                      </span>
                                      {item.kind === 'folder' && item.folderCategory === 'Legal' && (
                                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200 shrink-0">
                                          Legal
                                        </span>
                                      )}
                                      {item.kind === 'folder' && item.folderCategory === 'Compliance' && (
                                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 shrink-0">
                                          Compliance
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                      {/* {item.kind !== 'folder' && item.approvalStatus && (
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${item.approvalStatus === 'Approved'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : item.approvalStatus === 'Rejected'
                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                          }`}>
                                          {item.approvalStatus === 'Approved' ? '✓ Approved' :
                                            item.approvalStatus === 'Rejected' ? '✕ Rejected' :
                                              item.approvalStatus === 'Pending_Dual_Approval' ? '⏳ Pending Dual Approval' :
                                                item.approvalStatus === 'Pending_Legal_Approval' ? '⏳ Pending Legal' :
                                                  item.approvalStatus === 'Pending_Compliance_Approval' ? '⏳ Pending Compliance' :
                                                    '⏳ Pending Approval'}
                                        </span>
                                      )} */}
                                      {item.isLocked && <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"><Lock size={10} /> Locked</span>}
                                      {item.isArchived && <span className="flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200"><Archive size={10} /> Archived</span>}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5 text-slate-700 font-medium truncate">
                              {item.uploadedBy?.name || item.createdBy?.name || "System"}
                            </td>

                            <td className="px-6 py-5 text-slate-700 font-medium">
                              {formatDate(item.updatedAt || item.createdAt)}
                            </td>

                            <td className="px-6 py-5 text-slate-700 font-medium">{formatSize(item.fileSize, item.kind === 'folder')}</td>

                            <td className="px-6 py-5 text-slate-700 font-medium">
                              <span className="capitalize">{item.type}</span>
                            </td>

                            <td className="px-7 py-5">
                              <div className="flex justify-end gap-2 relative">
                                <button
                                  onClick={() => setActiveDropdown(activeDropdown === item._id ? null : item._id)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-200 cursor-pointer"
                                >
                                  <MoreVertical size={20} />
                                </button>

                                {activeDropdown === item._id && (
                                  <div
                                    ref={dropdownRef}
                                    className={`absolute right-0 z-50 w-52 sm:w-56 max-h-60 sm:max-h-72 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl transition-all [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-track]:bg-transparent ${isNearBottom ? 'bottom-11 origin-bottom-right' : 'top-11 origin-top-right'
                                      }`}
                                  >
                                    {item.kind === 'folder' && (
                                      <button
                                        onClick={() => handleOpenFolder(item._id)}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                                      >
                                        <FolderOpen size={16} className="text-blue-600 shrink-0" />
                                        <span className="truncate">Open Folder</span>
                                      </button>
                                    )}
                                    {item.kind === 'folder' && expandedFolders[item._id] && (
                                      <button
                                        onClick={(e) => toggleInlineFolder(e, item._id)}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                      >
                                        <FolderX size={16} className="text-rose-500 shrink-0" />
                                        <span className="truncate">Close Folder Preview</span>
                                      </button>
                                    )}
                                    {item.kind !== 'folder' && (
                                      <button
                                        onClick={() => handleAction('preview', item)}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                                      >
                                        <Eye size={16} className="text-blue-600 shrink-0" />
                                        <span className="truncate">Preview Document</span>
                                      </button>
                                    )}
                                    {/* AI Summarize Action
                                <button 
                                  onClick={() => handleAction('summarize', item)} 
                                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-violet-700 hover:bg-violet-50 transition cursor-pointer"
                                >
                                  <Sparkles size={16} className="text-violet-600 shrink-0" />
                                  <span className="truncate">AI Summarize</span>
                                </button> */}
                                    {/* {item.kind !== 'folder' && (
                                  <button 
                                    onClick={() => handleAction('approval-history', item)} 
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                                  >
                                    <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                                    <span className="truncate">Approval History</span>
                                  </button>
                                )} */}
                                    {item.kind !== 'folder' && (
                                      <>
                                        <button
                                          onClick={() => handleAction('edit-details', item)}
                                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                        >
                                          <Edit3 size={16} className="text-slate-500 shrink-0" />
                                          <span className="truncate">Edit Details</span>
                                        </button>
                                        <button
                                          onClick={() => handleAction('metadata', item)}
                                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                        >
                                          <Database size={16} className="text-slate-500 shrink-0" />
                                          <span className="truncate">Metadata & OCR</span>
                                        </button>
                                      </>
                                    )}
                                    {/* Download action removed */}
                                    {item.kind !== 'folder' && (
                                      <button onClick={() => navigate(`/${companySlug}/manager/document-version-history?documentId=${item._id}`)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                                        <History size={16} className="text-slate-500 shrink-0" />
                                        <span className="truncate">Version History</span>
                                      </button>
                                    )}
                                    {/* <button onClick={() => handleAction('share', item)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                                  <Share2 size={16} className="text-slate-500 shrink-0" />
                                  <span className="truncate">Share</span>
                                </button> */}
                                    <button onClick={() => handleAction('archive', item)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                                      <Archive size={16} className="text-slate-500 shrink-0" />
                                      <span className="truncate">Archive</span>
                                    </button>
                                    {item.kind !== 'folder' && (
                                      <button onClick={() => handleAction('copy', item)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                                        <Copy size={16} className="text-slate-500 shrink-0" />
                                        <span className="truncate">Copy</span>
                                      </button>
                                    )}
                                    {item.kind === 'folder' && (
                                      <button onClick={() => handleAction('upload', item)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                                        <UploadCloud size={16} className="text-slate-500 shrink-0" />
                                        <span className="truncate">Add File</span>
                                      </button>
                                    )}
                                    {/* <button onClick={() => handleAction('move', item)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                                  <FolderOutput size={16} className="text-slate-500 shrink-0" />
                                  <span className="truncate">Move</span>
                                </button> */}
                                    <button onClick={() => handleAction('rename', item)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                                      <Edit3 size={16} className="text-slate-500 shrink-0" />
                                      <span className="truncate">Rename</span>
                                    </button>
                                    {/* <hr className="my-1 border-slate-100" />
                                <button onClick={() => handleAction('delete', item)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer">
                                  <Trash2 size={16} className="text-red-500 shrink-0" />
                                  <span className="truncate">Move to Trash</span>
                                </button> */}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                          {/* Inline Expanded Folder Preview */}
                          {item.kind === 'folder' && expandedFolders[item._id] && (
                            <tr className="bg-slate-50/90 border-b border-slate-200">
                              <td colSpan={6} className="px-8 py-3.5">
                                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                                    <div className="flex items-center gap-2">
                                      <FolderOpen size={18} className="text-amber-500" />
                                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Files in {item.name}:
                                      </span>
                                      <span className="text-xs text-slate-400">
                                        ({expandedFolders[item._id].items?.length || 0} items)
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenFolder(item._id)}
                                        className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 px-2.5 py-1 rounded border border-blue-200"
                                      >
                                        <span>Open Full Folder</span>
                                        <span>&rarr;</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => toggleInlineFolder(e, item._id)}
                                        className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded border border-rose-200 flex items-center gap-1 cursor-pointer"
                                        title="Close folder preview"
                                      >
                                        <FolderX size={13} />
                                        <span>Close</span>
                                      </button>
                                    </div>
                                  </div>

                                  {expandedFolders[item._id].loading ? (
                                    <div className="py-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
                                      Loading folder contents...
                                    </div>
                                  ) : expandedFolders[item._id].items?.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                      {expandedFolders[item._id].items.map((subItem) => (
                                        <div key={subItem._id} className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition">
                                          <div
                                            className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                                            onClick={() => subItem.kind === 'folder' ? handleOpenFolder(subItem._id) : handleAction('preview', subItem)}
                                          >
                                            <ItemIcon kind={subItem.kind} />
                                            <div className="flex flex-col min-w-0">
                                              <span className="text-sm font-semibold text-slate-800 hover:text-blue-700 truncate">
                                                {subItem.name || subItem.title}
                                              </span>
                                              <span className="text-[11px] text-slate-400">
                                                {subItem.type} • {formatSize(subItem.fileSize, subItem.kind === 'folder')} • {formatDate(subItem.updatedAt || subItem.createdAt)}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {subItem.kind !== 'folder' && (
                                              <button
                                                type="button"
                                                onClick={() => handleAction('preview', subItem)}
                                                className="px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded border border-blue-200 transition cursor-pointer"
                                              >
                                                Preview
                                              </button>
                                            )}
                                            {/* Subitem download removed */}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="py-4 text-center text-xs text-slate-400 italic">
                                      This folder is currently empty.
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center text-slate-500"
                      >
                        <Folder size={48} className="mx-auto mb-4 text-slate-300" />
                        <p className="text-lg font-medium text-slate-700">This folder is empty</p>
                        <p className="text-sm mt-1">Upload a file or create a new folder to get started.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={sortedItems.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemName="items"
            />
          </section>
        </section>
      </div>

      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreate={handleCreateFolder}
        parentFolderId={currentFolder?._id}
      />

      <UploadFileModal
        isOpen={isUploadOpen}
        onClose={() => { setIsUploadOpen(false); setUploadTargetFolderId(null); }}
        onUpload={handleUploadFile}
        currentFolderId={uploadTargetFolderId || currentFolder?._id}
      />

      <MoveCopyModal
        isOpen={moveCopyConfig.isOpen}
        onClose={() => setMoveCopyConfig({ isOpen: false, item: null, action: null })}
        onSubmit={submitMoveCopy}
        title={moveCopyConfig.action === 'copy' ? 'Copy Item' : 'Move Item'}
        actionName={moveCopyConfig.action === 'copy' ? 'Copy' : 'Move'}
        folderTree={folderTree}
      />

      <ShareDocumentModal
        isOpen={shareConfig.isOpen}
        onClose={() => setShareConfig({ isOpen: false, document: null })}
        onShare={handleShareDocument}
        document={shareConfig.document}
        companySlug={companySlug}
      />

      <RenameModal
        isOpen={renameConfig.isOpen}
        onClose={() => setRenameConfig({ isOpen: false, item: null })}
        onRename={handleRename}
        item={renameConfig.item}
      />

      <ConvertFormatModal
        isOpen={convertConfig.isOpen}
        onClose={() => setConvertConfig({ isOpen: false, item: null })}
        onConvert={handleConvert}
        item={convertConfig.item}
      />

      {/* AISummarizeModal
      <AISummarizeModal
        isOpen={summarizeConfig?.isOpen}
        onClose={() => setSummarizeConfig({ isOpen: false, item: null })}
        item={summarizeConfig?.item}
        companySlug={companySlug}
      /> */}

      <DocumentMetadataModal
        isOpen={metadataConfig.isOpen}
        onClose={() => setMetadataConfig({ isOpen: false, item: null, initialEditMode: false })}
        document={metadataConfig.item}
        initialEditMode={metadataConfig.initialEditMode}
        companySlug={companySlug}
        onUpdated={() => {
          if (currentFolder?._id) fetchFolderDetails(currentFolder._id);
          else fetchRootContents();
        }}
      />

      <ApprovalHistoryModal
        isOpen={approvalHistoryConfig.isOpen}
        onClose={() => setApprovalHistoryConfig({ isOpen: false, document: null })}
        document={approvalHistoryConfig.document}
        companySlug={companySlug}
      />

      <DocumentPreviewModal
        isOpen={previewConfig.isOpen}
        onClose={() => setPreviewConfig({ isOpen: false, document: null, initialTab: 'preview' })}
        document={previewConfig.document}
        initialTab={previewConfig.initialTab || 'preview'}
        companySlug={companySlug}
        folderName={currentFolder?.name || ''}
        folderCategory={currentFolder?.folderCategory || ''}
        onUpdated={() => {
          if (currentFolder?._id) fetchFolderDetails(currentFolder._id);
          else fetchRootContents();
        }}
      />
    </MainLayout>
  );
}
