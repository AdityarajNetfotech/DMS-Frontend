// src/components/Sidebar.jsx

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Users,
  Settings2,
  Shield,
  BarChart3,
  Settings,
  CircleHelp,
  X,
  LogOut,
  TrendingUp,
  LayoutDashboard,
  User,
  CreditCard,
  Sparkles,
  Zap,
} from "lucide-react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

function SidebarThreeBg({ accentColor = 0x072B86 }) {
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

import { useTranslation } from "../../i18n/useTranslation";

export default function Sidebar({
  isOpen = false,
  onClose = () => { },
}) {
  const navigate = useNavigate();
  const { companySlug } = useParams();
  const slugPrefix = companySlug ? `/${companySlug}` : "";

  const { t, language, setLanguage } = useTranslation();

  // Listen for language changes globally to sync state dynamically
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const handleLangChange = () => forceUpdate({});
    window.addEventListener("language-change", handleLangChange);
    return () => window.removeEventListener("language-change", handleLangChange);
  }, []);

  const [branding, setBranding] = useState(() => {
    const cached = localStorage.getItem(`branding_${companySlug}`);
    if (cached && cached !== "null" && cached !== "undefined") {
      try {
        const data = JSON.parse(cached);
        if (data) {
          return {
            logo: data.logo || "",
            primaryColor: data.primaryColor || "#072B86",
            companyName: data.companyName || "DMS"
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    return { logo: "", primaryColor: "#072B86", companyName: "" };
  });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/${companySlug}/branding`);
        const data = await res.json();
        if (data.success && data.data) {
          const fresh = {
            logo: data.data.logo || "",
            primaryColor: data.data.primaryColor || "#072B86",
            companyName: data.data.companyName || "DMS"
          };
          setBranding(fresh);
          localStorage.setItem(`branding_${companySlug}`, JSON.stringify(data.data));
        }
      } catch (err) {
        console.error("Failed to load branding in admin sidebar", err);
      }
    };
    if (companySlug) {
      fetchBranding();
    }

    // Listen for custom events to refresh branding in real-time
    const handleUpdate = () => fetchBranding();
    window.addEventListener("branding-update", handleUpdate);
    return () => window.removeEventListener("branding-update", handleUpdate);
  }, [companySlug]);

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

  useEffect(() => {
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
        console.error("Failed to fetch subscription status in admin sidebar", err);
      }
    };
    fetchSubStatus();
  }, [companySlug]);

  const menuItems = [
    {
      icon: <LayoutDashboard size={18} />,
      label: t("dashboard"),
      path: `${slugPrefix}/admin/dashboard`,
    },
    {
      icon: <User size={18} />,
      label: t("profileSettings"),
      path: `${slugPrefix}/admin/profile`,
    },
    {
      icon: <Users size={18} />,
      label: t("userManagement"),
      path: `${slugPrefix}/admin/user-management`,
    },
    {
      icon: <TrendingUp size={18} />,
      label: t("managerActivity"),
      path: `${slugPrefix}/admin/manager-activity`,
    },
    {
      icon: <Settings2 size={18} />,
      label: t("workspaceConfiguration"),
      path: `${slugPrefix}/admin/workspace-configuration`,
    },
    {
      icon: <CreditCard size={18} />,
      label: t("subscriptionBilling"),
      path: `${slugPrefix}/admin/subscription`,
    },
  ];

  // Convert hex to color value for Three.js point light safely
  const primaryColorStr = branding?.primaryColor || "#072B86";
  const numericAccentColor = primaryColorStr.startsWith("#")
    ? parseInt(primaryColorStr.replace("#", "0x"), 16)
    : 0x072b86;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - layout/styling matching the manager sidebar exactly */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[250px] bg-white/65 backdrop-blur-md border-r border-slate-200 flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 overflow-hidden`}
      >
        <SidebarThreeBg accentColor={numericAccentColor} />

        <div className="relative z-10 flex flex-col h-full w-full">
          {/* Header */}
          <div className="px-6 py-5 border-b bg-white/40">
            <div className="flex items-center gap-3">
              <div
                style={!branding.logo ? { backgroundColor: branding.primaryColor } : {}}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden border border-slate-100"
              >
                {branding.logo ? (
                  <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  (branding.companyName || "A").charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h1 className="font-bold text-slate-900 truncate max-w-[140px] leading-tight">
                  {branding.companyName || "Admin Portal"}
                </h1>
                <p className="text-xs text-slate-500">
                  Workspace Admin
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={({ isActive }) =>
                  isActive ? { backgroundColor: branding.primaryColor, color: '#fff' } : {}
                }
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                    ? "shadow-sm text-white"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-950"
                  }`
                }
              >
                <span className="shrink-0 opacity-80">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}

            {/* Subscription & Trial Countdown Widget */}
            <div className={`mt-4 p-3.5 rounded-2xl shadow-md border transition-all ${subscriptionInfo.isExpired
                ? 'bg-gradient-to-br from-red-950 to-red-905 text-white border-red-700/60'
                : 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700/60'
              }`}>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${subscriptionInfo.isExpired
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : subscriptionInfo.plan === 'Trial'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                  {subscriptionInfo.isExpired
                    ? 'Trial Expired'
                    : subscriptionInfo.plan === 'Trial'
                      ? '7-Day Free Trial'
                      : `${subscriptionInfo.plan} Plan`}
                </span>
                <Sparkles size={14} className={subscriptionInfo.isExpired ? "text-red-400" : "text-amber-400 animate-pulse"} />
              </div>

              <div className="mt-2.5">
                <p className="text-[11px] text-slate-300 font-medium">Subscription Status</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-black text-white">
                    {subscriptionInfo.isExpired ? '0' : subscriptionInfo.daysLeft}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {subscriptionInfo.isExpired ? 'Days / Expired' : 'Days Remaining'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`${slugPrefix}/admin/subscription`);
                }}
                style={subscriptionInfo.isExpired ? { backgroundColor: '#ef4444' } : { backgroundColor: branding.primaryColor }}
                className="w-full mt-3 py-2 px-3 rounded-xl font-bold text-xs text-white shadow-sm hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap size={14} />
                <span>{subscriptionInfo.isExpired ? 'Upgrade Now' : subscriptionInfo.plan === 'Trial' ? 'Activate Subscription' : 'Manage Subscription'}</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-3 space-y-1 bg-white/40">
            {/* User Badge Profile */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm bg-white/50 border border-slate-100/80 mb-2">
              <div
                style={{ backgroundColor: branding.primaryColor + '20', color: branding.primaryColor }}
                className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs"
              >
                TA
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-900 font-bold truncate">Tenant Admin</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  {subscriptionInfo.plan === 'Trial' ? 'Free Trial' : `${subscriptionInfo.plan} Plan`}
                </p>
              </div>
            </div>

            {/* Language Selection */}
            <div className="flex items-center gap-3 px-3 py-1 bg-white/50 border border-slate-100/80 rounded-xl mb-1.5 text-xs text-slate-600">
              <span className="font-semibold">{t("selectLanguage")}:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-slate-800 cursor-pointer ml-auto"
              >
                <option value="English">English</option>
                <option value="Khmer">Khmer (ភាសាខ្មែរ)</option>
              </select>
            </div>

            <NavLink
              to="/admin/help-center"
              onClick={onClose}
              style={({ isActive }) =>
                isActive ? { backgroundColor: branding.primaryColor, color: '#fff' } : {}
              }
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                  ? "shadow-sm text-white"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-950"
                }`
              }
            >
              <CircleHelp size={18} />
              <span>Help Center</span>
            </NavLink>

            <button
              type="button"
              onClick={() => {
                const slug = companySlug || localStorage.getItem("companySlug");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("userRole");
                localStorage.removeItem("userEmail");
                localStorage.removeItem("userName");
                localStorage.removeItem("companySlug");
                navigate(slug ? `/${slug}/login` : "/login");
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50/50 font-medium cursor-pointer"
            >
              <LogOut size={18} />
              <span>{t("logout")}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}