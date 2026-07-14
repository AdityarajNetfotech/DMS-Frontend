import { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Grid2X2,
  List,
  Search,
  Star,
} from "lucide-react";

import Viewer from "../../components/Viewer/Viewer";
import { API_BASE_URL } from "../../config/api";

const typeColors = {
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

const getDocColor = (type) => {
  return typeColors[type?.toUpperCase()] || "bg-slate-500";
};

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + (interval === 1 ? ' year ago' : ' years ago');
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + (interval === 1 ? ' month ago' : ' months ago');
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + (interval === 1 ? ' day ago' : ' days ago');
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + (interval === 1 ? ' hour ago' : ' hours ago');
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + (interval === 1 ? ' minute ago' : ' minutes ago');
  return seconds < 10 ? 'just now' : Math.floor(seconds) + ' seconds ago';
};

function SelectButton({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="flex h-11 min-w-[140px] items-center justify-between rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition hover:bg-slate-50"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function FileIcon({ type, color }) {
  return (
    <div className="relative flex h-20 w-16 items-center justify-center rounded-md border border-slate-200 bg-slate-50 shadow-sm">
      <span className="absolute right-0 top-0 h-0 w-0 border-l-[16px] border-t-[16px] border-l-slate-200 border-t-white" />
      <span
        className={`flex h-11 min-w-11 items-center justify-center rounded ${color} px-2 text-base font-bold text-white shadow-sm`}
      >
        {type}
      </span>
    </div>
  );
}

function DocumentCard({ document, companySlug, onFavoriteToggle }) {
  const handleDownload = () => {
    const token = localStorage.getItem("accessToken");
    window.open(`${API_BASE_URL}/api/${companySlug}/viewer/documents/${document._id}/download?token=${token}`, "_blank");
  };

  const handlePreview = () => {
    const token = localStorage.getItem("accessToken");
    window.open(`${API_BASE_URL}/api/${companySlug}/viewer/documents/${document._id}/preview?token=${token}`, "_blank");
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onFavoriteToggle(document._id, document.favorite)}
          className={`rounded-md p-1 transition hover:bg-slate-100 cursor-pointer ${document.favorite ? "text-amber-500" : "text-slate-400"
            }`}
          aria-label={`Favorite ${document.name}`}
        >
          <Star
            size={21}
            fill={document.favorite ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="-mt-2 flex justify-center">
        <FileIcon type={document.type} color={document.color} />
      </div>

      <div className="mt-6">
        <h2 className="truncate text-base font-bold text-slate-950" title={document.name}>
          {document.name}
        </h2>
        <p className="mt-2 truncate text-sm font-medium text-slate-500">
          {document.folder}
        </p>
        <p className="mt-3 text-sm font-medium text-slate-700">
          {document.meta}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-start gap-3">
        <button
          onClick={handlePreview}
          className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
          aria-label={`Preview ${document.name}`}
        >
          <Eye size={18} />
        </button>
        <button
          onClick={handleDownload}
          className="inline-flex h-9 w-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 cursor-pointer"
          aria-label={`Download ${document.name}`}
        >
          <Download size={18} />
        </button>

      </div>
    </article>
  );
}

export default function MyDocument() {
  const { companySlug } = useParams();
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [folderFilter, setFolderFilter] = useState("All Folders");
  const [dateFilter, setDateFilter] = useState("Date Modified");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDocuments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/${companySlug}/viewer/documents`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const resData = await response.json();
      if (resData.success) {
        const formatted = resData.data
          .filter(doc => !doc.isArchived)
          .map(doc => {
            const sizeStr = formatBytes(doc.fileSize);
            const timeStr = formatTimeAgo(doc.createdAt);
            return {
              _id: doc._id,
              name: doc.name,
              folder: doc.folderName || "Root",
              meta: `${sizeStr} • ${timeStr}`,
              type: doc.fileType || "FILE",
              color: getDocColor(doc.fileType),
              favorite: doc.favorite,
              createdAt: doc.createdAt
            };
          });
        setDocuments(formatted);
      } else {
        setError(resData.message || "Failed to fetch documents.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error fetching documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companySlug) {
      fetchDocuments();
    }
  }, [companySlug]);

  const handleFavoriteToggle = async (documentId, isCurrentFavorite) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/${companySlug}/viewer/favorites/${documentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ isFavorite: !isCurrentFavorite }),
      });
      const data = await response.json();
      if (data.success) {
        setDocuments(prev => prev.map(doc => {
          if (doc._id === documentId) {
            return { ...doc, favorite: !isCurrentFavorite };
          }
          return doc;
        }));
      }
    } catch (err) {
      console.error("Failed to toggle favorite status", err);
    }
  };

  const typeOptions = ["All Types", "PDF", "DOCX", "XLSX", "PPTX", "ZIP"];

  const folderOptions = useMemo(() => {
    const folders = new Set(documents.map((d) => d.folder));
    return ["All Folders", ...Array.from(folders)];
  }, [documents]);

  const dateOptions = ["Date Modified", "Newest", "Oldest"];

  const filteredDocuments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    let docs = documents.filter((document) => {
      const matchesSearch =
        !query ||
        [document.name, document.folder, document.meta, document.type]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesType =
        typeFilter === "All Types" || document.type.toUpperCase() === typeFilter.toUpperCase();
      const matchesFolder =
        folderFilter === "All Folders" || document.folder === folderFilter;

      return matchesSearch && matchesType && matchesFolder;
    });

    if (dateFilter === "Newest") {
      docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (dateFilter === "Oldest") {
      docs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return docs;
  }, [documents, searchTerm, typeFilter, folderFilter, dateFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("All Types");
    setFolderFilter("All Folders");
    setDateFilter("Date Modified");
  };

  return (
    <Viewer>
      <div className="mx-auto max-w-[1500px] space-y-7">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
              My Documents
            </h1>
            <p className="mt-3 text-base font-medium text-slate-500">
              View and manage documents you have access to.
            </p>
          </div>

          {/* <div className="flex flex-wrap items-center gap-4">
            <button className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100">
              <Grid2X2 size={21} />
            </button>
            <button className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50">
              <List size={21} />
            </button>
          </div> */}
        </section>

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-4 md:flex-row md:flex-wrap">
              <label className="relative block md:w-[310px]">
                <Search
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search in my documents..."
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <SelectButton
                label="Type"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                options={typeOptions}
              />
              <SelectButton
                label="Folder"
                value={folderFilter}
                onChange={(event) => setFolderFilter(event.target.value)}
                options={folderOptions}
              />
              <SelectButton
                label="Date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                options={dateOptions}
              />

              <button className="inline-flex h-11 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                <Filter size={18} />
                Filters
              </button>
            </div>

            <button
              type="button"
              onClick={handleClearFilters}
              className="h-11 rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Clear
            </button>
          </div>

          <div className="p-5">
            {loading ? (
              <p className="text-center py-10 text-slate-500 font-semibold">Loading documents...</p>
            ) : (
              <>
                <p className="mb-5 text-sm font-bold text-slate-800">
                  Documents ({filteredDocuments.length})
                </p>

                {filteredDocuments.length === 0 ? (
                  <p className="text-center py-10 text-slate-500 font-medium">No documents found.</p>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
                    {filteredDocuments.map((document) => (
                      <DocumentCard
                        key={document._id}
                        document={document}
                        companySlug={companySlug}
                        onFavoriteToggle={handleFavoriteToggle}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-500">
              Showing 1 to {filteredDocuments.length} of {filteredDocuments.length} results
            </p>

            <div className="flex items-center gap-3">
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50">
                <ChevronLeft size={19} />
              </button>
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-sm font-bold text-blue-700">
                1
              </button>
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-900 transition hover:bg-slate-50">
                2
              </button>
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-900 transition hover:bg-slate-50">
                3
              </button>
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50">
                <ChevronRight size={19} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </Viewer>
  );
}
