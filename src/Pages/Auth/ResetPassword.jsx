import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-blue-900/10 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {isFirstTimeLogin ? "Setup New Password" : "Reset Password"}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {isFirstTimeLogin 
              ? "Since this is your first time logging in, please secure your account by changing your temporary password."
              : "Enter your new password below."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 placeholder:text-slate-400 transition"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 placeholder:text-slate-400 transition"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-70 mt-4"
          >
            {loading ? "Saving..." : "Save Password"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
