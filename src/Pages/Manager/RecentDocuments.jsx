import {
  ChevronLeft,
  ChevronRight,
  Archive,
  RotateCcw,
  Folder,
  FileText,
  FileSpreadsheet,
  Search,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";

import MainLayout from "../../layout/MainLayout";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

const iconClass = {
  pdf: "bg-red-100 text-red-600",
  excel: "bg-emerald-100 text-emerald-600",
  doc: "bg-blue-100 text-blue-600",
  folder: "bg-yellow-100 text-yellow-600"
};

function ResourceIcon({ kind }) {
  const className = `flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
    iconClass[kind] || "bg-slate-100 text-slate-500"
  }`;

  if (kind === "excel") {
    return (
      <div className={className}>
        <FileSpreadsheet size={20} />
      </div>
    );
  }
  if (kind === "folder") {
    return (
      <div className={className}>
        <Folder size={20} />
      </div>
    );
  }

  return (
    <div className={className}>
      <FileText size={20} />
    </div>
  );
}

export default function RecentDocuments() {
  const { companySlug } = useParams();
  const [search, setSearch] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Password is required.");
      return;
    }
    setError("");
    setVerifying(true);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/archive/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setIsUnlocked(true);
        fetchArchive();
      } else {
        setError(data.message || "Incorrect password. Verification failed.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during verification.");
    } finally {
      setVerifying(false);
    }
  };

  const fetchArchive = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/archive`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        const folders = (data.data.folders || []).map(f => ({
          _id: f._id,
          name: f.name,
          archivedOn: f.updatedAt || f.createdAt,
          size: "-",
          kind: "folder",
          type: "Folder",
          managerName: f.createdBy?.name || "System",
          departmentName: f.departmentId?.name || "Global"
        }));

        const documents = (data.data.documents || []).map(d => ({
          _id: d._id,
          name: d.originalFileName || d.name,
          archivedOn: d.updatedAt || d.createdAt,
          size: d.fileSize ? `${(d.fileSize / (1024 * 1024)).toFixed(2)} MB` : "-",
          kind: d.fileType?.toLowerCase() || "pdf",
          type: d.fileType || "File",
          managerName: d.uploadedBy?.name || "System",
          departmentName: d.departmentId?.name || "Global"
        }));

        setItems([...folders, ...documents]);
      }
    } catch (err) {
      console.error("Failed to fetch archive", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (item) => {
    try {
      const token = localStorage.getItem("accessToken");
      const endpoint = item.kind === "folder"
        ? `${API_BASE_URL}/api/${companySlug}/manager/folders/${item._id}/archive`
        : `${API_BASE_URL}/api/${companySlug}/manager/documents/${item._id}/archive`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isArchived: false })
      });

      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.filter(i => i._id !== item._id));
      } else {
        alert(data.message || "Failed to unarchive item.");
      }
    } catch (err) {
      console.error("Failed to unarchive", err);
    }
  };

  const filteredDocuments = items.filter((doc) =>
    `${doc.name} ${doc.type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (!isUnlocked) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 font-sans">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm transition hover:shadow-md">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <Lock size={28} className="animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Archive Password Verification
              </h2>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">
                Enter your account password to unlock access to archived files and folders.
              </p>
            </div>

            <form onSubmit={handleVerifyPassword} className="mt-8 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Account Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-4 pr-12 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-100">
                  <AlertCircle size={16} className="shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={verifying}
                className="w-full inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-50"
              >
                {verifying ? "Verifying Identity..." : "Verify & Unlock"}
              </button>
            </form>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
              <Archive size={27} />
              Archive Vault
            </h1>
            <p className="mt-3 text-base text-slate-500">
              Access and manage your locked archived files and folders.
            </p>
          </div>

          <label className="relative block lg:w-[340px]">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="search"
              placeholder="Search archived documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500">
                  <th className="w-[25%] px-6 py-5">Name</th>
                  <th className="w-[15%] px-5 py-5">Manager</th>
                  <th className="w-[15%] px-5 py-5">Department</th>
                  <th className="w-[12%] px-5 py-5">Type</th>
                  <th className="w-[18%] px-5 py-5">Archived On</th>
                  <th className="w-[7%] px-5 py-5">Size</th>
                  <th className="w-[8%] px-5 py-5 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      Loading archived items...
                    </td>
                  </tr>
                ) : filteredDocuments.length > 0 ? (
                  filteredDocuments.map((document) => (
                    <tr
                      key={document._id}
                      className="text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <ResourceIcon kind={document.kind} />
                          <span className="truncate">{document.name}</span>
                        </div>
                      </td>

                      <td className="px-5 py-5 text-slate-700 font-medium">
                        {document.managerName}
                      </td>

                      <td className="px-5 py-5 text-slate-700">
                        {document.departmentName !== "Global" ? (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {document.departmentName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Global</span>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          {document.type}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        {new Date(document.archivedOn).toLocaleString()}
                      </td>

                      <td className="px-5 py-5">{document.size}</td>

                      <td className="px-5 py-5">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleUnarchive(document)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-indigo-600 transition hover:bg-indigo-50"
                            title="Restore from Archive"
                          >
                            <RotateCcw size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-slate-500"
                    >
                      No archived documents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-500">
              Showing {filteredDocuments.length} of {items.length} results
            </p>
            <div className="flex items-center gap-3">
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400">
                <ChevronLeft size={19} />
              </button>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-sm font-semibold text-white">
                1
              </button>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400">
                <ChevronRight size={19} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
