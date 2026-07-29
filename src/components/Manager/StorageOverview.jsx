import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export default function StorageOverview({ data = [], storageUsed = 0, maxStorageLimit = 5368709120, planName = 'Trial', showProgressBar = true }) {
  const displayData = data.length > 0 ? data : [
    { name: "No Data", value: 1 },
  ];

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(1)} MB`;
  };

  const remaining = Math.max(0, maxStorageLimit - storageUsed);
  const percentUsed = Math.min(100, Math.round((storageUsed / maxStorageLimit) * 100));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Storage Overview
        </h2>

        <div className="h-[250px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={displayData}
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
              >
                {displayData.map((item, index) => (
                  <Cell
                    key={index}
                    fill={item.name === "No Data" ? "#E2E8F0" : COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3 mt-4">
          {data.length > 0 ? (
            displayData.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span>{item.name}</span>
                </div>

                <span className="font-semibold">
                  {item.value}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-slate-400 italic">No operational uploads yet</p>
          )}
        </div>
      </div>

      {/* Remaining Storage Progress Bar Section */}
      {showProgressBar && (
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Plan: <span className="text-slate-800 font-bold">{planName === 'Trial' ? '7-Day Free Trial' : `${planName} Plan`}</span></span>
            <span className="text-slate-800 font-bold">{percentUsed}% Used</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                percentUsed > 90 ? 'bg-red-500' : percentUsed > 75 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
          <div className="flex justify-between items-baseline text-xs text-slate-500 font-medium">
            <span>Used: {formatBytes(storageUsed)}</span>
            <span className="font-bold text-slate-700">Remaining: {formatBytes(remaining)} of {formatBytes(maxStorageLimit)}</span>
          </div>
        </div>
      )}

    </div>
  );
}