import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

import {
  ArrowUpDown,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  FileText,
  Check,
  Folder,
  Presentation,
  Search,
  RefreshCw,
  Sparkles,
  UserRound,
} from "lucide-react";

import MainLayout from "../../layout/MainLayout";
import { API_BASE_URL } from "../../config/api";

const defaultFilters = {
  documentType: "All Types",
  uploadedBy: "All Users",
  dateRange: "Any Time",
  tag: "All Tags",
  fileSize: "Any Size",
  accessLevel: "Any Access Level",
  department: "Any Department",
  dateModified: "Any Time",
  owner: "Any Owner",
  hasVersion: "Any",
  shared: "Any",
};

// filterButtons is now dynamically defined inside the component to support dynamic users

const results = [
  {
    name: "Q2 Financial Report.xlsx",
    owner: "Manager",
    avatar: "M",
    modified: "May 16, 2025 10:30 AM",
    size: "2.4 MB",
    type: "Excel",
    location: "Project Alpha / Reports",
    kind: "excel",
    tags: ["Finance", "Report"],
    accessLevel: "Department",
    department: "Finance",
    hasVersion: true,
    shared: true,
    starred: true,
  },
  {
    name: "Annual Financial Report.pdf",
    owner: "Manager",
    avatar: "M",
    modified: "May 15, 2025 02:15 PM",
    size: "2.2 MB",
    type: "PDF",
    location: "Finance / Reports",
    kind: "pdf",
    tags: ["Finance", "Report"],
    accessLevel: "Public",
    department: "Finance",
    hasVersion: true,
    shared: true,
    starred: false,
  },
  {
    name: "Financial Summary 2024.xlsx",
    owner: "Manager",
    avatar: "M",
    modified: "May 14, 2025 11:05 AM",
    size: "1.8 MB",
    type: "Excel",
    location: "HR Documents / Reports",
    kind: "excel",
    tags: ["Finance", "Summary"],
    accessLevel: "Department",
    department: "HR",
    hasVersion: false,
    shared: false,
    starred: false,
  },
  {
    name: "Financial Analysis.docx",
    owner: "John Doe",
    avatar: "J",
    modified: "May 13, 2025 04:20 PM",
    size: "1.6 MB",
    type: "Word",
    location: "Project Alpha / Finance",
    kind: "word",
    tags: ["Finance"],
    accessLevel: "Private",
    department: "Finance",
    hasVersion: true,
    shared: false,
    starred: true,
  },
  {
    name: "Q1 Financial Report.pdf",
    owner: "Jane Smith",
    avatar: "J",
    modified: "May 12, 2025 09:25 AM",
    size: "1.9 MB",
    type: "PDF",
    location: "Finance / Q1 Reports",
    kind: "pdf",
    tags: ["Finance", "Report"],
    accessLevel: "Department",
    department: "Finance",
    hasVersion: true,
    shared: true,
    starred: false,
  },
  {
    name: "Financial Overview.pptx",
    owner: "Manager",
    avatar: "M",
    modified: "May 11, 2025 03:10 PM",
    size: "3.1 MB",
    type: "PowerPoint",
    location: "Project Alpha / Presentations",
    kind: "powerpoint",
    tags: ["Finance", "Summary"],
    accessLevel: "Public",
    department: "Operations",
    hasVersion: false,
    shared: true,
    starred: false,
  },
  {
    name: "Budget vs Actual.xlsx",
    owner: "Robert Brown",
    avatar: "R",
    modified: "May 10, 2025 10:45 AM",
    size: "2.0 MB",
    type: "Excel",
    location: "Finance / Budget",
    kind: "excel",
    tags: ["Finance", "Budget"],
    accessLevel: "Private",
    department: "Finance",
    hasVersion: false,
    shared: false,
    starred: true,
  },
  {
    name: "Audit Financial Report.pdf",
    owner: "Sarah Wilson",
    avatar: "S",
    modified: "May 9, 2025 02:40 PM",
    size: "2.3 MB",
    type: "PDF",
    location: "Audit / Reports",
    kind: "pdf",
    tags: ["Finance", "Audit", "Report"],
    accessLevel: "Department",
    department: "Audit",
    hasVersion: true,
    shared: true,
    starred: false,
  },
];

