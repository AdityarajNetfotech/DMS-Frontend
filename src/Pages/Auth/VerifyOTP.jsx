import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { KeyRound, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { companySlug } = useParams();

  const slugPrefix = companySlug ? `/${companySlug}` : "/demo-company";
  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) {
      navigate(`${slugPrefix}/forgot-password`);
    }
  }, [email, navigate, slugPrefix]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/${companySlug || 'demo-company'}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = await response.json();

      if (data.success) {
        navigate(`${slugPrefix}/reset-password`, { 
          state: { email, resetToken: data.resetToken } 
        });
      } else {
        setError(data.message || "Invalid OTP");
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
          <h1 className="text-2xl font-bold text-slate-900">Enter OTP</h1>
          <p className="text-slate-500 text-sm mt-2">
            We sent a 6-digit code to <span className="font-semibold text-slate-700">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 transition"
                disabled={loading}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Verify Code"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to={`${slugPrefix}/login`} className="text-sm text-blue-600 hover:underline font-medium">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
