import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import MainLayout from "../../layout/MainLayout";
import DashboardLoader from "../../components/common/DashboardLoader";
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
      <MainLayout>
        <DashboardLoader
          role="manager"
          title="Loading Workspace Dashboard..."
          subtitle="Aggregating documents, folder storage breakdown & team activities..."
        />
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

          <StorageOverview 
            data={docTypeBreakdown} 
            storageUsed={dashData?.storageUsed || 1181116006} 
            maxStorageLimit={dashData?.maxStorageLimit || 5368709120} 
            planName="Trial"
            showProgressBar={false}
          />
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
