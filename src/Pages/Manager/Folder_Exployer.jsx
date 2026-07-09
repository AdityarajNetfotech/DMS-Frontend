import {
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
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
  Share2
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import { API_BASE_URL } from "../../config/api";
import CreateFolderModal from "../../components/Manager/CreateFolderModal";
import UploadFileModal from "../../components/Manager/UploadFileModal";
import MoveCopyModal from "../../components/Manager/MoveCopyModal";
import ShareDocumentModal from "../../components/Manager/ShareDocumentModal";

const iconStyles = {
  folder: "bg-amber-100 text-amber-500",
  word: "bg-blue-100 text-blue-700",
  pdf: "bg-red-100 text-red-600",
  excel: "bg-emerald-100 text-emerald-600",
  powerpoint: "bg-orange-100 text-orange-600",
};

function ItemIcon({ kind }) {
  const className = `flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
    iconStyles[kind] || "bg-slate-100 text-slate-500"
  }`;

  if (kind === "folder") {
    return (
      <div className={className}>
        <Folder size={22} fill="currentColor" strokeWidth={1.7} />
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
  const [search, setSearch] = useState("");
  const [folderTree, setFolderTree] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null); // null means root
  const [items, setItems] = useState([]); // combined folders and files
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals state
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState(null);
  const [moveCopyConfig, setMoveCopyConfig] = useState({ isOpen: false, item: null, action: null });
  const [shareConfig, setShareConfig] = useState({ isOpen: false, document: null });
  const [activeDropdown, setActiveDropdown] = useState(null);
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
      if (data.success) {
        setFolderTree(data.data);
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
        
        const formattedItems = [
          ...childFolders.map(f => ({ ...f, kind: 'folder', type: 'Folder' })),
          ...documents.map(d => ({ ...d, kind: getFileKind(d.fileType), type: d.fileType || 'File' }))
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
    fetchFolderDetails(null);
  }, [fetchFolderTree, fetchFolderDetails]);

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
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'excel';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'powerpoint';
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
        window.open(`${API_BASE_URL}/api/${companySlug}/manager/documents/${item._id}/preview?token=${token}`, '_blank');
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
    return folders.map((folder) => (
      <div key={folder._id}>
        <button
          onClick={() => fetchFolderDetails(folder._id)}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          className={`flex w-full items-center gap-3 rounded-lg py-2.5 pr-3 text-left text-sm font-semibold transition ${
            currentFolder?._id === folder._id
              ? "bg-blue-50 text-blue-700"
              : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          {folder.children?.length > 0 ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} className="opacity-0" />
          )}
          <Folder size={20} />
          <span className="truncate">{folder.name}</span>
        </button>
        {folder.children?.length > 0 && (
          <div className="mt-1 border-l border-slate-200 ml-[22px]">
            {renderSidebarTree(folder.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-10">
        <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950">
              Folder Explorer
            </h1>
            <p className="mt-3 text-base text-slate-500">
              Browse and manage your folders and documents.
            </p>

            <nav className="mt-5 flex items-center gap-3 text-sm font-medium">
              <button onClick={() => fetchFolderDetails(null)} className="text-blue-700 hover:underline">
                Home
              </button>
              {currentFolder && (
                <>
                  <ChevronRight size={16} className="text-slate-400" />
                  <span className="text-slate-900">{currentFolder.name}</span>
                </>
              )}
            </nav>
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

            <div className="flex rounded-lg border border-slate-200 bg-white p-1">
              <button className="inline-flex h-10 w-11 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-50">
                <Grid2X2 size={18} />
              </button>
              <button className="inline-flex h-10 w-11 items-center justify-center rounded-md border border-blue-600 bg-blue-50 text-blue-700">
                <List size={19} />
              </button>
            </div>

            <button 
              onClick={() => setIsCreateFolderOpen(true)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              <Plus size={19} />
              New Folder
            </button>
            
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <UploadCloud size={19} />
              Upload
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm h-fit max-h-[800px] overflow-y-auto">
            <button 
              onClick={() => fetchFolderDetails(null)}
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
                    <th className="w-[28%] px-7 py-5">Name</th>
                    <th className="w-[16%] px-6 py-5">Manager</th>
                    <th className="w-[16%] px-6 py-5">Department</th>
                    <th className="w-[18%] px-6 py-5">
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
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                          Loading contents...
                        </div>
                      </td>
                    </tr>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <tr
                        key={item._id}
                        className="text-sm font-medium text-slate-900 transition hover:bg-slate-50 group"
                      >
                        <td className="px-7 py-5">
                          <div 
                            className="flex items-center gap-4 cursor-pointer"
                            onClick={() => item.kind === 'folder' ? fetchFolderDetails(item._id) : handleAction('preview', item)}
                          >
                            <ItemIcon kind={item.kind} />
                            <div className="flex flex-col">
                              <span className="truncate group-hover:text-blue-700 transition-colors">
                                {item.name || item.title}
                              </span>
                              {(item.isLocked || item.isArchived) && (
                                <div className="flex items-center gap-2 mt-1">
                                  {item.isLocked && <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"><Lock size={10} /> Locked</span>}
                                  {item.isArchived && <span className="flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200"><Archive size={10} /> Archived</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-slate-700 font-medium truncate">
                          {item.uploadedBy?.name || item.createdBy?.name || "System"}
                        </td>

                        <td className="px-6 py-5 text-slate-700">
                          {item.departmentId?.name ? (
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                              {item.departmentId.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Global</span>
                          )}
                        </td>

                        <td className="px-6 py-5 text-slate-800">
                          {formatDate(item.updatedAt || item.createdAt)}
                        </td>

                        <td className="px-6 py-5">{formatSize(item.fileSize, item.kind === 'folder')}</td>

                        <td className="px-6 py-5">
                          <span className="capitalize">{item.type}</span>
                        </td>

                        <td className="px-7 py-5 relative">
                          <div className="flex justify-end">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === item._id ? null : item._id)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-200"
                            >
                              <MoreVertical size={20} />
                            </button>
                            
                            {activeDropdown === item._id && (
                              <div ref={dropdownRef} className="absolute right-12 top-10 z-10 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                                <button onClick={() => handleAction('download', item)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                  <Download size={16} /> Download
                                </button>
                                {item.kind !== 'folder' && (
                                  <button onClick={() => handleAction('preview', item)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                    <Eye size={16} /> View File
                                  </button>
                                )}
                                <button onClick={() => handleAction('share', item)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                  <Share2 size={16} /> Share
                                </button>
                                <button onClick={() => handleAction('archive', item)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                  <Archive size={16} /> Archive
                                </button>
                                {item.kind !== 'folder' && (
                                  <button onClick={() => handleAction('copy', item)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                    <Copy size={16} /> Copy
                                  </button>
                                )}
                                {item.kind === 'folder' && (
                                  <button onClick={() => handleAction('upload', item)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                    <UploadCloud size={16} /> Add File
                                  </button>
                                )}
                                <button onClick={() => handleAction('move', item)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                  <FolderOutput size={16} /> Move
                                </button>
                                <hr className="my-1 border-slate-100" />
                                <button onClick={() => handleAction('delete', item)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                  <Trash2 size={16} /> Move to Trash
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
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

            <div className="border-t border-slate-200 px-7 py-4 bg-slate-50/50 mt-auto">
              <p className="text-sm text-slate-500">
                Showing {filteredItems.length} items
              </p>
            </div>
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
    </MainLayout>
  );
}
