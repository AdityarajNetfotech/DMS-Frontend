import {
  ChevronDown,
  ChevronLeft,
  Clock3,
  FileText,
  FolderOpen,
  Home,
  Search,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";

export default function Sidebar() {
  const navigate = useNavigate();
  const { companySlug } = useParams();
  const slugPrefix = companySlug ? `/${companySlug}` : "";

  const [branding, setBranding] = useState(() => {
    const cached = localStorage.getItem(`branding_${companySlug}`);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        return {
          logo: data.logo || "",
          primaryColor: data.primaryColor || "#2563eb",
          companyName: data.companyName || "DMS"
        };
      } catch (e) {
        console.error(e);
      }
    }
    return { logo: "", primaryColor: "#2563eb", companyName: "" };
  });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/${companySlug}/branding`);
        const data = await res.json();
        if (data.success) {
          const fresh = {
            logo: data.data.logo || "",
            primaryColor: data.data.primaryColor || "#2563eb",
            companyName: data.data.companyName || "DMS"
          };
          setBranding(fresh);
          localStorage.setItem(`branding_${companySlug}`, JSON.stringify(data.data));
        }
      } catch (err) {
        console.error("Failed to load branding in viewer sidebar", err);
      }
    };
    if (companySlug) {
      fetchBranding();
    }

    // Listen for custom events to refresh branding in real-time
    const handleUpdate = () => fetchBranding();
    window.addEventListener("branding-update", handleUpdate);
    return () => window.removeEventListener("branding-update", handleUpdate);
  }, [companySlug]);

  const navItems = [
    { name: "Dashboard", icon: Home, path: `${slugPrefix}/viewer/dashboard` },
    { name: "My Documents", icon: FileText, path: `${slugPrefix}/viewer/my-documents` },
    { name: "Shared With Me", icon: Users, path: `${slugPrefix}/viewer/shared-with-me` },
    { name: "My Favorite", icon: Star, path: `${slugPrefix}/viewer/my-access` },
  ];

  return (
    <aside className="hidden h-screen w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white lg:flex sticky top-0">
      <div className="flex h-[82px] items-center gap-3 border-b border-slate-200 px-5">
        <div
          style={!branding.logo ? { backgroundColor: branding.primaryColor } : {}}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-white shadow-sm overflow-hidden border border-slate-100"
        >
          {branding.logo ? (
            <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            (branding.companyName || "D").charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-950 truncate max-w-[170px]">
            {branding.companyName || "DMS"}
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Viewer Dashboard
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                style={({ isActive }) =>
                  isActive ? { backgroundColor: branding.primaryColor + '15', color: branding.primaryColor } : {}
                }
                className={({ isActive }) =>
                  `flex h-13 items-center gap-4 rounded-lg px-4 text-sm font-semibold transition ${isActive
                    ? ""
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                  }`
                }
              >
                <Icon size={21} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>



      <div className="border-t border-slate-200 pt-4">
        <button
          type="button"
          className="w-full flex items-center gap-4 px-8 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 cursor-pointer"
          onClick={() => {
            const slug = companySlug || localStorage.getItem("companySlug");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userRole");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userName");
            localStorage.removeItem("companySlug");
            navigate(slug ? `/${slug}/login` : "/login");
          }}
        >
          <ChevronLeft size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
