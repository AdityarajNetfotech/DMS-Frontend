import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Palette,
  Plus,
  MoreVertical,
  Hash,
  Calendar,
  ChevronDown,
  Upload,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function WorkspaceContent() {
  const { companySlug } = useParams();
  const fileInputRef = useRef(null);
  const colorInputRef = useRef(null);

  const [selectedColor, setSelectedColor] = useState("#0B2C87");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [logo, setLogo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(""); // "success" or "error"

  const metadata = [
    {
      name: "Project ID",
      type: "Number",
      icon: <Hash size={16} />,
      status: "Active",
      color: "bg-green-100 text-green-700",
    },
    {
      name: "Retention Date",
      type: "Date",
      icon: <Calendar size={16} />,
      status: "Active",
      color: "bg-green-100 text-green-700",
    },
    {
      name: "Confidentiality Level",
      type: "Dropdown",
      icon: <ChevronDown size={16} />,
      status: "Required",
      color: "bg-yellow-100 text-yellow-700",
    },
  ];

  const colors = [
    "#0B2C87",
    "#2845C7",
    "#4338CA",
    "#6B21A8",
    "#0F172A",
  ];

  // Fetch current branding configuration
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/${companySlug}/branding`);
        const data = await res.json();
        if (data.success) {
          setCompanyName(data.data.companyName || "");
          setLogo(data.data.logo || "");
          setSelectedColor(data.data.primaryColor || "#0B2C87");
          setFontFamily(data.data.fontFamily || "Inter");
        }
      } catch (err) {
        console.error("Failed to load branding", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranding();
  }, [companySlug]);

  const handleLogoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setStatusType("error");
      setStatusMessage("Logo size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/api/${companySlug}/branding`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          logo,
          primaryColor: selectedColor,
          fontFamily
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusType("success");
        setStatusMessage("Branding updated successfully! Refreshing dynamic theme...");
        // Update local storage or dispatch event to refresh UI
        window.dispatchEvent(new Event("branding-update"));
      } else {
        setStatusType("error");
        setStatusMessage(data.message || "Failed to update branding settings");
      }
    } catch (err) {
      console.error(err);
      setStatusType("error");
      setStatusMessage("Network error: Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F7FB] min-h-screen">
        <p className="text-gray-500 font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Workspace Customization
          </h1>

          <p className="text-gray-500 mt-1 text-sm">
            Customize the look, branding identity, and logo theme of your document workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.reload()} 
            className="px-5 py-2.5 border border-gray-300 rounded-xl bg-white font-medium text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Discard Changes
          </button>

          <button 
            onClick={handleSave}
            disabled={saving}
            style={{ backgroundColor: selectedColor }}
            className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving..." : "Save Branding"}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`mt-6 p-4 rounded-xl border flex items-center gap-3 text-sm font-medium ${statusType === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          <div className={`w-2 h-2 rounded-full ${statusType === "success" ? "bg-green-500" : "bg-red-500"}`} />
          {statusMessage}
        </div>
      )}

      {/* ================= CONTENT LAYOUT ================= */}

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Left Side: Customization Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Palette className="w-5 h-5" style={{ color: selectedColor }} />
              <h2 className="text-xl font-bold text-gray-900">Branding & Theme</h2>
            </div>
            <p className="text-xs text-gray-500">Configure your organization's logo and color palette.</p>
          </div>

          {/* Organization Name */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Organization Name
            </label>
            <input
              type="text"
              value={companyName}
              readOnly
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 outline-none font-medium text-sm"
            />
          </div>

          {/* Upload Logo */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Workspace Logo
            </label>
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div 
              onClick={handleLogoUploadClick}
              className="border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5 hover:bg-gray-50/50 cursor-pointer transition"
            >
              <div className="w-20 h-20 shrink-0 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden p-2">
                {logo ? (
                  <img src={logo} alt="Company logo preview" className="w-full h-full object-contain" />
                ) : (
                  <Upload className="text-gray-400 w-8 h-8" />
                )}
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-sm text-gray-900">
                  {logo ? "Upload replacement logo" : "Upload new logo"}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: SVG, PNG, JPG (max. 2MB)
                </p>
              </div>
            </div>
          </div>

          {/* Brand Colors */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Primary Brand Color
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-4 transition-all duration-200 cursor-pointer hover:scale-105
                    ${
                      selectedColor.toLowerCase() === color.toLowerCase()
                        ? "border-gray-400 scale-105"
                        : "border-transparent"
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}

              <input 
                ref={colorInputRef}
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="hidden"
              />

              <button 
                onClick={() => colorInputRef.current?.click()}
                className="w-10 h-10 rounded-full border border-gray-300 bg-gray-55 flex items-center justify-center text-lg font-bold text-gray-500 hover:bg-gray-100 transition cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Workspace Font Family */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Workspace Font Family
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition bg-white font-medium"
            >
              <option value="Inter">Inter (Clean Sans-serif)</option>
              <option value="Roboto">Roboto (Technical Sans-serif)</option>
              <option value="Poppins">Poppins (Modern Rounded)</option>
              <option value="Outfit">Outfit (Geometric & Sleek)</option>
              <option value="Playfair Display">Playfair Display (Classic Serif)</option>
              <option value="Lora">Lora (Contemporary Serif)</option>
              <option value="JetBrains Mono">JetBrains Mono (Monospace)</option>
            </select>
          </div>
        </div>

        {/* Right Side: Live Theme Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Live Theme Preview</h3>
            <p className="text-xs text-gray-500 mb-6">See how your logo and buttons will look to users.</p>

            <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/50 space-y-6">
              {/* Dynamic Header Preview */}
              <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div 
                  style={!logo ? { backgroundColor: selectedColor } : {}}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden"
                >
                  {logo ? (
                    <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    (companyName || "D").charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900" style={{ color: selectedColor }}>
                    {companyName || "Workspace"}
                  </h4>
                  <p className="text-[10px] text-gray-400">Dashboard</p>
                </div>
              </div>

              {/* Dynamic Button Previews */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sample Buttons</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    style={{ backgroundColor: selectedColor }}
                    className="w-full py-2.5 text-white font-semibold text-xs rounded-lg shadow-sm hover:opacity-90 transition cursor-default"
                  >
                    Primary Button
                  </button>
                  <button 
                    style={{ borderColor: selectedColor, color: selectedColor }}
                    className="w-full py-2.5 bg-white border font-semibold text-xs rounded-lg hover:bg-slate-50 transition cursor-default"
                  >
                    Secondary Button
                  </button>
                </div>
              </div>

              {/* Dynamic Active Tab Preview */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Navigation highlight</p>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white font-semibold text-xs" style={{ backgroundColor: selectedColor }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                  <span>Selected Sidebar Link</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}