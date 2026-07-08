import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FolderOpen, FileText, Users, Download, ArrowUpDown, UserCheck } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function ManagerActivityContent() {
  const { companySlug } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/activity-report`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.message || "Failed to load manager reports");
        }
      } catch (err) {
        console.error(err);
        setError("Network error: Failed to retrieve data");
      } finally {
        setLoading(false);
      }
    };
    if (companySlug) {
      fetchReport();
    }
  }, [companySlug]);

  const totalFolders = data.reduce((sum, item) => sum + item.folderCount, 0);
  const totalFiles = data.reduce((sum, item) => sum + item.fileCount, 0);
  const activeManagers = data.filter(item => item.isActive).length;

  const exportToExcel = () => {
    const headers = ["Manager Name", "Manager Email", "Department", "Folders Created", "Files Uploaded", "Status"];
    
    const rows = data.map(manager => [
      manager.name,
      manager.email,
      manager.department,
      manager.folderCount,
      manager.fileCount,
      manager.isActive ? "Active" : "Inactive"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => {
        const str = String(val ?? "").replace(/"/g, '""');
        return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str;
      }).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `manager_activity_report_${companySlug || "export"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F7FB] min-h-screen">
        <p className="text-gray-500 font-medium">Loading manager activities...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-blue-600">
            Manager Activity
          </h1>
          <p className="text-gray-500 mt-2">
            Detailed folder and file upload stats categorized by department managers.
          </p>
        </div>

        <button 
          onClick={exportToExcel}
          className="px-5 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:opacity-90 transition cursor-pointer self-start"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-xl border bg-red-50 border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* STAT CARDS */}
      <div className="mt-8 grid gap-5 grid-cols-1 sm:grid-cols-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Managers</p>
            <h3 className="text-2xl font-bold mt-1 text-gray-900">{data.length}</h3>
            <p className="text-xs text-green-600 mt-1">● {activeManagers} Active</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <FolderOpen size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Folders Created</p>
            <h3 className="text-2xl font-bold mt-1 text-gray-900">{totalFolders}</h3>
            <p className="text-xs text-gray-400 mt-1">Across all departments</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Files Uploaded</p>
            <h3 className="text-2xl font-bold mt-1 text-gray-900">{totalFiles}</h3>
            <p className="text-xs text-gray-400 mt-1">Stored securely</p>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Manager Performance logs</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left table-fixed">
            <thead className="bg-slate-55 border-b border-gray-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="w-[30%] px-6 py-4">Manager</th>
                <th className="w-[25%] px-5 py-4">Department</th>
                <th className="w-[15%] px-5 py-4 text-center">Folders Created</th>
                <th className="w-[15%] px-5 py-4 text-center">Files Uploaded</th>
                <th className="w-[15%] px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-gray-700">
              {data.map((manager) => (
                <tr key={manager.id} className="hover:bg-slate-50/50 transition">
                  {/* Name / Email */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                        {manager.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{manager.name}</p>
                        <p className="text-xs text-gray-500 truncate">{manager.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="px-5 py-4">
                    {manager.department !== "Global / Unassigned" ? (
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {manager.department}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Global / Unassigned</span>
                    )}
                  </td>

                  {/* Folders */}
                  <td className="px-5 py-4 text-center font-bold text-gray-900">
                    {manager.folderCount}
                  </td>

                  {/* Files */}
                  <td className="px-5 py-4 text-center font-bold text-gray-900">
                    {manager.fileCount}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      manager.isActive 
                        ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20" 
                        : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                    }`}>
                      {manager.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                    No managers registered under this tenant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
