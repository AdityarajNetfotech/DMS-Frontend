import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Eye, EyeOff, User, Lock, ShieldCheck, FileSignature } from "lucide-react";
import ReportingManagerLayout from "../../layout/ReportingManagerLayout";
import { API_BASE_URL } from "../../config/api";
import ElectronicSignatureSettings from "../../components/ElectronicSignatureSettings";

function Field({ label, value, onChange, type = "text", disabled = false }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
      />
    </label>
  );
}

function PasswordField({ label, placeholder, hint, value, onChange }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="block">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <div className="relative mt-2">
        <input
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="button"
          aria-label={isVisible ? "Hide password" : "Show password"}
          onClick={() => setIsVisible((visible) => !visible)}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 cursor-pointer"
        >
          {isVisible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
      {hint ? (
        <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default function ReportingManagerProfileSettings() {
  const { companySlug: urlSlug } = useParams();
  const fallbackSlug = localStorage.getItem("companySlug") || "default";
  const companySlug = urlSlug || fallbackSlug;

  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'signature' | 'password'
  const isProfileTab = activeTab === "profile";
  const isSignatureTab = activeTab === "signature";
  const isPasswordTab = activeTab === "password";

  const [userProfile, setUserProfile] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Reporting Manager");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/${companySlug}/users/profile`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setUserProfile(data.data || {});
          setName(data.data.name || "");
          setEmail(data.data.email || "");
          setPhone(data.data.phone || "");
          if (data.data.role) setRole(data.data.role);
        } else {
          setError(data.message || "Failed to fetch profile settings.");
        }
      } catch (err) {
        console.error(err);
        setError("Network error fetching profile settings.");
      } finally {
        setLoading(false);
      }
    };

    if (companySlug) {
      fetchProfile();
    }
  }, [companySlug]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/${companySlug}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage("Profile updated successfully.");
        setUserProfile(data.data || { ...userProfile, name, email, phone });
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", name);
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const hasLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setError("Password must be at least 8 characters long and include uppercase, lowercase, number and special character.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/${companySlug}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage("Password updated successfully.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        if (data.tokens) {
          localStorage.setItem("accessToken", data.tokens.accessToken);
          localStorage.setItem("refreshToken", data.tokens.refreshToken);
        }
      } else {
        setError(data.message || "Failed to update password.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error updating password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReportingManagerLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                <ShieldCheck size={13} /> {role}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl mt-2">
              Profile & Security Settings
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your personal credentials, digital electronic signature, and authentication settings.
            </p>
          </div>
        </section>

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl">
            {successMessage}
          </div>
        )}

        <section className="border-b border-slate-200">
          <div className="flex gap-6 sm:gap-8 px-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab("profile");
                setError("");
                setSuccessMessage("");
              }}
              className={`relative pb-4 text-sm transition cursor-pointer shrink-0 ${
                isProfileTab
                  ? "font-bold text-blue-700"
                  : "font-semibold text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-2">
                <User size={16} /> Profile Information
              </span>
              {isProfileTab ? (
                <span className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded-full bg-blue-700" />
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("signature");
                setError("");
                setSuccessMessage("");
              }}
              className={`relative pb-4 text-sm transition cursor-pointer shrink-0 ${
                isSignatureTab
                  ? "font-bold text-blue-700"
                  : "font-semibold text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-2">
                <FileSignature size={16} /> E-Signature
              </span>
              {isSignatureTab ? (
                <span className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded-full bg-blue-700" />
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("password");
                setError("");
                setSuccessMessage("");
              }}
              className={`relative pb-4 text-sm transition cursor-pointer shrink-0 ${
                isPasswordTab
                  ? "font-bold text-blue-700"
                  : "font-semibold text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-2">
                <Lock size={16} /> Change Password
              </span>
              {isPasswordTab ? (
                <span className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded-full bg-blue-700" />
              ) : null}
            </button>
          </div>
        </section>

        {isProfileTab && (
          <form onSubmit={handleSaveProfile} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-bold text-slate-950">
              Personal Information
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These details identify you during maker-checker approval reviews.
            </p>

            <div className="mt-6 space-y-5">
              <Field
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
              <Field
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                disabled={loading}
              />
              <Field
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                disabled={loading}
              />
              <Field
                label="Designated Role"
                value={role}
                disabled={true}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 inline-flex h-12 min-w-[200px] items-center justify-center rounded-xl bg-blue-700 px-8 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}

        {isSignatureTab && (
          <ElectronicSignatureSettings
            companySlug={companySlug}
            userProfile={userProfile}
            onProfileUpdated={(updated) => setUserProfile(updated)}
          />
        )}

        {isPasswordTab && (
          <form onSubmit={handleChangePassword} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-bold text-slate-950">
              Change Account Password
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ensure your account is using a long, random password to stay secure.
            </p>

            <div className="mt-6 space-y-5">
              <PasswordField
                label="Current Password"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <PasswordField
                label="New Password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                hint="Password must be at least 8 characters long and include uppercase, lowercase, number and special character."
              />
              <PasswordField
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 inline-flex h-12 min-w-[200px] items-center justify-center rounded-xl bg-blue-700 px-8 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </ReportingManagerLayout>
  );
}
