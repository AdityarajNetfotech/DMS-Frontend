import {
  Upload,
  Share2,
  Trash2,
  FileText,
  FolderPlus,
  Edit,
} from "lucide-react";

const iconMap = {
  'upload': Upload,
  'share': Share2,
  'delete': Trash2,
  'Document Uploaded': Upload,
  'Document Shared': Share2,
  'Document Deleted': Trash2,
  'Folder Created': FolderPlus,
  'Document Updated': Edit,
};

export default function RecentActivity({ activities = [] }) {
  const displayActivities = activities.length > 0 ? activities : [
    { text: "No recent activity", time: "" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-5">
        Recent Activity
      </h2>

      <div className="space-y-5">
        {displayActivities.map((item, index) => {
          const Icon = iconMap[item.text] || FileText;

          return (
            <div
              key={index}
              className="flex gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Icon size={18} />
              </div>

              <div>
                <p className="font-medium">
                  {item.text}
                </p>

                <p className="text-sm text-slate-500">
                  {item.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}