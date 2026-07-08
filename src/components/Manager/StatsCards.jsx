import {
  FileText,
  FolderOpen,
  Share2,
  Clock3,
} from "lucide-react";

import StatCard from "./StatCard";

export default function StatsCards() {
  const stats = [
    {
      title: "Total Documents",
      value: "1,248",
      icon: FileText,
      color: "bg-blue-600",
    },
    {
      title: "Folders",
      value: "84",
      icon: FolderOpen,
      color: "bg-emerald-600",
    },
    {
      title: "Shared",
      value: "216",
      icon: Share2,
      color: "bg-violet-600",
    },
    {
      title: "Recent Uploads",
      value: "39",
      icon: Clock3,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((item, index) => (
        <StatCard
          key={index}
          {...item}
        />
      ))}
    </div>
  );
}