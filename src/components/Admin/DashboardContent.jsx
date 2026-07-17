import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

import PageHeader from "../Manager/PageHeader";
import StatCard from "../Manager/StatCard";
import DocumentTable from "../Manager/DocumentTable";
import StorageOverview from "../Manager/StorageOverview";
import RecentActivity from "../Manager/Recent_Activity_Timeline";
import TeamMembers from "../Manager/Team_Members";
import WelcomeBanner from "../Manager/WelcomeBanner";
import RestoredFromTrash from "../Manager/RestoredFromTrash";

import {
  FileText,
  FolderOpen,
  Share2,
  Upload,
  Database,
  Users,
} from "lucide-react";

function DepartmentBreakdown({ data = [], formatBytes }) {
  const maxDeptSize = Math.max(...data.map(d => d.totalSize || 0), 1);
  const displayData = data.length > 0 ? data.slice(0, 5) : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-5">
          <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Database size={20} />
          </span>
          <h2 className="text-lg font-semibold text-slate-800">
            Department Storage Allocation
          </h2>
        </div>

        <div className="space-y-4">
          {displayData.map((dept, index) => {
            const percentage = Math.max(5, Math.round(((dept.totalSize || 0) / maxDeptSize) * 100));
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">{dept.name || "Global / Unassigned"}</span>
                  <span className="font-bold text-slate-600">{formatBytes(dept.totalSize)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          {displayData.length === 0 && (
            <p className="text-sm text-slate-400 italic">No department storage data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TopUsersStorage({ data = [], formatBytes }) {
  const maxUserSize = Math.max(...data.map(u => u.totalSize || 0), 1);
  const displayData = data.length > 0 ? data.slice(0, 5) : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-5">
          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Users size={20} />
          </span>
          <h2 className="text-lg font-semibold text-slate-800">
            Top Storage Consumers
          </h2>
        </div>

        <div className="space-y-4">
          {displayData.map((user, index) => {
            const percentage = Math.max(5, Math.round(((user.totalSize || 0) / maxUserSize) * 100));
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {user.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 truncate">{user.name}</span>
                    <span className="font-bold text-slate-600">{formatBytes(user.totalSize)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {displayData.length === 0 && (
            <p className="text-sm text-slate-400 italic">No operational uploaders yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardContent() {
  const fileInputRef = useRef(null);
  const { companySlug } = useParams();
  const navigate = useNavigate();

  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setDashData(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [companySlug]);

  // Format bytes to human-readable
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  // Transform recent docs into the format DocumentTable expects
  const documents = (dashData?.recentDocuments || []).map((doc) => {
    const now = new Date();
    const docDate = new Date(doc.updatedAt || doc.createdAt);
    const diffMs = now - docDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    let modified = "Just now";
    if (diffDays > 0) modified = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    else if (diffHours > 0) modified = `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;

    return {
      name: doc.originalFileName || doc.name,
      owner: doc.uploadedBy?.name || doc.createdBy?.name || "System",
      department: doc.departmentId?.name || "Global",
      type: doc.fileType || "File",
      size: formatBytes(doc.fileSize),
      modified,
    };
  });

  // Transform activities
  const activities = (dashData?.recentActivities || []).slice(0, 5).map((act) => {
    const now = new Date();
    const actDate = new Date(act.createdAt);
    const diffMs = now - actDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let time = "Just now";
    if (diffDays > 0) time = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    else if (diffHours > 0) time = `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
    else if (diffMins > 0) time = `${diffMins} min ago`;

    return {
      text: act.action || act.description || "Activity",
      time,
    };
  });

  // Transform team members
  const teamMembers = (dashData?.teamMembers || []).map((m) => ({
    name: m.name || m.email,
    role: m.role || "User",
    isActive: m.isActive,
  }));

  // Transform notifications
  const notifications = (dashData?.notifications || []).map(
    (n) => n.message || n.title || "Notification"
  );

  // Storage overview pie chart data from docTypeBreakdown
  const docTypeBreakdown = (dashData?.docTypeBreakdown || []).map((d) => ({
    name: d._id || "Other",
    value: d.count,
  }));

  // Storage usage bars
  const totalSize = (dashData?.docTypeBreakdown || []).reduce((sum, d) => sum + (d.totalSize || 0), 0);
  const storageItems = (dashData?.docTypeBreakdown || []).map((d) => ({
    label: d._id || "Other",
    value: totalSize > 0 ? Math.round(((d.totalSize || 0) / totalSize) * 100) : 0,
  }));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F7FB] min-h-screen">
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F7FB] p-4 sm:p-6 lg:p-8 space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        aria-label="Upload document"
      />

      {/* Welcome Banner */}
      <WelcomeBanner
        accountHolderName={dashData?.accountHolderName || "Tenant Admin"}
        recentUploadsCount={dashData?.recentUploadsCount || 0}
        totalDocuments={dashData?.totalDocuments || 0}
      />

      {/* Header */}
      <PageHeader
        title="Admin Dashboard"
        subtitle="Welcome back. Here's a summary of organization status and activities."
        buttonText="Invite User"
        icon={Upload}
        onButtonClick={() => navigate(`/${companySlug}/admin/user-management`)}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Documents"
          value={dashData?.totalDocuments?.toLocaleString() || "0"}
          icon={FileText}
          color="bg-blue-600"
        />

        <StatCard
          title="Folders"
          value={dashData?.totalFolders?.toLocaleString() || "0"}
          icon={FolderOpen}
          color="bg-emerald-600"
        />

        <StatCard
          title="Shared Files"
          value={dashData?.sharedCount?.toLocaleString() || "0"}
          icon={Share2}
          color="bg-purple-600"
        />

        <StatCard
          title="Recent Uploads"
          value={dashData?.recentUploadsCount?.toLocaleString() || "0"}
          icon={Upload}
          color="bg-orange-500"
        />
      </div>

      {/* Table + Storage */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DocumentTable
            title="Recent Documents"
            data={documents}
          />
        </div>

        <StorageOverview data={docTypeBreakdown} />
      </div>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <RestoredFromTrash count={dashData?.restoredCount || 0} showButton={false} />
        <RecentActivity activities={activities} />
        <TeamMembers members={teamMembers} />
      </div>

      {/* Admin Analytics: Department and Top Users Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepartmentBreakdown data={dashData?.departmentBreakdown || []} formatBytes={formatBytes} />
        <TopUsersStorage data={dashData?.topUsersBreakdown || []} formatBytes={formatBytes} />
      </div>
    </div>
  );
}
