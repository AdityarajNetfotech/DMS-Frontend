// src/components/Sidebar.jsx

import {
  Users,
  Settings2,
  Shield,
  BarChart3,
  Settings,
  CircleHelp,
  X,
  LogOut,
  TrendingUp,
  LayoutDashboard,
  User,
} from "lucide-react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";

export default function Sidebar({
  isOpen = false,
  onClose = () => {},
}) {
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
          primaryColor: data.primaryColor || "#072B86",
          companyName: data.companyName || "DMS"
        };
      } catch (e) {
        console.error(e);
      }
    }
    return { logo: "", primaryColor: "#072B86", companyName: "" };
  });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/${companySlug}/branding`);
        const data = await res.json();
        if (data.success) {
          const fresh = {
            logo: data.data.logo || "",
            primaryColor: data.data.primaryColor || "#072B86",
            companyName: data.data.companyName || "DMS"
          };
          setBranding(fresh);
          localStorage.setItem(`branding_${companySlug}`, JSON.stringify(data.data));
        }
      } catch (err) {
        console.error("Failed to load branding in admin sidebar", err);
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
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      path: `${slugPrefix}/admin/dashboard`,
    },
    {
      icon: <User size={20} />,
      label: "Profile Settings",
      path: `${slugPrefix}/admin/profile`,
    },
    {
      icon: <Users size={20} />,
      label: "User Management",
      path: `${slugPrefix}/admin/user-management`,
    },
    {
      icon: <TrendingUp size={20} />,
      label: "Manager Activity",
      path: `${slugPrefix}/admin/manager-activity`,
    },
    {
      icon: <Settings2 size={20} />,
      label: "Workspace Configuration",
      path: `${slugPrefix}/admin/workspace-configuration`,
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[250px] bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              style={!branding.logo ? { backgroundColor: branding.primaryColor } : {}}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden border border-slate-100"
            >
              {branding.logo ? (
                <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                (branding.companyName || "A").charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="font-bold text-slate-900 truncate max-w-[130px]">
                {branding.companyName || "Admin Portal"}
              </h1>
              <p className="text-[10px] text-slate-500">
                Workspace Admin
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close sidebar"
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={({ isActive }) =>
                isActive ? { backgroundColor: branding.primaryColor, color: '#fff' } : {}
              }
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <span className="shrink-0 opacity-80">{item.icon}</span>

              <span className="truncate">
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t p-3 space-y-1">
          {/* User Badge Profile */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-100/80 mb-2">
            <div 
              style={{ backgroundColor: branding.primaryColor + '20', color: branding.primaryColor }}
              className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs"
            >
              TA
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-900 font-bold truncate">Tenant Admin</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Enterprise</p>
            </div>
          </div>

          <NavLink
            to="/admin/help-center"
            onClick={onClose}
            style={({ isActive }) =>
              isActive ? { backgroundColor: branding.primaryColor, color: '#fff' } : {}
            }
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "text-white shadow-sm font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <CircleHelp size={18} />
            <span>Help Center</span>
          </NavLink>

          <button
            type="button"
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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 font-medium cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}