const iconClass = {
  excel: "bg-emerald-100 text-emerald-600",
  pdf: "bg-red-100 text-red-600",
  word: "bg-blue-100 text-blue-700",
  powerpoint: "bg-orange-100 text-orange-600",
};

function DropdownButton({ label, icon: Icon, active, isOpen, onClick, children }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex h-11 items-center justify-between gap-3 rounded-lg border px-4 text-sm font-semibold transition ${active
          ? "border-blue-600 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
          }`}
      >
        <span className="flex items-center gap-3">
          {Icon ? <Icon size={18} /> : null}
          {label}
        </span>
        <ChevronDown size={17} className={`transition ${isOpen ? "rotate-180" : "rotate-0"}`} />
      </button>

      {isOpen ? (
        <div className="absolute z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function SelectBox({ label, value, options, onChange }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-900">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-left text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ResultIcon({ kind }) {
  const className = `flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${iconClass[kind] || "bg-slate-100 text-slate-500"
    }`;

  if (kind === "excel") {
    return (
      <div className={className}>
        <FileSpreadsheet size={18} />
      </div>
    );
  }

  if (kind === "powerpoint") {
    return (
      <div className={className}>
        <Presentation size={18} />
      </div>
    );
  }

  return (
    <div className={className}>
      <FileText size={18} />
    </div>
  );
}

function Avatar({ value }) {
  const isManager = value === "M";

  return (
    <span
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isManager ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"
        }`}
    >
      {value}
    </span>
  );
}

