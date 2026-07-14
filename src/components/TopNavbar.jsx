import { Building2 } from "lucide-react";
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

      </div>
    </header>
  );
}
