import { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Filter,
  Folder,
  Search,
  Users,
  Clock3,
} from "lucide-react";

import Viewer from "../../components/Viewer/Viewer";
import { API_BASE_URL } from "../../config/api";

const typeColors = {
  PDF: "bg-red-50 text-red-600",
  DOCX: "bg-blue-50 text-blue-600",
  DOC: "bg-blue-50 text-blue-600",
  XLSX: "bg-emerald-50 text-emerald-600",
  XLS: "bg-emerald-50 text-emerald-600",
  PPTX: "bg-orange-50 text-orange-600",
  PPT: "bg-orange-50 text-orange-600",
  ZIP: "bg-violet-50 text-violet-600",
  PNG: "bg-amber-50 text-amber-600",
  JPG: "bg-amber-50 text-amber-600",
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
  return typeColors[type?.toUpperCase()] || "bg-slate-50 text-slate-600";
};

const getDocColor = (type) => {
  return typeIconColors[type?.toUpperCase()] || "bg-slate-500";
};

const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
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

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-5">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${stat.color}`}
        >
          <Icon size={31} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-600">{stat.title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {stat.value}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {stat.subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}

function SelectButton({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="flex h-11 min-w-[150px] items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition hover:bg-slate-50"
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
    <span
      className={`relative inline-flex h-7 w-6 shrink-0 items-end justify-center rounded-sm ${color} pb-1 text-[8px] font-bold text-white shadow-sm`}
    >
      <span className="absolute right-0 top-0 h-0 w-0 border-l-[7px] border-t-[7px] border-l-white/35 border-t-white" />
      {type === "PPTX" ? "P" : type === "XLSX" ? "X" : type === "DOCX" ? "W" : "PDF"}
    </span>
  );
}

function Avatar({ initials }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-orange-100 text-xs font-bold text-slate-800">
      {initials}
    </span>
  );
}

