import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Palette,
  Upload,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { useTranslation } from "../../i18n/useTranslation";

export default function WorkspaceContent() {
  const { companySlug } = useParams();
  const fileInputRef = useRef(null);
  const colorInputRef = useRef(null);

  const { t, setLanguage } = useTranslation();

  const [selectedColor, setSelectedColor] = useState("#0B2C87");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [logo, setLogo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [defaultLanguage, setDefaultLanguage] = useState("English");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(""); // "success" or "error"

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
          setDefaultLanguage(data.data.defaultLanguage || "English");
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
      setStatusMessage(t.logoError);
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
          fontFamily,
          defaultLanguage
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusType("success");
        setStatusMessage(t.successMsg);
        // Update local storage or dispatch event to refresh UI
        window.dispatchEvent(new Event("branding-update"));
      } else {
        setStatusType("error");
        setStatusMessage(t.errorMsg);
      }
    } catch (err) {
      console.error(err);
      setStatusType("error");
      setStatusMessage(t.networkError);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F7FB] min-h-screen">
        <p className="text-gray-500 font-medium">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F7FB] p-4 sm:p-6 lg:p-8">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {t("title")}
          </h1>

          <p className="text-gray-500 mt-1 text-sm">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 border border-gray-300 rounded-xl bg-white font-medium text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            {t("discard")}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{ backgroundColor: selectedColor }}
            className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? t("saving") : t("save")}
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
              <h2 className="text-xl font-bold text-gray-900">{t("brandingTheme")}</h2>
            </div>
            <p className="text-xs text-gray-500">{t("brandingThemeDesc")}</p>
          </div>

          {/* Organization Name */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              {t("orgName")}
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
              {t("workspaceLogo")}
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
                  {logo ? t.uploadReplace : t.uploadNew}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {t("supportedFormats")}
                </p>
              </div>
            </div>
          </div>

          {/* Brand Colors */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              {t("primaryColor")}
              {/* {t("defaultLanguage")} */}
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-4 transition-all duration-200 cursor-pointer hover:scale-105
                    ${selectedColor.toLowerCase() === color.toLowerCase()
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
              {t("fontFamily")}
              {/* {t("defaultLanguage")} */}
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

          {/* Workspace Default Language */}
          {/* <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              {t("defaultLanguage")}
            </label>
            <select
              value={defaultLanguage}
              onChange={(e) => {
                setDefaultLanguage(e.target.value);
                setLanguage(e.target.value);
              }}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition bg-white font-medium"
            >
              <option value="English">English</option>
              <option value="Khmer">Khmer (ភាសាខ្មែរ)</option>
            </select>
          </div> */}

        </div>

        {/* Right Side: Live Theme Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t("livePreview")}</h3>
            <p className="text-xs text-gray-500 mb-6">{t("previewDesc")}</p>

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
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t("sampleButtons")}</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    style={{ backgroundColor: selectedColor }}
                    className="w-full py-2.5 text-white font-semibold text-xs rounded-lg shadow-sm hover:opacity-90 transition cursor-default"
                  >
                    {t("primaryBtn")}
                  </button>
                  <button
                    style={{ borderColor: selectedColor, color: selectedColor }}
                    className="w-full py-2.5 bg-white border font-semibold text-xs rounded-lg hover:bg-slate-50 transition cursor-default"
                  >
                    {t("secondaryBtn")}
                  </button>
                </div>
              </div>

              {/* Dynamic Active Tab Preview */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t("activeNav")}</p>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white font-semibold text-xs" style={{ backgroundColor: selectedColor }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                  <span>{t("selectedLink")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}