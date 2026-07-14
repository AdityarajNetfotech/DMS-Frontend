import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import TenantModal from "../components/Admin/TenantModal";

import { API_BASE_URL } from "../config/api";

const API_BASE = `${API_BASE_URL}/api/tenant`;

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

const colorPalette = [
  "bg-blue-600", "bg-emerald-600", "bg-violet-600", "bg-rose-600",
  "bg-amber-600", "bg-indigo-600", "bg-teal-600", "bg-pink-600",
  "bg-cyan-600", "bg-orange-600",
];

export default function TenantManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setTenants(data.tenants);
      }
    } catch (err) {
      console.error("Failed to fetch tenants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    const handleGlobalSearch = (e) => {
      setSearchTerm(e.detail || "");
      setCurrentPage(1);
    };
    window.addEventListener("global-search", handleGlobalSearch);
    return () => window.removeEventListener("global-search", handleGlobalSearch);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: "success", message: `Tenant "${name}" deleted.` });
        fetchTenants();
      } else {
        setToast({ type: "error", message: data.message || "Delete failed." });
      }
    } catch {
      setToast({ type: "error", message: "Network error." });
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.companyCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredTenants.length / ITEMS_PER_PAGE));
  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Toast Notification ── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-medium shadow-lg transition-all animate-in slide-in-from-right ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <XCircle size={18} />
          )}
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Registered Tenants</h1>
        <p className="mt-1 text-sm text-slate-500">
          Dashboard &rsaquo; Tenants List
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1">
        {/* ───────── Registered Tenants Table ───────── */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          {/* Table Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Registered Tenants</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                List of all registered tenants (companies).
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-48"
                />
              </div>

              <button className="flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition cursor-pointer">
                <Filter size={16} />
              </button>

              <Link
                to="/register-tenant"
                className="flex items-center gap-2 h-9 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm cursor-pointer"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Register New Tenant</span>
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <span className="ml-3 text-slate-500">Loading tenants...</span>
              </div>
            ) : (
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3.5 w-12">#</th>
                    <th className="px-5 py-3.5">Company Name</th>
                    <th className="px-5 py-3.5">Company Code</th>
                    <th className="px-5 py-3.5">Admin Email</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Created On</th>
                    <th className="px-5 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedTenants.map((tenant, index) => (
                    <tr
                      key={tenant._id}
                      className="text-slate-700 hover:bg-slate-50/60 transition"
                    >
                      <td className="px-5 py-3.5 text-slate-400 font-medium">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${colorPalette[index % colorPalette.length]}`}
                          >
                            {tenant.companyName?.charAt(0)?.toUpperCase()}
                          </span>
                          <span className="font-medium text-slate-800">
                            {tenant.companyName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                        {tenant.companyCode || tenant.companySlug?.toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {tenant.adminEmail || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
                            tenant.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {tenant.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {formatDate(tenant.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                           <button onClick={() => { setSelectedTenant(tenant); setIsEditMode(false); }} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => { setSelectedTenant(tenant); setIsEditMode(true); }} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600 transition cursor-pointer">
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(tenant._id, tenant.companyName)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedTenants.length === 0 && !loading && (
                    <tr>
                      <td colSpan="7" className="px-5 py-12 text-center text-slate-400">
                        {searchTerm ? "No tenants found matching your search." : "No tenants registered yet. Create one using the form."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && filteredTenants.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
              <p className="text-sm text-slate-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredTenants.length)} of{" "}
                {filteredTenants.length} tenants
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition cursor-pointer ${
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
      {/* Modal Integration */}
       <TenantModal
        tenant={selectedTenant}
        isOpen={!!selectedTenant}
        initialEditMode={isEditMode}
        onClose={() => setSelectedTenant(null)}
        onRefresh={fetchTenants}
      />
    </div>
  );
}
