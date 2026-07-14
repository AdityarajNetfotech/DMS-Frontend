import {
  CalendarDays,
  CloudUpload,
  Download,
  FileText,
  Folder,
  Share2,
  Trash2,
  UploadCloud,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Viewer from "../../components/Viewer/Viewer";
import { API_BASE_URL } from "../../config/api";

function StatCard({ stat }) {
  const Icon = stat.icon;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-5">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${stat.color}`}
        >
          <Icon size={26} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{stat.title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
          <p className="mt-1 text-xs font-semibold text-emerald-600">{stat.change}</p>
        </div>
      </div>
    </section>
  );
}

function FileBadge({ kind }) {
  const styles = {
    pdf: "bg-red-500 text-white",
    excel: "bg-emerald-500 text-white",
    doc: "bg-blue-500 text-white",
    ppt: "bg-orange-500 text-white",
    image: "bg-purple-500 text-white"
  };

  const label = {
    pdf: "PDF",
    excel: "X",
    doc: "W",
    ppt: "P",
    image: "I"
  };

  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-[9px] font-bold shadow-sm ${styles[kind] || "bg-slate-200 text-slate-700"
        }`}
    >
      {label[kind] || "F"}
    </span>
  );
}

function Panel({ title, children, className = "" }) {
  return (
    <section
      className={`flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </section>
  );
}

