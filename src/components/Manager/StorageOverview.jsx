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

export default function StorageOverview({ data = [] }) {
  const displayData = data.length > 0 ? data : [
    { name: "No Data", value: 1 },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
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
              {displayData.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 mt-4">
        {displayData.map((item, index) => (
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
        ))}
      </div>
    </div>
  );
}