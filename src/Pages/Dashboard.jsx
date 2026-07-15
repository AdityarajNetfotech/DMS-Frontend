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
  TrendingUp,
  Activity,
  ArrowUpRight,
  Database,
  Shield,
  Clock,
  Layers,
} from "lucide-react";

const metricCards = [
  {
    title: "Total Companies",
    value: "48",
    note: "+3 new this month",
    icon: Building2,
    color: "text-blue-600",
    bg: "bg-blue-50/80",
    accent: "#3b82f6",
  },
  {
    title: "Active Companies",
    value: "36",
    note: "75% of total companies",
    icon: Building2,
    color: "text-emerald-600",
    bg: "bg-emerald-50/80",
    accent: "#10b981",
  },
  {
    title: "Total Folders",
    value: "9,854",
    note: "+320 this month",
    icon: Folder,
    color: "text-amber-600",
    bg: "bg-amber-50/80",
    accent: "#f59e0b",
  },
  {
    title: "Total Files",
    value: "245,765",
    note: "+5,230 this month",
    icon: File,
    color: "text-indigo-600",
    bg: "bg-indigo-50/80",
    accent: "#6366f1",
  },
  {
    title: "Total Users",
    value: "1,248",
    note: "+86 this month",
    icon: Users,
    color: "text-violet-600",
    bg: "bg-violet-50/80",
    accent: "#8b5cf6",
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
  { name: "PDF", value: 45.2, count: "58,123", color: "#3b82f6" },
  { name: "Word", value: 22.1, count: "28,432", color: "#8b5cf6" },
  { name: "Excel", value: 15.3, count: "19,734", color: "#10b981" },
  { name: "Image", value: 10.2, count: "13,156", color: "#f59e0b" },
  { name: "Other", value: 7.2, count: "9,095", color: "#64748b" },
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
    title: 'Document "Compliance Report.pdf" uploaded by John Doe from Alpha Industries.',
    meta: "John Doe  -  Jun 12, 2024 09:15 AM",
  },
  {
    color: "bg-amber-500",
    title: 'User role "Manager" updated for user Sarah Smith.',
    meta: "Super Admin  -  Jun 11, 2024 04:45 PM",
  },
];

