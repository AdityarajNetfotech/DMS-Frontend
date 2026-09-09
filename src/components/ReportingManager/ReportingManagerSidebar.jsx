import {
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Menu,
  Sparkles,
  UserCheck,
  Award,
} from "lucide-react";

import { NavLink, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { API_BASE_URL } from "../../config/api";

function SidebarThreeBg({ accentColor = 0x2563eb }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer, animationId;
    try {
      const width = container.clientWidth || 260;
      const height = container.clientHeight || 800;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.z = 8;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      container.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambient);

      const pointLight = new THREE.PointLight(accentColor, 1.5, 30);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);

      const docGeo = new THREE.PlaneGeometry(0.8, 1.1);
      const docs = [];
      const docCount = 6;

      for (let i = 0; i < docCount; i++) {
        const mat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.18,
          side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(docGeo, mat);
        mesh.position.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 3);
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

        const edges = new THREE.EdgesGeometry(docGeo);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: accentColor, transparent: true, opacity: 0.35 })
        );
        mesh.add(line);
        mesh.userData = {
          speedY: 0.004 + Math.random() * 0.008,
          rotSpeedX: (Math.random() - 0.5) * 0.008,
          rotSpeedY: (Math.random() - 0.5) * 0.008
        };
        docs.push(mesh);
        scene.add(mesh);
      }

      let mouseX = 0;
      let mouseY = 0;
      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        }
      };
      window.addEventListener("mousemove", handleMouseMove);

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        docs.forEach((mesh) => {
          mesh.position.y -= mesh.userData.speedY;
          if (mesh.position.y < -4) mesh.position.y = 4;
          mesh.rotation.x += mesh.userData.rotSpeedX;
          mesh.rotation.y += mesh.userData.rotSpeedY;
        });
        scene.rotation.y += (mouseX * 0.2 - scene.rotation.y) * 0.05;
        scene.rotation.x += (-mouseY * 0.2 - scene.rotation.x) * 0.05;
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };
      animate();

      const handleResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || 260;
        const h = container.clientHeight || 800;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        if (animationId) cancelAnimationFrame(animationId);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("mousemove", handleMouseMove);
        if (container && renderer?.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        if (renderer) renderer.dispose();
      };
    } catch (err) {
      console.warn("Sidebar Three.js background skipped:", err);
    }
  }, [accentColor]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-60"
    />
  );
}

import { useTranslation } from "../../i18n/useTranslation";
import { useLocation } from "react-router-dom";

