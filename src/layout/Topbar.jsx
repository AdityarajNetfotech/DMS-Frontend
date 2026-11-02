import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  ChevronDown,
  Menu,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

export default function Topbar() {
  const navigate = useNavigate();
  const { companySlug } = useParams();
  const slugPrefix = companySlug ? `/${companySlug}` : "";

  const resolveRoleTitle = () => {
    const vcRole = localStorage.getItem("vcRole");
    const role = localStorage.getItem("userRole");
    const displayRole = localStorage.getItem("displayRole");
    const email = (localStorage.getItem("userEmail") || "").toLowerCase();

    const normalize = (r) => {
      if (!r) return null;
      const s = String(r).toLowerCase().trim().replace(/[-_]/g, " ");
      if (s === "auditor") return "Auditor";
      if (s === "business user" || s === "business_user") return "Business User";
      if (s === "compliance officer" || s === "compliance_officer" || s === "compliance user") return "Compliance Officer";
      return null;
    };

    return (
      normalize(vcRole) ||
      normalize(displayRole) ||
      normalize(role) ||
      (email.includes("abhishek") || email.includes("auditor") ? "Auditor" :
       email.includes("aditya") || email.includes("business") ? "Business User" :
       email.includes("soudip") || email.includes("compliance") ? "Compliance Officer" :
       (role || "Manager"))
    );
  };

  const [roleTitle, setRoleTitle] = useState(resolveRoleTitle);
  const [userName, setUserName] = useState(() => {
    const stored = localStorage.getItem("userName");
    if (stored && stored.toLowerCase() !== "manager") return stored;
    const email = localStorage.getItem("userEmail") || "";
    if (email) {
      const part = email.split("@")[0];
      return part.charAt(0).toUpperCase() + part.slice(1);
    }
    return "User";
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Sync user profile name and role title
  useEffect(() => {
    const currentRole = resolveRoleTitle();
    setRoleTitle(currentRole);
    localStorage.setItem("userRole", currentRole);

    const storedName = localStorage.getItem("userName");
    if (storedName && storedName.toLowerCase() !== "manager") {
      setUserName(storedName);
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/${companySlug}/users/profile`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const data = await response.json();
        if (data.success && data.data) {
          const user = data.data;
          if (user.name) {
            const capName = user.name.charAt(0).toUpperCase() + user.name.slice(1);
            setUserName(capName);
            localStorage.setItem("userName", capName);
          }
          if (user.vcRole) {
            localStorage.setItem("vcRole", user.vcRole);
          }
          if (user.displayRole) {
            localStorage.setItem("displayRole", user.displayRole);
          }
          const freshRole = resolveRoleTitle();
          setRoleTitle(freshRole);
          localStorage.setItem("userRole", freshRole);
        }
      } catch (err) {
        console.error("Failed to fetch topbar profile name:", err);
      }
    };

    if (companySlug && localStorage.getItem("accessToken")) {
      fetchProfile();
    }
  }, [companySlug]);

  const handleProfileClick = () => {
    const role = localStorage.getItem("userRole");
    if (role === "Reporting Manager") {
      navigate(`${slugPrefix}/reporting-manager/profile-settings`);
    } else if (role === "Legal Team") {
      navigate(`${slugPrefix}/legal/profile-settings`);
    } else if (role === "Compliance Team") {
      navigate(`${slugPrefix}/compliance/profile-settings`);
    } else {
      navigate(`${slugPrefix}/manager/profile-settings`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const role = localStorage.getItem("userRole");
    if (role === "Reporting Manager") {
      navigate(`${slugPrefix}/reporting-manager/approvals${searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : ''}`);
    } else if (role === "Legal Team") {
      navigate(`${slugPrefix}/legal/approvals${searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : ''}`);
    } else if (role === "Compliance Team") {
      navigate(`${slugPrefix}/compliance/approvals${searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : ''}`);
    } else {
      if (searchQuery.trim()) {
        navigate(`${slugPrefix}/manager/search-filters?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate(`${slugPrefix}/manager/search-filters`);
      }
    }
  };

  const userRole = localStorage.getItem("userRole") || "Manager";

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu */}
        <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
          <Menu size={20} />
        </button>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder={
              userRole === "Reporting Manager" || userRole === "Legal Team" || userRole === "Compliance Team"
                ? "Search approvals queue..."
                : "Search documents..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-[220px]
              md:w-[300px]
              lg:w-[360px]
              h-10
              pl-10
              pr-4
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              text-sm
              outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:border-blue-500
            "
          />
        </form>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* User Profile */}
        <div
          onClick={handleProfileClick}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div className="hidden md:block">
            <h4 className="text-sm font-semibold text-slate-800">
              {userName}
            </h4>

            <p className="text-xs text-slate-500">
              {roleTitle}
            </p>
          </div>

          <ChevronDown
            size={16}
            className="hidden md:block text-slate-500"
          />
        </div>
      </div>
    </header>
  );
}