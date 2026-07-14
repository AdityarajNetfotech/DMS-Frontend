import React, { useState, useEffect } from "react";
import { X, Save, Edit3, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function TenantModal({ tenant, isOpen, onClose, onRefresh, initialEditMode = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tenant) {
      setFormData(tenant);
      setIsEditing(initialEditMode);
      setError(null);
    }
  }, [tenant, initialEditMode]);

  if (!isOpen || !tenant) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/api/tenant/${tenant._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditing(false);
        onRefresh();
        onClose();
      } else {
        setError(data.message || "Failed to update tenant");
      }
    } catch (err) {
      setError("An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, type = "text", disabled = false }) => (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-slate-500 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        disabled={disabled || !isEditing}
        className={`h-9 rounded-md border px-3 text-sm transition ${
          disabled
            ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-75"
            : isEditing
              ? "border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              : "border-transparent bg-slate-50 text-slate-700 cursor-default"
        }`}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isEditing ? "Edit Tenant Details" : "Tenant Details"}
            </h2>
            <p className="text-sm text-slate-500">{formData.companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex-1">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <InputField label="Company Name" name="companyName" />
            <InputField label="Legal Business Name" name="legalBusinessName" />
            <InputField label="Company Code / Slug" name="companyCode" />
            <InputField label="Registration Number" name="registrationNumber" />
            <InputField label="GST Number" name="gstNumber" />
            <InputField label="PAN Number" name="panNumber" />
            <InputField label="Industry Type" name="industryType" />
            <InputField label="Company Size" name="companySize" />
            <InputField label="Website" name="website" />
            <InputField label="Logo URL" name="logo" />
            <InputField label="Phone" name="phone" />
            <InputField label="Email" name="adminEmail" type="email" disabled={true} />
            
            <div className="col-span-1 md:col-span-2">
              <InputField label="Address" name="address" />
            </div>
            
            <InputField label="City" name="city" />
            <InputField label="State" name="state" />
            <InputField label="Zip Code" name="postalCode" />
            <InputField label="Country" name="country" />
            <InputField label="Default Language" name="defaultLanguage" />
            <InputField label="Timezone" name="timezone" />
            
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-1">Status</label>
              <select
                name="isActive"
                value={formData.isActive !== false ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                disabled={!isEditing}
                className={`h-9 rounded-md border px-3 text-sm transition ${
                  !isEditing
                    ? "border-transparent bg-slate-50 text-slate-700 cursor-default"
                    : "border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 rounded-b-xl">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
            >
              <Edit3 size={16} />
              Edit Tenant
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setFormData(tenant);
                  setIsEditing(false);
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-70"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