export default function ReportingManagerSidebar() {
  const { companySlug: urlSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const getEffectiveSlug = () => {
    if (urlSlug && urlSlug !== "undefined" && urlSlug !== "null") return urlSlug;
    const stored = localStorage.getItem("companySlug");
    if (stored && stored !== "undefined" && stored !== "null") return stored;
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload?.companySlug && payload.companySlug !== "undefined") {
          return payload.companySlug;
        }
      }
    } catch (e) { }
    return "";
  };

  const companySlug = getEffectiveSlug();
  const slugPrefix = companySlug ? `/${companySlug}` : "";

  const { t, language } = useTranslation();

  // Listen for language changes globally to sync state dynamically
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const handleLangChange = () => forceUpdate({});
    window.addEventListener("language-change", handleLangChange);
    return () => window.removeEventListener("language-change", handleLangChange);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);

  const [branding, setBranding] = useState(() => {
    const cached = localStorage.getItem(`branding_${companySlug || "default"}`);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { }
    }
    return { logo: "", primaryColor: "#2563eb", companyName: "Reporting Workspace" };
  });

  const [userProfile, setUserProfile] = useState(() => {
    const email = localStorage.getItem("userEmail") || "reporting.manager@dms.io";
    const rawName = email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const name = localStorage.getItem("userName") || rawName || "Reporting Manager";
    return { name, email };
  });

  const userName = userProfile.name;
  const userEmail = userProfile.email;

  const fetchApprovalStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const effectiveSlug = companySlug || "default";
      const res = await fetch(`${API_BASE_URL}/api/${effectiveSlug}/manager/approvals/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        const count = data.data.pendingAction ?? data.data.myPendingActionCount ?? data.data.pendingCount ?? 0;
        setPendingApprovalCount(count);
      }
    } catch (err) {
      console.warn("Failed to fetch sidebar approval stats:", err);
    }
  };

  const fetchBranding = async () => {
    try {
      const effectiveSlug = companySlug || "default";
      const res = await fetch(`${API_BASE_URL}/api/${effectiveSlug}/branding`);
      const data = await res.json();
      if (data.success && data.data) {
        setBranding(data.data);
        localStorage.setItem(`branding_${effectiveSlug}`, JSON.stringify(data.data));
      }
    } catch (err) { }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const effectiveSlug = companySlug || "default";
      const res = await fetch(`${API_BASE_URL}/api/${effectiveSlug}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.name) {
          localStorage.setItem("userName", data.data.name);
        }
        if (data.data.email) {
          localStorage.setItem("userEmail", data.data.email);
        }
        setUserProfile({
          name: data.data.name || userName,
          email: data.data.email || userEmail
        });
      }
    } catch (err) { }
  };

  useEffect(() => {
    fetchBranding();
    fetchApprovalStats();
    fetchProfile();

    const handleApprovalsUpdate = () => fetchApprovalStats();
    const handleBrandingUpdate = () => fetchBranding();

    window.addEventListener("approvals-update", handleApprovalsUpdate);
    window.addEventListener("branding-update", handleBrandingUpdate);

    // Periodic poll every 10s to keep approval count fresh
    const intervalId = setInterval(fetchApprovalStats, 10000);

    return () => {
      window.removeEventListener("approvals-update", handleApprovalsUpdate);
      window.removeEventListener("branding-update", handleBrandingUpdate);
      clearInterval(intervalId);
    };
  }, [companySlug, location.pathname]);

  const menuItems = [
    {
      name: t("reportingDashboard"),
      icon: LayoutDashboard,
      path: `${slugPrefix}/reporting-manager/dashboard`,
    },
    {
      name: t("teamApprovals"),
      icon: ShieldCheck,
      path: `${slugPrefix}/reporting-manager/approvals`,
      badge: pendingApprovalCount > 0 ? pendingApprovalCount : null
    },
    {
      name: t("profileSettings"),
      icon: UserCheck,
      path: `${slugPrefix}/reporting-manager/profile-settings`,
    },
  ];

  const primaryColorStr = branding?.primaryColor || "#2563eb";
  const numericAccentColor = primaryColorStr.startsWith("#")
    ? parseInt(primaryColorStr.replace("#", "0x"), 16)
    : 0x2563eb;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[260px] bg-white/70 backdrop-blur-md border-r border-slate-200 flex-col h-screen sticky top-0 overflow-hidden relative">
        <SidebarThreeBg accentColor={numericAccentColor} />

        <div className="relative z-10 flex flex-col h-full w-full">
          {/* Logo & Role Header */}
          <div className="px-6 py-5 border-b bg-white/40">
            <div className="flex items-center gap-3">
              <div
                style={!branding.logo ? { backgroundColor: branding.primaryColor || '#2563eb' } : {}}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden border border-slate-100 shadow-sm"
              >
                {branding.logo ? (
                  <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  (branding.companyName || "D").charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <h2 className="font-bold text-slate-900 truncate max-w-[140px] text-sm">
                  {branding.companyName || "Enterprise DMS"}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 mt-0.5">
                  <Award size={11} /> {t("reportingManager")}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t("workspace")}</p>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    style={({ isActive }) =>
                      isActive ? { backgroundColor: branding.primaryColor || '#2563eb', color: '#fff' } : {}
                    }
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                        ? "shadow-sm text-white"
                        : "text-slate-600 hover:bg-white/60 hover:text-slate-950"
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Quick Maker-Checker Badge Card */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-900 text-white shadow-md border border-blue-700/50">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-white-200 border border-blue-400/30">
                  {t("makerChecker")}
                </span>
                <Sparkles size={14} className="text-amber-300 animate-pulse" />
              </div>
              <p className="text-xs text-white-100 font-semibold mt-2">{t("teamVerification")}</p>
              <p className="text-[11px] text-white-200/80 mt-1">
                {t("youHave")} <strong className="text-white font-bold">{pendingApprovalCount}</strong> {t("awaitingSignOff")}
              </p>
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="p-3 border-t bg-white/40">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/60 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {userName.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{t("reportingManager")}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                  localStorage.removeItem("userRole");
                  navigate(`${slugPrefix}/login`);
                }}
                title={t("logout")}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3.5 bg-blue-600 text-white rounded-full shadow-xl"
        aria-label="Toggle Menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="w-[260px] h-full bg-white p-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <h2 className="font-bold text-slate-900">{branding.companyName || "DMS"}</h2>
              <span className="text-xs text-blue-600 font-semibold">{t("reportingManager")}</span>
            </div>
            <nav className="space-y-1 flex-1 overflow-y-auto">
              {menuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}

              {/* Quick Maker-Checker Badge Card (Mobile) */}
              <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-900 text-white shadow-md border border-blue-700/50">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-200 border border-blue-400/30">
                    {t("makerChecker")}
                  </span>
                  <Sparkles size={12} className="text-amber-300 animate-pulse" />
                </div>
                <p className="text-xs text-blue-100 font-semibold mt-1.5">{t("teamVerification")}</p>
                <p className="text-[10px] text-blue-200/80 mt-1">
                  {t("youHave")} <strong className="text-white font-bold">{pendingApprovalCount}</strong> {t("awaitingSignOff")}
                </p>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
