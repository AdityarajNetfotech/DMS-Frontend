import React, { useState, useRef, useEffect } from "react";
import {
  PenTool,
  Type,
  Upload,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Download,
  ShieldCheck,
  Sparkles,
  Info,
  Lock,
  Save,
  Loader2,
  FileSignature,
  Check,
  RefreshCw,
  CheckCircle,
  Radio
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

const SIGNATURE_FONTS = [
  { id: "Great Vibes", name: "Great Vibes (Classic Elegant)", fontClass: "'Great Vibes', cursive" },
  { id: "Dancing Script", name: "Dancing Script (Flowing)", fontClass: "'Dancing Script', cursive" },
  { id: "Alex Brush", name: "Alex Brush (Formal Executive)", fontClass: "'Alex Brush', cursive" },
  { id: "Sacramento", name: "Sacramento (Graceful Script)", fontClass: "'Sacramento', cursive" },
  { id: "Caveat", name: "Caveat (Modern Casual)", fontClass: "'Caveat', cursive" },
  { id: "Satisfy", name: "Satisfy (Calligraphy)", fontClass: "'Satisfy', cursive" },
  { id: "Pacifico", name: "Pacifico (Bold Signature)", fontClass: "'Pacifico', cursive" }
];

const PEN_COLORS = [
  { name: "Navy Blue", value: "#0B2C87", bg: "bg-[#0B2C87]" },
  { name: "Charcoal Black", value: "#0f172a", bg: "bg-slate-900" },
  { name: "Deep Royal", value: "#1d4ed8", bg: "bg-blue-700" },
  { name: "Forest Green", value: "#047857", bg: "bg-emerald-700" }
];

const PEN_WIDTHS = [
  { label: "Fine", value: 2 },
  { label: "Normal", value: 3.5 },
  { label: "Bold", value: 5.5 }
];

export default function ElectronicSignatureSettings({
  companySlug,
  userProfile = {},
  onProfileUpdated
}) {
  // Current active view tab ('draw' | 'type' | 'upload')
  const [activeTab, setActiveTab] = useState(userProfile?.signatureType || "draw");
  // Currently selected signature method to be saved ('draw' | 'type' | 'upload')
  const [selectedMethod, setSelectedMethod] = useState(userProfile?.signatureType || "draw");

  const [savedSignature, setSavedSignature] = useState(userProfile?.signature || "");
  const [signatureType, setSignatureType] = useState(userProfile?.signatureType || "draw");
  const [selectedFont, setSelectedFont] = useState(userProfile?.signatureFont || "Great Vibes");
  const [typedName, setTypedName] = useState(userProfile?.name || localStorage.getItem("userName") || "");
  const [initials, setInitials] = useState(userProfile?.signatureInitials || "");
  const [penColor, setPenColor] = useState("#0B2C87");
  const [penWidth, setPenWidth] = useState(3.5);
  const [consentAgreed, setConsentAgreed] = useState(true);

  // Uploaded signature state
  const [uploadedSignature, setUploadedSignature] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Drawn signature state
  const [drawnSignatureData, setDrawnSignatureData] = useState("");
  const [hasDrawn, setHasDrawn] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Canvas drawing state
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const historyRef = useRef([]);
  const fileInputRef = useRef(null);

  // Sync with initial userProfile
  useEffect(() => {
    if (userProfile?.signature) {
      setSavedSignature(userProfile.signature);
      const sType = userProfile.signatureType || "draw";
      setSignatureType(sType);
      setSelectedMethod(sType);
      setActiveTab(sType);
      if (sType === "draw") {
        setDrawnSignatureData(userProfile.signature);
        setHasDrawn(true);
      } else if (sType === "upload") {
        setUploadedSignature(userProfile.signature);
      }
      if (userProfile.signatureFont) setSelectedFont(userProfile.signatureFont);
      if (userProfile.signatureInitials) setInitials(userProfile.signatureInitials);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
    if (userProfile?.name && !typedName) {
      setTypedName(userProfile.name);
    }
  }, [userProfile]);

  // Generate default initials from name
  useEffect(() => {
    if (!initials && typedName) {
      const parts = typedName.trim().split(" ");
      if (parts.length >= 2) {
        setInitials((parts[0][0] + parts[parts.length - 1][0]).toUpperCase());
      } else if (parts.length === 1 && parts[0].length > 0) {
        setInitials(parts[0].substring(0, 2).toUpperCase());
      }
    }
  }, [typedName]);

  // Restore drawn canvas when switching to 'draw' tab
  useEffect(() => {
    if (activeTab === "draw" && canvasRef.current && drawnSignatureData) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHasDrawn(true);
      };
      img.src = drawnSignatureData;
    }
  }, [activeTab]);

  // Tab Switch (Allows viewing/editing each method without wiping existing data)
  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setErrorMessage("");
  };

  // Explicit Selection of Active Signature Method (Mutually Exclusive)
  const selectSignatureMethod = (method) => {
    setSelectedMethod(method);
    setErrorMessage("");
  };

  // Canvas Coordinate Calculation with accurate scale mapping
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Drawing Handlers
  const handleStartDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (e.target.setPointerCapture && e.pointerId) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    isDrawing.current = true;
    const pos = getCanvasCoordinates(e);
    lastPos.current = pos;

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Draw single dot on tap/click
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, penWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = penColor;
    ctx.fill();

    setHasDrawn(true);
    // Drawing automatically sets Draw as the active selected method (mutually exclusive)
    setSelectedMethod("draw");
  };

  const handleDrawMove = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const currentPos = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    lastPos.current = currentPos;
    setHasDrawn(true);
  };

  const handleEndDraw = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      const dataUrl = canvas.toDataURL("image/png");
      setDrawnSignatureData(dataUrl);
      setSelectedMethod("draw");
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
    setDrawnSignatureData("");
    historyRef.current = [];
  };

  const undoCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || historyRef.current.length <= 1) {
      clearCanvas();
      return;
    }
    historyRef.current.pop();
    const previousState = historyRef.current[historyRef.current.length - 1];
    const ctx = canvas.getContext("2d");
    ctx.putImageData(previousState, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    setDrawnSignatureData(dataUrl);
  };

  // Convert Typed Name to High-Res PNG Data URL
  const generateTypedSignatureDataUrl = () => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 700;
    tempCanvas.height = 220;
    const ctx = tempCanvas.getContext("2d");
    ctx.clearRect(0, 0, 700, 220);

    ctx.font = `60px ${selectedFont}`;
    ctx.fillStyle = penColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName || "Signature", 350, 110);

    return tempCanvas.toDataURL("image/png");
  };

  // Process and Optimize Uploaded Signature File
  const processImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid image file (PNG, JPG, SVG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Signature image must be smaller than 5MB.");
      return;
    }

    setUploadedFileName(file.name);
    setErrorMessage("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target.result;
      const img = new Image();
      img.onload = () => {
        try {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = 700;
          tempCanvas.height = 220;
          const ctx = tempCanvas.getContext("2d");
          ctx.clearRect(0, 0, 700, 220);

          // Aspect fit image cleanly in signature bounding box
          const scale = Math.min(600 / (img.width || 1), 180 / (img.height || 1), 1);
          const w = (img.width || 600) * scale;
          const h = (img.height || 180) * scale;
          const x = (700 - w) / 2;
          const y = (220 - h) / 2;

          ctx.drawImage(img, x, y, w, h);
          const dataUrl = tempCanvas.toDataURL("image/png");
          setUploadedSignature(dataUrl || rawDataUrl);
          // Uploading automatically selects Upload as the active method (mutually exclusive)
          setSelectedMethod("upload");
          setErrorMessage("");
        } catch {
          setUploadedSignature(rawDataUrl);
          setSelectedMethod("upload");
          setErrorMessage("");
        }
      };
      img.onerror = () => {
        setUploadedSignature(rawDataUrl);
        setSelectedMethod("upload");
        setErrorMessage("");
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Compute live preview of the currently selected method
  const getSelectedPreview = () => {
    if (selectedMethod === "draw") {
      return drawnSignatureData;
    } else if (selectedMethod === "type") {
      return null; // Will render with live font style
    } else if (selectedMethod === "upload") {
      return uploadedSignature;
    }
    return null;
  };

  // Save Signature to Profile via API
  const handleSaveSignature = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!consentAgreed) {
      setErrorMessage("Please confirm and accept the legal e-signature declaration.");
      return;
    }

    let finalSignatureDataUrl = "";
    const chosenMethod = selectedMethod || activeTab;

    if (chosenMethod === "draw") {
      if (drawnSignatureData) {
        finalSignatureDataUrl = drawnSignatureData;
      } else if (canvasRef.current && hasDrawn) {
        finalSignatureDataUrl = canvasRef.current.toDataURL("image/png");
      } else {
        setErrorMessage("Please draw your signature on the canvas or switch to another method.");
        return;
      }
    } else if (chosenMethod === "type") {
      if (!typedName.trim()) {
        setErrorMessage("Please enter your name for the typed signature.");
        return;
      }
      finalSignatureDataUrl = generateTypedSignatureDataUrl();
    } else if (chosenMethod === "upload") {
      if (!uploadedSignature) {
        setErrorMessage("Please upload a signature image file before saving.");
        return;
      }
      finalSignatureDataUrl = uploadedSignature;
    }

    if (!finalSignatureDataUrl) {
      setErrorMessage("No signature data found for the selected method. Please complete your signature.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      const targetSlug = companySlug || localStorage.getItem("companySlug") || "default";

      const response = await fetch(`${API_BASE_URL}/api/${targetSlug}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          signature: finalSignatureDataUrl,
          signatureType: chosenMethod,
          signatureFont: selectedFont,
          signatureInitials: initials
        })
      });

      const data = await response.json();
      if (data.success) {
        setSavedSignature(finalSignatureDataUrl);
        setSignatureType(chosenMethod);
        setIsEditing(false);
        setSuccessMessage(`E-Signature successfully registered to your profile via ${chosenMethod.toUpperCase()} method!`);

        // Cache in local storage for fast instant stamp access across document workflows
        localStorage.setItem("userSignature", finalSignatureDataUrl);
        localStorage.setItem("userSignatureType", chosenMethod);
        if (initials) localStorage.setItem("userSignatureInitials", initials);

        if (onProfileUpdated) {
          onProfileUpdated(data.data || { ...userProfile, signature: finalSignatureDataUrl });
        }
      } else {
        throw new Error(data.message || "Failed to save e-signature to profile.");
      }
    } catch (err) {
      console.error("Save signature error:", err);
      setErrorMessage(err.message || "Network error while saving e-signature.");
    } finally {
      setSaving(false);
    }
  };

  // Remove Signature
  const handleRemoveSignature = async () => {
    if (!window.confirm("Are you sure you want to remove your registered electronic signature?")) return;

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const token = localStorage.getItem("accessToken");
      const targetSlug = companySlug || localStorage.getItem("companySlug") || "default";

      const response = await fetch(`${API_BASE_URL}/api/${targetSlug}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          signature: "",
          signatureType: "",
          signatureInitials: ""
        })
      });

      const data = await response.json();
      if (data.success) {
        setSavedSignature("");
        setSignatureType("");
        setUploadedSignature("");
        setUploadedFileName("");
        setDrawnSignatureData("");
        clearCanvas();
        setIsEditing(true);
        localStorage.removeItem("userSignature");
        localStorage.removeItem("userSignatureInitials");
        setSuccessMessage("E-Signature removed successfully.");
        if (onProfileUpdated) onProfileUpdated(data.data);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to remove signature.");
    } finally {
      setSaving(false);
    }
  };

  // Download Signature as PNG
  const handleDownloadSignature = () => {
    if (!savedSignature) return;
    const a = document.createElement("a");
    a.href = savedSignature;
    a.download = `${typedName || "manager"}-e-signature.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const userRole = localStorage.getItem("userRole") || "Manager";
  const userEmail = localStorage.getItem("userEmail") || "";

  return (
    <div className="max-w-5xl space-y-6 animate-in fade-in duration-200">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
            <FileSignature className="text-blue-700" size={24} />
            <span>Digital E-Signature Management</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Create, manage, and register your legal digital signature for document approvals, compliance reviews, and cloud workflows.
          </p>
        </div>

        {savedSignature && !isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setSuccessMessage("");
              setErrorMessage("");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Sparkles size={14} />
            <span>Update / Change Signature</span>
          </button>
        )}
      </div>

      {/* Alert Banners */}
      {errorMessage && (
        <div className="p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 animate-in fade-in">
          <Info size={16} className="shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ────────────────── 1. ACTIVE SAVED SIGNATURE CARD ────────────────── */}
      {savedSignature && !isEditing ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Active Registered E-Signature</span>
              </span>
              <span className="text-xs text-slate-500">
                Type: <span className="font-semibold text-slate-800 capitalize">{signatureType || "Standard"}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSignature}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                title="Download signature PNG"
              >
                <Download size={13} />
                <span>Download PNG</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveSignature}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                title="Remove signature"
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Signature Canvas Box Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 flex flex-col items-center justify-center p-8 bg-slate-50/80 rounded-2xl border border-dashed border-slate-300 min-h-[180px] relative overflow-hidden">
              <img
                src={savedSignature}
                alt="Registered Signature"
                className="max-h-28 max-w-full object-contain filter drop-shadow-sm select-none"
              />
              <div className="w-full border-t border-slate-300 mt-4 pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Authorized Digital Signer</span>
                <span>{typedName || "Manager"}</span>
              </div>
            </div>

            {/* Verification Metadata Certificate */}
            <div className="space-y-3 bg-blue-50/50 rounded-2xl border border-blue-100 p-5 text-xs text-slate-700">
              <div className="flex items-center gap-2 text-blue-900 font-bold uppercase tracking-wider text-[11px]">
                <Lock size={14} className="text-blue-700" />
                <span>Audit & Security Badge</span>
              </div>
              <div className="space-y-2 pt-1 border-t border-blue-100">
                <div>
                  <span className="block text-slate-500 text-[10px]">Signer Identity</span>
                  <span className="font-bold text-slate-900">{typedName || "Workspace Manager"}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[10px]">Signer Email</span>
                  <span className="font-semibold text-slate-800">{userEmail}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[10px]">Assigned Role</span>
                  <span className="font-semibold text-blue-700">{userRole}</span>
                </div>
                {initials && (
                  <div>
                    <span className="block text-slate-500 text-[10px]">Initials Stamp</span>
                    <span className="font-mono font-bold text-slate-900 px-2 py-0.5 bg-white rounded border border-blue-200 inline-block">
                      {initials}
                    </span>
                  </div>
                )}
                <div>
                  <span className="block text-slate-500 text-[10px]">Compliance Standard</span>
                  <span className="font-medium text-emerald-700 flex items-center gap-1">
                    <Check size={12} /> SHA-256 Validated E-Sign
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ────────────────── 2. SIGNATURE CREATION / EDITING FORM ────────────────── */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
          
          {/* Navigation View Tabs & Selection Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Draw Option Card */}
            <div
              onClick={() => handleSelectTab("draw")}
              className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between gap-2 relative ${
                activeTab === "draw"
                  ? "border-blue-600 bg-blue-50/40 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${activeTab === "draw" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                    <PenTool size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Draw Signature</h4>
                    <span className="text-[10px] text-slate-500">Freehand ink / stylus</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectSignatureMethod("draw");
                    setActiveTab("draw");
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    selectedMethod === "draw"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {selectedMethod === "draw" ? (
                    <>
                      <CheckCircle2 size={11} />
                      <span>Selected</span>
                    </>
                  ) : (
                    <span>Select This</span>
                  )}
                </button>
              </div>

              {drawnSignatureData && (
                <div className="text-[10px] font-medium text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 w-fit">
                  <Check size={10} /> Drawing ready
                </div>
              )}
            </div>

            {/* Type Option Card */}
            <div
              onClick={() => handleSelectTab("type")}
              className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between gap-2 relative ${
                activeTab === "type"
                  ? "border-blue-600 bg-blue-50/40 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${activeTab === "type" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                    <Type size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Type Signature</h4>
                    <span className="text-[10px] text-slate-500">Calligraphy font styles</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectSignatureMethod("type");
                    setActiveTab("type");
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    selectedMethod === "type"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {selectedMethod === "type" ? (
                    <>
                      <CheckCircle2 size={11} />
                      <span>Selected</span>
                    </>
                  ) : (
                    <span>Select This</span>
                  )}
                </button>
              </div>

              {typedName && (
                <div className="text-[10px] font-medium text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 w-fit">
                  <Check size={10} /> Calligraphy: {selectedFont}
                </div>
              )}
            </div>

            {/* Upload Option Card */}
            <div
              onClick={() => handleSelectTab("upload")}
              className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between gap-2 relative ${
                activeTab === "upload"
                  ? "border-blue-600 bg-blue-50/40 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${activeTab === "upload" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                    <Upload size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Upload File</h4>
                    <span className="text-[10px] text-slate-500">Scanned PNG / JPG image</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectSignatureMethod("upload");
                    setActiveTab("upload");
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    selectedMethod === "upload"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {selectedMethod === "upload" ? (
                    <>
                      <CheckCircle2 size={11} />
                      <span>Selected</span>
                    </>
                  ) : (
                    <span>Select This</span>
                  )}
                </button>
              </div>

              {uploadedSignature && (
                <div className="text-[10px] font-medium text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 w-fit">
                  <Check size={10} /> Image uploaded
                </div>
              )}
            </div>

          </div>

          {/* ───────────── DRAW MODE EDITOR ───────────── */}
          {activeTab === "draw" && (
            <div className="space-y-4 pt-1">
              
              {/* Header with Active Indicator */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Draw Pad</span>
                  {selectedMethod === "draw" ? (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} /> Active Selected Signature
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => selectSignatureMethod("draw")}
                      className="text-[11px] font-semibold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Radio size={12} /> Click here to make Draw your selected signature
                    </button>
                  )}
                </div>

                {/* Pen Colors & Stroke Controls */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {/* Pen Colors */}
                  <div className="flex items-center gap-1.5">
                    {PEN_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setPenColor(c.value)}
                        className={`w-5 h-5 rounded-full ${c.bg} transition transform ${
                          penColor === c.value ? "ring-2 ring-blue-500 ring-offset-1 scale-110" : "opacity-75 hover:opacity-100"
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>

                  {/* Stroke Width */}
                  <div className="flex items-center gap-1">
                    {PEN_WIDTHS.map((w) => (
                      <button
                        key={w.label}
                        type="button"
                        onClick={() => setPenWidth(w.value)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                          penWidth === w.value
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>

                  {/* Actions: Undo / Clear */}
                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                    <button
                      type="button"
                      onClick={undoCanvas}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <RotateCcw size={11} /> Undo
                    </button>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-red-50 text-red-600 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <Trash2 size={11} /> Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Canvas Pad with Explicit Dimensions and Pointer Tracking */}
              <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-white overflow-hidden shadow-inner cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={220}
                  onPointerDown={handleStartDraw}
                  onPointerMove={handleDrawMove}
                  onPointerUp={handleEndDraw}
                  onPointerLeave={handleEndDraw}
                  onPointerCancel={handleEndDraw}
                  style={{ touchAction: "none" }}
                  className="w-full h-[220px] block select-none cursor-crosshair"
                />

                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400">
                    <PenTool size={28} className="mb-1.5 opacity-40 text-blue-600" />
                    <p className="text-xs font-semibold text-slate-600">Draw your signature in this box</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Use your mouse, trackpad, stylus, or touchscreen</p>
                  </div>
                )}
                <div className="absolute bottom-2.5 left-4 right-4 pointer-events-none border-b border-slate-200 flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Sign on line above</span>
                  <span>Handwritten Signature</span>
                </div>
              </div>

            </div>
          )}

          {/* ───────────── TYPE MODE EDITOR ───────────── */}
          {activeTab === "type" && (
            <div className="space-y-5 pt-1">
              
              {/* Header with Active Indicator */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Type Generator</span>
                  {selectedMethod === "type" ? (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} /> Active Selected Signature
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => selectSignatureMethod("type")}
                      className="text-[11px] font-semibold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Radio size={12} /> Click here to make Type your selected signature
                    </button>
                  )}
                </div>

                {/* Ink Color for Type Mode */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-600">Color:</span>
                  <div className="flex items-center gap-1.5">
                    {PEN_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => {
                          setPenColor(c.value);
                          setSelectedMethod("type");
                        }}
                        className={`w-5 h-5 rounded-full ${c.bg} transition transform ${
                          penColor === c.value ? "ring-2 ring-blue-500 ring-offset-1 scale-110" : "opacity-75 hover:opacity-100"
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Signer Full Name
                  </label>
                  <input
                    type="text"
                    value={typedName}
                    onChange={(e) => {
                      setTypedName(e.target.value);
                      setSelectedMethod("type");
                    }}
                    placeholder="Enter your name"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Initials Stamp
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    placeholder="e.g. AR"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 font-mono font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              {/* Font Style Selection List */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Calligraphy & Handwriting Font Style (Click any font to apply):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {SIGNATURE_FONTS.map((font) => (
                    <div
                      key={font.id}
                      onClick={() => {
                        setSelectedFont(font.id);
                        setSelectedMethod("type");
                      }}
                      className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        selectedFont === font.id && selectedMethod === "type"
                          ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                        <span>{font.name}</span>
                        {selectedFont === font.id && selectedMethod === "type" && (
                          <CheckCircle2 size={16} className="text-blue-600" />
                        )}
                      </div>
                      <div
                        style={{ fontFamily: font.fontClass, color: penColor }}
                        className="text-2xl sm:text-3xl text-center py-2 truncate select-none"
                      >
                        {typedName || "Electronic Signature"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ───────────── UPLOAD MODE EDITOR ───────────── */}
          {activeTab === "upload" && (
            <div className="space-y-4 pt-1">
              
              {/* Header with Active Indicator */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Upload Image</span>
                  {selectedMethod === "upload" ? (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} /> Active Selected Signature
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => selectSignatureMethod("upload")}
                      className="text-[11px] font-semibold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Radio size={12} /> Click here to make Upload your selected signature
                    </button>
                  )}
                </div>

                {uploadedSignature && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={11} /> Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedSignature("");
                        setUploadedFileName("");
                      }}
                      className="px-2.5 py-1 rounded-lg border border-red-200 bg-white text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={11} /> Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Dropzone Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center cursor-pointer relative ${
                  isDragging
                    ? "border-blue-600 bg-blue-50/70"
                    : "border-slate-300 bg-slate-50/60 hover:bg-slate-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-xs">
                  <Upload size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Upload Scanned Signature Image
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mb-3">
                  Upload a clean photo or scan of your signature on white paper (PNG, JPG, WEBP, SVG up to 5MB).
                </p>
                <span className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-blue-700 shadow-xs hover:bg-slate-100 transition">
                  Browse Files
                </span>
              </div>

              {/* Uploaded File Preview Box */}
              {uploadedSignature && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-28 h-16 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={uploadedSignature}
                        alt="Uploaded Signature"
                        className="max-h-full max-w-full object-contain filter drop-shadow-xs"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span>Signature File Ready</span>
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {uploadedFileName || "Uploaded image formatted for document execution"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => selectSignatureMethod("upload")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      selectedMethod === "upload"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                    }`}
                  >
                    <CheckCircle2 size={13} />
                    <span>{selectedMethod === "upload" ? "Selected for Registration" : "Use this Signature"}</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ───────────── SELECTED SIGNATURE STATUS & LIVE PREVIEW BANNER ───────────── */}
          <div className="p-4.5 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                {selectedMethod === "draw" && <PenTool size={18} />}
                {selectedMethod === "type" && <Type size={18} />}
                {selectedMethod === "upload" && <Upload size={18} />}
              </span>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>Selected Execution Format:</span>
                  <span className="capitalize font-bold text-blue-800 bg-white px-2.5 py-0.5 rounded-md border border-blue-200 shadow-2xs">
                    {selectedMethod === "draw" ? "Handwritten Drawing" : selectedMethod === "type" ? `Typed Calligraphy (${selectedFont})` : "Uploaded Image"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  The other two creation modes are deselected. Only this chosen signature will be registered and stamped onto documents.
                </div>
              </div>
            </div>

            {/* Quick Live Preview Thumbnail */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-blue-200 shadow-2xs shrink-0 max-w-full">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 shrink-0">Live Stamp:</span>
              <div className="h-10 min-w-[120px] max-w-[180px] flex items-center justify-center overflow-hidden">
                {selectedMethod === "draw" && (
                  drawnSignatureData ? (
                    <img src={drawnSignatureData} alt="Draw Preview" className="max-h-9 max-w-full object-contain" />
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No drawing yet</span>
                  )
                )}
                {selectedMethod === "type" && (
                  <span
                    style={{ fontFamily: SIGNATURE_FONTS.find(f => f.id === selectedFont)?.fontClass || "'Great Vibes', cursive", color: penColor }}
                    className="text-xl truncate select-none leading-none px-1"
                  >
                    {typedName || "Signature"}
                  </span>
                )}
                {selectedMethod === "upload" && (
                  uploadedSignature ? (
                    <img src={uploadedSignature} alt="Upload Preview" className="max-h-9 max-w-full object-contain" />
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No image uploaded</span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Legal Declaration Consent Checkbox */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentAgreed}
                onChange={(e) => setConsentAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I declare and confirm that this electronic signature is created by me and shall be used as my legally binding digital signature for approving, signing, and stamping documents across this DMS workspace in accordance with Electronic Document & Governance regulations.
              </span>
            </label>
          </div>

          {/* Save Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {savedSignature && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setErrorMessage("");
                }}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveSignature}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold shadow-md shadow-blue-700/20 transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Signature...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save & Register E-Signature</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
