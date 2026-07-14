import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useState, useEffect, useMemo } from "react";
import { API_BASE_URL } from "../config/api";
import {
  Building2,
  File,
  FileSpreadsheet,
  FileText,
  Folder,
  Users,
} from "lucide-react";

const metricCards = [
  {
    title: "Total Companies",
    value: "48",
    note: "+3 new this month",
    icon: Building2,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Active Companies",
    value: "36",
    note: "75% of total companies",
    icon: Building2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Total Folders",
    value: "9,854",
    note: "+320 this month",
    icon: Folder,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Total Files",
    value: "245,765",
    note: "+5,230 this month",
    icon: File,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Total Users",
    value: "1,248",
    note: "+86 this month",
    icon: Users,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
];

const documentsOverTime = [
  { month: "Jan", documents: 11000 },
  { month: "Feb", documents: 22000 },
  { month: "Mar", documents: 25000 },
  { month: "Apr", documents: 33000 },
  { month: "May", documents: 37500 },
  { month: "Jun", documents: 47000 },
];

const documentTypes = [
  { name: "PDF", value: 45.2, count: "58,123", color: "#4f6df5" },
  { name: "Word", value: 22.1, count: "28,432", color: "#9aa8c1" },
  { name: "Excel", value: 15.3, count: "19,734", color: "#34c7a1" },
  { name: "Image", value: 10.2, count: "13,156", color: "#f6b51d" },
  { name: "Other", value: 7.2, count: "9,095", color: "#c8d0de" },
];

const topCompanies = [
  { name: "Alpha Industries", value: 18765 },
  { name: "Beta Solutions", value: 15432 },
  { name: "Gamma Corporations", value: 12890 },
  { name: "Delta Systems", value: 10234 },
  { name: "Epsilon Ltd.", value: 8765 },
];

const companies = [
  ["Alpha Industries", "Active", "Jun 12, 2024"],
  ["Beta Solutions", "Active", "Jun 11, 2024"],
  ["Gamma Corporations", "Active", "Jun 10, 2024"],
  ["Delta Systems", "Inactive", "Jun 9, 2024"],
  ["Epsilon Ltd.", "Active", "Jun 8, 2024"],
];

const documents = [
  ["Annual Report 2024.pdf", "Alpha Industries", "Jun 12, 2024", "pdf"],
  ["Employee Handbook.docx", "Beta Solutions", "Jun 11, 2024", "doc"],
  ["Financial Statement.xlsx", "Gamma Corporations", "Jun 10, 2024", "xls"],
  ["Project Proposal.pdf", "Delta Systems", "Jun 9, 2024", "pdf"],
  ["Policy Guidelines.pdf", "Epsilon Ltd.", "Jun 8, 2024", "pdf"],
];

const activity = [
  {
    color: "bg-violet-500",
    title: 'New company "Zeta Technologies" has been registered.',
    meta: "Super Admin  -  Jun 12, 2024 10:30 AM",
  },
  {
    color: "bg-emerald-500",
    title:
      'Document "Compliance Report.pdf" uploaded by John Doe from Alpha Industries.',
    meta: "John Doe  -  Jun 12, 2024 09:15 AM",
  },
  {
    color: "bg-amber-500",
    title: 'User role "Manager" updated for user Sarah Smith.',
    meta: "Super Admin  -  Jun 11, 2024 04:45 PM",
  },
];

function Card({ children, className = "" }) {
  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-100 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeader({ title, action, children }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {children || (
        action && (
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            {action}
          </button>
        )
      )}
    </div>
  );
}

function DocumentIcon({ type }) {
  const color =
    type === "xls"
      ? "text-emerald-600"
      : type === "doc"
        ? "text-blue-600"
        : "text-red-500";

  return <FileSpreadsheet size={18} className={color} />;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE_URL}/api/super-admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const handleGlobalSearch = (e) => {
      setSearchTerm(e.detail || "");
    };
    window.addEventListener("global-search", handleGlobalSearch);
    return () => window.removeEventListener("global-search", handleGlobalSearch);
  }, []);

  const dynamicMetricCards = stats ? [
    { ...metricCards[0], value: stats.stats.totalCompanies.toString() },
    { ...metricCards[1], value: stats.stats.activeCompanies.toString() },
    { ...metricCards[2], value: stats.stats.totalFolders.toLocaleString() },
    { ...metricCards[3], value: stats.stats.totalFiles.toLocaleString() },
    { ...metricCards[4], value: stats.stats.totalUsers.toLocaleString() },
  ] : metricCards;

  const baseCompanies = stats?.companiesList || companies;
  const baseRecentDocuments = stats?.recentDocuments || documents;
  const baseActivity = stats?.recentActivity || activity;

  const dynamicCompanies = useMemo(() => {
    return baseCompanies.filter(([name]) => 
      !searchTerm || name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [baseCompanies, searchTerm]);

  const dynamicDocumentTypes = stats?.documentTypes || documentTypes;

  const dynamicRecentDocuments = useMemo(() => {
    return baseRecentDocuments.filter(([name, company]) => 
      !searchTerm || 
      name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [baseRecentDocuments, searchTerm]);

  const dynamicTopCompanies = stats?.topCompanies || topCompanies;
  const dynamicDocumentsOverTime = stats?.documentsOverTime || documentsOverTime;

  const dynamicActivity = useMemo(() => {
    return baseActivity.filter((item) => 
      !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [baseActivity, searchTerm]);

  return (
    <div className="space-y-6 relative">
      {/* 3D SVG Filters for Charts */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#4f6df5" floodOpacity="0.5" />
          </filter>
          <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="8" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.25" />
          </filter>
          <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#4f6df5" floodOpacity="0.3" />
          </filter>
          <linearGradient id="documentGrowthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.01} />
          </linearGradient>
          <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div>
        <h1 className="text-2xl font-bold text-slate-950">
          Super Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of all companies, documents, and system activity
        </p>
      </div>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {dynamicMetricCards.map(({ title, value, icon: Icon, color, bg }) => {
          const gradientMap = {
            'text-blue-600': 'from-blue-50 to-white border-blue-200',
            'text-emerald-600': 'from-emerald-50 to-white border-emerald-200',
            'text-indigo-600': 'from-indigo-50 to-white border-indigo-200',
            'text-amber-600': 'from-amber-50 to-white border-amber-200',
            'text-violet-600': 'from-violet-50 to-white border-violet-200',
          };
          const gradientBg = gradientMap[color] || 'from-slate-50 to-white border-slate-200';

          return (
            <Card key={title} className={`relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br ${gradientBg} border-t-[3px]`}>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-2">{title}</p>
                  <p className="text-4xl font-extrabold tracking-tight text-slate-900">
                    {value}
                  </p>
                </div>
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${bg} shadow-sm ring-1 ring-white/50`}
                >
                  <Icon size={26} className={color} />
                </div>
              </div>
              <div className={`absolute -right-6 -top-6 h-32 w-32 rounded-full ${bg} opacity-40 blur-3xl`} />
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1.3fr]">
        {/* Documents Over Time Redesign */}
        <Card className="p-6">
          <SectionHeader title="Documents Over Time" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicDocumentsOverTime} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => {
                    if (value >= 1000) {
                      const k = value / 1000;
                      return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
                    }
                    return value.toString();
                  }}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border-0 text-xs font-semibold">
                          <p className="text-slate-400 mb-1">{label}</p>
                          <p className="text-sm font-bold text-blue-400">{payload[0].value.toLocaleString()} Docs</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  dataKey="documents"
                  fill="url(#documentGrowthGrad)"
                  stroke="url(#strokeGrad)"
                  strokeWidth={4}
                  filter="url(#shadow3d)"
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Documents by Type Redesign */}
        <Card className="p-6">
          <SectionHeader title="Documents by Type" />
          <div className="grid items-center gap-5 grid-cols-1 sm:grid-cols-[1fr_0.9fr] xl:grid-cols-1 2xl:grid-cols-[1fr_0.9fr]">
            <div className="relative h-56 flex items-center justify-center">
              {/* Total Documents Count in Center */}
              <div className="absolute flex flex-col items-center justify-center text-center select-none pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Files</span>
                <span className="text-2xl font-extrabold text-slate-800 mt-1">
                  {stats ? stats.stats.totalFiles.toLocaleString() : "245,765"}
                </span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dynamicDocumentTypes}
                    dataKey="value"
                    innerRadius="72%"
                    outerRadius="88%"
                    paddingAngle={3}
                  >
                    {dynamicDocumentTypes.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} filter="url(#pieShadow)" stroke="rgba(255,255,255,0.8)" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl border-0 text-xs font-semibold">
                            <p className="font-bold">{payload[0].name}</p>
                            <p className="text-blue-400 mt-0.5">{payload[0].value}% ({payload[0].payload.count})</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Styled progress items */}
            <div className="space-y-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {dynamicDocumentTypes.map((type) => (
                <div key={type.name} className="space-y-1 group">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="h-2.5 w-2.5 rounded-full transition-transform duration-200 group-hover:scale-110 shadow-sm" style={{ backgroundColor: type.color }} />
                      {type.name}
                    </span>
                    <span className="text-slate-500 font-bold">{type.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ backgroundColor: type.color, width: `${type.value}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Top 5 Companies by Documents Redesign */}
        <Card className="p-6 lg:col-span-2 xl:col-span-1">
          <SectionHeader title="Top 5 Companies by Documents" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dynamicTopCompanies}
                layout="vertical"
                margin={{ left: -15, right: 10, top: 5, bottom: 5 }}
                barCategoryGap={16}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis 
                  type="number" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={140}
                  tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl border-0 text-xs font-semibold">
                          <p className="font-bold">{payload[0].payload.name}</p>
                          <p className="text-blue-400 mt-0.5">{payload[0].value.toLocaleString()} Documents</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#barGrad)" 
                  radius={[0, 8, 8, 0]} 
                  filter="url(#barShadow)"
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="p-6">
          <SectionHeader title="Recent Companies" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="text-xs font-medium text-slate-500">
                <tr>
                  <th className="px-2 py-3">Company Name</th>
                  <th className="px-2 py-3">Status</th>
                  <th className="px-2 py-3">Created On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dynamicCompanies.map(([name, status, date]) => (
                  <tr key={name} className="text-slate-700">
                    <td className="px-2 py-4">
                      <span className="flex items-center gap-3 font-medium">
                        <Building2 size={17} className="text-slate-400" />
                        {name}
                      </span>
                    </td>
                    <td className="px-2 py-4">
                      <span
                        className={`rounded-md px-3 py-1 text-xs font-medium ${
                          status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-2 py-4 text-slate-500">{date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader title="Recent Documents" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs font-medium text-slate-500">
                <tr>
                  <th className="px-2 py-3">Document Name</th>
                  <th className="px-2 py-3">Company</th>
                  <th className="px-2 py-3">Uploaded On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dynamicRecentDocuments.map(([name, company, date, type]) => (
                  <tr key={name} className="text-slate-700">
                    <td className="px-2 py-4">
                      <span className="flex items-center gap-3 font-medium">
                        <DocumentIcon type={type} />
                        {name}
                      </span>
                    </td>
                    <td className="px-2 py-4">{company}</td>
                    <td className="px-2 py-4 text-slate-500">{date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>


      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">System Activity Log</h2>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {dynamicActivity.map((item, i) => (
            <div key={i} className="group relative rounded-xl border border-slate-200 bg-slate-50/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-50 hover:shadow-lg">
              <div className="mb-3 flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color} shadow-[0_0_8px_currentColor]`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Activity Event</span>
              </div>
              <p className="text-sm font-semibold leading-relaxed text-slate-800">{item.title}</p>
              <p className="mt-4 text-xs font-medium text-slate-500">{item.meta}</p>
              
              {/* Decorative glowing gradient at the bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
