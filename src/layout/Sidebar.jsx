import { performDmsLogout } from '../utils/logoutHelper';
import {
  LayoutDashboard,
  FolderOpen,
  FolderTree,
  Share2,
  Archive,
  Trash2,
  ShieldCheck,
  Activity,
  User,
  LogOut,
  Menu,
  Search,
  Sparkles,
} from "lucide-react";

import { NavLink, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { API_BASE_URL } from "../config/api";
import { useTranslation } from "../i18n/useTranslation";

function SidebarThreeBg({ accentColor = 0x2563eb }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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

      mesh.position.set(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 3
      );

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      const edges = new THREE.EdgesGeometry(docGeo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
          color: accentColor,
          transparent: true,
          opacity: 0.35
        })
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
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId;
    const animate = () => {
      docs.forEach((doc) => {
        doc.position.y += doc.userData.speedY;
        if (doc.position.y > 4.5) {
          doc.position.y = -4.5;
          doc.position.x = (Math.random() - 0.5) * 4;
        }

        doc.rotation.x += doc.userData.rotSpeedX;
        doc.rotation.y += doc.userData.rotSpeedY;
      });

      camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.02;
      camera.position.y += (mouseY * 0.4 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      docs.forEach((doc) => {
        doc.geometry.dispose();
        doc.material.dispose();
      });
      docGeo.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [accentColor]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-60"
    />
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { companySlug } = useParams();
  const slugPrefix = companySlug ? `/${companySlug}` : "";

  const { t } = useTranslation();

  // Force sidebar refresh on language event dispatch
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const handleLangChange = () => forceUpdate({});
    window.addEventListener("language-change", handleLangChange);
    return () => window.removeEventListener("language-change", handleLangChange);
  }, []);

  const [branding, setBranding] = useState(() => {
    const cached = localStorage.getItem(`branding_${companySlug}`);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        return {
          logo: data.logo || "",
          primaryColor: data.primaryColor || "#2563eb",
          companyName: data.companyName || "DMS"
        };
      } catch (e) {
        console.error(e);
      }
    }
    return { logo: "", primaryColor: "#2563eb", companyName: "" };
  });

  const [subscriptionInfo, setSubscriptionInfo] = useState(() => {
    const cached = localStorage.getItem(`sub_${companySlug}`);
    if (cached && cached !== "null" && cached !== "undefined") {
      try {
        const data = JSON.parse(cached);
        if (data) return data;
      } catch (e) {
        console.error("Failed to parse cached subscription info", e);
      }
    }
    return {
      plan: 'Trial',
      daysLeft: 7,
      isExpired: false,
      isAccessLocked: false
    };
  });

  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === "Tenant Admin" || userRole === "Company Admin";

  const roleSubtitle = (() => {
    const vcRole = localStorage.getItem("vcRole");
    const role = localStorage.getItem("userRole");
    const displayRole = localStorage.getItem("displayRole");
    const email = (localStorage.getItem("userEmail") || "").toLowerCase();
    const normalize = (r) => {
      if (!r) return null;
      const s = String(r).toLowerCase().trim().replace(/[-_]/g, " ");
      if (s === "auditor") return "Auditor";
      if (s === "business user" || s === "business_user") return "Business User";
      if (s === "compliance officer" || s === "compliance_officer" || s === "compliance user") return "Compliance Officer";
      return null;
    };
    const title = normalize(vcRole) || normalize(displayRole) || normalize(role) ||
      (email.includes("abhishek") || email.includes("auditor") ? "Auditor" :
       email.includes("aditya") || email.includes("business") ? "Business User" :
       email.includes("soudip") || email.includes("compliance") ? "Compliance Officer" : null);
    return title ? `${title} Portal` : "Manager Portal";
  })();

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/${companySlug}/branding`);
        const data = await res.json();
        if (data.success) {
          const fresh = {
            logo: data.data.logo || "",
            primaryColor: data.data.primaryColor || "#2563eb",
            companyName: data.data.companyName || "DMS"
          };
          setBranding(fresh);
          localStorage.setItem(`branding_${companySlug}`, JSON.stringify(data.data));
        }
      } catch (err) {
        console.error("Failed to load branding in sidebar", err);
      }
    };

    const fetchSubStatus = async () => {
      try {
        if (!companySlug) return;
        const res = await fetch(`${API_BASE_URL}/api/tenant/subscription/status/${companySlug}`);
        const data = await res.json();
        if (data.success) {
          const now = new Date();
          const plan = data.subscription?.plan || 'Trial';
          const targetDate = plan === 'Trial' ? new Date(data.trialEndsAt) : new Date(data.subscription?.expiresAt);

          let daysLeft = 0;
          if (targetDate && !isNaN(targetDate)) {
            const diffTime = targetDate - now;
            daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          }

          const info = {
            plan,
            daysLeft,
            isExpired: plan === 'Trial' ? data.trialEnded : data.planExpired,
            isAccessLocked: data.isAccessLocked
          };

          setSubscriptionInfo(info);
          localStorage.setItem(`sub_${companySlug}`, JSON.stringify(info));
        }
      } catch (err) {
        console.error("Failed to fetch subscription status in manager sidebar", err);
      }
    };

    if (companySlug) {
      fetchBranding();
      fetchSubStatus();
    }

    // Listen for custom events to refresh branding in real-time
    const handleUpdate = () => fetchBranding();
    window.addEventListener("branding-update", handleUpdate);
    return () => window.removeEventListener("branding-update", handleUpdate);
  }, [companySlug]);

  const menuItems = [
    // {
    //   name: t("dashboard"),
    //   icon: LayoutDashboard,
    //   path: `${slugPrefix}/manager/dashboard`,
    // },
    {
      name: t("myDocuments"),
      icon: FolderOpen,
      path: `${slugPrefix}/manager/my-documents`,
    },
    {
      name: t("folderExplorer"),
      icon: FolderTree,
      path: `${slugPrefix}/manager/folder-explorer`,
    },
    {
      name: t("searchFilters"),
      icon: Search,
      path: `${slugPrefix}/manager/search-filters`,
    },
    // {
    //   name: t("sharedWithMe"),
    //   icon: Share2,
    //   path: `${slugPrefix}/manager/shared-with-me`,
    // },
    // {
    //   name: t("sharedByMe"),
    //   icon: Share2,
    //   path: `${slugPrefix}/manager/shared-by-me`,
    // },
    {
      name: t("archiveDocument"),
      icon: Archive,
      path: `${slugPrefix}/manager/recent-documents`,
    },
    // {
    //   name: t("trash"),
    //   icon: Trash2,
    //   path: `${slugPrefix}/manager/trash`,
    // },
  ];

  const primaryColorStr = branding?.primaryColor || "#2563eb";
  const numericAccentColor = primaryColorStr.startsWith("#")
    ? parseInt(primaryColorStr.replace("#", "0x"), 16)
    : 0x2563eb;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[250px] bg-white/65 backdrop-blur-md border-r border-slate-200 flex-col h-screen sticky top-0 overflow-hidden relative">
        <SidebarThreeBg accentColor={numericAccentColor} />

        <div className="relative z-10 flex flex-col h-full w-full">
          {/* Logo */}
          <div className="px-6 py-5 border-b bg-white/40">
            <NavLink
              to={`${slugPrefix}/manager/profile-settings`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div 
                style={!branding.logo ? { backgroundColor: branding.primaryColor } : {}}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden border border-slate-100"
              >
                {branding.logo ? (
                  <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  (branding.companyName || "D").charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <h2 className="font-bold text-slate-900 truncate max-w-[140px]">
                  {branding.companyName || "Manager Section"}
                </h2>

                <p className="text-xs text-slate-500">
                  {roleSubtitle}
                </p>
              </div>
            </NavLink>
          </div>

          {/* Main Menu */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    style={({ isActive }) =>
                      isActive ? { backgroundColor: branding.primaryColor, color: '#fff' } : {}
                    }
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "shadow-sm text-white"
                          : "text-slate-600 hover:bg-white/60 hover:text-slate-950"
                      }`
                    }
                  >
                    <Icon size={18} />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>

            {/* Subscription & Trial Countdown Widget commented out per user specification */}
            {/*
            <div className="hidden">Subscription widget removed</div>
            */}
          </div>

          {/* Bottom */}
          <div className="border-t p-3 space-y-1 bg-white/40">
            {isAdmin && (
              <NavLink
                to={`${slugPrefix}/admin/dashboard`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-blue-600 bg-blue-50/50 hover:bg-blue-100/50 hover:text-blue-800"
              >
                <ShieldCheck size={18} />
                {t("adminDashboard")}
              </NavLink>
            )}

            <NavLink
              to={`${slugPrefix}/manager/profile-settings`}
              style={({ isActive }) =>
                isActive ? { backgroundColor: branding.primaryColor, color: '#fff' } : {}
              }
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "shadow-sm text-white"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-950"
                }`
              }
            >
              <User size={18} />
              {t("profileSettings")}
            </NavLink>

            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50/50 font-medium cursor-pointer"
              onClick={() => performDmsLogout(companySlug)}
              type="button"
            >
              <LogOut size={18} />
              {t("logout")}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4">
        <NavLink
          to={`${slugPrefix}/manager/profile-settings`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div 
            style={!branding.logo ? { backgroundColor: branding.primaryColor } : {}}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden border border-slate-100"
          >
            {branding.logo ? (
              <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              (branding.companyName || "D").charAt(0).toUpperCase()
            )}
          </div>

          <span className="font-semibold text-slate-900 truncate max-w-[160px]">
            {branding.companyName || "Manager Section"}
          </span>
        </NavLink>

        <button className="p-2 rounded-lg hover:bg-slate-100">
          <Menu size={22} />
        </button>
      </div>
    </>
  );
}
