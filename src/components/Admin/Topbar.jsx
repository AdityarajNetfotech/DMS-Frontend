// src/components/Admin/Topbar.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Menu,
  Calendar,
  Clock,
} from "lucide-react";

export default function Topbar({ onMenuToggle = () => {} }) {
  const navigate = useNavigate();
  const { companySlug } = useParams();
  const slugPrefix = companySlug ? `/${companySlug}` : "";

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

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

          {/* Time & Date Display */}
          <div className="flex items-center gap-3 select-none">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-600 shadow-sm text-sm font-semibold transition-all hover:bg-slate-100/80">
              <Calendar size={16} className="text-blue-600" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50/60 border border-blue-100 rounded-xl px-4 py-2 text-blue-800 shadow-sm text-sm font-bold transition-all hover:bg-blue-50/90 justify-center tabular-nums">
              <Clock size={16} className="text-blue-600 animate-pulse" />
              <span>{formattedTime}</span>
            </div>
          </div>
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