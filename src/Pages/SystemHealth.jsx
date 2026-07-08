import {
  Bell,
  Settings,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Search,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const cpuData = [
  { time: "00", value: 35 },
  { time: "04", value: 48 },
  { time: "08", value: 72 },
  { time: "12", value: 65 },
  { time: "16", value: 88 },
  { time: "20", value: 55 },
  { time: "24", value: 42 },
];

const memoryData = [
  { name: "Used", value: 72 },
  { name: "Free", value: 28 },
];

const sessionData = [
  { day: "Mon", value: 2200 },
  { day: "Tue", value: 2800 },
  { day: "Wed", value: 2600 },
  { day: "Thu", value: 3200 },
  { day: "Fri", value: 2900 },
  { day: "Sat", value: 1800 },
  { day: "Sun", value: 1400 },
];

const COLORS = ["#2563eb", "#e2e8f0"];

export default function SystemHealth() {
  return (
    <div className="space-y-6">
        {/* Header */}
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between">
          <div>
            {/* <h1 className="text-xl font-bold text-slate-900">
              DMS Super Admin
            </h1> */}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                placeholder="Global search..."
                className="pl-10 pr-4 h-10 w-72 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <Bell size={20} />
            <Settings size={20} />

            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              A
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Top */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-sm text-slate-500">
                Platform / Monitoring
              </p>

        <h2 className="text-3xl font-bold mt-2">System Health & Monitoring</h2>
        <p className="text-slate-500 mt-2">
          Real-time platform health and infrastructure metrics.
        </p>
      </div>

            <button className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2">
              <RefreshCw size={18} />
              Refresh Data
            </button>
          </div>

          {/* Status Cards */}
          <div className="grid lg:grid-cols-3 gap-5 mb-8">
            <div className="bg-white border rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-green-600" />
                <div>
                  <h3 className="font-semibold">Healthy</h3>
                  <p className="text-sm text-slate-500">
                    12 Services Running
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-amber-500" />
                <div>
                  <h3 className="font-semibold">Warning</h3>
                  <p className="text-sm text-slate-500">
                    3 Services Impacted
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-500" />
                <div>
                  <h3 className="font-semibold">Critical</h3>
                  <p className="text-sm text-slate-500">
                    1 Service Offline
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CPU + Memory */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white border rounded-3xl p-6">
              <h3 className="font-semibold mb-5">CPU Usage</h3>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cpuData}>
                    <XAxis dataKey="time" />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#2563eb"
                      fill="#bfdbfe"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border rounded-3xl p-6">
              <h3 className="font-semibold mb-5">Memory Usage</h3>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={memoryData}
                      innerRadius={70}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {memoryData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="text-center">
                <h2 className="text-3xl font-bold">72%</h2>
                <p className="text-slate-500">Used Memory</p>
              </div>
            </div>
          </div>

          {/* Bottom Cards */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white border rounded-3xl p-6">
              <h3 className="font-semibold mb-4">
                Storage IOPS
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Read Operations</span>
                    <span>4.2k/s</span>
                  </div>

                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className="h-2 w-3/4 bg-blue-600 rounded-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Write Operations</span>
                    <span>2.8k/s</span>
                  </div>

                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className="h-2 w-1/2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-3xl p-6">
              <h3 className="font-semibold mb-4">
                Active Sessions
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionData}>
                    <XAxis dataKey="day" />
                    <Bar dataKey="value" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border rounded-3xl p-6">
              <h3 className="font-semibold mb-4">
                Failed Jobs
              </h3>

              <div className="space-y-3">
                <div className="border border-red-200 bg-red-50 p-3 rounded-xl">
                  <p className="font-medium text-red-700">
                    indexing_service_v2
                  </p>
                  <p className="text-sm text-red-500">
                    Failed 12 minutes ago
                  </p>
                </div>

                <div className="border border-red-200 bg-red-50 p-3 rounded-xl">
                  <p className="font-medium text-red-700">
                    ocr_extraction_task
                  </p>
                  <p className="text-sm text-red-500">
                    Failed 35 minutes ago
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white border rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold">
                API Errors & Service Logs
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4">Service</th>
                    <th className="text-left p-4">Error</th>
                    <th className="text-left p-4">Tenant</th>
                    <th className="text-left p-4">Latency</th>
                    <th className="text-left p-4">Time</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-t">
                    <td className="p-4">auth-gateway-prod</td>
                    <td className="p-4 text-red-600">
                      502 Bad Gateway
                    </td>
                    <td className="p-4">TNT-7729-PQ</td>
                    <td className="p-4">842ms</td>
                    <td className="p-4">
                      2025-06-11 10:42:15
                    </td>
                  </tr>

                  <tr className="border-t">
                    <td className="p-4">metadata-api</td>
                    <td className="p-4 text-amber-600">
                      429 Rate Limit
                    </td>
                    <td className="p-4">TNT-1104-XX</td>
                    <td className="p-4">45ms</td>
                    <td className="p-4">
                      2025-06-11 10:41:02
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}
