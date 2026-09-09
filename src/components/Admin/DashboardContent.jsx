import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import DashboardLoader from "../common/DashboardLoader";

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
  const [subStatus, setSubStatus] = useState({
    plan: 'Trial',
    daysLeft: 7,
    isAccessLocked: false
  });

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

        const subRes = await fetch(`${API_BASE_URL}/api/tenant/subscription/status/${companySlug}`);
        const subData = await subRes.json();
        if (subData.success) {
          const now = new Date();
          const plan = subData.subscription?.plan || 'Trial';
          const targetDate = plan === 'Trial' ? new Date(subData.trialEndsAt) : new Date(subData.subscription?.expiresAt);
          
          let daysLeft = 0;
          if (targetDate && !isNaN(targetDate)) {
            const diffTime = targetDate - now;
            daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          }

          setSubStatus({
            plan,
            daysLeft,
            isAccessLocked: subData.isAccessLocked
          });
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

  const sampleDocs = [
    {
      name: "Q4_Financial_Report.pdf",
      owner: "Elena Rostova",
      department: "Finance",
      type: "PDF Document",
      size: "4.8 MB",
      modified: "2 hours ago",
    },
    {
      name: "Employee_Handbook_2026.docx",
      owner: "Michael Chang",
      department: "HR",
      type: "Word Document",
      size: "1.2 MB",
      modified: "1 day ago",
    },
    {
      name: "Marketing_Campaign_Creative.zip",
      owner: "Elena Rostova",
      department: "Marketing",
      type: "ZIP Archive",
      size: "84.5 MB",
      modified: "2 days ago",
    },
    {
      name: "Product_Roadmap_V3.pptx",
      owner: "David Kim",
      department: "Product",
      type: "PowerPoint",
      size: "7.2 MB",
      modified: "4 days ago",
    },
    {
      name: "System_Security_Audit_Report.pdf",
      owner: "Alex Mercer",
      department: "Security",
      type: "PDF Document",
      size: "2.5 MB",
      modified: "1 week ago",
    },
    {
      name: "Q1_Strategy_Briefing.docx",
      owner: "Elena Rostova",
      department: "Strategy",
      type: "Word Document",
      size: "1.5 MB",
      modified: "1 week ago",
    },
    {
      name: "Server_Maintenance_Logs.txt",
      owner: "Alex Mercer",
      department: "IT Operations",
      type: "Text Log",
      size: "450 KB",
      modified: "2 weeks ago",
    },
    {
      name: "Vendor_Contract_Template.pdf",
      owner: "Sarah Jenkins",
      department: "Legal",
      type: "PDF Document",
      size: "3.1 MB",
      modified: "2 weeks ago",
    },
    {
      name: "User_Feedback_Analytics.xlsx",
      owner: "David Kim",
      department: "Product",
      type: "Spreadsheet",
      size: "12.4 MB",
      modified: "3 weeks ago",
    },
    {
      name: "Corporate_Brand_Guidelines.pdf",
      owner: "Sarah Jenkins",
      department: "Design",
      type: "PDF Document",
      size: "15.2 MB",
      modified: "1 month ago",
    },
  ];

  // Transform recent docs into the format DocumentTable expects
  const realDocuments = (dashData?.recentDocuments || []).map((doc) => {
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
      rawDate: doc.createdAt || doc.updatedAt,
    };
  });

  // Only show real documents from the database (no static data fallback)
  const documents = realDocuments;

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

  const sampleBreakdown = [
    { name: "PDF Documents", value: 45 },
    { name: "Word Files", value: 30 },
    { name: "Spreadsheets", value: 15 },
    { name: "ZIP Archives", value: 10 },
  ];

  // Storage overview pie chart data from docTypeBreakdown (no static data fallback)
  const docTypeBreakdown = (dashData?.docTypeBreakdown && dashData.docTypeBreakdown.length > 0)
    ? dashData.docTypeBreakdown.map((d) => ({
        name: d._id || "Other",
        value: d.count,
      }))
    : [];

  // Storage usage bars
  const totalSize = (dashData?.docTypeBreakdown || []).reduce((sum, d) => sum + (d.totalSize || 0), 0);
  const storageItems = (dashData?.docTypeBreakdown || []).map((d) => ({
    label: d._id || "Other",
    value: totalSize > 0 ? Math.round(((d.totalSize || 0) / totalSize) * 100) : 0,
  }));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F7FB] min-h-screen p-4 sm:p-6 lg:p-8">
        <DashboardLoader
          role="admin"
          title="Loading Enterprise Admin Dashboard..."
          subtitle="Fetching tenant storage metrics, department allocations & security policies..."
        />
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

      {/* Subscription Status Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-lg border border-slate-700/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center font-bold shrink-0">
            <Database size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                subStatus.plan === 'Trial'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {subStatus.plan === 'Trial' ? '7-Day Free Trial' : `${subStatus.plan} Plan Active`}
              </span>
              {subStatus.isAccessLocked && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                  Expired
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-white mt-1">
              {subStatus.plan === 'Trial' ? 'Free Trial Period Active' : `Current Plan: ${subStatus.plan}`}
            </h3>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              {subStatus.daysLeft} days remaining for your current workspace tier. Upgrade anytime to unlock higher team and storage limits.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/${companySlug}/admin/subscription`)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer shrink-0 self-start md:self-auto"
        >
          {subStatus.plan === 'Trial' ? 'Activate Subscription' : 'Manage Subscription & Plans'}
        </button>
      </div>

      {/* Welcome Banner */}
      <WelcomeBanner
        accountHolderName={dashData?.accountHolderName || "Tenant Admin"}
        recentUploadsCount={dashData?.recentUploadsCount || 0}
        totalDocuments={dashData?.totalDocuments || 0}
      />

      {/* Header */}
      <PageHeader
        title="Admin Dashboard"
        subtitle="Welcome. Here's a summary of organization status and activities."
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

        <StorageOverview 
          data={docTypeBreakdown} 
          storageUsed={dashData?.storageUsed} 
          maxStorageLimit={dashData?.maxStorageLimit}
          planName={subStatus?.plan}
        />
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
