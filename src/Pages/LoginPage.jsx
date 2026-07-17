import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Building2, Users, User, BarChart3, ClipboardList } from "lucide-react";
import { API_BASE_URL } from "../config/api";

const DEMO_PROFILES = [
  {
    role: "Company Admin",
    email: "admin@dms.com",
    icon: Building2,
    iconBg: "bg-emerald-600",
    cardBg: "bg-emerald-50",
    cardBorder: "border-emerald-100",
    textColor: "text-emerald-700",
  },
  {
    role: "Manager",
    email: "manager@dms.com",
    icon: Users,
    iconBg: "bg-purple-600",
    cardBg: "bg-purple-50",
    cardBorder: "border-purple-100",
    textColor: "text-purple-700",
  },
  {
    role: "Viewer",
    email: "Viewer@dms.com",
    icon: User,
    iconBg: "bg-orange-500",
    cardBg: "bg-orange-50",
    cardBorder: "border-orange-100",
    textColor: "text-orange-700",
  },
];

export default function DMSSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { companySlug } = useParams();

  const [branding, setBranding] = useState(() => {
    const cached = localStorage.getItem(`branding_${companySlug}`);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        return {
          logo: data.logo || "",
          primaryColor: data.primaryColor || "#2563eb",
          companyName: data.companyName || "DMS"
        };
      } catch (e) {
        console.error(e);
      }
    }
    return { logo: "", primaryColor: "#2563eb", companyName: "" };
  });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/${companySlug}/branding`);
        const data = await res.json();
        if (data.success) {
          const fresh = {
            logo: data.data.logo || "",
            primaryColor: data.data.primaryColor || "#2563eb",
            companyName: data.data.companyName || "DMS"
          };
          setBranding(fresh);
          localStorage.setItem(`branding_${companySlug}`, JSON.stringify(data.data));
        }
      } catch (err) {
        console.error("Failed to load branding in login page", err);
      }
    };
    if (companySlug) {
      fetchBranding();
    }
  }, [companySlug]);

  // Build slug prefix for navigation (e.g. "/alpha-industries")
  const slugPrefix = companySlug ? `/${companySlug}` : "";

  const handleQuickLogin = (profileEmail, profileRole) => {
    setEmail(profileEmail);
    setPassword("demopassword");

    // If on generic /login page, use a demo slug to demonstrate functionality
    const activeSlugPrefix = slugPrefix || "/demo-company";

    if (profileRole === "Company Admin") {
      navigate(`${activeSlugPrefix}/admin/user-management`);
    }
    if (profileRole === "Manager") {
      navigate(`${activeSlugPrefix}/manager/dashboard`);
    }
    if (profileRole === "Viewer") {
      navigate(`${activeSlugPrefix}/viewer/dashboard`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companySlug) {
      setError("Company workspace not specified in the URL.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/${companySlug}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("accessToken", data.tokens.accessToken);
        localStorage.setItem("refreshToken", data.tokens.refreshToken);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("companySlug", companySlug);

        if (data.mustChangePassword) {
          navigate(`${slugPrefix}/reset-password`, {
            state: { firstTimeLogin: true, oldPassword: password }
          });
          return;
        }

        // Route based on role
        if (data.role === "Tenant Admin" || data.role === "Company Admin") {
          navigate(`${slugPrefix}/admin/user-management`);
        } else if (data.role === "Manager") {
          navigate(`${slugPrefix}/manager/dashboard`);
        } else {
          navigate(`${slugPrefix}/viewer/dashboard`);
        }
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#f8fafc] flex items-center justify-center px-4 py-12 font-sans">
      {/* Soft light-diffusing 3D background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-300/30 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-indigo-300/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-300/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Decorative subtle dot patterns */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #0f172a 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 w-full max-w-lg">
        {/* Floating Header */}
        <div className="text-center mb-10 transform transition-all duration-700 hover:scale-[1.02]">
          <div className="flex flex-col items-center justify-center gap-4">
            <div
              style={!branding.logo ? { backgroundColor: branding.primaryColor } : {}}
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-slate-100 bg-white hover:rotate-12 transition-transform duration-300"
            >
              {branding.logo ? (
                <img src={branding.logo} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none">
                  <path
                    d="M4 8c0-1.1.9-2 2-2h3l1.5 1.5H18a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
                    fill="currentColor"
                  />
                  <path
                    d="M10 8l2 2 2-2"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            
            <div>
              <h1 
                className="text-4xl font-black tracking-tight leading-none text-slate-900 drop-shadow-sm"
                style={{ color: branding.primaryColor }}
              >
                {branding.companyName || "DMS"}
              </h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-2">
                {companySlug ? `Workspace: ${companySlug}` : "Document Hub"}
              </p>
            </div>
          </div>
        </div>

        {/* 3D Glass Card */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white p-8 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.06)] hover:shadow-[0_30px_60px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-500">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900">Sign In</h2>
            <p className="text-slate-500 text-sm mt-1">
              Enter your credentials to access your workspace
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-750 text-xs rounded-xl backdrop-blur-md animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none text-slate-800 placeholder:text-slate-400 transition-all font-medium text-sm shadow-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to={`${slugPrefix}/forgot-password`}
                  className="text-xs font-bold text-violet-600 hover:text-violet-500 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none text-slate-800 placeholder:text-slate-400 transition-all font-medium text-sm shadow-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.primaryColor}dd)`,
                boxShadow: `0 10px 25px ${branding.primaryColor}30`
              }}
              className="w-full text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 cursor-pointer text-sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  <span>Access Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Super Admin Portal link */}
          <div className="text-center mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              System Administrator?{" "}
              <Link to="/superadminlogin" className="text-violet-600 hover:text-violet-500 font-bold transition-colors">
                Super Admin Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}