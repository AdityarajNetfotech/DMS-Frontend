import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../config/api";

const SuperAdminlogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to log in.");
      }

      // Store tokens and details in local storage
      if (data.tokens) {
        localStorage.setItem("accessToken", data.tokens.accessToken);
        localStorage.setItem("refreshToken", data.tokens.refreshToken);
      }
      localStorage.setItem("userRole", "SuperAdmin");
      localStorage.setItem("userEmail", email);

      // Redirect to Super Admin Dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-zinc-950 flex items-center justify-center px-4 py-12">
      {/* Decorative dot grids */}
      <div
        className="hidden md:block absolute top-40 left-10 w-36 h-36 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, #6366f1 1.5px, transparent 1.5px)",
          backgroundSize: "18px 18px",
        }}
      />
      <div
        className="hidden md:block absolute bottom-24 right-10 w-40 h-40 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, #6366f1 1.5px, transparent 1.5px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Security background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none">
                DMS Portal
              </h1>
              <p className="text-xs text-indigo-400 font-semibold tracking-widest uppercase mt-1">
                Super Admin Access
              </p>
            </div>
          </div>
          <p className="text-slate-400 mt-3 text-sm">
            Authorized Personnel Only • Secure Session
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl shadow-indigo-950/20 p-8 sm:p-10">
          <h2 className="text-xl font-bold text-white mb-6">Authenticate System Session</h2>

          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder:text-slate-600 transition disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Secret Access Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder:text-slate-600 transition disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying Identity...
                </>
              ) : (
                <>
                  Establish Connection
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <Link to="/login" className="text-slate-400 hover:text-white text-xs font-semibold hover:underline transition">
              ← Return to Tenant Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminlogin;
