import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Folder,
  Info,
  MoreVertical,
  Scale,
} from "lucide-react";

import MainLayout from "../../layout/MainLayout";
import { API_BASE_URL } from "../../config/api";

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

function ManagerAvatar({ name }) {
  const initials = (name || "Manager")
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
    
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
      {initials}
    </span>
  );
}

function VersionBadge({ version, current }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex h-8 items-center rounded-lg px-3 text-sm font-semibold ${
          current
            ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
            : "bg-slate-100 text-slate-800"
        }`}
      >
        {version}
      </span>

      {current ? (
        <span className="inline-flex h-7 items-center rounded-lg bg-emerald-100 px-3 text-xs font-semibold text-emerald-700">
          Current
        </span>
      ) : null}
    </div>
  );
}

export default function Documentversionhistory() {
  const { companySlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const documentId = searchParams.get("documentId");

  const [document, setDocument] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVersionHistory = async () => {
    if (!documentId) {
      setError("No document ID specified");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/documents/${documentId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const resData = await response.json();
      if (resData.success) {
        setDocument(resData.data.document);
        setVersions(resData.data.versions || []);
      } else {
        setError(resData.message || "Failed to load version history.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error fetching version history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companySlug && documentId) {
      fetchVersionHistory();
    }
  }, [companySlug, documentId]);

  const allVersions = useMemo(() => {
    if (!document) return [];

    // Current version details
    const current = {
      _id: document._id,
      version: `v${document.versionNumber}.0`,
      versionNumber: document.versionNumber,
      current: true,
      uploadedBy: document.uploadedBy?.name || "Manager",
      date: new Date(document.updatedAt || document.createdAt).toLocaleString(),
      size: formatBytes(document.fileSize),
      changes: document.description || "Active version",
      storageUrl: document.storageUrl,
      fileName: document.originalFileName
    };

    // Past versions details
    const historical = versions.map(v => ({
      _id: v._id,
      version: `v${v.versionNumber}.0`,
      versionNumber: v.versionNumber,
      current: false,
      uploadedBy: v.uploadedBy?.name || "Manager",
      date: new Date(v.createdAt).toLocaleString(),
      size: formatBytes(v.fileSize),
      changes: v.comment || "Previous version backup",
      storageUrl: v.storageUrl,
      fileName: v.fileName
    }));

    return [current, ...historical];
  }, [document, versions]);

  const handleDownload = (ver) => {
    if (ver.current) {
      const token = localStorage.getItem("accessToken");
      window.open(`${API_BASE_URL}/api/${companySlug}/manager/documents/${document._id}/download?token=${token}`, "_blank");
    } else {
      const url = ver.storageUrl.startsWith("http") ? ver.storageUrl : `${API_BASE_URL}${ver.storageUrl}`;
      window.open(url, "_blank");
    }
  };

  const handlePreview = (ver) => {
    if (ver.current) {
      const token = localStorage.getItem("accessToken");
      window.open(`${API_BASE_URL}/api/${companySlug}/manager/documents/${document._id}/preview?token=${token}`, "_blank");
    } else {
      const url = ver.storageUrl.startsWith("http") ? ver.storageUrl : `${API_BASE_URL}${ver.storageUrl}`;
      window.open(url, "_blank");
    }
  };

  const handleRestore = async (versionId) => {
    if (!window.confirm("Are you sure you want to restore this older version as the current version?")) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/documents/${documentId}/versions/${versionId}/restore`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const resData = await response.json();
      if (resData.success) {
        alert("Document version restored successfully!");
        fetchVersionHistory();
      } else {
        alert(resData.message || "Failed to restore version.");
      }
    } catch (err) {
      console.error(err);
      alert("Error restoring version.");
    }
  };

  const handleBack = () => {
    if (document?.folderId) {
      navigate(`/${companySlug}/manager/folder-explorer?folderId=${document.folderId}`);
    } else {
      navigate(`/${companySlug}/manager/folder-explorer`);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-7">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950">
              Document Version History
            </h1>
            <p className="mt-3 text-base text-slate-500">
              View and manage all versions of this document.
            </p>

            <nav className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold">
              <span className="text-blue-700 cursor-pointer" onClick={() => navigate(`/${companySlug}/manager/dashboard`)}>Home</span>
              <ChevronRight size={16} className="text-slate-400" />
              <span className="text-blue-700 cursor-pointer" onClick={handleBack}>Documents</span>
              {document && (
                <>
                  <ChevronRight size={16} className="text-slate-400" />
                  <span className="text-blue-700 truncate max-w-[150px]">{document.name}</span>
                </>
              )}
              <ChevronRight size={16} className="text-slate-400" />
              <span className="text-slate-900">Version History</span>
            </nav>
          </div>

          <button 
            onClick={handleBack}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Back to Document
          </button>
        </section>

        {loading ? (
          <p className="text-center py-12 text-slate-500 font-semibold">Loading version history...</p>
        ) : error ? (
          <p className="text-center py-12 text-red-500 font-semibold">{error}</p>
        ) : document ? (
          <>
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.45fr_1fr_1fr_0.9fr]">
                <div className="flex items-start gap-5 min-w-0">
                  <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                    <FileText size={34} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-slate-950 truncate" title={document.originalFileName || document.name}>
                      {document.originalFileName || document.name}
                    </h2>
                    <p className="mt-3 text-base font-medium text-slate-500">
                      {document.fileType || "FILE"} Document <span className="mx-2">•</span> {formatBytes(document.fileSize)}
                    </p>
                  </div>
                </div>

                <div className="space-y-7 border-slate-200 lg:border-l lg:pl-8">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Folder</p>
                    <p className="mt-3 flex items-center gap-3 text-sm font-medium text-slate-900 truncate">
                      <Folder size={19} className="text-blue-500 shrink-0" />
                      <span className="truncate">{document.folderId?.name || "Root"}</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Uploaded By
                    </p>
                    <p className="mt-3 flex items-center gap-3 text-sm font-medium text-slate-900">
                      <ManagerAvatar name={document.uploadedBy?.name} />
                      {document.uploadedBy?.name || "Manager"}
                    </p>
                  </div>
                </div>

                <div className="space-y-7 border-slate-200 lg:border-l lg:pl-8">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Owner</p>
                    <p className="mt-3 text-sm font-medium text-slate-900">
                      {document.uploadedBy?.name || "Manager"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Uploaded On
                    </p>
                    <p className="mt-3 text-sm font-medium text-slate-900">
                      {new Date(document.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-7">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Current Version
                    </p>
                    <span className="mt-3 inline-flex rounded-lg bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                      v{document.versionNumber}.0
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Total Versions
                    </p>
                    <p className="mt-3 text-sm font-medium text-slate-900">
                      {versions.length + 1}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold text-slate-950">
                  Version History Log
                </h2>
              </div>

              <div className="mt-7 overflow-x-auto">
                <table className="w-full min-w-[900px] table-fixed text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500">
                      <th className="w-[15%] px-4 py-4">Version</th>
                      <th className="w-[18%] px-4 py-4">Uploaded By</th>
                      <th className="w-[20%] px-4 py-4">Date</th>
                      <th className="w-[12%] px-4 py-4">Size</th>
                      <th className="w-[22%] px-4 py-4">Changes / Status</th>
                      <th className="w-[13%] px-4 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {allVersions.map((item) => (
                      <tr
                        key={item.version}
                        className={`text-sm font-medium text-slate-900 transition hover:bg-slate-50/50 ${
                          item.current ? "bg-emerald-50/40" : "bg-white"
                        }`}
                      >
                        <td className="px-4 py-5">
                          <VersionBadge
                            version={item.version}
                            current={item.current}
                          />
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-3">
                            <ManagerAvatar name={item.uploadedBy} />
                            <span>{item.uploadedBy}</span>
                          </div>
                        </td>
                        <td className="px-4 py-5">{item.date}</td>
                        <td className="px-4 py-5">{item.size}</td>
                        <td className="px-4 py-5 text-slate-500 italic font-normal">
                          {item.changes}
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex justify-end gap-2">
                            {!item.current && (
                              <button
                                onClick={() => handleRestore(item._id)}
                                className="inline-flex h-9 px-3 items-center justify-center gap-1 rounded-lg border border-blue-200 bg-blue-50 text-xs font-bold text-blue-700 transition hover:bg-blue-100 hover:text-blue-900 shadow-sm"
                                title="Restore as current version"
                              >
                                Restore
                              </button>
                            )}
                            <button 
                              onClick={() => handlePreview(item)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                              title="Preview"
                            >
                              <Eye size={17} />
                            </button>
                            <button
                              onClick={() => handleDownload(item)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                              title="Download"
                            >
                              <Download size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 flex gap-5 rounded-lg bg-blue-50 px-6 py-6 border border-blue-100">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <Info size={19} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-blue-900">
                    About Version History
                  </h3>
                  <p className="mt-2 text-sm text-blue-700/80">
                    Each time a document is updated with a new file of the same name, the platform automatically logs the old document file as a historical backup.
                  </p>
                  <p className="mt-1.5 text-sm text-blue-700/80">
                    You can view the full historical logs, download older files, or preview the document contents at any point in time.
                  </p>
                </div>
              </div>
            </section>
          </>
        ) : (
          <p className="text-center py-12 text-slate-500 font-semibold">Document not found.</p>
        )}
      </div>
    </MainLayout>
  );
}
