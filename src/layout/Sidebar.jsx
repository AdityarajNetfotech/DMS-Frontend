import {
  LayoutDashboard,
  FolderOpen,
  FolderTree,
  Share2,
  Archive,
  Trash2,
  ShieldCheck,
  Activity,
  User,
  LogOut,
  Menu,
  Search,
} from "lucide-react";

import { NavLink, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

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
        console.error("Failed to load branding in sidebar", err);
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

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: `${slugPrefix}/manager/dashboard`,
    },
    {
      name: "My Documents",
      icon: FolderOpen,
      path: `${slugPrefix}/manager/my-documents`,
    },
    {
      name: "Folder Explorer",
      icon: FolderTree,
      path: `${slugPrefix}/manager/folder-explorer`,
    },
    {
      name: "Search & Filters",
      icon: Search,
      path: `${slugPrefix}/manager/search-filters`,
    },
    {
      name: "Shared by my",
      icon: Share2,
      path: `${slugPrefix}/manager/shared-with-me`,
    },
    {
      name: "Archive Document",
      icon: Archive,
      path: `${slugPrefix}/manager/recent-documents`,
    },
    {
      name: "Trash",
      icon: Trash2,
      path: `${slugPrefix}/manager/trash`,
    },
  ];


  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[250px] bg-white border-r border-slate-200 flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b">
          <NavLink
            to={`${slugPrefix}/manager/profile-settings`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div 
              style={!branding.logo ? { backgroundColor: branding.primaryColor } : {}}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden border border-slate-100"
            >
              {branding.logo ? (
                <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                (branding.companyName || "D").charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <h2 className="font-bold text-slate-900 truncate max-w-[140px]">
                {branding.companyName || "Manager Section"}
              </h2>

              <p className="text-xs text-slate-500">
                Manager Dashboard
              </p>
            </div>
          </NavLink>
        </div>

        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  style={({ isActive }) =>
                    isActive ? { backgroundColor: branding.primaryColor, color: '#fff' } : {}
                  }
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "shadow-sm text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

        </div>

        {/* Bottom */}
        <div className="border-t p-3 space-y-1">
          <NavLink
            to={`${slugPrefix}/manager/profile-settings`}
            style={({ isActive }) =>
              isActive ? { backgroundColor: branding.primaryColor, color: '#fff' } : {}
            }
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "shadow-sm text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <User size={18} />
            Profile Settings
          </NavLink>

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 font-medium cursor-pointer"
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
            type="button"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4">
        <NavLink
          to={`${slugPrefix}/manager/profile-settings`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div 
            style={!branding.logo ? { backgroundColor: branding.primaryColor } : {}}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden border border-slate-100"
          >
            {branding.logo ? (
              <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              (branding.companyName || "D").charAt(0).toUpperCase()
            )}
          </div>

          <span className="font-semibold text-slate-900 truncate max-w-[160px]">
            {branding.companyName || "Manager Section"}
          </span>
        </NavLink>

        <button className="p-2 rounded-lg hover:bg-slate-100">
          <Menu size={22} />
        </button>
      </div>
    </>
  );
}
