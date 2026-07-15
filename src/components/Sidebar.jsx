import { useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import * as THREE from "three";
import {
  LayoutDashboard,
  Building2,
  Plus,
  Mail,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: Building2, label: "Tenants List", path: "/tenants" },
  { icon: Plus, label: "Register Tenant", path: "/register-tenant" },
  { icon: Mail, label: "Enquiries", path: "/enquiries" },
];

function SidebarThreeBg({ accentColor = 0x3b82f6 }) {
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/superadminlogin");
  };

  return (
    <aside className="hidden lg:flex w-[250px] bg-slate-50/65 backdrop-blur-md border-r border-slate-200/80 flex-col h-screen sticky top-0 font-sans relative overflow-hidden">
      {/* 3D background behind content */}
      <SidebarThreeBg accentColor={0x2563eb} />

      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Logo Section */}
        <div className="px-6 py-5 border-b border-slate-200/60 bg-white/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm transition-transform duration-300 hover:rotate-6">
              S
            </div>
            <div>
              <h2 className="font-bold text-slate-900 leading-tight">
                Super Admin
              </h2>
              <p className="text-xs text-slate-500">
                Control Panel
              </p>
            </div>
          </div>
        </div>

        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white/60 hover:text-slate-950"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-200/60 p-3 space-y-1 bg-white/40">
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50/50 font-medium cursor-pointer transition-all"
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}