import {
  Upload,
  FolderPlus,
  Users,
  Shield,
} from "lucide-react";

const actions = [
  {
    icon: Upload,
    title: "Upload File",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: FolderPlus,
    title: "Create Folder",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Users,
    title: "Share Files",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Shield,
    title: "Manage Access",
    color: "bg-orange-100 text-orange-600",
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-5">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              key={index}
              className="border rounded-xl p-5 hover:bg-slate-50 transition"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}
              >
                <Icon size={22} />
              </div>

              <p className="mt-3 font-medium">
                {item.title}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}