import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Trash2,
} from "lucide-react";

import Viewer from "../../components/Viewer/Viewer";

const deletedDocuments = [
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
  return (
    <Viewer>
      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
            12. Trash
          </h1>
          <p className="mt-3 text-base text-slate-500">
            Manage your deleted documents.
          </p>
        </section>

        <section className="flex items-center gap-3 rounded-lg bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700">
          <Info size={20} className="shrink-0" />
          <p>Items in trash will be permanently deleted after 30 days.</p>
        </section>

        <section className="flex justify-end">
          <button className="inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-7 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-red-50 hover:text-red-600">
            <Trash2 size={19} className="text-red-600" />
            Empty Trash
          </button>
        </section>

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
                {deletedDocuments.map((document) => (
                  <tr
                    key={document.name}
                    className="text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <FileIcon type={document.type} color={document.color} />
                        <span>{document.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-6">{document.deletedOn}</td>
                    <td className="px-5 py-6">{document.size}</td>
                    <td className="px-5 py-6">
                      <div className="flex items-center justify-center gap-6">
                        <button className="inline-flex h-11 min-w-[118px] items-center justify-center rounded-lg border border-blue-300 bg-white px-5 text-sm font-bold text-blue-700 transition hover:bg-blue-50">
                          Restore
                        </button>
                        <button
                          className="inline-flex h-11 w-[70px] items-center justify-center rounded-lg border border-slate-200 bg-white text-red-600 transition hover:bg-red-50"
                          aria-label={`Delete ${document.name} permanently`}
                        >
                          <Trash2 size={19} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-500">
              Showing 1 to 3 of 3 results
            </p>

            <div className="flex items-center gap-3">
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-300 transition hover:bg-slate-50"
                aria-label="Previous page"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-blue-700 bg-blue-700 text-sm font-semibold text-white shadow-sm"
                aria-label="Page 1"
              >
                1
              </button>
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-300 transition hover:bg-slate-50"
                aria-label="Next page"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </Viewer>
  );
}
