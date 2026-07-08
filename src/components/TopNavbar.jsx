import { Bell, ChevronDown, Search, Building2 } from "lucide-react";
import { useParams } from "react-router-dom";

export default function TopNavbar() {
  const { companySlug } = useParams();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Left side: Company Name / Workspace Info */}
        <div className="flex items-center gap-3">
          {companySlug && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 font-semibold shadow-sm">
              <Building2 size={16} className="text-blue-500" />
              <span>{companySlug.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Right side: Search */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          <div className="relative w-full max-w-sm">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="search"
              placeholder="Search anything..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (e.target.value.trim()) {
                    alert(`Global search initiated for: "${e.target.value}"\n(This will filter results across the dashboard)`);
                    // Here you can integrate with global state or navigation:
                    // window.location.href = `/search?q=${encodeURIComponent(e.target.value)}`;
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
