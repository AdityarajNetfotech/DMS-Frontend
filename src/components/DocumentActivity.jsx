import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", value: 20 },
  { day: "Tue", value: 35 },
  { day: "Wed", value: 20 },
  { day: "Thu", value: 45 },
  { day: "Fri", value: 70 },
  { day: "Sat", value: 10 },
  { day: "Sun", value: 80 },
];

export default function DocumentActivity() {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">
          Document Activity
        </h2>

        <button className="border px-4 py-2 rounded-lg">
          Last 7 Days
        </button>
      </div>

      <div className="h-[320px] mt-5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2155ff"
              fill="#2155ff20"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}