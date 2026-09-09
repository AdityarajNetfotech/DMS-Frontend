import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ComplianceLayout from "../../layout/ComplianceLayout";
import DashboardLoader from "../../components/common/DashboardLoader";
import { API_BASE_URL } from "../../config/api";
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  FolderTree,
  Eye,
  FileCheck2,
  Activity,
  Award
} from "lucide-react";

export default function ComplianceDashboard() {
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
              pendingAction: statsData.data.pendingAction || 0,
              approved: statsData.data.approved || 0,
              rejected: statsData.data.rejected || 0,
              total: statsData.data.total || 0,
            });
          }
        } catch (e) {
          console.warn("Failed to fetch compliance approval stats:", e);
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
          console.warn("Failed to fetch compliance pending docs:", e);
        }
      } catch (err) {
        console.error("Error loading compliance dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [companySlug]);

  const userEmail = localStorage.getItem("userEmail") || "compliance.team@dms.io";
  const rawName = userEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const userName = localStorage.getItem("userName") || rawName || "Compliance Team";

  if (loading) {
    return (
      <ComplianceLayout>
        <DashboardLoader
          title="Loading Regulatory Compliance Hub..."
          subtitle="Synchronizing compliance checks, audit trail & risk evaluations"
          role="compliance"
        />
      </ComplianceLayout>
    );
  }

  return (
    <ComplianceLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-950 p-6 md:p-8 text-white shadow-xl">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-xs font-semibold text-emerald-100 mb-3 border border-white/20">
              <ShieldCheck size={14} className="text-emerald-300" />
              Regulatory Compliance & Audit Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Compliance Workspace — {userName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm md:text-base text-emerald-100/90">
              Validate regulatory compliance, KYC, AML, and risk governance records deposited in the{" "}
              <strong className="text-white">Compliance Documents</strong> folder.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate(`${slugPrefix}/compliance/approvals`)}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 shadow-md hover:bg-emerald-50 transition cursor-pointer"
              >
                <ShieldCheck size={16} />
                Open Compliance Review Queue ({stats.pendingAction})
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="rounded-2xl bg-white p-5 border border-emerald-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Awaiting Audit Action</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.pendingAction}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <Clock size={12} /> Pending compliance review
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-emerald-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Approved</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.approved}</h3>
              <p className="text-xs text-teal-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} /> Certified compliant
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-emerald-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Rejected</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.rejected}</h3>
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <XCircle size={12} /> Flagged non-compliant
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle size={24} />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-emerald-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Audits Recorded</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.total}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <FileCheck2 size={12} /> Regulatory compliance logs
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck2 size={24} />
            </div>
          </div>
        </div>

        {/* Priority Pending Verification Queue & Dual Approval Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Compliance Audit Queue</h3>
                <p className="text-xs text-slate-500">Documents submitted into Compliance Documents awaiting regulatory audit</p>
              </div>
              <button
                onClick={() => navigate(`${slugPrefix}/compliance/approvals`)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                View Full Queue <ArrowRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-slate-100 flex-1 overflow-x-auto">
              {pendingDocs.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-2" />
                  <p className="font-semibold text-slate-600">Compliance queue is clear!</p>
                  <p className="text-xs mt-1">No pending regulatory items requiring compliance verification.</p>
                </div>
              ) : (
                pendingDocs.map((doc) => (
                  <div key={doc._id} className="p-4 flex items-center justify-between hover:bg-emerald-50/30 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <ShieldAlert size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{doc.originalFileName || doc.name}</h4>
                        <p className="text-xs text-slate-500">
                          Submitted by <strong className="text-slate-700">{doc.uploadedBy?.name || "Manager"}</strong> • {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Dual Review
                      </span>
                      <button
                        onClick={() => navigate(`${slugPrefix}/compliance/approvals`)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="Audit Compliance Document"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-white border border-emerald-100 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                Compliance Maker-Checker Rules
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                When a manager uploads into the <strong>Compliance Documents</strong> folder, the file undergoes regulatory maker-checker verification:
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <strong>Step 1: Compliance Team Audit</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">You verify KYC, AML, or regulatory filing standards.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-100">
                  <strong>Step 2: Reporting Manager Sign-off</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">Supervising manager authorizes administrative release.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-900 p-5 text-white shadow-md">
              <h3 className="font-bold text-sm mb-1 text-white">Execute Audits</h3>
              <p className="text-xs text-emerald-300 mb-4">Certify or reject regulatory submissions.</p>
              <button
                onClick={() => navigate(`${slugPrefix}/compliance/approvals`)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold transition cursor-pointer text-center shadow-md"
              >
                Go to Compliance Approvals
              </button>
            </div>
          </div>
        </div>
      </div>
    </ComplianceLayout>
  );
}
