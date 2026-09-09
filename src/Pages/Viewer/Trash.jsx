import { useState, useMemo } from "react";
import {
  ChevronDown,
  Info,
  Trash2,
} from "lucide-react";

import Viewer from "../../components/Viewer/Viewer";
import Pagination from "../../components/common/Pagination";

const initialDeletedDocuments = [
  {
    name: "Old Project Plan.docx",
    deletedOn: "May 10, 2025 10:30 AM",
    size: "1.4 MB",
    type: "PDF",
    color: "bg-red-600",
  },
  {
    name: "Draft Report.pdf",
    deletedOn: "May 08, 2025 04:15 PM",
    size: "2.1 MB",
    type: "W",
    color: "bg-blue-600",
  },
  {
    name: "Temp Data.xlsx",
    deletedOn: "May 04, 2025 03:50 PM",
    size: "1.1 MB",
    type: "X",
    color: "bg-emerald-600",
  },
];

function FileIcon({ type, color }) {
  return (
    <span
      className={`relative inline-flex h-8 w-7 shrink-0 items-end justify-center rounded-sm ${color} pb-1 text-[10px] font-bold text-white shadow-sm`}
    >
      <span className="absolute right-0 top-0 h-0 w-0 border-l-[8px] border-t-[8px] border-l-white/35 border-t-white" />
      {type}
    </span>
  );
}

export default function Trash() {
  const [deletedDocuments, setDeletedDocuments] = useState(initialDeletedDocuments);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Always show latest deleted documents 1st
  const sortedDocuments = useMemo(() => {
    return [...deletedDocuments].sort((a, b) => {
      const timeA = new Date(a.deletedOn || 0).getTime();
      const timeB = new Date(b.deletedOn || 0).getTime();
      return timeB - timeA;
    });
  }, [deletedDocuments]);

  // Paginate 10 documents per page
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedDocuments.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedDocuments, currentPage]);

  const handleEmptyTrash = () => {
    if (window.confirm("Are you sure you want to permanently delete all items in trash?")) {
      setDeletedDocuments([]);
    }
  };

  const handleRestore = (docName) => {
    setDeletedDocuments(prev => prev.filter(d => d.name !== docName));
  };

  const handleDeletePermanent = (docName) => {
    setDeletedDocuments(prev => prev.filter(d => d.name !== docName));
  };

  return (
    <Viewer>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
            Trash Bin
          </h1>
          <p className="mt-3 text-base font-medium text-slate-500">
            Manage your deleted documents.
          </p>
        </section>

        <section className="flex items-center gap-3 rounded-lg bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700">
          <Info size={20} className="shrink-0" />
          <p>Items in trash will be permanently deleted after 30 days.</p>
        </section>

        {deletedDocuments.length > 0 && (
          <section className="flex justify-end">
            <button
              onClick={handleEmptyTrash}
              className="inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-7 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
            >
              <Trash2 size={19} className="text-red-600" />
              Empty Trash
            </button>
          </section>
        )}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-sm font-semibold text-slate-500">
                  <th className="w-[34%] px-6 py-5">Name</th>
                  <th className="w-[29%] px-5 py-5">
                    <button className="inline-flex items-center gap-2 transition hover:text-slate-900">
                      Deleted On
                      <ChevronDown size={16} />
                    </button>
                  </th>
                  <th className="w-[16%] px-5 py-5">Size</th>
                  <th className="w-[21%] px-5 py-5 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {paginatedDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500 font-medium">
                      Trash bin is empty.
                    </td>
                  </tr>
                ) : (
                  paginatedDocuments.map((document) => (
                    <tr
                      key={document.name}
                      className="text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <FileIcon type={document.type} color={document.color} />
                          <span className="font-semibold text-slate-900">{document.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-6 text-slate-600">{document.deletedOn}</td>
                      <td className="px-5 py-6 text-slate-600">{document.size}</td>
                      <td className="px-5 py-6">
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={() => handleRestore(document.name)}
                            className="inline-flex h-9 min-w-[90px] items-center justify-center rounded-lg border border-blue-300 bg-white px-4 text-xs font-bold text-blue-700 transition hover:bg-blue-50 cursor-pointer"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeletePermanent(document.name)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-red-600 transition hover:bg-red-50 cursor-pointer"
                            aria-label={`Delete ${document.name} permanently`}
                            title="Delete Permanently"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {sortedDocuments.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={sortedDocuments.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemName="deleted documents"
            />
          )}
        </section>
      </div>
    </Viewer>
  );
}
