import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Folder,
  Upload,
  ArrowLeft,
  Search,
} from "lucide-react";

import Viewer from "../../components/Viewer/Viewer";
import UploadFileModal from "../../components/Manager/UploadFileModal";
import { API_BASE_URL } from "../../config/api";

const typeColors = {
  PDF: "bg-red-50 text-red-600 border border-red-100",
  DOCX: "bg-blue-50 text-blue-600 border border-blue-100",
  DOC: "bg-blue-50 text-blue-600 border border-blue-100",
  XLSX: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  XLS: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  PPTX: "bg-orange-50 text-orange-600 border border-orange-100",
  PPT: "bg-orange-50 text-orange-600 border border-orange-100",
  ZIP: "bg-violet-50 text-violet-600 border border-violet-100",
  PNG: "bg-amber-50 text-amber-600 border border-amber-100",
  JPG: "bg-amber-50 text-amber-600 border border-amber-100",
};

const typeIconColors = {
  PDF: "bg-red-600",
  DOCX: "bg-blue-600",
  DOC: "bg-blue-600",
  XLSX: "bg-emerald-600",
  XLS: "bg-emerald-600",
  PPTX: "bg-orange-500",
  PPT: "bg-orange-500",
  ZIP: "bg-violet-600",
  PNG: "bg-amber-500",
  JPG: "bg-amber-500",
};

const getDocTypeColor = (type) => {
  return typeColors[type?.toUpperCase()] || "bg-slate-50 text-slate-600 border border-slate-100";
};

const getDocColor = (type) => {
  return typeIconColors[type?.toUpperCase()] || "bg-slate-500";
};

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

function FileIcon({ type, color, isFolder }) {
  if (isFolder) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-600 shadow-sm">
        <Folder size={18} />
      </span>
    );
  }
  return (
    <span
      className={`relative inline-flex h-8 w-7 shrink-0 items-end justify-center rounded-sm ${color} pb-1.5 text-[8px] font-bold text-white shadow-sm`}
    >
      <span className="absolute right-0 top-0 h-0 w-0 border-l-[7px] border-t-[7px] border-l-white/35 border-t-white" />
      {type === "PPTX" ? "P" : type === "XLSX" ? "X" : type === "DOCX" ? "W" : "PDF"}
    </span>
  );
}

export default function SharedFolderDetail() {
  const { companySlug, folderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [folder, setFolder] = useState(null);
  const [items, setItems] = useState([]); // holds child folders & documents
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const uploadPermission = queryParams.get("uploadAllowed") === "true";

  const fetchFolderContents = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/${companySlug}/viewer/folders/${folderId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const resData = await response.json();
      if (resData.success) {
        setFolder(resData.data.folder);
        
        const childFlds = (resData.data.childFolders || []).map(f => ({
          ...f,
          isFolder: true,
          type: "Folder",
          typeColor: "bg-blue-50 text-blue-600 border border-blue-100",
          iconColor: "bg-blue-600",
          meta: "Folder",
          createdAt: f.createdAt
        }));

        const docs = (resData.data.documents || []).map(d => ({
          ...d,
          isFolder: false,
          type: d.fileType || "FILE",
          typeColor: getDocTypeColor(d.fileType),
          iconColor: getDocColor(d.fileType),
          meta: formatBytes(d.fileSize),
          createdAt: d.createdAt
        }));

        setItems([...childFlds, ...docs]);
      } else {
        setError(resData.message || "Failed to load folder contents.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error fetching folder contents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companySlug && folderId) {
      fetchFolderContents();
    }
  }, [companySlug, folderId]);

  const handleDownload = (documentId, name) => {
    const token = localStorage.getItem("accessToken");
    window.open(`${API_BASE_URL}/api/${companySlug}/viewer/documents/${documentId}/download?token=${token}`, "_blank");
  };

  const handlePreview = (documentId) => {
    const token = localStorage.getItem("accessToken");
    window.open(`${API_BASE_URL}/api/${companySlug}/viewer/documents/${documentId}/preview?token=${token}`, "_blank");
  };

  const handleUploadFile = async (formData) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
  };

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(query) || 
      (item.originalFileName && item.originalFileName.toLowerCase().includes(query))
    );
  }, [items, searchTerm]);

  return (
    <Viewer>
      <div className="flex-1 space-y-6 p-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Link to={`/${companySlug}/viewer/shared-with-me`} className="hover:text-blue-600 flex items-center gap-1">
                <ArrowLeft size={16} />
                Shared with me
              </Link>
              <span>/</span>
              <span className="text-slate-900">{folder?.name || "Folder Details"}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-950 flex items-center gap-2">
              <Folder className="text-blue-600" size={24} />
              {folder?.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {uploadPermission && (
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-sm"
              >
                <Upload size={18} />
                Upload Document
              </button>
            )}
          </div>
        </header>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex border-b border-slate-200 p-5 items-center justify-between">
            <label className="relative block w-full md:w-[320px]">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search inside folder..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          <div className="overflow-x-auto px-5">
            {loading ? (
              <p className="text-center py-12 text-slate-500 font-semibold">Loading contents...</p>
            ) : error ? (
              <p className="text-center py-12 text-red-500 font-semibold">{error}</p>
            ) : (
              <>
                <table className="w-full min-w-[900px] table-fixed text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500">
                      <th className="w-[45%] py-4 pr-5">Name</th>
                      <th className="w-[15%] px-5 py-4">Type</th>
                      <th className="w-[20%] px-5 py-4">Size</th>
                      <th className="w-[20%] py-4 pl-5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {filteredItems.map((item) => (
                      <tr
                        key={item._id}
                        className="text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                      >
                        <td className="py-4 pr-5">
                          <div className="flex items-center gap-5">
                            <FileIcon
                              type={item.type}
                              color={item.iconColor}
                              isFolder={item.isFolder}
                            />
                            {item.isFolder ? (
                              <button
                                onClick={() => navigate(`/${companySlug}/viewer/shared-folders/${item._id}?uploadAllowed=${uploadPermission}`)}
                                className="truncate hover:text-blue-600 hover:underline text-left cursor-pointer font-semibold"
                                title={item.name}
                              >
                                {item.name}
                              </button>
                            ) : (
                              <span className="truncate" title={item.name}>{item.name}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-lg px-3 py-1 text-xs font-bold ${item.typeColor}`}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {item.isFolder ? "Folder" : item.meta}
                        </td>
                        <td className="py-4 pl-5">
                          <div className="flex items-center justify-end gap-4 text-slate-700">
                            {item.isFolder ? (
                              <button
                                onClick={() => navigate(`/${companySlug}/viewer/shared-folders/${item._id}?uploadAllowed=${uploadPermission}`)}
                                className="rounded-md px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer transition"
                              >
                                Open
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handlePreview(item._id)}
                                  title="Preview document"
                                  className="rounded-md p-1 transition hover:bg-slate-100 hover:text-blue-700 cursor-pointer"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={() => handleDownload(item._id)}
                                  title="Download document"
                                  className="rounded-md p-1 transition hover:bg-slate-100 hover:text-blue-700 cursor-pointer"
                                >
                                  <Download size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredItems.length === 0 && (
                  <p className="text-center py-12 text-slate-500 font-medium">This folder is empty.</p>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      <UploadFileModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUploadFile}
        onUploadSuccess={() => {
          fetchFolderContents();
        }}
        companySlug={companySlug}
        currentFolderId={folderId}
      />
    </Viewer>
  );
}
