import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  FileText,
  FolderCheck,
  CheckCircle2,
  Layers,
  Cpu
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

export default function DMSSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  const slugPrefix = companySlug ? `/${companySlug}` : "";

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

  const primaryColor = branding.primaryColor || "#2563eb";

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full relative overflow-hidden bg-white flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-blue-500 selection:text-white"
    >
      {/* Light 3D Soft Glowing Ambient Background Orbs */}
      <div
        className="absolute top-1/4 left-1/5 w-[550px] h-[550px] rounded-full blur-[130px] opacity-20 transition-transform duration-700 ease-out pointer-events-none"
        style={{
          backgroundColor: primaryColor,
          transform: `translate3d(${mousePos.x * -1.5}px, ${mousePos.y * -1.5}px, 0px)`
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/5 w-[600px] h-[600px] rounded-full blur-[150px] opacity-25 transition-transform duration-700 ease-out pointer-events-none"
        style={{
          backgroundColor: primaryColor,
          transform: `translate3d(${mousePos.x * 2}px, ${mousePos.y * 2}px, 0px)`
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-slate-100 rounded-full blur-[160px] pointer-events-none"
      />

      {/* Subtle Fine Pattern Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)`,
          backgroundSize: "3rem 3rem",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, #000 70%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, #000 70%, transparent 100%)"
        }}
      />

      {/* Main Container - 2 Column 3D Showcase */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Side: 3D Interactive Feature Display */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-4">
          <div>
            {/* Workspace Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 mb-6 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: primaryColor }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                {companySlug ? `Workspace: ${companySlug}` : "Enterprise Document Portal"}
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Intelligent <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, #0f172a 0%, ${primaryColor} 100%)`,
                }}
              >
                Document Hub
              </span>
            </h1>
            <p className="mt-4 text-slate-600 text-base font-normal max-w-md leading-relaxed">
              Securely manage, preview, and share organization documents with AI insights and granular permissions.
            </p>
          </div>

          {/* 3D Isometric Floating Perspective Stage */}
          <div
            className="relative w-full h-[340px] flex items-center justify-center"
            style={{ perspective: "1000px" }}
          >
            {/* Base 3D Glass Card Stage */}
            <div
              className="relative w-full max-w-sm h-60 rounded-3xl border border-slate-200/90 bg-white/90 backdrop-blur-xl p-6 shadow-2xl transition-all duration-500 ease-out flex flex-col justify-between"
              style={{
                transform: `rotateX(${10 + mousePos.y * -0.4}deg) rotateY(${-12 + mousePos.x * 0.4}deg) translateZ(20px)`,
                boxShadow: `0 20px 40px -10px ${primaryColor}20, 0 0 0 1px rgba(226, 232, 240, 0.8)`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Layers size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Enterprise Core</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Multi-tenant Architecture</p>
                  </div>
                </div>
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              </div>

              {/* Progress Bar Simulation */}
              <div className="space-y-3 my-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                  <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-emerald-600" /> AES-256 Encrypted</span>
                  <span className="font-mono text-emerald-600 font-bold">100% Protected</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full rounded-full w-full animate-pulse"
                    style={{ backgroundImage: `linear-gradient(90deg, ${primaryColor}, #34d399)` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1"><Cpu size={13} style={{ color: primaryColor }} /> AI Document Engine</span>
                <span className="flex items-center gap-1"><FolderCheck size={13} className="text-blue-600" /> Role Security</span>
              </div>
            </div>

            {/* Floating 3D Mini Badge 1 (Top Left) */}
            <div
              className="absolute -top-1 left-2 bg-white/95 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-xl flex items-center gap-3 transition-transform duration-500 ease-out"
              style={{
                transform: `rotateX(${12 + mousePos.y * -0.3}deg) rotateY(${-8 + mousePos.x * 0.3}deg) translateZ(60px)`
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">AI Insights</p>
                <p className="text-[10px] text-slate-500 font-medium">Smart Summaries</p>
              </div>
            </div>

            {/* Floating 3D Mini Badge 2 (Bottom Right) */}
            <div
              className="absolute -bottom-1 right-2 bg-white/95 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-xl flex items-center gap-3 transition-transform duration-500 ease-out"
              style={{
                transform: `rotateX(${8 + mousePos.y * -0.4}deg) rotateY(${-18 + mousePos.x * 0.4}deg) translateZ(80px)`
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Isolated Tenants</p>
                <p className="text-[10px] text-slate-500 font-medium">Data Privacy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Clean White Stylish Form Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          
          <div
            className="relative bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 transition-all duration-500"
            style={{
              boxShadow: `0 25px 60px -15px ${primaryColor}20, 0 0 0 1px rgba(226, 232, 240, 0.9)`
            }}
          >
            {/* Top Accent Line */}
            <div
              className="absolute top-0 left-10 right-10 h-[3px] rounded-full"
              style={{ backgroundColor: primaryColor }}
            />

            {/* Header / Logo */}
            <div className="flex items-center gap-3.5 mb-8">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden bg-white"
                style={{ backgroundColor: branding.logo ? "white" : primaryColor }}
              >
                {branding.logo ? (
                  <img src={branding.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <FileText size={24} className="text-white" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {branding.companyName || "DMS Workspace"}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Sign in to access your account
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-ping" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-800 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 font-medium text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm"
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
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-800 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 font-medium text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 10px 25px -4px ${primaryColor}50`
                }}
                className="w-full text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-105 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm tracking-wide mt-3"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
              <p className="text-xs text-slate-500 font-medium">
                System Administrator?{" "}
                <Link
                  to="/superadminlogin"
                  className="font-bold text-slate-900 hover:underline transition-colors"
                >
                  Super Admin Portal
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}