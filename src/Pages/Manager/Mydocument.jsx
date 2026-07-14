// import {
//   ChevronLeft,
//   ChevronRight,
//   ChevronsUpDown,
//   FileSpreadsheet,
//   FileText,
//   Filter,
//   Folder,
//   MoreVertical,
//   Presentation,
//   Search,
//   UploadCloud,
// } from "lucide-react";

// import MainLayout from "../../layout/MainLayout";

// const documents = [
//   {
//     name: "Project Alpha",
//     owner: "Manager",
//     modified: "May 16, 2025 10:30 AM",
//     size: "-",
//     type: "Folder",
//     kind: "folder",
//   },
//   {
//     name: "HR Documents",
//     owner: "Manager",
//     modified: "May 15, 2025 02:15 PM",
//     size: "-",
//     type: "Folder",
//     kind: "folder",
//   },
//   {
//     name: "Project Proposal.pdf",
//     owner: "Manager",
//     modified: "May 16, 2025 10:30 AM",
//     size: "2.4 MB",
//     type: "PDF",
//     kind: "pdf",
//   },
//   {
//     name: "Q2 Financial Report.xlsx",
//     owner: "Manager",
//     modified: "May 15, 2025 09:20 AM",
//     size: "1.8 MB",
//     type: "Excel",
//     kind: "excel",
//   },
//   {
//     name: "Marketing Strategy.pptx",
//     owner: "Manager",
//     modified: "May 14, 2025 04:45 PM",
//     size: "3.1 MB",
//     type: "PowerPoint",
//     kind: "powerpoint",
//   },
//   {
//     name: "Employee Handbook.pdf",
//     owner: "Manager",
//     modified: "May 13, 2025 11:10 AM",
//     size: "2.7 MB",
//     type: "PDF",
//     kind: "pdf",
//   },
//   {
//     name: "Budget Plan.xlsx",
//     owner: "Manager",
//     modified: "May 12, 2025 03:30 PM",
//     size: "1.2 MB",
//     type: "Excel",
//     kind: "excel",
//   },
// ];

// const fileIconClass = {
//   folder: "bg-amber-100 text-amber-500",
//   pdf: "bg-red-100 text-red-600",
//   excel: "bg-emerald-100 text-emerald-600",
//   powerpoint: "bg-orange-100 text-orange-600",
// };

// function DocumentIcon({ kind }) {
//   const className = `flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
//     fileIconClass[kind] || "bg-slate-100 text-slate-500"
//   }`;

//   if (kind === "folder") {
//     return (
//       <div className={className}>
//         <Folder size={22} fill="currentColor" strokeWidth={1.7} />
//       </div>
//     );
//   }

//   if (kind === "excel") {
//     return (
//       <div className={className}>
//         <FileSpreadsheet size={20} />
//       </div>
//     );
//   }

//   if (kind === "powerpoint") {
//     return (
//       <div className={className}>
//         <Presentation size={20} />
//       </div>
//     );
//   }

//   return (
//     <div className={className}>
//       <FileText size={20} />
//     </div>
//   );
// }

// export default function Mydocument() {
//   return (
//     <MainLayout>
//       <div className="space-y-8">
//         <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-normal text-slate-950">
//               My Documents
//             </h1>
//             <p className="mt-3 text-base text-slate-500">
//               Manage and organize your documents.
//             </p>
//           </div>

//           <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
//             <label className="relative block sm:w-[300px]">
//               <Search
//                 size={20}
//                 className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
//               />
//               <input
//                 type="search"
//                 placeholder="Search documents..."
//                 className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//               />
//             </label>

//             <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
//               <Filter size={18} />
//               Filters
//             </button>

//             <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800">
//               <UploadCloud size={18} />
//               Upload Document
//             </button>
//           </div>
//         </section>

//         <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[900px] table-fixed text-left">
//               <thead>
//                 <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500">
//                   <th className="w-[28%] px-8 py-5">
//                     <button className="inline-flex items-center gap-2">
//                       Name
//                       <ChevronsUpDown size={16} />
//                     </button>
//                   </th>
//                   <th className="w-[16%] px-6 py-5">Owner</th>
//                   <th className="w-[22%] px-6 py-5">
//                     <button className="inline-flex items-center gap-2">
//                       Last Modified
//                       <ChevronsUpDown size={16} />
//                     </button>
//                   </th>
//                   <th className="w-[9%] px-6 py-5">Size</th>
//                   <th className="w-[13%] px-6 py-5">Type</th>
//                   <th className="w-[12%] px-8 py-5 text-right">Actions</th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-slate-200">
//                 {documents.map((document) => (
//                   <tr
//                     key={document.name}
//                     className="text-sm font-medium text-slate-900 transition hover:bg-slate-50"
//                   >
//                     <td className="px-8 py-5">
//                       <div className="flex items-center gap-4">
//                         <DocumentIcon kind={document.kind} />
//                         <span className="truncate">{document.name}</span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-5">{document.owner}</td>
//                     <td className="px-6 py-5 text-slate-800">
//                       {document.modified}
//                     </td>
//                     <td className="px-6 py-5">{document.size}</td>
//                     <td className="px-6 py-5">{document.type}</td>
//                     <td className="px-8 py-5">
//                       <div className="flex justify-end">
//                         <button
//                           className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100"
//                           aria-label={`Open actions for ${document.name}`}
//                         >
//                           <MoreVertical size={20} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex flex-col gap-4 border-t border-slate-200 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
//             <p className="text-sm text-slate-500">
//               Showing 1 to {documents.length} of {documents.length} results
//             </p>

