import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Plus,
  Mail,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: Building2, label: "Tenants List", path: "/tenants" },
  { icon: Plus, label: "Register Tenant", path: "/register-tenant" },
  { icon: Mail, label: "Enquiries", path: "/enquiries" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/superadminlogin");
  };

  return (
    <aside className="hidden lg:flex w-[250px] bg-white border-r border-slate-200 flex-col h-screen sticky top-0 font-sans">
      {/* Logo Section */}
      <div className="px-6 py-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
            S
          </div>
          <div>
            <h2 className="font-bold text-slate-900 leading-tight">
              Super Admin
            </h2>
            <p className="text-xs text-slate-500">
              Control Panel
            </p>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-200 p-3 space-y-1">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 font-medium cursor-pointer transition-all"
          onClick={handleLogout}
          type="button"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}