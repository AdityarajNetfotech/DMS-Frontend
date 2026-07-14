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
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center px-4 py-12">
      {/* Decorative dot grids */}
      <div
        className="hidden md:block absolute top-40 left-10 w-36 h-36 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, #93c5fd 1.5px, transparent 1.5px)",
          backgroundSize: "18px 18px",
        }}
      />
      <div
        className="hidden md:block absolute bottom-24 right-10 w-40 h-40 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, #93c5fd 1.5px, transparent 1.5px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Decorative wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 200"
          className="w-full h-32 md:h-40"
          preserveAspectRatio="none"
        >
          <path
            d="M0,120 C240,180 480,60 720,90 C960,120 1200,180 1440,110 L1440,200 L0,200 Z"
            fill="#bfdbfe"
            opacity="0.7"
          />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div
              style={!branding.logo ? { backgroundColor: branding.primaryColor } : {}}
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-slate-100 bg-white"
            >
              {branding.logo ? (
                <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none">
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
            <div className="text-left">
              <h1 className="text-4xl font-extrabold text-slate-900 leading-none" style={{ color: branding.primaryColor }}>
                {branding.companyName || "DMS"}
              </h1>
              {/* <p className="text-sm text-slate-500 mt-1">
                {companySlug ? `Workspace: ${companySlug.toUpperCase()}` : "Document Management System"}
              </p> */}
            </div>
          </div>
          <p className="mt-4 text-base font-medium" style={{ color: branding.primaryColor }}>
            Secure. Organized. Accessible.
            <br />
            All Your Documents, One Place.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/10 border border-slate-100 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            Enter your details or select a quick-login profile below
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 placeholder:text-slate-400 transition"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  Password
                </label>
                <Link
                  to={`${slugPrefix}/forgot-password`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 placeholder:text-slate-400 transition"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: branding.primaryColor }}
              className="w-full text-white font-semibold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Signing In..." : "Sign In to Account"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="text-center mt-7 space-y-2">
            <p className="text-sm text-slate-500">
              Need a new company or user profile?{" "}
              <a href="#" className="text-blue-600 font-semibold hover:underline">
                Register here
              </a>
            </p>
            <p className="text-xs text-slate-400">
              Are you a system administrator?{" "}
              <Link to="/superadminlogin" className="text-blue-500 hover:font-semibold hover:underline transition">
                Super Admin Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}