export default function SharedWithme() {
  const { companySlug } = useParams();
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [ownerFilter, setOwnerFilter] = useState("All Owners");
  const [dateFilter, setDateFilter] = useState("Date Shared");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSharedDocuments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/${companySlug}/viewer/shares/shared-with-me`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const resData = await response.json();
      if (resData.success) {
        const formatted = resData.data.map(doc => {
          const sizeStr = formatBytes(doc.fileSize);
          const timeStr = formatTimeAgo(doc.createdAt);
          return {
            _id: doc._id,
            name: doc.name,
            type: doc.fileType || "FILE",
            typeColor: getDocTypeColor(doc.fileType),
            iconColor: getDocColor(doc.fileType),
            sharedBy: doc.sharedBy || "System",
            initials: getInitials(doc.sharedBy || "System"),
            folder: doc.folderName,
            date: new Date(doc.createdAt).toLocaleDateString(),
            time: new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            meta: `${sizeStr} • ${timeStr}`,
            downloadPermission: doc.downloadPermission,
            shareLinkToken: doc.shareLinkToken,
            createdAt: doc.createdAt
          };
        });
        setDocuments(formatted);
      } else {
        setError(resData.message || "Failed to load shared documents.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error fetching shared documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companySlug) {
      fetchSharedDocuments();
    }
  }, [companySlug]);

  const handleDownload = (documentId) => {
    const token = localStorage.getItem("accessToken");
    window.open(`${API_BASE_URL}/api/${companySlug}/viewer/documents/${documentId}/download?token=${token}`, "_blank");
  };

  const handlePreview = (documentId) => {
    const token = localStorage.getItem("accessToken");
    window.open(`${API_BASE_URL}/api/${companySlug}/viewer/documents/${documentId}/preview?token=${token}`, "_blank");
  };

  const stats = useMemo(() => {
    const totalDocs = documents.length;
    const foldersSet = new Set(documents.map(d => d.folder));
    const ownersSet = new Set(documents.map(d => d.sharedBy));
    
    // Count recently shared (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = documents.filter(d => new Date(d.createdAt) > sevenDaysAgo).length;

    return [
      {
        title: "Folders",
        value: String(foldersSet.size),
        subtitle: "Shared folders",
        icon: Folder,
        color: "bg-blue-50 text-blue-600",
      },
      {
        title: "Documents",
        value: String(totalDocs),
        subtitle: "Shared documents",
        icon: FileText,
        color: "bg-emerald-50 text-emerald-600",
      },
      {
        title: "Shared By",
        value: String(ownersSet.size),
        subtitle: "People",
        icon: Users,
        color: "bg-violet-50 text-violet-600",
      },
      {
        title: "Recently Shared",
        value: String(recentCount),
        subtitle: "In last 7 days",
        icon: Clock3,
        color: "bg-orange-50 text-orange-500",
      },
    ];
  }, [documents]);

  const typeOptions = ["All Types", "PDF", "DOCX", "PPTX", "XLSX"];
  
  const ownerOptions = useMemo(() => {
    const owners = new Set(documents.map(d => d.sharedBy));
    return ["All Owners", ...Array.from(owners)];
  }, [documents]);

  const dateOptions = ["Date Shared", "Newest", "Oldest"];

  const filteredDocuments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    let docs = documents.filter((document) => {
      const matchesSearch =
        !query ||
        [document.name, document.sharedBy, document.folder, document.type]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesType =
        typeFilter === "All Types" || document.type.toUpperCase() === typeFilter.toUpperCase();
      const matchesOwner =
        ownerFilter === "All Owners" || document.sharedBy === ownerFilter;

      return matchesSearch && matchesType && matchesOwner;
    });

    if (dateFilter === "Newest") {
      docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (dateFilter === "Oldest") {
      docs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return docs;
  }, [documents, searchTerm, typeFilter, ownerFilter, dateFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("All Types");
    setOwnerFilter("All Owners");
    setDateFilter("Date Shared");
  };

  const handleExportList = () => {
    if (!filteredDocuments.length) return;
    
    const headers = ["Name", "Type", "Shared By", "Folder", "Shared On"];
    const rows = filteredDocuments.map(doc => [
      `"${doc.name.replace(/"/g, '""')}"`,
      `"${doc.type}"`,
      `"${doc.sharedBy}"`,
      `"${doc.folder}"`,
      `"${doc.date} ${doc.time}"`
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "shared_documents.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Viewer>
      <div className="mx-auto max-w-[1500px] space-y-7">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
              Shared With Me
            </h1>
            <p className="mt-3 text-base font-medium text-slate-500">
              Documents and folders that have been shared with you.
            </p>
          </div>

          <button 
            onClick={handleExportList}
            className="inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-blue-300 bg-white px-6 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
          >
            <Download size={18} />
            Export List
          </button>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </section>

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-4 md:flex-row md:flex-wrap">
              <label className="relative block md:w-[320px]">
                <Search
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search shared documents..."
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <SelectButton
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                options={typeOptions}
              />
              <SelectButton
                value={ownerFilter}
                onChange={(event) => setOwnerFilter(event.target.value)}
                options={ownerOptions}
              />
              <SelectButton
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                options={dateOptions}
              />

              <button className="inline-flex h-11 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                <Filter size={18} />
                Filters
              </button>
            </div>

            <button
              type="button"
              onClick={handleClearFilters}
              className="h-11 px-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800"
            >
              Clear All
            </button>
          </div>

          <div className="overflow-x-auto px-5">
            {loading ? (
              <p className="text-center py-10 text-slate-500 font-semibold">Loading shared documents...</p>
            ) : (
              <>
                <table className="w-full min-w-[1080px] table-fixed text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500">
                      <th className="w-[24%] py-5 pr-5">Name</th>
                      <th className="w-[10%] px-5 py-5">Type</th>
                      <th className="w-[17%] px-5 py-5">Shared By</th>
                      <th className="w-[17%] px-5 py-5">Folder</th>
                      <th className="w-[13%] px-5 py-5">Shared On</th>
                      <th className="w-[12%] px-5 py-5">Permissions</th>
                      <th className="w-[7%] py-5 pl-5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {filteredDocuments.map((document) => (
                      <tr
                        key={document._id}
                        className="text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                      >
                        <td className="py-5 pr-5">
                          <div className="flex items-center gap-5">
                            <FileIcon
                              type={document.type}
                              color={document.iconColor}
                            />
                            <span className="truncate" title={document.name}>{document.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <span
                            className={`rounded-lg px-3 py-1 text-xs font-bold ${document.typeColor}`}
                          >
                            {document.type}
                          </span>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <Avatar initials={document.initials} />
                            <span className="truncate">{document.sharedBy}</span>
                          </div>
                        </td>
                        <td className="px-5 py-5">{document.folder}</td>
                        <td className="px-5 py-5">
                          <p>{document.date}</p>
                          <p className="mt-1 text-slate-500">{document.time}</p>
                        </td>
                        <td className="px-5 py-5">
                          <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            View Only
                          </span>
                        </td>
                        <td className="py-5 pl-5">
                          <div className="flex items-center justify-end gap-4 text-slate-700">
                            <button 
                              onClick={() => handlePreview(document._id)}
                              className="rounded-md p-1 transition hover:bg-slate-100 hover:text-blue-700 cursor-pointer"
                            >
                              <Eye size={18} />
                            </button>
                            {document.downloadPermission && (
                              <button 
                                onClick={() => handleDownload(document._id)}
                                className="rounded-md p-1 transition hover:bg-slate-100 hover:text-blue-700 cursor-pointer"
                              >
                                <Download size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredDocuments.length === 0 && (
                  <p className="text-center py-10 text-slate-500 font-medium">No documents shared with you yet.</p>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
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
