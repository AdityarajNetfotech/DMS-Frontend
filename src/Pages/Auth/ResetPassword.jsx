import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { Lock, ArrowRight, CheckCircle2, XCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { companySlug } = useParams();

  const slugPrefix = companySlug ? `/${companySlug}` : "/demo-company";
  const state = location.state || {};
  const email = state.email || "";
  const resetToken = state.resetToken || "";
  
  // First time login flow variables
  const isFirstTimeLogin = state.firstTimeLogin || false;
  const oldPassword = state.oldPassword || "";

  useEffect(() => {
    // If neither flow is active, send back to login
    if (!resetToken && !isFirstTimeLogin) {
      navigate(`${slugPrefix}/login`);
    }
  }, [resetToken, isFirstTimeLogin, navigate, slugPrefix]);

  // Real-time password criteria evaluation
  const criteria = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirmPassword,
  };

  const metCount = [
    criteria.length,
    criteria.uppercase,
    criteria.lowercase,
    criteria.number,
    criteria.special
  ].filter(Boolean).length;

  const isPasswordValid = metCount === 5 && criteria.match;

  const getStrengthLabel = () => {
    if (metCount <= 2) return { label: "Weak", color: "bg-red-500", text: "text-red-600", width: "33%" };
    if (metCount <= 4) return { label: "Medium", color: "bg-amber-500", text: "text-amber-600", width: "66%" };
    return { label: "Strong & Secure", color: "bg-emerald-500", text: "text-emerald-600", width: "100%" };
  };

  const strength = getStrengthLabel();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!criteria.match) {
      setError("Passwords do not match.");
      return;
    }
    if (metCount < 5) {
      setError("Password does not meet all complexity requirements.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      let endpoint = "";
      let payload = {};
      let headers = { "Content-Type": "application/json" };

      if (isFirstTimeLogin) {
        endpoint = `${API_BASE_URL}/api/${companySlug || 'demo-company'}/auth/change-password`;
        payload = { oldPassword, newPassword };
        headers["Authorization"] = `Bearer ${localStorage.getItem("accessToken")}`;
      } else {
        endpoint = `${API_BASE_URL}/api/${companySlug || 'demo-company'}/auth/reset-password`;
        payload = { email, resetToken, newPassword };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (isFirstTimeLogin) {
          // Tokens are updated, so update localStorage
          localStorage.setItem("accessToken", data.tokens.accessToken);
          localStorage.setItem("refreshToken", data.tokens.refreshToken);
          
          // Route based on role
          const role = localStorage.getItem("userRole");
          if (role === "Tenant Admin" || role === "Company Admin") {
            navigate(`${slugPrefix}/admin/user-management`);
          } else if (role === "Reporting Manager") {
            navigate(`${slugPrefix}/reporting-manager/dashboard`);
          } else if (role === "Legal Team") {
            navigate(`${slugPrefix}/legal/dashboard`);
          } else if (role === "Compliance Team") {
            navigate(`${slugPrefix}/compliance/dashboard`);
          } else if (role === "Manager") {
            navigate(`${slugPrefix}/manager/dashboard`);
          } else {
            navigate(`${slugPrefix}/viewer/dashboard`);
          }
        } else {
          // Forgot password flow - redirect to login
          navigate(`${slugPrefix}/login`, { state: { message: "Password reset successfully. Please login." } });
        }
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-8 sm:p-10 relative overflow-hidden">
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isFirstTimeLogin ? "First-Time Password Setup" : "Create New Password"}
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
            {isFirstTimeLogin 
              ? "For enhanced security, you must replace your temporary initial password before continuing."
              : "Please enter a strong, complex password to secure your DMS account."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 font-medium text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Strength Meter Bar */}
          {newPassword.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Password Strength:</span>
                <span className={`font-bold ${strength.text}`}>{strength.label}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
            </div>
          )}

          {/* Confirm Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 font-medium text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Complexity Checklist Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Complexity Requirements
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                {criteria.length ? (
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className={criteria.length ? "text-emerald-700 font-semibold" : "text-slate-600"}>
                  Minimum 8 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                {criteria.uppercase ? (
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className={criteria.uppercase ? "text-emerald-700 font-semibold" : "text-slate-600"}>
                  Uppercase letter (A-Z)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {criteria.lowercase ? (
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className={criteria.lowercase ? "text-emerald-700 font-semibold" : "text-slate-600"}>
                  Lowercase letter (a-z)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {criteria.number ? (
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className={criteria.number ? "text-emerald-700 font-semibold" : "text-slate-600"}>
                  Numeric digit (0-9)
                </span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                {criteria.special ? (
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className={criteria.special ? "text-emerald-700 font-semibold" : "text-slate-600"}>
                  Special symbol (!@#$%^&*...)
                </span>
              </div>
              {confirmPassword.length > 0 && (
                <div className="flex items-center gap-2 sm:col-span-2">
                  {criteria.match ? (
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle size={15} className="text-red-500 shrink-0" />
                  )}
                  <span className={criteria.match ? "text-emerald-700 font-semibold" : "text-red-600 font-semibold"}>
                    {criteria.match ? "Passwords match" : "Passwords do not match"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-105 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-sm tracking-wide shadow-lg shadow-blue-500/25 mt-4"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Updating Password...</span>
              </div>
            ) : (
              <>
                <span>{isFirstTimeLogin ? "Set Password & Continue" : "Save New Password"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
