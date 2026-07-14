import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { API_BASE_URL } from "../config/api";

const API_BASE = `${API_BASE_URL}/api/tenant`;

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function FormLabel({ children, required }) {
  return (
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function FormInput({ placeholder, type = "text", value, onChange, error, ...props }) {
  return (
    <div className="w-full">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:ring-2 ${
          error 
            ? "border-red-400 focus:border-red-500 focus:ring-red-100" 
            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const initialFormState = {
  companyName: "",
  legalBusinessName: "",
  companyCode: "",
  registrationNumber: "",
  gstNumber: "",
  panNumber: "",
  industryType: "",
  companySize: "",
  website: "",
  logo: "",
  description: "",
  phone: "",
  alternatePhone: "",
  address: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  defaultLanguage: "",
  timezone: "",
  adminName: "",
  adminEmail: "",
  adminMobile: "",
  adminDesignation: "",
  adminPassword: "",
  confirmPassword: "",
};

export default function RegisterTenant() {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleChange = (e) => {
    let value = e.target.value;
    const name = e.target.name;
    if (["phone", "alternatePhone", "adminMobile"].includes(name)) {
      // Keep only digits and cap at 10
      value = value.replace(/[^0-9]/g, "").slice(0, 10);
    }
    if (["city", "state"].includes(name)) {
      value = value.replace(/[0-9]/g, "");
    }
    if (name === "postalCode") {
      value = value.replace(/[a-zA-Z]/g, "");
    }
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!form.companyName.trim()) newErrors.companyName = "Company Name is required.";
    
    if (!form.companyCode.trim()) newErrors.companyCode = "Company Code is required.";
    else if (!/^[A-Z0-9_-]+$/i.test(form.companyCode)) newErrors.companyCode = "Alphanumeric, dashes, and underscores only.";
    
    if (form.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(form.gstNumber.trim())) {
      newErrors.gstNumber = "Invalid GST Number format (e.g. 22AAAAA0000A1Z1).";
    }
    if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(form.panNumber.trim())) {
      newErrors.panNumber = "Invalid PAN Number format (e.g. ABCDE1234F).";
    }
    if (form.website && !/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(form.website.trim())) {
      newErrors.website = "Invalid website URL.";
    }
    if (form.phone) {
      if (form.phone.length < 10) {
        newErrors.phone = "Contact number must be exactly 10 digits.";
      }
    }
    if (form.alternatePhone) {
      if (form.alternatePhone.length < 10) {
        newErrors.alternatePhone = "Alternate number must be exactly 10 digits.";
      } else if (form.phone && form.alternatePhone === form.phone) {
        newErrors.alternatePhone = "Alternate phone number must be different from the main phone number.";
      }
    }
    if (form.city && /[0-9]/.test(form.city)) {
      newErrors.city = "City name should not contain numbers.";
    }
    if (form.state && /[0-9]/.test(form.state)) {
      newErrors.state = "State name should not contain numbers.";
    }
    if (form.postalCode && !/^[0-9\s-]{3,10}$/.test(form.postalCode.trim())) {
      newErrors.postalCode = "Postal code must contain only digits.";
    }
    
    if (!form.adminName.trim()) newErrors.adminName = "Tenant Admin Full Name is required.";
    if (!form.adminEmail.trim()) newErrors.adminEmail = "Admin Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail.trim())) newErrors.adminEmail = "Invalid email address.";
    if (form.adminMobile) {
      if (form.adminMobile.length < 10) {
        newErrors.adminMobile = "Mobile number must be exactly 10 digits.";
      }
    }
    
    if (!form.adminPassword) {
      newErrors.adminPassword = "Password is required.";
    } else if (form.adminPassword.length < 8) {
      newErrors.adminPassword = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(form.adminPassword)) {
      newErrors.adminPassword = "Password must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(form.adminPassword)) {
      newErrors.adminPassword = "Password must contain at least one lowercase letter.";
    } else if (!/[0-9]/.test(form.adminPassword)) {
      newErrors.adminPassword = "Password must contain at least one number.";
    } else if (!/[^A-Za-z0-9]/.test(form.adminPassword)) {
      newErrors.adminPassword = "Password must contain at least one special character.";
    }
    
    if (form.adminPassword !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setToast({ type: "error", message: "Please fix the highlighted errors." });
      return;
    }
    setErrors({});

    try {
      setSubmitting(true);
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          companyName: form.companyName,
          legalBusinessName: form.legalBusinessName,
          companyCode: form.companyCode,
          registrationNumber: form.registrationNumber,
          gstNumber: form.gstNumber,
          panNumber: form.panNumber,
          industryType: form.industryType,
          companySize: form.companySize,
          website: form.website,
          logo: form.logo,
          description: form.description,
          phone: form.phone,
          alternatePhone: form.alternatePhone,
          address: form.address,
          addressLine2: form.addressLine2,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
          defaultLanguage: form.defaultLanguage,
          timezone: form.timezone,
          adminName: form.adminName,
          adminEmail: form.adminEmail,
          adminMobile: form.adminMobile,
          adminDesignation: form.adminDesignation,
          adminPassword: form.adminPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setToast({ type: "success", message: `Tenant "${form.companyName}" created successfully!` });
        setForm(initialFormState);
      } else {
        setToast({ type: "error", message: data.message || "Failed to create tenant." });
      }
    } catch (err) {
      setToast({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── Toast Notification ── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-medium shadow-lg transition-all animate-in slide-in-from-right ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <XCircle size={18} />
          )}
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Register Tenant</h1>
        <p className="mt-1 text-sm text-slate-500">
          Dashboard &rsaquo; Register Tenants
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900">Tenant Information</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Fill in the details to register a new tenant (company).
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Company Details */}
          <div>
            <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider bg-slate-50 p-2 rounded mb-3">Company Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <FormLabel required>Company Name</FormLabel>
                <FormInput name="companyName" value={form.companyName} onChange={handleChange} error={errors.companyName} placeholder="Company Name" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>Legal Business Name</FormLabel>
                <FormInput name="legalBusinessName" value={form.legalBusinessName} onChange={handleChange} placeholder="Legal Name" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel required>Company Code</FormLabel>
                <FormInput name="companyCode" value={form.companyCode} onChange={handleChange} error={errors.companyCode} placeholder="Unique Code" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>Registration Number</FormLabel>
                <FormInput name="registrationNumber" value={form.registrationNumber} onChange={handleChange} placeholder="Registration No" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>GST Number (Optional)</FormLabel>
                <FormInput name="gstNumber" value={form.gstNumber} onChange={handleChange} error={errors.gstNumber} placeholder="GST No" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>PAN Number (Optional)</FormLabel>
                <FormInput name="panNumber" value={form.panNumber} onChange={handleChange} error={errors.panNumber} placeholder="PAN No" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>Industry Type</FormLabel>
                <FormInput name="industryType" value={form.industryType} onChange={handleChange} placeholder="IT, Healthcare, etc." />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>Company Size</FormLabel>
                <FormInput name="companySize" value={form.companySize} onChange={handleChange} placeholder="1-50, 51-200, etc." />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>Company Website</FormLabel>
                <FormInput name="website" value={form.website} onChange={handleChange} error={errors.website} placeholder="https://" />
              </div>
              <div className="col-span-2">
                <FormLabel>Company Description</FormLabel>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Brief description of the company"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  rows="2"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider bg-slate-50 p-2 rounded mb-3">Contact Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>Contact Number</FormLabel>
                <FormInput name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="Main Phone" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>Alternate Number (Optional)</FormLabel>
                <FormInput name="alternatePhone" type="tel" value={form.alternatePhone} onChange={handleChange} error={errors.alternatePhone} placeholder="Alternate Phone (must be different)" />
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div>
            <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider bg-slate-50 p-2 rounded mb-3">Address Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FormLabel>Address Line 1</FormLabel>
                <FormInput name="address" value={form.address} onChange={handleChange} placeholder="Street Address, P.O. Box" />
              </div>
              <div className="col-span-2">
                <FormLabel>Address Line 2 (Optional)</FormLabel>
                <FormInput name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="Suite, Unit, Building, etc." />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>City</FormLabel>
                <FormInput name="city" value={form.city} onChange={handleChange} error={errors.city} placeholder="City" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>State</FormLabel>
                <FormInput name="state" value={form.state} onChange={handleChange} error={errors.state} placeholder="State / Province" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>Postal Code</FormLabel>
                <FormInput name="postalCode" value={form.postalCode} onChange={handleChange} error={errors.postalCode} placeholder="Zip / Postal Code" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>Country</FormLabel>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select country</option>
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>Default Language</FormLabel>
                <select
                  name="defaultLanguage"
                  value={form.defaultLanguage}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select language</option>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>Timezone</FormLabel>
                <select
                  name="timezone"
                  value={form.timezone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select timezone</option>
                  <option>IST (UTC+5:30)</option>
                  <option>EST (UTC-5)</option>
                  <option>PST (UTC-8)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Admin Details */}
          <div>
            <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider bg-slate-50 p-2 rounded mb-3">Admin Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <FormLabel required>Tenant Admin Full Name</FormLabel>
                <FormInput name="adminName" value={form.adminName} onChange={handleChange} error={errors.adminName} placeholder="Admin Name" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel required>Tenant Admin Email</FormLabel>
                <FormInput name="adminEmail" type="email" value={form.adminEmail} onChange={handleChange} error={errors.adminEmail} placeholder="Admin Email" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>Tenant Admin Mobile Number (Optional)</FormLabel>
                <FormInput name="adminMobile" type="tel" value={form.adminMobile} onChange={handleChange} error={errors.adminMobile} placeholder="Admin Mobile" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel>Tenant Admin Designation</FormLabel>
                <FormInput name="adminDesignation" value={form.adminDesignation} onChange={handleChange} placeholder="CEO, Manager, etc." />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel required>Admin Password</FormLabel>
                <div className="relative">
                  <FormInput
                    name="adminPassword"
                    type={showPassword ? "text" : "password"}
                    value={form.adminPassword}
                    onChange={handleChange}
                    error={errors.adminPassword}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer ${errors.adminPassword ? 'mt-[-10px]' : ''}`}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormLabel required>Confirm Password</FormLabel>
                <div className="relative">
                  <FormInput
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer ${errors.confirmPassword ? 'mt-[-10px]' : ''}`}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setForm(initialFormState)}
              className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Registering..." : "Register Tenant"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