//             <div className="flex items-center gap-3">
//               <button
//                 className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50"
//                 aria-label="Previous page"
//               >
//                 <ChevronLeft size={20} />
//               </button>

//               <button
//                 className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-700 text-sm font-semibold text-white shadow-sm"
//                 aria-label="Current page 1"
//               >
//                 1
//               </button>

//               <button
//                 className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
//                 aria-label="Next page"
//               >
//                 <ChevronRight size={20} />
//               </button>
//             </div>
//           </div>
//         </section>
//       </div>
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Filter,
  Folder,
  Presentation,
  Search,
} from "lucide-react";
import MainLayout from "../../layout/MainLayout";
import { API_BASE_URL } from "../../config/api";

function FileIcon({ kind, className = "" }) {
  if (kind === "folder") {
    return (
      <div className={className}>
        <Folder size={22} fill="currentColor" strokeWidth={1.7} />
      </div>
    );
  }

  if (kind === "excel") {
    return (
      <div className={className}>
        <FileSpreadsheet size={20} />
      </div>
    );
  }

  if (kind === "powerpoint") {
    return (
      <div className={className}>
        <Presentation size={20} />
      </div>
    );
  }

  return (
    <div className={className}>
      <FileText size={20} />
    </div>
  );
}

export default function Mydocument() {
  const { companySlug } = useParams();
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE_URL}/api/${companySlug}/manager/recent`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setDocuments(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch recent items", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentItems();
  }, [companySlug]);

  const filteredDocuments = documents.filter((doc) =>
    (doc.name || doc.originalFileName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-8">
        <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Latest Documents & Folders
            </h1>
            <p className="mt-2 text-slate-500">
              A quick overview of the most recent files and folders created or uploaded.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative sm:w-80">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            {/* <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200">
              <Filter size={18} />
              Filter
            </button> */}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Manager</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Date Modified</th>
                  <th className="px-6 py-4 font-medium">Size</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      Loading latest items...
                    </td>
                  </tr>
                ) : filteredDocuments.length > 0 ? (
                  filteredDocuments.map((document) => (
                    <tr
                      key={document._id || document.id}
                      className="group transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <FileIcon
                            kind={document.kind}
                            className={`flex h-11 w-11 items-center justify-center rounded-lg ${document.kind === "folder"
                                ? "bg-slate-100 text-slate-500"
                                : document.kind === "pdf"
                                  ? "bg-red-50 text-red-600"
                                  : document.kind === "excel"
                                    ? "bg-green-50 text-green-600"
                                    : document.kind === "powerpoint"
                                      ? "bg-orange-50 text-orange-600"
                                      : "bg-blue-50 text-blue-600"
                              }`}
                          />
                          <div>
                            <p className="font-semibold text-slate-900">
                              {document.name || document.originalFileName}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-slate-700 font-medium">
                        {document.uploadedBy?.name || document.createdBy?.name || "System"}
                      </td>

                      <td className="px-6 py-5 text-slate-700">
                        {document.departmentId?.name ? (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {document.departmentId.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Global</span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-slate-600">
                        {new Date(document.createdAt || document.modified).toLocaleString()}
                      </td>

                      <td className="px-6 py-5 text-slate-600">
                        {document.kind === 'folder'
                          ? (document.fileSize ? (document.fileSize / (1024 * 1024) < 1 ? `${(document.fileSize / 1024).toFixed(1)} KB` : `${(document.fileSize / (1024 * 1024)).toFixed(2)} MB`) : '0 KB')
                          : (document.fileSize ? (document.fileSize / (1024 * 1024) < 1 ? `${(document.fileSize / 1024).toFixed(1)} KB` : `${(document.fileSize / (1024 * 1024)).toFixed(2)} MB`) : '-')}
                      </td>

                      <td className="px-6 py-5 text-slate-700">
                        {document.type}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No documents or folders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold">{filteredDocuments.length}</span> of <span className="font-semibold">{documents.length}</span> documents
            </p>

            <div className="flex items-center gap-3">
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 hover:bg-slate-50">
                <ChevronLeft size={18} />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white font-semibold">
                1
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 hover:bg-slate-50">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}