import { History } from "lucide-react";

export default function FeatureHeader() {
  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex bg-[#E7EAF6] rounded-xl p-1">
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium">
            Global Default
          </button>

          <button className="px-6 py-3 text-gray-700">
            Per-Tenant Overrides
          </button>
        </div>

        <div className="flex items-center gap-5">
          <span className="text-gray-500">
            Last modified: 2 hours ago
          </span>

          <button className="flex items-center gap-2 border rounded-xl px-5 py-3 bg-white">
            <History size={18} />
            View History
          </button>
        </div>
      </div>
    </>
  );
}