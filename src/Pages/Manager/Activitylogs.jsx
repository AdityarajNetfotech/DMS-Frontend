import { useMemo, useState } from "react";

import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Info,
  Search,
} from "lucide-react";

import MainLayout from "../../layout/MainLayout";

const logs = [
  {
    user: "John Doe",
    action: "Uploaded",
    document: "Project Proposal.pdf",
    date: "May 16, 2025 10:30 AM",
    ipAddress: "100.168.1.10",
  },
  {
    user: "Jane Smith",
    action: "Downloaded",
    document: "Q1 Financial Report.xlsx",
    date: "May 16, 2025 10:28 AM",
    ipAddress: "100.168.1.12",
  },
  {
    user: "Robert Brown",
    action: "Deleted",
    document: "Old Document.pdf",
    date: "May 16, 2025 09:45 AM",
    ipAddress: "100.168.1.15",
  },
  {
    user: "Emily Clark",
    action: "Shared",
    document: "Marketing Strategy.pptx",
    date: "May 16, 2025 09:10 AM",
    ipAddress: "100.168.1.14",
  },
];

function SelectFilter({ icon: Icon, label, className = "", onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 items-center justify-between rounded-lg border border-slate-200 bg-white px-4 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 ${className}`}
    >
      <span className="flex items-center gap-3">
        {Icon ? <Icon size={19} className="text-slate-500" /> : null}
        {label}
      </span>
      <ChevronDown size={17} className="text-slate-600" />
    </button>
  );
}

export default function Activitylogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activityFilter, setActivityFilter] = useState("All Activities");
  const [userFilter, setUserFilter] = useState("All Users");
  const [actionFilter, setActionFilter] = useState("All Actions");

  const activityOptions = ["All Activities", "Uploaded", "Downloaded", "Deleted", "Shared"];
  const userOptions = ["All Users", "John Doe", "Jane Smith", "Robert Brown", "Emily Clark"];
  const actionOptions = ["All Actions", "Upload", "Download", "Delete", "Share"];

  const filteredLogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesSearch =
        !query ||
        [log.user, log.action, log.document, log.ipAddress]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesActivity =
        activityFilter === "All Activities" || log.action === activityFilter;
      const matchesUser = userFilter === "All Users" || log.user === userFilter;
      const matchesAction =
        actionFilter === "All Actions" ||
        (actionFilter === "Upload" && log.action === "Uploaded") ||
        (actionFilter === "Download" && log.action === "Downloaded") ||
        (actionFilter === "Delete" && log.action === "Deleted") ||
        (actionFilter === "Share" && log.action === "Shared");

      return matchesSearch && matchesActivity && matchesUser && matchesAction;
    });
  }, [searchTerm, activityFilter, userFilter, actionFilter]);

  const cycleActivityFilter = () => {
    const currentIndex = activityOptions.indexOf(activityFilter);
    const nextIndex = (currentIndex + 1) % activityOptions.length;
    setActivityFilter(activityOptions[nextIndex]);
  };

  const cycleUserFilter = () => {
    const currentIndex = userOptions.indexOf(userFilter);
    const nextIndex = (currentIndex + 1) % userOptions.length;
    setUserFilter(userOptions[nextIndex]);
  };

  const cycleActionFilter = () => {
    const currentIndex = actionOptions.indexOf(actionFilter);
    const nextIndex = (currentIndex + 1) % actionOptions.length;
    setActionFilter(actionOptions[nextIndex]);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setActivityFilter("All Activities");
    setUserFilter("All Users");
    setActionFilter("All Actions");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
              <Calendar size={26} className="text-slate-950" />
              10. Activity Logs
            </h1>
            <p className="mt-3 text-base text-slate-500">
              Track all document activities and user actions.
            </p>
          </div>

          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800">
            <Download size={18} />
            Export Logs
          </button>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1.35fr_1.05fr_1fr_1.2fr_auto_auto]">
          <SelectFilter
            icon={Calendar}
            label={activityFilter}
            onClick={cycleActivityFilter}
          />
          <SelectFilter label={userFilter} onClick={cycleUserFilter} />
          <SelectFilter label={actionFilter} onClick={cycleActionFilter} />

          <label className="relative block">
            <Search
              size={20}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search logs..."
              className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-4 pr-12 text-sm font-medium text-slate-700 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              const query = searchTerm.trim().toLowerCase();
              if (!query && activityFilter === "All Activities" && userFilter === "All Users" && actionFilter === "All Actions") {
                return;
              }
              setSearchTerm("");
              setActivityFilter("All Activities");
              setUserFilter("All Users");
              setActionFilter("All Actions");
            }}
            className="inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            <Filter size={19} className="text-slate-700" />
            Filter
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            Clear
          </button>
        </section>

        <section className="flex items-center gap-3 rounded-lg bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700">
          <Info size={20} className="shrink-0" />
          <p>Shows a log of all actions performed by all users for all files.</p>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] table-fixed text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-sm font-semibold text-slate-500">
                  <th className="w-[15%] px-6 py-4">User</th>
                  <th className="w-[13%] px-5 py-4">Action</th>
                  <th className="w-[26%] px-5 py-4">File/Document</th>
                  <th className="w-[22%] px-5 py-4">Date</th>
                  <th className="w-[15%] px-5 py-4">IP Address</th>
                  <th className="w-[9%] px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredLogs.map((log) => (
                  <tr
                    key={`${log.user}-${log.date}`}
                    className="text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-5">{log.user}</td>
                    <td className="px-5 py-5">{log.action}</td>
                    <td className="px-5 py-5">{log.document}</td>
                    <td className="px-5 py-5">{log.date}</td>
                    <td className="px-5 py-5">{log.ipAddress}</td>
                    <td className="px-5 py-5">
                      <div className="flex justify-center">
                        <button
                          className="inline-flex h-9 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-700 transition hover:bg-blue-50"
                          aria-label={`View log for ${log.document}`}
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-500">
            Showing 1 to {filteredLogs.length} of {filteredLogs.length} results
          </p>

          <div className="flex items-center gap-3">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50"
              aria-label="Previous page"
            >
              <ChevronLeft size={19} />
            </button>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-700 bg-blue-700 text-sm font-semibold text-white shadow-sm"
              aria-label="Page 1"
            >
              1
            </button>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50"
              aria-label="Next page"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
