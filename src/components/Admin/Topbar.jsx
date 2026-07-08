// src/components/Admin/Topbar.jsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
} from "lucide-react";

export default function Topbar({ onMenuToggle = () => {} }) {
  const navigate = useNavigate();
  const { companySlug } = useParams();
  const slugPrefix = companySlug ? `/${companySlug}` : "";

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${slugPrefix}/manager/search-filters?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`${slugPrefix}/manager/search-filters`);
    }
  };

  const handleProfileClick = () => {
    navigate(`${slugPrefix}/admin/profile`);
  };

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <button
            type="button"
            aria-label="Toggle sidebar"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 lg:hidden"
            onClick={onMenuToggle}
          >
            <Menu size={20} />
          </button>

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-[280px] lg:w-[420px]">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search systems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-300 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>

        <div className="flex items-center gap-3">
          <div
            onClick={handleProfileClick}
            className="flex cursor-pointer items-center gap-3 hover:opacity-85 transition-opacity"
          >
            <img
              src="https://i.pravatar.cc/150?img=12"
              alt="profile"
              className="h-10 w-10 rounded-full object-cover border border-slate-100"
            />

            <span className="hidden text-[18px] font-semibold text-blue-900 sm:block">
              Profile
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}