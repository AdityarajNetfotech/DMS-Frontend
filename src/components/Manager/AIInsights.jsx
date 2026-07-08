import { Sparkles } from "lucide-react";

export default function AIInsights({ totalDocuments = 0, storageUsed = 0, maxStorageLimit = 0, favoriteCount = 0 }) {
  const storagePercent = maxStorageLimit > 0 ? Math.round((storageUsed / maxStorageLimit) * 100) : 0;
  const daysUntil90 = storagePercent > 0 ? Math.max(0, Math.round(((90 - storagePercent) / storagePercent) * 30)) : 0;

  return (
    <div className="rounded-2xl border bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white shadow-sm">
      <div className="flex items-center gap-3">
        <Sparkles size={22} />
        <h3 className="text-lg font-semibold">
          AI Insights
        </h3>
      </div>

      <ul className="mt-5 space-y-3 text-sm text-violet-100">
        <li>• {totalDocuments} total documents in your workspace</li>
        <li>• {favoriteCount} documents marked as favorites</li>
        <li>• Storage at {storagePercent}% capacity</li>
        {storagePercent > 70 && (
          <li>• ⚠️ Storage will reach 90% in ~{daysUntil90} days</li>
        )}
        {totalDocuments > 50 && (
          <li>• Consider archiving older documents</li>
        )}
      </ul>
    </div>
  );
}