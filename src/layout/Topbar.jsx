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

  const [userName, setUserName] = useState("Manager");
  const [searchQuery, setSearchQuery] = useState("");

  // Sync user profile name
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    } else {
      const fetchProfile = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/${companySlug}/users/profile`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
            },
          });
          const data = await response.json();
          if (data.success && data.data.name) {
            setUserName(data.data.name);
            localStorage.setItem("userName", data.data.name);
          }
        } catch (err) {
          console.error("Failed to fetch topbar profile name:", err);
        }
      };

      if (companySlug && localStorage.getItem("accessToken")) {
        fetchProfile();
      }
    }
  }, [companySlug]);

  const handleProfileClick = () => {
    navigate(`${slugPrefix}/manager/profile-settings`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${slugPrefix}/manager/search-filters?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`${slugPrefix}/manager/search-filters`);
    }
  };

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
            placeholder="Search documents..."
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
        {/* Notification */}
        <button className="relative p-2 rounded-lg hover:bg-slate-100">
          <Bell size={20} className="text-slate-600" />

          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div
          onClick={handleProfileClick}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img
            src="https://i.pravatar.cc/100?img=12"
            alt="user"
            className="w-9 h-9 rounded-full object-cover border"
          />

          <div className="hidden md:block">
            <h4 className="text-sm font-semibold text-slate-800">
              {userName}
            </h4>

            <p className="text-xs text-slate-500">
              Manager
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