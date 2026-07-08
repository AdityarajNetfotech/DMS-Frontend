import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Eye, EyeOff, ChevronDown } from "lucide-react";

import AdminLayout from "../../components/Admin/AdminLayout";
import { API_BASE_URL } from "../../config/api";

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
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
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

export default function AdminProfileSettings() {
  const { companySlug } = useParams();
  const [activeTab, setActiveTab] = useState("profile");
  const isProfileTab = activeTab === "profile";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
          setName(data.data.name || "");
          setEmail(data.data.email || "");
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
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
    <AdminLayout>
      <div className="flex-1 overflow-y-auto bg-[#F5F7FB] p-4 sm:p-6 lg:p-8 space-y-6">
        <section>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
            Profile Settings
          </h1>
          <p className="mt-3 text-base text-slate-500">
            View your profile information and security settings.
          </p>
        </section>

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
            {successMessage}
          </div>
        )}

        <section className="border-b border-slate-200">
          <div className="flex gap-8 px-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("profile");
                setError("");
                setSuccessMessage("");
              }}
              className={`relative pb-4 text-sm transition cursor-pointer ${
                isProfileTab
                  ? "font-bold text-blue-600"
                  : "font-semibold text-slate-500 hover:text-slate-950"
              }`}
            >
              Profile Information
              {isProfileTab ? (
                <span className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded-full bg-blue-600" />
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("password");
                setError("");
                setSuccessMessage("");
              }}
              className={`relative pb-4 text-sm transition cursor-pointer ${
                !isProfileTab
                  ? "font-bold text-blue-600"
                  : "font-semibold text-slate-500 hover:text-slate-950"
              }`}
            >
              Change Password
              {!isProfileTab ? (
                <span className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded-full bg-blue-600" />
              ) : null}
            </button>
          </div>
        </section>

        {isProfileTab ? (
          <div className="max-w-5xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <h2 className="text-xl font-bold text-slate-950">
              Profile Information
            </h2>

            <div className="mt-6 space-y-5">
              <Field
                label="Full Name"
                value={name}
                disabled={true}
              />
              <Field
                label="Email"
                value={email}
                type="email"
                disabled={true}
              />
              <Field
                label="Role"
                value="Tenant Admin"
                type="text"
                disabled={true}
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="max-w-5xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <h2 className="text-xl font-bold text-slate-950">
              Change Password
            </h2>
            <p className="mt-3 text-base text-slate-500">
              Update your password to keep your account secure.
            </p>

            <div className="mt-9 space-y-8">
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
                hint="Password must be at least 8 characters long."
              />

              <PasswordField
                label="Confirm New Password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-7 inline-flex h-13 min-w-[225px] items-center justify-center rounded-lg bg-blue-600 px-8 text-base font-bold text-white shadow-sm transition hover:opacity-90 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Updating..." : "Change Password"}
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
