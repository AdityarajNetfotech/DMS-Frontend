import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReportingManagerLayout from "../../layout/ReportingManagerLayout";
import DashboardLoader from "../../components/common/DashboardLoader";
import { API_BASE_URL } from "../../config/api";
import {
  FileText,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  FolderTree,
  Eye,
} from "lucide-react";

export default function ReportingManagerDashboard() {
  const { companySlug: urlSlug } = useParams();
  const storedSlug = localStorage.getItem("companySlug");
  const rawSlug = urlSlug || (storedSlug && storedSlug !== "undefined" && storedSlug !== "null" ? storedSlug : "");
  const companySlug = rawSlug === "undefined" || rawSlug === "null" ? "" : rawSlug;
  const slugPrefix = companySlug ? `/${companySlug}` : "";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingAction: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [pendingDocs, setPendingDocs] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const effectiveSlug = companySlug || "default";

        // Fetch approval stats
        try {
          const statsRes = await fetch(`${API_BASE_URL}/api/${effectiveSlug}/manager/approvals/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const statsData = await statsRes.json();
          if (statsData.success && statsData.data) {
            setStats({
              pendingAction: statsData.data.pendingAction ?? statsData.data.myPendingActionCount ?? statsData.data.pendingCount ?? 0,
              approved: statsData.data.approved ?? statsData.data.approvedCount ?? 0,
              rejected: statsData.data.rejected ?? statsData.data.rejectedCount ?? 0,
              total: statsData.data.totalEvaluated ?? statsData.data.total ?? statsData.data.totalCount ?? 0,
            });
          }
        } catch (e) {
          console.warn("Failed to fetch approval stats:", e);
        }

        // Fetch pending items queue
        try {
          const docsRes = await fetch(`${API_BASE_URL}/api/${effectiveSlug}/manager/approvals?status=pending`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const docsData = await docsRes.json();
          if (docsData.success && Array.isArray(docsData.data)) {
            setPendingDocs(docsData.data.slice(0, 6));
          }
        } catch (e) {
          console.warn("Failed to fetch pending approval docs:", e);
        }

        // Fetch general dashboard statistics for activity log
        try {
          const dashRes = await fetch(`${API_BASE_URL}/api/${effectiveSlug}/manager/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const dashData = await dashRes.json();
          if (dashData.success && Array.isArray(dashData.data?.recentActivities)) {
            setActivities(dashData.data.recentActivities.slice(0, 5));
          }
        } catch (e) {
          console.warn("Failed to fetch dashboard activity data:", e);
        }
      } catch (err) {
        console.error("Error loading reporting manager dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [companySlug]);

  const userEmail = localStorage.getItem("userEmail") || "reporting.manager@dms.io";
  const rawName = userEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const userName = localStorage.getItem("userName") || rawName || "Reporting Manager";

  if (loading) {
    return (
      <ReportingManagerLayout>
        <DashboardLoader
          title="Loading Reporting Manager Dashboard..."
          subtitle="Fetching pending approvals, department metrics & team submissions"
          role="reporting"
        />
      </ReportingManagerLayout>
    );
  }

  return (
    <ReportingManagerLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 md:p-8 text-white shadow-xl">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-xs font-semibold text-blue-100 mb-3 border border-white/20">
              <ShieldCheck size={14} className="text-amber-300" />
              Reporting Manager Workspace
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {userName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm md:text-base text-white-100/90">
              Review and sign off on document uploads submitted by managers across your team. You currently have{" "}
              <span className="font-bold text-amber-300 underline underline-offset-4">{stats.pendingAction} pending documents</span> requiring your approval.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate(`${slugPrefix}/reporting-manager/approvals`)}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-blue-700 shadow-md hover:bg-blue-50 transition cursor-pointer"
              >
                <ShieldCheck size={16} />
                Open Approvals Hub ({stats.pendingAction})
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Awaiting Your Action</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.pendingAction}</h3>
              <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                <Clock size={12} /> Requires verification
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Documents</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.approved}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} /> Successfully signed off
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rejected Documents</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.rejected}</h3>
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <XCircle size={12} /> Returned with remarks
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle size={24} />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Evaluated</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.total}</h3>
              <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> Complete workflow history
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText size={24} />
            </div>
          </div>
        </div>

        {/* Priority Pending Verification Queue & Activity Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Priority Approvals Table */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Pending Team Submissions</h3>
                <p className="text-xs text-slate-500">Documents submitted by your managers awaiting sign-off</p>
              </div>
              <button
                onClick={() => navigate(`${slugPrefix}/reporting-manager/approvals`)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                View Full Queue <ArrowRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-slate-100 flex-1 overflow-x-auto">
              {pendingDocs.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-2" />
                  <p className="font-semibold text-slate-600">You are all caught up!</p>
                  <p className="text-xs mt-1">No pending documents requiring your approval.</p>
                </div>
              ) : (
                pendingDocs.map((doc) => (
                  <div key={doc._id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{doc.originalFileName || doc.name}</h4>
                        <p className="text-xs text-slate-500">
                          By <strong className="text-slate-700">{doc.uploadedBy?.name || "Manager"}</strong> • {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                      <button
                        onClick={() => navigate(`${slugPrefix}/reporting-manager/approvals`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Review Document"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Workflow Guidelines & Activity Log */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Maker-Checker Policy</h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span><strong>General Documents:</strong> Directly signed off by you (Reporting Manager).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span><strong>Legal Documents:</strong> Requires dual-approval from Legal Team and you.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                  <span><strong>Compliance Documents:</strong> Requires dual-approval from Compliance Team and you.</span>
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-md">
              <h3 className="font-bold text-sm mb-1 text-white">Quick Review</h3>
              <p className="text-xs text-slate-400 mb-4">Jump straight into processing pending items.</p>
              <button
                onClick={() => navigate(`${slugPrefix}/reporting-manager/approvals`)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition cursor-pointer text-center"
              >
                Go to Review Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </ReportingManagerLayout>
  );
}