function IdPickerDropdown({ companySlug, selectedIds, setSelectedIds }) {
  const PAGE_SIZE = 5;
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const dropdownRef = useRef(null);

  const fetchDocumentIds = async (pageNum, search) => {
    setLoadingDocs(true);
    try {
      const token = localStorage.getItem("accessToken");
      let url = `${API_BASE_URL}/api/${companySlug}/manager/search/document-ids?page=${pageNum}&limit=${PAGE_SIZE}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data.documents);
        setTotalPages(data.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch document IDs", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocumentIds(page, searchFilter);
    }
  }, [isOpen, page, searchFilter]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleId = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSearchChange = (e) => {
    setSearchFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="relative w-full lg:w-[280px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`inline-flex h-11 w-full items-center justify-between gap-2 rounded-lg border px-4 text-sm font-semibold transition ${
          selectedIds.length > 0
            ? "border-blue-600 bg-blue-50 text-blue-700"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <FileText size={17} />
          {selectedIds.length > 0
            ? `${selectedIds.length} Doc ID${selectedIds.length > 1 ? "s" : ""} selected`
            : "Select Document IDs"}
        </span>
        <ChevronDown size={17} className={`shrink-0 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-2 w-full min-w-[340px] rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="p-2 border-b border-slate-100">
            <input
              type="text"
              value={searchFilter}
              onChange={handleSearchChange}
              placeholder="Search documents..."
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
            {loadingDocs ? (
              <p className="px-3 py-4 text-center text-sm text-slate-400">Loading...</p>
            ) : documents.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-slate-400">No documents found</p>
            ) : (
              documents.map((doc) => {
                const isSelected = selectedIds.includes(doc._id);
                return (
                  <button
                    key={doc._id}
                    type="button"
                    onClick={() => toggleId(doc._id)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={13} />}
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{doc.name || doc.originalFileName}</span>
                      <span className="text-xs text-slate-400 font-mono truncate">{doc._id}</span>
                    </span>
                    <span className="ml-auto shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 uppercase">
                      {doc.fileType}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-medium text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {selectedIds.length > 0 && (
            <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">{selectedIds.length} selected</span>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs font-medium text-red-600 hover:text-red-700 transition"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Searchandfilter() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const initialCF = searchParams.get("cf") || "";
  const initialIds = searchParams.get("ids") ? searchParams.get("ids").split(",") : [];

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [customerOrFilename, setCustomerOrFilename] = useState(initialCF);
  const [selectedIds, setSelectedIds] = useState(initialIds);

  const [filters, setFilters] = useState(defaultFilters);
  const [openFilter, setOpenFilter] = useState(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [starredOnly, setStarredOnly] = useState(false);
  const [sortBy, setSortBy] = useState("Relevance");

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState(null);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [debouncedCustomerOrFilename, setDebouncedCustomerOrFilename] = useState(customerOrFilename);
  const [debouncedSelectedIds, setDebouncedSelectedIds] = useState(selectedIds);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE_URL}/api/${companySlug}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setUsers(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, [companySlug]);

  const filterButtons = useMemo(() => [
    {
      key: "documentType",
      label: "Document Type",
      icon: FileText,
      options: ["All Types", "PDF", "Excel", "Word", "PowerPoint"],
    },
    {
      key: "uploadedBy",
      label: "Uploaded By",
      icon: UserRound,
      options: ["All Users", ...users.map(u => u.name)],
    },
    {
      key: "dateRange",
      label: "Date Range",
      icon: Calendar,
      options: ["Any Time", "Last 7 Days", "Last 30 Days", "Older"],
    },
  ], [users]);

  // Sync state if param in URL changes (e.g. from navbar search)
  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
    setCustomerOrFilename(searchParams.get("cf") || "");
    const idsParam = searchParams.get("ids");
    setSelectedIds(idsParam ? idsParam.split(",") : []);
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setDebouncedCustomerOrFilename(customerOrFilename);
      setDebouncedSelectedIds(selectedIds);
      setSearchParams((prev) => {
        if (searchTerm) prev.set("q", searchTerm); else prev.delete("q");
        if (customerOrFilename) prev.set("cf", customerOrFilename); else prev.delete("cf");
        if (selectedIds.length > 0) prev.set("ids", selectedIds.join(",")); else prev.delete("ids");
        return prev;
      }, { replace: true });
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, customerOrFilename, selectedIds, setSearchParams]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");

        let url = `${API_BASE_URL}/api/${companySlug}/manager/search?query=${encodeURIComponent(debouncedSearchTerm)}`;

        if (debouncedCustomerOrFilename) {
          url += `&customerOrFilename=${encodeURIComponent(debouncedCustomerOrFilename)}`;
        }
        if (debouncedSelectedIds.length > 0) {
          url += `&idQuery=${encodeURIComponent(debouncedSelectedIds.join(","))}`;
        }

        let apiSortBy = 'name';
        let apiOrder = 'desc';
        if (sortBy === 'Newest') { apiSortBy = 'uploadDate'; apiOrder = 'desc'; }
        else if (sortBy === 'Oldest') { apiSortBy = 'uploadDate'; apiOrder = 'asc'; }
        else if (sortBy === 'Name') { apiSortBy = 'name'; apiOrder = 'asc'; }

        url += `&sortBy=${apiSortBy}&order=${apiOrder}`;

        if (starredOnly) url += `&isFavorite=true`;

        if (filters.documentType !== "All Types") {
          url += `&fileType=${filters.documentType}`;
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success) {
          const docs = data.data.documents.map(d => ({ ...d, kind: d.fileType?.toLowerCase() || 'pdf', type: d.fileType || 'File' }));
          const flds = (data.data.folders || []).map(f => ({ ...f, kind: 'folder', type: 'Folder' }));

          let combined = [...flds, ...docs];
          setSearchResults(combined.filter(item => !item.isArchived));
        }
      } catch (err) {
        console.error("Failed to search", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [companySlug, debouncedSearchTerm, debouncedCustomerOrFilename, debouncedSelectedIds, sortBy, starredOnly, filters]);

  const filteredResults = useMemo(() => {
    let list = searchResults;

    // Filter by Uploaded By
    if (filters.uploadedBy && filters.uploadedBy !== "All Users") {
      list = list.filter(item => {
        const uploaderName = item.uploadedBy?.name || item.createdBy?.name || "System";
        return uploaderName === filters.uploadedBy;
      });
    }

    // Filter by Date Range
    if (filters.dateRange && filters.dateRange !== "Any Time") {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      list = list.filter(item => {
        const date = new Date(item.createdAt || item.modified || Date.now());
        if (filters.dateRange === "Last 7 Days") {
          return date >= sevenDaysAgo;
        } else if (filters.dateRange === "Last 30 Days") {
          return date >= thirtyDaysAgo;
        } else if (filters.dateRange === "Older") {
          return date < thirtyDaysAgo;
        }
        return true;
      });
    }

    return list;
  }, [searchResults, filters.uploadedBy, filters.dateRange]);

  const handleReset = () => {
    setSearchTerm("");
    setCustomerOrFilename("");
    setSelectedIds([]);
    setFilters(defaultFilters);
    setOpenFilter(null);
    setStarredOnly(false);
    setSortBy("Relevance");
  };

  const handleBackfill = async () => {
    setBackfilling(true);
    setBackfillResult(null);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/documents/backfill-text`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBackfillResult(data);
    } catch (err) {
      setBackfillResult({ success: false, message: "Backfill failed: " + err.message });
    } finally {
      setBackfilling(false);
    }
  };

  // Highlight occurrences of the search term inside a snippet string
  const highlightSnippet = (snippet, term) => {
    if (!term || !snippet) return snippet;
    const parts = snippet.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase()
        ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark>
        : part
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setOpenFilter(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950">
              Search &amp; Filters
            </h1>
            <p className="mt-3 text-base text-slate-500">
              Find documents quickly — searches file names, tags, descriptions, and <strong>document content</strong>.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={handleBackfill}
              disabled={backfilling}
              title="Re-index older documents so their text content can be searched"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {backfilling ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {backfilling ? "Indexing..." : "Re-index Documents"}
            </button>
            {backfillResult && (
              <p className={`text-xs font-medium ${backfillResult.success ? "text-emerald-600" : "text-red-500"}`}>
                {backfillResult.message}
              </p>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center w-full">
            <label className="relative block w-full lg:w-[350px]">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search text / content..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="relative block w-full lg:w-[250px]">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="search"
                value={customerOrFilename}
                onChange={(event) => setCustomerOrFilename(event.target.value)}
                placeholder="Customer or Filename..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <IdPickerDropdown
              companySlug={companySlug}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchTerm((current) => current.trim());
                  setCustomerOrFilename((current) => current.trim());
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
              >
                <Search size={17} />
                Search
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>

          {/* <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
            <Bookmark size={18} />
            Save Search
          </button> */}
        </section>

        <section className="flex flex-wrap gap-4">
          {filterButtons.map((filter) => (
            <DropdownButton
              key={filter.key}
              label={filter.label}
              icon={filter.icon}
              active={filters[filter.key] !== defaultFilters[filter.key]}
              isOpen={openFilter === filter.key}
              onClick={() => setOpenFilter((current) => (current === filter.key ? null : filter.key))}
            >
              <div className="space-y-1">
                {filter.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleFilterChange(filter.key, option)}
                    className={`block w-full rounded-md px-3 py-2 text-left text-sm font-medium transition ${filters[filter.key] === option
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </DropdownButton>
          ))}

        </section>

        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing {filteredResults.length ? 1 : 0} to {filteredResults.length} of {filteredResults.length} results{searchTerm ? ` for “${searchTerm}”` : ""}
          </p>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none"
          >
            <option value="Relevance">Sort by: Relevance</option>
            <option value="Newest">Sort by: Newest</option>
            <option value="Oldest">Sort by: Oldest</option>
            <option value="Name">Sort by: Name</option>
          </select>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] table-fixed text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500">
                  <th className="w-[22%] px-6 py-4">
                    <span className="inline-flex items-center gap-2">
                      Name <ArrowUpDown size={15} />
                    </span>
                  </th>
                  <th className="w-[12%] px-5 py-4">Uploaded By</th>
                  <th className="w-[12%] px-5 py-4">Department</th>
                  <th className="w-[14%] px-5 py-4">
                    <span className="inline-flex items-center gap-2">
                      Last Modified <ArrowUpDown size={15} />
                    </span>
                  </th>
                  <th className="w-[8%] px-5 py-4">Size</th>
                  <th className="w-[8%] px-5 py-4">Type</th>
                  <th className="w-[18%] px-5 py-4">Location</th>
                  <th className="w-[8%] px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">Loading results...</td>
                  </tr>
                ) : filteredResults.length > 0 ? (
                  filteredResults.map((result) => (
                    <tr
                      key={result._id || result.id || result.name}
                      className="text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <ResultIcon kind={result.kind} />
                            <span className="truncate font-semibold">{result.name || result.originalFileName}</span>
                            {result.contentSnippet && (
                              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-yellow-50 border border-yellow-200 px-2 py-0.5 text-[10px] font-semibold text-yellow-700">
                                <Search size={10} /> Content match
                              </span>
                            )}
                          </div>
                          {result.contentSnippet && (
                            <p className="ml-11 text-xs text-slate-500 leading-relaxed line-clamp-2">
                              {highlightSnippet(result.contentSnippet, debouncedSearchTerm)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar value={(result.uploadedBy?.name || result.createdBy?.name || "S").charAt(0).toUpperCase()} />
                          <span className="truncate">{result.uploadedBy?.name || result.createdBy?.name || "System"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {result.departmentId?.name ? (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {result.departmentId.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Global</span>
                        )}
                      </td>
                      <td className="px-5 py-4">{new Date(result.createdAt || result.modified || Date.now()).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        {result.kind === 'folder'
                          ? (result.fileSize ? (result.fileSize / (1024 * 1024) < 1 ? `${(result.fileSize / 1024).toFixed(1)} KB` : `${(result.fileSize / (1024 * 1024)).toFixed(2)} MB`) : '0 KB')
                          : (result.fileSize ? (result.fileSize / (1024 * 1024) < 1 ? `${(result.fileSize / 1024).toFixed(1)} KB` : `${(result.fileSize / (1024 * 1024)).toFixed(2)} MB`) : '-')}
                      </td>
                      <td className="px-5 py-4">{result.type}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Folder size={18} className="shrink-0 text-slate-700" />
                          <span className="truncate">{result.folderId || result.parentFolder ? "Nested" : "Root"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              if (result.kind === 'folder') {
                                navigate(`/${companySlug}/manager/folder-explorer?folderId=${result._id}`);
                              } else {
                                const token = localStorage.getItem('accessToken');
                                window.open(`${API_BASE_URL}/api/${companySlug}/manager/documents/${result._id}/preview?token=${token}`, '_blank');
                              }
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-800 transition hover:bg-slate-100"
                            aria-label={`Preview ${result.name || result.originalFileName}`}
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">No results found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing {filteredResults.length > 0 ? 1 : 0} to {filteredResults.length} of {filteredResults.length} results
            </p>

            <div className="flex items-center gap-3">
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50"
                aria-label="Previous page"
              >
                <ChevronLeft size={19} />
              </button>
              {[1].map((page) => (
                <button
                  key={page}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition border-blue-700 bg-blue-700 text-white"
                  aria-label={`Page ${page}`}
                >
                  {page}
                </button>
              ))}
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
                aria-label="Next page"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
