import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Download,
  Users,
  FileText,
  Upload,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function StorageReportingContent() {
  const { companySlug } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error("Failed to load storage statistics", err);
      } finally {
        setLoading(false);
      }
    };
    if (companySlug) {
      fetchStats();
    }
  }, [companySlug]);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F7FB] min-h-screen">
        <p className="text-gray-500 font-medium">Loading storage statistics...</p>
      </div>
    );
  }

  const docTypes = stats?.docTypeBreakdown || [];
  const maxDocSize = Math.max(...docTypes.map(d => d.totalSize || 0), 1);

  const topUsers = stats?.topUsersBreakdown || [];
  const maxUserSize = Math.max(...topUsers.map(u => u.totalSize || 0), 1);

  const departments = stats?.departmentBreakdown || [];

  const storageUsedGB = stats ? stats.storageUsed / (1024 * 1024 * 1024) : 0;
  const storageLimitGB = stats ? stats.maxStorageLimit / (1024 * 1024 * 1024) : 10;
  const storagePercentage = Math.min(100, Math.round((storageUsedGB / storageLimitGB) * 100));

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-blue-600">
            Storage & Reporting
          </h1>

          <p className="text-gray-500 mt-2">
            Real-time usage insights and operational capacity stats.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="px-5 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 cursor-pointer">
            Schedule Report
          </button>

          <button className="px-5 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:opacity-90 transition cursor-pointer">
            <Download size={18} />
            Export All Data
          </button>
        </div>
      </div>

      {/* ================================================= */}
      {/* STORAGE OVERVIEW + FORECAST */}
      {/* ================================================= */}

      <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
        {/* Storage Overview */}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 xl:col-span-1 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-semibold">
                Storage Overview
              </h2>

              <p className="text-gray-500">
                Global capacity utilization across all regions
              </p>
            </div>

            <div className="text-right">
              <h2 className="text-5xl font-bold text-blue-600">
                {storageUsedGB.toFixed(2)}
                <span className="text-2xl ml-1">GB</span>
              </h2>

              <p className="text-gray-500 mt-1">
                of {storageLimitGB.toFixed(0)}GB used ({storagePercentage}%)
              </p>
            </div>
          </div>

          {/* Progress */}

          <div className="w-full h-4 bg-gray-200 rounded-full mt-8 overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${storagePercentage}%` }} />
          </div>

          {/* Analytics */}

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {/* By Department */}

            <div>
              <h3 className="font-semibold mb-5 uppercase tracking-wide text-gray-500 text-xs">
                By Department
              </h3>

              <div className="space-y-4 text-sm text-gray-700">
                {departments.map((dept, index) => (
                  <div key={index} className="flex justify-between items-center py-1 border-b border-gray-50">
                    <span className="font-medium truncate max-w-[120px]" title={dept.name}>{dept.name}</span>
                    <span className="font-semibold text-gray-600">{formatBytes(dept.totalSize)}</span>
                  </div>
                ))}
                {departments.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No department data</p>
                )}
              </div>
            </div>

            {/* Document Type */}

            <div>
              <h3 className="font-semibold mb-5 uppercase tracking-wide text-gray-500 text-xs">
                By Document Type
              </h3>

              <div className="flex items-end justify-start gap-4 h-36">
                {docTypes.slice(0, 4).map((d, index) => {
                  const heightPercent = Math.max(12, Math.round(((d.totalSize || 0) / maxDocSize) * 100));
                  return (
                    <div key={index} className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
                      <div 
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-blue-600 rounded-t hover:opacity-85 transition-all duration-300"
                        title={`${d._id}: ${formatBytes(d.totalSize)}`}
                      />
                      <span className="text-[10px] font-bold text-gray-400 uppercase truncate max-w-full">{d._id}</span>
                    </div>
                  );
                })}
                {docTypes.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No documents uploaded yet</p>
                )}
              </div>
            </div>

            {/* Top Users */}

            <div>
              <h3 className="font-semibold mb-5 uppercase tracking-wide text-gray-500 text-xs">
                Top Users
              </h3>

              <div className="space-y-4">
                {topUsers.map((user, index) => {
                  const widthPercent = Math.max(15, Math.round(((user.totalSize || 0) / maxUserSize) * 100));
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-medium text-gray-700 truncate">{user.name}</span>
                          <span className="text-gray-500 shrink-0 font-semibold">{formatBytes(user.totalSize)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${widthPercent}%` }}
                            className="h-full bg-blue-600 transition-all duration-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {topUsers.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No operational uploaders yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Usage Forecast */}

        <div className="bg-[#071C4D] text-white rounded-2xl p-8">
          <h2 className="text-3xl font-semibold">
            Usage Forecast
          </h2>

          <p className="text-gray-300 mt-2">
            Based on current upload velocity
          </p>

          <div className="mt-16">
            <h1 className="text-7xl font-bold">
              84%
            </h1>

            <p className="text-xl mt-4">
              Estimated capacity by Q4 2024
            </p>
          </div>

          <div className="mt-10 border border-blue-800 rounded-2xl p-5 bg-blue-950/20">
            <h4 className="font-semibold">
              Recommendation:
            </h4>

            <p className="text-gray-300 mt-2 text-sm leading-6">
              Archive logs older than 180 days
              to reclaim 1.2 TB of hot storage.
            </p>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* OPERATIONAL REPORTS */}
      {/* ================================================= */}

      <div className="mt-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">
            Operational Reports
          </h2>

          <button className="text-[#0B2C87] font-semibold">
            View All Reports →
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Card 1 */}

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
              <Upload />
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Last updated: 2h ago
            </p>

            <h3 className="text-xl font-semibold mt-5">
              Uploads per Week
            </h3>

            <p className="text-gray-500 mt-2">
              Aggregate trends of inbound data streams
              across all sub-tenants.
            </p>

            <button className="mt-6 text-[#0B2C87] font-semibold flex items-center gap-2">
              <Download size={16} />
              DOWNLOAD PDF
            </button>
          </div>

          {/* Card 2 */}

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
              <Users />
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Last updated: 1d ago
            </p>

            <h3 className="text-xl font-semibold mt-5">
              Active Users
            </h3>

            <p className="text-gray-500 mt-2">
              User engagement heatmaps and peak
              activity period logs.
            </p>

            <button className="mt-6 text-[#0B2C87] font-semibold flex items-center gap-2">
              <Download size={16} />
              DOWNLOAD CSV
            </button>
          </div>

          {/* Card 3 */}

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
              <FileText />
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Last updated: 4h ago
            </p>

            <h3 className="text-xl font-semibold mt-5">
              Document Counts
            </h3>

            <p className="text-gray-500 mt-2">
              Detailed inventory breakdown including
              metadata audit trails.
            </p>

            <button className="mt-6 text-[#0B2C87] font-semibold flex items-center gap-2">
              <Download size={16} />
              DOWNLOAD XLSX
            </button>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* PART 2 CONTINUES BELOW */}
      {/* ================================================= */}

            {/* ================================================= */}
      {/* INTEGRATIONS MANAGEMENT */}
      {/* ================================================= */}

      <div className="bg-white rounded-2xl border border-gray-200 mt-8 overflow-hidden">
        {/* Header */}

        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">
              Integrations Management
            </h2>

            <p className="text-gray-500 mt-1">
              Manage external connectors and secure API credentials
            </p>
          </div>

          <button className="bg-[#0B2C87] text-white px-6 py-3 rounded-xl hover:bg-[#081f63]">
            Connect New App
          </button>
        </div>

        {/* AWS S3 */}

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              ☁️
            </div>

            <div>
              <h3 className="font-semibold text-lg">
                AWS S3 Connector
              </h3>

              <p className="text-gray-500 text-sm">
                Primary archival storage target
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <span className="text-green-600 font-medium">
              ● Active
            </span>

            <span className="text-gray-500">
              API Key: •••••••••4529
            </span>

            <RefreshCw
              size={18}
              className="cursor-pointer text-gray-500"
            />

            <Trash2
              size={18}
              className="cursor-pointer text-red-500"
            />
          </div>
        </div>

        {/* Google Cloud */}

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              🌐
            </div>

            <div>
              <h3 className="font-semibold text-lg">
                Google Cloud Storage
              </h3>

              <p className="text-gray-500 text-sm">
                Redundant backup cluster
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <span className="text-green-600 font-medium">
              ● Active
            </span>

            <span className="text-gray-500">
              API Key: •••••••••9812
            </span>

            <RefreshCw
              size={18}
              className="cursor-pointer text-gray-500"
            />

            <Trash2
              size={18}
              className="cursor-pointer text-red-500"
            />
          </div>
        </div>

        {/* Admin API Access */}

        <div className="p-6 bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">
              Admin API Access
            </h3>

            <p className="text-gray-500 mt-1">
              These keys allow full access to reporting endpoints.
              Handle with extreme caution.
            </p>
          </div>

          <button className="border border-[#0B2C87] text-[#0B2C87] px-6 py-3 rounded-xl hover:bg-blue-50">
            Generate New Admin Key
          </button>
        </div>
      </div>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="mt-10 border-t border-gray-200 pt-6 pb-4 flex justify-between items-center text-gray-500">
        <p>
          © 2024 AdminNexus System. All rights reserved.
        </p>

        <div className="flex gap-8">
          <button className="hover:text-[#0B2C87]">
            System Status
          </button>

          <button className="hover:text-[#0B2C87]">
            API Reference
          </button>

          <button className="hover:text-[#0B2C87]">
            Privacy Policy
          </button>
        </div>
      </footer>
       </div>
  );
}