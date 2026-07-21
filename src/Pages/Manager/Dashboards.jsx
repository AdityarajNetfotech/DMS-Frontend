import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import MainLayout from "../../layout/MainLayout";
import { API_BASE_URL } from "../../config/api";

import PageHeader from "../../components/Manager/PageHeader";
import StatCard from "../../components/Manager/StatCard";
import DocumentTable from "../../components/Manager/DocumentTable";
import StorageOverview from "../../components/Manager/StorageOverview";
import RecentActivity from "../../components/Manager/Recent_Activity_Timeline";
import TeamMembers from "../../components/Manager/Team_Members";
import WelcomeBanner from "../../components/Manager/WelcomeBanner";
import RestoredFromTrash from "../../components/Manager/RestoredFromTrash";

import {
  FileText,
  FolderOpen,
  Share2,
  Upload,
} from "lucide-react";

export default function Dashboard() {
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

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
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-500 text-lg">Loading dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          aria-label="Upload document"
        />

        {/* Welcome Banner */}
        <WelcomeBanner
          accountHolderName={dashData?.accountHolderName || "Manager"}
          recentUploadsCount={dashData?.recentUploadsCount || 0}
          totalDocuments={dashData?.totalDocuments || 0}
        />

        {/* Header */}
        <PageHeader
          title="Dashboard"
          subtitle="Welcome. Here's an overview of your workspace."
          buttonText="Upload Document"
          icon={Upload}
          onButtonClick={() => navigate(`/${companySlug}/manager/folder-explorer`)}
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
          <RestoredFromTrash count={dashData?.restoredCount || 0} />
          <RecentActivity activities={activities} />
          <TeamMembers members={teamMembers} />
        </div>
      </div>
    </MainLayout>
  );
}
