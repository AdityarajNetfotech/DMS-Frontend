import {
  ChevronLeft,
  ChevronRight,
  Info,
  Trash2,
  RotateCcw,
  Folder,
  FileText,
  FileSpreadsheet
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

export default function Trash() {
  const { companySlug } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrash = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/trash`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        // Map folders and documents into a single list
        const folders = (data.data.folders || []).map(f => ({
          _id: f._id,
          name: f.name,
          deletedOn: f.deletedAt || f.updatedAt,
          size: "-",
          kind: "folder",
          managerName: f.createdBy?.name || "System",
          departmentName: f.departmentId?.name || "Global"
        }));

        const documents = (data.data.documents || []).map(d => ({
          _id: d._id,
          name: d.originalFileName || d.name,
          deletedOn: d.deletedAt || d.updatedAt,
          size: d.fileSize ? `${(d.fileSize / (1024 * 1024)).toFixed(2)} MB` : "-",
          kind: d.fileType?.toLowerCase() || "pdf",
          managerName: d.uploadedBy?.name || "System",
          departmentName: d.departmentId?.name || "Global"
        }));

        setItems([...folders, ...documents]);
      }
    } catch (err) {
      console.error("Failed to fetch trash list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, [companySlug]);

  const handleRestore = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/trash/${id}/restore`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        // Remove from list
        setItems(prev => prev.filter(item => item._id !== id));
      } else {
        alert(data.message || "Failed to restore item");
      }
    } catch (err) {
      console.error("Failed to restore resource", err);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this item? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/trash/${id}/permanent`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.filter(item => item._id !== id));
      } else {
        alert(data.message || "Failed to delete item permanently");
      }
    } catch (err) {
      console.error("Failed to delete permanently", err);
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm("Are you sure you want to empty the trash? All items will be permanently deleted!")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/trash/empty`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setItems([]);
      } else {
        alert(data.message || "Failed to empty trash");
      }
    } catch (err) {
      console.error("Failed to empty trash", err);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
            Trash Bin
          </h1>
          <p className="mt-3 text-base text-slate-500">
            Manage your deleted documents and folders.
          </p>
        </section>

        <section className="flex items-center gap-3 rounded-lg bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700">
          <Info size={20} className="shrink-0" />
          <p>Restoring folders or files will place them under a folder named "Trash" in your workspace.</p>
        </section>

        {items.length > 0 && (
          <section className="flex justify-end">
            <button
              onClick={handleEmptyTrash}
              className="inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-7 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={19} className="text-red-600" />
              Empty Trash
            </button>
          </section>
        )}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-sm font-semibold text-slate-500">
                  <th className="w-[30%] px-6 py-5">Name</th>
                  <th className="w-[15%] px-5 py-5">Manager</th>
                  <th className="w-[15%] px-5 py-5">Department</th>
                  <th className="w-[20%] px-5 py-5">Deleted On</th>
                  <th className="w-[10%] px-5 py-5">Size</th>
                  <th className="w-[10%] px-5 py-5 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      Loading trash items...
                    </td>
                  </tr>
                ) : items.length > 0 ? (
                  items.map((item) => (
                    <tr
                      key={item._id}
                      className="text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <ResourceIcon kind={item.kind} />
                          <span className="truncate">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-6 text-slate-700 font-medium">
                        {item.managerName}
                      </td>
                      <td className="px-5 py-6 text-slate-700">
                        {item.departmentName !== "Global" ? (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {item.departmentName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Global</span>
                        )}
                      </td>
                      <td className="px-5 py-6">
                        {item.deletedOn ? new Date(item.deletedOn).toLocaleString() : "-"}
                      </td>
                      <td className="px-5 py-6">{item.size}</td>
                      <td className="px-5 py-6">
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={() => handleRestore(item._id)}
                            className="inline-flex h-10 min-w-[100px] items-center justify-center gap-1 rounded-lg border border-blue-300 bg-white px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                          >
                            <RotateCcw size={15} />
                            Restore
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(item._id)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-red-600 transition hover:bg-red-50 hover:border-red-200"
                            aria-label={`Delete ${item.name} permanently`}
                            title="Delete Permanently"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-slate-500"
                    >
                      No items found in trash.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-500">
              Showing {items.length} results
            </p>

            <div className="flex items-center gap-3">
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-300 transition hover:bg-slate-50"
                aria-label="Previous page"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-blue-700 bg-blue-700 text-sm font-semibold text-white shadow-sm"
                aria-label="Page 1"
              >
                1
              </button>
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-300 transition hover:bg-slate-50"
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
