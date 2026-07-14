import {
  Bell,
  ChevronDown,
  CircleHelp,
  Menu,
  Search,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "./Sidebar";

function ViewerNavbar() {
  const navigate = useNavigate();
  const { companySlug } = useParams();
  const userName = localStorage.getItem("userName") || "Viewer";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-[82px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-7">
      <div className="flex items-center gap-4">
        <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 lg:hidden">
          <Menu size={22} />
        </button>

        <label className="relative hidden w-[520px] max-w-[46vw] md:block">
          <Search
            size={19}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="search"
            placeholder="Search documents, folders..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                navigate(`/${companySlug}/viewer/search?q=${encodeURIComponent(e.target.value.trim())}`);
              }
            }}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-20 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
            Enter
          </span>
        </label>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/${companySlug}/viewer/profile`)}
          className="flex items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-slate-50"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-bold text-blue-900 ring-2 ring-white">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-bold text-slate-950 truncate max-w-[150px]">{userName}</p>
            <p className="text-xs font-medium text-slate-500">Viewer</p>
          </div>
          <ChevronDown size={18} className="hidden text-slate-600 sm:block" />
        </button>
      </div>
    </header>
  );
}

export default function Viewer({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <ViewerNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
