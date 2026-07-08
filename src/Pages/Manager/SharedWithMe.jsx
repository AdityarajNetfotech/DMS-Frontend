import {
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Folder,
  Search,
  Share2,
  Copy,
  Check,
  Eye
} from "lucide-react";

import MainLayout from "../../layout/MainLayout";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

const iconClass = {
  pdf: "bg-red-100 text-red-600",
  excel: "bg-emerald-100 text-emerald-600",
  doc: "bg-blue-100 text-blue-600",
  folder: "bg-yellow-100 text-yellow-600"
};

function DocumentIcon({ kind }) {
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

export default function SharedWithMe() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(null);

  useEffect(() => {
    const fetchShares = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/shares`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setShares(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch shared items", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShares();
  }, [companySlug]);

  const handleCopyLink = (shareToken) => {
    const link = `${API_BASE_URL}/api/${companySlug}/manager/shares/resolve/${shareToken}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(shareToken);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handlePreview = (share) => {
    if (share.folderId) {
      navigate(`/${companySlug}/manager/folder-explorer?folderId=${share.folderId._id}`);
    } else if (share.documentId) {
      const token = localStorage.getItem('accessToken');
      window.open(`${API_BASE_URL}/api/${companySlug}/manager/documents/${share.documentId._id}/preview?token=${token}`, '_blank');
    }
  };

  const filteredDocuments = shares.filter((share) => {
    const name = share.documentId ? share.documentId.originalFileName || share.documentId.name : (share.folderId?.name || "Unknown");
    const sharedBy = share.sharedBy?.name || share.sharedBy?.email || "Unknown";
    const access = share.permissions?.readOnly ? "View" : "Edit";
    
    return `${name} ${sharedBy} ${access}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
              <Share2 size={27} />
              Company Shares
            </h1>
            <p className="mt-3 text-base text-slate-500">
              View all active share links generated within your company.
            </p>
          </div>

          <label className="relative block lg:w-[340px]">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="search"
              placeholder="Search shared items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] table-fixed text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500">
                  <th className="w-[30%] px-6 py-5">Name</th>
                  <th className="w-[18%] px-5 py-5">Shared By</th>
                  <th className="w-[20%] px-5 py-5">Shared On</th>
                  <th className="w-[10%] px-5 py-5">Size</th>
                  <th className="w-[10%] px-5 py-5">Access</th>
                  <th className="w-[12%] px-5 py-5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      Loading shared items...
                    </td>
                  </tr>
                ) : filteredDocuments.length > 0 ? (
                  filteredDocuments.map((share) => {
                    const isFolder = !!share.folderId;
                    const name = isFolder ? share.folderId.name : (share.documentId?.originalFileName || share.documentId?.name || "Unknown");
                    const kind = isFolder ? 'folder' : (share.documentId?.fileType?.toLowerCase() || 'pdf');
                    const size = isFolder ? '-' : (share.documentId?.fileSize ? `${(share.documentId.fileSize / (1024 * 1024)).toFixed(2)} MB` : '-');
                    const access = share.permissions?.readOnly ? "View" : "Edit";
                    const sharedBy = share.sharedBy?.name || share.sharedBy?.email || "Unknown";

                    return (
                      <tr
                        key={share._id}
                        className="text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <DocumentIcon kind={kind} />
                            <span className="truncate">{name}</span>
                          </div>
                        </td>

                        <td className="px-5 py-5">{sharedBy}</td>

                        <td className="px-5 py-5">{new Date(share.createdAt).toLocaleString()}</td>

                        <td className="px-5 py-5">{size}</td>

                        <td className="px-5 py-5">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${access === 'Edit' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                            {access}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handlePreview(share)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100"
                              title="Preview"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => handleCopyLink(share.shareLink)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100"
                              title="Copy Link"
                            >
                              {copiedLink === share.shareLink ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-slate-500"
                    >
                      No shared items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-500">
              Showing {filteredDocuments.length} of {shares.length} results
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
