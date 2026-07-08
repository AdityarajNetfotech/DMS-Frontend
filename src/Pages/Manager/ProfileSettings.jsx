import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, Eye, EyeOff } from "lucide-react";

import MainLayout from "../../layout/MainLayout";
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

export default function ProfileSettings() {
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
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage("Profile updated successfully.");
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
    <MainLayout>
      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
            Profile Settings
          </h1>
          <p className="mt-3 text-base text-slate-500">
            Update your profile information and security settings.
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
              className={`relative pb-4 text-sm transition ${
                isProfileTab
                  ? "font-bold text-blue-700"
                  : "font-semibold text-slate-500 hover:text-slate-900"
              }`}
            >
              Profile Information
              {isProfileTab ? (
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
              className={`relative pb-4 text-sm transition ${
                !isProfileTab
                  ? "font-bold text-blue-700"
                  : "font-semibold text-slate-500 hover:text-slate-900"
              }`}
            >
              Change Password
              {!isProfileTab ? (
                <span className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded-full bg-blue-700" />
              ) : null}
            </button>
          </div>
        </section>

        {isProfileTab ? (
          <form onSubmit={handleSaveProfile} className="max-w-5xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <h2 className="text-xl font-bold text-slate-950">
              Profile Information
            </h2>

            <div className="mt-6 space-y-5">
              <Field
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
              <Field
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                disabled={loading}
              />
              <Field
                label="Phone"
                value="+1 (555) 123-4567"
                type="tel"
                disabled
              />

              <label className="block opacity-60 cursor-not-allowed">
                <span className="text-sm font-semibold text-slate-900">
                  Department
                </span>
                <button
                  type="button"
                  disabled
                  className="mt-2 flex h-12 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 text-left text-sm font-medium text-slate-900 transition cursor-not-allowed"
                >
                  Operations
                  <ChevronDown size={19} className="text-slate-500" />
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-7 inline-flex h-13 min-w-[225px] items-center justify-center rounded-lg bg-blue-700 px-8 text-base font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
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
              className="mt-8 inline-flex h-13 min-w-[215px] items-center justify-center rounded-lg bg-blue-700 px-8 text-base font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
