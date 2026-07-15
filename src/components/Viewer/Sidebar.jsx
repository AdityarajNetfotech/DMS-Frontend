import {
  ChevronDown,
  ChevronLeft,
  Clock3,
  FileText,
  FolderOpen,
  Home,
  Search,
  Star,
  Trash2,
  Users,
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

  const [branding, setBranding] = useState(() => {
    const cached = localStorage.getItem(`branding_${companySlug}`);
    if (cached && cached !== "null" && cached !== "undefined") {
      try {
        const data = JSON.parse(cached);
        if (data) {
          return {
            logo: data.logo || "",
            primaryColor: data.primaryColor || "#2563eb",
            companyName: data.companyName || "DMS"
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    return { logo: "", primaryColor: "#2563eb", companyName: "" };
  });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/${companySlug}/branding`);
        const data = await res.json();
        if (data.success && data.data) {
          const fresh = {
            logo: data.data.logo || "",
            primaryColor: data.data.primaryColor || "#2563eb",
            companyName: data.data.companyName || "DMS"
          };
          setBranding(fresh);
          localStorage.setItem(`branding_${companySlug}`, JSON.stringify(data.data));
        }
      } catch (err) {
        console.error("Failed to load branding in viewer sidebar", err);
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

  const navItems = [
    { name: "Dashboard", icon: Home, path: `${slugPrefix}/viewer/dashboard` },
    { name: "My Documents", icon: FileText, path: `${slugPrefix}/viewer/my-documents` },
    { name: "Shared With Me", icon: Users, path: `${slugPrefix}/viewer/shared-with-me` },
    { name: "My Favorite", icon: Star, path: `${slugPrefix}/viewer/my-access` },
  ];

  const primaryColorStr = branding?.primaryColor || "#2563eb";
  const numericAccentColor = primaryColorStr.startsWith("#")
    ? parseInt(primaryColorStr.replace("#", "0x"), 16)
    : 0x2563eb;

  return (
    <aside className="hidden h-screen w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white/65 backdrop-blur-md lg:flex sticky top-0 overflow-hidden relative">
      <SidebarThreeBg accentColor={numericAccentColor} />

      <div className="relative z-10 flex flex-col h-full w-full">
        <div className="flex h-[82px] items-center gap-3 border-b border-slate-200 px-5 bg-white/40">
          <div
            style={!branding.logo ? { backgroundColor: branding.primaryColor } : {}}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-white shadow-sm overflow-hidden border border-slate-100 transition-transform duration-300 hover:rotate-6"
          >
            {branding.logo ? (
              <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              (branding.companyName || "D").charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-950 truncate max-w-[170px]">
              {branding.companyName || "DMS"}
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Viewer Dashboard
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  style={({ isActive }) =>
                    isActive ? { backgroundColor: branding.primaryColor + '15', color: branding.primaryColor } : {}
                  }
                  className={({ isActive }) =>
                    `flex h-13 items-center gap-4 rounded-lg px-4 text-sm font-semibold transition ${isActive
                      ? ""
                      : "text-slate-700 hover:bg-white/60 hover:text-slate-950"
                    }`
                  }
                >
                  <Icon size={21} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-200 pt-4 bg-white/40">
          <button
            type="button"
            className="w-full flex items-center gap-4 px-8 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50/50 cursor-pointer"
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
          >
            <ChevronLeft size={20} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