function Card({ children, className = "", delay = "0ms" }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-md shadow-lg shadow-slate-100/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 ${className}`}
      style={{
        animation: "fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        animationDelay: delay,
      }}
    >
      {children}
    </section>
  );
}

function SectionHeader({ title, action, children }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-blue-600" />
        {title}
      </h2>
      {children || (
        action && (
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors">
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
      ? "text-emerald-600 bg-emerald-50"
      : type === "doc"
        ? "text-blue-600 bg-blue-50"
        : "text-rose-500 bg-rose-50";

  return (
    <div className={`p-2 rounded-lg ${color}`}>
      <FileSpreadsheet size={16} />
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);

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

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="space-y-6 relative pb-10">
      {/* Dynamic styling for premium transitions and 3D effects */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes floatEffect {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: floatEffect 4s ease-in-out infinite;
        }
        .recharts-area-curve {
          transition: all 0.5s ease-in-out;
        }
        .metric-card-hover {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .metric-card-hover:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05);
        }
      `}} />

      {/* 3D SVG Filters for Charts */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="shadow3d" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.25" />
          </filter>
          <filter id="pieShadow3d" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="4" dy="10" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.15" />
          </filter>
          <filter id="barShadow3d" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="3" dy="4" stdDeviation="2.5" floodColor="#6366f1" floodOpacity="0.2" />
          </filter>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="barGrad3d" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Activity className="text-blue-600 animate-pulse" size={24} />
            Super Admin Dashboard
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Overview of all companies, documents, and system health status.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/80 border border-slate-200/60 p-1.5 rounded-xl shadow-sm">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping ml-1" />
          <span className="text-xs font-semibold text-slate-600 pr-2">System Status: Optimal</span>
        </div>
      </div>

      {/* Grid count 5 */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {dynamicMetricCards.map(({ title, value, icon: Icon, color, bg, accent }, index) => {
          const gradientMap = {
            'text-blue-600': 'from-blue-50/50 to-white border-blue-200/60',
            'text-emerald-600': 'from-emerald-50/50 to-white border-emerald-200/60',
            'text-indigo-600': 'from-indigo-50/50 to-white border-indigo-200/60',
            'text-amber-600': 'from-amber-50/50 to-white border-amber-200/60',
            'text-violet-600': 'from-violet-50/50 to-white border-violet-200/60',
          };
          const gradientBg = gradientMap[color] || 'from-slate-50/50 to-white border-slate-200/60';

          return (
            <div
              key={title}
              className={`metric-card-hover relative overflow-hidden p-5 rounded-2xl border bg-gradient-to-br ${gradientBg} shadow-sm border-t-[3px]`}
              style={{
                borderTopColor: accent,
                animation: "fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
                animationDelay: `${index * 80}ms`
              }}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{title}</p>
                  <p className="text-3xl font-black tracking-tight text-slate-800">
                    {value}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} shadow-inner ring-1 ring-white/80`}
                >
                  <Icon size={20} className={color} />
                </div>
              </div>
              <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${bg} opacity-30 blur-2xl`} />
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.25fr_1.1fr_1.15fr]">
        
        {/* Documents Over Time 3D Curve */}
        <Card className="p-6" delay="150ms">
          <SectionHeader title="Documents Growth Status">
            <TrendingUp size={16} className="text-blue-500 animate-bounce" />
          </SectionHeader>
          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicDocumentsOverTime} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val / 1000}K`}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-2xl border-0 text-xs font-semibold">
                          <p className="text-slate-400 mb-1">{label} Overview</p>
                          <p className="text-sm font-black text-blue-400">{payload[0].value.toLocaleString()} Uploads</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="documents"
                  fill="url(#areaGrad)"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  filter="url(#shadow3d)"
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 3, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Documents by Type with interactive active outer ring */}
        <Card className="p-6" delay="250ms">
          <SectionHeader title="Documents by Extensions" />
          <div className="grid items-center gap-4 grid-cols-1 sm:grid-cols-[1.1fr_0.9fr] lg:grid-cols-1 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="relative h-56 flex items-center justify-center">
              <div className="absolute flex flex-col items-center justify-center text-center select-none pointer-events-none">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Files</span>
                <span className="text-2xl font-black text-slate-800 mt-1">
                  {stats ? stats.stats.totalFiles.toLocaleString() : "245,765"}
                </span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dynamicDocumentTypes}
                    dataKey="value"
                    innerRadius="70%"
                    outerRadius="88%"
                    paddingAngle={4}
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                  >
                    {dynamicDocumentTypes.map((entry, index) => (
                      <Cell 
                        key={entry.name} 
                        fill={entry.color} 
                        filter="url(#pieShadow3d)"
                        stroke="#fff" 
                        strokeWidth={activeIndex === index ? 3 : 1}
                        style={{
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                          transformOrigin: 'center'
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900/95 backdrop-blur-md text-white p-2.5 rounded-xl shadow-2xl border-0 text-xs font-semibold">
                            <p className="font-bold">{payload[0].name} Files</p>
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
            <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100/80">
              {dynamicDocumentTypes.map((type, index) => (
                <div 
                  key={type.name} 
                  className="space-y-1 group cursor-pointer"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span 
                        className="h-2.5 w-2.5 rounded-full transition-transform duration-200 group-hover:scale-125 shadow-sm" 
                        style={{ backgroundColor: type.color }} 
                      />
                      {type.name}
                    </span>
                    <span className="text-slate-600 font-bold">{type.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        backgroundColor: type.color, 
                        width: `${type.value}%`,
                        opacity: activeIndex === null || activeIndex === index ? 1 : 0.4
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Top 5 Companies by Documents 3D cylinders */}
        <Card className="p-6 lg:col-span-2 xl:col-span-1" delay="350ms">
          <SectionHeader title="Top Active Companies" />
          <div className="h-64 mt-3">
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
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={110}
                  tick={{ fill: "#475569", fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900/95 backdrop-blur-md text-white p-2.5 rounded-xl shadow-2xl border-0 text-xs font-semibold">
                          <p className="font-bold">{payload[0].payload.name}</p>
                          <p className="text-blue-400 mt-0.5">{payload[0].value.toLocaleString()} Files</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#barGrad3d)" 
                  radius={[0, 8, 8, 0]} 
                  filter="url(#barShadow3d)"
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="p-6" delay="400ms">
          <SectionHeader title="Recent Companies Registered">
            <Building2 size={16} className="text-indigo-500" />
          </SectionHeader>
          <div className="overflow-x-auto mt-2">
            <table className="w-full min-w-[420px] text-left text-sm border-collapse">
              <thead className="text-xs font-extrabold text-slate-400 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-3 py-3">Company Name</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Created On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dynamicCompanies.map(([name, status, date]) => (
                  <tr key={name} className="text-slate-700 hover:bg-slate-50/60 transition-colors group">
                    <td className="px-3 py-3.5">
                      <span className="flex items-center gap-3 font-semibold text-slate-800">
                        <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <Building2 size={15} />
                        </div>
                        {name}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`rounded-full px-3 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                          status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                            : "bg-red-50 text-red-600 border border-red-200/50"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right font-medium text-slate-500">{date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6" delay="450ms">
          <SectionHeader title="Recent Documents Shared">
            <Layers size={16} className="text-amber-500" />
          </SectionHeader>
          <div className="overflow-x-auto mt-2">
            <table className="w-full min-w-[520px] text-left text-sm border-collapse">
              <thead className="text-xs font-extrabold text-slate-400 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-3 py-3">Document Name</th>
                  <th className="px-3 py-3">Company</th>
                  <th className="px-3 py-3 text-right">Uploaded On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dynamicRecentDocuments.map(([name, company, date, type]) => (
                  <tr key={name} className="text-slate-700 hover:bg-slate-50/60 transition-colors group">
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-3 font-semibold text-slate-800">
                        <DocumentIcon type={type} />
                        <span className="truncate max-w-[200px]">{name}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-600">{company}</td>
                    <td className="px-3 py-3 text-right font-medium text-slate-500">{date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="p-6" delay="500ms">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-blue-600" />
            System Live Activity Log
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">Real-time Feed</span>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {dynamicActivity.map((item, i) => (
            <div 
              key={i} 
              className="group relative rounded-xl border border-slate-100 bg-slate-50/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:border-slate-200 hover:shadow-lg"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color} animate-pulse`} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Activity Event</span>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm font-semibold leading-relaxed text-slate-800 group-hover:text-blue-600 transition-colors">
                {item.title}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                <Clock size={11} />
                {item.meta}
              </div>
              
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