function RecentDocuments({ documents }) {
  return (
    <Panel title="Recent Documents">
      <div className="overflow-x-auto h-full">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
              <th className="py-3 px-4 rounded-tl-lg">Name</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3 rounded-tr-lg">Modified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {documents.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-sm font-medium text-slate-500">No recent documents</td>
              </tr>
            )}
            {documents.map((document) => (
              <tr key={document._id || document.name} className="text-sm font-medium hover:bg-slate-50 transition">
                <td className="py-3 px-4 text-slate-900">
                  <div className="flex items-center gap-3">
                    <FileBadge kind={document.kind} />
                    <span className="truncate">{document.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{document.owner}</td>
                <td className="px-4 py-3">
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold">{document.type}</span>
                </td>
                <td className="px-4 py-3 text-slate-600 font-semibold">{document.size}</td>
                <td className="px-4 py-3 text-slate-500">{document.modified}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function StorageOverview({ storageRows, totalSizeFormatted }) {
  const generateConicGradient = (rows) => {
    if (!rows || rows.length === 0) return 'conic-gradient(#e2e8f0 0 100%)';
    let gradientParts = [];
    let currentPercent = 0;
    rows.forEach(row => {
      const percentNum = parseFloat(row.value);
      if (percentNum > 0) {
        const nextPercent = currentPercent + percentNum;
        gradientParts.push(`${row.hex} ${currentPercent}% ${nextPercent}%`);
        currentPercent = nextPercent;
      }
    });
    if (currentPercent < 100) {
      gradientParts.push(`#e2e8f0 ${currentPercent}% 100%`);
    }
    return `conic-gradient(${gradientParts.join(', ')})`;
  };

  return (
    <Panel title="Storage Breakdown">
      <div className="flex flex-col items-center gap-6 md:flex-row xl:flex-col 2xl:flex-row w-full justify-center">
        <div
          className="relative grid h-40 w-40 sm:h-48 sm:w-48 shrink-0 place-items-center rounded-full shadow-sm"
          style={{ background: generateConicGradient(storageRows) }}
        >
          <div className="grid h-28 w-28 sm:h-32 sm:w-32 place-items-center rounded-full bg-white text-center shadow-inner">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalSizeFormatted}</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Total</p>
            </div>
          </div>
        </div>
        <div className="w-full space-y-4">
          {storageRows.length === 0 && <p className="text-sm font-medium text-slate-500 text-center">No storage data</p>}
          {storageRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm gap-2">
              <div className="flex items-center gap-2 font-semibold text-slate-800 min-w-0">
                <span className={`h-3 w-3 rounded-full shrink-0 ${row.color}`} />
                <span className="truncate max-w-[110px] xs:max-w-[140px] md:max-w-[180px] xl:max-w-[100px] 2xl:max-w-[160px]" title={row.label}>
                  {row.label}
                </span>
                <span className="text-xs font-medium text-slate-500 shrink-0">({row.count})</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <span className="font-bold text-slate-900 w-10 sm:w-12 text-right">{row.value}</span>
                <span className="font-medium text-slate-500 w-14 sm:w-16 text-right">{row.size}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function RecentSharedWithMe({ sharedItems }) {
  return (
    <Panel title="Shared With Me">
      <div className="space-y-5 mt-2">
        {sharedItems.length === 0 && <p className="text-sm font-medium text-slate-500 text-center py-6">No recent shared items</p>}
        {sharedItems.map((item, idx) => {
          return (
            <div key={idx} className="flex items-start gap-4 hover:bg-slate-50 p-2 -mx-2 rounded-lg transition cursor-default">
              <div className="flex shrink-0 items-center justify-center rounded-full shadow-sm">
                <FileBadge kind={item.kind} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">{item.meta}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function TeamMembers({ teamMembers }) {
  return (
    <Panel title="Team Directory">
      <div className="divide-y divide-slate-100">
        {teamMembers.length === 0 && <p className="text-sm font-medium text-slate-500 text-center py-6">No team members</p>}
        {teamMembers.map((member, index) => (
          <div key={member.name || index} className="flex items-center gap-4 py-3.5 first:pt-1">
            <div className="relative">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-bold text-blue-900 shadow-sm border border-white">
                {member.name ? member.name.split(" ").map((part) => part[0]).join("").substring(0, 2).toUpperCase() : "U"}
              </div>
              <span
                className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${member.status}`}
                aria-label={member.status.includes('emerald') ? "Online" : "Offline"}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{member.name}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getKindFromType = (type) => {
  if (!type) return "pdf";
  type = type.toLowerCase();
  if (type.includes("pdf")) return "pdf";
  if (type.includes("doc") || type.includes("word")) return "doc";
  if (type.includes("xls") || type.includes("csv") || type.includes("excel")) return "excel";
  if (type.includes("ppt") || type.includes("powerpoint")) return "ppt";
  if (type.includes("image") || type.includes("png") || type.includes("jpg")) return "image";
  return "pdf";
};

export default function ViewerDashboard() {
  const { companySlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!companySlug) return;
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_BASE_URL}/api/${companySlug}/viewer/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [companySlug]);

  if (loading || !data) {
    return (
      <Viewer>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
            <p className="text-sm font-semibold text-slate-600 animate-pulse">Loading your dashboard...</p>
          </div>
        </div>
      </Viewer>
    );
  }

  const {
    totalDocuments,
    totalFolders,
    sharedCount,
    recentUploadsCount,
    recentDocuments,
    recentSharedWithMe,
    teamMembers: rawTeamMembers,
    docTypeBreakdown,
    accountHolderName
  } = data;

  const stats = [
    {
      title: "Total Documents",
      value: totalDocuments?.toString() || "0",
      change: "In your tenant",
      icon: FileText,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Folders",
      value: totalFolders?.toString() || "0",
      change: "In your tenant",
      icon: Folder,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Shared Files",
      value: sharedCount?.toString() || "0",
      change: "Shared internally",
      icon: Share2,
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      title: "Recent Uploads",
      value: recentUploadsCount?.toString() || "0",
      change: "Last 7 days",
      icon: CloudUpload,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const formattedDocs = (recentDocuments || []).map((doc) => ({
    _id: doc._id,
    name: doc.name || doc.originalFileName,
    owner: doc.uploadedBy?.name || "System",
    type: doc.fileType || "File",
    size: formatBytes(doc.fileSize || 0),
    modified: new Date(doc.updatedAt).toLocaleDateString(),
    kind: getKindFromType(doc.fileType),
  }));

  const formattedSharedWithMe = (recentSharedWithMe || []).map((share) => {
    const isFolder = share.itemType === 'Folder';
    const name = isFolder ? share.folderId?.name : share.documentId?.originalFileName;
    const type = isFolder ? 'folder' : share.documentId?.fileType;
    return {
      title: name || 'Unknown',
      meta: `Shared by ${share.sharedBy?.name || 'System'} on ${new Date(share.createdAt).toLocaleDateString()}`,
      kind: isFolder ? 'pdf' : getKindFromType(type)
    };
  });

  const formattedTeamMembers = (rawTeamMembers || []).map(member => ({
    name: member.name,
    role: member.role,
    status: member.isActive ? "bg-emerald-500" : "bg-slate-300"
  }));

  let totalSize = 0;
  const storageColors = [
    { bg: "bg-blue-600", hex: "#2563eb" },
    { bg: "bg-emerald-500", hex: "#10b981" },
    { bg: "bg-orange-500", hex: "#f59e0b" },
    { bg: "bg-violet-500", hex: "#8b5cf6" },
    { bg: "bg-pink-500", hex: "#ec4899" }
  ];

  const storageRows = (docTypeBreakdown || []).map((b, i) => {
    totalSize += b.totalSize;
    const colorObj = storageColors[i % storageColors.length];
    return {
      label: b._id || "Other",
      count: b.count || 0,
      totalSize: b.totalSize,
      size: formatBytes(b.totalSize),
      color: colorObj.bg,
      hex: colorObj.hex
    };
  });

  storageRows.forEach(row => {
    row.value = totalSize > 0 ? Math.round((row.totalSize / totalSize) * 100) + "%" : "0%";
  });

  return (
    <Viewer>
      <div className="mx-auto max-w-[1600px] space-y-6">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 shadow-md">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6 text-white">
              <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md md:flex border border-white/30 shadow-inner">
                <FileText size={34} className="text-white drop-shadow-md" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Welcome back, {accountHolderName || "Viewer"}!
                </h1>
                <p className="text-1xl font-extrabold tracking-tight">
                  You have view access to {totalDocuments} documents across the tenant's workspace. Discover and preview shared content.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="rounded-xl bg-white p-4 shadow-lg flex-1 md:w-40 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Access</p>
                <p className="mt-1 text-3xl font-black text-blue-600">{totalDocuments + totalFolders}</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-lg flex-1 md:w-40 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Shares</p>
                <p className="mt-1 text-3xl font-black text-blue-600">{sharedCount}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <RecentDocuments documents={formattedDocs} />
          <StorageOverview storageRows={storageRows} totalSizeFormatted={formatBytes(totalSize)} totalSizeValue={totalSize} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <RecentSharedWithMe sharedItems={formattedSharedWithMe} />
          <TeamMembers teamMembers={formattedTeamMembers} />
        </section>
      </div>
    </Viewer>
  );
}
