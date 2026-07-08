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

const versions = [
  {
    version: "v1.3",
    current: true,
    uploadedBy: "Manager",
    date: "May 16, 2025 10:30 AM",
    size: "2.4 MB",
    changes: "Updated executive summary",
  },
  {
    version: "v1.2",
    uploadedBy: "Manager",
    date: "May 15, 2025 04:20 PM",
    size: "2.2 MB",
    changes: "Added budget section",
  },
  {
    version: "v1.1",
    uploadedBy: "Manager",
    date: "May 14, 2025 11:10 AM",
    size: "2.0 MB",
    changes: "Updated project timeline",
  },
];

function ManagerAvatar() {
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
      M
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
              <span className="text-blue-700">Home</span>
              <ChevronRight size={16} className="text-slate-400" />
              <span className="text-blue-700">My Documents</span>
              <ChevronRight size={16} className="text-slate-400" />
              <span className="text-blue-700">Project Alpha</span>
              <ChevronRight size={16} className="text-slate-400" />
              <span className="text-blue-700">Project Proposal.pdf</span>
              <ChevronRight size={16} className="text-slate-400" />
              <span className="text-slate-900">Version History</span>
            </nav>
          </div>

          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50">
            <ArrowLeft size={18} />
            Back to Document
          </button>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.45fr_1fr_1fr_0.9fr]">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <FileText size={34} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Project Proposal.pdf
                </h2>
                <p className="mt-3 text-base font-medium text-slate-500">
                  PDF Document <span className="mx-2">•</span> 2.4 MB
                </p>
              </div>
            </div>

            <div className="space-y-7 border-slate-200 lg:border-l lg:pl-8">
              <div>
                <p className="text-sm font-semibold text-slate-500">Folder</p>
                <p className="mt-3 flex items-center gap-3 text-sm font-medium text-slate-900">
                  <Folder size={19} />
                  Project Alpha / Proposals
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Uploaded By
                </p>
                <p className="mt-3 flex items-center gap-3 text-sm font-medium text-slate-900">
                  <ManagerAvatar />
                  Manager
                </p>
              </div>
            </div>

            <div className="space-y-7 border-slate-200 lg:border-l lg:pl-8">
              <div>
                <p className="text-sm font-semibold text-slate-500">Owner</p>
                <p className="mt-3 text-sm font-medium text-slate-900">
                  Manager
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Uploaded On
                </p>
                <p className="mt-3 text-sm font-medium text-slate-900">
                  May 16, 2025 10:30 AM
                </p>
              </div>
            </div>

            <div className="space-y-7">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Current Version
                </p>
                <span className="mt-3 inline-flex rounded-lg bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                  v1.3
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Total Versions
                </p>
                <p className="mt-3 text-sm font-medium text-slate-900">3</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-slate-950">
              Version History
            </h2>

            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
              <Scale size={18} />
              Compare Versions
            </button>
          </div>

          <div className="mt-7 overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500">
                  <th className="w-[13%] px-4 py-4">Version</th>
                  <th className="w-[18%] px-4 py-4">Uploaded By</th>
                  <th className="w-[20%] px-4 py-4">Date</th>
                  <th className="w-[10%] px-4 py-4">Size</th>
                  <th className="w-[24%] px-4 py-4">Changes</th>
                  <th className="w-[15%] px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {versions.map((item) => (
                  <tr
                    key={item.version}
                    className={`text-sm font-medium text-slate-900 ${
                      item.current ? "bg-emerald-50/70" : "bg-white"
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
                        <ManagerAvatar />
                        {item.uploadedBy}
                      </div>
                    </td>
                    <td className="px-4 py-5">{item.date}</td>
                    <td className="px-4 py-5">{item.size}</td>
                    <td className="px-4 py-5">{item.changes}</td>
                    <td className="px-4 py-5">
                      <div className="flex justify-end gap-3">
                        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                          <Eye size={17} />
                          Preview
                        </button>
                        <button
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 transition hover:bg-slate-50"
                          aria-label={`Download ${item.version}`}
                        >
                          <Download size={18} />
                        </button>
                        <button
                          className="inline-flex h-11 w-9 items-center justify-center rounded-lg text-slate-800 transition hover:bg-slate-100"
                          aria-label={`Open actions for ${item.version}`}
                        >
                          <MoreVertical size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex gap-5 rounded-lg bg-blue-50 px-6 py-6">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-blue-700 text-blue-700">
              <Info size={19} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">
                About Version History
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Each time a document is updated and a new version is saved, it
                will appear in the version history.
              </p>
              <p className="mt-2 text-sm text-slate-600">
                You can preview, download, or compare any version of this
                document.
              </p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
